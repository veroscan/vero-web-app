/* Page author A: product, methodology, security, sample report, coverage. Classic script, `defer`, loaded AFTER vero/scenes.js (when the page has a [data-serve] block).
 * 1. Timelines for the animated product-UI mocks. A mock is an element with data-pa="name" (plays while on screen, loops) or a serve scene with data-scene="pa-name".
 *    Every mock is written in its FINAL state in the HTML; the timeline resets it, plays it and ends on that state. Under reduced motion only the end state is shown.
 * 2. Scales fixed-width (860px) mocks into frames (.pa-fitbox).
 * 3. Small in-view helpers: [data-pa-in] adds .is-in once, [data-pa-count] counts up, [data-pa-draw] draws a line. */
(function () {
  var g = window.gsap;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var H = (window.VeroScenes && window.VeroScenes.helpers) || {};
  var word = H.word || function (n) { return n >= 75 ? ["Healthy", "good"] : n >= 50 ? ["Needs work", "watch"] : ["At risk", "risk"]; };
  var tone = H.tone || function (el, t) { el.classList.remove("good", "watch", "risk", "none"); if (t) el.classList.add(t); };
  var reg = {};
  function mk(delay) { return g.timeline({ paused: true, repeat: -1, repeatDelay: delay == null ? 2.6 : delay }); }
  function txt(el, t) { if (el) el.textContent = t; }

  /* ---------------------------------------------------------------- scan */
  reg.scan = function (el) {
    var rows = $$(".pu-row", el), prog = $(".pa-prog i", el), cnt = $(".pa-count b", el), tl = mk(2.4), done = 0, n = rows.length;
    tl.add(function () {
      done = 0; txt(cnt, "0");
      rows.forEach(function (r) { r.classList.remove("is-working", "is-done"); r.classList.add("is-queued"); txt($("small", r), "In the queue"); var st = $(".pu-st", r); txt(st, "Waiting"); tone(st, "none"); });
    }).set(prog, { width: "0%" });
    rows.forEach(function (r, i) {
      tl.add(function () { r.classList.remove("is-queued"); r.classList.add("is-working"); txt($("small", r), r.dataset.working); txt($(".pu-st", r), "Reading"); }, i ? "+=.1" : "+=.5")
        .to(prog, { width: ((i + 1) / n * 100) + "%", duration: .8, ease: "power2.inOut" }, "<")
        .add(function () { r.classList.remove("is-working"); r.classList.add("is-done"); txt($("small", r), r.dataset.result); var st = $(".pu-st", r); txt(st, r.dataset.word); tone(st, r.dataset.tone); txt(cnt, ++done); }, "+=.8");
    });
    tl.to({}, { duration: 2.4 });
    return tl;
  };

  /* ---------------------------------------------------------------- score */
  reg.score = function (el) {
    var num = $(".pa-big .num", el), wd = $(".pa-big .word", el), pin = $(".ps-pin", el), rows = $$(".pa-areas li", el), tl = mk(), o = { v: 0 };
    var paint = function (v) { txt(num, Math.round(v)); if (pin) pin.style.left = v + "%"; var w = word(v); txt(wd, w[0]); tone(wd, w[1]); };
    tl.add(function () { o.v = 0; paint(0); rows.forEach(function (r) { txt($(".num", r), "0"); txt($(".pu-st", r), ""); }); })
      .set($$(".m i", el), { scaleX: 0, transformOrigin: "0 50%" }).set(rows, { opacity: 0, y: 8 })
      .to(o, { v: 72, duration: 1.8, ease: "power2.out", onUpdate: function () { paint(o.v); } }, "+=.4");
    rows.forEach(function (r, i) {
      var to = parseFloat(r.dataset.score), c = { v: 0 }, w = word(to), n = $(".num", r);
      tl.to(r, { opacity: 1, y: 0, duration: .5, ease: "expo.out" }, i === 0 ? "-=1.2" : "<.14")
        .to($(".m i", r), { scaleX: 1, duration: 1, ease: "power2.out" }, "<")
        .to(c, { v: to, duration: .9, ease: "power2.out", onUpdate: function () { txt(n, Math.round(c.v)); } }, "<")
        .add(function () { var s = $(".pu-st", r); txt(s, w[0]); tone(s, w[1]); }, "<.7");
    });
    tl.to({}, { duration: 2.2 });
    return tl;
  };

  /* ---------------------------------------------------------------- shared report */
  reg.report = function (el) {
    var num = $(".pa-big .num, .pa-col-l .pa-big .num", el), wd = $(".word", el), tl = mk(), o = { v: 0 };
    var rows = $$(".pa-checks .pu-row, .pa-checked li", el), areas = $$(".pa-areas li", el), open = $$(".pa-open > *", el), say = $(".pa-say", el), pin = $(".ps-pin", el);
    var paint = function (v) { txt(num, Math.round(v)); var w = word(v); if (wd) { txt(wd, w[0]); tone(wd, w[1]); } };
    tl.add(function () { o.v = 0; paint(0); })
      .set(rows.concat(areas, open, say ? [say] : []), { opacity: 0, y: 8 })
      .to(o, { v: 72, duration: 1.7, ease: "power2.out", onUpdate: function () { paint(o.v); } }, "+=.4");
    if (say) tl.to(say, { opacity: 1, y: 0, duration: .6, ease: "expo.out" }, "-=.5");
    if (open.length) tl.to(open, { opacity: 1, y: 0, duration: .5, ease: "expo.out", stagger: .12 }, "-=.2");
    if (areas.length) tl.to(areas, { opacity: 1, y: 0, duration: .45, ease: "expo.out", stagger: .09 }, "-=.3");
    tl.to(rows, { opacity: 1, y: 0, duration: .5, ease: "expo.out", stagger: .15 }, "-=.2");
    tl.to({}, { duration: 2.6 });
    return tl;
  };

  /* ---------------------------------------------------------------- one issue, with the fix */
  reg.issue = function (el) {
    var clause = $(".pa-paper .old span", el), fix = $(".pa-paper .new", el), num = $(".pa-score .num", el), btn = $(".pa-btn", el), tl = mk(2.8), o = { v: 72 };
    var paint = function (v) { txt(num, Math.round(v)); num.classList.toggle("good", v >= 75); };
    tl.add(function () { o.v = 72; paint(72); clause.classList.add("is-open-clause"); })
      .set(fix, { opacity: 0, y: 6 })
      .add(function () { clause.classList.remove("is-open-clause"); }, "+=1.1")
      .to(fix, { opacity: 1, y: 0, duration: .8, ease: "expo.out" }, "+=.7")
      .to(btn, { scale: 1.05, duration: .25, yoyo: true, repeat: 1, ease: "power2.inOut" }, "+=.6")
      .to(o, { v: 80, duration: .9, ease: "power2.inOut", onUpdate: function () { paint(o.v); } }, "-=.1")
      .to({}, { duration: 2.6 });
    return tl;
  };

  /* ---------------------------------------------------------------- fix list: tick, watch the score move */
  reg.issues = function (el) {
    var fixes = $$(".fix", el), numEl = $(".ps-sc b", el), wd = $(".ps-sc span", el), pin = $(".ps-pin", el), cap = $(".ps-hd h4", el), tl = mk(2.4), o = { v: 72 };
    var paint = function (v) { txt(numEl, Math.round(v)); if (pin) pin.style.left = v + "%"; var w = word(v); txt(wd, w[0]); tone(wd, w[1]); };
    var plan = function () { var n = fixes.filter(function (f) { return f.classList.contains("is-done"); }).length; txt(cap, n ? "Your plan: " + n + (n === 1 ? " fix" : " fixes") + " ticked" : "12 things to fix"); };
    tl.add(function () { o.v = 72; paint(72); fixes.forEach(function (f) { f.classList.remove("is-done"); }); plan(); });
    fixes.forEach(function (f, i) {
      tl.add(function () { f.classList.add("is-done"); plan(); }, i ? "+=.8" : "+=.9")
        .to(o, { v: "+=" + parseFloat(f.dataset.points), duration: .75, ease: "power2.inOut", onUpdate: function () { paint(o.v); } }, "<.15");
    });
    tl.to({}, { duration: 2.4 });
    return tl;
  };

  /* ---------------------------------------------------------------- verified badge */
  reg.verify = function (el) {
    var root = $(".ps-verify", el) || el, rows = $$(".pu-rows .pu-row", el), foot = $(".foot", el), tl = mk(2.4), read = { v: 3 };
    var locked = ["You’re at 72", "1 open", "3 of 9 read"], earned = ["You’re at 80", "None open", "9 of 9 read"], tones = ["watch", "risk", "watch"];
    var set = function (i, t, tn, met) { var st = $(".pu-st", rows[i]); txt(st, t); tone(st, tn); rows[i].classList.toggle("is-met", !!met); };
    tl.add(function () { root.classList.remove("is-earned"); read.v = 3; rows.forEach(function (r, i) { set(i, locked[i], tones[i], false); }); txt(foot, "Fixing the urgent issue clears the second one and takes your score to about 80."); });
    tl.add(function () { set(0, earned[0], "good", true); }, "+=1.1")
      .add(function () { set(1, earned[1], "good", true); }, "+=1")
      .to(read, { v: 9, duration: 1.4, ease: "none", onUpdate: function () { txt($(".pu-st", rows[2]), Math.round(read.v) + " of 9 read"); } }, "+=.6")
      .add(function () { set(2, earned[2], "good", true); }, ">")
      .add(function () { root.classList.add("is-earned"); txt(foot, "All three are done, so your public page and website badge can go live."); }, "+=.45")
      .to({}, { duration: 2.6 });
    return tl;
  };

  /* ---------------------------------------------------------------- documents vault */
  reg.vault = function (el) {
    var drop = $(".pa-drop", el), rd = $(".pa-read", el), found = $(".pa-found", el), btn = $(".pa-btn", drop), cnt = $(".pa-vhead .num", el), row = $$(".pu-rows .pu-row", el)[0], tl = mk(2.8);
    var st = $(".pu-st", row), sm = $("small", row);
    tl.add(function () { txt(cnt, "19"); txt(st, "Missing"); tone(st, "risk"); txt(sm, "Moves ownership of the code to the company"); rd.style.display = "block"; })
      .set([found, btn], { opacity: 0, y: 6 }).set(drop, { opacity: 1, height: "auto" })
      .from(drop, { opacity: 0, y: 10, duration: .5, ease: "expo.out" }, "+=.4")
      .add(function () { rd.style.display = "none"; }, "+=1.3")
      .to([found, btn], { opacity: 1, y: 0, duration: .5, ease: "expo.out", stagger: .15 })
      .to(btn, { scale: 1.06, duration: .22, yoyo: true, repeat: 1, ease: "power2.inOut" }, "+=1.1")
      .to(drop, { opacity: 0, duration: .4 }, "+=.1")
      .add(function () { txt(st, "We read it"); tone(st, "good"); txt(sm, "Signed by both on 3 November 2026"); txt(cnt, "20"); })
      .to({}, { duration: 2.6 });
    return tl;
  };

  /* ---------------------------------------------------------------- deadlines */
  reg.dates = function (el) {
    var rows = $$(".pa-date", el), btn = $(".pa-btn", el), tl = mk(2.8);
    tl.set(rows, { opacity: 0, y: 10 }).set(btn, { opacity: 0 });
    rows.forEach(function (r, i) { tl.to(r, { opacity: 1, y: 0, duration: .55, ease: "expo.out" }, i ? "<.28" : "+=.5"); });
    tl.to(btn, { opacity: 1, duration: .5 }, "+=.2").to({}, { duration: 3 });
    return tl;
  };

  /* ---------------------------------------------------------------- lawyer review */
  reg.review = function (el) {
    var cnt = $(".pa-read-n .num", el), bar = $(".pa-prog i", el), rows = $$(".pu-rows .pu-row", el), q = $$(".pa-queue li", el), tl = mk(2.8), o = { v: 0 };
    tl.add(function () { o.v = 0; txt(cnt, "0"); }).set(bar, { scaleX: 0, transformOrigin: "0 50%" }).set(rows.concat(q), { opacity: 0, y: 8 });
    rows.forEach(function (r, i) {
      tl.to(r, { opacity: 1, y: 0, duration: .55, ease: "expo.out" }, i ? "+=.45" : "+=.6")
        .to(o, { v: i + 1, duration: .5, ease: "none", onUpdate: function () { txt(cnt, Math.round(o.v)); } }, "<")
        .to(bar, { scaleX: (i + 1) / 3, duration: .5, ease: "power2.out" }, "<");
    });
    tl.to(q, { opacity: 1, y: 0, duration: .45, ease: "expo.out", stagger: .15 }, "+=.4").to({}, { duration: 2.8 });
    return tl;
  };

  /* ---------------------------------------------------------------- expose + controllers */
  window.PA = { reg: reg, mk: mk, $: $, $$: $$, txt: txt, word: word, tone: tone, reduced: reduced };

  function play(el, name) {
    var f = reg[name]; if (!f) return null;
    var tl = f(el); if (!tl) return null;
    if (reduced) { tl.progress(1).pause(); return tl; }
    if (!("IntersectionObserver" in window)) { tl.play(0); return tl; }
    new IntersectionObserver(function (e) { if (e[0].isIntersecting) { if (tl.progress() === 0 || tl.paused()) tl.play(); } else tl.pause(); }, { threshold: .3 }).observe(el);
    return tl;
  }
  window.PA.play = play;
  function init() {
    $$("[data-pa]").forEach(function (el) { if (!el.__pa) el.__pa = play(el, el.getAttribute("data-pa")); });

    /* serve scenes named pa-*: scenes.js has already built its controller, so fill the empty timeline slots */
    $$("[data-serve]").forEach(function (block) {
      var s = block.__serve; if (!s) return;
      $$(".scene", block).forEach(function (sc, i) {
        var name = (sc.getAttribute("data-scene") || "").replace(/^pa-/, ""), f = reg[name];
        if (!s.tls[i] && f && /^pa-/.test(sc.getAttribute("data-scene"))) {
          var tl = f(sc); s.tls[i] = tl;
          if (reduced) tl.progress(1).pause(); else tl.pause();
        }
      });
      if (!reduced) { var cur = $(".scene.is-active", block); var i = $$(".scene", block).indexOf(cur); if (s.tls[i] && s.tls[i].paused()) { /* controller resumes it on select/upd */ } }
    });

    /* in-view helpers */
    var ins = $$("[data-pa-in]");
    if (ins.length) {
      if (reduced || !("IntersectionObserver" in window)) ins.forEach(function (e) { e.classList.add("is-in"); });
      else { var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }); }, { threshold: .25 }); ins.forEach(function (e) { io.observe(e); }); }
    }
    $$("[data-pa-count]").forEach(function (e) {
      var to = parseFloat(e.getAttribute("data-pa-count")), dec = (e.getAttribute("data-pa-count").split(".")[1] || "").length, suf = e.getAttribute("data-suffix") || "";
      var set = function (v) { e.textContent = v.toFixed(dec) + suf; };
      if (reduced || !g || !("IntersectionObserver" in window)) { set(to); return; }
      set(0);
      var io2 = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io2.disconnect(); var o = { v: 0 }; g.to(o, { v: to, duration: 1.4, ease: "power2.out", onUpdate: function () { set(o.v); } }); } }, { threshold: .4 });
      io2.observe(e);
    });
    /* fixed-width mocks scaled into frames */
    var boxes = $$(".pa-fitbox");
    if (boxes.length) {
      var fit = function (b) { b.style.setProperty("--k", (b.clientWidth / 860).toFixed(4)); };
      if ("ResizeObserver" in window) { var ro = new ResizeObserver(function (es) { es.forEach(function (x) { fit(x.target); }); }); boxes.forEach(function (b) { ro.observe(b); fit(b); }); }
      else { boxes.forEach(fit); window.addEventListener("resize", function () { boxes.forEach(fit); }); }
    }
  }
  if (!g) return;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();


