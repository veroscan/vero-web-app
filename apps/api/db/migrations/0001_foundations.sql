-- Foundations: request-context helpers and shared triggers.
--
-- Context is set per transaction with set_config(..., true), so it can never leak
-- between pooled connections. NULLIF matters: after a transaction ends Postgres can
-- leave a custom setting as '' on that connection, and ''::uuid would raise an error.

CREATE FUNCTION app_current_org() RETURNS uuid
  LANGUAGE sql STABLE
  AS $$ SELECT NULLIF(current_setting('app.organisation_id', true), '')::uuid $$;

CREATE FUNCTION app_current_user() RETURNS uuid
  LANGUAGE sql STABLE
  AS $$ SELECT NULLIF(current_setting('app.user_id', true), '')::uuid $$;

-- True only inside Database.withSystem, used for platform tables (sessions, sign-in links,
-- outbox). With no explicit scope those tables also return nothing.
CREATE FUNCTION app_in_system_scope() RETURNS boolean
  LANGUAGE sql STABLE
  AS $$ SELECT COALESCE(current_setting('app.scope', true), '') = 'system' $$;

CREATE FUNCTION set_updated_at() RETURNS trigger
  LANGUAGE plpgsql
  AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE FUNCTION forbid_mutation() RETURNS trigger
  LANGUAGE plpgsql
  AS $$
BEGIN
  RAISE EXCEPTION '% is append-only', TG_TABLE_NAME;
END;
$$;
