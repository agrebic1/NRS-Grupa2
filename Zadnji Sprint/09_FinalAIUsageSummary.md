# AI Usage Report — InterServ (NRS-Grupa2)

## 1. Overview of AI Usage

Tokom razvoja sistema InterServ, tim NRS-Grupa2 je sistematski i transparentno dokumentovao svako korištenje AI alata kroz sprint-level `AIUsageLog.md` fajlove (Sprint 5 – Sprint 11). Na osnovu analize 58 evidentiranih unosa, AI je bio prisutan u svim fazama razvoja: od inicijalne arhitekture i implementacije poslovne logike, do testiranja, debugging-a i finalne dokumentacije.

Korišćeni AI alati kroz cijeli projekat bili su: Claude 3.5 Sonnet i Claude AI (Anthropic), Cursor (IDE s ugrađenom AI asistencijom) i Claude Code (terminalni AI agent), te ChatGPT (OpenAI). Cursor i Claude Code korišćeni su intenzivno za direktnu generaciju i refaktorisanje koda unutar razvojnog okruženja, dok su Claude AI i ChatGPT korišćeni za arhitekturalne savjete, planiranje tokova i debugging.

### Raspored korištenja po sprintu

| Sprint | Alat(i) | Broj log unosa | Primarni fokus | Ko je koristio alat |
|---|---|---|---|---|
| Sprint 5 | Claude 3.5 Sonnet, Cursor, ChatGPT | 8 | Arhitektura, auth/RBAC, UI, CSS, deployment | Ajna Ičić, Amina Grebić, Ajla Ćesir |
| Sprint 6 | Claude AI, Cursor | 12 | Wizard forme, premium lifecycle, test orchestration | Ajna Ičić, Amina Grebić, Ajla Ćesir |
| Sprint 7 | ChatGPT, Cursor | 7 | Dispečerski modul, statusne faze, RBAC e2e | Eldin Begić, Suada Peci, Hamza Bunar, Ajla Ćesir |
| Sprint 8 | Claude AI | 9 | UX/UI intervencija, workflow, dodjela servisera | Amina Grebić, Ajna Ičić |
| Sprint 9 | Claude AI, Cursor | 11 | SLA engine, audit trail, US-28–47 | Amina Grebić, Ajna Ičić, Ajla Ćesir |
| Sprint 10 | Claude Code | 5 | Geo-preporuka, analitika dashboard, responsive, sigurnost | Ajla Ćesir |
| Sprint 11 | Cursor | 6 | Ruta servisera, ocjena, dugo-čekanje, historija | Ajla Ćesir |

> **Napomena:** Suada Peci je evidentirana kao korisnik AI alata u Sprintu 7 (ChatGPT) za realizaciju US-13 i US-31 (operativni dashboard/status pregled za dispečera).

---

## 2. Accepted AI Contributions

Sljedeće AI generisane komponente i prijedlozi su prihvaćeni u finalnu verziju sistema bez ili sa manjim izmjenama. Prihvatanje je bazirano na tome da je AI prijedlog zadovoljavao inženjerske standarde projekta i poslovne zahtjeve user storija.

