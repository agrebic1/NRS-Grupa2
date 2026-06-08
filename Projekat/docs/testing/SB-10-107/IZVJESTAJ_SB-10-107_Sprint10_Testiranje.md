# Izvještaj testiranja · Sprint 10 (SB-10-107)

Datum: 01/06/2026  
Okruženje: production (`https://nrs-grupa2.vercel.app/`)

## Automatski testovi

Komande:

- `npm test`
- `npm run test:e2e`

Rezultat:

- Unit testovi: 321/321 PASS
- Integration testovi: 124/124 PASS
- E2E testovi (Playwright): 23/23 PASS
- Ukupno automatskih: 468/468 PASS

Napomena S10-T1: `rbac.cross-access.spec.ts` prolazi nakon usklađivanja middleware-a s multi-uloga pristupom (`/korisnik` za zaposlene).

## Obuhvat manuelnog paketa SB-10-107

Regresija MVP (US-01–US-47) i fokus Sprint 10 (US-48–US-50, S10-T1):

| Grupa        | Originalni ID | TC-S10 opseg            | Broj | Tester      |
| ------------ | ------------- | ----------------------- | ---: | ----------- |
| Korisnik     | T1-01 – T1-28 | TC-S10-001 – TC-S10-028 |   28 | Suada Peci  |
| Dispečer     | T2-01 – T2-28 | TC-S10-029 – TC-S10-056 |   28 | Kerim Gazić |
| Serviser     | T3-01 – T3-25 | TC-S10-057 – TC-S10-081 |   25 | Eldin Begić |
| Admin / RBAC | T4-01 – T4-26 | TC-S10-082 – TC-S10-107 |   26 | Hamza Bunar |

## Manualni testovi

Izvor test case matrice: `TC_SB-10-107_Sprint10_ManualFlows.csv`  
Izvor izvršenja: `EXEC_SB-10-107_Sprint10_ManualFlows.csv`

Rezultat:

- Ukupno testova: 107
- Prošlo: 107
- Nije prošlo: 0
- Blokirano: 0
- Otvoreni bugovi: 0 (`BUG_SB-10-107_Sprint10_ManualFlows.csv`)

## Završna ocjena

Sprint 10 automatsko i manuelno testiranje (SB-10-107) uspješno je završeno. Automatski sloj pokriva US-48, US-49, regresiju API-ja i E2E RBAC. Svih 107 manuelnih scenarija izvršeno je sa statusom `PASSED` na produkciji.

Povezani dokument: `Sprint 10/IzvjestajTestiranja.md`
