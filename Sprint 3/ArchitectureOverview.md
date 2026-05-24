# Architecture Overview

## 1. Opis arhitektonskog pristupa

 Arhitektonske odluke proizlaze iz zahtjeva definisanih kroz korisničke priče, nefunkcionalne zahtjeve i domenski model.   
Ključni prioriteti koji su vodili dizajn sistema su:
1. Skalabilnost: Podrška rastu broja korisnika i intervencija bez restrukturiranja sistema (PBI-001 do PBI-021, NFR-003).
2. Sigurnost podataka: Strogo razdvajanje pristupa podacima po korisničkim ulogama (PBI-002, NFR-007 do NFR-010).
3. Održivost: Izmjene modula bez uticaja na nepovezane dijelove sistema (NFR-016).
4. Responzivnost: Funkcionalnost na uređajima različitih veličina bez dodatne instalacije (NFR-013, NFR-015).
5. Jednostavna implementacija: Omogućena brza izrada MVP verzije.

Na osnovu ovih zahtjeva odabran je **arhitektonski stil slojevite (layered, n-tier) arhitekture** sa jasno razdvojenim odgovornostima.  
**Sistem je organizovan u četiri logička sloja:**
```
┌─────────────────────────────────────────────────────────────────┐
│                  PREZENTACIJSKI SLOJ                            │
│           (Next.js React komponente + Tailwind CSS)             │
│   Korisnik usluge | Dispečer | Serviser | Administrator         │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTP(S) zahtjevi
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                  APLIKACIJSKI SLOJ                              │
│          (Next.js API Routes /api/v1/ — RESTful)                │
│     Validacija unosa | Provjera autorizacije | Orchestracija    │
└─────────────────────────┬───────────────────────────────────────┘
                          │ Pozivi prema domeni
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DOMENSKI SLOJ                                │
│            (Poslovna logika i pravila sistema)                  │
│   Statusne tranzicije | Prioritizacija | Pravila dodjele        │
└─────────────────────────┬───────────────────────────────────────┘
                          │ Repository pozivi
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                 INFRASTRUKTURNI SLOJ                            │
│       (Supabase: PostgreSQL + Auth + RLS + Storage)             │
│     Trajna pohrana | Autentifikacija | Sigurnosna pravila       │
└─────────────────────────────────────────────────────────────────┘
```

Zavisnosti teku isključivo prema unutrašnjosti sistema, čime se osigurava da promjene u infrastrukturnom sloju ne utiču na domensku i prezentacijsku logiku.

Sistem podržava četiri korisničke uloge: klijent, dispečer, serviser i administrator, sa jasno razgraničenim ovlaštenjima.

Veza između zahtjeva sistema i arhitektonskih odluka prikazana je u sljedećoj tabeli:
| Zahtjev sistema | Arhitektonska odluka |
| :--- | :--- |
| **4 uloge s različitim privilegijama** (PBI-002) | RBAC u aplikacijskom sloju + RLS politike u infrastrukturnom sloju |
| **Dostupnost na desktop i mobilnim uređajima** (NFR-013, NFR-014) | Vercel CDN + responzivni Next.js frontend bez dodatne instalacije |
| **Složena poslovna logika: prioritizacija, planiranje, dodjela** (PBI-010, PBI-011, PBI-012) | Izolacija u domenskom i aplikacijskom sloju, nezavisno od UI-a |
| **Sigurnost: hashiranje lozinki, HTTPS, zaštita sesija** (NFR-007, NFR-008, NFR-009) | Supabase Auth + RLS + automatski HTTPS kroz Vercel |
| **Evidencija historije aktivnosti i audit trail** (PBI-021) | Centralizirani Audit logger u aplikacijskom sloju, *HistorijaAktivnosti* entitet u domenskom sloju |
| **Pohrana slikovnih dokaza pri evidenciji rada** (PBI-017) | Supabase File Storage u infrastrukturnom sloju |
| **GDPR: minimalno prikupljanje i zaštita ličnih podataka** (EXT-ZAK-01) | *Privacy by Design* ugrađen u domenski model od početka razvoja |

