# Deployment procedura (InterServ)

> Ovaj dokument omogućava osobi izvan tima da pokrene sistem **lokalno** i razumije **produkcijski** deployment **bez dodatnih pitanja**. Sve komande se izvršavaju iz foldera `**Projekat/`**.

---

## 1. Naziv aplikacije i kratak opis arhitekture

**Naziv:** InterServ (npm paket: `projekat`) -> web aplikacija za digitalizaciju prijave kvarova, dispečerske trijaže, planiranja izlazaka, dodjele servisera i praćenja servisnih intervencija, uz audit historiju i kontrolu pristupa po ulogama (RBAC).

**Arhitektura (ukratko):** monolitna **full-stack Next.js 14 (App Router)** aplikacija kod koje **frontend (stranice) i backend (API rute) žive u istom projektu i izvršavaju se u istom procesu**. Trajna pohrana, autentikacija i storage su na **Supabase** platformi (PostgreSQL + Auth + Storage + Row Level Security). Hosting je **Vercel** (serverless + globalni CDN + Vercel Cron za zakazane poslove).

Kontrola pristupa je **troslojna**: (1) `middleware.ts` provjerava prijavu i ulogu pri svakoj navigaciji, (2) svaka API ruta ponovo provjerava ovlaštenje i validira ulaz (Zod), (3) **RLS politike** na nivou baze štite podatke i u slučaju greške u aplikaciji.

```
Browser (React/Next stranice)
      │ HTTPS
      ▼
middleware.ts  ── RBAC na ulazu (preusmjeri neovlaštene)
      ▼
Next.js API rute (/app/api/*)  ── ponovna autorizacija + Zod validacija
      ▼
Poslovna logika (lib/servisirane, lib/premium, domain/)
      ▼
Supabase (PostgreSQL + Auth + Storage + RLS)
      ▲
Vercel Cron → /api/cron/* (premium-expiry, sla-eskalacija)
```

---

## 2. Tehnologije koje se koriste


| Sloj                   | Tehnologija                                                       |
| ---------------------- | ----------------------------------------------------------------- |
| Frontend               | Next.js 14 (App Router), React 18, TypeScript 5, Tailwind CSS     |
| Forme / validacija     | React Hook Form + Zod                                             |
| Klijentski state/cache | TanStack Query (React Query)                                      |
| Backend                | Next.js API Routes (REST stil, JSON) + serverske akcije           |
| Baza / Auth / Storage  | Supabase (PostgreSQL, Supabase Auth, Storage, Row Level Security) |
| Email (opcionalno)     | Resend                                                            |
| Testiranje             | Jest (unit + integration), Playwright (e2e)                       |
| CI                     | GitHub Actions (`.github/workflows/test.yml`, `lint.yml`)         |
| Hosting                | Vercel (+ Vercel Cron)                                            |


---

## 3. Potrebni alati i verzije


| Alat                        | Verzija                      | Provjera             |
| --------------------------- | ---------------------------- | -------------------- |
| **Node.js**                 | **20+** (CI koristi Node 20) | `node -v`            |
| **npm**                     | 10+ (dolazi uz Node 20)      | `npm -v`             |
| **Git**                     | bilo koja novija             | `git --version`      |
| **Supabase CLI**            | 1.x+ (za migracije)          | `supabase --version` |
| **Vercel CLI** (opcionalno) | 33+ (za ručni/CD deploy)     | `vercel --version`   |


Instalacija Supabase CLI (vidi i `https://supabase.com/docs/guides/cli`):

```bash
npm install -g supabase
# ili (Windows, scoop):  scoop install supabase
```

---

## 4. Sve potrebne environment varijable

Lokalno se postavljaju u `**Projekat/.env.local**` (kopirati iz `Projekat/.env.example`). U produkciji se postavljaju u **Vercel → Project Settings → Environment Variables**.


