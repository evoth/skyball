import * as THREE from "three";

import Graphics from "./graphics";

export default class Camera {
  ballcam: boolean;
  cameraDistance: number;
  cameraHeight: number;
  cameraAngle: number;
  cameraOffset: number;

  constructor(
    cameraDistance: number,
    cameraHeight: number,
    cameraAngle: number,
    cameraOffset: number,
    ballcam: boolean = true
  ) {
    this.cameraDistance = cameraDistance;
    this.cameraHeight = cameraHeight;
    this.cameraAngle = cameraAngle;
    this.cameraOffset = cameraOffset;
    this.ballcam = ballcam;
  }

  updateCamera(graphics: Graphics, state: any) {
    if (this.ballcam) {
      const b = new THREE.Vector3(...state.ballPos);
      const c = new THREE.Vector3(...state.carPos);
      c.y += this.cameraHeight;
      const d = c.clone();
      d.sub(b);
      d.normalize();
      let hyp = Math.sqrt(d.x * d.x + d.z * d.z);
      let angle = Math.atan(-d.y / hyp);
      const snap = Math.tanh((Math.abs(angle) / Math.PI) * 8);
      d.y *= snap;
      d.multiplyScalar(this.cameraDistance);
      graphics.camera.position.set(
        c.x + d.x,
        Math.max(c.y + d.y, 0),
        c.z + d.z
      );
      graphics.camera.lookAt(b);
      graphics.camera.rotation.reorder("YZX");
      graphics.camera.rotation.x *= snap;
      graphics.camera.rotation.x += (this.cameraAngle / 180) * Math.PI;
    } else {
      const d = new THREE.Vector3(-this.cameraDistance, 0, 0);
      d.applyEuler(new THREE.Euler(0, -state.carAng[1], 0, "YZX"));
      graphics.camera.position.set(
        state.carPos[0] + d.x,
        state.carPos[1] + this.cameraHeight,
        state.carPos[2] + d.z
      );
      graphics.camera.lookAt(
        new THREE.Vector3(
          state.carPos[0],
          state.carPos[1] + this.cameraOffset,
          state.carPos[2]
        )
      );
    }
  }
}
