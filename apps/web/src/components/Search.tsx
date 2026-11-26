'use client';

import type { SearchResponse } from '@vero/shared';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { api, asApiError, isRedirecting } from '@/lib/api';
import { Icon, type IconName } from './Icon';

interface Result {
  key: string;
  icon: IconName;
  title: string;
  subtitle: string;
  href: string;
}

/** Real pages to jump to before anything is typed. No sample data, unlike the prototype's list. */
const PAGES: Result[] = [
  { key: 'home', icon: 'home', title: 'Overview', subtitle: 'Your score', href: '/' },
  { key: 'issues', icon: 'flag', title: 'Findings', subtitle: 'What Vero found', href: '/issues' },
  { key: 'docs', icon: 'doc', title: 'Documents', subtitle: 'What Vero has read', href: '/documents' },
  { key: 'deadlines', icon: 'cal', title: 'Deadlines', subtitle: 'Filings coming up', href: '/deadlines' },
  { key: 'watch', icon: 'eye', title: 'Watchlist', subtitle: 'Companies you follow', href: '/watchlist' },
  { key: 'scan', icon: 'scan', title: 'Scan a new company', subtitle: 'Action', href: '/scan' },
  { key: 'share', icon: 'share', title: 'Share your report', subtitle: 'Action', href: '/report' },
  { key: 'new', icon: 'bell', title: "What's new", subtitle: 'Notifications', href: '/notifications' },
];

function toResults(found: SearchResponse): Result[] {
  return [
    ...found.issues.map((item) => ({
      key: `issue-${item.companyId}-${item.ruleKey}`,
      icon: 'flag' as const,
      title: item.title,
      subtitle: item.subtitle,
      href: `/issues/${item.companyId}/${encodeURIComponent(item.ruleKey)}`,
    })),
    ...found.deadlines.map((item) => ({ key: `deadline-${item.id}`, icon: 'cal' as const, title: item.title, subtitle: item.subtitle, href: '/deadlines' })),
    ...found.documents.map((item) => ({ key: `document-${item.id}`, icon: 'doc' as const, title: item.title, subtitle: item.subtitle, href: '/documents' })),
  ];
}

export function SearchPalette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [found, setFound] = useState<Result[] | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [selected, setSelected] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const returnFocus = useRef<Element | null>(null);

  useEffect(() => {
    returnFocus.current = document.activeElement;
    input.current?.focus();
    return () => {
      if (returnFocus.current instanceof HTMLElement) returnFocus.current.focus();
    };
  }, []);

  const trimmed = query.trim();
  useEffect(() => {
    setProblem(null);
    if (trimmed.length < 2) {
      setFound(null);
      return;
    }
    let current = true;
    const timer = setTimeout(() => {
      api.search.query({ query: { q: trimmed } }).then(
        (response) => {
          if (current) {
            setFound(toResults(response));
            setSelected(0);
          }
        },
        (error: unknown) => {
          if (current && !isRedirecting(error)) setProblem(asApiError(error).message);
        },
      );
    }, 180);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [trimmed]);

  const results = useMemo(() => (trimmed.length < 2 ? PAGES : (found ?? [])), [trimmed, found]);
  const go = (result: Result | undefined) => {
    if (!result) return;
    onClose();
    router.push(result.href);
  };

  useEffect(() => {
    document.body.classList.add('cmdo');
    return () => document.body.classList.remove('cmdo');
  }, []);

  return (
    <>
      <div className="cmdscrim" onMouseDown={onClose} aria-hidden="true" />
      <div className="cmd" role="dialog" aria-modal="true" aria-label="Search">
        <div className="q">
          <Icon name="search" />
          <input
            ref={input}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="cmd-list"
            aria-activedescendant={results[selected] ? `cmd-${results[selected].key}` : undefined}
            autoComplete="off"
            spellCheck={false}
            placeholder="Search findings, documents and deadlines"
            aria-label="Search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelected(0);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') onClose();
            if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && results.length > 0) {
              event.preventDefault();
              setSelected((value) => (value + (event.key === 'ArrowDown' ? 1 : results.length - 1)) % results.length);
            }
            if (event.key === 'Enter') go(results[selected]);
            // Focus stays in the box: the arrows move through the list, so Tab has nowhere better to go.
            if (event.key === 'Tab') event.preventDefault();
          }}
          />
          <button className="esc" type="button" onClick={onClose} aria-label="Close search">
            Esc
          </button>
        </div>
        <div className="g" data-lenis-prevent="">
          <div className="gh">{trimmed.length < 2 ? 'Jump to' : 'Results'}</div>
          {problem ? (
            <p className="empty" role="alert">
              {problem}
            </p>
          ) : results.length === 0 ? (
            <p className="empty">{found ? 'Nothing matches that.' : 'Searching.'}</p>
          ) : (
            <ul style={{ listStyle: 'none' }} id="cmd-list" role="listbox" aria-label={trimmed.length < 2 ? 'Jump to' : 'Results'}>
              {results.map((result, index) => (
                <li key={result.key} role="presentation">
                  <a
                    href={result.href}
                    id={`cmd-${result.key}`}
                    role="option"
                    aria-selected={index === selected}
                    tabIndex={-1}
                    className={`it${index === selected ? ' on' : ''}`}
                    onMouseEnter={() => setSelected(index)}
                    onClick={(event) => {
                      event.preventDefault();
                      go(result);
                    }}
                  >
                    <Icon name={result.icon} />
                    <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{result.title}</span>
                    <small>{result.subtitle}</small>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="ft">
          <span>Up and down to move</span>
          <span>Enter to open</span>
          <span>Esc to close</span>
        </div>
      </div>
    </>
  );
}
