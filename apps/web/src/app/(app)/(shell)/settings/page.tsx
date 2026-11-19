'use client';

import { type Invitation, type Member, type Role, type TotpEnrolResponse } from '@vero/shared';
import { useState, type FormEvent } from 'react';
import { useSession } from '@/components/Session';
import { TLink } from '@/components/TLink';
import { useToast } from '@/components/Toast';
import { api, asApiError } from '@/lib/api';
import { planNameOf, roleCan } from '@/lib/entitlements';
import { longDate } from '@/lib/format';
import { countryLong } from '@/lib/records';
import { ROLE_WORDS } from '@/lib/trust';
import { useResource } from '@/lib/useResource';

function FormProblem({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="formerror" role="alert">
      {message}
    </p>
  );
}

function Companies() {
  const { companies } = useSession();
  return (
    <div className="setsec stack g16" id="companies">
      <h2 className="t-2">Companies</h2>
      {companies.length === 0 ? (
        <p className="quiet" data-testid="settings-no-companies">
          You haven&apos;t added a company yet.{' '}
          <TLink className="link" href="/onboarding/company">
            Find your company
          </TLink>
        </p>
      ) : (
        <>
        <div className="rows">
          {companies.map((company) => (
            <TLink className="row r-act" href={`/company/${company.id}`} key={company.id} data-testid="settings-company">
              <span className="row-t">{company.legalName}</span>
              <span className="quiet">{countryLong(company.incorporationCountry)}</span>
            </TLink>
          ))}
        </div>
        <p className="small">
          <TLink className="link" href="/onboarding/company?add=1" data-testid="settings-add-company">
            Add another company
          </TLink>
        </p>
        </>
      )}
    </div>
  );
}

function roleChoices(canOwn: boolean): Role[] {
  return canOwn ? ['owner', 'admin', 'member', 'lawyer'] : ['admin', 'member', 'lawyer'];
}

function MemberRow({ member, isYou, soleOwner, canManage, canOwn, onChanged }: { member: Member; isYou: boolean; soleOwner: boolean; canManage: boolean; canOwn: boolean; onChanged: () => void }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [asking, setAsking] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const name = member.name ?? member.email;
  const touchable = canManage && !isYou && (member.role !== 'owner' || canOwn);

  const change = async (role: Role) => {
    setBusy(true);
    setProblem(null);
    try {
      await api.members.update({ params: { userId: member.userId }, body: { role } });
      toast(`${name} is now ${ROLE_WORDS[role].toLowerCase()}.`);
      onChanged();
    } catch (error) {
      setProblem(asApiError(error).message);
    }
    setBusy(false);
  };

  const remove = async () => {
    setBusy(true);
    setProblem(null);
    try {
      await api.members.remove({ params: { userId: member.userId } });
      if (isYou) {
        window.location.assign('/');
        return;
      }
      toast(`${name} no longer has access.`);
      onChanged();
    } catch (error) {
      setProblem(asApiError(error).message);
      setBusy(false);
    }
  };

  return (
    <div className="row member" data-testid="member-row" data-email={member.email}>
      <span className="stack g4">
        <span className="row-t">
          {name}
          {isYou ? ' (you)' : ''}
        </span>
        {member.name ? <span className="row-s">{member.email}</span> : null}
        <span className="row-s">Joined {longDate(member.joinedAt)}</span>
      </span>
      <span className="member-acts">
        {touchable ? (
          <>
            <label className="sr-only" htmlFor={`role-${member.userId}`}>
              Role for {name}
            </label>
            <select className="input roleselect" id={`role-${member.userId}`} value={member.role} disabled={busy} onChange={(event) => void change(event.target.value as Role)}>
              {roleChoices(canOwn).map((role) => (
                <option key={role} value={role}>
                  {ROLE_WORDS[role]}
                </option>
              ))}
            </select>
          </>
        ) : (
          <span className="quiet">{ROLE_WORDS[member.role]}</span>
        )}
        {soleOwner ? (
          <span className="small" data-testid="sole-owner-note">
            To leave, make someone else an owner first.
          </span>
        ) : touchable || isYou ? (
          asking ? (
            <>
              <button className="btn btn-sm btn-ink" type="button" disabled={busy} onClick={() => void remove()}>
                {isYou ? 'Yes, leave' : 'Yes, remove'}
              </button>
              <button className="btn btn-sm btn-line" type="button" disabled={busy} onClick={() => setAsking(false)}>
                Keep
              </button>
            </>
          ) : (
            <button className="btn btn-sm btn-line" type="button" onClick={() => setAsking(true)}>
              {isYou ? 'Leave' : 'Remove'}
            </button>
          )
        ) : null}
      </span>
      <FormProblem message={problem} />
    </div>
  );
}

