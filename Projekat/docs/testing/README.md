# Testiranje

Ovaj dokument je jedinstven vodič za testiranje: šta je pokriveno, kada se testovi pokreću i kojim redoslijedom.

## Šta je pokriveno

### Automatski testovi

- **Unit + Integration**
  - autentifikacija i validacije (`LoginForm`, `RegisterForm`, auth validacija i auth servis)
  - middleware i kontrola pristupa po ulogama (`/admin`, `/serviser`, `/dispecer`, `/korisnik`)
  - API rute: `/api/auth/uloge` i `/api/admin/users` (GET/POST, autorizacija, duplikati, validacija, audit)
- **E2E (Playwright)**
  - auth smoke tokovi
  - korisnik zahtjev smoke
  - RBAC cross-access između uloga
  - admin create-user tok (admin i non-admin scenariji)

### Ručno testiranje

- **SB-05-12**: `SB-05-12/TC_SB-05-12_AuthFlows.csv`, `EXEC`, `BUG`
- **SB-05-13**: `ACCESS`, `SEC`, `SIGNOFF`
- **SB-06-20**: `TC_SB-06-20_Sprint6_ManualFlows.csv`, `EXEC`, `BUG`, `SIGNOFF`
- **SB-07-35**: `TC_SB-07-35_Sprint7_DispecerManualFlows.csv`, `EXEC`, `BUG`, `SIGNOFF`
- **SB-09-36** (Sprint 9): `TC_SB-09-36_Sprint9_ManualFlows.csv`, `EXEC`, `BUG`, `SIGNOFF` (80 scenarija, `TC-S9-01`–`TC-S9-80`)

## Kada se pokreće

- prije merge/pull requesta
- nakon većih izmjena auth, middleware, API ili RBAC logike
- prije sprint sign-offa

## Kako se pokreće

Sve komande pokretati iz `Projekat/`:

1. `npm test`
2. `npm run test:coverage`
3. `npm run test:e2e`

Ako bilo koja komanda padne, release/sign-off se ne radi dok se ne popravi i ponovi isti redoslijed.

Napomena: `npm run test:e2e` koristi jedan Playwright worker radi stabilnog login/RBAC toka.

# Jedna komanda za sve + automatski izvjestaj

`npm run test:izvjestaj`

Ova komanda:
- pokrece `npm test`
- pokrece `npm run test:coverage`
- pokrece `npm run test:e2e -- --workers=1` (stabilnije za CI/lokalni batch run)
- kreira folder `docs/testing/Izvjestaji/<datum_vrijeme>/`
- upisuje `IZVJESTAJ.md` i logove (`unit_integration.log`, `coverage.log`, `e2e.log`)
- kopira `coverage-summary.json` (ako postoji)

## E2E preduslovi

U `.env.local` moraju postojati kredencijali za sve 4 uloge:

```env
E2E_ADMIN_EMAIL=admin@nrs.local
E2E_ADMIN_PASSWORD=Admin123!Strong
E2E_DISPECER_EMAIL=dispecer@nrs.local
E2E_DISPECER_PASSWORD=Dispecer123!Strong
E2E_SERVISER_EMAIL=serviser@nrs.local
E2E_SERVISER_PASSWORD=Serviser123!Strong
E2E_KORISNIK_EMAIL=test@gmail.com
E2E_KORISNIK_PASSWORD=123456789Aa@
```

## Trenutni status (Sprint 9 — automatski)

- `npm test`: 286/286 passed (174 unit + 112 integration)
- `npm run test:e2e`: 23/23 passed (popravka DLI-021: RBAC prije validacije ID na serviserskom API)
- `npm run test:izvjestaj`: generiše `docs/testing/Izvjestaji/<run>/IZVJESTAJ.md`
- cilj pokrivenosti: **minimum 98%**

## Izvještaji i artefakti

- sprint izvještaj: `docs/testing/SB-06-20/IZVJESTAJ_SB-06-20_Sprint6_Testiranje.md`
- sprint sign-off: `docs/testing/SB-06-20/SIGNOFF_SB-06-20_QA-SA.md`
- manual execution: `docs/testing/SB-06-20/EXEC_SB-06-20_Sprint6_ManualFlows.csv`
- Sprint 7 izvještaj: `docs/testing/SB-07-35/IZVJESTAJ_SB-07-35_Sprint7_Testiranje.md`
- Sprint 7 sign-off: `docs/testing/SB-07-35/SIGNOFF_SB-07-35_QA-SA.md`
- Sprint 7 manual execution: `docs/testing/SB-07-35/EXEC_SB-07-35_Sprint7_DispecerManualFlows.csv`
- Sprint 9 izvještaj: `docs/testing/SB-09-36/IZVJESTAJ_SB-09-36_Sprint9_Testiranje.md`
- Sprint 9 sign-off: `docs/testing/SB-09-36/SIGNOFF_SB-09-36_QA-SA.md`
- Sprint 9 manual execution: `docs/testing/SB-09-36/EXEC_SB-09-36_Sprint9_ManualFlows.csv`