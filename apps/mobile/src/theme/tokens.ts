/**
 * The Vero mobile palette, taken from the mobile design kit (product-design-v2 mobile.css and
 * mobile-dark.css, 22 Nov 2026). Text colours in light use the darker values approved on
 * 20 Nov 2026 so every word reads at 4.5:1 or better; ink4 is for icons and dividers only.
 */
export interface Palette {
  dark: boolean;
  navy: string;
  navy2: string;
  ink: string;
  ink2: string;
  ink3: string;
  ink4: string;
  bg: string;
  line: string;
  line2: string;
  link: string;
  lb: string;
  teal: string;
  urgent: string;
  warn: string;
  good: string;
  /** Background of cards and lists (dark uses a gradient, see `cardGradient`). */
  card: string;
  cardGradient: [string, string] | null;
  cardBorder: string;
  rowPressed: string;
  /** Top of the body sheet (dark fades from this into bg). */
  bodyTop: string;
  segBg: string;
  segThumb: [string, string];
  segOnText: string;
  tabBg: string;
  tabBorder: string;
  pill: [string, string];
  tabOn: string;
  switchOff: string;
  switchOn: string;
  sheet: [string, string];
  grab: string;
  scrim: string;
  /** The one primary action: navy in light, a lit blue gradient in dark. */
  primary: [string, string];
  primaryText: string;
  ibBg: string;
  ibBorder: string;
  ibText: string;
  fieldBg: string;
  placeholder: string;
  /** Soft chip and muted surfaces. */
  soft: string;
  bigNumber: string;
}

export const light: Palette = {
  dark: false,
  navy: '#000066',
  navy2: '#0B1180',
  ink: '#0B0E3A',
  ink2: '#4E5472',
  ink3: '#696E8B',
  ink4: '#B4B9CB',
  bg: '#F4F6FA',
  line: '#E8EBF2',
  line2: '#EFF1F6',
  link: '#036DD7',
  lb: '#9DDAF7',
  teal: '#5EEAD4',
  urgent: '#C23F4A',
  warn: '#9C6314',
  good: '#0B7D5F',
  card: '#FFFFFF',
  cardGradient: null,
  cardBorder: '#E8EBF2',
  rowPressed: '#F6F7FB',
  bodyTop: '#F4F6FA',
  segBg: '#E8EBF3',
  segThumb: ['#FFFFFF', '#FFFFFF'],
  segOnText: '#0B0E3A',
  tabBg: 'rgba(255,255,255,0.78)',
  tabBorder: 'rgba(255,255,255,0.95)',
  pill: ['#EAEEFB', '#EAEEFB'],
  tabOn: '#000066',
  switchOff: '#D9DEE9',
  switchOn: '#000066',
  sheet: ['#FFFFFF', '#FFFFFF'],
  grab: '#DCE0EA',
  scrim: 'rgba(0,0,30,0.42)',
  primary: ['#000066', '#000066'],
  primaryText: '#FFFFFF',
  ibBg: '#FFFFFF',
  ibBorder: '#E8EBF2',
  ibText: '#0B0E3A',
  fieldBg: '#FFFFFF',
  placeholder: '#8A90A8',
  soft: '#EEF1F7',
  bigNumber: '#000066',
};

export const dark: Palette = {
  dark: true,
  navy: '#3D7BFF',
  navy2: '#5B91FF',
  ink: '#F1F3FF',
  ink2: '#B9C0E4',
  ink3: '#8189B6',
  ink4: '#565E8F',
  bg: '#01012A',
  line: 'rgba(150,170,255,0.12)',
  line2: 'rgba(150,170,255,0.09)',
  link: '#5AA9FF',
  lb: '#9DDAF7',
  teal: '#5EEAD4',
  urgent: '#FF7A7F',
  warn: '#FFB648',
  good: '#3BE0A6',
  card: 'rgba(14,20,104,0.55)',
  cardGradient: ['rgba(18,26,120,0.55)', 'rgba(8,11,80,0.55)'],
  cardBorder: 'rgba(150,170,255,0.13)',
  rowPressed: 'rgba(120,150,255,0.08)',
  bodyTop: '#05074A',
  segBg: 'rgba(150,170,255,0.09)',
  segThumb: ['#2E5FE8', '#1D44C4'],
  segOnText: '#FFFFFF',
  tabBg: 'rgba(8,11,70,0.72)',
  tabBorder: 'rgba(150,170,255,0.16)',
  pill: ['rgba(76,134,255,0.34)', 'rgba(47,100,240,0.22)'],
  tabOn: '#FFFFFF',
  switchOff: 'rgba(150,170,255,0.18)',
  switchOn: '#3D7BFF',
  sheet: ['#0A0E5C', '#05073F'],
  grab: 'rgba(255,255,255,0.22)',
  scrim: 'rgba(0,0,12,0.6)',
  primary: ['#4C86FF', '#2F64F0'],
  primaryText: '#FFFFFF',
  ibBg: 'rgba(255,255,255,0.07)',
  ibBorder: 'rgba(255,255,255,0.12)',
  ibText: '#FFFFFF',
  fieldBg: 'rgba(150,170,255,0.08)',
  placeholder: '#565E8F',
  soft: 'rgba(150,170,255,0.08)',
  bigNumber: '#8FB0FF',
};

/** The navy brand atmosphere is the same in both themes. */
export const brand = {
  navyDeep: '#00004A',
  blue: '#0182FA',
  sky: '#03B1FA',
  indigo: '#1B2BD6',
  lb: '#9DDAF7',
  flow: '#4A95FF',
  onNavyMuted: 'rgba(255,255,255,0.66)',
  onNavySoft: 'rgba(255,255,255,0.62)',
  urgentOnNavy: '#FF6B70',
};

/** Motion from the kit: --ease cubic-bezier(.22,1,.36,1) and --spring cubic-bezier(.34,1.45,.64,1). */
export const motion = {
  ease: [0.22, 1, 0.36, 1] as const,
  spring: { damping: 15, stiffness: 170, mass: 0.9 },
  riseStep: 70,
};

export const radius = { card: 24, sheet: 30, btn: 18, ib: 15, seg: 15, segThumb: 12, tabs: 24, pill: 18 };
