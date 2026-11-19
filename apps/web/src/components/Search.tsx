'use client';

import type { SearchResponse } from '@vero/shared';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { api, asApiError, isRedirecting } from '@/lib/api';

interface Result {
  key: string;
  title: string;
  subtitle: string;
  href: string;
}

/** Real pages to jump to before anything is typed. No sample data, unlike the prototype's list. */
const PAGES: Result[] = [
  { key: 'home', title: 'Home', subtitle: 'Your score', href: '/' },
  { key: 'issues', title: 'All issues', subtitle: 'What to fix', href: '/issues' },
  { key: 'new', title: "What's new", subtitle: 'Notifications', href: '/notifications' },
];

function toResults(found: SearchResponse): Result[] {
  return [
    ...found.issues.map((item) => ({
      key: `issue-${item.companyId}-${item.ruleKey}`,
      title: item.title,
      subtitle: item.subtitle,
      href: `/issues/${item.companyId}/${encodeURIComponent(item.ruleKey)}`,
    })),
    ...found.deadlines.map((item) => ({ key: `deadline-${item.id}`, title: item.title, subtitle: item.subtitle, href: '/deadlines' })),
    ...found.documents.map((item) => ({ key: `document-${item.id}`, title: item.title, subtitle: item.subtitle, href: '/documents' })),
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

  return (
    <div
      className="pal-scrim"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="pal" role="dialog" aria-modal="true" aria-label="Search">
        <input
          ref={input}
          type="text"
          placeholder="Search issues, documents and deadlines"
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
          }}
        />
        <ul>
          {problem ? (
            <li className="small" role="alert" style={{ padding: '14px 16px' }}>
              {problem}
            </li>
          ) : results.length === 0 ? (
            <li className="small" style={{ padding: '14px 16px' }}>
              {found ? 'Nothing matches that.' : 'Searching.'}
            </li>
          ) : (
            results.map((result, index) => (
              <li key={result.key}>
                <a
                  href={result.href}
                  className={index === selected ? 'sel' : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    go(result);
                  }}
                >
                  {result.title}
                  <span>{result.subtitle}</span>
                </a>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
