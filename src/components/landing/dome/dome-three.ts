import * as THREE from "three";
import { DOME_COLORS, DOME_PARTS, type DomePart } from "./parts";

/**
 * Pure Three.js model of the MRI bore: five layers that explode along the bore axis, a patient
 * table that advances to isocenter, and an RF pulse that sweeps the bore while "scanning".
 * No React in here; dome-scene.tsx owns the DOM, events and the render loop.
 */

export type ScanPhase = "idle" | "advancing" | "scanning" | "returning";

export type DomeInputs = {
  /** 0 assembled, 1 fully exploded. */
  explodeTarget: number;
  /** 0 table out, 1 table at isocenter. */
  tableTarget: number;
  /** Index into DOME_PARTS to highlight, or -1. */
  focus: number;
  /** Pointer position over the stage in [-0.5, 0.5], or null when the pointer is away. */
  pointer: { x: number; y: number } | null;
  /** Page-scroll progress through the hero, 0–1: turns the assembly as the reader scrolls. */
  scroll: number;
  reduceMotion: boolean;
};

export type DomeState = {
  explode: number;
  table: number;
  yaw: number;
  pitch: number;
  highlight: number[];
  scanPhase: ScanPhase;
  /** 0–1 while scanning. */
  scanProgress: number;
};

const SCAN_SECONDS = 3.2;
const TABLE_OUT_Y = 1.95;
const TABLE_IN_Y = 0.05;

function lathe(profile: ReadonlyArray<readonly [number, number]>, segments = 112): THREE.LatheGeometry {
  return new THREE.LatheGeometry(
    profile.map(([r, y]) => new THREE.Vector2(r, y)),
    segments,
  );
}

type Layer = {
  part: DomePart;
  group: THREE.Group;
  materials: THREE.MeshStandardMaterial[];
  anchor: THREE.Object3D;
  baseEmissive: number;
  baseOpacity: number;
};

export class DomeModel {
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  readonly rig = new THREE.Group();
  readonly assembly = new THREE.Group();
  readonly layers: Layer[] = [];
  readonly state: DomeState = {
    explode: 0,
    table: 0,
    yaw: 0,
    pitch: 0,
    highlight: DOME_PARTS.map(() => 0),
    scanPhase: "idle",
    scanProgress: 0,
  };

  private tableGroup = new THREE.Group();
  private pulseRing: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>;
  private rfMaterial: THREE.MeshStandardMaterial;
  private boreLight: THREE.PointLight;
  private scanStart = 0;
  private disposables: Array<{ dispose: () => void }> = [];
  private idleYaw = 0;
  private time = 0;

  constructor() {
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
    this.camera.position.set(5.4, 2.5, 7.2);
    this.camera.lookAt(0, -0.15, 0.3);

    /* ---------- lights ---------- */
    const hemi = new THREE.HemisphereLight(0xffffff, 0x1a1a1f, 1.1);
    const key = new THREE.DirectionalLight(0xffffff, 2.6);
    key.position.set(4, 6, 5);
    const rim = new THREE.DirectionalLight(0xff66c4, 1.4);
    rim.position.set(-5, 2, -4);
    const fill = new THREE.DirectionalLight(0xffffff, 0.8);
    fill.position.set(-3, -2, 6);
    this.boreLight = new THREE.PointLight(DOME_COLORS.pink, 28, 9, 2);
    this.boreLight.position.set(0, 0, 0);
    this.scene.add(hemi, key, rim, fill);

    /* ---------- assembly: axis is local +Y; rotate so it faces the camera (+Z) ---------- */
    this.assembly.rotation.x = Math.PI / 2;
    this.rig.add(this.assembly);
    this.scene.add(this.rig);
    this.assembly.add(this.boreLight);

    const cover = this.buildCover();
    const magnet = this.buildMagnet();
    const gradient = this.buildGradient();
    const rf = this.buildRf();
    const table = this.buildTable();

    const built: Record<DomePart["id"], { group: THREE.Group; materials: THREE.MeshStandardMaterial[]; baseEmissive: number }> = {
      cover,
      magnet,
      gradient,
      rf,
      table,
    };

    for (const part of DOME_PARTS) {
      const b = built[part.id];
      const anchor = new THREE.Object3D();
      anchor.position.set(part.anchor[0], part.anchor[1], part.anchor[2]);
      b.group.add(anchor);
      this.assembly.add(b.group);
      this.layers.push({ part, group: b.group, materials: b.materials, anchor, baseEmissive: b.baseEmissive, baseOpacity: 1 });
    }

    /* ---------- RF pulse ring that sweeps the bore while scanning ---------- */
    const ringGeo = new THREE.TorusGeometry(0.94, 0.012, 8, 96);
    const ringMat = new THREE.MeshBasicMaterial({ color: DOME_COLORS.pink, transparent: true, opacity: 0 });
    this.pulseRing = new THREE.Mesh(ringGeo, ringMat);
    this.pulseRing.rotation.x = Math.PI / 2;
    this.assembly.add(this.pulseRing);
    this.track(ringGeo, ringMat);

    this.rfMaterial = rf.materials[0];
  }

