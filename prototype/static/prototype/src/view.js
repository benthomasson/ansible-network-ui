var inherits = require('inherits');
var fsm = require('./fsm.js');

function _State () {
}
inherits(_State, fsm._State);

_State.prototype.onMouseMove = function () {
};

_State.prototype.onMouseUp = function () {
};

_State.prototype.onMouseDown = function () {
};

_State.prototype.onKeyDown = function () {
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

function _Scale () {
    this.name = 'Scale';
}
inherits(_Scale, _State);
var Scale = new _Scale();
exports.Scale = Scale;

function _Pressed () {
    this.name = 'Pressed';
}
inherits(_Pressed, _State);
var Pressed = new _Pressed();
exports.Pressed = Pressed;

function _Pan () {
    this.name = 'Pan';
}
inherits(_Pan, _State);
var Pan = new _Pan();
exports.Pan = Pan;




_Ready.prototype.onMouseDown = function (controller) {

    controller.scope.pressedX = controller.scope.mouseX;
    controller.scope.pressedY = controller.scope.mouseY;
    controller.scope.lastPanX = controller.scope.panX;
    controller.scope.lastPanY = controller.scope.panY;
    controller.changeState(Pressed);

};

_Ready.prototype.onMouseWheel = function (controller, event, delta, deltaX, deltaY) {

    controller.changeState(Scale);
    controller.state.onMouseWheel(controller, event, delta, deltaX, deltaY);
};

_Ready.prototype.onKeyDown = function(controller, $event) {

	var scope = controller.scope;

    if ($event.key === 'd') {
        scope.debug.hidden = !scope.debug.hidden;
        return;
    }
    if ($event.key === 'p') {
        scope.cursor.hidden = !scope.cursor.hidden;
        return;
    }
    if ($event.key === 'b') {
        scope.hide_buttons = !scope.hide_buttons;
        return;
    }
    if ($event.key === 'i') {
        scope.hide_interfaces = !scope.hide_interfaces;
        return;
    }
};


_Start.prototype.start = function (controller) {

    controller.changeState(Ready);

};



_Scale.prototype.timeout = function (controller) {

    controller.changeState(Ready);

};


_Scale.prototype.onMouseWheel = function (controller, event, delta) {
      var new_scale = Math.max(0.1, Math.min(10, (controller.scope.current_scale + delta / 100)));
      var new_panX = controller.scope.mouseX - new_scale * ((controller.scope.mouseX - controller.scope.panX) / controller.scope.current_scale);
      var new_panY = controller.scope.mouseY - new_scale * ((controller.scope.mouseY - controller.scope.panY) / controller.scope.current_scale);
      controller.scope.updateScaledXY();
      controller.scope.current_scale = new_scale;
      controller.scope.panX = new_panX;
      controller.scope.panY = new_panY;
      controller.scope.updatePanAndScale();
      controller.changeState(Ready);
};


_Pressed.prototype.onMouseUp = function (controller) {

    controller.changeState(Ready);

};

_Pressed.prototype.onMouseMove = function (controller) {

    controller.changeState(Pan);
    controller.state.onMouseMove(controller);
};


_Pan.prototype.onMouseMove = function (controller) {

    controller.scope.panX = (controller.scope.mouseX - controller.scope.pressedX) + controller.scope.lastPanX;
    controller.scope.panY = (controller.scope.mouseY - controller.scope.pressedY) + controller.scope.lastPanY;
    controller.scope.updateScaledXY();
    controller.scope.updatePanAndScale();
};


_Pan.prototype.onMouseUp = function (controller) {

    controller.changeState(Ready);

};

