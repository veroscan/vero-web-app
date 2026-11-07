import { routeKey } from "./routes";

/** A script of the animation runtime that is loaded (in order) after React has hydrated. */
export interface RuntimeScript {
  readonly src: string;
  readonly module?: boolean;
}

const APP_BUNDLE = "/build/assets/app-DLdHdBf1.js";
const ABOUT_BUNDLE = "/build/assets/about-Bkez2bWc.js";
const BLOG_BUNDLE = "/build/assets/blog-BlYQORIM.js";
const WORK_BUNDLE = "/build/assets/work-CmEh0fbb.js";

/** Loaded on every page: form endpoint config, loader, then the template runtime (Lenis, GSAP, cursor, transitions). */
export const SHELL_SCRIPTS: readonly RuntimeScript[] = [
  { src: "/vero/config.js" },
  { src: "/vero/loader.js" },
  { src: APP_BUNDLE, module: true },
];

const SCENES = { src: "/vero/scenes.js" };
const MARK = { src: "/vero/mark/mount.js" };
const PAGES_A = { src: "/vero/pages-a.js" };
const PAGES_B = { src: "/vero/pages-b.js" };
const PAGES_C = { src: "/vero/pages-c.js" };

const ARTICLE_SCRIPTS: readonly RuntimeScript[] = [{ src: BLOG_BUNDLE, module: true }, PAGES_C];

/** Extra scripts per route, in the order the static site loaded them. */
const PAGE_SCRIPTS: Readonly<Record<string, readonly RuntimeScript[]>> = {
  "": [SCENES, MARK],
  product: [SCENES, PAGES_A],
  coverage: [PAGES_A],
  methodology: [PAGES_A],
  security: [PAGES_A],
  "sample-report": [PAGES_A, { src: WORK_BUNDLE, module: true }],
  about: [{ src: ABOUT_BUNDLE, module: true }, PAGES_B],
  contact: [PAGES_B],
  waitlist: [PAGES_B],
  "for-founders": [PAGES_B],
  "for-investors": [PAGES_B],
  insights: ARTICLE_SCRIPTS,
  "privacy-policy": [PAGES_C],
  "terms-of-service": [PAGES_C],
  "404": [PAGES_C],
};

export function scriptsForPath(pathname: string): readonly RuntimeScript[] {
  const key = routeKey(pathname);
  const page = key.startsWith("insights/") ? ARTICLE_SCRIPTS : (PAGE_SCRIPTS[key] ?? []);
  return [...SHELL_SCRIPTS, ...page];
}
