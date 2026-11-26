'use client';

import '@/app/styles/pages/scan.css';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { SampleNote } from '@/components/Bits';
import { Icon } from '@/components/Icon';
import { Reveal, Scramble, Words } from '@/components/Motion';
import { useSession } from '@/components/Session';
import { After, Hero } from '@/components/Shell';
import { TLink } from '@/components/TLink';
import { useToast } from '@/components/Toast';
import { api, asApiError } from '@/lib/api';
import { confirmHref, manualHref } from '@/lib/candidate';
import { useResource } from '@/lib/useResource';
import { isCountry, registerFor } from '@/lib/words';
import { CoverageLine } from '@/components/scan/Finder';

const LOOKUP_WORDS = { requested: 'Waiting for a person', in_progress: 'Being looked up', completed: 'Finished', cancelled: 'Cancelled' };

function Way({ title, text, act, href, onClick, expanded }: { title: string; text: string; act: string; href?: string; onClick?: () => void; expanded?: boolean }) {
  const body: ReactNode = (
    <>
      <span>
        <b>{title}</b>
        <small>{text}</small>
      </span>
      <span className="act">
        {act}
        <Icon name="chev" />
      </span>
    </>
  );
  return href ? (
    <TLink className="way" href={href}>
      {body}
    </TLink>
  ) : (
    <button className="way" type="button" onClick={onClick} aria-expanded={expanded}>
      {body}
    </button>
  );
}

