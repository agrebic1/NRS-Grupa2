# Finalna tehnička dokumentacija: Sistem za upravljanje servisnim intervencijama

## Pregled arhitekture

**Naziv proizvoda:** InterServ (npm paket: `projekat`).

**Tip aplikacije:** full-stack **web aplikacija** kod koje korisnički dio (stranice) i serverski dio (aplikativna logika i pristup podacima) žive u istom projektu (`Projekat/`), a izvršavaju se u serverless okruženju (Vercel).

**Arhitektonski stil:** monolitna **klijent–server** aplikacija sa **slojevitom** organizacijom. Skladištenje podataka, autentifikacija i pohrana datoteka oslanjaju se na vanjsku „backend kao usluga” platformu (Supabase / PostgreSQL). Kontrola pristupa je **višeslojna**: provjera na ulazu (middleware pri navigaciji), provjera u svakom serverskom pozivu i sigurnosne politike na nivou same baze (Row Level Security). Sistem je projektovan po **Open–Closed** principu, nove funkcionalnosti se dodaju kao novi moduli i komponente, bez prepravljanja jezgra.

### Slojevi (konceptualno)

```
┌──────────────────────────────────────────────────────────────┐
│  KORISNIČKI SLOJ (browser)                                   │
│  Stranice i komponente · upravljanje formama i validacija    │
│  klijentsko keširanje (React Query) · stilizacija (Tailwind) │
└───────────────┬──────────────────────────────────────────────┘
                │ HTTP pozivi
┌───────────────▼──────────────────────────────────────────────┐
│  KONTROLA PRISTUPA NA ULAZU (middleware.ts)                  │
│  - provjera prijavljenosti i uloge pri svakoj navigaciji     │
│  - preusmjeravanje neovlaštenih u dozvoljenu zonu            │
└───────────────┬──────────────────────────────────────────────┘
                │
┌───────────────▼──────────────────────────────────────────────┐
│  SERVERSKI SLOJ (Next.js App Router)                          │
│  - stranice po ulozi (korisnik / serviser / dispečer / admin)│
│  - API rute (REST-stil, JSON) i serverske akcije             │
│  - ponovna provjera ovlaštenja + validacija ulaza (Zod)      │
└───────────────┬──────────────────────────────────────────────┘
                │ poziva
┌───────────────▼──────────────────────────────────────────────┐
│  POSLOVNA LOGIKA (lib/servisirane/, lib/premium/, domain/)   │
│  trijaža · SLA · faze obrade · geo-procjena · statusi ·      │
│  premium · notifikacije · validacijske sheme · domenski tipovi│
└───────────────┬──────────────────────────────────────────────┘
                │
┌───────────────▼──────────────────────────────────────────────┐
│  PODACI I PLATFORMA (Supabase)                               │
│  PostgreSQL · autentifikacija · pohrana datoteka             │
│  RLS politike                                                │
└──────────────────────────────────────────────────────────────┘
                ▲
                │ zakazani poslovi (dnevno)        ▲ vanjski servis (opcionalno)
        istek premiuma · SLA eskalacija            Resend API (email)
```

### Tehnološki stack (sa verzijama)

**Jezik i izvršno okruženje**
- TypeScript `^5.4.0` (lockfile: 5.9.3)
- Node.js **20**

**Framework i korisnički sloj**
- Next.js `^14.2.35` (App Router), React `18.2.0`
- Tailwind CSS `^3.4.0`, PostCSS `^8.5.12`, Autoprefixer `^10.4.0`
- Lucide React `^0.414.0` (ikone)

**Podaci i integracija**
- Supabase JS klijent `^2.45.0` i serverska (SSR) integracija `^0.5.0`
- TanStack React Query `^5.51.0` (klijentski dohvat i keširanje podataka)
- date-fns `^3.6.0` (rad s datumima)

**Forme i validacija**
- React Hook Form `^7.52.0` sa pratećim resolverima `^3.9.0`
- Zod `^3.23.0` (validacijske sheme, dijeljene klijent/server)

**Testiranje i kvalitet koda**
- Jest `^29.7.0` (jedinični i integracijski testovi)
- Testing Library (React) `^16.3.2`
- Playwright `^1.45.0` (end-to-end testovi)
- ESLint `^8.57.0` i Prettier `^3.3.0`

