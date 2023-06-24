import * as THREE from "three";

import Controls, { Axis, Button, Input, Key } from "./controls";
import Graphics, { Box, Sphere } from "./graphics";

import Camera from "./camera";
import factory from "../RocketSim.js";

const RocketSim = await factory();

const game = new RocketSim.Game(
  "collision_meshes",
  RocketSim.CarConfigPreset.OCTANE
);
const graphics = new Graphics();

const carShape: Box = new Box(
  new THREE.Vector3(...game.GetCarConfig().hitboxSize)
);
const carOffset = new THREE.Vector3(...game.GetCarConfig().hitboxPosOffset);
const ballShape: Sphere = new Sphere(RocketSim.BALL_COLLISION_RADIUS_NORMAL);
graphics.addShape(carShape);
graphics.addShape(ballShape);

let gameControls = game.GetControls();

const camera = new Camera(350, 110, 100);

const controls = new Controls(
  {
    forward: Key.KeyP,
    back: Key.KeyS,
    left: Key.KeyA,
    right: Key.KeyD,
    jump: Key.Space,
    boost: Key.KeyL,
    handbrake: Key.ShiftLeft,
    pitchForward: Key.KeyW,
    pitchBack: Key.KeyS,
    yawLeft: Key.KeyA,
    yawRight: Key.KeyD,
    rollLeft: Key.ShiftLeft,
    rollRight: Key.Enter,
    ballcam: Key.Quote,
    reset: Key.KeyE,
  },
  {
    forward: { index: Button.RTrigger },
    back: { index: Button.LTrigger },
    right: { isAxis: true, index: Axis.LHorizontal },
    jump: { index: Button.RDown },
    boost: { index: Button.RBumper },
    handbrake: { index: Button.LBumper },
    pitchBack: { isAxis: true, index: Axis.LVertical },
    yawRight: { isAxis: true, index: Axis.LHorizontal },
    rollLeft: { index: Button.RLeft },
    rollRight: { index: Button.RRight },
    roll: { index: Button.LBumper },
    ballcam: { index: Button.RUp },
    reset: { index: Button.LMenu },
  }
);

// TODO: Add logic for multiple controllers
function connecthandler(e: GamepadEvent) {
  controls.gamepad = e.gamepad;
}
function disconnecthandler(e: GamepadEvent) {
  controls.gamepad = undefined;
}

window.addEventListener("gamepadconnected", connecthandler);
window.addEventListener("gamepaddisconnected", disconnecthandler);

function animate() {
  if (!("ongamepadconnected" in window)) {
    controls.scanGamepads();
  }
  controls.updateState();
  if (controls.state) {
    gameControls = {
      ...gameControls,
      throttle: controls.state.throttle.value,
      steer: controls.state.steer.value,
      pitch: controls.state.pitch.value,
      yaw: controls.state.yaw.value,
      roll: controls.state.roll.value,
      boost: controls.state.boost.value,
      jump: controls.state.jump.value,
      handbrake: controls.state.handbrake.value,
    };
    if (controls.state.ballcam.value && controls.state.ballcam.changed) {
      camera.ballcam = !camera.ballcam;
    }
    if (controls.state.reset.value && controls.state.reset.changed) {
      game.ResetToKickoff();
    }
  }
  game.SetControls(gameControls);
  game.Step(2);
  let state = game.GetState();
  carShape.update(
    new THREE.Vector3(...state.carPos).add(carOffset),
    new THREE.Vector3(...state.carAng)
  );
  ballShape.update(new THREE.Vector3(...state.ballPos));
  camera.updateCamera(graphics, state);
  graphics.render();
  requestAnimationFrame(animate);
}

animate();
