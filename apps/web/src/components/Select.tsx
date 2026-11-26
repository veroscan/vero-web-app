'use client';

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@/components/Icon';

export interface SelectOption {
  value: string;
  label: string;
  /** Options with the same group sit under one small heading, in the order they are given. */
  group?: string;
  /** A quiet second line, e.g. what a role can do. */
  hint?: string;
  disabled?: boolean;
}

interface SelectProps {
  /** The id a `<label htmlFor>` points at. It lands on the button that opens the list. */
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly SelectOption[];
  /** Shown while nothing is chosen. Choosing it again is not possible: it is a prompt, not an option. */
  placeholder?: string;
  /** A filter box above the list. On by default once the list is long. */
  searchable?: boolean;
  disabled?: boolean;
  className?: string;
  /** For a control with no visible label. */
  ariaLabel?: string;
  testId?: string;
}

const LONG_LIST = 9;

/**
 * The app's dropdown: a button that opens a list you can click, arrow through, or type into.
 * It replaces the browser's own select so it looks the same in both themes and on every system.
 * On a phone the list opens as a sheet from the bottom, where a thumb can reach it.
 */
export function Select({ id, value, onChange, options, placeholder = 'Choose one', searchable, disabled = false, className, ariaLabel, testId }: SelectProps) {
  const listId = useId();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const filterBox = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(-1);
  const [place, setPlace] = useState<{ above: boolean; style: CSSProperties }>({
    above: false,
    style: {},
  });
  const pop = useRef<HTMLDivElement>(null);
  const typed = useRef({ text: '', at: 0 });

  const withFilter = searchable ?? options.length > LONG_LIST;
  const chosen = options.find((option) => option.value === value);

  const shown = useMemo(() => {
    const words = query.trim().toLowerCase();
    if (!words) return options;
    // Names that start with what was typed come first, then names with a word that starts with it, then the rest.
    const rank = (option: SelectOption): number => {
      const label = option.label.toLowerCase();
      if (label.startsWith(words) || option.value.toLowerCase() === words) return 0;
      if (label.split(/[\s(,-]+/).some((word) => word.startsWith(words))) return 1;
      return label.includes(words) ? 2 : 3;
    };
    return options
      .map((option, at) => ({ option, at, rank: rank(option) }))
      .filter((item) => item.rank < 3)
      .sort((a, b) => a.rank - b.rank || a.at - b.at)
      .map((item) => item.option);
  }, [options, query]);

  const close = useCallback((refocus: boolean) => {
    setOpen(false);
    setQuery('');
    if (refocus) button.current?.focus();
  }, []);

  const firstEnabled = useCallback((from: number, step: 1 | -1, items: readonly SelectOption[]): number => {
    for (let at = from; at >= 0 && at < items.length; at += step) {
      if (!items[at]?.disabled) return at;
    }
    return -1;
  }, []);

  const openList = useCallback(() => {
    if (disabled) return;
    const at = options.findIndex((option) => option.value === value && !option.disabled);
    setActive(at >= 0 ? at : firstEnabled(0, 1, options));
    setOpen(true);
  }, [disabled, firstEnabled, options, value]);

  const choose = useCallback(
    (option: SelectOption | undefined) => {
      if (!option || option.disabled) return;
      if (option.value !== value) onChange(option.value);
      close(true);
    },
    [close, onChange, value],
  );

  // Open upward when there is no room below, and put the keyboard where it is most useful.
  useLayoutEffect(() => {
    if (!open) return;
    const box = button.current?.getBoundingClientRect();
    if (box) {
      // The list is drawn at the page root, so no card or table can clip it. It lines up with the button.
      const below = window.innerHeight - box.bottom;
      const above = below < 340 && box.top > below;
      const left = Math.max(8, Math.min(box.left, window.innerWidth - Math.max(box.width, 220) - 8));
      setPlace({
        above,
        style: above
          ? {
              left,
              bottom: window.innerHeight - box.top + 6,
              minWidth: box.width,
            }
          : { left, top: box.bottom + 6, minWidth: box.width },
      });
    }
    if (withFilter && window.matchMedia('(min-width: 641px)').matches) filterBox.current?.focus();
    else list.current?.focus();
  }, [open, withFilter]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent): void => {
      const target = event.target as Node;
      if (root.current?.contains(target) || pop.current?.contains(target)) return;
      close(false);
    };
    // The list is pinned to where the button was, so it closes when the page behind it moves.
    const moved = (event: Event): void => {
      if (pop.current?.contains(event.target as Node)) return;
      if (window.matchMedia('(max-width: 640px)').matches) return;
      close(false);
    };
    const resized = (): void => close(false);
    document.addEventListener('pointerdown', outside);
    window.addEventListener('scroll', moved, true);
    window.addEventListener('resize', resized);
    return () => {
      document.removeEventListener('pointerdown', outside);
      window.removeEventListener('scroll', moved, true);
      window.removeEventListener('resize', resized);
    };
  }, [open, close]);

  // Keep the highlighted row in view while arrowing or filtering.
  useEffect(() => {
    if (!open || active < 0) return;
    list.current?.querySelector<HTMLElement>(`[data-at="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active, shown]);

  // A changed filter starts again from the first match.
  useEffect(() => {
    if (open && query) setActive(firstEnabled(0, 1, shown));
  }, [open, query, shown, firstEnabled]);

  const move = (step: 1 | -1): void => {
    const next = firstEnabled(active + step, step, shown);
    if (next >= 0) setActive(next);
  };

  const typeAhead = (key: string): void => {
    const now = Date.now();
    typed.current = {
      text: now - typed.current.at > 700 ? key : typed.current.text + key,
      at: now,
    };
    const words = typed.current.text.toLowerCase();
    const at = shown.findIndex((option) => !option.disabled && option.label.toLowerCase().startsWith(words));
    if (at >= 0) setActive(at);
  };

  const onListKey = (event: ReactKeyboardEvent): void => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        move(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        move(-1);
        break;
      case 'Home':
        event.preventDefault();
        setActive(firstEnabled(0, 1, shown));
        break;
      case 'End':
        event.preventDefault();
        setActive(firstEnabled(shown.length - 1, -1, shown));
        break;
      case 'Enter':
        event.preventDefault();
        choose(shown[active]);
        break;
      case ' ':
        if (event.target === filterBox.current) break;
        event.preventDefault();
        choose(shown[active]);
        break;
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        close(true);
        break;
      case 'Tab':
        close(false);
        break;
      default:
        if (event.key.length === 1 && event.target !== filterBox.current && !event.ctrlKey && !event.metaKey && !event.altKey) typeAhead(event.key);
    }
  };

  const onButtonKey = (event: ReactKeyboardEvent): void => {
    if (open) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      openList();
    }
  };

  let lastGroup: string | undefined;

  return (
    <div className={`sel${open ? ' open' : ''}${className ? ` ${className}` : ''}`} ref={root}>
      <button
        type="button"
        id={id}
        ref={button}
        className="sel-btn"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        disabled={disabled}
        data-testid={testId}
        data-value={value}
        onClick={() => (open ? close(false) : openList())}
        onKeyDown={onButtonKey}
      >
        <span className={chosen ? 'sel-val' : 'sel-val ph'}>{chosen ? chosen.label : placeholder}</span>
        <Icon name="chevd" />
      </button>
      {open
        ? createPortal(
            <>
              <div className="sel-scrim" aria-hidden="true" onClick={() => close(false)} />
              <div className={`sel-pop${place.above ? ' above' : ''}`} style={place.style} ref={pop} onKeyDown={onListKey}>
                {withFilter ? (
                  <div className="sel-find">
                    <Icon name="search" />
                    <input
                      ref={filterBox}
                      type="text"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Type to filter"
                      aria-label="Filter the list"
                      aria-controls={listId}
                      aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </div>
                ) : null}
                <div className="sel-list" id={listId} role="listbox" tabIndex={-1} ref={list} aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}>
                  {shown.length === 0 ? <p className="sel-none">Nothing matches &ldquo;{query.trim()}&rdquo;.</p> : null}
                  {shown.map((option, at) => {
                    const heading = !query.trim() && option.group && option.group !== lastGroup ? option.group : null;
                    lastGroup = option.group;
                    const selected = option.value === value;
                    return (
                      <div key={option.value} role="presentation">
                        {heading ? (
                          <div className="sel-group" role="presentation">
                            {heading}
                          </div>
                        ) : null}
                        <div
                          id={`${listId}-${at}`}
                          role="option"
                          aria-selected={selected}
                          aria-disabled={option.disabled || undefined}
                          data-at={at}
                          data-value={option.value}
                          className={`sel-opt${at === active ? ' act' : ''}${selected ? ' on' : ''}`}
                          onPointerMove={() => (option.disabled || at === active ? undefined : setActive(at))}
                          onClick={() => choose(option)}
                        >
                          <span className="sel-txt">
                            <b>{option.label}</b>
                            {option.hint ? <small>{option.hint}</small> : null}
                          </span>
                          {selected ? <Icon name="check" /> : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>,
            document.body,
          )
        : null}
    </div>
  );
}
