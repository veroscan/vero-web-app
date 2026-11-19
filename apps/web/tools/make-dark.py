"""Builds src/app/styles/kit-dark.css from the bright styles.

The dark navy theme the owner approved on 19 Nov 2026 was made from the bright boards by a colour
mapping (vero-build/product-design-v2/make_dark.py). This applies the same mapping to the app's CSS:
every rule whose colours change gets a dark copy under [data-theme="dark"], then the dark polish
from the approved boards is added. Run it after changing any bright CSS:

    npm run styles:dark --workspace @vero/web

Inputs: src/app/styles/kit.css, base.css, motion.css, then src/app/styles/pages/*.css (alphabetical), then tools/dark-polish.css.
"""
import colorsys
import glob
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
STYLES = os.path.join(HERE, '..', 'src', 'app', 'styles')
OUT = os.path.join(STYLES, 'kit-dark.css')

TOKENS = {
    '--navy': '#3D7BFF', '--navy-2': '#5B91FF', '--ink': '#F1F3FF', '--ink-2': '#B9C0E4', '--ink-3': '#8189B6', '--ink-4': '#565E8F',
    '--bg': '#01012A', '--panel': '#06084A', '--line': 'rgba(150,170,255,.12)', '--line-2': 'rgba(150,170,255,.08)',
    '--hover': 'rgba(120,150,255,.07)', '--sel': 'rgba(61,123,255,.18)',
    '--urgent': '#FF7A7F', '--urgent-bg': 'rgba(255,107,112,.13)', '--warn': '#FFB648', '--warn-bg': 'rgba(255,182,72,.13)',
    '--good': '#3BE0A6', '--good-bg': 'rgba(59,224,166,.12)', '--sky-2': '#4FA8FF', '--line-soft': 'rgba(150,170,255,.08)',
    '--brand-ink': '#8FB0FF', '--scrim': 'rgba(0,0,12,.6)', '--field': 'rgba(150,170,255,.06)',
    '--field-line': 'rgba(150,170,255,.16)', '--soft': 'rgba(150,170,255,.07)',
}


def rgb(h):
    h = h.lstrip('#')
    if len(h) == 3:
        h = ''.join(c * 2 for c in h)
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))


def lum(h):
    r, g, b = rgb(h)
    return .2126 * r + .7152 * g + .0722 * b


def bluish(h):
    r, g, b = rgb(h)
    hh, _, s = colorsys.rgb_to_hls(r, g, b)
    return s > .35 and .5 < hh < .75


HEX = re.compile(r'#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b')


def map_bg(m):
    h = m.group(0)
    L = lum(h)
    if h.lower() in ('#fff', '#ffffff'):
        return 'var(--panel)'
    if L > .8:
        if bluish(h):
            return 'rgba(61,123,255,.16)'
        return 'rgba(150,170,255,.07)' if L < .94 else 'rgba(150,170,255,.045)'
    if L > .6 and bluish(h):
        return 'rgba(79,168,255,.32)'
    return h


def map_fg(m):
    h = m.group(0)
    L = lum(h)
    if h.lower() in ('#000066', '#0b1180'):
        return '#8FB0FF'
    if L < .12:
        return 'var(--ink)'
    if L < .3:
        return 'var(--ink-2)'
    return h


def map_line(m):
    h = m.group(0)
    return 'rgba(150,170,255,.14)' if lum(h) > .7 else h


DECL = re.compile(r'(?<![\w-])(background(?:-color|-image)?|color|border(?:-[a-z]+)*|outline|box-shadow|caret-color|fill|stroke)(\s*:\s*)([^;}"`\n]*)')
INK_RGBA = re.compile(r'rgba\(\s*11\s*,\s*14\s*,\s*58\s*,\s*([.\d]+)\s*\)')


