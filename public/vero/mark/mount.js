/* Vero Scan live 3D mark. Own code, three.js r186 (MIT, see vendor/three/LICENSE).
 * Mounts the extruded V on <div data-vero-mark> (a canvas plus a flat SVG V as the fallback).
 *   - flat SVG stays when there is no WebGL, "save data", reduced motion, or the model fails to load
 *   - the live canvas starts when the loader hands over (event "pd:intro" / window.__pdIntroDone) so the
 *     loader's V and the hero V feel like one moment
 *   - rendering pauses off-screen and on a hidden tab; the mark recedes as the hero scrolls away
 * Options (data attributes): data-bg="#F6F5F7" (must equal the section background), data-view="Home Hero",
 *   data-shift="0" (horizontal lens shift, 0 centres the mark in its box).
 * Engine: engine.js (App), world.js (ModelWorld + VIEWS), post.js (HeroPost). Models: glb/. */
(function () {
  var els = [].slice.call(document.querySelectorAll("[data-vero-mark]"));
  if (!els.length) return;
  var clamp = function (x, a, b) { return Math.min(b === undefined ? 1 : b, Math.max(a === undefined ? 0 : a, x)); };
  var base = new URL("./", document.currentScript ? document.currentScript.src : location.href).href;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function hasGL() {
    try {
      var c = document.createElement("canvas"), gl = c.getContext("webgl2") || c.getContext("webgl");
      if (gl && gl.getExtension("WEBGL_lose_context")) gl.getExtension("WEBGL_lose_context").loseContext();
      return !!gl;
    } catch (e) { return false; }
  }
  if (reduced || !hasGL() || (navigator.connection && navigator.connection.saveData)) {
    els.forEach(function (el) { el.classList.add("is-flat"); });
    return;
  }

  var start = function (fn) {
    if (window.__pdIntroDone) return fn();
    var once = function () { document.removeEventListener("pd:intro", once); fn(); };
    document.addEventListener("pd:intro", once);
    setTimeout(function () { if (!window.__pdIntroDone) { document.removeEventListener("pd:intro", once); fn(); } }, 6500);
  };

  // warm the cache while the loader runs
  var mods = Promise.all([import(base + "engine.js"), import(base + "world.js"), import(base + "post.js")]);
  fetch(base + "glb/vero-mark-large.glb").catch(function () {});

  els.forEach(function (el) {
    var canvas = el.querySelector("canvas"), app = null, visible = true, dead = false;
    if (!canvas) return;
    var section = el.closest("section") || el;
    var progress = function () {
      var r = section.getBoundingClientRect();
      return clamp(-r.top / Math.max(1, r.height * 0.9));
    };
    mods.then(function (m) {
      start(function () {
        if (dead) return;
        var World = m[1].default, VIEWS = m[1].VIEWS, App = m[0].App, Post = m[2].default;
        var view = el.dataset.view || "Home Hero";
        if (VIEWS[view]) VIEWS[view] = Object.assign({}, VIEWS[view], { shift: [parseFloat(el.dataset.shift || "0"), 0], dist: parseFloat(el.dataset.dist || "2.75") });
        var bg = el.dataset.bg || "#F6F5F7";
        var dir = base + "glb/";
        try {
          app = new App({
            canvas: canvas, container: el, WorldClass: World,
            services: {
              modelUrl: dir + "vero-mark-large.glb",
              modelUrls: { small: dir + "vero-mark-small.glb", medium: dir + "vero-mark-medium.glb", large: dir + "vero-mark-large.glb" },
              viewsUrl: dir + "vero-mark-views.glb", view: view, background: bg,
              post: new Post({ background: bg, samples: 2 }), orbit: null, hero: true,
              look: { glowLight: 0, floorGlow: 0 },
              scroll: progress
            }
          });
          app.resize();
          app.world.ready.then(function (ok) {
            if (dead || !ok) { el.classList.add("is-flat"); return; }
            el.classList.add("is-live");
          });
        } catch (err) {
          console.warn("[vero-mark] live mark unavailable, keeping the flat mark", err && err.message);
          el.classList.add("is-flat");
          return;
        }
        var sync = function () { if (!app) return; if (visible && !document.hidden) app.resume(); else app.pause(); };
        if ("IntersectionObserver" in window) {
          new IntersectionObserver(function (e) { visible = e[0].isIntersecting; sync(); }, { threshold: 0 }).observe(el);
        }
      });
    }).catch(function (err) {
      console.warn("[vero-mark] could not load the engine, keeping the flat mark", err && err.message);
      el.classList.add("is-flat");
    });
  });
})();
