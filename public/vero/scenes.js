/* Vero Scan "serve" tabs: controller + product-UI scenes. Classic script, load with `defer` AFTER the bundle
 * (<script defer src="vero/scenes.js">) on any page that has a [data-serve] block. Needs window.gsap (from the bundle).
 *
 * Markup contract (same classes and hooks as the template's home block, see NOTES-components.md):
 *   section[data-serve] > .serve-grid > .serve-side (.serve-tabs > li > button.serve-tab[role=tab][aria-controls=scene-N])
 *                                       .serve-stage > article.scene#scene-N[data-scene="<name>"][data-time="9"]
 * A scene is a function  (sceneEl, helpers) -> paused GSAP timeline  registered with
 *     VeroScenes.register("name", fn)
 * The controller plays the active scene (looping), pauses the others, auto-advances after data-time seconds
 * (default 9), pauses while the pointer is over the stage or the block is off-screen, and under
 * prefers-reduced-motion shows each scene's final state without playing it. */
(function () {
  var g = window.gsap, ST = window.ScrollTrigger;
  if (!g) return;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var registry = {};

  var helpers = {
    $: $, $$: $$, gsap: g, reduced: reduced,
    count: function (obj, to, dur, onUpdate, ease) { return g.to(obj, { v: to, duration: dur, ease: ease || "power2.out", onUpdate: onUpdate }); },
    word: function (n) { return n >= 75 ? ["Healthy", "good"] : n >= 50 ? ["Needs work", "watch"] : ["At risk", "risk"]; },
    tone: function (el, tone) { el.classList.remove("good", "watch", "risk", "none"); if (tone) el.classList.add(tone); }
  };

  /* ---------------------------------------------------------------- 1. scan */
  registry.scan = function (el, h) {
    var rows = h.$$(".pu-row", el), now = h.$$(".ps-now span", el), lvl = h.$(".lvl", el), cnt = h.$(".ps-count b", el);
    var pct = [14, 36, 50, 64, 86, 100], tl = g.timeline({ paused: true, repeat: -1, repeatDelay: 2.4 }), done = 0;
    var show = function (i) { now.forEach(function (s, k) { g.to(s, { opacity: k === i ? 1 : 0, y: k === i ? 0 : 8, duration: .4, overwrite: true }); }); };
    var finish = function (r) {
      var st = h.$(".pu-st", r), sm = h.$("small", r);
      r.classList.remove("is-working"); r.classList.add("is-done");
      sm.textContent = r.dataset.result; st.textContent = r.dataset.word; h.tone(st, r.dataset.tone); cnt.textContent = ++done;
    };
    tl.add(function () {
      done = 0; cnt.textContent = "0";
      rows.forEach(function (r) { r.classList.remove("is-working", "is-done"); h.$("small", r).textContent = "In the queue"; var st = h.$(".pu-st", r); st.textContent = "Waiting"; h.tone(st, "none"); });
      now.forEach(function (s) { g.set(s, { opacity: 0, y: 8 }); });
    }).set(lvl, { y: 100 });
    rows.forEach(function (r, i) {
      tl.add(function () { r.classList.add("is-working"); h.$("small", r).textContent = r.dataset.working; h.$(".pu-st", r).textContent = "Reading"; show(i); }, i ? "+=.15" : "+=.5")
        .to(lvl, { y: 100 - pct[i], duration: .9, ease: "power2.inOut" }, "<")
        .add(function () { finish(r); }, "+=.95");
    });
    tl.add(function () { show(now.length - 1); }, "+=.1").to({}, { duration: 2.4 });
    return tl;
  };

  /* ---------------------------------------------------------------- 2. score and report */
  registry.score = function (el, h) {
    var num = h.$(".ps-num", el), pin = h.$(".ps-pin", el), word = h.$(".ps-word", el), head = h.$("h4", el), rows = h.$$(".pu-row", el);
    var tl = g.timeline({ paused: true, repeat: -1, repeatDelay: 2.6 }), o = { v: 0 };
    var paint = function (n) { num.textContent = Math.round(n); pin.style.left = n + "%"; var w = h.word(n); word.textContent = w[0]; h.tone(word, w[1]); };
    tl.add(function () { o.v = 0; paint(0); word.textContent = "At risk"; h.tone(word, "risk"); rows.forEach(function (r) { h.$(".num", r).textContent = "0"; h.$(".pu-st", r).textContent = ""; }); })
      .set(head, { opacity: 0, y: 12 }).set(rows, { opacity: 0, y: 10 })
      .to(o, { v: 72, duration: 1.8, ease: "power2.out", onUpdate: function () { paint(o.v); } }, "+=.5")
      .to(head, { opacity: 1, y: 0, duration: .7, ease: "expo.out" }, "-=.5");
    rows.forEach(function (r, i) {
      var to = parseFloat(r.dataset.score), c = { v: 0 }, n = h.$(".num", r), st = h.$(".pu-st", r), w = h.word(to);
      tl.to(r, { opacity: 1, y: 0, duration: .5, ease: "expo.out" }, i === 0 ? "-=.2" : "<.14")
        .to(c, { v: to, duration: .9, ease: "power2.out", onUpdate: function () { n.textContent = Math.round(c.v); } }, "<")
        .add(function () { st.textContent = w[0]; h.tone(st, w[1]); }, "<.7");
    });
    tl.to({}, { duration: 2.2 });
    return tl;
  };

  /* ---------------------------------------------------------------- 3. act */
  registry.act = function (el, h) {
    var fixes = h.$$(".fix", el), numEl = h.$(".ps-sc b", el), word = h.$(".ps-sc span", el), pin = h.$(".ps-pin", el), cap = h.$(".ps-hd h4", el);
    var tl = g.timeline({ paused: true, repeat: -1, repeatDelay: 2.4 }), o = { v: 72 }, left = fixes.length;
    var paint = function (n) { numEl.textContent = Math.round(n); pin.style.left = n + "%"; var w = h.word(n); word.textContent = w[0]; h.tone(word, w[1]); };
    var plan = function () { var n = fixes.filter(function (f) { return f.classList.contains("is-done"); }).length; cap.textContent = n ? "Your plan: " + n + (n === 1 ? " fix" : " fixes") + " ticked" : "12 things to fix"; };
    tl.add(function () { o.v = 72; paint(72); fixes.forEach(function (f) { f.classList.remove("is-done"); }); plan(); });
    fixes.forEach(function (f, i) {
      var pts = parseFloat(f.dataset.points);
      tl.add(function () { f.classList.add("is-done"); plan(); }, i ? "+=.85" : "+=.9")
        .to(o, { v: "+=" + pts, duration: .8, ease: "power2.inOut", onUpdate: function () { paint(o.v); } }, "<.15");
    });
    tl.to({}, { duration: 2.4 });
    return tl;
  };

  /* ---------------------------------------------------------------- 4. verify */
  registry.verify = function (el, h) {
    var root = h.$(".ps-verify", el) || el, rows = [].slice.call(h.$$(".pu-rows", el)[0].querySelectorAll(".pu-row")), foot = h.$(".foot", el), tl = g.timeline({ paused: true, repeat: -1, repeatDelay: 2.4 });
    var locked = ["You're at 72", "1 open", "3 of 9 read"], earned = ["You're at 80", "None open", "9 of 9 read"], tones = ["watch", "risk", "watch"];
    var set = function (i, txt, tone, met) { var st = h.$(".pu-st", rows[i]); st.textContent = txt; h.tone(st, tone); rows[i].classList.toggle("is-met", !!met); };
    var read = { v: 3 };
    tl.add(function () {
      root.classList.remove("is-earned"); read.v = 3;
      rows.forEach(function (r, i) { set(i, locked[i], tones[i], false); });
      foot.textContent = "Fixing the urgent issue clears the second one and takes your score to about 80.";
    });
    tl.add(function () { set(0, earned[0], "good", true); }, "+=1.1")
      .add(function () { set(1, earned[1], "good", true); }, "+=1")
      .to(read, { v: 9, duration: 1.6, ease: "none", onUpdate: function () { var n = Math.round(read.v); h.$(".pu-st", rows[2]).textContent = n + " of 9 read"; } }, "+=.7")
      .add(function () { set(2, earned[2], "good", true); }, ">")
      .add(function () { root.classList.add("is-earned"); foot.textContent = "All three are done, so your public page and website badge can go live."; }, "+=.45")
      .to({}, { duration: 2.6 });
    return tl;
  };

  /* ---------------------------------------------------------------- controller */
  function serve(block) {
    var scenes = $$(".scene", block), tabs = $$(".serve-tab", block), stage = $(".serve-stage", block), n = scenes.length;
    var bars = tabs.map(function (t) { return $(".bar i", t); });
    var cur = -1, prog = null, inView = false, hover = false;
    var tls = scenes.map(function (s) { var f = registry[s.getAttribute("data-scene")]; return f ? f(s, helpers) : null; });
    if (reduced) tls.forEach(function (t) { if (t) t.progress(1).pause(); });
    var upd = function () {
      var run = inView && !hover;
      if (prog) prog.paused(!run || reduced);
      var t = tls[cur]; if (t && !reduced) t.paused(!run);
    };
    var select = function (i) {
      i = (i + n) % n; if (i === cur) return;
      var prev = cur; cur = i;
      scenes.forEach(function (s, k) { s.hidden = false; s.classList.toggle("is-active", k === i); s.classList.toggle("is-leaving", k === prev); s.setAttribute("aria-hidden", String(k !== i)); });
      tabs.forEach(function (t, k) { t.setAttribute("aria-selected", String(k === i)); t.tabIndex = k === i ? 0 : -1; });
      bars.forEach(function (b) { if (b) g.set(b, { scaleX: 0 }); });
      if (!reduced) {
        tls.forEach(function (t, k) { if (!t) return; if (k === i) t.restart(); else g.delayedCall(1.2, function () { if (cur !== k) t.pause(); }); });
        if (prog) prog.kill();
        prog = g.fromTo(bars[i], { scaleX: 0 }, { scaleX: 1, duration: parseFloat(scenes[i].dataset.time) || 9, ease: "none", onComplete: function () { select(cur + 1); } });
      }
      var ul = tabs[i].closest("ul");
      if (ul && ul.scrollWidth > ul.clientWidth + 4) ul.scrollTo({ left: tabs[i].parentElement.offsetLeft - 16, behavior: reduced ? "auto" : "smooth" });
      upd();
    };
    tabs.forEach(function (t, k) {
      t.addEventListener("click", function () { if (k !== cur) select(k); });
      t.addEventListener("keydown", function (e) {
        if (["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].indexOf(e.key) < 0) return;
        e.preventDefault(); select(cur + (e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1)); tabs[cur].focus();
      });
    });
    stage.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") { hover = true; upd(); } });
    stage.addEventListener("pointerleave", function () { hover = false; upd(); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (e) { inView = e[0].isIntersecting; if (inView && cur < 0) select(0); else upd(); }, { threshold: .3 }).observe(stage);
    } else { inView = true; select(0); }
    scenes[0].classList.add("is-active");
    block.__serve = { tls: tls, select: select, hold: function () { if (prog) prog.kill(); } };   // test hook: seek a scene deterministically
    if (ST) ST.refresh();
  }

  window.VeroScenes = { register: function (name, fn) { registry[name] = fn; }, helpers: helpers };
  $$("[data-serve]").forEach(serve);
})();
