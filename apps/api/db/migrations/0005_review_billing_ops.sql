-- Lawyer review, badges, investor consent (unused for now), billing, orders, bookings,
-- deadlines, notifications and system tables.

CREATE TABLE review_task (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  scan_id         uuid NOT NULL,
  assigned_to     uuid REFERENCES "user" (id) ON DELETE SET NULL,
  status          text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'done', 'cancelled')),
  due_at          timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, id),
  FOREIGN KEY (organisation_id, scan_id) REFERENCES scan (organisation_id, id) ON DELETE CASCADE
);

CREATE TABLE review_verdict (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  review_task_id  uuid NOT NULL,
  finding_id      uuid NOT NULL,
  verdict         text NOT NULL CHECK (verdict IN ('confirmed', 'overridden')),
  note            text,
  reviewer_id     uuid REFERENCES "user" (id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (organisation_id, review_task_id) REFERENCES review_task (organisation_id, id) ON DELETE CASCADE,
  FOREIGN KEY (organisation_id, finding_id) REFERENCES finding (organisation_id, id) ON DELETE CASCADE
);

CREATE TABLE verification_badge (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  company_id      uuid NOT NULL,
  issued_at       timestamptz NOT NULL,
  expires_at      timestamptz NOT NULL,
  score_at_issue  numeric(5, 2) NOT NULL,
  public_token    text NOT NULL UNIQUE,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (organisation_id, company_id) REFERENCES company (organisation_id, id) ON DELETE CASCADE
);

-- Investor pages come later. Table exists, nothing uses it yet.
CREATE TABLE investor_scan_consent (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id   uuid NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  target_company_id uuid NOT NULL,
  requester_org_id  uuid NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  consent_status    text NOT NULL DEFAULT 'pending' CHECK (consent_status IN ('pending', 'granted', 'refused', 'withdrawn')),
  documents_shared  boolean NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (organisation_id, target_company_id) REFERENCES company (organisation_id, id) ON DELETE CASCADE
);

CREATE TABLE subscription (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id      uuid NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  plan_id              uuid NOT NULL REFERENCES plan (id),
  provider             text,
  provider_ref         text,
  status               text NOT NULL,
  current_period_start timestamptz,
  current_period_end   timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, id)
);

CREATE TABLE invoice (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  subscription_id uuid,
  provider        text,
  provider_ref    text,
  status          text NOT NULL,
  amount_minor    bigint,
  currency        text,
  period_start    timestamptz,
  period_end      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (organisation_id, subscription_id) REFERENCES subscription (organisation_id, id) ON DELETE SET NULL (subscription_id)
);

CREATE TABLE document_order (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id       uuid NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  company_id            uuid NOT NULL,
  finding_id            uuid,
  delivered_document_id uuid,
  requested_by          uuid REFERENCES "user" (id) ON DELETE SET NULL,
  document_type         text NOT NULL,
  title                 text NOT NULL,
  status                text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ordered', 'in_progress', 'delivered', 'cancelled')),
  price_minor           bigint,
  currency              text,
  notes                 text,
  ordered_at            timestamptz,
  delivered_at          timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (organisation_id, company_id) REFERENCES company (organisation_id, id) ON DELETE CASCADE,
  FOREIGN KEY (organisation_id, finding_id) REFERENCES finding (organisation_id, id) ON DELETE SET NULL (finding_id),
  FOREIGN KEY (organisation_id, delivered_document_id) REFERENCES document (organisation_id, id) ON DELETE SET NULL (delivered_document_id)
);

CREATE TABLE lawyer_booking (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id  uuid NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  company_id       uuid NOT NULL,
  finding_id       uuid,
  requested_by     uuid REFERENCES "user" (id) ON DELETE SET NULL,
  lawyer_name      text,
  topic            text NOT NULL,
  scheduled_at     timestamptz,
  duration_minutes integer,
  status           text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'confirmed', 'completed', 'cancelled')),
  meeting_url      text,
  notes            text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (organisation_id, company_id) REFERENCES company (organisation_id, id) ON DELETE CASCADE,
  FOREIGN KEY (organisation_id, finding_id) REFERENCES finding (organisation_id, id) ON DELETE SET NULL (finding_id)
);

CREATE TABLE deadline (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  company_id      uuid NOT NULL,
  finding_id      uuid,
  rule_key        text,
  title           text NOT NULL,
  description     text,
  layer           smallint CHECK (layer BETWEEN 1 AND 6),
  due_on          date NOT NULL,
  status          text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'done', 'missed', 'dismissed')),
  source          text,
  source_url      text,
  recurrence      text,
  penalty_note    text,
  completed_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (organisation_id, company_id) REFERENCES company (organisation_id, id) ON DELETE CASCADE,
  FOREIGN KEY (organisation_id, finding_id) REFERENCES finding (organisation_id, id) ON DELETE SET NULL (finding_id)
);
CREATE INDEX deadline_due_idx ON deadline (organisation_id, due_on);

CREATE TABLE notification (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Stable ordering for pagination; timestamps can tie.
  seq             bigint GENERATED ALWAYS AS IDENTITY UNIQUE,
  organisation_id uuid NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
  kind            text NOT NULL CHECK (kind IN ('deadline', 'lawyer', 'score', 'team', 'system')),
  title           text NOT NULL,
  body            text,
  link            text,
  read_at         timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notification_user_idx ON notification (organisation_id, user_id, seq DESC);

-- Append-only. No foreign keys on purpose: the record of what happened outlives the
-- organisation and the person. It holds opaque ids, never an email address or a token.
CREATE TABLE audit_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seq             bigint GENERATED ALWAYS AS IDENTITY UNIQUE,
  organisation_id uuid,
  actor_id        uuid,
  action          text NOT NULL,
  target          text,
  ip              text,
  user_agent      text,
  metadata        jsonb NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_log_org_idx ON audit_log (organisation_id, seq DESC);
CREATE TRIGGER audit_log_append_only
  BEFORE UPDATE OR DELETE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION forbid_mutation();
CREATE TRIGGER audit_log_no_truncate
  BEFORE TRUNCATE ON audit_log
  FOR EACH STATEMENT EXECUTE FUNCTION forbid_mutation();

CREATE TABLE outbox (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid REFERENCES organisation (id) ON DELETE SET NULL,
  to_email        text NOT NULL,
  template        text NOT NULL,
  subject         text NOT NULL,
  -- Filled only by the development mailer. Real providers never store the body, because
  -- it can contain a sign-in link.
  body_text       text,
  status          text NOT NULL CHECK (status IN ('captured', 'sent', 'failed')),
  provider        text NOT NULL,
  provider_id     text,
  sent_at         timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX outbox_to_idx ON outbox (to_email);

CREATE TABLE rate_limit_bucket (
  key          text NOT NULL,
  window_start timestamptz NOT NULL,
  count        integer NOT NULL,
  expires_at   timestamptz NOT NULL,
  PRIMARY KEY (key, window_start)
);
CREATE INDEX rate_limit_expiry_idx ON rate_limit_bucket (expires_at);

CREATE TABLE job_run (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid REFERENCES organisation (id) ON DELETE CASCADE,
  queue           text NOT NULL,
  job_id          text NOT NULL,
  status          text NOT NULL,
  attempts        integer NOT NULL DEFAULT 0,
  error           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE connector_cache (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connector_id text NOT NULL,
  request_hash text NOT NULL,
  response     jsonb NOT NULL,
  expires_at   timestamptz NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (connector_id, request_hash)
);
