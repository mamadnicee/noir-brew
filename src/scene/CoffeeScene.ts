import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { stops, type Zone } from "../data/cameraStops";

export type ProjectedMarker = {
  id: string;
  label: string;
  worldPos: [number, number, number];
  screenX: number;
  screenY: number;
  visible: boolean;
};

export class CoffeeScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(42, 1, 0.01, 100);

  private model: THREE.Object3D | null = null;
  private box = new THREE.Box3();
  private center = new THREE.Vector3();
  private radius = 1;

  private azimuth = 0.45;
  private elevation = 0.2;
  private distance = 4;

  private targetAzimuth = 0.45;
  private targetElevation = 0.2;
  private targetDistance = 4;

  private focus = new THREE.Vector3();
  private focusGoal = new THREE.Vector3();

  private targetIndex = 0;
  private frame = 0;
  private dead = false;

  private downX = 0;
  private downY = 0;
  private dragging = false;
  private lastMove = 0;
  private selected: string | null = null;

  private resize = () => this.onResize();

  private markersCallback:
    | ((markers: ProjectedMarker[]) => void)
    | undefined;

  constructor(
    private host: HTMLElement,
    private onZone: (zone: Zone) => void,
    private onStatus: (status: string) => void,
    callback?: (markers: ProjectedMarker[]) => void
  ) {
    this.markersCallback = callback;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.renderer.domElement.className = "scene-canvas";

    this.renderer.domElement.setAttribute(
      "aria-label",
      "Interactive 3D coffee model. Drag to orbit; scroll or use controls to change zone."
    );

    this.host.prepend(this.renderer.domElement);

    this.scene.background = new THREE.Color("#120e0c");

    this.scene.add(
      new THREE.HemisphereLight(
        0xe7d5c1,
        0x241611,
        1.5
      )
    );

    this.scene.add(
      new THREE.AmbientLight(0xffffff, 0.35)
    );

    const addLight = (
      light: THREE.Light,
      x: number,
      y: number,
      z: number
    ): void => {
      light.position.set(x, y, z);
      this.scene.add(light);
    };

    const keyLight = new THREE.DirectionalLight(
      0xffd9b0,
      3.4
    );

    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);

    addLight(keyLight, 4, 7, 5);

    addLight(
      new THREE.DirectionalLight(0xc49269, 1.7),
      -5,
      2,
      4
    );

    addLight(
      new THREE.DirectionalLight(0x9b6844, 2.4),
      1,
      4,
      -6
    );

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshStandardMaterial({
        color: 0x17110e,
        roughness: 0.92,
      })
    );

    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;

    this.scene.add(floor);

    this.bindEvents();
    this.onResize();

    window.addEventListener("resize", this.resize);

    this.loadModel();
    this.animate();
  }

  private bindEvents(): void {
    const canvas = this.renderer.domElement;

    canvas.addEventListener("wheel", this.wheel, {
      passive: false,
    });

    canvas.addEventListener(
      "pointerdown",
      this.down
    );

    canvas.addEventListener(
      "pointermove",
      this.movePointer
    );

    canvas.addEventListener(
      "pointerup",
      this.up
    );

    canvas.addEventListener(
      "pointercancel",
      this.up
    );

    canvas.addEventListener("click", this.click);
  }

  private wheel = (event: WheelEvent): void => {
    if (
      Math.abs(event.deltaY) < 12 ||
      Date.now() - this.lastMove < 560
    ) {
      return;
    }

    event.preventDefault();

    this.step(event.deltaY > 0 ? 1 : -1);
  };

  private down = (event: PointerEvent): void => {
    this.downX = event.clientX;
    this.downY = event.clientY;
    this.dragging = true;

    this.renderer.domElement.setPointerCapture(
      event.pointerId
    );
  };

  private movePointer = (
    event: PointerEvent
  ): void => {
    if (!this.dragging) {
      return;
    }

    const deltaX = event.clientX - this.downX;
    const deltaY = event.clientY - this.downY;

    this.downX = event.clientX;
    this.downY = event.clientY;

    if (Math.abs(deltaX) + Math.abs(deltaY) > 1) {
      this.targetAzimuth -= deltaX * 0.008;

      this.targetElevation = THREE.MathUtils.clamp(
        this.targetElevation + deltaY * 0.006,
        -1.1,
        1.1
      );
    }
  };

  private up = (event: PointerEvent): void => {
    this.dragging = false;

    try {
      this.renderer.domElement.releasePointerCapture(
        event.pointerId
      );
    } catch {
      // Pointer capture may already be released.
    }
  };

  private click = (event: MouseEvent): void => {
    const distanceFromDown = Math.hypot(
      event.clientX - this.downX,
      event.clientY - this.downY
    );

    if (distanceFromDown > 8) {
      return;
    }

    const rect =
      this.renderer.domElement.getBoundingClientRect();

    const markers = this.getProjectedMarkers();

    let nearest: ProjectedMarker | undefined;
    let nearestDistance = 36;

    for (const marker of markers) {
      const distance = Math.hypot(
        marker.screenX -
          (event.clientX - rect.left),
        marker.screenY -
          (event.clientY - rect.top)
      );

      if (
        marker.visible &&
        distance < nearestDistance
      ) {
        nearest = marker;
        nearestDistance = distance;
      }
    }

    if (nearest) {
      this.selectMarker(nearest.id);
    }
  };

  private step(amount: number): void {
    this.lastMove = Date.now();

    const nextIndex =
      (this.targetIndex +
        amount +
        stops.length) %
      stops.length;

    this.goTo(stops[nextIndex].id);
  }

  public next(): void {
    this.step(1);
  }

  public previous(): void {
    this.step(-1);
  }

  public reset(): void {
    this.goTo("opening");
    this.selected = null;
  }

  public goTo(zone: Zone): void {
    const index = stops.findIndex(
      (stop) => stop.id === zone
    );

    if (index < 0) {
      return;
    }

    this.targetIndex = index;

    const stop = stops[index];

    this.targetAzimuth = stop.camera.azimuth;
    this.targetElevation = stop.camera.elevation;

    this.targetDistance =
      this.radius *
      stop.camera.distance *
      2.7;

    this.focusGoal.set(0, 0, 0);

    this.onZone(zone);
  }

  public selectMarker(id: string): void {
    this.selected = id;

    const marker = stops[
      this.targetIndex
    ].markers.find((item) => item.id === id);

    if (!marker) {
      return;
    }

    const point = new THREE.Vector3(
      ...marker.point
    );

    if (this.model) {
      point.applyMatrix4(
        this.model.matrixWorld
      );
    }

    this.focusGoal.copy(point);
    this.targetDistance = this.radius * 2.7;
  }

  private loadModel(): void {
    const url =
      `${import.meta.env.BASE_URL}` +
      "models/clifford.glb";

    this.onStatus(
      "Loading coffee sculpture..."
    );

    const loader = new GLTFLoader();

    loader.load(
      url,
      (gltf) => {
        if (this.dead) {
          return;
        }

        this.model = gltf.scene;

        this.model.traverse((object) => {
          if (!(object as THREE.Mesh).isMesh) {
            return;
          }

          const mesh = object as THREE.Mesh;

          mesh.castShadow = true;
          mesh.receiveShadow = true;
        });

        this.scene.add(this.model);
        this.model.updateMatrixWorld(true);

        this.box.setFromObject(this.model);

        if (this.box.isEmpty()) {
          this.onStatus(
            "Model loaded but has no measurable geometry."
          );

          return;
        }

        this.box.getCenter(this.center);

        const size = this.box.getSize(
          new THREE.Vector3()
        );

        const largestDimension = Math.max(
          size.x,
          size.y,
          size.z,
          0.001
        );

        const scale = 3.2 / largestDimension;

        this.model.position.set(
          -this.center.x * scale,
          -this.center.y * scale + 0.08,
          -this.center.z * scale
        );

        this.model.scale.setScalar(scale);
        this.model.updateMatrixWorld(true);

        this.box.setFromObject(this.model);

        const sphere =
          this.box.getBoundingSphere(
            new THREE.Sphere()
          );

        this.radius = Math.max(
          sphere.radius,
          0.5
        );

        this.targetDistance =
          this.radius * 2.7;

        this.distance =
          this.targetDistance;

        this.onStatus(
          "Model ready - drag to orbit"
        );
      },
      undefined,
      (error) => {
        console.error(
          "Failed to load model URL:",
          url,
          error
        );

        if (!this.dead) {
          this.onStatus(
            `Model failed to load: ${url}`
          );
        }
      }
    );
  }

  private getProjectedMarkers(): ProjectedMarker[] {
    const width =
      this.host.clientWidth ||
      window.innerWidth;

    const height =
      this.host.clientHeight ||
      window.innerHeight;

    return stops[
      this.targetIndex
    ].markers.map((marker) => {
      const point = new THREE.Vector3(
        ...marker.point
      );

      if (this.model) {
        point.applyMatrix4(
          this.model.matrixWorld
        );
      }

      point.project(this.camera);

      const screenX =
        ((point.x + 1) * width) / 2;

      const screenY =
        ((-point.y + 1) * height) / 2;

      return {
        id: marker.id,
        label: marker.label,
        worldPos: [
          point.x,
          point.y,
          point.z,
        ],
        screenX,
        screenY,
        visible:
          point.z < 1 &&
          point.z > -1 &&
          screenX > 0 &&
          screenX < width &&
          screenY > 0 &&
          screenY < height,
      };
    });
  }

  private animate = (): void => {
    if (this.dead) {
      return;
    }

    this.frame = requestAnimationFrame(
      this.animate
    );

    const ease = 0.055;

    this.azimuth +=
      (this.targetAzimuth - this.azimuth) *
      ease;

    this.elevation +=
      (this.targetElevation - this.elevation) *
      ease;

    this.distance +=
      (this.targetDistance - this.distance) *
      ease;

    this.focus.lerp(
      this.focusGoal,
      ease
    );

    const cosElevation =
      Math.cos(this.elevation);

    this.camera.position.set(
      this.focus.x +
        this.distance *
          cosElevation *
          Math.sin(this.azimuth),

      this.focus.y +
        this.distance *
          Math.sin(this.elevation),

      this.focus.z +
        this.distance *
          cosElevation *
          Math.cos(this.azimuth)
    );

    this.camera.lookAt(this.focus);

    this.renderer.render(
      this.scene,
      this.camera
    );

    this.markersCallback?.(
      this.getProjectedMarkers()
    );
  };

  private onResize(): void {
    const width =
      this.host.clientWidth ||
      window.innerWidth;

    const height =
      this.host.clientHeight ||
      window.innerHeight;

    this.renderer.setSize(
      width,
      height,
      false
    );

    this.camera.aspect =
      width / Math.max(height, 1);

    const fieldOfView =
      THREE.MathUtils.degToRad(
        this.camera.fov
      );

    this.camera.position.setLength(
      Math.max(
        this.radius * 2.7,
        (this.radius /
          Math.sin(fieldOfView / 2)) *
          0.58
      )
    );

    this.camera.updateProjectionMatrix();
  }

  public dispose(): void {
    this.dead = true;

    cancelAnimationFrame(this.frame);

    window.removeEventListener(
      "resize",
      this.resize
    );

    const canvas =
      this.renderer.domElement;

    canvas.removeEventListener(
      "wheel",
      this.wheel
    );

    canvas.removeEventListener(
      "pointerdown",
      this.down
    );

    canvas.removeEventListener(
      "pointermove",
      this.movePointer
    );

    canvas.removeEventListener(
      "pointerup",
      this.up
    );

    canvas.removeEventListener(
      "pointercancel",
      this.up
    );

    canvas.removeEventListener(
      "click",
      this.click
    );

    this.renderer.dispose();
    canvas.remove();
  }
}