| Varijabla                                      | Svrha                                                              | Obavezna            | Gdje                                                                     |
| ---------------------------------------------- | ------------------------------------------------------------------ | ------------------- | ------------------------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`                     | URL Supabase projekta                                              | **Da**              | lokalno + prod                                                           |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`                | Javni (anon) ključ                                                 | **Da**              | lokalno + prod                                                           |
| `SUPABASE_SERVICE_ROLE_KEY`                    | Server-side ključ (API rute, cron, zaobilazak RLS)                 | **Da**              | lokalno + prod · **nikad na klijentu**                                   |
| `NEXT_PUBLIC_SITE_URL`                         | Bazni URL aplikacije (auth redirect + linkovi u email predlošcima) | **Da**              | lokalno: `http://localhost:3000` · prod: `https://nrs-grupa2.vercel.app` |
| `CRON_SECRET`                                  | Zaštita cron ruta (`/api/cron/`*)                                  | **Da u produkciji** | prod                                                                     |
| `RESEND_API_KEY`                               | Slanje email poruka (bez ključa poruke se loguju u konzolu)        | Ne                  | opcionalno                                                               |
| `EMAIL_FROM`                                   | Pošiljalac email-a                                                 | Ne                  | opcionalno                                                               |
| `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD`       | Test-nalog admin (e2e)                                             | Samo e2e            | lokalno                                                                  |
| `E2E_DISPECER_EMAIL` / `E2E_DISPECER_PASSWORD` | Test-nalog dispečer (e2e)                                          | Samo e2e            | lokalno                                                                  |
| `E2E_SERVISER_EMAIL` / `E2E_SERVISER_PASSWORD` | Test-nalog serviser (e2e)                                          | Samo e2e            | lokalno                                                                  |
| `E2E_KORISNIK_EMAIL` / `E2E_KORISNIK_PASSWORD` | Test-nalog korisnik (e2e)                                          | Samo e2e            | lokalno                                                                  |


> Supabase URL i ključeve nabavljate u Supabase Dashboard → **Project Settings → API**.

---

## 5. Lokalno pokretanje backend-a

> **Važno:** InterServ je **monolitni Next.js**, backend (API rute pod `app/api/`*) i frontend (stranice) **dijele isti proces**. Ne postoji odvojeni backend server; jedna komanda diže oba sloja. Ova sekcija pokriva backend dio (API + serverska logika).

```bash
# 1. Kloniranje repozitorija
git clone https://github.com/agrebic1/NRS-Grupa2.git
cd NRS-Grupa2/Projekat

# 2. Instalacija zavisnosti
npm install

# 3. Konfiguracija okruženja
#    Kopirati .env.example u .env.local i popuniti vrijednosti (vidi "4. Sve potrebne environment varijable")
copy .env.example .env.local        # Windows (PowerShell: Copy-Item .env.example .env.local)
# cp .env.example .env.local        # macOS/Linux

# 4. Pokretanje (diže i backend API rute i frontend)
npm run dev
```

Nakon `npm run dev`, backend API rute su dostupne na `http://localhost:3000/api/...` (npr. `GET /api/auth/uloge`). Backend zahtijeva ispravne Supabase varijable iz "4. Sve potrebne environment varijable" (bez njih `middleware.ts` preskače auth provjere, a API rute vraćaju greške).

---

## 6. Lokalno pokretanje frontend-a

Frontend (Next.js stranice) pokreće se **istom** komandom kao backend (zajednički proces):

```bash
cd NRS-Grupa2/Projekat
npm run dev
# Aplikacija: http://localhost:3000
```

Produkcijski build i lokalno pokretanje produkcijske verzije:

```bash
npm run build      # produkcijski build (frontend + backend)
npm start          # pokreće build (http://localhost:3000)
```

Korisne pomoćne komande:

```bash
npm run lint       # ESLint
npm run format     # Prettier (write)
```

---

## 7. Pokretanje baze

Baza je **PostgreSQL na Supabase** (managed cloud). „Pokretanje baze" znači povezivanje aplikacije sa Supabase projektom:

