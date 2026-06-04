# Sprint Goal

### Sprint broj 11

### Sprint cilj

Završiti projekat kroz implementaciju dodatnih odobrenih user storyja, završnu stabilizaciju sistema, finalno testiranje, usklađivanje dokumentacije i pripremu aplikacije za konačnu demonstraciju i predaju.

Sprint 11 predstavlja završni sprint projekta. Nakon što su kroz prethodne sprintove implementirani osnovni MVP tok i dodatna unapređenja kvaliteta sistema, fokus Sprinta 11 je na funkcionalnostima koje dodatno zaokružuju poslovni tok servisnih intervencija i poboljšavaju korisničko iskustvo nakon završetka intervencije.

U ovom sprintu implementiraju se dodatni user storyji US-51, US-52, US-53 i US-54, koji su predloženi i odobreni nakon Sprint Review prezentacije Sprinta 10.

### Ključne stavke koje tim želi završiti

- implementirati baznu/polaznu lokaciju servisera i prikaz rute do intervencije (US-51)
- omogućiti unos i izmjenu bazne lokacije servisera
- prikazati lokaciju intervencije na mapi
- omogućiti prikaz rute od bazne lokacije servisera do lokacije intervencije
- omogućiti otvaranje rute u vanjskoj navigacionoj aplikaciji
- implementirati ocjenu korisnika nakon zatvorene intervencije (US-52)
- omogućiti unos ocjene i kratkog komentara za zatvorenu intervenciju
- prikazati ocjenu i komentar ovlaštenim korisnicima
- implementirati automatski podsjetnik za intervencije koje dugo čekaju (US-53)
- automatski označiti intervencije koje predugo ostaju bez obrade ili dodjele
- prikazati upozorenje dispečeru u listi intervencija i na dashboardu
- implementirati pregled historije intervencija po korisniku usluge (US-54)
- omogućiti korisniku pregled ranijih intervencija sa osnovnim detaljima
- omogućiti otvaranje detalja pojedinačne historijske intervencije
- završiti regresiono i integraciono testiranje
- uskladiti dokumentaciju, sprint artefakte i demo podatke
- pripremiti aplikaciju za završnu demonstraciju i predaju

### Rizici i zavisnosti

Postoji rizik:

- da ruta neće biti prikazana ako nedostaje bazna lokacija servisera ili lokacija intervencije
- da vanjska navigacija zavisi od dostupnosti podržane mape ili navigacione aplikacije
- da korisnik pokuša ocijeniti intervenciju koja još nije zatvorena
- da se ista intervencija ocijeni više puta ako ne postoji ograničenje na nivou sistema
- da podsjetnici za intervencije koje čekaju mogu previše opteretiti dispečerski prikaz ako prag nije jasno definisan
- da historija intervencija korisnika mora strogo poštovati pravila pristupa i ne smije prikazati tuđe podatke
- da završne izmjene mogu izazvati regresiju u već stabilnim tokovima sistema
- da dokumentacija ne bude potpuno usklađena sa finalnim stanjem aplikacije

Zavisnosti:

- završen i stabilan MVP tok kroz prethodne sprintove
- implementirana geo-preporuka i lokacijski model iz Sprinta 10
- postojeći model korisnika, servisera, intervencija i statusa
- postojeće zatvaranje intervencije
- postojeći dashboard i dispečerski pregled intervencija
- postojeća RBAC pravila i sigurnosne provjere
- PostgreSQL baza i postojeće migracije
- testni i demo podaci za korisnike, servisere i intervencije
- usklađena dokumentacija iz prethodnih sprintova

---

# Sprint Backlog

