-- Core product: scan pipeline state, re-scoring, vault details, lawyer review, sharing and staff.
--
-- Lawyers and admins of the review desk are NOT organisation roles: a customer can invite
-- anyone into their own organisation as "lawyer" or "admin". The desk therefore looks only
-- at platform_staff, which no customer can write to.

-- ---- Reference data ----

INSERT INTO plan (code, name) VALUES ('free', 'Free'), ('growth', 'Growth'), ('scale', 'Scale');

-- So an approved pack can never silently change under the same version number.
ALTER TABLE rule_pack ADD COLUMN content_hash text;

-- ---- Company ----

ALTER TABLE company
  ADD COLUMN pre_incorporation boolean NOT NULL DEFAULT false,
  ADD COLUMN parent_company_id uuid,
  ADD COLUMN year_end_month smallint CHECK (year_end_month BETWEEN 1 AND 12),
  ADD COLUMN year_end_day smallint CHECK (year_end_day BETWEEN 1 AND 31),
  ADD CONSTRAINT company_parent_fk FOREIGN KEY (organisation_id, parent_company_id)
    REFERENCES company (organisation_id, id) ON DELETE SET NULL (parent_company_id),
  ADD CONSTRAINT company_not_own_parent CHECK (parent_company_id IS NULL OR parent_company_id <> id);

-- ---- Scan pipeline ----

-- Order in which results were written. Evaluation runs under a per-company lock, so the
-- highest number is always the freshest result, whichever scan started first.
CREATE SEQUENCE scan_finalised_seq;
GRANT USAGE ON SEQUENCE scan_finalised_seq TO vero_app;

ALTER TABLE scan
  ADD COLUMN kind text NOT NULL DEFAULT 'full' CHECK (kind IN ('full', 'rescore')),
  ADD COLUMN trigger text NOT NULL DEFAULT 'user',
  ADD COLUMN connectors text[] NOT NULL DEFAULT '{}',
  ADD COLUMN attempts integer NOT NULL DEFAULT 0,
  -- A worker holds the scan until this time. After that another run may take over.
  ADD COLUMN lease_until timestamptz,
  ADD COLUMN finalised_seq bigint,
  ADD COLUMN requested_by uuid REFERENCES "user" (id) ON DELETE SET NULL;
CREATE INDEX scan_company_idx ON scan (company_id, finalised_seq DESC);
-- At most one re-score waiting per company: more changes just join the one already waiting.
CREATE UNIQUE INDEX scan_one_queued_rescore ON scan (organisation_id, company_id) WHERE kind = 'rescore' AND status = 'queued';
-- Asking twice while a scan runs gives you the same scan.
CREATE UNIQUE INDEX scan_one_active_full ON scan (organisation_id, company_id) WHERE kind = 'full' AND status IN ('queued', 'running');

ALTER TABLE source_result
  ADD COLUMN company_id uuid,
  ADD COLUMN source_name text,
  ADD COLUMN evidence_method text,
  ADD COLUMN message text,
  ADD COLUMN is_fixture boolean NOT NULL DEFAULT false,
  ADD COLUMN candidates jsonb NOT NULL DEFAULT '[]',
  ADD COLUMN attempts integer NOT NULL DEFAULT 1,
  ADD CONSTRAINT source_result_once_per_scan UNIQUE (scan_id, connector_id),
  ADD CONSTRAINT source_result_company_fk FOREIGN KEY (organisation_id, company_id)
    REFERENCES company (organisation_id, id) ON DELETE CASCADE;
CREATE INDEX source_result_company_idx ON source_result (company_id, connector_id, retrieved_at DESC);

ALTER TABLE fact
  ADD COLUMN source_name text,
  ADD COLUMN evidence_method text,
  ADD COLUMN is_fixture boolean NOT NULL DEFAULT false;

ALTER TABLE finding
  ADD COLUMN company_id uuid,
  ADD COLUMN scored boolean NOT NULL DEFAULT false,
  ADD COLUMN free_plan_evidence boolean NOT NULL DEFAULT false,
  ADD COLUMN detail jsonb NOT NULL DEFAULT '{}',
  ADD CONSTRAINT finding_once_per_scan UNIQUE (scan_id, rule_key),
  ADD CONSTRAINT finding_company_fk FOREIGN KEY (organisation_id, company_id)
    REFERENCES company (organisation_id, id) ON DELETE CASCADE;
