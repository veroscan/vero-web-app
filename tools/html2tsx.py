#!/usr/bin/env python3
"""First-draft converter: static Vero pages -> typed React sections.

Reads  <site>/<page>.html  (the read-only reference site) and writes, under vero-next/src:

  components/sections/<page>/<Section>.tsx    one component per top-level <section> of <main>
  app/<route>/page.tsx                        metadata + JSON-LD + the sections in order
  styles/utilities.css                        one class per distinct static inline style

The markup is converted exactly (attributes in JSX form, SVG camel-cased, entities decoded, URLs made
root-relative, whitespace that matters kept as {" "}). Beyond a plain conversion it
  * recognises markup that repeats across pages and writes it as a ui component (Button, LinkArrow, Eyebrow,
    SectionHead, FaqSection, FaqList, CtaBand: see match_pattern),
  * turns runs of three or more identical sibling elements into a typed data array plus a .map() (list_token),
  * replaces static inline styles with utility classes and data-carrying ones with typed style objects.
Section names come from PAGES below. tools/dom_parity.py proves the result renders the same DOM.
Run from the vero-next folder:

    python tools/html2tsx.py                 # every page
    python tools/html2tsx.py product about   # selected pages

Needs only Python 3 and BeautifulSoup (bs4).
"""
from __future__ import annotations

import argparse
import copy
import json
import posixpath
import re
import sys
import zlib
from pathlib import Path

from bs4 import BeautifulSoup, Comment, NavigableString, Tag

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_SITE = Path(r"C:\Users\edete\Desktop\clone\vero-web\site")
SRC = ROOT / "src"
WIDTH = 110  # soft wrap column of the generated JSX

# --------------------------------------------------------------------------------------------
# Page table: file stem -> (route folder under src/app, sections folder, section names in order)
# --------------------------------------------------------------------------------------------
ARTICLE_NAMES = ["ReadProgress", "ArticleHero", "ArticleIntro", "ArticleBody", "RelatedArticles", "ArticleCta"]

PAGES: dict[str, dict] = {
    "index": dict(route="", dir="home", fn="HomePage", names=["Hero", "Statement", "Serve", "Areas", "Sources", "BothSides", "Marquee", "Coverage", "Faq", "Cta"]),
    "product": dict(route="product", dir="product", fn="ProductPage", names=["ProductHero", "ProductSteps", "ProductAreas", "ProductDocuments", "ProductFaq", "ProductCta"]),
    "methodology": dict(route="methodology", dir="methodology", fn="MethodologyPage", names=["MethodologyHero", "MethodologyStatement", "Layers", "Findings", "Weights", "Sources", "Verification", "Limits", "MethodologyFaq", "MethodologyCta"]),
    "security": dict(route="security", dir="security", fn="SecurityPage", names=["SecurityHero", "SecurityIntro", "DataRows", "SecurityStatus", "SecurityFaq", "SecurityCta"]),
    "for-investors": dict(route="for-investors", dir="for-investors", fn="ForInvestorsPage", names=["InvestorsHero", "InvestorFeatures", "SourceCheck", "PublicBadge", "Journey", "UsParentStack", "InvestorFaq", "InvestorExamples", "InvestorsCta"]),
    "for-founders": dict(route="for-founders", dir="for-founders", fn="ForFoundersPage", names=["FoundersHero", "Situations", "SituationStories", "FoundersStatement", "FoundersCta"]),
    "coverage": dict(route="coverage", dir="coverage", fn="CoveragePage", names=["CoverageHero", "CoveragePanel", "CountryRows", "ScanChoices", "NextCountries", "CoverageFaq", "CoverageCta"]),
    "sample-report": dict(route="sample-report", dir="sample-report", fn="SampleReportPage", names=["SampleHero", "ShortReport", "ExampleCompany", "Screens", "Modules", "Change", "Process", "SampleFaq", "SampleCta"]),
    "about": dict(route="about", dir="about", fn="AboutPage", names=["AboutHero", "LaunchStats", "Mission", "WhyItMatters", "HowItWorks", "Principles", "Partners", "ShortVersion", "AboutCta"]),
    "insights": dict(route="insights", dir="insights", fn="InsightsPage", names=["InsightsHero", "InsightsList", "InsightsCta"]),
    "waitlist": dict(route="waitlist", dir="waitlist", fn="WaitlistPage", names=["WaitlistHero", "WaitlistForm", "WaitlistWho"]),
    "contact": dict(route="contact", dir="contact", fn="ContactPage", names=["ContactHero", "RequestDemo", "LaunchUpdates"]),
    "privacy-policy": dict(route="privacy-policy", dir="privacy-policy", fn="PrivacyPolicyPage", names=["PrivacyHero", "PrivacyText"]),
    "terms-of-service": dict(route="terms-of-service", dir="terms-of-service", fn="TermsOfServicePage", names=["TermsHero", "TermsText"]),
    "404": dict(route=None, dir="not-found", fn="NotFound", names=["NotFoundHero"]),
    "insights/cac-annual-returns-and-status": dict(route="insights/cac-annual-returns-and-status", dir="articles/cac-annual-returns-and-status", fn="CacAnnualReturnsArticle", names=ARTICLE_NAMES),
    "insights/contractor-ip-assignment": dict(route="insights/contractor-ip-assignment", dir="articles/contractor-ip-assignment", fn="ContractorIpAssignmentArticle", names=ARTICLE_NAMES),
    "insights/nigeria-gaid-cookie-banners": dict(route="insights/nigeria-gaid-cookie-banners", dir="articles/nigeria-gaid-cookie-banners", fn="NigeriaGaidCookieBannersArticle", names=ARTICLE_NAMES),
}

# --------------------------------------------------------------------------------------------
# HTML -> JSX vocabulary
# --------------------------------------------------------------------------------------------
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}
SVG_TAGS = {"svg", "path", "circle", "rect", "line", "g", "defs", "clippath", "polyline", "polygon", "ellipse", "use", "text", "tspan", "lineargradient", "radialgradient", "stop", "mask", "filter"}
SVG_TAG_CASE = {"clippath": "clipPath", "lineargradient": "linearGradient", "radialgradient": "radialGradient"}
BLOCK = {"div", "p", "ul", "ol", "li", "section", "article", "aside", "header", "footer", "nav", "main", "h1", "h2", "h3", "h4", "h5", "h6", "figure", "figcaption", "form", "table", "thead", "tbody", "tr", "td", "th", "details", "summary", "blockquote", "hr", "pre", "dl", "dt", "dd", "fieldset", "legend", "option", "select", "canvas", "button"}
ATTR_RENAME = {
    "class": "className", "for": "htmlFor", "tabindex": "tabIndex", "viewbox": "viewBox", "pathlength": "pathLength",
    "datetime": "dateTime", "autocomplete": "autoComplete", "inputmode": "inputMode", "novalidate": "noValidate",
    "maxlength": "maxLength", "readonly": "readOnly", "colspan": "colSpan", "rowspan": "rowSpan", "clip-path": "clipPath",
    "crossorigin": "crossOrigin", "srcset": "srcSet", "enterkeyhint": "enterKeyHint", "autofocus": "autoFocus",
    "contenteditable": "contentEditable", "spellcheck": "spellCheck", "fetchpriority": "fetchPriority",
}
BOOLEAN_ATTRS = {"hidden", "open", "required", "novalidate", "disabled", "checked", "selected", "multiple", "readonly", "autofocus"}
URL_ATTRS = {"href", "src"}
NUMERIC_ATTRS = {"tabIndex", "colSpan", "rowSpan", "maxLength"}
POSITION_STYLE_CLASSES = {"ps-pin", "fx-pin", "dv-spot"}  # inline style carries data (a position), not a design choice


