# Architecture / Technical Overview (InterServ)

**Tip aplikacije:** monolitna **full-stack Next.js 14 (App Router)** aplikacija, frontend (stranice) i backend (API rute) u istom projektu i procesu; podaci/auth/storage na **Supabase**; hosting **Vercel**. Projektovano po **Open-Closed** principu (nove funkcionalnosti = novi moduli).

---

## 1. Frontend, backend, baza i vanjski servisi


| Sloj / servis    | Tehnologija                                                                                        | Uloga                                                          |
| ---------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **Frontend**     | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, TanStack Query, React Hook Form + Zod | Stranice po ulozi, forme, validacija, klijentski cache         |
| **Backend**      | Next.js API Routes (REST stil, JSON) + serverske akcije; `middleware.ts`                           | Autorizacija, validacija ulaza, poslovna logika, pristup bazi  |
| **Baza**         | Supabase **PostgreSQL** + **Row Level Security**                                                   | Trajna pohrana, sigurnosne politike na nivou reda              |
| **Auth**         | Supabase Auth (JWT, bcrypt)                                                                        | Registracija, prijava, sesije, potvrda emaila                  |
| **Storage**      | Supabase Storage (bucketi)                                                                         | Slike zahtjeva i intervencija                                  |
| **Hosting**      | Vercel (serverless + CDN) + **Vercel Cron**                                                        | Deploy, HTTPS, zakazani poslovi                                |
| **Email (opc.)** | Resend                                                                                             | Verifikacijski i obavijesni email (bez ključa → log u konzolu) |
| **Mape**         | OpenStreetMap (prikaz lokacije/rute) + deep-link u Google Maps (navigacija)                        | Lokacija intervencije, ruta od bazne lokacije servisera        |


**Ključni entiteti baze** (`supabase/migrations/`): `osoba` (supertip) → podtipovi `korisnik_usluge` i `uposlenici`; `uloga`, `status`, `prioritet`, `kategorija_kvara`, `lokacija`; `zahtjev`, `intervencija`, `dodjela`, `evidencija_rada`; `napomene`, `historija_aktivnosti` (audit); `premium_events`, `intervencija_ocjene`, `notifikacije`, tabele partner-onboardinga; storage bucketi za slike.

---

## 2. Glavne komponente / moduli

1. **Autentikacija i RBAC:** registracija/prijava/odjava, odabir uloge, troslojna kontrola pristupa.
2. **Upravljanje korisnicima (admin):** kreiranje internih naloga, uloge, suspenzija/aktivacija, premium status, odobravanje partnera.
3. **Zahtjevi:** wizard u 6 koraka (kategorija, lokacija, opis, termin, trijaža, pregled), izmjena/otkazivanje, historija po korisniku.
4. **Dispečerski operativni tok:** trijaža (bodovanje 0–110), prioritet, planiranje termina, dodjela servisera/tima, kontrolna tabla, analitika, izvještaj odziva.
5. **Serviserski modul:** dodijeljeni zadaci, statusi na terenu, evidencija rada, checklist, slike, ruta od bazne lokacije.
6. **Zatvaranje i ocjena:** potvrda/zatvaranje intervencije, ocjena korisnika.
7. **Komunikacija i audit:** napomene, historija aktivnosti (timeline + tabela).
8. **SLA i eskalacije:** SLA pravila po prioritetu, eskalacije (cron), isticanje dugo-čekajućih.
9. **Premium:** aktivacija (simulirana naplata), lifecycle, istek (cron), audit u `premium_events`.
10. **Notifikacije:** obavijesti u aplikaciji po ulozi.

---

## 3. Dijagram arhitekture

```
┌───────────────────────────────────────────────────────────────┐
│  FRONTEND (browser)  ·  Next.js stranice + React komponente    │
│  Korisnik │ Dispečer │ Serviser │ Administrator                │
│  forme (RHF+Zod) · cache (TanStack Query) · Tailwind           │
└───────────────────────────┬───────────────────────────────────┘
                            │ HTTPS (relativni /api/* pozivi)
                            ▼
┌───────────────────────────────────────────────────────────────┐
│  KONTROLA PRISTUPA NA ULAZU  ·  middleware.ts                  │
│  getUser() → mapiranje uloge → zaštita /admin /dispecer        │
│  /serviser /korisnik (preusmjeri neovlaštene)                  │
└───────────────────────────┬───────────────────────────────────┘
                            ▼
┌───────────────────────────────────────────────────────────────┐
│  BACKEND  ·  Next.js API rute (app/api/*) + serverske akcije   │
│  ponovna autorizacija · Zod validacija · orkestracija          │
└───────────────────────────┬───────────────────────────────────┘
                            ▼
┌───────────────────────────────────────────────────────────────┐
│  POSLOVNA LOGIKA  ·  lib/servisirane, lib/premium, domain/     │
│  trijaža · SLA · statusi · geo · preporuka · notifikacije      │
└───────────────────────────┬───────────────────────────────────┘
                            ▼
┌───────────────────────────────────────────────────────────────┐
│  PODACI  ·  Supabase (PostgreSQL + RLS + Auth + Storage)       │
└───────────────────────────────────────────────────────────────┘
        ▲
        │  Vercel Cron → app/api/cron/* (premium-expiry, sla-eskalacija)
```

---

## 4. Gdje se nalazi ključni kod


