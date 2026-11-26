'use client';

/* The product shell from the approved v2 kit: a quiet sidebar (company, pages, watchlist, settings, you),
   a top bar that sits on the navy atmosphere, and the Ctrl K palette. Real data only. */

import type { WatchlistResponse } from '@vero/shared';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { api } from '@/lib/api';
import { companyLine, scoreText } from '@/lib/shell';
import { Icon, type IconName } from './Icon';
import { Atmos, FlowLines } from './Motion';
import { SearchPalette } from './Search';
import { useSession } from './Session';
import { ThemeSwitch } from './Theme';
import { TLink } from './TLink';

interface NavItem {
  href: string;
  icon: IconName;
  label: string;
  match: (path: string) => boolean;
  count?: number;
}

function navItems(open: number): NavItem[] {
  return [
    { href: '/scan', icon: 'scan', label: 'Scan', match: (p) => p.startsWith('/scan') || p.startsWith('/onboarding') || p.startsWith('/first-result') },
    { href: '/', icon: 'home', label: 'Overview', match: (p) => p === '/' || p.startsWith('/areas') },
    { href: '/issues', icon: 'flag', label: 'Findings', match: (p) => p.startsWith('/issues'), count: open },
    { href: '/documents', icon: 'doc', label: 'Documents', match: (p) => p.startsWith('/documents') },
    { href: '/deadlines', icon: 'cal', label: 'Deadlines', match: (p) => p.startsWith('/deadlines') },
    { href: '/company', icon: 'bank', label: 'Registry records', match: (p) => p.startsWith('/company') },
    { href: '/history', icon: 'clock', label: 'Scan history', match: (p) => p.startsWith('/history') },
  ];
}

/** Closes a popover on an outside click or Escape. */
function useDismiss(open: boolean, close: () => void) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!box.current?.contains(event.target as Node)) close();
    };
    const items = (): HTMLElement[] => Array.from(box.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
        // Back to the button that opened it, so the keyboard doesn't lose its place.
        box.current?.querySelector<HTMLElement>('[aria-haspopup]')?.focus();
        return;
      }
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'Home' && event.key !== 'End') return;
      const list = items();
      if (list.length === 0) return;
      event.preventDefault();
      const at = list.indexOf(document.activeElement as HTMLElement);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? list.length - 1 : event.key === 'ArrowDown' ? (at + 1) % list.length : (at - 1 + list.length) % list.length;
      list[next]?.focus();
    };
    // Opened from the keyboard, the first choice takes focus. A mouse click leaves focus on the button.
    if (box.current?.querySelector('[aria-haspopup]:focus-visible')) items()[0]?.focus();
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);
  return box;
}

/** The watchlist, shared by the sidebar and the palette. Refreshed when a page says it changed. */
export function useWatchlist(): WatchlistResponse | null {
  const [list, setList] = useState<WatchlistResponse | null>(null);
  useEffect(() => {
    let live = true;
    const load = (): void => {
      void api.watchlist.list().then(
        (value) => {
          if (live) setList(value);
        },
        () => undefined, // The sidebar keeps what it had. The watchlist page reports its own failures.
      );
    };
    load();
    window.addEventListener('vero:watchlist', load);
    return () => {
      live = false;
      window.removeEventListener('vero:watchlist', load);
    };
  }, []);
  return list;
}

function CompanyButton() {
  const session = useSession();
  const [open, setOpen] = useState(false);
  const box = useDismiss(open, () => setOpen(false));
  const root = session.root;
  if (!root) {
    return (
      <TLink className="co" href="/onboarding/company">
        <span className="co-t">
          <b>Add your company</b>
          <small>Start with a scan</small>
        </span>
        <Icon name="plus" />
      </TLink>
    );
  }
  const group = [root, ...session.related];
  return (
    <div ref={box} style={{ position: 'relative' }}>
      <button className="co" type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)} data-testid="company-switch">
        <span className="co-t">
          <b>{root.legalName}</b>
          <small>{companyLine(root)}</small>
        </span>
        <Icon name="updown" />
      </button>
      {open ? (
        <div className="menu comenu" role="menu">
          <div className="lbl">{group.length > 1 ? 'Your group' : 'Your company'}</div>
          {group.map((company) => (
            <TLink key={company.id} role="menuitem" href={`/company/${company.id}`} onClick={() => setOpen(false)}>
              <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{company.legalName}</span>
            </TLink>
          ))}
          <div className="sep" />
          <TLink role="menuitem" href="/scan" onClick={() => setOpen(false)}>
            <Icon name="scan" />
            Scan another company
          </TLink>
        </div>
      ) : null}
    </div>
  );
}

