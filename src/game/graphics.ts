import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import fragmentShader from "../shaders/fragment.glsl";
import vertexShader from "../shaders/vertex.glsl";

export default class Graphics {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  clock: THREE.Clock;
  shaderMaterial: THREE.ShaderMaterial;
  box: Box;
  light: THREE.DirectionalLight;

  constructor(container: HTMLElement) {
    this.clock = new THREE.Clock();

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.2,
      100000
    );
    this.camera.position.set(0, 0, 5);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      //logarithmicDepthBuffer: true,
    });
    this.renderer.setClearColor(0xbfd1e5);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    const orbit = new OrbitControls(this.camera, this.renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);

    this.light = new THREE.DirectionalLight(0xffffff, 1);
    this.light.position.set(10, 10, 5);
    this.scene.add(this.light);

    this.shaderMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
      uniforms: {
        time: {
          value: 0,
        },
        camPos: {
          value: new THREE.Vector3(),
        },
        lightPos: {
          value: new THREE.Vector3(),
        },
        resolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight).multiplyScalar(window.devicePixelRatio),
        }
      },
    });
    this.box = new Box(
      this.scene,
      new THREE.Vector3(3, 3, 3),
      this.shaderMaterial
    );

    const box2 = new Box(
      this.scene,
      new THREE.Vector3(2, 2, 2),
      new THREE.MeshPhongMaterial({
        color: 0xfca400,
      })
    );
    box2.update(new THREE.Vector3(-5, 0, 0));

    if (container !== null) {
      container.innerHTML = "";
      container.appendChild(this.renderer.domElement);
    }

    window.addEventListener("resize", () => {
      this.shaderMaterial.uniforms.resolution.value = new THREE.Vector2(window.innerWidth, window.innerHeight).multiplyScalar(window.devicePixelRatio);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  render() {
    this.shaderMaterial.uniforms.time.value = this.clock.getElapsedTime();
    let v = this.camera.position.clone();
    this.box.mesh.worldToLocal(v);
    this.shaderMaterial.uniforms.camPos.value.copy(v);
    v = this.light.position.clone();
    this.box.mesh.worldToLocal(v);
    this.shaderMaterial.uniforms.lightPos.value.copy(v);
    this.renderer.render(this.scene, this.camera);
  }
}

export class Shape {
  scene: THREE.Scene;
  mesh: THREE.Object3D;

  constructor(scene: THREE.Scene, mesh: THREE.Object3D) {
    this.scene = scene;
    this.mesh = mesh;
    this.scene.add(this.mesh);
  }

  update(
    pos: THREE.Vector3,
    ang: THREE.Vector3 = new THREE.Vector3(),
    offset: THREE.Vector3 = new THREE.Vector3()
  ) {
    const rotation = new THREE.Euler(ang.x, -ang.y, ang.z, "YZX");
    const position = new THREE.Vector3();
    position.copy(offset);
    position.applyEuler(rotation);
    position.add(pos);
    this.mesh.position.copy(position);
    this.mesh.setRotationFromEuler(rotation);
  }
}

export class Box extends Shape {
  constructor(
    scene: THREE.Scene,
    size: THREE.Vector3,
    material: THREE.Material
  ) {
    const shape = new THREE.BoxGeometry(size.x, size.y, size.z, 1, 1, 1);
    const mesh = new THREE.Mesh(shape, material);
    super(scene, mesh);
  }
}

export class Sphere extends Shape {
  constructor(scene: THREE.Scene, radius: number, material: THREE.Material) {
    const shape = new THREE.SphereGeometry(radius);
    const mesh = new THREE.Mesh(shape, material);
    super(scene, mesh);
  }
}

export class Cylinder extends Shape {
  constructor(
    scene: THREE.Scene,
    radius: number,
    height: number,
    material: THREE.Material
  ) {
    const shape = new THREE.CylinderGeometry(radius, radius, height);
    const mesh = new THREE.Mesh(shape, material);
    super(scene, mesh);
  }
}
