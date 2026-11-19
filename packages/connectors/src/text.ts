/** Name matching and small parsers shared by the sources. */

const SUFFIXES = new Set(['ltd', 'limited', 'inc', 'incorporated', 'llc', 'plc', 'llp', 'corp', 'corporation', 'co', 'company']);

/** "Kestrel Pay UK Ltd." to "kestrel pay uk". Only legal suffixes go: "Nigeria" or "UK" can be the only difference between two group companies. */
export function normaliseName(name: string): string {
  const words = name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  while (words.length > 1 && SUFFIXES.has(words[words.length - 1] as string)) words.pop();
  return words.join(' ');
}

function bigrams(text: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < text.length - 1; i += 1) out.push(text.slice(i, i + 2));
  return out;
}

/** Dice similarity on normalised names, 0 to 1. */
export function nameSimilarity(a: string, b: string): number {
  const left = normaliseName(a);
  const right = normaliseName(b);
  if (left === right) return left.length > 0 ? 1 : 0;
  const leftPairs = bigrams(left);
  const rightPairs = bigrams(right);
  if (leftPairs.length === 0 || rightPairs.length === 0) return 0;
  const counts = new Map<string, number>();
  for (const pair of leftPairs) counts.set(pair, (counts.get(pair) ?? 0) + 1);
  let hits = 0;
  for (const pair of rightPairs) {
    const count = counts.get(pair) ?? 0;
    if (count > 0) {
      counts.set(pair, count - 1);
      hits += 1;
    }
  }
  return (2 * hits) / (leftPairs.length + rightPairs.length);
}

export function normalisePostcode(postcode: string): string {
  return postcode.toUpperCase().replace(/\s+/g, '');
}

/** RFC 4180 CSV: quoted fields, doubled quotes, newlines inside quotes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  const input = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i] as string;
    if (quoted) {
      if (ch === '"' && input[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') {
        quoted = false;
      } else {
        field += ch;
      }
    } else if (ch === '"' && field.trim() === '') {
      field = '';
      quoted = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && input[i + 1] === '\n') i += 1;
      row.push(field);
      field = '';
      if (row.some((cell) => cell.trim() !== '')) rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  row.push(field);
  if (row.some((cell) => cell.trim() !== '')) rows.push(row);
  return rows;
}

/** dd/mm/yyyy, d-Mon-yyyy or ISO to yyyy-mm-dd. Null if it isn't a real date. */
export function toIsoDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const text = value.trim();
  let iso: string | null = null;
  const dmy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(text);
  if (dmy) iso = `${dmy[3]}-${(dmy[2] as string).padStart(2, '0')}-${(dmy[1] as string).padStart(2, '0')}`;
  else if (/^\d{4}-\d{2}-\d{2}/.test(text)) iso = text.slice(0, 10);
  else {
    const parsed = new Date(`${text} UTC`);
    if (!Number.isNaN(parsed.getTime()) && /\d{4}/.test(text)) iso = parsed.toISOString().slice(0, 10);
  }
  if (!iso) return null;
  const check = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(check.getTime()) && check.toISOString().slice(0, 10) === iso ? iso : null;
}

export function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  return value === undefined || value === null ? [] : [value];
}

export function asString(value: unknown): string | undefined {
  if (typeof value === 'string') return value.trim() === '' ? undefined : value.trim();
  if (typeof value === 'number') return String(value);
  return undefined;
}

/** Reads the first field that exists, for vendors whose field names we couldn't confirm without a key. */
export function firstString(record: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = asString(record[key]);
    if (value !== undefined) return value;
  }
  return undefined;
}

/** Names and roles only. This is the one place people's details get reduced for storage. */
export function personLabel(name: string | undefined, role: string | undefined): string | null {
  if (!name) return null;
  return role ? `${name} (${role})` : name;
}
