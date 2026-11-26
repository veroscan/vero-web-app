'use client';

import '@/app/styles/pages/plan.css';
import type { Plan } from '@vero/shared';
import { useEffect, useState, type CSSProperties } from 'react';
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

/** What the screen says wherever paying would start, while the API has payments switched off. */
const BILLING_OFF = "Billing isn't switched on yet, so you can't pay for a plan here today. Until it is, our team changes plans by hand, and the change shows on this page.";

/**
 * Stripe's own checkout. The plan changes only when Stripe tells us the payment went through.
 * While payments are off the API answers plainly that they are, and the button shows those words.
 */
function CheckoutButton({ plan, primary, billingOn, onOff }: { plan: Plan; primary: boolean; billingOn: boolean; onOff: () => void }) {
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  if (plan.code === 'free') return null;
  const code = plan.code;
  const start = () => {
    if (busy) return;
    setBusy(true);
    setProblem(null);
    api.billing.checkout({ body: { plan: code } }).then(
      ({ url }) => window.location.assign(url),
      (error: unknown) => {
        const failure = asApiError(error);
        if (failure.code === 'payments_off') onOff();
        setProblem(failure.message);
        setBusy(false);
      },
    );
  };
  return (
    <>
      <button className={`btn ${primary ? 'btn-p' : 'btn-g'}`} type="button" disabled={busy} onClick={start} data-testid={`checkout-${code}`} aria-describedby={billingOn ? undefined : 'billing-off'}>
        {busy ? 'Opening checkout' : `Move to ${plan.name}`}
      </button>
      {problem ? (
        <p className="probl" role="alert">
          {problem}
        </p>
      ) : billingOn ? null : (
        <span className="offw">Billing isn&apos;t on yet</span>
      )}
    </>
  );
}

function PlanAction({ plan, current, hasResult, primary, billingOn, onOff }: { plan: Plan; current: boolean; hasResult: boolean; primary: boolean; billingOn: boolean; onOff: () => void }) {
  if (current) return <span className="curb">Your plan</span>;
  if (plan.code === 'free') return <span className="curb quiet">{billingOn ? 'Manage it in billing' : 'Ask our team to move you'}</span>;
  if (!hasResult) {
    return (
      <TLink className={`btn ${primary ? 'btn-p' : 'btn-g'}`} href="/onboarding/company">
        Start with your first scan
      </TLink>
    );
  }
  return <CheckoutButton plan={plan} primary={primary} billingOn={billingOn} onOff={onOff} />;
}

/** A wide table in a narrow box: says so while there is more to the side, and stops saying it at the end. */
function useMoreToTheSide() {
  // Kept in state, not a ref: the box only exists once the plans have loaded.
  const [element, box] = useState<HTMLDivElement | null>(null);
  const [more, setMore] = useState(false);
  useEffect(() => {
    if (!element) return;
    const read = () => setMore(element.scrollWidth - element.clientWidth - element.scrollLeft > 8);
    read();
    element.addEventListener('scroll', read, { passive: true });
    const observer = new ResizeObserver(read);
    observer.observe(element);
    return () => {
      element.removeEventListener('scroll', read);
      observer.disconnect();
    };
  }, [element]);
  return { box, more };
}

/** Stripe's billing portal: invoices, the card on file and cancelling all live there. */
function PortalButton({ className, onOff }: { className: string; onOff: () => void }) {
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const open = () => {
    if (busy) return;
    setBusy(true);
    setProblem(null);
    api.billing.portal().then(
      ({ url }) => window.location.assign(url),
      (error: unknown) => {
        const failure = asApiError(error);
        if (failure.code === 'payments_off') onOff();
        setProblem(failure.message);
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
  const [saidOff, setSaidOff] = useState(false);
  const side = useMoreToTheSide();

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
  // Prices come from Stripe. Until the API sends one for a paid plan, payments aren't switched on;
  // the API also says so itself the moment anyone tries to pay.
  const billingOn = !saidOff && data.plans.some((plan) => plan.code !== 'free' && plan.priceMinor !== null);
  const sayOff = () => setSaidOff(true);

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
              <span>{billingOn ? 'Payments through Stripe' : "Billing isn't switched on yet"}</span>
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
            <p>{billingOn ? "Payments go through Stripe's own checkout, and your plan changes once Stripe confirms the payment." : BILLING_OFF}</p>
            {showScore ? (
              <div className="rows2" data-testid="plan-score">
                <div className="row2">
                  <span>{data.current === 'free' ? 'Your read today' : 'Your score today'}</span>
                  <b>{scoreWords(overview.score)}</b>
                </div>
                <div className="row2">
                  <span>Billing</span>
                  <b>{!paid ? 'Nothing to pay' : billingOn ? 'Stripe' : 'Set by our team'}</b>
                </div>
              </div>
            ) : (
              <div className="rows2">
                <div className="row2">
                  <span>Billing</span>
                  <b>{!paid ? 'Nothing to pay' : billingOn ? 'Stripe' : 'Set by our team'}</b>
                </div>
              </div>
            )}
            {paid && canBill && billingOn ? (
              <PortalButton className="btn" onOff={sayOff} />
            ) : (
              <a className="btn" href="#plans">
                Compare plans
              </a>
            )}
          </div>
        </section>
      </Hero>

      <After>
        <Reveal as="section" className="mod" id="plans">
          <div className="mh">
            <h2>Plans</h2>
            <span className="sub">Every plan reads the same official registers</span>
          </div>
          {billingOn ? null : (
            <p className="offnote" id="billing-off" data-testid="billing-off">
              <Icon name="card" />
              <span>
                <b>Billing isn&apos;t switched on yet.</b> You can&apos;t pay for a plan here today. Until it is, our team changes plans by hand, and the change shows on this page.
              </span>
            </p>
          )}
          <p className={`swipe${side.more ? '' : ' end'}`} aria-hidden="true">
            Swipe sideways to compare the plans
            <Icon name="arrow" />
          </p>
          <div className={`cmpwrap${side.more ? ' more' : ''}`} ref={side.box} data-lenis-prevent-horizontal="" tabIndex={0} role="region" aria-label="Plans compared">
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
                      {canBill || plan.code === data.current ? (
                        <PlanAction plan={plan} current={plan.code === data.current} hasResult={session.hasResult} primary={plan.code === 'growth'} billingOn={billingOn} onOff={sayOff} />
                      ) : (
                        <span className="curb quiet">Ask an owner</span>
                      )}
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
            <span className="sub">{billingOn ? 'Kept by Stripe' : 'Nothing here until billing is switched on'}</span>
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
              <b>{!billingOn ? 'Not available yet' : paid ? 'In the Stripe billing page' : 'Nothing to bill on Free'}</b>
            </div>
          </div>
          {!billingOn ? (
            <div className="cancel" data-testid="billing-off-invoices">
              <span>
                {paid ? `Your ${currentName} plan was set by our team, so there is no card on file and no invoice to show. ` : ''}
                Billing isn&apos;t switched on yet. When it is, payments will go through Stripe, and invoices and your card will open from here.
              </span>
            </div>
          ) : paid && canBill ? (
            <div className="cancel">
              <span>Invoices, the card on file and cancelling are all on Stripe&apos;s billing page. If you cancel, your scan history stays.</span>
              <PortalButton className="btn btn-g btn-sm" onOff={sayOff} />
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
