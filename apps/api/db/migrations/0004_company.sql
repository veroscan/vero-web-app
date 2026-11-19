-- Companies, questionnaire answers, scans, findings, scores and vault.
--
-- Child rows reference their parent with (organisation_id, parent_id). Foreign key checks
-- ignore row-level security, so without the composite key a row in organisation A could
-- point at a company in organisation B. The composite key makes that impossible.

CREATE TABLE company (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id      uuid NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  legal_name           text NOT NULL CHECK (length(legal_name) BETWEEN 1 AND 300),
  registration_number  text,
  entity_type          text,
  -- MVP scope: Delaware, United Kingdom, Nigeria and nothing else.
  incorporation_country text NOT NULL REFERENCES jurisdiction (code)
    CHECK (incorporation_country IN ('US-DE', 'GB', 'NG')),
  incorporation_state  text GENERATED ALWAYS AS
    (CASE WHEN incorporation_country = 'US-DE' THEN 'DE' END) STORED,
  stage                text CHECK (stage IN ('idea', 'pre_seed', 'seed', 'series_a', 'series_b_plus')),
  sector               text[] NOT NULL DEFAULT '{}',
  website              text,
  created_by           uuid REFERENCES "user" (id) ON DELETE SET NULL,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, id)
);
CREATE UNIQUE INDEX company_unique_registration
  ON company (organisation_id, incorporation_country, registration_number)
  WHERE registration_number IS NOT NULL;

CREATE TABLE company_market (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  company_id      uuid NOT NULL,
  country         text NOT NULL REFERENCES jurisdiction (code) CHECK (country IN ('US-DE', 'GB', 'NG')),
  kind            text NOT NULL CHECK (kind IN ('operates', 'users', 'investors')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, country, kind),
  FOREIGN KEY (organisation_id, company_id) REFERENCES company (organisation_id, id) ON DELETE CASCADE
);

CREATE TABLE answer (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  company_id      uuid NOT NULL,
  question_id     uuid NOT NULL REFERENCES question (id),
  value           jsonb NOT NULL,
  answered_by     uuid REFERENCES "user" (id) ON DELETE SET NULL,
  answered_at     timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, question_id),
  FOREIGN KEY (organisation_id, company_id) REFERENCES company (organisation_id, id) ON DELETE CASCADE
);

CREATE TABLE scan (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id    uuid NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  company_id         uuid NOT NULL,
  type               text NOT NULL DEFAULT 'self' CHECK (type IN ('self', 'investor', 'free')),
  status             text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'partial', 'completed', 'failed')),
  started_at         timestamptz,
  completed_at       timestamptz,
  rule_pack_versions jsonb NOT NULL DEFAULT '{}',
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, id),
  FOREIGN KEY (organisation_id, company_id) REFERENCES company (organisation_id, id) ON DELETE CASCADE
);

CREATE TABLE source_result (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id  uuid NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  scan_id          uuid NOT NULL,
  connector_id     text NOT NULL,
  -- "unavailable" means no key or the source is down. It never counts for or against the score.
  status           text NOT NULL CHECK (status IN ('found', 'not_found', 'ambiguous', 'error', 'unsupported', 'unavailable')),
  facts            jsonb NOT NULL DEFAULT '[]',
  source_url       text,
  retrieved_at     timestamptz NOT NULL,
  raw_hash         text,
  match_confidence numeric(4, 3) CHECK (match_confidence BETWEEN 0 AND 1),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (organisation_id, scan_id) REFERENCES scan (organisation_id, id) ON DELETE CASCADE
);

CREATE TABLE fact (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id   uuid NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  company_id        uuid NOT NULL,
  key               text NOT NULL,
  value             jsonb NOT NULL,
  origin            text NOT NULL CHECK (origin IN ('connector', 'answer', 'document', 'reviewer')),
  origin_ref        text,
  -- Every fact says where it came from, when, and how well it is verified.
  source            text NOT NULL,
  source_url        text,
  retrieved_at      timestamptz NOT NULL,
  verification_tier smallint NOT NULL CHECK (verification_tier BETWEEN 1 AND 5),
  match_confidence  numeric(4, 3) CHECK (match_confidence BETWEEN 0 AND 1),
  valid_from        timestamptz NOT NULL DEFAULT now(),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (organisation_id, company_id) REFERENCES company (organisation_id, id) ON DELETE CASCADE
);
CREATE INDEX fact_company_key_idx ON fact (company_id, key);

