# Ažurirani Product Backlog
U ovom dokumentu je prikazan ažurirani product backlog sistema za upravljanje servisnim intervencijama. Backlog obuhvata ključne funkcionalnosti i zahtjeve sistema koje su organizovane prema prioritetu i procijenjenoj složenosti, te su povezane sa planiranim sprintovima i verzijama sistema. 


| ID      | Naziv stavke                                                   | Kratak opis                                                                 | Tip     | Prioritet | Procjena složenosti | Status | Sprint / Release | Napomena                     |
|---------|----------------------------------------------------------------|------------------------------------------------------------------------------|---------|-----------|---------------------|--------|------------------|------------------------------|
| PBI-001 | Registracija, prijava i odjava korisnika                      | Registracija, prijava i odjava korisnika prema ovlaštenjima                 | Feature | Visok     | 8                   | Done  | Sprint 6–7       | Osnova za korištenje sistema  |
| PBI-002 | Kontrola pristupa prema korisničkoj ulozi (RBAC)              | Ograničavanje pristupa funkcionalnostima prema ulogama                      | Feature | Visok     | 5                   | Done  | Sprint 6         | Sigurnosna osnova            |
| PBI-003 | Upravljanje korisničkim nalozima                              | Kreiranje, pregled, izmjena i deaktivacija naloga (Admin)                  | Feature | Visok     | 8                   | Done  | Sprint 6, 9      | Administracija korisnika (US-19–21, US-36) |
| PBI-004 | Kreiranje zahtjeva za servisnu intervenciju                   | Prijava kvara (mjesto, lokacija, opis) za servis                           | Feature | Visok     | 5                   | Done  | Sprint 7         | Početak procesa; premium aktivacija/naplata u MVP je simulirana (bez payment gateway-a)              |
| PBI-005 | Pregled detalja vlastitog zahtjeva                            | Uvid korisnika u status i sadržaj vlastite prijave                          | Feature | Srednji   | 3                   | Done  | Sprint 7         | Uvid korisnika               |
| PBI-006 | Izmjena i otkazivanje vlastitog zahtjeva                      | Ispravka ili povlačenje zahtjeva prije obrade                              | Feature | Srednji   | 5                   | Done  | Sprint 7         | Upravljanje zahtjevom        |
| PBI-007 | Pregled liste aktivnih i otvorenih intervencija               | Operativni pregled svih otvorenih intervencija za dispečera                | Feature | Visok     | 5                   | Done  | Sprint 7         | Radni pregled dispečera      |
| PBI-008 | Pregled detalja pojedinačne intervencije za dispečera         | Detaljan uvid u pojedinačnu intervenciju za odluke                         | Feature | Srednji   | 3                   | Done  | Sprint 7         | Detaljan uvid                |
| PBI-009 | Pregled operativnog statusa na kontrolnoj tabli               | Sažeti prikaz intervencija po fazama i metrika                             | Feature | Srednji   | 3                   | Done  | Sprint 7–9       | Dashboard, SLA (US-41, US-45), izvještaj odziva (US-42) |
| PBI-010 | Određivanje prioriteta intervencije                           | Dodjela prioriteta za hitno rješavanje kvarova                             | Feature | Visok     | 5                   | Done  | Sprint 7         | Prioritizacija rada          |
| PBI-011 | Planiranje izlazaka na teren                                  | Planiranje izlazaka prema dostupnosti i opterećenju                        | Feature | Visok     | 8                   | Done  | Sprint 8         | Ključna logistika            |
| PBI-012 | Dodjela intervencije izvršiocu ili timu                       | Dodjela zadatka konkretnom serviseru ili timu                              | Feature | Visok     | 5                   | Done  | Sprint 8         | Dodjela izvršenja            |
| PBI-013 | Preraspodjela i ponovna dodjela intervencije                  | Promjena izvršioca uslijed odbijanja ili odsustva                          | Feature | Srednji   | 5                   | Done  | Sprint 8–9       | US-28/29/40/47 — FTR metrika |
| PBI-014 | Pregled dodijeljenih zadataka                                 | Prikaz zaduženja i detalja za servisera                                    | Feature | Visok     | 3                   | Done  | Sprint 8         | Prikaz za servisera          |
| PBI-015 | Prihvatanje ili odbijanje dodijeljenog zadatka                | Povratna informacija dispečeru o preuzimanju zadatka                       | Feature | Srednji   | 3                   | Done  | Sprint 8         | Povratna informacija         |
| PBI-016 | Ažuriranje statusa intervencije od strane servisera           | Evidentiranje napretka rada na terenu u realnom vremenu                    | Feature | Visok     | 3                   | Done  | Sprint 8         | Praćenje toka                |
| PBI-017 | Evidentiranje izvršenog rada                                  | Unos utrošenog vremena, materijala i opisa radova                          | Feature | Srednji   | 5                   | Done  | Sprint 8–9       | US-17/38/46 — stavke materijala |
| PBI-018 | Pregled evidentiranog izvršenog rada                          | Provjera unesenih podataka prije zatvaranja (Dispečer)                     | Feature | Srednji   | 3                   | Done  | Sprint 8         | Kontrola                     |
| PBI-019 | Potvrda i zatvaranje intervencije                             | Formalno okončanje procesa intervencije                                    | Feature | Srednji   | 3                   | Done  | Sprint 8         | Završni korak                |
| PBI-020 | Napomene na intervenciji                                      | Centralizovana komunikacija unutar intervencije                            | Feature | Srednji   | 3                   | Done  | Sprint 8         | Interna komunikacija         |
| PBI-021 | Historija aktivnosti intervencije                             | Potpuni trag (audit trail) svih promjena na intervenciji                   | Feature | Srednji   | 5                   | Done  | Sprint 8–9       | US-32/39/44 — timeline i tabela |
| PBI-022 | Kreiranje početne sheme baze podataka        | Definisati osnovne entitete (korisnik, zahtjev, intervencija) i njihove relacije u bazi. | Technical Task | Visok   | 5 | Done | Sprint 6 | Osnova sistema, bez ovoga nije moguće implementirati ostale funkcionalnosti. |
| PBI-023 | Postavljanje autentifikacije korisnika       | Omogućiti prijavu korisnika i osnovnu kontrolu pristupa sistemu.                         | Technical Task | Visok   | 5 | Done | Sprint 6 | Potrebno za zaštitu pristupa i rad sa korisničkim podacima.                  |
| PBI-024 | Istražiti model korisničkih uloga i pristupa | Analizirati i definisati uloge korisnika i pravila pristupa funkcionalnostima sistema.   | Research       | Srednji | 2 | Done | Sprint 6 | Rezultat će se koristiti za implementaciju autorizacije i RLS pravila.       |