1. Kreirati Supabase projekt na `https://supabase.com`.
2. U **Project Settings → API** preuzeti `Project URL` i `anon`/`service_role` ključeve → upisati u `.env.local` ("4. Sve potrebne environment varijable").
3. Konfigurisati **Auth URL-ove** (Dashboard → **Authentication → URL Configuration**):
  - **Site URL:** `http://localhost:3000` (lokalno) odnosno `https://nrs-grupa2.vercel.app` (prod)
  - **Redirect URLs:** dodati `{SITE_URL}/auth/callback` (npr. `https://nrs-grupa2.vercel.app/auth/callback`)
    > Bez ovoga potvrda emaila i ponovno slanje verifikacijskog linka mogu pasti.
4. Povezati lokalni repo sa projektom (za migracije, "8. Migracije i seed podaci"):

```bash
supabase login
supabase link --project-ref <PROJECT_REF>   # ref se vidi u Dashboard URL-u / supabase/.temp/project-ref
```

> **Opcionalno (potpuno lokalna baza preko Dockera):** `supabase start` podiže lokalni Postgres (port `54322`) i API (`54321`) prema `supabase/config.toml`. Za demo/predaju koristi se **cloud Supabase**, pa je ovo opcionalno.

---

## 8. Migracije i seed podaci

Sve SQL migracije su u `**Projekat/supabase/migrations/`** (~50 fajlova: shema, RLS politike, storage bucketi, premium, ocjene, notifikacije…). Primjenjuju se kroz Supabase CLI:

```bash
cd NRS-Grupa2/Projekat
supabase link --project-ref <PROJECT_REF>   # ako već nije povezano
supabase db push                            # primjenjuje sve migracije na povezani projekt
```

**Seed početnog administratora** (`20260427000001_seed_initial_admin.sql`):

1. Prvo kreirati auth nalog `aicic1@etf.unsa.ba` (Dashboard → **Authentication → Users → Add user**).
2. Pokrenuti `supabase db push` (ili `supabase migration up`) — migracija dodjeljuje tom nalogu ulogu **Administrator** u tabeli `uposlenici`.

