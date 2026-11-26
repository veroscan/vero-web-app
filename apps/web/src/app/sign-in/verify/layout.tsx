import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/** The link is the key to an account, so it stays out of what the browser tells other sites. */
export const metadata: Metadata = { title: 'Signing you in | Vero', referrer: 'no-referrer' };

export default function VerifyLayout({ children }: { children: ReactNode }) {
  return children;
}
