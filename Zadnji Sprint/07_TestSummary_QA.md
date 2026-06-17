# Test Summary / QA izvještaj (InterServ)

## 1. Vrste testova


| Vrsta              | Alat                 | Šta pokriva                                                                                                                                                                                     | Lokacija                      |
| ------------------ | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| **Unit**           | Jest                 | Poslovna logika i validacije (triage/urgency, SLA pravila, statusne tranzicije, preporuka servisera, geo-izračun, premium lifecycle, auth/RBAC logika, middleware, rate-limiter, forme)         | `Projekat/tests/unit/`        |
| **Integration**    | Jest                 | API rute (admin users, dispečer zahtjevi/dodjela/preporuka/analitika/izvještaj odziva, serviser intervencije, service-requests ocjena/historija, napomene, slike, auth uloge, login rate-limit) | `Projekat/tests/integration/` |
| **E2E**            | Playwright           | Auth smoke, korisnik zahtjev smoke, RBAC cross-access, admin create-user, dispečer dodjela/zatvaranje i operativni tok, serviser zadaci, korisnik ocjena/historija                              | `Projekat/tests/e2e/`         |
| **Ručno (manual)** | Test case + EXEC CSV | Po sprintu: auth, RBAC/sigurnost, korisnički/dispečerski/serviserski/admin tokovi, regresija                                                                                                    | `Projekat/docs/testing/SB-`*  |


---

## 2. Kako se testovi pokreću

Sve komande iz foldera `Projekat/`:

```bash
npm test                 # unit + integration (Jest)
npm run test:unit        # samo unit
npm run test:integration # samo integration
npm run test:coverage    # Jest + coverage izvještaj
npm run test:e2e         # Playwright e2e (zahtijeva E2E_* kredencijale u .env.local)
npm run test:izvjestaj   # pokrene sve + generiše docs/testing/Izvjestaji/<datum>/IZVJESTAJ.md
```

**E2E preduslov:** u `.env.local` moraju postojati kredencijali za sve 4 uloge (`E2E_ADMIN_`*, `E2E_DISPECER_`*, `E2E_SERVISER_*`, `E2E_KORISNIK_*`) -> vidi `docs/testing/README.md`. E2E koristi `--workers=1` radi stabilnog login/RBAC toka.

---

## 3. Rezultati automatskih testova


| Vrsta                               | Suites | Testova | Prolazi | Pada  | Datum          |
| ----------------------------------- | ------ | ------- | ------- | ----- | -------------- |
| Unit                                | 28     | 423     | **423** | 0     | 2026-06-16     |
| Integration                         | 17     | 150     | **150** | 0     | 2026-06-16     |
| **Unit + Integration (`npm test`)** | **45** | **573** | **573** | **0** | **2026-06-16** |
| E2E (Playwright)                    | —      | 23      | 23*     | 0     | 2026-06-01     |


### 3.1 Coverage (`npm run test:coverage`, 2026-06-16)


| Metrika    | Izmjereno | Prag (`jest.config.js`) | Status        |
| ---------- | --------- | ----------------------- | ------------- |
| Statements | 98.92%    | 98%                     | ✅ iznad praga |
| Branches   | 87.03%    | 85%                     | ✅ iznad praga |
| Functions  | 100%      | 99%                     | ✅ iznad praga |
| Lines      | 99.25%    | 99%                     | ✅ iznad praga |


> **Napomena o opsegu pokrivenosti:**
>
> 1. Coverage gate je **namjerno fokusiran** na kritične sigurnosne module, `lib/validations/authValidation.ts`, `services/auth/authService.ts`, `app/api/auth/uloge`, `app/api/admin/users`, dijelove gdje je regresija najopasnija (definisano kroz `collectCoverageFrom`). Na tom skupu pokrivenost je **98.92% / 87.03% / 99.25%**, **iznad** zadanih pragova (98/85/99%); `npm run test:coverage` **prolazi (exit 0)**.
> 2. Šira poslovna logika pokrivena je cjelokupnim skupom od **573 testa**; korisnički interfejs (`app/`, `components/`) pokriven je sa **23 E2E + 322 ručna scenarija** — E2E/ručna pokrivenost se ne uračunava u Jest coverage broj, pa fokusirani Jest postotak nije pokrivenost cijelog projekta.
> 3. **Projektni (cijeli kod) cilj pokrivenosti nije definisan** u planskim dokumentima (`Sprint 3/TestStrategy.md`, `Sprint 4/DefinitionOfDone.md`, `Sprint 2/NonFunctionalRequirements.md`). Prag 98% potiče iz `jest.config.js` i odnosi se na ovaj fokusirani skup, isto kako je referenciran u izvještajima Sprinta 8 i 10. Time je priča o pokrivenosti dosljedna kroz sve sprintove.