| ID | User Story / Stavka | Prioritet | Procjena težine | Zadaci | Acceptance Criteria |
|---|---|---|---:|---|---|
| US-51 | Kao serviser, želim unijeti svoju baznu/polaznu lokaciju i vidjeti prikaz rute do intervencije na mapi, kako bih mogao lakše planirati dolazak na lokaciju i organizovati svoj rad na terenu. | Visok | 8 pts | Dodati ili proširiti podatke o baznoj lokaciji servisera, omogućiti unos i izmjenu bazne lokacije kroz profil ili administraciju, prikazati lokaciju intervencije na mapi, implementirati prikaz rute između bazne lokacije i intervencije, omogućiti fallback kada lokacijski podaci nedostaju, omogućiti otvaranje rute u vanjskoj navigaciji, dodati testove za osnovne lokacijske scenarije. | AC1: Serviser može unijeti ili izmijeniti baznu lokaciju. <br><br> AC2: Sistem prikazuje lokaciju intervencije na mapi kada su podaci dostupni. <br><br> AC3: Sistem prikazuje rutu između bazne lokacije servisera i lokacije intervencije. <br><br> AC4: Ako lokacijski podaci nisu dostupni, sistem prikazuje jasnu poruku i ne prekida korisnički tok. <br><br> AC5: Serviser može otvoriti rutu u vanjskoj navigacionoj aplikaciji. <br><br> AC6: Serviser može vidjeti rutu samo za intervencije koje su mu dodijeljene. |
| US-52 | Kao korisnik usluge, želim dati ocjenu i komentar nakon zatvorene intervencije, kako bih mogao pružiti povratnu informaciju o kvalitetu usluge i radu servisnog tima. | Srednji | 5 pts | Dodati model ili tabelu za ocjene intervencija, omogućiti unos ocjene 1–5 i komentara nakon zatvaranja intervencije, validirati da se ocjena može ostaviti samo za vlastitu zatvorenu intervenciju, ograničiti jednu ocjenu po intervenciji, prikazati ocjenu ovlaštenim korisnicima, povezati ocjene sa historijom intervencija i dashboardom gdje je primjenjivo. | AC1: Korisnik može ocijeniti samo svoju zatvorenu intervenciju. <br><br> AC2: Ocjena mora biti u dozvoljenom rasponu 1–5. <br><br> AC3: Komentar se može spremiti uz ocjenu. <br><br> AC4: Sistem ne dozvoljava višestruko ocjenjivanje iste intervencije. <br><br> AC5: Ovlašteni korisnici mogu vidjeti ocjenu i komentar. <br><br> AC6: Neovlašteni korisnici ne mogu pristupiti tuđim ocjenama. |
| US-53 | Kao dispečer, želim da sistem automatski istakne intervencije koje predugo čekaju bez obrade ili dodjele, kako ne bih propustio zahtjeve koji su ostali neobrađeni ili zapeli u workflow-u. | Visok | 5 pts | Definisati prag za intervencije koje dugo čekaju, implementirati logiku detekcije dugog čekanja prema statusu i vremenu, vizuelno označiti takve intervencije u listi, prikazati razlog i trajanje čekanja u detaljima, dodati KPI ili indikator na dashboardu, ukloniti upozorenje nakon obrade ili dodjele, dodati testove za pragove čekanja. | AC1: Sistem detektuje intervencije koje predugo čekaju u određenom statusu. <br><br> AC2: Dispečer vidi vizuelno istaknute intervencije koje zahtijevaju pažnju. <br><br> AC3: Sistem prikazuje razlog upozorenja i trajanje čekanja. <br><br> AC4: Upozorenje se uklanja kada intervencija više ne ispunjava uslove za čekanje. <br><br> AC5: Dashboard prikazuje broj intervencija koje predugo čekaju. <br><br> AC6: Funkcionalnost je dostupna samo ovlaštenim korisnicima. |
| US-54 | Kao korisnik usluge, želim vidjeti sve svoje prošle intervencije na jednom mjestu s osnovnim detaljima, kako bih mogao pratiti historiju servisa svoje imovine. | Srednji | 5 pts | Implementirati pregled historije intervencija za korisnika usluge, prikazati završene i prethodne intervencije sa osnovnim detaljima, omogućiti otvaranje detalja pojedinačne intervencije, prikazati ocjenu ako postoji, ograničiti prikaz samo na intervencije prijavljenog korisnika, dodati empty state kada korisnik nema prethodnih intervencija. | AC1: Korisnik vidi listu svojih prethodnih intervencija. <br><br> AC2: Lista prikazuje osnovne detalje kao što su datum, tip kvara, status i ocjena ako postoji. <br><br> AC3: Korisnik može otvoriti detalje pojedinačne historijske intervencije. <br><br> AC4: Sistem prikazuje samo intervencije prijavljenog korisnika. <br><br> AC5: Ako korisnik nema historiju intervencija, sistem prikazuje odgovarajuće prazno stanje. <br><br> AC6: Neovlašten pristup tuđoj historiji je blokiran. |
| S11-T1 | Završno regresiono testiranje | Visok | 3 pts | Testirati kompletan tok od prijave zahtjeva do zatvaranja intervencije, uključujući dispečera, servisera i korisnika usluge. Provjeriti happy path i najvažnije alternativne scenarije. | AC1: Ključni workflow prolazi bez grešaka. <br><br> AC2: Testirani su korisnik, dispečer, serviser i administrator. <br><br> AC3: Uočene greške su evidentirane i riješene ili dokumentovane. |
| S11-T2 | Završna provjera sigurnosti i RBAC pravila | Visok | 3 pts | Provjeriti da korisnici mogu pristupiti samo funkcijama i podacima koji odgovaraju njihovoj ulozi. Testirati URL manipulaciju, pristup tuđim intervencijama, ocjenama i historiji. | AC1: Neovlašten pristup je blokiran. <br><br> AC2: Serviser vidi samo svoje intervencije. <br><br> AC3: Korisnik vidi samo svoje zahtjeve i historiju. <br><br> AC4: Admin i dispečer imaju samo predviđena ovlaštenja. |
| S11-T3 | Finalno UI/UX poliranje | Srednji | 2 pts | Uskladiti spacing, badgeve, kartice, prazna stanja, loading i error prikaze na ekranima koji se koriste u demo toku. | AC1: Ključni demo ekrani su vizuelno konzistentni. <br><br> AC2: Empty, loading i error stanja su jasno prikazana. <br><br> AC3: UI ne uvodi nepotrebno kognitivno opterećenje. |
| S11-T4 | Usklađivanje dokumentacije i sprint artefakata | Visok | 3 pts | Ažurirati User Stories dokument, Sprint Backlog, Sprint Goal, Decision Log, AI Usage Log, Sprint Review Summary i demo bilješke. Provjeriti da dokumentacija prati stvarno stanje aplikacije. | AC1: Dokumentacija uključuje US-51 do US-54. <br><br> AC2: Sprint artefakti su međusobno usklađeni. <br><br> AC3: Nema očiglednih neslaganja između dokumentacije i implementacije. |
| S11-T5 | Završna demo priprema i testni podaci | Visok | 2 pts | Pripremiti demo scenarij, testne korisnike, servisere, intervencije, ocjene, historiju i primjere za prikaz rute i podsjetnika. | AC1: Demo podaci pokrivaju sve ključne uloge. <br><br> AC2: Demo scenarij prikazuje osnovni tok i nove funkcionalnosti. <br><br> AC3: Sistem je spreman za završnu prezentaciju. |

