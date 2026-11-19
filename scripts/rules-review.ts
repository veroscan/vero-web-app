/**
 * npm run rules:review        writes the lawyer review pack to docs/review/
 * npm run rules:review -- --check   fails if docs/review/ no longer matches the rule code
 * npm run rules:review -- --export <folder>   writes a folder to send: HTML pages, the sheet, the maps
 *
 * Builds the review pack straight from the rule packs in @vero/rules, so what the lawyer reads
 * is exactly what the scan runs. Each pack's fingerprint is the same SHA-256 the reference sync
 * stores (`packContentHash`): an approval given for one fingerprint can't cover changed rules.
 * Approval itself is recorded only through the admin tool, by a named person; this script can't
 * approve anything.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import {
  DERIVED_FACTS, DERIVED_THRESHOLDS, JURISDICTIONS, loadPack, QUESTIONNAIRE, vaultSlotsFor,
  type Jurisdiction, type Logic, type Pack, type Rule,
} from '@vero/rules';
import { packContentHash } from '../apps/api/src/db/reference-sync';

const ROOT = resolve(import.meta.dirname, '..');
export const REVIEW_DIR = resolve(ROOT, 'docs', 'review');

const LAYERS: Record<number, string> = { 1: 'Corporate', 2: 'IP and technology', 3: 'Compliance and regulatory', 4: 'Commercial', 5: 'Fundraising', 6: 'AI and data' };
const TIERS: Record<number, string> = { 1: 'official source, read live', 2: 'licensed vendor', 3: 'official list', 4: 'a document the company uploads', 5: 'the company tells us' };
const STAGES: Record<number, string> = { 1: 'S1 pre-incorporation', 2: 'S2 incorporated, pre-revenue', 3: 'S3 revenue, pre-raise', 4: 'S4 raising', 5: 'S5 post-raise' };
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Recommended order: the International pack applies to every company, so it goes first. */
const ORDER: readonly string[] = ['INTL', 'GB', 'NG', 'US', 'US-DE'];

const QUESTION_LABELS = new Map<string, string>(QUESTIONNAIRE.flatMap((q) => q.fields.map((f) => [f.fact, f.label] as const)));

function factLabel(key: string): string {
  const question = QUESTION_LABELS.get(key);
  if (question) return `the answer to “${question}”`;
  return `\`${key}\``;
}

function literal(value: Logic): string {
  if (value === true) return 'yes';
  if (value === false) return 'no';
  if (value === null) return 'nothing';
  if (typeof value === 'string') return `“${value}”`;
  if (Array.isArray(value)) return value.map(literal).join(', ');
  return typeof value === 'number' ? String(value) : JSON.stringify(value);
}

function isOp(value: Logic): value is Record<string, Logic> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** JSONLogic in plain words. A fact we don't have makes the whole condition "unknown", never false. */
export function describeLogic(logic: Logic): string {
  if (!isOp(logic)) return literal(logic);
  const [op, raw] = Object.entries(logic)[0] ?? ['', null];
  const args = Array.isArray(raw) ? raw : [raw];
  const d = (value: Logic | undefined) => (value === undefined ? '?' : term(value));
  switch (op) {
    case 'var': return factLabel(typeof args[0] === 'string' ? args[0] : JSON.stringify(args[0]));
    case '==': case '===': return `${d(args[0])} is ${d(args[1])}`;
    case '!=': case '!==': return `${d(args[0])} is not ${d(args[1])}`;
    case '>': return `${d(args[0])} is more than ${d(args[1])}`;
    case '>=': return `${d(args[0])} is at least ${d(args[1])}`;
    case '<': return args.length === 3 ? `${d(args[1])} is between ${d(args[0])} and ${d(args[2])} (exclusive)` : `${d(args[0])} is less than ${d(args[1])}`;
    case '<=': return args.length === 3 ? `${d(args[1])} is between ${d(args[0])} and ${d(args[2])}` : `${d(args[0])} is at most ${d(args[1])}`;
    case '!': return `not (${describeLogic(args[0] ?? null)})`;
    case '!!': return `${d(args[0])} is yes (or present)`;
    case 'in': return Array.isArray(args[1]) ? `${d(args[0])} is one of ${literal(args[1])}` : `${d(args[1])} includes ${d(args[0])}`;
    case 'and': return args.length === 1 ? describeLogic(args[0] ?? null) : `all of: ${args.map((a) => `(${describeLogic(a)})`).join(' and ')}`;
    case 'or': return args.length === 1 ? describeLogic(args[0] ?? null) : `any of: ${args.map((a) => `(${describeLogic(a)})`).join(' or ')}`;
    case 'if': return `if ${describeLogic(args[0] ?? null)} then ${describeLogic(args[1] ?? null)}${args.length > 2 ? ` otherwise ${describeLogic(args[2] ?? null)}` : ''}`;
    default: return `\`${JSON.stringify(logic)}\``;
  }
}

