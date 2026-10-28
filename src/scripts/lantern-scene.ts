// Lazy chunk: the only place Three.js is imported. Named imports keep the bundle small.
import {
  AdditiveBlending, AmbientLight, BoxGeometry, CanvasTexture, DirectionalLight, Group, Material, Mesh,
  MeshStandardMaterial, PerspectiveCamera, Raycaster, Scene, SRGBColorSpace, Sprite, SpriteMaterial,
  Vector2, WebGLRenderer,
} from 'three';
import type { BufferGeometry, Object3D, Texture } from 'three';

export interface LanternOptions {
  stage: HTMLElement;
  labels: string[]; // front, right, back, left
  initials: string;
  onPick: (face: number) => void;
}

const SIZE = 1.6;
const IDLE_SPEED = (13 * Math.PI) / 180; // rad per second
const REST_PITCH = 0.28;
// BoxGeometry material order: +x, -x, +y, -y, +z, -z
const MATERIAL_TO_FACE: Record<number, number> = { 4: 0, 0: 1, 5: 2, 1: 3 };
// Yaw that brings face i to the front
const FACE_YAW = [0, -Math.PI / 2, -Math.PI, Math.PI / 2];

function faceTexture(text: string, big: boolean): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(256, 256, 20, 256, 256, 340);
  g.addColorStop(0, '#ffd88a');
  g.addColorStop(0.55, '#c98a2c');
  g.addColorStop(1, '#5a3a0e');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);

  if (text) {
    ctx.strokeStyle = 'rgba(42,26,5,.55)';
    ctx.lineWidth = 3;
    ctx.strokeRect(36, 36, 440, 440);
    ctx.fillStyle = '#2a1a05';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let size = big ? 170 : 110;
    do {
      ctx.font = `700 ${size}px Almendra, Georgia, serif`;
      size -= 4;
    } while (ctx.measureText(text).width > 360 && size > 30);
    ctx.fillText(text, 256, 270);
    // small diamond flourish
    ctx.save();
    ctx.translate(256, big ? 120 : 130);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-9, -9, 18, 18);
    ctx.restore();
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function glowTexture(): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(242,180,75,.9)');
  g.addColorStop(0.4, 'rgba(242,180,75,.25)');
  g.addColorStop(1, 'rgba(242,180,75,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

export async function createLantern(opts: LanternOptions) {
  const { stage, labels, initials, onPick } = opts;

  // Draw labels only once the display font is ready.
  await Promise.all([document.fonts.load('700 80px Almendra'), document.fonts.ready]);

  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  const canvas = renderer.domElement;
  canvas.className = 'lantern-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  stage.appendChild(canvas);

  const scene = new Scene();
  const camera = new PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 0, 6.8);

  scene.add(new AmbientLight(0xffffff, 0.8));
  const key = new DirectionalLight(0xfff1d0, 1.2);
  key.position.set(3, 4, 5);
  scene.add(key);

  const glow = new Sprite(new SpriteMaterial({
    map: glowTexture(), blending: AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.7,
  }));
  glow.scale.setScalar(3.9);
  glow.renderOrder = -1;
  scene.add(glow);

  const cube = new Group();
  scene.add(cube);

  const glass = (tex: Texture) => new MeshStandardMaterial({
    map: tex, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: 0.85, roughness: 0.7, metalness: 0,
  });
  const textures: Texture[] = [
    faceTexture(labels[1] ?? '', false), // +x
    faceTexture(labels[3] ?? '', false), // -x
    faceTexture(initials, true), // +y
    faceTexture('', false), // -y
    faceTexture(labels[0] ?? '', false), // +z
    faceTexture(labels[2] ?? '', false), // -z
  ];
  const faces = new Mesh(new BoxGeometry(SIZE, SIZE, SIZE), textures.map(glass));
  cube.add(faces);

  // Gold frame: 12 bars so the edges have real thickness.
  const gold = new MeshStandardMaterial({
    color: 0xf2b44b, emissive: 0xf2b44b, emissiveIntensity: 0.35, metalness: 0.3, roughness: 0.4,
  });
  const T = 0.09, L = SIZE + T, h = SIZE / 2;
  const bars: [number, number, number, number, number, number][] = [];
  for (const a of [-h, h]) for (const b of [-h, h]) {
    bars.push([L, T, T, 0, a, b], [T, L, T, a, 0, b], [T, T, L, a, b, 0]);
  }
  for (const [w, hh, d, x, y, z] of bars) {
    const m = new Mesh(new BoxGeometry(w, hh, d), gold);
    m.position.set(x, y, z);
    cube.add(m);
  }

  let yaw = 0.5;
  let pitch = REST_PITCH;
  let yawVel = 0;
  let pitchVel = 0;
  let tween: { from: number[]; to: number[]; start: number; dur: number; done?: () => void } | null = null;
  let hover = false;
  let focused = false;
  let dragging = false;
  let inView = false;
  let raf = 0;
  let last = 0;

  const raycaster = new Raycaster();
  const ndc = new Vector2();
  function faceAt(ev: PointerEvent): number | null {
    const r = canvas.getBoundingClientRect();
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -(((ev.clientY - r.top) / r.height) * 2 - 1));
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObject(faces)[0];
    const idx = hit?.face?.materialIndex;
    return idx !== undefined && idx in MATERIAL_TO_FACE ? MATERIAL_TO_FACE[idx] : null;
  }

  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  function easeTo(face: number, done?: () => void) {
    const base = FACE_YAW[face];
    const target = base + Math.PI * 2 * Math.round((yaw - base) / (Math.PI * 2));
    yawVel = pitchVel = 0;
    tween = { from: [yaw, pitch], to: [target, 0.12], start: performance.now(), dur: 700, done };
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    if (tween) {
      const p = Math.min((now - tween.start) / tween.dur, 1);
      const e = ease(p);
      yaw = tween.from[0] + (tween.to[0] - tween.from[0]) * e;
      pitch = tween.from[1] + (tween.to[1] - tween.from[1]) * e;
      if (p >= 1) { const d = tween.done; tween = null; d?.(); }
    } else if (!dragging) {
      yaw += yawVel * dt;
      pitch += pitchVel * dt;
      const decay = Math.exp(-dt * 3);
      yawVel *= decay;
      pitchVel *= decay;
      pitch += (REST_PITCH - pitch) * (1 - Math.exp(-dt * 1.5));
      if (!hover && !focused) yaw += IDLE_SPEED * dt;
    }
    cube.rotation.set(pitch, yaw, 0);
    // Soft flame flicker in the halo.
    glow.material.opacity = 0.68 + 0.05 * Math.sin(now * 0.0017) + 0.025 * Math.sin(now * 0.0043);
    renderer.render(scene, camera);
  }

  function sync() {
    const run = inView && !document.hidden;
    if (run && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
    if (!run && raf) { cancelAnimationFrame(raf); raf = 0; }
  }

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (!raf) renderer.render(scene, camera);
  }

  // Pointer: drag with inertia; a click that is not a drag picks a face.
  let down: { x: number; y: number; t: number; lx: number; ly: number; lt: number } | null = null;
  let moved = 0;
  const onDown = (e: PointerEvent) => {
    tween = null;
    dragging = true;
    moved = 0;
    yawVel = pitchVel = 0;
    down = { x: e.clientX, y: e.clientY, t: performance.now(), lx: e.clientX, ly: e.clientY, lt: performance.now() };
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add('is-grabbing');
  };
  const onMove = (e: PointerEvent) => {
    if (!down) {
      canvas.style.cursor = faceAt(e) !== null ? 'pointer' : '';
      return;
    }
    const now = performance.now();
    const dx = e.clientX - down.lx, dy = e.clientY - down.ly;
    const dt = Math.max((now - down.lt) / 1000, 0.001);
    moved += Math.abs(dx) + Math.abs(dy);
    yaw += dx * 0.01;
    pitch = Math.max(-0.4, Math.min(1.1, pitch + dy * 0.008));
    yawVel = (dx * 0.01) / dt;
    pitchVel = 0;
    down.lx = e.clientX; down.ly = e.clientY; down.lt = now;
  };
  const onUp = (e: PointerEvent) => {
    if (!down) return;
    const isClick = moved < 6 && performance.now() - down.t < 600;
    if (performance.now() - down.lt > 80) yawVel = 0;
    yawVel = Math.max(-8, Math.min(8, yawVel));
    down = null;
    dragging = false;
    canvas.classList.remove('is-grabbing');
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    if (isClick) {
      const face = faceAt(e);
      if (face !== null) easeTo(face, () => onPick(face));
    }
  };
  const onCancel = () => { down = null; dragging = false; canvas.classList.remove('is-grabbing'); };
  const onEnter = () => { hover = true; };
  const onLeave = () => { hover = false; };

  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onCancel);
  stage.addEventListener('pointerenter', onEnter);
  stage.addEventListener('pointerleave', onLeave);

  const io = new IntersectionObserver((entries) => { inView = entries[0].isIntersecting; sync(); });
  io.observe(stage);
  const ro = new ResizeObserver(resize);
  ro.observe(stage);
  document.addEventListener('visibilitychange', sync);
  resize();

  function dispose() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    io.disconnect();
    ro.disconnect();
    document.removeEventListener('visibilitychange', sync);
    canvas.removeEventListener('pointerdown', onDown);
    canvas.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerup', onUp);
    canvas.removeEventListener('pointercancel', onCancel);
    stage.removeEventListener('pointerenter', onEnter);
    stage.removeEventListener('pointerleave', onLeave);
    scene.traverse((o: Object3D) => {
      const m = o as Mesh;
      (m.geometry as BufferGeometry | undefined)?.dispose();
      const mat = m.material as Material | Material[] | undefined;
      (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => {
        (x as MeshStandardMaterial).map?.dispose();
        x.dispose();
      });
    });
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
  }

  return {
    dispose,
    focusFace: (i: number) => { focused = true; easeTo(i); },
    setFocused: (v: boolean) => { focused = v; },
  };
}
