'use client';
/* The NewScan board: search a company register by name or number, then pick the record.
   Used by /onboarding/company (your own company) and /scan (any company). Real register answers only. */
import { COUNTRIES, countryCoverage, type RegistrySearchResponse } from '@vero/shared';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import { SampleNote } from '@/components/Bits';
import { Icon } from '@/components/Icon';
import { Reveal, Scramble, Words } from '@/components/Motion';
import { Select, type SelectOption } from '@/components/Select';
import { After, Hero } from '@/components/Shell';
import { TLink } from '@/components/TLink';
import { api, asApiError, isRedirecting } from '@/lib/api';
import { entityWords } from '@/lib/format';
import { FEATURED_COUNTRIES, isCountry, registerFor } from '@/lib/words';

export type Candidate = RegistrySearchResponse['candidates'][number];

export interface Picked {
  country: string;
  candidate: Candidate;
  found: RegistrySearchResponse;
}

const LEVEL_WORDS = {
  full: 'Full coverage.',
  registry: 'Registry coverage.',
  international: 'International coverage.',
} as const;

/** The coverage line under the search box: what a scan can check there, before anything is searched. */
export function CoverageLine({ country }: { country: string | null }) {
  if (!country) {
    return (
      <p className="where" data-testid="country-coverage">
        <span className="lvw">Any country.</span> Choose where the company is registered. How much Vero can check depends on it.
      </p>
    );
  }
  const coverage = countryCoverage(country);
  return (
    <p className="where" data-testid="country-coverage">
      <span className="lvw">{LEVEL_WORDS[coverage.level]}</span> {coverage.sentence}
    </p>
  );
}

function Highlight({ text, query }: { text: string; query: string }) {
  const at = query.length >= 2 ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <em>{text.slice(at, at + query.length)}</em>
      {text.slice(at + query.length)}
    </>
  );
}

/** A company can be decades old, so the date it was formed always carries its year: 27 Nov 1947. */
const FORMED = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
function formedWords(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : FORMED.format(date);
}

const OTHERS = COUNTRIES.filter((item) => !(FEATURED_COUNTRIES as readonly string[]).includes(item.code));
/** Countries with their own rule pack first, then every other country by name. */
const COUNTRY_OPTIONS: SelectOption[] = [
  ...FEATURED_COUNTRIES.map((code) => ({
    value: code,
    label: registerFor(code).label,
    group: 'Full coverage',
  })),
  ...OTHERS.map((item) => ({
    value: item.code,
    label: item.name,
    group: 'Every other country',
  })),
];

const CHOOSE_FIRST = 'Choose the country where the company is registered first.';

export interface FinderProps {
  kicker: [string, string];
  title: string;
  lede: string;
  /** Where a row goes. Without it, a row is chosen with `onPick` and stays on this page. */
  rowHref?: (picked: Picked) => string;
  onPick?: (picked: Picked | null) => void;
  picked?: Picked | null;
  manualHref: (country: string, name: string) => string;
  notFoundHref: (country: string, query: string, sourceName?: string) => string;
  /** Extra line in the "can't find it" footer (onboarding: start without a company). */
  footExtra?: ReactNode;
  /** Shown above the results, inside the light area (the own or follow choice). */
  above?: ReactNode;
  /** A company that is only followed has no documents of its own to share, so the footer doesn't promise them. */
  publicOnly?: boolean;
  children?: ReactNode;
  onCountry?: (country: string | null) => void;
  onQuery?: (query: string) => void;
}

