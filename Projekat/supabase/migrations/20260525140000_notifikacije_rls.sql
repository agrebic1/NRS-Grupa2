-- RLS za notifikacije: korisnik vidi/ažurira samo svoje; insert ide preko service role (API).

ALTER TABLE notifikacije ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifikacije_select_own" ON notifikacije;
CREATE POLICY "notifikacije_select_own"
  ON notifikacije FOR SELECT
  TO authenticated
  USING (korisnik_id = auth.uid());

DROP POLICY IF EXISTS "notifikacije_update_own" ON notifikacije;
CREATE POLICY "notifikacije_update_own"
  ON notifikacije FOR UPDATE
  TO authenticated
  USING (korisnik_id = auth.uid())
  WITH CHECK (korisnik_id = auth.uid());
