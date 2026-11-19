/**
 * A strict, three-valued JSONLogic evaluator.
 *
 * Rules are JSONLogic, so any standard tool can read them. We evaluate them
 * here rather than with json-logic-js for one reason: a fact we don't have must
 * stay "unknown", never quietly become false. `{"==":[{"var":"x"},true]}` with
 * `x` missing is false in stock JSONLogic, which would turn a source being down
 * into a failed rule. Here it's UNKNOWN, and the engine turns that into "verify".
 *
 * Known inputs give the same answer as json-logic-js for this operator set
 * (test/logic.test.ts checks that against the library). Comparison is strict:
 * "1" does not equal 1.
 */

export type LogicValue = boolean | number | string | null | LogicValue[];
export type Logic = LogicValue | { [op: string]: Logic } | Logic[];

export const UNKNOWN = Symbol('unknown');
export type Tri = LogicValue | typeof UNKNOWN;

export const OPERATORS = [
  'var', '==', '===', '!=', '!==', '>', '>=', '<', '<=', '!', '!!', 'and', 'or', 'if', 'in',
] as const;
const OPERATOR_SET: ReadonlySet<string> = new Set(OPERATORS);

export type FactResolver = (key: string) => Tri;

function isOperation(value: unknown): value is Record<string, Logic> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** JSONLogic truthiness: empty arrays are false, "0" is true. */
export function truthy(value: LogicValue): boolean {
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value);
}

function argsOf(raw: Logic): Logic[] {
  return Array.isArray(raw) ? raw : [raw];
}

function compareNumeric(op: string, a: Tri, b: Tri): Tri {
  if (a === UNKNOWN || b === UNKNOWN) return UNKNOWN;
  if (typeof a !== 'number' || typeof b !== 'number') return false;
  switch (op) {
    case '>': return a > b;
    case '>=': return a >= b;
    case '<': return a < b;
    default: return a <= b;
  }
}

export function evaluate(logic: Logic, resolve: FactResolver): Tri {
  if (Array.isArray(logic)) {
    const items = logic.map((item) => evaluate(item, resolve));
    return items.includes(UNKNOWN) ? UNKNOWN : (items as LogicValue[]);
  }
  if (!isOperation(logic)) return logic;

  const entries = Object.entries(logic);
  const [op, raw] = entries[0] as [string, Logic];
  const args = argsOf(raw);

  switch (op) {
    case 'var':
      return resolve(args[0] as string);
    case '==':
    case '===':
    case '!=':
    case '!==': {
      const a = evaluate(args[0] as Logic, resolve);
      const b = evaluate(args[1] as Logic, resolve);
      if (a === UNKNOWN || b === UNKNOWN) return UNKNOWN;
      return op.startsWith('=') ? a === b : a !== b;
    }
    case '>':
    case '>=':
    case '<':
    case '<=':
      return compareNumeric(op, evaluate(args[0] as Logic, resolve), evaluate(args[1] as Logic, resolve));
    case '!': {
      const a = evaluate(args[0] as Logic, resolve);
      return a === UNKNOWN ? UNKNOWN : !truthy(a);
    }
    case '!!': {
      const a = evaluate(args[0] as Logic, resolve);
      return a === UNKNOWN ? UNKNOWN : truthy(a);
    }
    case 'and': {
      let sawUnknown = false;
      for (const arg of args) {
        const a = evaluate(arg, resolve);
        if (a === UNKNOWN) sawUnknown = true;
        else if (!truthy(a)) return false;
      }
      return sawUnknown ? UNKNOWN : true;
    }
    case 'or': {
      let sawUnknown = false;
      for (const arg of args) {
        const a = evaluate(arg, resolve);
        if (a === UNKNOWN) sawUnknown = true;
        else if (truthy(a)) return true;
      }
      return sawUnknown ? UNKNOWN : false;
    }
    case 'if': {
      const cond = evaluate(args[0] as Logic, resolve);
      if (cond === UNKNOWN) return UNKNOWN;
      return evaluate((truthy(cond) ? args[1] : args[2]) ?? null, resolve);
    }
    case 'in': {
      const needle = evaluate(args[0] as Logic, resolve);
      const haystack = evaluate(args[1] as Logic, resolve);
      if (needle === UNKNOWN || haystack === UNKNOWN) return UNKNOWN;
      if (Array.isArray(haystack)) return haystack.includes(needle);
      if (typeof haystack === 'string' && typeof needle === 'string') return haystack.includes(needle);
      return false;
    }
    default:
      throw new Error(`Unknown JSONLogic operator "${op}"`);
  }
}

/** Every fact key a piece of logic reads. */
export function varsIn(logic: Logic): string[] {
  const found = new Set<string>();
  const walk = (node: Logic): void => {
    if (Array.isArray(node)) {
      node.forEach(walk);
    } else if (isOperation(node)) {
      for (const [op, raw] of Object.entries(node)) {
        if (op === 'var') found.add(argsOf(raw)[0] as string);
        else walk(raw);
      }
    }
  };
  walk(logic);
  return [...found];
}

/** Returns problems with a piece of logic, or an empty list. Used by the pack schema. */
export function logicProblems(logic: unknown, path = '$'): string[] {
  if (logic === null || ['boolean', 'number', 'string'].includes(typeof logic)) return [];
  if (Array.isArray(logic)) return logic.flatMap((item, i) => logicProblems(item, `${path}[${i}]`));
  if (typeof logic !== 'object') return [`${path}: not valid JSONLogic`];

  const entries = Object.entries(logic as Record<string, unknown>);
  if (entries.length !== 1) return [`${path}: an operation must have exactly one operator`];
  const [op, raw] = entries[0] as [string, unknown];
  if (!OPERATOR_SET.has(op)) return [`${path}: operator "${op}" is not allowed`];
  if (op === 'var') {
    const key: unknown = Array.isArray(raw) ? (raw as unknown[])[0] : raw;
    const arity = Array.isArray(raw) ? raw.length : 1;
    if (typeof key !== 'string' || key === '' || arity !== 1) {
      return [`${path}: var must name exactly one fact, with no default`];
    }
    return [];
  }
  const args = Array.isArray(raw) ? raw : [raw];
  const expected: Record<string, [number, number]> = {
    '==': [2, 2], '===': [2, 2], '!=': [2, 2], '!==': [2, 2],
    '>': [2, 2], '>=': [2, 2], '<': [2, 2], '<=': [2, 2],
    '!': [1, 1], '!!': [1, 1], in: [2, 2], if: [2, 3],
  };
  const bounds = expected[op];
  if (bounds && (args.length < bounds[0] || args.length > bounds[1])) {
    return [`${path}: "${op}" takes ${bounds[0]} to ${bounds[1]} arguments, got ${args.length}`];
  }
  return args.flatMap((arg, i) => logicProblems(arg, `${path}.${op}[${i}]`));
}
