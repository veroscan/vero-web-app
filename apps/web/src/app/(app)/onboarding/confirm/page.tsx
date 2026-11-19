'use client';

import type { RegistrySearchResponse } from '@vero/shared';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { SampleNote } from '@/components/Bits';
import { useSession } from '@/components/Session';
import { OnboardingBar } from '@/components/Shell';
import { TLink } from '@/components/TLink';
import { api, asApiError } from '@/lib/api';
import { entityWords, longDate } from '@/lib/format';
import { countryLong } from '@/lib/records';
import { FEATURED_COUNTRIES, isCountry, registerFor } from '@/lib/words';

interface RelatedOption {
  country: string;
  name: string;
  number: string | null;
  type: string | null;
  sourceName: string;
  sample: boolean;
  on: boolean;
}

/** Only a clear match is offered, and the person still decides. Anything less stays off the screen. */
const CLEAR_MATCH = 0.9;

/** Words like Ltd or Inc. differ between registers, so the search uses the name without them. */
function coreName(name: string): string {
  return name.replace(/\b(inc|incorporated|llc|ltd|limited|plc|llp|corp|corporation|uk|nigeria)\b\.?/gi, ' ').replace(/\s+/g, ' ').trim();
}

function asRelated(country: string, found: RegistrySearchResponse): RelatedOption | null {
  const first = found.candidates[0];
  if (found.outcome !== 'found' || !first || first.matchConfidence < CLEAR_MATCH) return null;
  return { country, name: first.name, number: first.registrationNumber, type: first.entityType, sourceName: found.sourceName, sample: found.sampleData, on: true };
}

