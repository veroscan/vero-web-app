// Visual and runtime parity between the original static site and the Next export.
//
//   node tools/parity.mjs --width 1440 --motion reduced            # every page
//   node tools/parity.mjs --width 390 --motion normal --pages index,product
//
// Needs the original on :4324 and the export (`out/`) on :4326, and takes the browser lock.
// For every page and a fixed list of scroll positions it screenshots both sides, pixel-diffs the pairs in a
// scratch canvas (no extra dependencies) and prints the share of pixels that differ. It also checks, per side,
// console errors/warnings, failed requests, horizontal overflow, the scripts that were loaded (in order) and,
// in reduced motion, that the DOM after the runtime has run is the same.
//
// Normal motion: canvases, marquee, serve scenes and the areas accordion are hidden on both sides before each
// screenshot, because they animate continuously; reduced motion covers their final states without any mask.
import fs from "node:fs";
import path from "node:path";
import { EXPORT, ORIGINAL, PAGES, ROOT, VIEWPORTS, launch, newContext, settle, takeLock, urlFor, watch } from "./lib/browser.mjs";

const argv = process.argv.slice(2);
const opt = (name, fallback) => { const i = argv.indexOf("--" + name); return i < 0 ? fallback : argv[i + 1]; };
const width = Number(opt("width", 1440));
const reduced = opt("motion", "reduced") === "reduced";
const pages = opt("pages", "") ? opt("pages", "").split(",") : PAGES;
const maxSteps = Number(opt("steps", 14));
const THRESHOLD = 24; // per-channel difference that counts as a changed pixel
const tag = `${width}-${reduced ? "reduced" : "normal"}`;
const outDir = path.join(ROOT, ".parity", tag);
fs.mkdirSync(outDir, { recursive: true });

const MASK_CSS = "canvas,.big-marquee,.serve-stage,.sx-visual,.mark-flat,.t-label,[data-vero-mark]{visibility:hidden!important}";

const TOLERATED_WARNINGS = [/Download the React DevTools/];

