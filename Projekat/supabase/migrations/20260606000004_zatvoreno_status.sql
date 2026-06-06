-- US-52: Dodaje 'zatvoreno' kao validni status zahtjeva.
-- Potrebno jer intervencija_ocjene RLS politika provjerava status = 'zatvoreno',
-- ali status constraint nije uključivao ovaj vrijednost.

BEGIN;

ALTER TABLE public.service_requests
  DROP CONSTRAINT IF EXISTS service_requests_status_check;

ALTER TABLE public.service_requests
  ADD CONSTRAINT service_requests_status_check
  CHECK (
    status IN (
      'pending_review',
      'na_cekanju',
      'in_review',
      'potvrdeno',
      'dodijeljeno',
      'u_radu',
      'u_izvrsenju',
      'zavrseno',
      'zatvoreno',
      'otkazano',
      'odbijeno'
    )
  );

COMMIT;
