# Izvjestaj automatskog testiranja

- Pokrenuto: 2026-05-22T19:08:17.228Z
- Zavrseno: 2026-05-22T19:12:00.321Z
- Run ID: 2026-05-22_21-08-17
- Status: FAIL (inicijalni E2E run; finalno PASS nakon DLI-021)

## Izvrsene provjere

- Unit + Integration: PASS (exit code 0)
- Coverage: PASS (exit code 0)
- E2E: FAIL (exit code 1)

## Podjela po sprintovima

- Sprint 5: auth/RBAC osnova, registracija, prijava, odjava, sesija, role redirect i kontrola pristupa.
- Sprint 6: korisnicki zahtjevi, admin kreiranje korisnika, onboarding partnera i premium tokovi.
- Sprint 7: dispecerski dashboard, liste, detalj intervencije, carobnjak, operativni prioritet, statusi i RBAC API provjere.
- Sprint 8: serviserski modul — dodjela, prihvatanje/odbijanje zadatka, statusni prelazi, evidencija rada, napomene, zatvaranje intervencije i RBAC provjere.
- Sprint 9: preraspodjela (US-28/29/40), obavezno trajanje, audit trail, SLA, izvjestaj odziva, upload slika i regresija API testova.

## Dodano u Sprintu 7

- Automatski testovi: +42 (Automatski zbir je porastao sa 69 u Sprintu 6 na 111 u Sprintu 7.)
- Manuelni test scenariji: +26 za SB-07-35

## Dodano u Sprintu 8

- Automatski testovi: +63 (Automatski zbir je porastao sa 111 u Sprintu 7 na 174 u Sprintu 8 (3 unit + 3 integration + 2 E2E fajla).)
- Manuelni test scenariji: +20 za SB-08-01

## Dodano u Sprintu 9

- Automatski testovi: +61 (Jest zbir 286; E2E finalno 23/23 nakon DLI-021.)
- Manuelni test scenariji: +80 za `SB-09-36` (TC-S9-01–80; TC/EXEC u `docs/testing/SB-09-36/`)

## Broj pokrenutih testova

- Unit testovi: 174/174 passed
- Integration testovi: 112/112 passed
- Coverage run: 286/286 passed
- E2E testovi: 22/23 passed u ovom runu (1 failed); reverifikacija → 23/23 PASS

## Pokrivenost

- Statements: 98.88%
- Branches: 87.39%
- Functions: 100%
- Lines: 99.21%

## Artefakti

- `unit_integration.log`
- `coverage.log`
- `e2e.log`
- `coverage-summary.json` (ako postoji)

Napomena: ovaj folder sadrzi logove inicijalnog pokretanja. Zavrsni Sprint 9 status (automatski + manuelni): v. `Sprint 9/IzvjestajTestiranja.md` i `docs/testing/SB-09-36/`.
