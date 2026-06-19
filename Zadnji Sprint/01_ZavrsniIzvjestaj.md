# Završni izvještaj o radu tima


## 1. Svrha projekta

Razviti web aplikaciju koja digitalizuje kompletan životni ciklus servisne intervencije od prijave kvara i kreiranja zahtjeva, preko dispečerske trijaže, određivanja prioriteta, planiranja i dodjele servisera, do evidencije rada na terenu, praćenja rokova, izvještavanja i formalnog zatvaranja intervencije.

Cilj projekta je uspostaviti jedinstvenu, preglednu i sljedivu platformu koja povezuje korisnike usluge, dispečere, servisere i administratore, te omogućava efikasnije upravljanje servisnim procesima kroz standardizovane workflow tokove, kontrolu pristupa po ulogama, audit historiju svih značajnih aktivnosti i podršku operativnom odlučivanju kroz izvještaje i analitiku. Krajnji cilj sistema je smanjiti oslanjanje na ručne procedure, povećati transparentnost procesa, unaprijediti organizaciju rada servisne firme i omogućiti kvalitetnije korisničko iskustvo tokom cijelog procesa servisne intervencije.


## 2. Problem koji sistem rješava

Prije InterServ-a servisni zahtjevi i intervencije često su se vodili ručno kroz telefonske pozive, papirne evidencije, e-mail komunikaciju ili jednostavne tabele. Takav način rada dovodi do izgubljenih zahtjeva, nejasne odgovornosti između učesnika procesa, otežanog praćenja statusa intervencija, nepoštivanja rokova i nedostatka pouzdane historije izvršenih aktivnosti.

InterServ uvodi centralizovan i standardiziran sistem za upravljanje servisnim intervencijama koji omogućava:

* jasno definisan tok rada od prijave kvara do zatvaranja intervencije,
* standardizovane statuse i odgovornosti svih učesnika procesa,
* objektivnu trijažu hitnosti kroz sistem bodovanja prioriteta (0–110),
* planiranje i dodjelu servisera uz podršku sistema preporuke,
* praćenje rokova (SLA), upozorenja i eskalacije,
* evidenciju rada, materijala, fotografija i aktivnosti na terenu,
* audit trag i historiju svih značajnih promjena u sistemu,
* obavijesti unutar aplikacije i povratne informacije korisnika,
* izvještaje, dashboarde i analitiku za operativno odlučivanje.

Na taj način sistem povećava transparentnost, poboljšava organizaciju rada i omogućava efikasnije upravljanje kompletnim procesom servisnih intervencija.


## 3. Glavne korisničke uloge

* **Korisnik (Klijent):** prijavljuje kvar ili zahtjev za intervenciju, prati status svojih zahtjeva, predlaže termine dolaska servisera, pregleda historiju intervencija, ocjenjuje završene intervencije i koristi dodatne pogodnosti kroz Premium paket.

* **Dispečer:** vrši trijažu zahtjeva, određuje prioritet intervencija, planira termine, dodjeljuje servisere ili timove, prati SLA rokove, upravlja operativnim tokom intervencija te koristi dashboarde, izvještaje i analitičke prikaze za donošenje odluka.

* **Serviser:** pregleda dodijeljene intervencije, evidentira rad na terenu, upravlja statusima intervencija, vodi evidenciju utrošenog vremena, materijala i dijelova, dodaje foto dokumentaciju te koristi prikaz rute i lokacije intervencije radi lakše organizacije rada.

* **Administrator:** upravlja korisnicima, ulogama i internim nalozima, vrši aktivaciju i suspenziju korisnika, upravlja Premium statusima, odobrava partnerske organizacije i održava administrativni dio sistema.


## 4. Glavne implementirane funkcionalnosti

Autentikacija + troslojni RBAC · upravljanje korisnicima (admin) · prijava zahtjeva (wizard 6 koraka) · izmjena/otkazivanje · dispečerska trijaža i prioritet · planiranje termina (hibridni model) · dodjela servisera i timova · geo-preporuka servisera · serviserski tok na terenu (statusi, evidencija, checklist, slike, ruta) · zatvaranje intervencije · ocjena korisnika · napomene i audit historija · SLA praćenje/eskalacije i isticanje dugo-čekajućih · premium (simulirana naplata) · notifikacije u aplikaciji · analitički dashboard i izvještaj odziva · historija po korisniku · partner onboarding.

## 5. Pregled rada kroz sprintove


| Sprint | Fokus                       | Ključne isporuke                                                                       |
| ------ | --------------------------- | -------------------------------------------------------------------------------------- |
| 1      | Inicijalizacija             | Vizija, početni backlog, team charter, stakeholder map                                 |
| 2      | Zahtjevi                    | Katalog user storyja (US-01–54), NFR, AC, MoSCoW, INVEST                               |
| 3      | Dizajn                      | Arhitektura, domenski model, test strategija, risk register                            |
| 4      | Setup                       | Definition of Done, initial release plan, tehnički setup                               |
| 5      | Auth/RBAC                   | Registracija, prijava, odjava, kontrola pristupa (US-01–04)                            |
| 6      | Korisnik/Admin/Premium      | Korisnički nalozi, admin uprava, premium aktivacija                                    |
| 7      | Dispečer                    | Zahtjevi, prioritet, pregledi, planiranje (početak)                                    |
| 8      | Serviser + zatvaranje       | Dodjela, evidencija rada, napomene, historija, zatvaranje                              |
| 9      | Operativno zatvaranje MVP-a | Preraspodjela, SLA/eskalacije, izvještaj odziva, slike, notifikacije, audit (US-28–47) |
| 10     | Stabilizacija + UX          | Geo-preporuka, analitika, responsive/accessibility (US-48–50), 107 manuelnih scenarija |
| 11     | Finalne funkcije            | Ruta/bazna lokacija, ocjena, dugo-čekanje, historija po korisniku (US-51–54)           |
| Zadnji | Isporuka                    | Deployment procedura, CD pipeline, finalna dokumentacija, backlog, QA, ograničenja     |