function term(value: Logic): string {
  return isOp(value) ? describeLogic(value) : literal(value);
}

function recurrence(rule: Rule): string | null {
  const r = rule.recurrence;
  if (!r) return null;
  let when: string;
  if (r.type === 'annual_fixed') when = `every year on ${r.day} ${MONTHS[r.month - 1] ?? r.month}`;
  else if (r.type === 'periodic') when = `every ${r.every_months === 1 ? 'month' : `${r.every_months} months`}`;
  else when = `${r.type.replace(/_/g, ' ')}: ${JSON.stringify(Object.fromEntries(Object.entries(r).filter(([k]) => !['type', 'monitoring', 'done_fact'].includes(k))))}`;
  return `${when} (${r.monitoring.mode === 'auto' ? `checked automatically with ${r.monitoring.source ?? 'its source'}` : 'reminder only'})`;
}

function cell(text: string): string {
  return text.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function packTitle(pack: Pack): string {
  return `${pack.name} (${pack.jurisdiction}) ${pack.version}`;
}

function renderRule(rule: Rule): string {
  const lines: string[] = [];
  const flag = rule.confidence === 'needs_review' ? ' — **can only say “to check”** (built on an unconfirmed map line)' : '';
  lines.push(`### ${rule.id} — ${rule.title}${flag}`, '');
  lines.push(`| Severity | Layer | Area | Checked by | Applies from | Regulator |`, '|---|---|---|---|---|---|');
  lines.push(`| ${rule.severity} | ${rule.layer} ${LAYERS[rule.layer] ?? ''} | ${cell(rule.area)} | tier ${rule.tier}, ${TIERS[rule.tier] ?? ''} | ${STAGES[rule.stage_from] ?? rule.stage_from} | ${cell(rule.regulator ?? '—')} |`, '');
  lines.push(`- **Law cited:** ${rule.instruments.length ? rule.instruments.map((i) => `${i.law}${i.cite ? `, ${i.cite}` : ''}`).join('; ') : 'none (the rule cites only its map line)'}`);
  for (const source of rule.sources) lines.push(`- **Encoded from:** \`${source.doc}\`, ${source.section}: “${source.line}”`);
  lines.push(`- **Applies when:** ${describeLogic(rule.applies_when)}`);
  lines.push(`- **Passes when:** ${describeLogic(rule.satisfied_when)}`);
  if (rule.defect_when !== undefined) lines.push(`- **A problem (defect) when:** ${describeLogic(rule.defect_when)}`);
  if (rule.verify_when !== undefined) lines.push(`- **“To check” when:** ${describeLogic(rule.verify_when)}`);
  lines.push('- **Otherwise:** a gap. A fact we don\'t have makes the rule “to check”, never a gap.');
  const when = recurrence(rule);
  if (when) lines.push(`- **Recurs:** ${when}`);
  if (rule.parameters && Object.keys(rule.parameters).length) lines.push(`- **Numbers for you to confirm:** ${Object.entries(rule.parameters).map(([k, v]) => `${k} = ${JSON.stringify(v)}`).join('; ')}`);
  if (rule.effective_from || rule.effective_to) lines.push(`- **In force:** ${rule.effective_from ?? 'already'} to ${rule.effective_to ?? 'no end date'}`);
  if (rule.answered_by) lines.push(`- **The company can answer it directly:** ${rule.answered_by.map((a) => factLabel(a.fact)).join('; ')}`);
  if (rule.shared_obligation) lines.push(`- **Same obligation as other packs:** \`${rule.shared_obligation}\` (counted once per company)`);
  if (rule.market_overlay) lines.push(`- **Abroad:** ${rule.market_overlay === 'never' ? 'never follows the company into another country' : rule.market_overlay === 'market' ? 'follows the company into a country where it has users' : 'follows the company only where it employs people'}`);
  lines.push(`- **Evidence:** ${rule.evidence.join('; ')} · **Fix type:** ${rule.remediation.action_type} · **Penalty if left:** ${rule.cost_of_delay.penalty}${rule.cost_of_delay.fundraising_relevant ? ', matters for fundraising' : ''}`);
  lines.push('', '**What the company reads when it fails:**', '');
  lines.push(`> **${rule.text.headline}**`, `> ${rule.text.missing}`, `> *Why it matters:* ${rule.text.why}`, `> *If left:* ${rule.text.if_left}`, `> *What to do:* ${rule.text.fix}`, '');
  lines.push('Decision (record it in `decisions.csv`): Approve · Amend · Strike', '');
  return lines.join('\n');
}

function renderPack(pack: Pack): string {
  const hash = packContentHash(pack);
  const own = vaultSlotsFor(pack.jurisdiction).filter((slot) => slot.jurisdiction === pack.jurisdiction);
  const needs = pack.rules.filter((rule) => rule.confidence === 'needs_review').length;
  const out: string[] = [
    `# Review: ${packTitle(pack)}`, '',
    '**Draft for lawyer review. Not legal advice.** Generated from the rule code by `npm run rules:review`; do not edit by hand.', '',
    `- **Pack:** ${pack.jurisdiction}, version ${pack.version}, ${pack.rules.length} rules (${needs} can only say “to check”).`,
    `- **Fingerprint (SHA-256 of the rules):** \`${hash}\``,
    `- **Also applies:** ${pack.inherits.length ? pack.inherits.join(', ') : 'nothing else'}${pack.jurisdiction === 'INTL' ? '' : '; the International pack (INTL) runs after it, and a country rule asking the same thing wins'}.`,
    '- **Approving it:** a named person approves this exact version and fingerprint in the admin tool. If any rule changes, the fingerprint changes and the approval no longer covers it.', '',
  ];
  for (const layer of [1, 2, 3, 4, 5, 6]) {
    const rules = pack.rules.filter((rule) => rule.layer === layer);
    if (!rules.length) continue;
    out.push(`## Layer ${layer}: ${LAYERS[layer]} (${rules.length})`, '');
    for (const rule of rules) out.push(renderRule(rule));
  }
  if (own.length) {
    out.push(`## Documents this pack asks for (${own.length})`, '', '| Slot | What | Why we ask | Checked by | Expires | Rules |', '|---|---|---|---|---|---|');
    for (const slot of own) out.push(`| \`${slot.id}\` | ${cell(slot.label)} | ${cell(slot.reason)} | tier ${slot.tier} | ${slot.expires ? 'yes' : 'no'} | ${slot.rule_ids.join(', ')} |`);
    out.push('');
  }
  return out.join('\n');
}

function csvField(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function renderDecisions(packs: readonly Pack[]): string {
  const header = ['pack', 'version', 'fingerprint', 'rule_id', 'title', 'layer', 'severity', 'confidence', 'tier', 'encoded_from', 'decision (approve / amend / strike)', 'amendment', 'comment', 'reviewer', 'date'];
  const rows = [header.join(',')];
  for (const pack of packs) {
    const hash = packContentHash(pack);
    for (const rule of pack.rules) {
      const source = rule.sources[0];
      rows.push([pack.jurisdiction, pack.version, hash, rule.id, rule.title, String(rule.layer), rule.severity, rule.confidence, String(rule.tier), source ? `${source.doc} / ${source.section}` : '', '', '', '', '', ''].map(csvField).join(','));
    }
  }
  // The byte-order mark makes Excel read the file as UTF-8 (curly quotes, accents).
  return `\uFEFF${rows.join('\r\n')}\r\n`;
}

function renderGlossary(): string {
  const out = ['# Facts the rules read', '', 'Generated by `npm run rules:review`. **Draft for lawyer review.**', '',
    'Rules read three kinds of fact: answers the company gives (shown in the packs as the question itself), facts from official sources (`registry.*`, `web.*`, `sanctions.*`), and the derived facts below, worked out from the others. A derived fact we can\'t work out is unknown, and a rule reading it says “to check”.', '',
    '## Thresholds used by derived facts (please confirm each)', '', '| Name | Value |', '|---|---|'];
  for (const [name, value] of Object.entries(DERIVED_THRESHOLDS)) out.push(`| \`${name}\` | ${cell(JSON.stringify(value))} |`);
  out.push('', '## Derived facts', '', '| Fact | Worked out from |', '|---|---|');
  for (const fact of DERIVED_FACTS) out.push(`| \`${fact.key}\` | ${cell(fact.inputs.map((input) => QUESTION_LABELS.has(input) ? `“${QUESTION_LABELS.get(input)}”` : `\`${input}\``).join(', '))} |`);
  out.push('');
  return out.join('\n');
}

export function fileName(pack: Pack): string {
  return `${pack.jurisdiction.toLowerCase()}-${pack.version}.md`;
}

function renderIndex(packs: readonly Pack[]): string {
  const total = packs.reduce((sum, pack) => sum + pack.rules.length, 0);
  const needs = packs.reduce((sum, pack) => sum + pack.rules.filter((rule) => rule.confidence === 'needs_review').length, 0);
  const rows = packs.map((pack) => `| [${pack.name}](${fileName(pack)}) | ${pack.jurisdiction} | ${pack.version} | ${pack.rules.length} | ${pack.rules.filter((rule) => rule.confidence === 'needs_review').length} | \`${packContentHash(pack).slice(0, 12)}\` |`);
  return [
    '# Rule packs for review', '',
    'Generated from the rule code by `npm run rules:review`. Read `docs/review/HOW-TO-REVIEW.md` first.', '',
    `${packs.length} packs, ${total} rules, ${needs} of which can only ever say “to check”.`, '',
    '| Pack | Code | Version | Rules | Only “to check” | Fingerprint (first 12) |', '|---|---|---|---|---|---|', ...rows, '',
    '- [Every rule in one sheet, for your decisions](decisions.csv)',
    '- [The facts and thresholds the rules read](facts-and-thresholds.md)', '',
  ].join('\n');
}