Arhitektonski model implementiran je kroz odabrani tehnološki stack:
| Tehnologija | Sloj | Uloga u sistemu |
|---|---|---|
| **Next.js** | Prezentacijski + Aplikacijski | React komponente (UI) i API rute (`/api/v1/`) |
| **Supabase + PostgreSQL** | Infrastrukturni | Autentifikacija, RLS, file storage, baza podataka |
| **Vercel** | Deployment | HTTPS, globalni CDN, automatski deployment |

U ovoj arhitekturi, Next.js pokriva prezentacijski sloj kroz React komponente i aplikacijski sloj kroz API rute. Supabase sa PostgreSQL bazom čini infrastrukturni sloj, obezbjeđujući autentifikaciju, sigurnosne mehanizme i pohranu podataka. Vercel osigurava HTTPS i globalnu dostupnost putem CDN-a, čime se zadovoljavaju zahtjevi sigurnosti i performansi.

## 2. Glavne komponente sistema
Sistem je organiziran u sedam funkcionalnih cjelina koje zajedno pokrivaju cjelokupan životni ciklus servisne intervencije. 
Svaka cjelina sadrži module koji su raspoređeni po slojevima arhitekture.
```
├── 1. Autentifikacija i upravljanje sesijama
│       ├── Registracija korisnika usluge (US-01)
│       ├── Prijava korisnika (US-02)
│       ├── Odjava korisnika (US-03)
│       └── Upravljanje sesijama (JWT, istek nakon 8h — NFR-008)
│
├── 2. Kontrola pristupa (RBAC)
│       ├── Definicija uloga: klijent, dispečer, serviser, admin
│       ├── Provjera ovlaštenja na API razini (US-04)
│       └── Row Level Security (RLS) na razini baze podataka
│
├── 3. Upravljanje korisničkim nalozima (Admin)
│       ├── Kreiranje internih naloga (US-18)
│       ├── Pregled korisnika (US-19)
│       ├── Promjena uloge (US-20)
│       └── Deaktivacija naloga (US-21)
│
├── 4. Upravljanje zahtjevima
│       ├── Kreiranje zahtjeva (US-05)
│       ├── Pregled vlastitog zahtjeva (US-06)
│       ├── Izmjena zahtjeva (US-26)
│       └── Otkazivanje zahtjeva (US-27)
│
├── 5. Operativni modul dispečera
│       ├── Pregled liste intervencija (US-07, US-13)
│       ├── Detalji intervencije (US-08)
│       ├── Operativna kontrolna tabla / dashboard (US-31)
│       ├── Određivanje prioriteta (US-12)
│       ├── Planiranje terena (US-11)
│       ├── Dodjela izvršiocu / timu (US-09, US-10)
│       └── Preraspodjela i ponovna dodjela (US-28, US-29)
│
├── 6. Serviserski modul
│       ├── Pregled dodijeljenih zadataka (US-15, US-16)
│       ├── Prihvatanje / odbijanje zadatka (US-22, US-23)
│       ├── Ažuriranje statusa intervencije (US-14)
│       └── Evidentiranje izvršenog rada (US-17)
│
└── 7. Zatvaranje i revizija
        ├── Pregled evidentiranog rada — dispečer (US-24)
        ├── Potvrda i zatvaranje intervencije (US-25)
        ├── Napomene na intervenciji (US-30)
        ├── Historija aktivnosti / audit trail (US-32, US-39, US-44)
        ├── SLA eskalacije (US-41, US-45)
        ├── Evidencija materijala — stavke (US-46)
        └── Praćenje ponovnog ciklusa — FTR (US-47)
```

## 3. Odgovornosti komponenti

