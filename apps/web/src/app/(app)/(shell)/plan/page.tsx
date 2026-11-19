'use client';

import type { Plan } from '@vero/shared';
import { Chevron, ErrorState, Loading } from '@/components/Bits';
import { useSession } from '@/components/Session';
import { TLink } from '@/components/TLink';
import { VFill } from '@/components/V3D';
import { useState } from 'react';
import { api, asApiError } from '@/lib/api';
import { scoreLevel, scoreWords } from '@/lib/format';
import { COMPARE_ROWS, PLAN_CHANGE, planSay, priceWords, type CompareCell } from '@/lib/plan-words';
import { useResource } from '@/lib/useResource';

function Tick({ plan }: { plan: string }) {
  return (
    <>
      <svg className="tk" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m5 12.5 4.5 4.5L19 7.5" />
      </svg>
      <span className="sr-only">{plan}: included</span>
    </>
  );
}

function Cell({ plan, cell, growth }: { plan: Plan; cell: CompareCell; growth: boolean }) {
  const classes = ['c', growth && cell.word !== 'No' ? 'g' : '', cell.word === 'No' ? 'no' : ''].filter(Boolean).join(' ');
  return (
    <span className={classes} data-plan={plan.code}>
      {cell.included ? (
        <Tick plan={plan.name} />
      ) : (
        <>
          <span className="sr-only">{plan.name}: </span>
          {cell.word}
        </>
      )}
    </span>
  );
}

/** Where someone goes to ask. Nothing changes until our team changes it. */
function PlanAction({ plan, current, hasResult, primary }: { plan: Plan; current: boolean; hasResult: boolean; primary: boolean }) {
  const className = `btn ${primary ? 'btn-ink' : 'btn-line'}`;
  if (current) {
    if (plan.code !== 'free') return null;
    return (
      <TLink className={className} href="/">
        Stay on Free
      </TLink>
    );
  }
  if (!hasResult) {
    return (
      <TLink className={className} href="/onboarding/company">
        Start with your first scan
      </TLink>
    );
  }
  return <CheckoutButton className={className} plan={plan} />;
}

/** Stripe's own checkout. The plan changes only when Stripe tells us the payment went through. */
function CheckoutButton({ className, plan }: { className: string; plan: Plan }) {
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  if (plan.code === 'free') return null;
  const code = plan.code;
  const start = () => {
    setBusy(true);
    setProblem(null);
    api.billing.checkout({ body: { plan: code } }).then(
      ({ url }) => window.location.assign(url),
      (error: unknown) => {
        setProblem(asApiError(error).message);
        setBusy(false);
      },
    );
  };
  return (
    <>
      <button className={className} type="button" disabled={busy} onClick={start} data-testid={`checkout-${code}`}>
        {busy ? 'Opening checkout' : `Move to ${plan.name}`}
      </button>
      {problem ? (
        <p className="small" role="alert">
          {problem}
        </p>
      ) : null}
    </>
  );
}

export default function PlanPage() {
  const session = useSession();
  const resource = useResource(() => api.plans.list(), []);
  const data = resource.data;

  if (resource.loading && !data) {
    return (
      <main style={{ display: 'contents' }}>
        <Loading what="Getting the plans" />
      </main>
    );
  }
  if (resource.error && !data) {
    return (
      <main style={{ display: 'contents' }}>
        <ErrorState error={resource.error} onRetry={resource.reload} />
      </main>
    );
  }
  if (!data) return null;

  const overview = session.overview;
  const showScore = session.hasResult && overview !== null;
  const growthIsCurrent = data.current === 'growth';

  return (
    <main className="wrap">
      <section className="sec stack g48" data-testid="plan-page" data-current={data.current}>
        <div className="stack g16">
          <h1 className="t-1">Choose how far you want to go</h1>
          <p className="lead" style={{ maxWidth: '34em' }}>
            Free shows you where you stand. Paid plans read your documents and show you everything.
          </p>
        </div>

        <div className="next band" data-testid="plan-change">
          <div className="stack g4">
            <p className="t-3">{PLAN_CHANGE.title}</p>
            <p className="quiet">{PLAN_CHANGE.body}</p>
          </div>
        </div>

        <div className="plans">
          {data.plans.map((plan) => {
            const current = plan.code === data.current;
            const growth = plan.code === 'growth';
            return (
              <div className={`plan${growth ? ' next growth' : ''}`} key={plan.code} data-testid="plan-card" data-plan={plan.code}>
                {growth ? (
                  <div className="ghead">
                    <div className="stack g8">
                      {current ? <span className="st none">Your plan</span> : <span className="st" style={{ color: 'var(--rose-deep)' }}>Recommended</span>}
                      <h2 className="bigname">{plan.name}</h2>
                    </div>
                    {showScore ? <VFill value={scoreLevel(overview.score)} /> : null}
                  </div>
                ) : (
                  <div className="nameline">
                    <h2 className="t-2">{plan.name}</h2>
                    {current ? <span className="st none">Your plan</span> : null}
                  </div>
                )}
                <p className={growth ? 'say' : 'quiet say'}>{planSay(plan.code)}</p>
                {growth && showScore ? (
                  <p className="livescore" data-testid="plan-score">
                    <span className="bignum">{scoreWords(overview.score)}</span>
                    <span className="quiet">{growthIsCurrent ? 'is your score today. It moves as you fix things.' : "is your read today. On Growth you'd see the exact number, and it moves as you fix things."}</span>
                  </p>
                ) : null}
                <p className="price" data-testid="plan-price">
                  {priceWords(plan)}
                </p>
                <PlanAction plan={plan} current={current} hasResult={session.hasResult} primary={growth} />
              </div>
            );
          })}
        </div>

        <div className="stack g16">
          <h2 className="t-2">Compare what you get</h2>
          <div>
            <div className="cmp cmphead" aria-hidden="true">
              <span />
              {data.plans.map((plan) => (
                <span key={plan.code} className={plan.code === 'growth' ? 'g' : undefined}>
                  {plan.name}
                </span>
              ))}
              <span />
            </div>
            <div className="rows cmps">
              {COMPARE_ROWS.map((row) => (
                <details className="more" name="cmp" key={row.key} data-testid="compare-row" data-key={row.key}>
                  <summary className="row cmp">
                    <span className="row-t">{row.label}</span>
                    {data.plans.map((plan) => (
                      <Cell key={plan.code} plan={plan} cell={row.cell(plan.entitlements)} growth={plan.code === 'growth'} />
                    ))}
                    <Chevron />
                  </summary>
                  <div className="more-body cmpbody">
                    <p className="quiet">{row.body}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>

      </section>
    </main>
  );
}
