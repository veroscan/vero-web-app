-- Share links: a name, and how often a link has been opened (23 Nov 2026).
--
-- name: optional, so a team can tell its links apart ("For the seed round").
-- view_count and last_viewed_at: a public open of the link adds one and stamps the time. Nothing
-- about who opened it is kept: no address, no browser, no location. An open by someone signed in
-- to the organisation that made the link (its own preview) isn't counted.

ALTER TABLE shared_report
  ADD COLUMN name           text CHECK (name IS NULL OR char_length(name) BETWEEN 1 AND 80),
  ADD COLUMN view_count     integer NOT NULL DEFAULT 0 CHECK (view_count >= 0),
  ADD COLUMN last_viewed_at timestamptz;