async function snapshotDom(page) {
  return page.evaluate(() => {
    const clone = document.body.cloneNode(true);
    clone.querySelectorAll("script,next-route-announcer,style").forEach((n) => n.remove());
    // The original uses relative URLs and the export root-relative ones: compare what they resolve to.
    clone.querySelectorAll("[href],[src]").forEach((n) => {
      for (const attr of ["href", "src"]) {
        const v = n.getAttribute(attr);
        if (v && !/^(#|mailto:|tel:)/.test(v)) { const u = new URL(v, location.href); n.setAttribute(attr, u.origin === location.origin ? u.pathname + u.search + u.hash : v); }
      }
    });
    // Inline styles hold animation frames (transforms mid-tween) and, in the export, the utility classes replace the
    // static ones; compare structure, text and classes instead.
    clone.querySelectorAll("*").forEach((n) => {
      n.removeAttribute("style");
      const tokens = (n.getAttribute("class") || "").split(" ").filter((t) => t && !t.startsWith("u-")).sort();
      if (tokens.length) n.setAttribute("class", tokens.join(" "));
      else n.removeAttribute("class");
    });
    // Attribute order is not meaningful: write the attributes back sorted.
    clone.querySelectorAll("*").forEach((n) => {
      const attrs = [...n.attributes].map((a) => [a.name, a.value]).sort((x, y) => x[0].localeCompare(y[0]));
      attrs.forEach(([name]) => n.removeAttribute(name));
      attrs.forEach(([name, value]) => n.setAttribute(name, value));
    });
    // The legal pages' stray empty <p> before the first heading was dropped in the export (it renders nothing).
    clone.querySelectorAll("p").forEach((n) => { if (!n.firstElementChild && !n.textContent.trim()) n.remove(); });
    clone.querySelectorAll("body > div[hidden]").forEach((n) => { if (!n.textContent.trim()) n.remove(); });
    // Whitespace next to tags is left out: the static DOM check (tools/dom_parity.py) already compares it strictly,
    // and spaces inside flex containers (links with an arrow) are not rendered anyway.
    // data-url on the share buttons holds the page's absolute address, which differs by port.
    return clone.outerHTML.replaceAll(location.origin, "").replaceAll(encodeURIComponent(location.origin), "").replace(/<!--[\s\S]*?-->/g, "").replace(/\s+/g, " ").replace(/\s*(<[^>]*>)\s*/g, "$1");
  });
}

async function capture(ctx, base, pagePath, isNext, ys) {
  const page = await ctx.newPage();
  const log = watch(page);
  await page.goto(urlFor(base, pagePath), { waitUntil: "load" });
  await settle(page, { reduced, isNext });
  if (!reduced) await page.addStyleTag({ content: MASK_CSS });
  const info = await page.evaluate(() => ({
    height: document.documentElement.scrollHeight,
    overflow: document.documentElement.scrollWidth - innerWidth,
    scripts: [...document.scripts].filter((s) => s.src && !s.src.includes("/_next/")).map((s) => new URL(s.src).pathname),
    // Counts of what the runtime added to the page: the same animations must have started on both sides.
    animation: {
      splitWords: document.querySelectorAll(".split-word").length,
      splitLines: document.querySelectorAll(".split-line").length,
      markCanvas: document.querySelector("[data-vero-mark] canvas")?.width > 0,
      markFlat: !!document.querySelector("[data-vero-mark].is-flat, [data-vero-mark] .mark-flat"),
      introDone: window.__pdIntroDone === true,
      htmlClasses: document.documentElement.className.split(" ").filter((c) => c).sort().join(","),
      bodyClasses: document.body.className.split(" ").filter((c) => c).sort().join(","),
      revealed: document.querySelectorAll("[data-reveal].is-in, [data-reveal].in, [data-reveal].is-visible").length,
    },
  }));
  const dom = reduced ? await snapshotDom(page) : null;
  const shots = [];
  for (const y of ys(info.height)) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(reduced ? 300 : 1200);
    shots.push(await page.screenshot());
  }
  await page.close();
  return { shots, info, log, dom };
}

async function diffPair(diffPage, a, b) {
  return diffPage.evaluate(async ({ a, b, threshold }) => {
    const load = (b64) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = "data:image/png;base64," + b64; });
    const [ia, ib] = await Promise.all([load(a), load(b)]);
    const w = Math.min(ia.width, ib.width), h = Math.min(ia.height, ib.height);
    const draw = (img) => { const c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d", { willReadFrequently: true }); x.drawImage(img, 0, 0); return x.getImageData(0, 0, w, h); };
    const da = draw(ia), db = draw(ib);
    const out = document.createElement("canvas"); out.width = w; out.height = h;
    const ox = out.getContext("2d"); const od = ox.createImageData(w, h);
    let bad = 0;
    for (let i = 0; i < da.data.length; i += 4) {
      const d = Math.max(Math.abs(da.data[i] - db.data[i]), Math.abs(da.data[i + 1] - db.data[i + 1]), Math.abs(da.data[i + 2] - db.data[i + 2]));
      if (d > threshold) { bad++; od.data[i] = 255; od.data[i + 1] = 0; od.data[i + 2] = 60; od.data[i + 3] = 255; }
      else { const g = 255 - (255 - da.data[i]) * 0.25; od.data[i] = od.data[i + 1] = od.data[i + 2] = g; od.data[i + 3] = 255; }
    }
    ox.putImageData(od, 0, 0);
    return { pct: (bad / (w * h)) * 100, sizeMismatch: ia.width !== ib.width || ia.height !== ib.height, diff: out.toDataURL("image/png").split(",")[1] };
  }, { a: a.toString("base64"), b: b.toString("base64"), threshold: THRESHOLD });
}

