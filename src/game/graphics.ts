import * as THREE from "three";

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

export default class Graphics {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;

  constructor(container: HTMLElement) {
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

    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
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