export function orderedPacks(): Pack[] {
  const codes = [...JURISDICTIONS] as Jurisdiction[];
  const rank = (code: string) => (ORDER.includes(code) ? ORDER.indexOf(code) : ORDER.length);
  codes.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
  return codes.map((code) => loadPack(code));
}

/** Every generated file, keyed by its name in docs/review/. */
export function buildReview(): Map<string, string> {
  const packs = orderedPacks();
  const files = new Map<string, string>();
  files.set('README.md', renderIndex(packs));
  files.set('decisions.csv', renderDecisions(packs));
  files.set('facts-and-thresholds.md', renderGlossary());
  for (const pack of packs) files.set(fileName(pack), renderPack(pack));
  return files;
}

function inline(text: string): string {
  const esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return esc
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\s][^*]{0,300}?)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\.md\)/g, '<a href="$2.html">$1</a>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
}

/** The small Markdown subset this script and the maps use, as one printable HTML page. */
export function markdownToHtml(markdown: string, title: string): string {
  const out: string[] = [];
  const lines = markdown.split(/\r?\n/);
  let list = false;
  let quote = false;
  const close = () => {
    if (list) out.push('</ul>');
    if (quote) out.push('</blockquote>');
    list = false;
    quote = false;
  };
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? '';
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      close();
      const level = (heading[1] ?? '#').length;
      out.push(`<h${level}>${inline(heading[2] ?? '')}</h${level}>`);
    } else if (line.startsWith('|') && (lines[i + 1] ?? '').startsWith('|---')) {
      close();
      const cells = (row: string) => row.replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map((c) => inline(c.trim().replace(/\\\|/g, '|')));
      out.push('<table><thead><tr>', ...cells(line).map((c) => `<th>${c}</th>`), '</tr></thead><tbody>');
      i += 2;
      while (i < lines.length && (lines[i] ?? '').startsWith('|')) {
        out.push('<tr>', ...cells(lines[i] ?? '').map((c) => `<td>${c}</td>`), '</tr>');
        i += 1;
      }
      i -= 1;
      out.push('</tbody></table>');
    } else if (/^\s*[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      if (quote) close();
      if (!list) out.push('<ul>');
      list = true;
      out.push(`<li>${inline(line.replace(/^\s*[-*]\s+|^\d+\.\s+/, ''))}</li>`);
    } else if (line.startsWith('>')) {
      if (list) close();
      if (!quote) out.push('<blockquote>');
      quote = true;
      out.push(`<p>${inline(line.replace(/^>\s?/, ''))}</p>`);
    } else if (line.trim() === '' || line.trim() === '---') {
      close();
    } else {
      close();
      out.push(`<p>${inline(line)}</p>`);
    }
  }
  close();
  const style = 'body{font:15px/1.5 Georgia,serif;max-width:60rem;margin:2rem auto;padding:0 1rem;color:#111}h1,h2,h3{font-family:Arial,sans-serif}h3{margin-top:2rem;border-top:1px solid #ccc;padding-top:1rem}table{border-collapse:collapse;margin:.5rem 0;font-size:13px}th,td{border:1px solid #bbb;padding:4px 6px;text-align:left;vertical-align:top}code{font-size:12px;background:#f3f3f3;padding:0 2px}blockquote{border-left:3px solid #888;margin:.5rem 0;padding-left:1rem;color:#333}@media print{h3{break-inside:avoid}}';
  return `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${inline(title)}</title><style>${style}</style></head><body>\n${out.join('\n')}\n</body></html>\n`;
}