**Baza i infrastruktura**
- PostgreSQL (glavna verzija **17**)
- Hosting u serverless okruženju (Vercel), sa zakazanim poslovima (cron)
- Email: [Resend](https://resend.com) API (HTTP integracija, bez npm paketa)

---

## Korištene glavne komponente ili moduli

| Modul / komponenta | Odgovornost |
|---|---|
| **Kontrola pristupa na ulazu** (`middleware.ts`) | Pri svakoj navigaciji utvrđuje prijavljenost i ulogu te štiti zone korisnika, servisera, dispečera i administratora. Zaposlenici imaju pristup i `/korisnik/*` zoni. |
| **Pristup podacima i platformi** (`lib/supabase/`) | Sloj koji povezuje aplikaciju sa bazom, autentifikacijom i pohranom datoteka (klijentski, serverski i privilegovani serverski pristup). |
| **Autentifikacija** (`services/auth/authService.ts`, `lib/services/authServis.ts`) | Prijava, registracija i odjava; neutralne poruke o greškama; ograničavanje broja pokušaja prijave. |
| **Servisni zahtjevi** (`app/api/service-requests/`) | Kreiranje i pregled zahtjeva, izračun hitnosti (trijaža), provjera premium uslova, ograničenje učestalosti slanja. |
| **Trijaža / hitnost** (`lib/servisirane/urgency.ts`) | Bodovanje hitnosti (0–110), svrstavanje u nivoe i redoslijed u redu obrade. |
| **Kategorije kvara** (`lib/servisirane/kategorije.ts`) | 9 glavnih kategorija, 71 podkategorija; provjera ispravnosti kombinacija. |
| **Faze dispečerske obrade** (`lib/servisirane/dispecerskeFaze.ts`) | Vođenje kroz korake (prioritet → termin → serviser → potvrda) i određivanje trenutne faze. |
| **Čarobnjak planiranja** (`app/dispecer/planiranje/[id]/`) | 5-korak UI: pregled → prioritet → planiranje → nalog → potvrda. |
| **Statusni prelazi** (`lib/servisirane/statusPrelazi.ts`) | Pravila dozvoljenih promjena statusa po ulozi (serviser i dispečer). |
| **Dispečerske akcije** (`app/api/dispecer/zahtjevi/[id]/`) | Potvrda/odbijanje, dodjela i ponovna dodjela, promjena izvršioca i prioriteta, formalno zatvaranje, tim intervencije. |
| **Serviserske akcije** (`app/api/serviser/intervencije/[id]/`) | Prihvatanje/odbijanje, statusi na terenu, evidencija rada, napomene, vraćanje na dodjelu i „nije riješeno”. |
| **SLA mehanizam** (`lib/servisirane/slaPravila.ts`, `slaEskalacije.ts`) | Rokovi po prioritetu i automatska eskalacija prekoračenih intervencija dispečerima. |
| **Premium (životni ciklus)** (`lib/premium/lifecycle.ts`) | Simulirana aktivacija/potvrda/obnova/otkazivanje i bilježenje svih promjena. |
| **Geo-procjena i ruta** (`lib/servisirane/geoIzracun.ts`) | Haversine procjena udaljenosti i vremena dolaska od bazne lokacije servisera; preporuka najbližeg servisera. |
| **Dugo čekanje** (`lib/servisirane/dugoChekanje.ts`) | Klijentska detekcija intervencija koje predugo stoje u statusu; pragovi po statusu (2–8 h). |
| **Operativna faza** (`lib/servisirane/operativnaFaza.ts`) | Jedinstveno mapiranje statusa u operativnu fazu radi konzistentnog prikaza na svim ekranima. |
| **Notifikacije** (`lib/servisirane/notifikacijeHelper.ts`) | Obavijesti unutar aplikacije i pomoćne funkcije za njihovo kreiranje po ulogama. |
| **Partneri i administracija** (`app/api/partner-applications/`, `app/api/admin/`) | Prijem i odobravanje prijava partnera, upravljanje korisnicima, ulogama i premium statusom. |
| **Ocjene** (`app/api/service-requests/[id]/ocjena/`) | Unos i prikaz ocjene intervencije (nepromjenjive nakon unosa). |
| **Korisnički interfejs** (`components/ui/`, `components/layout/`) | Ponovo iskoristive komponente (dugmad, polja, modali, kartice, oznake statusa, AppShell). |
| **Domenski tipovi i validacijske sheme** (`domain/types/`, `lib/validations/`) | Centralne definicije tipova i pravila validacije, dijeljene između klijenta i servera. |

---

## Osnovna logika sistema

### Glavni tok podataka i kontrole (od zahtjeva do odgovora)

1. Korisnička komponenta šalje zahtjev serveru (ili poziva serversku akciju).
2. **Middleware** utvrđuje da li je korisnik prijavljen i koju ulogu ima, te neovlaštene preusmjerava. API pozivi vraćaju jasan status greške (umjesto preusmjerenja), kako bi klijent mogao prikazati odgovarajuću poruku.
3. **Serverski sloj** ponovo provjerava ovlaštenje za traženu radnju i **validira ulazne podatke** (Zod sheme) prije izvršenja.
4. **Pristup bazi** poštuje RLS politike; tamo gdje je potrebno izvršiti radnju koju politike same po sebi ograničavaju, koristi se privilegovani serverski pristup (`SUPABASE_SERVICE_ROLE_KEY`), ali tek **nakon ručne provjere ovlaštenja** u kodu.
5. Svaka relevantna promjena upisuje zapis u **historiju aktivnosti** (`intervention_activities`) i, gdje je primjenjivo, kreira **obavijest** (`notifikacije`).
6. Server vraća odgovor u JSON formatu; korisnički dio osvježava prikaz.

### Životni ciklus servisnog zahtjeva

```
pending_review / na_cekanju (Novi — korisnik može uređivati/otkazati)
   │  dispečer postavi operativni prioritet
   ▼
in_review (Dispečerski čarobnjak aktivan)
   │  dispečer potvrdi
   ▼
potvrdeno (čeka dodjelu / ponovnu dodjelu servisera)
   │  dispečer dodijeli servisera
   ▼
dodijeljeno (čeka prihvatanje servisera)
   │  serviser prihvati
   ▼
u_radu (serviser na putu)
   │  serviser stigao na lokaciju
   ▼
u_izvrsenju (rad na terenu; evidencija obavezna za završetak)
   │  serviser završi
   ▼
zavrseno (operativno gotovo; čeka formalno zatvaranje)
   │  dispečer formalno zatvori
   ▼
zatvoreno (samo za čitanje; korisnik može ostaviti ocjenu)

Sporedni terminalni ishodi: otkazano (korisnik) · odbijeno (dispečer, uz razlog)
Povratne grane: odbijanje / vraćanje na dodjelu / „nije riješeno” → potvrdeno (uz razlog;
broj ponovnih ciklusa se uvećava)
```

### Bodovanje hitnosti (trijaža)

Hitnost se računa zbirom bodova iz nekoliko kriterija (maksimalno 110): opasnost po ljudima (+50), stepen prekida funkcionalnosti (potpuni prekid +25, otežano +10), rizik od dodatne štete (+15), ranjivost (+10) i obuhvat (+10). Nivoi: ≥80 Kritično, ≥50 Visoko, ≥20 Srednje, ispod toga Nisko. Premium zahtjev automatski dobiva score 110 bez popunjavanja upitnika.

Dispečer koristi **operativni prioritet** (NISKO / SREDNJE / VISOKO / KRITIČNO / HITNO), nezavisno od korisničke procjene. Premium zahtjevi ne smiju biti degradirani ispod VISOKO bez obrazloženja (min. 10 znakova).

### Praćenje rokova (SLA)

Rok obrade zavisi od prioriteta: Nisko 72 h, Srednje 24 h, Visoko 8 h, Kritično/Hitno 2 h. Status roka može biti uredan (`ok`), upozorenje (`upozorenje`, ≤2 h preostalo) ili prekoračeno (`prekoraceno`). Zakazani dnevni posao (`/api/cron/sla-eskalacija`, 06:00 UTC) pronalazi prekoračene aktivne intervencije i obavještava dispečere, uz anti-spam od **2 h** po intervenciji (provjera postojećih notifikacija). Pri učitavanju dispečerskog inboxa dodatno se koristi `slaEskalacije.ts` sa cooldown-om od **6 h** po zahtjevu (`sla_eskalacija_at`).

### Premium (simulacija)

Premium prolazi kroz stanja: `inactive` / `expired` / `cancelled` → `pending_payment` → `active`. Trajanje je 30 dana (mjesečni) ili 365 dana (godišnji). Otkazivanje aktivnog paketa zadržava važenje do isteka perioda. Istek se obrađuje dnevnim cron poslom (`/api/cron/premium-expiry`, 02:00 UTC). Svaka promjena se bilježi u `premium_events`.

### Model podataka (glavni entiteti i relacije)

- **Osoba** (`osoba`): zajednički lični podaci svake osobe u sistemu (ime, prezime, email, telefon, adresa; za servisera opcionalno bazna lokacija). Povezana je jedan‑na‑jedan sa nalogom za prijavu (`auth.users`).
  - **Uposlenik** (`uposlenici`): podtip osobe koja je zaposlena (serviser, dispečer ili administrator); nosi pripadnost ulozi i oznaku verifikacije.
  - **Korisnik usluge** (`korisnik_usluge`): podtip osobe koja koristi servis (klijent); nosi premium status i podatke o premium paketu.
- **Uloga** (`uloga`): šifrarnik uloga: Administrator, Dispečer, Serviser, Klijent.
- **Servisni zahtjev** (`service_requests`): centralni entitet — ko je prijavio, kategorija i podkategorija kvara, adresa i opcionalne koordinate, opis, kontakt telefon, trenutni status, bodovi hitnosti i operativni prioritet, podaci o trijaži, predloženi i dogovoreni termini, dodijeljeni serviser, podaci o premiumu te podaci o otkazivanju, odbijanju i zatvaranju.
  - **Historija aktivnosti** (`intervention_activities`): hronološki zapis svih promjena i akcija nad zahtjevom.
  - **Evidencija rada** (`work_evidence`): opis obavljenog posla, trajanje i utrošeni materijal.
  - **Tim intervencije** (`tim_intervencije`): pomoćni serviseri dodijeljeni uz glavnog izvršioca.
  - **Slike intervencije**: prilozi u bucket-ima `service-request-photos` i `intervencije_slike`.
  - **Ocjena intervencije** (`intervencija_ocjene`): ocjena (1–5) i komentar korisnika nakon zatvaranja; UNIQUE po zahtjevu i korisniku.
- **Obavijest** (`notifikacije`): poruka unutar aplikacije namijenjena određenom korisniku.
- **Premium događaji** (`premium_events`): audit zapis svih promjena premium statusa.
- **Prijava partnera** (`partner_applications`): podaci osobe koja aplicira da postane serviser ili dispečer, sa statusom obrade (`na_cekanju`, `odobreno`; `odbijeno` postoji u tipovima ali nije implementirano u UI/API-ju).

**Relacije:** Osoba je nadtip; Uposlenik i Korisnik usluge su njeni podtipovi (zaposlenik istovremeno ima i korisnički profil). Servisni zahtjev pripada jednom korisniku i može imati dodijeljenog servisera. Uz zahtjev se vežu historija aktivnosti, evidencije rada, tim, slike i ocjena.

---

## Napomene za pokretanje ili korištenje

### Preduslovi
- Node.js 20+ i npm.
- Pristup Supabase projektu (URL i ključevi); baza je PostgreSQL 17.

### Instalacija i konfiguracija

1. Instalirati zavisnosti:
   ```bash
   cd Projekat
   npm install
   ```
2. Postaviti konfiguracione vrijednosti okruženja (`.env.local`):
   | Varijabla | Obavezna | Svrha |
   |-----------|----------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Da | URL Supabase projekta |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Da | Javni anon ključ |
   | `NEXT_PUBLIC_SITE_URL` | Da | Bazni URL za auth redirect (`/auth/callback`) |
   | `SUPABASE_SERVICE_ROLE_KEY` | Da | Privilegovani serverski pristup, cron poslovi |
   | `CRON_SECRET` | Produkcija | Zaštita zakazanih poslova |
   | `RESEND_API_KEY` | Ne | Slanje email poruka preko Resend API-ja |
   | `EMAIL_FROM` | Ne | Pošiljalac (default: `InterServ <noreply@interserv.ba>`) |

   Primjer: vidi `.env.example` u `Projekat/`.
3. Primijeniti migracije baze:
   ```bash
   supabase db push
   ```
   Pri kreiranju novog naloga trigger automatski kreira profil u `osoba` i dodjeljuje podrazumijevanu ulogu (Klijent → `korisnik_usluge`); uloge zaposlenih dodjeljuju se kroz odobrenje partnera ili administratora.
4. U Supabase Auth konfiguraciji postaviti Site URL i redirect URL (`{SITE_URL}/auth/callback`).

### Komande

| Svrha | Komanda |
|-------|---------|
| Razvoj | `npm run dev` (http://localhost:3000) |
| Produkcija | `npm run build` → `npm start` |
| Lint | `npm run lint` |
| Formatiranje | `npm run format` |
| Unit testovi | `npm run test:unit` |
| Integracijski testovi | `npm run test:integration` |
| Svi Jest testovi | `npm test` |
| Pokrivenost | `npm run test:coverage` |
| E2E testovi | `npm run test:e2e` |
| Kompletan izvještaj | `npm run test:izvjestaj` |

### Razvoj vs. produkcija
- U razvoju zakazani poslovi i email rade u pojednostavljenom režimu ako ključevi nisu postavljeni (email se loguje u konzolu umjesto slanja).
- U produkciji se izvršavaju dva zakazana posla na dnevnom nivou (Vercel cron):
  - **02:00 UTC** — istek premiuma (`/api/cron/premium-expiry`)
  - **06:00 UTC** — SLA eskalacija (`/api/cron/sla-eskalacija`)
- Oba zahtijevaju `Authorization: Bearer ${CRON_SECRET}` u produkciji.

### Kontinuirana integracija (CI)

Dva GitHub Actions workflow-a (Node 20, `npm ci`):
- **`test.yml`**: unit + integracijski testovi + izvještaj o pokrivenosti
- **`lint.yml`**: ESLint provjera

E2E testovi se **ne pokreću automatski u CI** — izvršavaju se ručno ili kroz `npm run test:izvjestaj` prije isporuke.

### Test stanje (07.06.2026.)

| Suite | Rezultat |
|-------|----------|
| Unit (27 suiteova) | 355/355 PASS |
| Integracija (17 suiteova) | 141/141 PASS |
| E2E (Playwright) | 37/37 PASS |
| **Ukupno automatski** | **533/533 PASS** |
| Manuelno (Sprint 11) | 42/42 PASS |

---

## Poznati tehnički dug i ograničenja

- **Ograničavanje učestalosti drži se u memoriji:** brojači pokušaja (prijava u `lib/security/loginRateLimiter.ts` i kreiranje zahtjeva u `lib/rateLimiter.ts`) čuvaju se u memoriji procesa. U serverless okruženju sa više instanci ovo ograničenje nije globalno pouzdano; preporučuje se vanjsko skladište (npr. Redis). *Sigurnosna napomena.*
- **Privilegovani serverski pristup zaobilazi RLS:** u tim slučajevima sigurnost počiva isključivo na ručnim provjerama ovlaštenja u kodu, pa su to kritična mjesta za pažljiv pregled.
- **Detekcija dugog čekanja je klijentske strane** (`lib/servisirane/dugoChekanje.ts`): računa se od trenutka kreiranja zahtjeva (ne od ulaska u konkretni status), vidljiva je samo dok je ekran otvoren i nema pozadinskih obavijesti.
- **Email u pojednostavljenom režimu:** bez `RESEND_API_KEY` poruke se ne šalju stvarno (log u konzolu).
- **Odbijanje partnerskih prijava:** status `odbijeno` postoji u domenskim tipovima, ali nema API rute ni admin UI-ja za odbijanje.
- **Pokrivenost testovima:** `jest.config.js` mjeri pokrivenost samo za 4 ciljana fajla, ne za cijeli projekat.

---

## Mogući naredni koraci razvoja

1. Uvesti vanjsko skladište za ograničavanje učestalosti (prijava i kreiranje zahtjeva) radi pouzdanosti u okruženju sa više instanci.
2. Premium: stvarna naplata (proces plaćanja, potvrda i scenariji neuspjeha) kao proširenje nakon MVP-a; arhitektura već razdvaja životni ciklus od audita (`premium_events`).
3. Prebaciti detekciju dugog čekanja i eskalaciju na server (zakazani poslovi) uz push/email obavijesti, te mjeriti vrijeme od ulaska u status, a ne od kreiranja.
4. Dodati agregaciju ocjena (prosjek po serviseru, trendovi) u analitiku; podaci već postoje u `intervencija_ocjene`.
5. Opciono unaprijediti procjenu rute stvarnim podacima o trajanju puta, uz zadržavanje postojeće okvirne procjene kao rezerve.
7. Implementirati odbijanje partnerskih prijava (API + admin UI) i ukloniti zastarjele alias funkcije.
8. Uključiti E2E testove u CI pipeline ili definisati jasan gate prije produkcijske isporuke.
