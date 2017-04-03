# In consumers.py
from channels import Group, Channel
from channels.sessions import channel_session
from prototype.models import Topology, Device, Link, Client, TopologyHistory, MessageType, Interface
from prototype.serializers import yaml_serialize_topology
import urlparse
from django.db.models import Q
from collections import defaultdict

import json
# Connected to websocket.connect


def parse_topology_id(data):
    topology_id = data.get('topology_id', ['null'])
    try:
        topology_id = int(topology_id[0])
    except ValueError:
        topology_id = None
    if not topology_id:
        topology_id = None
    return topology_id


@channel_session
def ansible_connect(message):
    message.reply_channel.send({"accept": True})
    data = urlparse.parse_qs(message.content['query_string'])
    topology_id = parse_topology_id(data)
    message.channel_session['topology_id'] = topology_id


@channel_session
def ansible_message(message):
    Channel('console_printer').send({"text": message['text']})
    Group("topology-%s" % message.channel_session['topology_id']).send({
        "text": message['text'],
    })


@channel_session
def ansible_disconnect(message):
    pass


@channel_session
def ws_connect(message):
    # Accept connection
    message.reply_channel.send({"accept": True})
    data = urlparse.parse_qs(message.content['query_string'])
    topology_id = parse_topology_id(data)
    topology, created = Topology.objects.get_or_create(
        topology_id=topology_id, defaults=dict(name="topology", scale=1.0, panX=0, panY=0))
    topology_id = topology.topology_id
    message.channel_session['topology_id'] = topology_id
    Group("topology-%s" % topology_id).add(message.reply_channel)
    client = Client()
    client.save()
    message.channel_session['client_id'] = client.pk
    message.reply_channel.send({"text": json.dumps(["id", client.pk])})
    message.reply_channel.send({"text": json.dumps(["topology_id", topology_id])})
    topology_data = topology.__dict__.copy()
    if '_state' in topology_data:
        del topology_data['_state']
    message.reply_channel.send({"text": json.dumps(["Topology", topology_data])})
    interfaces = defaultdict(list)

    for i in (Interface.objects
              .filter(device__topology_id=topology_id)
              .values()):
        interfaces[i['device_id']].append(i)
    devices = list(Device.objects
                         .filter(topology_id=topology_id).values())
    for device in devices:
        device['interfaces'] = interfaces[device['device_id']]

    links = [dict(id=x['id'],
                  from_device=x['from_device__id'],
                  to_device=x['to_device__id'],
                  from_interface=x['from_interface__id'],
                  to_interface=x['to_interface__id'])
             for x in list(Link.objects
                               .filter(Q(from_device__topology_id=topology_id) |
                                       Q(to_device__topology_id=topology_id))
                               .values('id',
                                       'from_device__id',
                                       'to_device__id',
                                       'from_interface__id',
                                       'to_interface__id'))]
    snapshot = dict(sender=0,
                    devices=devices,
                    links=links)
    message.reply_channel.send({"text": json.dumps(["Snapshot", snapshot])})
    history_message_ignore_types = ['DeviceSelected', 'DeviceUnSelected', 'Undo', 'Redo']
    history = list(TopologyHistory.objects
                                  .filter(topology_id=topology_id)
                                  .exclude(message_type__name__in=history_message_ignore_types)
                                  .exclude(undone=True)
                                  .order_by('pk')
                                  .values_list('message_data', flat=True)[:1000])
    message.reply_channel.send({"text": json.dumps(["History", history])})


@channel_session
def ws_message(message):
    # Send to debug printer
    Channel('console_printer').send({"text": message['text']})
    # Send to all clients editing the topology
    Group("topology-%s" % message.channel_session['topology_id']).send({
        "text": message['text'],
    })
    # Send to persistence worker
    Channel('persistence').send(
        {"text": message['text'],
         "topology": message.channel_session['topology_id'],
         "client": message.channel_session['client_id']})


@channel_session
def ws_disconnect(message):
    Group("topology-%s" % message.channel_session['topology_id']).discard(message.reply_channel)


def console_printer(message):
    print message['text']


