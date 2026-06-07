# Izvještaj testiranja

## Sprint 11

Datum: 07/06/2026

## Obuhvat

Validacija je rađena kroz:

- **automatske testove** (unit + integration + e2e) za US-51–US-54, operativnu fazu (MECE) i regresiju
- **manuelne testove** novih funkcionalnosti i završne regresije MVP-a (42 scenarija)

Pokriveni domeni (Sprint 11 fokus):

| User story | Opis | Automatski | Manuelno |
|------------|------|------------|----------|
| US-51 | Bazna lokacija servisera i ruta do intervencije | `geoIzracun.test.ts` | T3-01–09 |
| US-52 | Ocjena korisnika nakon zatvorene intervencije | `api.service-requests.ocjena.test.js`, `korisnik.ocjena-historija.spec.ts` | T1-07–14 |
| US-53 | Automatski podsjetnik — dugo čekanje | `dugoChekanje.test.ts` | T2-01–07 |
| US-54 | Historija intervencija korisnika | `api.service-requests.historija.test.js`, `korisnik.ocjena-historija.spec.ts` | T1-01–06 |
| S11-T1 | Završna regresija MVP | regresioni integration suiteovi | T4-01–05 |
| S11-T2 | Završna provjera RBAC | `korisnik.ocjena-historija.spec.ts` | T4-06–10 |

**Artefakti (template SB-11-42):**

- Test matrica: [`Projekat/docs/testing/SB-11-42/TC_SB-11-42_Sprint11_ManualFlows.csv`](../Projekat/docs/testing/SB-11-42/TC_SB-11-42_Sprint11_ManualFlows.csv)
- Izvršenje: [`EXEC_SB-11-42_Sprint11_ManualFlows.csv`](../Projekat/docs/testing/SB-11-42/EXEC_SB-11-42_Sprint11_ManualFlows.csv)
- Bug log: [`BUG_SB-11-42_Sprint11_ManualFlows.csv`](../Projekat/docs/testing/SB-11-42/BUG_SB-11-42_Sprint11_ManualFlows.csv)

---

## Rezultati automatskih testova

Komande (07/06/2026):

```text
npm run test:unit
npm run test:integration
npm test
npm run test:e2e
```

### Unit

| Metrika | Rezultat |
|---------|----------|
| Test suiteovi | 27/27 PASS |
| Testovi | **355/355 PASS** |

Novi / prošireni suiteovi (Sprint 11):

- `tests/unit/operativnaFaza.test.ts` · MECE klasifikacija — intake vs intervencija faze
- `tests/unit/dugoChekanje.test.ts` · US-53 pragovi po statusu, getDugoChekanje, formatiraTrajanje
- `tests/unit/geoIzracun.test.ts` · US-51 Haversine, izracunajRutu, formatirajUdaljenost, formatirajTrajanjePuta

### Integration

| Metrika | Rezultat |
|---------|----------|
| Test suiteovi | 17/17 PASS |
| Testovi | **141/141 PASS** |
| Novi Sprint 11 | `api.service-requests.ocjena.test.js` (US-52), `api.service-requests.historija.test.js` (US-54) |

### E2E (Playwright)

| Metrika | Rezultat |
|---------|----------|
| Testovi | **37/37 PASS** |
| Novi Sprint 11 | `tests/e2e/korisnik.ocjena-historija.spec.ts` (US-52, US-54, RBAC) |

### Ukupno automatskih (unit + integration + e2e)

**533/533 PASS** (355 + 141 + 37)

---

## Rezultati manuelnih testova

**Izvor:** QA matrica tima (Suada Peci, Kerim Gazić, Eldin Begić, Hamza Bunar), 07/06/2026.  
**Puna lista:** [`ManualniTestovi.md`](ManualniTestovi.md)

### Sažetak

| Grupa | Broj | Pass | Partial | Fail |
|-------|-----:|-----:|--------:|-----:|
| T1: Korisnik (US-52, US-54) | 14 | 14 | 0 | 0 |
| T2: Dispečer (US-53) | 7 | 7 | 0 | 0 |
| T3: Serviser (US-51) | 9 | 9 | 0 | 0 |
| T4: Regresija MVP + RBAC | 12 | 12 | 0 | 0 |
| **Ukupno** | **42** | **42** | **0** | **0** |

**Stopa uspjeha:** 100 %

## Mapiranje automatskih testova → user stories

| US | Automatski testovi |
|----|-------------------|
| US-51 | `geoIzracun.test.ts` |
| US-52 | `api.service-requests.ocjena.test.js`, `korisnik.ocjena-historija.spec.ts` |
| US-53 | `dugoChekanje.test.ts` |
| US-54 | `api.service-requests.historija.test.js`, `korisnik.ocjena-historija.spec.ts` |
| S11-T1/T2 | `korisnik.ocjena-historija.spec.ts` + regresioni integration suiteovi |

---

## Zaključak

Sprint 11 testiranje je završeno uspješno:

- **Automatski:** 533/533 PASS (355 unit + 141 integration + 37 e2e)
- **Manuelni:** 42/42 PASS (US-51–54 + regresija MVP + RBAC)

Sve četiri nove funkcionalnosti (ruta servisera, ocjena korisnika, dugo čekanje, historija intervencija) pokrivene su i automatskim i manuelnim testovima. Kompletna RBAC matrica je potvrđena za nove endpointe. Sistem je stabilan i spreman za finalnu demonstraciju i predaju projekta.

