-- Dozvoli dispečerima i serviserima čitanje svih osoba (profila korisnika)
-- Potrebno za prikaz imena podnosilaca na listi zahtjeva (list API koristi regularni klijent).
-- Stara politika "osoba_select_self_or_admin" dozvoljavala samo vlastiti red ili admin.

DROP POLICY IF EXISTS "osoba_select_dispecer_serviser" ON public.osoba;
CREATE POLICY "osoba_select_dispecer_serviser"
  ON public.osoba FOR SELECT
  TO authenticated
  USING (
    public.is_dispecer(auth.uid())
    OR public.is_serviser(auth.uid())
  );
