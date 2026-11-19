-- An organisation's own switches. The first is the Claude document helper: off unless the
-- organisation turns it on, so no customer document leaves our system without its say-so.
-- No row means every switch is off.
--
-- What each helper call cost (token counts only, never the document or what the model wrote)
-- goes in audit_log as 'document.helper_used'. The daily cap per organisation uses the
-- existing rate_limit_bucket counters.

CREATE TABLE organisation_setting (
  organisation_id          uuid PRIMARY KEY REFERENCES organisation (id) ON DELETE CASCADE,
  document_helper_enabled  boolean NOT NULL DEFAULT false,
  -- Who last changed it, and when.
  document_helper_set_by   uuid,
  document_helper_set_at   timestamptz,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE organisation_setting ENABLE ROW LEVEL SECURITY;
ALTER TABLE organisation_setting FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON organisation_setting
  USING (organisation_id = app_current_org()) WITH CHECK (organisation_id = app_current_org());
GRANT SELECT, INSERT, UPDATE, DELETE ON organisation_setting TO vero_app;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON organisation_setting FOR EACH ROW EXECUTE FUNCTION set_updated_at();
