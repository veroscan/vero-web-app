-- Own and follow (owner's decision, 19 Nov 2026; docs/BACKEND-V2-PLAN.md, step 1).
--
-- 1. company.relationship: 'own' (this team runs the company and can add evidence) or 'follow'
--    (a read-only public-data scan of someone else's company, kept in the follower's own
--    organisation). The default is 'own', so every existing row stays as it was. Row-level
--    security is unchanged: a followed company is a row of the follower's organisation, and
--    nothing is shared across organisations.
-- 2. company_last_seen: when each person last looked at a company, so the home screen can say
--    what changed since then. A tenant table with row-level security, ids and numbers only.

ALTER TABLE company
  ADD COLUMN relationship text NOT NULL DEFAULT 'own' CHECK (relationship IN ('own', 'follow'));
CREATE INDEX company_relationship_idx ON company (organisation_id, relationship);

CREATE TABLE company_last_seen (
  organisation_id   uuid NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  company_id        uuid NOT NULL,
  user_id           uuid NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
  -- The newest finished scan (scan.finalised_seq) when the person last looked, and the one
  -- before that look. Changes after previous_seen_seq are what's new to them.
  seen_seq          bigint,
  previous_seen_seq bigint,
  seen_at           timestamptz NOT NULL DEFAULT now(),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (company_id, user_id),
  FOREIGN KEY (organisation_id, company_id) REFERENCES company (organisation_id, id) ON DELETE CASCADE
);
CREATE INDEX company_last_seen_org_idx ON company_last_seen (organisation_id);

ALTER TABLE company_last_seen ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_last_seen FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON company_last_seen
  USING (organisation_id = app_current_org()) WITH CHECK (organisation_id = app_current_org());
GRANT SELECT, INSERT, UPDATE, DELETE ON company_last_seen TO vero_app;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON company_last_seen FOR EACH ROW EXECUTE FUNCTION set_updated_at();
