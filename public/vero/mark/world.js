// Vero Scan — hero model world: the extruded Vero mark in bright rose enamel on a lifted studio floor.
// Shared with the render studio (stills and loops use the same kit: softbox environment,
// enamel / graphite / glass materials, floor reflection, scan band). Own code, three.js r186 (MIT).
import * as THREE from './vendor/three/three.module.min.js';
import { GLTFLoader } from './vendor/three/addons.min.js';

// No WebGL: the page falls back to its still image (CSS shows it only under .vero-nogl).
try {
  const probe = document.createElement('canvas');
  const gl = probe.getContext('webgl2') || probe.getContext('webgl');
  if (!gl) document.documentElement.classList.add('vero-nogl');
  gl?.getExtension('WEBGL_lose_context')?.loseContext();
} catch { document.documentElement.classList.add('vero-nogl'); }

const D2R = Math.PI / 180;
export const ROSE = 0xD65C82;
export const BG = '#121314';
export const FLOOR_Y = -0.64; // the mark floats just above this plane

// Named views. az: degrees around the vertical axis (0 = camera on +Z, the mark's front),
// el: elevation, dist: distance to target, fov: vertical fov, target: look-at point,
// shift: lens shift as a fraction of the viewport [x, y] (positive moves the mark right / up).
// Wide views keep the mark right of centre so the page headline on the left stays clear.
export const VIEWS = {
  'Camera 1': { label: 'Wide hero, three-quarter left', az: -30, el: 11, dist: 3.7, fov: 30, target: [0, -0.02, 0], shift: [0.2, 0] },
  'Camera 2': { label: 'Close on the notch', az: -22, el: 9, dist: 1.9, fov: 30, target: [-0.27, -0.1, 0.04], shift: [0.1, 0] },
  'Camera 3': { label: 'Low angle', az: -26, el: -2.5, dist: 3.0, fov: 32, target: [0, 0.16, 0], shift: [0.17, 0] },
  'Camera 4': { label: 'Top-down', az: -14, el: 80, dist: 3.7, fov: 30, target: [0, -0.1, 0], shift: [0.17, 0] },
  'Camera 5': { label: 'Profile', az: 78, el: 5, dist: 3.5, fov: 28, target: [0, -0.02, 0], shift: [0.16, 0] },
  'Camera 6': { label: 'Three-quarter left', az: -42, el: 15, dist: 3.4, fov: 30, target: [0, 0, 0], shift: [0.16, 0] },
  'Camera 7': { label: 'Three-quarter right', az: 38, el: 14, dist: 3.4, fov: 30, target: [0, 0, 0], shift: [0.16, 0] },
  'Camera 8': { label: 'Wide and calm', az: -20, el: 9, dist: 4.2, fov: 28, target: [0, -0.1, 0], shift: [0.24, 0] },
  'Camera 9': { label: 'Behind the mark', az: 156, el: 16, dist: 3.5, fov: 30, target: [0, 0, 0], shift: [0.16, 0] },
  'Camera 10': { label: 'Rear three-quarter', az: 132, el: 10, dist: 3.4, fov: 30, target: [0, 0, 0], shift: [0.16, 0] },
  'Camera 11': { label: 'Macro on the tab', az: -26, el: 12, dist: 1.8, fov: 30, target: [-0.36, 0.3, 0.02], shift: [0.1, 0] },
  'Camera 12': { label: 'Macro on the tip', az: 22, el: 6, dist: 1.9, fov: 30, target: [0.02, -0.38, 0.02], shift: [0.1, 0] },
  'Camera 13': { label: 'Mark on the left', az: 24, el: 10, dist: 3.6, fov: 30, target: [0, -0.02, 0], shift: [-0.22, 0] },
  'Camera 14': { label: 'High overview', az: -22, el: 52, dist: 3.6, fov: 30, target: [0, -0.1, 0], shift: [0.17, 0] },
  'Camera 15': { label: 'Floor level, reflection', az: -16, el: 1, dist: 3.1, fov: 30, target: [0, -0.28, 0], shift: [0.17, 0] },
  'Camera 16': { label: 'Distant high', az: -34, el: 36, dist: 4.3, fov: 28, target: [0, -0.1, 0], shift: [0.2, 0] },
  'Camera 17': { label: 'Front, centred', az: 6, el: 5, dist: 3.1, fov: 30, target: [0, 0, 0], shift: [0, 0] },
  // Home hero (live canvas, not in the views file): the mark fills ~70% of the viewport height, right of centre.
  'Home Hero': { label: 'Home hero', az: -18, el: 8, dist: 3.3, fov: 26, target: [0, -0.02, 0], shift: [0.18, 0] },
};

const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// ---------- small canvas textures ----------
export function gradientTexture(stops, { w = 256, h = 256, radial = true } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  const grd = radial ? g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.min(w, h) / 2) : g.createLinearGradient(0, 0, 0, h);
  for (const [t, v] of stops) grd.addColorStop(t, `rgb(${Math.round(v * 255)},${Math.round(v * 255)},${Math.round(v * 255)})`);
  g.fillStyle = grd;
  g.fillRect(0, 0, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace;
  return t;
}

