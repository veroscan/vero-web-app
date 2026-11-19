'use client';

import { useEffect } from 'react';
import { softly } from '@/lib/motion';

const KEY = 'vero-theme';
type ThemeName = 'light' | 'dark';

function saved(): ThemeName | null {
  try {
    const value = window.localStorage.getItem(KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

function apply(theme: ThemeName): void {
  document.documentElement.setAttribute('data-theme', theme);
}

/** Keeps open tabs in step, and follows the system until someone makes a choice. */
export function ThemeSync() {
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const onSystem = () => {
      if (!saved()) apply(query.matches ? 'dark' : 'light');
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === KEY && (event.newValue === 'light' || event.newValue === 'dark')) apply(event.newValue);
    };
    query.addEventListener('change', onSystem);
    window.addEventListener('storage', onStorage);
    return () => {
      query.removeEventListener('change', onSystem);
      window.removeEventListener('storage', onStorage);
    };
  }, []);
  return null;
}

export function ThemeToggle() {
  const toggle = () => {
    const next: ThemeName = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    softly(() => apply(next));
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      // A private window can refuse. The choice still lasts for this page.
    }
  };
  return (
    <button className="iconbtn" type="button" onClick={toggle} aria-label="Switch between light and dark">
      <svg className="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      </svg>
      <svg className="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </button>
  );
}
