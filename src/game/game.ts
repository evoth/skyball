import Graphics from "./graphics";
import Simulation from "./simulation";

export default class Game {
  graphics: Graphics;
  sim: Simulation;

  private constructor(container: HTMLElement, sim: Simulation) {
    this.graphics = new Graphics(container);
    this.sim = sim;
    this.loop();
  }

  static async init(container: HTMLElement) {
    return new Game(container, await Simulation.init());
  }

  loop() {
    this.graphics.render();
    requestAnimationFrame(() => this.loop());
  }
}