// ---------- softbox environment ----------
// A tiny photo studio baked to a PMREM: one big overhead softbox, two tall strips,
// a dim wall behind the camera and a dark floor. No HDRI file is loaded.
export function makeEnvironment(renderer, { top = 7, strip = 6, back = 1.7, warm = 0.0, domeStops = [[0, 0.012], [0.45, 0.03], [1, 0.16]] } = {}) {
  const s = new THREE.Scene();
  const dome = new THREE.Mesh(new THREE.SphereGeometry(40, 32, 16), new THREE.MeshBasicMaterial({
    map: gradientTexture(domeStops, { w: 8, h: 256, radial: false }), side: THREE.BackSide, toneMapped: false,
    color: new THREE.Color(1, 1, 1),
  }));
  s.add(dome);
  const panel = (w, h, pos, rgb, k, grad = null) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({
      color: new THREE.Color(rgb[0] * k, rgb[1] * k, rgb[2] * k), side: THREE.DoubleSide, toneMapped: false,
      map: grad ? gradientTexture(grad, { w: 8, h: 128, radial: false }) : null,
    }));
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    s.add(m);
    return m;
  };
  const W = [1, 0.985 - warm * 0.05, 0.96 - warm * 0.12];
  panel(9, 6, [-2.5, 9, 3.5], W, top);                                 // overhead softbox, front-left
  panel(1.2, 9, [-9, 1.5, 1.5], [0.93, 0.97, 1], strip);                // tall cool strip, left
  panel(0.9, 9, [9, 1.0, -2.5], [1, 1, 1], strip * 0.8);                // thin strip, right-back (rim)
  panel(22, 9, [5, 3.5, 13], [1, 1, 1], back, [[0, 1], [0.5, 0.45], [1, 0.08]]); // big gradient wall, camera right: soft sheen across flat faces
  panel(16, 3, [0, 0.5, -14], [0.9, 0.95, 1], 0.9);                     // back wash
  const pm = new THREE.PMREMGenerator(renderer);
  const rt = pm.fromScene(s, 0.015, 0.1, 100);
  pm.dispose();
  s.traverse(o => { o.geometry?.dispose?.(); o.material?.map?.dispose?.(); o.material?.dispose?.(); });
  return rt;
}

// Studio lighting shared by the site and the render studio.
export function addStudioLighting(scene, renderer, { envIntensity = 0.8, key = 1.5, rotation = [0, -0.8, 0], env = {}, rim = 0, fill = 0 } = {}) {
  const envRT = makeEnvironment(renderer, env);
  scene.environment = envRT.texture;
  scene.environmentIntensity = envIntensity;
  scene.environmentRotation.set(...rotation);
  const k = new THREE.DirectionalLight(0xfff4ee, key);
  k.position.set(-3, 4.2, 3.2);
  k.name = 'Key';
  scene.add(k);
  if (rim > 0) { // rose rim from behind-right: the edge glow of the enamel
    const r = new THREE.DirectionalLight(0xff6f9a, rim);
    r.position.set(4.2, 1.6, -3.6); r.name = 'Rim';
    scene.add(r);
  }
  if (fill > 0) { // cool fill from the front-right, low
    const f = new THREE.DirectionalLight(0xd5e3ff, fill);
    f.position.set(3.6, 0.6, 3.8); f.name = 'Fill';
    scene.add(f);
  }
  return envRT;
}

// ---------- materials ----------
export function bandUniforms(y = 9) {
  return {
    uBandY: { value: y }, uBandW: { value: 0.028 }, uBandCol: { value: new THREE.Color(ROSE).multiplyScalar(2.6) }, uBandOn: { value: 1 },
    uGlint: { value: -9 }, uGlintOn: { value: 0 }, uRim: { value: 0 }, uRimCol: { value: new THREE.Color(0xff7ea8) },
  };
}

// Surface shader patch for the enamel:
//  * a thin rose line of light wraps the surface where the scan band crosses it (world Y)
//  * (live site) a one-off white glint sweeping diagonally across the mark and a fresnel rim glow, both off by default
//  * flat faces get a very slight pillow (normal tilt only, no geometry change) so the
//    softbox reflections roll across them like enamel instead of a printed flat colour
export function addBandGlow(mat, u, { pillow = 0.2 } = {}) {
  mat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, u);
    sh.uniforms.uPillow = { value: pillow };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vWY; varying vec3 vLN; varying vec3 vTilt; varying vec2 vLP; uniform float uPillow;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvWY = (modelMatrix * vec4(transformed, 1.0)).y; vLN = normal; vLP = position.xy; vTilt = normalMatrix * vec3(position.xy, 0.0) * uPillow;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vWY; varying vec3 vLN; varying vec3 vTilt; varying vec2 vLP;\nuniform float uBandY; uniform float uBandW; uniform vec3 uBandCol; uniform float uBandOn; uniform float uGlint; uniform float uGlintOn; uniform float uRim; uniform vec3 uRimCol;')
      .replace('#include <normal_fragment_begin>', '#include <normal_fragment_begin>\n{ float capMask = smoothstep(0.85, 0.99, abs(vLN.z)); normal = normalize(normal + vTilt * capMask); }')
      .replace('#include <opaque_fragment>', 'float bd = (vWY - uBandY) / uBandW;\noutgoingLight += uBandCol * uBandOn * (exp(-bd * bd) + 0.16 * exp(-bd * bd * 0.03));\nfloat gd = (dot(vLP, vec2(0.8, 0.6)) - uGlint) / 0.07;\noutgoingLight += vec3(1.6, 1.45, 1.5) * uGlintOn * exp(-gd * gd) * (0.45 + 0.9 * smoothstep(0.3, 0.9, vLN.z));\nfloat fr = pow(1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0), 3.0);\noutgoingLight += uRimCol * (fr * uRim);\n#include <opaque_fragment>');
  };
  mat.customProgramCacheKey = () => 'vero-band-glow-v3';
  return mat;
}

