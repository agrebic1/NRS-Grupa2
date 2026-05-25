-- Kreiranje Storage bucketa za slike intervencija
-- Bucket 'intervencije-slike' je bio komentarisan u sprint9_workflow migraciji.
-- API ruta /api/slike koristi isključivo ovaj bucket naziv.

BEGIN;

-- Kreiraj bucket ako ne postoji
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'intervencije-slike',
  'intervencije-slike',
  true,
  10485760,  -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- RLS politike za storage.objects

-- SELECT: svi autentifikovani korisnici mogu pregledati slike
DROP POLICY IF EXISTS "intervencije_slike_select" ON storage.objects;
CREATE POLICY "intervencije_slike_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'intervencije-slike');

-- INSERT: svi autentifikovani korisnici mogu uploadovati
-- (stvarna provjera vlasništva se radi u API rutama, ne ovdje)
DROP POLICY IF EXISTS "intervencije_slike_insert" ON storage.objects;
CREATE POLICY "intervencije_slike_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'intervencije-slike');

-- UPDATE: vlasnik fajla može ažurirati
DROP POLICY IF EXISTS "intervencije_slike_update" ON storage.objects;
CREATE POLICY "intervencije_slike_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'intervencije-slike' AND owner = auth.uid());

-- DELETE: vlasnik fajla može brisati
DROP POLICY IF EXISTS "intervencije_slike_delete" ON storage.objects;
CREATE POLICY "intervencije_slike_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'intervencije-slike' AND owner = auth.uid());

COMMIT;