| AI prijedlog / komponenta | Šta je prihvaćeno i zašto |
|---|---|
| Arhitektura direktorija i SOLID principi (S5) | AI je predložio Next.js 14 strukturu s domain, services i repository slojevima. Tim prihvatio u potpunosti jer je ispoštovao zahtjeve Separation of Concerns i SOLID principa. Ekvivalentno strukturi u `app/`, `lib/`, `domain/types/` direktorijima. |
| Middleware za sesije i TypeScript interfejsi (S5) | AI generisao `authService.ts` i `middleware.ts` za sinhronizaciju kolačića, prelaz na `getUser()` i sprečavanje Infinite Redirect loopa. Prihvaćena logika rukovanja kolačićima i DB-based autorizacija umjesto `user_metadata`. |
| RegisterForm.tsx i LoginForm.tsx s live validacijom (S5) | Generisan dinamički wizard, live validacija, vizuelni indikator jačine lozinke, automatski redirect. Prihvaćena kompletna implementacija live validacije i Zod sheme s porukama na bosanskom. |
| Centralizovani CSS color system (S5) | AI predložio `:root` sistem semantičkih CSS varijabli. Prihvaćeno centralizovano upravljanje bojama, čime je otklonjena redundancija hardkodiranih hex vrijednosti kroz kod. |
| RLS politike i helper funkcije za uloge (S5) | AI predložio strukturu RLS politika i `is_admin`/`is_dispecer`/`is_serviser` helper funkcije. Tim prihvatio kompletni RLS model i DB-based autorizacioni flow za admin rute. |
| Dvokorak premium aktivacije: start → confirm (S6) | AI generisao strukturu lifecycle tranzicija i skeleton endpointa (start, confirm, cancel, renew). Tim prihvatio striktni dvokorak aktivacije i audit event logging za premium akcije. |
| `tools/pokreniSveTestoveIzvjestaj.mjs` (S6) | AI generisao Node.js skriptu za orchestration testova s timestamp folderom, IZVJESTAJ.md i ZADNJI_RUN.txt. Prihvaćena kompletna struktura, uz izmjenu E2E na `--workers=1`. |
| Dispečerski modul: inbox, KPI kartice, split panel (S7) | AI generisao strukturu stranica i JSX/layout, podjelu na komponente. Tim prihvatio kompletan dispečerski tok: ekrani, kartice, API i zaštita ruta. |
| SLA engine (`lib/servisirane/slaPravila.ts`) (S9) | AI generisao funkcije `izracunajSlaRok()`, `getSlaStatus()`, `SLA_ROKOVI_SATI` konstante i `SlaStatus` tip. Prihvaćeni SLA pragovi po prioritetu (2h/8h/24h/72h) i status ok/upozorenje/prekoraceno. |
| SlaStatusBadge.tsx i KPI integracija (S9) | AI generisao reusable badge komponentu (zelena/žuta/crvena) i KPI "Prekoračen SLA" na dashboardu. Tim prihvatio u potpunosti uz prilagodbu grid kolona. |
| Modal komponente: PromijeniIzvrsiocaModal, VratiNaPonovnuDodjeluModal (S9) | Prihvaćen modalni tok s obaveznim razlogom, optimističko osvježavanje liste i vidljivost akcija samo u dozvoljenim statusima. |
| Haversine funkcija za geo-preporuku (S10) | AI generisao početnu verziju haversine funkcije u `preporukaServisera.ts`. Prihvaćen kombinovani scoring model (stručnost 40%, opterećenje 35%, verifikacija 25%, blizina 20%). |
| OcjenaIntervencije.tsx i API ocjena (S11) | AI generisao API rutu `app/api/service-requests/[id]/ocjena/route.ts`, Zod shemu, React komponentu i Supabase migracije. Prihvaćena validacija samo za vlastitu zatvorenu intervenciju i audit zapis. |
| `dugoChekanje.ts` modul (S11) | AI generisao modul s pragovima po statusu i client-side izračunom. Tim prihvatio pristup bez novih DB kolona i vizualno isticanje u dispečerskim listama. |
| `geoIzracun.ts` za procjenu rute (S11) | AI generisao Haversine formulu s `CESTOVNI_FAKTOR=1.35` i `PROSJECNA_BRZINA_KMH=45` za BiH okruženje. Prihvaćeni dual-marker OSM prikaz i dugme za Google Maps navigaciju. |

---

## 3. Modified AI Contributions

Sljedeći AI prijedlozi su prihvaćeni samo djelimično, s konkretnim izmjenama koje je tim napravio kako bi rješenje bolje odgovaralo poslovnim pravilima, arhitekturi projekta ili domenskim zahtjevima.