/* ---- methodology mocks */
(function () {
  var P = window.PA, g = window.gsap; if (!P || !g) return;
  var $ = P.$, $$ = P.$$, mk = P.mk;
  P.reg.worked = function (el) {
    var rows = $$(".pa-wk", el), c1 = $(".c1", el), c2 = $(".c2", el), v1 = $(".v1", el), tl = mk(3);
    tl.set(rows.concat([c1, c2]), { opacity: 0, y: 8 }).add(function () { v1.style.textDecoration = "none"; v1.style.color = "#1C1820"; });
    rows.forEach(function (r, i) { tl.to(r, { opacity: 1, y: 0, duration: .5, ease: "expo.out" }, i ? "<.32" : "+=.5"); });
    tl.to(c1, { opacity: 1, y: 0, duration: .5, ease: "expo.out" }, "+=.5")
      .to(c2, { opacity: 1, y: 0, duration: .6, ease: "expo.out" }, "+=1.1")
      .add(function () { v1.style.textDecoration = "line-through"; v1.style.color = "#6A6470"; }, "<")
      .to({}, { duration: 3 });
    return tl;
  };
  P.reg.weights = function (el) {
    var rows = $$(".pa-wt li", el), pin = $(".ps-pin", el), tl = mk(3), o = { v: 0 };
    tl.set($$(".m i", el), { scaleX: 0, transformOrigin: "0 50%" }).set(rows, { opacity: 0, y: 6 }).add(function () { pin.style.left = "0%"; });
    rows.forEach(function (r, i) { tl.to(r, { opacity: 1, y: 0, duration: .4, ease: "expo.out" }, i ? "<.12" : "+=.4").to($(".m i", r), { scaleX: 1, duration: .9, ease: "power2.out" }, "<"); });
    tl.to(o, { v: 72, duration: 1.4, ease: "power2.out", onUpdate: function () { pin.style.left = o.v + "%"; } }, "+=.3").to({}, { duration: 3 });
    return tl;
  };
  $$('[data-pa="worked"],[data-pa="weights"]').forEach(function (el) { if (!el.__pa) el.__pa = P.play(el, el.getAttribute("data-pa")); });
})();

