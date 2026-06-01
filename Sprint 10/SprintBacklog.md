# Sprint Goal

### Sprint broj 10

### Sprint cilj

Finalizirati i stabilizirati aplikaciju pred predaju kroz nadogradnju već kompletnog MVP toka, dodavanje geo-preporuke servisera po blizini, analitičkog dashboarda sa grafovima, responsive i accessibility poboljšanja, te završno usklađivanje dokumentacije, migracija i demo pripreme.

Sprint 10 ne služi za dovršavanje osnovnog MVP-a, jer su korisničke priče US-01 do US-47 već implementirane. Fokus sprinta je podizanje kvaliteta, operativne vrijednosti i prezentacijske spremnosti sistema kroz nove priče US-48, US-49 i US-50.

### Ključne stavke koje tim želi završiti

- implementirati geo-preporuku servisera po blizini lokacije intervencije (US-48)
- dodati baznu lokaciju servisera kroz profil i admin uređivanje
- omogućiti izračun udaljenosti između zahtjeva i servisera
- prikazati udaljenost servisera i oznaku najbližeg servisera
- implementirati analitički dashboard za dispečera sa grafovima (US-49)
- prikazati KPI metrike: statusi, SLA, odziv, trajanje, opterećenje servisera i trend završavanja
- poboljšati responsive prikaz serviserskih i dispečerskih ekrana (US-50)
- dodati prazna, loading i error stanja gdje nedostaju
- poboljšati accessibility: aria-label, vidljiv fokus i bolji kontrast
- zatvoriti tehnički dug vezan za testove, migracije, dokumentaciju i demo pripremu

### Rizici i zavisnosti

Postoji rizik:

- da geo-preporuka ne daje korisne rezultate ako serviserske bazne lokacije nisu unesene
- da nedostaju koordinate zahtjeva ili servisera, zbog čega sistem mora imati fallback logiku
- da analitički dashboard prikaže nekonzistentne podatke ako ne koristi ista pravila kao postojeći izvještaji
- da nova vizuelna komponenta za grafove poveća kompleksnost ili naruši performanse
- da responsive dorade izazovu regresije na postojećim ekranima
- da migracije ne budu primijenjene na živu bazu prije demo prikaza

Zavisnosti:

- završen i testiran MVP tok kroz US-01 do US-47
- postojeći sistem zahtjeva, intervencija, servisera i dispečera
- postojeći model lokacije zahtjeva
- postojeća logika preporuke servisera
- postojeći izvještaji odziva i SLA pravila
- PostgreSQL baza i Supabase migracije
- postojeći dizajn-sistem aplikacije
- postojeće role-based access control provjere
- testni i demo podaci za servisere, zahtjeve i intervencije

---

# Sprint Backlog

