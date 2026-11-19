'use client';

import type { BadgeStatusResponse, ShareLink } from '@vero/shared';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { ErrorState, Loading, PlanLink } from '@/components/Bits';
import { CopyLink } from '@/components/CopyLink';
import { useSession } from '@/components/Session';
import { TLink } from '@/components/TLink';
import { useToast } from '@/components/Toast';
import { V_PATH, VSeal } from '@/components/V3D';
import { api, asApiError } from '@/lib/api';
import { entitlementsOf, roleCan } from '@/lib/entitlements';
import { longDate } from '@/lib/format';
import { badgeRows, earnedBadge, shareUrl, verifiedUrl } from '@/lib/trust';
import { useResource } from '@/lib/useResource';

const LINK_DAYS = [7, 30, 90] as const;

function ShareLinks({ companyId }: { companyId: string }) {
  const toast = useToast();
  const resource = useResource(() => api.shares.list({ params: { companyId } }), [companyId]);
  const [days, setDays] = useState<number>(30);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [fresh, setFresh] = useState<string | null>(null);
  const [asking, setAsking] = useState<string | null>(null);

  const create = async () => {
    setBusy(true);
    setProblem(null);
    try {
      const made = await api.shares.create({ params: { companyId }, body: { expiresInDays: days } });
      setFresh(shareUrl(made.token, window.location.origin));
      resource.reload();
    } catch (error) {
      setProblem(asApiError(error).message);
    }
    setBusy(false);
  };

  const revoke = async (link: ShareLink) => {
    setBusy(true);
    setProblem(null);
    try {
      await api.shares.revoke({ params: { shareId: link.id } });
      toast('Link withdrawn. It no longer opens.');
      setAsking(null);
      setFresh(null);
      resource.reload();
    } catch (error) {
      setProblem(asApiError(error).message);
    }
    setBusy(false);
  };

  const live = (resource.data?.links ?? []).filter((link) => link.active);

  return (
    <section className="sec stack g16" data-testid="share-links">
      <div className="stack g4">
        <h2 className="t-2">Your public page</h2>
        <p className="quiet">A link you can send to anyone. It shows a snapshot of your score and what&apos;s been checked today, and never your documents or the details of an issue.</p>
      </div>
      {resource.error ? (
        <p className="formerror" role="alert">
          {resource.error.message}
        </p>
      ) : null}
      {fresh ? <CopyLink testId="share-fresh" url={fresh} note="Copy it now. We only show a link once, because we keep just a scrambled copy of it." /> : null}
      {live.length > 0 ? (
        <div className="rows">
          {live.map((link) => (
            <div className="row r-act" key={link.id} data-testid="share-row">
              <span className="stack g4">
                <span className="row-t">Made {longDate(link.createdAt)}</span>
                <span className="row-s">Open until {longDate(link.expiresAt)}</span>
              </span>
              {asking === link.id ? (
                <span className="btns">
                  <button className="btn btn-sm btn-ink" type="button" disabled={busy} onClick={() => void revoke(link)}>
                    Yes, withdraw it
                  </button>
                  <button className="btn btn-sm btn-line" type="button" onClick={() => setAsking(null)}>
                    Keep it
                  </button>
                </span>
              ) : (
                <button className="btn btn-sm btn-line" type="button" onClick={() => setAsking(link.id)}>
                  Withdraw
                </button>
              )}
            </div>
          ))}
        </div>
      ) : resource.loading ? null : (
        <p className="quiet" data-testid="share-none">
          No links are open.
        </p>
      )}
      {problem ? (
        <p className="formerror" role="alert">
          {problem}
        </p>
      ) : null}
      <div className="sharemake">
        <div className="field">
          <label htmlFor="share-days">How long it stays open</label>
          <select className="input" id="share-days" value={days} onChange={(event) => setDays(Number(event.target.value))}>
            {LINK_DAYS.map((value) => (
              <option key={value} value={value}>
                {value} days
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn-ink" type="button" disabled={busy} onClick={() => void create()}>
          Make a public link
        </button>
      </div>
    </section>
  );
}

function BadgeHero({ status, companyName, companyId, canManage, publicSharing, onChanged }: { status: BadgeStatusResponse; companyName: string; companyId: string; canManage: boolean; publicSharing: boolean; onChanged: () => void }) {
  const toast = useToast();
  const session = useSession();
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const earned = earnedBadge(status);
  const rows = badgeRows(status);

  const issue = async () => {
    setBusy(true);
    setProblem(null);
    try {
      const issued = await api.badge.issue({ params: { companyId } });
      setLink(verifiedUrl(issued.publicToken, window.location.origin));
      onChanged();
      await session.refresh().catch(() => undefined);
    } catch (error) {
      setProblem(asApiError(error).message);
    }
    setBusy(false);
  };

  const revoke = async () => {
    setBusy(true);
    setProblem(null);
    try {
      await api.badge.revoke({ params: { companyId } });
      toast('Badge withdrawn. Its link no longer opens.');
      setLink(null);
      setAsking(false);
      onChanged();
    } catch (error) {
      setProblem(asApiError(error).message);
    }
    setBusy(false);
  };

  return (
    <section className="stage bd-hero" aria-label="Your badge and what it takes" data-testid="badge-hero" data-earned={earned ? 'yes' : 'no'}>
      <div className="wrap bd-grid">
        <figure className="bd-fig">
          <div className="bd-seal-box">
            <VSeal earned={earned !== null} label={earned ? `Verified seal for ${companyName}` : `The verified seal, not earned yet by ${companyName}`}>
              <div className="bd-flat">
                <svg viewBox="0 0 132 100" aria-hidden="true">
                  <path d={V_PATH} />
                </svg>
                {earned ? (
                  <>
                    <p className="bd-big">Legal health verified</p>
                    <p className="small" style={{ color: 'inherit' }}>
                      Checked by Vero
                    </p>
                  </>
                ) : null}
                <p className="small" style={{ color: 'inherit', fontWeight: 600 }}>
                  {companyName}
                </p>
              </div>
            </VSeal>
          </div>
          <figcaption className="stack g4 bd-cap" data-testid="badge-state">
            {earned ? (
              <>
                <span className="st" style={{ color: 'var(--rose-deep)' }}>
                  Legal health verified
                </span>
                <span className="small">Checked by Vero · {companyName}</span>
              </>
            ) : (
              <>
                <span className="st none" style={{ color: 'var(--ink-2)' }}>
                  Not earned yet
                </span>
                <span className="small">{companyName}</span>
              </>
            )}
          </figcaption>
        </figure>

        <div className="stack g24 bd-copy">
          <div className="stack g12">
            <h1 className="t-1">Verified badge</h1>
            <p className="lead" style={{ maxWidth: '32em' }}>
              {earned
                ? `A public sign of what Vero checked about your company. Yours runs until ${longDate(earned.expiresAt)}.`
                : status.eligible
                  ? "You've met everything it takes. It isn't live until it's issued."
                  : "A public sign of what Vero checked about your company. You haven't earned it yet."}
            </p>
          </div>

          <div className="stack g12">
            <h2 className="t-3">You need all four</h2>
            <div className="rows">
              {rows.map((row) => (
                <div className="row r-act" key={row.key} data-testid="badge-requirement" data-key={row.key}>
                  <span className="row-t">{row.label}</span>
                  <span className={`st num ${row.tone}`}>{row.status}</span>
                </div>
              ))}
            </div>
          </div>

          {status.blockers.length > 0 ? (
            <div className="stack g8" data-testid="badge-blockers">
              <h2 className="t-3">What&apos;s in the way</h2>
              <ul className="stack g4 bd-blockers">
                {status.blockers.map((blocker) => (
                  <li key={blocker} className="quiet" data-testid="badge-blocker">
                    {blocker}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {status.badge && !earned ? (
            <p className="quiet" data-testid="badge-ended">
              Your last badge ended. It isn&apos;t showing to anyone now.
            </p>
          ) : null}

          {link ? <CopyLink testId="badge-link" url={link} note="Copy it now. We only show this link once, because we keep just a scrambled copy of it." /> : null}
          {earned && !link ? (
            <p className="quiet" data-testid="badge-link-gone">
              Its link was shown once, when it was issued. To get a new one, issue the badge again.
            </p>
          ) : null}
          {problem ? (
            <p className="formerror" role="alert">
              {problem}
            </p>
          ) : null}

          <div className="btns">
            {status.eligible && canManage ? (
              <button className={`btn ${earned ? 'btn-line' : 'btn-ink'}`} type="button" disabled={busy} data-testid="badge-issue" onClick={() => void issue()}>
                {earned ? 'Issue it again, with a new link' : 'Issue your badge'}
              </button>
            ) : null}
            {!status.eligible && !earned && publicSharing ? (
              <TLink className="btn btn-ink" href="/issues">
                See what to fix
              </TLink>
            ) : null}
            {!publicSharing ? (
              <TLink className="btn btn-ink" href="/plan" data-testid="badge-plan">
                See the plans
              </TLink>
            ) : null}
            {earned && canManage ? (
              asking ? (
                <>
                  <button className="btn btn-line" type="button" disabled={busy} data-testid="badge-revoke-yes" onClick={() => void revoke()}>
                    Yes, withdraw it
                  </button>
                  <button className="btn btn-line" type="button" onClick={() => setAsking(false)}>
                    Keep it
                  </button>
                </>
              ) : (
                <button className="btn btn-line" type="button" data-testid="badge-revoke" onClick={() => setAsking(true)}>
                  Withdraw the badge
                </button>
              )
            ) : null}
          </div>
          {status.eligible && !canManage ? (
            <p className="small" data-testid="badge-no-permission">
              Only an owner or admin can issue the badge.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function BadgeBody() {
  const session = useSession();
  const search = useSearchParams();
  const companies = session.companies;
  const asked = search.get('company');
  const companyId = asked && companies.some((company) => company.id === asked) ? asked : (session.root?.id ?? '');
  const company = companies.find((item) => item.id === companyId);
  const entitlements = entitlementsOf(session.overview?.plan);
  const canManage = roleCan(session.me, 'sharing.manage');
  const resource = useResource(() => api.badge.get({ params: { companyId } }), [companyId]);
  const status = resource.data;

  if (resource.error && (!status || status.companyId !== companyId)) {
    return (
      <main style={{ display: 'contents' }}>
        <ErrorState error={resource.error} onRetry={resource.reload} />
      </main>
    );
  }
  if (!status || status.companyId !== companyId) {
    return (
      <main style={{ display: 'contents' }}>
        <Loading what="Getting your badge" />
      </main>
    );
  }

  return (
    <div style={{ display: 'contents' }}>
      {companies.length > 1 ? (
        <div className="wrap bd-companies">
          <div className="filters" role="group" aria-label="Choose a company">
            {companies.map((item) => (
              <TLink key={item.id} className={`fbtn${item.id === companyId ? ' on' : ''}`} style={{ display: 'inline-flex', alignItems: 'center' }} href={`/badge?company=${item.id}`} aria-current={item.id === companyId ? 'true' : undefined}>
                {item.legalName}
              </TLink>
            ))}
          </div>
        </div>
      ) : null}
      <main style={{ display: 'contents' }}>
        <BadgeHero status={status} companyName={company?.legalName ?? ''} companyId={companyId} canManage={canManage} publicSharing={entitlements.publicSharing} onChanged={resource.reload} />
        <div className="wrap">
          {entitlements.publicSharing && canManage ? <ShareLinks key={companyId} companyId={companyId} /> : null}
          {entitlements.publicSharing && !canManage ? (
            <section className="sec" data-testid="share-no-permission">
              <p className="quiet">Only an owner or admin can make a public link.</p>
            </section>
          ) : null}
          <section className="sec stack g16">
            <h2 className="t-2">What you get once you&apos;ve earned it</h2>
            <div className="rows">
              <div className="row">
                <span className="row-t">A link to your badge</span>
                <span className="row-s">Anyone who opens it sees who reviewed you, and until when.</span>
              </div>
              <div className="row">
                <span className="row-t">Investors can check it</span>
                <span className="row-s">They open the page and see it for themselves. Nobody has to take your word for it.</span>
              </div>
            </div>
            {!entitlements.publicSharing ? (
              <p className="small" data-testid="badge-paid-note">
                Public links and the badge are part of a paid plan. <PlanLink />
              </p>
            ) : null}
          </section>
        </div>
      </main>
    </div>
  );
}

export default function BadgePage() {
  return (
    <Suspense fallback={<Loading what="Getting your badge" />}>
      <BadgeBody />
    </Suspense>
  );
}
