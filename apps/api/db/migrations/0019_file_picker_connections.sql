-- Two picker-based document connections: Google Drive and SharePoint / OneDrive. The person
-- picks files in the provider's own picker; only those files are read, each becomes an
-- unconfirmed vault document waiting for a person, exactly like an upload. Nothing a connection
-- brings in says a document is genuine, validly signed or legally sufficient.
--
-- Nothing secret is stored in plain text: the provider's tokens are sealed with AES-256-GCM
-- under a key derived from APP_ENCRYPTION_KEY for this purpose, this provider and this
-- organisation. No account email, no person's name and no file content is stored here.

CREATE TABLE file_picker_connection (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id    uuid NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  provider           text NOT NULL CHECK (provider IN ('google_drive', 'sharepoint')),
  -- Google Drive only: the domain part of the Google account (for example gmail.com or
  -- kestrelpay.example). Never the address itself.
  account_domain     text CHECK (account_domain IS NULL OR account_domain ~ '^[a-z0-9.-]{1,253}$'),
  -- SharePoint / OneDrive only: the Microsoft tenant id (a GUID). An identifier, not a secret.
  tenant_id          text CHECK (tenant_id IS NULL OR tenant_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'),
  -- active: usable. revoked: the provider refused our tokens, so the person must connect again.
  status             text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  -- Versioned AES-256-GCM envelope ("v1." + base64) of the access and refresh tokens. Null
  -- once revoked. Never logged, audited or returned.
  sealed_tokens      text CHECK (sealed_tokens IS NULL OR sealed_tokens LIKE 'v1.%'),
  access_expires_at  timestamptz,
  scope              text CHECK (scope IS NULL OR length(scope) <= 300),
  -- Plain words about the last thing that went wrong. Never anything the provider sent.
  last_error         text CHECK (last_error IS NULL OR length(last_error) <= 300),
  connected_by       uuid REFERENCES "user" (id) ON DELETE SET NULL,
  connected_at       timestamptz NOT NULL DEFAULT now(),
  last_pulled_at     timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, provider),
  CHECK (status = 'revoked' OR sealed_tokens IS NOT NULL)
);

ALTER TABLE file_picker_connection ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_picker_connection FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON file_picker_connection USING (organisation_id = app_current_org()) WITH CHECK (organisation_id = app_current_org());
GRANT SELECT, INSERT, UPDATE, DELETE ON file_picker_connection TO vero_app;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON file_picker_connection FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Sign-in links already used, for both providers. The state is signed and expires in 10
-- minutes; this makes it single use. Purged once expired.
CREATE TABLE file_picker_oauth_state_use (
  nonce       text PRIMARY KEY CHECK (length(nonce) BETWEEN 10 AND 64),
  provider    text NOT NULL CHECK (provider IN ('google_drive', 'sharepoint')),
  expires_at  timestamptz NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX file_picker_oauth_state_use_expires_idx ON file_picker_oauth_state_use (expires_at);

ALTER TABLE file_picker_oauth_state_use ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_picker_oauth_state_use FORCE ROW LEVEL SECURITY;
CREATE POLICY system_scope_only ON file_picker_oauth_state_use USING (app_in_system_scope()) WITH CHECK (app_in_system_scope());
GRANT SELECT, INSERT, UPDATE, DELETE ON file_picker_oauth_state_use TO vero_app;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON file_picker_oauth_state_use FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Documents can now also come from Google Drive or SharePoint / OneDrive. Same reading and
-- confirming as an upload: nothing counts until a person confirms it.
ALTER TABLE document DROP CONSTRAINT document_source_check;
ALTER TABLE document ADD CONSTRAINT document_source_check
  CHECK (source IN ('upload', 'gdrive', 'notion', 'spotdraft', 'github', 'docusign', 'email', 'google_drive', 'sharepoint'));
