#!/usr/bin/env python3
"""DOM parity: original static page vs the Next static export, no browser needed.

    python tools/dom_parity.py [--site PATH] [--out out] [page ...]

Both documents are parsed and normalised, then compared node by node:

  dropped    Next-injected <script>/<link>, hydration markers (<!-- -->, <div hidden>), preload hints,
             HTML comments, the original's <script>/<link> tags (checked separately below)
  collapsed  whitespace runs; a run with a line break next to a block element or at the edge of its
             parent is formatting and disappears (the same rule tools/html2tsx.py uses)
  ignored    attribute order; class order
  resolved   href/src are resolved against the page URL, so "../vero/x.svg" == "/vero/x.svg"
  folded     the generated utility classes (u-*) are expanded back into the inline style they replace

Head: title, meta and icon links compared as sets; JSON-LD compared as parsed JSON; the order of
stylesheets compared through the rules each file contributes. Script order is checked in the browser
(tools/parity.mjs), because Next loads the runtime after hydration.
Exit code 1 when any page differs.
"""
from __future__ import annotations

import argparse
import json
import posixpath
import re
import sys
from pathlib import Path

from bs4 import BeautifulSoup, Comment, NavigableString, Tag

sys.path.insert(0, str(Path(__file__).resolve().parent))
from html2tsx import flex_classes  # noqa: E402  (the converter and the checker share this rule)

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_SITE = Path(r"C:\Users\edete\Desktop\clone\vero-web\site")

PAGES = [
    "index", "product", "methodology", "security", "for-investors", "for-founders", "coverage", "sample-report",
    "about", "insights", "waitlist", "contact", "privacy-policy", "terms-of-service", "404",
    "insights/cac-annual-returns-and-status", "insights/contractor-ip-assignment", "insights/nigeria-gaid-cookie-banners",
]
BLOCK = {"div", "p", "ul", "ol", "li", "section", "article", "aside", "header", "footer", "nav", "main", "h1", "h2", "h3", "h4", "h5", "h6", "figure", "figcaption", "form", "table", "thead", "tbody", "tr", "td", "th", "details", "summary", "blockquote", "hr", "pre", "dl", "dt", "dd", "fieldset", "legend", "option", "select", "canvas", "button"}
URL_ATTRS = {"href", "src"}
# Next copies Open Graph title/description into these (the original only had twitter:card).
NEXT_DERIVED_META = {"twitter:title", "twitter:description"}


def fix_source(text: str) -> str:
    """Same fix as tools/html2tsx.py: drop the stray never-closed empty <p> before the legal pages' first <h2>
    (a browser closes it implicitly; html.parser would nest the article inside it)."""
    return re.sub(r"<p>\s*(<h2)", lambda m: m.group(1), text)


def load_utilities() -> dict[str, str]:
    css = (ROOT / "src" / "styles" / "utilities.css").read_text(encoding="utf8")
    return {m.group(1): m.group(2) for m in re.finditer(r"\.(u-[\w-]+)\{([^}]*)\}", css)}


def style_canon(style: str) -> str:
    decls = []
    for part in style.split(";"):
        if ":" in part:
            k, v = part.split(":", 1)
            decls.append(f"{k.strip().lower()}:{re.sub(r'\\s+', ' ', v.strip())}")
    return ";".join(sorted(decls))