---

# Detalji User Stories

## US-51 — Bazna lokacija servisera i prikaz rute do intervencije

**Opis:**  
Kao serviser, želim unijeti svoju baznu/polaznu lokaciju i vidjeti prikaz rute do intervencije na mapi, kako bih mogao lakše planirati dolazak na lokaciju i organizovati svoj rad na terenu.

**Poslovna vrijednost:**  
Ovaj story omogućava bolju organizaciju rada na terenu, efikasnije planiranje dolaska na lokaciju intervencije i kvalitetnije upravljanje vremenom servisera.

**Prioritet:**  
*Visok*

**Pretpostavke i otvorena pitanja:**

**Pretpostavka:** Sistem raspolaže lokacijom intervencije i podržava prikaz geografskih podataka na mapi.

**Otvoreno pitanje:** Da li se ruta prikazuje samo informativno ili će sistem koristiti podatke o udaljenosti i vremenu putovanja za dodatne preporuke i planiranje?

**Veze sa drugim storyjima:**  
Povezano sa geo-preporukom servisera (US-48), planiranjem intervencije (US-11), pregledom detalja zadatka na terenu (US-16) i pregledom dodijeljenih intervencija (US-15).

**Acceptance Criteria:**

* **AC1: Unos bazne lokacije**
  * **GIVEN** serviser pristupi svom profilu ili postavkama
  * **WHEN** unese ili izmijeni baznu lokaciju
  * **THEN** sistem sprema odabranu lokaciju

