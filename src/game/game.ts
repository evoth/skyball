import Controls, {
  Axis,
  AxisInput,
  Button,
  ButtonInput,
  Key,
  KeyInput,
} from "./controls";

import Graphics from "./graphics";
import Simulation from "./simulation";

export default class Game {
  graphics: Graphics;
  sim: Simulation;
  controls: Controls;

  private constructor(container: HTMLElement, sim: Simulation) {
    this.sim = sim;
    this.graphics = new Graphics(container);
    this.controls = new Controls({
      forward: [new KeyInput(Key.KeyP), new ButtonInput(Button.RTrigger)],
      back: [new KeyInput(Key.KeyS), new ButtonInput(Button.LTrigger)],
      left: [new KeyInput(Key.KeyA)],
      right: [new KeyInput(Key.KeyD), new AxisInput(Axis.LHorizontal)],
      jump: [new KeyInput(Key.Space), new ButtonInput(Button.RDown)],
      boost: [new KeyInput(Key.KeyL), new ButtonInput(Button.RBumper)],
      handbrake: [new KeyInput(Key.ShiftLeft), new ButtonInput(Button.LBumper)],
      pitchForward: [new KeyInput(Key.KeyW)],
      pitchBack: [new KeyInput(Key.KeyS), new AxisInput(Axis.LVertical)],
      yawLeft: [new KeyInput(Key.KeyA)],
      yawRight: [new KeyInput(Key.KeyD), new AxisInput(Axis.LHorizontal)],
      rollLeft: [new KeyInput(Key.ShiftLeft), new ButtonInput(Button.RLeft)],
      rollRight: [new KeyInput(Key.Enter), new ButtonInput(Button.RRight)],
      roll: [new ButtonInput(Button.LBumper)],
    });
    this.loop();
  }

  static async init(container: HTMLElement) {
    return new Game(container, await Simulation.init());
  }

  loop() {
    if (!("ongamepadconnected" in window)) {
      this.controls.scanGamepads();
    }
    this.controls.updateState();
    this.graphics.render();
    requestAnimationFrame(() => this.loop());
  }
}
