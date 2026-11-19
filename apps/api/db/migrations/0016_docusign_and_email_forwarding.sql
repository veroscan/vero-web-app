-- Two document connections: DocuSign (the customer signs in to DocuSign and picks completed
-- envelopes) and a private forwarding address per organisation (files emailed to it). Both
-- bring files into the vault through the same path as an upload: unconfirmed, waiting for a
-- person. Nothing a connection brings in says a document is genuine, validly signed or
-- legally sufficient.
--
-- Nothing secret is stored in plain text: DocuSign's tokens are sealed with AES-256-GCM under a
-- key derived from APP_ENCRYPTION_KEY for this purpose and this organisation; a forwarding
-- address is stored only as a SHA-256 hash (and four characters to recognise it by). No
-- signer's name or email, and no email sender address, subject or body is ever stored.

-- ---- DocuSign ----

CREATE TABLE docusign_connection (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id    uuid NOT NULL UNIQUE REFERENCES organisation (id) ON DELETE CASCADE,
  -- DocuSign's account id (a GUID) and its display name. Identifiers, not secrets.
  account_id         text NOT NULL CHECK (account_id ~ '^[0-9A-Fa-f-]{36}$'),
  account_name       text CHECK (account_name IS NULL OR length(account_name) <= 200),
  -- Where DocuSign said this account's API lives, checked to be https on docusign.net.
  base_uri           text NOT NULL CHECK (length(base_uri) BETWEEN 10 AND 200),
  -- active: usable. revoked: DocuSign refused our tokens, so the person must connect again.
  status             text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  -- Versioned AES-256-GCM envelope ("v1." + base64) of the access and refresh tokens. Null
  -- once revoked. Never logged, audited or returned.
  sealed_tokens      text CHECK (sealed_tokens IS NULL OR sealed_tokens LIKE 'v1.%'),
  access_expires_at  timestamptz,
  scope              text CHECK (scope IS NULL OR length(scope) <= 200),
  -- Plain words about the last thing that went wrong. Never anything DocuSign sent.
  last_error         text CHECK (last_error IS NULL OR length(last_error) <= 300),
  connected_by       uuid REFERENCES "user" (id) ON DELETE SET NULL,
  connected_at       timestamptz NOT NULL DEFAULT now(),
  last_pulled_at     timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  CHECK (status = 'revoked' OR sealed_tokens IS NOT NULL)
);

-- Each envelope a person picked and we brought in. Counts and dates only: no names, no emails,
-- no subject.
CREATE TABLE docusign_envelope_pull (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id        uuid NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  company_id             uuid NOT NULL,
  account_id             text NOT NULL CHECK (account_id ~ '^[0-9A-Fa-f-]{36}$'),
  envelope_id            text NOT NULL CHECK (envelope_id ~ '^[0-9A-Fa-f-]{36}$'),
  completed_at           timestamptz NOT NULL,
  signer_count           integer NOT NULL CHECK (signer_count >= 0),
  certificate_retrieved  boolean NOT NULL DEFAULT false,
  documents_added        integer NOT NULL DEFAULT 0 CHECK (documents_added >= 0),
  pulled_by              uuid REFERENCES "user" (id) ON DELETE SET NULL,
  pulled_at              timestamptz NOT NULL DEFAULT now(),
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, company_id, envelope_id),
  FOREIGN KEY (organisation_id, company_id) REFERENCES company (organisation_id, id) ON DELETE CASCADE
);

-- ---- Forwarding by email ----

CREATE TABLE inbound_email_address (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id   uuid NOT NULL UNIQUE REFERENCES organisation (id) ON DELETE CASCADE,
  -- The company the files are evidence for.
  company_id        uuid NOT NULL,
  status            text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  -- The last four characters of the address, so a person can tell which one is live.
  hint              text NOT NULL CHECK (hint ~ '^[a-z2-7]{4}$'),
  created_by        uuid REFERENCES "user" (id) ON DELETE SET NULL,
  revoked_at        timestamptz,
  last_received_at  timestamptz,
  received_count    integer NOT NULL DEFAULT 0 CHECK (received_count >= 0),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (organisation_id, company_id) REFERENCES company (organisation_id, id) ON DELETE CASCADE
);

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['docusign_connection', 'docusign_envelope_pull', 'inbound_email_address'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY tenant_isolation ON %I USING (organisation_id = app_current_org()) WITH CHECK (organisation_id = app_current_org())', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON %I TO vero_app', t);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t);
  END LOOP;
END;
$$;

-- An email names an address, not an organisation. This lets the webhook find the one tenant to
-- enter from the address's hash, ids only. A revoked or rotated address is removed from here,
-- so it is simply unknown.
CREATE TABLE inbound_email_address_index (
  address_hash  text PRIMARY KEY CHECK (address_hash ~ '^[0-9a-f]{64}$'),
  tenant_id     uuid NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  address_id    uuid NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX inbound_email_address_index_tenant_idx ON inbound_email_address_index (tenant_id);

-- Webhook deliveries already handled (the provider's message id), so a replay does nothing twice.
CREATE TABLE inbound_email_delivery (
  delivery_id  text PRIMARY KEY CHECK (length(delivery_id) BETWEEN 1 AND 100),
  received_at  timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX inbound_email_delivery_received_idx ON inbound_email_delivery (received_at);

-- DocuSign sign-in links already used. The state is signed and expires in 10 minutes; this makes
-- it single use. Purged once expired.
CREATE TABLE docusign_oauth_state_use (
  nonce       text PRIMARY KEY CHECK (length(nonce) BETWEEN 10 AND 64),
  expires_at  timestamptz NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['inbound_email_address_index', 'inbound_email_delivery', 'docusign_oauth_state_use'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY system_scope_only ON %I USING (app_in_system_scope()) WITH CHECK (app_in_system_scope())', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON %I TO vero_app', t);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t);
  END LOOP;
END;
$$;

-- Documents can now also come from DocuSign or from the forwarding address. Same reading and
-- confirming as an upload: nothing counts until a person confirms it.
ALTER TABLE document DROP CONSTRAINT document_source_check;
ALTER TABLE document ADD CONSTRAINT document_source_check
  CHECK (source IN ('upload', 'gdrive', 'notion', 'spotdraft', 'github', 'docusign', 'email'));
