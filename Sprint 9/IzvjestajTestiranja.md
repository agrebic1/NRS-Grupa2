# Izvještaj testiranja

## Sprint 9

Datum: 22/05/2026

## Obuhvat

- Automatski: unit + integration + e2e (`npm run test:izvjestaj`)
- Manuelno: [ovdje ubaciti manuelne testove]

## Rezultati automatskih testova

**Run ID (inicijalni):** `2026-05-22_21-08-17`  
**Lokacija:** `Projekat/docs/testing/Izvjestaji/2026-05-22_21-08-17/`  
**Status ukupno (prije popravke):** **FAIL** (E2E — 1 pad)


| Sloj             | Prošlo  | Ukupno  | Status   |
| ---------------- | ------- | ------- | -------- |
| Unit             | 174     | 174     | PASS     |
| Integration      | 112     | 112     | PASS     |
| E2E (Playwright) | 22      | 23      | FAIL     |
| **Jest ukupno**  | **286** | **286** | **PASS** |


Coverage: Statements **98.88%** | Branches **87.39%** | Functions **100%** | Lines **99.21%**

### Pad E2E (prije popravke)


| Test                                                         | Očekivano | Dobijeno |
| ------------------------------------------------------------ | --------- | -------- |
| `serviser.zadaci.spec.ts` — dispečer ne smije serviser PATCH | HTTP 403  | HTTP 400 |


Detalji: `docs/testing/Izvjestaji/2026-05-22_21-08-17/e2e.log`

### Popravka i verifikacija


| Stavka                | Vrijednost                                                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Uzrok                 | `PATCH /api/serviser/intervencije/[id]` provjeravao je ID (**400**) prije `assertServiserAccess` (**403**)                           |
| Izmjena               | U `app/api/serviser/intervencije/[id]/route.ts` (GET, PATCH) i `evidencija/route.ts` (POST): RBAC provjera **prije** validacije ID-a |
| Odluka                | DLI-021 u `Sprint 9/DecisionLog.md`                                                                                                  |
| Verifikacija          | `npm run test:e2e -- tests/e2e/serviser.zadaci.spec.ts` → **4/4 PASS** (uključujući RBAC test na liniji 77)                          |
| Status nakon popravke | E2E scenarij **POPRAVLJEN**                                                                                                          |


## Rezultati manuelnih testova

[ovdje ubaciti manuelne testove]

## Bug status

- ~~Otvoreni bugovi: 1 (E2E RBAC — dispečer na serviser PATCH)~~ → **zatvoreno** (DLI-021, 22.05.2026.)

## Zaključak

Automatski **Jest** testovi (286/286) i **coverage** su prošli. Jedan **E2E** RBAC test padao je zbog redoslijeda provjera u API-ju; popravljen je premještanjem `assertServiserAccess` ispred validacije ID-a. Manuelno testiranje Sprint 9: [ovdje ubaciti manuelne testove].