class _Persistence(object):

    def handle(self, message):
        topology_id = message.get('topology')
        if topology_id is None:
            print "No topology_id"
            return
        client_id = message.get('client')
        if client_id is None:
            print "No client_id"
            return
        data = json.loads(message['text'])
        if client_id != data[1].get('sender'):
            print "client_id mismatch expected:", client_id, "actual:", data[1].get('sender')
            return
        message_type = data[0]
        message_value = data[1]
        message_type_id = MessageType.objects.get_or_create(name=message_type)[0].pk
        TopologyHistory(topology_id=topology_id,
                        client_id=client_id,
                        message_type_id=message_type_id,
                        message_id=data[1].get('message_id', 0),
                        message_data=message['text']).save()
        handler = self.get_handler(message_type)
        if handler is not None:
            handler(message_value, topology_id, client_id)
        else:
            print "Unsupported message ", message_type

    def get_handler(self, message_type):
        return getattr(self, "on{0}".format(message_type), None)

    def onSnapshot(self, snapshot, topology_id, client_id):
        device_map = dict()
        for device in snapshot['devices']:
            if 'size' in device:
                del device['size']
            if 'height' in device:
                del device['height']
            if 'width' in device:
                del device['width']
            d, _ = Device.objects.get_or_create(topology_id=topology_id, id=device['id'], defaults=device)
            d.name = device['name']
            d.x = device['x']
            d.y = device['y']
            d.type = device['type']
            d.save()
            device_map[device['id']] = d

        for link in snapshot['links']:
            Link.objects.get_or_create(id=link['id'],
                                       from_device=device_map[link['from_device']],
                                       to_device=device_map[link['to_device']])

    def onDeviceCreate(self, device, topology_id, client_id):
        if 'sender' in device:
            del device['sender']
        if 'message_id' in device:
            del device['message_id']
        if 'msg_type' in device:
            del device['msg_type']
        d, _ = Device.objects.get_or_create(topology_id=topology_id, id=device['id'], defaults=device)
        d.x = device['x']
        d.y = device['y']
        d.type = device['type']
        d.save()

    def onDeviceDestroy(self, device, topology_id, client_id):
        Device.objects.filter(topology_id=topology_id, id=device['id']).delete()

    def onDeviceMove(self, device, topology_id, client_id):
        Device.objects.filter(topology_id=topology_id, id=device['id']).update(x=device['x'], y=device['y'])

    def onDeviceLabelEdit(self, device, topology_id, client_id):
        Device.objects.filter(topology_id=topology_id, id=device['id']).update(name=device['name'])

    def onInterfaceCreate(self, interface, topology_id, client_id):
        Interface.objects.get_or_create(device_id=Device.objects.get(id=interface['device_id'],
                                                                     topology_id=topology_id).pk,
                                        id=interface['id'],
                                        defaults=dict(name=interface['name']))

    def onLinkCreate(self, link, topology_id, client_id):
        device_map = dict(Device.objects
                                .filter(topology_id=topology_id, id__in=[link['from_device_id'], link['to_device_id']])
                                .values_list('id', 'pk'))
        Link.objects.get_or_create(id=link['id'],
                                   from_device_id=device_map[link['from_device_id']],
                                   to_device_id=device_map[link['to_device_id']],
                                   from_interface_id=Interface.objects.get(device_id=device_map[link['from_device_id']],
                                                                           id=link['from_interface_id']).pk,
                                   to_interface_id=Interface.objects.get(device_id=device_map[link['to_device_id']],
                                                                         id=link['to_interface_id']).pk)

    def onLinkDestroy(self, link, topology_id, client_id):
        device_map = dict(Device.objects
                                .filter(topology_id=topology_id, id__in=[link['from_device_id'], link['to_device_id']])
                                .values_list('id', 'pk'))
        Link.objects.filter(id=link['id'],
                            from_device_id=device_map[link['from_device_id']],
                            to_device_id=device_map[link['to_device_id']],
                            from_interface_id=Interface.objects.get(device_id=device_map[link['from_device_id']],
                                                                    id=link['from_interface_id']).pk,
                            to_interface_id=Interface.objects.get(device_id=device_map[link['to_device_id']],
                                                                  id=link['to_interface_id']).pk).delete()

    def onDeviceSelected(self, message_value, topology_id, client_id):
        'Ignore DeviceSelected messages'
        pass

    def onDeviceUnSelected(self, message_value, topology_id, client_id):
        'Ignore DeviceSelected messages'
        pass

    def onUndo(self, message_value, topology_id, client_id):
        undo_persistence.handle(message_value['original_message'], topology_id, client_id)

    def onRedo(self, message_value, topology_id, client_id):
        redo_persistence.handle(message_value['original_message'], topology_id, client_id)

    def onMultipleMessage(self, message_value, topology_id, client_id):
        for message in message_value['messages']:
            handler = self.get_handler(message['msg_type'])
            if handler is not None:
                handler(message, topology_id, client_id)
            else:
                print "Unsupported message ", message_type

    def onDeploy(self, message_value, topology_id, client_id):
        print yaml_serialize_topology(topology_id)
        Group("workers").send({"text": yaml_serialize_topology(topology_id)})