  /* ───────────────────────── geometry ───────────────────────── */

  private track(...items: Array<{ dispose: () => void }>) {
    this.disposables.push(...items);
  }

  private standard(opts: THREE.MeshStandardMaterialParameters): THREE.MeshStandardMaterial {
    const m = new THREE.MeshStandardMaterial(opts);
    this.track(m);
    return m;
  }

  private buildCover() {
    const group = new THREE.Group();
    const mat = this.standard({
      color: DOME_COLORS.cover,
      roughness: 0.42,
      metalness: 0.06,
      side: THREE.DoubleSide,
      emissive: DOME_COLORS.pink,
      emissiveIntensity: 0,
    });
    // Profile (radius, axial): bore liner at the front, rounded dome shoulder, flat back.
    const geo = lathe([
      [0.98, 1.08],
      [1.0, 1.2],
      [1.12, 1.32],
      [1.35, 1.4],
      [1.65, 1.42],
      [1.9, 1.34],
      [2.05, 1.16],
      [2.1, 0.95],
      [2.1, -1.0],
      [2.04, -1.16],
      [1.88, -1.26],
      [1.3, -1.3],
      [0.98, -1.2],
      [0.98, 1.08],
    ]);
    const mesh = new THREE.Mesh(geo, mat);
    group.add(mesh);

    // A thin dark seam ring at the front face, like the real cover split line.
    const seamGeo = new THREE.TorusGeometry(1.52, 0.01, 6, 96);
    const seamMat = this.standard({ color: 0x8a8a94, roughness: 0.6, metalness: 0.3 });
    const seam = new THREE.Mesh(seamGeo, seamMat);
    seam.rotation.x = Math.PI / 2;
    seam.position.y = 1.395;
    group.add(seam);

    this.track(geo, seamGeo);
    return { group, materials: [mat, seamMat], baseEmissive: 0 };
  }