* **AC2: Prikaz lokacije intervencije na mapi**
  * **GIVEN** intervencija ima evidentiranu lokaciju
  * **WHEN** serviser otvori detalje intervencije
  * **THEN** sistem prikazuje lokaciju intervencije na mapi

* **AC3: Prikaz rute**
  * **GIVEN** bazna lokacija i lokacija intervencije postoje
  * **WHEN** serviser pregleda detalje intervencije
  * **THEN** sistem prikazuje rutu između dvije lokacije

* **AC4: Nedostupni lokacijski podaci**
  * **GIVEN** nedostaje bazna lokacija ili lokacija intervencije
  * **WHEN** sistem pokuša prikazati rutu
  * **THEN** prikazuje odgovarajuću poruku i ne pokušava generisati rutu

* **AC5: Otvaranje vanjske navigacije**
  * **GIVEN** ruta je prikazana
  * **WHEN** serviser odabere opciju navigacije
  * **THEN** sistem omogućava otvaranje rute u vanjskoj navigacionoj aplikaciji

* **AC6: Ograničenje pristupa ruti**
  * **GIVEN** intervencija nije dodijeljena serviseru
  * **WHEN** serviser pokuša pristupiti ruti
  * **THEN** sistem ne dozvoljava pristup podacima o ruti

---

## US-52 — Ocjena korisnika nakon zatvorene intervencije

**Opis:**  
Kao korisnik usluge, želim dati ocjenu i komentar nakon zatvorene intervencije, kako bih mogao pružiti povratnu informaciju o kvalitetu usluge i radu servisnog tima.

**Poslovna vrijednost:**  
Ovaj story omogućava prikupljanje povratnih informacija korisnika i pruža osnovu za praćenje kvaliteta usluge i kontinuirano unapređenje rada servisnog tima.

**Prioritet:**  
*Srednji*

**Pretpostavke i otvorena pitanja:**

**Pretpostavka:** Intervencija mora biti završena prije nego što korisnik može ostaviti ocjenu.

**Otvoreno pitanje:** Da li korisnik može naknadno izmijeniti već unesenu ocjenu?

**Veze sa drugim storyjima:**  
Povezano sa zatvaranjem intervencije (US-25), pregledom historije intervencija korisnika (US-54) i analitičkim dashboardom (US-49).

**Acceptance Criteria:**

* **AC1: Ocjenjivanje zatvorene intervencije**
  * **GIVEN** intervencija ima status zatvorena
  * **WHEN** korisnik otvori detalje intervencije
  * **THEN** sistem omogućava unos ocjene i komentara

* **AC2: Ograničenje na jednu ocjenu**
  * **GIVEN** korisnik je već ocijenio intervenciju
  * **WHEN** ponovo pristupi obrascu za ocjenjivanje
  * **THEN** sistem prikazuje postojeću ocjenu

* **AC3: Validacija ocjene**
  * **GIVEN** korisnik unosi ocjenu
  * **WHEN** potvrdi unos
  * **THEN** sistem prihvata samo dozvoljene vrijednosti ocjene od 1 do 5

* **AC4: Spremanje komentara**
  * **GIVEN** korisnik unese komentar
  * **WHEN** potvrdi ocjenjivanje
  * **THEN** sistem sprema komentar uz ocjenu

* **AC5: Vidljivost rezultata**
  * **GIVEN** intervencija je ocijenjena
  * **WHEN** ovlašteni korisnici pregledaju podatke
  * **THEN** sistem prikazuje ocjenu i komentar

* **AC6: Ograničenje pristupa ocjeni**
  * **GIVEN** korisnik pokuša ocijeniti tuđu intervenciju
  * **WHEN** sistem provjeri ovlaštenje
  * **THEN** sistem ne dozvoljava unos ocjene

---

## US-53 — Automatski podsjetnik za intervencije koje dugo čekaju

**Opis:**  
Kao dispečer, želim da sistem automatski istakne intervencije koje predugo čekaju bez obrade ili dodjele, kako ne bih propustio zahtjeve koji su ostali neobrađeni ili zapeli u workflow-u.

**Poslovna vrijednost:**  
Ovaj story smanjuje rizik od zaboravljenih ili zanemarenih zahtjeva i pomaže u održavanju efikasnog operativnog toka rada.

**Prioritet:**  
*Visok*

**Pretpostavke i otvorena pitanja:**

