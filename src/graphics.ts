import * as THREE from "three";

import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export class Shape {
  mesh: THREE.Mesh;
  scene: THREE.Scene;
  static materialBall = new THREE.MeshPhongMaterial({
    color: 0xfca400,
    wireframe: true,
  });
  static materialCar = new THREE.MeshPhongMaterial({
    color: 0xfca400,
  });

  update(pos: THREE.Vector3, ang: THREE.Vector3 = new THREE.Vector3()) {
    this.mesh.position.copy(pos);
    this.mesh.setRotationFromEuler(
      new THREE.Euler(ang.x, -ang.y, ang.z, "YZX")
    );
  }
}

export class Box extends Shape {
  constructor(
    size: THREE.Vector3,
    material: THREE.Material = Shape.materialCar
  ) {
    super();
    const shape = new THREE.BoxGeometry(size.x, size.y, size.z, 1, 1, 1);
    this.mesh = new THREE.Mesh(shape, material);
  }
}

export class Sphere extends Shape {
  constructor(radius: number, material: THREE.Material = Shape.materialBall) {
    super();
    const shape = new THREE.SphereGeometry(radius);
    this.mesh = new THREE.Mesh(shape, material);
  }
}

export default class Graphics {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  clock = new THREE.Clock();

  constructor() {
    this.initScene();
    this.loadArena();
  }

  initScene() {
    const container = document.getElementById("container");

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      60,
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

  loadArena() {
    const materialWall = new THREE.MeshStandardMaterial({
      color: 0x6fe396,
      wireframe: true,
    });

    // instantiate a loader
    const loader = new OBJLoader();
    const that = this;
    // load a resource
    loader.load(
      // resource URL
      "pitch.obj",
      // called when resource is loaded
      function (object) {
        object.rotateX(-Math.PI / 2);
        object.rotateZ(Math.PI / 2);
        object.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            child.material = materialWall;
          }
        });
        that.scene.add(object);
      },
      // called when loading is in progresses
      function (xhr) {
        console.log("Loading collision mesh model...");
      },
      // called when loading has errors
      function (error) {
        console.log("An error happened", error.message);
      }
    );
  }

  addShape(shape: Shape) {
    this.scene.add(shape.mesh);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
