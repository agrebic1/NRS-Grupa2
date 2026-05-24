-- RISK-1: Normalizacija dupliranog inicijalnog statusa
-- 'na_cekanju' i 'pending_review' su semantički isti; kanonski oblik je 'pending_review'.
-- Migrira postojeće 'na_cekanju' redove i dodaje trigger koji sprječava novi unos 'na_cekanju'.

UPDATE service_requests
  SET status = 'pending_review'
  WHERE status = 'na_cekanju';

-- Trigger: svaki INSERT/UPDATE koji pokušava postaviti 'na_cekanju' automatski dobija 'pending_review'.
CREATE OR REPLACE FUNCTION fn_normalize_status()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'na_cekanju' THEN
    NEW.status := 'pending_review';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_normalize_status ON service_requests;
CREATE TRIGGER trg_normalize_status
  BEFORE INSERT OR UPDATE OF status ON service_requests
  FOR EACH ROW EXECUTE FUNCTION fn_normalize_status();

-- DB-RISK-5: Atomni increment za broj_ponovnih_ciklusa
-- Zamjenjuje aplikacijski UPDATE sa SET broj = broj + 1 koji je već atomičan u PostgreSQL-u,
-- ali dodajemo funkciju kako bi API poziv bio uvijek siguran uz konkurentne transakcije.
CREATE OR REPLACE FUNCTION fn_inkrementiraj_ponovni_ciklus(p_zahtjev_id integer)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_novi integer;
BEGIN
  UPDATE service_requests
    SET broj_ponovnih_ciklusa = COALESCE(broj_ponovnih_ciklusa, 0) + 1
    WHERE id = p_zahtjev_id
    RETURNING broj_ponovnih_ciklusa INTO v_novi;
  RETURN COALESCE(v_novi, 1);
END;
$$;

COMMENT ON FUNCTION fn_inkrementiraj_ponovni_ciklus IS
  'DB-RISK-5: Atomni increment broj_ponovnih_ciklusa — vraća novi broj. Koristiti umjesto aplikacijskog čitanje-uvećaj-upiši.';