function NotFound() {
  const session = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const rawCountry = params.get('country');
  const query = params.get('q') ?? '';
  const follow = params.get('follow') === '1';
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
  const toast = useToast();
  const numberBox = useRef<HTMLInputElement>(null);
  const lookupForm = useRef<HTMLFormElement>(null);
  const askButton = useRef<HTMLDivElement>(null);
  // The form opens under the row that asked for it, with the keyboard already in its first box.
  useEffect(() => {
    if (asking) lookupForm.current?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: false });
  }, [asking]);
  const requests = useResource(() => api.registry.lookupRequests(), []);
  const country = isCountry(rawCountry) ? rawCountry : null;
  const adding = params.get('add') === '1' && session.root !== null;
  const searchHref = follow ? '/scan' : adding ? '/onboarding/company?add=1' : '/onboarding/company';

  if (!country) {
    return (
      <div className="pg-scan">
        <Hero>
          <div className="pagehead">
            <div>
              <h1 className="disp">Choose a country first</h1>
            </div>
            <div className="acts">
              <TLink className="btn btn-p" href={searchHref}>
                Find the company
              </TLink>
            </div>
          </div>
        </Hero>
      </div>
    );
  }
  const register = registerFor(country);
  const where = params.get('source') ?? register.register;

  const search = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    const value = number.trim();
    if (!value || !new RegExp(`^(?:${register.numberPattern})$`).test(value)) {
      setProblem(value ? register.numberMessage : `Type the ${register.numberLabel.toLowerCase()} first.`);
      numberBox.current?.focus();
      return;
    }
    setBusy(true);
    setProblem(null);
    try {
      const found = await api.registry.search({ query: { country, q: number.trim() } });
      setSample(found.sampleData);
      const first = found.candidates[0];
      if (first) router.push(confirmHref(country, first, found, adding, follow));
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
      router.push(searchHref);
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
    if (lookupBusy) return;
    if (!lookupName.trim()) {
      setLookupProblem('Enter the company name.');
      lookupForm.current?.querySelector<HTMLInputElement>('input')?.focus();
      return;
    }
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
      toast('Sent. A person will look it up.');
      askButton.current?.querySelector<HTMLButtonElement>('button')?.focus();
    } catch (error) {
      setLookupProblem(asApiError(error).message);
    } finally {
      setLookupBusy(false);
    }
  };

  const title = query ? `We couldn't find "${query}" at ${where}` : `Let's look for the company at ${where}`;
  const lookups = requests.data?.requests ?? [];
  return (
    <div className="pg-scan">
      <Hero>
        <div className="find">
          <div className="mono kick">
            <Scramble text="Not found" /> · <b><Scramble text="Search another way" delay={120} /></b>
          </div>
          <h1>
            <Words key={title} text={title} />
          </h1>
          <p className="lede">That&apos;s usually a small spelling difference, or the company is registered under another name. It doesn&apos;t mean {follow ? 'the' : 'your'} company isn&apos;t registered.</p>
          <form className={`sbox one${problem ? ' bad' : ''}`} role="search" noValidate onSubmit={(event) => void search(event)}>
            <Icon name="search" />
            <label className="sr-only" htmlFor="num">
              Try your {register.numberLabel.toLowerCase()}
            </label>
            <input ref={numberBox} id="num" type="text" enterKeyHint="search" autoCapitalize="characters" autoCorrect="off" spellCheck={false} aria-describedby={problem ? 'num-problem' : undefined} aria-invalid={problem ? true : undefined} placeholder={register.numberExample ? `Try the ${register.numberLabel.toLowerCase()}, like ${register.numberExample}` : `Try the ${register.numberLabel.toLowerCase()}`} autoComplete="off" value={number} onChange={(event) => { setNumber(event.target.value); setProblem(null); }} />
            <button className="go" type="submit" aria-busy={busy || undefined}>
              {busy ? 'Searching' : 'Search'}
            </button>
          </form>
          {problem ? (
            <p className="serr" id="num-problem" role="alert">
              {problem}
            </p>
          ) : null}
          <p className="where">{register.numberWhere}</p>
          {sample ? <SampleNote /> : null}
        </div>
      </Hero>

      <After>
        <section className="r3b">
          <Reveal as="section" className="mod" i={0}>
            <div className="mh">
              <h2>Other ways to find it</h2>
            </div>
            <div className="ways">
              <Way title="It's registered in another country" text="Go back and choose the country where it's registered" act="Change" href={searchHref} />
              {follow ? null : <Way title="We haven't registered yet" text="You can still get a score, and Vero shows you what to set up first" act="Continue" onClick={() => void notRegistered()} />}
              <Way title="I'll enter the details myself" text="Vero says these came from you, and checks them when it can" act="Enter them" href={manualHref(country, query, adding, follow)} />
              <div ref={askButton}>
                <Way title="I'm sure it's registered" text="Tell us the details and a person will look it up" act={asking ? 'Close' : 'Ask us'} onClick={() => setAsking((value) => !value)} expanded={asking} />
              </div>
            </div>
            {asking ? (
              <form
                ref={lookupForm}
                className="lookupf"
                noValidate
                onSubmit={(event) => void askPerson(event)}
                onKeyDown={(event) => {
                  if (event.key !== 'Escape') return;
                  setAsking(false);
                  askButton.current?.querySelector<HTMLButtonElement>('button')?.focus();
                }}
                data-testid="lookup-form"
              >
                <div className="field">
                  <label htmlFor="lookup-name">Company name</label>
                  <input className="input" id="lookup-name" type="text" autoComplete="organization" value={lookupName} onChange={(event) => { setLookupName(event.target.value); setLookupProblem(null); }} />
                </div>
                <div className="field">
                  <label htmlFor="lookup-number">{register.numberLabel} (optional)</label>
                  <input className="input" id="lookup-number" type="text" autoComplete="off" value={lookupNumber} onChange={(event) => setLookupNumber(event.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="lookup-note">Anything that would help (optional)</label>
                  <textarea className="input" id="lookup-note" rows={3} maxLength={1000} value={lookupNote} onChange={(event) => setLookupNote(event.target.value)} />
                </div>
                {lookupProblem ? (
                  <p className="formerror" role="alert">
                    {lookupProblem}
                  </p>
                ) : null}
                <div className="lookupa">
                  <button className="btn btn-p" type="submit" aria-busy={lookupBusy || undefined}>
                    {lookupBusy ? 'Sending' : 'Ask a person to look it up'}
                  </button>
                  <button
                    className="btn btn-g"
                    type="button"
                    onClick={() => {
                      setAsking(false);
                      askButton.current?.querySelector<HTMLButtonElement>('button')?.focus();
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : null}
          </Reveal>

          <Reveal as="section" className="mod" i={1}>
            <div className="mh">
              <h2>What Vero can check there</h2>
            </div>
            <div className="cvl">
              <CoverageLine country={country} />
            </div>
            {lookups.length > 0 ? (
              <div data-testid="lookup-requests">
                <div className="mh" style={{ paddingTop: 8 }}>
                  <h2>What you&apos;ve asked us to look up</h2>
                </div>
                <ul className="lkr rows-in">
                  {lookups.map((request, at) => (
                    <li key={request.id} style={{ '--r': at } as CSSProperties}>
                      <b>{request.legalName}</b>
                      <span className="st2 tone-none">{LOOKUP_WORDS[request.status]}</span>
                    </li>
                  ))}
                </ul>
                <p className="lnote">Vero tells you what it finds under What&apos;s new.</p>
              </div>
            ) : null}
          </Reveal>
        </section>
      </After>
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
