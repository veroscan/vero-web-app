-- Stored copies of the public lists three sources read: the ICO register file, the NDPC list
-- and the OFAC, UK and UN sanctions lists. Shared by every tenant; no customer data lives here.
--
-- Like the other reference tables, the API role can read it but not change it. The refresh
-- job writes only through the three functions below, which need system scope. A copy is
-- replaced in one statement, and only by a download that was read and checked first: a
-- failed, empty or suspiciously small download records its reason and leaves the copy alone.

CREATE TABLE reference_data (
  key           text PRIMARY KEY CHECK (key IN ('uk.ico_register', 'ng.ndpc_list', 'sanctions.ofac', 'sanctions.uk', 'sanctions.un')),
  -- The last good copy, as the publisher sent it. Null until the first good download.
  content       text,
  content_hash  text CHECK (content_hash IS NULL OR content_hash ~ '^[0-9a-f]{64}$'),
  etag          text,
  last_modified text,
  -- When this content was downloaded.
  fetched_at    timestamptz,
  -- When the publisher last confirmed it is current: a new download or a "not modified".
  -- Freshness is measured from here.
  checked_at    timestamptz,
  row_count     integer CHECK (row_count IS NULL OR row_count > 0),
  -- Plain words, never an address or a header.
  last_error    text CHECK (last_error IS NULL OR length(last_error) <= 500),
  last_error_at timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CHECK ((content IS NULL) = (content_hash IS NULL)),
  CHECK ((content IS NULL) = (fetched_at IS NULL)),
  CHECK ((content IS NULL) = (checked_at IS NULL)),
  CHECK ((content IS NULL) = (row_count IS NULL))
);

GRANT SELECT ON reference_data TO vero_app;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON reference_data FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- A good new copy replaces the old one whole.
CREATE FUNCTION reference_data_replace(
  p_key text, p_content text, p_content_hash text, p_etag text, p_last_modified text, p_row_count integer, p_at timestamptz
) RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $$
BEGIN
  IF NOT app_in_system_scope() THEN
    RAISE EXCEPTION 'reference_data_replace needs system scope' USING ERRCODE = '42501';
  END IF;
  IF p_content IS NULL OR length(p_content) = 0 OR p_row_count IS NULL OR p_row_count <= 0 THEN
    RAISE EXCEPTION 'an empty copy is never stored' USING ERRCODE = '22023';
  END IF;
  INSERT INTO reference_data (key, content, content_hash, etag, last_modified, fetched_at, checked_at, row_count, last_error, last_error_at)
    VALUES (p_key, p_content, p_content_hash, p_etag, p_last_modified, p_at, p_at, p_row_count, NULL, NULL)
  ON CONFLICT (key) DO UPDATE SET
    content = EXCLUDED.content, content_hash = EXCLUDED.content_hash, etag = EXCLUDED.etag,
    last_modified = EXCLUDED.last_modified, fetched_at = EXCLUDED.fetched_at, checked_at = EXCLUDED.checked_at,
    row_count = EXCLUDED.row_count, last_error = NULL, last_error_at = NULL;
END;
$$;

-- The publisher says nothing changed: the copy we hold is current as of now.
CREATE FUNCTION reference_data_confirm(p_key text, p_etag text, p_last_modified text, p_at timestamptz) RETURNS boolean
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $$
DECLARE
  changed integer;
BEGIN
  IF NOT app_in_system_scope() THEN
    RAISE EXCEPTION 'reference_data_confirm needs system scope' USING ERRCODE = '42501';
  END IF;
  UPDATE reference_data
    SET checked_at = p_at, etag = COALESCE(p_etag, etag), last_modified = COALESCE(p_last_modified, last_modified),
        last_error = NULL, last_error_at = NULL
    WHERE key = p_key AND content IS NOT NULL;
  GET DIAGNOSTICS changed = ROW_COUNT;
  RETURN changed = 1;
END;
$$;

-- A download that wasn't used. The copy, if any, stays exactly as it was.
CREATE FUNCTION reference_data_fail(p_key text, p_error text, p_at timestamptz) RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $$
BEGIN
  IF NOT app_in_system_scope() THEN
    RAISE EXCEPTION 'reference_data_fail needs system scope' USING ERRCODE = '42501';
  END IF;
  INSERT INTO reference_data (key, last_error, last_error_at) VALUES (p_key, left(p_error, 500), p_at)
  ON CONFLICT (key) DO UPDATE SET last_error = EXCLUDED.last_error, last_error_at = EXCLUDED.last_error_at;
END;
$$;

REVOKE ALL ON FUNCTION reference_data_replace(text, text, text, text, text, integer, timestamptz) FROM PUBLIC;
REVOKE ALL ON FUNCTION reference_data_confirm(text, text, text, timestamptz) FROM PUBLIC;
REVOKE ALL ON FUNCTION reference_data_fail(text, text, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION reference_data_replace(text, text, text, text, text, integer, timestamptz) TO vero_app;
GRANT EXECUTE ON FUNCTION reference_data_confirm(text, text, text, timestamptz) TO vero_app;
GRANT EXECUTE ON FUNCTION reference_data_fail(text, text, timestamptz) TO vero_app;
