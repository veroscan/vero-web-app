/* Pages C (Insights hub, articles, privacy policy, terms of service, 404). Classic script, load with `defer` after the bundle.
 * 1. product-UI mocks (.iv, .nf-win): start their motion (class "go") when on screen and the loader has finished
 * 2. article share buttons: copy the page address / email it (no third-party share links)
 * 3. legal pages: highlight the contents link of the section being read
 * 4. 404: echo the address that was asked for
 * Everything is optional: without this script (or with reduced motion) the mocks show their final state. */
(function () {
  var W = window, D = document;
  var reduced = W.matchMedia && W.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || D).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); };

  /* ---- 1. mocks */
  function onIntro(fn) {                       // same hand-over the 3D mark uses
    if (W.__pdIntroDone) return fn();
    var once = function () { D.removeEventListener("pd:intro", once); fn(); };
    D.addEventListener("pd:intro", once);
    setTimeout(function () { D.removeEventListener("pd:intro", once); fn(); }, 6500);
  }
  var mocks = $$(".iv, .nf-win");
  var start = function (el) { el.classList.add("go"); };
  if (mocks.length) {
    if (reduced || !("IntersectionObserver" in W)) {
      mocks.forEach(start);
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          var el = e.target;
          if (el.closest("[data-hero]") || el.hasAttribute("data-hero")) onIntro(function () { setTimeout(function () { start(el); }, 500); });
          else start(el);
        });
      }, { threshold: 0.35 });
      mocks.forEach(function (m) { io.observe(m); });
      setTimeout(function () { mocks.forEach(start); }, 12000);   // never leave a mock hidden
    }
  }

  /* ---- 2. share */
  $$(".share-copy").forEach(function (b) { b.setAttribute("data-url", W.location.href); });
  $$(".share-mail").forEach(function (a) {
    a.href = "mailto:?subject=" + encodeURIComponent(a.getAttribute("data-subject") || D.title) + "&body=" + encodeURIComponent(W.location.href);
  });

  /* ---- 3. legal contents */
  var legal = $(".legal .prose");
  if (legal) {
    var links = $$(".legal .toc a");
    var targets = links.map(function (a) { return D.getElementById(a.getAttribute("href").slice(1)); });
    var ticking = false;
    var spy = function () {
      ticking = false;
      var cur = -1;
      targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top < 170) cur = i; });
      links.forEach(function (a, i) { a.classList.toggle("is-active", i === cur); });
    };
    var queue = function () { if (!ticking) { ticking = true; requestAnimationFrame(spy); } };
    W.addEventListener("scroll", queue, { passive: true });
    W.addEventListener("resize", queue);
    spy();
  }

  /* ---- 4. 404 */
  var path = $("[data-nf-path]");
  if (path) {
    var p = (W.location.pathname || "") + (W.location.search || "");
    if (p && !/^\/?404(\.html)?$/.test(p.replace(/^\//, "")) && p.length < 120) path.textContent = p;
  }
})();
