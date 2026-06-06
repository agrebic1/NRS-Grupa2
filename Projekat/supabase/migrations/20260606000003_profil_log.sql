-- US-51: Audit log za promjene bazne lokacije servisera.
-- Bilježi svaku promjenu bazna_latitude / bazna_longitude u osoba tabeli.

CREATE TABLE IF NOT EXISTS profil_log (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tip         TEXT        NOT NULL DEFAULT 'bazna_lokacija',
  staro_lat   DOUBLE PRECISION,
  staro_lng   DOUBLE PRECISION,
  novo_lat    DOUBLE PRECISION,
  novo_lng    DOUBLE PRECISION,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Korisnik vidi samo vlastite logove; insert radi servisni nalog (server-side)
ALTER TABLE profil_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profil_log_korisnik_select" ON profil_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "profil_log_service_insert" ON profil_log
  FOR INSERT WITH CHECK (true);

-- Indeks za brže upite po korisniku
CREATE INDEX IF NOT EXISTS profil_log_user_id_idx ON profil_log(user_id);