  private buildMagnet() {
    const group = new THREE.Group();
    const mat = this.standard({
      color: DOME_COLORS.magnet,
      roughness: 0.26,
      metalness: 0.88,
      side: THREE.DoubleSide,
      emissive: DOME_COLORS.pink,
      emissiveIntensity: 0,
    });
    const geo = lathe([
      [1.24, 0.92],
      [1.92, 0.92],
      [1.92, -0.92],
      [1.24, -0.92],
      [1.24, 0.92],
    ]);
    group.add(new THREE.Mesh(geo, mat));

    // Cryostat bands: three darker rings around the outside.
    const bandGeo = new THREE.TorusGeometry(1.93, 0.035, 8, 128);
    const bandMat = this.standard({ color: 0x3a3a42, roughness: 0.5, metalness: 0.6 });
    for (const y of [-0.55, 0, 0.55]) {
      const band = new THREE.Mesh(bandGeo, bandMat);
      band.rotation.x = Math.PI / 2;
      band.position.y = y;
      group.add(band);
    }

    // Inner glow ring: the field, suggested.
    const glowGeo = new THREE.TorusGeometry(1.25, 0.03, 8, 128);
    const glowMat = this.standard({
      color: DOME_COLORS.pink,
      emissive: DOME_COLORS.pink,
      emissiveIntensity: 1.6,
      roughness: 0.3,
      metalness: 0.2,
    });
    for (const y of [-0.9, 0.9]) {
      const g = new THREE.Mesh(glowGeo, glowMat);
      g.rotation.x = Math.PI / 2;
      g.position.y = y;
      group.add(g);
    }

    this.track(geo, bandGeo, glowGeo);
    return { group, materials: [mat, bandMat, glowMat], baseEmissive: 0 };
  }