function InviteForm({ canOwn, onSent, onClose }: { canOwn: boolean; onSent: () => void; onClose: () => void }) {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('member');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setProblem(null);
    try {
      await api.invitations.create({ body: { email: email.trim(), role } });
      toast("Invite sent. They'll get an email from us.");
      onSent();
    } catch (error) {
      setProblem(asApiError(error).message);
      setBusy(false);
    }
  };

  return (
    <form className="next" id="invite" data-testid="invite-form" onSubmit={(event) => void submit(event)}>
      <div className="field">
        <label htmlFor="invite-mail">Their work email</label>
        <input className="input" id="invite-mail" type="email" required autoComplete="off" value={email} onChange={(event) => setEmail(event.target.value)} />
        <p className="msg hint">We&apos;ll email them a link to join. It lasts 7 days.</p>
      </div>
      <div className="field">
        <label htmlFor="invite-role">What they can do</label>
        <select className="input" id="invite-role" value={role} onChange={(event) => setRole(event.target.value as Role)}>
          {roleChoices(canOwn).map((choice) => (
            <option key={choice} value={choice}>
              {ROLE_WORDS[choice]}
            </option>
          ))}
        </select>
      </div>
      <FormProblem message={problem} />
      <div className="btns">
        <button className="btn btn-ink btn-sm" type="submit" disabled={busy || email.trim().length === 0}>
          {busy ? 'Sending' : 'Send invite'}
        </button>
        <button className="btn btn-line btn-sm" type="button" disabled={busy} onClick={onClose}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function PendingRow({ invitation, onChanged }: { invitation: Invitation; onChanged: () => void }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const revoke = async () => {
    setBusy(true);
    setProblem(null);
    try {
      await api.invitations.revoke({ params: { invitationId: invitation.id } });
      toast('Invite withdrawn.');
      onChanged();
    } catch (error) {
      setProblem(asApiError(error).message);
      setBusy(false);
    }
  };
  return (
    <div className="row member" data-testid="pending-row" data-email={invitation.email}>
      <span className="stack g4">
        <span className="row-t">{invitation.email}</span>
        <span className="row-s">
          {ROLE_WORDS[invitation.role]} · We&apos;ve emailed them. The invite lasts until {longDate(invitation.expiresAt)}.
        </span>
      </span>
      <span className="member-acts">
        <span className="st watch">Invite sent</span>
        <button className="btn btn-sm btn-line" type="button" disabled={busy} onClick={() => void revoke()}>
          Withdraw
        </button>
      </span>
      <FormProblem message={problem} />
    </div>
  );
}

function Team() {
  const session = useSession();
  const { me } = session;
  const canManage = roleCan(me, 'members.manage');
  const canOwn = roleCan(me, 'members.manageOwners');
  const canInvite = roleCan(me, 'invitations.manage');
  const canSeeInvites = roleCan(me, 'invitations.read');
  const [inviting, setInviting] = useState(false);
  const resource = useResource(async () => {
    const [members, invitations] = await Promise.all([api.members.list(), canSeeInvites ? api.invitations.list() : Promise.resolve({ invitations: [] })]);
    return { members: members.members, invitations: invitations.invitations };
  }, [canSeeInvites]);

  return (
    <div className="setsec stack g16" id="team" data-testid="team">
      <h2 className="t-2">Team</h2>
      {resource.error && !resource.data ? (
        <div className="stack g8" data-testid="team-error">
          <FormProblem message={resource.error.message} />
          <div className="btns">
            <button className="btn btn-line btn-sm" type="button" onClick={resource.reload}>
              Try again
            </button>
          </div>
        </div>
      ) : resource.data ? (
        <div className="rows">
          {resource.data.members.map((member) => (
            <MemberRow
              key={member.userId}
              member={member}
              isYou={member.userId === me.user.id}
              soleOwner={member.userId === me.user.id && member.role === 'owner' && resource.data?.members.filter((item) => item.role === 'owner').length === 1}
              canManage={canManage}
              canOwn={canOwn}
              onChanged={resource.reload}
            />
          ))}
          {resource.data.invitations.map((invitation) => (
            <PendingRow key={invitation.id} invitation={invitation} onChanged={resource.reload} />
          ))}
        </div>
      ) : (
        <p className="quiet" role="status">
          Getting your team
        </p>
      )}
      {canInvite ? (
        inviting ? (
          <InviteForm
            canOwn={canOwn}
            onClose={() => setInviting(false)}
            onSent={() => {
              setInviting(false);
              resource.reload();
            }}
          />
        ) : (
          <div className="btns">
            <button className="btn btn-line btn-sm" type="button" onClick={() => setInviting(true)}>
              Invite someone
            </button>
          </div>
        )
      ) : (
        <p className="small" data-testid="team-no-permission">
          Only an owner or admin can invite people or change roles.
        </p>
      )}
    </div>
  );
}

function Notifications() {
  return (
    <div className="setsec stack g16" id="notifications">
      <h2 className="t-2">Notifications</h2>
      <p className="quiet" data-testid="settings-notifications">
        Deadlines, score changes, company look-ups and team news all come to{' '}
        <TLink className="link" href="/notifications">
          What&apos;s new
        </TLink>
        . You can&apos;t choose between them yet.
      </p>
    </div>
  );
}

function Display() {
  const pick = (theme: 'light' | 'dark') => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      window.localStorage.setItem('vero-theme', theme);
    } catch {
      // A private window can refuse. The choice still lasts for this page.
    }
  };
  return (
    <div className="setsec stack g16" id="display">
      <h2 className="t-2">Display</h2>
      <div className="stack g12">
        <h3 className="t-3" id="theme-label">
          Light or dark
        </h3>
        <div className="two themepick" role="group" aria-labelledby="theme-label">
          <button className="opt" type="button" data-theme-choice="light" onClick={() => pick('light')}>
            Light
          </button>
          <button className="opt" type="button" data-theme-choice="dark" onClick={() => pick('dark')}>
            Dark
          </button>
        </div>
      </div>
    </div>
  );
}