CREATE INDEX finding_company_rule_idx ON finding (company_id, rule_key);

ALTER TABLE score_snapshot
  ALTER COLUMN overall DROP NOT NULL,
  ADD COLUMN company_id uuid,
  ADD COLUMN free_range jsonb,
  ADD CONSTRAINT score_snapshot_once_per_scan UNIQUE (scan_id),
  ADD CONSTRAINT score_snapshot_company_fk FOREIGN KEY (organisation_id, company_id)
    REFERENCES company (organisation_id, id) ON DELETE CASCADE;

ALTER TABLE action_item ADD CONSTRAINT action_item_once_per_scan UNIQUE (scan_id, finding_id);

-- ---- Vault ----

ALTER TABLE document
  ADD COLUMN rejection_reason text,
  ADD COLUMN document_date date,
  ADD COLUMN expires_on date,
  -- The person checked this certificate themselves. Only they can say so.
  ADD COLUMN validated boolean NOT NULL DEFAULT false;

-- ---- Deadlines and notifications ----

ALTER TABLE deadline
  ADD COLUMN monitoring text CHECK (monitoring IN ('auto', 'reminder')),
  ADD COLUMN how_we_track text,
  ADD COLUMN basis text,
  ADD COLUMN needs_review boolean NOT NULL DEFAULT false,
  ADD CONSTRAINT deadline_once_per_date UNIQUE (company_id, rule_key, due_on);

ALTER TABLE notification ADD COLUMN dedupe_key text;
CREATE UNIQUE INDEX notification_no_duplicates ON notification (organisation_id, user_id, dedupe_key)
  WHERE dedupe_key IS NOT NULL;

-- ---- Lawyer review ----

ALTER TABLE review_task
  ALTER COLUMN scan_id DROP NOT NULL,
  ADD COLUMN company_id uuid,
  ADD COLUMN document_id uuid,
  -- Copied here so the queue never has to read the client's tables.
  ADD COLUMN organisation_name text,
  ADD COLUMN company_name text,
  ADD COLUMN country text,
  ADD COLUMN document_title text,
  ADD COLUMN slot_key text,
  ADD COLUMN rule_keys text[] NOT NULL DEFAULT '{}',
  ADD COLUMN completed_at timestamptz,
  ADD CONSTRAINT review_task_company_fk FOREIGN KEY (organisation_id, company_id)
    REFERENCES company (organisation_id, id) ON DELETE CASCADE,
  ADD CONSTRAINT review_task_document_fk FOREIGN KEY (organisation_id, document_id)
    REFERENCES document (organisation_id, id) ON DELETE SET NULL (document_id);
CREATE UNIQUE INDEX review_task_one_open_per_document ON review_task (organisation_id, document_id)
  WHERE status IN ('open', 'in_progress');
CREATE INDEX review_task_queue_idx ON review_task (status, created_at);

ALTER TABLE review_verdict
  ALTER COLUMN finding_id DROP NOT NULL,
  DROP CONSTRAINT review_verdict_verdict_check,
  ADD COLUMN company_id uuid,
  ADD COLUMN document_id uuid,
  ADD COLUMN rule_key text,
  ADD COLUMN override_outcome text CHECK (override_outcome IN ('pass', 'gap', 'defect', 'verify', 'not_applicable')),
  ADD CONSTRAINT review_verdict_verdict_check
    CHECK (verdict IN ('sufficient', 'needs_changes', 'not_sufficient', 'confirmed', 'overridden')),
  ADD CONSTRAINT review_verdict_company_fk FOREIGN KEY (organisation_id, company_id)
    REFERENCES company (organisation_id, id) ON DELETE CASCADE,
  ADD CONSTRAINT review_verdict_document_fk FOREIGN KEY (organisation_id, document_id)
    REFERENCES document (organisation_id, id) ON DELETE SET NULL (document_id);
CREATE INDEX review_verdict_company_idx ON review_verdict (company_id, created_at DESC);

-- ---- Badge and shared report. Stored tokens are SHA-256 hashes, never the link itself. ----

ALTER TABLE verification_badge ADD COLUMN revoked_at timestamptz;

