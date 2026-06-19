# Test Summary / QA izvještaj (InterServ)

> **Dokument:** `07_TestSummary_QA.md`
> **Projekat:** InterServ – platforma za upravljanje servisnim zahtjevima
> **Verzija:** Sprint 11 (finalna)
> **Datum posljednje izmjene:** 2026-06-16
> **Autor:** QA tim

---

## 1. Vrste testova

Testna strategija projekta InterServ pokriva četiri komplementarne vrste testova, raspoređene po slojevima arhitekture. Svaka vrsta cilja drugačiji aspekt kvalitete i zajedno osiguravaju pokrivenost od poslovne logike do korisničkog interfejsa.

| Vrsta              | Alat                 | Šta pokriva                                                                                                                                                                                     | Lokacija                      |
| ------------------ | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| **Unit**           | Jest                 | Poslovna logika i validacije (triage/urgency, SLA pravila, statusne tranzicije, preporuka servisera, geo-izračun, premium lifecycle, auth/RBAC logika, middleware, rate-limiter, forme)         | `Projekat/tests/unit/`        |
| **Integration**    | Jest                 | API rute (admin users, dispečer zahtjevi/dodjela/preporuka/analitika/izvještaj odziva, serviser intervencije, service-requests ocjena/historija, napomene, slike, auth uloge, login rate-limit) | `Projekat/tests/integration/` |
| **E2E**            | Playwright           | Auth smoke, korisnik zahtjev smoke, RBAC cross-access, admin create-user, dispečer dodjela/zatvaranje i operativni tok, serviser zadaci, korisnik ocjena/historija                              | `Projekat/tests/e2e/`         |
| **Ručno (manual)** | Test case + EXEC CSV | Po sprintu: auth, RBAC/sigurnost, korisnički/dispečerski/serviserski/admin tokovi, regresija                                                                                                    | `Projekat/docs/testing/SB-`*  |

### 1.1 Unit testovi – detalji

Unit testovi pokrivaju izolovanu poslovnu logiku bez zavisnosti od baze podataka ili eksternih servisa. Svaki modul se testira zasebno uz mockanje zavisnosti.

Ključni testirani moduli:

- **`triage` / `urgency`** – logika za određivanje prioriteta zahtjeva na osnovu tipa kvara, lokacije i SLA razreda korisnika
- **`slaPravila`** – kalkulacija SLA rokova, provjera prekoračenja i eskalaciona pravila
- **`statusneTrancizije`** – state machine za zahtjeve, uključujući nedozvoljene prijelaze
- **`preporukaServisera`** – algoritam za odabir optimalnog servisera (dostupnost, lokacija, vještine, opterećenje)
- **`geoIzracun`** – izračun udaljenosti i grupiranje servisera po zoni
- **`premiumLifecycle`** – aktivacija, obnova i istek premium pretplate
- **`authValidation`** – validacija email formata, jačine lozinke, dužine polja, neutralnih poruka greške
- **`authRoleLogic`** – dodjela uloga pri registraciji, provjera dozvola po ulozi (KORISNIK/DISPEČER/SERVISER/ADMIN)
- **`middleware`** – zaštita ruta, provjera JWT tokena, sesijsko upravljanje
- **`rateLimiter`** – ograničenje broja login pokušaja, blokiranje, reset prozora
- **`loginForm` / `registerForm`** – client-side validacija formi, poruke greške, stanja učitavanja

### 1.2 Integration testovi – detalji

Integration testovi provjeravaju stvarno ponašanje API ruta uz pravu bazu podataka (test instanca) i auth middleware. Svaka ruta se testira za sve relevantne HTTP metode i permisije.

Pokrivene API grupe:

- **`/api/admin/users`** – CRUD korisnika, promjena uloge, deaktivacija naloga, listanje s paginacijom i filterima
- **`/api/dispecer/zahtjevi`** – listanje otvorenih zahtjeva, filtriranje po statusu/zoni/prioritetu
- **`/api/dispecer/dodjela`** – dodjela servisera zahtjevu, provjera dostupnosti, automatska SLA kalkulacija
- **`/api/dispecer/preporuka`** – endpoint za preporuku servisera, vraća rankiranu listu
- **`/api/dispecer/analitika`** – agregacija metrika po periodu, zoni, tipu kvara
- **`/api/dispecer/izvjestajOdziva`** – izvještaj SLA odziva po serviserima i zahtjevima
- **`/api/serviser/intervencije`** – pregled dodijeljenih zadataka, ažuriranje statusa, dodavanje napomena
- **`/api/service-requests/ocjena`** – kreiranje ocjene od strane korisnika, validacija raspona (1–5), vezivanje uz zahtjev
- **`/api/service-requests/historija`** – historija zahtjeva po korisniku, paginacija, filtriranje
- **`/api/service-requests/napomene`** – dodavanje/čitanje napomena na zahtjevu, dozvole po ulozi
- **`/api/service-requests/slike`** – upload slika uz zahtjev, validacija formata/veličine, prikaz
- **`/api/auth/uloge`** – provjera da ruta vraća ispravnu ulogu za autentičnog korisnika
- **`/api/auth/login` (rate-limit)** – provjera da se blokira nakon N neuspješnih pokušaja