  private buildGradient() {
    const group = new THREE.Group();
    const mat = this.standard({
      color: DOME_COLORS.gradient,
      roughness: 0.5,
      metalness: 0.62,
      side: THREE.DoubleSide,
      emissive: DOME_COLORS.pink,
      emissiveIntensity: 0,
    });
    const geo = lathe([
      [1.07, 0.98],
      [1.19, 0.98],
      [1.19, -0.98],
      [1.07, -0.98],
      [1.07, 0.98],
    ]);
    group.add(new THREE.Mesh(geo, mat));

    // Helical winding around the former: the coil itself.
    const turns = 16;
    const n = turns * 28;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const a = t * turns * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * 1.205, -0.88 + t * 1.76, Math.sin(a) * 1.205));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const helixGeo = new THREE.TubeGeometry(curve, n, 0.018, 6, false);
    const helixMat = this.standard({
      color: DOME_COLORS.helix,
      emissive: DOME_COLORS.pink,
      emissiveIntensity: 0.45,
      roughness: 0.4,
      metalness: 0.35,
    });
    group.add(new THREE.Mesh(helixGeo, helixMat));

    this.track(geo, helixGeo);
    return { group, materials: [mat, helixMat], baseEmissive: 0 };
  }

  private buildRf() {
    const group = new THREE.Group();
    const mat = this.standard({
      color: DOME_COLORS.rf,
      emissive: DOME_COLORS.pink,
      emissiveIntensity: 1.3,
      roughness: 0.35,
      metalness: 0.2,
    });
    // Birdcage: 16 rungs between two end rings.
    const rodGeo = new THREE.CylinderGeometry(0.016, 0.016, 1.84, 8);
    const rungs = 16;
    for (let i = 0; i < rungs; i++) {
      const a = (i / rungs) * Math.PI * 2;
      const rod = new THREE.Mesh(rodGeo, mat);
      rod.position.set(Math.cos(a) * 1.0, 0, Math.sin(a) * 1.0);
      group.add(rod);
    }
    const ringGeo = new THREE.TorusGeometry(1.0, 0.022, 8, 96);
    for (const y of [-0.92, 0.92]) {
      const ring = new THREE.Mesh(ringGeo, mat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = y;
      group.add(ring);
    }
    this.track(rodGeo, ringGeo);
    return { group, materials: [mat], baseEmissive: 1.3 };
  }

  private buildTable() {
    const group = new THREE.Group();

    // Fixed pedestal outside the bore (local +Z is world down).
    const pedGeo = new THREE.BoxGeometry(0.62, 1.1, 0.7);
    const pedMat = this.standard({ color: DOME_COLORS.pedestal, roughness: 0.55, metalness: 0.5 });
    const ped = new THREE.Mesh(pedGeo, pedMat);
    ped.position.set(0, 2.05, 0.98);
    group.add(ped);

    // Sliding couch with the patient on it.
    const couchGeo = new THREE.BoxGeometry(0.74, 3.0, 0.07);
    const couchMat = this.standard({ color: DOME_COLORS.table, roughness: 0.6, metalness: 0.45 });
    const couch = new THREE.Mesh(couchGeo, couchMat);
    couch.position.set(0, 0, 0.62);
    this.tableGroup.add(couch);

    const padGeo = new THREE.BoxGeometry(0.66, 2.9, 0.03);
    const padMat = this.standard({ color: 0x33333a, roughness: 0.9, metalness: 0.05 });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.set(0, 0, 0.575);
    this.tableGroup.add(pad);

    const bodyGeo = new THREE.CapsuleGeometry(0.2, 1.2, 6, 20);
    const patientMat = this.standard({ color: DOME_COLORS.patient, roughness: 0.85, metalness: 0 });
    const body = new THREE.Mesh(bodyGeo, patientMat);
    body.position.set(0, 0.25, 0.36);
    this.tableGroup.add(body);

    const headGeo = new THREE.SphereGeometry(0.17, 24, 18);
    const head = new THREE.Mesh(headGeo, patientMat);
    head.position.set(0, -0.78, 0.39);
    this.tableGroup.add(head);

    this.tableGroup.position.y = TABLE_OUT_Y;
    group.add(this.tableGroup);

    this.track(pedGeo, couchGeo, padGeo, bodyGeo, headGeo);
    return { group, materials: [pedMat, couchMat, padMat, patientMat], baseEmissive: 0 };
  }

  /* ───────────────────────── simulation ───────────────────────── */

  startScan(): boolean {
    if (this.state.scanPhase !== "idle") return false;
    this.state.scanPhase = "advancing";
    return true;
  }

  /** Camera framing that keeps the whole dome in view on portrait stages. */
  resize(width: number, height: number) {
    const aspect = Math.max(0.3, width / Math.max(1, height));
    this.camera.aspect = aspect;
    const dist = aspect < 0.85 ? 12.2 : aspect < 1.2 ? 10.4 : 9.4;
    // Portrait stages carry the readouts above the model, so aim a little higher to seat it lower in frame.
    const lookY = aspect < 0.85 ? 0.55 : aspect < 1.2 ? 0.15 : -0.15;
    const dir = new THREE.Vector3(5.4, 2.5, 7.2).normalize();
    this.camera.position.copy(dir.multiplyScalar(dist));
    this.camera.lookAt(0, lookY, 0.3);
    this.camera.updateProjectionMatrix();
  }

  /**
   * Advance the model by `dt` seconds toward the inputs. Returns true when something is still moving,
   * so the caller can keep the render loop alive only while needed.
   */
  update(dt: number, inputs: DomeInputs): boolean {
    const s = this.state;
    const reduce = inputs.reduceMotion;
    this.time += dt;
    const k = (speed: number) => (reduce ? 1 : 1 - Math.exp(-speed * dt));
    let moving = false;

    /* scan state machine */
    if (s.scanPhase === "advancing" && s.table > 0.985) {
      s.scanPhase = "scanning";
      this.scanStart = this.time;
    } else if (s.scanPhase === "scanning") {
      s.scanProgress = Math.min(1, (this.time - this.scanStart) / SCAN_SECONDS);
      if (s.scanProgress >= 1) s.scanPhase = "returning";
      moving = true;
    } else if (s.scanPhase === "returning" && s.table < 0.015) {
      s.scanPhase = "idle";
      s.scanProgress = 0;
    }

    const scanning = s.scanPhase !== "idle";
    const explodeTarget = scanning ? 0 : inputs.explodeTarget;
    const tableTarget =
      s.scanPhase === "advancing" || s.scanPhase === "scanning" ? 1 : s.scanPhase === "returning" ? 0 : inputs.tableTarget;

    /* explode */
    const e0 = s.explode;
    s.explode += (explodeTarget - s.explode) * k(4.5);
    if (Math.abs(s.explode - explodeTarget) < 0.0015) s.explode = explodeTarget;
    if (s.explode !== e0) moving = true;

    /* table */
    const t0 = s.table;
    s.table += (tableTarget - s.table) * k(reduce ? 1 : 2.2);
    if (Math.abs(s.table - tableTarget) < 0.0015) s.table = tableTarget;
    if (s.table !== t0) moving = true;
    this.tableGroup.position.y = TABLE_OUT_Y + (TABLE_IN_Y - TABLE_OUT_Y) * s.table;

    /* orientation: pointer parallax plus a slow idle sway */
    if (!reduce) {
      this.idleYaw = Math.sin(this.time * 0.35) * 0.09;
      moving = true;
    }
    // Scroll turns the bore about a third of a revolution and tips it slightly, on top of pointer parallax.
    const yawTarget = (inputs.pointer ? inputs.pointer.x * 0.55 : 0) + this.idleYaw + inputs.scroll * 1.15;
    const pitchTarget = (inputs.pointer ? -inputs.pointer.y * 0.22 : 0) + inputs.scroll * 0.1;
    s.yaw += (yawTarget - s.yaw) * k(5);
    s.pitch += (pitchTarget - s.pitch) * k(5);
    this.rig.rotation.y = s.yaw;
    this.rig.rotation.x = s.pitch;

    /* layers */
    this.layers.forEach((layer, i) => {
      layer.group.position.y = layer.part.explode * s.explode;
      const want = inputs.focus === -1 ? 0 : inputs.focus === i ? 1 : -1;
      const h0 = s.highlight[i];
      s.highlight[i] += (want - s.highlight[i]) * k(8);
      if (Math.abs(s.highlight[i] - want) < 0.002) s.highlight[i] = want;
      if (s.highlight[i] !== h0) moving = true;
      const h = s.highlight[i];
      const opacity = h < 0 ? 1 + h * 0.78 : 1;
      const boost = h > 0 ? h : 0;
      for (const m of layer.materials) {
        // Only flag transparency while a layer is actually dimmed, so opaque layers keep correct depth sorting.
        m.transparent = opacity < 0.999;
        m.opacity = opacity;
        if (layer.part.id === "rf") {
          m.emissiveIntensity = layer.baseEmissive + boost * 0.9;
        } else if (m.emissive.getHex() === DOME_COLORS.pink && m.color.getHex() !== DOME_COLORS.pink && m.color.getHex() !== DOME_COLORS.helix) {
          m.emissiveIntensity = boost * 0.28;
        }
      }
    });

    /* RF pulse and bore glow while scanning */
    if (s.scanPhase === "scanning") {
      const p = s.scanProgress;
      const sweep = (p * 4) % 1;
      this.pulseRing.position.y = 0.9 - sweep * 1.8;
      this.pulseRing.material.opacity = 0.85 * Math.sin(sweep * Math.PI);
      const pulse = 0.5 + 0.5 * Math.sin(this.time * 22);
      this.rfMaterial.emissiveIntensity = 1.3 + pulse * 1.4;
      this.boreLight.intensity = 28 + pulse * 30;
    } else {
      this.pulseRing.material.opacity += (0 - this.pulseRing.material.opacity) * k(6);
      this.boreLight.intensity += (28 - this.boreLight.intensity) * k(4);
    }

    return moving;
  }

  /** Projects each layer's anchor to normalized stage coordinates (0–1). `visible` is false when behind the camera. */
  projectAnchors(out: Array<{ x: number; y: number; visible: boolean }>) {
    const v = new THREE.Vector3();
    this.layers.forEach((layer, i) => {
      layer.anchor.getWorldPosition(v);
      v.project(this.camera);
      out[i] = { x: v.x * 0.5 + 0.5, y: -v.y * 0.5 + 0.5, visible: v.z < 1 && v.z > -1 };
    });
  }

  dispose() {
    for (const d of this.disposables) d.dispose();
    this.disposables = [];
    this.scene.clear();
  }
}
