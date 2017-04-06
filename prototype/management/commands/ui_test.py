from django.core.management.base import NoArgsCommand
import unittest
from websocket import create_connection
import json
import time as real_time


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
        tests = [loader.loadTestsFromTestCase(x) for x in [TestWebSocket]]
        unittest.TextTestRunner(failfast=options.get('failfast'),
                                verbosity=0 if options.get('quiet') else 2 if options.get('verbose') else 1,
                                buffer=options.get('buffer')).run(unittest.TestSuite(tests))


class TestWebSocket(unittest.TestCase):
    def setUp(self):
        self.ws = create_connection("ws://localhost:8001/prototype/ansible?topology_id=143")

    def tearDown(self):
        self.ws.close()

    def test_DeviceStatus(self):
        self.ws.send(json.dumps(['DeviceStatus', dict(name="Switch1", working=True, status=None)]))
        time.sleep(1)
        self.ws.send(json.dumps(['DeviceStatus', dict(name="Switch1", working=False, status="pass")]))
        time.sleep(1)

    def test_DeviceCreate(self):
        self.ws.send(json.dumps(['DeviceCreate', dict(name="TestSwitch", x=0, y=0, type="switch", id=100)]))
        time.sleep(1)
        self.ws.send(json.dumps(['DeviceDestroy', dict(previous_name="TestSwitch", previous_x=0, previous_y=0, previous_type="switch", id=100)]))

    def test_DeviceMove(self):
        self.ws.send(json.dumps(['DeviceCreate', dict(name="TestSwitch", x=0, y=0, type="switch", id=100)]))
        for i in xrange(1, 1000):
            time.sleep(0.01)
            self.ws.send(json.dumps(['DeviceMove', dict(x=i, y=0, previous_x=i-1, previous_y=0, id=100)]))
        time.sleep(1)
        self.ws.send(json.dumps(['DeviceDestroy', dict(previous_name="TestSwitch", previous_x=0, previous_y=0, previous_type="switch", id=100)]))
