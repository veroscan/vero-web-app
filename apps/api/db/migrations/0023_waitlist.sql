-- The website's "Join the waitlist" form (19 Nov 2026). Not tied to any organisation: people on
-- the waitlist have no account yet. System scope only, like public_token_index.
CREATE TABLE waitlist_entry (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Lower-cased, so one person is one row however they type it.
  email       text NOT NULL UNIQUE CHECK (email = lower(email)),
  name        text NOT NULL,
  company     text,
  message     text,
  -- The form's two choices ("need" and "budget" in the website's code), kept as sent.
  details     jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- How many times this address joined. A repeat updates the row instead of telling anyone it exists.
  submissions integer NOT NULL DEFAULT 1,
  invited_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX waitlist_entry_created_idx ON waitlist_entry (created_at DESC);

ALTER TABLE waitlist_entry ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist_entry FORCE ROW LEVEL SECURITY;
CREATE POLICY system_scope_only ON waitlist_entry USING (app_in_system_scope()) WITH CHECK (app_in_system_scope());
GRANT SELECT, INSERT, UPDATE, DELETE ON waitlist_entry TO vero_app;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON waitlist_entry FOR EACH ROW EXECUTE FUNCTION set_updated_at();
