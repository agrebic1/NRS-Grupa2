# Finalni Product Backlog

## 1. Svrha

Ovaj dokument prikazuje **stvarno stanje** projekta na kraju razvoja, ne željeno. Za svaku stavku jasno je označen status, a za svaku stavku koja **nije** potpuno završena naveden je konkretan razlog. Backlog se vodi na dva nivoa:

- **Nivo A -> Product Backlog Items (PBI):** funkcionalne cjeline / epici (rollup).
- **Nivo B -> User Stories (US-01 … US-54):** granularni, autoritativni status svake priče.

---

## 2. Legenda statusa


| Status                | Značenje                                                                          |
| --------------------- | --------------------------------------------------------------------------------- |
| ✅ **Done**            | Implementirano, testirano i u funkciji u finalnoj verziji                         |
| 🟨 **Partially Done** | Djelimično implementirano; ključni dio radi, ali nešto nedostaje (razlog naveden) |
| ⬜ **Not Done**        | Nije implementirano (razlog naveden)                                              |
| 🟦 **Deferred**       | Svjesno odgođeno za budući rad / post-MVP (razlog naveden)                        |


---

## 3. Sažetak


| Metrika                                         | Vrijednost                                                           |
| ----------------------------------------------- | -------------------------------------------------------------------- |
| Ukupno korisničkih priča (US)                   | **54**                                                               |
| ✅ Done                                          | **54 / 54**                                                          |
| 🟨 Partially Done                               | 0                                                                    |
| ⬜ Not Done                                      | 0                                                                    |
| 🟦 Deferred (proširenja/odluke izvan US opsega) | **4** (stvarni payment gateway, SOS Bypass, real-time push, offline) |
| Ukupno PBI (funkcionalne cjeline)               | 24, sve ✅ Done                                                       |


> Svi planirani MVP i post-MVP user storyji odobreni kroz Sprint Review (US-01 → US-54) su **završeni**. Otvorene/odgođene stavke su **proširenja i jedna nedovršena odluka**, nisu dio MVP obima i jasno su označene kao Deferred.

---

## 4. Nivo A: Product Backlog Items (PBI)


| ID      | Naziv stavke                                        | Tip            | Prioritet | Status | Sprint |
| ------- | --------------------------------------------------- | -------------- | --------- | ------ | ------ |
| PBI-001 | Registracija, prijava i odjava korisnika            | Feature        | Visok     | ✅ Done | 5–7    |
| PBI-002 | Kontrola pristupa prema ulozi (RBAC)                | Feature        | Visok     | ✅ Done | 5–6    |
| PBI-003 | Upravljanje korisničkim nalozima (Admin)            | Feature        | Visok     | ✅ Done | 6, 9   |
| PBI-004 | Kreiranje zahtjeva za servisnu intervenciju         | Feature        | Visok     | ✅ Done | 7      |
| PBI-005 | Pregled detalja vlastitog zahtjeva                  | Feature        | Srednji   | ✅ Done | 7      |
| PBI-006 | Izmjena i otkazivanje vlastitog zahtjeva            | Feature        | Srednji   | ✅ Done | 7      |
| PBI-007 | Pregled liste aktivnih/otvorenih intervencija       | Feature        | Visok     | ✅ Done | 7      |
| PBI-008 | Pregled detalja pojedinačne intervencije (dispečer) | Feature        | Srednji   | ✅ Done | 7      |
| PBI-009 | Operativni status na kontrolnoj tabli               | Feature        | Srednji   | ✅ Done | 7–9    |
| PBI-010 | Određivanje prioriteta intervencije                 | Feature        | Visok     | ✅ Done | 7      |
| PBI-011 | Planiranje izlazaka na teren                        | Feature        | Visok     | ✅ Done | 8      |
| PBI-012 | Dodjela intervencije izvršiocu / timu               | Feature        | Visok     | ✅ Done | 8      |
| PBI-013 | Preraspodjela i ponovna dodjela                     | Feature        | Srednji   | ✅ Done | 8–9    |
| PBI-014 | Pregled dodijeljenih zadataka (serviser)            | Feature        | Visok     | ✅ Done | 8      |
| PBI-015 | Prihvatanje/odbijanje dodijeljenog zadatka          | Feature        | Srednji   | ✅ Done | 8      |
| PBI-016 | Ažuriranje statusa intervencije (serviser)          | Feature        | Visok     | ✅ Done | 8      |
| PBI-017 | Evidentiranje izvršenog rada                        | Feature        | Srednji   | ✅ Done | 8–9    |
| PBI-018 | Pregled evidentiranog rada (dispečer)               | Feature        | Srednji   | ✅ Done | 8      |
| PBI-019 | Potvrda i zatvaranje intervencije                   | Feature        | Srednji   | ✅ Done | 8      |
| PBI-020 | Napomene na intervenciji                            | Feature        | Srednji   | ✅ Done | 8      |
| PBI-021 | Historija aktivnosti (audit trail)                  | Feature        | Srednji   | ✅ Done | 8–9    |
| PBI-022 | Početna shema baze podataka                         | Technical Task | Visok     | ✅ Done | 6      |
| PBI-023 | Autentifikacija korisnika                           | Technical Task | Visok     | ✅ Done | 6      |
| PBI-024 | Model korisničkih uloga i pristupa                  | Research       | Srednji   | ✅ Done | 6      |


