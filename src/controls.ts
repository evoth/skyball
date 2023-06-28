// TODO: Add logic for multiple controllers

export default class Controls {
  keyboardControls: KeyboardControls;
  gamepadControls: GamepadControls;
  gamepad?: Gamepad;
  state?: ControlsState;
  keys: { [index: string]: boolean } = {};

  constructor(
    keyboardControls: KeyboardControls,
    gamepadControls: GamepadControls
  ) {
    this.keyboardControls = keyboardControls;
    this.gamepadControls = gamepadControls;

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

    function getKeyboardValue(key?: Key): number {
      if (!key) {
        return 0;
      }
      if (!(key in that.keys)) {
        return 0;
      }
      return Number(that.keys[key]);
    }

    function getGamepadValue(input?: Input): number {
      if (!input || !that.gamepad) {
        return 0;
      }
      if (input.isAxis) {
        return that.gamepad.axes[input.index];
      } else {
        const button = that.gamepad.buttons[input.index];
        return Math.max(button.value, Number(button.pressed));
      }
    }

    // TODO: FIND A BETTER WAY TO DO THIS; it's quite atrocious atm
    function combinedValue(
      keyPositive?: Key,
      keyNegative?: Key,
      inputPositive?: Input,
      inputNegative?: Input
    ): number {
      let value = getKeyboardValue(keyPositive) - getKeyboardValue(keyNegative);
      value += getGamepadValue(inputPositive) - getGamepadValue(inputNegative);
      value = Math.max(-1, Math.min(1, value));
      return value;
    }

    const throttle = combinedValue(
      this.keyboardControls.forward,
      this.keyboardControls.back,
      this.gamepadControls.forward,
      this.gamepadControls.back
    );
    const steer = combinedValue(
      this.keyboardControls.right,
      this.keyboardControls.left,
      this.gamepadControls.right,
      this.gamepadControls.left
    );
    const pitch = combinedValue(
      this.keyboardControls.pitchBack,
      this.keyboardControls.pitchForward,
      this.gamepadControls.pitchBack,
      this.gamepadControls.pitchForward
    );

    let yaw = combinedValue(
      this.keyboardControls.yawRight,
      this.keyboardControls.yawLeft,
      this.gamepadControls.yawRight,
      this.gamepadControls.yawLeft
    );

    let roll = combinedValue(
      this.keyboardControls.rollRight,
      this.keyboardControls.rollLeft,
      this.gamepadControls.rollRight,
      this.gamepadControls.rollLeft
    );
    let roll2 = Math.min(
      1,
      getKeyboardValue(this.keyboardControls.roll) +
        getGamepadValue(this.gamepadControls.roll)
    );
    if (roll2 != 0) {
      roll = roll2 * yaw;
      yaw *= 1 - roll2;
    }

    const boost = Boolean(
      combinedValue(
        this.keyboardControls.boost,
        undefined,
        this.gamepadControls.boost,
        undefined
      )
    );
    const jump = Boolean(
      combinedValue(
        this.keyboardControls.jump,
        undefined,
        this.gamepadControls.jump,
        undefined
      )
    );
    const handbrake = Boolean(
      combinedValue(
        this.keyboardControls.handbrake,
        undefined,
        this.gamepadControls.handbrake,
        undefined
      )
    );
    const ballcam = Boolean(
      combinedValue(
        this.keyboardControls.ballcam,
        undefined,
        this.gamepadControls.ballcam,
        undefined
      )
    );
    const reset = Boolean(
      combinedValue(
        this.keyboardControls.reset,
        undefined,
        this.gamepadControls.reset,
        undefined
      )
    );

    this.state = {
      throttle: {
        value: throttle,
        changed: !this.state || throttle != this.state.throttle.value,
      },
      steer: {
        value: steer,
        changed: !this.state || steer != this.state.steer.value,
      },
      pitch: {
        value: pitch,
        changed: !this.state || pitch != this.state.pitch.value,
      },
      yaw: {
        value: yaw,
        changed: !this.state || yaw != this.state.yaw.value,
      },
      roll: {
        value: roll,
        changed: !this.state || roll != this.state.roll.value,
      },
      boost: {
        value: boost,
        changed: !this.state || boost != this.state.boost.value,
      },
      jump: {
        value: jump,
        changed: !this.state || jump != this.state.jump.value,
      },
      handbrake: {
        value: handbrake,
        changed: !this.state || handbrake != this.state.handbrake.value,
      },
      ballcam: {
        value: ballcam,
        changed: !this.state || ballcam != this.state.ballcam.value,
      },
      reset: {
        value: reset,
        changed: !this.state || reset != this.state.reset.value,
      },
    };
  }
}

// Range for numbers is -1 to 1
export type ControlsState = {
  throttle: Status<number>;
  steer: Status<number>;
  pitch: Status<number>;
  yaw: Status<number>;
  roll: Status<number>;
  boost: Status<boolean>;
  jump: Status<boolean>;
  handbrake: Status<boolean>;
  ballcam: Status<boolean>;
  reset: Status<boolean>;
};

export type Status<T extends boolean | number> = {
  value: T;
  changed: boolean;
};

export type KeyboardControls = {
  forward?: Key;
  back?: Key;
  left?: Key;
  right?: Key;
  jump?: Key;
  boost?: Key;
  handbrake?: Key;
  pitchForward?: Key;
  pitchBack?: Key;
  yawLeft?: Key;
  yawRight?: Key;
  rollLeft?: Key;
  rollRight?: Key;
  roll?: Key;
  ballcam?: Key;
  reset?: Key;
};

export type GamepadControls = {
  forward?: Input;
  back?: Input;
  left?: Input;
  right?: Input;
  jump?: Input;
  boost?: Input;
  handbrake?: Input;
  pitchForward?: Input;
  pitchBack?: Input;
  yawLeft?: Input;
  yawRight?: Input;
  rollLeft?: Input;
  rollRight?: Input;
  roll?: Input;
  ballcam?: Input;
  reset?: Input;
};

export type Input = {
  isAxis?: boolean;
  index: Button | Axis;
};

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
