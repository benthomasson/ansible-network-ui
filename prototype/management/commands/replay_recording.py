from django.core.management.base import BaseCommand

from websocket import create_connection
from ui_test import MessageHandler, _Time

import json

time = _Time()



class Command(BaseCommand):

    def add_arguments(self, parser):
        parser.add_argument('topology_id', type=int)
        parser.add_argument('recording')
        parser.add_argument('--time-scale', dest="time_scale", default=1.0, type=float)

    def handle(self, *args, **options):
        print options['topology_id']
        print options['recording']
        time.scale = options.get('time_scale', 1.0)
        ui = MessageHandler(create_connection("ws://localhost:8001/prototype/topology?topology_id={0}".format(options['topology_id'])))
        ui.recv()
        ui.recv()
        ui.send('StopRecording')
        ui.send('StartReplay')
        with open(options['recording']) as f:
            for line in f.readlines():
                message = json.loads(line)
                message['sender'] = ui.client_id
                message['save'] = False
                ui.send_message([message['msg_type'], message])
                time.sleep(1)
        ui.send('StopReplay')
        ui.send('CoverageRequest')
        ui.close()