function UserBlock() {
  const session = useSession();
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const box = useDismiss(open, () => setOpen(false));
  const { user } = session.me;
  return (
    <div className="usr" ref={box}>
      <button className="usrb" type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)} data-testid="account-menu">
        <span className="av" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="9" r="3.6" />
            <path d="M5.5 19.5c1.3-3.3 3.8-5 6.5-5s5.2 1.7 6.5 5" />
          </svg>
        </span>
        <span className="t">
          <b>{user.name ?? user.email.split('@')[0]}</b>
          <small>{user.email}</small>
        </span>
        <span className="sr-only">, account menu</span>
      </button>
      {open ? (
        <div className="menu usrmenu" role="menu">
          {session.isDemo ? <div className="lbl">Demo organisation, made-up data</div> : null}
          <TLink role="menuitem" href="/settings" onClick={() => setOpen(false)}>
            <Icon name="gear" />
            Settings and team
          </TLink>
          <TLink role="menuitem" href="/plan" onClick={() => setOpen(false)}>
            <Icon name="card" />
            Plan and billing
          </TLink>
          <div className="sep" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setFailed(false);
              session.signOut().catch(() => setFailed(true));
            }}
          >
            <Icon name="out" />
            Sign out
          </button>
          {failed ? (
            <p className="formerror" role="alert" style={{ padding: '6px 10px' }}>
              We couldn&apos;t sign you out. Check your connection and try again.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function Sidebar() {
  const session = useSession();
  const pathname = usePathname();
  const watchlist = useWatchlist();
  const open = (session.overview?.areas ?? []).reduce((sum, area) => sum + (area.openCount ?? 0), 0);
  const ready = session.hasResult;
  const items = navItems(open);
  return (
    <aside className="side v3" id="side" aria-label="Main">
      <button className="side-x" type="button" aria-label="Close the menu" onClick={() => window.dispatchEvent(new Event('vero:nav-close'))}>
        <Icon name="x" />
      </button>
      <TLink href="/" aria-label="Vero, overview">
        <img className="logo light-only" src="/brand/wordmark-dark.svg" alt="" />
        <img className="logo dark-only" src="/brand/wordmark-light.svg" alt="" />
      </TLink>
      <CompanyButton />
      <nav className="nv">
        {items.map((item) => {
          const on = item.match(pathname);
          const locked = !ready && item.href !== '/' && item.href !== '/scan';
          return (
            <TLink key={item.href} className={on ? 'on' : undefined} href={locked ? '/' : item.href} aria-current={on ? 'page' : undefined} aria-disabled={locked || undefined} title={locked ? 'After your first scan' : undefined}>
              <Icon name={item.icon} />
              {item.label}
              {item.count ? <em data-testid={item.href === '/issues' ? 'open-count' : undefined}>{item.count}</em> : null}
            </TLink>
          );
        })}
      </nav>
      <div className="grp">
        <div className="gh">
          <TLink href="/watchlist" style={{ width: 'auto', height: 'auto', background: 'none', color: pathname.startsWith('/watchlist') ? 'var(--ink)' : undefined }}>
            Watchlist
          </TLink>
          <TLink href="/scan?follow=1" aria-label="Follow a company">
            <Icon name="plus" />
          </TLink>
        </div>
        {watchlist && watchlist.companies.length === 0 ? <p className="gh-empty">Follow any company to see its score here.</p> : null}
        {(watchlist?.companies ?? []).slice(0, 6).map((item) => {
          const score = scoreText(item.score);
          const low = item.score.kind === 'exact' && item.score.value < 70;
          return (
            <TLink key={item.companyId} className="wr" href={`/watchlist/${item.companyId}`}>
              <span>{item.legalName}</span>
              <b className={`pixel${low ? ' low' : ''}`}>{score}</b>
            </TLink>
          );
        })}
      </div>
      <div className="sf">
        <TLink className={pathname.startsWith('/settings') ? 'on' : undefined} href="/settings">
          <Icon name="gear" />
          Settings
        </TLink>
        <ThemeSwitch />
        <UserBlock />
      </div>
    </aside>
  );
}

/** The top bar. On a page with a hero it sits on the atmosphere. */
export function TopBar({ crumb }: { crumb?: ReactNode }) {
  const session = useSession();
  // "Ctrl K" on the server and on Windows and Linux; the Mac key once the browser says it is a Mac.
  const [shortcut, setShortcut] = useState('Ctrl K');
  useEffect(() => {
    if (/Mac|iPhone|iPad/i.test(navigator.platform)) setShortcut('\u2318 K');
  }, []);
  return (
    <header className="bar" id="bar">
      <button className="mbar" type="button" aria-label="Open the menu" aria-controls="side" onClick={() => window.dispatchEvent(new Event('vero:nav-open'))}>
        <Icon name="menu" />
      </button>
      {crumb ? <div className="crumb">{crumb}</div> : null}
      {/* Named by its own words ("Search Vero Ctrl K"): a different aria-label fails axe's label-content-name-mismatch. */}
      <button className="search" type="button" id="openCmd" onClick={() => window.dispatchEvent(new Event('vero:search'))}>
        <Icon name="search" />
        <span style={{ whiteSpace: 'nowrap' }}>Search Vero</span>
        <kbd>{shortcut}</kbd>
      </button>
      <TLink className="ibtn hide-s" href="/notifications" aria-label={session.unread > 0 ? `What's new, ${session.unread} unread` : "What's new"} data-testid="bell">
        <Icon name="bell" />
        {session.unread > 0 ? <span className="dot" data-testid="bell-count" aria-hidden="true" /> : null}
      </TLink>
      {/* Named here too: on a phone the words are hidden and only the icon shows. */}
      <TLink className="btn btn-p" href="/scan" aria-label="New scan">
        <Icon name="plus" />
        <span className="lbl">New scan</span>
      </TLink>
    </header>
  );
}

/**
 * A page that opens on the navy atmosphere: the top bar and the page head sit on the light,
 * the working area below rides up over its edge (<After/>).
 */
export function Hero({ crumb, children, className, flow = true }: { crumb?: ReactNode; children?: ReactNode; className?: string; flow?: boolean }) {
  return (
    <div className={`hero${className ? ` ${className}` : ''}`}>
      <Atmos />
      {flow ? <FlowLines /> : null}
      <TopBar crumb={crumb} />
      <div className="content">{children}</div>
    </div>
  );
}

/** The light working area under a hero. */
export function After({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`content after${className ? ` ${className}` : ''}`}>{children}</div>;
}

/** A page with no hero: plain bar, plain content. */
export function Plain({ crumb, children, className }: { crumb?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <>
      <TopBar crumb={crumb} />
      <div className={`content${className ? ` ${className}` : ''}`}>{children}</div>
    </>
  );
}

/** Sidebar + main column, the Ctrl K palette and the mobile menu. */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearching(true);
      }
    };
    const onOpen = () => setSearching(true);
    document.addEventListener('keydown', onKey);
    window.addEventListener('vero:search', onOpen);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('vero:search', onOpen);
    };
  }, []);

  // The phone menu: opens from the top bar, closes on Escape, the scrim, the close button or a page change.
  useEffect(() => {
    let opener: HTMLElement | null = null;
    const side = (): HTMLElement | null => document.getElementById('side');
    const close = (refocus: boolean): void => {
      if (!document.body.classList.contains('navo')) return;
      document.body.classList.remove('navo');
      if (refocus) opener?.focus();
    };
    const open = (): void => {
      opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      document.body.classList.add('navo');
      side()?.querySelector<HTMLElement>('.side-x')?.focus();
    };
    const onClose = (): void => close(true);
    const onKey = (event: KeyboardEvent): void => {
      if (!document.body.classList.contains('navo')) return;
      if (event.key === 'Escape') close(true);
      // Tab stays inside the open menu.
      if (event.key === 'Tab') {
        const stops = Array.from(side()?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])') ?? []).filter((el) => el.offsetParent !== null);
        const first = stops[0];
        const last = stops[stops.length - 1];
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('vero:nav-open', open);
    window.addEventListener('vero:nav-close', onClose);
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('vero:nav-open', open);
      window.removeEventListener('vero:nav-close', onClose);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    document.body.classList.remove('navo', 'open');
  }, [pathname]);

  return (
    <div className="vroot">
      <div className="shell">
        <Sidebar />
        <main className="main" id="main">
          {children}
        </main>
      </div>
      <div className="navscrim" aria-hidden="true" onClick={() => window.dispatchEvent(new Event('vero:nav-close'))} />
      {searching ? <SearchPalette onClose={() => setSearching(false)} /> : null}
    </div>
  );
}

/** The slim bar for pages outside the app (public report, badge, sign-in links), on the atmosphere. */
export function PublicBar({ right }: { right?: ReactNode }) {
  return (
    <header className="pubbar">
      <a href="/" aria-label="Vero">
        <img src="/brand/wordmark-light.svg" alt="Vero" />
      </a>
      <div className="r">{right}</div>
    </header>
  );
}

/** Kept for onboarding screens: the bar with no sidebar. */
export function OnboardingBar({ step, live }: { step: ReactNode; live?: boolean }) {
  return (
    <PublicBar
      right={
        <span className="muted" style={{ color: 'rgba(255,255,255,.7)' }} {...(live ? { 'aria-live': 'polite' as const } : {})}>
          {step}
        </span>
      }
    />
  );
}