| Komponenta / odluka | Originalni AI prijedlog | Izmjena tima | Razlog izmjene |
|---|---|---|---|
| Nazivi tabela u bazi (S5) | AI predložio engleski naming: `service_users` | Promjena u bosanski: `korisnik_usluge`, `korisnik` i sl. | Usklađivanje sa lokalnim jezičkim zahtjevima i domenskim modelom projekta |
| Logika trijaže (S6): linearna forma vs. matrica | AI predložio standardni linearni wizard s generičkim kategorizacijama | Tim implementirao dvonivojsku matricu kategorija (8+1×8+1) u obliku kartica | Matrica omogućava brži unos na terenu i bolju obuhvatnost bez potrebe za scroll-om |
| RegisterForm redoslijed koraka (S5) | AI predložio određeni redoslijed koraka i hex kodove za animacije | Prilagođeni redoslijed i specifični hex kodovi paleta | Vizuelni identitet i UX flow prilagođen timu |
| Scoring za preporuku servisera (S8/S10) | AI predložio potpuno automatsku dodjelu servisera isključivo po udaljenosti | Tim implementirao asistivni model: sistem predlaže, dispečer odlučuje; težinski faktori ručno kalibrisani | Operativna odgovornost mora ostati na dispečeru; automatska dodjela bez kontrole bila bi rizična u produkciji |
| E2E testovi: paralelni run (S6) | AI generisao E2E orchestration s paralelnim pokretanjem | Tim promijenio na `--workers=1` radi stabilnosti login/RBAC scenarija | Paralelni E2E run uzrokovao race condition i autentifikacione padove |
| Poruke grešaka na API-ju (S5, S8) | AI inicijalno generisao tehničke poruke koje otkrivaju interne detalje | Tim standardizovao neutralne poruke i lokalizovao na bosanski jezik | Sigurnosni zahtjev: neutralne auth poruke ne smiju otkrivati da li korisnik postoji u sistemu |
| Evidencija rada: obavezno trajanje (S9) | AI generisao `trajanje_minuta` kao opcionalno polje | Tim učinio obaveznim uz Zod validaciju 1–1440 minuta | Bez obaveznog trajanja izvještaj odziva servisera bio bi nepouzdan; odluka dokumentovana u DecisionLog S9-DLI-001 |
| Audit trail INSERT-i (S9) | AI generisao audit polja samo za neke handlere (dodijeli, zatvori) | Tim ručno dodao INSERT-e za potvrdi i odbij handlere koji ranije nisu logirali aktivnost | Kompletnost audit traga je sigurnosni i operativni zahtjev za sve tranzicije statusa |
| Dispečerski dashboard: format kartica (S7) | AI predložio predugačak dashboard sa punim tabelama ispod svakog KPI-ja | Tim zadržao kompaktni KPI prikaz s navigacijom prema filtriranoj listi | Čitljivost operativnog ekrana i brzina pristupa informacijama |
| Premium UI: generičke poruke za kategoriju "Ostalo" (S6) | AI generisao generičke poruke koje nisu jasne krajnjem korisniku | Tim napisao preciznije CTA tekstove i prilagodio kategorije poslovnoj terminologiji | UX zahtjev: korisnik mora razumjeti šta radnja znači bez tehničkog znanja |

---

## 4. Rejected AI Contributions

Sljedeći AI prijedlozi su identificirani kao neodgovarajući i odbačeni, uz eksplicitan razlog naveden u AIUsageLog dokumentima.

| AI prijedlog | Šta je predloženo | Razlog odbacivanja |
|---|---|---|
| Eksterni auth provajderi (S5) | Korišćenje eksternih auth provajdera pored Supabase Auth | Povećanje kompleksnosti bez opravdane koristi; tim odlučio zadržati isključivo Supabase Auth |
| Oslanjanje na `user_metadata` za autorizaciju (S5) | Čitanje `is_admin`, `is_serviser` i slično iz `user_metadata` za auth provjere | Sigurnosni rizik: client-side metapodaci mogu biti manipulirani; tim prešao na DB-based autorizaciju |
| Statički mock podaci u dispečerskim komponentama (S7) | Korišćenje hardkodiranih mock podataka koji ne odgovaraju stvarnom API odgovoru | Podaci bi bili nesinkronizovani s produkcijskim modelom; zahtijeva ručnu regresiju pri svakoj izmjeni modela |
| Kanban tabla kao zamjena za inbox (S7) | Potpuni Kanban prikaz umjesto inbox/liste | Tim htio jedan konzistentan operativni ekran; Kanban bi zahtijevao značajno više razvoja bez jasne prednosti |
| Automatsko zatvaranje intervencije po isteku roka (S8) | Intervencija se automatski zatvara bez eksplicitne dispečerske potvrde | Biznis pravilo: zatvaranje zahtijeva potvrdu dispečera radi odgovornosti i audit traga |
| Potpuno automatska dodjela servisera bez potvrde (S8) | Sistem automatski dodjeljuje servisera bez intervencije dispečera | Odbačeno: operativna odgovornost mora ostati na dispečeru; automatska dodjela je operativni rizik |
| Batch promjena izvršioca (S9) | Istovremena promjena izvršioca za više intervencija odjednom | Previše kompleksno za MVP; svaka promjena zahtijeva zasebni audit zapis i obavezan razlog |
| Novi status `ceka_ponovnu_dodjelu` u bazi (S9) | Uvođenje novog DB statusa za vraćanje na dodjelu | Tim koristio postojeći status `potvrdeno` čime je izbjegnuta migracija i kompleksnost state machine-a |
| Zasebni audit servis (S9) | Odvojen servisni modul samo za audit logovanje | Logika je ostala u postojećim route handlerima radi konzistentnosti arhitekture |
| Kompleksna chart biblioteka na analitici (S10) | Uvođenje dodatne chart biblioteke za analitički dashboard | Odbačeno zbog performansi i povećanja bundle-a; tim koristio postojeće komponente |
| Potpuno odvojena mobilna aplikacija (S10) | Posebna mobile app za serviserski modul | Van MVP scope-a; tim riješio responsive layoutom unutar iste aplikacije |
| Export CSV/PDF izvještaja i grafovi trenda (S9) | Kompletan export i trendovski grafovi za izvještaj odziva | Ostavljeno za kasniju fazu; fokus je bio na osnovnoj funkcionalnosti agregacije |
| Globalno onemogućavanje ESLint pravila (S11) | Isključiti `react/no-unescaped-entities` globalno | Tim primijenio ciljanu ispravku u dvije datoteke umjesto globalnog onemogućavanja standarda |
| Preveliko proširenje sigurnosnog sloja pred predaju (S10) | Značajne arhitekturalne promjene za sigurnost | Odmah pred predaju projekt: rizik regresije veći od koristi; prikladnije za sljedeću fazu |