### 3.1 Prezentacijski sloj  
Prezentacijski sloj implementiran je kroz Next.js React komponente uz Tailwind CSS za stilizovanje. Ovaj sloj je jedini koji je direktno vidljiv krajnjim korisnicima i njegova jedina odgovornost je prikazivanje podataka i prihvatanje korisničkog unosa.
```
Struktura komponenti
│
├── Zajednički elementi (Shared UI)
│       ├── Navigacijska traka (prilagođena ulozi)
│       ├── Komponente forme (InputField, SelectField, DatePicker)
│       ├── Komponente prikaza (StatusBadge, PriorityBadge)
│       └── Povratne poruke (ErrorMessage, SuccessToast)
│
├── Stranice korisnika usluge
│       ├── /login — forma za prijavu
│       ├── /register — forma za registraciju
│       ├── /zahtjevi/novi — kreiranje zahtjeva
│       └── /zahtjevi — pregled vlastitih zahtjeva
│
├── Stranice dispečera
│       ├── /dashboard — operativna kontrolna tabla
│       ├── /intervencije — lista intervencija
│       ├── /intervencije/[id] — detalji intervencije
│       └── /intervencije/[id]/dodjela — dodjela servisera
│
├── Stranice servisera
│       ├── /zadaci — lista dodijeljenih zadataka
│       └── /zadaci/[id] — detalji zadatka + evidencija rada
│
└── Stranice administratora
        └── /korisnici — upravljanje korisničkim nalozima
```

### 3.2 Aplikacijski sloj
Aplikacijski sloj implementiran je kroz Next.js API Routes unutar /api/v1/ putanje, u skladu sa zahtjevom koji propisuje RESTful dizajn s konzistentnom upotrebom HTTP metoda i standardnih statusnih kodova.
Ovaj sloj ne sadržava poslovnu logiku, on orkestrira pozive prema domenskom sloju i infrastrukturnom sloju, provjerava formalnu ispravnost unosa i autorizira svaki zahtjev prema korisničkoj ulozi.

```
Aplikacijski sloj — API endpointi (/api/v1/)
│
├── /auth
│       ├── POST /register        → registracija korisnika usluge
│       ├── POST /login           → prijava i kreiranje sesije
│       └── POST /logout          → odjava i poništavanje sesije
│
├── /users (Admin)
│       ├── GET    /users         → lista korisnika
│       ├── POST   /users         → kreiranje internog korisnika
│       ├── PATCH  /users/:id     → izmjena uloge
│       └── DELETE /users/:id     → deaktivacija naloga
│
├── /zahtjevi
│       ├── POST   /zahtjevi      → kreiranje zahtjeva (klijent)
│       ├── GET    /zahtjevi/:id  → pregled vlastitog zahtjeva
│       ├── PATCH  /zahtjevi/:id  → izmjena zahtjeva
│       └── DELETE /zahtjevi/:id  → otkazivanje zahtjeva
│
├── /intervencije
│       ├── GET    /intervencije           → lista (dispečer)
│       ├── GET    /intervencije/:id       → detalji
│       ├── PATCH  /intervencije/:id       → izmjena (prioritet, status)
│       ├── POST   /intervencije/:id/dodjela    → dodjela servisera
│       └── PATCH  /intervencije/:id/dodjela    → preraspodjela
│
├── /zadaci (Serviser)
│       ├── GET    /zadaci             → dodijeljeni zadaci
│       ├── PATCH  /zadaci/:id/status  → prihvatanje/odbijanje/ažuriranje
│       └── POST   /zadaci/:id/evidencija → evidentiranje rada
│
└── /napomene, /historija
        ├── POST /intervencije/:id/napomene → dodavanje napomene
        └── GET  /intervencije/:id/historija → pregled audit traila
```

