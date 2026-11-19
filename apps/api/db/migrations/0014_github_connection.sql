-- The GitHub connection: a read-only GitHub App the customer installs on their own account,
-- choosing the repositories on GitHub's own screen. We read a fixed list of files and facts
-- (see packages/connectors/src/github/allowlist.ts) from the repositories the customer then
-- chooses to include here. Default: none.
--
-- Nothing secret is stored: no tokens (installation tokens live only in memory, minutes at a
-- time), no keys, no passwords, and no file contents beyond what becomes a vault document
-- through the normal upload path.

CREATE TABLE github_installation (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id  uuid NOT NULL UNIQUE REFERENCES organisation (id) ON DELETE CASCADE,
  -- GitHub's number for the installation. An identifier, not a secret.
  installation_id  bigint NOT NULL UNIQUE CHECK (installation_id > 0),
  account_login    text NOT NULL CHECK (length(account_login) BETWEEN 1 AND 39),
  account_type     text NOT NULL CHECK (length(account_type) BETWEEN 1 AND 40),
  -- active: readable. suspended: the customer suspended the app on GitHub. revoked: GitHub
  -- says the installation is gone or refuses the app.
  status           text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'revoked')),
  -- Plain words about the last thing that went wrong. Never anything GitHub sent.
  last_error       text CHECK (last_error IS NULL OR length(last_error) <= 300),
  connected_by     uuid REFERENCES "user" (id) ON DELETE SET NULL,
  connected_at     timestamptz NOT NULL DEFAULT now(),
  suspended_at     timestamptz,
  last_synced_at   timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, id)
);

CREATE TABLE github_repository (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id  uuid NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  installation_id  uuid NOT NULL,
  repo_id          bigint NOT NULL CHECK (repo_id > 0),
  full_name        text NOT NULL CHECK (length(full_name) BETWEEN 3 AND 141),
  -- Only repositories the customer chose here are ever read. GitHub's own choice is not enough.
  selected         boolean NOT NULL DEFAULT false,
  -- The company whose evidence this repository is. Required once selected.
  company_id       uuid,
  default_branch   text,
  last_synced_at   timestamptz,
  last_error       text CHECK (last_error IS NULL OR length(last_error) <= 300),
  -- Per allowlisted path: ETag, blob sha and size, for conditional requests. Never content.
  file_state       jsonb NOT NULL DEFAULT '{}',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, repo_id),
  CHECK (NOT selected OR company_id IS NOT NULL),
  FOREIGN KEY (organisation_id, installation_id) REFERENCES github_installation (organisation_id, id) ON DELETE CASCADE,
  FOREIGN KEY (organisation_id, company_id) REFERENCES company (organisation_id, id) ON DELETE CASCADE
);
CREATE INDEX github_repository_installation_idx ON github_repository (installation_id);

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['github_installation', 'github_repository'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY tenant_isolation ON %I USING (organisation_id = app_current_org()) WITH CHECK (organisation_id = app_current_org())', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON %I TO vero_app', t);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t);
  END LOOP;
END;
$$;

-- GitHub's webhooks name an installation, not an organisation. This lets the webhook find the
-- one tenant to enter, ids only, without opening any tenant table (like company_sweep).
CREATE TABLE github_installation_index (
  installation_id  bigint PRIMARY KEY CHECK (installation_id > 0),
  tenant_id        uuid NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- Webhook deliveries already handled, so a replayed delivery does nothing twice.
CREATE TABLE github_webhook_delivery (
  delivery_id      text PRIMARY KEY CHECK (length(delivery_id) BETWEEN 1 AND 100),
  event            text NOT NULL CHECK (length(event) BETWEEN 1 AND 60),
  received_at      timestamptz NOT NULL DEFAULT now(),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX github_webhook_delivery_received_idx ON github_webhook_delivery (received_at);

-- Install links already used. The state is signed and expires in 10 minutes; this makes it
-- single use. Purged once expired.
CREATE TABLE github_install_state_use (
  nonce            text PRIMARY KEY CHECK (length(nonce) BETWEEN 10 AND 64),
  expires_at       timestamptz NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['github_installation_index', 'github_webhook_delivery', 'github_install_state_use'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY system_scope_only ON %I USING (app_in_system_scope()) WITH CHECK (app_in_system_scope())', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON %I TO vero_app', t);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t);
  END LOOP;
END;
$$;

-- Documents can now also come from a connected GitHub repository. They go through the same
-- reading and confirming as an upload: nothing counts until a person confirms it.
ALTER TABLE document DROP CONSTRAINT document_source_check;
ALTER TABLE document ADD CONSTRAINT document_source_check
  CHECK (source IN ('upload', 'gdrive', 'notion', 'spotdraft', 'github'));