## 6. Šta je završeno, djelimično završeno ili nije završeno

- **Završeno (Done):** sve korisničke priče **US-01 → US-54**; 24 PBI funkcionalne cjeline.
- **Djelimično završeno (Partially):** -
- **Nije završeno / odgođeno (Deferred):** integracija stvarnog payment gateway-a (premium je simuliran), real-time push notifikacije, offline rad.

## 7. Glavne tehničke odluke

- **Stack:** Next.js 14 (monolit) + Supabase (PostgreSQL/Auth/Storage/RLS) + Vercel — jedan repo, jedan deployment, EU hosting.
- **Decision Log (`PRAVILA.md`):** DLI-01/02 modularno proširenje (Open-Closed); DLI-03 bodovni triage 0–110; DLI-04 hibridni model zakazivanja; DLI-05 fiksni slotovi; DLI-07 dvoslojna kategorija (8+1×8+1).
- **Premium = simulirana naplata** (bez payment gateway-a) — svjesna MVP odluka.
- **Sigurnost:** troslojni RBAC (middleware + API + RLS), `getUser()` anti-CSRF, neutralne auth poruke, login rate-limit, `CRON_SECRET`, audit trail.
- **Testiranje:** Jest (unit+integration) + Playwright (e2e) + ručni scenariji; coverage **fokusiran** na kritične module (≥98%), UI pokriven E2E + ručno.

## 8. Najveći problemi tokom razvoja i način rješavanja


| Problem                                                                        | Rješenje                                                                                                                         |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Usklađivanje RBAC za korisnike s **više uloga** (zaposleni i kao klijent)      | Middleware usklađen s `/api/auth/uloge` + RPC fallback (`is_admin/serviser/dispecer`); zona `/korisnik` dozvoljena i zaposlenima |
| Nestabilan **E2E RBAC** test (`rbac.cross-access`)                             | Usklađivanje middleware-a s multi-uloga pristupom (S10-T1) → test stabilno prolazi (23/23)                                       |
| Veliki broj povezanih US u Sprintu 9 uz **kraći sprint** → rizik regresije     | Regresiono testiranje + fail-fast backend validacije + centralizovani audit log                                                  |
| **Zlonamjerne izmjene** pred prezentaciju Sprinta 9 (admin pristup/stabilnost) | Stabilizacija, vraćanje ispravnog stanja, dodatne sigurnosne provjere                                                            |
| **Coverage** kritičnih modula pao ispod praga 98% u finalu                     | Dodani ciljani unit testovi (`authServiceResend.test.js`) → vraćeno na 98.92% (bez spuštanja standarda)                          |
| **Format dokumentacije** (primjedba PO u Sprintu 9 na prikaz user storyja)     | Standardizacija formata user storyja i sprint artefakata                                                                         |



## 9. Šta bi tim unaprijedio da se projekat nastavlja

Ukoliko bi se razvoj projekta nastavio nakon završetka MVP faze, fokus bi bio na daljem unapređenju operativne efikasnosti, automatizacije procesa, analitike i korisničkog iskustva.

Potencijalna unapređenja uključivala bi:

* naprednije analitičke dashboarde sa historijskim trendovima, poređenjima perioda i detaljnijim KPI pokazateljima,
* proširenje sistema izvještavanja kroz automatsko generisanje i slanje periodičnih izvještaja odgovornim osobama,
* dodatno unapređenje SLA sistema kroz naprednije modele praćenja performansi i automatske eskalacije,
* razvoj naprednijeg sistema preporuke servisera koji bi, pored lokacije, uključivao dostupnost, opterećenje, stručnost, historijske performanse i zadovoljstvo korisnika,
* veći nivo automatizacije dispečerskih aktivnosti kroz automatske prijedloge termina, dodjele i prioritizacije intervencija,
* integraciju sa eksternim servisima za mape, navigaciju i preciznije planiranje ruta na terenu,
* podršku za offline rad servisera na terenu sa kasnijom sinhronizacijom podataka,
* unapređenje notifikacionog sistema kroz real-time obavijesti i push notifikacije,
* dodatno proširenje mobilnog iskustva i responsive podrške za različite tipove uređaja i veličine ekrana,
* naprednije upravljanje timovima servisera i planiranje kapaciteta,
* proširenje sistema ocjenjivanja i praćenja kvaliteta usluge kroz analizu korisničkog zadovoljstva,
* integraciju sa ERP, CRM ili drugim poslovnim sistemima radi razmjene podataka i automatizacije poslovnih procesa,
* naprednije sigurnosne mehanizme, audit funkcionalnosti i praćenje sigurnosnih događaja,
* razvoj prediktivne analitike i modela koji bi na osnovu historijskih podataka mogli predlagati preventivne aktivnosti, procjenjivati rizik probijanja SLA rokova i pomagati pri donošenju operativnih odluka.

Na taj način sistem bi iz funkcionalnog MVP rješenja mogao postepeno prerasti u potpunu platformu za upravljanje servisnim intervencijama i terenskim operacijama.