**Demo nalozi (za testiranje 4 uloge)** — kreirati kroz Auth (ili admin panel nakon prijave administratora) i dodijeliti uloge; iste kredencijale upisati u `.env.local` kao `E2E_`* ako se pokreću e2e testovi. Demo kredencijali se navode i u User Manualu (#4).

---

## 9. Pokretanje testova

Sve iz `Projekat/`:

```bash
npm test                 # unit + integration (Jest)
npm run test:unit        # samo unit
npm run test:integration # samo integration
npm run test:coverage    # Jest + coverage (fokusiran na kritične module; prag 98/85/99)
npm run test:e2e         # Playwright e2e (zahtijeva E2E_* kredencijale u .env.local)
npm run test:izvjestaj   # pokrene sve + generiše docs/testing/Izvjestaji/<datum>/IZVJESTAJ.md
```

Posljednje stanje (2026-06-16): `npm test` = **573/573 PASS**, `npm run test:coverage` = **98.92% / 87.03% / 100% / 99.25%** (prolazi), e2e = 23/23 (zadnji potvrđeni). Detalji: [07_TestSummary_QA.md](07_TestSummary_QA.md). E2E preduslov: `E2E_*` kredencijali za sve 4 uloge (vidi `docs/testing/README.md`).

---

## 10. Produkcijski / cloud deployment

Produkcija je na **Vercel** (frontend + backend = jedan Next.js deployment), baza na **Supabase**.

**Prvo postavljanje (jednokratno):**

1. Vercel → **Add New → Project** → import GitHub repo `agrebic1/NRS-Grupa2`.
2. **Root Directory = `Projekat`** (jer je kod u poddirektoriju). Framework preset: **Next.js** (auto-detekcija).
3. **Environment Variables** (Production + Preview): dodati sve iz §4 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL=https://nrs-grupa2.vercel.app`, `CRON_SECRET`, opcionalno `RESEND_API_KEY`/`EMAIL_FROM`).
4. U Supabase **Authentication → URL Configuration** dodati produkcijski Site URL i `…/auth/callback` redirect ("7. Pokretanje baze").
5. Primijeniti migracije na produkcijsku bazu: `supabase link --project-ref <PROD_REF>` → `supabase db push`.

**Svaki sljedeći deploy (automatski):**

- Push na granu `**main`** → Vercel automatski builda i deploya (`npm run build`). Pull request dobija **Preview** deployment.
- **Vercel Cron** automatski čita `vercel.json` i pokreće zakazane poslove:
  - `/api/cron/premium-expiry` — svaki dan **02:00** (istek premiuma + audit)
  - `/api/cron/sla-eskalacija` — svaki dan **06:00** (SLA eskalacije)
  - Cron rute su zaštićene `CRON_SECRET`-om.

---

## 11. Link na deployment

- **Produkcija (live demo):** `https://nrs-grupa2.vercel.app/`
- **Repozitorij:** `https://github.com/agrebic1/NRS-Grupa2` (kod u `Projekat/`)

---

## 12. Poznata ograničenja deploymenta

- **Vendor zavisnost:** deployment zavisi od dostupnosti **Vercel** (hosting/cron) i **Supabase** (baza/auth/storage). Pad bilo kojeg servisa znači nedostupnost.
- **Root Directory mora biti** `Projekat` -> bez toga Vercel build ne pronalazi aplikaciju.
- **Migracije se primjenjuju zasebno** (`supabase db push`) -> Vercel deploy **ne** pokreće migracije automatski (osim kroz CD pipeline iz #3).
- **Email** radi samo uz `RESEND_API_KEY`; bez njega se poruke loguju u server konzolu (ne šalju se).
- **Cron** zahtijeva ispravan `CRON_SECRET` u produkciji; inače rute vraćaju 401.
- **E2E testovi** zahtijevaju ručno kreirane test-naloge (`E2E_*`) -> ne pokreću se u osnovnom CI-ju.
- **Nema offline rada** i **nema real-time push** notifikacija.

---

## 13. Najčešći problemi pri pokretanju i njihova rješenja


| Problem                                 | Uzrok                                                               | Rješenje                                                                                                                                   |
| --------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `Unexpected token '<'` u klijentu       | API ruta vratila HTML redirect umjesto JSON-a (neautoriziran poziv) | API rute moraju vraćati JSON 401/403; provjeriti prijavu/ulogu i da poziv ide na `/api/...` (middleware ne radi HTML redirect za API rute) |
| Potvrda emaila / resend link pada       | `NEXT_PUBLIC_SITE_URL` ili Supabase **Redirect URLs** nisu ispravni | Postaviti `NEXT_PUBLIC_SITE_URL` i u Supabase dodati `{SITE_URL}/auth/callback` (§7)                                                       |
| Build na Vercelu pada                   | Nedostaju `NEXT_PUBLIC_*` varijable ili pogrešan Root Directory     | Dodati env varijable (§4) i postaviti **Root Directory = `Projekat`**                                                                      |
| Upit vraća prazno / „permission denied" | RLS blokira pristup                                                 | Server-side koristiti `SUPABASE_SERVICE_ROLE_KEY` gdje treba zaobići RLS; provjeriti da je migracija RLS politika primijenjena             |
| Cron vraća `401 Unauthorized`           | Nedostaje/pogrešan `CRON_SECRET`                                    | Postaviti `CRON_SECRET` u Vercel env i u zaglavlju cron poziva                                                                             |
| `supabase db push` ne radi              | Projekt nije povezan ili pogrešan ref                               | `supabase login` → `supabase link --project-ref <REF>` (ref u `supabase/.temp/project-ref`)                                                |
| Seed admina „korisnik nije pronađen"    | Auth nalog `aicic1@etf.unsa.ba` nije kreiran prije migracije        | Kreirati nalog u Auth → Users, pa ponovo `supabase db push`                                                                                |
| `npm run test:e2e` pada na loginu       | Nema `E2E_*` kredencijala / nalozi ne postoje                       | Kreirati 4 test-naloga i popuniti `E2E_*` u `.env.local` (`docs/testing/README.md`)                                                        |


