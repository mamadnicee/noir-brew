import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/addons/loaders/GLTFLoader.js";
import { stops, type Zone } from "../data/cameraStops";

export type StationMarker = {
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
  private camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  private targetIndex = 0;
  private currentPos = new THREE.Vector3(5, 3.1, 8);
  private currentLook = new THREE.Vector3(0, 0.8, 0);
  private goalPos = this.currentPos.clone();
  private goalLook = this.currentLook.clone();
  private goalFov = 42;
  private frame = 0;
  private dead = false;
  private lastMove = 0;
  private downX = 0;
  private downY = 0;
  private pointerId = 0;
  private resize = () => this.onResize();

  private stationMarkers: { id: string; label: string; pos: THREE.Vector3 }[] = [
    { id: "core", label: "Extraction Core", pos: new THREE.Vector3(0, 0.8, 0) },
    { id: "bloom", label: "Bloom Chamber", pos: new THREE.Vector3(1.2, 0.4, 0.8) },
    { id: "thermal", label: "Thermal Loop", pos: new THREE.Vector3(-1.1, 1.2, -0.6) },
  ];

  constructor(
    private host: HTMLElement,
    private onZoneChange: (zone: Zone) => void,
    private onError: () => void,
    private onMarkersUpdate?: (markers: StationMarker[]) => void
  ) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.domElement.className = "scene-canvas";
    this.renderer.domElement.setAttribute(
      "aria-label",
      "Interactive 3D coffee sculpture. Click, swipe, or use arrow keys/wheel to orbit between sections."
    );
    host.prepend(this.renderer.domElement);

    this.scene.background = null;
    this.scene.add(new THREE.HemisphereLight(0xf3e9dc, 0x28140f, 2.2));

    const key = new THREE.DirectionalLight(0xffd4a8, 3.2);
    key.position.set(4, 7, 5);
    this.scene.add(key);

    const fill = new THREE.PointLight(0xc08552, 22, 18);
    fill.position.set(-5, 2, 3);
    this.scene.add(fill);

    const rim = new THREE.DirectionalLight(0x895737, 2.5);
    rim.position.set(1, 4, -6);
    this.scene.add(rim);

    this.camera.position.copy(this.currentPos);
    this.camera.lookAt(this.currentLook);

    this.bind();
    this.onResize();
    addEventListener("resize", this.resize);
    this.load();
    this.animate();
  }

  private bind() {
    const c = this.renderer.domElement;
    c.addEventListener("click", this.click);
    c.addEventListener("wheel", this.wheel, { passive: false });
    c.addEventListener("pointerdown", this.pointerDown);
    c.addEventListener("pointerup", this.pointerUp);
    document.addEventListener("keydown", this.key);
  }

  private unbind() {
    const c = this.renderer.domElement;
    c.removeEventListener("click", this.click);
    c.removeEventListener("wheel", this.wheel);
    c.removeEventListener("pointerdown", this.pointerDown);
    c.removeEventListener("pointerup", this.pointerUp);
    document.removeEventListener("keydown", this.key);
  }

  private click = (e: MouseEvent) => {
    if (e.detail > 0) this.next();
  };

  private wheel = (e: WheelEvent) => {
    if (Math.abs(e.deltaY) < 12 || Date.now() - this.lastMove < 750) return;
    e.preventDefault();
    this.move(e.deltaY > 0 ? 1 : -1);
  };

  private pointerDown = (e: PointerEvent) => {
    this.downX = e.clientX;
    this.downY = e.clientY;
    this.pointerId = e.pointerId;
  };

  private pointerUp = (e: PointerEvent) => {
    if (e.pointerId !== this.pointerId) return;
    const dx = e.clientX - this.downX;
    const dy = e.clientY - this.downY;
    if (Math.abs(dx) > 45 || Math.abs(dy) > 45) {
      if (Date.now() - this.lastMove > 750) {
        this.move((Math.abs(dx) > Math.abs(dy) ? dx : -dy) > 0 ? 1 : -1);
      }
    }
  };

  private key = (e: KeyboardEvent) => {
    if ((e.target as HTMLElement)?.matches("input,textarea,select,[contenteditable=true]")) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      this.next();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      this.previous();
    } else if (e.key === "Home") {
      this.goTo("opening");
    } else if (e.key === "End") {
      this.goTo("visit");
    }
  };

  private move(n: number) {
    this.lastMove = Date.now();
    this.goTo(stops[(this.targetIndex + n + stops.length) % stops.length].id);
  }

  next() {
    this.move(1);
  }

  previous() {
    this.move(-1);
  }

  goTo(zone: Zone) {
    const i = stops.findIndex((s) => s.id === zone);
    if (i < 0) return;
    this.targetIndex = i;
    const s = stops[i];
    this.goalPos.set(...s.position);
    this.goalLook.set(...s.target);
    this.goalFov = s.fov;
    this.camera.updateProjectionMatrix();
    this.onZoneChange(zone);
  }

  private load() {
    new GLTFLoader().load(
      `${import.meta.env.BASE_URL}models/clifford.glb`,
      (g: GLTF) => {
        if (this.dead) return;
        const model = g.scene;
        model.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(model);
        if (!Number.isFinite(box.getCenter(new THREE.Vector3()).x)) {
          this.onError();
          return;
        }
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const scale = 3.2 / Math.max(size.x, size.y, size.z, 0.001);
        model.position.sub(center);
        model.scale.setScalar(scale);
        model.position.y += 0.15;
        this.scene.add(model);
      },
      undefined,
      () => {
        if (!this.dead) this.onError();
      }
    );
  }

  private onResize() {
    const w = this.host.clientWidth || innerWidth;
    const h = this.host.clientHeight || innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  private animate = () => {
    if (this.dead) return;
    this.frame = requestAnimationFrame(this.animate);
    this.currentPos.lerp(this.goalPos, 0.035);
    this.currentLook.lerp(this.goalLook, 0.035);
    this.camera.position.copy(this.currentPos);
    this.camera.lookAt(this.currentLook);
    this.camera.fov += (this.goalFov - this.camera.fov) * 0.035;
    this.camera.updateProjectionMatrix();
    this.renderer.render(this.scene, this.camera);

    if (this.onMarkersUpdate) {
      const w = this.host.clientWidth || innerWidth;
      const h = this.host.clientHeight || innerHeight;
      const v = new THREE.Vector3();
      const updated: StationMarker[] = this.stationMarkers.map((m) => {
        v.copy(m.pos);
        v.project(this.camera);
        const isFacing = v.z < 1;
        const x = ((v.x + 1) * w) / 2;
        const y = ((-v.y + 1) * h) / 2;
        return {
          id: m.id,
          label: m.label,
          worldPos: [m.pos.x, m.pos.y, m.pos.z],
          screenX: x,
          screenY: y,
          visible: isFacing && x >= 0 && x <= w && y >= 0 && y <= h,
        };
      });
      this.onMarkersUpdate(updated);
    }
  };

  dispose() {
    this.dead = true;
    cancelAnimationFrame(this.frame);
    removeEventListener("resize", this.resize);
    this.unbind();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