| ID | User Story / Stavka | Prioritet | Procjena težine | Zadaci | Acceptance Criteria |
|---|---|---|---:|---|---|
| US-48 | Kao dispečer, želim da mi sistem pri dodjeli preporuči servisere i prema blizini lokacije intervencije, kako bih smanjio vrijeme odziva i troškove izlaska na teren. | Visok     | 8 pts        | Dodati baznu lokaciju servisera u bazu, omogućiti unos lokacije kroz profil servisera i admin uređivanje, implementirati Haversine izračun udaljenosti, proširiti scoring preporuke servisera faktorom blizine, omogućiti fallback kada koordinate nedostaju, prikazati udaljenost i oznaku “Najbliži” u kartici servisera, dodati unit testove za izračun i scoring. | AC1: Sistem računa udaljenost između lokacije intervencije i servisera kada postoje validne koordinate. <br><br> AC2: Blizina servisera utiče na scoring i preporuku pri dodjeli intervencije. <br><br> AC3: Dispečer vidi udaljenost i oznaku najbližeg servisera u interfejsu za dodjelu. <br><br> AC4: Ako koordinate nisu dostupne, sistem nastavlja rad bez greške i koristi postojeću logiku preporuke. <br><br> AC5: Izračun udaljenosti i scoring preporuka pokriveni su unit testovima. <br><br> AC6: Funkcionalnost je dostupna samo korisnicima sa dispečerskom ulogom. |
| US-49 | Kao dispečer, želim vizuelni analitički dashboard sa grafovima ključnih pokazatelja, kako bih brzo razumio stanje i opterećenje sistema.                             | Srednji   | 8 pts        | Kreirati agregacione funkcije za metrike, implementirati API za analitiku, prikazati KPI kartice, implementirati grafove za status, SLA, opterećenje servisera i trend završavanja, dodati filter po periodu, dodati prazno/loading/error stanje, ograničiti pristup na dispečera.                                                                                    | AC1: Dispečer može pregledati KPI metrike i grafove ključnih operativnih podataka. <br><br> AC2: Prikazani podaci su konzistentni sa postojećim izvještajima i stanjem sistema. <br><br> AC3: Dashboard omogućava filtriranje podataka po vremenskom periodu. <br><br> AC4: Sistem prikazuje odgovarajuća loading, empty i error stanja. <br><br> AC5: Dashboard ostaje pregledan i responzivan na različitim veličinama ekrana. <br><br> AC6: Neovlašteni korisnici ne mogu pristupiti analitičkom dashboardu.                                                                    |
| US-50 | Kao serviser na terenu, želim da aplikacija bude pregledna i upotrebljiva na mobilnom uređaju, kako bih mogao lakše raditi bez računara.                             | Srednji   | 5 pts        | Pregledati serviserske ekrane na manjim širinama, ukloniti horizontalni scroll, poboljšati kartice intervencija, dodati prazna i loading stanja, dodati aria-label na ikon-dugmad, osigurati vidljiv fokus, ujednačiti spacing, badgeve i responsive ponašanje.                                                                                                       | AC1: Ključni serviserski ekrani ostaju funkcionalni i pregledni na manjim mobilnim širinama. <br><br> AC2: Interfejs ne sadrži horizontalni scroll u standardnim serviserskim tokovima. <br><br> AC3: Interaktivni elementi imaju odgovarajuće accessibility oznake i vidljiv fokus. <br><br> AC4: Prazna, loading i error stanja su jasno prikazana korisniku. <br><br> AC5: Kartice, spacing i responsive ponašanje interfejsa su vizuelno konzistentni kroz serviserski modul. <br><br> AC6: Ključni serviserski workflow može se koristiti bez potrebe za desktop uređajem.    |
| S10-T1 | Popravka e2e RBAC testova | Visok | 3 pts | Uskladiti testne pretpostavke i seed podatke, provjeriti cross-access scenarije, vratiti e2e testove na zeleno bez slabljenja sigurnosnih provjera. | AC1: e2e RBAC testovi prolaze. AC2: Negativni 403 slučajevi ostaju validni. AC3: Neovlašten pristup je i dalje blokiran. |
| S10-T2 | Popravka mrtvog inline SLA puta | Srednji | 2 pts | Provjeriti mapiranje prioriteta u dispečerskoj listi, uskladiti `final_priority` sa SLA logikom ili ukloniti mrtav inline put ako cron već pokriva funkcionalnost. | AC1: SLA status koristi ispravan prioritet. AC2: Ne postoji mrtav kod koji zavarava prikaz. AC3: Testovi potvrđuju očekivano ponašanje. |
| S10-T3 | Repo-wide prettier i formatiranje | Nizak | 1 pt | Pokrenuti formatiranje repozitorija u zasebnom commitu, osigurati da prettier check prolazi. | AC1: Prettier check prolazi. AC2: Formatiranje ne miješa funkcionalne izmjene. |
| S10-T4 | Usklađivanje dokumentacije | Srednji | 2 pts | Dopuniti Traceability za US-48, US-49 i US-50, uskladiti statuse sprintova, ažurirati decision log, review summary i demo dokumentaciju. | AC1: Dokumentacija odgovara stvarnom stanju implementacije. AC2: US-48 do US-50 su evidentirane. AC3: Nema očiglednih neslaganja između koda i dokumentacije. |
| S10-T5 | Primjena migracija na živu bazu | Visok | 2 pts | Primijeniti migracije za baznu lokaciju servisera i RLS politike, provjeriti da migracije prolaze, validirati rad na živoj bazi. | AC1: Migracije su uspješno primijenjene. AC2: RLS politike rade očekivano. AC3: Geo-preporuka ima potrebne podatke u bazi. |

