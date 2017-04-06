from django.core.management.base import NoArgsCommand
import unittest
from websocket import create_connection
import json
import time as real_time
import requests


class _Time(object):

    def __init__(self, scale=1.0):
        self.scale = scale

    def sleep(self, n):
        real_time.sleep(n * self.scale)


time = _Time()


class Command(NoArgsCommand):

    def add_arguments(self, parser):
        parser.add_argument('--time-scale', dest="time_scale", default=1.0, type=float)
        parser.add_argument('--verbose', dest="verbose", action="store_true", default=False)
        parser.add_argument('-q', '--quiet', dest="quiet", action="store_true", default=False)
        parser.add_argument('-f', '--failfast', dest="failfast", action="store_true", default=False)
        parser.add_argument('-b', '--buffer', dest="buffer", action="store_true", default=False)

    def handle_noargs(self, **options):
        time.scale = options.get('time_scale', 1.0)
        loader = unittest.TestLoader()
        tests = [loader.loadTestsFromTestCase(x) for x in [TestPersistence,
                                                           TestViews,
                                                           TestWorkerWebSocket,
                                                           TestAnsibleWebSocket]]
        unittest.TextTestRunner(failfast=options.get('failfast'),
                                verbosity=0 if options.get('quiet') else 2 if options.get('verbose') else 1,
                                buffer=options.get('buffer')).run(unittest.TestSuite(tests))


class TestViews(unittest.TestCase):

    def test_index(self):
        requests.get("http://localhost:8001/prototype")


class MessageHandler(object):

    def __init__(self, ws):
        self.ws = ws
        self.client_id = None
        self.topology_id = None

    def handle_message(self, message):
        message = json.loads(message)
        if message[0] == "id":
            self.client_id = message[1]
        if message[0] == "topology_id":
            self.topology_id = message[1]

    def send(self, msg_type, **kwargs):
        kwargs['sender'] = self.client_id
        self.ws.send(json.dumps([msg_type, kwargs]))

    def recv(self):
        msg = self.ws.recv()
        self.handle_message(msg)
        return msg

    def close(self):
        self.ws.close()


class TestWorkerWebSocket(unittest.TestCase):

    def test(self):
        self.worker = MessageHandler(create_connection("ws://localhost:8001/prototype/worker?topology_id=143"))
        self.ui = MessageHandler(create_connection("ws://localhost:8001/prototype/tester?topology_id=143"))
        self.ui.recv()
        self.ui.recv()
        self.ui.send("Deploy")
        self.assertTrue(self.worker.recv())


class TestAnsibleWebSocket(unittest.TestCase):

    def test(self):
        self.ws = create_connection("ws://localhost:8001/prototype/ansible?topology_id=143")


class TestPersistence(unittest.TestCase):
    def setUp(self):
        self.ws = MessageHandler(create_connection("ws://localhost:8001/prototype/tester?topology_id=143"))
        self.ws.recv()
        self.ws.recv()

    def tearDown(self):
        self.ws.close()

    def test_DeviceStatus(self):
        self.ws.send('DeviceStatus', name="Switch1", working=True, status=None)
        time.sleep(1)
        self.ws.send('DeviceStatus', name="Switch1", working=False, status="pass")
        time.sleep(1)

    def test_DeviceCreate(self):
        self.ws.send('DeviceCreate', name="TestSwitch", x=0, y=0, type="switch", id=100)
        time.sleep(1)
        self.ws.send('DeviceDestroy',
                     previous_name="TestSwitch",
                     previous_x=0,
                     previous_y=0,
                     previous_type="switch",
                     id=100)

    def test_DeviceMove(self):
        self.ws.send('DeviceCreate', name="TestSwitch", x=0, y=0, type="switch", id=100)
        for i in xrange(1, 1000):
            time.sleep(0.01)
            self.ws.send('DeviceMove', x=i, y=0, previous_x=i - 1, previous_y=0, id=100)
        time.sleep(1)
        self.ws.send('DeviceDestroy',
                     previous_name="TestSwitch",
                     previous_x=0,
                     previous_y=0,
                     previous_type="switch",
                     id=100)