---

## 5. AI Errors and Limitations

Ova sekcija identificuje konkretne greške i ograničenja AI alata koja su prepoznata tokom projekta, na osnovu AIUsageLog evidencija i DecisionLog odluka. Za svaku grešku opisano je gdje je nastala, kako je prepoznata i kako je ispravljena.

| Greška / Ograničenje | Kategorija | Opis greške | Kako prepoznata | Ispravka / Status |
|---|---|---|---|---|
| Nekompatibilnost Supabase tipova s SSR klijentom (S5) | Arhitektura / TypeScript tipovi | AI generisao striktni generički tip u inicijalizaciji Supabase klijenta koji nije kompatibilan s SSR (Server-Side Rendering) instancom | Kompajlerska greška pri pokretanju na Vercel Edge runtime-u | Uklonjen striktni generik u inicijalizaciji klijenta; problem riješen bez utjecaja na funkcionalnost |
| Nedostajući encoding paket u produkciji (S5) | Deployment / Dependencies | AI nije identificirao da `encoding` paket nije bio uključen u produkcijske dependencies | Pad build-a na Vercelu u produkciji; greška otkrivena tek nakon deploya | Ručno dodan `encoding` u dependencies; naučena lekcija za provjeru svih implicitnih dependencija |
| Generisano `trajanje_minuta` kao opcionalno (S9) | Validacija / Poslovna logika | AI generisao `trajanje_minuta` kao opcionalno u `evidencijaRadaSchema`, što dovodi do nepotpunih podataka u izvještajima | Otkriveno u unit testovima koji su pali jer su očekivali opcionalno polje; odluka zabilježena u DecisionLog S9-DLI-001 | Polje učinjeno obaveznim uz Zod validaciju; svi ovisni testovi usklađeni u zasebnom tasku |
| Inkompletan audit trail za potvrdi i odbij handlere (S9) | Audit / Sigurnost | AI generisao audit INSERT-e samo za `dodijeli` i `zatvori` handlere, izostavivši `potvrdi` i `odbij` | Ručna provjera svih route handlera otkrila nedostatak logiranja; nije bila automatski prepoznata | Tim ručno dodao INSERT-e za preostale handlere čime je audit trail kompletiran |
| Label opisivao trajanje kao opciono iako je postalo obavezno (S9) | UI/UX konzistentnost | Nakon što je tim učinio trajanje obaveznim, AI generisani UI label je i dalje pisao "opciono" | Prepoznato pri ručnom QA pregledu forme | Ispravljeno u istom tasku promjenom label teksta |
| Paralelni E2E run uz race condition (S6) | Testiranje / Stabilnost | AI generisao E2E orchestration bez `--workers=1` što uzrokuje race condition u login/RBAC scenarijima pri paralelnom pokretanju | Otkriveno povremenim padom E2E login scenarija u batch run-u | E2E dio skripte promijenjen na `--workers=1` (serijsko izvođenje) |
| Prikaz ID servisera umjesto imena u timeline-u (S9) | UI/UX | AI generisao prikaz serviser UUID-a u aktivnosnoj listi umjesto čitljivog imena, jer nije uvrstio JOIN lookup | Otkriveno pri ručnom pregledu audit prikaza | Ostavljen tekstualni prikaz ID-a kao privremeno rješenje dok ne postoji lookup tabela; dokumentovano kao poznato ograničenje |
| Timezone-naive SLA izračun (S9) | Performanse / Tačnost | AI nije uključio timezone-aware biblioteku za SLA izračun, koristeći plain JavaScript Date objekte koji su ovisni o lokalnom vremenu servera | Prepoznato tokom code review analize rubnih slučajeva | Prihvaćeno kao ograničenje MVP-a; dokumentovano u AIUsageLog S9 s napomenom za budući razvoj |
| ESLint `react/no-unescaped-entities` pad build-a (S11) | Build / Deployment | AI generisani JSX sadržavao literalne navodnike u tekstu koji su narušili ESLint pravilo `react/no-unescaped-entities` uzrokujući pad produkcijskog build-a na Vercelu | Otkriveno automatski pri pokretanju produkcijskog build-a (`npm run build`) | AI sam identificirao uzrok i predložio ispravku; zamijenjeni literalni navodnici template literalima u dvije datoteke |
| Generički state machine bez eksplicitnih faza (S7) | Arhitektura / UX | AI predložio generički state machine bez eksplicitnih naziva dispečerskih faza, što bi otežalo operativno razumijevanje | Tim prepoznao tokom review faze da su dispečeri trebali jasno definisane faze za rad na terenu | Tim implementirao eksplicitni modul faza (`dispecerFaze.ts`) s čitljivim nazivima za operativu |