**Pretpostavka:** Sistem prati vrijeme provedeno u svakom statusu intervencije.

**Otvoreno pitanje:** Da li prag za podsjetnik treba biti jedinstven ili zavisiti od prioriteta intervencije?

**Veze sa drugim storyjima:**  
Povezano sa pregledom otvorenih intervencija (US-07), pregledom statusa intervencija (US-13), SLA praćenjem (US-41) i SLA eskalacijama (US-45).

**Acceptance Criteria:**

* **AC1: Detekcija dugog čekanja**
  * **GIVEN** intervencija se nalazi u statusu čekanja
  * **WHEN** prekorači definisani prag vremena
  * **THEN** sistem označava intervenciju kao zahtijeva pažnju

* **AC2: Vizuelno isticanje**
  * **GIVEN** intervencija zahtijeva pažnju
  * **WHEN** dispečer pregleda listu intervencija
  * **THEN** sistem je vizuelno ističe

* **AC3: Prikaz razloga upozorenja**
  * **GIVEN** intervencija je označena
  * **WHEN** dispečer pregleda detalje
  * **THEN** sistem prikazuje razlog i trajanje čekanja

* **AC4: Uklanjanje upozorenja**
  * **GIVEN** intervencija više ne ispunjava uslove za upozorenje
  * **WHEN** status ili dodjela budu promijenjeni
  * **THEN** sistem uklanja oznaku upozorenja

* **AC5: Prikaz na dashboardu**
  * **GIVEN** postoje intervencije koje čekaju predugo
  * **WHEN** dispečer otvori dashboard
  * **THEN** sistem prikazuje broj takvih intervencija

* **AC6: Ograničenje pristupa**
  * **GIVEN** korisnik nema dispečersku ili administratorsku ulogu
  * **WHEN** pokuša pristupiti podacima o intervencijama koje čekaju
  * **THEN** sistem odbija pristup

---

## US-54 — Pregled historije intervencija po korisniku usluge

**Opis:**  
Kao korisnik usluge, želim vidjeti sve svoje prošle intervencije na jednom mjestu sa osnovnim detaljima (datum, tip kvara, status, ocjena), kako bih mogao pratiti historiju servisa svoje imovine.

**Poslovna vrijednost:**  
Ovaj story omogućava korisnicima bolji uvid u prethodne zahtjeve, povećava transparentnost sistema i olakšava praćenje ranijih intervencija.

**Prioritet:**  
*Srednji*

**Pretpostavke i otvorena pitanja:**

**Pretpostavka:** Sistem čuva historijske podatke o završenim intervencijama korisnika.

**Otvoreno pitanje:** Da li je potrebno omogućiti pretragu i filtriranje historijskih intervencija?

**Veze sa drugim storyjima:**  
Povezano sa pregledom vlastitog zahtjeva (US-06), potvrdom i zatvaranjem intervencije (US-25) i ocjenjivanjem intervencije (US-52).

**Acceptance Criteria:**

* **AC1: Prikaz historije intervencija**
  * **GIVEN** korisnik ima prethodne intervencije
  * **WHEN** otvori pregled historije
  * **THEN** sistem prikazuje njegove intervencije

* **AC2: Prikaz osnovnih podataka**
  * **GIVEN** historija intervencija je učitana
  * **WHEN** korisnik pregleda listu
  * **THEN** prikazuju se datum, tip kvara, status i ocjena intervencije ako postoji

* **AC3: Pregled detalja intervencije**
  * **GIVEN** korisnik odabere intervenciju iz historije
  * **WHEN** otvori detalje
  * **THEN** sistem prikazuje detalje intervencije

* **AC4: Ograničenje pristupa**
  * **GIVEN** korisnik pregleda historiju
  * **WHEN** sistem učita podatke
  * **THEN** prikazuju se samo njegove intervencije

* **AC5: Prazno stanje**
  * **GIVEN** korisnik nema prethodnih intervencija
  * **WHEN** otvori historiju intervencija
  * **THEN** sistem prikazuje odgovarajuću poruku

* **AC6: Blokiranje tuđe historije**
  * **GIVEN** korisnik pokuša pristupiti historiji drugog korisnika
  * **WHEN** sistem provjeri ovlaštenje
  * **THEN** sistem odbija pristup
