// TODO: Add logic for multiple controllers

export default class Controls {
  bindings: Bindings;
  gamepad?: Gamepad;
  state?: ControlsState;
  keys: { [index: string]: boolean } = {};

  constructor(bindings: Bindings) {
    this.bindings = bindings;

    const that = this;

    function keyup(e: KeyboardEvent) {
      that.keys[e.code] = false;
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    function keydown(e: KeyboardEvent) {
      that.keys[e.code] = true;
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);

    function connecthandler(e: GamepadEvent) {
      that.gamepad = e.gamepad;
    }
    function disconnecthandler(e: GamepadEvent) {
      that.gamepad = undefined;
    }

    window.addEventListener("gamepadconnected", connecthandler);
    window.addEventListener("gamepaddisconnected", disconnecthandler);
  }

  scanGamepads() {
    const gamepads = navigator.getGamepads();
    for (const gamepad of gamepads) {
      if (gamepad) {
        this.gamepad = gamepad;
        return;
      }
    }
    this.gamepad = undefined;
  }

  updateState() {
    const that = this;

    function combinedValue(
      positiveInputs: Input[] = [],
      negativeInputs: Input[] = []
    ): number {
      let value = 0;
      for (const input of positiveInputs) {
        value += input.getStatus(that).value;
      }
      for (const input of negativeInputs) {
        value -= input.getStatus(that).value;
      }
      value = Math.max(-1, Math.min(1, value));
      return value;
    }

    const throttle = combinedValue(this.bindings.forward, this.bindings.back);
    const steer = combinedValue(this.bindings.right, this.bindings.left);
    const pitch = combinedValue(
      this.bindings.pitchBack,
      this.bindings.pitchForward
    );
    let yaw = combinedValue(this.bindings.yawRight, this.bindings.yawLeft);
    let roll = combinedValue(this.bindings.rollRight, this.bindings.rollLeft);
    let roll2 = combinedValue(this.bindings.roll);
    if (roll2 != 0) {
      roll = roll2 * yaw;
      yaw *= 1 - roll2;
    }

    const boost = Boolean(combinedValue(this.bindings.boost));
    const jump = Boolean(combinedValue(this.bindings.jump));
    const handbrake = Boolean(combinedValue(this.bindings.handbrake));

    this.state = {
      throttle,
      steer,
      pitch,
      yaw,
      roll,
      boost,
      jump,
      handbrake,
    };
  }
}

// Range for numbers is -1 to 1
type ControlsState = {
  throttle: number;
  steer: number;
  pitch: number;
  yaw: number;
  roll: number;
  boost: boolean;
  jump: boolean;
  handbrake: boolean;
};

type Bindings = {
  forward?: Input[];
  back?: Input[];
  left?: Input[];
  right?: Input[];
  jump?: Input[];
  boost?: Input[];
  handbrake?: Input[];
  pitchForward?: Input[];
  pitchBack?: Input[];
  yawLeft?: Input[];
  yawRight?: Input[];
  rollLeft?: Input[];
  rollRight?: Input[];
  roll?: Input[];
  ballcam?: Input[];
  reset?: Input[];
};

type Status = {
  value: number;
  changed: boolean;
};

abstract class Input {
  oldValue?: number;

  abstract getValue(controls: Controls): number;

  // TODO: Fix any problems arising from calling this >1 time per frame
  getStatus(controls: Controls): Status {
    const value = this.getValue(controls);
    const ret = { value: value, changed: value !== this.oldValue };
    this.oldValue = value;
    return ret;
  }
}

export class ButtonInput extends Input {
  index: Button;

  constructor(index: Button) {
    super();
    this.index = index;
  }

  getValue(controls: Controls) {
    if (!controls.gamepad) return 0;
    const button = controls.gamepad.buttons[this.index];
    return Math.max(button.value, Number(button.pressed));
  }
}

export class AxisInput extends Input {
  index: Axis;

  constructor(index: Axis) {
    super();
    this.index = index;
  }

  getValue(controls: Controls) {
    if (!controls.gamepad) return 0;
    return controls.gamepad.axes[this.index];
  }
}

export class KeyInput extends Input {
  index: Key;

  constructor(index: Key) {
    super();
    this.index = index;
  }

