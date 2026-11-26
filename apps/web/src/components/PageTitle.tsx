'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { titleFor } from '@/lib/titles';

/** Names the browser tab after the screen ("Findings | Vero"). Mounted once, in the root layout. */
export function PageTitle() {
  const pathname = usePathname();
  useEffect(() => {
    document.title = titleFor(pathname);
  }, [pathname]);
  return null;
}
