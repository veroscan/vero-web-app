/**
 * The browser tab's name for each screen, so a person with several tabs open can tell them apart.
 * Pages here are client components and can't export Next metadata, so the shell sets it from the path.
 */
const TITLES: ReadonlyArray<readonly [RegExp, string]> = [
  [/^\/$/, 'Overview'],
  [/^\/scan/, 'Scan a company'],
  [/^\/onboarding\/company/, 'Find your company'],
  [/^\/onboarding\/not-found/, 'Enter your company'],
  [/^\/onboarding\/confirm/, 'Check the details'],
  [/^\/onboarding\/questions/, 'A few questions'],
  [/^\/onboarding\/scanning/, 'Scanning'],
  [/^\/first-result/, 'Your first result'],
  [/^\/areas\//, 'Area'],
  [/^\/issues\/[^/]+\/[^/]+/, 'Finding'],
  [/^\/issues/, 'Findings'],
  [/^\/documents\/add/, 'Add a document'],
  [/^\/documents\/[^/]+\/rejected/, 'Document not accepted'],
  [/^\/documents/, 'Documents'],
  [/^\/deadlines/, 'Deadlines'],
  [/^\/company/, 'Registry records'],
  [/^\/history/, 'Scan history'],
  [/^\/watchlist\/[^/]+/, 'Followed company'],
  [/^\/watchlist/, 'Watchlist'],
  [/^\/notifications/, "What's new"],
  [/^\/settings/, 'Settings'],
  [/^\/plan/, 'Plan and billing'],
  [/^\/badge/, 'Share your report'],
  [/^\/report/, 'Report'],
  [/^\/sign-in\/two-step/, 'Two-step sign-in'],
  [/^\/sign-in\/verify/, 'Signing you in'],
  [/^\/sign-in/, 'Sign in'],
  [/^\/sign-up/, 'Create your account'],
  [/^\/invitations/, 'Join a team'],
  [/^\/legal\//, 'Legal'],
  [/^\/r\//, 'Shared report'],
  [/^\/verified\//, 'Verified badge'],
  [/^\/review\//, 'Review desk'],
  [/^\/admin/, 'Rule packs and admin'],
];

/** "Findings | Vero", or plain "Vero" for a path with no name of its own. */
export function titleFor(pathname: string): string {
  const match = TITLES.find(([pattern]) => pattern.test(pathname));
  return match ? `${match[1]} | Vero` : 'Vero';
}