  getValue(controls: Controls) {
    if (!(this.index in controls.keys)) {
      return 0;
    }
    return Number(controls.keys[this.index]);
  }
}

// https://w3c.github.io/gamepad/#remapping
export enum Button {
  RDown = 0,
  RRight = 1,
  RLeft = 2,
  RUp = 3,
  LBumper = 4,
  RBumper = 5,
  LTrigger = 6,
  RTrigger = 7,
  LMenu = 8,
  RMenu = 9,
  LStick = 10,
  RStick = 11,
  LUp = 12,
  LDown = 13,
  LLeft = 14,
  LRight = 15,
  Menu = 16,
}

export enum Axis {
  LHorizontal = 0,
  LVertical = 1,
  RHorizontal = 2,
  RVertical = 3,
}

export enum Key {
  Digit1 = "Digit1",
  Digit2 = "Digit2",
  Digit3 = "Digit3",
  Digit4 = "Digit4",
  Digit5 = "Digit5",
  Digit6 = "Digit6",
  Digit7 = "Digit7",
  Digit8 = "Digit8",
  Digit9 = "Digit9",
  Digit0 = "Digit0",
  KeyA = "KeyA",
  KeyB = "KeyB",
  KeyC = "KeyC",
  KeyD = "KeyD",
  KeyE = "KeyE",
  KeyF = "KeyF",
  KeyG = "KeyG",
  KeyH = "KeyH",
  KeyI = "KeyI",
  KeyJ = "KeyJ",
  KeyK = "KeyK",
  KeyL = "KeyL",
  KeyM = "KeyM",
  KeyN = "KeyN",
  KeyO = "KeyO",
  KeyP = "KeyP",
  KeyQ = "KeyQ",
  KeyR = "KeyR",
  KeyS = "KeyS",
  KeyT = "KeyT",
  KeyU = "KeyU",
  KeyV = "KeyV",
  KeyW = "KeyW",
  KeyX = "KeyX",
  KeyY = "KeyY",
  KeyZ = "KeyZ",
  Comma = "Comma",
  Period = "Period",
  Semicolon = "Semicolon",
  Quote = "Quote",
  BracketLeft = "BracketLeft",
  BracketRight = "BracketRight",
  Backquote = "Backquote",
  Backslash = "Backslash",
  Minus = "Minus",
  Equal = "Equal",
  IntlRo = "IntlRo",
  IntlYen = "IntlYen",
  AltLeft = "AltLeft",
  AltRight = "AltRight",
  CapsLock = "CapsLock",
  ControlLeft = "ControlLeft",
  ControlRight = "ControlRight",
  MetaLeft = "MetaLeft",
  MetaRight = "MetaRight",
  ShiftLeft = "ShiftLeft",
  ShiftRight = "ShiftRight",
  ContextMenu = "ContextMenu",
  Enter = "Enter",
  Space = "Space",
  Tab = "Tab",
  Delete = "Delete",
  End = "End",
  Help = "Help",
  Home = "Home",
  Insert = "Insert",
  PageDown = "PageDown",
  PageUp = "PageUp",
  ArrowDown = "ArrowDown",
  ArrowLeft = "ArrowLeft",
  ArrowRight = "ArrowRight",
  ArrowUp = "ArrowUp",
  Escape = "Escape",
  PrintScreen = "PrintScreen",
  ScrollLock = "ScrollLock",
  Pause = "Pause",
  F1 = "F1",
  F2 = "F2",
  F3 = "F3",
  F4 = "F4",
  F5 = "F5",
  F6 = "F6",
  F7 = "F7",
  F8 = "F8",
  F9 = "F9",
  F10 = "F10",
  F11 = "F11",
  F12 = "F12",
  F13 = "F13",
  F14 = "F14",
  F15 = "F15",
  F16 = "F16",
  F17 = "F17",
  F18 = "F18",
  F19 = "F19",
  F20 = "F20",
  F21 = "F21",
  F22 = "F22",
  F23 = "F23",
  F24 = "F24",
  NumLock = "NumLock",
  Numpad0 = "Numpad0",
  Numpad1 = "Numpad1",
  Numpad2 = "Numpad2",
  Numpad3 = "Numpad3",
  Numpad4 = "Numpad4",
  Numpad5 = "Numpad5",
  Numpad6 = "Numpad6",
  Numpad7 = "Numpad7",
  Numpad8 = "Numpad8",
  Numpad9 = "Numpad9",
  NumpadAdd = "NumpadAdd",
  NumpadComma = "NumpadComma",
  NumpadDecimal = "NumpadDecimal",
  NumpadDivide = "NumpadDivide",
  NumpadEnter = "NumpadEnter",
  NumpadEqual = "NumpadEqual",
  NumpadMultiply = "NumpadMultiply",
  NumpadSubtract = "NumpadSubtract",
}