### 3.3 Domenski sloj
Domenski sloj sadrži poslovnu logiku sistema. Ovo je najstabilniji sloj, promjene u infrastrukturi ne smiju zahtijevati izmjene u domenskim pravilima.
```
Ključna pravila i entiteti
│
├── Upravljanje statusima intervencije
│       │
│       └── Dozvoljene tranzicije:
│               KREIRAN → NA_ČEKANJU → DODIJELJEN → U_TOKU
│               U_TOKU  → ZAVRŠEN (samo s evidentiranim radom)
│               DODIJELJEN → NA_PONOVNOJ_DODJELI (odbijanje)
│               KREIRAN/NA_ČEKANJU → OTKAZAN (klijent)
│
├── Upravljanje statusima zahtjeva
│       └── OTVOREN → U_OBRADI → ZATVOREN | OTKAZAN
│
├── Pravila dodjele
│       ├── Dodjela je dozvoljena samo dispečeru (RBAC)
│       ├── Intervencija mora biti u statusu NA_ČEKANJU za dodjelu
│       ├── Jedan primarni serviser + opcionalni pomoćni serviser
│       └── Odbijanje → vraćanje u NA_PONOVNOJ_DODJELI
│
├── Pravila zatvaranja intervencije
│       ├── Intervencija mora biti u statusu ZAVRŠEN
│       ├── Evidencija rada mora biti unesena (ne smije biti prazna)
│       └── Samo dispečer može formalno zatvoriti intervenciju
│
├── Pravila izmjene zahtjeva
│       └── Izmjena/otkazivanje dozvoljeno samo ako je status OTVOREN
│           (zahtjev nije prešao u internu obradu — US-26, US-27)
│
└── Audit trail
        └── Svaka promjena statusa, dodjela, napomena i zatvaranje
            automatski se bilježi u Historija_aktivnosti s autorom
            i vremenskom oznakom (US-32, EXT-ZAK-02)
```

### 3.4 Infrastrukturni sloj
Infrastrukturni sloj realiziran je kroz Supabase platformu koja objedinjuje PostgreSQL bazu podataka, ugrađeni autentifikacijski servis, Row Level Security mehanizam i, po potrebi, Edge Functions za serverless logiku.
Pristup bazi podataka iz domenskog sloja odvija se isključivo kroz Repository pattern, domenski sloj ne poznaje SQL ni Supabase klijentsku biblioteku direktno. Ova apstrakcija omogućava zamjenu infrastrukturne implementacije bez izmjena poslovne logike, što je ključno za buduće proširenje sistema.
```
Infrastrukturni sloj — Supabase + PostgreSQL
│
├── Baza podataka (PostgreSQL na Supabase)
│       │
│       ├── Korisnik_usluge          (prijava, pregled zahtjeva)
│       ├── Uposlenici               (dispečer, serviser, admin)
│       ├── Uloga                    (RBAC definicija uloga)
│       │
│       ├── Zahtjev                  (prijava kvara, status, lokacija)
│       ├── Intervencija             (operativni zadatak, prioritet)
│       ├── Dodjela                  (serviser, prihvatanje/odbijanje)
│       ├── Evidencija_rada          (utrošeno vrijeme, materijal)
│       │
│       ├── Status                   (jedinstveni entitet sa tip_statusa ENUM)
│       ├── Prioritet                (hitnost intervencije)
│       ├── Lokacija                 (prostorni podatak kvara)
│       ├── Kategorija_kvara         (klasifikacija tipa problema)
│       │
│       ├── Napomena                 (interna komunikacija na intervenciji)
│       └── Historija_aktivnosti     (audit trail — sve promjene)
│
├── Row Level Security (RLS)
│       ├── Klijent vidi samo vlastite zahtjeve
│       ├── Serviser vidi samo njemu dodijeljene intervencije
│       ├── Dispečer vidi sve aktivne intervencije
│       └── Admin ima puni pristup korisničkim podacima
│
├── Supabase Auth
│       ├── Registracija + prijava + JWT tokeni
│       ├── Bcrypt hashiranje lozinki (cost faktor ≥ 10 — NFR-007)
│       ├── Automatski istek sesije nakon 8h neaktivnosti (NFR-008)
│       └── HTTPS-only komunikacija (NFR-010)
│
└── Repository pattern (apstrakcija pristupa podacima)
        ├── ZahtjevRepository
        ├── IntervencijaRepository
        ├── DodjelaRepository
        ├── KorisnikRepository
        └── HistorijaAktivnostiRepository
```

## 4. Tok podataka i interakcija