---

## 6. Components Developed With AI Assistance

Sljedeća tabela prikazuje sve ključne komponente sistema s nivoom AI asistencije, konkretnim dokazima iz koda i dokumentacije, te oznakom koje komponente studenti moraju znati posebno objasniti.

| Komponenta / Modul | Nivo AI asistencije | Dokaz | Studenti moraju znati objasniti |
|---|---|---|---|
| `middleware.ts` | Visok | Sprint 5 AIUsageLog #3, #4; `getUser()` migracija, kolačić sinhronizacija | Kako radi Edge runtime, Infinite Redirect prevencija, DB-based RBAC |
| `lib/supabase/server.ts`, `client.ts` | Srednji | Sprint 5 AIUsageLog #1; SSR/SPA klijenti, TypeScript tipovi | Razlika server/client Supabase instance, RLS bypass sa service role |
| `app/api/auth/uloge/route.ts` | Visok | Sprint 5 AIUsageLog #4; RLS politike, `is_admin`/`is_dispecer` helper funkcije | RBAC tok, zašto DB-based autorizacija umjesto `user_metadata` |
| `components/forms/RegisterForm.tsx`, `LoginForm.tsx` | Visok | Sprint 5 AIUsageLog #2; Zod sheme, live validacija, password strength | Zod validacija, React Hook Form integracija, UX tok registracije |
| `components/forms/ServiceRequestWizard.tsx` | Visok | Sprint 6 AIUsageLog; inicijalna struktura višestepene forme, dvonivojna matrica kategorija | Wizard state management, SSR kompatibilnost, matrica kategorija |
| `app/api/premium/*` (start, confirm, cancel, renew) | Visok | Sprint 6 AIUsageLog; lifecycle tranzicije, dvokorak aktivacija | Premium state machine, zašto dvokorak, CRON_SECRET zaštita |
| `app/api/cron/premium-expiry/route.ts` | Visok | Sprint 6 AIUsageLog; CRON_SECRET hardening | Cron autentifikacija, expiry logika, sigurnosne implikacije |
| `tools/pokreniSveTestoveIzvjestaj.mjs` | Visok | Sprint 6 AIUsageLog; Node.js spawn orchestration, timestamp folder | `spawnSync`, exit code obrada, zašto `--workers=1` za E2E |
| `app/dispecer/*` (kontrolna ploča, inbox, wizard) | Visok | Sprint 7 AIUsageLog; JSX/layout, KPI kartice, split panel, inbox grupiranje | Dispečerski operativni tok, statusne faze, RBAC na API rutama |
| `lib/servisirane/dispecerFaze.ts` (statusni moduli) | Visok | Sprint 7 AIUsageLog; helper funkcije, SQL migracije | Zašto jedinstven izvor statusnih faza, mapiranje DB statusa na UI labele |
| `app/api/dispecer/zahtjevi/[id]/route.ts` | Visok | Sprint 7–9 AIUsageLog; discriminated union shema, handler logika, audit INSERT | Akcijama vođen PATCH, validacija statusa, audit format |
| `app/api/serviser/intervencije/[id]/route.ts` | Visok | Sprint 8–9 AIUsageLog; workflow, rollback, evidencija rada | Serviserski status prijelazi, obavezno trajanje, notifikacije |
| `lib/servisirane/slaPravila.ts` | Visok | Sprint 9 AIUsageLog; `SLA_ROKOVI_SATI`, `getSlaStatus`, `izracunajSlaRok` | SLA algoritam, pragovi po prioritetu, rubni slučaj na tačno 2h |
| `lib/servisirane/preporukaServisera.ts` | Visok | Sprint 8/10 AIUsageLog; scoring model, `haversineKm`, težinski faktori | Scoring formula, normalizacija težina, fallback bez koordinata |
| `components/dispecer/SlaStatusBadge.tsx` | Srednji | Sprint 9 AIUsageLog; reusable badge, `useMemo` optimizacija | Zašto client-side izračun, performansne implikacije na velikim listama |
| `app/api/dispecer/analitika/route.ts` | Visok | Sprint 10 AIUsageLog; KPI agregacije, period filter | Agregacioni SQL upiti, konzistentnost između dashboarda i izvještaja |
| `lib/servisirane/geoIzracun.ts` | Visok | Sprint 11 AIUsageLog; Haversine, `CESTOVNI_FAKTOR=1.35` | Haversine formula, zašto faktor 1.35, ograničenje procjene bez real-time podataka |
| `lib/servisirane/dugoChekanje.ts` | Visok | Sprint 11 AIUsageLog; `DUGO_CEKANJE_PRAGOVI_SATI`, client-side izračun | Pragovi po statusu, zašto `created_at` a ne status timestamp, UX implikacije |
| `app/api/service-requests/[id]/ocjena/route.ts` | Visok | Sprint 11 AIUsageLog; Zod `ocjenaSchema`, RBAC provjera | Validacija samo vlastite zatvorene intervencije, jedinstvena ocjena |
| `app/korisnik/historija/page.tsx`, `historija/route.ts` | Visok | Sprint 11 AIUsageLog; RBAC filtriranje, responsive layout | Kako se sprečava pristup tuđoj historiji putem URL manipulacije |
| `lib/servisirane/operativnaFaza.ts` | Visok | Sprint 11 AIUsageLog; centralizacija operativnih faza, `IntervencijaWorkflowProgress` | Razlika između operativnih faza i DB statusa, zašto centralizacija |
| `lib/servisirane/analitikaMetrike.ts` | Visok | Sprint 11 AIUsageLog; proširene analitičke metrike | Koje metrike se računaju, konzistentnost s API odgovorima |
| `tests/unit/*` (slaPravila, preporukaServisera, geoIzracun, dugoChekanje) | Visok | Sprint 9–11 AIUsageLog; Jest mock pattern, pokrivenost rubnih slučajeva | Mock strategija, zašto `jest.fn()`, rubni slučajevi za SLA (tačno 2h) |
| `tests/integration/*` (dispecer, serviser, admin, sprint9) | Visok | Sprint 9 AIUsageLog; 150 integration testova, `mockFrom` pattern | Supabase mock chain, zašto integration testovi ne idu na pravu bazu |
| `tests/e2e/korisnik.ocjena-historija.spec.ts` | Visok | Sprint 11 AIUsageLog; Playwright spec, RBAC cross-access scenariji | Playwright page object, zašto `--workers=1`, RBAC scenariji |
| `supabase/migrations/*` (RLS politike) | Visok | Sprint 5, 12 AIUsageLog; RLS cleanup, indeksi, integrity constraints | Kako RLS funkcioniše, razlika anon/service_role, FK indeksi |

