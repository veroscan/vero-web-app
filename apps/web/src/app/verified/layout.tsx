import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/** The link is the only key to this page, so it stays out of what the browser tells other sites. */
export const metadata: Metadata = { title: 'Verified badge', referrer: 'no-referrer' };

export default function VerifiedLayout({ children }: { children: ReactNode }) {
  return children;
}
