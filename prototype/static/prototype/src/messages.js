

function serialize(message) {
    return JSON.stringify([message.constructor.name, message]);
}
exports.serialize = serialize;

function DeviceMove(sender, id, x, y, previous_x, previous_y) {
    this.msg_type = "DeviceMove";
    this.sender = sender;
    this.id = id;
    this.x = x;
    this.y = y;
    this.previous_x = previous_x;
    this.previous_y = previous_y;
}
exports.DeviceMove = DeviceMove;

function DeviceCreate(sender, id, x, y, name, type) {
    this.msg_type = "DeviceCreate";
    this.sender = sender;
    this.id = id;
    this.x = x;
    this.y = y;
    this.name = name;
    this.type = type;
}
exports.DeviceCreate = DeviceCreate;

function DeviceDestroy(sender, id, previous_x, previous_y, previous_name, previous_type) {
    this.msg_type = "DeviceDestroy";
    this.sender = sender;
    this.id = id;
    this.previous_x = previous_x;
    this.previous_y = previous_y;
    this.previous_name = previous_name;
    this.previous_type = previous_type;
}
exports.DeviceDestroy = DeviceDestroy;

function DeviceLabelEdit(sender, id, name, previous_name) {
    this.msg_type = "DeviceLabelEdit";
    this.sender = sender;
    this.id = id;
    this.name = name;
    this.previous_name = previous_name;
}
exports.DeviceLabelEdit = DeviceLabelEdit;

function DeviceSelected(sender, id) {
    this.msg_type = "DeviceSelected";
    this.sender = sender;
    this.id = id;
}
exports.DeviceSelected = DeviceSelected;

function DeviceUnSelected(sender, id) {
    this.msg_type = "DeviceUnSelected";
    this.sender = sender;
    this.id = id;
}
exports.DeviceUnSelected = DeviceUnSelected;

function InterfaceCreate(sender, device_id, id, name) {
    this.msg_type = "InterfaceCreate";
    this.sender = sender;
    this.device_id = device_id;
    this.id = id;
    this.name = name;
}
exports.InterfaceCreate = InterfaceCreate;

function InterfaceLabelEdit(sender, id, device_id, name, previous_name) {
    this.msg_type = "InterfaceLabelEdit";
    this.sender = sender;
    this.id = id;
    this.device_id = device_id;
    this.name = name;
    this.previous_name = previous_name;
}
exports.InterfaceLabelEdit = InterfaceLabelEdit;

function LinkLabelEdit(sender, id, name, previous_name) {
    this.msg_type = "LinkLabelEdit";
    this.sender = sender;
    this.id = id;
    this.name = name;
    this.previous_name = previous_name;
}
exports.LinkLabelEdit = LinkLabelEdit;

function LinkCreate(sender, id, from_device_id, to_device_id, from_interface_id, to_interface_id) {
    this.msg_type = "LinkCreate";
    this.id = id;
    this.sender = sender;
    this.name = '';
    this.from_device_id = from_device_id;
    this.to_device_id = to_device_id;
    this.from_interface_id = from_interface_id;
    this.to_interface_id = to_interface_id;
}
exports.LinkCreate = LinkCreate;

function LinkDestroy(sender, id, from_id, to_id) {
    this.msg_type = "LinkDestroy";
    this.id = id;
    this.sender = sender;
    this.from_id = from_id;
    this.to_id = to_id;
    this.name = '';
}
exports.LinkDestroy = LinkDestroy;

function LinkSelected(sender, id) {
    this.msg_type = "LinkSelected";
    this.sender = sender;
    this.id = id;
}
exports.LinkSelected = LinkSelected;

function LinkUnSelected(sender, id) {
    this.msg_type = "LinkUnSelected";
    this.sender = sender;
    this.id = id;
}
exports.LinkUnSelected = LinkUnSelected;

function Undo(sender, original_message) {
    this.msg_type = "Undo";
    this.sender = sender;
    this.original_message = original_message;
}
exports.Undo = Undo;

function Redo(sender, original_message) {
    this.msg_type = "Redo";
    this.sender = sender;
    this.original_message = original_message;
}
exports.Redo = Redo;

function Deploy(sender) {
    this.msg_type = "Deploy";
    this.sender = sender;
}
exports.Deploy = Deploy;

function Destroy(sender) {
    this.msg_type = "Destroy";
    this.sender = sender;
}
exports.Destroy = Destroy;

function Discover(sender) {
    this.msg_type = "Discover";
    this.sender = sender;
}

exports.Discover = Discover;

function Layout(sender) {
    this.msg_type = "Layout";
    this.sender = sender;
}
exports.Layout = Layout;

function MultipleMessage(sender, messages) {
    this.msg_type = "MultipleMessage";
    this.sender = sender;
    this.messages = messages;
}
exports.MultipleMessage = MultipleMessage;

function Coverage(sender, coverage) {
    this.msg_type = "Coverage";
    this.sender = sender;
    this.coverage = coverage;
}
exports.Coverage = Coverage;

function MouseEvent(sender, x, y, type) {
    this.msg_type = "MouseEvent";
    this.sender = sender;
    this.x = x;
    this.y = y;
    this.type = type;
}
exports.MouseEvent = MouseEvent;

function MouseWheelEvent(sender, delta, deltaX, deltaY, type, metaKey) {
    this.msg_type = "MouseWheelEvent";
    this.sender = sender;
    this.delta = delta;
    this.deltaX = deltaX;
    this.deltaY = deltaY;
    this.type = type;
    this.originalEvent = {metaKey: metaKey};
}
exports.MouseWheelEvent = MouseWheelEvent;

function KeyEvent(sender, key, keyCode, type, altKey, shiftKey, ctrlKey, metaKey) {
    this.msg_type = "KeyEvent";
    this.sender = sender;
    this.key = key;
    this.keyCode = keyCode;
    this.type = type;
    this.altKey = altKey;
    this.shiftKey = shiftKey;
    this.ctrlKey = ctrlKey;
    this.metaKey = metaKey;
}
exports.KeyEvent = KeyEvent;

function TouchEvent(sender, type, touches) {
    this.msg_type = "TouchEvent";
    this.sender = sender;
    this.type = type;
    this.touches = touches;
}
exports.TouchEvent = TouchEvent;

function StartRecording(sender) {
    this.msg_type = "StartRecording";
    this.sender = sender;
}
exports.StartRecording = StartRecording;

function StopRecording(sender) {
    this.msg_type = "StopRecording";
    this.sender = sender;
}
exports.StopRecording = StopRecording;

function ViewPort(sender, scale, panX, panY) {
    this.msg_type = "ViewPort";
    this.sender = sender;
    this.scale = scale;
    this.panX = panX;
    this.panY = panY;
}
exports.ViewPort = ViewPort;