persistence = _Persistence()


class _UndoPersistence(object):

    def handle(self, message, topology_id, client_id):
        message_type = message[0]
        message_value = message[1]
        TopologyHistory.objects.filter(topology_id=topology_id,
                                       client_id=message_value['sender'],
                                       message_id=message_value['message_id']).update(undone=True)
        handler = getattr(self, "on{0}".format(message_type), None)
        if handler is not None:
            handler(message_value, topology_id, client_id)
        else:
            print "Unsupported undo message ", message_type

    def onSnapshot(self, snapshot, topology_id, client_id):
        pass

    def onDeviceCreate(self, device, topology_id, client_id):
        persistence.onDeviceDestroy(device, topology_id, client_id)

    def onDeviceDestroy(self, device, topology_id, client_id):
        inverted = device.copy()
        inverted['type'] = device['previous_type']
        inverted['name'] = device['previous_name']
        inverted['x'] = device['previous_x']
        inverted['y'] = device['previous_y']
        persistence.onDeviceCreate(inverted, topology_id, client_id)

    def onDeviceMove(self, device, topology_id, client_id):
        inverted = device.copy()
        inverted['x'] = device['previous_x']
        inverted['y'] = device['previous_y']
        persistence.onDeviceMove(inverted, topology_id, client_id)

    def onDeviceLabelEdit(self, device, topology_id, client_id):
        inverted = device.copy()
        inverted['name'] = device['previous_name']
        persistence.onDeviceLabelEdit(inverted, topology_id, client_id)

    def onLinkCreate(self, link, topology_id, client_id):
        persistence.onLinkDestroy(link, topology_id, client_id)

    def onLinkDestroy(self, link, topology_id, client_id):
        persistence.onLinkCreate(link, topology_id, client_id)

    def onDeviceSelected(self, message_value, topology_id, client_id):
        'Ignore DeviceSelected messages'
        pass

    def onDeviceUnSelected(self, message_value, topology_id, client_id):
        'Ignore DeviceSelected messages'
        pass

    def onUndo(self, message_value, topology_id, client_id):
        pass


undo_persistence = _UndoPersistence()


class _RedoPersistence(object):

    def handle(self, message, topology_id, client_id):
        message_type = message[0]
        message_value = message[1]
        TopologyHistory.objects.filter(topology_id=topology_id,
                                       client_id=message_value['sender'],
                                       message_id=message_value['message_id']).update(undone=False)
        handler_name = "on{0}".format(message_type)
        handler = getattr(self, handler_name, getattr(persistence, handler_name, None))
        if handler is not None:
            handler(message_value, topology_id, client_id)
        else:
            print "Unsupported redo message ", message_type

    def onDeviceSelected(self, message_value, topology_id, client_id):
        'Ignore DeviceSelected messages'
        pass

    def onDeviceUnSelected(self, message_value, topology_id, client_id):
        'Ignore DeviceSelected messages'
        pass

    def onUndo(self, message_value, topology_id, client_id):
        'Ignore Undo messages'
        pass

    def onRedo(self, message_value, topology_id, client_id):
        'Ignore Redo messages'
        pass


redo_persistence = _RedoPersistence()


@channel_session
def worker_connect(message):
    Group("workers").add(message.reply_channel)
    message.reply_channel.send({"accept": True})


@channel_session
def worker_message(message):
    Channel('console_printer').send({"text": message['text']})


@channel_session
def worker_disconnect(message):
    pass
