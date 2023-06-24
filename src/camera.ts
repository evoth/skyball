import * as THREE from "three";

export default class Camera {
  ballcam: boolean;
  cameraDistance: number;
  cameraHeight: number;
  cameraOffset: number;

  constructor(
    cameraDistance: number,
    cameraHeight: number,
    cameraOffset: number,
    ballcam: boolean = true
  ) {
    this.cameraDistance = cameraDistance;
    this.cameraHeight = cameraHeight;
    this.cameraOffset = cameraOffset;
    this.ballcam = ballcam;
  }

  updateCamera(graphics: any, state: any) {
    if (this.ballcam) {
      const b = new THREE.Vector3(...state.ballPos);
      const c = new THREE.Vector3(...state.carPos);
      const d = new THREE.Vector3(...state.carPos);
      d.sub(b);
      d.normalize();
      d.multiplyScalar(this.cameraDistance);
      graphics.camera.position.set(
        c.x + d.x,
        c.y + d.y / 4 + this.cameraHeight,
        c.z + d.z
      );
      graphics.camera.lookAt(b);
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
