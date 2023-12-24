import factory from "../external/RocketSim.js";

export default class Simulation {
  sim: any;

  private constructor(sim: any) {
    this.sim = sim;
  }

  static async init() {
    return new Simulation(await factory());
  }
}
