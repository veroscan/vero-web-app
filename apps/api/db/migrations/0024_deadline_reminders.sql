-- Deadline reminders people choose (23 Nov 2026). How many days before a date an organisation
-- wants to be reminded: one row with no deadline is the organisation's default, and a row with a
-- deadline is that date's own choice. No row at all means the standard 30, 7 and 1 days.
-- A reminder is sent once: the notification's dedupe key carries the deadline and the lead time.

CREATE TABLE deadline_reminder_setting (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  -- Null for the organisation's default.
  deadline_id     uuid REFERENCES deadline (id) ON DELETE CASCADE,
  -- Days before the due date, largest first. Empty means no reminders.
  lead_days       integer[] NOT NULL CHECK (cardinality(lead_days) <= 6 AND 0 <= ALL (lead_days) AND 365 >= ALL (lead_days)),
  set_by          uuid REFERENCES "user" (id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX deadline_reminder_setting_default_idx ON deadline_reminder_setting (organisation_id) WHERE deadline_id IS NULL;
CREATE UNIQUE INDEX deadline_reminder_setting_deadline_idx ON deadline_reminder_setting (deadline_id) WHERE deadline_id IS NOT NULL;
CREATE INDEX deadline_reminder_setting_org_idx ON deadline_reminder_setting (organisation_id);

ALTER TABLE deadline_reminder_setting ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadline_reminder_setting FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON deadline_reminder_setting
  USING (organisation_id = app_current_org()) WITH CHECK (organisation_id = app_current_org());
GRANT SELECT, INSERT, UPDATE, DELETE ON deadline_reminder_setting TO vero_app;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON deadline_reminder_setting FOR EACH ROW EXECUTE FUNCTION set_updated_at();
