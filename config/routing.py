from channels.routing import route
from prototype.consumers import ws_connect, ws_message, ws_disconnect, console_printer, persistence
from prototype.consumers import ansible_connect, ansible_message, ansible_disconnect
from prototype.consumers import worker_connect, worker_message, worker_disconnect

channel_routing = [
    route("websocket.connect", ws_connect, path=r"^/prototype/topology"),
    route("websocket.receive", ws_message, path=r"^/prototype/topology"),
    route("websocket.disconnect", ws_disconnect, path=r"^/prototype/topology"),
    route("websocket.connect", ansible_connect, path=r"^/prototype/ansible"),
    route("websocket.receive", ansible_message, path=r"^/prototype/ansible"),
    route("websocket.disconnect", ansible_disconnect, path=r"^/prototype/ansible"),
    route("websocket.connect", worker_connect, path=r"^/prototype/worker"),
    route("websocket.receive", worker_message, path=r"^/prototype/worker"),
    route("websocket.disconnect", worker_disconnect, path=r"^/prototype/worker"),
    route("console_printer", console_printer),
    route("persistence", persistence.handle),
]
