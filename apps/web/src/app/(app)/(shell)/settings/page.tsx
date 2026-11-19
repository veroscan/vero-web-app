'use client';

import '@/app/styles/pages/settings.css';
import { type Invitation, type Member, type Role, type TotpEnrolResponse } from '@vero/shared';
import { useEffect, useState, type CSSProperties, type FormEvent } from 'react';
import { Icon } from '@/components/Icon';
import { Reveal, Scramble, Words } from '@/components/Motion';
import { useSession } from '@/components/Session';
import { After, Hero, useWatchlist } from '@/components/Shell';
import { TLink } from '@/components/TLink';
import { useToast } from '@/components/Toast';
import { api, asApiError } from '@/lib/api';
import { entitlementsOf, planNameOf, roleCan } from '@/lib/entitlements';
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

function initialsOf(name: string): string {
  return name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function Companies() {
  const { companies } = useSession();
  return (
    <Reveal as="section" className="mod" id="companies">
      <div className="mh">
        <h2>Companies</h2>
        <span className="sub2">The companies in this workspace</span>
      </div>
      {companies.length === 0 ? (
        <p className="bd quiet" data-testid="settings-no-companies">
          You haven&apos;t added a company yet.{' '}
          <TLink className="link" href="/onboarding/company">
            Find your company
          </TLink>
        </p>
      ) : (
        <>
          <div className="rws rows-in">
            {companies.map((company, index) => (
              <TLink className="rw lnk" href={`/company/${company.id}`} key={company.id} data-testid="settings-company" style={{ '--r': index } as CSSProperties}>
                <div>
                  <b>{company.legalName}</b>
                  <small>
                    {countryLong(company.incorporationCountry)}
                    {company.relationship === 'follow' ? ', followed' : ''}
                  </small>
                </div>
                <div className="r">
                  <span className="stx muted">Registry records</span>
                  <Icon name="chev" />
                </div>
              </TLink>
            ))}
          </div>
          <div className="sv start">
            <TLink className="btn btn-g" href="/onboarding/company?add=1" data-testid="settings-add-company">
              <Icon name="plus" />
              Add another company
            </TLink>
          </div>
        </>
      )}
    </Reveal>
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
    <tr data-testid="member-row" data-email={member.email}>
      <td>
        <div className="mbr">
          <span className="av3" aria-hidden="true">
            {initialsOf(name)}
          </span>
          <div className="nm">
            <b>
              {name}
              {isYou ? ' (you)' : ''}
            </b>
            {member.name ? <small>{member.email}</small> : null}
          </div>
        </div>
      </td>
      <td className="rl">
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
          ROLE_WORDS[member.role]
        )}
      </td>
      <td className="muted">Joined {longDate(member.joinedAt)}</td>
      <td className="ac">
        {soleOwner ? (
          <span className="note2" data-testid="sole-owner-note">
            To leave, make someone else an owner first.
          </span>
        ) : touchable || isYou ? (
          asking ? (
            <>
              <button className="danger2" type="button" disabled={busy} onClick={() => void remove()}>
                {isYou ? 'Yes, leave' : 'Yes, remove'}
              </button>
              <button type="button" disabled={busy} onClick={() => setAsking(false)}>
                Keep
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setAsking(true)}>
              {isYou ? 'Leave' : 'Remove'}
            </button>
          )
        ) : null}
        <FormProblem message={problem} />
      </td>
    </tr>
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
    <form className="inv" id="invite" data-testid="invite-form" onSubmit={(event) => void submit(event)}>
      <div className="field">
        <label htmlFor="invite-mail">Their work email</label>
        <input className="input" id="invite-mail" type="email" required autoComplete="off" value={email} onChange={(event) => setEmail(event.target.value)} />
        <small>We&apos;ll email them a link to join. It lasts 7 days.</small>
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
      <div className="invbtns">
        <button className="btn btn-p" type="submit" disabled={busy || email.trim().length === 0}>
          {busy ? 'Sending' : 'Send invite'}
        </button>
        <button className="btn btn-g" type="button" disabled={busy} onClick={onClose}>
          Cancel
        </button>
      </div>
      <FormProblem message={problem} />
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
    <tr data-testid="pending-row" data-email={invitation.email}>
      <td>
        <div className="mbr">
          <span className="av3" aria-hidden="true">
            <Icon name="mail" />
          </span>
          <div className="nm">
            <b>{invitation.email}</b>
            <small>We&apos;ve emailed them. The invite lasts until {longDate(invitation.expiresAt)}.</small>
          </div>
        </div>
      </td>
      <td className="rl">{ROLE_WORDS[invitation.role]}</td>
      <td>
        <span className="st2" style={{ color: 'var(--warn)' }}>
          Invite sent
        </span>
      </td>
      <td className="ac">
        <button type="button" disabled={busy} onClick={() => void revoke()}>
          Withdraw
        </button>
        <FormProblem message={problem} />
      </td>
    </tr>
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
  const count = resource.data?.members.length ?? 0;

  return (
    <Reveal as="section" className="mod" id="team" data-testid="team">
      <div className="mh">
        <h2>Team members</h2>
        <span className="sub2">{resource.data ? `${count} ${count === 1 ? 'person' : 'people'} in this workspace` : 'Who can see and change this workspace'}</span>
      </div>
      {resource.error && !resource.data ? (
        <div className="bd" data-testid="team-error">
          <FormProblem message={resource.error.message} />
          <button className="btn btn-g btn-sm" type="button" onClick={resource.reload} style={{ marginTop: 10 }}>
            Try again
          </button>
        </div>
      ) : resource.data ? (
        <div className="tmwrap">
          <table className="tm">
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th>Since</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="rows-in">
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
            </tbody>
          </table>
        </div>
      ) : (
        <p className="bd quiet" role="status">
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
          <div className="sv start">
            <button className="btn btn-p" type="button" onClick={() => setInviting(true)}>
              <Icon name="plus" />
              Invite someone
            </button>
            <span className="hint2">Members can upload documents and run scans. Read only can see findings and reports.</span>
          </div>
        )
      ) : (
        <p className="bd small2" data-testid="team-no-permission">
          Only an owner or admin can invite people or change roles.
        </p>
      )}
    </Reveal>
  );
}