> **Proširenja iz Sprint 10–11** (geo-preporuka, analitički dashboard, responsive/accessibility, ruta servisera, ocjena, dugo-čekanje, historija po korisniku) vode se na US-nivou u "Nivo B" (US-48 → US-54). Sve su ✅ Done.

---

## 5. Nivo B — User Stories (US-01 … US-54)


| US    | Naziv                                                  | Prioritet | Status | Sprint |
| ----- | ------------------------------------------------------ | --------- | ------ | ------ |
| US-01 | Samostalna registracija korisnika usluge               | Visok     | ✅ Done | 5–6    |
| US-02 | Prijava korisnika u sistem                             | Visok     | ✅ Done | 5–6    |
| US-03 | Odjava korisnika                                       | Srednji   | ✅ Done | 5–6    |
| US-04 | Kontrola pristupa prema ulozi (RBAC)                   | Visok     | ✅ Done | 5–6    |
| US-05 | Prijava zahtjeva za servisnu intervenciju              | Visok     | ✅ Done | 7      |
| US-06 | Pregled vlastitog zahtjeva                             | Srednji   | ✅ Done | 7      |
| US-07 | Pregled otvorenih intervencija (dispečer)              | Visok     | ✅ Done | 7      |
| US-08 | Pregled detalja pojedinačne intervencije               | Visok     | ✅ Done | 7      |
| US-09 | Dodjela intervencije serviseru                         | Visok     | ✅ Done | 7–8    |
| US-10 | Dodjela intervencije timu servisera                    | Srednji   | ✅ Done | 8      |
| US-11 | Planiranje intervencije                                | Visok     | ✅ Done | 8      |
| US-12 | Određivanje prioriteta intervencije                    | Visok     | ✅ Done | 7      |
| US-13 | Pregled statusa intervencija (dispečer)                | Visok     | ✅ Done | 7      |
| US-14 | Ažuriranje statusa intervencije (serviser)             | Visok     | ✅ Done | 8      |
| US-15 | Pregled dodijeljenih intervencija (serviser)           | Visok     | ✅ Done | 8      |
| US-16 | Pregled detalja zadatka na terenu                      | Visok     | ✅ Done | 8      |
| US-17 | Evidentiranje izvršenog rada                           | Srednji   | ✅ Done | 8      |
| US-18 | Administrativno kreiranje internog naloga              | Visok     | ✅ Done | 6      |
| US-19 | Pregled postojećih naloga                              | Srednji   | ✅ Done | 6      |
| US-20 | Promjena korisničke uloge                              | Srednji   | ✅ Done | 6      |
| US-21 | Deaktivacija korisničkog naloga                        | Srednji   | ✅ Done | 6      |
| US-22 | Prihvatanje dodijeljenog zadatka                       | Visok     | ✅ Done | 8      |
| US-23 | Odbijanje dodijeljenog zadatka                         | Srednji   | ✅ Done | 8      |
| US-24 | Pregled evidentiranog izvršenog rada                   | Visok     | ✅ Done | 8      |
| US-25 | Potvrda i zatvaranje intervencije                      | Visok     | ✅ Done | 8      |
| US-26 | Izmjena vlastitog zahtjeva                             | Srednji   | ✅ Done | 7      |
| US-27 | Otkazivanje vlastitog zahtjeva                         | Srednji   | ✅ Done | 7      |
| US-28 | Promjena izvršioca intervencije                        | Srednji   | ✅ Done | 9      |
| US-29 | Vraćanje zadatka na ponovnu dodjelu                    | Srednji   | ✅ Done | 9      |
| US-30 | Razmjena napomena na intervenciji                      | Srednji   | ✅ Done | 8      |
| US-31 | Sažeti operativni status (dashboard)                   | Srednji   | ✅ Done | 7–9    |
| US-32 | Pregled historije aktivnosti intervencije              | Srednji   | ✅ Done | 8      |
| US-33 | Zahtjev za Premium (hitnom) uslugom                    | Visok     | ✅ Done | 6–7    |
| US-34 | Aktivacija Premium usluge                              | Visok     | ✅ Done | 6–7    |
| US-35 | Podnošenje zahtjeva za internu ulogu (partner)         | Visok     | ✅ Done | 9      |
| US-36 | Uređivanje korisničkog naloga                          | Srednji   | ✅ Done | 9      |
| US-37 | Sistemske notifikacije                                 | Srednji   | ✅ Done | 9      |
| US-38 | Obavezno trajanje pri evidentiranju rada               | Visok     | ✅ Done | 9      |
| US-39 | Audit trail (stara/nova vrijednost)                    | Srednji   | ✅ Done | 9      |
| US-40 | Označavanje intervencije kao „nije riješena“           | Srednji   | ✅ Done | 9      |
| US-41 | SLA praćenje                                           | Srednji   | ✅ Done | 9      |
| US-42 | Izvještaj odziva servisera                             | Nizak     | ✅ Done | 9      |
| US-43 | Upload fotografije intervencije                        | Nizak     | ✅ Done | 9      |
| US-44 | Tabelarni pregled historije aktivnosti                 | Srednji   | ✅ Done | 9      |
| US-45 | SLA eskalacije                                         | Srednji   | ✅ Done | 9      |
| US-46 | Evidencija materijala i dijelova                       | Srednji   | ✅ Done | 9      |
| US-47 | Praćenje intervencije neriješene iz prve (FTR)         | Srednji   | ✅ Done | 9      |
| US-48 | Geo-preporuka servisera po blizini                     | Visok     | ✅ Done | 10     |
| US-49 | Analitički dashboard (grafovi + KPI)                   | Srednji   | ✅ Done | 10     |
| US-50 | Responsive i accessibility unapređenja                 | Srednji   | ✅ Done | 10     |
| US-51 | Bazna lokacija servisera + ruta do intervencije        | Srednji   | ✅ Done | 11     |
| US-52 | Ocjena korisnika nakon zatvorene intervencije          | Srednji   | ✅ Done | 11     |
| US-53 | Automatski podsjetnik za intervencije koje dugo čekaju | Srednji   | ✅ Done | 11     |
| US-54 | Pregled historije intervencija po korisniku            | Nizak     | ✅ Done | 11     |