---

## 4. Ručno testiranje (po sprintovima)


| Paket        | Sprint | Obuhvat                                                              | Broj scenarija | Status                   | Bugovi          |
| ------------ | ------ | -------------------------------------------------------------------- | -------------- | ------------------------ | --------------- |
| SB-05-12     | 5      | Auth tokovi (`AuthFlows`)                                            | 15             | PASS                     | 0 otvorenih     |
| SB-05-13     | 5      | Matrica pristupa + validacija sigurnosti (ACCESS/SEC)                | 28 (20+8)      | PASS                     | 0 otvorenih     |
| SB-06-20     | 6      | Korisnički/admin/premium tokovi                                      | 24             | PASS                     | 0 otvorenih     |
| SB-07-35     | 7      | Dispečerski operativni tok                                           | 26             | PASS                     | 0 otvorenih     |
| SB-09-36     | 9      | Alternativni tokovi, SLA, audit, slike, notifikacije                 | 80             | PASS                     | 0 otvorenih     |
| SB-10-107    | 10     | Regresija MVP (US-01–47) + US-48–50                                  | 107            | PASS                     | 0 otvorenih     |
| **SB-11-42** | **11** | US-51 ruta, US-52 ocjena, US-53 dugo-čekanje, US-54 historija + RBAC | **42**         | **PASS (uz 3 napomene)** | **0 formalnih** |
| **Ukupno**   | 5–11   |                                                                      | **322**        | **PASS**                 | **0 otvorenih** |


## 5. Ključni korisnički tokovi koji su provjereni


| Tok                                            | Pokriveno (auto / ručno)                                                                                                                                    |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Registracija + prijava + neutralne auth poruke | `loginForm`, `registerForm`, `authValidation`, `authRoleLogic` (unit) · `auth.smoke` (e2e) · SB-05-12                                                       |
| RBAC / kontrola pristupa po ulozi              | `middleware` (unit) · `rbac.cross-access` (e2e) · SB-05-13, TC-S11-021/029/030/036/037/038                                                                  |
| Korisnik: kreiranje i praćenje zahtjeva        | `korisnik.zahtjev.smoke` (e2e) · SB-06/10/11                                                                                                                |
| Dispečer: dodjela i zatvaranje intervencije    | `api.dispecer.dodjela`, `api.dispecer.zahtjevi` (integ) · `dispecer.dodjela-i-zatvaranje`, `dispecer.operativni-tok` (e2e) · SB-07-35                       |
| Serviser: zadaci i evidencija rada             | `api.serviser.intervencije`, `api.serviser.sprint9` (integ) · `serviser.zadaci` (e2e) · TC-S11-031/034                                                      |
| Ocjena + historija po korisniku                | `api.service-requests.ocjena`, `api.service-requests.historija` (integ) · `korisnik.ocjena-historija` (e2e) · TC-S11-001–014                                |
| SLA / dugo-čekanje / preporuka servisera       | `slaPravila`, `dugoChekanje`, `preporukaServisera`, `geoIzracun` (unit) · `api.dispecer.preporuka`, `api.dispecer.izvjestajOdziva` (integ) · TC-S11-015–020 |


---

## 6. Poznati testni propusti i ograničenja

1. **Coverage je namjerno fokusiran** na kritične sigurnosne module (§3.1), gdje drži prag ≥98% (98.92%). Ovo je svjesna strategija (gate na najrizičnijem kodu), a ne projektno-široka metrika, UI se pokriva E2E + ručnim testovima.
2. **Ručni testovi izvršeni na produkciji**, zavise od stanja produkcijskih demo podataka u trenutku testiranja.

---

## 7. Dokazi (artefakti)

- Automatski izvještaji: `Projekat/docs/testing/Izvjestaji/<datum>/IZVJESTAJ.md` (+ `unit_integration.log`, `coverage.log`, `e2e.log`, `coverage-summary.json`)
- Screenshot evidencija: `Projekat/docs/testing/evidence/SB-05-12/`, `SB-05-13/` (TC i SEC/ACCESS snimci)
- Ručni paketi (TC/EXEC/BUG/SIGNOFF): `Projekat/docs/testing/SB-05-12`, `SB-05-13`, `SB-06-20`, `SB-07-35`, `SB-09-36`, `SB-10-107`, `SB-11-42`
- Test strategija: `Sprint 3/TestStrategy.md` · Pregled testiranja: `Projekat/docs/testing/README.md`
