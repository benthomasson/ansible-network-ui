from django.core.management.base import BaseCommand
from prototype.models import Topology, Device, Link, Interface
from django.db.models import Q

import yaml


NetworkAnnotatedInterface = Interface.objects.values('name',
                                                     'from_link__pk',
                                                     'to_link__pk',
                                                     'from_link__to_device__name',
                                                     'to_link__from_device__name',
                                                     'from_link__to_interface__name',
                                                     'to_link__from_interface__name')




class Command(BaseCommand):
    help = 'Dumps data of a topology to a yaml file'

    def add_arguments(self, parser):
        parser.add_argument('topology_id', type=int)

    def handle(self, *args, **options):
        topology_id = options['topology_id']

        data = dict(devices=[],
                    links=[])

        topology = Topology.objects.get(pk=topology_id)

        data['name'] = topology.name

        links = list(Link.objects
                         .filter(Q(from_device__topology_id=topology_id) |
                                 Q(to_device__topology_id=topology_id)))

        interfaces = Interface.objects.filter(device__topology_id=topology_id)

        for device in Device.objects.filter(topology_id=topology_id).order_by('name'):
            interfaces = list(NetworkAnnotatedInterface.filter(device_id=device.pk).order_by('name'))
            interfaces = [dict(name=x['name'],
                               network=x['from_link__pk'] or x['to_link__pk'],
                               remote_device_name=x['from_link__to_device__name'] or x['to_link__from_device__name'],
                               remote_interface_name=x['from_link__to_interface__name'] or x['to_link__from_interface__name'],
                              ) for x in interfaces]
            data['devices'].append(dict(name=device.name,
                                        type=device.type,
                                        interfaces=interfaces))

        for link in links:
            data['links'].append(dict(from_device=link.from_device.name,
                                      to_device=link.to_device.name,
                                      from_interface=link.from_interface.name,
                                      to_interface=link.to_interface.name,
                                      network=link.pk))

        print yaml.safe_dump(data, default_flow_style=False)
