-- Which kinds of notification also send an email, per person, per organisation (23 Nov 2026).
-- No row means every kind is on. Sign-in links and invitations are not notifications and are
-- always sent. A tenant table: a person in two organisations chooses for each.

CREATE TABLE notification_preference (
  organisation_id uuid NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
  email_deadline  boolean NOT NULL DEFAULT true,
  email_score     boolean NOT NULL DEFAULT true,
  email_team      boolean NOT NULL DEFAULT true,
  -- Updates on a company we were asked to look up by hand (the notification kind stored as 'lawyer').
  email_lookup    boolean NOT NULL DEFAULT true,
  email_system    boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (organisation_id, user_id)
);

ALTER TABLE notification_preference ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preference FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON notification_preference
  USING (organisation_id = app_current_org()) WITH CHECK (organisation_id = app_current_org());
GRANT SELECT, INSERT, UPDATE, DELETE ON notification_preference TO vero_app;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON notification_preference FOR EACH ROW EXECUTE FUNCTION set_updated_at();
