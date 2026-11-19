-- Which packs each scan really used, and whether empty document slots counted as gaps. Both
-- are needed to explain an old score after a company's markets or plan have changed.
ALTER TABLE scan ADD COLUMN packs_used jsonb NOT NULL DEFAULT '[]';
ALTER TABLE score_snapshot ADD COLUMN empty_slots_counted boolean NOT NULL DEFAULT true;