---

# Detalji User Stories

## US-48 — Geo-preporuka servisera po blizini lokacije intervencije

**Opis:**
Kao dispečer, želim da sistem predloži servisere koji su najbliži lokaciji intervencije, kako bih mogao brže organizovati izlazak na teren i smanjiti vrijeme odziva.

**Poslovna vrijednost:**
Ovaj story je važan jer omogućava efikasniju raspodjelu resursa, smanjuje vrijeme dolaska servisera na lokaciju i doprinosi boljem poštivanju SLA rokova i kvalitetu usluge.

**Prioritet:**
*Srednji*

**Pretpostavke i otvorena pitanja:**

**Pretpostavka:** Sistem raspolaže lokacijom intervencije i lokacijskim podacima servisera ili njihovih prethodnih aktivnosti.

**Otvoreno pitanje:** Da li se preporuka bazira isključivo na udaljenosti ili uključuje i druge faktore poput opterećenja, prioriteta, kompetencija i dostupnosti servisera?

**Veze sa drugim storyjima:**
Povezano sa planiranjem intervencije (US-11), dodjelom intervencije serviseru (US-09), SLA praćenjem (US-41), dashboard pregledom (US-31) i analitičkim dashboardom (US-49).

**Acceptance Criteria:**

* **AC1: Prikaz preporučenih servisera**

  * **GIVEN** intervencija ima validnu lokaciju
  * **WHEN** dispečer otvori dodjelu servisera
  * **THEN** sistem prikazuje servisere sortirane prema blizini lokacije intervencije

* **AC2: Prikaz osnovnih informacija o preporuci**

  * **GIVEN** sistem generiše preporuke
  * **WHEN** dispečer pregleda listu servisera
  * **THEN** prikazuju se osnovni podaci uključujući udaljenost i dostupnost servisera

* **AC3: Nedostupna lokacija**

  * **GIVEN** lokacija intervencije ili servisera nije dostupna
  * **WHEN** sistem pokuša generisati preporuke
  * **THEN** sistem prikazuje odgovarajuću poruku i dozvoljava ručni izbor servisera

* **AC4: Ručni override preporuke**

  * **GIVEN** sistem je predložio servisera
  * **WHEN** dispečer odabere drugog servisera
  * **THEN** sistem dozvoljava ručni izbor bez ograničenja

* **AC5: Isključenje neaktivnih servisera**

  * **GIVEN** serviser nije aktivan ili nema odgovarajuću ulogu
  * **WHEN** sistem generiše preporuke
  * **THEN** takav serviser se ne prikazuje u preporukama

* **AC6: Evidentiranje dodjele**

  * **GIVEN** dispečer potvrdi dodjelu servisera
  * **WHEN** sistem spremi promjenu
  * **THEN** dodjela se evidentira u historiji aktivnosti

---

## US-49 — Analitički dashboard sa grafovima i KPI metrikama

**Opis:**
Kao dispečer ili administrator, želim pregledati analitički dashboard sa ključnim KPI metrikama i grafovima, kako bih imao brz pregled operativnog stanja sistema i performansi servisnih intervencija.

**Poslovna vrijednost:**
Ovaj story omogućava brži operativni pregled sistema, lakše prepoznavanje problema i donošenje odluka na osnovu podataka i trendova.

**Prioritet:**
*Srednji*

**Pretpostavke i otvorena pitanja:**

**Pretpostavka:** Sistem raspolaže historijskim i trenutnim podacima o intervencijama, statusima i odzivima servisera.

**Otvoreno pitanje:** Koji KPI pokazatelji su obavezni za MVP, a koji predstavljaju opcionalna proširenja za buduće faze sistema?

**Veze sa drugim storyjima:**
Povezano sa pregledom operativnog statusa intervencija (US-31), SLA praćenjem (US-41), izvještajem odziva servisera (US-42), historijom aktivnosti (US-32) i geo-preporukom servisera (US-48).

**Acceptance Criteria:**

