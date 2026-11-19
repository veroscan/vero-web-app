-- One more stored public list (docs/SECOND-WAVE-SOURCES.md):
--   sanctions.eu  the EU consolidated financial sanctions list (European Commission, DG FISMA),
--                 kept as entity names only. Nothing about a person is stored.
-- Same table, same three system-scope functions. No country is added anywhere: Germany, South
-- Africa, Kenya and Ghana are still not countries a company can be created in.

ALTER TABLE reference_data DROP CONSTRAINT reference_data_key_check;
ALTER TABLE reference_data ADD CONSTRAINT reference_data_key_check
  CHECK (key IN ('uk.ico_register', 'ng.ndpc_list', 'sanctions.ofac', 'sanctions.uk', 'sanctions.un', 'sanctions.fr', 'fr.cnil_dpo', 'sanctions.eu'));