/* ---- security mocks */
(function () {
  var P = window.PA, g = window.gsap; if (!P || !g) return;
  var $ = P.$, $$ = P.$$, mk = P.mk;
  function stagger(sel, d) {
    return function (el) {
      var items = $$(sel, el), tl = mk(d || 3);
      tl.set(items, { opacity: 0, y: 10 });
      items.forEach(function (r, i) { tl.to(r, { opacity: 1, y: 0, duration: .55, ease: "expo.out" }, i ? "<.3" : "+=.5"); });
      tl.to({}, { duration: 3 });
      return tl;
    };
  }
  P.reg.rise = stagger(".pu-row, .pa-body > .pa-sub");
  P.reg.access = stagger(".pu-row, .pa-log li, .pa-body > .pa-sub");
  P.reg.airead = stagger(".pa-file-line, .pa-facts li, .pu-row, .pa-body > .pa-sub");
  $$('[data-pa="rise"],[data-pa="access"],[data-pa="airead"]').forEach(function (el) { if (!el.__pa) el.__pa = P.play(el, el.getAttribute("data-pa")); });
})();

/* ---- coverage mocks */
(function () {
  var P = window.PA, g = window.gsap; if (!P || !g) return;
  var $ = P.$, $$ = P.$$, mk = P.mk;
  P.reg.cov = function (el) {
    var items = $$(".pu-row, .pa-body > .pa-sub", el), stamp = $(".pa-stamp", el), live = $(".pa-live", el), tl = mk(3);
    var head = [stamp, live].filter(Boolean);
    tl.set(items.concat(head), { opacity: 0, y: 8 });
    head.forEach(function (h) { tl.to(h, { opacity: 1, y: 0, duration: .6, ease: "expo.out" }, "+=.4"); });
    items.forEach(function (r, i) { tl.to(r, { opacity: 1, y: 0, duration: .55, ease: "expo.out" }, i ? "<.3" : "+=.2"); });
    tl.to({}, { duration: 3 });
    return tl;
  };
  $$('[data-pa="cov"]').forEach(function (el) { if (!el.__pa) el.__pa = P.play(el, "cov"); });
})();

