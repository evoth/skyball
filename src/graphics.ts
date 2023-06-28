import * as THREE from "three";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";

export class Shape {
  mesh: THREE.Object3D;
  scene: THREE.Scene;

  static materialBall = new THREE.MeshPhongMaterial({
    color: 0xfca400,
    wireframe: true,
  });
  static materialCar = new THREE.MeshPhongMaterial({
    color: 0xfca400,
  });

  update(
    pos: THREE.Vector3,
    ang: THREE.Vector3 = new THREE.Vector3(),
    offset: THREE.Vector3 = new THREE.Vector3()
  ) {
    if (!this.mesh) return;
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
    material: THREE.Material = Shape.materialCar
  ) {
    super();
    const shape = new THREE.BoxGeometry(size.x, size.y, size.z, 1, 1, 1);
    this.mesh = new THREE.Mesh(shape, material);
    scene.add(this.mesh);
  }
}

export class Sphere extends Shape {
  constructor(
    scene: THREE.Scene,
    radius: number,
    material: THREE.Material = Shape.materialBall
  ) {
    super();
    const shape = new THREE.SphereGeometry(radius);
    this.mesh = new THREE.Mesh(shape, material);
    scene.add(this.mesh);
  }
}

export class Cylinder extends Shape {
  constructor(
    scene: THREE.Scene,
    radius: number,
    height: number,
    material: THREE.Material = Shape.materialCar
  ) {
    super();
    const shape = new THREE.CylinderGeometry(radius, radius, height);
    this.mesh = new THREE.Mesh(shape, material);
    scene.add(this.mesh);
  }
}

export class Model extends Shape {
  constructor(
    scene: THREE.Scene,
    path: string,
    onLoad?: (mesh: THREE.Object3D) => void
  ) {
    super();
    const that = this;
    const loader = new GLTFLoader();
    loader.load(path, function (gltf) {
      that.mesh = gltf.scene;
      scene.add(that.mesh);
      onLoad?.(that.mesh);
    });
  }
}

export default class Graphics {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  clock = new THREE.Clock();

  constructor() {
    this.initScene();
  }

  initScene() {
    const container = document.getElementById("container");

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.2,
      100000
    );

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      logarithmicDepthBuffer: true,
    });
    this.renderer.setClearColor(0xbfd1e5);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    var ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);

    var dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 10, 5);
    this.scene.add(dirLight);

    if (container !== null) {
      container.innerHTML = "";
      container.appendChild(this.renderer.domElement);
    }

    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
