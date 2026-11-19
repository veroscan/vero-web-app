'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ComponentProps } from 'react';
import { prefersCalm } from '@/lib/motion';

/** The longest a page change may hold the old page on screen while the new one arrives. */
const MAX_WAIT_MS = 1200;

let finishNavigation: (() => void) | null = null;

/** Tells a running page transition that the new page is in place. Mounted once per layout. */
export function NavigationDone() {
  const pathname = usePathname();
  useEffect(() => {
    finishNavigation?.();
    finishNavigation = null;
  }, [pathname]);
  return null;
}

/** A link that crossfades between pages, as the designs do with cross-document transitions. */
export function TLink({ onNavigate, ...props }: ComponentProps<typeof Link>) {
  const router = useRouter();
  const href = typeof props.href === 'string' ? props.href : null;
  return (
    <Link
      {...props}
      onNavigate={(event) => {
        onNavigate?.(event);
        if (!href || prefersCalm() || !('startViewTransition' in document) || href.startsWith('#')) return;
        if (new URL(href, window.location.href).pathname === window.location.pathname) return;
        event.preventDefault();
        const transition = document.startViewTransition(
          () =>
            new Promise<void>((resolve) => {
              const timer = setTimeout(resolve, MAX_WAIT_MS);
              finishNavigation = () => {
                clearTimeout(timer);
                resolve();
              };
              router.push(href);
            }),
        );
        // A skipped transition rejects these, and the page has still changed.
        transition.ready.catch(() => undefined);
        transition.finished.catch(() => undefined);
      }}
    />
  );
}
