# Izvještaj testiranja — Sprint 9 (SB-09-36)

Datum: 24/05/2026  
Okruženje: local (`https://nrs-grupa2.vercel.app/`, grana `feature/sprint-9`)

## Automatski testovi

Komande:

- `npm test`
- `npm run test:coverage`
- `npm run test:e2e`

Rezultat:

- Unit testovi: 174/174 PASS
- Integration testovi: 112/112 PASS
- E2E testovi (Playwright): 23/23 PASS
- Ukupno automatskih: 309/309 PASS (Jest 286 + E2E 23)

Coverage (`npm run test:coverage`):

- Statements: 98.88%
- Branches: 87.39%
- Functions: 100%
- Lines: 99.21%

Zaključak: cilj pokrivenosti od najmanje 98% je ostvaren.

Napomena: inicijalni run `2026-05-22_21-08-17` imao je 1 pad E2E (RBAC redoslijed provjera); popravka DLI-021 i reverifikacija `serviser.zadaci.spec.ts` → 23/23 PASS.

## Podjela po sprintovima (regresija u manuelnom obuhvatu)

- Sprint 5: auth/RBAC osnova, registracija, prijava, sesija, kontrola pristupa.
- Sprint 6: korisnički zahtjevi, admin kreiranje korisnika, premium tokovi.
- Sprint 7: dispečerski dashboard, liste, detalj, prioriteti, wizard (TC-S9-01–TC-S9-20).
- Sprint 8: serviserski tok, statusi, evidencija, odbijanje (TC-S9-21–TC-S9-40).
- Sprint 9: preraspodjela, audit, SLA, izvještaji, admin, notifikacije (TC-S9-41–TC-S9-80).

## Dodano u Sprintu 9

- Automatski testovi: +61 u odnosu na Sprint 8 zbir (225 → 286 Jest; E2E 16 → 23).
- Manuelni test scenariji: +80 za `SB-09-36` (izvor: `QA-Sprint9NRS.xlsx`).

## Manualni testovi (SB-09-36)

Izvor test case matrice: `TC_SB-09-36_Sprint9_ManualFlows.csv`  
Izvor izvršenja: `EXEC_SB-09-36_Sprint9_ManualFlows.csv`

| Tester | Opseg (TC ID) | Broj |
| ------ | ------------- | ---- |
| Hamza Bunar | TC-S9-01 – TC-S9-20 (dispečer, Sprint 7 regresija) | 20 |
| Eldin Begić | TC-S9-21 – TC-S9-40 (serviser, Sprint 8/9) | 20 |
| Kerim Gazić | TC-S9-41 – TC-S9-60 (audit, SLA, izvještaji) | 20 |
| Suada Peci | TC-S9-61 – TC-S9-80 (admin, notifikacije, E2E) | 20 |

Rezultat:

- Ukupno testova: 80
- Prošlo: 80
- Nije prošlo: 0
- Blokirano: 0
- Čeka ručnu QA potvrdu: 0
- Datumi izvršenja: 23–24/05/2026

## Bug status

Izvor: `BUG_SB-09-36_Sprint9_ManualFlows.csv`

- Otvoreni bugovi: 0
- Napomena: početni FAIL zapisi iz Excel QA sesije (22–24.05.) adresirani su prije zatvaranja sprinta; finalni EXEC status za sve TC-S9-XX je `PASSED`.

## Završna ocjena

Sprint 9 automatsko i manuelno testiranje (SB-09-36) uspješno je završeno. Automatski sloj pokriva Sprint 9 API izmjene, SLA engine, regresiju serviserskog modula i E2E smoke tokove. Svih 80 manuelnih scenarija iz QA matrice izvršeno je sa statusom PASSED. Završni QA sign-off: Ajna Ičić, 24/05/2026.