def camel_hyphen(name: str) -> str:
    """stroke-width -> strokeWidth (SVG presentation attributes)."""
    parts = name.split("-")
    return parts[0] + "".join(p.capitalize() for p in parts[1:])


def jsx_text(s: str) -> str:
    out = []
    for ch in s:
        o = ord(ch)
        if ch == "&":
            out.append("&amp;")
        elif ch == "<":
            out.append("&lt;")
        elif ch == ">":
            out.append("&gt;")
        elif ch == "{":
            out.append("&#123;")
        elif ch == "}":
            out.append("&#125;")
        elif ch == '"':
            out.append("&quot;")
        elif ch == "'":
            out.append("&apos;")
        elif ch == "\xa0":
            out.append("&nbsp;")
        elif o in (0x00AD,) or 0x2000 <= o <= 0x200F or 0x2028 <= o <= 0x202F or 0x205F <= o <= 0x206F or o == 0xFEFF:
            out.append(f"&#x{o:X};")
        else:
            out.append(ch)
    return "".join(out)


def js_string(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


def collapse(s: str) -> str:
    return re.sub(r"[ \t\r\n\f]+", " ", s)


VARIANT_TOKENS = {"good", "watch", "risk", "none", "on", "is-on", "off", "r", "w", "g"}
FIELD_BY_TAG = {
    "b": "title", "strong": "term", "small": "detail", "h2": "heading", "h3": "heading", "h4": "heading", "h5": "heading",
    "p": "text", "li": "text", "time": "date", "em": "emphasis", "a": "label", "span": "text", "div": "text", "i": "mark",
    "u": "mark", "dt": "term", "dd": "detail", "summary": "question", "label": "label", "figcaption": "caption",
}
GENERIC_CLASSES = {"wrap", "row", "pad", "pad-sm", "on-dark"}  # say nothing about what a list holds
MAX_ITEM_NODES = 60  # larger repeated blocks are unique designs, not list items
ARROW_UP_RIGHT = "M7 17 17 7M8 7h9v9"
ARROW_RIGHT = "M5 12h14M13 6l6 6-6 6"
ARROW_ATTRS = {"viewbox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true"}


def camel(text: str) -> str:
    parts = re.split(r"[-_ ]+", text.strip("-_ "))
    return parts[0].lower() + "".join(p[:1].upper() + p[1:] for p in parts[1:])


def pascal(text: str) -> str:
    c = camel(text)
    return c[:1].upper() + c[1:]


def tokens_of(el: Tag) -> list[str]:
    cls = el.get("class") or []
    return list(cls) if isinstance(cls, list) else cls.split()


def flex_classes(css_texts: list[str]) -> set[str]:
    """Class names whose rule (outside media queries) sets display:flex/grid. Whitespace-only text between the
    children of such an element is not rendered, so it carries no meaning."""
    found: set[str] = set()
    for css in css_texts:
        css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
        out, depth, i = [], 0, 0
        top = []
        while i < len(css):  # drop @media/@supports blocks: keep only top-level rules
            if css.startswith("@", i) and depth == 0:
                j = css.find("{", i)
                if css[i:j].startswith(("@media", "@supports", "@keyframes", "@font-face", "@layer")):
                    d, k = 1, j + 1
                    while d and k < len(css):
                        d += {"{": 1, "}": -1}.get(css[k], 0)
                        k += 1
                    i = k
                    continue
            top.append(css[i])
            i += 1
        for m in re.finditer(r"([^{}]+)\{([^{}]*)\}", "".join(top)):
            if re.search(r"(?:^|;)\s*display\s*:\s*(?:inline-)?(?:flex|grid)\b", m.group(2)):
                for sel in m.group(1).split(","):
                    last = re.split(r"[\s>+~]+", sel.strip())[-1]
                    mm = re.fullmatch(r"(?:[a-z0-9]*)\.([\w-]+)", last)
                    if mm:
                        found.add(mm.group(1))
    return found


class Converter:
    def __init__(self, page_dir: str, utilities: dict[str, str], flex: set[str]):
        self.page_dir = page_dir  # folder of the source page relative to the site root ("" or "insights")
        self.utilities = utilities  # class name -> css declarations (shared across pages)
        self.flex = flex
        self.reset_file()

    def reset_file(self) -> None:
        """State collected while converting one section file."""
        self.imports: set[str] = set()  # "ui:Button", "type:FaqItem"...
        self.hoisted: list[str] = []  # interfaces and data arrays placed above the component
        self.names: set[str] = set()
        self.holes: dict | None = None  # active while rendering a list-item template
        self.path: list[int] = []
        self.root_key: str | None = None

    # ---- urls -------------------------------------------------------------------------------
    def fix_url(self, value: str) -> str:
        if not value or value.startswith(("#", "mailto:", "tel:", "http:", "https:", "data:", "javascript:", "/")):
            return value
        path, sep, frag = value.partition("#")
        path, qsep, query = path.partition("?")
        resolved = "/" + posixpath.normpath(posixpath.join(self.page_dir, path)) if path else ""
        return resolved + (qsep + query if qsep else "") + (sep + frag if sep else "")

    # ---- style ------------------------------------------------------------------------------
    @staticmethod
    def parse_style(style: str) -> list[tuple[str, str]]:
        decls = []
        for part in style.split(";"):
            if ":" in part:
                k, v = part.split(":", 1)
                decls.append((k.strip(), v.strip()))
        return decls

    def utility_class(self, decls: list[tuple[str, str]]) -> str:
        def slug(text: str) -> str:
            text = re.sub(r"var\(--([a-z-]+)\)", lambda m: m.group(1), text)
            text = re.sub(r"(^|\s)-(?=\d)", lambda m: m.group(1) + "neg", text).replace("%", "pct").replace(".", "_")
            text = re.sub(r"[^a-zA-Z0-9_-]+", "-", text).strip("-")
            return text.lower()

        name = "u-" + "-".join(slug(k) + "-" + slug(v) for k, v in decls)
        if len(name) > 56:
            name = f"u-{slug(decls[0][0])}-{zlib.crc32(name.encode()) % 10**6}"
        css = ";".join(f"{k}:{v}" for k, v in decls)
        if self.utilities.setdefault(name, css) != css:
            raise ValueError(f"utility class name collision: {name}")
        return name

    @staticmethod
    def is_positional(el: Tag) -> bool:
        return bool(set(tokens_of(el)) & POSITION_STYLE_CLASSES) or (el.name == "i" and not tokens_of(el))

    def style_value(self, prop: str, value: str, custom: bool) -> str:
        hole = self.hole(("style", prop))
        if hole:
            return hole
        return self.num_or_str(value) if custom else js_string(value)

    def style_attr(self, el: Tag, style: str) -> tuple[str | None, str | None]:
        """Returns (jsx style attribute or None, utility class to add or None)."""
        decls = self.parse_style(style)
        custom = [(k, v) for k, v in decls if k.startswith("--")]
        plain = [(k, v) for k, v in decls if not k.startswith("--")]
        style_parts: list[str] = []
        util = None
        if plain and self.is_positional(el) and self.holes is not None:  # data inside a list item, not a design value
            style_parts = [f"{camel(k)}: {self.style_value(k, v, False)}" for k, v in plain]
            plain = []
        if plain:
            util = self.utility_class(plain)
        custom_body = ", ".join(f"{js_string(k)}: {self.style_value(k, v, True)}" for k, v in custom)
        if custom:
            self.imports.add("lib:cssVars")
        if custom and not style_parts:
            return "style={cssVars({ " + custom_body + " })}", util
        if custom:
            return "style={{ " + ", ".join(style_parts) + ", ...cssVars({ " + custom_body + " }) }}", util
        if style_parts:
            return "style={{ " + ", ".join(style_parts) + " }}", util
        return None, util

    @staticmethod
    def num_or_str(v: str) -> str:
        return v if re.fullmatch(r"-?\d+(\.\d+)?", v) else js_string(v)

    # ---- attributes -------------------------------------------------------------------------
    def attrs(self, el: Tag) -> list[str]:
        out: list[str] = []
        extra_class: str | None = None
        name = el.name
        in_svg = name in SVG_TAGS
        for key, value in el.attrs.items():
            if isinstance(value, list):
                value = " ".join(value)
            if key == "style":
                jsx, util = self.style_attr(el, value)
                if jsx:
                    out.append(jsx)
                extra_class = util
                continue
            if key in URL_ATTRS:
                value = self.fix_url(value)
            if name == "input" and key == "value":
                jsx_key = "defaultValue"
            elif name == "input" and key == "checked":
                jsx_key = "defaultChecked"
            elif key in ATTR_RENAME:
                jsx_key = ATTR_RENAME[key]
            elif in_svg and "-" in key and not key.startswith(("aria-", "data-")):
                jsx_key = camel_hyphen(key)
            else:
                jsx_key = key
            if key == "class":
                continue  # handled below so the utility class can be appended
            hole = self.hole(("attr", key))
            if hole:
                out.append(f"{jsx_key}={{{hole}}}")
                continue
            if key in BOOLEAN_ATTRS and value in ("", key):
                out.append(jsx_key)
                continue
            out.append(self.attr_literal(jsx_key, value))
        classes = tokens_of(el)
        if extra_class:
            classes.append(extra_class)
        tone = self.hole(("tone",))
        if tone is not None:
            base = [c for c in classes if c not in VARIANT_TOKENS]
            self.imports.add("lib:cx")
            args = ([js_string(" ".join(base))] if base else []) + [tone]
            out.insert(0, "className={cx(" + ", ".join(args) + ")}")
        elif classes:
            out.insert(0, self.attr_literal("className", " ".join(classes)))
        return out

    @staticmethod
    def attr_literal(key: str, value: str) -> str:
        if key in NUMERIC_ATTRS and re.fullmatch(r"-?[0-9]+", value):
            return f"{key}={{{value}}}"
        if re.search(r'[&{}\\"\n<]', value):
            return f"{key}={{{js_string(value)}}}"
        return f'{key}="{value}"'

    def hole(self, key: tuple) -> str | None:
        """Expression for a value that varies between list items (`item.field`, or `item` for a list of strings)."""
        if self.holes is None:
            return None
        field = self.holes.get((tuple(self.path),) + key)
        if not field:
            return None
        return self.holes["__var__"] if self.holes.get("__scalar__") else f"{self.holes['__var__']}.{field}"

    # ---- elements ---------------------------------------------------------------------------
    @staticmethod
    def tag_name(el: Tag) -> str:
        return SVG_TAG_CASE.get(el.name, el.name)

    @staticmethod
    def is_block(node) -> bool:
        return isinstance(node, Tag) and node.name in BLOCK

    @staticmethod
    def siblings(node):
        prev = node.previous_sibling
        while isinstance(prev, Comment):
            prev = prev.previous_sibling
        nxt = node.next_sibling
        while isinstance(nxt, Comment):
            nxt = nxt.next_sibling
        return prev, nxt

    def ws_significant(self, ws: str, prev, nxt, parent: Tag | None = None) -> bool:
        """Same rule the parity checker applies: whitespace between children of a flex/grid container is not
        rendered, and a run with a line break is formatting when it touches the edge of its parent or a
        block-level sibling. Anything else is a real space."""
        if parent is not None and set(tokens_of(parent)) & self.flex:
            return False
        if "\n" in ws and (prev is None or nxt is None or self.is_block(prev) or self.is_block(nxt)):
            return False
        return True

    # ---- patterns: markup that repeats across pages becomes a ui component ----------------------
    def kids(self, el: Tag) -> list:
        """Children that matter: comments and formatting-only whitespace are skipped."""
        return [
            c for c in el.children
            if not isinstance(c, Comment) and not (isinstance(c, NavigableString) and not c.strip() and not self.ws_significant(str(c), *self.siblings(c), el))
        ]

    @staticmethod
    def tag_kids(el: Tag) -> list[Tag]:
        return [c for c in el.children if isinstance(c, Tag)]

    @staticmethod
    def plain_text(el: Tag) -> str | None:
        """Text of an element that holds nothing but one run of text."""
        kids = [c for c in el.children if not isinstance(c, Comment)]
        if len(kids) == 1 and isinstance(kids[0], NavigableString) and str(kids[0]).strip():
            return collapse(str(kids[0]).strip())
        return None

    @staticmethod
    def is_arrow(svg, path: str) -> bool:
        if not isinstance(svg, Tag) or svg.name != "svg" or {k: (" ".join(v) if isinstance(v, list) else v) for k, v in svg.attrs.items()} != ARROW_ATTRS:
            return False
        paths = [c for c in svg.children if isinstance(c, Tag)]
        return len(paths) == 1 and paths[0].name == "path" and paths[0].attrs == {"d": path} and len(list(svg.children)) == 1

    def call(self, name: str, props: list[str], children: str | None, indent: int) -> list[str]:
        """Lines of `<Name props>children</Name>` (or self-closing)."""
        pad = "  " * indent
        self.imports.add(f"ui:{name}")
        head = f"<{name}" + "".join(" " + p for p in props)
        if children is None:
            one = f"{pad}{head} />"
            if len(one) <= WIDTH:
                return [one]
            return [pad + f"<{name}"] + [pad + "  " + p for p in props] + [pad + "/>"]
        one = f"{pad}{head}>{children}</{name}>"
        if len(one) <= WIDTH and "\n" not in children:
            return [one]
        return [pad + head + ">"] + [pad + "  " + ln for ln in self.wrap_text(children, WIDTH - len(pad) - 2)] + [pad + f"</{name}>"]

    def match_pattern(self, el: Tag, indent: int) -> list[str] | None:
        if self.holes is not None:
            return None
        for matcher in (self.p_button, self.p_link_arrow, self.p_eyebrow, self.p_faq_section, self.p_faq_list, self.p_cta, self.p_sec_head):
            lines = matcher(el, indent)
            if lines is not None:
                return lines
        return None

    def button_parts(self, el: Tag):
        """(props, label) when `el` is the standard arrow button, else None. No side effects."""
        classes = tokens_of(el)
        if el.name not in ("a", "button") or not classes or classes[0] != "btn" or len(classes) > 2:
            return None
        if len(classes) == 2 and not classes[1].startswith("btn--"):
            return None
        wanted = {"data-magnetic", "href"} if el.name == "a" else {"data-magnetic", "type"}
        if set(el.attrs) - {"class"} != wanted or el.get("data-magnetic") != "":
            return None
        kids = self.kids(el)
        if len(kids) != 2 or not isinstance(kids[0], NavigableString) or not str(kids[0]).endswith(" ") or not str(kids[0]).strip():
            return None
        span = kids[1]
        if not isinstance(span, Tag) or span.name != "span" or span.attrs != {"class": ["btn-ico"]}:
            return None
        inner = self.kids(span)
        if len(inner) != 1 or not self.is_arrow(inner[0], ARROW_UP_RIGHT):
            return None
        props = []
        if len(classes) == 2:
            props.append(f'variant="{classes[1][5:]}"')
        if el.name == "a":
            props.append(self.attr_literal("href", self.fix_url(el["href"])))
        else:
            props.append(self.attr_literal("type", el["type"]))
        return props, collapse(str(kids[0]).strip())

    def p_button(self, el: Tag, indent: int):
        parts = self.button_parts(el)
        if parts is None:
            return None
        return self.call("Button", parts[0], jsx_text(parts[1]), indent)

    def p_link_arrow(self, el: Tag, indent: int):
        if el.name != "a" or tokens_of(el) != ["link-arrow"] or set(el.attrs) != {"class", "href"}:
            return None
        kids = self.kids(el)
        if len(kids) != 2 or not isinstance(kids[0], NavigableString) or not str(kids[0]).endswith(" ") or not str(kids[0]).strip():
            return None
        if not self.is_arrow(kids[1], ARROW_RIGHT):
            return None
        return self.call("LinkArrow", [self.attr_literal("href", self.fix_url(el["href"]))], jsx_text(collapse(str(kids[0]).strip())), indent)

    def p_eyebrow(self, el: Tag, indent: int):
        if el.name != "span" or tokens_of(el) != ["eyebrow"] or "style" in el.attrs:
            return None
        text = self.plain_text(el)
        if text is None:
            return None
        props = [self.attr_literal(k, v if isinstance(v, str) else " ".join(v)) for k, v in el.attrs.items() if k != "class"]
        return self.call("Eyebrow", props, jsx_text(text), indent)

    # -- FAQ --
    def faq_items(self, faq: Tag) -> list[tuple[str, str | None, bool]] | None:
        """(question, answer JSX, open) for each <details>; None when the list is not the standard shape."""
        if faq.name != "div" or tokens_of(faq) != ["faq"] or set(faq.attrs) != {"class"}:
            return None
        items = []
        for child in self.kids(faq):
            if isinstance(child, NavigableString):
                if child.strip():
                    return None
                continue
            if child.name != "details" or set(child.attrs) - {"open"}:
                return None
            parts = self.tag_kids(child)
            if len(parts) != 2 or parts[0].name != "summary" or parts[1].name != "div" or tokens_of(parts[1]) != ["ans"] or set(parts[1].attrs) != {"class"}:
                return None
            summary_kids = self.kids(parts[0])
            if len(summary_kids) != 2 or not isinstance(summary_kids[0], NavigableString):
                return None
            pm = summary_kids[1]
            if not isinstance(pm, Tag) or pm.name != "span" or tokens_of(pm) != ["pm"] or pm.attrs != {"class": ["pm"], "aria-hidden": "true"} or self.kids(pm):
                return None
            items.append((collapse(str(summary_kids[0]).strip()), parts[1], "open" in child.attrs))
        return items or None

    def build_faq(self, items) -> str:
        entries = []
        for question, ans, is_open in items:
            ps = self.tag_kids(ans)
            only_p = len(ps) == 1 and ps[0].name == "p" and not ps[0].attrs and self.plain_text(ps[0]) is not None and len(self.kids(ans)) == 1
            if only_p:
                answer = js_string(self.plain_text(ps[0]))
                entry = f"  {{ question: {js_string(question)}, answer: {answer}" + (", open: true" if is_open else "") + " },"
            else:
                holder = BeautifulSoup("", "html.parser").new_tag("fragment")
                for child in list(ans.children):
                    holder.append(copy.copy(child))
                lines, _ = self.render_children(holder, 4)
                entry = (
                    "  {\n"
                    f"    question: {js_string(question)},\n"
                    + ("    open: true,\n" if is_open else "")
                    + "    answer: (\n      <>\n" + "\n".join(lines) + "\n      </>\n    ),\n  },"
                )
            entries.append(entry)
        name = self.unique_name("FAQ_ITEMS")
        self.imports.add("type:FaqItem")
        self.hoisted.append(f"const {name}: readonly FaqItem[] = [\n" + "\n".join(entries) + "\n];")
        return name

    def p_faq_list(self, el: Tag, indent: int):
        items = self.faq_items(el)
        if items is None:
            return None
        return self.call("FaqList", [f"items={{{self.build_faq(items)}}}"], None, indent)

    def p_faq_section(self, el: Tag, indent: int):
        if el.name != "section" or el.get("id") != "faq" or el.get("aria-labelledby") != "faq-title" or set(el.attrs) != {"class", "id", "aria-labelledby"}:
            return None
        spacing = tokens_of(el)
        if spacing not in (["pad"], ["pad-sm"]):
            return None
        wrap = self.tag_kids(el)
        if len(wrap) != 1 or tokens_of(wrap[0]) != ["wrap", "faq-grid"] or set(wrap[0].attrs) != {"class"}:
            return None
        parts = self.tag_kids(wrap[0])
        if len(parts) != 2 or tokens_of(parts[0]) != ["faq-side"] or set(parts[0].attrs) != {"class"}:
            return None
        side = self.tag_kids(parts[0])
        if len(side) != 4:
            return None
        eyebrow, h2, note, row = side
        if tokens_of(eyebrow) != ["eyebrow"] or eyebrow.attrs != {"class": ["eyebrow"]}:
            return None
        if h2.name != "h2" or h2.attrs != {"class": ["h2"], "data-split": "", "id": "faq-title"}:
            return None
        if note.name != "p" or note.attrs != {"class": ["muted"], "style": "margin:0"}:
            return None
        if row.name != "div" or tokens_of(row) != ["btn-row"] or set(row.attrs) != {"class"}:
            return None
        buttons = self.tag_kids(row)
        if len(buttons) != 1:
            return None
        button = buttons[0]
        parts_b = self.button_parts(button)
        if parts_b is None or tokens_of(button) != ["btn", "btn--soft"]:
            return None
        label = parts_b[1]
        items = self.faq_items(parts[1])
        texts = (self.plain_text(eyebrow), self.plain_text(h2), self.plain_text(note))
        if items is None or None in texts:
            return None
        props = [
            f"eyebrow={js_string(texts[0])}", f"heading={js_string(texts[1])}", f"note={js_string(texts[2])}",
            f"action={{{{ label: {js_string(label)}, href: {js_string(self.fix_url(button['href']))} }}}}",
            f"items={{{self.build_faq(items)}}}",
        ]
        if spacing == ["pad-sm"]:
            props.append('spacing="pad-sm"')
        self.utility_class([("margin", "0")])
        return self.call("FaqSection", props, None, indent)

    # -- section head / call to action --
    def p_sec_head(self, el: Tag, indent: int):
        if el.name != "div" or tokens_of(el) != ["sec-head"] or set(el.attrs) != {"class"}:
            return None
        parts = self.tag_kids(el)
        if len(parts) not in (2, 3) or len(self.kids(el)) != len(parts):
            return None
        eyebrow, h2 = parts[0], parts[1]
        if eyebrow.name != "span" or eyebrow.attrs != {"class": ["eyebrow"]} or h2.name != "h2" or tokens_of(h2) != ["h2"] or not set(h2.attrs) <= {"class", "data-split", "id"} or h2.get("data-split") != "":
            return None
        texts = [self.plain_text(eyebrow), self.plain_text(h2)]
        props = [f"eyebrow={js_string(texts[0] or '')}", f"title={js_string(texts[1] or '')}"]
        if None in texts:
            return None
        if "id" in h2.attrs:
            props.append(f"id={js_string(h2['id'])}")
        if len(parts) == 3:
            intro = parts[2]
            if intro.name != "p" or intro.attrs != {"class": ["muted"]} or self.plain_text(intro) is None:
                return None
            props.append(f"intro={js_string(self.plain_text(intro))}")
        return self.call("SectionHead", props, None, indent)

    def p_cta(self, el: Tag, indent: int):
        if el.name != "section" or tokens_of(el) != ["pad-sm"] or el.attrs.keys() != {"class"}:
            return None
        wrap = self.tag_kids(el)
        if len(wrap) != 1 or wrap[0].attrs != {"class": ["wrap"]}:
            return None
        parts = self.tag_kids(wrap[0])
        small = None
        if parts and parts[0].name == "p":
            small = parts.pop(0)
            if small.attrs != {"class": ["small-print"], "data-reveal": "", "style": "margin:0 0 28px"} or self.plain_text(small) is None:
                return None
        if len(parts) != 1 or parts[0].attrs != {"class": ["cta"], "data-scale-in": ""}:
            return None
        row = self.tag_kids(parts[0])
        if len(row) != 1 or row[0].attrs != {"class": ["cta-row"]}:
            return None
        left_right = self.tag_kids(row[0])
        if len(left_right) != 2:
            return None
        left, lines = left_right
        if left.name != "div" or left.attrs != {"style": "display:grid;gap:26px"}:
            return None
        if lines.attrs != {"class": ["contact-lines"]} or [t.name for t in self.tag_kids(lines)] != ["span", "span", "a"]:
            return None
        spans = self.tag_kids(lines)
        if self.plain_text(spans[0]) != "The first read is free." or self.plain_text(spans[1]) != "Pricing is not published yet." or spans[2].get("href") != "mailto:hello@codeclauselegal.com" or self.plain_text(spans[2]) != "hello@codeclauselegal.com" or set(spans[2].attrs) != {"href"}:
            return None
        inner = self.tag_kids(left)
        if len(inner) != 3 or inner[0].attrs != {"class": ["eyebrow"]} or inner[1].name != "h2" or inner[1].attrs != {"data-split": ""}:
            return None
        if self.plain_text(inner[0]) is None or self.plain_text(inner[1]) is None:
            return None
        self.utility_class([("display", "grid"), ("gap", "26px")])
        if small is not None:
            self.utility_class([("margin", "0 0 28px")])
        props = [f"heading={js_string(self.plain_text(inner[1]))}"]
        if self.plain_text(inner[0]) != "Get started":
            props.append(f"eyebrow={js_string(self.plain_text(inner[0]))}")
        if small is not None:
            props.append(f"smallPrint={js_string(self.plain_text(small))}")
        actions = inner[2]
        if self.is_standard_actions(actions):
            return self.call("CtaBand", props, None, indent)
        body = self.element(actions, indent + 1)
        pad = "  " * indent
        self.imports.add("ui:CtaBand")
        return [pad + "<CtaBand" + "".join(" " + p for p in props) + ">"] + body + [pad + "</CtaBand>"]

    def is_standard_actions(self, el: Tag) -> bool:
        if el.name != "div" or el.attrs != {"class": ["btn-row"]}:
            return False
        buttons = self.tag_kids(el)
        if len(buttons) != 2:
            return False
        expected = [("btn btn--green", "/waitlist.html", "Join the waitlist"), ("btn btn--light", "/contact.html", "Book a demo")]
        for b, (cls, href, label) in zip(buttons, expected):
            parts_b = self.button_parts(b)
            if b.name != "a" or " ".join(tokens_of(b)) != cls or self.fix_url(b.get("href", "")) != href or parts_b is None or parts_b[1] != label:
                return False
        return True

    # ---- generic rendering --------------------------------------------------------------------
    def element(self, el: Tag, indent: int, child_index: int | None = None) -> list[str]:
        if self.holes is not None and child_index is not None:
            self.path.append(child_index)
        try:
            return self._element(el, indent)
        finally:
            if self.holes is not None and child_index is not None:
                self.path.pop()

    def _element(self, el: Tag, indent: int) -> list[str]:
        matched = self.match_pattern(el, indent)
        if matched is not None:
            return matched
        pad = "  " * indent
        tag = self.tag_name(el)
        attrs = self.attrs(el)
        if self.root_key is not None and not self.path:
            attrs.insert(0, f"key={{{self.root_key}}}")
        opening = f"<{tag}" + "".join(" " + a for a in attrs)
        if el.name in VOID:
            return [pad + opening + " />"]
        lines, inline = self.render_children(el, indent + 1)
        if not lines:
            closing = " />" if el.name in SVG_TAGS else f"></{tag}>"
            return [pad + opening + closing]
        if inline is not None and len(f"{pad}{opening}>{inline}</{tag}>") <= WIDTH:
            return [f"{pad}{opening}>{inline}</{tag}>"]
        if len(pad + opening + ">") > WIDTH and len(attrs) > 1:
            head = [pad + f"<{tag}"] + [pad + "  " + a for a in attrs] + [pad + ">"]
        else:
            head = [pad + opening + ">"]
        return head + lines + [pad + f"</{tag}>"]

    def render_children(self, parent: Tag, indent: int) -> tuple[list[str], str | None]:
        """Indented lines for the children of `parent`; second value is the text when the only
        child is one short run of text (the caller may then keep the element on one line)."""
        pad = "  " * indent
        tokens: list[list[str]] = []
        kinds: list[str] = []
        kids = [c for c in parent.children if not isinstance(c, Comment)]
        runs = {} if self.holes is not None else self.find_runs(parent, kids)
        i = 0
        while i < len(kids):
            kid = kids[i]
            prev, nxt = self.siblings(kid)
            if i in runs:
                end = runs[i]
                tokens.append(self.list_token(parent, [k for k in kids[i:end] if isinstance(k, Tag)], indent))
                kinds.append("tag")
                i = end
                continue
            if isinstance(kid, NavigableString):
                raw = str(kid)
                if not raw.strip():
                    if self.ws_significant(raw, prev, nxt, parent):
                        self.glue(tokens, pad)
                    i += 1
                    continue
                lead = raw[: len(raw) - len(raw.lstrip())]
                trail = raw[len(raw.rstrip()):]
                if lead and self.ws_significant(lead, prev, nxt, parent):
                    self.glue(tokens, pad)
                text_hole = self.hole(("text", i))
                text = "{" + text_hole + "}" if text_hole else jsx_text(collapse(raw.strip()))
                text_lines = self.wrap_text(text, WIDTH - len(pad))
                if trail and self.ws_significant(trail, prev, nxt, parent):
                    text_lines[-1] += '{" "}'
                tokens.append([pad + ln for ln in text_lines])
                kinds.append("text")
            elif isinstance(kid, Tag):
                tokens.append(self.element(kid, indent, child_index=i))
                kinds.append("tag")
            i += 1
        lines = [ln for tok in tokens for ln in tok]
        only_text = lines[0].strip() if kinds == ["text"] and len(lines) == 1 else None
        return lines, only_text

    @staticmethod
    def glue(tokens: list[list[str]], pad: str) -> None:
        """A significant space between two nodes: JSX needs it spelled out at a line break."""
        if tokens:
            tokens[-1][-1] += '{" "}'
        else:
            tokens.append([pad + '{" "}'])

    @staticmethod
    def wrap_text(text: str, width: int) -> list[str]:
        lines, cur = [], ""
        for word in text.split(" "):
            if cur and len(cur) + 1 + len(word) > width:
                lines.append(cur)
                cur = word
            else:
                cur = f"{cur} {word}" if cur else word
        lines.append(cur)
        return lines

    # ---- repeated siblings -> typed data array + map ----------------------------------------
    def shape(self, node, parent: Tag) -> tuple:
        """Structure of a node with every value that may differ between list items left out."""
        if isinstance(node, NavigableString):
            raw = str(node)
            if not raw.strip():
                return ("_",)
            prev, nxt = self.siblings(node)
            return ("T", bool(raw[:1].isspace() and self.ws_significant(raw[: len(raw) - len(raw.lstrip())], prev, nxt, parent)), bool(raw[-1:].isspace() and self.ws_significant(raw[len(raw.rstrip()):], prev, nxt, parent)))
        style = node.get("style")
        style_part: tuple = ()
        if style:
            decls = self.parse_style(style)
            plain = tuple(d for d in decls if not d[0].startswith("--") and not self.is_positional(node))
            style_part = (plain, tuple(k for k, _ in decls if k.startswith("--")), tuple(k for k, _ in decls if not k.startswith("--")) if self.is_positional(node) else ())
        base = tuple(c for c in tokens_of(node) if c not in VARIANT_TOKENS)
        attr_names = tuple(sorted(k for k in node.attrs if k not in ("class", "style")))
        kids = tuple(self.shape(c, node) for c in node.children if not isinstance(c, Comment) and not (isinstance(c, NavigableString) and not str(c).strip() and not self.ws_significant(str(c), *self.siblings(c), node)))
        return (node.name, base, attr_names, style_part, kids)

    @staticmethod
    def node_count(node) -> int:
        return 1 + sum(Converter.node_count(c) for c in node.children if isinstance(c, Tag))

    @staticmethod
    def field_type(values: list[str], numeric: bool) -> str:
        if numeric:
            return "number"
        if set(values) <= {"true", "false"}:  # aria-selected, aria-pressed...: React types them as Booleanish
            return '"true" | "false"'
        return "string"

    def has_varying_data(self, items: list[Tag]) -> bool:
        """A run of identical elements has nothing to put in a data array."""
        feats = []
        for item in items:
            f: dict = {}
            self.features(item, (), f)
            feats.append(f)
        return any(len({f.get(k, "") for f in feats}) > 1 for k in set().union(*feats))

    def would_match(self, el: Tag) -> bool:
        """True when a ui-component pattern applies to `el` (such elements are not turned into list data)."""
        saved = (set(self.imports), len(self.hoisted), set(self.names))
        try:
            return self.match_pattern(el, 0) is not None
        finally:
            self.imports = saved[0]
            del self.hoisted[saved[1]:]
            self.names = saved[2]

    def find_runs(self, parent: Tag, kids: list) -> dict[int, int]:
        """start index -> end index (exclusive) of runs of >= 3 consecutive structurally identical elements."""
        runs: dict[int, int] = {}
        i = 0
        while i < len(kids):
            kid = kids[i]
            if not isinstance(kid, Tag) or kid.name in SVG_TAGS or kid.name in VOID or self.node_count(kid) > MAX_ITEM_NODES or self.would_match(kid):
                i += 1
                continue
            sig = self.shape(kid, parent)
            j = i + 1
            end = i + 1
            while j < len(kids):
                nxt = kids[j]
                if isinstance(nxt, NavigableString):
                    if nxt.strip() or self.ws_significant(str(nxt), *self.siblings(nxt), parent):
                        break
                    j += 1
                    continue
                if not isinstance(nxt, Tag) or self.shape(nxt, parent) != sig:
                    break
                j += 1
                end = j
            members = [k for k in kids[i:end] if isinstance(k, Tag)]
            if len(members) >= 3 and self.has_varying_data(members):
                runs[i] = end
                i = end
            else:
                i += 1
        return runs

    def features(self, el: Tag, path: tuple, out: dict) -> None:
        for key, value in el.attrs.items():
            if key == "class":
                variant = [c for c in tokens_of(el) if c in VARIANT_TOKENS]
                out[(path, "tone")] = " ".join(variant)
            elif key == "style":
                for k, v in self.parse_style(value):
                    out[(path, "style", k)] = v
            else:
                out[(path, "attr", key)] = self.fix_url(value if isinstance(value, str) else " ".join(value)) if key in URL_ATTRS else (value if isinstance(value, str) else " ".join(value))
        kids = [c for c in el.children if not isinstance(c, Comment)]
        for i, kid in enumerate(kids):
            if isinstance(kid, NavigableString):
                if str(kid).strip():
                    out[(path, "text", i)] = collapse(str(kid).strip())
            else:
                self.features(kid, path + (i,), out)

    @staticmethod
    def node_at(root: Tag, path: tuple) -> Tag:
        node = root
        for i in path:
            node = [c for c in node.children if not isinstance(c, Comment)][i]
        return node

    def field_name(self, key: tuple, root: Tag, used: set[str]) -> str:
        path, kind = key[0], key[1] if len(key) > 1 else "tone"
        el = self.node_at(root, path)
        if key[1:2] == ("tone",) or key[1:] == ("tone",):
            base = "tone"
        elif kind == "attr":
            attr = key[2]
            base = {"d": "path", "href": "href", "src": "src", "alt": "alt", "id": "id"}.get(attr) or camel(attr.removeprefix("data-"))
        elif kind == "style":
            base = camel(key[2].lstrip("-"))
        else:
            cls = tokens_of(el)
            token = camel(cls[0]) if cls else ""
            base = token if len(token) > 2 else FIELD_BY_TAG.get(el.name, "text")
        name, n = base, 1
        while name in used or name in ("key", "constructor"):
            n += 1
            name = f"{base}{n}"
        used.add(name)
        return name

    @staticmethod
    def scope_name(el: Tag) -> str:
        """Name of the area a list sits in: the nearest ancestor with an id, else with a meaningful class."""
        for ancestor in el.parents:
            if isinstance(ancestor, Tag) and ancestor.get("id"):
                return ancestor["id"]
        for ancestor in el.parents:
            if isinstance(ancestor, Tag) and ancestor.name not in ("[document]", "html", "body", "main"):
                named = [c for c in tokens_of(ancestor) if c not in GENERIC_CLASSES]
                if named:
                    return named[0]
        return ""

    def unique_name(self, base: str) -> str:
        name, n = base, 1
        while name in self.names:
            n += 1
            name = f"{base}_{n}" if base.isupper() or "_" in base else f"{base}{n}"
        self.names.add(name)
        return name

    def list_token(self, parent: Tag, items: list[Tag], indent: int) -> list[str]:
        pad = "  " * indent
        feats = []
        for item in items:
            f: dict = {}
            self.features(item, (), f)
            feats.append(f)
        first = items[0]
        # text first, then class variants, then attributes: the readable names go to the visible content
        order = {"text": 0, "tone": 1, "style": 2, "attr": 3}
        varying = sorted((k for k in dict.fromkeys(k for f in feats for k in f) if len({f.get(k, "") for f in feats}) > 1), key=lambda k: order[k[1]])
        used: set[str] = set()
        holes: dict = {"__var__": "item"}
        fields: list[tuple[str, tuple]] = []
        by_values: dict[tuple, str] = {}
        for key in varying:
            values = tuple(f.get(key, "") for f in feats)
            name = by_values.get(values) or self.field_name(key, first, used)
            by_values[values] = name
            holes[key] = name
            if name not in [n for n, _ in fields]:
                fields.append((name, key))
        # naming: the list's container describes it best (ul.ticks -> TICKS), else the item itself
        parent_cls = [c for c in tokens_of(parent) if c not in GENERIC_CLASSES]
        cls = tokens_of(first)
        noun = parent_cls[0] if parent_cls else (cls[0] if cls else "list")
        anchor = self.scope_name(parent)
        heading = parent.find_previous(["h2", "h3", "h4"]) if noun == "list" else None
        if heading is not None and heading.get_text(strip=True):  # unnamed bullet lists: name them after their heading
            words = re.findall(r"[A-Za-z]+", heading.get_text(" ", strip=True))[:4]
            anchor = "-".join(w.lower() for w in words)
        base = f"{anchor}-{noun}" if anchor else noun
        snake = re.sub(r"[-\s]+", "_", base).upper()
        const = self.unique_name(snake if snake.endswith("S") else f"{snake}_ITEMS")
        singular = pascal(base[:-1] if base.endswith("s") and len(base) > 3 else base)
        values_of = {name: [f.get(key, "") for f in feats] for name, key in fields}
        scalar = len(fields) == 1 and not fields[0][1][1] == "style"
        key_field = next((n for n, _ in fields if len(set(values_of[n])) == len(feats)), None)
        if scalar:
            holes["__scalar__"] = True
            rows = ["  " + js_string(v) + "," for v in values_of[fields[0][0]]]
            self.hoisted.append(f"const {const}: readonly string[] = [\n" + "\n".join(rows) + "\n];")
            key_expr, params = ("item", "(item)") if key_field else ("index", "(item, index)")
        else:
            iface = self.unique_name(singular + "Item")
            numeric = {
                n: key[1] == "style" and key[2].startswith("--") and all(re.fullmatch(r"-?\d+(\.\d+)?", v) for v in values_of[n])
                for n, key in fields
            }
            interface = f"interface {iface} {{\n" + "".join(f"  readonly {n}: {self.field_type(values_of[n], numeric[n])};\n" for n, _ in fields) + "}"
            rows = []
            for i in range(len(feats)):
                parts = [f"{n}: {values_of[n][i] if numeric[n] else js_string(values_of[n][i])}" for n, _ in fields]
                line = "  { " + ", ".join(parts) + " },"
                rows.append(line if len(line) <= 118 else "  {\n" + "".join(f"    {p},\n" for p in parts) + "  },")
            self.hoisted.append(interface + "\n\n" + f"const {const}: readonly {iface}[] = [\n" + "\n".join(rows) + "\n];")
            key_expr, params = (f"item.{key_field}", "(item)") if key_field and not numeric[key_field] else ("index", "(item, index)")
        saved = (self.holes, self.path, self.root_key)
        self.holes, self.path, self.root_key = holes, [], key_expr
        template = self.element(first, indent + 1)
        self.holes, self.path, self.root_key = saved
        return [pad + f"{{{const}.map({params} => ("] + template + [pad + "))}"]


def write_lf(path: Path, text: str) -> None:
    """Generated files use LF line endings on every platform."""
    path.write_text(text, encoding="utf8", newline="\n")


UI_IMPORTS = {
    "ui:Button": 'import { Button } from "@/components/ui/Button";',
    "ui:CtaBand": 'import { CtaBand } from "@/components/ui/CtaBand";',
    "ui:Eyebrow": 'import { Eyebrow } from "@/components/ui/Eyebrow";',
    "ui:FaqList": 'import { FaqList } from "@/components/ui/FaqList";',
    "ui:FaqSection": 'import { FaqSection } from "@/components/ui/FaqSection";',
    "ui:LinkArrow": 'import { LinkArrow } from "@/components/ui/LinkArrow";',
    "ui:SectionHead": 'import { SectionHead } from "@/components/ui/SectionHead";',
    "type:FaqItem": 'import type { FaqItem } from "@/components/ui/FaqList";',
    "lib:cssVars": 'import { cssVars } from "@/lib/css";',
    "lib:cx": 'import { cx } from "@/lib/cx";',
}


def import_lines(imports: set[str]) -> list[str]:
    return sorted(UI_IMPORTS[i] for i in imports)


def indent_lines(lines: list[str], n: int) -> list[str]:
    pad = "  " * n
    return [pad + ln if ln.strip() else ln for ln in lines]


# --------------------------------------------------------------------------------------------
# Page-level extraction
# --------------------------------------------------------------------------------------------
def meta_content(soup: BeautifulSoup, **attrs) -> str | None:
    tag = soup.find("meta", attrs=attrs)
    return tag.get("content") if tag else None


def ts_object(value, indent: int = 0) -> str:
    """JSON-compatible value -> TypeScript object literal text (keys unquoted when legal)."""
    pad = "  " * indent
    if isinstance(value, dict):
        if not value:
            return "{}"
        items = []
        for k, v in value.items():
            key = k if re.fullmatch(r"[A-Za-z_$][A-Za-z0-9_$]*", k) else js_string(k)
            items.append(f"{pad}  {key}: {ts_object(v, indent + 1)},")
        return "{\n" + "\n".join(items) + f"\n{pad}}}"
    if isinstance(value, list):
        if not value:
            return "[]"
        if all(isinstance(v, (str, int, float, bool)) or v is None for v in value) and sum(len(str(v)) for v in value) < 70:
            return "[" + ", ".join(ts_object(v) for v in value) + "]"
        items = [f"{pad}  {ts_object(v, indent + 1)}," for v in value]
        return "[\n" + "\n".join(items) + f"\n{pad}]"
    if isinstance(value, str):
        return js_string(value)
    return json.dumps(value)


CSS_IMPORT_RE = re.compile(r'href="((?:\.\./)?(?:vero|build/assets)/([^"]+\.css))"')

def css_imports(page_assets: str) -> list[str]:
    out = []
    for m in CSS_IMPORT_RE.finditer(page_assets):
        name = m.group(2)
        base = re.sub(r"-[A-Za-z0-9_]{8}\.css$", ".css", name)  # blog-CXy6OSki.css -> blog.css
        if base not in out:
            out.append(base)
    return out


def fix_source(text: str) -> str:
    """The legal pages contain a stray, never-closed empty <p> right before the first <h2>. Browsers close it
    implicitly (an empty paragraph, which renders nothing); a tree builder that does not would nest the
    whole article inside it. The paragraph is dropped."""
    return re.sub(r"<p>\s*(<h2)", lambda m: m.group(1), text)


def convert_page(stem: str, cfg: dict, site: Path, utilities: dict[str, str], flex: set[str]) -> None:
    src_file = site / (stem + ".html")
    soup = BeautifulSoup(fix_source(src_file.read_text(encoding="utf8")), "html.parser")
    page_dir = posixpath.dirname(stem)
    conv = Converter(page_dir, utilities, flex)

    head = str(soup.find("head"))
    page_head = re.search(r"<!--vero:page-head-->(.*?)<!--/vero:page-head-->", head, re.S).group(1)
    page_assets = re.search(r"<!--vero:page-assets-->(.*?)<!--/vero:page-assets-->", head, re.S).group(1)
    head_soup = BeautifulSoup(page_head, "html.parser")
    title = head_soup.find("title").get_text()
    description = meta_content(head_soup, name="description") or ""
    robots = meta_content(head_soup, name="robots") or ""
    og_description = meta_content(head_soup, property="og:description") or description
    og_title = meta_content(head_soup, property="og:title") or title
    og_type = meta_content(head_soup, property="og:type") or "website"
    published = meta_content(head_soup, property="article:published_time")
    section = meta_content(head_soup, property="article:section")
    json_lds = [json.loads(s.string) for s in head_soup.find_all("script", type="application/ld+json")]

    main = soup.find("main")
    top = [c for c in main.children if isinstance(c, Tag)]
    names = cfg["names"]
    if len(top) != len(names):
        sys.exit(f"{stem}: {len(top)} top-level blocks in <main> but {len(names)} names")

    sec_dir = SRC / "components" / "sections" / cfg["dir"]
    sec_dir.mkdir(parents=True, exist_ok=True)
    for old in sec_dir.glob("*.tsx"):
        old.unlink()
    imports_for_page = []
    shared_imports = []
    for name, node in zip(names, top):
        if tokens_of(node) == ["read-progress"]:  # identical on every article: one shared ui component
            shared_imports.append('import { ReadProgress } from "@/components/ui/ReadProgress";')
            imports_for_page.append("ReadProgress")
            continue
        conv.reset_file()
        body = conv.element(node, 0)
        lines = import_lines(conv.imports)
        if lines:
            lines.append("")
        for block in conv.hoisted:
            lines += block.split("\n") + [""]
        lines.append(f"export function {name}() {{")
        lines.append("  return (")
        lines += indent_lines(body, 2)
        lines.append("  );")
        lines.append("}")
        write_lf(sec_dir / f"{name}.tsx", "\n".join(lines) + "\n")
        imports_for_page.append(name)

    # page file ---------------------------------------------------------------------------
    main_attrs = " ".join(a for a in conv.attrs(main))
    main_open = "<main" + (" " + main_attrs if main_attrs else "") + ">"
    out = []
    for css in css_imports(page_assets):
        out.append(f'import "@/styles/{css}";')
    if json_lds:
        out.append('import { JsonLd } from "@/components/ui/JsonLd";')
    out.append('import { pageMetadata } from "@/lib/metadata";')
    out += shared_imports
    for n in imports_for_page:
        if n != "ReadProgress":
            out.append(f'import {{ {n} }} from "@/components/sections/{cfg["dir"]}/{n}";')
    out.append("")
    meta_args = [f"title: {js_string(title)}", f"description: {js_string(description)}"]
    if og_title != title:
        meta_args.append(f"ogTitle: {js_string(og_title)}")
    if og_description != description:
        meta_args.append(f"ogDescription: {js_string(og_description)}")
    if stem == "404":
        meta_args.append('indexing: "framework"')
    elif "noindex" in robots:
        meta_args.append('indexing: "noindex"')
    if og_type == "article" and published and section:
        meta_args.append(f"article: {{ publishedTime: {js_string(published)}, section: {js_string(section)} }}")
    out.append("export const metadata = pageMetadata({\n  " + ",\n  ".join(meta_args) + ",\n});")
    out.append("")
    for i, data in enumerate(json_lds):
        const = "JSON_LD" if len(json_lds) == 1 else f"JSON_LD_{i + 1}"
        out.append(f"const {const} = {ts_object(data)};")
        out.append("")
    ld_names = ["JSON_LD"] if len(json_lds) == 1 else [f"JSON_LD_{i + 1}" for i in range(len(json_lds))]
    out.append(f"export default function {cfg['fn']}() {{")
    out.append("  return (")
    out.append("    <>")
    for ld in ld_names:
        out.append(f"      <JsonLd data={{{ld}}} />")
    out.append("      " + main_open)
    for n in imports_for_page:
        out.append(f"        <{n} />")
    out.append("      </main>")
    out.append("    </>")
    out.append("  );")
    out.append("}")
    if cfg["route"] is None:
        # the 404 page is rendered by app/not-found.tsx
        target = SRC / "app" / "not-found.tsx"
    else:
        route_dir = SRC / "app" / cfg["route"] if cfg["route"] else SRC / "app"
        route_dir.mkdir(parents=True, exist_ok=True)
        target = route_dir / "page.tsx"
    text = "\n".join(out) + "\n"
    if cfg["route"] is None:
        text = text.replace("export const metadata = pageMetadata", "export const metadata = pageMetadata")
    write_lf(target, text)
    print(f"{stem}: {len(top)} sections -> {target.relative_to(ROOT)}")


def write_utilities(utilities: dict[str, str]) -> None:
    path = SRC / "styles" / "utilities.css"
    lines = ["/* Single-purpose classes that replace the static inline styles of the original markup (generated by tools/html2tsx.py). */"]
    for name in sorted(utilities):
        lines.append(f".{name}{{{utilities[name]}}}")
    write_lf(path, "\n".join(lines) + "\n")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("pages", nargs="*", help="page stems (default: all)")
    ap.add_argument("--site", type=Path, default=DEFAULT_SITE)
    args = ap.parse_args()
    utilities: dict[str, str] = {"u-position-relative": "position:relative"}  # used by the hand-written footer
    flex = flex_classes([p.read_text(encoding="utf8") for p in sorted((SRC / "styles").glob("*.css")) if p.name != "utilities.css"])
    if args.pages:  # a partial run must not drop the classes other pages use
        existing = (SRC / "styles" / "utilities.css").read_text(encoding="utf8")
        utilities.update({m.group(1): m.group(2) for m in re.finditer(r"^\.(u-[\w-]+)\{([^}]*)\}$", existing, re.M)})
    chosen = {k: v for k, v in PAGES.items() if not args.pages or k in args.pages or k.split("/")[-1] in args.pages}
    for stem, cfg in chosen.items():
        convert_page(stem, cfg, args.site, utilities, flex)
    write_utilities(utilities)


if __name__ == "__main__":
    main()