### 1.3 E2E testovi – detalji

E2E testovi simuliraju stvarnog korisnika kroz browser (Chromium). Pokreću se sekvencijalno (`--workers=1`) zbog dijeljenog auth stanja između scenarija.

Pokriveni E2E scenariji po ulogama:

**Auth (sve uloge):**
- `auth.smoke` – prijava i odjava po ulogama, provjera redirect logike

**Korisnik:**
- `korisnik.zahtjev.smoke` – kreiranje novog servisnog zahtjeva, praćenje statusa
- `korisnik.ocjena-historija` – ocjenjivanje završenog zahtjeva, pregled historije zahtjeva

**Dispečer:**
- `dispecer.dodjela-i-zatvaranje` – pregled otvorenih zahtjeva, dodjela serviseru, praćenje do zatvaranja
- `dispecer.operativni-tok` – kompletan operativni tok od primanja zahtjeva do zatvaranja

**Serviser:**
- `serviser.zadaci` – pregled dodijeljenih zadataka, promjena statusa, dodavanje napomene

**Admin:**
- `admin.create-user` – kreiranje novog korisničkog naloga, dodjela uloge

**Sigurnost / RBAC:**
- `rbac.cross-access` – verifikacija da korisnik ne može pristupiti rutama druge uloge; provjera 403/redirect odgovora

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

### 2.1 Preduvjeti za E2E testove

U `.env.local` moraju postojati kredencijali za sve 4 uloge (`E2E_ADMIN_*`, `E2E_DISPECER_*`, `E2E_SERVISER_*`, `E2E_KORISNIK_*`). Detalji o podešavanju: `docs/testing/README.md`.

> **Napomena:** E2E testovi koriste `--workers=1` (sekvencijalno izvršavanje) kako bi se izbjeglo preklapanje login sesija između scenarija koji dijele iste test naloge.

---

## 3. Rezultati automatskih testova

| Vrsta                               | Suites | Testova | Prolazi | Pada  | Datum          |
| ----------------------------------- | ------ | ------- | ------- | ----- | -------------- |
| Unit                                | 28     | 423     | **423** | 0     | 2026-06-16     |
| Integration                         | 17     | 150     | **150** | 0     | 2026-06-16     |
| **Unit + Integration (`npm test`)** | **45** | **573** | **573** | **0** | **2026-06-16** |
| E2E (Playwright)                    | —      | 23      | 23*     | 0     | 2026-06-01     |

*E2E testovi izvršeni na staging okruženju uz produkcijske demo podatke.

### 3.1 Coverage (`npm run test:coverage`, 2026-06-16)

| Metrika    | Izmjereno | Prag (`jest.config.js`) | Status        |
| ---------- | --------- | ----------------------- | ------------- |
| Statements | 98.92%    | 98%                     | ✅ iznad praga |
| Branches   | 87.03%    | 85%                     | ✅ iznad praga |
| Functions  | 100%      | 99%                     | ✅ iznad praga |
| Lines      | 99.25%    | 99%                     | ✅ iznad praga |

> **Napomena o opsegu pokrivenosti:**
>
> 1. Coverage gate je **namjerno fokusiran** na kritične sigurnosne module: `lib/validations/authValidation.ts`, `services/auth/authService.ts`, `app/api/auth/uloge`, `app/api/admin/users` – dijelove gdje je regresija najopasnija (definisano kroz `collectCoverageFrom` u `jest.config.js`). Na tom skupu pokrivenost je **98.92% / 87.03% / 99.25%**, **iznad** zadanih pragova (98/85/99%); `npm run test:coverage` **prolazi (exit 0)**.
> 2. Šira poslovna logika pokrivena je cjelokupnim skupom od **573 testa**; korisnički interfejs (`app/`, `components/`) pokriven je sa **23 E2E + 322 ručna scenarija** — E2E/ručna pokrivenost se ne uračunava u Jest coverage broj, pa fokusirani Jest postotak nije pokrivenost cijelog projekta.
> 3. **Projektni (cijeli kod) cilj pokrivenosti nije definisan** u planskim dokumentima (`Sprint 3/TestStrategy.md`, `Sprint 4/DefinitionOfDone.md`, `Sprint 2/NonFunctionalRequirements.md`). Prag 98% potiče iz `jest.config.js` i odnosi se na ovaj fokusirani skup, isto kako je referenciran u izvještajima Sprinta 8 i 10. Time je priča o pokrivenosti dosljedna kroz sve sprintove.

