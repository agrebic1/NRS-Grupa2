-- ═══════════════════════════════════════════════════════════════════════════════
-- US-48: Bazna lokacija servisera — koordinate za geo-preporuku po blizini kvara
-- ═══════════════════════════════════════════════════════════════════════════════
-- Koordinate se čuvaju na supertype tabeli `osoba` (gdje već žive ime/prezime/adresa).
-- Koriste se samo za servisere pri izračunu udaljenosti do lokacije zahtjeva
-- (service_requests.latitude/longitude, mig. 20260505000000). Polja su opcionalna:
-- kad nedostaju, geo-preporuka se gracefully vraća na postojeće faktore.
BEGIN;

ALTER TABLE public.osoba
  ADD COLUMN IF NOT EXISTS bazna_latitude  DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS bazna_longitude DOUBLE PRECISION;

COMMENT ON COLUMN public.osoba.bazna_latitude  IS
  'Bazna lokacija (geografska širina) — koristi se za geo-preporuku servisera (US-48).';
COMMENT ON COLUMN public.osoba.bazna_longitude IS
  'Bazna lokacija (geografska dužina) — koristi se za geo-preporuku servisera (US-48).';

COMMIT;
