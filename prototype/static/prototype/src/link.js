var inherits = require('inherits');
var fsm = require('./fsm.js');
var models = require('./models.js');
var messages = require('./messages.js');

function _State () {
}
inherits(_State, fsm._State);


_State.prototype.onMouseMove = function (controller, $event) {
    controller.next_controller.state.onMouseMove(controller.next_controller, $event);
};
_State.prototype.onMouseUp = function (controller, $event) {
    controller.next_controller.state.onMouseUp(controller.next_controller, $event);
};
_State.prototype.onMouseDown = function (controller, $event) {
    controller.next_controller.state.onMouseDown(controller.next_controller, $event);
};
_State.prototype.onMouseWheel = function (controller, $event, delta, deltaX, deltaY) {
    controller.next_controller.state.onMouseWheel(controller.next_controller, $event, delta, deltaX, deltaY);
};
_State.prototype.onKeyDown = function (controller, $event) {
    controller.next_controller.state.onKeyDown(controller.next_controller, $event);
};


function _Ready () {
    this.name = 'Ready';
}
inherits(_Ready, _State);
var Ready = new _Ready();
exports.Ready = Ready;

function _Start () {
    this.name = 'Start';
}
inherits(_Start, _State);
var Start = new _Start();
exports.Start = Start;

function _Connected () {
    this.name = 'Connected';
}
inherits(_Connected, _State);
var Connected = new _Connected();
exports.Connected = Connected;

function _Connecting () {
    this.name = 'Connecting';
}
inherits(_Connecting, _State);
var Connecting = new _Connecting();
exports.Connecting = Connecting;

function _Selecting () {
    this.name = 'Selecting';
}
inherits(_Selecting, _State);
var Selecting = new _Selecting();
exports.Selecting = Selecting;




_Ready.prototype.onKeyDown = function(controller, $event) {

    if ($event.key === 'l') {
        controller.state.onNewLink(controller, $event);
    }

	controller.next_controller.state.onKeyDown(controller.next_controller, $event);
};

_Ready.prototype.onNewLink = function (controller) {

    controller.scope.clear_selections();
    controller.changeState(Selecting);
};



_Start.prototype.start = function (controller) {

    controller.changeState(Ready);

};



_Connected.prototype.start = function (controller) {

    controller.scope.clear_selections();
    controller.changeState(Ready);
};


_Connecting.prototype.onMouseDown = function () {
};

_Connecting.prototype.onMouseUp = function (controller) {

    var selected_device = controller.scope.select_devices(false);
    var to_device_interface = null;
    var from_device_interface = null;
    var i = 0;
    if (selected_device !== null) {
        controller.scope.new_link.to_device = selected_device;
        i = controller.scope.new_link.to_device.interface_seq();
        to_device_interface = new models.Interface(i, "eth" + i);
        controller.scope.new_link.to_device.interfaces.push(to_device_interface);
        i = controller.scope.new_link.from_device.interface_seq();
        from_device_interface = new models.Interface(i, "eth" + i);
        controller.scope.new_link.from_device.interfaces.push(from_device_interface);
        controller.scope.send_control_message(new messages.InterfaceCreate(controller.scope.client_id,
                                                                           controller.scope.new_link.from_device.id,
                                                                           from_device_interface.id,
                                                                           from_device_interface.name));
        controller.scope.send_control_message(new messages.InterfaceCreate(controller.scope.client_id,
                                                                           controller.scope.new_link.to_device.id,
                                                                           to_device_interface.id,
                                                                           to_device_interface.name));
        controller.scope.send_control_message(new messages.LinkCreate(controller.scope.client_id,
                                                                      controller.scope.new_link.from_device.id,
                                                                      controller.scope.new_link.to_device.id,
                                                                      from_device_interface.id,
                                                                      to_device_interface.id));
        controller.scope.new_link = null;
        controller.changeState(Connected);
    } else {
        var index = controller.scope.links.indexOf(controller.scope.new_link);
        if (index !== -1) {
            controller.scope.links.splice(index, 1);
        }
        controller.scope.new_link = null;
        controller.changeState(Ready);
    }
};


_Selecting.prototype.onMouseDown = function () {
};

_Selecting.prototype.onMouseUp = function (controller) {

    var selected_device = controller.scope.select_devices(false);
    if (selected_device !== null) {
        controller.scope.new_link = new models.Link(selected_device, null, null, null, true);
        controller.scope.links.push(controller.scope.new_link);
        controller.changeState(Connecting);
    }
};