### 4.1 Komunikacija između slojeva
Komunikacija u sistemu teče jednosmjerno prema principu slojevite arhitekture. Prezentacijski sloj šalje HTTP zahtjeve prema aplikacijskom sloju putem REST API-ja. Aplikacijski sloj poziva domenski sloj radi primjene poslovnih pravila, a domenski sloj komunicira s infrastrukturnim slojem isključivo kroz repository apstrakciju. Odgovori se vraćaju istim putem u obrnutom smjeru.
```
Korisnik (preglednik)
        │
        │  HTTPS / REST API
        ▼
Aplikacijski sloj (/api/v1/)
        │   Provjera JWT tokena
        │   Provjera uloge (403 ako nije dozvoljena akcija)
        │   Validacija ulaznih podataka
        ▼
Domenski sloj
        │   Primjena poslovnih pravila
        │   Provjera statusnih tranzicija
        │   Kreiranje Historija_aktivnosti zapisa
        ▼
Repository (apstrakcija)
        │
        ▼
Supabase (PostgreSQL + RLS)
        │   RLS provjerava da li korisnik smije čitati/pisati taj red
        │   Pohrana podataka
        │   Vraćanje rezultata
        ▼
Domenski sloj → Aplikacijski sloj → Prezentacijski sloj
```

### 4.2 Ključni komunikacijski scenariji
#### 4.2.1 Scenario 1: Kreiranje zahtjeva od strane klijenta 
```
Klijent unosi podatke u formu
        ↓
[Prezentacijski sloj] Validacija forme na klijentskoj strani
        ↓
POST /api/v1/zahtjevi  (s JWT tokenom u Authorization headeru)
        ↓
[Aplikacijski sloj] Provjera JWT → Potvrda uloge 'klijent' → Validacija tijela zahtjeva
        ↓
[Domenski sloj] Kreiranje Zahtjev entiteta → Dodjela statusa 'OTVOREN'
                Kreiranje Historija_aktivnosti zapisa
        ↓
[Infrastrukturni sloj] ZahtjevRepository.create() → INSERT u PostgreSQL
        ↓
HTTP 201 Created → Klijent vidi potvrdu i zahtjev u listi
```
#### 4.2.2 Scenario 2: Dodjela intervencije serviseru
```
Dispečer odabire servisera iz padajućeg menija
        ↓
POST /api/v1/intervencije/:id/dodjela
        ↓
[Aplikacijski sloj] JWT provjera → Uloga 'dispečer' potvrđena
        ↓
[Domenski sloj] Provjera statusa intervencije (mora biti 'NA_ČEKANJU')
                Kreiranje Dodjela entiteta → Status → 'DODIJELJEN'
                Upis u Historija_aktivnosti
        ↓
[Infrastrukturni sloj] DodjelaRepository.create() → INSERT
                       IntervencijaRepository.updateStatus() → UPDATE
        ↓
HTTP 200 OK → Serviser vidi novi zadatak u listi (RLS dozvoljava)
```
#### 4.2.3 Scenario 3: Pokušaj neovlaštenog pristupa
```
Klijent šalje GET /api/v1/intervencije  (lista svih intervencija)
        ↓
[Aplikacijski sloj] JWT provjera → Uloga 'klijent' identificirana
                    Pristup listi svih intervencija nije dozvoljen ulozi 'klijent'
        ↓
HTTP 403 Forbidden  → Poruka "Pristup nije dozvoljen"
Sistemski log: evidentiran pokušaj, vremenska oznaka, ID korisnika
```