export function makeMaterials() {
  const bandU = bandUniforms();
  const bandUM = bandUniforms(); // mirrored copy for the floor reflection
  const enamelProps = { color: ROSE, roughness: 0.3, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.045, ior: 1.5, specularIntensity: 1, sheen: 0.25, sheenRoughness: 0.5, sheenColor: new THREE.Color(0xff9db8) };
  const enamel = addBandGlow(new THREE.MeshPhysicalMaterial(enamelProps), bandU);
  enamel.name = 'RoseEnamel';
  const enamelMirror = addBandGlow(new THREE.MeshPhysicalMaterial(enamelProps), bandUM);
  const plain = () => new THREE.MeshPhysicalMaterial(enamelProps);
  const graphite = new THREE.MeshPhysicalMaterial({ color: 0x6a7078, metalness: 0.92, roughness: 0.34, clearcoat: 0.2, clearcoatRoughness: 0.35 });
  graphite.name = 'BrushedGraphite';
  const graphiteDark = new THREE.MeshPhysicalMaterial({ color: 0x17191c, metalness: 0.85, roughness: 0.42, clearcoat: 0.1, clearcoatRoughness: 0.5 });
  const smoked = new THREE.MeshPhysicalMaterial({
    color: 0xdfe5ec, roughness: 0.06, metalness: 0, transmission: 1, thickness: 0.35, ior: 1.5,
    attenuationColor: new THREE.Color(0x4a525c), attenuationDistance: 0.55, specularIntensity: 1, envMapIntensity: 1.2,
  });
  smoked.name = 'SmokedGlass';
  const frosted = smoked.clone();
  frosted.roughness = 0.5; frosted.thickness = 0.6; frosted.attenuationColor = new THREE.Color(0x6a727c); frosted.attenuationDistance = 1.4;
  frosted.name = 'FrostedGlass';
  return { enamel, enamelMirror, plain, graphite, graphiteDark, smoked, frosted, bandU, bandUM };
}

// ---------- stage: floor, contact shadow, reflection ----------
// bg: linear HDR clear colour (post.clearColor) so the floor melts into the page exactly.
export function makeStage(bg, { floorY = FLOOR_Y, reflect = 0.26, shadow = 0.55, size = 24, fade = 3.2, shadowSize = [2.1, 1.0] } = {}) {
  const group = new THREE.Group();
  group.name = 'Stage';
  const e = 1 - reflect;
  const alpha = gradientTexture([[0, e], [0.5 * fade / (size / 2) * 2, Math.min(1, e + (1 - e) * 0.72)], [fade / (size / 2), 1], [1, 1]], { w: 512, h: 512 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(size, size).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({
    color: bg, alphaMap: alpha, transparent: true, depthWrite: false, toneMapped: false,
  }));
  floor.position.y = floorY;
  floor.renderOrder = 2;
  floor.name = 'Floor';
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(shadowSize[0], shadowSize[1]).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({
    color: 0x000000, alphaMap: gradientTexture([[0, 1], [0.35, 0.55], [1, 0]], { w: 256, h: 256 }), transparent: true, opacity: shadow, depthWrite: false, toneMapped: false,
  }));
  sh.position.y = floorY + 0.002;
  sh.renderOrder = 3;
  sh.name = 'ContactShadow';
  group.add(floor, sh);
  group.userData = { floor, shadow: sh, floorY };
  return group;
}

// Mirror image of an object about the floor plane. Call sync() after moving the original.
export function makeMirror(source, floorY = FLOOR_Y, material = null) {
  const root = new THREE.Group();
  root.scale.y = -1;
  root.position.y = 2 * floorY;
  const copy = source.clone();
  if (material) copy.traverse(o => { if (o.isMesh) o.material = material; });
  root.add(copy);
  const pairs = [];
  (function walk(a, b) { pairs.push([a, b]); a.children.forEach((c, i) => b.children[i] && walk(c, b.children[i])); })(source, copy);
  root.userData.sync = () => {
    for (const [a, b] of pairs) { b.position.copy(a.position); b.quaternion.copy(a.quaternion); b.scale.copy(a.scale); b.visible = a.visible; }
  };
  root.userData.copy = copy;
  return root;
}

// ---------- the scan band ----------
export function makeBand({ width = 1.9, depth = 1.2, opacity = 0.3 } = {}) {
  const g = new THREE.Group();
  g.name = 'ScanBand';
  const col = new THREE.Color(ROSE);
  const planeTex = gradientTexture([[0, 1], [0.55, 0.7], [1, 0]], { w: 256, h: 256 });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(width, depth).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({
    color: col.clone().multiplyScalar(1.4), alphaMap: planeTex, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false,
  }));
  const pts = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([x, z]) => new THREE.Vector3(x * width * 0.46, 0, z * depth * 0.46));
  const edge = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: col.clone().multiplyScalar(2.2), transparent: true, opacity: 0.2, toneMapped: false, depthWrite: false }));
  const light = new THREE.PointLight(ROSE, 1.6, 2.6, 2);
  light.position.set(0, 0.05, 0.1);
  g.add(plane, edge, light);
  g.userData = { plane, edge, light };
  return g;
}

