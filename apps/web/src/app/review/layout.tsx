import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/** Staff only. The pages are client components, so their title lives here. */
export const metadata: Metadata = { title: 'Review desk' };

export default function ReviewDeskLayout({ children }: { children: ReactNode }) {
  return children;
}
