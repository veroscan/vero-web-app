'use client';

import '@/app/styles/pages/scan.css';
import { countryCoverage, type RegistrySearchResponse } from '@vero/shared';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { PlanLink, SampleNote } from '@/components/Bits';
import { CountUp, Reveal, Scramble, Words } from '@/components/Motion';
import { RecordArt } from '@/components/scan/RecordArt';
import { useSession } from '@/components/Session';
import { After, Hero, useWatchlist } from '@/components/Shell';
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

/** "14 02 2023" for the certificate drawing. */
function pixelDate(value: string | null): string | null {
  const match = value ? /^(\d{4})-(\d{2})-(\d{2})/.exec(value) : null;
  return match ? `${match[3]} ${match[2]} ${match[1]}` : null;
}

const LEVEL = { full: 'Full coverage', registry: 'Registry coverage', international: 'International coverage' } as const;

function Confirm() {
  const session = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const watchlist = useWatchlist();
  const rawCountry = params.get('country');
  const country = isCountry(rawCountry) ? rawCountry : null;
  const manual = params.get('manual') === '1';
  const follow = params.get('follow') === '1';
  const sample = params.get('sample') === '1';
  const source = params.get('source');
  const type = params.get('type');
  const formed = params.get('formed');
  const agent = params.get('agent');
  const [name, setName] = useState(params.get('name') ?? '');
  const [number, setNumber] = useState(params.get('number') ?? '');
  const [related, setRelated] = useState<RelatedOption[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<{ message: string; code?: string } | null>(null);
  // "Add another company": the new one joins this team's group, under the company it already has.
  const adding = params.get('add') === '1' && session.root !== null;

  useEffect(() => {
    if (session.root && !follow && params.get('add') !== '1') router.replace(session.hasResult ? '/' : '/onboarding/questions');
  }, [session.root, session.hasResult, router, params, follow]);

  // Real searches of the other featured registers. If one can't answer, it simply isn't offered.
  useEffect(() => {
    const query = coreName(name);
    if (!country || manual || adding || follow || query.length < 2) {
      setRelated([]);
      return;
    }
    let current = true;
    const others = FEATURED_COUNTRIES.filter((code) => code !== country);
    void Promise.all(others.map((code) => api.registry.search({ query: { country: code, q: query } }).then((found) => asRelated(code, found)).catch(() => null))).then((options) => {
      if (current) setRelated(options.filter((option): option is RelatedOption => option !== null));
    });
    return () => {
      current = false;
    };
    // Only the name from the register. Typing in manual mode never runs this.
  }, [country, manual, adding, follow]);

  if (!country) {
    return (
      <div className="pg-scan">
        <Hero>
          <div className="pagehead">
            <div>
              <h1 className="disp">Let&apos;s find the company first</h1>
            </div>
            <div className="acts">
              <TLink className="btn btn-p" href={follow ? '/scan' : '/onboarding/company'}>
                Find the company
              </TLink>
            </div>
          </div>
        </Hero>
      </div>
    );
  }

  const register = registerFor(country);
  const coverage = countryCoverage(country);
  const where = source ?? register.register;
  const searchHref = follow ? '/scan' : adding ? '/onboarding/company?add=1' : '/onboarding/company';
  const linked = (related ?? []).filter((option) => option.on);
  const shortName = name.trim() || 'This company';

  const body = () => ({
    legalName: name.trim(),
    incorporationCountry: country,
    ...(number.trim() ? { registrationNumber: number.trim() } : {}),
    ...(type ? { entityType: type } : {}),
  });

  const accept = async () => {
    if (!name.trim()) {
      setProblem({ message: 'Enter the company name.' });
      return;
    }
    setBusy(true);
    setProblem(null);
    try {
      if (follow) {
        const result = await api.watchlist.add({ body: body() });
        window.dispatchEvent(new Event('vero:watchlist'));
        router.push(`/onboarding/scanning?company=${result.company.id}&scan=${result.scanId}`);
        return;
      }
      if (adding && session.root) {
        const added = await api.companies.addRelated({ params: { companyId: session.root.id }, body: body() });
        await session.refresh();
        router.push(`/onboarding/questions?company=${added.id}&added=1`);
        return;
      }
      const company = await api.companies.create({ body: body() });
      for (const option of linked) {
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
      const failure = asApiError(error);
      setProblem({ message: failure.message, code: failure.code });
      setBusy(false);
    }
  };

  const showSample = sample || (related ?? []).some((option) => option.sample);
  const registers = 1 + linked.length;
  const ownHref = (() => {
    const next = new URLSearchParams(params.toString());
    next.delete('follow');
    if (session.root) next.set('add', '1');
    return `/onboarding/confirm?${next.toString()}`;
  })();

  return (
    <div className="pg-scan">
      <Hero>
        <div className="pagehead">
          <div>
            <div className="mono kick">
              <Scramble text={follow ? 'Follow a company' : 'Step 1 of 4'} /> · <b><Scramble text={manual ? 'Enter the company' : 'Confirm the company'} delay={120} /></b>
            </div>
            <h1 className="disp">
              <Words text={manual ? (follow ? 'Tell us about the company' : 'Tell us about your company') : 'Is this the right company?'} />
            </h1>
            <div className="meta">
              <span>{manual ? `Entered by you, checked with ${register.register} when Vero can` : `Found at ${where}`}</span>
              <span title={coverage.sentence}>
                {LEVEL[coverage.level]}, {register.label}
              </span>
            </div>
          </div>
          <div className="acts">
            <TLink className="btn btn-g" href={searchHref}>
              Back to search
            </TLink>
          </div>
        </div>
        {showSample ? <SampleNote /> : null}

        <section className="r1">
          <div className="mod gl recd">
            <div className="art">
              <RecordArt numberLabel={register.numberLabel} number={number.trim() || null} formed={pixelDate(formed)} />
            </div>
            <div className="d">
              <div className="mh">
                <h2>{manual ? 'Company details' : 'Registry record'}</h2>
                <span className="sub">{manual ? 'Marked as coming from you' : where}</span>
              </div>
              {manual ? (
                <>
                  <div className="field">
                    <label htmlFor="legal-name">Company name</label>
                    <input className="input" id="legal-name" type="text" autoComplete="organization" value={name} onChange={(event) => setName(event.target.value)} />
                  </div>
                  <div className="field">
                    <label htmlFor="reg-number">{register.numberLabel} (optional)</label>
                    <input className="input" id="reg-number" type="text" autoComplete="off" placeholder={register.numberExample ? `For example ${register.numberExample}` : undefined} value={number} onChange={(event) => setNumber(event.target.value)} />
                  </div>
                  <div className="rnote">Vero says these came from you, and checks them with the register when it can.</div>
                </>
              ) : (
                <>
                  <div className="name">{name}</div>
                  <dl>
                    {type ? (
                      <>
                        <dt>Type</dt>
                        <dd>{entityWords(type)}</dd>
                      </>
                    ) : null}
                    {number ? (
                      <>
                        <dt>{register.numberLabel}</dt>
                        <dd className="num">{number}</dd>
                      </>
                    ) : null}
                    {formed ? (
                      <>
                        <dt>Formed</dt>
                        <dd className="num">{longDate(formed)}</dd>
                      </>
                    ) : null}
                    {agent ? (
                      <>
                        <dt>Registered agent</dt>
                        <dd>{agent}</dd>
                      </>
                    ) : null}
                    <dt>Registered in</dt>
                    <dd>{countryLong(country)}</dd>
                  </dl>
                  <div className="rnote">This is the public record as the registry holds it today. Vero doesn&apos;t change it.</div>
                </>
              )}
            </div>
          </div>

          <div className="mod next">
            <div className="k">{follow ? 'Ready to follow' : 'Ready to scan'}</div>
            <h3>
              {shortName}
              {linked.length > 0 ? ` and ${linked.length} linked ${linked.length === 1 ? 'company' : 'companies'}` : ''}
            </h3>
            <p>
              {follow
                ? 'Vero reads its public records: the register, sanctions lists and its website. A company you follow is read-only, so there are no questions or documents.'
                : `Vero will read ${registers === 1 ? register.register : `${registers} registers`} and the other sources that apply, plus any documents you share.`}
            </p>
            <div className="ct">
              {follow && watchlist ? (
                <>
                  <CountUp className="pixel" value={watchlist.used} />
                  <span>
                    of {watchlist.limit} follows used
                    <br />
                    on your plan
                  </span>
                </>
              ) : (
                <>
                  <CountUp className="pixel" value={registers} />
                  <span>
                    {registers === 1 ? 'register' : 'registers'} read
                    <br />
                    before {follow ? 'its' : 'your'} first result
                  </span>
                </>
              )}
            </div>
            {problem ? (
              <p className="formerror" role="alert" style={{ marginTop: 14 }}>
                {problem.message} {problem.code === 'follow_limit_reached' ? <PlanLink /> : null}
              </p>
            ) : null}
            <button className="btn" type="button" disabled={busy} onClick={() => void accept()}>
              {busy ? 'Saving' : follow ? 'Follow and scan' : manual ? 'Continue' : "Yes, that's us"}
            </button>
            <div className="alt">
              {follow ? (
                <>
                  Is it yours? <TLink href={ownHref}>{session.root ? 'Add it to your group' : 'Scan it as your company'}</TLink>
                </>
              ) : (
                <>
                  Not the right one? <TLink href={searchHref}>Search again</TLink>
                </>
              )}
            </div>
          </div>
        </section>
      </Hero>

      <After>
        <section className="r3b">
          <Reveal className="mod" i={0}>
            <div className="mh">
              <h2>Linked companies</h2>
              {follow || manual || adding ? null : <span className="sub">Found by name on the other registers</span>}
            </div>
            {follow || manual || adding ? (
              <p className="lnone">
                <b>{follow ? 'Followed on its own' : adding ? 'Joins your group' : 'Added later'}</b>
                {follow
                  ? 'A company you follow is scanned on its own. Follow its subsidiaries separately if you want them too.'
                  : adding
                    ? `It will sit in your group under ${session.root?.legalName ?? 'your company'}.`
                    : 'You can add subsidiaries and other companies in your group later.'}
              </p>
            ) : related === null ? (
              <div className="lk" aria-busy="true">
                {[0, 1].map((key) => (
                  <div className="lc" key={key}>
                    <div>
                      <div className="skel" style={{ height: 14, width: '50%' }} />
                      <div className="skel" style={{ height: 10, width: '30%', marginTop: 8 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : related.length === 0 ? (
              <p className="lnone">
                <b>No linked companies found</b>
                Vero searched the other registers with full coverage and found no clear match. You can add subsidiaries later.
              </p>
            ) : (
              <>
                <div className="lk">
                  {related.map((option) => (
                    <div className={`lc${option.on ? '' : ' off'}`} key={option.country}>
                      <div className="nm">
                        <b>{option.name}</b>
                        <small>
                          {option.sourceName}
                          {option.number ? ` · ${option.number}` : ''}
                        </small>
                        <div className="why">Include it to check its own record and filings at {option.sourceName}. Only include it if it really is part of your group.</div>
                      </div>
                      <div className="own">
                        <em>{option.on ? 'Included' : 'Left out'}</em>
                        {countryLong(option.country)}
                      </div>
                      <button
                        className="switch"
                        type="button"
                        role="switch"
                        aria-checked={option.on}
                        aria-label={`Include ${option.name}`}
                        onClick={() => setRelated((list) => (list ?? []).map((item) => (item.country === option.country ? { ...item, on: !item.on } : item)))}
                      />
                    </div>
                  ))}
                </div>
                <div className="lnote">You can add or remove linked companies later. Each one is scanned with its own register.</div>
              </>
            )}
          </Reveal>

          <Reveal className="mod" i={1}>
            <div className="mh">
              <h2>What the scan covers</h2>
            </div>
            <div className="cv">
              <div className="r">
                <div>
                  <b>{coverage.level === 'international' ? 'International rules' : where}</b>
                  <small>{coverage.sentence}</small>
                </div>
                <span className="n">{LEVEL[coverage.level]}</span>
              </div>
              {(related ?? []).map((option) => (
                <div className={`r${option.on ? '' : ' off'}`} key={option.country}>
                  <div>
                    <b>{option.sourceName}</b>
                    <small>{option.name}</small>
                  </div>
                  <span className="n">{option.on ? 'Included' : 'Left out'}</span>
                </div>
              ))}
              <div className="r">
                <div>
                  <b>Sanctions lists</b>
                  <small>{shortName}</small>
                </div>
                <span className="n">Every company</span>
              </div>
              <div className="r">
                <div>
                  <b>{follow ? 'Website' : 'Documents and website'}</b>
                  <small>{follow ? 'Privacy notice and terms on its website' : 'Contracts, share register, privacy notice'}</small>
                </div>
                <span className="n">{follow ? 'Public' : 'When you share them'}</span>
              </div>
            </div>
            <div className="tot">
              <span>Registers in this scan</span>
              <CountUp className="pixel" value={registers} />
            </div>
          </Reveal>
        </section>
      </After>
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
