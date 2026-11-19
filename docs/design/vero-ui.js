/* Vero Scan product prototype behaviour. Everything works on plain markup through data attributes, so the screens stay readable as HTML. */
(function () {
  'use strict';
  var KEY = 'vero-theme';
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function $(s, r) { return (r || document).querySelector(s); }
  function store(v) { try { if (v === undefined) return localStorage.getItem(KEY); localStorage.setItem(KEY, v); } catch (e) { return null; } }
  function soft(fn) { if (document.startViewTransition && !calm) document.startViewTransition(fn); else fn(); }
  function roots() { return $$('.vs,.ph'); }

  /* theme */
  function setTheme(root, t) { root.setAttribute('data-theme', t); document.documentElement.setAttribute('data-theme', t); }
  function initTheme(root) {
    if (root.dataset.themed) return; root.dataset.themed = '1';
    if (root.getAttribute('data-theme') === 'dark') { root.dataset.locked = '1'; document.documentElement.setAttribute('data-theme', 'dark'); return; }
    setTheme(root, store() === 'dark' ? 'dark' : 'light');
  }
  addEventListener('storage', function (e) { if (e.key === KEY && e.newValue) roots().forEach(function (r) { if (!r.dataset.locked) setTheme(r, e.newValue); }); });

  /* numbers that count */
  function tween(from, to, ms, each) {
    if (calm || from === to) { each(to); return; }
    var t0 = performance.now();
    (function step(now) { var k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3); each(Math.round(from + (to - from) * e)); if (k < 1) requestAnimationFrame(step); })(t0);
  }

  /* the score: number, ruler pin and 3D fill move together */
  function box(el) { return el.closest('[data-scorebox]') || $('[data-scorebox]'); }
  function showScore(b, v, keepBase) {
    if (!b) return;
    var n = $('[data-count]', b), pin = $('.pin', b), g = $('[data-v3d="fill"]', b);
    if (n) { var from = parseInt(n.textContent, 10) || 0; if (n._t) n._t.stop = true; var mine = { stop: false }; n._t = mine; tween(from, v, 700, function (x) { if (!mine.stop) n.textContent = x; }); }
    if (pin) pin.style.left = v + '%';
    if (g) g.setAttribute('data-value', v);
    if (!keepBase) b.dataset.current = v;
  }
  function initScore(b) {
    if (b.dataset.ready) return; b.dataset.ready = '1';
    var v = parseInt(b.dataset.scorebox, 10); b.dataset.current = v;
    var n = $('[data-count]', b), pin = $('.pin', b);
    if (n && !calm) { n.textContent = 0; tween(0, v, 1300, function (x) { n.textContent = x; }); }
    if (pin && !calm) { pin.style.left = '0%'; requestAnimationFrame(function () { requestAnimationFrame(function () { pin.style.left = v + '%'; }); }); }
  }
  function previewOn(el) {
    var b = box(el); if (!b) return;
    showScore(b, parseInt(el.dataset.previewScore, 10), true);
    var l = $('[data-previewline]', b); if (l) { l.textContent = el.dataset.previewText || ''; l.classList.add('on'); }
  }
  function previewOff(el) {
    var b = box(el); if (!b) return;
    showScore(b, parseInt(b.dataset.current, 10), true);
    var l = $('[data-previewline]', b); if (l) l.classList.remove('on');
  }

  /* filters */
  function runFilter(btn) {
    var bar = btn.closest('[data-filters]'), scope = $(bar.dataset.filters), f = btn.dataset.f, shown = 0;
    soft(function () {
      $$('.fbtn', bar).forEach(function (x) { x.classList.toggle('on', x === btn); x.setAttribute('aria-pressed', x === btn); });
      $$('[data-tags]', scope).forEach(function (r) { var on = f === 'all' || (' ' + r.dataset.tags + ' ').indexOf(' ' + f + ' ') > -1; r.hidden = !on; if (on) shown++; });
      $$('[data-group]', scope).forEach(function (g) { g.hidden = !$$('[data-tags]', g).some(function (r) { return !r.hidden; }); });
      var c = $('[data-filter-count]'); if (c) c.textContent = shown + (shown === 1 ? c.dataset.one : c.dataset.many);
    });
  }

  /* tick issues, see your projected score */
  function runPlan() {
    var ticks = $$('.tick[data-points]'), on = ticks.filter(function (t) { return t.checked; }), add = 0;
    on.forEach(function (t) { add += parseInt(t.dataset.points, 10); });
    var b = $('[data-scorebox]'), base = b ? parseInt(b.dataset.scorebox, 10) : 72, to = Math.min(100, base + add), bar = $('.planbar');
    if (bar) {
      bar.classList.toggle('on', on.length > 0);
      var c = $('[data-plan-count]', bar), s = $('[data-plan-score]', bar), m = $('[data-plan-msg]', bar);
      if (c) c.textContent = on.length + (on.length === 1 ? ' fix' : ' fixes');
      if (s) s.textContent = to;
      if (m) m.textContent = to >= 80 ? 'That reaches the level for verification.' : (80 - to) + ' more points to reach verification.';
    }
    if (b) showScore(b, to);
  }

  /* search everything */
  var PAGES = [['Home', 'Your score', 'Main'], ['All issues', '12 to fix', 'Issues'], ['Your lead developer hasn’t signed the code over', 'Urgent issue', 'Issue'], ['UK confirmation statement', 'Overdue', 'Deadlines'], ['Delaware franchise tax', 'Due 1 March', 'Deadlines'], ['Nigeria data protection audit', 'Due 31 March', 'Deadlines'], ['Intellectual property', 'Area, at risk', 'Area'], ['Documents', '19 of 31 in place', 'Documents'], ['Add a document', 'Upload or connect', 'AddDocument'], ['Deadlines', 'Every date', 'Deadlines'], ['Kestrel Pay Inc.', 'Delaware records', 'RecordsDelaware'], ['Kestrel Pay UK Ltd', 'UK records', 'RecordsUK'], ['Kestrel Pay Nigeria Ltd', 'Nigeria records', 'RecordsNigeria'], ['Lawyer review', '3 of 9 read', 'LawyerReview'], ['Book a lawyer', '30 minutes', 'BookLawyer'], ['Verified badge', 'What you need', 'Badge'], ['Shared report', 'What investors see', 'SharedReport'], ['Settings and team', 'Account', 'Settings'], ['Plan', 'Free, Growth, Scale', 'Plan']];
  function openPalette() {
    if ($('.pal-scrim')) return;
    var root = $('.vs,.ph') || document.body, scrim = document.createElement('div'), sel = 0;
    scrim.className = 'pal-scrim';
    scrim.innerHTML = '<div class="pal" role="dialog" aria-label="Search"><input type="text" placeholder="Search issues, documents and deadlines" aria-label="Search"><ul></ul></div>';
    root.appendChild(scrim);
    var input = $('input', scrim), ul = $('ul', scrim);
    function draw() {
      var q = input.value.trim().toLowerCase(), list = PAGES.filter(function (p) { return !q || (p[0] + ' ' + p[1]).toLowerCase().indexOf(q) > -1; });
      if (sel >= list.length) sel = Math.max(0, list.length - 1);
      ul.innerHTML = list.length ? list.map(function (p, i) { return '<li><a href="' + p[2] + '.dc.html" class="' + (i === sel ? 'sel' : '') + '">' + p[0] + '<span>' + p[1] + '</span></a></li>'; }).join('') : '<li class="small" style="padding:14px 16px">Nothing matches that.</li>';
    }
    function close() { scrim.remove(); }
    input.addEventListener('input', function () { sel = 0; draw(); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); var n = $$('a', ul).length; if (n) sel = (sel + (e.key === 'ArrowDown' ? 1 : n - 1)) % n; draw(); }
      if (e.key === 'Enter') { var a = $('a.sel', ul); if (a) a.click(); }
    });
    scrim.addEventListener('mousedown', function (e) { if (e.target === scrim) close(); });
    draw(); input.focus();
  }

  /* question flow */
  function initFlow(f) {
    if (f.dataset.ready) return; f.dataset.ready = '1';
    var steps = $$('[data-step]', f), i = 0, bar = $('[data-flow-bar]'), label = $('[data-flow-label]');
    function show(n) {
      i = Math.max(0, Math.min(steps.length - 1, n));
      steps.forEach(function (s, x) { s.hidden = x !== i; });
      var total = parseInt(f.dataset.flow, 10), first = parseInt(f.dataset.first || 1, 10), now = first + i;
      if (bar) bar.style.width = (now / total * 100) + '%';
      if (label) label.textContent = 'Question ' + now + ' of ' + total;
    }
    f._next = function () { if (i < steps.length - 1) show(i + 1); else { var go = $('[data-flow-end]', f); if (go) location.href = go.getAttribute('href'); } };
    f._back = function () { if (i > 0) show(i - 1); else { var b = $('[data-flow-start]', f); if (b) location.href = b.getAttribute('href'); } };
    f._step = function () { return steps[i]; };
    show(0);
  }

  /* live scan */
  function initScan(list) {
    if (list.dataset.ready) return; list.dataset.ready = '1';
    if (calm) return;
    var rows = $$('[data-result]', list), total = parseInt(list.dataset.scan, 10), done = 0;
    var count = $('[data-scan-count]'), fill = $('[data-v3d="fill"]'), title = $('[data-scan-title]'), end = $('[data-scan-end]');
    rows.forEach(function (r) { r.dataset.res = r.dataset.result; $('.row-s', r).textContent = 'Up next'; var st = $('.st', r); st.textContent = 'Waiting'; st.className = 'st none'; });
    if (end) end.setAttribute('aria-disabled', 'true');
    if (fill) fill.setAttribute('data-value', 2);
    function tick() {
      if (done >= rows.length) {
        if (title) title.textContent = 'Scan finished';
        if (count) count.textContent = total + ' of ' + total + ' checks done';
        if (end) end.setAttribute('aria-disabled', 'false');
        return;
      }
      var r = rows[done], st = $('.st', r);
      $('.row-s', r).textContent = r.dataset.working || 'Checking now'; st.textContent = 'Checking'; st.className = 'st none';
      setTimeout(function () {
        $('.row-s', r).textContent = r.dataset.res; st.textContent = r.dataset.word || 'Done'; st.className = 'st ' + (r.dataset.tone || 'good');
        done++;
        var c = Math.round(done / rows.length * total);
        if (count) count.textContent = c + ' of ' + total + ' checks done';
        if (fill) fill.setAttribute('data-value', Math.round(c / total * 100));
        setTimeout(tick, 260);
      }, 900 + Math.random() * 500);
    }
    setTimeout(tick, 900);
  }

  /* dropping a file */
  function runDrop(zone) {
    var host = zone.closest('[data-dropflow]'), steps = $$('[data-state]', host);
    function to(name) { steps.forEach(function (s) { s.hidden = s.dataset.state !== name; }); }
    to('up');
    var m = $('.meter i', host), p = 0;
    (function grow() {
      p = Math.min(100, p + 9 + Math.random() * 16); if (m) m.style.width = p + '%';
      if (p < 100) return setTimeout(grow, calm ? 0 : 150);
      to('read'); setTimeout(function () { to('done'); }, calm ? 0 : 1300);
    })();
  }

  /* without 3D, the flat V still shows the level */
  var fbN = 0;
  function initFallback(g) {
    if (g.dataset.fb) return;
    var svg = $('.v3d-fallback svg', g), path = svg && $('path', svg);
    g.dataset.fb = '1';
    if (!path || $('clipPath', svg)) return; /* a screen with its own level drawing keeps it */
    var ns = 'http://www.w3.org/2000/svg', id = 'vfb' + (++fbN);
    var defs = document.createElementNS(ns, 'defs'), cp = document.createElementNS(ns, 'clipPath'), rect = document.createElementNS(ns, 'rect');
    cp.setAttribute('id', id); rect.setAttribute('width', 132); rect.setAttribute('height', 100);
    cp.appendChild(rect); defs.appendChild(cp); svg.insertBefore(defs, svg.firstChild);
    var back = path.cloneNode(true); back.style.fill = 'var(--line)'; svg.insertBefore(back, path);
    path.setAttribute('clip-path', 'url(#' + id + ')');
    function set() { var v = Math.max(0, Math.min(100, parseFloat(g.getAttribute('data-value')) || 0)); rect.setAttribute('y', 100 - v); }
    set();
    new MutationObserver(set).observe(g, { attributes: true, attributeFilter: ['data-value'] });
  }

  /* one pass over anything new */
  function enhance() {
    roots().forEach(initTheme);
    $$('[data-v3d="fill"]').forEach(initFallback);
    $$('[data-scorebox]').forEach(initScore);
    $$('[data-flow]').forEach(initFlow);
    $$('[data-scan]').forEach(initScan);
    $$('[data-blurin]').forEach(function (h) {
      if (h.dataset.ready) return; h.dataset.ready = '1'; if (calm) return;
      var words = h.textContent.trim().split(/\s+/), d = parseFloat(h.dataset.blurin) || 0;
      h.setAttribute('aria-label', words.join(' ')); h.textContent = '';
      words.forEach(function (w, i) { var s = document.createElement('span'); s.className = 'bi'; s.setAttribute('aria-hidden', 'true'); s.style.animationDelay = (d + i * 0.07) + 's'; s.textContent = w; h.appendChild(s); h.appendChild(document.createTextNode(' ')); });
    });
    if ('IntersectionObserver' in window) $$('[data-redline]').forEach(function (r) {
      if (r.dataset.ready) return; r.dataset.ready = '1';
      new IntersectionObserver(function (e, o) { if (e[0].isIntersecting) { r.classList.add('on'); o.disconnect(); } }, { threshold: .35 }).observe(r);
    }); else $$('[data-redline]').forEach(function (r) { r.classList.add('on'); });
  }

  /* clicks */
  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target : e.target.parentElement; if (!t) return;
    var x;
    if ((x = t.closest('[data-theme-toggle]'))) { var r = x.closest('.vs,.ph') || $('.vs,.ph'), next = r.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'; soft(function () { setTheme(r, next); }); if (!r.dataset.locked) store(next); return; }
    if (t.closest('[data-search]')) { openPalette(); return; }
    if ((x = t.closest('.fbtn[data-f]'))) { runFilter(x); return; }
    if ((x = t.closest('[data-toast]'))) { var old = $('.toast'); if (old) old.remove(); var d = document.createElement('div'); d.className = 'toast'; d.setAttribute('role', 'status'); d.textContent = x.dataset.toast; ($('.vs,.ph') || document.body).appendChild(d); setTimeout(function () { d.remove(); }, 2400); }
    if ((x = t.closest('[data-flow-next]'))) { e.preventDefault(); x.closest('[data-flow]')._next(); return; }
    if ((x = t.closest('[data-flow-back]'))) { e.preventDefault(); x.closest('[data-flow]')._back(); return; }
    if ((x = t.closest('.opt'))) {
      if (x.getAttribute('role') === 'radio') { $$('.opt[role="radio"]', x.parentElement).forEach(function (o) { o.setAttribute('aria-checked', o === x); o.classList.toggle('on', o === x); }); }
      else if (x.hasAttribute('aria-pressed')) { var was = x.getAttribute('aria-pressed') === 'true'; x.setAttribute('aria-pressed', !was); x.classList.toggle('on', !was); }
      if (x.dataset.reveal) { $$(x.dataset.reveal).forEach(function (n) { n.hidden = false; }); }
      if (x.hasAttribute('data-pick')) { var fl = x.closest('[data-flow]'); if (fl && fl._next) setTimeout(fl._next, calm ? 0 : 260); }
      return;
    }
    if ((x = t.closest('[data-drop-start]'))) { e.preventDefault(); runDrop(x); return; }
    if ((x = t.closest('[data-drop-reset]'))) { e.preventDefault(); var h = x.closest('[data-dropflow]'); $$('[data-state]', h).forEach(function (s) { s.hidden = s.dataset.state !== 'idle'; }); var m = $('.meter i', h); if (m) m.style.width = '0'; return; }
    if ((x = t.closest('[data-set]'))) { var tgt = $(x.dataset.set), vals = x.dataset.values.split(','), now = tgt.getAttribute(x.dataset.attr), nv = now === vals[0] ? vals[1] : vals[0]; soft(function () { tgt.setAttribute(x.dataset.attr, nv); var lab = x.dataset.labels && x.dataset.labels.split(','); if (lab) x.textContent = lab[nv === vals[0] ? 0 : 1]; $$('[data-when]').forEach(function (n) { n.hidden = n.dataset.when !== nv; }); }); return; }
    if ((x = t.closest('[data-jump]'))) { e.preventDefault(); var row = $(x.dataset.jump); if (row) { row.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'center' }); row.classList.remove('flash'); void row.offsetWidth; row.classList.add('flash'); } }
  });
  document.addEventListener('change', function (e) { if (e.target.matches && e.target.matches('.tick[data-points]')) runPlan(); });
  ['mouseover', 'focusin'].forEach(function (n) { document.addEventListener(n, function (e) { var x = e.target.closest && e.target.closest('[data-preview-score]'); if (x && !x._p) { x._p = 1; previewOn(x); } }); });
  ['mouseout', 'focusout'].forEach(function (n) { document.addEventListener(n, function (e) { var x = e.target.closest && e.target.closest('[data-preview-score]'); if (x && x._p && !(e.relatedTarget && x.contains(e.relatedTarget))) { x._p = 0; previewOff(x); } }); });

  /* drag a file onto a drop zone */
  ['dragenter', 'dragover'].forEach(function (n) { document.addEventListener(n, function (e) { var z = e.target.closest && e.target.closest('[data-drop-start].drop'); if (z) { e.preventDefault(); z.classList.add('over'); } }); });
  ['dragleave', 'drop'].forEach(function (n) { document.addEventListener(n, function (e) { var z = e.target.closest && e.target.closest('[data-drop-start].drop'); if (z) { e.preventDefault(); z.classList.remove('over'); if (n === 'drop') runDrop(z); } }); });

  /* keys only act while this screen has focus */
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette(); return; }
    var f = $('[data-flow]'); if (!f || !f._step || (e.target.matches && e.target.matches('input,textarea'))) return;
    if (/^[1-9]$/.test(e.key)) { var o = $$('.opt', f._step())[+e.key - 1]; if (o) o.click(); }
    if (e.key === 'Enter' && !(e.target.closest && e.target.closest('a,button'))) f._next();
  });

  /* screens are drawn after this script loads */
  enhance();
  new MutationObserver(function () { if (!enhance._q) { enhance._q = 1; requestAnimationFrame(function () { enhance._q = 0; enhance(); }); } }).observe(document.documentElement, { childList: true, subtree: true });
})();
