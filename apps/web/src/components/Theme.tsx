'use client';

import { useEffect, useState } from 'react';
import { Icon } from './Icon';
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

function choose(next: ThemeName): void {
  softly(() => apply(next));
  try {
    window.localStorage.setItem(KEY, next);
  } catch {
    // A private window can refuse. The choice still lasts for this page.
  }
  window.dispatchEvent(new Event('vero:theme'));
}

function useTheme(): ThemeName {
  const [theme, setTheme] = useState<ThemeName>('light');
  useEffect(() => {
    const read = () => setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);
  return theme;
}

/** Light and dark, side by side in the sidebar foot. */
export function ThemeSwitch() {
  const theme = useTheme();
  return (
    <div className="themesw" role="group" aria-label="Theme">
      <button type="button" aria-pressed={theme === 'light'} onClick={() => choose('light')}>
        <Icon name="sun" />
        Light
      </button>
      <button type="button" aria-pressed={theme === 'dark'} onClick={() => choose('dark')}>
        <Icon name="moon" />
        Dark
      </button>
    </div>
  );
}

/** One button that flips the theme, for pages without the sidebar. */
export function ThemeToggle() {
  const theme = useTheme();
  return (
    <button className="ibtn" type="button" onClick={() => choose(theme === 'dark' ? 'light' : 'dark')} aria-label="Switch between light and dark">
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
    </button>
  );
}