const UPDATE_KINDS = [
  { title: 'Deadlines approaching', note: '30, 7 and 1 day before a date, and when one passes' },
  { title: 'Score changes', note: 'When a score in this workspace moves' },
  { title: 'Team news', note: 'People joining, and changes to roles' },
  { title: 'From Vero', note: 'Anything about your account itself' },
];

function Notifications() {
  return (
    <Reveal as="section" className="mod" id="notifications">
      <div className="mh">
        <h2>Notifications</h2>
        <span className="sub2">What reaches you, and where</span>
      </div>
      <table className="nm2">
        <thead>
          <tr>
            <th>Update</th>
            <th>In Vero</th>
            <th>By email</th>
          </tr>
        </thead>
        <tbody className="rows-in">
          {UPDATE_KINDS.map((kind, index) => (
            <tr key={kind.title} style={{ '--r': index } as CSSProperties}>
              <td>
                <b>{kind.title}</b>
                <small>{kind.note}</small>
              </td>
              <td>
                <span className="stx" style={{ color: 'var(--good)' }}>
                  On
                </span>
              </td>
              <td>
                <span className="stx muted">Not yet</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="foot4" data-testid="settings-notifications">
        Everything comes to{' '}
        <TLink className="link" href="/notifications">
          What&apos;s new
        </TLink>
        , for owners and admins. You can&apos;t choose between them, or have them emailed, yet.
      </p>
    </Reveal>
  );
}

function Display() {
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);
  useEffect(() => {
    setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
  }, []);
  const pick = (next: 'light' | 'dark') => {
    document.documentElement.setAttribute('data-theme', next);
    setTheme(next);
    try {
      window.localStorage.setItem('vero-theme', next);
    } catch {
      // A private window can refuse. The choice still lasts for this page.
    }
  };
  return (
    <Reveal as="section" className="mod" id="display">
      <div className="mh">
        <h2 id="theme-label">Display</h2>
        <span className="sub2">Light or dark, on this device</span>
      </div>
      <div className="themepick2" role="group" aria-labelledby="theme-label">
        {(['light', 'dark'] as const).map((choice) => (
          <button key={choice} className={`opt2${theme === choice ? ' on' : ''}`} type="button" data-theme-choice={choice} aria-pressed={theme === choice} onClick={() => pick(choice)}>
            <span className={`sw3 ${choice}`} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="lb2">
              <Icon name={choice === 'light' ? 'sun' : 'moon'} />
              {choice === 'light' ? 'Light' : 'Dark'}
            </span>
          </button>
        ))}
      </div>
    </Reveal>
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
    <form className="bd" data-testid="profile" onSubmit={(event) => void submit(event)}>
      <div className="grid2">
        <div className="field">
          <label htmlFor="profile-name">Your name</label>
          <input className="input" id="profile-name" type="text" autoComplete="name" maxLength={120} value={name} onChange={(event) => setName(event.target.value)} />
          <small>How your team sees you</small>
        </div>
        <div className="field">
          <label htmlFor="profile-email">Email</label>
          <input className="input" id="profile-email" type="email" value={user.email} readOnly />
          <small>You sign in with this. It can&apos;t be changed here yet.</small>
        </div>
      </div>
      <FormProblem message={problem} />
      <div className="sv">
        <button className="btn btn-g" type="button" disabled={busy || !changed} onClick={() => setName(user.name ?? '')}>
          Cancel
        </button>
        <button className="btn btn-p" type="submit" disabled={busy || !changed}>
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
    <form className="codeform" onSubmit={(event) => void finish(event)}>
      <div className="field">
        <label htmlFor="totp-code">{label}</label>
        <input className="input" id="totp-code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={(event) => setCode(event.target.value)} />
      </div>
      <div className="invbtns">
        <button className="btn btn-p" type="submit" disabled={busy || code.length !== 6}>
          {submitLabel}
        </button>
        <button className="btn btn-g" type="button" disabled={busy} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );

  return (
    <div data-testid="two-step">
      <div className="rw">
        <div>
          <b>Two-step sign-in</b>
          <small>A code from an authenticator app, as well as your email link</small>
        </div>
        <div className="r">
          <span className="stx" style={{ color: enabled ? 'var(--good)' : 'var(--warn)' }} data-testid="two-step-state">
            {enabled ? 'On' : 'Off'}
          </span>
          {!setup && !turningOff ? (
            enabled ? (
              <button className="btn btn-g" type="button" onClick={() => setTurningOff(true)}>
                Turn off two-step sign-in
              </button>
            ) : (
              <button className="btn btn-g" type="button" disabled={busy} onClick={() => void start()}>
                Set up two-step sign-in
              </button>
            )
          ) : null}
        </div>
      </div>
      {setup ? (
        <div className="panel2" data-testid="two-step-setup">
          <p>Add this key to your authenticator app. It isn&apos;t on until you enter a code from the app.</p>
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
        <div className="panel2" data-testid="two-step-off">
          {codeForm('The 6-digit code from your app', 'Turn it off', () => {
            setTurningOff(false);
            setCode('');
          })}
        </div>
      ) : null}
      <FormProblem message={problem} />
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
    <details className="del" data-testid="delete-account">
      <summary className="rw">
        <div>
          <b className="red">Delete your account</b>
          <small>For good. This can&apos;t be undone.</small>
        </div>
        <div className="r">
          <Icon name="chevd" />
        </div>
      </summary>
      <div className="panel2">
        <p>
          This deletes your account for good, and you can&apos;t undo it. On any team where you&apos;re the only person, it also deletes that team&apos;s companies, documents, scores and share links. On a team with other people, you just leave, and they keep everything. If you&apos;re the only owner of a team with other people, make
          someone else an owner first.
        </p>
        <form className="codeform" onSubmit={(event) => void submit(event)}>
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
          <div className="invbtns">
            <button className="btn btn-g danger" type="submit" disabled={busy || !ready} data-testid="delete-confirm">
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
    <Reveal as="section" className="mod" id="workspaces" data-testid="organisations">
      <div className="mh">
        <h2>Your workspaces</h2>
        <span className="sub2">Switch to another team you belong to</span>
      </div>
      <div className="rws">
        {me.organisations.map((org) => (
          <div className="rw" key={org.id} data-testid="organisation-row">
            <div>
              <b>{org.name}</b>
              <small>{ROLE_WORDS[org.role]}</small>
            </div>
            <div className="r">
              {org.id === me.activeOrganisationId ? (
                <span className="stx" style={{ color: 'var(--good)' }}>
                  You&apos;re here
                </span>
              ) : (
                <button className="btn btn-g" type="button" disabled={busy} onClick={() => void change(org.id)}>
                  Switch
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="bd" style={{ paddingTop: 0 }}>
        <FormProblem message={problem} />
      </div>
    </Reveal>
  );
}

function Security() {
  const session = useSession();
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
    <Reveal as="section" className="mod" id="account">
      <div className="mh">
        <h2>Security</h2>
        <span className="sub2">How you sign in, and signing out</span>
      </div>
      <div className="sub3">Sign-in methods</div>
      <div className="rws">
        <div className="rw">
          <div>
            <b>Email link</b>
            <small>A one-time link sent to {session.me.user.email}. No password to remember.</small>
          </div>
          <div className="r">
            <span className="stx" style={{ color: 'var(--good)' }}>
              On
            </span>
          </div>
        </div>
        <TwoStep />
      </div>
      <div className="sub3 ruled">Sessions</div>
      <div className="rws">
        <div className="rw">
          <div>
            <b>{session.me.user.name ?? session.me.user.email}</b>
            <small>Signed in on this device</small>
          </div>
          <div className="r">
            <button className="btn btn-g" type="button" onClick={() => void session.signOut().catch(() => setProblem("We couldn't sign you out. Check your connection and try again."))}>
              <Icon name="out" />
              Sign out
            </button>
          </div>
        </div>
        <div className="rw">
          <div>
            <b>Sign out everywhere</b>
            <small>Ends every session on every device, this one too.</small>
          </div>
          <div className="r">
            <button className="btn btn-g" type="button" disabled={busy} data-testid="sign-out-everywhere" onClick={() => void everywhere()}>
              Sign out everywhere
            </button>
          </div>
        </div>
        <DeleteAccount />
      </div>
      <div className="bd" style={{ paddingTop: 0 }}>
        <FormProblem message={problem} />
      </div>
    </Reveal>
  );
}

const SECTIONS = [
  { href: '#profile', label: 'Profile' },
  { href: '#companies', label: 'Companies' },
  { href: '#team', label: 'Team members' },
  { href: '#notifications', label: 'Notifications' },
  { href: '#display', label: 'Display' },
  { href: '#account', label: 'Security' },
];
const SECTION_IDS = SECTIONS.map((section) => section.href.slice(1));

/** Marks the section on screen in the side list, as the board does. */
function useCurrentSection(ids: string[]): string {
  const [current, setCurrent] = useState(ids[0] ?? '');
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const seen = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (seen) setCurrent(seen.target.id);
      },
      { rootMargin: '-15% 0px -70% 0px' },
    );
    for (const id of ids) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [ids]);
  return current;
}

export default function SettingsPage() {
  const session = useSession();
  const watchlist = useWatchlist();
  const { me } = session;
  const current = useCurrentSection(SECTION_IDS);
  const org = me.organisations.find((item) => item.id === me.activeOrganisationId);
  const plan = session.overview?.plan;
  const followLimit = entitlementsOf(plan).followLimit;
  const name = me.user.name ?? me.user.email;
  const own = session.companies.filter((company) => company.relationship !== 'follow').length;

  return (
    <div className="pg-settings" data-testid="settings">
      <Hero>
        <div className="pagehead">
          <div>
            <div className="mono kick">
              <Scramble text="Account" /> · <b><Scramble text="Profile, team, alerts" delay={120} /></b>
            </div>
            <h1 className="disp">
              <Words text="Settings" />
            </h1>
            <div className="meta">
              <span>Your account and the {org?.name ?? 'current'} workspace</span>
            </div>
          </div>
        </div>
        <section className="r1">
          <div className="mod gl acct">
            <div className="who">
              <span className="av2" aria-hidden="true">
                {initialsOf(name)}
              </span>
              <div>
                <b>{name}</b>
                <small>{me.user.email}</small>
              </div>
            </div>
            <div className="facts">
              <div>
                <span>Workspace</span>
                <b>{org?.name ?? 'None yet'}</b>
              </div>
              <div>
                <span>Your role</span>
                <b>{org ? ROLE_WORDS[org.role] : 'None'}</b>
              </div>
              <div>
                <span>Companies</span>
                <b>{own}</b>
              </div>
              <div>
                <span>Sign-in</span>
                <b>{me.user.mfaEnabled ? 'Email link and a code' : 'Email link'}</b>
              </div>
            </div>
          </div>
          <div className="mod next">
            <div className="k">Your plan</div>
            <h3>{plan ? planNameOf(plan) : 'Free'}</h3>
            <div className="push">
              <div className="row2">
                <span>Member since</span>
                <b>{longDate(me.user.createdAt)}</b>
              </div>
              <div className="row2">
                <span>Followed companies</span>
                <b>
                  {watchlist?.used ?? watchlist?.companies.length ?? 0} of {followLimit}
                </b>
              </div>
            </div>
            <TLink className="btn" href="/plan" data-testid="settings-plan">
              Plan and billing
            </TLink>
          </div>
        </section>
      </Hero>

      <After>
        <div className="sg">
          <nav className="mod snav" aria-label="Settings sections">
            {SECTIONS.map((section) => (
              <a key={section.href} href={section.href} className={current === section.href.slice(1) ? 'on' : undefined}>
                {section.label}
              </a>
            ))}
            <hr />
            <TLink href="/plan">Plan and billing</TLink>
          </nav>
          <div className="secs">
            <Reveal as="section" className="mod" id="profile">
              <div className="mh">
                <h2>Profile</h2>
                <span className="sub2">How you appear to your team</span>
              </div>
              <Profile />
            </Reveal>
            <Organisations />
            <Companies />
            <Team />
            <Notifications />
            <Display />
            <Security />
          </div>
        </div>
      </After>
    </div>
  );
}