function Profile() {
  const session = useSession();
  const toast = useToast();
  const { user } = session.me;
  const [name, setName] = useState(user.name ?? '');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const changed = name.trim() !== (user.name ?? '') && name.trim().length > 0;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setProblem(null);
    try {
      await api.me.update({ body: { name: name.trim() } });
      await session.refresh();
      toast('Saved.');
    } catch (error) {
      setProblem(asApiError(error).message);
    }
    setBusy(false);
  };

  return (
    <form className="stack g12" data-testid="profile" onSubmit={(event) => void submit(event)}>
      <div className="field">
        <label htmlFor="profile-name">Your name</label>
        <input className="input" id="profile-name" type="text" autoComplete="name" maxLength={120} value={name} onChange={(event) => setName(event.target.value)} />
      </div>
      <p className="quiet">
        You sign in with <span className="b">{user.email}</span>.
      </p>
      <FormProblem message={problem} />
      <div className="btns">
        <button className="btn btn-line btn-sm" type="submit" disabled={busy || !changed}>
          Save your name
        </button>
      </div>
    </form>
  );
}

function TwoStep() {
  const session = useSession();
  const toast = useToast();
  const enabled = session.me.user.mfaEnabled;
  const [setup, setSetup] = useState<TotpEnrolResponse | null>(null);
  const [turningOff, setTurningOff] = useState(false);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const start = async () => {
    setBusy(true);
    setProblem(null);
    try {
      setSetup(await api.auth.totpEnrol());
    } catch (error) {
      setProblem(asApiError(error).message);
    }
    setBusy(false);
  };

  const finish = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setProblem(null);
    try {
      if (enabled) await api.auth.totpDisable({ body: { code } });
      else await api.auth.totpVerify({ body: { code } });
      await session.refresh();
      toast(enabled ? 'Two-step sign-in is off.' : 'Two-step sign-in is on.');
      setSetup(null);
      setTurningOff(false);
      setCode('');
    } catch (error) {
      setProblem(asApiError(error).message);
    }
    setBusy(false);
  };

  const codeForm = (label: string, submitLabel: string, onCancel: () => void) => (
    <form className="stack g12" onSubmit={(event) => void finish(event)}>
      <div className="field">
        <label htmlFor="totp-code">{label}</label>
        <input className="input" id="totp-code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={(event) => setCode(event.target.value)} />
      </div>
      <div className="btns">
        <button className="btn btn-ink btn-sm" type="submit" disabled={busy || code.length !== 6}>
          {submitLabel}
        </button>
        <button className="btn btn-line btn-sm" type="button" disabled={busy} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );

  return (
    <div className="stack g12" data-testid="two-step">
      <div className="row r-act twostep">
        <span className="stack g4">
          <span className="row-t">Two-step sign-in</span>
          <span className="row-s">A code from an authenticator app, as well as your email link.</span>
        </span>
        <span className={`st ${enabled ? 'good' : 'none'}`} data-testid="two-step-state">
          {enabled ? 'On' : 'Off'}
        </span>
      </div>
      {setup ? (
        <div className="next" data-testid="two-step-setup">
          <p className="quiet">Add this key to your authenticator app. It isn&apos;t on until you enter a code from the app.</p>
          <p className="totpkey num" data-testid="two-step-secret">
            {setup.secret}
          </p>
          <p>
            <a className="link" href={setup.otpauthUri}>
              Open it in an authenticator app on this device
            </a>
          </p>
          {codeForm('The 6-digit code from your app', 'Turn it on', () => {
            setSetup(null);
            setCode('');
          })}
        </div>
      ) : null}
      {turningOff ? (
        <div className="next" data-testid="two-step-off">
          {codeForm('The 6-digit code from your app', 'Turn it off', () => {
            setTurningOff(false);
            setCode('');
          })}
        </div>
      ) : null}
      <FormProblem message={problem} />
      {!setup && !turningOff ? (
        <div className="btns">
          {enabled ? (
            <button className="btn btn-line btn-sm" type="button" onClick={() => setTurningOff(true)}>
              Turn off two-step sign-in
            </button>
          ) : (
            <button className="btn btn-line btn-sm" type="button" disabled={busy} onClick={() => void start()}>
              Set up two-step sign-in
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

function DeleteAccount() {
  const session = useSession();
  const { user } = session.me;
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const matches = email.trim().toLowerCase() === user.email.toLowerCase();
  const ready = matches && (!user.mfaEnabled || code.length === 6);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!ready) return;
    setBusy(true);
    setProblem(null);
    try {
      await api.me.deleteAccount({ body: { confirmEmail: email.trim(), ...(user.mfaEnabled ? { totpCode: code } : {}) } });
      window.location.assign('/sign-in');
    } catch (error) {
      setProblem(asApiError(error).message);
      setBusy(false);
    }
  };

  return (
    <details className="more delete-row" data-testid="delete-account">
      <summary className="row r-open">
        <span className="row-t danger">Delete your account</span>
        <span />
        <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <div className="more-body stack g12">
        <p className="quiet">
          This deletes your account for good, and you can&apos;t undo it. On any team where you&apos;re the only person, it also deletes that team&apos;s companies, documents, scores and share links. On a team with other people, you just leave, and they keep everything. If you&apos;re the only owner of a team with other people, make
          someone else an owner first.
        </p>
        <form className="stack g12" onSubmit={(event) => void submit(event)}>
          <div className="field">
            <label htmlFor="delete-email">Type your email to confirm: {user.email}</label>
            <input className="input" id="delete-email" type="email" autoComplete="off" value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          {user.mfaEnabled ? (
            <div className="field">
              <label htmlFor="delete-code">The 6-digit code from your app</label>
              <input className="input" id="delete-code" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(event) => setCode(event.target.value)} />
            </div>
          ) : null}
          <FormProblem message={problem} />
          <div className="btns">
            <button className="btn btn-line btn-sm danger" type="submit" disabled={busy || !ready} data-testid="delete-confirm">
              {busy ? 'Deleting' : 'Yes, delete my account for good'}
            </button>
          </div>
        </form>
      </div>
    </details>
  );
}

function Organisations() {
  const { me } = useSession();
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  if (me.organisations.length < 2) return null;
  const change = async (organisationId: string) => {
    setBusy(true);
    setProblem(null);
    try {
      await api.organisations.switch({ body: { organisationId } });
      window.location.assign('/');
    } catch (error) {
      setProblem(asApiError(error).message);
      setBusy(false);
    }
  };
  return (
    <div className="stack g12" data-testid="organisations">
      <h3 className="t-3">Your teams</h3>
      <div className="rows">
        {me.organisations.map((org) => (
          <div className="row r-act" key={org.id} data-testid="organisation-row">
            <span className="row-t">{org.name}</span>
            {org.id === me.activeOrganisationId ? (
              <span className="quiet">You&apos;re here</span>
            ) : (
              <button className="btn btn-sm btn-line" type="button" disabled={busy} onClick={() => void change(org.id)}>
                Switch
              </button>
            )}
          </div>
        ))}
      </div>
      <FormProblem message={problem} />
    </div>
  );
}

function Account() {
  const session = useSession();
  const plan = session.overview?.plan;
  const [problem, setProblem] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const everywhere = async () => {
    setBusy(true);
    setProblem(null);
    try {
      await api.auth.logoutEverywhere();
      window.location.assign('/sign-in');
    } catch (error) {
      setProblem(asApiError(error).message);
      setBusy(false);
    }
  };
  return (
    <div className="setsec stack g24" id="account">
      <h2 className="t-2">Account</h2>
      <Profile />
      <Organisations />
      <TwoStep />
      <div className="rows">
        <TLink className="row r-act" href="/plan" data-testid="settings-plan">
          <span className="row-t">Your plan</span>
          <span className="quiet">{plan ? planNameOf(plan) : 'See the plans'}</span>
        </TLink>
        <div className="row r-act">
          <span className="row-t">{session.me.user.name ?? session.me.user.email}</span>
          <button className="btn btn-line btn-sm" type="button" onClick={() => void session.signOut().catch(() => setProblem("We couldn't sign you out. Check your connection and try again."))}>
            Sign out
          </button>
        </div>
        <div className="row r-act">
          <span className="stack g4">
            <span className="row-t">Sign out everywhere</span>
            <span className="row-s">Ends every session on every device, this one too.</span>
          </span>
          <button className="btn btn-line btn-sm" type="button" disabled={busy} data-testid="sign-out-everywhere" onClick={() => void everywhere()}>
            Sign out everywhere
          </button>
        </div>
        <DeleteAccount />
      </div>
      <FormProblem message={problem} />
    </div>
  );
}

const SECTIONS = [
  { href: '#companies', label: 'Companies' },
  { href: '#team', label: 'Team' },
  { href: '#notifications', label: 'Notifications' },
  { href: '#display', label: 'Display' },
  { href: '#account', label: 'Account' },
];

export default function SettingsPage() {
  return (
    <main className="wrap">
      <section className="sec stack g32" data-testid="settings">
        <h1 className="t-1">Settings</h1>
        <div className="setgrid">
          <nav className="secnav" aria-label="Settings sections">
            {SECTIONS.map((section) => (
              <a key={section.href} href={section.href}>
                {section.label}
              </a>
            ))}
          </nav>
          <div className="stack g48">
            <Companies />
            <Team />
            <Notifications />
            <Display />
            <Account />
          </div>
        </div>
      </section>
    </main>
  );
}