CREATE TABLE shared_report (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  company_id      uuid NOT NULL,
  token_hash      text NOT NULL UNIQUE,
  -- Frozen at creation from an allow-list. Holds counts and words, never issue details.
  summary         jsonb NOT NULL,
  created_by      uuid REFERENCES "user" (id) ON DELETE SET NULL,
  expires_at      timestamptz NOT NULL,
  revoked_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (organisation_id, company_id) REFERENCES company (organisation_id, id) ON DELETE CASCADE
);

-- ---- Platform tables: reachable only inside Database.withSystem ----

CREATE TABLE platform_staff (
  user_id    uuid PRIMARY KEY REFERENCES "user" (id) ON DELETE CASCADE,
  role       text NOT NULL CHECK (role IN ('lawyer', 'admin')),
  granted_by uuid REFERENCES "user" (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- What the review desk needs to act on an order or a booking, and no more.
-- These two platform tables say tenant_id, not organisation_id: organisation_id marks a table
-- as tenant data, governed by app.organisation_id. These are reachable only in system scope.
CREATE TABLE staff_notification (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid REFERENCES organisation (id) ON DELETE CASCADE,
  kind            text NOT NULL CHECK (kind IN ('document_order', 'lawyer_booking')),
  ref_id          uuid NOT NULL,
  title           text NOT NULL,
  body            text,
  read_at         timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX staff_notification_recent ON staff_notification (created_at DESC);

-- How each data source is doing overall. Holds no customer data.
CREATE TABLE connector_health (
  connector_id         text PRIMARY KEY,
  last_status          text NOT NULL,
  last_checked_at      timestamptz NOT NULL,
  last_ok_at           timestamptz,
  last_failure_at      timestamptz,
  consecutive_failures integer NOT NULL DEFAULT 0,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

-- Lets background sweeps find what is due without opening any tenant's tables: ids and
-- dates only. Each sweep then enters that one tenant with withOrg to do the work.
CREATE TABLE company_sweep (
  company_id           uuid PRIMARY KEY REFERENCES company (id) ON DELETE CASCADE,
  tenant_id            uuid NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  next_source_retry_at timestamptz,
  source_retry_count   integer NOT NULL DEFAULT 0,
  -- A scan that should be moving. If this time passes, a sweep starts it again.
  scan_in_flight_id    uuid,
  scan_in_flight_until timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX company_sweep_retry_idx ON company_sweep (next_source_retry_at);

DO $$
DECLARE
  t text;
BEGIN
  EXECUTE 'ALTER TABLE shared_report ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE shared_report FORCE ROW LEVEL SECURITY';
  EXECUTE 'CREATE POLICY tenant_isolation ON shared_report USING (organisation_id = app_current_org()) WITH CHECK (organisation_id = app_current_org())';
  EXECUTE 'CREATE INDEX shared_report_org_idx ON shared_report (organisation_id)';
  EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON shared_report TO vero_app';
  EXECUTE 'CREATE TRIGGER set_updated_at BEFORE UPDATE ON shared_report FOR EACH ROW EXECUTE FUNCTION set_updated_at()';

  FOREACH t IN ARRAY ARRAY['platform_staff', 'staff_notification', 'connector_health', 'company_sweep'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY system_scope_only ON %I USING (app_in_system_scope()) WITH CHECK (app_in_system_scope())', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON %I TO vero_app', t);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t);
  END LOOP;
END;
$$;

-- ---- Rule pack approval ----
--
-- The API role still cannot write to rule_pack directly. This function is the one way to
-- approve, always with a named approver, and only from the admin route's system scope.
CREATE FUNCTION approve_rule_pack(pack_jurisdiction text, pack_version text, approver text)
  RETURNS boolean
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $$
DECLARE
  changed integer;
BEGIN
  IF NOT app_in_system_scope() THEN
    RAISE EXCEPTION 'approve_rule_pack needs system scope' USING ERRCODE = '42501';
  END IF;
  IF approver IS NULL OR length(trim(approver)) < 2 THEN
    RAISE EXCEPTION 'approval needs a named approver' USING ERRCODE = '22023';
  END IF;
  UPDATE rule_pack
    SET status = 'approved', approved_by = trim(approver), approved_at = now()
    WHERE jurisdiction_code = pack_jurisdiction AND version = pack_version AND status = 'draft';
  GET DIAGNOSTICS changed = ROW_COUNT;
  RETURN changed = 1;
END;
$$;
REVOKE ALL ON FUNCTION approve_rule_pack(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION approve_rule_pack(text, text, text) TO vero_app;

-- ---- The review desk: the one deliberate, narrow way across tenants ----
--
-- Two scopes, set only by Database.withReviewQueue and Database.withReviewTask, both ending
-- with the transaction:
--
--   queue: reads review_task and nothing else. The row holds a company name and a document
--          title copied at creation, so listing the queue opens no client table. A lawyer
--          sees tasks that are unassigned or their own. An admin sees all.
--   task:  one task. Its document and linked findings are readable only once that task is
--          assigned to this person (or by an admin). It cannot see any other row of the client.
--
-- app.user_id is the staff member, and app.organisation_id stays unset, so every ordinary
-- tenant policy keeps returning nothing.
CREATE FUNCTION app_review_queue_role() RETURNS text
  LANGUAGE sql STABLE
  AS $$ SELECT NULLIF(current_setting('app.review_queue_role', true), '') $$;

CREATE FUNCTION app_review_task_role() RETURNS text
  LANGUAGE sql STABLE
  AS $$ SELECT NULLIF(current_setting('app.review_task_role', true), '') $$;

CREATE FUNCTION app_review_task() RETURNS uuid
  LANGUAGE sql STABLE
  AS $$ SELECT NULLIF(current_setting('app.review_task_id', true), '')::uuid $$;

GRANT EXECUTE ON FUNCTION app_review_queue_role(), app_review_task_role(), app_review_task() TO vero_app;

CREATE POLICY review_queue_read ON review_task FOR SELECT
  USING (
    app_review_queue_role() = 'admin'
    OR (app_review_queue_role() = 'lawyer' AND (assigned_to IS NULL OR assigned_to = app_current_user()))
  );

CREATE POLICY review_scope_read ON review_task FOR SELECT
  USING (
    id = app_review_task()
    AND (app_review_task_role() = 'admin' OR assigned_to IS NULL OR assigned_to = app_current_user())
  );

CREATE POLICY review_scope_update ON review_task FOR UPDATE
  USING (
    id = app_review_task()
    AND (app_review_task_role() = 'admin' OR assigned_to IS NULL OR assigned_to = app_current_user())
  )
  WITH CHECK (id = app_review_task() AND (app_review_task_role() = 'admin' OR assigned_to = app_current_user()));

CREATE POLICY review_scope_document_read ON document FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM review_task t
    WHERE t.id = app_review_task() AND t.document_id = document.id
      AND (app_review_task_role() = 'admin' OR t.assigned_to = app_current_user())
  ));

CREATE POLICY review_scope_finding_read ON finding FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM review_task t
    WHERE t.id = app_review_task() AND t.company_id = finding.company_id AND finding.rule_key = ANY (t.rule_keys)
      AND (app_review_task_role() = 'admin' OR t.assigned_to = app_current_user())
  ));

CREATE POLICY review_scope_verdict_read ON review_verdict FOR SELECT
  USING (review_task_id = app_review_task());

CREATE POLICY review_scope_verdict_write ON review_verdict FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM review_task t
    WHERE t.id = app_review_task() AND t.id = review_verdict.review_task_id
      AND t.organisation_id = review_verdict.organisation_id
      AND (app_review_task_role() = 'admin' OR t.assigned_to = app_current_user())
  ));

-- So the record of what a reviewer did commits together with the change, under the client's
-- organisation, where the client can read it.
CREATE POLICY review_scope_audit_insert ON audit_log FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM review_task t
    WHERE t.id = app_review_task() AND t.organisation_id = audit_log.organisation_id
  ));

-- ---- The admin directory: who has an account and where. Read-only. ----
CREATE FUNCTION app_admin_directory() RETURNS boolean
  LANGUAGE sql STABLE
  AS $$ SELECT COALESCE(current_setting('app.admin_directory', true), '') = 'on' $$;
GRANT EXECUTE ON FUNCTION app_admin_directory() TO vero_app;

CREATE POLICY admin_directory_read ON membership FOR SELECT USING (app_admin_directory());
CREATE POLICY admin_directory_read ON organisation FOR SELECT USING (app_admin_directory());
CREATE POLICY admin_directory_read ON "user" FOR SELECT USING (app_admin_directory());
