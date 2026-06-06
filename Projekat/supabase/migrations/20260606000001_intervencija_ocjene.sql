-- US-52: Ocjena korisnika nakon zatvorene intervencije
-- Korisnik može ostaviti ocjenu (1-5) i komentar za svoju zatvorenu intervenciju.
-- Jedna ocjena po intervenciji po korisniku (UNIQUE constraint).

CREATE TABLE IF NOT EXISTS intervencija_ocjene (
  id            BIGSERIAL   PRIMARY KEY,
  zahtjev_id    BIGINT      NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  korisnik_id   UUID        NOT NULL REFERENCES auth.users(id)       ON DELETE CASCADE,
  ocjena        SMALLINT    NOT NULL CHECK (ocjena >= 1 AND ocjena <= 5),
  komentar      TEXT        CHECK (length(komentar) <= 1000),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (zahtjev_id, korisnik_id)
);

CREATE INDEX IF NOT EXISTS idx_intervencija_ocjene_zahtjev
  ON intervencija_ocjene (zahtjev_id);

CREATE INDEX IF NOT EXISTS idx_intervencija_ocjene_korisnik
  ON intervencija_ocjene (korisnik_id);

-- ─── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE intervencija_ocjene ENABLE ROW LEVEL SECURITY;

-- Korisnik može umetnut ocjenu samo za svoju zatvorenu intervenciju
CREATE POLICY "io_korisnik_insert" ON intervencija_ocjene
  FOR INSERT TO authenticated
  WITH CHECK (
    korisnik_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM service_requests
      WHERE id      = zahtjev_id
        AND user_id = auth.uid()
        AND status  = 'zatvoreno'
    )
  );

-- Korisnik može čitati svoju ocjenu
CREATE POLICY "io_korisnik_select" ON intervencija_ocjene
  FOR SELECT TO authenticated
  USING (korisnik_id = auth.uid());

-- Dispečer može čitati sve ocjene
CREATE POLICY "io_dispecer_select" ON intervencija_ocjene
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM   uposlenici u
      JOIN   uloga      ul ON ul.id_uloge = u.id_uloge
      WHERE  u.id_uposlenika = auth.uid()
        AND  lower(ul.naziv) IN ('dispečer', 'dispecer', 'administrator', 'admin')
    )
  );

-- Serviser (dodijeljen) može čitati ocjenu za svoju intervenciju
CREATE POLICY "io_serviser_select" ON intervencija_ocjene
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM service_requests sr
      WHERE  sr.id                    = zahtjev_id
        AND  sr.serviser_dodijeljen_id = auth.uid()
    )
  );
