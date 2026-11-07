// Behaviour parity: runs the same interactions on the original site and on the Next export and compares
// the resulting state. Each test returns a plain object (the "signature"); both sides must produce the same
// one, and `effect` must be true on both (the action really changed something).
//
//   node tools/behaviour.mjs [test ...]        # default: all tests
//
// Needs the original on :4324, the export on :4326 and the browser lock.
import { EXPORT, ORIGINAL, launch, newContext, settle, takeLock, urlFor, watch } from "./lib/browser.mjs";

const wait = (page, ms) => page.waitForTimeout(ms);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

async function open(ctx, base, pagePath, { reduced = true, isNext }) {
  const page = await ctx.newPage();
  const log = watch(page);
  await page.addInitScript(() => {
    document.addEventListener("DOMContentLoaded", () => { window.__entry = document.documentElement.className + "|" + (window.__pdTrans || ""); });
    // The page transition hands the next page its name through sessionStorage; window.name survives the navigation.
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "pd-trans") window.name = "pd-trans=" + value;
      return setItem.apply(this, arguments);
    };
  });
  await page.goto(urlFor(base, pagePath), { waitUntil: "load" });
  await settle(page, { reduced, isNext });
  return { page, log };
}

const TESTS = {
  // Loader plays on first visit, counts to 100 and goes away; later visits in the same tab skip it.
  async loader({ ctxMotion, base, isNext }) {
    const page = await ctxMotion.newPage();
    const log = watch(page);
    const start = Date.now();
    await page.goto(urlFor(base, "index"), { waitUntil: "commit" });
    await page.waitForSelector(".loader", { state: "attached", timeout: 10000 });
    const visibleEarly = await page.evaluate(() => getComputedStyle(document.querySelector(".loader")).display !== "none");
    // time until the counter leaves 000: the loader is driven by the runtime, so this includes script loading
    const counting = await page.waitForFunction(() => Number(document.querySelector(".ld-num")?.textContent || 0) > 0, null, { timeout: 15000, polling: 50 }).then(() => true, () => false);
    const countStart = (Date.now() - start) / 1000;
    await page.waitForFunction(() => getComputedStyle(document.querySelector(".loader")).display === "none", null, { timeout: 25000 });
    const seconds = (Date.now() - start) / 1000;
    const after = await page.evaluate(() => ({ seen: sessionStorage.getItem("pd-seen"), html: document.documentElement.className.split(" ").filter((c) => c).sort() }));
    await page.close();
    return { sig: { visibleEarly, counting, seen: after.seen, noErrors: log.errors.length === 0 }, effect: visibleEarly && counting, note: `counter starts after ${countStart.toFixed(1)}s, loader finished after ${seconds.toFixed(1)}s` };
  },

  // Header dropdown opens on hover and closes again.
  async dropdown({ ctx, base, isNext }) {
    const { page } = await open(ctx, base, "index", { isNext });
    const read = () => page.evaluate(() => {
      const li = document.querySelector(".has-drop");
      const cs = getComputedStyle(li.querySelector(".nav-drop"));
      return { cls: li.className.split(" ").sort(), visibility: cs.visibility, opacity: cs.opacity };
    });
    const before = await read();
    await page.locator(".has-drop > a").first().hover();
    await wait(page, 700);
    const open_ = await read();
    await page.mouse.move(720, 600);
    await wait(page, 900);
    const closed = await read();
    await page.close();
    return { sig: { before, open: open_, closed }, effect: !same(before, open_) && same(before, closed) };
  },

  // Mobile menu: burger opens it, burger closes it.
  async mobileMenu({ ctxMobile, base, isNext }) {
    const { page } = await open(ctxMobile, base, "index", { isNext });
    const read = () => page.evaluate(() => ({
      expanded: document.querySelector(".burger").getAttribute("aria-expanded"),
      menu: document.querySelector(".mobile-menu").className.split(" ").sort(),
      body: document.body.className.split(" ").filter((c) => c).sort(),
      html: document.documentElement.className.split(" ").filter((c) => c).sort(),
    }));
    const before = await read();
    await page.locator(".burger").click();
    await wait(page, 900);
    const opened = await read();
    await page.locator(".burger").click();
    await wait(page, 900);
    const closed = await read();
    await page.close();
    return { sig: { before, opened, closed }, effect: !same(before, opened) && opened.expanded === "true" && closed.expanded === "false" };
  },

  // Product walkthrough tabs on the home page.
  async serveTabs({ ctx, base, isNext }) {
    const { page } = await open(ctx, base, "index", { isNext });
    const read = () => page.evaluate(() => [...document.querySelectorAll(".serve-tab,.scene")].map((e) => e.className.split(" ").sort().join(".") + "|" + e.getAttribute("aria-selected") + "|" + e.hidden));
    await page.locator("[data-serve]").scrollIntoViewIfNeeded();
    await wait(page, 600);
    const before = await read();
    await page.locator(".serve-tab").nth(2).click();
    await wait(page, 1200);
    const after = await read();
    await page.close();
    return { sig: { before, after }, effect: !same(before, after) };
  },

  // "Six areas" accordion on the home page.
  async areasAccordion({ ctx, base, isNext }) {
    const { page } = await open(ctx, base, "index", { isNext });
    const read = () => page.evaluate(() => [...document.querySelectorAll(".sx-item")].map((e) => e.className.split(" ").sort().join(".")));
    await page.locator(".sx").scrollIntoViewIfNeeded();
    await wait(page, 600);
    const before = await read();
    await page.locator(".sx-item").nth(3).click();
    await wait(page, 1200);
    const after = await read();
    await page.close();
    return { sig: { before, after }, effect: !same(before, after) };
  },

  // FAQ: one answer open at a time, animated open/close.
  async faq({ ctx, base, isNext }) {
    const { page } = await open(ctx, base, "product", { isNext });
    const read = () => page.evaluate(() => [...document.querySelectorAll(".faq details")].map((d) => d.open));
    const group = page.locator(".faq").first();
    await group.scrollIntoViewIfNeeded();
    await wait(page, 500);
    const before = await read();
    await group.locator("summary").nth(2).click();
    await wait(page, 1000);
    const second = await read();
    await group.locator("summary").nth(2).click();
    await wait(page, 1000);
    const third = await read();
    await page.close();
    return { sig: { before, second, third }, effect: !same(before, second) && !same(second, third) };
  },

  // Forms: validation messages and the inert-endpoint result (mailto fallback text).
  async forms({ ctx, base, isNext }) {
    const out = {};
    for (const pagePath of ["contact", "waitlist"]) {
      const { page } = await open(ctx, base, pagePath, { isNext });
      const forms = await page.locator("form[data-vero-form]").count();
      const results = [];
      for (let i = 0; i < forms; i++) {
        const form = page.locator("form[data-vero-form]").nth(i);
        await form.scrollIntoViewIfNeeded();
        await form.locator("button[type=submit]").click();
        await wait(page, 500);
        const errors = await form.evaluate((f) => [...f.querySelectorAll(".fld-err")].map((e) => (e.hidden ? "" : e.textContent)).filter(Boolean));
        for (const field of await form.locator("[data-req]").all()) {
          const input = field.locator("input,select,textarea").first();
          const tag = await input.evaluate((e) => e.tagName + ":" + (e.type || ""));
          if (tag.startsWith("SELECT")) await input.selectOption({ index: 1 }).catch(() => {});
          else if (tag.includes("email")) await input.fill("test@example.com");
          else if (tag.startsWith("TEXTAREA")) await input.fill("A short test message.");
          else if (tag.includes("checkbox")) await input.check().catch(() => {});
          else await input.fill("Test");
        }
        await form.locator("button[type=submit]").click();
        await wait(page, 900);
        const result = await form.evaluate((f) => ({ out: f.querySelector(".form-out")?.className, html: f.querySelector(".form-out")?.innerHTML }));
        results.push({ errors, result });
      }
      out[pagePath] = results;
      await page.close();
    }
    return { sig: out, effect: Object.values(out).flat().some((x) => x.errors.length > 0) && Object.values(out).flat().some((x) => x.result.html) };
  },

  // Insights filters: pills filter the cards and update ?category=.
  async insightsFilter({ ctx, base, isNext }) {
    const { page } = await open(ctx, base, "insights", { isNext });
    const read = () => page.evaluate(() => ({
      shown: [...document.querySelectorAll("[data-cat]")].filter((e) => !e.classList.contains("is-filtered-out") && getComputedStyle(e).display !== "none").length,
      pressed: [...document.querySelectorAll("[data-filter]")].map((b) => b.getAttribute("aria-pressed")),
      search: location.search,
    }));
    const before = await read();
    await page.locator("[data-filter]").nth(1).click();
    await wait(page, 900);
    const after = await read();
    await page.locator("[data-filter]").nth(0).click();
    await wait(page, 900);
    const reset = await read();
    await page.close();
    return { sig: { before, after, reset }, effect: !same(before, after) };
  },

  // Page transition: clicking an internal link plays the transition and lands on the next page in "entering" state.
  async pageTransition({ ctxMotion, base, isNext }) {
    const { page, log } = await open(ctxMotion, base, "index", { reduced: false, isNext });
    const link = page.locator('.nav-links > li > a[href$="product.html"]').first();
    await link.click();
    await page.waitForURL(/product\.html$/, { timeout: 6000 });
    await page.waitForLoadState("load");
    await wait(page, 600);
    const entry = await page.evaluate(() => ({ label: window.__entry.split("|")[1], handedOver: window.name, classes: document.documentElement.className.split(" ").filter((c) => c).sort() }));
    await page.close();
    return { sig: { entry, errors: log.errors.length }, effect: entry.handedOver === "pd-trans=Product" };
  },

  // The 404 page is reachable and offers a way home.
  async notFound({ ctx, base, isNext }) {
    const { page } = await open(ctx, base, "404", { isNext });
    const info = await page.evaluate(() => ({ h1: document.querySelector("h1")?.textContent, links: [...document.querySelectorAll("main a")].map((a) => new URL(a.href).pathname) }));
    await page.close();
    return { sig: info, effect: !!info.h1 };
  },
};