/** Writes a folder to send: every page as HTML, the decision sheet, and the research maps. */
export function exportReview(dir: string): number {
  const files = buildReview();
  const how = readFileSync(resolve(REVIEW_DIR, 'HOW-TO-REVIEW.md'), 'utf8');
  files.set('HOW-TO-REVIEW.md', how);
  mkdirSync(resolve(dir, 'research-maps'), { recursive: true });
  let count = 0;
  for (const [name, text] of files) {
    if (name.endsWith('.csv')) writeFileSync(resolve(dir, name), text, 'utf8');
    else writeFileSync(resolve(dir, name.replace(/\.md$/, '.html')), markdownToHtml(text.replace(/docs\/review\/HOW-TO-REVIEW\.md/g, 'HOW-TO-REVIEW.html'), name.replace(/\.md$/, '')), 'utf8');
    count += 1;
  }
  // The engine documents the cover note points to, for what each source can and can't say.
  for (const doc of ['docs/GLOBAL-COVERAGE.md', 'docs/ENGINE-STATUS.md', 'docs/NATIONAL-REGISTERS.md', 'docs/FRANCE.md']) {
    const name = doc.split('/').pop() ?? doc;
    writeFileSync(resolve(dir, 'research-maps', name.replace(/\.md$/, '.html')), markdownToHtml(readFileSync(resolve(ROOT, doc), 'utf8'), name.replace(/\.md$/, '')), 'utf8');
    count += 1;
  }
  const maps = new Set(orderedPacks().flatMap((pack) => pack.rules.flatMap((rule) => rule.sources.map((source) => source.doc))));
  for (const doc of maps) {
    const name = doc.split('/').pop() ?? doc;
    writeFileSync(resolve(dir, 'research-maps', name.replace(/\.md$/, '.html')), markdownToHtml(readFileSync(resolve(ROOT, doc), 'utf8'), name.replace(/\.md$/, '')), 'utf8');
    count += 1;
  }
  return count;
}

function main(): void {
  const { values } = parseArgs({ options: { check: { type: 'boolean', default: false }, export: { type: 'string' } } });
  if (values.export) {
    const count = exportReview(resolve(values.export));
    console.log(`Wrote ${count} files to ${values.export}.`);
    return;
  }
  const files = buildReview();
  if (values.check) {
    const stale = [...files].filter(([name, text]) => !existsSync(resolve(REVIEW_DIR, name)) || readFileSync(resolve(REVIEW_DIR, name), 'utf8') !== text).map(([name]) => name);
    if (stale.length) {
      console.error(`The review pack no longer matches the rules: ${stale.join(', ')}. Run npm run rules:review.`);
      process.exit(1);
    }
    console.log('The review pack matches the rules.');
    return;
  }
  mkdirSync(REVIEW_DIR, { recursive: true });
  for (const [name, text] of files) writeFileSync(resolve(REVIEW_DIR, name), text, 'utf8');
  console.log(`Wrote ${files.size} files to docs/review/.`);
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) main();
