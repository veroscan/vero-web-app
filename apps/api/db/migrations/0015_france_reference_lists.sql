-- Two more stored public lists, for the French data sources (docs/FRANCE.md):
--   sanctions.fr  the DG Trésor national asset-freeze register, kept as entity names only;
--   fr.cnil_dpo   the CNIL list of organisations that designated a DPO, kept as SIRENs and dates only.
-- Neither copy holds anything about a person. Same table, same three system-scope functions.
-- Nothing else changes: France is still not a country a company can be created in.

ALTER TABLE reference_data DROP CONSTRAINT reference_data_key_check;
ALTER TABLE reference_data ADD CONSTRAINT reference_data_key_check
  CHECK (key IN ('uk.ico_register', 'ng.ndpc_list', 'sanctions.ofac', 'sanctions.uk', 'sanctions.un', 'sanctions.fr', 'fr.cnil_dpo'));
