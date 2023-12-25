// TODO: Add logic for multiple controllers

export default class Controls {
  bindings: GameBindings;
  gamepad?: Gamepad;
  keys: { [index: string]: boolean } = {};
  gameInput: InputManager<GameInputState>;

  constructor(bindings: GameBindings) {
    this.bindings = bindings;

    this.gameInput = new InputManager<GameInputState>(
      {
        throttle: new CombinedInput(this.bindings.forward, this.bindings.back),
        steer: new CombinedInput(this.bindings.right, this.bindings.left),
        pitch: new CombinedInput(
          this.bindings.pitchBack,
          this.bindings.pitchForward
        ),
        yaw: new CombinedInput(this.bindings.yawRight, this.bindings.yawLeft),
        roll: new CombinedInput(
          this.bindings.rollRight,
          this.bindings.rollLeft
        ),
        roll2: new CombinedInput(this.bindings.roll),

        boost: new CombinedInput(this.bindings.boost),
        jump: new CombinedInput(this.bindings.jump),
        handbrake: new CombinedInput(this.bindings.handbrake),
      },
      (values) => {
        const state: GameInputState = {
          ...values,
          boost: Boolean(values.boost),
          jump: Boolean(values.jump),
          handbrake: Boolean(values.handbrake),
        };
        if (state.roll2 != 0) {
          state.roll = state.roll2 * state.yaw;
          state.yaw *= 1 - state.roll2;
        }
        return state;
      }
    );

    this.windowEvents();
  }

  windowEvents() {
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

  getState(time: number): [gameInputState: GameInputState] {
    if (!("ongamepadconnected" in window)) {
      this.scanGamepads();
    }
    return [this.gameInput.getState(this, time)];
  }
}

type Mapped<T, U> = {
  [Key in keyof T]: U;
};

class InputManager<T extends { [index: string]: number | boolean }> {
  inputs: Mapped<T, Input>;
  transform: (
    values: Mapped<T, number>,
    oldValues: Mapped<T, number | undefined>
  ) => T;

  constructor(
    inputs: Mapped<T, Input>,
    transform: (
      state: Mapped<T, number>,
      oldValues: Mapped<T, number | undefined>
    ) => T
  ) {
    this.inputs = inputs;
    this.transform = transform;
  }

  getState(controls: Controls, time: number): T {
    const values = {} as Mapped<T, number>;
    const oldValues = {} as Mapped<T, number | undefined>;
    for (const key in this.inputs) {
      [values[key], oldValues[key]] = this.inputs[key].getStatus(
        controls,
        time
      );
    }
    return this.transform(values, oldValues);
  }
}

// Range for numbers is -1 to 1
type GameInputState = {
  throttle: number;
  steer: number;
  pitch: number;
  yaw: number;
  roll: number;
  roll2: number;
  boost: boolean;
  jump: boolean;
  handbrake: boolean;
};

type GameBindings = {
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
};

abstract class Input {
  value?: number;
  oldValue?: number;
  time?: number;
  oldTime?: number;

  abstract getValue(controls: Controls, time: number): number;

  getStatus(
    controls: Controls,
    time: number
  ): [value: number, oldValue?: number] {
    if (this.value === undefined || time != this.time) {
      this.oldValue = this.value;
      this.value = this.getValue(controls, time);
      this.oldTime = this.time;
      this.time = time;
    }
    return [this.value, this.oldValue];
  }
}

class CombinedInput extends Input {
  positiveInputs: Input[];
  negativeInputs: Input[];

  constructor(positiveInputs: Input[] = [], negativeInputs: Input[] = []) {
    super();
    this.positiveInputs = positiveInputs;
    this.negativeInputs = negativeInputs;
  }

  getValue(controls: Controls, time: number): number {
    let value = 0;
    for (const input of this.positiveInputs) {
      value += input.getStatus(controls, time)[0];
    }
    for (const input of this.negativeInputs) {
      value -= input.getStatus(controls, time)[0];
    }
    value = Math.max(-1, Math.min(1, value));
    return value;
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
    return button.value != 0 ? button.value : Number(button.pressed);
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
    if (!(this.index in controls.keys)) return 0;
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