---

## 6. Deferred / odgođene i otvorene stavke (izvan US opsega)

Ove stavke **nisu** korisničke priče iz backloga, nego svjesno odgođena proširenja / otvorene odluke. Navedene su radi potpune transparentnosti.


| Stavka                                                                                | Status      | Razlog / odluka                                                                                        |
| ------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------ |
| Integracija stvarnog payment gateway-a (checkout, webhook potvrda, neuspjeli payment) | 🟦 Deferred | Premium u MVP-u je **simulirana naplata**. Stvarni procesor plaćanja planiran kao post-MVP proširenje. |
| Real-time push notifikacije                                                           | 🟦 Deferred | MVP koristi notifikacije u aplikaciji (uz osvježavanje). Supabase Realtime izvan MVP opsega.           |
| Offline način rada                                                                    | 🟦 Deferred | Web aplikacija zavisna od Supabase cloud servisa; offline nije u opsegu MVP-a.                         |


---

## 7. Napomene o konzistentnosti

- Brojevi i status iz ovog dokumenta su **autoritativni** za: `01_ZavrsniIzvjestaj.md` (sekcija status), `06_ReleaseNotes.md` (isporučeno vs. odgođeno) i `10_KnownIssues_Limitations.md` (Deferred stavke).
- Premium se **svuda** opisuje kao Done-uz-simulaciju, nikad kao stvarna naplata.
- PBI numeracija: zadržana shema iz `Sprint 2/ProductBacklog.md` (PBI-001..024). U `Sprint 2/User Stories.md` postoji alternativna PBI/Feature shema (PBI-001..018) korištena za EPIC→FEATURE→US hijerarhiju; oba izvora se slažu na US-nivou, koji je u ovom dokumentu uzet kao mjerodavan.

