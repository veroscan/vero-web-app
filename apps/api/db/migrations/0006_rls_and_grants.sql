-- Row-level security and privileges.
--
-- The rule: with no context set, every table holding customer or sign-in data returns
-- nothing. RLS is FORCED, so it binds the table owner too, not only the API role. A test
-- walks the catalogue and fails if a table with organisation_id is ever missed here.

DO $$
DECLARE
  t text;
BEGIN
  -- Plain tenant tables: one policy, driven only by app.organisation_id.
  FOREACH t IN ARRAY ARRAY[
    'company', 'company_market', 'answer', 'scan', 'source_result', 'fact', 'finding',
    'score_snapshot', 'action_item', 'document', 'vault_connection', 'review_task',
    'review_verdict', 'verification_badge', 'investor_scan_consent', 'subscription',
    'invoice', 'document_order', 'lawyer_booking', 'deadline', 'notification', 'invitation',
    'membership'
  ] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I USING (organisation_id = app_current_org()) WITH CHECK (organisation_id = app_current_org())',
      t
    );
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I (organisation_id)', t || '_org_idx', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON %I TO vero_app', t);
  END LOOP;

  -- Platform tables: reachable only inside Database.withSystem.
  FOREACH t IN ARRAY ARRAY['session', 'magic_link', 'outbox', 'rate_limit_bucket', 'connector_cache'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY system_scope_only ON %I USING (app_in_system_scope()) WITH CHECK (app_in_system_scope())',
      t
    );
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON %I TO vero_app', t);
  END LOOP;

  -- Reference data: readable, not writable, by the API.
  FOREACH t IN ARRAY ARRAY['jurisdiction', 'rule_pack', 'rule', 'question_set', 'question', 'vault_slot', 'plan'] LOOP
    EXECUTE format('GRANT SELECT ON %I TO vero_app', t);
  END LOOP;

  -- updated_at on every table that has the column.
  FOR t IN
    SELECT table_name FROM information_schema.columns
    WHERE table_schema = 'public' AND column_name = 'updated_at'
  LOOP
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t);
  END LOOP;
END;
$$;

-- A person can always see their own memberships, which is how the API finds out which
-- organisations they belong to before any tenant context exists.
CREATE POLICY membership_self_read ON membership FOR SELECT
  USING (user_id = app_current_user());

-- The requesting investor can read a consent row. Writes stay with the company's organisation.
CREATE POLICY investor_consent_requester_read ON investor_scan_consent FOR SELECT
  USING (requester_org_id = app_current_org());

ALTER TABLE organisation ENABLE ROW LEVEL SECURITY;
ALTER TABLE organisation FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON organisation
  USING (id = app_current_org())
  WITH CHECK (id = app_current_org());
CREATE POLICY organisation_member_read ON organisation FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM membership m
    WHERE m.organisation_id = organisation.id AND m.user_id = app_current_user()
  ));
GRANT SELECT, INSERT, UPDATE, DELETE ON organisation TO vero_app;

ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user" FORCE ROW LEVEL SECURITY;
-- Sign-in looks people up by email before any tenant exists.
CREATE POLICY user_system_scope ON "user"
  USING (app_in_system_scope())
  WITH CHECK (app_in_system_scope());
CREATE POLICY user_self ON "user"
  USING (id = app_current_user())
  WITH CHECK (id = app_current_user());
-- Teammates can see each other, and nobody else.
CREATE POLICY user_same_organisation_read ON "user" FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM membership m
    WHERE m.user_id = "user".id AND m.organisation_id = app_current_org()
  ));
GRANT SELECT, INSERT, UPDATE, DELETE ON "user" TO vero_app;

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log FORCE ROW LEVEL SECURITY;
CREATE POLICY audit_read ON audit_log FOR SELECT
  USING (organisation_id = app_current_org() OR (organisation_id IS NULL AND app_in_system_scope()));
CREATE POLICY audit_insert ON audit_log FOR INSERT
  WITH CHECK (organisation_id = app_current_org() OR app_in_system_scope());
-- Deliberately no UPDATE or DELETE grant, on top of the trigger in 0005.
GRANT SELECT, INSERT ON audit_log TO vero_app;

ALTER TABLE job_run ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_run FORCE ROW LEVEL SECURITY;
CREATE POLICY job_run_access ON job_run
  USING (app_in_system_scope() OR organisation_id = app_current_org())
  WITH CHECK (app_in_system_scope() OR organisation_id = app_current_org());
GRANT SELECT, INSERT, UPDATE, DELETE ON job_run TO vero_app;

GRANT USAGE ON SCHEMA public TO vero_app;
GRANT EXECUTE ON FUNCTION app_current_org(), app_current_user(), app_in_system_scope() TO vero_app;
