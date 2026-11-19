'use client';

import { COUNTRIES, countryCoverage, type RegistrySearchResponse } from '@vero/shared';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { SampleNote } from '@/components/Bits';
import { useSession } from '@/components/Session';
import { OnboardingBar } from '@/components/Shell';
import { TLink } from '@/components/TLink';
import { api, asApiError, isRedirecting } from '@/lib/api';
import { confirmHref, manualHref, notFoundHref } from '@/lib/candidate';
import { entityWords } from '@/lib/format';
import { rememberNext } from '@/lib/next-path';
import { FEATURED_COUNTRIES, registerFor } from '@/lib/words';

function moveRadio(event: KeyboardEvent<HTMLButtonElement>): void {
  const forward = event.key === 'ArrowDown' || event.key === 'ArrowRight';
  const back = event.key === 'ArrowUp' || event.key === 'ArrowLeft';
  if (!forward && !back) return;
  event.preventDefault();
  const radios = [...(event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]') ?? [])];
  const at = radios.indexOf(event.currentTarget);
  const target = radios[(at + (forward ? 1 : radios.length - 1)) % radios.length];
  target?.focus();
  target?.click();
}

function FindCompany() {
  const session = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const [country, setCountry] = useState<string | null>(null);
  // "Add another company": someone who already has one is not sent back to it.
  const adding = params.get('add') === '1' && session.root !== null;
  const [name, setName] = useState('');
  const [found, setFound] = useState<RegistrySearchResponse | null>(null);
  const [searching, setSearching] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const trimmed = name.trim();

  useEffect(() => {
    const next = params.get('next');
    if (next) rememberNext(next);
  }, [params]);

  // Someone who already has a company carries on from where they got to.
  useEffect(() => {
    if (session.root && params.get('add') !== '1') router.replace(session.hasResult ? '/' : '/onboarding/questions');
  }, [session.root, session.hasResult, router, params]);

  useEffect(() => {
    setFound(null);
    setProblem(null);
    if (!country || trimmed.length < 2) {
      setSearching(false);
      return;
    }
    let current = true;
    setSearching(true);
    const timer = setTimeout(() => {
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
    }, 450);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [country, trimmed]);

  /** Not registered yet: the company still needs a name, because the API records one. */
  const startWithout = async () => {
    if (!country || trimmed.length === 0) {
      setProblem(country ? 'Type the name you plan to use first.' : 'Choose a country and type the name you plan to use first.');
      input.current?.focus();
      return;
    }
    setStarting(true);
    setProblem(null);
    try {
      const body = { legalName: trimmed, incorporationCountry: country, preIncorporation: true };
      if (adding && session.root) {
        const added = await api.companies.addRelated({ params: { companyId: session.root.id }, body });
        await session.refresh();
        router.push(`/onboarding/questions?company=${added.id}&added=1`);
        return;
      }
      await api.companies.create({ body });
      await session.refresh();
      router.push('/onboarding/questions');
    } catch (error) {
      setProblem(asApiError(error).message);
      setStarting(false);
    }
  };

  const register = country ? registerFor(country) : null;
  const elsewhere = country !== null && !(FEATURED_COUNTRIES as readonly string[]).includes(country);
  return (
    <div className="vs">
      <OnboardingBar step="Step 1 of 3" />
      <main className="wrap mid" style={{ paddingBlock: 'clamp(32px,6vw,80px) 64px' }}>
        <div className="stack g32 fc">
          <h1 className="fc-title">Where is your company registered?</h1>

          <div className="stack g12 fc-opts" role="radiogroup" aria-label="Country of registration">
            {FEATURED_COUNTRIES.map((code) => (
              <button
                key={code}
                className="opt"
                type="button"
                role="radio"
                aria-checked={country === code}
                onKeyDown={moveRadio}
                onClick={() => {
                  setCountry(code);
                  requestAnimationFrame(() => input.current?.focus({ preventScroll: true }));
                }}
              >
                <span className="fc-ring" aria-hidden="true" />
                <span className="fc-name">
                  {registerFor(code).label}
                  <small>{registerFor(code).note}</small>
                </span>
                <span className="fc-hint">{registerFor(code).hint}</span>
              </button>
            ))}
          </div>

          <div className="field">
            <label htmlFor="country-elsewhere">Somewhere else</label>
            <select
              className="input"
              id="country-elsewhere"
              data-testid="country-elsewhere"
              value={elsewhere ? (country ?? '') : ''}
              onChange={(event) => setCountry(event.target.value || null)}
            >
              <option value="">Choose a country</option>
              {COUNTRIES.filter((item) => !(FEATURED_COUNTRIES as readonly string[]).includes(item.code)).map((item) => (
                <option key={item.code} value={item.code}>
                  {item.name}
                </option>
              ))}
            </select>
            {/* What a scan can check there, said before anything is searched. */}
            {elsewhere && country ? (
              <p className="small" data-testid="country-coverage">
                {countryCoverage(country).sentence}
              </p>
            ) : null}
          </div>

          <div className="stack g24 fc-find" hidden={!country}>
            <div className="field">
              <label htmlFor="name">Company name</label>
              <div className="fc-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <input
                  ref={input}
                  className="input"
                  id="name"
                  type="text"
                  autoComplete="organization"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && country && found?.outcome === 'not_found') router.push(notFoundHref(country, trimmed, found.sourceName, adding));
                  }}
                />
              </div>
            </div>

            <div aria-live="polite" className="stack g16">
              {searching ? <p className="small">Searching {register?.register}.</p> : null}
              {problem ? (
                <p className="formerror" role="alert">
                  {problem}
                </p>
              ) : null}
              {found?.sampleData ? <SampleNote /> : null}
              {country && found && found.candidates.length > 0 ? (
                <div className="rows" role="group" aria-label="Matches">
                  {found.candidates.map((candidate) => (
                    <TLink key={`${candidate.name}-${candidate.registrationNumber ?? ''}`} className="row r-act" href={confirmHref(country, candidate, found, adding)}>
                      <span className="stack g4">
                        <span className="row-t">{candidate.name}</span>
                        <span className="row-s">
                          {[entityWords(candidate.entityType), candidate.registrationNumber ? `${registerFor(country).numberLabel} ${candidate.registrationNumber}` : null].filter(Boolean).join(' · ')}
                        </span>
                      </span>
                      <span className="link small fc-this">This one</span>
                    </TLink>
                  ))}
                </div>
              ) : null}
              {country && found && found.outcome === 'not_found' ? (
                <p className="quiet" data-testid="search-not-found">
                  {found.message}{' '}
                  <TLink className="link" href={notFoundHref(country, trimmed, found.sourceName, adding)}>
                    Search another way
                  </TLink>
                </p>
              ) : null}
              {country && found && found.outcome === 'source_down' ? (
                <p className="note warn" data-testid="search-source-down">
                  <span className="b">We can&apos;t check right now.</span>
                  <span>{found.message}</span>{' '}
                  <TLink className="link" href={manualHref(country, trimmed, adding)}>
                    Enter the details yourself
                  </TLink>
                </p>
              ) : null}
            </div>
          </div>

          <p className="small">
            Can&apos;t see it?{' '}
            {country ? (
              <TLink className="link" href={notFoundHref(country, trimmed, found?.sourceName, adding)}>
                Search another way
              </TLink>
            ) : (
              <button className="link" type="button" style={{ background: 'none', border: 0, padding: 0, font: 'inherit', cursor: 'pointer' }} onClick={() => setProblem('Choose a country first.')}>
                Search another way
              </button>
            )}
            . Not registered yet?{' '}
            <button className="link" type="button" disabled={starting} style={{ background: 'none', border: 0, padding: 0, font: 'inherit', cursor: 'pointer' }} onClick={() => void startWithout()}>
              Start without a company
            </button>
            .
          </p>
          {!country && problem ? (
            <p className="formerror" role="alert">
              {problem}
            </p>
          ) : null}
        </div>
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <FindCompany />
    </Suspense>
  );
}