---

## 7. Knowledge Areas Requiring Additional Explanation

Sljedeći dijelovi sistema razvijeni su uz značajnu AI asistenciju i zahtijevaju posebnu pripremu za odbranu. Za svaki dio navedeno je kako radi, zašto je implementiran na taj način, koje tehnologije koristi i koja pitanja profesor može postaviti.

### 7.1 Troslojni RBAC sistem (middleware + API + RLS)

**Kako radi:** Middleware (Edge runtime) provjerava sesiju korisnika i ulogu iz baze, blokira neovlaštene rute. API route handleri dodatno validiraju pristup (`assertDispatcherAccess`, `assertServiserAccess`). RLS politike u PostgreSQL sprečavaju direktan pristup podacima mimo aplikacijskog sloja.

**Tehnologije:** Next.js middleware, Supabase SSR klijent, PostgreSQL RLS, `is_admin`/`is_serviser` DB funkcije.

**Moguća pitanja:** Zašto tri sloja zaštite a ne jedan? Šta se dešava ako RLS politika nije postavljena? Razlika između anon ključa i service_role ključa. Kako se rješava korisnik s više uloga?

### 7.2 SLA engine (`lib/servisirane/slaPravila.ts`)

**Kako radi:** Funkcija `getSlaStatus()` prima `created_at` timestamp, operativni prioritet i status intervencije. Računa rok (`created_at + SLA_ROKOVI_SATI[prioritet]`) i vraća ok/upozorenje/prekoraceno. Za zatvorene statuse vraća `null`.

**Tehnologije:** Plain JavaScript Date API, TypeScript discriminated union tipovi, Jest unit testovi (`slaPravila.test.js`, 18 testova).