CREATE TABLE finding (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id   uuid NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  scan_id           uuid NOT NULL,
  rule_id           uuid REFERENCES rule (id),
  rule_key          text NOT NULL,
  rule_pack_version text NOT NULL,
  outcome           text NOT NULL CHECK (outcome IN ('pass', 'gap', 'defect', 'verify', 'not_applicable')),
  layer             smallint NOT NULL CHECK (layer BETWEEN 1 AND 6),
  severity          text NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  explanation       text,
  what_is_missing   text,
  why_it_matters    text,
  if_left           text,
  fix               text,
  evidence_refs     jsonb NOT NULL DEFAULT '[]',
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, id),
  FOREIGN KEY (organisation_id, scan_id) REFERENCES scan (organisation_id, id) ON DELETE CASCADE
);

CREATE TABLE score_snapshot (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id    uuid NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  scan_id            uuid NOT NULL,
  overall            numeric(5, 2) NOT NULL CHECK (overall BETWEEN 0 AND 100),
  layer_scores       jsonb NOT NULL,
  method_version     text NOT NULL,
  rule_pack_versions jsonb NOT NULL,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (organisation_id, scan_id) REFERENCES scan (organisation_id, id) ON DELETE CASCADE
);

CREATE TABLE action_item (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  scan_id         uuid NOT NULL,
  finding_id      uuid NOT NULL,
  rank            integer NOT NULL,
  title           text NOT NULL,
  action_type     text NOT NULL CHECK (action_type IN ('quick_order', 'consult', 'upload', 'attest', 'file', 'register', 'renew', 'pay', 'draft', 'review', 'fix_website', 'screen', 'answer')),
  priority        numeric(8, 3),
  points          numeric(5, 2),
  status          text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'done', 'dismissed')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (organisation_id, scan_id) REFERENCES scan (organisation_id, id) ON DELETE CASCADE,
  FOREIGN KEY (organisation_id, finding_id) REFERENCES finding (organisation_id, id) ON DELETE CASCADE
);

CREATE TABLE document (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id             uuid NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  company_id                  uuid NOT NULL,
  slot_id                     uuid REFERENCES vault_slot (id),
  storage_key                 text,
  external_ref                text,
  source                      text NOT NULL CHECK (source IN ('upload', 'gdrive', 'notion', 'spotdraft')),
  file_name                   text,
  file_hash                   text,
  mime                        text,
  size_bytes                  bigint,
  pages                       integer,
  classification              text,
  classification_confidence   numeric(4, 3) CHECK (classification_confidence BETWEEN 0 AND 1),
  -- AI proposes a classification; a person always confirms it.
  classification_confirmed_by uuid REFERENCES "user" (id) ON DELETE SET NULL,
  classification_confirmed_at timestamptz,
  extracted_fields            jsonb NOT NULL DEFAULT '{}',
  status                      text NOT NULL DEFAULT 'pending',
  uploaded_by                 uuid REFERENCES "user" (id) ON DELETE SET NULL,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, id),
  CHECK (storage_key IS NOT NULL OR external_ref IS NOT NULL),
  FOREIGN KEY (organisation_id, company_id) REFERENCES company (organisation_id, id) ON DELETE CASCADE
);

CREATE TABLE vault_connection (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id       uuid NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  provider              text NOT NULL CHECK (provider IN ('gdrive', 'notion', 'spotdraft')),
  encrypted_credentials text NOT NULL,
  scopes                text[] NOT NULL DEFAULT '{}',
  status                text NOT NULL DEFAULT 'active',
  last_synced_at        timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, provider)
);
