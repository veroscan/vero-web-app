// Shared helpers for the parity scripts: the browser lock, Chromium launch, console/network capture.
// Playwright is not a dependency of this project; it is imported from the sibling tooling folder.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PLAYWRIGHT = "file:///C:/Users/edete/Desktop/clone/northclonned/vero-build/tools/node_modules/playwright/index.mjs";
const { chromium } = await import(PLAYWRIGHT);

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const ORIGINAL = "http://localhost:4324";
export const EXPORT = "http://localhost:4326";

export const PAGES = [
  "index", "product", "methodology", "security", "for-investors", "for-founders", "coverage", "sample-report",
  "about", "insights", "waitlist", "contact", "privacy-policy", "terms-of-service", "404",
  "insights/cac-annual-returns-and-status", "insights/contractor-ip-assignment", "insights/nigeria-gaid-cookie-banners",
];

export const VIEWPORTS = {
  1440: { width: 1440, height: 900, isMobile: false },
  390: { width: 390, height: 844, isMobile: true },
};

const LOCK = path.join(ROOT, ".browser.lock");
const STALE_MS = 6 * 60 * 1000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Takes the project-wide browser lock (mkdir is atomic) and keeps it fresh while the script runs. */
export async function takeLock() {
  for (;;) {
    try {
      fs.mkdirSync(LOCK);
      break;
    } catch {
      try {
        if (Date.now() - fs.statSync(LOCK).mtimeMs > STALE_MS) fs.rmdirSync(LOCK);
      } catch { /* someone else released it */ }
      await sleep(4000);
    }
  }
  const keepFresh = setInterval(() => {
    try { const now = new Date(); fs.utimesSync(LOCK, now, now); } catch { /* released */ }
  }, 30000);
  return () => {
    clearInterval(keepFresh);
    try { fs.rmdirSync(LOCK); } catch { /* already gone */ }
  };
}

export async function launch() {
  const base = path.join(process.env.LOCALAPPDATA, "ms-playwright");
  const dirs = fs.readdirSync(base).filter((d) => /^chromium-\d+$/.test(d)).sort();
  const exe = path.join(base, dirs[dirs.length - 1], "chrome-win64", "chrome.exe");
  const attempts = [
    ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"],
    ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
  ];
  let lastError;
  for (const args of attempts) {
    try { return await chromium.launch({ executablePath: exe, headless: true, args }); } catch (e) { lastError = e; }
  }
  throw lastError;
}

export function newContext(browser, width, { reduced }) {
  const vp = VIEWPORTS[width];
  return browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    reducedMotion: reduced ? "reduce" : "no-preference",
    isMobile: vp.isMobile,
    hasTouch: vp.isMobile,
  });
}

/** Collects console errors/warnings, page errors and failed requests of a page. */
export function watch(page) {
  const log = { errors: [], warnings: [], failed: [] };
  page.on("console", (m) => {
    if (m.type() === "error") log.errors.push(m.text());
    else if (m.type() === "warning") log.warnings.push(m.text());
  });
  page.on("pageerror", (e) => log.errors.push("PAGEERROR " + e.message));
  page.on("requestfailed", (r) => log.failed.push(`${r.url()} ${(r.failure() || {}).errorText}`));
  page.on("response", (r) => { if (r.status() >= 400) log.failed.push(`${r.status()} ${r.url()}`); });
  return log;
}

export const urlFor = (base, page) => `${base}/${page}.html`;

/** Waits until the page is in its settled state: runtime started and, in normal motion, the loader gone. */
export async function settle(page, { reduced, isNext }) {
  if (isNext) {
    await page.waitForFunction(() => [...document.scripts].some((s) => /\/app-[\w-]+\.js/.test(s.src)), null, { timeout: 15000 }).catch(() => {});
  }
  if (reduced) {
    await page.waitForTimeout(Number(process.env.PARITY_SETTLE_MS || 2200));
  } else {
    await page.waitForFunction(() => {
      const l = document.querySelector(".loader");
      return !l || getComputedStyle(l).display === "none";
    }, null, { timeout: 25000 }).catch(() => {});
    await page.waitForTimeout(3500);
  }
}

export const sleepMs = sleep;
