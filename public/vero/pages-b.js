/* Page author B: for-founders, for-investors, about, contact, waitlist.
   Classic script, load with defer after the bundle. Two jobs:
   1. Animate the product-UI mocks (.fx[data-fx]) once when they scroll into view. The markup is already the final state,
      so with prefers-reduced-motion (or no GSAP) nothing runs and the static screen is shown.
   2. Forms ([data-vero-form]): validation messages, and the VERO_FORM_ENDPOINT hook. While the endpoint is empty nothing is sent
      and the form says so (it never claims success). */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var g = window.gsap;

  function word(n) { return n >= 75 ? ["Healthy", "good"] : n >= 50 ? ["Needs work", "watch"] : ["At risk", "risk"]; }
  function tone(el, t) { if (!el) return; el.classList.remove("good", "watch", "risk", "none"); if (t) el.classList.add(t); }

  /* ------------------------------------------------------------ mocks */
  var builders = {};

  function paintScore(root, n) {
    var b = $("[data-fx-score]", root), w = $("[data-fx-word]", root) || $(".fx-score span", root), pin = $("[data-fx-pin]", root), ww = word(n);
    if (b) b.textContent = Math.round(n);
    if (pin) pin.style.left = n + "%";
    if (w) { w.textContent = ww[0]; tone(w, ww[1]); }
  }

  builders.issues = function (el) {
    var rows = $$(".fx-row", el), tabs = $$(".fx-tabs i", el), start = parseFloat($("[data-fx-score]", el).textContent), o = { v: start };
    var tl = g.timeline({ paused: true });
    tl.add(function () {
      o.v = start; paintScore(el, start);
      rows.forEach(function (r) { r.classList.remove("is-done", "is-dim"); });
      tabs.forEach(function (t, i) { t.classList.toggle("on", i === 0); });
    }).fromTo(rows, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .5, stagger: .1, ease: "power3.out", clearProps: "transform" });
    if (tabs.length) {
      tabs.slice(1).concat([tabs[0]]).forEach(function (t) {
        tl.add(function () {
          var c = t.getAttribute("data-c");
          tabs.forEach(function (x) { x.classList.toggle("on", x === t); });
          rows.forEach(function (r) { r.classList.toggle("is-dim", c !== "all" && (r.getAttribute("data-country") || "").indexOf(c) < 0); });
        }, "+=1.5");
      });
    } else {
      var first = rows[0], pts = parseFloat(first.getAttribute("data-points"));
      tl.add(function () { first.classList.add("is-done"); }, "+=.9")
        .to(o, { v: start + pts, duration: .8, ease: "power2.inOut", onUpdate: function () { paintScore(el, o.v); } }, "<.15");
    }
    return tl;
  };

  builders.docs = function (el) {
    var rows = $$(".fx-row.doc", el), miss = rows.filter(function (r) { return r.getAttribute("data-missing") === "1"; })[0];
    var cnt = $("[data-fx-count]", el), big = $("[data-fx-n]", el), bar = $("[data-fx-bar]", el), flow = $$(".fx-flow li", el), state = $("[data-fx-state], .fx-state", el);
    var tl = g.timeline({ paused: true });
    if (flow.length) {
      var texts = ["Missing", "We read it", "A lawyer read this"], tones = ["risk", "watch", "good"];
      tl.add(function () { flow.forEach(function (li) { li.classList.remove("done"); }); state.textContent = texts[0]; tone(state, tones[0]); });
      flow.forEach(function (li, i) { tl.add(function () { li.classList.add("done"); state.textContent = texts[i]; tone(state, tones[i]); }, i ? "+=1.1" : "+=.6"); });
      return tl;
    }
    var n0 = parseInt(cnt.textContent, 10), total = parseInt($(".fx-head p", el).textContent.replace(/^\D*\d+\D+(\d+).*$/, "$1"), 10) || rows.length;
    var st = miss && $("[data-fx-st]", miss), act = miss && $(".fx-act", miss), s0 = st && st.textContent, a0 = act && act.textContent, t0 = st && st.className;
    tl.add(function () {
      cnt.textContent = n0; if (big) big.textContent = n0; bar.style.width = Math.round(n0 / total * 100) + "%";
      if (st) { st.textContent = s0; st.className = t0; act.textContent = a0; }
    }).fromTo(rows, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .5, stagger: .1, ease: "power3.out", clearProps: "transform" });
    if (miss) {
      tl.add(function () { st.textContent = "Reading"; st.className = "fx-st none"; act.textContent = ""; }, "+=.9")
        .add(function () { st.textContent = "We read it"; st.className = "fx-st watch"; act.textContent = "View"; cnt.textContent = n0 + 1; if (big) big.textContent = n0 + 1; }, "+=1.1")
        .to(bar, { width: Math.round((n0 + 1) / total * 100) + "%", duration: .6, ease: "power2.out" }, "<");
    }
    return tl;
  };

  builders.one = function (el) {
    var parts = $$(".fx-tag, .fx-h, .fx-kv > div, .fx-clause > div, .fx-how, .fx-law", el), steps = $$(".fx-step", el), note = $("[data-fx-note]", el);
    var from = parseFloat(note.getAttribute("data-from")), to = parseFloat(note.getAttribute("data-to")), o = { v: from };
    var tl = g.timeline({ paused: true });
    tl.add(function () { o.v = from; paintScore(el, from); steps.forEach(function (s) { s.classList.remove("is-done"); }); })
      .fromTo(parts, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .45, stagger: .12, ease: "power3.out", clearProps: "transform" });
    steps.forEach(function (s, i) { tl.add(function () { s.classList.add("is-done"); }, i ? "+=.7" : "+=.8"); });
    tl.to(o, { v: to, duration: .9, ease: "power2.inOut", onUpdate: function () { paintScore(el, o.v); } }, "<.2");
    return tl;
  };

  builders.report = function (el) {
    var rows = $$(".fx-row.fx-area", el), o = { v: 0 }, tl = g.timeline({ paused: true });
    tl.add(function () { o.v = 0; paintScore(el, 0); rows.forEach(function (r) { $(".fx-num", r).textContent = "0"; $(".fx-st", r).textContent = ""; }); })
      .to(o, { v: 72, duration: 1.6, ease: "power2.out", onUpdate: function () { paintScore(el, o.v); } }, "+=.3");
    rows.forEach(function (r, i) {
      var to = parseFloat(r.getAttribute("data-score")), c = { v: 0 }, n = $(".fx-num", r), st = $(".fx-st", r), w = word(to);
      tl.fromTo(r, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .4, ease: "power3.out", clearProps: "transform" }, i ? "<.12" : "-=1.2")
        .to(c, { v: to, duration: .8, ease: "power2.out", onUpdate: function () { n.textContent = Math.round(c.v); } }, "<")
        .add(function () { st.textContent = w[0]; tone(st, w[1]); }, "<.6");
    });
    return tl;
  };

  builders.badge = function (el) {
    var tl = g.timeline({ paused: true });
    tl.add(function () { el.classList.remove("is-earned"); }).add(function () { el.classList.add("is-earned"); }, "+=1.2").to({}, { duration: .1 });
    return tl;
  };

  function initMocks() {
    var items = $$(".fx[data-fx]");
    if (!items.length) return;
    if (reduced || !g) { items.forEach(function (el) { if (el.getAttribute("data-fx") === "badge") el.classList.add("is-earned"); }); return; }
    items.forEach(function (el) {
      var b = builders[el.getAttribute("data-fx")];
      if (!b) return;
      var tl = b(el), on = false;
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (e) {
          var vis = e[0].isIntersecting;
          if (vis && !on) { on = true; tl.restart(); }
          else if (!vis && on) { on = false; tl.progress(1).pause(); }
        }, { threshold: .4 }).observe(el);
      } else tl.progress(1);
    });
  }

  /* ------------------------------------------------------------ forms */
  function labelText(field) {
    var l = $("label", field) || $("legend", field);
    return l ? l.textContent.trim().replace(/\?$/, "") : "this";
  }
  function setErr(field, msg) {
    var p = $(".fld-err", field), ctl = $("input, select", field);
    field.classList.toggle("has-err", !!msg);
    if (p) { p.hidden = !msg; p.textContent = msg || ""; }
    $$("input, select", field).forEach(function (c) { if (msg) c.setAttribute("aria-invalid", "true"); else c.removeAttribute("aria-invalid"); });
    return ctl;
  }
  function check(field) {
    var kind = field.getAttribute("data-req"), msg = "";
    if (kind === "group") { if (!$$("input:checked", field).length) msg = field.getAttribute("data-msg") || "Choose at least one option."; }
    else {
      var c = $("input, select", field), v = (c.value || "").trim();
      if (kind === "select") { if (!v) msg = "Choose one from the list."; }
      else if (!v) msg = kind === "email" ? "Enter your email address." : "Enter your " + labelText(field).toLowerCase().replace(/^your /, "") + ".";
      else if (kind === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = "That does not look like an email address. Check it and try again.";
    }
    setErr(field, msg);
    return msg ? field : null;
  }

  function initForm(form) {
    var fields = $$("[data-req]", form), out = $(".form-out", form), btn = $("button[type=submit]", form);
    function say(cls, html) { out.className = "form-out show " + cls; out.innerHTML = html; }
    fields.forEach(function (f) {
      $$("input, select", f).forEach(function (c) {
        c.addEventListener("input", function () { if (f.classList.contains("has-err")) check(f); });
        c.addEventListener("change", function () { if (f.classList.contains("has-err")) check(f); });
        if (f.getAttribute("data-req") === "email" || f.getAttribute("data-req") === "text") c.addEventListener("blur", function () { if (c.value.trim()) check(f); });
      });
    });
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      out.className = "form-out"; out.textContent = "";
      var bad = fields.map(check).filter(Boolean);
      if (bad.length) { var c = $("input, select", bad[0]); if (c) c.focus(); return; }
      var data = new URLSearchParams(), plain = [];
      $$("input, select", form).forEach(function (c) {
        if (c.type === "checkbox" && !c.checked) return;
        if (!c.name) return;
        data.append(c.name, c.value);
        if (c.name !== "bot-field" && c.value) plain.push(c.name.replace(/_/g, " ") + ": " + c.value);
      });
      if (data.get("bot-field")) { say("is-ok", form.getAttribute("data-sent")); return; }
      data.append("form", form.getAttribute("data-vero-form"));
      var ep = window.VERO_FORM_ENDPOINT || "";
      if (!ep) {
        var subject = encodeURIComponent("Vero Scan: " + form.getAttribute("data-vero-form")), body = encodeURIComponent(plain.join("\n"));
        say("is-off", form.getAttribute("data-offline") + ' <a href="mailto:hello@codeclauselegal.com?subject=' + subject + "&body=" + body + '">Email hello@codeclauselegal.com with these answers</a>.');
        return;
      }
      btn.disabled = true;
      fetch(ep, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json" }, body: data.toString() })
        .then(function (r) { if (!r.ok) throw new Error(r.status); say("is-ok", form.getAttribute("data-sent")); form.reset(); })
        .catch(function () { say("is-off", 'That did not send. Please try again, or email <a href="mailto:hello@codeclauselegal.com">hello@codeclauselegal.com</a>.'); })
        .then(function () { btn.disabled = false; });
    });
  }

  function init() {
    initMocks();
    $$("[data-vero-form]").forEach(initForm);
    $$("details.qa").forEach(function (d) { d.addEventListener("toggle", function () { if (window.ScrollTrigger) window.ScrollTrigger.refresh(); }); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