class Normaliser:
    def __init__(self, page_url: str, utilities: dict[str, str], flex: set[str]):
        self.page_url = page_url  # e.g. "/insights/x.html"
        self.utilities = utilities
        self.flex = flex  # classes of flex/grid containers: whitespace between their children is not rendered

    def resolve(self, value: str) -> str:
        if value.startswith(("#", "mailto:", "tel:", "http:", "https:", "data:")):
            return value
        base = posixpath.dirname(self.page_url)
        path, sep, frag = value.partition("#")
        full = posixpath.normpath(posixpath.join(base, path)) if path else self.page_url
        if not full.startswith("/"):
            full = "/" + full
        # The export links pages without ".html" ("/product", "/" for home); the original used "/product.html".
        full = re.sub(r"(^|/)index\.html$", r"\1", full)
        full = re.sub(r"\.html$", "", full)
        return full + (sep + frag if sep else "")

    def attrs(self, el: Tag) -> dict[str, str]:
        out: dict[str, str] = {}
        classes = el.get("class") or []
        if isinstance(classes, str):
            classes = classes.split()
        style = el.get("style", "")
        keep = []
        for c in classes:
            if c in self.utilities:
                style = (style.rstrip(";") + ";" if style else "") + self.utilities[c]
            else:
                keep.append(c)
        if keep:
            out["class"] = " ".join(sorted(keep))
        if style:
            out["style"] = style_canon(style)
        for k, v in el.attrs.items():
            if k in ("class", "style"):
                continue
            if isinstance(v, list):
                v = " ".join(v)
            if k in URL_ATTRS:
                v = self.resolve(v)
            out[k] = v
        return out

    @staticmethod
    def is_block(node) -> bool:
        return isinstance(node, Tag) and node.name in BLOCK

    def significant(self, ws: str, prev, nxt, parent: Tag) -> bool:
        if set(parent.get("class") or []) & self.flex:
            return False
        return not ("\n" in ws and (prev is None or nxt is None or self.is_block(prev) or self.is_block(nxt)))

    def node(self, el: Tag):
        kids = self.children(el)
        return (el.name, tuple(sorted(self.attrs(el).items())), tuple(kids))

    def children(self, parent: Tag) -> list:
        raw = [c for c in parent.children if not isinstance(c, Comment) and not self.dropped(c)]
        # merge adjacent text nodes first (hydration comments split them)
        merged: list = []
        for c in raw:
            if isinstance(c, NavigableString) and merged and isinstance(merged[-1], str):
                merged[-1] += str(c)
            elif isinstance(c, NavigableString):
                merged.append(str(c))
            else:
                merged.append(c)
        out: list = []
        for i, c in enumerate(merged):
            prev = next((m for m in reversed(merged[:i]) if isinstance(m, Tag)), None) if i and isinstance(merged[i - 1], Tag) else None
            nxt = merged[i + 1] if i + 1 < len(merged) and isinstance(merged[i + 1], Tag) else None
            if isinstance(c, str):
                if not c.strip():
                    if c and self.significant(c, prev, nxt, parent):
                        out.append(" ")
                    continue
                lead = c[: len(c) - len(c.lstrip())]
                trail = c[len(c.rstrip()):]
                text = re.sub(r"[ \t\r\n\f]+", " ", c.strip())
                if lead and self.significant(lead, prev, nxt, parent):
                    text = " " + text
                if trail and self.significant(trail, prev, nxt, parent):
                    text += " "
                out.append(text)
            else:
                out.append(self.node(c))
        # glue neighbouring strings
        glued: list = []
        for o in out:
            if isinstance(o, str) and glued and isinstance(glued[-1], str):
                glued[-1] = re.sub(r" +", " ", glued[-1] + o)
            else:
                glued.append(o)
        return glued

    @staticmethod
    def dropped(c) -> bool:
        if not isinstance(c, Tag):
            return False
        if c.name in ("script", "link", "style", "next-route-announcer"):
            return True
        if c.name == "div" and c.has_attr("hidden") and not c.attrs.get("class") and not c.get_text(strip=True) and not c.find(True):
            return True
        return False


def describe(n, depth=0) -> str:
    if isinstance(n, str):
        return repr(n[:80])
    tag, attrs, kids = n
    a = " ".join(f'{k}="{v[:40]}"' for k, v in attrs[:4])
    return f"<{tag} {a}>"


def diff(a, b, path: str, out: list[str], limit=5) -> None:
    if len(out) >= limit:
        return
    if isinstance(a, str) or isinstance(b, str):
        if a != b:
            out.append(f"{path}: text {describe(a)} != {describe(b)}")
        return
    if a[0] != b[0] or a[1] != b[1]:
        out.append(f"{path}: {describe(a)} != {describe(b)}\n        orig attrs {dict(a[1])}\n        next attrs {dict(b[1])}")
        return
    here = f"{path}/{a[0]}" + (f".{dict(a[1]).get('class', '').split(' ')[0]}" if dict(a[1]).get("class") else "")
    ka, kb = a[2], b[2]
    for i in range(min(len(ka), len(kb))):
        diff(ka[i], kb[i], f"{here}[{i}]", out, limit)
        if len(out) >= limit:
            return
    if len(ka) != len(kb):
        out.append(f"{here}: {len(ka)} children vs {len(kb)}; first extra: {describe((ka if len(ka) > len(kb) else kb)[min(len(ka), len(kb))])}")


def head_facts(soup: BeautifulSoup, norm: Normaliser) -> dict:
    head = soup.find("head")
    facts: dict = {}
    facts["lang"] = soup.html.get("lang")
    facts["title"] = head.find("title").get_text() if head.find("title") else None
    metas = set()
    for m in head.find_all("meta"):
        if m.get("charset") is not None or m.get("charSet") is not None:
            metas.add(("charset", "utf-8"))
            continue
        key = m.get("name") or m.get("property") or m.get("http-equiv")
        content = m.get("content")
        if key == "og:image":
            content = norm.resolve(content)
        if key == "robots":  # "index" and "follow" are the defaults, so "noindex, follow" == "noindex"
            content = ",".join(t.strip() for t in content.split(",") if t.strip() not in ("index", "follow")) or "default"
        if key in NEXT_DERIVED_META:
            continue
        metas.add((key, content))
    facts["meta"] = metas
    links = set()
    for l in head.find_all("link"):
        rel = " ".join(l.get("rel") or [])
        if rel in ("icon", "apple-touch-icon") or (rel == "preload" and l.get("as") == "font"):
            crossorigin = l.get("crossorigin")
            links.add((rel, norm.resolve(l.get("href", "")), l.get("type"), l.get("sizes"), l.get("as"), None if crossorigin is None else "anonymous"))
    facts["links"] = links
    return facts