export function Finder(props: FinderProps) {
  const { rowHref, onPick, picked, manualHref, notFoundHref } = props;
  const router = useRouter();
  const params = useSearchParams();
  // A search can be linked to: ?country=GB&q=Acme opens with it already run.
  const [country, setCountry] = useState<string>(() => {
    const code = params.get('country');
    return isCountry(code) ? code : '';
  });
  const [name, setName] = useState(() => params.get('q') ?? '');
  const [found, setFound] = useState<RegistrySearchResponse | null>(null);
  const [searching, setSearching] = useState(false);
  /** The register search itself failed (the network, or our side). It can be tried again. */
  const [problem, setProblem] = useState<string | null>(null);
  /** Something is missing from the form. Shown under the search box, next to what needs fixing. */
  const [formProblem, setFormProblem] = useState<string | null>(null);
  const [now, setNow] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const rows = useRef<HTMLTableSectionElement>(null);
  const searchedIn = useRef(country);
  const trimmed = name.trim();

  useEffect(() => {
    props.onCountry?.(country || null);
  }, [country]);
  useEffect(() => {
    props.onQuery?.(trimmed);
  }, [trimmed]);

  // The address follows the search, so a refresh or the back button returns to the same results.
  useEffect(() => {
    const timer = setTimeout(() => {
      const next = new URLSearchParams(window.location.search);
      if (country) next.set('country', country);
      else next.delete('country');
      if (trimmed) next.set('q', trimmed);
      else next.delete('q');
      const query = next.toString();
      const address = `${window.location.pathname}${query ? `?${query}` : ''}`;
      if (address !== `${window.location.pathname}${window.location.search}`) window.history.replaceState(null, '', address);
    }, 500);
    return () => clearTimeout(timer);
  }, [country, trimmed]);

  useEffect(() => {
    setProblem(null);
    onPick?.(null);
    // Matches from another country never stay on screen. Matches for the last few letters do, dimmed, until the new ones land.
    if (searchedIn.current !== country || !country || trimmed.length < 2) setFound(null);
    searchedIn.current = country;
    if (!country || trimmed.length < 2) {
      setSearching(false);
      return;
    }
    let current = true;
    setSearching(true);
    const timer = setTimeout(
      () => {
        api.registry.search({ query: { country, q: trimmed } }).then(
          (response) => {
            if (!current) return;
            setFound(response);
            setSearching(false);
          },
          (error: unknown) => {
            if (!current || isRedirecting(error)) return;
            setFound(null);
            setProblem(asApiError(error).message);
            setSearching(false);
          },
        );
      },
      now ? 0 : 450,
    );
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [country, trimmed, now]);

  const chooseCountry = (code: string) => {
    setCountry(code);
    setFormProblem(null);
    // The list hands focus back to its button. The next thing to do is type the name.
    requestAnimationFrame(() => input.current?.focus({ preventScroll: true }));
  };

  const needCountry = () => {
    setFormProblem(CHOOSE_FIRST);
    document.getElementById('country')?.focus();
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!country) {
      needCountry();
      return;
    }
    if (trimmed.length < 2) {
      setFormProblem('Type at least two characters of the name or number.');
      input.current?.focus();
      return;
    }
    setFormProblem(null);
    if (searching) return;
    if (found?.outcome === 'not_found') {
      router.push(notFoundHref(country, trimmed, found.sourceName));
      return;
    }
    setNow(Date.now());
  };

  const byHand = () => {
    if (!country) {
      needCountry();
      return;
    }
    router.push(manualHref(country, trimmed));
  };

  const clear = () => {
    setName('');
    setFormProblem(null);
    input.current?.focus();
  };

  /** Down from the search box into the matches, and up and down between them. */
  const picks = () => Array.from(rows.current?.querySelectorAll<HTMLElement>('.pick') ?? []);
  const onInputKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      const first = picks()[0];
      if (first) {
        event.preventDefault();
        first.focus();
      }
    } else if (event.key === 'Escape' && name) {
      event.preventDefault();
      clear();
    }
  };
  const onRowsKey = (event: KeyboardEvent<HTMLTableSectionElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const list = picks();
    const at = list.indexOf(document.activeElement as HTMLElement);
    if (at < 0) return;
    event.preventDefault();
    if (event.key === 'ArrowUp' && at === 0) input.current?.focus();
    else list[at + (event.key === 'ArrowDown' ? 1 : -1)]?.focus();
  };

  const candidates = country && found ? found.candidates : [];
  const register = country ? registerFor(country) : null;
  const typed = trimmed.length >= 2;
  const state = searching ? 'Searching' : candidates.length > 0 ? `${candidates.length} ${candidates.length === 1 ? 'match' : 'matches'}` : '';
  const forWords = searching
    ? `Searching ${register?.register ?? 'the register'}`
    : problem
      ? 'The search didn’t go through'
      : found && candidates.length > 0
        ? `${candidates.length} found for “${trimmed}” at ${found.sourceName}`
        : found
          ? found.outcome === 'not_available'
            ? `No register search in ${registerFor(country).label} yet`
            : found.outcome === 'source_down'
              ? `${found.sourceName} isn't answering just now`
              : `No match for “${trimmed}”`
          : 'Start typing to search';

  const choose = (item: Picked) => {
    if (rowHref) router.push(rowHref(item));
    else onPick?.(item);
  };

  const showTable = candidates.length > 0 || searching;
  return (
    <>
      <Hero>
        <div className="find">
          <div className="mono kick">
            <Scramble text={props.kicker[0]} />
            <span className="sep"> · </span>
            <b>
              <Scramble text={props.kicker[1]} delay={120} />
            </b>
          </div>
          <h1>
            <Words text={props.title} />
          </h1>
          <p className="lede">{props.lede}</p>
          <form className={`sbox${formProblem ? ' bad' : ''}`} role="search" onSubmit={submit} noValidate>
            <label className="sr-only" htmlFor="country">
              Country of registration
            </label>
            <Select className="cty" id="country" testId="country-elsewhere" ariaLabel="Country of registration" placeholder="Choose a country" value={country} onChange={chooseCountry} options={COUNTRY_OPTIONS} />
            <Icon name="search" />
            <label className="sr-only" htmlFor="name">
              Company name
            </label>
            <input
              ref={input}
              id="name"
              type="text"
              autoComplete="organization"
              autoCapitalize="words"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="search"
              aria-describedby={formProblem ? 'find-problem' : undefined}
              aria-invalid={formProblem ? true : undefined}
              placeholder="Company name or number"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (formProblem && formProblem !== CHOOSE_FIRST) setFormProblem(null);
              }}
              onKeyDown={onInputKey}
            />
            {name ? (
              <button className="clr" type="button" aria-label="Clear the search" onClick={clear}>
                <Icon name="x" />
              </button>
            ) : null}
            <span className={`sstate${searching ? ' busy' : ''}`} aria-live="polite">
              {state}
            </span>
            <button className="go" type="submit" aria-busy={searching || undefined}>
              Search
            </button>
          </form>
          {formProblem ? (
            <p className="serr" id="find-problem" role="alert">
              {formProblem}
            </p>
          ) : null}
          <CoverageLine country={country || null} />
          {found?.sampleData ? <SampleNote /> : null}
        </div>
      </Hero>
      <After>
        {props.above}
        {country ? (
          <Reveal as="section" className="mod res" i={0}>
            <div className="mh">
              <h2>Registry matches</h2>
              <span className="sub">{forWords}</span>
            </div>
            <div aria-live="polite">
              {problem ? (
                <div className="snag" role="alert">
                  <p>
                    <b>We couldn&apos;t search just now</b>
                    {problem}
                  </p>
                  <button className="btn btn-g btn-sm" type="button" onClick={() => setNow(Date.now())}>
                    Try again
                  </button>
                </div>
              ) : null}
              {!searching && found?.outcome === 'source_down' ? (
                <div className="snag">
                  <p className="note warn" data-testid="search-source-down">
                    <span>
                      <span className="b">We can&apos;t check right now.</span> {found.message}{' '}
                      <TLink className="link" href={manualHref(country, trimmed)}>
                        Enter the details yourself
                      </TLink>
                    </span>
                  </p>
                  <button className="btn btn-g btn-sm" type="button" onClick={() => setNow(Date.now())}>
                    Try again
                  </button>
                </div>
              ) : null}
            </div>
            {showTable ? (
              <div role={candidates.length > 0 ? 'group' : undefined} aria-label={candidates.length > 0 ? 'Matches' : undefined} aria-busy={searching || undefined}>
                <table>
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th className="c-reg">Registry</th>
                      <th className="c-num">Number</th>
                      <th className="c-frm">Formed</th>
                      <th className="c-act">
                        <span className="sr-only">Choose</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody ref={rows} className={searching && candidates.length > 0 ? 'stale' : undefined} onKeyDown={onRowsKey}>
                    {candidates.length > 0 && found
                      ? candidates.map((candidate, index) => {
                          const item: Picked = { country, candidate, found };
                          const on = picked?.candidate === candidate;
                          const label = `${candidate.name}, select`;
                          const kind = [entityWords(candidate.entityType), candidate.registeredAgent ? `agent ${candidate.registeredAgent}` : null].filter(Boolean).join(' · ') || register?.label;
                          return (
                            <tr
                              key={`${candidate.name}-${candidate.registrationNumber ?? index}`}
                              className={`m${index === 0 && candidate.matchConfidence >= 0.9 ? ' best' : ''}${on ? ' on' : ''}`}
                              style={{
                                animation: `rowin .5s var(--ease) ${Math.min(index, 8) * 60}ms both`,
                              }}
                              onClick={() => choose(item)}
                            >
                              <td className="nm">
                                <b>
                                  <Highlight text={candidate.name} query={trimmed} />
                                </b>
                                <small>
                                  {kind}
                                  {candidate.registrationNumber ? <span className="mnum"> · {candidate.registrationNumber}</span> : null}
                                </small>
                              </td>
                              <td className="src2 c-reg">{found.sourceName}</td>
                              <td className={`num c-num${candidate.registrationNumber ? '' : ' nil'}`}>{candidate.registrationNumber ?? 'Not given'}</td>
                              <td className={`src2 c-frm${candidate.incorporatedOn ? '' : ' nil'}`}>{candidate.incorporatedOn ? formedWords(candidate.incorporatedOn) : 'Not given'}</td>
                              <td className="c-act">
                                {rowHref ? (
                                  <TLink className="pick" href={rowHref(item)} aria-label={label} onClick={(event) => event.stopPropagation()}>
                                    Select
                                    <Icon name="chev" />
                                  </TLink>
                                ) : (
                                  <button
                                    className="pick"
                                    type="button"
                                    aria-label={label}
                                    aria-pressed={on}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      choose(item);
                                    }}
                                  >
                                    {on ? 'Selected' : 'Select'}
                                    <Icon name="chev" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      : [0, 1, 2].map((key) => (
                          <tr className="busy" key={key}>
                            <td colSpan={5}>
                              <div className="skel" />
                              <div className="skel" />
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            ) : problem || found?.outcome === 'source_down' ? null : !found ? (
              <div className="none">
                <b>Search {register?.register}</b>
                {typed ? 'Looking it up.' : `Type at least two characters of the company name or its ${register?.numberLabel.toLowerCase()}.`}
              </div>
            ) : found.outcome === 'not_available' ? (
              <div className="none">
                <b>{found.message.split('. ')[0]}.</b>
                Enter the company&apos;s details yourself. Vero still checks international rules and sanctions.
                <div className="act">
                  <button className="btn btn-p btn-sm" type="button" onClick={byHand}>
                    Enter details by hand
                  </button>
                </div>
              </div>
            ) : (
              <div className="none" data-testid="search-not-found">
                <b>Not found at {found.sourceName}</b>
                {found.message}{' '}
                <TLink className="link" href={notFoundHref(country, trimmed, found.sourceName)}>
                  Search another way
                </TLink>
              </div>
            )}
            <div className="nc">
              <p>
                <b>Can&apos;t find it in a register?</b> Enter the company&apos;s details yourself. Vero still checks international rules and sanctions{props.publicOnly ? ' and its website.' : ', its website and the documents you share.'}
                {found?.outcome === 'not_found' ? null : (
                  <>
                    {' '}
                    <TLink className="link" href={notFoundHref(country, trimmed, found?.sourceName)}>
                      Search another way
                    </TLink>
                    .
                  </>
                )}
                {props.footExtra}
              </p>
              {found?.outcome === 'not_available' ? null : (
                <button className="btn btn-g" type="button" onClick={byHand}>
                  Enter details by hand
                </button>
              )}
            </div>
          </Reveal>
        ) : null}
        {props.children}
      </After>
    </>
  );
}

/** The steps after choosing a company, as on the board. `wide` lays them side by side when the panel stands alone. */
export function NextSteps({ follow = false, i = 1, wide = false }: { follow?: boolean; i?: number; wide?: boolean }) {
  const steps: [string, string][] = follow
    ? [
        ['Follow it', 'Public records only. You see its score and what changes, and can’t add evidence for it.'],
        ['Vero reads the registers', 'The official record first, then sanctions lists and its website.'],
        ['Watch it change', 'Every registry is read again on a schedule, and changes reach you under What’s new.'],
      ]
    : [
        ['Confirm it’s the right one', 'Check the registry record and choose linked companies to include.'],
        ['Answer a few questions', 'What the company does and where its users are. It decides which checks run.'],
        ['Watch the scan', 'Each registry and source is read live, one check after another.'],
        ['Read the first result', 'A score, what is in order, and the one thing to fix first.'],
      ];
  return (
    <Reveal as="section" className={`mod stp${wide ? ' wide' : ''}`} i={i}>
      <div className="mh">
        <h2>{follow ? 'After you follow a company' : 'After you select a company'}</h2>
      </div>
      <ol className="steps">
        {steps.map(([title, text], index) => (
          <li className="s" key={title}>
            <span className="n" aria-hidden="true">
              {index + 1}
            </span>
            <div>
              <b>{title}</b>
              <small>{text}</small>
            </div>
          </li>
        ))}
      </ol>
    </Reveal>
  );
}
