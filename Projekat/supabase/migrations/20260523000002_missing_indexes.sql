-- DB-RISK-6: Nedostajući indeksi za česte upitne obrasce

-- Dispatcher inbox: filtriranje po statusu (najkritičniji query path)
CREATE INDEX IF NOT EXISTS idx_service_requests_status
  ON service_requests (status);

-- Serviser dashboard: intervencije dodijeljene specifičnom serviseru
CREATE INDEX IF NOT EXISTS idx_service_requests_serviser_dodijeljen
  ON service_requests (serviser_dodijeljen_id)
  WHERE serviser_dodijeljen_id IS NOT NULL;

-- Urgency sorting unutar inbox grupe
CREATE INDEX IF NOT EXISTS idx_service_requests_urgency_score
  ON service_requests (urgency_score DESC);

-- Korisnikova lista zahtjeva (korisnik dashboard, IDOR query)
CREATE INDEX IF NOT EXISTS idx_service_requests_user_id_created
  ON service_requests (user_id, created_at DESC);

-- Kombinovani index za dispatcher inbox (status + created_at za FIFO sortiranje)
CREATE INDEX IF NOT EXISTS idx_service_requests_status_created
  ON service_requests (status, created_at ASC);

-- Audit log: pretraga aktivnosti po zahtjevu + hronologiji
CREATE INDEX IF NOT EXISTS idx_intervention_activities_zahtjev_created
  ON intervention_activities (zahtjev_id, created_at ASC);

-- Notifikacije: unread count po korisniku (layout query)
CREATE INDEX IF NOT EXISTS idx_notifikacije_korisnik_procitano
  ON notifikacije (korisnik_id, procitano)
  WHERE procitano = false;

-- Dispatcher alerts: po primaocu (neučitani alertovi)
-- (tabela dispatcher_alerts možda ne postoji u svim env-ovima)
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_dispatcher_alerts_recipient
    ON dispatcher_alerts (recipient_user_id, created_at DESC);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
