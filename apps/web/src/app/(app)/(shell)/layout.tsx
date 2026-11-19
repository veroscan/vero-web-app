import type { ReactNode } from 'react';
import { AppShell } from '@/components/Shell';

export default function Layout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
