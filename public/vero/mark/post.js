// Vero Scan — hero post-processing (own implementation, three.js r186, MIT).
// Scene -> HDR MSAA target -> bloom-lite (threshold + separable blur at 1/4 res)
// -> tone mapping (ACES for the render studio, Khronos-neutral for the live site so the brand
// rose keeps its hue) -> subtle vignette and grain applied only to the model (the theme background
// stays pixel-exact so the canvas blends into the page), plus an optional soft backdrop glow that only
// lifts the background pixels (never the model).
import * as THREE from './vendor/three/three.module.min.js';

// ACES fitted (identical to three.js ACESFilmicToneMapping), as row-major 3x3.
const IN = [0.59719, 0.35458, 0.04823, 0.07600, 0.90834, 0.01566, 0.02840, 0.13383, 0.83777];
const OUT = [1.60475, -0.53108, -0.07367, -0.10208, 1.10813, -0.00605, -0.00327, -0.07276, 1.07602];
const mul = (m, v) => [0, 1, 2].map(i => m[i * 3] * v[0] + m[i * 3 + 1] * v[1] + m[i * 3 + 2] * v[2]);
const inv3 = m => {
  const [a, b, c, d, e, f, g, h, i] = m;
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
  const det = a * A + b * B + c * C;
  return [A, -(b * i - c * h), b * f - c * e, B, a * i - c * g, -(a * f - c * d), C, -(a * h - b * g), a * e - b * d].map(x => x / det);
};
const IN_INV = inv3(IN), OUT_INV = inv3(OUT);
const fit = v => (v * (v + 0.0245786) - 0.000090537) / (v * (0.983729 * v + 0.432951) + 0.238081);
const fitInv = y => {
  const a = 1 - 0.983729 * y, b = 0.0245786 - 0.432951 * y, c = -(0.000090537 + 0.238081 * y);
  return (-b + Math.sqrt(Math.max(0, b * b - 4 * a * c))) / (2 * a);
};
export const aces = (rgb, exposure = 1) => mul(OUT, mul(IN, rgb.map(x => x * exposure / 0.6)).map(fit)).map(x => Math.min(1, Math.max(0, x)));
// Linear HDR colour that ACES maps onto the given linear display colour.
export const acesInverse = (rgb, exposure = 1) => {
  const target = rgb.map(x => Math.min(0.98, Math.max(1e-5, x)));
  let x = mul(IN_INV, mul(OUT_INV, target).map(y => fitInv(Math.max(0, y)))).map(v => Math.max(0, v * 0.6 / exposure));
  for (let k = 0; k < 8; k++) { // refine (clamping can break exactness for saturated colours)
    const f = aces(x, exposure);
    x = x.map((v, j) => Math.max(0, v + (target[j] - f[j]) * 0.8));
  }
  return x;
};

// Khronos PBR Neutral tone mapping (CPU copy of the shader below) and its inverse for the clear colour.
const NS = 0.76, ND = 0.24;
export const neutral = rgb => {
  const x = Math.min(...rgb);
  const off = x < 0.08 ? x - 6.25 * x * x : 0.04;
  let c = rgb.map(v => v - off);
  const peak = Math.max(...c);
  if (peak < NS) return c;
  const np = 1 - ND * ND / (peak + ND - NS);
  c = c.map(v => v * np / peak);
  const g = 1 - 1 / (0.15 * (peak - np) + 1);
  return c.map(v => v + (np - v) * g);
};
export const neutralInverse = (rgb, exposure = 1) => {
  const t = rgb.map(v => Math.min(0.985, Math.max(1e-5, v)));
  const pk = Math.max(...t);
  let c = t;
  if (pk > NS) { const peak = ND * ND / (1 - pk) - ND + NS; c = t.map(v => v * peak / pk); }
  const m = Math.min(...c);
  const off = m < 0.04 ? Math.sqrt(m / 6.25) - m : 0.04;
  return c.map(v => Math.max(0, (v + off) / exposure));
};

