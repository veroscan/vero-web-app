-- Backend v2, steps 9, 10 and 12 (docs/BACKEND-V2-PLAN.md, 19 Nov 2026). Nothing is dropped.
--
-- 1. The lawyer service is gone. Its tables stay, unused, so no data is lost: they are marked here.
-- 2. Stripe billing: which Stripe customer is which organisation, and which webhook events have
--    been handled (each one once). Both are system-scope tables: the webhook arrives with no
--    tenant, finds the organisation here by ids only, then enters that one tenant to change its plan.
-- 3. Public share and badge links no longer carry the organisation id. A new link is an opaque
--    random token; this system-scope index maps its hash to the tenant and row, ids only. Links
--    made before this keep working through their old form.
-- 4. Two-step sign-in recovery codes: ten one-time codes per person, stored only as hashes.

COMMENT ON TABLE document_order IS 'Unused since 19 Nov 2026: document orders were removed with the lawyer service. Kept so no data is lost.';
COMMENT ON TABLE lawyer_booking IS 'Unused since 19 Nov 2026: lawyer bookings were removed with the lawyer service. Kept so no data is lost.';
COMMENT ON TABLE review_task IS 'Unused since 19 Nov 2026: document review was removed with the lawyer service. Kept so no data is lost.';
COMMENT ON TABLE review_verdict IS 'No new rows since 19 Nov 2026 (lawyer service removed). Kept: verdicts written before then are still read by the engine.';

CREATE TABLE billing_account (
  organisation_id        uuid PRIMARY KEY REFERENCES organisation (id) ON DELETE CASCADE,
  stripe_customer_id     text NOT NULL UNIQUE,
  stripe_subscription_id text UNIQUE,
  -- Stripe's own words: active, trialing, past_due, canceled, unpaid and so on.
  status                 text,
  price_id               text,
  current_period_end     timestamptz,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE stripe_event (
  event_id    text PRIMARY KEY,
  type        text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public_token_index (
  token_hash text PRIMARY KEY,
  kind       text NOT NULL CHECK (kind IN ('share', 'badge')),
  tenant_id  uuid NOT NULL REFERENCES organisation (id) ON DELETE CASCADE,
  ref_id     uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX public_token_index_tenant_idx ON public_token_index (tenant_id);

CREATE TABLE mfa_recovery_code (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
  code_hash  text NOT NULL UNIQUE,
  used_at    timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX mfa_recovery_code_user_idx ON mfa_recovery_code (user_id);

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['billing_account', 'stripe_event', 'public_token_index', 'mfa_recovery_code'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY system_scope_only ON %I USING (app_in_system_scope()) WITH CHECK (app_in_system_scope())', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON %I TO vero_app', t);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t);
  END LOOP;
END;
$$;
