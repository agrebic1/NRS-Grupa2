-- Sprint 9: završetak MVP — materijal/dijelovi, ponovni ciklusi, SLA eskalacija

ALTER TABLE work_evidence
  ADD COLUMN IF NOT EXISTS stavke_materijala jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE service_requests
  ADD COLUMN IF NOT EXISTS broj_ponovnih_ciklusa integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sla_eskalacija_at timestamptz;

COMMENT ON COLUMN work_evidence.stavke_materijala IS 'US-46: niz {naziv, kolicina, jedinica}';
COMMENT ON COLUMN service_requests.broj_ponovnih_ciklusa IS 'US-47: broj operativnih ponovnih dodjela / nije riješeno';
COMMENT ON COLUMN service_requests.sla_eskalacija_at IS 'US-45: zadnja SLA eskalacija (sprječava duplikat obavještenja)';

-- US-45: dozvoli tip aktivnosti sla_eskalacija
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
    'sla_eskalacija'
  ));
