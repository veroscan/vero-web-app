'use client';
/* The NewScan board: search a company register by name or number, then pick the record.
   Used by /onboarding/company (your own company) and /scan (any company). Real register answers only. */
import { COUNTRIES, countryCoverage, type RegistrySearchResponse } from '@vero/shared';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { SampleNote } from '@/components/Bits';
import { Icon } from '@/components/Icon';
import { Reveal, Scramble, Words } from '@/components/Motion';
import { After, Hero } from '@/components/Shell';
import { TLink } from '@/components/TLink';
import { api, asApiError, isRedirecting } from '@/lib/api';
import { entityWords, shortDate } from '@/lib/format';
import { FEATURED_COUNTRIES, isCountry, registerFor } from '@/lib/words';

export type Candidate = RegistrySearchResponse['candidates'][number];

export interface Picked {
  country: string;
  candidate: Candidate;
  found: RegistrySearchResponse;
}

const LEVEL_WORDS = { full: 'Full coverage.', registry: 'Registry coverage.', international: 'International coverage.' } as const;

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

const OTHERS = COUNTRIES.filter((item) => !(FEATURED_COUNTRIES as readonly string[]).includes(item.code));

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
  const [problem, setProblem] = useState<string | null>(null);
  const [now, setNow] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const trimmed = name.trim();

  useEffect(() => {
    props.onCountry?.(country || null);
  }, [country]);
  useEffect(() => {
    props.onQuery?.(trimmed);
  }, [trimmed]);

  useEffect(() => {
    setFound(null);
    setProblem(null);
    onPick?.(null);
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

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!country) {
      setProblem('Choose the country where the company is registered first.');
      return;
    }
    if (trimmed.length < 2) {
      setProblem('Type at least two characters of the name or number.');
      input.current?.focus();
      return;
    }
    if (found?.outcome === 'not_found') {
      router.push(notFoundHref(country, trimmed, found.sourceName));
      return;
    }
    setNow(Date.now());
  };

  const byHand = () => {
    if (!country) {
      setProblem('Choose the country where the company is registered first.');
      return;
    }
    router.push(manualHref(country, trimmed));
  };

  const candidates = country && found ? found.candidates : [];
  const register = country ? registerFor(country) : null;
  const state = searching ? 'Searching' : candidates.length > 0 ? `${candidates.length} ${candidates.length === 1 ? 'match' : 'matches'}` : '';
  const forWords = !country
    ? 'Choose a country to start'
    : searching
      ? `Searching ${register?.register ?? 'the register'}`
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

  return (
    <>
      <Hero>
        <div className="find">
          <div className="mono kick">
            <Scramble text={props.kicker[0]} /> · <b><Scramble text={props.kicker[1]} delay={120} /></b>
          </div>
          <h1>
            <Words text={props.title} />
          </h1>
          <p className="lede">{props.lede}</p>
          <form className="sbox" role="search" onSubmit={submit}>
            <label className="sr-only" htmlFor="country">
              Country of registration
            </label>
            <select className="cty" id="country" data-testid="country-elsewhere" value={country} onChange={(event) => setCountry(event.target.value)}>
              <option value="">Choose a country</option>
              <optgroup label="Full coverage">
                {FEATURED_COUNTRIES.map((code) => (
                  <option key={code} value={code}>
                    {registerFor(code).label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Every other country">
                {OTHERS.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.name}
                  </option>
                ))}
              </optgroup>
            </select>
            <Icon name="search" />
            <label className="sr-only" htmlFor="name">
              Company name
            </label>
            <input
              ref={input}
              id="name"
              type="text"
              autoComplete="organization"
              placeholder={register?.numberExample ? `Company name, or a number like ${register.numberExample}` : 'Company name or registration number'}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <span className="sstate" aria-live="polite">
              {state}
            </span>
            <button className="go" type="submit" disabled={searching}>
              Search
            </button>
          </form>
          <CoverageLine country={country || null} />
          {found?.sampleData ? <SampleNote /> : null}
        </div>
      </Hero>
      <After>
        {props.above}
        <Reveal as="section" className="mod res" i={0}>
          <div className="mh">
            <h2>Registry matches</h2>
            <span className="sub">{forWords}</span>
          </div>
          <div aria-live="polite">
            {problem ? (
              <p className="formerror" role="alert" style={{ padding: '14px 22px 0' }}>
                {problem}
              </p>
            ) : null}
            {found?.outcome === 'source_down' && country ? (
              <div style={{ padding: '14px 22px 0' }}>
                <p className="note warn" data-testid="search-source-down">
                  <span>
                    <span className="b">We can&apos;t check right now.</span> {found.message}{' '}
                    <TLink className="link" href={manualHref(country, trimmed)}>
                      Enter the details yourself
                    </TLink>
                  </span>
                </p>
              </div>
            ) : null}
          </div>
          <div role={candidates.length > 0 ? 'group' : undefined} aria-label={candidates.length > 0 ? 'Matches' : undefined}>
            <table>
              <thead hidden={!searching && candidates.length === 0}>
                <tr>
                  <th>Company</th>
                  <th>Registry</th>
                  <th>Number</th>
                  <th>Formed</th>
                  <th style={{ width: 120 }} />
                </tr>
              </thead>
              <tbody>
                {searching ? (
                  [0, 1, 2].map((key) => (
                    <tr className="busy" key={key}>
                      <td colSpan={5}>
                        <div className="skel" />
                        <div className="skel" />
                      </td>
                    </tr>
                  ))
                ) : candidates.length > 0 && found ? (
                  candidates.map((candidate, index) => {
                    const item: Picked = { country, candidate, found };
                    const on = picked?.candidate === candidate;
                    const label = `${candidate.name}, select`;
                    return (
                      <tr
                        key={`${candidate.name}-${candidate.registrationNumber ?? index}`}
                        className={`m${index === 0 && candidate.matchConfidence >= 0.9 ? ' best' : ''}${on ? ' on' : ''}`}
                        style={{ animation: `rowin .5s var(--ease) ${index * 70}ms both` }}
                        onClick={() => choose(item)}
                      >
                        <td className="nm">
                          <b>
                            <Highlight text={candidate.name} query={trimmed} />
                          </b>
                          <small>{[entityWords(candidate.entityType), candidate.registeredAgent ? `agent ${candidate.registeredAgent}` : null].filter(Boolean).join(' · ') || register?.label}</small>
                        </td>
                        <td className="src2">{found.sourceName}</td>
                        <td className="num">{candidate.registrationNumber ?? '-'}</td>
                        <td className="src2">{candidate.incorporatedOn ? shortDate(candidate.incorporatedOn) : '-'}</td>
                        <td style={{ textAlign: 'right' }}>
                          {rowHref ? (
                            <TLink className="sel" href={rowHref(item)} aria-label={label} onClick={(event) => event.stopPropagation()}>
                              Select
                              <Icon name="chev" />
                            </TLink>
                          ) : (
                            <button
                              className="sel"
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
                ) : (
                  <tr className="empty">
                    <td colSpan={5}>
                      {!country ? (
                        <>
                          <b>Search company registers in any country</b>
                          Choose the country, then type a company name or registration number.
                        </>
                      ) : !found ? (
                        <>
                          <b>Search {register?.register}</b>
                          Type at least two characters of the company name or its {register?.numberLabel.toLowerCase()}.
                        </>
                      ) : found.outcome === 'not_available' ? (
                        <>
                          <b>{found.message.split('. ')[0]}.</b>
                          Enter the company&apos;s details yourself. Vero still checks international rules and sanctions.
                          <button className="link" type="button" onClick={byHand}>
                            Enter details by hand
                          </button>
                        </>
                      ) : found.outcome === 'source_down' ? (
                        <>
                          <b>The register isn&apos;t answering</b>
                          Try again in a moment, or enter the details yourself.
                        </>
                      ) : (
                        <span data-testid="search-not-found">
                          <b>Not found at {found.sourceName}</b>
                          {found.message}{' '}
                          <TLink className="link" href={notFoundHref(country, trimmed, found.sourceName)}>
                            Search another way
                          </TLink>
                        </span>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="nc">
            <p>
              <b>Can&apos;t find it in a register?</b> Enter the company&apos;s details yourself. Vero still checks international rules and sanctions, its website and the documents you share.
              {country ? (
                <>
                  {' '}
                  <TLink className="link" href={notFoundHref(country, trimmed, found?.sourceName)}>
                    Search another way
                  </TLink>
                  .
                </>
              ) : null}
              {props.footExtra}
            </p>
            <button className="btn btn-g" type="button" onClick={byHand}>
              Enter details by hand
            </button>
          </div>
        </Reveal>
        {props.children}
      </After>
    </>
  );
}

/** The four steps after choosing a company, as on the board. */
export function NextSteps({ follow = false, i = 1 }: { follow?: boolean; i?: number }) {
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
    <Reveal as="section" className="mod" i={i}>
      <div className="mh">
        <h2>{follow ? 'After you follow a company' : 'After you select a company'}</h2>
      </div>
      <div className="steps">
        {steps.map(([title, text], index) => (
          <div className="s" key={title}>
            <span className="n">{index + 1}</span>
            <div>
              <b>{title}</b>
              <small>{text}</small>
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}
