// Tiny static server for the exported site (`out/`) with clean URLs: /product serves product.html.
// Usage: node tools/serve.mjs [port]   (default 4326). No dependencies.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";

const root = resolve("out");
const port = Number(process.argv[2]) || 4326;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".glb": "model/gltf-binary",
  ".txt": "text/plain; charset=utf-8",
};

const isFile = async (path) => {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
};

/** Map a URL path to a file in `out/`: exact file, then `<path>.html`, then `<path>/index.html`. */
async function resolveFile(pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^([/\\])+/, "");
  const base = join(root, clean);
  if (base !== root && !base.startsWith(root + sep)) return null;
  const candidates = clean === "" ? [join(root, "index.html")] : [base, `${base}.html`, join(base, "index.html")];
  for (const candidate of candidates) if (await isFile(candidate)) return candidate;
  return null;
}

createServer(async (req, res) => {
  const { pathname } = new URL(req.url ?? "/", "http://localhost");
  const file = await resolveFile(pathname);
  const target = file ?? join(root, "404.html");
  try {
    const body = await readFile(target);
    res.writeHead(file ? 200 : 404, { "Content-Type": TYPES[extname(target)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(500).end("Server error");
  }
}).listen(port, "127.0.0.1", () => console.log(`Serving out/ with clean URLs at http://127.0.0.1:${port}/`));
