var inherits = require('inherits');
var fsm = require('./fsm.js');
var models = require('./models.js');
var messages = require('./messages.js');
var util = require('./util.js');

function _State () {
}
inherits(_State, fsm._State);

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

function _Selected2 () {
    this.name = 'Selected2';
}
inherits(_Selected2, _State);
var Selected2 = new _Selected2();
exports.Selected2 = Selected2;

function _Selected3 () {
    this.name = 'Selected3';
}
inherits(_Selected3, _State);
var Selected3 = new _Selected3();
exports.Selected3 = Selected3;

function _Move () {
    this.name = 'Move';
}
inherits(_Move, _State);
var Move = new _Move();
exports.Move = Move;

function _Selected1 () {
    this.name = 'Selected1';
}
inherits(_Selected1, _State);
var Selected1 = new _Selected1();
exports.Selected1 = Selected1;



function _EditLabel () {
    this.name = 'EditLabel';
}
inherits(_EditLabel, _State);
var EditLabel = new _EditLabel();
exports.EditLabel = EditLabel;

_Ready.prototype.onMouseDown = function (controller, msg_type, $event) {

    var last_selected = controller.scope.select_items($event.shiftKey);

    if (last_selected.last_selected_device !== null) {
        controller.changeState(Selected1);
    } else if (last_selected.last_selected_link !== null) {
        controller.changeState(Selected1);
    } else if (last_selected.last_selected_interface !== null) {
        controller.changeState(Selected1);
    } else {
        controller.next_controller.handle_message(msg_type, $event);
    }
};
_Ready.prototype.onMouseDown.transitions = ['Selected1'];

_Ready.prototype.onTouchStart = _Ready.prototype.onMouseDown;


_Ready.prototype.onKeyDown = function(controller, msg_type, $event) {

	var scope = controller.scope;
    var device = null;

	if ($event.key === 'r') {
		device = new models.Device(controller.scope.device_id_seq(),
                                   "Router",
                                   scope.scaledX,
                                   scope.scaledY,
                                   "router");
	}
    else if ($event.key === 's') {
		device = new models.Device(controller.scope.device_id_seq(),
                                   "Switch",
                                   scope.scaledX,
                                   scope.scaledY,
                                   "switch");
	}
    else if ($event.key === 'a') {
		device = new models.Device(controller.scope.device_id_seq(),
                                   "Rack",
                                   scope.scaledX,
                                   scope.scaledY,
                                   "rack");
	}
    else if ($event.key === 'h') {
		device = new models.Device(controller.scope.device_id_seq(),
                                   "Host",
                                   scope.scaledX,
                                   scope.scaledY,
                                   "host");
	}

    if (device !== null) {
        scope.devices.push(device);
        scope.send_control_message(new messages.DeviceCreate(scope.client_id,
                                                             device.id,
                                                             device.x,
                                                             device.y,
                                                             device.name,
                                                             device.type));
    }

	controller.next_controller.handle_message(msg_type, $event);
};

_Start.prototype.start = function (controller) {

    controller.changeState(Ready);

};
_Start.prototype.start.transitions = ['Ready'];



_Selected2.prototype.onMouseDown = function (controller, msg_type, $event) {

	var last_selected = null;

    if (controller.scope.selected_devices.length === 1) {
        var current_selected_device = controller.scope.selected_devices[0];
        var last_selected_device = controller.scope.select_items($event.shiftKey).last_selected_device;
        if (current_selected_device === last_selected_device) {
            controller.changeState(Selected3);
            return;
        }
    }

    if (controller.scope.selected_links.length === 1) {
        var current_selected_link = controller.scope.selected_links[0];
        last_selected = controller.scope.select_items($event.shiftKey);
        if (current_selected_link === last_selected.last_selected_link) {
            controller.changeState(Selected3);
            return;
        }
    }

    if (controller.scope.selected_interfaces.length === 1) {
        var current_selected_interface = controller.scope.selected_interfaces[0];
        last_selected = controller.scope.select_items($event.shiftKey);
        if (current_selected_interface === last_selected.last_selected_interface) {
            controller.changeState(Selected3);
            return;
        }
    }

    controller.changeState(Ready);
    controller.handle_message(msg_type, $event);
};
_Selected2.prototype.onMouseDown.transitions = ['Ready', 'Selected3'];

_Selected2.prototype.onTouchStart = _Selected2.prototype.onMouseDown;

_Selected2.prototype.onKeyDown = function (controller, msg_type, $event) {

    if ($event.keyCode === 8) {
        //Delete
        controller.changeState(Ready);

        var i = 0;
        var j = 0;
        var index = -1;
        var devices = controller.scope.selected_devices;
        var all_links = controller.scope.links.slice();
        controller.scope.selected_devices = [];
        controller.scope.selected_links = [];
        for (i = 0; i < devices.length; i++) {
            index = controller.scope.devices.indexOf(devices[i]);
            if (index !== -1) {
                controller.scope.devices.splice(index, 1);
                controller.scope.send_control_message(new messages.DeviceDestroy(controller.scope.client_id,
                                                                                 devices[i].id,
                                                                                 devices[i].x,
                                                                                 devices[i].y,
                                                                                 devices[i].name,
                                                                                 devices[i].type));
            }
            for (j = 0; j < all_links.length; j++) {
                if (all_links[j].to_device === devices[i] ||
                    all_links[j].from_device === devices[i]) {
                    index = controller.scope.links.indexOf(all_links[j]);
                    if (index !== -1) {
                        controller.scope.links.splice(index, 1);
                    }
                }
            }
        }
    }
};
_Selected2.prototype.onKeyDown.transitions = ['Ready'];


