'use client';

import '@/app/styles/pages/plan.css';
import type { Plan } from '@vero/shared';
import { useState, type CSSProperties } from 'react';
import { ErrorState, Loading } from '@/components/Bits';
import { Icon } from '@/components/Icon';
import { CountUp, Reveal, Scramble, Words } from '@/components/Motion';
import { useSession } from '@/components/Session';
import { After, Hero, Plain, useWatchlist } from '@/components/Shell';
import { TLink } from '@/components/TLink';
import { api, asApiError } from '@/lib/api';
import { roleCan } from '@/lib/entitlements';
import { plural, scoreWords } from '@/lib/format';
import { COMPARE_ROWS, PLAN_CHANGE, planSay, priceWords, type CompareCell } from '@/lib/plan-words';
import { useResource } from '@/lib/useResource';

function Cell({ plan, cell }: { plan: Plan; cell: CompareCell }) {
  if (cell.included) {
    return (
      <>
        <Icon name="check" />
        <span className="sr-only">{plan.name}: included</span>
      </>
    );
  }
  return (
    <>
      <span className="sr-only">{plan.name}: </span>
      <span className={cell.word === 'No' ? 'no' : cell.word === 'Planned' ? 'pl' : undefined}>{cell.word === 'No' ? 'Not included' : cell.word}</span>
    </>
  );
}

/** Stripe's own checkout. The plan changes only when Stripe tells us the payment went through. */
function CheckoutButton({ plan, primary }: { plan: Plan; primary: boolean }) {
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
      <button className={`btn ${primary ? 'btn-p' : 'btn-g'}`} type="button" disabled={busy} onClick={start} data-testid={`checkout-${code}`}>
        {busy ? 'Opening checkout' : `Move to ${plan.name}`}
      </button>
      {problem ? (
        <p className="probl" role="alert">
          {problem}
        </p>
      ) : null}
    </>
  );
}

function PlanAction({ plan, current, hasResult, primary }: { plan: Plan; current: boolean; hasResult: boolean; primary: boolean }) {
  if (current) return <span className="curb">Your plan</span>;
  if (plan.code === 'free') return <span className="curb quiet">Manage it in billing</span>;
  if (!hasResult) {
    return (
      <TLink className={`btn ${primary ? 'btn-p' : 'btn-g'}`} href="/onboarding/company">
        Start with your first scan
      </TLink>
    );
  }
  return <CheckoutButton plan={plan} primary={primary} />;
}

/** Stripe's billing portal: invoices, the card on file and cancelling all live there. */
function PortalButton({ className }: { className: string }) {
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const open = () => {
    setBusy(true);
    setProblem(null);
    api.billing.portal().then(
      ({ url }) => window.location.assign(url),
      (error: unknown) => {
        setProblem(asApiError(error).message);
        setBusy(false);
      },
    );
  };
  return (
    <>
      <button className={className} type="button" disabled={busy} onClick={open} data-testid="billing-portal">
        {busy ? 'Opening billing' : 'Open billing'}
      </button>
      {problem ? (
        <p className="probl" role="alert">
          {problem}
        </p>
      ) : null}
    </>
  );
}

function Blocks({ used, limit }: { used: number; limit: number }) {
  const count = Math.min(limit, 50);
  const on = Math.round((Math.min(used, limit) / limit) * count);
  return (
    <div className="bk" style={{ gridTemplateColumns: `repeat(${count},1fr)` }} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <i key={index} className={`grow${index < on ? ' on' : ''}`} style={{ '--i': index } as CSSProperties} />
      ))}
    </div>
  );
}

