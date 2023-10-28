import * as THREE from "three";

import Controls, { Axis, Button, Input, Key } from "./controls";
import Graphics, { Box, Cylinder, Model, Sphere } from "./graphics";

import Camera from "./camera";
import Socket from "./socket";
import factory from "../RocketSim.js";

const RocketSim = await factory();

const game = new RocketSim.Game(
  "collision_meshes",
  RocketSim.CarConfigPreset.OCTANE
);
const graphics = new Graphics();
const socket = new Socket();

const arenaModel = new Model(
  graphics.scene,
  "assets/models/field.glb",
  function (mesh) {
    mesh.rotateY(Math.PI / 2);
  }
);

const carConfig = game.GetCarConfig();

// const carShape = new Box(
//   graphics.scene,
//   new THREE.Vector3(...carConfig.hitboxSize)
// );
const carModel = new Model(graphics.scene, "assets/models/car.glb");
const carOffset = new THREE.Vector3(...carConfig.hitboxPosOffset);

const ballModel = new Model(graphics.scene, "assets/models/ball.glb");

let gameControls = game.GetControls();

const camera = new Camera(350, 110, -4, 110, 100);

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
      socket.toggle_connect();
    }
  }
  if (socket.isConnected && socket.data) {
    let data = socket.data.data[0];
    const state = {
      carPos: [data.car.loc[0], data.car.loc[2], data.car.loc[1]],
      carAng: [
        (data.car.rot[2] / 32768) * Math.PI,
        (data.car.rot[1] / 32768) * Math.PI,
        (data.car.rot[0] / 32768) * Math.PI,
      ],
      ballPos: [data.ball.loc[0], data.ball.loc[2], data.ball.loc[1]],
      ballAng: [
        (data.ball.rot[2] / 32768) * Math.PI,
        (data.ball.rot[1] / 32768) * Math.PI,
        (data.ball.rot[0] / 32768) * Math.PI,
      ],
    };
    carModel.update(
      new THREE.Vector3(...state.carPos),
      new THREE.Vector3(...state.carAng),
      carOffset
    );
    ballModel.update(
      new THREE.Vector3(...state.ballPos),
      new THREE.Vector3(...state.ballAng)
    );
    camera.cameraDistance = socket.data.settings.distance;
    camera.cameraHeight = socket.data.settings.height;
    camera.cameraAngle = socket.data.settings.pitch;
    camera.cameraFOV = socket.data.settings.fov;
    camera.updateCamera(graphics, state);
  } else {
    game.SetControls(gameControls);
    game.Step(2);
    const state = game.GetState();
    carModel.update(
      new THREE.Vector3(...state.carPos),
      new THREE.Vector3(...state.carAng),
      carOffset
    );
    ballModel.update(
      new THREE.Vector3(...state.ballPos),
      new THREE.Vector3(...state.ballAng)
    );
    camera.updateCamera(graphics, state);
  }
  graphics.render();
  requestAnimationFrame(animate);
}

animate();
