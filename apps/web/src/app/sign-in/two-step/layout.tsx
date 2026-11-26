import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/** The page is a client component, so its title lives here. */
export const metadata: Metadata = { title: 'Two-step sign-in | Vero' };

export default function TwoStepLayout({ children }: { children: ReactNode }) {
  return children;
}