_Selected1.prototype.onMouseMove = function (controller) {

    controller.changeState(Move);

};
_Selected1.prototype.onMouseMove.transitions = ['Move'];

_Selected1.prototype.onTouchMove = _Selected1.prototype.onMouseMove;

_Selected1.prototype.onMouseUp = function (controller) {

    controller.changeState(Selected2);

};
_Selected1.prototype.onMouseUp.transitions = ['Selected2'];

_Selected1.prototype.onTouchEnd = _Selected1.prototype.onMouseUp;

_Selected1.prototype.onMouseDown = util.noop;

_Move.prototype.onMouseMove = function (controller) {

    var devices = controller.scope.selected_devices;

    var diffX = controller.scope.scaledX - controller.scope.pressedScaledX;
    var diffY = controller.scope.scaledY - controller.scope.pressedScaledY;
    var i = 0;
    var j = 0;
    var previous_x, previous_y;
    for (i = 0; i < devices.length; i++) {
        previous_x = devices[i].x;
        previous_y = devices[i].y;
        devices[i].x = devices[i].x + diffX;
        devices[i].y = devices[i].y + diffY;
        for (j = 0; j < devices[i].interfaces.length; j++) {
             devices[i].interfaces[j].dot();
             if (devices[i].interfaces[j].link !== null) {
                 devices[i].interfaces[j].link.to_interface.dot();
                 devices[i].interfaces[j].link.from_interface.dot();
             }
        }
        controller.scope.send_control_message(new messages.DeviceMove(controller.scope.client_id,
                                                                      devices[i].id,
                                                                      devices[i].x,
                                                                      devices[i].y,
                                                                      previous_x,
                                                                      previous_y));
    }
    controller.scope.pressedScaledX = controller.scope.scaledX;
    controller.scope.pressedScaledY = controller.scope.scaledY;
};

_Move.prototype.onTouchMove = _Move.prototype.onMouseMove;


_Move.prototype.onMouseUp = function (controller, msg_type, $event) {

    controller.changeState(Selected2);
    controller.handle_message(msg_type, $event);
};
_Move.prototype.onMouseUp.transitions = ['Selected2'];

_Move.prototype.onTouchEnd = _Move.prototype.onMouseUp;

_Selected3.prototype.onMouseUp = function (controller) {
    controller.changeState(EditLabel);
};
_Selected3.prototype.onMouseUp.transitions = ['EditLabel'];

_Selected3.prototype.onTouchEnd = function (controller) {
    controller.changeState(Selected2);
};
_Selected3.prototype.onTouchEnd.transitions = ['Selected2'];


_Selected3.prototype.onMouseMove = function (controller) {
    controller.changeState(Move);
};
_Selected3.prototype.onMouseMove.transitions = ['Move'];

_Selected3.prototype.onTouchMove = _Selected3.prototype.onMouseMove;


_EditLabel.prototype.start = function (controller) {
    controller.scope.selected_items[0].edit_label = true;
};

_EditLabel.prototype.end = function (controller) {
    controller.scope.selected_items[0].edit_label = false;
};

_EditLabel.prototype.onMouseDown = function (controller, msg_type, $event) {

    controller.changeState(Ready);
    controller.handle_message(msg_type, $event);

};
_EditLabel.prototype.onMouseDown.transitions = ['Ready'];


_EditLabel.prototype.onKeyDown = function (controller, msg_type, $event) {
    //Key codes found here:
    //https://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
	var item = controller.scope.selected_items[0];
    var previous_name = item.name;
	if ($event.keyCode === 8 || $event.keyCode === 46) { //Delete
		item.name = item.name.slice(0, -1);
	} else if ($event.keyCode >= 48 && $event.keyCode <=90) { //Alphanumeric
        item.name += $event.key;
	} else if ($event.keyCode >= 186 && $event.keyCode <=222) { //Punctuation
        item.name += $event.key;
	} else if ($event.keyCode === 13) { //Enter
        controller.changeState(Selected2);
    }
    if (item.constructor.name === "Device") {
        controller.scope.send_control_message(new messages.DeviceLabelEdit(controller.scope.client_id,
                                                                           item.id,
                                                                           item.name,
                                                                           previous_name));
    }
    if (item.constructor.name === "Interface") {
        controller.scope.send_control_message(new messages.InterfaceLabelEdit(controller.scope.client_id,
                                                                           item.id,
                                                                           item.device.id,
                                                                           item.name,
                                                                           previous_name));
    }
    if (item.constructor.name === "Link") {
        controller.scope.send_control_message(new messages.LinkLabelEdit(controller.scope.client_id,
                                                                           item.id,
                                                                           item.name,
                                                                           previous_name));
    }
};
_EditLabel.prototype.onKeyDown.transitions = ['Selected2'];