const VERT = /* glsl */`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const THRESHOLD = /* glsl */`
uniform sampler2D tMap; uniform vec2 uTexel; uniform float uThreshold;
varying vec2 vUv;
void main() {
  vec3 c = vec3(0.0);
  c += texture2D(tMap, vUv + uTexel * vec2(-1.0, -1.0)).rgb;
  c += texture2D(tMap, vUv + uTexel * vec2( 1.0, -1.0)).rgb;
  c += texture2D(tMap, vUv + uTexel * vec2(-1.0,  1.0)).rgb;
  c += texture2D(tMap, vUv + uTexel * vec2( 1.0,  1.0)).rgb;
  c *= 0.25;
  float l = max(c.r, max(c.g, c.b));
  float k = smoothstep(uThreshold, uThreshold * 2.5, l);
  gl_FragColor = vec4(min(c * k, vec3(16.0)), 1.0);
}`;

const BLUR = /* glsl */`
uniform sampler2D tMap; uniform vec2 uDir;
varying vec2 vUv;
void main() {
  vec3 c = texture2D(tMap, vUv).rgb * 0.2270270270;
  c += texture2D(tMap, vUv + uDir * 1.3846153846).rgb * 0.3162162162;
  c += texture2D(tMap, vUv - uDir * 1.3846153846).rgb * 0.3162162162;
  c += texture2D(tMap, vUv + uDir * 3.2307692308).rgb * 0.0702702703;
  c += texture2D(tMap, vUv - uDir * 3.2307692308).rgb * 0.0702702703;
  gl_FragColor = vec4(c, 1.0);
}`;

const COMPOSITE = /* glsl */`
uniform sampler2D tScene; uniform sampler2D tBloom;
uniform vec3 uBg; uniform float uBloom; uniform float uExposure;
uniform float uVignette; uniform float uGrain; uniform float uTime; uniform vec2 uRes;
uniform float uTone; uniform vec3 uGlowCol; uniform vec2 uGlowPos; uniform float uGlowRad; uniform float uGlowAmt;
varying vec2 vUv;
vec3 neutralTM(vec3 color) {
  const float startCompression = 0.76;
  const float desaturation = 0.15;
  float x = min(color.r, min(color.g, color.b));
  float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
  color -= offset;
  float peak = max(color.r, max(color.g, color.b));
  if (peak < startCompression) return color;
  const float d = 1.0 - startCompression;
  float newPeak = 1.0 - d * d / (peak + d - startCompression);
  color *= newPeak / peak;
  float g = 1.0 - 1.0 / (desaturation * (peak - newPeak) + 1.0);
  return mix(color, vec3(newPeak), g);
}
vec3 fitRRT(vec3 v) {
  vec3 a = v * (v + 0.0245786) - 0.000090537;
  vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081;
  return a / b;
}
vec3 aces(vec3 color) {
  const mat3 IM = mat3(vec3(0.59719, 0.07600, 0.02840), vec3(0.35458, 0.90834, 0.13383), vec3(0.04823, 0.01566, 0.83777));
  const mat3 OM = mat3(vec3(1.60475, -0.10208, -0.00327), vec3(-0.53108, 1.10813, -0.07276), vec3(-0.07367, -0.00605, 1.07602));
  color *= uExposure / 0.6;
  return clamp(OM * fitRRT(IM * color), 0.0, 1.0);
}
vec3 toSRGB(vec3 c) {
  return mix(c * 12.92, pow(c, vec3(1.0 / 2.4)) * 1.055 - 0.055, step(0.0031308, c));
}
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
void main() {
  vec3 hdr = texture2D(tScene, vUv).rgb + texture2D(tBloom, vUv).rgb * uBloom;
  vec3 col = uTone > 0.5 ? toSRGB(clamp(neutralTM(hdr * uExposure), 0.0, 1.0)) : toSRGB(aces(hdr));
  vec3 delta = col - uBg;
  vec2 q = vUv - 0.5;
  float vig = 1.0 - uVignette * smoothstep(0.25, 0.85, length(q * vec2(uRes.x / uRes.y, 1.0) * 0.9));
  col = uBg + delta * vig;
  if (uGlowAmt > 0.0) { // soft backdrop: tints background pixels only
    float bgMask = 1.0 - clamp(length(delta) * 7.0, 0.0, 1.0);
    vec2 gq = (vUv - uGlowPos) * vec2(uRes.x / uRes.y, 1.0);
    float gl = pow(1.0 - smoothstep(0.0, uGlowRad, length(gq)), 1.7);
    col = mix(col, uGlowCol, gl * uGlowAmt * bgMask);
  }
  float n = hash(gl_FragCoord.xy + fract(uTime * 7.31) * 113.0) - 0.5;
  col += n * (0.6 / 255.0 + uGrain * clamp(length(delta) * 4.0, 0.0, 1.0));
  gl_FragColor = vec4(col, 1.0);
}`;

const quad = () => {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
  return g;
};

export default class HeroPost {
  constructor({ background = '#121314', theatre = null, bloom = 0.55, vignette = 0.22, grain = 0.035, exposure = 1, samples = 4, tone = 'aces' } = {}) {
    this.theatre = theatre;
    this.tone = tone;
    this.samples = samples;
    this.exposure = exposure;
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.mesh = new THREE.Mesh(quad(), null);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);
    const mat = (fragmentShader, uniforms) => new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader, uniforms, depthTest: false, depthWrite: false, toneMapped: false });
    this.mThreshold = mat(THRESHOLD, { tMap: { value: null }, uTexel: { value: new THREE.Vector2() }, uThreshold: { value: 1.1 } });
    this.mBlur = mat(BLUR, { tMap: { value: null }, uDir: { value: new THREE.Vector2() } });
    this.mComposite = mat(COMPOSITE, {
      tScene: { value: null }, tBloom: { value: null }, uBg: { value: new THREE.Vector3() },
      uBloom: { value: bloom }, uExposure: { value: exposure }, uVignette: { value: vignette },
      uGrain: { value: grain }, uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) },
      uTone: { value: tone === 'neutral' ? 1 : 0 }, uGlowCol: { value: new THREE.Vector3(0.2, 0.1, 0.14) }, uGlowPos: { value: new THREE.Vector2(0.5, 0.5) }, uGlowRad: { value: 0.9 }, uGlowAmt: { value: 0 },
    });
    this.clearColor = new THREE.Color();
    this.setBackground(background);
    this.width = 0;
    this.height = 0;
  }

  // background: any CSS colour string. The canvas output matches it exactly.
  setBackground(css) {
    const c = new THREE.Color();
    try { c.setStyle(css || '#121314', THREE.SRGBColorSpace); } catch { c.set(0x121314); }
    const srgb = c.clone().convertLinearToSRGB(); // c is linear working space; get display values
    this.mComposite.uniforms.uBg.value.set(srgb.r, srgb.g, srgb.b);
    const lin = this.tone === 'neutral' ? neutralInverse([c.r, c.g, c.b], this.exposure) : acesInverse([c.r, c.g, c.b], this.exposure);
    this.clearColor.setRGB(lin[0], lin[1], lin[2], THREE.LinearSRGBColorSpace);
    // bloom must ignore the (HDR) background: a white page would otherwise glow over the model
    this.mThreshold.uniforms.uThreshold.value = Math.max(1.1, 1.08 * Math.max(this.clearColor.r, this.clearColor.g, this.clearColor.b));
    this.background = css;
  }

  // Live-site look: { tone, exposure, bloom, vignette, grain }. Re-derives the clear colour so the background stays exact.
  setLook({ tone, exposure, bloom, vignette, grain } = {}) {
    const u = this.mComposite.uniforms;
    if (tone) { this.tone = tone; u.uTone.value = tone === 'neutral' ? 1 : 0; }
    if (exposure != null) { this.exposure = exposure; u.uExposure.value = exposure; }
    if (bloom != null) u.uBloom.value = bloom;
    if (vignette != null) u.uVignette.value = vignette;
    if (grain != null) u.uGrain.value = grain;
    this.setBackground(this.background);
  }

  // Backdrop glow: colour in display sRGB (0..1), centre in uv, radius in viewport heights.
  setGlow({ color, pos, radius, amount } = {}) {
    const u = this.mComposite.uniforms;
    if (color) u.uGlowCol.value.set(color[0], color[1], color[2]);
    if (pos) u.uGlowPos.value.set(pos[0], pos[1]);
    if (radius != null) u.uGlowRad.value = radius;
    if (amount != null) u.uGlowAmt.value = amount;
  }

  setup(renderer) {
    this.renderer = renderer;
    const opts = { type: THREE.HalfFloatType, depthBuffer: false, colorSpace: THREE.LinearSRGBColorSpace };
    this.rtScene = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: this.samples, colorSpace: THREE.LinearSRGBColorSpace });
    this.rtA = new THREE.WebGLRenderTarget(1, 1, opts);
    this.rtB = new THREE.WebGLRenderTarget(1, 1, opts);
  }

  setSize(w, h) {
    if (!this.rtScene) return;
    this.width = w; this.height = h;
    this.rtScene.setSize(w, h);
    const bw = Math.max(1, Math.round(w / 4)), bh = Math.max(1, Math.round(h / 4));
    this.rtA.setSize(bw, bh);
    this.rtB.setSize(bw, bh);
    this.mThreshold.uniforms.uTexel.value.set(1 / w, 1 / h);
    this.mComposite.uniforms.uRes.value.set(w, h);
    this.bw = bw; this.bh = bh;
  }

  pass(renderer, material, target) {
    this.mesh.material = material;
    renderer.setRenderTarget(target);
    renderer.render(this.scene, this.camera);
  }

  render(renderer, scene, camera, time = 0) {
    if (!this.rtScene) this.setup(renderer);
    const size = renderer.getDrawingBufferSize(new THREE.Vector2());
    if (size.x !== this.width || size.y !== this.height) this.setSize(size.x, size.y);
    const prevClear = renderer.getClearColor(new THREE.Color());
    const prevAlpha = renderer.getClearAlpha();
    const prevBg = scene.background;
    scene.background = null;
    renderer.setClearColor(this.clearColor, 1);
    renderer.setRenderTarget(this.rtScene);
    renderer.clear();
    renderer.render(scene, camera);
    scene.background = prevBg;
    // bloom-lite
    this.mThreshold.uniforms.tMap.value = this.rtScene.texture;
    this.pass(renderer, this.mThreshold, this.rtA);
    for (const r of [1, 2]) {
      this.mBlur.uniforms.tMap.value = this.rtA.texture;
      this.mBlur.uniforms.uDir.value.set(r / this.bw, 0);
      this.pass(renderer, this.mBlur, this.rtB);
      this.mBlur.uniforms.tMap.value = this.rtB.texture;
      this.mBlur.uniforms.uDir.value.set(0, r / this.bh);
      this.pass(renderer, this.mBlur, this.rtA);
    }
    const u = this.mComposite.uniforms;
    u.tScene.value = this.rtScene.texture;
    u.tBloom.value = this.rtA.texture;
    u.uTime.value = time;
    this.pass(renderer, this.mComposite, null);
    renderer.setClearColor(prevClear, prevAlpha);
  }

  dispose() {
    this.rtScene?.dispose(); this.rtA?.dispose(); this.rtB?.dispose();
    this.mThreshold.dispose(); this.mBlur.dispose(); this.mComposite.dispose();
    this.mesh.geometry.dispose();
  }
}