def darken_decls(t):
    def dec(m):
        prop, sep, val = m.groups()
        if prop.startswith('background'):
            val = HEX.sub(map_bg, val)
        elif prop in ('color', 'caret-color', 'fill', 'stroke'):
            val = HEX.sub(map_fg, val)
            val = INK_RGBA.sub(lambda r: f'rgba(241,243,255,{min(1, float(r.group(1)) + .25):.2f})', val)
        elif prop == 'box-shadow':
            val = re.sub(r'(0 0 0 \d+px )(#fff\b|#FFF\b|#ffffff\b)', r'\1var(--bg)', val)
            val = INK_RGBA.sub(lambda r: f'rgba(0,0,12,{min(.9, float(r.group(1)) * 2.4):.2f})', val)
            val = HEX.sub(map_line, val) if 'inset' not in val else val
        else:
            val = HEX.sub(map_line, val)
        return prop + sep + val
    return DECL.sub(dec, t)


def scope(selectors):
    out = []
    for s in selectors.split(','):
        s = s.strip()
        if not s:
            continue
        if s.startswith(':root'):
            out.append(':root[data-theme="dark"]' + s[5:])
        elif re.match(r'^html\b', s):
            out.append('html[data-theme="dark"]' + s[4:])
        elif '[data-theme' in s or '.light-only' in s or '.dark-only' in s:
            continue  # already themed by hand
        elif s.startswith(('.atmos', 'svg.flow', '.glass', '.kick', '.otag', '.toast')):
            continue  # the atmosphere and the website pieces look the same in both themes
        else:
            out.append('[data-theme="dark"] ' + s)
    return ','.join(out)


def strip_comments(css):
    return re.sub(r'/\*.*?\*/', '', css, flags=re.S)


def blocks(css):
    """Top-level (prelude, body) pairs. Nested blocks stay inside body."""
    i, n, out = 0, len(css), []
    while i < n:
        j = css.find('{', i)
        if j < 0:
            break
        prelude = css[i:j].strip()
        depth, k = 1, j + 1
        while k < n and depth:
            if css[k] == '{':
                depth += 1
            elif css[k] == '}':
                depth -= 1
            k += 1
        out.append((prelude, css[j + 1:k - 1]))
        i = k
    return out


def darken_sheet(css, polish=False):
    rules = []
    for prelude, body in blocks(strip_comments(css)):
        if prelude.startswith(('@keyframes', '@font-face', '@import', '@property', '@view-transition')) or prelude.startswith('::view-transition'):
            continue
        if prelude.startswith(('@media', '@supports', '@container')):
            inner = darken_sheet(body, polish)
            if inner.strip():
                rules.append(prelude + '{' + inner + '}')
            continue
        if prelude == ':root' and not polish:
            continue  # tokens are set at the top
        # Only the declarations whose colour changed are copied: copying the whole rule would re-assert
        # its layout (position, height, padding...) at dark-theme specificity and beat later responsive
        # rules, e.g. the sticky sidebar in base.css.
        if polish:
            dark = body
        else:
            dark = ';'.join(darken_decls(m.group(0)).strip() for m in DECL.finditer(body) if darken_decls(m.group(0)) != m.group(0))
        if polish or dark:
            sel = scope(prelude)
            if sel:
                rules.append(sel + '{' + dark.strip() + '}')
    return '\n'.join(rules)


def main():
    polish = open(os.path.join(HERE, 'dark-polish.css'), encoding='utf8').read()
    files = [os.path.join(STYLES, 'kit.css'), os.path.join(STYLES, 'base.css'), os.path.join(STYLES, 'motion.css')] + sorted(glob.glob(os.path.join(STYLES, 'pages', '*.css')))
    parts = ['/* Generated by apps/web/tools/make-dark.py from the bright styles. Do not edit by hand. */',
             ':root[data-theme="dark"]{color-scheme:dark;' + ';'.join(f'{k}:{v}' for k, v in TOKENS.items()) + '}']
    for f in files:
        dark = darken_sheet(open(f, encoding='utf8').read())
        if dark.strip():
            parts.append(f'/* from {os.path.relpath(f, STYLES)} */\n' + dark)
    parts.append('/* dark polish, from the approved dark boards */\n' + darken_sheet(polish, polish=True))
    open(OUT, 'w', encoding='utf8', newline='\n').write('\n'.join(parts) + '\n')
    print('wrote', os.path.relpath(OUT), 'from', len(files), 'files')


if __name__ == '__main__':
    main()
