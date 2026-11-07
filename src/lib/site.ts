export const COMPANY = {
  productName: "Vero Scan",
  legalName: "Code & Clause LTD",
  email: "hello@codeclauselegal.com",
  streetAddress: "Suite 191B Jide Oki Street, Off Ligali Ayorinde",
  locality: "Victoria Island, Lagos",
  country: "NG",
  tagline: "The legal health score for technology companies",
} as const;

export interface NavLink {
  readonly href: string;
  readonly label: string;
}

export type NavMockId = "founders" | "investors" | "method" | "sample" | "insights" | "security";

export interface NavDropItem extends NavLink {
  readonly description: string;
  /** SVG path data of the 24x24 stroked icon. */
  readonly iconPaths: readonly string[];
  readonly mock: NavMockId;
  readonly captionTitle: string;
  readonly captionLine: string;
}

export interface NavDrop {
  readonly label: string;
  readonly href: string;
  readonly items: readonly NavDropItem[];
  readonly all: NavLink;
  readonly talk: NavLink;
}

export type NavEntry =
  | { readonly kind: "link"; readonly link: NavLink }
  | { readonly kind: "drop"; readonly drop: NavDrop };

const SOLUTIONS: NavDrop = {
  label: "Solutions",
  href: "/for-founders",
  items: [
    {
      href: "/for-founders",
      label: "For founders",
      description: "Know your score before investors ask",
      iconPaths: ["M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2M9 15l-3-3c1-4 4-8 11-9-1 7-5 10-9 11zM14.5 9.5h.01"],
      mock: "founders",
      captionTitle: "Founders",
      captionLine: "Score · Fix list · Badge",
    },
    {
      href: "/for-investors",
      label: "For investors",
      description: "Read a company before you back it",
      iconPaths: ["M4 20V10M10 20V4M16 20v-7M22 20H2"],
      mock: "investors",
      captionTitle: "Investors",
      captionLine: "Portfolio · Scans · Reports",
    },
  ],
  all: { href: "/product", label: "See the product" },
  talk: { href: "/contact", label: "Not sure which fits? Book a demo" },
};

const RESOURCES: NavDrop = {
  label: "Resources",
  href: "/methodology",
  items: [
    {
      href: "/methodology",
      label: "Methodology",
      description: "How we know what we know",
      iconPaths: ["M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3", "M7.5 15h9"],
      mock: "method",
      captionTitle: "Methodology",
      captionLine: "Sources · Scoring · Limits",
    },
    {
      href: "/sample-report",
      label: "Sample report",
      description: "A full report on an example company",
      iconPaths: ["M6 3h9l4 4v14H6z", "M9 12h6M9 16h6"],
      mock: "sample",
      captionTitle: "Sample report",
      captionLine: "Example company · Illustrative data",
    },
    {
      href: "/insights",
      label: "Insights",
      description: "Plain-English notes on the law",
      iconPaths: ["M4 5h16v11H9l-5 4z", "M8 9h8M8 12h5"],
      mock: "insights",
      captionTitle: "Insights",
      captionLine: "Short guides · Updated as the law moves",
    },
    {
      href: "/security",
      label: "Security",
      description: "How we look after your documents",
      iconPaths: ["M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z"],
      mock: "security",
      captionTitle: "Security",
      captionLine: "Storage · Access · Deletion",
    },
  ],
  all: { href: "/insights", label: "All insights" },
  talk: { href: "/contact", label: "Questions? Talk to us" },
};

export const NAV: readonly NavEntry[] = [
  { kind: "link", link: { href: "/product", label: "Product" } },
  { kind: "link", link: { href: "/coverage", label: "Coverage" } },
  { kind: "drop", drop: SOLUTIONS },
  { kind: "drop", drop: RESOURCES },
  { kind: "link", link: { href: "/about", label: "About" } },
];

export const NAV_DEMO: NavLink = { href: "/contact", label: "Book a demo" };
export const NAV_WAITLIST: NavLink = { href: "/waitlist", label: "Join the waitlist" };

export interface MobileMenuEntry extends NavLink {
  readonly children?: readonly NavLink[];
}

export const MOBILE_MENU: readonly MobileMenuEntry[] = [
  { href: "/product", label: "Product" },
  { href: "/coverage", label: "Coverage" },
  {
    href: "/for-founders",
    label: "Solutions",
    children: [
      { href: "/for-founders", label: "For founders" },
      { href: "/for-investors", label: "For investors" },
    ],
  },
  {
    href: "/methodology",
    label: "Resources",
    children: [
      { href: "/methodology", label: "Methodology" },
      { href: "/sample-report", label: "Sample report" },
      { href: "/insights", label: "Insights" },
      { href: "/security", label: "Security" },
    ],
  },
  { href: "/about", label: "About" },
  { href: "/waitlist", label: "Join the waitlist" },
];

export interface FooterColumn {
  readonly title: string;
  readonly links: readonly NavLink[];
}

export const FOOTER_COLUMNS: readonly FooterColumn[] = [
  {
    title: "Product",
    links: [
      { href: "/product", label: "Product" },
      { href: "/coverage", label: "Coverage" },
      { href: "/sample-report", label: "Sample report" },
      { href: "/methodology", label: "Methodology" },
      { href: "/security", label: "Security" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { href: "/for-founders", label: "For founders" },
      { href: "/for-investors", label: "For investors" },
      { href: "/waitlist", label: "Join the waitlist" },
      { href: "/contact", label: "Book a demo" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/insights", label: "Insights" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export const FOOTER_LEGAL_LINKS: readonly NavLink[] = [
  { href: "/privacy-policy", label: "Privacy policy" },
  { href: "/terms-of-service", label: "Terms of service" },
];
