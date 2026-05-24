-- Integrity constraints: final_priority enum + urgency_score bounds
-- DB-RISK-1: final_priority mora biti jedna od 5 dozvoljenih vrijednosti
ALTER TABLE service_requests
  ADD CONSTRAINT IF NOT EXISTS chk_final_priority
  CHECK (
    final_priority IS NULL OR
    final_priority IN ('NISKO', 'SREDNJE', 'VISOKO', 'KRITIČNO', 'HITNO')
  );

-- DB-RISK-3: urgency_score mora biti unutar [0, 110]
ALTER TABLE service_requests
  ADD CONSTRAINT IF NOT EXISTS chk_urgency_score
  CHECK (urgency_score IS NULL OR urgency_score BETWEEN 0 AND 110);

-- system_score isti opseg (mirror polje)
ALTER TABLE service_requests
  ADD CONSTRAINT IF NOT EXISTS chk_system_score
  CHECK (system_score IS NULL OR system_score BETWEEN 0 AND 110);
