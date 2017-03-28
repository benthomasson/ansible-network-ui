from django.core.management.base import BaseCommand
from prototype.models import Topology, Device, Link
from django.db.models import Q

import yaml


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

        for device in Device.objects.filter(topology_id=topology_id):
            data['devices'].append(dict(name=device.name))

        for link in Link.objects.filter(Q(from_device__topology_id=topology_id) |
                                        Q(to_device__topology_id=topology_id)):
            data['links'].append(dict(from_device=link.from_device.name,
                                      to_device=link.to_device.name))

        print yaml.safe_dump(data, default_flow_style=False)