const release = await takeLock();
const browser = await launch();
const results = [];
try {
  const ctx = await newContext(browser, width, { reduced });
  const diffPage = await ctx.newPage();
  await diffPage.setContent("<html><body></body></html>");
  const vh = VIEWPORTS[width].height;
  for (const pagePath of pages) {
    // Same scroll positions on both sides, taken from the original's height.
    let ys;
    const original = await capture(ctx, ORIGINAL, pagePath, false, (height) => {
      const max = Math.max(0, height - vh);
      const count = Math.min(maxSteps, Math.ceil(max / (vh * 0.85)) + 1);
      ys = Array.from({ length: count }, (_, i) => (count === 1 ? 0 : Math.round((max * i) / (count - 1))));
      return ys;
    });
    const next = await capture(ctx, EXPORT, pagePath, true, () => ys);
    const diffs = [];
    for (let i = 0; i < ys.length; i++) {
      const d = await diffPair(diffPage, original.shots[i], next.shots[i]);
      diffs.push(d.pct);
      if (d.pct > 0.1) {
        const dir = path.join(outDir, pagePath.replace(/\//g, "_"));
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, `${i}-orig.png`), original.shots[i]);
        fs.writeFileSync(path.join(dir, `${i}-next.png`), next.shots[i]);
        fs.writeFileSync(path.join(dir, `${i}-diff.png`), Buffer.from(d.diff, "base64"));
      }
    }
    let domNote = "";
    if (reduced) {
      if (original.dom === next.dom) domNote = "same";
      else {
        let i = 0;
        while (i < original.dom.length && original.dom[i] === next.dom[i]) i++;
        domNote = `differs at ${i}: orig ...${original.dom.slice(Math.max(0, i - 60), i + 90)} | next ...${next.dom.slice(Math.max(0, i - 60), i + 90)}`;
      }
    }
    const scriptsSame = JSON.stringify(original.info.scripts) === JSON.stringify(next.info.scripts);
    const animationSame = JSON.stringify(original.info.animation) === JSON.stringify(next.info.animation);
    const nextWarn = next.log.warnings.filter((w) => !TOLERATED_WARNINGS.some((re) => re.test(w)));
    const row = {
      page: pagePath, steps: ys.length, heightOrig: original.info.height, heightNext: next.info.height,
      maxDiffPct: Math.max(...diffs), meanDiffPct: diffs.reduce((s, x) => s + x, 0) / diffs.length, diffs: diffs.map((x) => +x.toFixed(3)),
      overflowOrig: original.info.overflow, overflowNext: next.info.overflow, scriptsSame,
      scriptsOrig: original.info.scripts, scriptsNext: next.info.scripts, animationSame, animationOrig: original.info.animation, animationNext: next.info.animation,
      errorsOrig: original.log.errors, errorsNext: next.log.errors, warningsOrig: original.log.warnings, warningsNext: nextWarn, failedOrig: original.log.failed, failedNext: next.log.failed, dom: domNote,
    };
    results.push(row);
    console.log(
      `${pagePath.padEnd(40)} h ${row.heightOrig}/${row.heightNext} steps ${row.steps} max ${row.maxDiffPct.toFixed(2)}% mean ${row.meanDiffPct.toFixed(3)}%` +
      ` ovf ${row.overflowOrig}/${row.overflowNext} scripts ${scriptsSame ? "same" : "DIFF"} anim ${animationSame ? "same" : "DIFF"} err ${row.errorsNext.length} warn ${nextWarn.length} failed ${row.failedNext.length} (orig warn ${row.warningsOrig.length})` +
      (reduced ? ` dom ${domNote === "same" ? "same" : "DIFF"}` : ""),
    );
    if (row.errorsNext.length || nextWarn.length || row.failedNext.length) console.log("   next console:", JSON.stringify({ e: row.errorsNext.slice(0, 3), w: nextWarn.slice(0, 3), f: row.failedNext.slice(0, 3) }));
    if (!animationSame) console.log("   animation orig", JSON.stringify(original.info.animation), "next", JSON.stringify(next.info.animation));
    if (!scriptsSame) console.log("   scripts orig", JSON.stringify(row.scriptsOrig), "next", JSON.stringify(row.scriptsNext));
    if (reduced && domNote !== "same") console.log("   dom:", domNote);
  }
} finally {
  await browser.close();
  release();
}
fs.writeFileSync(path.join(outDir, "results.json"), JSON.stringify(results, null, 1));
const avg = results.reduce((s, r) => s + r.meanDiffPct, 0) / results.length;
console.log(`\n${tag}: ${results.length} pages, mean diff ${avg.toFixed(3)}%, worst page max ${Math.max(...results.map((r) => r.maxDiffPct)).toFixed(2)}%`);
