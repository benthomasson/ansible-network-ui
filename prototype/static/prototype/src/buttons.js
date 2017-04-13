var inherits = require('inherits');
var fsm = require('./fsm.js');

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
_State.prototype.onMouseWheel = function (controller, $event) {
    controller.next_controller.state.onMouseWheel(controller.next_controller, $event);
};
_State.prototype.onKeyDown = function (controller, $event) {
    controller.next_controller.state.onKeyDown(controller.next_controller, $event);
};
_State.prototype.onTouchStart = function (controller, $event) {
    controller.next_controller.state.onTouchStart(controller.next_controller, $event);
};
_State.prototype.onTouchEnd = function (controller, $event) {
    controller.next_controller.state.onTouchEnd(controller.next_controller, $event);
};
_State.prototype.onTouchMove = function (controller, $event) {
    controller.next_controller.state.onTouchMove(controller.next_controller, $event);
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

function _ButtonPressed () {
    this.name = 'ButtonPressed';
}
inherits(_ButtonPressed, _State);
var ButtonPressed = new _ButtonPressed();
exports.ButtonPressed = ButtonPressed;




_Ready.prototype.onMouseDown = function (controller, $event) {

    var i = 0;
    var buttons = controller.scope.buttons;
    var button = null;
    for (i = 0; i < buttons.length; i++) {
        button = buttons[i];
        if (button.is_selected(controller.scope.mouseX, controller.scope.mouseY)) {
            button.fsm.state.onMouseDown(button.fsm, $event);
            controller.changeState(ButtonPressed);
            break;
        }
        button = null;
    }
    if (button === null) {
        controller.next_controller.state.onMouseDown(controller.next_controller, $event);
    }

};
_Ready.prototype.onMouseDown.transitions = ['ButtonPressed'];

_Ready.prototype.onMouseMove = function (controller, $event) {

    if (!controller.scope.hide_buttons) {

        var i = 0;
        var buttons = controller.scope.buttons;
        var button = null;
        for (i = 0; i < buttons.length; i++) {
            button = buttons[i];
            button.mouse_over = false;
            if (button.is_selected(controller.scope.mouseX, controller.scope.mouseY)) {
                button.mouse_over = true;
            }
        }
    }

    controller.next_controller.state.onMouseMove(controller.next_controller, $event);
};


_Start.prototype.start = function (controller) {

    controller.changeState(Ready);

};
_Start.prototype.start.transitions = ['Ready'];



_ButtonPressed.prototype.onMouseUp = function (controller, $event) {

    var i = 0;
    var buttons = controller.scope.buttons;
    var button = null;
    for (i = 0; i < buttons.length; i++) {
        button = buttons[i];
        button.fsm.state.onMouseUp(button.fsm, $event);
    }
    controller.changeState(Ready);

};
_ButtonPressed.prototype.onMouseUp.transitions = ['Ready'];