| Modul / odgovornost                 | Putanja u repou (`Projekat/`)                                                                                                                                                                              |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kontrola pristupa na ulazu (RBAC)   | `middleware.ts`                                                                                                                                                                                            |
| Stranice po ulozi                   | `app/korisnik/*`, `app/dispecer/*`, `app/serviser/*`, `app/admin/*`, `app/auth/*`                                                                                                                          |
| API rute (backend)                  | `app/api/*` (npr. `app/api/service-requests`, `app/api/dispecer/zahtjevi`, `app/api/serviser/intervencije`, `app/api/admin/users`, `app/api/premium`, `app/api/notifikacije`)                              |
| Zakazani poslovi (cron)             | `app/api/cron/premium-expiry`, `app/api/cron/sla-eskalacija` (+ `vercel.json`)                                                                                                                             |
| Poslovna logika                     | `lib/servisirane/*` (npr. `urgency.ts`, `slaPravila.ts`, `slaEskalacije.ts`, `statusPrelazi.ts`, `preporukaServisera.ts`, `geoIzracun.ts`, `dispecerskeFaze.ts`, `dugoChekanje.ts`, `analitikaMetrike.ts`) |
| Premium lifecycle                   | `lib/premium/lifecycle.ts`                                                                                                                                                                                 |
| Supabase klijenti                   | `lib/supabase/klijent.ts` (browser), `server.ts` (server), `admin.ts` (service-role), `middleware.ts`                                                                                                      |
| Auth (poruke, redirect, rate-limit) | `lib/auth/greskaPrijave.ts`, `lib/auth/emailRedirect.ts`, `lib/security/loginRateLimiter.ts`, `services/auth/authService.ts`                                                                               |
| Validacijske sheme (Zod)            | `lib/validations/authValidation.ts`, `lib/validations/servisirane.ts`                                                                                                                                      |
| Domenski tipovi                     | `domain/types/index.ts`, `domain/types/servisirane.ts`, `domain/types/supabase.ts`                                                                                                                         |
| UI komponente                       | `components/*` (`ui`, `forms`, `wizard`, `dispecer`, `korisnik`, `serviser`, `servisirane`, `shared`, `layout`)                                                                                            |
| Shema baze + RLS + bucketi          | `supabase/migrations/*`                                                                                                                                                                                    |


---

## 5. Kako komponente komuniciraju

**Glavni tok (zahtjev korisnika):**

```
Browser (stranica/forma, RHF+Zod)
   │ HTTPS, relativni /api/* poziv (isti domen — nema CORS-a)
   ▼
middleware.ts  ── provjeri prijavu (getUser) i ulogu; preusmjeri ako nije dozvoljeno
   ▼
app/api/...    ── ponovo autorizuj + validiraj ulaz (Zod)
   ▼
lib/servisirane / lib/premium ── primijeni poslovna pravila (status, SLA, triage…)
   ▼
Supabase (PostgreSQL)  ── RLS provjerava smije li korisnik čitati/pisati taj red
   ▼
odgovor (JSON) ── nazad kroz API → komponenta osvježi prikaz (TanStack Query)
```

**Zakazani tok (bez korisnika):** Vercel Cron (po `vercel.json`) poziva `app/api/cron/`* (zaštićeno `CRON_SECRET`-om) → poslovna logika (`lib/premium/lifecycle.ts`, `lib/servisirane/slaEskalacije.ts`) → Supabase (istek premiuma, SLA eskalacije) → audit zapisi.

**Frontend ↔ Backend:** isti Next.js deployment, isti domen → API rute su relativne (`/api/...`), bez zasebnog backend URL-a i bez CORS konfiguracije.

---

## 6. Najvažnije sigurnosne odluke


| Odluka                                   | Opis                                                                           | Gdje                                                  |
| ---------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------- |
| **Troslojni RBAC (defense in depth)**    | Provjera na ulazu (middleware) + ponovna provjera u API ruti + RLS na bazi     | `middleware.ts`, `app/api/`*, `supabase/migrations/*` |
| `**getUser()` umjesto `getSession()`**   | Sprečava CSRF/spoofing tokena (validira token na serveru)                      | `middleware.ts`                                       |
| **Service-role samo server-side**        | `SUPABASE_SERVICE_ROLE_KEY` (zaobilazak RLS) nikad na klijentu                 | `lib/supabase/admin.ts`                               |
| **Neutralne auth poruke**                | Ne otkriva postoji li/je li aktivan/nepotvrđen nalog (anti-enumeration)        | `lib/auth/greskaPrijave.ts` (PRAVILA.md §1)           |
| **Rate-limiting prijave**                | Blokira nakon više neuspjelih pokušaja                                         | `lib/security/loginRateLimiter.ts`                    |
| **Validacija ulaza (Zod)**               | Svi unosi se validiraju prije obrade                                           | `lib/validations/`*                                   |
| **Zaštita cron ruta**                    | `CRON_SECRET` obavezan u produkciji                                            | `app/api/cron/`*                                      |
| **Audit trail**                          | Sve bitne promjene (status, dodjela, premium…) bilježe se s autorom i vremenom | `historija_aktivnosti`, `premium_events`              |
| **Validacija upload-a slika**            | Provjera magic-bytes potpisa fajla (JPEG/PNG/WebP) + MIME + veličina           | `app/api/slike/route.ts` (`provjeriMagicBytes`)       |
| **Potvrda emaila prije slanja zahtjeva** | Blokira neverifikovane naloge                                                  | auth tok + `middleware.ts`                            |
| **HTTPS**                                | Automatski kroz Vercel                                                         | (hosting)                                             |