const wanted = process.argv.slice(2);
const names = Object.keys(TESTS).filter((n) => !wanted.length || wanted.includes(n));
const release = await takeLock();
const browser = await launch();
let failed = 0;
try {
  const ctx = await newContext(browser, 1440, { reduced: true });
  const ctxMobile = await newContext(browser, 390, { reduced: true });
  for (const name of names) {
    const results = [];
    for (const [side, base] of [["original", ORIGINAL], ["next", EXPORT]]) {
      const ctxMotion = await newContext(browser, 1440, { reduced: false }); // fresh storage: loader plays
      try {
        results.push(await TESTS[name]({ ctx, ctxMobile, ctxMotion, base, isNext: side === "next" }));
      } catch (e) {
        results.push({ sig: { error: String(e.message).split("\n")[0] }, effect: false });
      }
      await ctxMotion.close();
    }
    const [o, n] = results;
    const ok = same(o.sig, n.sig) && o.effect && n.effect;
    if (!ok) failed++;
    console.log(`${ok ? "PASS" : "FAIL"} ${name}${o.note || n.note ? `  (orig: ${o.note}; next: ${n.note})` : ""}`);
    if (!ok) {
      console.log("   original:", JSON.stringify(o.sig).slice(0, 600), "effect", o.effect);
      console.log("   next    :", JSON.stringify(n.sig).slice(0, 600), "effect", n.effect);
    }
  }
} finally {
  await browser.close();
  release();
}
console.log(`\n${names.length - failed}/${names.length} behaviours identical`);
process.exit(failed ? 1 : 0);