export default function PlanPage() {
  const session = useSession();
  const watchlist = useWatchlist();
  const resource = useResource(() => api.plans.list(), []);
  const members = useResource(() => api.members.list().catch(() => null), []);
  const data = resource.data;

  if (resource.loading && !data) {
    return (
      <Plain>
        <Loading what="Getting the plans" />
      </Plain>
    );
  }
  if (resource.error && !data) {
    return (
      <Plain>
        <ErrorState error={resource.error} onRetry={resource.reload} />
      </Plain>
    );
  }
  if (!data) return null;

  const overview = session.overview;
  const showScore = session.hasResult && overview !== null;
  const current = data.plans.find((plan) => plan.code === data.current) ?? data.plans[0];
  const currentName = current?.name ?? 'Free';
  const paid = data.current !== 'free';
  const canBill = roleCan(session.me, 'organisation.update');
  const own = session.companies.filter((company) => company.relationship !== 'follow').length;
  const followLimit = current?.entitlements.followLimit ?? 0;
  const followed = watchlist?.used ?? watchlist?.companies.length ?? 0;
  const people = members.data?.members.length ?? null;
  const price = priceWords(current ?? { code: 'free', priceMinor: null, currency: null });
  const priceLine = price === 'Not set yet' ? 'Price not set yet' : price;

  return (
    <div className="pg-plan" data-testid="plan-page" data-current={data.current}>
      <Hero>
        <div className="pagehead">
          <div>
            <div className="mono kick">
              <Scramble text="Account" /> · <b><Scramble text={`${currentName} plan`} delay={120} /></b>
            </div>
            <h1 className="disp">
              <Words text="Plan and billing" />
            </h1>
            <div className="meta">
              <span>{currentName} plan</span>
              <span>{priceLine}</span>
              <span>Payments through Stripe</span>
            </div>
          </div>
          <div className="acts">
            <TLink className="btn btn-g" href="/settings">
              Back to settings
            </TLink>
          </div>
        </div>

        <section className="r1">
          <div className="mod gl use">
            <div className="mh">
              <h2>Usage</h2>
              <span className="sub">What your {currentName} plan is holding right now</span>
            </div>
            <div className="ur">
              <div>
                <b>Your companies</b>
                <small>Scanned with every check</small>
              </div>
              <div className="nl">No limit on {currentName}</div>
              <div className="v">
                <CountUp className="pixel" value={own} />
              </div>
            </div>
            <div className="ur">
              <div>
                <b>Companies you follow</b>
                <small>On your watchlist</small>
              </div>
              {followLimit > 0 ? <Blocks used={followed} limit={followLimit} /> : <div className="nl">Not included</div>}
              <div className="v">
                <CountUp className="pixel" value={followed} />
                of {followLimit}
              </div>
            </div>
            <div className="ur">
              <div>
                <b>People</b>
                <small>Members of this workspace</small>
              </div>
              <div className="nl">No limit on {currentName}</div>
              <div className="v">{people === null ? <span className="nl">Not shown</span> : <CountUp className="pixel" value={people} />}</div>
            </div>
            <div className="ur">
              <div>
                <b>Gaps shown</b>
                <small>In your findings</small>
              </div>
              <div className="nl">{current?.entitlements.gapLimit === null ? `Every gap on ${currentName}` : `The top ${current?.entitlements.gapLimit ?? 3} on ${currentName}`}</div>
              <div className="v">{current?.entitlements.gapLimit === null ? <span className="nl">All</span> : <CountUp className="pixel" value={current?.entitlements.gapLimit ?? 3} />}</div>
            </div>
          </div>

          <div className="mod next" data-testid="plan-change">
            <div className="k">Your plan</div>
            <div className="price">
              {currentName} <small>{priceLine}</small>
            </div>
            <p>{PLAN_CHANGE.body}</p>
            {showScore ? (
              <div className="rows2" data-testid="plan-score">
                <div className="row2">
                  <span>{data.current === 'free' ? 'Your read today' : 'Your score today'}</span>
                  <b>{scoreWords(overview.score)}</b>
                </div>
                <div className="row2">
                  <span>Billing</span>
                  <b>{paid ? 'Stripe' : 'Nothing to pay'}</b>
                </div>
              </div>
            ) : (
              <div className="rows2">
                <div className="row2">
                  <span>Billing</span>
                  <b>{paid ? 'Stripe' : 'Nothing to pay'}</b>
                </div>
              </div>
            )}
            {paid && canBill ? <PortalButton className="btn" /> : <a className="btn" href="#plans">Compare plans</a>}
          </div>
        </section>
      </Hero>

      <After>
        <Reveal as="section" className="mod" id="plans">
          <div className="mh">
            <h2>Plans</h2>
            <span className="sub">Every plan reads the same official registers</span>
          </div>
          <div className="cmpwrap" data-lenis-prevent-horizontal="">
            <table className="cmp">
              <colgroup>
                <col style={{ width: '34%' }} />
                {data.plans.map((plan) => (
                  <col key={plan.code} />
                ))}
              </colgroup>
              <thead>
                <tr>
                  <th>
                    <span className="lead2">{PLAN_CHANGE.title}</span>
                  </th>
                  {data.plans.map((plan) => {
                    const isCurrent = plan.code === data.current;
                    return (
                      <th key={plan.code} className={isCurrent ? 'cur' : undefined} data-testid="plan-card" data-plan={plan.code}>
                        <span className={`tag${isCurrent ? '' : plan.code === 'growth' ? '' : ' h'}`}>{isCurrent ? 'Your plan' : plan.code === 'growth' ? 'Most chosen' : '.'}</span>
                        <span className="pn">{plan.name}</span>
                        <span className="pd">{planSay(plan.code)}</span>
                        <span className="pr" data-testid="plan-price">
                          {priceWords(plan)}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="rows-in">
                {COMPARE_ROWS.map((row, index) => (
                  <tr key={row.key} data-testid="compare-row" data-key={row.key} style={{ '--r': index } as CSSProperties}>
                    <td>
                      {row.label}
                      <small>{row.body}</small>
                    </td>
                    {data.plans.map((plan) => (
                      <td key={plan.code} className={plan.code === data.current ? 'cur' : undefined}>
                        <Cell plan={plan} cell={row.cell(plan.entitlements)} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td />
                  {data.plans.map((plan) => (
                    <td key={plan.code} className={plan.code === data.current ? 'cur' : undefined}>
                      {canBill || plan.code === data.current ? <PlanAction plan={plan} current={plan.code === data.current} hasResult={session.hasResult} primary={plan.code === 'growth'} /> : <span className="curb quiet">Ask an owner</span>}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </Reveal>

        <Reveal as="section" className="mod billing" i={1}>
          <div className="mh">
            <h2>Invoices and payment</h2>
            <span className="sub">Kept by Stripe</span>
          </div>
          <div className="bdl">
            <div>
              <span>Billed to</span>
              <b>
                {session.root?.legalName ?? 'Your workspace'}
                <small>{plural(own, 'company', 'companies')} in this workspace</small>
              </b>
            </div>
            <div>
              <span>Invoices, card and cancelling</span>
              <b>{paid ? 'In the Stripe billing page' : 'Nothing to bill on Free'}</b>
            </div>
          </div>
          {paid && canBill ? (
            <div className="cancel">
              <span>Invoices, the card on file and cancelling are all on Stripe&apos;s billing page. If you cancel, your scan history stays.</span>
              <PortalButton className="btn btn-g btn-sm" />
            </div>
          ) : (
            <div className="cancel">
              <span>{paid ? 'Only an owner can change billing.' : 'When you move to a paid plan, invoices and your card are kept by Stripe and open from here.'}</span>
            </div>
          )}
        </Reveal>
      </After>
    </div>
  );
}