---

## 4. Ručno testiranje (po sprintovima)

| Paket        | Sprint | Obuhvat                                                               | Broj scenarija | Status                   | Bugovi          |
| ------------ | ------ | --------------------------------------------------------------------- | -------------- | ------------------------ | --------------- |
| SB-05-12     | 5      | Auth tokovi (`AuthFlows`)                                             | 15             | PASS                     | 0 otvorenih     |
| SB-05-13     | 5      | Matrica pristupa + validacija sigurnosti (ACCESS/SEC)                 | 28 (20+8)      | PASS                     | 0 otvorenih     |
| SB-06-20     | 6      | Korisnički/admin/premium tokovi                                       | 24             | PASS                     | 0 otvorenih     |
| SB-07-35     | 7      | Dispečerski operativni tok                                            | 26             | PASS                     | 0 otvorenih     |
| SB-09-36     | 9      | Alternativni tokovi, SLA, audit, slike, notifikacije                  | 80             | PASS                     | 0 otvorenih     |
| SB-10-107    | 10     | Regresija MVP (US-01–47) + US-48–50                                   | 107            | PASS                     | 0 otvorenih     |
| **SB-11-42** | **11** | US-51 ruta, US-52 ocjena, US-53 dugo-čekanje, US-54 historija + RBAC | **42**         | **PASS (uz 3 napomene)** | **0 formalnih** |
| **Ukupno**   | 5–11   |                                                                       | **322**        | **PASS**                 | **0 otvorenih** |

### 4.1 SB-11-42 – Napomene

Svih 42 test scenarija prošla su bez formalnih bugova. Zabilježene su tri napomene koje nisu klasifikovane kao bugovi – detalji se nalaze u `Projekat/docs/testing/SB-11-42` (EXEC i BUG fajlovi).

---

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

1. **Coverage je namjerno fokusiran** na kritične sigurnosne module (§3.1), gdje drži prag ≥98% (98.92%). Ovo je svjesna strategija (gate na najrizičnijem kodu), a ne projektno-široka metrika; UI se pokriva E2E + ručnim testovima.
2. **Ručni testovi izvršeni na produkciji/stagingu**, zavise od stanja produkcijskih demo podataka u trenutku testiranja. Promjena demo podataka može uticati na ponovljivost scenarija.

---

## 7. Audit log izmjena dokumenta

| Datum      | Ko     | Fajl                   | Izmjena                                                            |
| ---------- | ------ | ----------------------- | ------------------------------------------------------------------ |
| 2026-06-10 | QA tim | `07_TestSummary_QA.md` | Inicijalno kreiranje dokumenta (Sprint 10 rezultati)               |
| 2026-06-14 | QA tim | `07_TestSummary_QA.md` | Dodani Sprint 11 rezultati (SB-11-42, US-51–54)                    |
| 2026-06-16 | QA tim | `07_TestSummary_QA.md` | Ažurirani coverage rezultati, dodate napomene SB-11-42             |
| 2026-06-16 | QA tim | `07_TestSummary_QA.md` | Razrađene sekcije 1.1, 1.2, 1.3 – detalji unit/integ/e2e testova  |

---

## 8. Dokazi (artefakti)

- **Automatski izvještaji:** `Projekat/docs/testing/Izvjestaji/<datum>/IZVJESTAJ.md`
  - Prateći fajlovi: `unit_integration.log`, `coverage.log`, `e2e.log`, `coverage-summary.json`
- **Screenshot evidencija:**
  - `Projekat/docs/testing/evidence/SB-05-12/` – auth flow snimci
  - `Projekat/docs/testing/evidence/SB-05-13/` – TC i SEC/ACCESS snimci
- **Ručni paketi (TC/EXEC/BUG/SIGNOFF):**
  - `Projekat/docs/testing/SB-05-12`
  - `Projekat/docs/testing/SB-05-13`
  - `Projekat/docs/testing/SB-06-20`
  - `Projekat/docs/testing/SB-07-35`
  - `Projekat/docs/testing/SB-09-36`
  - `Projekat/docs/testing/SB-10-107`
  - `Projekat/docs/testing/SB-11-42`
- **Test strategija:** `Sprint 3/TestStrategy.md`
- **Pregled testiranja + E2E setup:** `Projekat/docs/testing/README.md`
