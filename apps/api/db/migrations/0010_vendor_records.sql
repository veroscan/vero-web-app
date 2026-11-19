-- Paid data vendors (Middesk, Cobalt, Mono). Each lookup costs money, so per company we keep
-- the vendor's own reference for it (Middesk's business id) and the last good answer, which
-- monitoring and repeated scans reuse for VENDOR_CACHE_DAYS. Errors are never kept here.
-- "Check again" skips the kept answer, under its own per-company rate limit.

CREATE TABLE vendor_record (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id    uuid NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  company_id         uuid NOT NULL,
  connector_id       text NOT NULL CHECK (connector_id IN ('us.delaware_vendor', 'ng.cac_vendor')),
  -- The vendor's reference for this company. An identifier, not a secret.
  vendor_business_id text CHECK (vendor_business_id IS NULL OR length(vendor_business_id) BETWEEN 1 AND 200),
  -- The last good answer (found or not_found), as the connector returned it. Holds the same
  -- facts a source_result row holds, never raw vendor responses.
  cached_result      jsonb,
  cached_at          timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, company_id, connector_id),
  CHECK ((cached_result IS NULL) = (cached_at IS NULL)),
  FOREIGN KEY (organisation_id, company_id) REFERENCES company (organisation_id, id) ON DELETE CASCADE
);

ALTER TABLE vendor_record ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_record FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON vendor_record
  USING (organisation_id = app_current_org()) WITH CHECK (organisation_id = app_current_org());
CREATE INDEX vendor_record_org_idx ON vendor_record (organisation_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON vendor_record TO vero_app;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON vendor_record FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- A vendor still preparing its report is "waiting": not down, not done, and the retry job asks again.
ALTER TABLE source_result DROP CONSTRAINT source_result_status_check;
ALTER TABLE source_result ADD CONSTRAINT source_result_status_check
  CHECK (status IN ('found', 'not_found', 'ambiguous', 'error', 'unsupported', 'unavailable', 'waiting'));
