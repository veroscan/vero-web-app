/* Vero Scan loader. Classic script, loaded before the bundle.
 * Dots fly in and settle into the V mark, the count runs to 100 with four short messages, the V fills,
 * then the V itself becomes the window onto the page (the cut-out grows until it fills the screen).
 * The bundle calls  window.VeroLoader.run(loaderEl, onDone, heroIntro, gsap)  (see tools/rebrand.py).
 * Markup it drives: .loader > .ld-cv + .ld-ui (.ld-top, .ld-count .ld-num, .ld-status .ld-msg, .ld-line i).
 * The same V path is used by the page-transition canvas in the bundle and by the flat fallback mark. */
(function () {
  var V = "M14.7 0H51L35 26.5C31 32 26 35 19 35 8 35 0 27 0 17 0 8 6 2 14.7 0ZM97 0h35L74 92.6c-3.5 4.9-8.5 7.4-14 7.4-6 0-11.5-3-15-7.5L22.4 58.4C27 61.5 31.5 64 37.6 64c6.4 0 11.4-2.5 14.9-7.5L84 7c3-4 8-7 13-7Z";
  var MESSAGES = ["Reading the registers", "Matching the records", "Scoring your company", "Ready"];

  function run(el, done, intro, g) {
    var q = function (s, r) { return (r || el).querySelector(s); };
    var qa = function (s, r) { return Array.prototype.slice.call((r || el).querySelectorAll(s)); };
    var cv = q(".ld-cv"), cx = cv.getContext("2d"), num = q(".ld-num"), msg = q(".ld-msg"), bar = q(".ld-line i"), ui = q(".ld-ui");
    var dpr = Math.min(window.devicePixelRatio || 1, 2), W = el.clientWidth || window.innerWidth, H = el.clientHeight || window.innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var BG = "#1C1820";
    // V in unit space: x -1.06..1.06, y -0.8..0.8 (132 x 100 source box, 62 units = 1)
    var S = 1 / 62, vUnit = new Path2D();
    vUnit.addPath(new Path2D(V), { a: S, b: 0, c: 0, d: S, e: -66 * S, f: -50 * S });
    var probe = document.createElement("canvas").getContext("2d");

    var R = Math.min(W * 0.3, H * 0.3, 300), cxm = W / 2, cym = H / 2 - Math.min(24, H * 0.03);
    var step = Math.max(5.5, R / 21), cell = step / R, dots = [], row = 0, i, j, u, v;
    var palette = ["#D65C82", "#D65C82", "#E27D9B", "#F2B3C6", "#B03C64", "#FBEFF3"];
    for (v = -0.84; v < 0.84; v += cell * 0.866, row++) {
      for (u = -1.1 + (row % 2 ? cell / 2 : 0); u < 1.1; u += cell) {
        if (!probe.isPointInPath(vUnit, u, v)) continue;
        var a0 = Math.random() * Math.PI * 2, far = Math.hypot(W, H) * (0.55 + Math.random() * 0.4);
        var pc = (v + 0.8) / 1.6;
        dots.push({
          tx: cxm + u * R, ty: cym + v * R, a0: a0, far: far, spin: 2.2 + Math.random() * 2.4, dl: Math.random() * 0.45,
          r: step * (0.34 + Math.random() * 0.1),
          c: Math.random() < 0.14 ? palette[(Math.random() * palette.length) | 0] : (pc < 0.35 ? "#E27D9B" : pc < 0.7 ? "#D65C82" : "#C24A72")
        });
      }
    }
    var st = { p: 0, fill: 0, hole: 0, z: 1 };
    var ease = function (t) { return 1 - Math.pow(1 - t, 4); };

    function draw() {
      cx.clearRect(0, 0, W, H);
      var k, d;
      if (st.hole > 0) {
        // the V is a window: ink with a V-shaped cut-out of size R * z
        var P = new Path2D(), s = R * st.z;
        P.rect(0, 0, W, H);
        P.addPath(vUnit, { a: s, b: 0, c: 0, d: s, e: cxm, f: cym });
        cx.fillStyle = BG; cx.fill(P, "evenodd");
        return;
      }
      cx.fillStyle = BG; cx.fillRect(0, 0, W, H);
      for (k = 0; k < dots.length; k++) {
        d = dots[k];
        var t = Math.max(0, Math.min(1, (st.p - d.dl) / 0.55)), e = ease(t);
        if (t <= 0) continue;
        var dist = d.far * (1 - e), ang = d.a0 + d.spin * (1 - e);
        var x = d.tx + Math.cos(ang) * dist, y = d.ty + Math.sin(ang) * dist;
        var rr = d.r * (0.4 + 0.6 * e);
        if (x < -rr || y < -rr || x > W + rr || y > H + rr) continue;
        cx.globalAlpha = (0.35 + 0.65 * e) * (1 - st.fill * 0.55);
        cx.fillStyle = d.c; cx.beginPath(); cx.arc(x, y, rr, 0, 6.2832); cx.fill();
      }
      cx.globalAlpha = 1;
      if (st.fill > 0) {
        var gr = cx.createLinearGradient(0, cym - 0.8 * R, 0, cym + 0.8 * R);
        gr.addColorStop(0, "#E27D9B"); gr.addColorStop(0.5, "#D65C82"); gr.addColorStop(1, "#B03C64");
        cx.save(); cx.globalAlpha = st.fill; cx.translate(cxm, cym); cx.scale(R, R); cx.fillStyle = gr; cx.fill(vUnit); cx.restore();
        cx.globalAlpha = 1;
      }
    }

    el.classList.add("is-canvas");
    var shown = -1, c = { v: 0 }, over = false;
    var tl = g.timeline({ onUpdate: draw, onComplete: function () { over = true; done(); } });
    tl.to(st, { p: 1, duration: 2.1, ease: "power1.inOut" }, 0)
      .to(c, {
        v: 100, duration: 2.2, ease: "power2.inOut", onUpdate: function () {
          var n = Math.round(c.v);
          num.textContent = (n < 10 ? "00" : n < 100 ? "0" : "") + n;
          bar.style.transform = "scaleX(" + n / 100 + ")";
          var m = n >= 100 ? 3 : Math.floor(n / 100 * 3);
          if (m !== shown) { shown = m; g.fromTo(msg, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.45 }); msg.textContent = MESSAGES[m]; }
        }
      }, 0)
      .fromTo(qa(".ld-top span, .ld-count, .ld-status"), { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.06 }, 0.1)
      .to(st, { fill: 1, duration: 0.35, ease: "power2.out" }, 2.15)
      .to(ui, { opacity: 0, duration: 0.4, ease: "power2.in" }, 2.35)
      .add(function () { st.hole = 1; }, 2.5)
      .to(st, { z: 46, duration: 1.15, ease: "expo.in" }, 2.5)
      .add(intro, 3.25);
    el.addEventListener("click", function () { if (!over) tl.progress(0.97); });
  }
  window.VeroLoader = { run: run, V: V };
})();