* **AC1: Prikaz KPI metrika**

  * **GIVEN** korisnik pristupi dashboardu
  * **WHEN** sistem učita podatke
  * **THEN** prikazuju se ključne operativne metrike i KPI indikatori

* **AC2: Vizuelni prikaz podataka**

  * **GIVEN** dashboard sadrži analitičke podatke
  * **WHEN** sistem prikaže dashboard
  * **THEN** podaci su prikazani pomoću kartica, indikatora i grafova

* **AC3: Vizuelno isticanje problema**

  * **GIVEN** postoje intervencije sa SLA problemima ili kašnjenjima
  * **WHEN** dashboard prikaže podatke
  * **THEN** problematična stanja su vizuelno istaknuta

* **AC4: Klikabilni KPI indikatori**

  * **GIVEN** korisnik pregleda KPI karticu
  * **WHEN** klikne na određeni indikator
  * **THEN** sistem otvara povezani filtrirani pregled podataka

* **AC5: Empty state dashboarda**

  * **GIVEN** nema dovoljno podataka za analitiku
  * **WHEN** korisnik otvori dashboard
  * **THEN** sistem prikazuje odgovarajuću empty-state poruku

* **AC6: Ograničenje pristupa dashboardu**

  * **GIVEN** korisnik nema odgovarajuća ovlaštenja
  * **WHEN** pokuša pristupiti dashboardu
  * **THEN** sistem ne dozvoljava pristup

---

## US-50 — Responsive i accessibility unapređenja sistema

**Opis:**
Kao korisnik sistema, želim da aplikacija bude pregledna, responzivna i pristupačna na različitim uređajima, kako bih mogao efikasno koristiti sistem bez obzira na veličinu ekrana ili način korištenja.

**Poslovna vrijednost:**
Ovaj story poboljšava ukupno korisničko iskustvo, smanjuje kognitivno opterećenje korisnika i omogućava kvalitetniji rad na desktop i mobilnim uređajima.

**Prioritet:**
*Srednji*

**Pretpostavke i otvorena pitanja:**

**Pretpostavka:** Postojeći interfejs sistema već koristi zajedničke UI komponente i dizajn obrasce.

**Otvoreno pitanje:** Koji accessibility standardi i nivo usklađenosti predstavljaju minimalni cilj za MVP fazu sistema?

**Veze sa drugim storyjima:**
Povezano sa svim korisničkim modulima sistema, posebno pregledom intervencija (US-07, US-15), dashboardom (US-31, US-49), pregledom detalja intervencije (US-08, US-16) i notifikacijama (US-37).

**Acceptance Criteria:**

* **AC1: Responsivan prikaz sistema**

  * **GIVEN** korisnik koristi sistem na različitim uređajima
  * **WHEN** sistem prikaže interfejs
  * **THEN** sadržaj ostaje pregledan i funkcionalan bez narušavanja layouta

* **AC2: Prilagođena navigacija manjim ekranima**

  * **GIVEN** korisnik koristi mobilni uređaj
  * **WHEN** pristupi sistemu
  * **THEN** navigacija i ključne funkcionalnosti ostaju dostupne i pregledne

* **AC3: Accessibility podrška**

  * **GIVEN** korisnik koristi tastaturu ili asistivne tehnologije
  * **WHEN** koristi osnovne funkcionalnosti sistema
  * **THEN** interaktivni elementi su fokusabilni i pristupačni

* **AC4: Jasna validacija i error state**

  * **GIVEN** korisnik unese neispravne podatke ili dođe do greške
  * **WHEN** sistem izvrši validaciju
  * **THEN** prikazuje jasne validacijske i error poruke

* **AC5: Konzistentan UI/UX**

  * **GIVEN** korisnik prelazi između različitih modula sistema
  * **WHEN** koristi aplikaciju
  * **THEN** sistem koristi konzistentne UI komponente i vizuelni identitet

* **AC6: Smanjenje kognitivnog opterećenja**

  * **GIVEN** korisnik prolazi kroz složeniji workflow
  * **WHEN** sistem prikazuje informacije i akcije
  * **THEN** koristi vizuelne indikatore, grupisanje i hijerarhijski prikaz sadržaja radi lakšeg korištenja

---
