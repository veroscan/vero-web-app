-- 0028 said scan.status had no CHECK constraint. It does (0004: scan_status_check), so 'cancelled'
-- must be added to it before a scan can be cancelled.

ALTER TABLE scan DROP CONSTRAINT scan_status_check;
ALTER TABLE scan ADD CONSTRAINT scan_status_check CHECK (status IN ('queued', 'running', 'partial', 'completed', 'failed', 'cancelled'));
