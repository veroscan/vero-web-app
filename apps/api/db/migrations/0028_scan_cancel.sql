-- Cancelling a scan (24 Nov 2026). A scan that is queued or running can be stopped by the person
-- who asked for it or anyone allowed to run scans. It gets the status 'cancelled' and the time it
-- was stopped here. A cancelled scan never produces findings or a score. The "one active full scan
-- per company" index only counts queued and running, so a new scan can start straight away.
-- scan.status has no CHECK constraint, so the new word needs no change there.

ALTER TABLE scan ADD COLUMN cancelled_at timestamptz;
