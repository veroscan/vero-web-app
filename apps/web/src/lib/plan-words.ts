import type { Entitlements, Plan, PlanCode } from '@vero/shared';

/**
 * What Scale's extras really do today, and the one place that says so. The plan rules list them,
 * but nothing runs them yet. When one goes live, set `live: true` here and every screen follows.
 */
export const SCALE_EXTRAS = {
  deadlineWatching: {
    label: 'We watch your deadlines',
    live: false,
    whenLive: 'We re-check your filing and payment dates on our own, so you see a change without asking.',
    today: "Planned, and not running yet. On every plan today, we read a date when you run a check, and remind you before it's due.",
  },
  rulesChangeAlerts: {
    label: 'Alerts when the rules change',
    live: false,
    whenLive: 'We tell you when a rule changes for a company like yours, and what you need to do about it.',
    today: "Planned, and not running yet. When it starts, we'll tell you if a rule changes for a company like yours.",
  },
  annualVerification: {
    label: 'A full verification every year',
    live: false,
    whenLive: 'Vero runs a full check of the whole company once a year.',
    today: "Planned, and not running yet. When it starts, Vero will run a full check of the whole company once a year.",
  },
} as const;

type ScaleExtra = keyof typeof SCALE_EXTRAS;

const EXTRA_KEYS = Object.keys(SCALE_EXTRAS) as ScaleExtra[];

/** Whether a plan's dates are really being watched: the plan has to include it, and it has to be running. */
export function isWatched(entitlements: Pick<Entitlements, 'deadlineWatching'>): boolean {
  return entitlements.deadlineWatching && SCALE_EXTRAS.deadlineWatching.live;
}

export interface WatchingNote {
  title: string;
  body: string;
  /** Whether a different plan would change anything. */
  planLink: boolean;
}

/** The line on Deadlines. Nothing at all once the plan really does watch them. */
export function watchingNote(entitlements: Pick<Entitlements, 'deadlineWatching'>, planName: string): WatchingNote | null {
  if (isWatched(entitlements)) return null;
  if (SCALE_EXTRAS.deadlineWatching.live) {
    return {
      title: 'Watching these dates is part of Scale.',
      body: `On ${planName}, we look at the source when you run a check, and we still remind you before each date.`,
      planLink: true,
    };
  }
  return {
    title: 'We look at these dates when you run a check.',
    body: "Nothing re-checks a company on a timer yet. We still remind you before each date.",
    planLink: false,
  };
}

/** How changing plan really works: Stripe's checkout when payments are on, our team by hand until then. */
export const PLAN_CHANGE = {
  title: 'Paying for a plan',
  body: "Payments go through Stripe's own checkout, and your plan changes once Stripe confirms them. If payments aren't switched on yet, our team can change your plan by hand, and you'll see it on this page.",
};

const PLAN_SAY: Record<PlanCode, string> = {
  free: 'See where you stand, from public records and a few questions.',
  growth: 'The full picture, with your documents read and checked.',
  scale: EXTRA_KEYS.every((key) => SCALE_EXTRAS[key].live)
    ? 'Growth, plus watching, alerts and a yearly verification.'
    : "Everything in Growth today. Its extras are planned, and aren't running yet.",
};

export function planSay(code: PlanCode): string {
  return PLAN_SAY[code];
}

/** Free costs nothing. A paid plan says it has no price until the API sends one. */
export function priceWords(plan: Pick<Plan, 'code' | 'priceMinor' | 'currency'>): string {
  if (plan.code === 'free') return 'Nothing to pay';
  if (plan.priceMinor === null) return 'Not set yet';
  if (!plan.currency) return 'Not set yet';
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: plan.currency }).format(plan.priceMinor / 100);
}

export interface CompareCell {
  included?: boolean;
  word?: string;
}

export interface CompareRow {
  key: string;
  label: string;
  body: string;
  cell: (entitlements: Entitlements) => CompareCell;
}

const yes = (included: boolean): CompareCell => (included ? { included: true } : { word: 'No' });

function extraRow(key: ScaleExtra): CompareRow {
  const extra = SCALE_EXTRAS[key];
  return {
    key,
    label: extra.label,
    body: extra.live ? extra.whenLive : extra.today,
    cell: (entitlements) => (!entitlements[key] ? { word: 'No' } : extra.live ? { included: true } : { word: 'Planned' }),
  };
}

/** The comparison, drawn from the plan rules the API sends, with nothing typed in per plan. */
export const COMPARE_ROWS: readonly CompareRow[] = [
  { key: 'scan', label: 'A scan of public records', body: 'We read the public registers for your companies in Delaware, the UK and Nigeria.', cell: () => ({ included: true }) },
  { key: 'questions', label: 'A short questionnaire', body: "A few plain questions about how you work, so we can see what the registers can't show.", cell: () => ({ included: true }) },
  {
    key: 'score',
    label: 'Your score',
    body: 'Free gives you an approximate score from public records and your answers. Paid plans read your documents too, and the score moves as you fix things.',
    cell: (entitlements) => ({ word: entitlements.exactScore ? 'Exact' : 'Approximate' }),
  },
  {
    key: 'gaps',
    label: 'The gaps we show you',
    body: "Free shows the ones that matter most. Paid plans show all of them, in the order we'd fix them.",
    cell: (entitlements) => ({ word: entitlements.gapLimit === null ? 'Every gap' : `Top ${entitlements.gapLimit}` }),
  },
  { key: 'vault', label: 'A vault for your documents', body: 'One private place for your contracts and filings. Our software reads what you add and checks it against the rules for your country.', cell: (entitlements) => yes(entitlements.vault) },
  { key: 'report', label: 'A full report on all six areas', body: 'Intellectual property, compliance, fundraising, AI and data, company foundations and contracts.', cell: (entitlements) => yes(entitlements.fullReport) },
  { key: 'priority', label: 'A priority list of what to fix first', body: 'Ranked by how serious each issue is and what waiting would cost you.', cell: (entitlements) => yes(entitlements.priorityList) },
  { key: 'sharing', label: 'A public link and the verified badge', body: "A link you can send to anyone. The badge still has to be earned: paying for a plan doesn't get you one.", cell: (entitlements) => yes(entitlements.publicSharing) },
  extraRow('rulesChangeAlerts'),
  extraRow('deadlineWatching'),
  extraRow('annualVerification'),
];
