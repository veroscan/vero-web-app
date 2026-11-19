'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState, type FormEvent } from 'react';
import { BlurIn, SampleNote } from '@/components/Bits';
import { useSession } from '@/components/Session';
import { OnboardingBar } from '@/components/Shell';
import { TLink } from '@/components/TLink';
import { VFill } from '@/components/V3D';
import { api, asApiError } from '@/lib/api';
import { useResource } from '@/lib/useResource';
import { confirmHref, manualHref } from '@/lib/candidate';
import { isCountry, registerFor } from '@/lib/words';

const LOOKUP_WORDS = { requested: 'Waiting for a person', in_progress: 'Being looked up', completed: 'Finished', cancelled: 'Cancelled' };

function NotFound() {
  const session = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const rawCountry = params.get('country');
  const query = params.get('q') ?? '';
  const [number, setNumber] = useState('');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [sample, setSample] = useState(false);
  const [asking, setAsking] = useState(false);
  const [lookupName, setLookupName] = useState(query);
  const [lookupNumber, setLookupNumber] = useState('');
  const [lookupNote, setLookupNote] = useState('');
  const [lookupBusy, setLookupBusy] = useState(false);
  const [lookupProblem, setLookupProblem] = useState<string | null>(null);
  const requests = useResource(() => api.registry.lookupRequests(), []);
  const country = isCountry(rawCountry) ? rawCountry : null;
  const adding = params.get('add') === '1' && session.root !== null;

  if (!country) {
    return (
      <div className="vs">
        <OnboardingBar step="Step 1 of 3" />
        <main className="state">
          <h1 className="t-2">Choose a country first</h1>
          <TLink className="btn btn-ink btn-sm" href="/onboarding/company">
            Find your company
          </TLink>
        </main>
      </div>
    );
  }
  const register = registerFor(country);
  const where = params.get('source') ?? register.register;

  const search = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setProblem(null);
    try {
      const found = await api.registry.search({ query: { country, q: number.trim() } });
      setSample(found.sampleData);
      const first = found.candidates[0];
      if (first) router.push(confirmHref(country, first, found, adding));
      else setProblem(found.message);
    } catch (error) {
      setProblem(asApiError(error).message);
    } finally {
      setBusy(false);
    }
  };

  /** Not registered yet: uses the name they searched for, and asks if there wasn't one. */
  const notRegistered = async () => {
    if (!query.trim()) {
      router.push('/onboarding/company');
      return;
    }
    setProblem(null);
    try {
      const body = { legalName: query.trim(), incorporationCountry: country, preIncorporation: true };
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
    }
  };

  const askPerson = async (event: FormEvent) => {
    event.preventDefault();
    setLookupBusy(true);
    setLookupProblem(null);
    try {
      await api.registry.requestLookup({
        body: {
          country,
          legalName: lookupName.trim(),
          ...(lookupNumber.trim() ? { registrationNumber: lookupNumber.trim() } : {}),
          ...(lookupNote.trim() ? { note: lookupNote.trim() } : {}),
        },
      });
      setAsking(false);
      requests.reload();
    } catch (error) {
      setLookupProblem(asApiError(error).message);
    } finally {
      setLookupBusy(false);
    }
  };

  const title = query ? `We couldn't find "${query}" at ${where}` : `Let's look for your company at ${where}`;
  return (
    <div className="vs">
      <OnboardingBar step="Step 1 of 3" />
      <main className="wrap">
        <section className="nf">
          <div className="stack g20">
            <h1>
              <BlurIn key={title} text={title} delay={0.1} />
            </h1>
            <p className="lead" style={{ maxWidth: '32em' }}>
              That&apos;s usually a small spelling difference, or the company is registered under another name. It doesn&apos;t mean your company isn&apos;t registered.
            </p>
          </div>
          <VFill value={0} className="gauge emptyv" label="An empty V. There's nothing to score until we find your company." />
        </section>

        <section className="stack g32" style={{ paddingBottom: 64, maxWidth: 720 }}>
          {sample ? <SampleNote /> : null}
          <form className="field" onSubmit={(event) => void search(event)}>
            <label htmlFor="num">Try your {register.numberLabel.toLowerCase()}</label>
            <div className="lookup">
              <div className="vwrap">
                <input className="input" id="num" type="text" required pattern={register.numberPattern} placeholder={`For example ${register.numberExample}`} autoComplete="off" value={number} onChange={(event) => setNumber(event.target.value)} />
                <svg className="okmark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m5 12.5 4.5 4.5L19 7.5" />
                </svg>
              </div>
              <button className="btn btn-ink" type="submit" disabled={busy}>
                {busy ? 'Searching' : 'Search'}
              </button>
            </div>
            <p className="msg hint">{register.numberWhere}</p>
            <p className="msg bad">{register.numberMessage}</p>
            {problem ? (
              <p className="formerror" role="alert">
                {problem}
              </p>
            ) : null}
          </form>

          <div className="rows">
            <TLink className="row r-act" href="/onboarding/company">
              <span className="stack g4">
                <span className="row-t">It&apos;s registered in another country</span>
                <span className="row-s">Go back and choose Delaware, the UK or Nigeria</span>
              </span>
              <span className="link small">Change</span>
            </TLink>
            <button className="row r-act" type="button" style={{ width: '100%', background: 'none', borderWidth: '0 0 1px', borderStyle: 'solid', borderColor: 'var(--line)', font: 'inherit', color: 'inherit', textAlign: 'left', cursor: 'pointer' }} onClick={() => void notRegistered()}>
              <span className="stack g4">
                <span className="row-t">We haven&apos;t registered yet</span>
                <span className="row-s">You can still get a score, and we&apos;ll show you what to set up first</span>
              </span>
              <span className="link small">Continue</span>
            </button>
            <TLink className="row r-act" href={manualHref(country, query, adding)}>
              <span className="stack g4">
                <span className="row-t">I&apos;ll enter the details myself</span>
                <span className="row-s">We&apos;ll say these came from you, and check them when we can</span>
              </span>
              <span className="link small">Enter them</span>
            </TLink>
            <button className="row r-act" type="button" aria-expanded={asking} style={{ width: '100%', background: 'none', borderWidth: '0 0 1px', borderStyle: 'solid', borderColor: 'var(--line)', font: 'inherit', color: 'inherit', textAlign: 'left', cursor: 'pointer' }} onClick={() => setAsking((value) => !value)}>
              <span className="stack g4">
                <span className="row-t">I&apos;m sure it&apos;s registered</span>
                <span className="row-s">Tell us the details and a person will look it up</span>
              </span>
              <span className="link small">Ask us</span>
            </button>
          </div>

          {asking ? (
            <form className="stack g16" onSubmit={(event) => void askPerson(event)} data-testid="lookup-form">
              <div className="field">
                <label htmlFor="lookup-name">Company name</label>
                <input className="input" id="lookup-name" type="text" required value={lookupName} onChange={(event) => setLookupName(event.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="lookup-number">{register.numberLabel} (optional)</label>
                <input className="input" id="lookup-number" type="text" autoComplete="off" value={lookupNumber} onChange={(event) => setLookupNumber(event.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="lookup-note">Anything that would help (optional)</label>
                <textarea className="input" id="lookup-note" rows={3} value={lookupNote} onChange={(event) => setLookupNote(event.target.value)} />
              </div>
              {lookupProblem ? (
                <p className="formerror" role="alert">
                  {lookupProblem}
                </p>
              ) : null}
              <div>
                <button className="btn btn-ink btn-sm" type="submit" disabled={lookupBusy}>
                  {lookupBusy ? 'Sending' : 'Ask a person to look it up'}
                </button>
              </div>
            </form>
          ) : null}

          {requests.data && requests.data.requests.length > 0 ? (
            <div className="stack g12" data-testid="lookup-requests">
              <h2 className="t-3">What you&apos;ve asked us to look up</h2>
              <ul className="rows">
                {requests.data.requests.map((request) => (
                  <li className="row r-act" key={request.id}>
                    <span className="row-t">{request.legalName}</span>
                    <span className="st none">{LOOKUP_WORDS[request.status]}</span>
                  </li>
                ))}
              </ul>
              <p className="small">We&apos;ll tell you what we find under What&apos;s new.</p>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <NotFound />
    </Suspense>
  );
}
