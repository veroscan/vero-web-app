import type { ReactNode } from 'react';
import { SessionProvider } from '@/components/Session';

export default function Layout({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