**Moguća pitanja:** Zašto se koristi `Date.now()` umjesto timezone-aware biblioteke? Šta se dešava za prioritet HITNO i KRITIČNO (isti rok 2h)? Rubni slučaj: intervencija kreirana tačno 2 sata prije.

### 7.3 Scoring algoritam za preporuku servisera (`preporukaServisera.ts`)

**Kako radi:** Funkcija `izracunajPreporuke()` za svakog servisera računa kompozitni score (0–100) koji kombinuje stručnost (40%), opterećenje (35%), verifikaciju (25%) i blizinu (20%). Blizina se uračunava samo kada su dostupne koordinate; u suprotnom se prve tri težine normalizuju na 0.40/0.35/0.25.

**Tehnologije:** TypeScript, `haversineKm()` funkcija (Haversine formula), dinamička normalizacija težina.

**Moguća pitanja:** Zašto je blizina 20% a ne više? Šta znači graceful fallback kod normalizacije? Kako se bira top-ranked serviser? Zašto dispečer mora potvrditi preporuku?

### 7.4 Premium lifecycle state machine

**Kako radi:** Korisnik prolazi kroz statuse `inactive → pending_payment → active → expired/cancelled`. Dvokorak aktivacija (start → confirm) sprečava direktnu aktivaciju bez verifikacije. Cron job (`premium-expiry/route.ts`) periodično provjerava i označava istekle pretplate.

**Tehnologije:** Next.js API routes, Supabase PostgreSQL, cron endpoint s `CRON_SECRET` zaštitom.

**Moguća pitanja:** Zašto nema pravog payment gateway-a (MVP odluka)? Šta se dešava ako `CRON_SECRET` nije postavljen? Zašto dvokorak umjesto jednog endpoint-a?

### 7.5 Test arhitektura (Jest unit/integration + Playwright E2E)

**Kako radi:** Unit testovi provjeravaju izolovanu poslovnu logiku (slaPravila, preporukaServisera, geoIzracun, dugoChekanje). Integration testovi provjeravaju API route handlere s mockovanim Supabase klijentom (`mockFrom` pattern). E2E testovi (Playwright) prolaze kroz kompletne korisničke tokove na pravoj aplikaciji s test kredencijalima.

**Tehnologije:** Jest, ts-jest, Playwright, `@jest/globals`, Supabase mock chain.

**Moguća pitanja:** Zašto integration testovi ne koriste pravu bazu? Kako funkcioniše `mockFrom` pattern? Zašto E2E koristi `--workers=1`? Šta `jest.config.js` `collectCoverageFrom` pokriva i šta ne?

### 7.6 Geo-izračun rute (`geoIzracun.ts`, Sprint 11)

**Kako radi:** Haversine formula računa pravocrtnu udaljenost između dvije geografske točke. Procijenjena cestovna udaljenost = pravac × `CESTOVNI_FAKTOR` (1.35). Procijenjeno trajanje = cestovna_udaljenost / `PROSJECNA_BRZINA_KMH` (45 km/h).

**Tehnologije:** Haversine formula, TypeScript, OSM dual-marker prikaz u UI, Google Maps link za navigaciju.

**Moguća pitanja:** Zašto faktor 1.35 (BiH cestovna mreža)? Koje su greške procjene u poređenju sa stvarnim routing API-jem? Šta se prikazuje ako serviser nema postavljenu baznu lokaciju?

---

## 8. Critical Assessment of AI Usage

### 8.1 Koristi AI asistencije u projektu

- **Ubrzanje inicijalnog scaffoldinga:** AI je značajno ubrzao postavljanje arhitekture, tipova i boilerplate koda (Sprint 5), čime je tim mogao fokus staviti na domenski-specifičnu logiku.
- **Konzistentnost patterna:** AI je dosljedno primjenjivao JWT auth, Zod validaciju i Jest mock pattern kroz cijeli projekt, smanjivši kognitivni teret pri uvođenju novih članova u module.
- **Identifikacija sigurnosnih rizika:** Pri hardening-u middleware-a i RLS politika, AI je predložio prijelaz s `user_metadata` na DB-based autorizaciju (kritična sigurnosna odluka evidentirana u Sprint 5).
- **Automatizirani test framework:** Generisanje 58 unit + integration testova (Sprint 9, 11) i E2E specifikacija omogućilo timu da postigne 98.92% statement coverage na kritičnim modulima.
- **Brzo debugging:** AI je identificirao uzrok Vercel build pada (ESLint u Sprint 11, encoding paket u Sprint 5) u minutama umjesto satima ručnog debugginga.

### 8.2 Nedostaci i ograničenja AI asistencije

