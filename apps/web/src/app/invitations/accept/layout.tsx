import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/** The invite link is a key, so it stays out of what the browser tells other sites. */
export const metadata: Metadata = { title: 'Join a team', referrer: 'no-referrer' };

export default function InvitationLayout({ children }: { children: ReactNode }) {
  return children;
}