## Legenda  
Kako bismo osigurali konzistentnost i razumijevanje unutar tima, koristimo sljedeće standarde za definisanje stavki:

**1. Tip stavke (Item Type)**
Određuje prirodu posla koji treba obaviti:

* **Feature:** Nova funkcionalnost sistema koja donosi direktnu vrijednost korisniku (npr. Prijava kvara).

* **Bug:** Ispravka greške u postojećoj funkcionalnosti koja ne radi kako je planirano.

* **Technical Task:** Rad na infrastrukturi, bazi podataka ili kodu koji je neophodan za funkcionisanje sistema (npr. Setup servera).

* **Research:** Istraživanje tehnologija, API-ja ili korisničkih potreba prije same implementacije.

* **Documentation:** Izrada korisničkih uputstava, tehničkih specifikacija ili dijagrama.

**2. Prioritet (Priority)**
Određuje redoslijed rješavanja stavki prema poslovnoj važnosti:

* **Visok (Must Have):** Kritične stavke bez kojih MVP ne može funkcionisati.

* **Srednji (Should Have):** Važne funkcionalnosti koje nisu kritične za prvu verziju, ali su bitne za korisničko iskustvo.

* **Nizak (Could Have):** Stavke koje bi bilo "lijepo imati" ako ostane vremena i resursa.

**3. Procjena složenosti (Estimation)**
Koristimo Story Points (Fibonaccijev niz: 1, 2, 3, 5, 8, 13). Procjena ne predstavlja sate, već kombinaciju:

* **Obima posla:** Koliko toga treba uraditi?

* **Složenosti:** Koliko je teško to implementirati?

* **Neizvjesnosti:** Koliko nam je nepoznata tehnologija ili zahtjev?
  (**Napomena:** 1 = vrlo jednostavno, 13 = velika nepoznanica koju treba razbiti na manje dijelove).

**4. Status**
Prati životni ciklus stavke:

* **To Do:** Stavka je definisana i čeka na red za rad.

* **In Progress:** Tim aktivno radi na stavci u trenutnom sprintu.

* **Done:** Stavka ispunjava sve kriterije iz Definition of Done (implementirana, testirana, dokumentovana).

**5. Veza sa sprintom / Release planom**
Označava kada planiramo raditi na stavci:

* **Sprint X:** Stavka je planirana za konkretnu sedmicu rada.

* **Release 1.0 (MVP):** Stavka je dio prve verzije sistema.