- **Nesvjesnost konteksta baze:** AI nije uvijek bio svjestan postojeće sheme baze podataka, što je uzrokovalo generisanje koda za kolone koje su već postojale (Sprint 9: migracija za `intervention_activities`).
- **Timezone-naive implementacije:** AI je konzistentno koristio plain JavaScript Date bez timezone-aware biblioteke, što je potencijalni izvor grešaka u produkcijskim okruženjima s različitim zonama.
- **Inkompletni audit trail:** AI je generisao audit INSERT-e samo za dio handlera, propustivši `potvrdi` i `odbij` handlere koji su zahtijevali ručni dodatak.
- **UI/tekst neusklađenost:** AI generisane poruke nisu uvijek bile usklađene s lokalnim (bosanskim) jezičkim standardima ili poslovnom terminologijom projekta; svaki put je bila potrebna ručna korekcija.
- **Generički prijedlozi bez domenskog znanja:** AI prijedlozi za trijažu i wizard forme bili su generički (linearni wizard, HTML tablice) i trebali su značajno prilagođavanje da odgovore specifičnim operativnim zahtjevima dispečerskog rada.

### 8.3 Procjena omjera AI vs. ručnog rada

| Oblast | Procjena AI doprinosa | Procjena ljudskog doprinosa | Napomena |
|---|---|---|---|
| Arhitektura i inicijalni setup | ~70% | ~30% | AI predložio strukturu; tim odlučio o tehnologijama i domenskim pravilima |
| Poslovna logika (SLA, scoring, geoIzracun) | ~60% | ~40% | AI generisao algoritme; tim kalibrisao parametre i rubne slučajeve |
| API route handleri | ~65% | ~35% | AI generisao skeleton; tim dodao domensku validaciju i audit zapise |
| Frontend komponente | ~55% | ~45% | AI generisao layout i JSX; tim prilagodio UX, tekstualne detalje i responsive ponašanje |
| Automatski testovi | ~70% | ~30% | AI generisao test slučajeve; tim prilagodio asertacije i popunio rubne slučajeve |
| Ručni testovi i QA dokumentacija | ~30% | ~70% | AI predložio strukturu; tim izvršio testove, zabilježio nalaze i napravio QA sign-off |
| SQL migracije i RLS | ~50% | ~50% | AI predložio strukturu; tim prilagodio za konkretnu shemu i poslovne zahtjeve |
| Deployment i CI/CD | ~40% | ~60% | AI generisao YAML kosture; tim konfigurirao Vercel-specifične postavke |

---

## 9. Final Conclusion

Tim NRS-Grupa2 koristio je AI alate (Claude AI/Sonnet/Code, Cursor, ChatGPT) transparentno i odgovorno kroz sedam razvojnih sprintova (Sprint 5–11), dokumentujući svaki unos u sprint-level `AIUsageLog.md` fajlovima. Ukupno je evidentirano 58 AI interakcija od kojih se 15 odnosi na generisanje i prihvatanje prijedloga, 10 na izmijenjene prijedloge i 14 na odbačene prijedloge, što demonstrira kritičko i selektivno korištenje.

Nivo zavisnosti od AI-ja je umjeren do visok, posebno u domenima arhitekture, poslovne logike i automatskih testova. Međutim, tim je dosljedno demonstrirao razumijevanje implementiranih rješenja kroz: (a) konkretne izmjene AI prijedloga (npr. scoring parametri, obavezno trajanje), (b) odbacivanje prijedloga koji ne odgovaraju poslovnim pravilima (npr. automatska dodjela, novi DB statusi) i (c) dokumentovanje rizika i odluka u DecisionLog fajlovima.

Dokaz kritičkog razumijevanja vidljiv je i u testnoj arhitekturi: tim je postigao 573 automatska testa (423 unit + 150 integration) s 98.92% statement coverage na kritičnim sigurnosnim modulima, 23 E2E scenarija i 322 ručna test scenarija — sve što dokumentuje sistemsko razumijevanje, a ne puko korištenje AI-generisanog koda.

Jedino ograničenje koje tim eksplicitno priznaje kao neispravnost AI alata, a ne svjesnu odluku, jest timezone-naive implementacija SLA izračuna i inicijalno generisanje `trajanje_minuta` kao opcionalne vrijednosti — oboje ispravljeno u toku projekta. Svi ostali AI propusti su identificirani i ispravljeni prije finalne isporuke, što demonstrira efikasan review proces.

**Zaključak:** AI alati su bili validan alat za ubrzanje razvoja i smanjenje tehničkog duga, ali ne supstitut za inženjersko rasuđivanje. Tim razumije implementirana rješenja i spreman je za odbranu svake arhitekturne odluke i poslovnog pravila dokumentovanog u ovom izvještaju.