export function cameraPose(view, aspect = 16 / 10) {
  const v = { ...VIEWS['Camera 1'], ...view };
  const narrow = Math.max(1, 1.3 / Math.max(0.3, aspect));
  const dist = v.dist * Math.pow(narrow, 0.8);
  const az = v.az * D2R, el = v.el * D2R;
  const target = new THREE.Vector3(...v.target);
  const position = new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)).multiplyScalar(dist).add(target);
  return { position, target, fov: v.fov, shift: v.shift || [0, 0] };
}

// Model sizes by drawing-buffer width; files are always the Vero mark, whatever name the page asks for.
const MODEL_DIR = new URL('./glb/', import.meta.url).href; // site copy: models live next to this file
const MODEL_FILE = { small: 'vero-mark-small.glb', medium: 'vero-mark-medium.glb', large: 'vero-mark-large.glb' };
const VIEWS_FILE = 'vero-mark-views.glb';
const mapUrl = (u, fallback) => (u && /vero-(?:ring|mark)-(small|medium|large|views)\.glb/.test(u)) ? MODEL_DIR + u.match(/vero-(?:ring|mark)-(small|medium|large|views)\.glb/)[0].replace('ring', 'mark') : MODEL_DIR + fallback;

// ---------- live-site extras: hero look, motes, notch flare ----------
const clamp01 = x => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t, s = 1.6) => { const u = t - 1; return 1 + (s + 1) * u * u * u + s * u * u; };

// Brightness knobs of the live site (the render studio keeps its own, darker, stills look).
export const LOOK = {
  exposure: 0.9, bloom: 0.38, vignette: 0.12, grain: 0.03,
  env: 0.8, key: 2.0, rim: 2.4, fill: 0.6,
  dome: [[0, 0.06], [0.45, 0.2], [1, 0.55]], envTop: 16, envStrip: 9, envBack: 2.2,
  rimFresnel: 0.5,
  reflect: 0.32,
};

// Entrance: the two pieces start away from the mark and fly in (offset, spin) with an overshoot.
const PIECES = {
  tab: { delay: 0.05, dur: 1.55, from: [-2.1, 1.2, 1.5], spin: [0.9, -1.3, 1.0], from0: 0.55 },
  stroke: { delay: 0.22, dur: 1.65, from: [2.2, -1.4, -1.0], spin: [-0.7, 1.2, -0.8], from0: 0.6 },
};
const NOTCH = [-0.4, -0.075]; // the hook tip where the notch is cut (mark coordinates)
const GLINT_AXIS = [0.8, 0.6];

function splitIslands(geometry) {
  const pos = geometry.attributes.position, idx = geometry.index?.array;
  if (!idx) return [geometry];
  const keyOf = new Map(), parent = [];
  const id = i => {
    const k = Math.round(pos.getX(i) * 4000) + '_' + Math.round(pos.getY(i) * 4000) + '_' + Math.round(pos.getZ(i) * 4000);
    let n = keyOf.get(k);
    if (n === undefined) { n = parent.length; parent.push(n); keyOf.set(k, n); }
    return n;
  };
  const find = a => { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; };
  const tri = [];
  for (let i = 0; i < idx.length; i += 3) {
    const a = id(idx[i]), b = id(idx[i + 1]), c = id(idx[i + 2]);
    tri.push(a);
    parent[find(b)] = find(a); parent[find(c)] = find(a);
  }
  const groups = new Map();
  tri.forEach((a, t) => { const r = find(a); (groups.get(r) ?? groups.set(r, []).get(r)).push(t); });
  const list = [...groups.values()].sort((x, y) => y.length - x.length).slice(0, 2);
  return list.map(tris => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', pos); g.setAttribute('normal', geometry.attributes.normal);
    const arr = new (idx.constructor)(tris.length * 3);
    tris.forEach((t, j) => { arr[j * 3] = idx[t * 3]; arr[j * 3 + 1] = idx[t * 3 + 1]; arr[j * 3 + 2] = idx[t * 3 + 2]; });
    g.setIndex(new THREE.BufferAttribute(arr, 1));
    g.computeBoundingBox(); g.computeBoundingSphere();
    return g;
  });
}

function starTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.1, 'rgba(255,225,236,.8)'); r.addColorStop(0.3, 'rgba(255,130,170,.2)'); r.addColorStop(0.6, 'rgba(255,100,150,.05)'); r.addColorStop(1, 'rgba(255,90,140,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  g.globalCompositeOperation = 'lighter';
  for (const [w, h] of [[126, 3], [3, 80]]) {
    const l = g.createLinearGradient(64 - w / 2, 64 - h / 2, 64 + w / 2, 64 + h / 2);
    const gg = g.createRadialGradient(64, 64, 0, 64, 64, Math.max(w, h) / 2);
    gg.addColorStop(0, 'rgba(255,255,255,.95)'); gg.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gg; g.fillRect(64 - w / 2, 64 - h / 2, w, h);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Drifting dust motes: a few hundred additive points, animated entirely in the vertex shader.
function makeMotes(count, light) {
  const geo = new THREE.BufferGeometry();
  const p = new Float32Array(count * 3), a = new Float32Array(count * 4);
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let i = 0; i < count; i++) {
    p[i * 3] = (rnd() - 0.5) * 5.2; p[i * 3 + 1] = (rnd() - 0.5) * 2.8; p[i * 3 + 2] = (rnd() - 0.2) * 3.0 - 1.0;
    a[i * 4] = rnd() * 6.283; a[i * 4 + 1] = 0.025 + rnd() * 0.06; a[i * 4 + 2] = 0.4 + rnd() * 1.0; a[i * 4 + 3] = rnd();
  }
  geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(a, 4));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: light ? THREE.NormalBlending : THREE.AdditiveBlending, toneMapped: false,
    uniforms: { uTime: { value: 0 }, uAlpha: { value: 0 }, uScale: { value: 400 }, uCol: { value: new THREE.Color(light ? 0xd65c82 : 0xffc2d4) } },
    vertexShader: `
      attribute vec4 aSeed; uniform float uTime; uniform float uScale; varying float vA; varying float vT;
      void main() {
        vec3 q = position;
        q.y = mod(q.y + 1.4 + uTime * aSeed.y, 2.8) - 1.4;
        q.x += sin(uTime * 0.31 * aSeed.z + aSeed.x) * 0.14;
        q.z += cos(uTime * 0.27 * aSeed.z + aSeed.x * 1.7) * 0.12;
        vec4 mv = modelViewMatrix * vec4(q, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = max(1.5, (0.008 + aSeed.w * aSeed.w * 0.03) * uScale / max(0.5, -mv.z));
        float edge = smoothstep(1.4, 0.9, abs(q.y));
        vA = edge * (0.25 + 0.75 * (0.5 + 0.5 * sin(uTime * (0.6 + aSeed.z) + aSeed.x * 3.0)));
        vT = aSeed.w;
      }`,
    fragmentShader: `
      uniform vec3 uCol; uniform float uAlpha; varying float vA; varying float vT;
      void main() {
        vec2 d = gl_PointCoord - 0.5;
        float r = length(d) * 2.0;
        float a = (1.0 - smoothstep(0.0, 1.0, r)); a *= a;
        vec3 c = mix(uCol, vec3(1.0), vT * 0.6);
        gl_FragColor = vec4(c * 1.4, a * vA * uAlpha * 0.55);
      }`,
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false; pts.renderOrder = 6; pts.name = 'Motes';
  return pts;
}

const isLight = css => { try { const c = new THREE.Color().setStyle(css || '#121314', THREE.SRGBColorSpace); return (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) > 0.4; } catch { return false; } };