def json_lds(soup: BeautifulSoup) -> list[str]:
    out = []
    for s in soup.find_all("script", type="application/ld+json"):
        out.append(json.dumps(json.loads(s.string), sort_keys=True, ensure_ascii=False))
    return sorted(out)


def stylesheet_order(orig_soup, next_soup, site: Path, out_dir: Path, page_url: str) -> list[str]:
    """Each original stylesheet contributes rules; they must appear in the same order in the Next CSS."""
    problems = []
    orig_files = []
    for l in orig_soup.find("head").find_all("link", rel="stylesheet"):
        orig_files.append((site / posixpath.normpath(posixpath.join(posixpath.dirname(page_url).lstrip("/"), l["href"]))))
    css = ""
    for l in next_soup.find("head").find_all("link", rel="stylesheet"):
        css += (out_dir / l["href"].lstrip("/")).read_text(encoding="utf8") + "\n"
    squashed = re.sub(r"\s+", "", css)
    last = -1
    for f in orig_files:
        text = f.read_text(encoding="utf8")
        rules = [r for r in re.split(r"}", re.sub(r"/\*.*?\*/", "", text, flags=re.S)) if "{" in r and not r.strip().startswith("@")]
        if not rules:
            continue
        probe = re.sub(r"\s+", "", rules[len(rules) // 2] + "}")
        if len(probe) > 140:
            probe = probe[:140]
        pos = squashed.find(probe[:90].replace(";}", "}"))
        if pos < 0:
            pos = squashed.find(probe[: min(60, len(probe))])
        if pos < 0:
            problems.append(f"stylesheet {f.name}: rules not found in Next CSS")
        elif pos < last:
            problems.append(f"stylesheet {f.name}: appears before an earlier stylesheet")
        else:
            last = pos
    return problems


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("pages", nargs="*")
    ap.add_argument("--site", type=Path, default=DEFAULT_SITE)
    ap.add_argument("--out", type=Path, default=ROOT / "out")
    ap.add_argument("-v", "--verbose", action="store_true")
    args = ap.parse_args()
    utilities = load_utilities()
    flex = flex_classes([p.read_text(encoding="utf8") for p in sorted((ROOT / "src" / "styles").glob("*.css")) if p.name != "utilities.css"])
    pages = args.pages or PAGES
    failed = 0
    print(f"{'page':44} {'body':>6} {'head':>6} {'ld+json':>8} {'css order':>10}")
    for page in pages:
        orig_path = args.site / f"{page}.html"
        next_path = args.out / f"{page}.html"
        orig = BeautifulSoup(fix_source(orig_path.read_text(encoding="utf8")), "html.parser")
        nxt = BeautifulSoup(next_path.read_text(encoding="utf8"), "html.parser")
        page_url = "/" + page + ".html"
        norm = Normaliser(page_url, utilities, flex)

        body_diffs: list[str] = []
        a = norm.node(orig.find("body"))
        b = norm.node(nxt.find("body"))
        diff(a, b, "body", body_diffs)

        head_diffs: list[str] = []
        fa, fb = head_facts(orig, norm), head_facts(nxt, norm)
        for key in ("lang", "title", "meta", "links"):
            if fa[key] != fb[key]:
                if isinstance(fa[key], set):
                    head_diffs.append(f"{key}: only original {sorted(map(str, fa[key] - fb[key]))}; only next {sorted(map(str, fb[key] - fa[key]))}")
                else:
                    head_diffs.append(f"{key}: {fa[key]!r} != {fb[key]!r}")
        ld_diffs = [] if json_lds(orig) == json_lds(nxt) else ["JSON-LD differs"]
        css_diffs = stylesheet_order(orig, nxt, args.site, args.out, page_url)

        row = [("ok" if not x else f"{len(x)}") for x in (body_diffs, head_diffs, ld_diffs, css_diffs)]
        print(f"{page:44} {row[0]:>6} {row[1]:>6} {row[2]:>8} {row[3]:>10}")
        if any((body_diffs, head_diffs, ld_diffs, css_diffs)):
            failed += 1
            for d in body_diffs + head_diffs + ld_diffs + css_diffs:
                print("    -", d)
    print(f"\n{len(pages) - failed}/{len(pages)} pages identical after normalisation")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
