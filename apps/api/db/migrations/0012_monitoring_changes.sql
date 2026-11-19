-- What changed between a monitoring re-scan and the result before it. One row per monitoring
-- scan, written in the same transaction as that scan's result. A source that couldn't be
-- checked is listed in not_checked and is never counted as a change.
--
-- Fact values are kept only for facts that hold no one's name: for lists of officers, people
-- with control or shareholders, only the key is kept.

CREATE TABLE monitoring_change (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id   uuid NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  company_id        uuid NOT NULL,
  scan_id           uuid NOT NULL REFERENCES scan (id) ON DELETE CASCADE,
  previous_scan_id  uuid REFERENCES scan (id) ON DELETE SET NULL,
  facts_changed     jsonb NOT NULL DEFAULT '[]',
  findings_new      jsonb NOT NULL DEFAULT '[]',
  findings_resolved jsonb NOT NULL DEFAULT '[]',
  score_before      numeric(5, 2),
  score_after       numeric(5, 2),
  deadlines_new     jsonb NOT NULL DEFAULT '[]',
  -- Sources that were down, waiting or missing a number this time.
  not_checked       text[] NOT NULL DEFAULT '{}',
  -- Why people were told, if they were: new_urgent_finding, status_change, sanctions_match, score_drop.
  meaningful        text[] NOT NULL DEFAULT '{}',
  notified          boolean NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, scan_id),
  FOREIGN KEY (organisation_id, company_id) REFERENCES company (organisation_id, id) ON DELETE CASCADE
);
CREATE INDEX monitoring_change_company_idx ON monitoring_change (company_id, created_at DESC);

ALTER TABLE monitoring_change ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_change FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON monitoring_change
  USING (organisation_id = app_current_org()) WITH CHECK (organisation_id = app_current_org());
CREATE INDEX monitoring_change_org_idx ON monitoring_change (organisation_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON monitoring_change TO vero_app;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON monitoring_change FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- The daily job looks for monitoring scans already queued today, per organisation.
CREATE INDEX scan_monitoring_idx ON scan (organisation_id, created_at) WHERE trigger = 'monitoring';
