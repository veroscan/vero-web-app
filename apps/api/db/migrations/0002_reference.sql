-- Reference data shared by every tenant. No customer data lives here.
-- The API role can read these tables but not change them.

CREATE TABLE jurisdiction (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code        text NOT NULL UNIQUE,
  parent_code text REFERENCES jurisdiction (code),
  name        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

INSERT INTO jurisdiction (code, parent_code, name) VALUES
  ('US', NULL, 'United States'),
  ('US-DE', 'US', 'Delaware'),
  ('GB', NULL, 'United Kingdom'),
  ('NG', NULL, 'Nigeria');

CREATE TABLE rule_pack (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_code text NOT NULL REFERENCES jurisdiction (code),
  version           text NOT NULL,
  -- Rule content ships as draft until Code & Clause approves it.
  status            text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'retired')),
  approved_by       text,
  approved_at       timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (jurisdiction_code, version),
  CONSTRAINT rule_pack_approval_recorded
    CHECK (status <> 'approved' OR (approved_by IS NOT NULL AND approved_at IS NOT NULL))
);

CREATE TABLE rule (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_pack_id   uuid NOT NULL REFERENCES rule_pack (id) ON DELETE CASCADE,
  rule_key       text NOT NULL,
  layer          smallint NOT NULL CHECK (layer BETWEEN 1 AND 6),
  area           text,
  definition     jsonb NOT NULL,
  severity       text NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  confidence     text,
  effective_from date,
  effective_to   date,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (rule_pack_id, rule_key)
);

CREATE TABLE question_set (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version    text NOT NULL UNIQUE,
  status     text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'retired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE question (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_set_id uuid NOT NULL REFERENCES question_set (id) ON DELETE CASCADE,
  key             text NOT NULL,
  type            text NOT NULL,
  options         jsonb,
  show_if         jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (question_set_id, key)
);

CREATE TABLE vault_slot (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  layer         smallint NOT NULL CHECK (layer BETWEEN 1 AND 6),
  key           text NOT NULL UNIQUE,
  title         text NOT NULL,
  description   text,
  required_when jsonb,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE plan (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code       text NOT NULL UNIQUE,
  name       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