export default class ModelWorld {
  constructor(app) {
    this.app = app;
    this.services = app.services;
    this.camera = app.canvas.camera.instance;
    this.renderer = app.canvas.renderer.instance;
    this.reducedMotion = app.reducedMotion;
    this.scene = new THREE.Scene();
    this.pivot = new THREE.Group();
    this.pivot.name = 'Pivot';
    this.scene.add(this.pivot);
    this.target = new THREE.Vector3();
    this.viewName = this.services.view || 'Camera 1';
    this.views = { ...VIEWS };
    this.pointer = new THREE.Vector2();
    this.parallax = new THREE.Vector2();
    this.camOff = new THREE.Vector3();
    this.onView = null;
    this.tween = null;
    this.age = 0;          // animation clock: starts when the canvas becomes visible
    this.started = false;
    this.frozen = false;
    this.scrollP = 0;
    this.look = { ...LOOK, ...(this.services.look || {}) };
    const L = this.look;
    const bgCss = this.services.background || BG;
    this.light = isLight(bgCss);
    this.mats = makeMaterials();
    this.mats.bandU.uRim.value = this.mats.bandUM.uRim.value = L.rimFresnel;
    // big canvases on modest GPUs: no sheen layer (the fresnel rim covers it) and 2x MSAA
    for (const m of [this.mats.enamel, this.mats.enamelMirror]) { m.sheen = 0; m.needsUpdate = true; }
    if (this.services.post?.rtScene) { this.services.post.samples = 2; this.services.post.rtScene.samples = 2; }
    this.envRT = addStudioLighting(this.scene, this.renderer, {
      envIntensity: L.env, key: L.key, rim: L.rim, fill: L.fill, env: { top: L.envTop, strip: L.envStrip, back: L.envBack, domeStops: L.dome },
    });
    const post = this.services.post;
    post?.setLook?.({ tone: 'neutral', exposure: L.exposure, bloom: L.bloom, vignette: this.light ? 0 : L.vignette, grain: L.grain });
    const bg = post?.clearColor ?? new THREE.Color(bgCss);
    if (!post) this.scene.background = bg;
    this.stage = makeStage(bg, { reflect: L.reflect, shadow: this.light ? 0.28 : 0.5 });
    this.scene.add(this.stage);
    const fg = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.6).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({
      color: this.light ? new THREE.Color(ROSE).multiplyScalar(0.7) : new THREE.Color(ROSE).multiplyScalar(0.8), alphaMap: gradientTexture([[0, 1], [0.4, 0.45], [1, 0]], { w: 256, h: 256 }),
      transparent: true, opacity: this.look.floorGlow ?? (this.light ? 0.22 : 0.3), blending: this.light ? THREE.NormalBlending : THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
    }));
    fg.position.y = FLOOR_Y + 0.003; fg.renderOrder = 3; fg.name = 'FloorGlow';
    this.stage.add(fg);
    this.band = makeBand();
    this.band.userData.edge.visible = false; // no hard rectangle outline on the live site
    this.scene.add(this.band);
    this.motes = makeMotes(this.services.motes ?? 170, this.light);
    this.scene.add(this.motes);
    this.onPointer = e => {
      this.pointer.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    };
    if (!this.reducedMotion && window.matchMedia('(pointer: fine)').matches) window.addEventListener('pointermove', this.onPointer, { passive: true });
    window.__veroHero = this;
    this.ready = this.load().catch(err => { console.warn('[gl] Vero mark failed to load', err); return false; });
  }

  pickSize() {
    const pr = this.app.canvas.renderer.pixelRatio || 1;
    const px = (this.app.canvas.width || window.innerWidth) * pr;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    if (coarse || px < 1100) return 'small';
    if (px < 2200 && !this.services.hero) return 'medium';
    return 'large';
  }

  async loadViews(loader) {
    const url = mapUrl(this.services.viewsUrl, VIEWS_FILE);
    try {
      const gltf = await loader.loadAsync(url);
      // the table above is canonical; the file only adds cameras it does not know
      gltf.scene.traverse(o => {
        const v = o.userData?.view;
        if (v && o.name && /^Camera \d+$/.test(o.name) && !VIEWS[o.name]) this.views[o.name] = v;
      });
    } catch (e) {
      console.warn('[gl] views file unavailable, using built-in views', e?.message || e);
    }
  }

  async load() {
    const loader = new GLTFLoader();
    const size = this.pickSize();
    const u = this.services.modelUrls || {};
    const url = mapUrl(u[size] || this.services.modelUrl, MODEL_FILE[size]);
    const [gltf] = await Promise.all([loader.loadAsync(url), this.loadViews(loader)]);
    if (this.destroyed) return false;
    let geometry = null;
    gltf.scene.traverse(o => { if (o.isMesh && !geometry) geometry = o.geometry; });
    if (!geometry) throw new Error('no mesh in ' + url);
    // two pieces: the tab (smaller island) and the V stroke
    let parts = splitIslands(geometry);
    this.mark = new THREE.Group();
    this.mark.name = 'Mark';
    this.pieces = {};
    if (parts.length === 2) {
      parts.forEach(g => g.computeBoundingBox());
      const c = g => g.boundingBox.getCenter(new THREE.Vector3());
      const [tabG, strokeG] = c(parts[0]).y > c(parts[1]).y ? [parts[0], parts[1]] : [parts[1], parts[0]];
      for (const [name, g] of [['tab', tabG], ['stroke', strokeG]]) {
        const mesh = new THREE.Mesh(g, this.mats.enamel);
        const centre = c(g);
        mesh.position.copy(centre).negate();
        const grp = new THREE.Group();
        grp.name = name; grp.position.copy(centre);
        grp.userData.home = centre.clone();
        grp.add(mesh);
        this.mark.add(grp);
        this.pieces[name] = grp;
      }
    } else {
      this.mark.add(new THREE.Mesh(geometry, this.mats.enamel));
    }
    this.pivot.add(this.mark);
    this.mirror = makeMirror(this.mark, FLOOR_Y, this.mats.enamelMirror);
    this.pivot.add(this.mirror);
    this.flare = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTexture(), color: 0xffffff, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false, opacity: 0 }));
    this.flare.position.set(NOTCH[0], NOTCH[1], 0.14);
    this.flare.renderOrder = 7;
    this.flare.scale.setScalar(0.001);
    this.mark.add(this.flare);
    this.applyView(this.viewName, { instant: true });
    this.resize(this.app.canvas.width, this.app.canvas.height);
    this.update(0, 0);
    try { await this.renderer.compileAsync(this.scene, this.camera); } catch { /* optional */ }
    if (this.destroyed) return false;
    this.app.invalidate();
    this.app.render(0);
    return true;
  }

  viewPose(name) {
    return cameraPose(this.views[name] || this.views['Camera 1'], this.camera.aspect);
  }

  resetCamOffset() { this.camera.position.sub(this.camOff); this.camOff.set(0, 0, 0); }

  applyView(name, { instant = false } = {}) {
    this.viewName = this.views[name] ? name : 'Camera 1';
    const pose = this.viewPose(this.viewName);
    this.pose = pose;
    this.target.copy(pose.target);
    this.camera.fov = pose.fov;
    if (instant) {
      this.camOff.set(0, 0, 0);
      this.camera.position.copy(pose.position);
      this.camera.lookAt(pose.target);
    } else {
      this.resetCamOffset();
      this.tweenTo(pose.position, 1.4);
    }
    this.applyShift();
    this.camera.updateProjectionMatrix();
    this.onView?.(this.target);
    this.app.invalidate();
  }

  setView(name) { this.applyView(name); }

  applyShift() {
    const { width: w = 1, height: h = 1 } = this.app.canvas;
    let [sx, sy] = this.pose?.shift || [0, 0];
    if (this.services.hero) sx *= 1 - 0.85 * (this.shiftK || 0); // the home mark glides to the centre of the pinned frame as it recedes
    const narrow = this.camera.aspect < 1;
    if ((sx || sy) && !narrow) this.camera.setViewOffset(w, h, -sx * w, sy * h, w, h);
    else this.camera.clearViewOffset();
    this.placeGlow(narrow ? 0 : sx, narrow ? 0 : sy);
  }

  // Backdrop glow sits behind the mark; on dark pages it is a rose-tinted lift, on light pages a blush.
  placeGlow(sx = 0, sy = 0) {
    const post = this.services.post;
    if (!post?.setGlow) return;
    const L = this.look;
    const narrow = this.camera.aspect < 1;
    if (this.light) post.setGlow({ color: [1, 0.8, 0.86], pos: [0.5 + sx, 0.5 + sy], radius: narrow ? 0.7 : 0.78, amount: L.glowLight ?? 0.55 });
    else post.setGlow({ color: [0.46, 0.17, 0.27], pos: [0.5 + sx, 0.5 + sy], radius: narrow ? 0.75 : 0.9, amount: L.glowDark ?? 0.62 });
  }

  tweenTo(position, duration) {
    this.tween = { from: this.camera.position.clone(), to: position.clone(), t: 0, duration };
  }

  // Called by the hero once the user stops orbiting: ease back to the framed view.
  syncOrbit() {
    if (!this.pose || this.destroyed) return;
    this.resetCamOffset();
    this.pose = this.viewPose(this.viewName);
    if (this.camera.position.distanceTo(this.pose.position) < 1e-3) return;
    this.tweenTo(this.pose.position, this.reducedMotion ? 0.001 : 1.6);
    this.app.invalidate();
  }

  isAnimating() { return !!this.tween; }

  resize() {
    if (!this.pose) return;
    this.camera.position.sub(this.camOff);
    this.camOff.set(0, 0, 0);
    const prev = this.pose;
    this.pose = this.viewPose(this.viewName);
    if (!this.tween && prev && this.camera.position.distanceTo(prev.position) < 1e-3) {
      this.camera.position.copy(this.pose.position);
      this.camera.lookAt(this.pose.target);
    }
    this.applyShift();
    this.camera.updateProjectionMatrix();
    const px = (this.app.canvas.height || 600) * (this.app.canvas.renderer.pixelRatio || 1);
    this.motes.material.uniforms.uScale.value = px * 1.9;
  }

  setBand(y, on = 1) {
    this.band.position.y = y;
    this.band.visible = on > 0.01;
    this.mats.bandU.uBandY.value = y;
    this.mats.bandUM.uBandY.value = 2 * FLOOR_Y - y;
    this.mats.bandU.uBandOn.value = on;
    this.mats.bandUM.uBandOn.value = on * 0.5;
    this.band.userData.light.intensity = 1.6 * on;
  }

  setGlint(pos, on) {
    for (const [u, k] of [[this.mats.bandU, 1], [this.mats.bandUM, 0.4]]) { u.uGlint.value = pos; u.uGlintOn.value = on * k; }
  }

  // The canvas fades in with the page; the entrance starts when it becomes visible (or after 5 s regardless).
  canvasVisible() {
    if (this.services.hero) return true;
    return parseFloat(this.app.canvas.element.style.opacity) > 0.02;
  }

  // Jump the clock (for deterministic captures) and render.
  seek(t) {
    this.started = true; this.frozen = true;
    this.age = t;
    this.app.pause();
    this.app.render(0);
  }

  update(dt, time) {
    if (!this.mark) return;
    if (this.tween) {
      const tw = this.tween;
      tw.t = Math.min(1, tw.t + dt / tw.duration);
      const k = easeInOut(tw.t);
      const a = tw.from.clone().sub(this.target), b = tw.to.clone().sub(this.target);
      const len = THREE.MathUtils.lerp(a.length(), b.length(), k);
      const dir = a.normalize().lerp(b.normalize(), k).normalize();
      this.camera.position.copy(this.target).addScaledVector(dir, len);
      this.camOff.set(0, 0, 0);
      this.camera.lookAt(this.target);
      if (tw.t >= 1) this.tween = null;
    }
    const rm = this.reducedMotion;
    if (!rm && !this.started) {
      this.waited = (this.waited || 0) + dt;
      if (this.canvasVisible() || this.waited > 5) this.started = true;
    }
    if (!rm && this.started && !this.frozen) this.age += dt;
    const a = rm ? 99 : (this.started ? this.age : -1);

    // scroll: how far the hero has scrolled away (0 at the top of the page, 1 when it is gone)
    let sp = 0;
    if (!rm) {
      if (this.services.scroll) sp = clamp01(this.services.scroll());
      else if (this.app.container) { const r = this.app.container.getBoundingClientRect(); sp = clamp01(-r.top / Math.max(1, r.height)); }
    }
    if (this.debugScroll != null) sp = this.debugScroll;
    this.scrollP += (sp - this.scrollP) * (rm || this.frozen ? 1 : 1 - Math.exp(-dt * 6));
    const sc = easeInOut(clamp01(this.scrollP));
    if (this.services.hero && Math.abs(sc - (this.shiftK || 0)) > 2e-3) { this.shiftK = sc; this.applyShift(); this.camera.updateProjectionMatrix(); }

    // ---- entrance: tab and stroke fly in and settle with an overshoot ----
    for (const name of ['tab', 'stroke']) {
      const g = this.pieces[name];
      if (!g) continue;
      const P = PIECES[name];
      const t = clamp01((a - P.delay) / P.dur);
      const e = easeOutBack(t, 1.5), r = easeOutCubic(t);
      g.position.set(g.userData.home.x + P.from[0] * (1 - e), g.userData.home.y + P.from[1] * (1 - e), g.userData.home.z + P.from[2] * (1 - e));
      g.rotation.set(P.spin[0] * (1 - r), P.spin[1] * (1 - r), P.spin[2] * (1 - r));
      g.scale.setScalar(a < 0 ? 0.001 : P.from0 + (1 - P.from0) * smooth(0, 0.55, t));
    }
    const idle = rm ? 0 : smooth(1.5, 3.4, a);
    const landed = clamp01((a - 1.5) / 0.9);

    // ---- calm idle: float, breathing, slow yaw, pointer parallax ----
    this.parallax.lerp(this.pointer, 1 - Math.exp(-dt * 2.5));
    const px = rm ? 0 : this.parallax.x, py = rm ? 0 : this.parallax.y;
    const entranceYaw = rm ? 0 : 0.9 * (1 - easeOutCubic(clamp01(a / 2.4)));
    const yaw = rm ? 0.16 : entranceYaw + idle * Math.sin(Math.max(0, a - 1.5) * Math.PI * 2 / 16) * 0.349 + px * 0.16 - sc * 0.95;
    this.mark.rotation.y = yaw;
    this.mark.rotation.x = rm ? 0 : py * 0.06 + idle * Math.sin(a * 0.43) * 0.025 + sc * 0.12;
    this.mark.position.y = rm ? 0 : idle * Math.sin(a * 0.72) * 0.022 + sc * 0.1;
    this.mark.position.x = sc * -0.08;
    this.mark.scale.setScalar((rm ? 1 : 1 + idle * Math.sin(a * 1.05) * 0.011) * (1 - 0.4 * sc));
    // the pieces breathe apart by a hair
    if (!rm && this.pieces.tab && this.pieces.stroke) {
      const br = idle * (0.5 + 0.5 * Math.sin(a * 1.05)) * 0.012;
      this.pieces.tab.position.x += -br * 0.6; this.pieces.tab.position.y += br;
      this.pieces.stroke.position.x += br * 0.5; this.pieces.stroke.position.y += -br * 0.4;
    }
    this.mirror.userData.sync();

    // ---- camera parallax and scroll recede (additive, so the orbit controls keep working) ----
    if (!this.tween) {
      this.camera.position.sub(this.camOff);
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
      const up = new THREE.Vector3(0, 1, 0).applyQuaternion(this.camera.quaternion);
      const dir = this.camera.position.clone().sub(this.target);
      const dist = dir.length();
      dir.normalize();
      this.camOff.copy(right).multiplyScalar(px * 0.11).addScaledVector(up, -py * 0.06).addScaledVector(dir, dist * 0.3 * sc);
      this.camera.position.add(this.camOff);
      this.camera.lookAt(this.target);
    }

    // ---- notch glint (once), then the scan band sweeping up and down ----
    if (rm) {
      this.setGlint(-9, 0); this.flare.material.opacity = 0;
      this.setBand(9, 0); // calm, uncluttered frame
    } else {
      const g = clamp01((a - 1.7) / 1.5);
      const gp = THREE.MathUtils.lerp(-1.1, 1.1, easeInOut(g));
      const gOn = g > 0 && g < 1 ? 1 : 0;
      this.setGlint(gp, gOn * landed);
      const s0 = NOTCH[0] * GLINT_AXIS[0] + NOTCH[1] * GLINT_AXIS[1];
      const fl = gOn * Math.exp(-Math.pow((gp - s0) / 0.2, 2));
      this.flare.material.opacity = fl;
      this.flare.scale.setScalar(0.05 + 0.5 * fl);
      const bandOn = smooth(3.0, 3.8, a);
      this.setBand(Math.sin(Math.max(0, a - 3.4) * Math.PI * 2 / 7) * 0.58, bandOn);
    }
    this.scene.environmentRotation.y = 0.6 + (rm ? 0 : Math.sin(Math.max(0, a) * Math.PI * 2 / 18) * 0.12);

    // ---- motes ----
    const mu = this.motes.material.uniforms;
    mu.uTime.value = rm ? 3 : Math.max(0, a) + 5;
    mu.uAlpha.value = rm ? 0.7 : smooth(0.6, 2.4, a) * (1 - sc * 0.8);
    this.motes.position.y = this.mark.position.y * 0.5;
    // glow breathes a little with the band
    const post = this.services.post;
    if (post?.setGlow && !rm) post.mComposite.uniforms.uGlowAmt.value = (this.light ? (this.look.glowLight ?? 0.55) : (this.look.glowDark ?? 0.62)) * (0.92 + 0.08 * Math.sin(a * 1.05)) * (1 - sc * 0.5);
  }

  destroy() {
    this.destroyed = true;
    if (window.__veroHero === this) window.__veroHero = null;
    window.removeEventListener('pointermove', this.onPointer);
    this.scene.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
      mats.forEach(m => { for (const k in m) if (m[k]?.isTexture) m[k].dispose(); m.dispose(); });
    });
    this.envRT?.dispose();
  }
}
