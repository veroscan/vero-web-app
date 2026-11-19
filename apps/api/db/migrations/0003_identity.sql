-- Identity: organisations, people, membership, invitations, sessions and sign-in links.
--
-- Account deletion is a real DELETE of the "user" row, so there is no deleted_at column
-- (plan section 7 listed one). Rows that only mention a person use ON DELETE SET NULL.

CREATE TABLE organisation (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL CHECK (length(name) BETWEEN 1 AND 200),
  type       text NOT NULL DEFAULT 'company' CHECK (type IN ('company', 'investor', 'individual')),
  plan_id    uuid REFERENCES plan (id) ON DELETE SET NULL,
  region     text,
  -- Marks the fictional seed organisation, so it can never be mistaken for real data.
  is_demo    boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "user" (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email                 text NOT NULL UNIQUE CHECK (email = lower(email)),
  name                  text,
  locale                text NOT NULL DEFAULT 'en-GB',
  mfa_enabled           boolean NOT NULL DEFAULT false,
  -- AES-256-GCM ciphertext. Never stored or logged in the clear.
  totp_secret_encrypted text,
  totp_confirmed_at     timestamptz,
  -- Highest time step already used, so a code cannot be replayed.
  totp_last_used_step   bigint,
  last_sign_in_at       timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE membership (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
  role            text NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'lawyer')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, user_id)
);
CREATE INDEX membership_user_idx ON membership (user_id);

CREATE TABLE invitation (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  email           text NOT NULL CHECK (email = lower(email)),
  role            text NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'lawyer')),
  token_hash      text NOT NULL UNIQUE,
  invited_by      uuid REFERENCES "user" (id) ON DELETE SET NULL,
  expires_at      timestamptz NOT NULL,
  accepted_at     timestamptz,
  accepted_by     uuid REFERENCES "user" (id) ON DELETE SET NULL,
  revoked_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX invitation_one_open_per_email
  ON invitation (organisation_id, email)
  WHERE accepted_at IS NULL AND revoked_at IS NULL;

CREATE TABLE session (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
  -- SHA-256 of the cookie value. The cookie value itself is never stored.
  token_hash             text NOT NULL UNIQUE,
  active_organisation_id uuid REFERENCES organisation (id) ON DELETE SET NULL,
  mfa_verified_at        timestamptz,
  expires_at             timestamptz NOT NULL,
  revoked_at             timestamptz,
  last_seen_at           timestamptz NOT NULL DEFAULT now(),
  ip                     text,
  user_agent             text,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX session_user_idx ON session (user_id);
CREATE INDEX session_expiry_idx ON session (expires_at);

CREATE TABLE magic_link (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email                 text NOT NULL CHECK (email = lower(email)),
  -- SHA-256 of the emailed token.
  token_hash            text NOT NULL UNIQUE,
  expires_at            timestamptz NOT NULL,
  used_at               timestamptz,
  -- Set when the link came from an invitation: where to look it up, and its hash.
  invitation_org_id     uuid,
  invitation_token_hash text,
  ip                    text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX magic_link_email_idx ON magic_link (email);
CREATE INDEX magic_link_expiry_idx ON magic_link (expires_at);
