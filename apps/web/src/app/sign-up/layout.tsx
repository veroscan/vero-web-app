import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/** The page is a client component, so its title lives here. */
export const metadata: Metadata = { title: 'Create your account' };

export default function SignUpLayout({ children }: { children: ReactNode }) {
  return children;
}