function Confirm() {
  const session = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const rawCountry = params.get('country');
  const country = isCountry(rawCountry) ? rawCountry : null;
  const manual = params.get('manual') === '1';
  const sample = params.get('sample') === '1';
  const source = params.get('source');
  const type = params.get('type');
  const formed = params.get('formed');
  const agent = params.get('agent');
  const [name, setName] = useState(params.get('name') ?? '');
  const [number, setNumber] = useState(params.get('number') ?? '');
  const [related, setRelated] = useState<RelatedOption[]>([]);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  // "Add another company": the new one joins this team's group, under the company it already has.
  const adding = params.get('add') === '1' && session.root !== null;

  useEffect(() => {
    if (session.root && params.get('add') !== '1') router.replace(session.hasResult ? '/' : '/onboarding/questions');
  }, [session.root, session.hasResult, router, params]);

  // Real searches of the other two registers. If one can't answer, it simply isn't offered.
  useEffect(() => {
    const query = coreName(name);
    if (!country || manual || adding || query.length < 2) return;
    let current = true;
    const others = FEATURED_COUNTRIES.filter((code) => code !== country);
    void Promise.all(others.map((code) => api.registry.search({ query: { country: code, q: query } }).then((found) => asRelated(code, found)).catch(() => null))).then((options) => {
      if (current) setRelated(options.filter((option): option is RelatedOption => option !== null));
    });
    return () => {
      current = false;
    };
    // Only the name from the register. Typing in manual mode never runs this.
  }, [country, manual, adding]);

  if (!country) {
    return (
      <div className="vs">
        <OnboardingBar step="Step 2 of 3" />
        <main className="state">
          <h1 className="t-2">Let&apos;s find your company first</h1>
          <TLink className="btn btn-ink btn-sm" href="/onboarding/company">
            Find your company
          </TLink>
        </main>
      </div>
    );
  }

  const register = registerFor(country);
  const accept = async () => {
    if (!name.trim()) {
      setProblem('Enter the company name.');
      return;
    }
    setBusy(true);
    setProblem(null);
    try {
      const body = {
        legalName: name.trim(),
        incorporationCountry: country,
        ...(number.trim() ? { registrationNumber: number.trim() } : {}),
        ...(type ? { entityType: type } : {}),
      };
      if (adding && session.root) {
        const added = await api.companies.addRelated({ params: { companyId: session.root.id }, body });
        await session.refresh();
        router.push(`/onboarding/questions?company=${added.id}&added=1`);
        return;
      }
      const company = await api.companies.create({ body });
      for (const option of related.filter((item) => item.on)) {
        await api.companies.addRelated({
          params: { companyId: company.id },
          body: {
            legalName: option.name,
            incorporationCountry: option.country,
            ...(option.number ? { registrationNumber: option.number } : {}),
            ...(option.type ? { entityType: option.type } : {}),
          },
        });
      }
      await session.refresh();
      router.push('/onboarding/questions');
    } catch (error) {
      setProblem(asApiError(error).message);
      setBusy(false);
    }
  };

  const showSample = sample || related.some((option) => option.sample);
  return (
    <div className="vs">
      <OnboardingBar step="Step 2 of 3" />
      <main className="wrap" style={{ maxWidth: 1040, paddingBlock: 'clamp(32px,5vw,64px) 64px' }}>
        <div className="stack g48">
          <div className="stack g12">
            <h1 className="t-1">{manual ? 'Tell us about your company' : 'Is this your company?'}</h1>
            <p className="lead">{manual ? `We'll mark these details as coming from you, and check them with ${register.register} when we can.` : `This is what we found at ${source ?? register.register}.`}</p>
            {showSample ? <SampleNote /> : null}
          </div>

          <div className="split">
            {manual ? (
              <div className="stack g20">
                <div className="field">
                  <label htmlFor="legal-name">Company name</label>
                  <input className="input" id="legal-name" type="text" autoComplete="organization" value={name} onChange={(event) => setName(event.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="reg-number">{register.numberLabel} (optional)</label>
                  <input className="input" id="reg-number" type="text" autoComplete="off" value={number} onChange={(event) => setNumber(event.target.value)} />
                </div>
              </div>
            ) : (
              <div className="stack g16 cc-rec">
                <p className="cc-name">
                  <span>{name}</span>
                  <svg className="cc-tick" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m4 12.5 5.5 5.5L20 6.5" />
                  </svg>
                </p>
                <div className="rows cc-rows">
                  {type ? (
                    <div className="row r-act">
                      <span className="quiet">Type</span>
                      <span className="b">{entityWords(type)}</span>
                    </div>
                  ) : null}
                  {number ? (
                    <div className="row r-act">
                      <span className="quiet">{register.numberLabel}</span>
                      <span className="b num">{number}</span>
                    </div>
                  ) : null}
                  {formed ? (
                    <div className="row r-act">
                      <span className="quiet">Formed</span>
                      <span className="b num">{longDate(formed)}</span>
                    </div>
                  ) : null}
                  {agent ? (
                    <div className="row r-act">
                      <span className="quiet">Registered agent</span>
                      <span className="b">{agent}</span>
                    </div>
                  ) : (
                    <div className="row r-act">
                      <span className="quiet">Registered in</span>
                      <span className="b">{countryLong(country)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {related.length > 0 ? (
              <div className="stack g16 cc-later">
                <h2 className="t-3" style={{ fontSize: 22 }}>
                  Do you have companies in these places too?
                </h2>
                <p className="quiet" style={{ marginTop: -8 }}>
                  We&apos;ll check each one with its own register.
                </p>
                <div className="stack g12">
                  {related.map((option) => (
                    <button
                      key={option.country}
                      className={`opt cc-opt${option.on ? ' on' : ''}`}
                      type="button"
                      aria-pressed={option.on}
                      onClick={() => setRelated((list) => list.map((item) => (item.country === option.country ? { ...item, on: !item.on } : item)))}
                    >
                      <span>
                        {option.name}
                        <small>
                          {countryLong(option.country)} · Found at {option.sourceName}
                        </small>
                      </span>
                      <span className="cc-sw" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {problem ? (
            <p className="formerror" role="alert">
              {problem}
            </p>
          ) : null}
          <div className="btns cc-acts">
            <button className="btn btn-ink" type="button" disabled={busy} onClick={() => void accept()}>
              {busy ? 'Saving' : manual ? 'Continue' : "Yes, that's us"}
            </button>
            <TLink className="btn btn-line" href={adding ? '/onboarding/company?add=1' : '/onboarding/company'}>
              {manual ? 'Back' : 'Not my company'}
            </TLink>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Confirm />
    </Suspense>
  );
}