## 5. Ključne tehničke odluke (KTO)
U ovom poglavlju dokumentiraju se ključne arhitektonske odluke s obrazloženjem zašto je svaka od njih donesena. 
| Odluka | Razlog |
|--------|--------|
| Next.js kao full-stack okvir | Jedinstven projekt za frontend i backend (React + API Routes); ispunjava NFR-015 (web bez instalacije) i NFR-013 (responzivnost); smanjuje kompleksnost (jedan repo, jedan deployment); usklađeno s ORG-IMP-01 |
| Supabase kao Backend-as-a-Service | PostgreSQL + Auth + RLS + Storage u jednom; podržava NFR-007 (hashiranje), NFR-008 (JWT sesije), NFR-010 (HTTPS), NFR-009 (sigurnost); EU hosting (GDPR); relacijski model odgovara domenskim zahtjevima |
| RESTful API dizajn | Standardizirani endpointi (/api/v1, HTTP metode); lakša dokumentacija (NFR-017); omogućava paralelan rad frontend/backend (ORG-IMP-03); manja složenost od GraphQL za MVP |
| RLS + backend RBAC (defense in depth) | Dvostruka kontrola pristupa: API + baza; ispunjava NFR-009 i PBI-002; RLS štiti podatke čak i kod grešaka u aplikaciji |
| Repository pattern | Apstrakcija pristupa bazi; podržava modularnost (NFR-016); lakše testiranje (mock); izolacija od Supabase vendor lock-in |
| Vercel deployment | Automatski deployment i GitHub integracija; zadovoljava NFR-004 (dostupnost) i NFR-010 (HTTPS); preview okruženja za PR-ove |

## 6. Ograničenja i rizici arhitekture
| Ograničenje | Razlog | Uticaj |
|------------|--------|---------|
| Nema offline podrške | Web aplikacija zavisna od Supabase cloud servisa; ProductVision ne zahtijeva offline rad u MVP-u | Bez internet konekcije nema pristupa sistemu; prihvatljivo za MVP |
| Nema real-time (push) notifikacija | Supabase Realtime nije uključen u MVP scope; ProductVision ograničenje | Potrebno ručno osvježavanje za nove zadatke; može se dodati kasnije |
| Monolitna Next.js aplikacija | Mikroservisi nisu opravdani za MVP (resursi i složenost) | Nema nezavisnog skaliranja modula; dovoljno za NFR-003 (≈50 korisnika) |
| Zavisnost od Supabase servisa | Korištenje managed BaaS platforme | Rizik vendor lock-in; mitigacija: backupi (NFR-006) i moguća migracija na PostgreSQL |

| Rizik | Vjerovatnoća | Uticaj | Ublažavanje rizika |
|------|--------------|---------|------------|
| Neispravan RLS (curenje podataka) | Srednja | Visok | Code review RLS politika; testiranje s različitim ulogama na kraju svakog sprinta |
| Nedosljedne statusne tranzicije | Srednja | Visok | Centralizacija logike u domenskom sloju; unit testovi za dozvoljene i nedozvoljene tranzicije (ORG-STD-02) |
| Preopterećenje aplikacijskog sloja | Srednja | Srednji | Code review; jasno razdvajanje odgovornosti i granica slojeva |
| Sporiji API odgovori pri rastu podataka | Niska | Srednji | Indeksi u PostgreSQL (status, dispečer, datum); SSR i caching u Next.js |

## 7. Otvorena pitanja
| Tema | Ključno pitanje | Uticaj |
|------|----------------|--------|
| Supabase Edge Functions vs Next.js API Routes za kompleksnu logiku | Da li koristiti Supabase Edge Functions za kritičnu poslovnu logiku (npr. automatsko kreiranje `Historija_aktivnosti` zapisa putem database trigera) ili sve zadržati unutar Next.js API Routes? | Odgovor utiče na arhitekturu domenskog sloja i testabilnost. |
| Granularnost RLS politika | Da li serviser smije čitati detalje intervencija koje su mu bile dodijeljene ranije (historija) ili samo trenutno aktivne? | Odgovor utiče na definiciju sigurnosnih (RLS) politika i pristup podacima. |
| Strategija cacheovanja za dispečerski dashboard | Dashboard prikazuje agregatne podatke (broj po statusima, prioritetima). Da li koristiti Next.js ISR (Incremental Static Regeneration) ili SWR biblioteku za client-side caching? | Odgovor utiče na performanse (NFR-001) i arhitekturu prezentacijskog sloja. |
| Notifikacija servisera o dodjeli | Use case US-28 (Promjena izvršioca) navodi "Sistem obavještava novog servisera o dodjeli". Koji je mehanizam: e-mail notifikacija, Supabase Realtime, ili samo ažuriranje liste pri sljedećem osvježavanju? | Odgovor utiče na arhitekturu i opseg MVP-a. |
