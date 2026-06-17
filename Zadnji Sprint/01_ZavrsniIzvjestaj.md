# Završni izvještaj o radu tima

## 1. Svrha projekta

Razviti web aplikaciju koja **digitalizuje cijeli životni ciklus servisne intervencije** od prijave kvara, preko dispečerske trijaže, planiranja i dodjele servisera, do evidencije rada i formalnog zatvaranja uz audit historiju i kontrolu pristupa po ulogama. Cilj je da servisna firma i njeni korisnici imaju jedinstvenu, preglednu i sljedivu platformu umjesto ručnog vođenja naloga.

## 2. Problem koji sistem rješava

Prije InterServ-a servisni nalozi su se vodili **ručno** (telefonski pozivi, papir, tabele), što vodi do izgubljenih zahtjeva, nejasne odgovornosti, nepoštivanja rokova i nedostatka historije. InterServ uvodi:

- standardiziran tok rada s jasnim statusima,
- **objektivnu trijažu hitnosti (bodovanje 0–110)**,
- praćenje rokova (**SLA**) i eskalacije,
- obavijesti u aplikaciji i audit trag svake promjene,
- izvještaje i analitiku za operativno odlučivanje.

## 3. Glavne korisničke uloge

- **Korisnik (Klijent):** prijavljuje kvar, prati status, predlaže termine, ocjenjuje, gleda historiju, može aktivirati Premium.
- **Dispečer:** trijaža, prioritet, planiranje termina, dodjela servisera/tima, zatvaranje, izvještaji/analitika.
- **Serviser:** dodijeljeni zadaci, statusi na terenu, evidencija rada i materijala, slike, ruta.
- **Administrator:** upravljanje korisnicima i ulogama, interni nalozi, suspenzija/aktivacija, premium status, odobravanje partnera.

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

- Integracija **stvarnog payment gateway-a** (checkout, webhook, neuspjeli payment).
- **Real-time push** notifikacije (Supabase Realtime) umjesto osvježavanja.
- **Offline** podrška za terenski rad servisera.
- Definisanje statusa **SOS Bypass** i navigacijski preciznije rute (komercijalni routing API).

