import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/** Staff only. The page is a client component, so its title lives here. */
export const metadata: Metadata = { title: 'Rule packs and admin' };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
