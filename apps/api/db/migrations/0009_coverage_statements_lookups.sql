-- What each score rests on, the "we don't have this" statement, and requests for a person to
-- look a company up. Empty slots no longer depend on the plan, so that column goes.

ALTER TABLE score_snapshot
  DROP COLUMN empty_slots_counted,
  ADD COLUMN coverage jsonb NOT NULL DEFAULT '{"counted": 0, "total": 0}',
  ADD COLUMN held_by_urgent boolean NOT NULL DEFAULT false;

-- The person says they don't have the document a rule asks for. This is what turns an unseen
-- document into a real gap. Uploading the document clears it.
CREATE TABLE missing_document_statement (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  company_id      uuid NOT NULL,
  rule_key        text NOT NULL,
  stated_by       uuid REFERENCES "user" (id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, company_id, rule_key),
  FOREIGN KEY (organisation_id, company_id) REFERENCES company (organisation_id, id) ON DELETE CASCADE
);

-- "A person will look it up": a register didn't find the company and someone should try by hand.
CREATE TABLE lookup_request (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id     uuid NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  country             text NOT NULL CHECK (country IN ('US-DE', 'GB', 'NG')),
  legal_name          text NOT NULL CHECK (length(legal_name) BETWEEN 1 AND 300),
  registration_number text,
  note                text,
  status              text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'in_progress', 'completed', 'cancelled')),
  requested_by        uuid REFERENCES "user" (id) ON DELETE SET NULL,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['missing_document_statement', 'lookup_request'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY tenant_isolation ON %I USING (organisation_id = app_current_org()) WITH CHECK (organisation_id = app_current_org())', t);
    EXECUTE format('CREATE INDEX %I ON %I (organisation_id)', t || '_org_idx', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON %I TO vero_app', t);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t);
  END LOOP;
END;
$$;

ALTER TABLE staff_notification DROP CONSTRAINT staff_notification_kind_check;
ALTER TABLE staff_notification ADD CONSTRAINT staff_notification_kind_check
  CHECK (kind IN ('document_order', 'lawyer_booking', 'lookup_request'));
