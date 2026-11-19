'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { initials } from '@/lib/format';
import { SearchPalette } from './Search';
import { useSession } from './Session';
import { ThemeToggle } from './Theme';
import { TLink } from './TLink';
import { useToast } from './Toast';

const TABS = [
  { href: '/', label: 'Home', empty: '' },
  { href: '/issues', label: 'Issues', empty: 'Your issues will show here after your first scan.' },
  { href: '/documents', label: 'Documents', empty: 'Your documents will show here after your first scan.' },
  { href: '/deadlines', label: 'Deadlines', empty: 'Your deadlines will show here after your first scan.' },
  { href: '/company', label: 'Company', empty: 'Your company records will show here after your first scan.' },
];

function isOn(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/' || pathname.startsWith('/areas');
  return pathname === href || pathname.startsWith(`${href}/`);
}

function AccountMenu() {
  const session = useSession();
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const { user } = session.me;

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!box.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const name = session.root?.legalName ?? 'Your account';
  return (
    <div className="acct" ref={box}>
      <button className="me" type="button" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((value) => !value)}>
        {name} <i>{initials(user.name, user.email)}</i>
        <span className="sr-only">, account menu</span>
      </button>
      {open ? (
        <div className="acct-menu">
          <p className="who">
            <span className="b">{user.name ?? user.email}</span>
            {user.name ? (
              <>
                <br />
                {user.email}
              </>
            ) : null}
            {session.isDemo ? (
              <>
                <br />
                Demo organisation, with made-up data
              </>
            ) : null}
          </p>
          <div role="menu" aria-label="Account">
            <TLink href="/settings" role="menuitem" onClick={() => setOpen(false)}>
              Settings and team
            </TLink>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setFailed(false);
                session.signOut().catch(() => setFailed(true));
              }}
            >
              Sign out
            </button>
          </div>
          {failed ? (
            <p className="formerror" role="alert" style={{ padding: '6px 12px' }}>
              We couldn&apos;t sign you out. Check your connection and try again.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** The header from the designs. Before a first scan it shrinks, as on the design's welcome screen. */
export function AppShell({ children }: { children: ReactNode }) {
  const session = useSession();
  const pathname = usePathname();
  const toast = useToast();
  const [searching, setSearching] = useState(false);
  const ready = session.hasResult;

  useEffect(() => {
    if (!ready) return;
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearching(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [ready]);

  const unreadLabel = session.unread > 0 ? `What's new, ${session.unread} unread` : "What's new";
  return (
    <div className="vs">
      <header className="bar">
        <TLink href="/" aria-label="Vero Scan home">
          <img src="/vero-lockup.svg" alt="" />
        </TLink>
        <nav className="tabs" aria-label="Main">
          {TABS.map((tab) =>
            ready || !tab.empty ? (
              <TLink key={tab.href} className={isOn(pathname, tab.href) ? 'on' : undefined} href={tab.href} aria-current={isOn(pathname, tab.href) ? 'page' : undefined}>
                {tab.label}
              </TLink>
            ) : (
              <a
                key={tab.href}
                href="#scan"
                onClick={(event) => {
                  event.preventDefault();
                  toast(tab.empty);
                }}
              >
                {tab.label}
              </a>
            ),
          )}
        </nav>
        <div className="tools">
          {ready ? (
            <button className="searchbtn" type="button" aria-label="Search Ctrl K" onClick={() => setSearching(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <span>Search</span> <kbd>Ctrl K</kbd>
            </button>
          ) : null}
          {ready ? (
            <TLink className="iconbtn" href="/notifications" aria-label={unreadLabel} data-testid="bell">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9Z" />
                <path d="M10 20a2.2 2.2 0 0 0 4 0" />
              </svg>
              {session.unread > 0 ? (
                <span className="bell-count" aria-hidden="true" data-testid="bell-count">
                  {session.unread > 99 ? '99+' : session.unread}
                </span>
              ) : null}
            </TLink>
          ) : null}
          <ThemeToggle />
          <AccountMenu />
        </div>
      </header>
      {children}
      {searching ? <SearchPalette onClose={() => setSearching(false)} /> : null}
    </div>
  );
}

/** The plain top bar used through onboarding. */
export function OnboardingBar({ step, live }: { step: ReactNode; live?: boolean }) {
  return (
    <header className="bar">
      <img src="/vero-lockup.svg" alt="Vero Scan" />
      <span className="small num" {...(live ? { 'aria-live': 'polite' as const } : {})}>
        {step}
      </span>
      <div className="tools">
        <ThemeToggle />
      </div>
    </header>
  );
}
