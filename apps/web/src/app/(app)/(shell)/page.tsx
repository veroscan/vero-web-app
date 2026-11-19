'use client';

import type { CSSProperties } from 'react';
import { Icon } from '@/components/Icon';
import { Scramble, Words } from '@/components/Motion';
import { OverviewBody } from '@/components/overview/OverviewBody';
import { useSession } from '@/components/Session';
import { Hero } from '@/components/Shell';
import { TLink } from '@/components/TLink';

const STEPS = [
  { title: 'Tell Vero about the company', body: 'Find it on its official register, in any country, then answer a few short questions.' },
  { title: 'Vero checks the records', body: 'It reads the registers, sanctions lists and the website. You can watch each check as it happens.' },
  { title: 'You get a score and one thing to fix', body: 'A score out of 100 in plain English, what it rests on, and the fix that matters most.' },
];

/** Before the first result: what a scan does, and the one way in. */
function HomeEmpty() {
  const session = useSession();
  const started = session.root !== null;
  const firstName = session.me.user.name?.trim().split(/\s+/)[0];
  return (
    <div className="pg-ov">
      <Hero>
        <div className="pagehead">
          <div>
            <div className="mono kick">
              <Scramble text={firstName ? `Welcome, ${firstName}` : 'Welcome to Vero'} /> · <b><Scramble text="Scan / Score / Fix" delay={120} /></b>
            </div>
            <h1 className="disp">
              <Words text="Let's see where your company stands." />
            </h1>
            <div className="meta">
              <span>{started ? `You've started on ${session.root?.legalName ?? 'your company'}` : 'A few minutes, no documents needed'}</span>
            </div>
          </div>
        </div>
        <section className="r1">
          <div className="mod health ov-steps">
            <div className="l">
              <div className="mh" style={{ padding: 0 }}>
                <h2>Legal health</h2>
              </div>
              <div className="big">
                <span className="pixel" role="img" aria-label="Not scored yet">
                  --
                </span>
                <small>/ 100</small>
              </div>
              <div className="verdict">Your score shows here after the first scan.</div>
            </div>
            <ol className="ov-stepl">
              {STEPS.map((step, index) => (
                <li key={step.title} style={{ '--i': index } as CSSProperties}>
                  <span className="pixel">{index + 1}</span>
                  <div>
                    <b>{step.title}</b>
                    <p>{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="mod next">
            <div className="k">Start here</div>
            <h3>{started ? 'Carry on with your scan' : 'Scan your company'}</h3>
            <p>{started ? 'Pick up where you left off. Your answers so far are saved.' : 'Vero finds the company on its register and starts checking straight away.'}</p>
            <TLink className="btn" id="scan" href={started ? '/onboarding/questions' : '/onboarding/company'} style={{ marginTop: 'auto' }}>
              <Icon name="scan" />
              {started ? 'Carry on' : 'Scan your company'}
            </TLink>
          </div>
        </section>
      </Hero>
    </div>
  );
}

export default function HomePage() {
  const session = useSession();
  const { overview, root } = session;
  if (!overview || !root || !session.hasResult) return <HomeEmpty />;
  return <OverviewBody company={root} related={session.related} overview={overview} onScanned={() => void session.refresh()} />;
}
