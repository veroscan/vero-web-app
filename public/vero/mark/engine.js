// Vero Scan — WebGL app shell for hero models (own implementation, three.js r186, MIT).
// Interface expected by the site bundle:
//   new App({ canvas, container, WorldClass, services })
//   app.canvas.renderer.setPixelRatio(r) / .instance, app.canvas.camera.instance, app.canvas.update()
//   app.world (ready: Promise<boolean>, target, onView, syncOrbit), app.resize(), app.resume(), app.pause(), app.destroy(), app.setWorld(W)
import * as THREE from './vendor/three/three.module.min.js';

const MAX_PIXELS = 3.2e6; // device-pixel budget for the drawing buffer

class Renderer {
  constructor(canvas, { antialias = true } = {}) {
    this.instance = new THREE.WebGLRenderer({
      canvas, antialias, alpha: false, powerPreference: 'high-performance', stencil: false,
    });
    this.instance.outputColorSpace = THREE.SRGBColorSpace;
    this.instance.toneMapping = THREE.ACESFilmicToneMapping;
    this.instance.toneMappingExposure = 1;
    this.pixelRatio = 1;
  }
  setPixelRatio(ratio = window.devicePixelRatio) {
    this.pixelRatio = Math.max(0.5, Math.min(ratio || 1, 2));
    this.instance.setPixelRatio(this.pixelRatio);
  }
  setSize(w, h) { this.instance.setSize(w, h, true); }
}

class Camera {
  constructor() { this.instance = new THREE.PerspectiveCamera(30, 1, 0.05, 100); }
  resize(w, h) { this.instance.aspect = w / Math.max(1, h); this.instance.updateProjectionMatrix(); }
}

class Canvas {
  constructor(app, element, opts) {
    this.app = app;
    this.element = element;
    this.renderer = new Renderer(element, opts);
    this.camera = new Camera();
    this.width = 1;
    this.height = 1;
  }
  // Render one frame now (used after world swaps / while paused).
  update() { this.app.render(0); }
}

export class App {
  constructor({ canvas, container, WorldClass = null, services = {} } = {}) {
    this.container = container || canvas?.parentElement;
    this.services = services;
    this.services.app = this;
    this.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    this.canvas = new Canvas(this, canvas, { antialias: !services.post });
    this.time = 0;
    this.running = false;
    this.dirty = true;
    this.raf = 0;
    this.world = null;
    this.tick = this.tick.bind(this);
    this.onResize = () => this.resize();
    this.onVisibility = () => { if (document.hidden) cancelAnimationFrame(this.raf); else if (this.running) this.loop(); };
    this.ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(this.onResize) : null;
    this.ro?.observe(this.container);
    window.addEventListener('resize', this.onResize);
    document.addEventListener('visibilitychange', this.onVisibility);
    if (services.post?.setup) services.post.setup(this.canvas.renderer.instance);
    if (WorldClass) this.setWorld(WorldClass);
    this.resume();
  }

  setWorld(WorldClass) {
    if (this.world?.constructor === WorldClass) return this.world;
    this.world?.destroy?.();
    this.world = new WorldClass(this);
    this.resize();
    this.invalidate();
    return this.world;
  }

  invalidate() { this.dirty = true; }

  resize() {
    if (this.destroyed) return;
    const el = this.container;
    const w = Math.max(1, Math.round(el?.clientWidth || window.innerWidth));
    const h = Math.max(1, Math.round(el?.clientHeight || window.innerHeight));
    const r = this.canvas.renderer;
    const budget = Math.sqrt(MAX_PIXELS / (w * h));
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, budget));
    r.setSize(w, h);
    this.canvas.width = w;
    this.canvas.height = h;
    this.canvas.camera.resize(w, h);
    const pr = r.instance.getPixelRatio();
    this.services.post?.setSize?.(Math.round(w * pr), Math.round(h * pr));
    this.world?.resize?.(w, h);
    this.invalidate();
    if (!this.running) this.render(0);
  }

  render(dt) {
    if (this.destroyed || !this.world?.scene) return;
    const renderer = this.canvas.renderer.instance;
    const camera = this.canvas.camera.instance;
    this.world.update?.(dt, this.time);
    const post = this.services.post;
    if (post?.render) post.render(renderer, this.world.scene, camera, this.time);
    else renderer.render(this.world.scene, camera);
    this.dirty = false;
  }

  tick(now) {
    this.raf = requestAnimationFrame(this.tick);
    const t = now / 1000;
    const dt = Math.min(0.1, this.last ? t - this.last : 0.016);
    this.last = t;
    const orbitMoved = this.world?.pose ? (this.services.orbit?.update?.() ?? false) : false;
    const animating = !this.reducedMotion || this.world?.isAnimating?.();
    if (!this.reducedMotion) this.time += dt;
    if (animating || orbitMoved || this.dirty) this.render(dt);
  }

  loop() {
    cancelAnimationFrame(this.raf);
    this.last = 0;
    this.raf = requestAnimationFrame(this.tick);
  }

  resume() {
    if (this.destroyed || this.running) return;
    this.running = true;
    if (!document.hidden) this.loop();
  }

  pause() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  destroy() {
    if (this.destroyed) return;
    this.pause();
    this.destroyed = true;
    this.ro?.disconnect();
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.world?.destroy?.();
    this.services.post?.dispose?.();
    this.services.orbit?.dispose?.();
    this.canvas.renderer.instance.renderLists?.dispose?.();
  }
}

export default App;
