BEGIN;

ALTER TABLE intervention_activities
  DROP CONSTRAINT IF EXISTS intervention_activities_tip_check;

ALTER TABLE intervention_activities
  ADD CONSTRAINT intervention_activities_tip_check CHECK (tip IN (
    'status_promjena',
    'napomena',
    'dodjela',
    'evidencija',
    'odbijanje',
    'sistem',
    'slika',
    'tim_dodjela',
    'tim_uklanjanje',
    'zatvaranje',
    'konflikt_override',
    'nije_rijeseno',
    'promjena_izvrsioca',
    'vracanje_na_dodjelu',
    'sla_eskalacija',
    'promjena_prioriteta'
  ));

COMMIT;
