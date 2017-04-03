var fsm = require('./fsm.js');
var button = require('./button.js');
var util = require('./util.js');

function Device(id, name, x, y, type) {
    this.id = id;
    this.name = name;
    this.x = x;
    this.y = y;
    this.height = type === "host" ? 15 : 50;
    this.width = 50;
    this.type = type;
    this.selected = false;
    this.remote_selected = false;
    this.edit_label = false;
    this.status = null;
    this.working = false;
    this.tasks = [];
    this.interface_seq = util.natural_numbers(0);
    this.interfaces = [];
}
exports.Device = Device;

Device.prototype.is_selected = function (x, y) {

    return (x > this.x - this.width &&
            x < this.x + this.width &&
            y > this.y - this.height &&
            y < this.y + this.height);

};

Device.prototype.describeArc = util.describeArc;


Device.prototype.toJSON = function () {
    return {id: this.id,
            name: this.name,
            x: this.x,
            y: this.y,
            size: this.size,
            type: this.type};

};

function Interface(id, name) {
    this.id = id;
    this.name = name;
    this.link = null;
}
exports.Interface = Interface;

Interface.prototype.toJSON = function () {
    return {id: this.id,
            name: this.name};
};

function Link(id, from_device, to_device, from_interface, to_interface) {
    this.id = id;
    this.from_device = from_device;
    this.to_device = to_device;
    this.from_interface = from_interface;
    this.to_interface = to_interface;
    this.selected = false;
    this.status = null;
}
exports.Link = Link;

Link.prototype.toJSON = function () {
    return {id: this.id,
            to_device: this.to_device.id,
            from_device: this.from_device.id,
            to_interface: this.to_interface.id,
            from_interface: this.from_interface.id};
};

function Button(name, x, y, width, height, callback) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.callback = callback;
    this.is_pressed = false;
    this.mouse_over = false;
    this.fsm = new fsm.FSMController(this, button.Start, null);
}
exports.Button = Button;


Button.prototype.is_selected = function (x, y) {

    return (x > this.x &&
            x < this.x + this.width &&
            y > this.y &&
            y < this.y + this.height);

};

function Task(id, name) {
    this.id = id;
    this.name = name;
    this.status = null;
    this.working = null;
}
exports.Task = Task;

Task.prototype.describeArc = util.describeArc;
