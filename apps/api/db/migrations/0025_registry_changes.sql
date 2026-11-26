-- Registry change history (23 Nov 2026). When a scan stores register facts that differ from what
-- was held before, each difference is kept here: which field, the old and new value, when, and
-- which source said so. Written in the same transaction as the scan's result.
--
-- As with monitoring_change, a fact that holds people's names (officers, people with control,
-- shareholders) keeps only its key: detail_withheld is true and both values are null.
-- A source that couldn't be checked, or that answered "not found", never makes a row.

CREATE TABLE registry_change (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  company_id      uuid NOT NULL,
  scan_id         uuid NOT NULL,
  -- The fact key, such as registry.uk.companies_house.status.
  field           text NOT NULL,
  old_value       jsonb,
  new_value       jsonb,
  detail_withheld boolean NOT NULL DEFAULT false,
  -- The connector id and its name in words.
  source          text,
  source_name     text,
  is_fixture      boolean NOT NULL DEFAULT false,
  changed_at      timestamptz NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (scan_id, field),
  FOREIGN KEY (organisation_id, company_id) REFERENCES company (organisation_id, id) ON DELETE CASCADE,
  FOREIGN KEY (organisation_id, scan_id) REFERENCES scan (organisation_id, id) ON DELETE CASCADE
);
CREATE INDEX registry_change_company_idx ON registry_change (company_id, changed_at DESC);
CREATE INDEX registry_change_org_idx ON registry_change (organisation_id);

ALTER TABLE registry_change ENABLE ROW LEVEL SECURITY;
ALTER TABLE registry_change FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON registry_change
  USING (organisation_id = app_current_org()) WITH CHECK (organisation_id = app_current_org());
GRANT SELECT, INSERT, UPDATE, DELETE ON registry_change TO vero_app;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON registry_change FOR EACH ROW EXECUTE FUNCTION set_updated_at();
