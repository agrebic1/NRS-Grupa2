-- RLS politike za tabelu slike_intervencija
-- Tabela je kreirana u sprint9_workflow ali bez ikakvih politika.

ALTER TABLE slike_intervencija ENABLE ROW LEVEL SECURITY;

-- SELECT: svi autentifikovani uposlenici (serviseri, dispečeri, admini)
-- i korisnici koji su vlasnici zahtjeva mogu vidjeti slike
DROP POLICY IF EXISTS "slike_intervencija_select" ON slike_intervencija;
CREATE POLICY "slike_intervencija_select"
  ON slike_intervencija FOR SELECT
  TO authenticated
  USING (
    public.is_uposlenik(auth.uid())
    OR public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM service_requests sr
      WHERE sr.id = slike_intervencija.zahtjev_id
        AND sr.user_id = auth.uid()
    )
  );

-- INSERT: autentifikovani uposlenik, uploaded_by mora biti vlastiti uid
-- (aplikacijska logika u /api/slike dodatno provjerava je li korisnik
--  dodijeljeni serviser ili dispečer za taj zahtjev)
DROP POLICY IF EXISTS "slike_intervencija_insert" ON slike_intervencija;
CREATE POLICY "slike_intervencija_insert"
  ON slike_intervencija FOR INSERT
  TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid()
    AND public.is_uposlenik(auth.uid())
  );

-- DELETE: vlasnik uploada, dispečer ili admin
DROP POLICY IF EXISTS "slike_intervencija_delete" ON slike_intervencija;
CREATE POLICY "slike_intervencija_delete"
  ON slike_intervencija FOR DELETE
  TO authenticated
  USING (
    uploaded_by = auth.uid()
    OR public.is_dispecer(auth.uid())
    OR public.is_admin(auth.uid())
  );
