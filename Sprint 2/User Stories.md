# Sprint backlog

## Sprint 2

### **Sprint broj: 2**

### **Sprint cilj:**
Definisati precizan plan rada kroz dekompoziciju zadataka uz pomoć INVEST modela i postavljanje tehničkih standarda (AC,NFR), kako bismo osigurali nesmetan početak razvoja.

### **Ključne stavke koje tim želi završiti:**
  - **Granularni Backlog:** Razbijanje složenih funkcionalnosti na manje, logički zaokružene korisničke priče(user stories). Svaki zadatak mora biti dimenzioniran tako da je njegova implementacija predvidiva i ostvariva u kratkom vremenskom roku.

  - **Provjerljivi kriteriji (AC):** Uspostavljanje jasnih uslova za svaki user story. Ovi kriteriji služe kao objektivna checklista koja garantuje da je zadatak urađen u skladu sa očekivanjima prije same integracije u sistem.

  - **Prioritizacija (MoSCoW):** Identifikacija  ključnih funkcionalnosti za MVP. Fokusiramo resurse na kritične procese, dok sekundarna poboljšanja ostavljamo za kasnije faze razvoja.

  - **Tehnički okvir (NFR):** Definisanje nefunkcionalnih zahtjeva koji osiguravaju stabilnost i sigurnost (npr. optimizovano vrijeme odziva, sigurnosni protokoli za čuvanje podataka i validacija korisničkih sesija).

### **Rizici i zavisnosti:**

  - **Rizik neadekvatne dekompozicije story-a:** Ukoliko zadaci ostanu preširoki (Epici), postoji realna opasnost od zastoja. Zastoji se sprečavaju primjenom INVEST modela, koji nam garantuje da je svaki story dovoljno precizan i nezavisan za nesmetan rad.

  - **Tehnička barijera:** Postavljeni sigurnosni i performansni standardi mogu zahtijevati tehnologije koje tim tek treba u potpunosti usvojiti. Planiramo ranu fazu istraživanja kako bismo premostili ove prepreke prije početka kodiranja.

  - **Arhitekturalna usklađenost:** Uspjeh razvoja zavisi od ranog definisanja šeme baze podataka i API ugovora. Sinhronizacija tima oko ovih temelja je prioritet broj jedan kako bi se omogućio paralelan rad na različitim modulima.

---

## Hijerarhija zahtjeva
```
THEME (Tema)
└── Sistem za upravljanje servisnim intervencijama
    │
    ├── EPIC: Autentifikacija i pristup sistemu
    │   │
    │   └── FEATURE: Registracija, prijava i odjava korisnika (PBI-001)
    │       │
    │       ├── Story: US-01 Samostalna registracija korisnika usluge
    │       ├── Story: US-02 Prijava korisnika u sistem
    │       └── Story: US-03 Odjava korisnika iz sistema
    │
    ├── EPIC: Upravljanje korisnicima i pravima pristupa
    │   │
    │   ├── FEATURE: Kontrola pristupa prema korisničkoj ulozi (RBAC) (PBI-002)
    │   │   │
    │   │   └── Story: US-04 Kontrola pristupa prema korisničkoj ulozi
    │   │
    │   └── FEATURE: Upravljanje korisničkim nalozima (PBI-003)
    │       │
    │       ├── Story: US-35 Podnošenje zahtjeva za internu ulogu (dispečer/serviser)
    │       ├── Story: US-18 Administrativno kreiranje internog korisničkog naloga
    │       ├── Story: US-19 Pregled postojećih korisničkih naloga
    │       ├── Story: US-20 Promjena korisničke uloge
    │       ├── Story: US-21 Deaktivacija korisničkog naloga
    │       └── Story: US-36 Uređivanje korisničkog naloga
    │
    ├── EPIC: Upravljanje zahtjevima za servisne intervencije
    │   │
    │   ├── FEATURE: Kreiranje zahtjeva za servisnu intervenciju (PBI-004)
    │   │   │
    │   │   ├── Story: US-05 Prijava zahtjeva za servisnu intervenciju
    │   │   ├── Story: US-34 Aktivacija Premium usluge
    │   │   └── Story: US-33 Zahtjev za Premium (Hitnom) uslugom
    │   │
    │   ├── FEATURE: Pregled detalja vlastitog zahtjeva (PBI-005)
    │   │   │
    │   │   └── Story: US-06 Pregled vlastitog zahtjeva
    │   │
    │   └── FEATURE: Izmjena i otkazivanje vlastitog zahtjeva (PBI-006)
    │       │
    │       ├── Story: US-26 Izmjena vlastitog zahtjeva
    │       └── Story: US-27 Otkazivanje vlastitog zahtjeva
    │
    ├── EPIC: Operativni pregled intervencija od strane dispečera
    │   │
    │   ├── FEATURE: Pregled liste aktivnih i otvorenih intervencija (PBI-007)
    │   │   │
    │   │   ├── Story: US-07 Pregled otvorenih intervencija
    │   │   └── Story: US-13 Pregled statusa intervencija od strane dispečera
    │   │
    │   ├── FEATURE: Pregled detalja pojedinačne intervencije za dispečera (PBI-008)
    │   │   │
    │   │   └── Story: US-08 Pregled detalja pojedinačne intervencije
    │   │
    │   ├── FEATURE: Pregled operativnog statusa na kontrolnoj tabli (PBI-009)
    │   │   │
    │   │   ├── Story: US-31 Pregled sažetog operativnog statusa intervencija
    │   │   ├── Story: US-41 SLA praćenje
    │   │   ├── Story: US-45 SLA eskalacije
    │   │   └── Story: US-42 Izvještaj odziva servisera
    │   │
    │   └── FEATURE: Određivanje prioriteta intervencije (PBI-010)
    │       │
    │       └── Story: US-12 Određivanje prioriteta intervencije
    │
    ├── EPIC: Planiranje i dodjela intervencija
    │   │
    │   ├── FEATURE: Planiranje izlazaka na teren (PBI-011)
    │   │   │
    │   │   └── Story: US-11 Planiranje intervencije
    │   │
    │   ├── FEATURE: Dodjela intervencije izvršiocu ili timu (PBI-012)
    │   │   │
    │   │   ├── Story: US-09 Dodjela intervencije odgovornom serviseru
    │   │   └── Story: US-10 Dodjela intervencije timu servisera
    │   │
    │   └── FEATURE: Preraspodjela i ponovna dodjela intervencije (PBI-013)
    │       │
    │       ├── Story: US-28 Promjena izvršioca intervencije
    │       ├── Story: US-29 Vraćanje zadatka na ponovnu dodjelu
    │       ├── Story: US-40 Označavanje intervencije kao nije riješena
    │       └── Story: US-47 Praćenje intervencije nije riješene iz prve
    │
    ├── EPIC: Izvršenje intervencija od strane servisera
    │   │
    │   ├── FEATURE: Pregled dodijeljenih zadataka (PBI-014)
    │   │   │
    │   │   ├── Story: US-15 Pregled dodijeljenih intervencija
    │   │   └── Story: US-16 Pregled detalja zadatka na terenu
    │   │
    │   ├── FEATURE: Prihvatanje ili odbijanje dodijeljenog zadatka (PBI-015)
    │   │   │
    │   │   ├── Story: US-22 Prihvatanje dodijeljenog zadatka
    │   │   └── Story: US-23 Odbijanje dodijeljenog zadatka
    │   │
    │   ├── FEATURE: Ažuriranje statusa intervencije od strane servisera (PBI-016)
    │   │   │
    │   │   └── Story: US-14 Ažuriranje statusa intervencije od strane servisera
    │   │
    │   └── FEATURE: Evidentiranje izvršenog rada (PBI-017)
    │       │
    │       ├── Story: US-17 Evidentiranje izvršenog rada
    │       ├── Story: US-38 Obavezno trajanje pri evidentiranju rada
    │       ├── Story: US-46 Evidencija materijala i dijelova
    │       └── Story: US-43 Upload fotografije intervencije
    │
    ├── EPIC: Zatvaranje i kontrola intervencije
    │   │
    │   ├── FEATURE: Pregled evidentiranog izvršenog rada (PBI-018)
    │   │   │
    │   │   └── Story: US-24 Pregled evidentiranog izvršenog rada
    │   │
    │   └── FEATURE: Potvrda i zatvaranje intervencije (PBI-019)
    │       │
    │       └── Story: US-25 Potvrda i zatvaranje intervencije
    │
    └── EPIC: Komunikacija, notifikacije i historija aktivnosti
        │
        ├── FEATURE: Napomene na intervenciji (PBI-020)
        │   │
        │   └── Story: US-30 Razmjena napomena na intervenciji
        │
        ├── FEATURE: Historija aktivnosti intervencije (PBI-021)
        │   │
        │   ├── Story: US-32 Pregled historije aktivnosti intervencije
        │   ├── Story: US-39 Audit trail sa starim i novim vrijednostima
        │   └── Story: US-44 Tabelarni pregled historije aktivnosti
        │
        └── FEATURE: Sistemske notifikacije (PBI-022)
            │
            └── Story: US-37 Primanje relevantnih sistemskih obavještenja
```

# User Stories i Acceptance Criteria

Sažeti pregled user story-a u okviru MVP-a: 

| ID | Naziv | Kratak opis | Poslovna vrijednost | Prioritet |
|:---|:------|:------------|:--------------------|:---------:|
| US-01 | Samostalna registracija korisnika usluge | Kao korisnik usluge, želim samostalno kreirati korisnički nalog, kako bih mogao prijaviti kvar i pratiti obradu svog zahtjeva. | - pristup sistemu<br>- početak korištenja<br>- osnova za ostale funkcionalnosti | Visok |
| US-02 | Prijava korisnika u sistem | Kao registrovani korisnik, želim se prijaviti u sistem, kako bih mogao pristupiti funkcionalnostima koje su mi dostupne. | - pristup funkcionalnostima<br>- pristup podacima<br>- rad prema ulozi | Visok |
| US-03 | Odjava korisnika iz sistema | Kao prijavljeni korisnik sistema, želim se sigurno odjaviti sa svog naloga, kako bih spriječio neovlašten pristup svom korisničkom računu nakon završetka rada. | - sigurnost naloga<br>- zaštita podataka<br>- zatvaranje sesije | Srednji |
| US-04 | Kontrola pristupa prema korisničkoj ulozi | Kao administrator, želim da sistem ograniči pristup podacima i funkcionalnostima prema korisničkoj ulozi, kako bi svaki korisnik mogao koristiti samo ono što je relevantno za njegovu odgovornost. | - sigurnost sistema<br>- kontrola pristupa<br>- jasne odgovornosti | Visok |
| US-05 | Prijava zahtjeva za servisnu intervenciju | Kao korisnik usluge, želim prijaviti kvar ili zahtjev za servisnu intervenciju, kako bi obrada mog zahtjeva mogla biti evidentirana i pokrenuta kroz sistem. | - evidentiranje problema<br>- početak procesa<br>- osnova za obradu | Visok |
| US-06 | Pregled vlastitog zahtjeva | Kao korisnik usluge, želim pregledati osnovne informacije i status svog zahtjeva, kako bih imao jasan uvid u ono što je prijavljeno i u fazu obrade u kojoj se zahtjev nalazi. | - preglednost zahtjeva<br>- transparentnost procesa<br>- veće povjerenje korisnika | Srednji |
| US-07 | Pregled otvorenih intervencija | Kao dispečer, želim pregledati sve otvorene i aktivne intervencije, kako bih imao jasan uvid u zahtjeve koji čekaju obradu i u tok rada. | - centralizovan pregled<br>- bolja organizacija rada<br>- pravovremeno reagovanje | Visok |
| US-08 | Pregled detalja pojedinačne intervencije | Kao dispečer, želim pregledati detalje pojedinačne intervencije, kako bih imao potpune informacije o njenom trenutnom stanju, toku i zaduženjima. | - potpune informacije<br>- lakše odluke<br>- bolja koordinacija | Visok |
| US-09 | Dodjela intervencije odgovornom serviseru | Kao dispečer, želim dodijeliti intervenciju odgovornom serviseru, kako bi bilo jasno ko preuzima izvršenje zadatka. | - jasna odgovornost<br>- nastavak procesa<br>- lakše praćenje izvršenja | Visok |
| US-10 | Dodjela intervencije timu servisera | Kao dispečer, želim dodijeliti intervenciju timu servisera, kako bi se složeniji zadaci mogli izvršavati timski i organizovano. | - timski rad<br>- raspodjela resursa<br>- podrška složenim zadacima | Srednji |
| US-11 | Planiranje intervencije | Kao dispečer, želim planirati intervenciju unaprijed, kako bih mogao organizovati termin, resurse i izvršenje zadatka. | - koordinacija rada<br>- manje kašnjenja<br>- manje konflikata termina | Visok |
| US-12 | Određivanje prioriteta intervencije | Kao dispečer, želim odrediti prioritet intervencije, kako bi zahtjevi bili obrađeni i raspoređeni prema njihovoj hitnosti i važnosti. | - rad po hitnosti<br>- bolja raspodjela resursa<br>- efikasniji operativni tok | Visok |
| US-13 | Pregled statusa intervencija od strane dispečera | Kao dispečer, želim pregledati statuse intervencija, kako bih mogao pratiti tok rada i imati jasan uvid u trenutnu fazu obrade svakog zahtjeva. | - nadzor procesa<br>- uočavanje zastoja<br>- bolja kontrola rada | Visok |
| US-14 | Ažuriranje statusa intervencije od strane servisera | Kao serviser, želim po potrebi ažurirati status intervencije na kojoj radim, kako bi sistem odražavao trenutno stanje rada na terenu. | - tačno stanje rada<br>- manje dodatnih provjera<br>- bolja koordinacija | Visok |
| US-15 | Pregled dodijeljenih intervencija | Kao serviser, želim pregledati intervencije koje su mi dodijeljene, kako bih znao koje zadatke trebam izvršiti i kojim redoslijedom ih trebam obrađivati. | - pregled zadataka<br>- lakša organizacija rada<br>- manje propuštenih intervencija | Visok |
| US-16 | Pregled detalja zadatka na terenu | Kao serviser, želim pregledati detalje zadatka na terenu, kako bih imao sve potrebne informacije za njegovo pravilno i efikasno izvršavanje. | - manje grešaka<br>- bolja priprema<br>- efikasnije izvršenje | Visok |
| US-17 | Evidentiranje izvršenog rada | Kao serviser, želim evidentirati izvršeni rad, kako bi sistem sadržavao tačan zapis o aktivnostima obavljenim tokom intervencije. | - evidencija rada<br>- transparentnost procesa<br>- pregled izvršenja | Srednji |
| US-35 | Podnosenje zahtjeva za internu ulogu (dispecer/serviser) | Kao kandidat za internu ulogu, zelim poslati aplikaciju sa trazenim podacima, kako bi administrator mogao pregledati zahtjev i odobriti pristup sistemu. | - standardizovan onboarding tok<br>- kontrolisana aktivacija internih naloga<br>- bolja sljedivost zahtjeva | Visok |
| US-18 | Administrativno kreiranje internog korisničkog naloga | Kao administrator, želim kreirati korisnički nalog za internog korisnika sistema, kako bih mu omogućio pristup sistemu u skladu sa njegovom ulogom. | - uključivanje internih korisnika<br>- dodjela odgovornosti<br>- omogućavanje pristupa | Visok |
| US-19 | Pregled postojećih korisničkih naloga | Kao administrator, želim pregledati postojeće korisničke naloge, kako bih imao uvid u korisnike sistema i mogao njima upravljati. | - pregled korisnika<br>- uvid u uloge<br>- osnova za upravljanje nalozima | Srednji |
| US-20 | Promjena korisničke uloge | Kao administrator, želim promijeniti korisničku ulogu, kako bi korisnik imao pristup funkcionalnostima koje odgovaraju njegovoj novoj odgovornosti u sistemu. | - usklađivanje pristupa<br>- sigurnost sistema<br>- organizacija rada | Srednji |
| US-21 | Deaktivacija korisničkog naloga | Kao administrator, želim deaktivirati korisnički nalog, kako bih spriječio dalji pristup korisniku koji više ne treba koristiti sistem. | - onemogućavanje pristupa<br>- sigurnost sistema<br>- očuvanje evidencije | Srednji |
| US-22 | Prihvatanje dodijeljenog zadatka | Kao serviser, želim prihvatiti dodijeljeni zadatak, kako bih potvrdio da preuzimam odgovornost za njegovu realizaciju. | - potvrda preuzimanja<br>- jasna odgovornost<br>- nastavak toka rada | Visok |
| US-23 | Odbijanje dodijeljenog zadatka | Kao serviser, želim odbiti dodijeljeni zadatak, kako bi dispečer mogao pravovremeno reagovati i dodijeliti ga drugom izvršiocu. | - izbjegavanje zastoja<br>- pravovremena reakcija<br>- nova dodjela | Srednji |
| US-24 | Pregled evidentiranog izvršenog rada | Kao dispečer, želim pregledati evidentirani izvršeni rad, kako bih imao uvid u ono što je serviser uradio prije zatvaranja intervencije. | - kontrola izvršenja<br>- provjera rada<br>- osnova za zatvaranje | Visok |
| US-25 | Potvrda i zatvaranje intervencije | Kao dispečer, želim potvrditi i zatvoriti završenu intervenciju, kako bi proces bio formalno okončan u sistemu. | - formalni završetak procesa<br>- kontrolisan kraj intervencije<br>- uredna evidencija | Visok |
| US-26 | Izmjena vlastitog zahtjeva | Kao korisnik usluge, želim izmijeniti svoj zahtjev dok još nije preuzet u obradu, kako bih mogao ispraviti pogrešno unesene ili nepotpune podatke. | - ispravka grešaka<br>- tačniji podaci<br>- manje pogrešnih intervencija | Srednji |
| US-27 | Otkazivanje vlastitog zahtjeva | Kao korisnik usluge, želim otkazati svoj zahtjev dok još nije u aktivnoj obradi, kako bih mogao povući greškom prijavljen ili više nepotreban zahtjev. | - manje operativnog šuma<br>- čišći backlog zahtjeva<br>- manje nepotrebnog rada | Srednji |
| US-28 | Promjena izvršioca intervencije | Kao dispečer, želim promijeniti izvršioca intervencije, kako bi zadatak mogao biti dodijeljen drugom serviseru kada prvobitno dodijeljeni izvršilac ne može preuzeti ili završiti rad. | - fleksibilnost rada<br>- kontinuitet procesa<br>- manji rizik od zastoja | Srednji |
| US-29 | Vraćanje zadatka na ponovnu dodjelu | Kao serviser, želim vratiti zadatak na ponovnu dodjelu, kako bi dispečer mogao organizovati dalje izvršenje kada zadatak nije moguće završiti u postojećim okolnostima. | - vraćanje u operativni tok<br>- sprječavanje zastoja<br>- nova organizacija rada | Srednji |
| US-30 | Razmjena napomena na intervenciji | Kao dispečer ili serviser, želim dodati kratku napomenu na konkretnu intervenciju, kako bi sve važne operativne informacije bile dostupne na jednom mjestu svim učesnicima u procesu. | - interna komunikacija<br>- važne informacije na jednom mjestu<br>- manje oslanjanja na vanjske kanale | Srednji |
| US-31 | Pregled sažetog operativnog statusa intervencija | Kao dispečer, želim na početnom ekranu vidjeti sažet operativni status intervencija, kako bih odmah imao pregled trenutnog obima posla i stanja intervencija po ključnim fazama obrade. | - brz pregled stanja sistema<br>- lakše uočavanje zastoja<br>- efikasnije operativno odlučivanje | Srednji |
| US-32 | Pregled historije aktivnosti intervencije | Kao dispečer, želim vidjeti listu svih prethodnih promjena i aktivnosti na zahtjevu, kako bih imao jasan uvid u hronologiju obrade od trenutka prijave do trenutnog statusa. | - transparentnost procesa<br>- praćenje toka rada<br>- audit trag | Srednji | 
| US-34 | Aktivacija Premium usluge | Kao korisnik usluge, želim aktivirati Premium paket kroz sistem, kako bih mogao koristiti opciju premium zahtjeva i dobiti prioritetnu obradu intervencija. | - jasan tok aktivacije<br>- kontrola prava na premium<br>- pouzdana naplata | Visok |
| US-33 |	Zahtjev za Premium (Hitnom) uslugom	| Kao korisnik usluge, želim odabrati "Premium/Hitno" opciju prilikom prijave kvara, kako bih osigurao prioritetnu obradu zahtjeva bez obzira na vrstu kvara.	|- prioritetna obrada <br> - veće zadovoljstvo korisnika <br> - dodatni prihod za servis | Visok |
| US-38 | Obavezno trajanje pri evidentiranju rada | Kao serviser, želim biti obavezan unijeti trajanje izvršenog rada, kako bi sistem imao tačne podatke o utrošenom vremenu. | - tačna evidencija vremena<br>- osnova za fakturisanje<br>- analiza efikasnosti | Visok |
| US-39 | Audit trail sa starim i novim vrijednostima | Kao dispečer, želim vidjeti stare i nove vrijednosti u historiji aktivnosti, kako bih mogao pratiti tačne promjene na intervenciji. | - transparentnost promjena<br>- praćenje životnog ciklusa<br>- osnova za kontrolu | Srednji |
| US-40 | Označavanje intervencije kao nije riješena | Kao serviser, želim označiti intervenciju kao nije riješena, kako bi dispečer bio obaviješten i mogao poduzeti daljnje korake. | - sprječavanje zastoja<br>- pravovremena reakcija dispečera<br>- nastavak toka | Srednji |
| US-41 | SLA praćenje | Kao dispečer, želim da sistem automatski prati SLA rokove, kako bih mogao reagovati na kašnjenja i osigurati poštivanje dogovorenih nivoa usluge. | - poštivanje rokova<br>- proaktivno upravljanje<br>- bolja usluga korisnicima | Srednji |
| US-42 | Izvještaj odziva servisera | Kao dispečer, želim pregledati izvještaj o odzivnim vremenima servisera, kako bih mogao pratiti performanse tima i identifikovati probleme u efikasnosti. | - praćenje performansi tima<br>- identifikacija problema<br>- osnova za odluke | Nizak |
| US-43 | Upload fotografije intervencije | Kao serviser, želim uploadovati fotografiju vezanu za intervenciju, kako bih dokumentovao stanje na terenu. | - vizuelna dokumentacija<br>- dokaz obavljenog rada<br>- bolja kontrola kvaliteta | Nizak |
| US-44 | Tabelarni pregled historije aktivnosti | Kao dispečer, želim pregledati historiju aktivnosti u tabelarnom obliku, kako bih brzo analizirao promjene na intervenciji. | - transparentnost<br>- audit trag<br>- brza analiza | Srednji |
| US-45 | SLA eskalacije | Kao dispečer, želim da sistem eskalira prekoračene SLA rokove, kako bih pravovremeno reagovao na kašnjenja. | - proaktivna reakcija<br>- poštivanje SLA | Srednji |
| US-46 | Evidencija materijala i dijelova | Kao serviser, želim evidentirati utrošeni materijal i dijelove strukturirano, kako bi evidencija bila tačna za kontrolu i izvještaje. | - tačna evidencija<br>- kontrola troškova | Srednji |
| US-47 | Praćenje intervencije nije riješene iz prve | Kao dispečer, želim vidjeti da intervencija nije riješena iz prvog pokušaja, kako bih pratio kvalitet rješavanja. | - kvalitet usluge<br>- ponovna dodjela | Srednji |

U sljedećoj tabeli je prikazana povezanost konkretnog User Story-a sa itemima iz Product Backloga:
| User Story | Naziv user storyja                                    | Feature / PBI                                                       | Epic                                                    |
| ---------- | ----------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------- |
| US-01      | Samostalna registracija korisnika usluge              | **PBI-001 – Registracija, prijava i odjava korisnika**              | **Autentifikacija i pristup sistemu**                   |
| US-02      | Prijava korisnika u sistem                            | **PBI-001 – Registracija, prijava i odjava korisnika**              | **Autentifikacija i pristup sistemu**                   |
| US-03      | Odjava korisnika iz sistema                           | **PBI-001 – Registracija, prijava i odjava korisnika**              | **Autentifikacija i pristup sistemu**                   |
| US-04      | Kontrola pristupa prema korisničkoj ulozi             | **PBI-002 – Kontrola pristupa prema korisničkoj ulozi (RBAC)**      | **Upravljanje korisnicima i pravima pristupa**          |
| US-05      | Prijava zahtjeva za servisnu intervenciju             | **PBI-004 – Kreiranje zahtjeva za servisnu intervenciju**           | **Upravljanje zahtjevima za servisne intervencije**     |
| US-06      | Pregled vlastitog zahtjeva                            | **PBI-005 – Pregled detalja vlastitog zahtjeva**                    | **Upravljanje zahtjevima za servisne intervencije**     |
| US-07      | Pregled otvorenih intervencija                        | **PBI-007 – Pregled liste aktivnih i otvorenih intervencija**       | **Operativni pregled intervencija od strane dispečera** |
| US-08      | Pregled detalja pojedinačne intervencije              | **PBI-008 – Pregled detalja pojedinačne intervencije za dispečera** | **Operativni pregled intervencija od strane dispečera** |
| US-09      | Dodjela intervencije odgovornom serviseru             | **PBI-012 – Dodjela intervencije izvršiocu ili timu**               | **Planiranje i dodjela intervencija**                   |
| US-10      | Dodjela intervencije timu servisera                   | **PBI-012 – Dodjela intervencije izvršiocu ili timu**               | **Planiranje i dodjela intervencija**                   |
| US-11      | Planiranje intervencije                               | **PBI-011 – Planiranje izlazaka na teren**                          | **Planiranje i dodjela intervencija**                   |
| US-12      | Određivanje prioriteta intervencije                   | **PBI-010 – Određivanje prioriteta intervencije**                   | **Operativni pregled intervencija od strane dispečera** |
| US-13      | Pregled statusa intervencija od strane dispečera      | **PBI-007 – Pregled liste aktivnih i otvorenih intervencija**       | **Operativni pregled intervencija od strane dispečera** |
| US-14      | Ažuriranje statusa intervencije od strane servisera   | **PBI-016 – Ažuriranje statusa intervencije od strane servisera**   | **Izvršenje intervencija od strane servisera**          |
| US-15      | Pregled dodijeljenih intervencija                     | **PBI-014 – Pregled dodijeljenih zadataka**                         | **Izvršenje intervencija od strane servisera**          |
| US-16      | Pregled detalja zadatka na terenu                     | **PBI-014 – Pregled dodijeljenih zadataka**                         | **Izvršenje intervencija od strane servisera**          |
| US-17      | Evidentiranje izvršenog rada                          | **PBI-017 – Evidentiranje izvršenog rada**                          | **Izvršenje intervencija od strane servisera**          |
| US-35      | Podnosenje zahtjeva za internu ulogu (dispecer/serviser) | **PBI-003 – Upravljanje korisničkim nalozima**                      | **Upravljanje korisnicima i pravima pristupa**          |
| US-18      | Administrativno kreiranje internog korisničkog naloga | **PBI-003 – Upravljanje korisničkim nalozima**                      | **Upravljanje korisnicima i pravima pristupa**          |
| US-19      | Pregled postojećih korisničkih naloga                 | **PBI-003 – Upravljanje korisničkim nalozima**                      | **Upravljanje korisnicima i pravima pristupa**          |
| US-20      | Promjena korisničke uloge                             | **PBI-003 – Upravljanje korisničkim nalozima**                      | **Upravljanje korisnicima i pravima pristupa**          |
| US-21      | Deaktivacija korisničkog naloga                       | **PBI-003 – Upravljanje korisničkim nalozima**                      | **Upravljanje korisnicima i pravima pristupa**          |
| US-22      | Prihvatanje dodijeljenog zadatka                      | **PBI-015 – Prihvatanje ili odbijanje dodijeljenog zadatka**        | **Izvršenje intervencija od strane servisera**          |
| US-23      | Odbijanje dodijeljenog zadatka                        | **PBI-015 – Prihvatanje ili odbijanje dodijeljenog zadatka**        | **Izvršenje intervencija od strane servisera**          |
| US-24      | Pregled evidentiranog izvršenog rada                  | **PBI-018 – Pregled evidentiranog izvršenog rada**                  | **Zatvaranje i kontrola intervencije**                  |
| US-25      | Potvrda i zatvaranje intervencije                     | **PBI-019 – Potvrda i zatvaranje intervencije**                     | **Zatvaranje i kontrola intervencije**                  |
| US-26      | Izmjena vlastitog zahtjeva                            | **PBI-006 – Izmjena i otkazivanje vlastitog zahtjeva**              | **Upravljanje zahtjevima za servisne intervencije**     |
| US-27      | Otkazivanje vlastitog zahtjeva                        | **PBI-006 – Izmjena i otkazivanje vlastitog zahtjeva**              | **Upravljanje zahtjevima za servisne intervencije**     |
| US-28      | Promjena izvršioca intervencije                       | **PBI-013 – Preraspodjela i ponovna dodjela intervencije**          | **Planiranje i dodjela intervencija**                   |
| US-29      | Vraćanje zadatka na ponovnu dodjelu                   | **PBI-013 – Preraspodjela i ponovna dodjela intervencije**          | **Planiranje i dodjela intervencija**                   |
| US-30      | Razmjena napomena na intervenciji                     | **PBI-020 – Napomene na intervenciji**                              | **Komunikacija i historija aktivnosti**                 |
| US-31      | Pregled sažetog operativnog statusa intervencija      | **PBI-009 – Pregled operativnog statusa na kontrolnoj tabli**       | **Operativni pregled intervencija od strane dispečera** |
| US-32      | Pregled historije aktivnosti intervencije             | **PBI-021 – Historija aktivnosti intervencije**                     | **Komunikacija i historija aktivnosti**                 |
| US-34      | Aktivacija Premium usluge                             | **PBI-004 – Kreiranje zahtjeva za servisnu intervenciju**           | **Upravljanje zahtjevima za servisne intervencije**     |
| US-33      | Zahtjev za Premium (Hitnom) uslugom                   | **PBI-004 – Kreiranje zahtjeva za servisnu intervenciju**           | **Upravljanje zahtjevima za servisne intervencije**     |
| US-38      | Obavezno trajanje pri evidentiranju rada              | **PBI-017 – Evidentiranje izvršenog rada**                          | **Izvršenje intervencija od strane servisera**          |
| US-39      | Audit trail sa starim i novim vrijednostima           | **PBI-021 – Historija aktivnosti intervencije**                     | **Komunikacija, notifikacije i historija aktivnosti**   |
| US-40      | Označavanje intervencije kao nije riješena            | **PBI-013 – Preraspodjela i ponovna dodjela intervencije**          | **Planiranje i dodjela intervencija**                   |
| US-41      | SLA praćenje                                          | **PBI-009 – Pregled operativnog statusa na kontrolnoj tabli**       | **Operativni pregled intervencija od strane dispečera** |
| US-42      | Izvještaj odziva servisera                            | **PBI-009 – Pregled operativnog statusa na kontrolnoj tabli**       | **Operativni pregled intervencija od strane dispečera** |
| US-43      | Upload fotografije intervencije                       | **PBI-017 – Evidentiranje izvršenog rada**                          | **Izvršenje intervencija od strane servisera**          |
| US-44      | Tabelarni pregled historije aktivnosti                 | **PBI-021 – Historija aktivnosti intervencije**                     | **Komunikacija, notifikacije i historija aktivnosti** |
| US-45      | SLA eskalacije                                          | **PBI-009 – Pregled operativnog statusa na kontrolnoj tabli**       | **Operativni pregled intervencija od strane dispečera** |
| US-46      | Evidencija materijala i dijelova                        | **PBI-017 – Evidentiranje izvršenog rada**                          | **Izvršenje intervencija od strane servisera**          |
| US-47      | Praćenje intervencije nije riješene iz prve             | **PBI-013 – Preraspodjela i ponovna dodjela intervencije**          | **Planiranje i dodjela intervencija**                   |
---

## US-01 — Samostalna registracija korisnika usluge

**Opis:**  
Kao korisnik usluge, želim samostalno kreirati korisnički nalog, kako bih mogao pristupiti sistemu, prijaviti kvar i pratiti obradu svog zahtjeva.

**Poslovna vrijednost:**  
Ovaj story je važan jer omogućava korisniku usluge samostalan ulazak u sistem i predstavlja osnovu za korištenje svih funkcionalnosti namijenjenih klijentu, bez potrebe za posredpvanjem administratora.

**Prioritet:**  
*Visok*

**Pretpostavke i otvorena pitanja:**  

**Pretpostavka:** Korisnik usluge može samostalno pristupiti registracionoj formi putem javno dostupnog dijela sistema.  

**Otvorena pitanja:** Da li sistem pri registraciji automatski dodjeljuje korisniku ulogu klijenta ili je potrebna dodatna potvrda od strane sistema ili administratora?

**Veze sa drugim storyjima:**  
Povezano sa storyjem za prijavu korisnika u sistem (US-02) , prijavu zahtjeva za servisnu intervenciju (US-05) i pregled vlastitog zahtjeva (US-06).

**Acceptance Criteria:**

- **AC1: Uspješna registracija**  
  - **GIVEN** korisnik unese sve obavezne podatke u ispravnom formatu
  - **WHEN** korisnik potvrdi registraciju  
  - **THEN** sistem kreira korisnički nalog i evidentira korisnika u sistemu

- **AC2: Nepotpuni podaci**  
  - **GIVEN** korisnik nije unio sve obavezne podatke  
  - **WHEN** korisnik pokuša potvrditi registraciju  
  - **THEN** sistem ne kreira korisnički nalog i prikazuje poruku o grešci

- **AC3: Neispravan format**  
  - **GIVEN** korisnik unese podatke u neispravnom formatu   
  - **WHEN** korisnik pokuša potvrditi registraciju  
  - **THEN** sistem ne kreira korisnički nalog i prikazuje validacijsku poruku o grešci

- **AC4: Postojeći korisnik**  
  - **GIVEN** korisnik sa istim jedinstvenim identifikatorima već postoji u sistemu  
  - **WHEN** korisnik pokuša izvršiti registraciju  
  - **THEN** sistem ne kreira  novi kroisnički nalog i prikazuje poruku o grešci

- **AC5: Lozinka ne zadovoljava pravila**  
  - **GIVEN** unesena lozinka ne ispunjava definisana pravila sistema
  - **WHEN** korisnik pokuša potvrditi registraciju  
  - **THEN** sistem ne kreira korisnički nalog i prikazuje poruku o grešci

- **AC6: Dodjela osnovne korisničke uloge**  
  - **GIVEN** registracija uspješno završena
  - **WHEN** sistem kreira novi korisnički nalog
  - **THEN** korisniku se dodjeljuje osnovna uloga predviđena za korisnika usluge ili senalog označava na dalju obradu, u skladu sa definisanim pravilima sistema
    
- **AC7: Kreiranje naloga koji čeka potvrdu email adrese**  
  - **GIVEN** korisnik uspješno završi registraciju
  - **WHEN** sistem kreira novi korisnički nalog
  - **THEN** korisnički nalog dobija status `pending_email_verification` dok email adresa ne bude potvrđena

- **AC8: Ograničen pristup prije potvrde email adrese**  
  - **GIVEN** korisnik nije potvrdio email adresu
  - **WHEN** pokuša pristupiti funkcionalnostima za prijavu servisnog zahtjeva
  - **THEN** sistem ne dozvoljava pristup i prikazuje poruku da je potrebno potvrditi email adresu

- **AC9: Aktivacija naloga nakon potvrde email adrese**  
  - **GIVEN** korisnik klikne na validan link za potvrdu email adrese
  - **WHEN** sistem uspješno potvrdi email adresu
  - **THEN** status korisničkog naloga se mijenja u `active` i korisnik može koristiti funkcionalnosti dostupne korisniku usluge

- **AC10: Ponovno slanje emaila za potvrdu**  
  - **GIVEN** korisnik je kreirao nalog, ali email adresa još nije potvrđena
  - **WHEN** korisnik odabere opciju za ponovno slanje emaila za potvrdu
  - **THEN** sistem šalje novi email za potvrdu na registrovanu email adresu i prikazuje poruku da je email ponovo poslan

---

## US-02 — Prijava korisnika u sistem

**Opis:**  
Kao registrovani korisnik, želim se prijaviti u sistem, kako bih mogao pristupiti funkcionalnostima i podacima koji su mi dostupni u skladu sa mojom korisničkom ulogom.

**Poslovna vrijednost:**  
Ovaj story je važan jer omogućava registrovanim korisnicima pristup sistemu i predstavlja osnovu za korištenje svih ostalih funkcionalnosti, uključujući prijavu zahtjeva, pregled vlastitih podataka i rad u skladu sa dodijeljenom ulogom.

**Prioritet:**  
*Visok*

**Pretpostavke i otvorena pitanja:**  

**Pretpostavka:** Pretpostavlja se da korisnik već ima kreiran i aktivan korisnički nalog u sistemu.

**Otvorena pitanja:** Da li se korisnik nakon uspješne prijave automatski preusmjerava na početni ekran prilagođen njegovoj ulozi?


**Veze sa drugim storyjima:**  
Zavisi od storyja za samostalnu registraciju korisnika (US-01) i povezan je sa svim storyjima koji zahtijevaju autentifikovan pristup sistemu (US-02, US-03). 

**Acceptance Criteria:**

- **AC1: Uspješna prijava**  
  - **GIVEN** korisnik unese tačne podatke za prijavu
  - **WHEN** korisnik potvrdi prijavu  
  - **THEN** sistem omogućava pristup korisničkom nalogu i prijavljuje korisnika u sistem

- **AC2: Nepotpuni podaci**  
  - **GIVEN** korisnik nije unio sve obavezne podatke za prijavu
  - **WHEN** korisnik pokuša potvrditi prijavu  
  - **THEN** sistem ne dozvoljava prijavu i prikazuje poruku o grešci

- **AC3: Neispravan format podataka**  
  - **GIVEN** korisnik unese podatke u neispravnom formatu
  - **WHEN** korisnik pokuša potvrditi prijavu  
  - **THEN** sistem ne dozvoljava prijavu i prikazuje validacijsku poruku o grešci

- **AC4: Pogrešni podaci za prijavu**  
  - **GIVEN** korisnik unese netačne podatke za prijavu   
  - **WHEN** pokuša potvrditi prijavu  
  - **THEN** sistem ne dozvoljava prijavu i prikazuje odgovarajuću poruku o grešci

- **AC5: Neaktivan ili nepostojeći korisnički nalog**  
  - **GIVEN** korisnički nalog ne postoji ili je označen kao neaktivan
  - **WHEN** korisnik pokuša izvršiti prijavu  
  - **THEN** sistem ne dozvoljava pristup i prikazuje odgovarajuću poruku o grešci
 
- **AC6: Prikaz funckionalnosti prema korisničkoj ulozi**  
  - **GIVEN** korisnik je uspješno prijavljen u sistem
  - **WHEN** sistem učita korisnički interfejs 
  - **THEN** korisniku se prikazuju samo funkcionalnosti i podaci koji odgovaraju njegovoj korisničkoj ulozi

---

## US-03 — Odjava korisnika iz sistema

**Opis:**  
Kao prijavljeni korisnik sistema, želim se sigurno odjaviti sa svog naloga, kako bih spriječio neovlašten pristup svom korisničkom računu i podacima nakon završetka rada.

**Poslovna vrijednost:**  
Ovaj story je važan jer omogućava korisniku siguran završetak rada u sistemu, smanjuje rizik od neovlaštenog pristupa i doprinosi zaštiti korisničkih podataka, posebno kada se sistem koristi na dijeljenim ili javnim uređajima.

**Prioritet:**  
*Srednji*

**Pretpostavke i otvorena pitanja:**  

**Pretpostavka:** Pretpostavlja se da korisnik ima aktivnu sesiju u sistemu i trenutno je prijavljen.

**Otvorena pitanja:** Da li se kroisnik nakon odjave vraća na početni ekran sistema ili direktno na ekran za prijavu?

**Veze sa drugim storyjima:**  
Povezano sa storyjem za prijavu korisnika u sistem (US-02)  i sa svim stoyjima koji zahtijevaju aktivnu korisničku sesiju (US-01, US-02, US-03, US-04).

**Acceptance Criteria:**

- **AC1: Uspješna odjava**  
  - **GIVEN** korisnik je prijavljen u sistem
  - **WHEN** korisnik odabere opciju za odjavu
  - **THEN** sistema prekida aktivnu sesiju i odjavljuje korisnika 

- **AC2: Onemogućen pristup zaštićenim funkcionalnostima nakon odjave**  
  - **GIVEN** korisnik se uspješno odjavio iz sistema  
  - **WHEN** korisnik pokuša pristupiti zaštićenoj stranici ili funkcionalnosti  
  - **THEN** sistem ne dozvoljava pristup i preusmjerava korisnika na ekran za prijavu ili početni ekran.

- **AC3: Završetak rada bez gubitka prethodno sačuvanih podataka**
    - **GIVEN** korisnik se odjavljuje iz sistema  
    - **WHEN** odjava bude izvršena 
    - **THEN** sistem završava korisnički rad bez uticaja na prethodno sačuvane podatke i ranije izvršene akcije

---

## US-04 — Kontrola pristupa prema korisničkoj ulozi

**Opis:**  
Kao administrator, želim da sistem ograniči pristup podacima i funkcionalnostima prema korisničkoj ulozi, kako bi svaki korisnik mogao koristiti samo one opcije koje odgovaraju njegovim odgovornostima u sistemu.

**Poslovna vrijednost:**  
Ovaj story je važan jer omogućava sigurno i pregledno korištenje sistema, smanjuje rizik od neovlaštenih akcija i osigurava da svaki korisnik radi samo u okviru svojih nadležnosti.

**Prioritet:**  
*Visok*

**Pretpostavke i otvorena pitanja:** 

**Pretpostavka:** Pretpostavlja se da su osnovne korisničke uloge sistema unaprijed definisane.

**Otvorena pitanja:** Da li će sistem u ovoj fazi koristiti isključivo fiksno definisane uloge ili se kasnije planira proširivanje modela prava pristupa?

**Veze sa drugim storyjima:**  
Povezano sa storyjima za prijavu korisnika u sistem (US-02), administrativno kreiranje korisničkih naloga (US-18) i promjenu korisničke uloge (US-20).

**Acceptance Criteria:**

- **AC1:  Prikaz funkcionalnosti prema korisničkoj ulozi**  
  - **GIVEN** korisnik uspješno prijavljen u sistem   
  - **WHEN** pristupi aplikaciji   
  - **THEN** sistem mu prikazuje samo funkcionalnosti i podatke koji odgovaraju njegovoj korisničkoj ulozi

- **AC2: Ograničen pristup nedozvoljenim funkcionalnostima**  
  - **GIVEN** korisnik nema ovlaštenje za određenu funkcionalnost   
  - **WHEN** pokuša pristupiti toj funkcionalnosti  
  - **THEN** sistem ne dozvoljava pristup i ne prikazuje nedozvoljeni sadržaj
 
- **AC3: Ograničen pristup podacima drugih korisnika ili uloga**   
  - **GIVEN** korisnik pokuša pristupiti podacima koji nisu u okviru njegove nadležnosti  
  - **WHEN** otvori zaštićeni prikaz ili zapis  
  - **THEN** sistem ne dozvoljava pristup tim podacima

- **AC4: Promjena pristupa nakon promjene korisničke uloge**  
  - **GIVEN** korisniku je promijenjena uloga u sistemu  
  - **WHEN** korisnik ponovo pristupi funkcionalnostima sistema  
  - **THEN** sistem mu omogućava pristup u skladu sa novom korisničkom ulogom

---

## US-05 — Prijava zahtjeva za servisnu intervenciju

**Opis:**  
Kao korisnik usluge, želim prijaviti kvar ili zahtjev za servisnu intervenciju, kako bi moj problem mogao biti evidentiran u sistemu i mogao biti dalje obrađen.

**Poslovna vrijednost:**  
Ovaj story je važan jer omogućava da se problem koji korisnik prijavljuje formalno evidentira u sistemu i pretvori u konkretan zahtjev koji se može dalje obrađivati, pratiti i rješavati.

**Prioritet:**  
*Visok*

**Pretpostavke i otvorena pitanja:**  

**Pretpostavka:** Pretpostavlja se da registrovani i prijavljeni korisnik usluge ima pristup formi za prijavu zahtjeva.

**Otvorena pitanja:**  Koji je minimalni skup obaveznih podataka potreban da bi zahtjev bio validno prijavljen?

**Veze sa drugim storyjima:**  
Povezano sa storyjima za pregled vlastitog zahtjeva (US-06), pregled otvorenih intervencija (US-07) i dalju obradu servisne intervencije (US-09, US-10, US-11).

**Acceptance Criteria:**

### A. Osnovno kreiranje zahtjeva

- **AC1: Uspješna prijava zahtjeva**  
  - **GIVEN** korisnik je prijavljen u sistem, ima aktivnu ulogu korisnika usluge i unio je sve obavezne podatke za prijavu zahtjeva  
  - **WHEN** korisnik potvrdi slanje zahtjeva  
  - **THEN** sistem kreira novi zahtjev za servisnu intervenciju i evidentira ga u sistemu

- **AC2: Nepotpuni podaci**  
  - **GIVEN** korisnik nije unio jedno ili više obaveznih polja za prijavu zahtjeva  
  - **WHEN** pokuša poslati zahtjev  
  - **THEN** sistem ne kreira zahtjev i prikazuje validacijsku poruku o grešci

- **AC3: Uspješno evidentiranje zahtjeva u bazi**  
  - **GIVEN** zahtjev je uspješno poslan sa validnim podacima  
  - **WHEN** sistem obradi unesene podatke  
  - **THEN** zahtjev se sprema u bazu i postaje dostupan za dalju obradu

- **AC4: Dodjeljivanje početnog statusa zahtjevu**  
  - **GIVEN** zahtjev je uspješno evidentiran u sistemu  
  - **WHEN** sistem kreira novi zahtjev  
  - **THEN** zahtjevu se automatski dodjeljuje početni status `pending_review`

- **AC5: Veza zahtjeva sa korisnikom koji ga je prijavio**  
  - **GIVEN** prijavljeni korisnik je uspješno poslao zahtjev  
  - **WHEN** zahtjev bude kreiran  
  - **THEN** sistem zahtjev povezuje sa korisničkim nalogom koji ga je podnio

- **AC6: Zabrana slanja zahtjeva za neprijavljenog korisnika**  
  - **GIVEN** korisnik nije prijavljen u sistem  
  - **WHEN** pokuša pristupiti formi za prijavu zahtjeva ili poslati zahtjev  
  - **THEN** sistem ne dozvoljava kreiranje zahtjeva i preusmjerava korisnika na prijavu

- **AC7: Zabrana slanja zahtjeva prije potvrde email adrese**  
  - **GIVEN** korisnik ima kreiran nalog, ali email adresa još nije potvrđena  
  - **WHEN** pokuša poslati zahtjev za servisnu intervenciju  
  - **THEN** sistem ne kreira zahtjev i prikazuje poruku da je potrebno potvrditi email adresu

- **AC8: Zabrana slanja zahtjeva korisniku bez odgovarajuće uloge**  
  - **GIVEN** korisnik je prijavljen, ali nema aktivnu ulogu korisnika usluge  
  - **WHEN** pokuša poslati zahtjev za servisnu intervenciju  
  - **THEN** sistem ne dozvoljava kreiranje zahtjeva

---

### B. Kategorija i potkategorija kvara

- **AC9: Obavezan odabir glavne kategorije**  
  - **GIVEN** korisnik se nalazi na koraku “Kategorija”  
  - **WHEN** pokuša nastaviti bez odabrane glavne kategorije  
  - **THEN** sistem ne dozvoljava nastavak i prikazuje poruku da je potrebno odabrati kategoriju

- **AC10: Učitavanje potkategorija prema odabranoj kategoriji**  
  - **GIVEN** korisnik je odabrao glavnu kategoriju kvara  
  - **WHEN** sistem učita podatke za naredni korak wizarda  
  - **THEN** sistem prikazuje samo potkategorije koje pripadaju odabranoj kategoriji

- **AC11: Obavezan odabir potkategorije kada postoji lista potkategorija**  
  - **GIVEN** odabrana kategorija ima definisane potkategorije  
  - **WHEN** korisnik pokuša nastaviti bez odabrane potkategorije  
  - **THEN** sistem ne dozvoljava nastavak i prikazuje poruku da je potrebno odabrati potkategoriju

- **AC12: Nastavak bez potkategorije kada kategorija nema potkategorije**  
  - **GIVEN** odabrana kategorija nema definisane potkategorije  
  - **WHEN** korisnik nastavi na sljedeći korak  
  - **THEN** sistem dozvoljava nastavak bez izbora potkategorije

- **AC13: Evidentiranje izabrane kategorije i potkategorije**  
  - **GIVEN** korisnik je završio korake “Kategorija” i “Potkategorija”  
  - **WHEN** potvrdi slanje zahtjeva  
  - **THEN** sistem evidentira glavnu kategoriju kao obavezan podatak, a potkategoriju kao podatak vezan za odabranu kategoriju

---

### C. Lokacija zahtjeva

- **AC14: Obavezan unos adrese kvara**  
  - **GIVEN** korisnik se nalazi na koraku “Lokacija”  
  - **WHEN** pokuša nastaviti bez unesene adrese kvara  
  - **THEN** sistem ne dozvoljava nastavak i prikazuje poruku da je potrebno unijeti adresu kvara

- **AC15: Validna adresa kvara omogućava nastavak**  
  - **GIVEN** korisnik se nalazi na koraku “Lokacija”  
  - **WHEN** unese validnu adresu kvara  
  - **THEN** sistem evidentira adresu i omogućava nastavak na sljedeći korak

- **AC16: Korištenje trenutne lokacije kao opcionalne pomoći**  
  - **GIVEN** korisnik se nalazi na koraku “Lokacija”  
  - **WHEN** odabere opciju “Koristi moju trenutnu lokaciju”  
  - **THEN** sistem traži dozvolu za pristup trenutnoj lokaciji korisnika

- **AC17: Uspješno određivanje trenutne lokacije**  
  - **GIVEN** korisnik je dozvolio pristup trenutnoj lokaciji  
  - **WHEN** sistem uspješno odredi lokaciju  
  - **THEN** sistem čuva geografske koordinate kao dodatni podatak uz zahtjev

- **AC18: Automatsko popunjavanje adrese na osnovu trenutne lokacije**  
  - **GIVEN** sistem je uspješno odredio trenutnu lokaciju korisnika  
  - **WHEN** sistem može prepoznati adresu na osnovu koordinata  
  - **THEN** sistem automatski popunjava polje adrese i omogućava korisniku da adresu ručno provjeri i izmijeni

- **AC19: Odbijena ili nedostupna trenutna lokacija**  
  - **GIVEN** korisnik pokuša koristiti trenutnu lokaciju  
  - **WHEN** korisnik odbije dozvolu ili lokacija nije dostupna  
  - **THEN** sistem prikazuje poruku da lokacija nije dostupna i omogućava korisniku da adresu unese ručno

- **AC20: Adresa ostaje obavezna nakon korištenja trenutne lokacije**  
  - **GIVEN** korisnik je koristio opciju trenutne lokacije  
  - **WHEN** adresa kvara nije unesena ili automatski popunjena  
  - **THEN** sistem ne dozvoljava nastavak dok korisnik ne unese adresu kvara

- **AC21: Mapa kao opcionalno preciziranje lokacije**  
  - **GIVEN** korisnik želi dodatno precizirati lokaciju kvara  
  - **WHEN** odabere opciju “Preciziraj lokaciju na mapi”  
  - **THEN** sistem prikazuje mapu kao opcionalni alat za označavanje lokacije

- **AC22: Označavanje lokacije na mapi**  
  - **GIVEN** mapa je prikazana korisniku  
  - **WHEN** korisnik klikne na mapu  
  - **THEN** sistem postavlja marker na odabranu lokaciju i čuva koordinate kao dodatni podatak uz zahtjev

- **AC23: Spremanje adrese i koordinata uz zahtjev**  
  - **GIVEN** korisnik je unio adresu i dodatno označio lokaciju putem GPS-a ili mape  
  - **WHEN** sistem kreira zahtjev  
  - **THEN** sistem sprema adresu kao obavezni podatak, a koordinate kao opcionalni dodatni podatak

---

### D. Preferirani termin

- **AC24: Unos preferiranog datuma i vremenskog perioda**  
  - **GIVEN** korisnik se nalazi na koraku “Termin”  
  - **WHEN** odabere datum i vremenski period koji mu odgovara  
  - **THEN** sistem evidentira odabrani datum i vremenski period kao preferirani termin korisnika

- **AC25: Preferirani termin nije potvrđeni termin intervencije**  
  - **GIVEN** korisnik je odabrao preferirani termin  
  - **WHEN** sistem kreira zahtjev za servisnu intervenciju  
  - **THEN** sistem evidentira termin kao korisničku preferencu, bez označavanja intervencije kao zakazane

- **AC26: Opcija bez preferiranog termina**  
  - **GIVEN** korisnik ne zna koji termin mu odgovara  
  - **WHEN** odabere opciju “Nemam preferirani termin — kontaktirajte me radi dogovora”  
  - **THEN** sistem dozvoljava nastavak prijave zahtjeva bez odabira datuma i vremena

- **AC27: Validacija vremenskog perioda**  
  - **GIVEN** korisnik je odabrao preferirani datum i vremenski period  
  - **WHEN** vrijeme početka nije prije vremena završetka  
  - **THEN** sistem ne dozvoljava nastavak i prikazuje poruku o neispravnom vremenskom periodu

- **AC28: Zabrana izbora datuma u prošlosti**  
  - **GIVEN** korisnik se nalazi na koraku “Termin”  
  - **WHEN** pokuša odabrati datum koji je u prošlosti  
  - **THEN** sistem ne dozvoljava izbor tog datuma

- **AC29: Spremanje preferiranog termina uz zahtjev**  
  - **GIVEN** korisnik je odabrao preferirani datum i vremenski period  
  - **WHEN** zahtjev bude kreiran  
  - **THEN** sistem sprema preferirani datum i vremenski period uz zahtjev kao informaciju za dispečera

---

### E. Opis, kontakt i fotografija

- **AC30: Obavezan unos opisa kvara**  
  - **GIVEN** korisnik se nalazi na koraku “Opis kvara”  
  - **WHEN** pokuša nastaviti bez unesenog opisa kvara  
  - **THEN** sistem ne dozvoljava nastavak i prikazuje poruku da je potrebno opisati problem

- **AC31: Validacija dužine opisa kvara**  
  - **GIVEN** korisnik je unio opis kvara koji ne zadovoljava minimalnu dužinu  
  - **WHEN** pokuša nastaviti na sljedeći korak  
  - **THEN** sistem prikazuje poruku da opis mora sadržavati dovoljno informacija za obradu zahtjeva

- **AC32: Obavezan kontakt telefon**  
  - **GIVEN** korisnik se nalazi na koraku “Opis kvara”  
  - **WHEN** pokuša nastaviti bez kontakt telefona  
  - **THEN** sistem ne dozvoljava nastavak i prikazuje poruku da je potrebno unijeti kontakt telefon

- **AC33: Validacija formata kontakt telefona**  
  - **GIVEN** korisnik je unio kontakt telefon u neispravnom formatu  
  - **WHEN** pokuša nastaviti  
  - **THEN** sistem prikazuje poruku da je potrebno unijeti ispravan kontakt telefon

- **AC34: Fotografija kvara je opcionalna**  
  - **GIVEN** korisnik nije dodao fotografiju kvara  
  - **WHEN** popuni obavezni opis i kontakt telefon  
  - **THEN** sistem dozvoljava nastavak prijave zahtjeva

- **AC35: Dodavanje fotografije kvara**  
  - **GIVEN** korisnik se nalazi na koraku “Opis kvara”  
  - **WHEN** doda fotografiju u dozvoljenom formatu i veličini  
  - **THEN** sistem sprema fotografiju kao opcionalni prilog uz zahtjev

- **AC36: Nedozvoljen format ili prevelika fotografija**  
  - **GIVEN** korisnik pokuša dodati fotografiju u nedozvoljenom formatu ili veću od dozvoljene veličine  
  - **WHEN** sistem obradi upload  
  - **THEN** sistem ne prihvata fotografiju i prikazuje odgovarajuću poruku o grešci

---

### F. Hitnost i Premium opcija

- **AC37: Odabir hitnosti zahtjeva**  
  - **GIVEN** korisnik se nalazi na koraku “Hitnost”  
  - **WHEN** odabere nivo hitnosti  
  - **THEN** sistem evidentira odabranu hitnost kao korisničku procjenu uz zahtjev

- **AC38: Hitnost nije konačni prioritet intervencije**  
  - **GIVEN** korisnik je odabrao hitnost zahtjeva  
  - **WHEN** sistem kreira zahtjev  
  - **THEN** sistem sprema hitnost kao informaciju za dispečera, bez automatskog određivanja operativnog prioriteta

- **AC39: Obavezan odabir hitnosti ako je dio korisničkog toka**  
  - **GIVEN** korak “Hitnost” je definisan kao obavezan dio prijave zahtjeva  
  - **WHEN** korisnik pokuša nastaviti bez odabrane hitnosti  
  - **THEN** sistem ne dozvoljava nastavak i prikazuje poruku da je potrebno odabrati hitnost

---

## US-06 — Pregled vlastitog zahtjeva

**Opis:**  
Kao korisnik usluge, želim pregledati osnovne informacije i status svog zahtjeva, kako bih imao jasan uvid u ono što sam prijavio i u fazu obrade u kojoj se moj zahtjev nalazi.

**Poslovna vrijednost:**  
Ovaj story je važan jer korisniku omogućava da na jednom mjestu vidi šta je prijavio i u kojoj se fazi obrade njegov zahtjev nalazi, čime se povećava preglednost, smanjuje potreba za dodatnim provjerama i povećava povjerenje u proces rješavanja problema.

**Prioritet:**  
*Srednji*

**Pretpostavke i otvorena pitanja:**  

**Pretpostavka:** Pretpostavlja se da korisnik ima evidentiran najmanje jedan zahtjev u sistemu i prijavljen je na svoj korisnički nalog.

**Otvorena pitanja:** Koji minimalni skup informacija treba biti dostupan korisniku u pregledu zahtjeva, npr. opis problema, lokacija, datum prijave, trenutni status i eventualni planirani termin?

**Veze sa drugim storyjima:**  
Zavisi od storyja za prijavu zahtjeva za servisnu intervenciju (US-05) i povezan je sa storyjem za ažuriranje statusa intervencije (US-14) i pregled statusa intervencija od strane dispečera (US-13).

**Acceptance Criteria:**

- **AC1: Prikaz vlastitog zahtjeva**  
  - **GIVEN** korisnik ima evidentiran zahtjev u sistemu  
  - **WHEN** pristupi pregledu svojih zahtjeva  
  - **THEN** sistem prikazuje njegov zahtjev sa osnovnim informacijama

- **AC2: Prikaz trenutnog statusa zahtjeva**  
  - **GIVEN** korisnik pregleda svoj zahtjev  
  - **WHEN** otvori detalje zahtjeva ili listu zahtjeva  
  - **THEN** sistem prikazuje tačan trenutni status zahtjeva

- **AC3: Prikaz samo vlastitih zahtjeva**  
  - **GIVEN** korisnik je prijavljen u sistem  
  - **WHEN** pristupi pregledu zahtjeva  
  - **THEN** sistem prikazuje samo zahtjeve koje je taj korisnik prijavio

- **AC4: Prikaz praznog stanja**  
  - **GIVEN** korisnik nema evidentiran nijedan zahtjev u sistemu  
  - **WHEN** pristupi pregledu svojih zahtjeva  
  - **THEN** sistem prikazuje odgovarajuću poruku da nema prijavljenih zahtjeva

- **AC5: Ažuriran prikaz nakon promjene statusa**  
  - **GIVEN** status korisnikovog zahtjeva je promijenjen u sistemu  
  - **WHEN** korisnik ponovo pregleda svoj zahtjev  
  - **THEN** sistem prikazuje ažurirani status zahtjeva

- **AC6: Prikaz novokreiranog zahtjeva nakon slanja**  
  - **GIVEN** korisnik je uspješno poslao zahtjev  
  - **WHEN** pristupi sekciji “Moji zahtjevi”  
  - **THEN** sistem prikazuje novokreirani zahtjev u listi njegovih zahtjeva

- **AC7: Prikaz adrese zahtjeva korisniku**  
  - **GIVEN** korisnik ima evidentiran zahtjev sa adresom kvara  
  - **WHEN** pristupi pregledu svojih zahtjeva  
  - **THEN** sistem prikazuje adresu kvara uz osnovne informacije zahtjeva

- **AC8: Prikaz informacije o dodatno označenoj lokaciji**  
  - **GIVEN** korisnik je prilikom prijave zahtjeva dodatno označio lokaciju putem GPS-a ili mape  
  - **WHEN** pregleda detalje zahtjeva  
  - **THEN** sistem prikazuje informaciju da je precizna lokacija dodana uz zahtjev

- **AC9: Prikaz kategorije i potkategorije**  
  - **GIVEN** korisnik ima evidentiran zahtjev sa odabranom kategorijom  
  - **WHEN** pregleda listu ili detalje zahtjeva  
  - **THEN** sistem prikazuje kategoriju i potkategoriju ako je evidentirana

- **AC10: Prikaz opisa i kontakt telefona**  
  - **GIVEN** korisnik ima evidentiran zahtjev  
  - **WHEN** otvori detalje zahtjeva  
  - **THEN** sistem prikazuje opis kvara i kontakt telefon koji su uneseni pri prijavi

- **AC11: Prikaz preferiranog termina korisniku**  
  - **GIVEN** korisnik je prilikom prijave zahtjeva unio preferirani termin  
  - **WHEN** pregleda svoj zahtjev  
  - **THEN** sistem prikazuje preferirani termin kao korisničku preferencu, uz napomenu da konačan termin potvrđuje dispečer

- **AC12: Prikaz informacije da korisnik nema preferirani termin**  
  - **GIVEN** korisnik je prilikom prijave zahtjeva odabrao opciju bez preferiranog termina  
  - **WHEN** pregleda svoj zahtjev  
  - **THEN** sistem prikazuje informaciju da će ga dispečer kontaktirati radi dogovora termina

- **AC13: Prikaz fotografije ako je dodana**  
  - **GIVEN** korisnik je priložio fotografiju kvara  
  - **WHEN** pregleda detalje zahtjeva  
  - **THEN** sistem prikazuje fotografiju ili informaciju da je fotografija dodana

- **AC14: Prikaz hitnosti zahtjeva**  
  - **GIVEN** korisnik je označio hitnost zahtjeva  
  - **WHEN** pregleda zahtjev  
  - **THEN** sistem prikazuje korisnički označenu hitnost

- **AC15: Sakrivanje internih operativnih podataka od korisnika**  
  - **GIVEN** korisnik usluge pregleda vlastiti zahtjev  
  - **WHEN** sistem učita podatke zahtjeva  
  - **THEN** sistem ne prikazuje interne dispečerske napomene, interne operativne procjene i druge podatke koji nisu namijenjeni korisniku usluge


---

## US-07 — Pregled otvorenih intervencija

**Opis:**  
Kao dispečer, želim pregledati sve otvorene i aktivne intervencije, kako bih imao jasan uvid u zahtjeve koji čekaju obradu i u tok rada sistema.

**Poslovna vrijednost:**  
Ovaj story je važan jer dispečeru omogućava centralizovan pregled svih intervencija koje su u toku obrade, olakšava organizaciju rada i pomaže u pravovremenom reagovanju na zastoje, promjene prioriteta i raspoloživost resursa.

**Prioritet:**  
*Visok*

**Pretpostavke i otvorena pitanja:**  

**Pretpostavka:** Pretpostavlja se da sistem razlikuje otvorene, aktivne i završene intervencije i dispečer ima pravo pristupa njihovom pregledu.

**Otvorena pitanja:**  Da li pregled intervencija u ovoj fazi uključuje samo listu osnovnih zapisa ili i dodatne podatke kao što su prioritet, status, planirani termin i dodijeljeni izvršilac?

**Veze sa drugim storyjima:**  
Zavisi od storyja za prijavu zahtjeva za servisnu intervenciju (US-05) i povezan je sa storyjima za pregled detalja pojedinačne intervencije (US-08), određivanje prioriteta intervencije (US-12), dodjelu izvršioca intervencije (US-09) i pregled statusa intervencija od strane dispečera (US-13).

**Acceptance Criteria:**

- **AC1: Prikaz liste otvorenih i aktivnih zahtjeva/intervencija**  
  - **GIVEN** u sistemu postoje otvoreni zahtjevi ili aktivne intervencije  
  - **WHEN** dispečer pristupi operativnom pregledu  
  - **THEN** sistem prikazuje listu svih relevantnih zapisa za dalju obradu

- **AC2: Prikaz osnovnih informacija o zahtjevu/intervenciji**  
  - **GIVEN** dispečer pregleda listu otvorenih zahtjeva/intervencija  
  - **WHEN** sistem prikaže listu  
  - **THEN** za svaki zapis prikazuje osnovne podatke potrebne za pregled i razlikovanje zapisa

- **AC3: Isključenje završenih ili neaktivnih zapisa iz osnovnog pregleda**  
  - **GIVEN** u sistemu postoje završeni, zatvoreni, otkazani ili neaktivni zapisi  
  - **WHEN** dispečer pristupi osnovnom pregledu otvorenih zahtjeva/intervencija  
  - **THEN** sistem ne prikazuje zapise koji više nisu predmet aktivne obrade

- **AC4: Ažuriranje pregleda nakon promjene stanja**  
  - **GIVEN** stanje nekog zahtjeva ili intervencije se promijeni u sistemu  
  - **WHEN** dispečer osvježi pregled ili ponovo pristupi listi  
  - **THEN** sistem prikazuje ažurirano stanje liste

- **AC5: Ograničenje pristupa pregledu intervencija**  
  - **GIVEN** korisnik nema ulogu dispečera ili drugo odgovarajuće ovlaštenje  
  - **WHEN** pokuša pristupiti pregledu otvorenih zahtjeva/intervencija  
  - **THEN** sistem mu ne dozvoljava pristup toj funkcionalnosti

- **AC6: Prikaz novokreiranog zahtjeva u dispečerskoj listi**  
  - **GIVEN** korisnik je uspješno poslao zahtjev  
  - **WHEN** dispečer pristupi listi zahtjeva koji čekaju obradu  
  - **THEN** sistem prikazuje novokreirani zahtjev u dispečerskom pregledu

- **AC7: Prikaz adrese u dispečerskoj listi**  
  - **GIVEN** u sistemu postoji zahtjev koji čeka obradu  
  - **WHEN** dispečer pristupi listi otvorenih zahtjeva  
  - **THEN** sistem prikazuje adresu kvara kao dio osnovnih informacija zahtjeva

- **AC8: Prikaz informacije o koordinatama u dispečerskoj listi**  
  - **GIVEN** korisnik je uz zahtjev dodatno označio lokaciju putem GPS-a ili mape  
  - **WHEN** dispečer pregleda listu zahtjeva  
  - **THEN** sistem prikazuje oznaku da zahtjev ima dodatno preciziranu lokaciju

- **AC9: Prikaz osnovnih podataka za početnu obradu**  
  - **GIVEN** dispečer pregleda listu zahtjeva koji čekaju obradu  
  - **WHEN** sistem prikaže zahtjeve  
  - **THEN** za svaki zahtjev prikazuje kategoriju kvara, potkategoriju ako postoji, adresu, kontakt telefon, datum prijave, status, korisničku hitnost i preferirani termin ako postoji

- **AC10: Prikaz informacije o zahtjevu bez preferiranog termina**  
  - **GIVEN** korisnik je prilikom prijave zahtjeva odabrao opciju bez preferiranog termina  
  - **WHEN** dispečer pregleda listu zahtjeva koji čekaju obradu  
  - **THEN** sistem prikazuje informaciju da korisnika treba kontaktirati radi dogovora termina

- **AC11: Prikaz indikatora fotografije**  
  - **GIVEN** korisnik je uz zahtjev priložio fotografiju kvara  
  - **WHEN** dispečer pregleda listu zahtjeva  
  - **THEN** sistem prikazuje indikator da zahtjev sadrži fotografiju ili prilog

- **AC12: Korisnička hitnost nije operativni prioritet**  
  - **GIVEN** korisnik je prilikom prijave označio hitnost zahtjeva  
  - **WHEN** dispečer pregleda zahtjev u listi  
  - **THEN** sistem prikazuje korisničku hitnost kao informaciju, bez tretiranja te vrijednosti kao konačnog operativnog prioriteta

- **AC13: Prelazak iz liste na detalje zahtjeva/intervencije**  
  - **GIVEN** dispečer pregleda listu otvorenih zahtjeva/intervencija  
  - **WHEN** odabere konkretan zapis  
  - **THEN** sistem otvara detaljni prikaz tog zahtjeva/intervencije za dalju obradu

---

## US-08 — Pregled detalja pojedinačne intervencije

**Opis:**  
Kao dispečer, želim pregledati detalje pojedinačne intervencije, kako bih imao potpune informacije potrebne za donošenje operativnih odluka i dalju obradu zahtjeva.

**Poslovna vrijednost:**  
Ovaj story je važan jer omogućava dispečeru da na jednom mjestu vidi sve ključne informacije o konkretnoj intervenciji, što olakšava procjenu situacije, određivanje prioriteta, planiranje i dodjelu izvršioca.

**Prioritet:**  
**Visok**

**Pretpostavke i otvorena pitanja:**  
**Pretpostavka:** Dispečer već ima pristup listi otvorenih intervencija i može otvoriti pojedinačni zapis iz tog pregleda.  
**Otvoreno pitanje:** Koji minimalni skup informacija mora biti prikazan u detaljima intervencije kako bi dispečer mogao dalje obrađivati zahtjev?

**Veze sa drugim storyjima:**  
Zavisi od storyja za pregled otvorenih intervencija (US-07) i povezan je sa storyjima za određivanje prioriteta intervencije (US-12), dodjelu izvršioca intervencije (US-09), planiranje intervencije (US-11) i pregled statusa intervencija od strane dispečera (US-13).

**Acceptance Criteria:**

- **AC1: Otvaranje detalja intervencije**  
    - **GIVEN** dispečer pregleda listu otvorenih intervencija  
    - **WHEN** odabere jednu konkretnu intervenciju  
    - **THEN** sistem otvara detaljan prikaz te intervencije

- **AC2: Prikaz ključnih informacija o intervenciji**  
    - **GIVEN** dispečer je otvorio detalje intervencije  
    - **WHEN** sistem prikaže zapis  
    - **THEN** prikazuju se sve osnovne informacije potrebne za dalju obradu zahtjeva

- **AC3: Prikaz trenutnog statusa intervencije**  
    - **GIVEN** dispečer pregleda detalje intervencije  
    - **WHEN** otvori detaljan prikaz  
    - **THEN** sistem prikazuje trenutni status intervencije

- **AC4: Prikaz povezanih operativnih podataka**  
    - **GIVEN** intervencija ima dodatne podatke relevantne za obradu  
    - **WHEN** dispečer pregleda detalje  
    - **THEN** sistem prikazuje podatke potrebne za odlučivanje o prioritetu, planiranju i dodjeli

- **AC5: Ograničenje pristupa detaljima intervencije**  
    - **GIVEN** korisnik nema odgovarajuće ovlaštenje  
    - **WHEN** pokuša otvoriti detalje intervencije  
    - **THEN** sistem mu ne dozvoljava pristup toj funkcionalnosti

---

## US-09 — Dodjela intervencije odgovornom serviseru

**Opis:**  
Kao dispečer, želim dodijeliti intervenciju odgovornom serviseru, kako bi bilo jasno ko preuzima izvršenje konkretnog zadatka.

**Poslovna vrijednost:**  
Ovaj story je važan jer omogućava da svaka intervencija dobije jasno određenog izvršioca, čime se uspostavlja odgovornost za preuzimanje i izvršenje zadatka te omogućava nesmetan prelaz iz dispečerske obrade u terenski rad.

**Prioritet:**  
**Visok**

**Pretpostavke i otvorena pitanja:**  
**Pretpostavka:** Sistem raspolaže listom servisera kojima se intervencija može dodijeliti, a dispečer ima pravo izvršiti dodjelu.  
**Otvoreno pitanje:** Da li sistem u ovoj fazi samo prikazuje dostupne servisere ili i predlaže najpogodnijeg izvršioca na osnovu unaprijed definisanih pravila?

**Veze sa drugim storyjima:**  
„Zavisi od storyja za pregled otvorenih intervencija (US-07) i pregled detalja pojedinačne intervencije (US-08), a povezan je sa storyjima za planiranje intervencije (US-11), pregled dodijeljenih intervencija (US-15) i prihvatanje dodijeljenog zadatka (US-22).

**Acceptance Criteria:**

- **AC1: Uspješna dodjela intervencije serviseru**  
    - **GIVEN** dispečer pregleda intervenciju spremnu za dodjelu  
    - **WHEN** odabere odgovornog servisera i potvrdi akciju  
    - **THEN** sistem dodjeljuje intervenciju odabranom serviseru

- **AC2: Evidentiranje dodjele u sistemu**  
    - **GIVEN** dispečer je uspješno izvršio dodjelu  
    - **WHEN** sistem obradi akciju  
    - **THEN** intervencija se evidentira kao dodijeljena i povezuje sa odabranim serviserom

- **AC3: Nedozvoljena dodjela bez odabira servisera**  
    - **GIVEN** dispečer nije odabrao servisera  
    - **WHEN** pokuša potvrditi dodjelu  
    - **THEN** sistem ne izvršava dodjelu i prikazuje poruku o grešci

- **AC4: Prikaz dodijeljene intervencije serviseru**  
    - **GIVEN** intervencija je uspješno dodijeljena  
    - **WHEN** serviser pristupi svom pregledu zadataka  
    - **THEN** sistem prikazuje dodijeljenu intervenciju u njegovoj listi zadataka

- **AC5: Ograničenje pristupa funkcionalnosti dodjele**  
    - **GIVEN** korisnik nema odgovarajuće ovlaštenje za dodjelu  
    - **WHEN** pokuša dodijeliti intervenciju serviseru  
    - **THEN** sistem mu ne dozvoljava pristup toj funkcionalnosti

---

## US-10 — Dodjela intervencije timu servisera

**Opis:**  
Kao dispečer, želim dodijeliti intervenciju timu servisera, kako bi se složeniji zadaci mogli organizovano izvršavati od strane više izvršilaca.

**Poslovna vrijednost:**  
Ovaj story je važan jer omogućava da se zahtjevnije ili obimnije intervencije rasporede na više servisera, čime se poboljšava organizacija rada i omogućava efikasnije izvršenje zadataka koji prevazilaze kapacitet jednog izvršioca.

**Prioritet:**  
**Srednji**

**Pretpostavke i otvorena pitanja:**  
**Pretpostavka:** U sistemu postoje definisani timovi servisera ili mogućnost odabira više izvršilaca za jednu intervenciju.  
**Otvoreno pitanje:** Da li se prilikom timske dodjele mora odrediti i glavni odgovorni izvršilac ili je dovoljno evidentirati samo listu članova tima?

**Veze sa drugim storyjima:**  
Zavisi od storyja za pregled detalja pojedinačne intervencije (US-08) i povezan je sa storyjima za pregled dodijeljenih intervencija (US-15), planiranje intervencije (US-11) i promjenu izvršioca intervencije (US-28).

**Acceptance Criteria:**

- **AC1: Uspješna dodjela intervencije timu servisera**  
    - **GIVEN** dispečer pregleda intervenciju koja zahtijeva timski rad  
    - **WHEN** odabere minimalno dva servisera sa liste aktivnih korisnika i potvrdi dodjelu
    - **THEN** sistem mijenja status intervencije i prikazuje punu listu odabranih članova tima na detaljima intervencije

- **AC2: Evidentiranje svih članova tima na intervenciji**  
    - **GIVEN** timska dodjela je uspješno izvršena  
    - **WHEN** sistem obradi akciju i spremi promjene u bazu podataka
    - **THEN** intervencija se povezuje sa svim odabranim članovima tima

- **AC3: Nedozvoljena dodjela bez odabira tima ili članova tima**  
    - **GIVEN** dispečer je u modu za timsku dodjelu, ali je odabrao samo jednog servisera ili nije odabrao nijednog  
    - **WHEN** pokuša potvrditi dodjelu  
    - **THEN** sistem ne izvršava dodjelu i prikazuje poruku o grešci

- **AC4: Prikaz timski dodijeljene intervencije relevantnim serviserima**  
    - **GIVEN** intervencija je uspješno dodijeljena timu  
    - **WHEN** članovi tima pristupe svom pregledu zadataka  
    - **THEN** sistem prikazuje intervenciju svim relevantnim izvršiocima

- **AC5: Ograničenje pristupa funkcionalnosti timske dodjele**  
    - **GIVEN** korisnik nema odgovarajuće ovlaštenje za timsku dodjelu  
    - **WHEN** pokuša dodijeliti intervenciju timu servisera  
    - **THEN** sistem mu ne dozvoljava pristup toj funkcionalnosti

---

## US-11 — Planiranje intervencije

**Opis:**  
Kao dispečer, želim planirati intervenciju unaprijed, kako bih mogao organizovati termin, resurse i izvršenje zadatka.

**Poslovna vrijednost:**  
Ovaj story je važan jer omogućava pravovremeno i efikasno planiranje intervencija, smanjuje rizik od kašnjenja i preklapanja zadataka te poboljšava organizaciju operativnog rada.

**Prioritet:**  
*Visok*

**Pretpostavke i otvorena pitanja:**  

**Pretpostavka:** Pretpostavlja se da postoje podaci o resursima, timu i raspoloživim terminima.

**Otvorena pitanja:**  Da li u planiranju učestvuju i drugi korisnici osim dispečera? Da li dispečer treba imati mogućnost prisilnog zakazivanja uprkos konfliktu u hitnim slučajevima?

**Veze sa drugim storyjima:**  
Zavisi od storyja za dodjelu intervencije izvršiocu (US-09) i povezan je sa storyjima za pregled statusa intervencija od strane dispečera (US-13) i pregled detalja pojedinačne intervencije (US-08).

**Acceptance Criteria:**

- **AC1: Uspješno postavljanje termina intervencije**  
  - **GIVEN** dispečer je otvorio detalje intervencije i odabrao opciju za unos termina
  - **WHEN** unese validan datum i vrijeme u budućnosti te korisnik potvrdi akciju 
  - **THEN** sistem sprema planirani termin, prikazuje ga u detaljima intervencije i kreira zapis u historiji aktivnosti

- **AC2: Nepotpuni podaci**  
  - **GIVEN** dispečer je u formi za planiranje, ali nije unio ni datum ni vrijeme  
  - **WHEN** pokuša potvrditi akciju 
  - **THEN** sistem ne sprema promjene i prikazuje validacijsku poruku pored praznih polja

- **AC3: Neispravan termin**  
  - **GIVEN** dispečer je unio datum i/ili vrijeme koji su u prošlosti (stariji od trenutnog sistemskog vremena) 
  - **WHEN** pokuša potvrditi planiranje 
  - **THEN** sistem ne sprema termin i prikazuje grešku

- **AC4: Zabrana preklapanja termina**  
  - **GIVEN** dispečer unese termin(datum i vrijeme) koji se preklapa sa već postojećim planiranim terminom za odabranog servisera ili tim
  - **WHEN** pokuša potvrditi planiranje   
  - **THEN** sistem ne dozvoljava spremanje promjena, prikazuje jasno upozorenje o konfliktu i markira polja koja uzrokuju problem, zahtijevajući od dispečera unos drugog termina
 
- **AC5: Provjera dostupnosti u realnom vremenu**  
  - **GIVEN** dispečer izabere termin za intervenciju
  - **WHEN** otvori kalendar ili listu termina
  - **THEN** sistem vizuelno označava termina u kojima je odabrani serviser/tim već zauzet, kako bi se spriječio pokušaj unosa konfliktnog termina

- **AC6: Definisanje trajanja intervencije**  
  - **GIVEN** dispečer unese termin početka intervencije
  - **WHEN** potvrdi planiranje zahtjeva
  - **THEN** sistem prihvata ručno uneseno očekivano vrijeme trajanja ili u slučaju praznog polja, automatski dodjeljuje podrazumijevanu(default) vrijednost od 60 minuta kako bi rezervisao vremenski blok u kalendaru izvršioca

---

## US-12 — Određivanje prioriteta intervencije

**Opis:**  
Kao dispečer, želim odrediti prioritet intervencije, kako bi zahtjevi bili obrađeni i raspoređeni prema njihovoj hitnosti i važnosti.

**Poslovna vrijednost:**  
Ovaj story je važan jer omogućava da se intervencije ne obrađuju proizvoljno, nego u skladu sa njihovom stvarnom hitnošću i poslovnim značajem.

**Prioritet:**  
*Visok*

**Pretpostavke i otvorena pitanja:**  

**Pretpostavka:**  Pretpostavlja se da su svi relevantni podaci o intervenciji (opis problema, lokacija, hitnost) već uneseni u sistem kako bi dispečer mogao odrediti prioritet.

**Otvorena pitanja:** Da li dispečer prioritet određuje ručno ili sistem daje prijedlog koji dispečer može potvrditi ili izmijeniti po potrebi?

**Veze sa drugim storyjima:**  
Zavisi od storyja za prijavu zahtjeva za servisnu intervenciju (US-05) i pregled detalja pojedinačne intervencije (US-08), a povezan je sa storyjima za dodjelu intervencije izvršiocu (US-09) i planiranje intervencije (US-11).

**Acceptance Criteria:**

- **AC1: Postavljanje prioriteta**  
  - **GIVEN** dispečer je otvorio detalje intervencije koja nema dodijeljen prioritet 
  - **WHEN** odabere jednu od ponuđenih razina prioriteta i potvrdi odabir
  - **THEN** sistem sprema odabrani prioritet, prikazuje ga na detaljima intervencije i kreira zapis u historiji aktivnosti sa postavljenom vrijednošću

- **AC2: Izmjena postojećeg prioriteta**  
  - **GIVEN** intervencija već ima dodijeljen prioritet
  - **WHEN** dispečer odabere novu razinu prioriteta i potvrdi izmjenu
  - **THEN** sistem ažurira prioritet na novu vrijednost

- **AC3: Prikaz prioriteta**  
  - **GIVEN** intervenciji je uspješno dodijeljen ili promijenjen prioritet 
  - **WHEN** dispečer pregleda listu otvorenih intervencija ili detalje te intervencije
  - **THEN** sistem prikazuje aktuelni prioritet jasno vidljivo uz ostale osnovne podatke o intervenciji

- **AC4: Prava pristupa**  
  - **GIVEN** korisnik sa ulogom servisera ili korisnika usluge je prijavljen u sistem
  - **WHEN** pokuša pristupiti opciji postavljanja ili izmjene prioriteta
  - **THEN** sistem mu ne prikazuje tu opciju ili prikazuje grešku

---

## US-13 — Pregled statusa intervencija od strane dispečera

**Opis:**  
Kao dispečer, želim pregledati statuse intervencija, kako bih mogao pratiti tok rada i imati jasan uvid u trenutnu fazu obrade svakog zahtjeva.

**Poslovna vrijednost:**  
Ovaj story je važan jer dispečeru daje pregled nad trenutnim stanjem procesa i omogućava da na vrijeme uoči zastoje, preopterećenost ili potrebu za dodatnom intervencijom.

**Prioritet:**  
*Visok*

**Pretpostavke i otvorena pitanja:**  

**Pretpostavka:**  Pretpostavlja se da sistem podržava definisane statuse intervencije.

**Otvorena pitanja:** Da li dispečer vidi samo trenutni status ili i dodatne informacije poput prioriteta, izvršioca i termina?

**Veze sa drugim storyjima:**  
Zavisi od storyja za pregled otvorenih intervencija (US-07) i povezan je sa storyjima za pregled detalja pojedinačne intervencije (US-08), određivanje prioriteta intervencije (US-12), dodjelu izvršioca intervencije (US-09), planiranje intervencije (US-11) i ažuriranje statusa intervencije od strane servisera (US-14).

**Acceptance Criteria:**

- **AC1: Pregled statusa**  
  - **GIVEN** u sistemu postoje aktivne intervencije u različitim fazama obrade
  - **WHEN** dispečer pristupi pregledu intervencija
  - **THEN** sistem prikazuje statuse

- **AC2: Ažuriranje prikaza**  
  - **GIVEN** status se promijeni  
  - **WHEN** lista se osvježi  
  - **THEN** prikaz je ažuriran

- **AC3: Pristup detaljima**  
  - **GIVEN** dispečer pregleda listu intervencija sa statusima  
  - **WHEN** klikne na konkretnu intervenciju
  - **THEN** sistem otvara prikaz detalja te intervencije sa svim podacima relevantnim za daljnju obradu

---

## US-14 — Ažuriranje statusa intervencije od strane servisera

**Opis:**  
Kao serviser, želim po potrebi ažurirati status intervencije na kojoj radim, kako bi sistem odražavao trenutno stanje rada na terenu.

**Poslovna vrijednost:**  
Ovaj story je važan jer omogućava da sistem prati stvarni tok izvršenja intervencije i da ostali korisnici imaju pravovremenu i tačnu informaciju o tome u kojoj se fazi rad nalazi (US-17).

**Prioritet:**  
*Visok*

**Pretpostavke i otvorena pitanja:**  

**Pretpostavka:**  Pretpostavlja se da serviser može ažurirati status samo za intervencije koje su mu dodijeljene.

**Otvorena pitanja:** Koje operativne statuse serviser može postavljati?

**Veze sa drugim storyjima:**  
Zavisi od storyja za pregled dodijeljenih intervencija i pregled detalja zadatka na terenu. Povezan je sa storyjima za pregled statusa intervencija od strane dispečera, pregled vlastitog zahtjeva i evidentiranje izvršenog rada.

**Acceptance Criteria:**  

- **AC1: Promjena statusa**  
  - **GIVEN** serviser je prihvatio zadatak
  - **WHEN** promijeni status 
  - **THEN** sistem status ažurira

- **AC2: Samo dodijeljene intervencije**  
  - **GIVEN** intervencija nije dodijeljena  
  - **WHEN** serviser pokuša promjenu  
  - **THEN** akcija nije dozvoljena

- **AC3: Validacija statusa**  
  - **GIVEN** status nije validan  
  - **WHEN** serviser pokuša unos  
  - **THEN** sistem prikazuje grešku

- **AC4: Završena intervencija**  
  - **GIVEN** intervencija je završena  
  - **WHEN** serviser pokuša izmjenu  
  - **THEN** akcija nije dozvoljena

---

## US-15 — Pregled dodijeljenih intervencija

**Opis:**  
Kao serviser, želim pregledati intervencije koje su mi dodijeljene, kako bih znao koje zadatke trebam izvršiti i kojim redoslijedom ih trebam obrađivati.

**Poslovna vrijednost:**  
Ovaj story je važan jer serviseru daje pregled njegovih zadataka, olakšava organizaciju rada i smanjuje rizik da neka intervencija bude zaboravljena ili obrađena van prioriteta.

**Prioritet:**  
*Visok*

**Pretpostavke i otvorena pitanja:**  

**Pretpostavka:**  Pretpostavlja se da su intervencije već kreirane i dodijeljene od strane dispečera.

**Otvorena pitanja:** Da li serviser vidi samo svoje zadatke ili i zadatke cijelog tima?

**Veze sa drugim storyjima:**  
Zavisi od storyja za dodjelu intervencije odgovornom serviseru ili timu (US-09 / US-10) i povezan je sa storyjem za pregled detalja zadatka na terenu (US-16).

**Acceptance Criteria:**  
- **AC1: Pregled liste**  
  - **GIVEN** dispečer je serviseru dodijelio jednu ili više intervencija 
  - **WHEN** serviser pristupi svom pregledu zadataka 
  - **THEN** sistem prikazuje listu svih aktivnih intervencija dodijeljenih tom serviseru, sa minimalnim podacima za svaki zapis 

- **AC2: Nepotpuni podaci**  
  - **GIVEN** serviseru nije dodijeljena nijedna aktivna intervencija
  - **WHEN** serviser pristupi pregledu zadataka
  - **THEN** sistem prikazuje odgovarajuću poruku umjesto praznog ekrana ili greške

- **AC3: Prikaz samo vlastitih zadataka**  
  - **GIVEN** u sistemu postoje intervencije dodijeljene različitim serviserima
  - **WHEN** serviser A pristupi svom pregledu zadataka 
  - **THEN** sistem prikazuje isključivo intervencije dodijeljene serviseru A i ne otkriva intervencije koje su dodijeljene drugim serviserima

---

## US-16 — Pregled detalja zadatka na terenu

**Opis:**  
Kao serviser, želim pregledati detalje zadatka na terenu, kako bih imao sve potrebne informacije za njegovo pravilno i efikasno izvršavanje.

**Poslovna vrijednost:**  
Ovaj story je važan jer omogućava serviseru da na terenu ima sve ključne informacije o zadatku na jednom mjestu, čime se smanjuju greške, nedoumice i potreba za dodatnim provjerama.

**Prioritet:**  
*Visok*

**Pretpostavke i otvorena pitanja:** 

**Pretpostavka:**  Pretpostavlja se da je intervencija već evidentirana i dodijeljena serviseru ili timu.

**Otvorena pitanja:** Koje informacije čine minimalni obavezni skup detalja koje serviser mora imati dostupne na terenu?

**Veze sa drugim storyjima:**  
„Zavisi od storyja za pregled dodijeljenih intervencija (US-15) i povezan je sa storyjima za ažuriranje statusa intervencije od strane servisera (US-14) i evidentiranje izvršenog rada (US-17).

**Acceptance Criteria:**  
- **AC1: Pregled detalja**  
  - **GIVEN** serviser je odabrao konkretnu intervenciju iz svoje liste zadataka
  - **WHEN** sistem otvori detaljni prikaz tog zadatka 
  - **THEN** sistem prikazuje minimalno sljedeće informacije: ID intervencije, kompletan opis kvara/problema, adresu lokacije izvršenja, ime podnosioca zahtjeva i kontakt telefon, prioritet, trenutni status, planirani termin (ako je postavljen) i ime odgovornog dispečera

- **AC2: Prikaz internih napomena dispečera**  
  - **GIVEN** dispečer je prethodno dodao jednu ili više internih napomena na intervenciju  
  - **WHEN** serviser otvori detalje tog zadatka na terenu
  - **THEN** sistem prikazuje sekciju sa svim napomenama poredanim hronološki, sa imenom autora i vremenskim pečatom uz svaku napomenu

- **AC3: Prava pristupa**  
  - **GIVEN** serviser A pokušava direktno pristupiti URL-u detalja intervencije dodijeljene serviseru B
  - **WHEN** sistem obradi zahtjev
  - **THEN** sistem onemogućava pristup i prikazuje grešku bez otkrivanja bilo kakvih podataka o toj intervenciji

---

## US-17 — Evidentiranje izvršenog rada

**Opis:**  
Kao serviser, želim evidentirati izvršeni rad, kako bi sistem sadržavao tačan zapis o aktivnostima obavljenim tokom intervencije.

**Poslovna vrijednost:**  
Ovaj story je važan jer omogućava da se izvršene aktivnosti evidentiraju tačno i pravovremeno, čime se osigurava jasan uvid u obavljeni rad, praćenje napretka i korištenje resursa.

**Prioritet:**  
*Srednji*

**Pretpostavke i otvorena pitanja:**  

**Pretpostavka:**  Pretpostavlja se da serviser može evidentirati aktivnosti tokom ili nakon intervencije.

**Otvorena pitanja:** Koje informacije su obavezne prilikom evidencije?

**Veze sa drugim storyjima:**  
Zavisi od storyja za pregled detalja zadatka na terenu (US-16) i povezan je sa storyjima za ažuriranje statusa intervencije od strane servisera (US-14) i pregled evidentiranog izvršenog rada (US-24).

**Acceptance Criteria:**  
- **AC1: Evidentiranje rada**  
  - **GIVEN** serviser je otvorio aktivnu intervenciju koja mu je dodijeljena i odabrao opciju unosa
  - **WHEN** unese obavezne podatke te potvrdi unos
  - **THEN** sistem pohranjuje evidenciju rada uz automatsko bilježenje datuma i vremena unosa te imena servisera, a na detaljima intervencije postaje vidljiva sekcija sa evidentiranim radom

- **AC2: Validacija unosa**  
  - **GIVEN** serviser je u formi za evidenciju rada, ali nije popunio jedno ili više obaveznih polja 
  - **WHEN** pokuša potvrditi unos
  - **THEN** sistem ne sprema evidenciju i pored svakog nepopunjenog obaveznog polja prikazuje validacijsku poruku

- **AC3: Prikaz podataka**  
  - **GIVEN** serviser je uspješno evidentirao izvršeni rad
  - **WHEN** dispečer otvori detalje te intervencije
  - **THEN** sistem prikazuje evidentiranu evidenciju rada sa svim unesenim podacima 

- **AC4: Zabrana evidentiranja rada na tuđim ili zatvorenim intervencijama**  
  - **GIVEN** serviser pokušava evidentirati rad na intervenciji koja mu nije dodijeljena ili je zatvorena 
  - **WHEN** pokuša pristupiti formi za evidenciju 
  - **THEN** sistem ne prikazuje opciju za evidenciju rada ili onemogućava pristup uz poruku upozorenja

---

## US-38 — Obavezno trajanje pri evidentiranju rada

**Opis:**  
Kao serviser, želim biti obavezan unijeti trajanje izvršenog rada pri evidentiranju, kako bi sistem imao tačne podatke o utrošenom vremenu za potrebe fakturisanja i analize.

**Poslovna vrijednost:**  
Bez obaveznog trajanja, sistem ne može pouzdano pratiti produktivnost servisera niti generisati tačne izvještaje o utrošenom vremenu. Obaveznost polja eliminira nepotpune evidencije.

**Prioritet:**  
*Visok*

**Veze sa drugim storyjima:**  
Povezan sa storyjem za evidentiranje izvršenog rada (US-17) i pregled evidentiranog rada (US-24).

**Acceptance Criteria:**  
- AC1: Sistem ne dozvoljava slanje evidencije bez unesenog trajanja u minutama
- AC2: Sistem validira da trajanje mora biti pozitivan cijeli broj (≥ 1 minuta, ≤ 1440 minuta)
- AC3: Sistem prikazuje poruku greške ako trajanje nije uneseno ili nije validno
- AC4: Nakon uspješnog unosa, trajanje se prikazuje u detaljima intervencije
- AC5: Dispečer vidi trajanje rada u pregledu evidencije

---

## US-43 — Upload fotografije intervencije

**Opis:**  
Kao serviser, želim uploadovati fotografiju vezanu za intervenciju, kako bih dokumentovao stanje na terenu i osigurao vizuelni dokaz obavljenog rada.

**Poslovna vrijednost:**  
Fotografska dokumentacija smanjuje sporove s klijentima o stanju opreme prije i poslije intervencije, te pruža dispečeru vizuelni uvid bez potrebe za dodatnom komunikacijom.

**Prioritet:**  
*Nizak*

**Veze sa drugim storyjima:**  
Povezan sa storyjem za evidentiranje izvršenog rada (US-17) i pregled detalja intervencije (US-08, US-16).

**Acceptance Criteria:**  
- AC1: Serviser može uploadovati jednu ili više fotografija na intervenciju
- AC2: Sistem prihvata formate JPG, PNG i WebP; maksimalna veličina 10 MB po slici
- AC3: Slike se čuvaju u Supabase Storage bucket `intervencije-slike`, reference u tablici `slike_intervencija`
- AC4: Dispečer može pregledati uploadovane slike u detaljima intervencije
- AC5: Sistem prikazuje grid pregled uploadovanih slika s linkom na puni prikaz
- AC6: Serviser može uploadovati slike samo na intervencije koje su mu dodijeljene (`serviser_dodijeljen_id`)

---

## US-44 — Tabelarni pregled historije aktivnosti

**Opis:**  
Kao dispečer, želim pregledati historiju aktivnosti intervencije u tabelarnom, hronološkom obliku, kako bih brzo analizirao promjene polja, stare i nove vrijednosti te odgovornu osobu.

**Poslovna vrijednost:**  
Tabelarni prikaz smanjuje kognitivni napor pri analizi složenih intervencija i dopunjava vizuelni timeline (US-32, US-39).

**Prioritet:**  
*Srednji*

**Veze sa drugim storyjima:**  
US-32, US-39, US-14, US-28, US-40.

**Acceptance Criteria:**  
- AC1: Dispečer i admin vide tabelu aktivnosti na detalju intervencije  
- AC2: Kolone: vrijeme, tip, opis, stara vrijednost, nova vrijednost, izvršilac  
- AC3: Najnovije aktivnosti na vrhu liste  
- AC4: Moguć prebacivanja prikaza timeline / tabela  

---

## US-45 — SLA eskalacije

**Opis:**  
Kao dispečer, želim da sistem automatski eskalira intervencije s prekoračenim SLA rokom, kako bih pravovremeno reagovao i smanjio rizik kašnjenja.

**Poslovna vrijednost:**  
Eskalacija povezuje SLA indikatore (US-41) s operativnom reakcijom tima i notifikacijama (US-37).

**Prioritet:**  
*Srednji*

**Veze sa drugim storyjima:**  
US-41, US-37, US-31, US-07.

**Acceptance Criteria:**  
- AC1: Prekoračen SLA pokreće notifikaciju dispečerima  
- AC2: Audit zapis tipa eskalacije SLA  
- AC3: Ponovna eskalacija iste intervencije nije češća od definisanog cooldown perioda  
- AC4: Eskalacija se ne primjenjuje na zatvorene/otkazane intervencije  

---

## US-46 — Evidencija materijala i dijelova

**Opis:**  
Kao serviser, želim unijeti strukturirane stavke utrošenog materijala ili dijelova, kako bi evidencija rada bila potpuna i pogodna za kontrolu.

**Poslovna vrijednost:**  
Strukturirani unos omogućava tačnije izvještaje i kontrolu troškova uz obavezno trajanje (US-38).

**Prioritet:**  
*Srednji*

**Veze sa drugim storyjima:**  
US-17, US-38, US-24.

**Acceptance Criteria:**  
- AC1: Serviser može dodati jednu ili više stavki (naziv, količina, jedinica)  
- AC2: Validacija: pozitivna količina, obavezan naziv i jedinica  
- AC3: Maksimalno 20 stavki po evidenciji  
- AC4: Stavke su vidljive dispečeru u pregledu evidencije  
- AC5: Opcionalno tekstualno polje materijal ostaje podržano  

---

## US-47 — Praćenje intervencije nije riješene iz prve

**Opis:**  
Kao dispečer, želim vidjeti kada intervencija nije riješena iz prvog operativnog ciklusa, kako bih pratio kvalitet rješavanja i organizovao ponovnu dodjelu.

**Poslovna vrijednost:**  
Metrika ponovnih ciklusa povezuje akcije servisera (US-40, US-29) s dispečerskom kontrolom kvaliteta.

**Prioritet:**  
*Srednji*

**Veze sa drugim storyjima:**  
US-40, US-29, US-28, US-08.

**Acceptance Criteria:**  
- AC1: Sistem povećava brojač pri vraćanju na ponovnu dodjelu ili oznaci nije riješeno  
- AC2: Dispečer vidi badge/indikator na detalju intervencije  
- AC3: Brojač je vidljiv u API odgovoru zahtjeva  
- AC4: Prvi ciklus (broj 0) nema indikator ponovnog otvaranja  

---

## US-35 — Podnosenje zahtjeva za internu ulogu (dispecer/serviser)

**Opis:**  
Kao kandidat za internu ulogu, želim putem forme poslati zahtjev za ulogu dispecera ili servisera, kako bi administrator mogao pregledati aplikaciju i donijeti odluku o odobravanju.

**Poslovna vrijednost:**  
Ovaj story uvodi kontrolisani onboarding tok u kojem se interni pristup ne dodjeljuje direktno, nego tek nakon administrativne provjere.

**Prioritet:**  
*Visok*

**Planirani sprint implementacije:**  
*Sprint 7*

**Pretpostavke i otvorena pitanja:**  

**Pretpostavka:** Dostupna je javna forma za podnosenje aplikacije, a zahtjev se cuva sa statusom `na_cekanju` do administratorske odluke.

**Otvorena pitanja:** Da li se odbijanje zahtjeva vodi kroz poseban status ili samo kroz napomenu administracije?

**Veze sa drugim storyjima:**  
Povezano sa storyjima za prijavu korisnika u sistem (US-02), administrativno kreiranje internog korisnickog naloga (US-18) i kontrolu pristupa prema korisnickoj ulozi (US-04).

**Acceptance Criteria:**

- **AC1: Uspjesno podnosenje aplikacije**  
  - **GIVEN** kandidat unese sva obavezna polja u formu za internu ulogu  
  - **WHEN** potvrdi slanje aplikacije  
  - **THEN** sistem kreira aplikaciju i postavlja status na `na_cekanju`.

- **AC2: Validacija obaveznih podataka**  
  - **GIVEN** kandidat nije unio sva obavezna ili validna polja  
  - **WHEN** pokusa poslati aplikaciju  
  - **THEN** sistem ne kreira aplikaciju i prikazuje validacione poruke.

- **AC3: Administratorski pregled**  
  - **GIVEN** aplikacija ima status `na_cekanju`  
  - **WHEN** administrator otvori pregled aplikacija  
  - **THEN** sistem prikazuje aplikaciju sa svim podacima potrebnim za odluku.

- **AC4: Ogranicenje pristupa pregledu aplikacija**  
  - **GIVEN** korisnik nije administrator  
  - **WHEN** pokusa pristupiti administratorskom pregledu aplikacija  
  - **THEN** sistem zabranjuje pristup.

- **AC5: Odobravanje aplikacije i kreiranje internog naloga**  
  - **GIVEN** administrator odobri aplikaciju  
  - **WHEN** potvrdi odobravanje  
  - **THEN** sistem pokrece tok kreiranja internog naloga kroz US-18 i dodjelu odgovarajuce uloge.

---

## US-18 — Administrativno kreiranje internog korisničkog naloga

**Opis:**  
Kao administrator, želim kreirati korisnički nalog za internog korisnika sistema, kako bih mu omogućio pristup sistemu u skladu sa njegovom ulogom.

**Poslovna vrijednost:**  
Ovaj story je važan jer omogućava uključivanje internih korisnika u sistem i predstavlja osnovu za organizovan rad servisera, dispečera i drugih internih aktera.

**Prioritet:**  
*Visok*

**Pretpostavke i otvorena pitanja:**  

**Pretpostavka:**  Pretpostavlja se da administrator ima pravo kreiranja internih korisničkih naloga.

**Otvorena pitanja:** Da li se korisnička uloga dodjeljuje odmah prilikom kreiranja naloga ili u posebnom koraku nakon toga?

**Veze sa drugim storyjima:**  
Zavisi od storyja za podnosenje zahtjeva za internu ulogu (US-35), a povezan je sa storyjima za pregled korisnickih naloga (US-19) i promjenu korisnicke uloge (US-20).

**Acceptance Criteria:**

- **AC1: Uspješno kreiranje internog naloga**  
  - **GIVEN** administrator unese sve obavezne i ispravne podatke  
  - **WHEN** potvrdi kreiranje korisničkog naloga  
  - **THEN** sistem kreira novi interni korisnički nalog.

- **AC2: Nepotpuni podaci**  
  - **GIVEN** administrator nije unio sve obavezne podatke  
  - **WHEN** pokuša kreirati korisnički nalog  
  - **THEN** sistem ne kreira nalog i prikazuje poruku o grešci.

- **AC3: Dupliranje korisničkog naloga**  
  - **GIVEN** da u sistemu već postoji korisnik sa istim jedinstvenim identifikatorom  
  - **WHEN** administrator pokuša kreirati novi nalog  
  - **THEN** sistem ne kreira nalog i prikazuje odgovarajuću poruku.

- **AC4: Ograničenje pristupa**  
  - **GIVEN** korisnik nije administrator  
  - **WHEN** pokuša pristupiti funkcionalnosti kreiranja naloga  
  - **THEN** sistem mu ne dozvoljava pristup.

---

## US-19 — Pregled postojećih korisničkih naloga

**Opis:**  
Kao administrator, želim pregledati postojeće korisničke naloge, kako bih imao uvid u korisnike sistema i mogao njima upravljati.

**Poslovna vrijednost:**  
Ovaj story je važan jer administratoru omogućava pregled svih korisnika sistema, njihovih uloga i statusa naloga, što predstavlja osnovu za organizovano upravljanje pristupom i odgovornostima u sistemu.

**Prioritet:**  
*Srednji*

**Pretpostavke i otvorena pitanja:**  

**Pretpostavka:**  Pretpostavlja se da korisnički nalozi već postoje u sistemu.

**Otvorena pitanja:** Da li pregled treba prikazivati samo aktivne korisnike ili i deaktivirane naloge?

**Veze sa drugim storyjima:**  
Zavisi od storyja za administrativno kreiranje korisničkog naloga (US-18) i povezan je sa storyjima za promjenu korisničke uloge (US-20) i deaktivaciju korisničkog naloga (US-21).

**Acceptance Criteria:**

- **AC1: Prikaz liste korisničkih naloga**  
  - **GIVEN** u sistemu postoje korisnički nalozi  
  - **WHEN** administrator pristupi pregledu korisnika  
  - **THEN** sistem prikazuje listu korisničkih naloga.

- **AC2: Prikaz osnovnih podataka o korisniku**  
  - **GIVEN** administrator pregleda listu korisničkih naloga  
  - **WHEN** sistem prikaže korisnike  
  - **THEN** za svakog korisnika prikazuje osnovne informacije, uključujući ime, ulogu i status naloga.

- **AC3: Prikaz praznog stanja**  
  - **GIVEN** u sistemu nema korisničkih naloga  
  - **WHEN** administrator pristupi pregledu korisnika  
  - **THEN** sistem prikazuje odgovarajuću poruku da nema dostupnih korisnika.

- **AC4: Ograničenje pristupa**  
  - **GIVEN** korisnik nije administrator  
  - **WHEN** pokuša pristupiti pregledu korisničkih naloga  
  - **THEN** sistem mu ne dozvoljava pristup.

---

## US-20 — Promjena korisničke uloge

**Opis:**  
Kao administrator, želim promijeniti korisničku ulogu, kako bi korisnik imao pristup funkcionalnostima koje odgovaraju njegovoj novoj odgovornosti u sistemu.

**Poslovna vrijednost:**  
Ovaj story je važan jer omogućava da se prava pristupa i odgovornosti korisnika usklade sa njihovom stvarnom ulogom u poslovnom procesu, čime se povećava sigurnost sistema i podržava jasna organizacija rada.

**Prioritet:**  
*Srednji*

**Pretpostavke i otvorena pitanja:**  

**Pretpostavka:**  Pretpostavlja se da su korisničke uloge unaprijed definisane u sistemu.

**Otvorena pitanja:** Da li se promjena uloge primjenjuje odmah ili tek nakon naredne prijave korisnika?

**Veze sa drugim storyjima:**  
Zavisi od storyja za pregled korisničkih naloga (US-19) i povezan je sa storyjem za kontrolu pristupa prema korisničkoj ulozi (US-04).

**Acceptance Criteria:**

- **AC1: Uspješna promjena korisničke uloge**  
  - **GIVEN** administrator odabere postojećeg korisnika i novu ulogu  
  - **WHEN** potvrdi promjenu  
  - **THEN** sistem evidentira novu korisničku ulogu.

- **AC2: Prikaz ažurirane uloge**  
  - **GIVEN** korisnička uloga je uspješno promijenjena  
  - **WHEN** administrator pregleda korisnički nalog  
  - **THEN** sistem prikazuje novu ulogu korisnika.

- **AC3: Nevažeća promjena uloge**  
  - **GIVEN** administrator nije odabrao novu ulogu  
  - **WHEN** pokuša potvrditi izmjenu  
  - **THEN** sistem ne sprema promjenu i prikazuje poruku o grešci.

- **AC4: Ograničenje pristupa**  
  - **GIVEN** korisnik nije administrator  
  - **WHEN** pokuša promijeniti korisničku ulogu  
  - **THEN** sistem mu ne dozvoljava pristup toj funkcionalnosti.

---

## US-21 — Deaktivacija korisničkog naloga

**Opis:**  
Kao administrator, želim deaktivirati korisnički nalog, kako bih spriječio dalji pristup korisniku koji više ne treba koristiti sistem.

**Poslovna vrijednost:**  
Ovaj story je važan jer omogućava administratoru da onemogući pristup korisnicima koji više ne trebaju koristiti sistem, bez gubitka historijskih podataka i veza koje su vezane za njihov raniji rad.

**Prioritet:**  
*Srednji*

**Pretpostavke i otvorena pitanja:** 

**Pretpostavka:**  Pretpostavlja se da korisnički nalog već postoji u sistemu.

**Otvorena pitanja:** Da li deaktivirani korisnik ostaje vidljiv u listi korisnika i da li sistem prikazuje njegov status kao neaktivan?

**Veze sa drugim storyjima:**  
Zavisi od storyja za pregled korisničkih naloga (US-19) i povezan je sa storyjem za prijavu korisnika u sistem (US-02).

**Acceptance Criteria:**

- **AC1: Uspješna promjena statusa**  
  - **GIVEN** administrator pregleda listu aktivnih korisnika  
  - **WHEN** odabere opciju "Deaktiviraj" za specifičnog korisnika i potvrdi akciju  
  - **THEN** sistem mijenja status tog naloga u "Neaktivan" i bilježi vrijeme deaktivacije

- **AC2: Trenutni prekid sesije i zabrana pristupa**  
  - **GIVEN** korisnički nalog je upravo deaktiviran  
  - **WHEN** korisnik pokuša pristupiti bilo kojoj funkciji sistema ili se pokuša ponovo prijaviti 
  - **THEN** sistem mu uskraćuje pristup i ispisuje poruku: "Vaš nalog je deaktiviran. Kontaktirajte administratora."

- **AC3: Vidljivost u listi korisnika**  
  - **GIVEN** administrator pretražuje korisnike  
  - **WHEN** pregleda listu svih korisnika  
  - **THEN** neaktivni korisnici moraju biti jasno vizuelno označeni (npr. siva boja ili labela "Neaktivan") kako bi se razlikovali od aktivnih

- **AC4: Očuvanje integriteta podataka**  
  - **GIVEN** nalog je deaktiviran  
  - **WHEN** administrator pregleda izvještaje o ranijim intervencijama koje je taj korisnik radio 
  - **THEN** svi podaci, napomene i historija povezani sa tim nalogom moraju ostati netaknuti i vidljivi

---

## US-22 — Prihvatanje dodijeljenog zadatka

**Opis:**  
Kao serviser, želim prihvatiti dodijeljeni zadatak, kako bih potvrdio da preuzimam odgovornost za njegovu realizaciju.

**Poslovna vrijednost:**  
Ovaj story je važan jer omogućava da sistem evidentira da je serviser svjesno preuzeo odgovornost za izvršenje zadatka, što olakšava koordinaciju rada i praćenje toka intervencije.

**Prioritet:**  
*Visok*

**Pretpostavke i otvorena pitanja:**  

**Pretpostavka:**  Pretpostavlja se da je zadatak prethodno dodijeljen serviseru.

**Otvorena pitanja:** Da li prihvatanje zadatka automatski mijenja status intervencije?

**Veze sa drugim storyjima:**  
Zavisi od storyja za dodjelu intervencije odgovornom licu (US-09) i povezan je sa storyjem za ažuriranje statusa intervencije od strane servisera (US-14).

**Acceptance Criteria:**  
- **AC1: Uspješna promjena statusa zadatka**  
  - **GIVEN** serviser pregleda listu svojih zadataka i odabere zadatak koji je u statusu "Dodijeljeno"  
  - **WHEN** potvrdi akciju "Prihvati zadatak"  
  - **THEN** sistem mijenja status intervencije u "Prihvaćeno" (ili "U radu") i bilježi tačno vrijeme prihvatanja

- **AC2: Vidljivost dispečeru**  
  - **GIVEN** serviser je prihvatio zadatak  
  - **WHEN** dispečer pregleda globalnu listu intervencija  
  - **THEN** sistem prikazuje ažuriran status i informaciju koji serviser je preuzeo zadatak

- **AC3: Ograničenje akcije (Autorizacija)**  
  - **GIVEN** zadatak nije dodijeljen prijavljenom serviseru  
  - **WHEN** taj korisnik pokuša pristupiti opciji prihvatanja tog zadatka  
  - **THEN** sistem mu ne prikazuje opciju "Prihvati" ili mu onemogućava akciju uz odgovarajuću poruku

- **AC4: Validacija prethodnog stanja**  
  - **GIVEN** zadatak je već u statusu "Zatvoreno" ili "Otkazano"  
  - **WHEN** serviser pokuša izvršiti akciju prihvatanja  
  - **THEN** sistem onemogućava akciju jer zadatak više nije u aktivnoj fazi za dodjelu

---

## US-23 — Odbijanje dodijeljenog zadatka

**Opis:**  
Kao serviser, želim odbiti dodijeljeni zadatak, kako bi dispečer mogao pravovremeno reagovati i dodijeliti ga drugom izvršiocu.

**Poslovna vrijednost:**  
Ovaj story je važan jer omogućava da sistem evidentira da zadatak ne može biti preuzet, čime se izbjegava zastoj u procesu i omogućava pravovremena reakcija dispečera.

**Prioritet:**  
*Srednji*

**Pretpostavke i otvorena pitanja:**  

**Pretpostavka:**  Pretpostavlja se da je zadatak prethodno dodijeljen serviseru.

**Otvorena pitanja:** Da li serviser mora unijeti razlog odbijanja zadatka?

**Veze sa drugim storyjima:**  
Zavisi od storyja za dodjelu intervencije odgovornom licu (US-09) i povezan je sa storyjem za pregled dodijeljenih intervencija (US-15).

**Acceptance Criteria:**  
- **AC1: Obavezno navođenje razloga odbijanja**  
  - **GIVEN** serviser odabere opciju "Odbij zadatak"  
  - **WHEN** pokuša potvrditi akciju  
  - **THEN** sistem zahtijeva obavezan unos razloga (npr. putem padajućeg menija ili tekstualnog polja) i ne dozvoljava završetak akcije bez tog unosa

- **AC2: Promjena statusa i oslobađanje servisera**  
  - **GIVEN** serviser je unio razlog i potvrdio odbijanje  
  - **WHEN** sistem obradi zahtjev  
  - **THEN** status zadatka se vraća u "Neraspoređeno" (ili "Odbijeno - čeka dodjelu"), a zadatak se uklanja iz liste aktivnih zaduženja tog servisera

- **AC3: Obavještavanje dispečera**  
  - **GIVEN** zadatak je odbijen  
  - **WHEN** se status promijeni  
  - **THEN** sistem šalje automatsku notifikaciju dispečeru s informacijom o odbijanju i navedenim razlogom

- **AC4: Zabrana odbijanja započetog rada**  
  - **GIVEN** serviser je već promijenio status u "U toku"  
  - **WHEN** pokuša pristupiti opciji "Odbij"  
  - **THEN** sistem mu onemogućava tu opciju i upućuje ga na ponovnu dodjelu

---

## US-24 — Pregled evidentiranog izvršenog rada

**Opis:**  
Kao dispečer, želim pregledati evidentirani izvršeni rad, kako bih imao uvid u ono što je serviser uradio prije zatvaranja intervencije.

**Poslovna vrijednost:**  
Ovaj story je važan jer omogućava dispečeru da pregleda dokaz o obavljenom radu prije donošenja odluke o zatvaranju intervencije, čime se povećava kontrola procesa i pouzdanost završetka zadatka.

**Prioritet:**  
*Visok*

**Pretpostavke i otvorena pitanja:**  

**Pretpostavka:**  Pretpostavlja se da je serviser prethodno evidentirao izvršeni rad u sistemu.

**Otvorena pitanja:** Koji skup informacija dispečer mora minimalno vidjeti prije zatvaranja intervencije?

**Veze sa drugim storyjima:**  
Zavisi od storyja za evidentiranje izvršenog rada (US-17) i povezan je sa storyjem za potvrdu i zatvaranje intervencije (US-25).

**Acceptance Criteria:**  
- **AC1: Prikaz obaveznih detalja izvršenog rada**  
  - **GIVEN** serviser je evidentirao rad  
  - **WHEN** dispečer otvori detalje te intervencije  
  - **THEN** sistem prikazuje minimalno: opis obavljenog posla, datum i vrijeme završetka, utrošeno vrijeme (u satima/minutama) i listu zamijenjenih dijelova (ako ih ima)

- **AC2: Statusna uslovljenost pregleda**  
  - **GIVEN** intervencija još uvijek ima status "U toku"  
  - **WHEN** dispečer pokuša pristupiti sekciji izvještaja o radu  
  - **THEN** sistem prikazuje informaciju da rad još uvijek nije evidentiran od strane servisera

- **AC3: Zabrana modifikacije podataka (Read-only)**  
  - **GIVEN** dispečer pregleda evidentirani rad  
  - **WHEN** se nalazi na ekranu za pregled izvještaja  
  - **THEN** sistem onemogućava dispečeru bilo kakvu izmjenu unesenog teksta ili podataka servisera, osiguravajući integritet izvještaja

- **AC4: Vidljivost priloga**  
  - **GIVEN** serviser je uz izvještaj priložio fotografije kvara/popravke  
  - **WHEN** dispečer pregleda izvještaj  
  - **THEN** sistem omogućava pregled i preuzimanje svih priloženih datoteka/fotografija

---

## US-25 — Potvrda i zatvaranje intervencije

**Opis:**  
Kao dispečer, želim potvrditi i zatvoriti završenu intervenciju, kako bi proces bio formalno okončan u sistemu.

**Poslovna vrijednost:**  
Ovaj story je važan jer omogućava da se intervencija zvanično završi tek nakon pregleda izvršenog rada, čime se osigurava kontrolisan i pouzdan završetak procesa.

**Prioritet:**  
*Visok*

**Pretpostavke i otvorena pitanja:**  

**Pretpostavka:**  Pretpostavlja se da je serviser prethodno ažurirao status i evidentirao izvršeni rad.

**Otvorena pitanja:** Da li zatvaranje automatski mijenja status u završeno ili postoji poseban završni status zatvoreno?


**Veze sa drugim storyjima:**  
Zavisi od storyja za ažuriranje statusa intervencije od strane servisera (US-14) i storyja za pregled evidentiranog izvršenog rada (US-24).

**Acceptance Criteria:**  
- **AC1: Promjena statusa u finalno stanje**  
  - **GIVEN** dispečer je pregledao rad i odabrao opciju "Potvrdi i zatvori"  
  - **WHEN** sistem obradi komandu  
  - **THEN** status intervencije se automatski mijenja iz "Čeka potvrdu" u "Zatvoreno" (Closed)

- **AC2: Onemogućavanje daljih izmjena**  
  - **GIVEN** intervencija je u statusu "Zatvoreno"  
  - **WHEN** bilo koji korisnik pokuša izmijeniti podatke, dodati napomenu ili promijeniti status  
  - **THEN** sistem onemogućava sve akcije uređivanja i prikazuje obavijest da je intervencija arhivirana i zaključana

- **AC3: Automatsko bilježenje vremena zatvaranja**  
  - **GIVEN** proces zatvaranja je uspješan  
  - **WHEN** sistem zapiše promjenu u bazu podataka  
  - **THEN** sistem automatski generiše i sprema vremenski pečat (datum i vrijeme) u polje "Datum zatvaranja"

- **AC4: Arhiviranje i vidljivost**  
  - **GIVEN** intervencija je zatvorena  
  - **WHEN** korisnik pretražuje listu aktivnih intervencija  
  - **THEN** sistem uklanja tu intervenciju sa liste aktivnih zadataka i premješta je u sekciju "Arhiva" ili "Završene intervencije"

---

## US-26 — Izmjena vlastitog zahtjeva

**Opis:**   
Kao korisnik usluge, želim izmijeniti svoj zahtjev dok još nije preuzet u obradu, kako bih mogao ispraviti pogrešno unesene ili nepotpune podatke.  

**Poslovna vrijednost:**  
Ovaj story je važan jer omogućava korisniku da ispravi greške u prijavi bez potrebe da pravi novi zahtjev, čime se povećava tačnost podataka i smanjuje broj pogrešno evidentiranih intervencija.  

**Prioritet:**  
*Srednji*  

**Pretpostavke i otvorena pitanja:**  

**Pretpostavka:**  Pretpostavlja se da je izmjena dozvoljena samo dok zahtjev nije dodijeljen ili dok rad na njemu nije započeo.

**Otvorena pitanja:** Koje podatke korisnik smije mijenjati?

**Veze sa drugim storyjima:**  
Zavisi od storyja za prijavu zahtjeva za servisnu intervenciju (US-05) i povezan je sa storyjem za pregled vlastitog zahtjeva (US-06).  

**Acceptance Criteria:**  
- **AC1: Definicija dozvoljenih polja za izmjenu**  
  - **GIVEN** korisnik otvori formu za izmjenu zahtjeva  
  - **WHEN** sistem učita podatke  
  - **THEN** sistem dozvoljava izmjenu isključivo sljedećih polja: opis kvara, kontakt telefon, dodatne napomene i adresa lokacije (ukoliko intervencija nije započeta)

- **AC2: Onemogućavanje izmjene ključnih sistemskih polja**  
  - **GIVEN** korisnik je u modu za izmjenu  
  - **WHEN** pregleda formu  
  - **THEN** sistem onemogućava izmjenu polja kao što su: ID zahtjeva, datum i vrijeme prvobitne prijave i trenutni status zahtjeva

- **AC3: Zabrana izmjene nakon dodjele**  
  - **GIVEN** dispečer je već dodijelio zahtjev serviseru (status "Dodijeljeno" ili "U toku")  
  - **WHEN** korisnik pokuša pristupiti opciji "Izmijeni"  
  - **THEN** sistem sakriva dugme za izmjenu ili prikazuje poruku da izmjena više nije moguća jer je zahtjev u procesu obrade

- **AC4: Validacija izmijenjenih podataka**  
  - **GIVEN** korisnik je unio nove podatke i kliknuo "Sačuvaj"  
  - **WHEN** sistem primi podatke  
  - **THEN** sistem vrši istu validaciju kao i kod prve prijave (npr. provjera obaveznih polja) i ažurira zapis u bazi podataka uz bilježenje vremena izmjene

---

## US-27 — Otkazivanje vlastitog zahtjeva

**Opis:**  
Kao korisnik usluge, želim otkazati svoj zahtjev dok još nije u aktivnoj obradi, kako bih mogao povući greškom prijavljen ili više nepotreban zahtjev.  

**Poslovna vrijednost:**  
Ovaj story je važan jer sprečava da pogrešno prijavljeni ili više nepotrebni zahtjevi ostanu aktivni u sistemu, čime se smanjuje operativni šum i olakšava rad dispečera i servisera.  

**Prioritet:**  
*Srednji*  

**Pretpostavke i otvorena pitanja:**  

**Pretpostavka:**  Pretpostavlja se da je otkazivanje dozvoljeno samo dok zahtjev nije dodijeljen izvršiocu ili dok rad nije počeo.

**Otvorena pitanja:** Da li sistem treba čuvati razlog otkazivanja?

**Veze sa drugim storyjima:**  
„Zavisi od storyja za prijavu zahtjeva za servisnu intervenciju (US-05) i povezan je sa storyjem za pregled vlastitog zahtjeva (US-06).  

**Acceptance Criteria:**  
- **AC1: Obavezan unos razloga otkazivanja**  
  - **GIVEN** korisnik odabere opciju "Otkaži zahtjev"  
  - **WHEN** sistem otvori potvrdni dijalog  
  - **THEN** sistem zahtijeva od korisnika da odabere ili upiše razlog otkazivanja (npr. "Greška u prijavi", "Kvar otklonjen samostalno") i ne dozvoljava nastavak bez unosa

- **AC2: Promjena statusa u finalno stanje**  
  - **GIVEN** korisnik je potvrdio otkazivanje i naveo razlog  
  - **WHEN** sistem obradi akciju  
  - **THEN** status zahtjeva se mijenja u "Otkazano" i zahtjev se uklanja sa liste aktivnih zadataka dispečera

- **AC3: Zabrana otkazivanja nakon početka obrade**  
  - **GIVEN** zahtjev je već u statusu "Dodijeljeno" ili "U toku"  
  - **WHEN** korisnik pokuša pristupiti opciji otkazivanja  
  - **THEN** sistem onemogućava akciju i prikazuje poruku da je zahtjev već preuzet od strane servisera te da otkazivanje više nije moguće putem aplikacije

- **AC4: Bilježenje vremena otkazivanja**  
  - **GIVEN** akcija otkazivanja je uspješna  
  - **WHEN** sistem ažurira bazu podataka  
  - **THEN** sistem automatski bilježi tačan datum i vrijeme otkazivanja uz navedeni razlog 

---

## US-28 — Promjena izvršioca intervencije

**Opis:**  
Kao dispečer, želim promijeniti izvršioca intervencije, kako bi zadatak mogao biti dodijeljen drugom serviseru kada prvobitno dodijeljeni izvršilac ne može preuzeti ili završiti rad.  

**Poslovna vrijednost:**  
Ovaj story je važan jer omogućava da operativni tok ne "zapne" kada dodijeljeni serviser postane nedostupan ili ne može izvršiti zadatak, čime se povećava fleksibilnost i pouzdanost sistema.  

**Prioritet:**  
*Srednji*  

**Pretpostavke i otvorena pitanja:**  

**Pretpostavka:**  Pretpostavlja se da intervencija već ima dodijeljenog izvršioca.

**Otvorena pitanja:** Da li se prilikom promjene izvršioca automatski evidentira prethodno zaduženje u historiji aktivnosti?

**Veze sa drugim storyjima:**  
Zavisi od storyja za dodjelu intervencije odgovornom serviseru (US-09) i povezan je sa storyjima za pregled otvorenih intervencija (US-07), pregled detalja pojedinačne intervencije (US-08) i pregled statusa intervencija od strane dispečera (US-13). 

**Acceptance Criteria:**  
- **AC1: Odabir i validacija novog izvršioca**  
  - **GIVEN** dispečer pokrene akciju promjene izvršioca  
  - **WHEN** sistem prikaže listu dostupnih servisera i dispečer odabere novog izvršioca (Serviser B)  
  - **THEN** sistem ažurira polje trenutnog izvršioca na novog servisera i šalje mu notifikaciju o novom zaduženju

- **AC2: Automatsko evidentiranje prethodnog zaduženja (Audit Log)**  
  - **GIVEN** izvršilac je uspješno promijenjen  
  - **WHEN** sistem zapiše promjenu u bazu podataka  
  - **THEN** sistem automatski kreira zapis u historiji aktivnosti koji sadrži ime prethodnog izvršioca, ime novog izvršioca, razlog promjene i vremenski pečat

- **AC3: Oslobađanje prethodnog izvršioca**  
  - **GIVEN** intervencija je preraspodijeljena  
  - **WHEN** sistem ažurira liste zaduženja  
  - **THEN** sistem automatski uklanja tu intervenciju sa liste aktivnih zadataka prethodno dodijeljenog servisera (Serviser A) i šalje mu obavijest o povlačenju zadatka

- **AC4: Zabrana promjene na zatvorenim intervencijama**  
  - **GIVEN** intervencija je već u statusu "Zatvoreno" ili "Otkazano"  
  - **WHEN** dispečer pokuša pristupiti opciji promjene izvršioca  
  - **THEN** sistem onemogućava tu opciju i prikazuje poruku da se izvršilac ne može mijenjati na arhiviranim zahtjevima

    
---

## US-29 — Vraćanje zadatka na ponovnu dodjelu  

**Opis:**  
Kao serviser, želim vratiti zadatak na ponovnu dodjelu, kako bi dispečer mogao organizovati dalje izvršenje kada zadatak nije moguće završiti u postojećim okolnostima.  

**Poslovna vrijednost:**  
Ovaj story je važan jer omogućava da se zadatak ne zaglavi kod servisera koji ga ne može završiti, nego da se vrati u operativni tok i ponovo organizuje na ispravan način.  

**Prioritet:**  
*Srednji*  

**Pretpostavke i otvorena pitanja:**  

**Pretpostavka:**  Pretpostavlja se da je serviser već preuzeo ili započeo obradu zadatka.

**Otvorena pitanja:** Da li je unos napomene ili razloga vraćanja obavezan?

**Veze sa drugim storyjima:**  
Zavisi od storyja za prihvatanje dodijeljenog zadatka (US-22) i povezan je sa storyjima za promjenu izvršioca intervencije (US-28), pregled dodijeljenih intervencija (US-15) i ažuriranje statusa intervencije od strane servisera (US-14).  

**Acceptance Criteria:**  
- **AC1: Obavezan unos razloga vraćanja**  
  - **GIVEN** serviser odabere opciju "Vrati na ponovnu dodjelu"  
  - **WHEN** pokuša potvrditi akciju  
  - **THEN** sistem zahtijeva obavezan unos detaljnog obrazloženja (tekstualni unos) i ne dozvoljava završetak akcije bez tog unosa

- **AC2: Automatska promjena statusa i oslobađanje servisera**  
  - **GIVEN** serviser je potvrdio vraćanje zadatka s obrazloženjem  
  - **WHEN** sistem obradi zahtjev  
  - **THEN** status zadatka se mijenja u stanje spremno za ponovnu dodjelu (`potvrdeno` u MVP implementaciji), a zadatak se uklanja iz liste aktivnih zaduženja tog servisera (`serviser_dodijeljen_id = null`)

- **AC3: Prioritetna notifikacija dispečeru**  
  - **GIVEN** zadatak je vraćen na ponovnu dodjelu  
  - **WHEN** se status promijeni u bazi podataka  
  - **THEN** sistem šalje hitnu notifikaciju dispečeru koja sadrži ID zadatka i uneseno obrazloženje servisera radi hitne reakcije

- **AC4: Onemogućavanje vraćanja završenog zadatka**  
  - **GIVEN** intervencija je već u statusu "Zatvoreno" ili "Izvršeno - čeka potvrdu"  
  - **WHEN** korisnik pokuša pristupiti opciji vraćanja  
  - **THEN** sistem sakriva opciju vraćanja ili onemogućava akciju jer zadatak više nije u fazi aktivne obrade na terenu

---

## US-40 — Označavanje intervencije kao nije riješena

**Opis:**  
Kao serviser, želim označiti intervenciju kao nije riješena, kako bi dispečer bio obaviješten i mogao poduzeti daljnje korake.

**Poslovna vrijednost:**  
Serviser ponekad ne može završiti intervenciju (nedostupna oprema, odsutan korisnik, iznenadni tehnički problemi). Bez ove funkcionalnosti, intervencija bi ostala zapela u statusu `u_izvrsenju` bez mogućnosti ponovne dodjele.

**Prioritet:**  
*Srednji*

**Veze sa drugim storyjima:**  
Povezan sa storyjima za vraćanje zadatka na ponovnu dodjelu (US-29), ažuriranje statusa intervencije (US-14) i promjenu izvršioca (US-28).

**Acceptance Criteria:**  
- AC1: Serviser može označiti intervenciju u statusu `u_izvrsenju` kao nije riješena
- AC2: Sistem zahtijeva unos razloga (min 10, max 500 znakova)
- AC3: Sistem mijenja status intervencije u `potvrdeno`, serviser_dodijeljen_id se briše
- AC4: Evidencija se bilježi u `intervention_activities` sa tipom `nije_rijeseno`
- AC5: Dispečer prima notifikaciju i vidi razlog u historiji aktivnosti
- AC6: Serviser ne može označiti kao nije riješeno intervenciju koja nije u statusu `u_izvrsenju`

---

## US-30 — Razmjena napomena na intervenciji  

**Opis:**  
Kao dispečer ili serviser, želim dodati kratku napomenu na konkretnu intervenciju, kako bi sve važne operativne informacije bile dostupne na jednom mjestu svim učesnicima u procesu.  

**Poslovna vrijednost:**  
Ovaj story je važan jer omogućava brzu i direktnu komunikaciju između ureda i terena bez potrebe za vanjskim kanalima komunikacije, osiguravajući da ključni detalji (npr. specifične upute za pristup lokaciji) ostanu trajno vezani uz zahtjev.  

**Prioritet:**  
*Srednji*  

**Pretpostavke i otvorena pitanja:**  

**Pretpostavka:**  Pretpostavlja se da korisnik ima pravo pristupa detaljima konkretne intervencije.

**Otvorena pitanja:** Da li su napomene vidljive korisniku usluge ili služe isključivo za internu komunikaciju?

**Veze sa drugim storyjima:**  
Povezano sa storyjima za pregled detalja pojedinačne intervencije (US-08), pregled detalja zadatka na terenu (US-16) i vraćanje zadatka na ponovnu dodjelu (US-29). 

**Acceptance Criteria:**  
- **AC1: Dodavanje i pohrana napomene**  
  - **GIVEN** dispečer ili serviser otvori sekciju za napomene na intervenciji  
  - **WHEN** unese tekst i potvrdi spasavanje  
  - **THEN** sistem pohranjuje napomenu uz automatsko bilježenje imena autora, njegove uloge (npr. Serviser) i tačnog vremena unosa (timestamp)

- **AC2: Hronološki pregled komunikacije**  
  - **GIVEN** na intervenciji postoji više napomena  
  - **WHEN** bilo koji ovlašteni interni korisnik pregleda historiju napomena  
  - **THEN** sistem prikazuje sve napomene poredane hronološki od najnovije ka najstarijoj radi lakšeg praćenja toka informacija

- **AC3: Interna povjerljivost (Zabrana prikaza klijentu)**  
  - **GIVEN** klijent (korisnik usluge) je prijavljen na sistem i pregleda svoj zahtjev  
  - **WHEN** sistem učitava podatke o zahtjevu  
  - **THEN** sistem klijentu ne prikazuje sekciju sa internim napomenama dispečera i servisera, osiguravajući da operativna komunikacija ostane isključivo interna

- **AC4: Ograničenje dužine i formata**  
  - **GIVEN** korisnik unosi napomenu  
  - **WHEN** pokuša spasiti tekst  
  - **THEN** sistem dozvoljava unos samo u tekstualnom formatu i ograničava dužinu na razuman broj karaktera (npr. 500) kako bi se zadržala preglednost
    
---

## US-31 — Pregled sažetog operativnog statusa intervencija

**Opis:**  
Kao dispečer, želim na početnom ekranu vidjeti sažet operativni status intervencija, kako bih odmah imao pregled trenutnog obima posla i stanja intervencija po ključnim fazama obrade.

**Poslovna vrijednost:**  
Ovaj story je važan jer dispečeru omogućava brz i jasan uvid u trenutno stanje sistema bez potrebe da otvara pojedinačne intervencije ili detaljne liste. Na taj način se ubrzava donošenje operativnih odluka, lakše se uočavaju zastoji i omogućava efikasnije upravljanje radom.

**Prioritet:**  
Srednji

**Pretpostavke i otvorena pitanja:**

**Pretpostavka:** Pretpostavlja se da sistem već evidentira statuse intervencija i razlikuje osnovne faze obrade, kao što su otvoreno, dodijeljeno, u toku, čeka potvrdu i zatvoreno.

**Otvorena pitanja:** Koji skup pokazatelja treba biti prikazan na operativnoj kontrolnoj tabli u ovoj fazi, samo broj intervencija po statusima ili i dodatne informacije poput broja visokoprioritetnih intervencija, intervencija bez dodijeljenog izvršioca i planiranih izlazaka na teren?

**Veze sa drugim storyjima:**  
„Zavisi od storyja za pregled otvorenih intervencija (US-07), pregled statusa intervencija od strane dispečera (US-13) i ažuriranje statusa intervencije od strane servisera (US-14). Povezan je sa storyjima za pregled detalja pojedinačne intervencije (US-08), određivanje prioriteta intervencije (US-12) i planiranje intervencije (US-11).

**Acceptance Criteria:**

- **AC1: Prikaz sažetih operativnih pokazatelja**  
  - **GIVEN** u sistemu postoje evidentirane intervencije u različitim fazama obrade  
  - **WHEN** dispečer pristupi početnom ekranu ili operativnoj kontrolnoj tabli  
  - **THEN** sistem prikazuje sažet brojčani pregled intervencija po unaprijed definisanim statusima

- **AC2: Ažuriran prikaz operativnog statusa**  
  - **GIVEN** status jedne ili više intervencija je promijenjen u sistemu  
  - **WHEN** dispečer osvježi početni ekran ili ponovo pristupi operativnoj kontrolnoj tabli  
  - **THEN** sistem prikazuje ažurirane brojčane pokazatelje koji odgovaraju stvarnom stanju u sistemu

- **AC3: Prikaz samo relevantnih operativnih podataka**  
  - **GIVEN** dispečer pregleda operativnu kontrolnu tablu  
  - **WHEN** sistem učita sažeti prikaz  
  - **THEN** prikazuju se samo podaci relevantni za operativno praćenje rada, bez nepotrebnih detalja o pojedinačnim intervencijama

- **AC4: Ograničenje pristupa operativnom dashboardu**  
  - **GIVEN** korisnik nema ulogu dispečera ili drugo odgovarajuće ovlaštenje  
  - **WHEN** pokuša pristupiti operativnom dashboardu  
  - **THEN** sistem mu ne dozvoljava pristup toj funkcionalnosti

- **AC5: Mogućnost prelaska na detaljniji pregled**  
  - **GIVEN** dispečer pregleda sažeti operativni status intervencija  
  - **WHEN** odabere jedan od prikazanih pokazatelja ili statusa  
  - **THEN** sistem omogućava prelazak na odgovarajući detaljniji pregled liste intervencija koje pripadaju toj kategoriji

---

## US-41 — SLA praćenje

**Opis:**  
Kao dispečer, želim da sistem automatski prati SLA rokove za svaku intervenciju, kako bih mogao reagovati na kašnjenja i osigurati poštivanje dogovorenih nivoa usluge.

**Poslovna vrijednost:**  
Bez vidljivosti u SLA status, dispečer ne može proaktivno reagovati na intervencije koje kasne. Vizualni indikatori smanjuju rizik od kršenja dogovorenih rokova s klijentima.

**Prioritet:**  
*Srednji*

**Veze sa drugim storyjima:**  
Povezan sa storyjima za pregled sažetog operativnog statusa (US-31), određivanje prioriteta intervencije (US-12) i pregled otvorenih intervencija (US-07).

**Acceptance Criteria:**  
- AC1: Sistem automatski izračunava SLA rok na osnovu prioriteta intervencije i `created_at`
- AC2: Sistem vizualno označava intervencije kojima SLA ističe u roku od 2 sata (upozorenje)
- AC3: Sistem vizualno označava intervencije kod kojih je SLA prekoračen (crveno)
- AC4: Dispečer dashboard prikazuje broj intervencija sa prekoračenim SLA
- AC5: SLA rokovi po prioritetu: HITNO/KRITIČNO = 2h, VISOKO = 8h, SREDNJE = 24h, NISKO = 72h
- AC6: SLA se ne primjenjuje na zatvorene, otkazane ili odbijene intervencije

---

## US-42 — Izvještaj odziva servisera

**Opis:**  
Kao dispečer, želim pregledati izvještaj o odzivnim vremenima servisera, kako bih mogao pratiti performanse tima i identifikovati probleme u efikasnosti.

**Poslovna vrijednost:**  
Dispečer bez agregiranih metrika ne može objektivno ocjenjivati performanse servisera niti donositi informisane odluke o raspoređivanju. Izvještaj omogućava mjerenje odzivnosti tima.

**Prioritet:**  
*Nizak*

**Veze sa drugim storyjima:**  
Povezan sa storyjima za dodjelu intervencije (US-09), prihvatanje zadatka (US-22) i evidentiranje izvršenog rada (US-17).

**Acceptance Criteria:**  
- AC1: Sistem prikazuje prosječno vrijeme odziva po serviseru (od dodjele do prihvatanja)
- AC2: Sistem prikazuje prosječno trajanje izvršenja po serviseru
- AC3: Izvještaj je filtrabilan po vremenskom periodu (`od`/`do` query parametri)
- AC4: Izvještaj je dostupan samo dispečeru i adminu (RBAC)
- AC5: Sistem prikazuje ukupan broj intervencija po serviseru u odabranom periodu

---

## US-32 — Pregled historije aktivnosti intervencije  

**Opis:** 
Kao dispečer, želim vidjeti listu svih prethodnih promjena i aktivnosti na zahtjevu, kako bih imao jasan uvid u hronologiju obrade od trenutka prijave do trenutnog statusa.  

**Poslovna vrijednost:**  
Ovaj story je važan jer osigurava transparentnost i omogućava praćenje toka rada (audit trail). Pomaže u rješavanju nesporazuma i pruža uvid u to ko je, kada i koju akciju poduzeo na konkretnom zahtjevu.  

**Prioritet:**  
*Srednji*  

**Pretpostavke i otvorena pitanja:**  

**Pretpostavka:**  Pretpostavlja se da sistem automatski bilježi ključne promjene (status, dodjela, prioritet).

**Otvorena pitanja:** Koliki nivo detalja historija treba sadržavati (npr. da li bilježi i stare vrijednosti polja prije izmjene)?

**Veze sa drugim storyjima:**  
Zavisi od svih storyja koji mijenjaju stanje intervencije: prijava zahtjeva za servisnu intervenciju (US-05), dodjela intervencije odgovornom serviseru ili timu (US-09 / US-10), promjena statusa intervencije od strane servisera (US-14), planiranje intervencije (US-11) i određivanje prioriteta intervencije (US-12). 

**Acceptance Criteria:**  
- **AC1: Automatsko generisanje zapisa**  
  - **GIVEN** bilo koji ovlašteni korisnik je izvršio promjenu na intervenciji (npr. promjena statusa ili dodjela servisera)  
  - **WHEN** sistem uspješno spasi promjenu u bazu podataka  
  - **THEN** sistem automatski kreira novi zapis u historiji aktivnosti bez potrebe za ručnim unosom od strane korisnika

- **AC2: Sadržaj i detalji zapisa**  
  - **GIVEN** dispečer otvori sekciju "Historija aktivnosti"  
  - **WHEN** pregleda listu promjena  
  - **THEN** svaki pojedinačni zapis mora sadržavati: datum i tačno vrijeme promjene, ime i ulogu korisnika koji je izvršio akciju, naziv promijenjenog polja, staru vrijednost i novu vrijednost

- **AC3: Hronološki prikaz događaja**  
  - **GIVEN** intervencija ima više zabilježenih aktivnosti  
  - **WHEN** učita se stranica sa historijom  
  - **THEN** sistem prikazuje listu hronološki, pri čemu su najnovije promjene na samom vrhu liste radi bržeg uvida u trenutno stanje

- **AC4: Onemogućavanje brisanja historije**  
  - **GIVEN** zapisi u historiji su jednom kreirani  
  - **WHEN** bilo koji korisnik pokuša obrisati ili izmijeniti zapis u historiji  
  - **THEN** sistem onemogućava takve akcije i garantuje integritet audit trail-a kao trajnog dokaza o radu

---

## US-39 — Audit trail sa starim i novim vrijednostima

**Opis:**  
Kao dispečer, želim vidjeti stare i nove vrijednosti u historiji aktivnosti, kako bih mogao pratiti tačne promjene koje su se desile tokom životnog ciklusa intervencije.

**Poslovna vrijednost:**  
Prikaz samo tipa promjene nije dovoljan za efikasnu kontrolu — dispečer mora vidjeti konkretne vrijednosti (npr. status: dodijeljeno → u_radu) kako bi mogao brzo razumjeti tok bez čitanja narativnih opisa.

**Prioritet:**  
*Srednji*

**Veze sa drugim storyjima:**  
Proširenje storyja za pregled historije aktivnosti (US-32); povezan sa promjenom statusa (US-14), dodjelom servisera (US-09) i određivanjem prioriteta (US-12).

**Acceptance Criteria:**  
- AC1: Svaka promjena statusa bilježi stari i novi status u `old_value`/`new_value`
- AC2: Promjena servisera bilježi ID starog i novog servisera
- AC3: Promjena prioriteta bilježi staru i novu vrijednost prioriteta
- AC4: Historija aktivnosti prikazuje `old_value → new_value` za relevantne promjene
- AC5: Audit trail je dostupan samo dispečeru i adminu (RBAC)

---

## US-34 — Aktivacija Premium usluge
**Opis:** Kao korisnik usluge, želim aktivirati Premium paket kroz sistem, kako bih mogao koristiti opciju premium zahtjeva i dobiti prioritetnu obradu intervencija.

**Poslovna vrijednost:** Ovaj story uvodi jasan i provjerljiv tok aktivacije premium usluge, smanjuje nejasnoće oko naplate i omogućava da se premium pogodnosti dodjeljuju samo korisnicima sa validnim statusom.

**Prioritet:** Visok

**Pretpostavke i otvorena pitanja:** Pretpostavka: U MVP verziji aktivacija premium paketa se provodi kroz simulirani tok naplate unutar sistema (bez integracije eksternog payment gateway-a). Nakon uspješne aktivacije korisniku se dodjeljuje status `premium_status = active` sa periodom važenja.

**Otvorena pitanja:** Da li post-MVP verzija premium paketa treba podržavati automatsku obnovu pretplate ili samo ručno produženje?

**Veze sa drugim storyjima:** Povezano sa storyjem za prijavu zahtjeva (US-05), premium zahtjev (US-33), kontrolu pristupa prema ulozi (US-04) i pregled vlastitog zahtjeva (US-06).

**Acceptance Criteria:**

- **AC1: Pokretanje aktivacije Premium paketa**
  - **GIVEN** korisnik je prijavljen u sistem i nema aktivan premium status
  - **WHEN** otvori sekciju "Premium usluga" i odabere opciju aktivacije
  - **THEN** sistem prikazuje dostupne pakete, cijenu, period važenja i uslove korištenja

- **AC2: Uspješna naplata i aktivacija**
  - **GIVEN** korisnik je odabrao premium paket i unio validne podatke za plaćanje
  - **WHEN** platna transakcija bude potvrđena kao uspješna
  - **THEN** sistem korisniku postavlja status `premium_active`, evidentira datum početka i datum isteka, te prikazuje potvrdu aktivacije

- **AC3: Neuspješna naplata**
  - **GIVEN** korisnik je pokrenuo plaćanje premium paketa
  - **WHEN** transakcija bude odbijena ili neuspješna
  - **THEN** sistem ne aktivira premium status, prikazuje razlog greške i omogućava novi pokušaj plaćanja

- **AC4: Korištenje premium opcije pri prijavi zahtjeva**
  - **GIVEN** korisnik pokušava označiti premium opciju tokom prijave zahtjeva (US-33)
  - **WHEN** sistem provjeri premium status korisnika
  - **THEN** premium oznaka je dozvoljena samo ako korisnik ima status `premium_status = active`; u suprotnom sistem onemogućava premium opciju i nudi preusmjeravanje na aktivaciju

- **AC5: Istek premium statusa**
  - **GIVEN** korisnik je imao aktivan premium paket
  - **WHEN** istekne period važenja paketa
  - **THEN** sistem automatski mijenja status u `premium_status = expired`, uklanja pravo na nove premium zahtjeve i prikazuje korisniku obavijest o isteku

- **AC6: Evidencija i audit aktivacije**
  - **GIVEN** došlo je do promjene premium statusa (aktivacija, obnova, istek ili neuspješna naplata)
  - **WHEN** sistem završi obradu događaja
  - **THEN** sistem kreira audit zapis sa tipom događaja, vremenom i identifikatorom korisnika/transakcije

---

## US-33 — Zahtjev za Premium (Hitnom) uslugom
**Opis:** Kao korisnik usluge, želim odabrati "Premium" opciju prilikom prijave kvara, kako bih osigurao prioritetnu obradu zahtjeva i brži izlazak servisera na teren, bez obzira na vrstu kvara.

**Poslovna vrijednost:** Ovaj story omogućava korisnicima koji su spremni platiti više (ili imaju pretplatu) da preskoče redovnu listu čekanja. Za firmu, ovo donosi veće prihode i omogućava bolju segmentaciju klijenata.

**Prioritet:** Visok (ako je biznis model baziran na hitnosti)

**Pretpostavke i otvorena pitanja:** Pretpostavka: Sistem razlikuje standardne i premium zahtjeve. Premium zahtjev automatski dobiva najviši operativni prioritet.

**Napomena o MVP naplati:** U MVP-u se koristi simulacija premium naplate/statusa. Integracija stvarnog payment procesa nije obuhvaćena ovom verzijom.

**Veze sa drugim storyjima:** Povezano sa storyjem za prijava zahtjeva (US-05), pregled otvorenih intervencija (US-07) i određivanje prioriteta (US-12).

**Acceptance Criteria:**

- **AC1: Odabir Premium opcije tokom prijave**
  - **GIVEN** korisnik je završio korake izbora kategorije i potkategorije u US-05 i nalazi se na koraku "Hitnost"
  - **WHEN** označi opciju "Premium — hitna intervencija (dodatni troškovi)"
  - **THEN** sistem evidentira zahtjev sa specijalnom oznakom `is_premium = true` i prikazuje korisniku obavijest o uslovima te usluge.

- **AC2: Vizuelno isticanje u dispečerskoj listi**
  - **GIVEN** novi Premium zahtjev je kreiran
  - **WHEN** dispečer pregleda listu otvorenih intervencija (US-07)
  - **THEN** taj zahtjev mora biti vizuelno istaknut (npr. crveni/žuti okvir, ikona "Premium" ili "HITNO") i postavljen na sam vrh liste.

- **AC3: Automatsko obavještavanje (Instant Alert)**
  - **GIVEN** korisnik je potvrdio Premium zahtjev
  - **WHEN** sistem kreira zapis
  - **THEN** sistem šalje trenutnu notifikaciju (Push/SMS/Email) svim slobodnim dispečerima s informacijom da je pristigao Premium zahtjev koji čeka dodjelu.

- **AC4: Automatski prioritet**
  - **GIVEN** dispečer otvori detalje Premium zahtjeva
  - **WHEN** sistem učita podatke
  - **THEN** operativni prioritet (US-12) je unaprijed postavljen na "Hitno" i dispečer ga ne može sniziti bez unosa posebnog obrazloženja.

- **AC5: Prioritetni status u pregledu za servisere**
  - **GIVEN** Premium zahtjev je dodijeljen serviseru
  - **WHEN** serviser otvori svoju listu zadataka (US-15)
  - **THEN** Premium zadatak mora biti pri vrhu liste uz jasnu oznaku hitnosti.

---
## US-36 — Uređivanje korisničkog naloga

**Opis:**  
Kao administrator, želim urediti podatke postojećeg korisničkog naloga, kako bih mogao ispraviti netačne podatke i održavati ažurne informacije o korisnicima sistema.

**Poslovna vrijednost:**  
Ovaj story je važan jer omogućava administratoru da održava tačne i ažurne korisničke podatke bez potrebe za kreiranjem novog naloga. Time se smanjuje broj duplih naloga, čuva kontinuitet korisničke historije i poboljšava upravljanje korisnicima sistema.

**Prioritet:**  
Srednji

**Pretpostavke i otvorena pitanja:**  

Pretpostavka: Administrator ima pravo pristupa sekciji za upravljanje korisničkim nalozima.

Otvorena pitanja: Koja polja administrator smije uređivati, a koja se ne smiju mijenjati zbog sigurnosti i integriteta sistema?

**Veze sa drugim storyjima:**  
Povezano sa storyjima za pregled postojećih korisničkih naloga (US-19), promjenu korisničke uloge (US-20), deaktivaciju korisničkog naloga (US-21) i kontrolu pristupa prema korisničkoj ulozi (US-04).

**Acceptance Criteria:**

- **AC1: Otvaranje forme za uređivanje korisnika**

  - **GIVEN** administrator pregleda listu korisničkih naloga  
  - **WHEN** odabere opciju za uređivanje konkretnog korisnika  
  - **THEN** sistem prikazuje formu sa postojećim podacima tog korisnika

- **AC2: Uspješna izmjena korisničkih podataka**

  - **GIVEN** administrator izmijeni dozvoljena polja korisničkog naloga  
  - **WHEN** potvrdi izmjene  
  - **THEN** sistem sprema nove podatke i prikazuje ažurirane informacije o korisniku

- **AC3: Validacija obaveznih podataka**

  - **GIVEN** administrator izbriše ili neispravno popuni obavezno polje  
  - **WHEN** pokuša sačuvati izmjene  
  - **THEN** sistem ne sprema promjene i prikazuje validacijsku poruku

- **AC4: Zaštita sistemski osjetljivih podataka**

  - **GIVEN** administrator uređuje korisnički nalog  
  - **WHEN** sistem prikaže formu za uređivanje  
  - **THEN** sistem ne dozvoljava direktnu izmjenu podataka koji se ne smiju mijenjati ručno, kao što su interni identifikator naloga ili sistemski audit podaci

- **AC5: Evidentiranje izmjene korisničkog naloga**

  - **GIVEN** administrator uspješno izmijeni korisnički nalog  
  - **WHEN** sistem spremi promjene  
  - **THEN** sistem evidentira ko je izvršio izmjenu, kada je izvršena i koja polja su promijenjena

- **AC6: Ograničenje pristupa uređivanju korisnika**

  - **GIVEN** korisnik nema administratorsku ulogu ili odgovarajuće ovlaštenje  
  - **WHEN** pokuša pristupiti formi za uređivanje korisničkog naloga  
  - **THEN** sistem mu ne dozvoljava pristup toj funkcionalnosti

---
## US-37 — Primanje relevantnih sistemskih obavještenja

**Opis:**  
Kao korisnik sistema, želim primati relevantne sistemske obavještenja, kako bih bio pravovremeno informisan o promjenama koje se odnose na moje zahtjeve, intervencije ili zaduženja.

**Poslovna vrijednost:**  
Ovaj story je važan jer omogućava bolju komunikaciju između sistema i korisnika. Pravovremena obavještenja smanjuju potrebu za ručnim provjerama, ubrzavaju reakciju korisnika i pomažu da se operativni proces odvija bez nepotrebnih zastoja.

**Prioritet:**  
Srednji

**Pretpostavke i otvorena pitanja:**  

Pretpostavka: Sistem može prepoznati koji događaji su relevantni za kojeg korisnika na osnovu njegove uloge i povezanosti sa zahtjevom ili intervencijom.

Otvorena pitanja: Da li se u MVP verziji obavještenja prikazuju samo unutar aplikacije ili se kasnije planira slanje putem emaila, SMS-a ili push notifikacija?

**Veze sa drugim storyjima:**  
Povezano sa storyjima za pregled vlastitog zahtjeva (US-06), pregled otvorenih intervencija (US-07), dodjelu intervencije serviseru (US-09), ažuriranje statusa intervencije (US-14), prihvatanje i odbijanje zadatka (US-22, US-23) i historiju aktivnosti intervencije (US-32).

**Acceptance Criteria:**

- **AC1: Kreiranje obavještenja nakon relevantne promjene**

  - **GIVEN** u sistemu se desi relevantna promjena, kao što je promjena statusa, dodjela servisera ili potvrda termina  
  - **WHEN** sistem uspješno evidentira tu promjenu  
  - **THEN** sistem kreira obavještenje za korisnike na koje se promjena odnosi

- **AC2: Prikaz obavještenja korisniku**

  - **GIVEN** korisnik ima novo obavještenje  
  - **WHEN** se prijavi u sistem ili otvori sekciju obavještenja  
  - **THEN** sistem prikazuje obavještenje sa osnovnim informacijama o događaju

- **AC3: Obavještenja prema korisničkoj ulozi**

  - **GIVEN** korisnik ima određenu ulogu u sistemu  
  - **WHEN** sistem generiše obavještenje  
  - **THEN** korisnik prima samo obavještenja koja su relevantna za njegovu ulogu i odgovornost

- **AC4: Označavanje obavještenja kao pročitanog**

  - **GIVEN** korisnik ima nepročitano obavještenje  
  - **WHEN** otvori obavještenje ili ga označi kao pročitano  
  - **THEN** sistem mijenja status obavještenja u pročitano

- **AC5: Sprečavanje prikaza tuđih obavještenja**

  - **GIVEN** korisnik pokuša pristupiti obavještenju koje nije namijenjeno njemu  
  - **WHEN** sistem provjeri pravo pristupa  
  - **THEN** sistem ne dozvoljava prikaz tog obavještenja

- **AC6: Prikaz praznog stanja**

  - **GIVEN** korisnik nema nijedno aktivno obavještenje  
  - **WHEN** otvori sekciju obavještenja  
  - **THEN** sistem prikazuje poruku da trenutno nema novih obavještenja

---

US-38 — Obavezno trajanje pri evidentiranju rada
Opis:
Kao serviser, želim da sistem zahtijeva unos trajanja pri evidentiranju rada, kako bi evidencija bila potpuna i korisna za izvještaje o performansama.
Poslovna vrijednost:
Ovaj story je važan jer bez podatka o trajanju evidencija rada je nepotpuna, a dispečer i sistem ne mogu pratiti stvarno utrošeno vrijeme po intervenciji, što je osnova za izvještaje o efikasnosti i SLA analizu.
Prioritet:
Visok
Pretpostavke i otvorena pitanja:
Pretpostavka: Pretpostavlja se da serviser ima otvorenu i aktivnu intervenciju koja mu je dodijeljena.
Otvorena pitanja: Da li se trajanje unosi u minutama ili satima? Da li sistem treba automatski predložiti trajanje na osnovu razlike između početka i završetka?
Veze sa drugim storyjima:
Zavisi od storyja za evidentiranje izvršenog rada (US-17) i povezan je sa storyjem za izvještaj odziva i trajanja po serviseru (US-42).
Acceptance Criteria:

AC1: Obaveznost polja trajanja

GIVEN serviser je otvorio formu za evidenciju rada
WHEN pokuša potvrditi unos bez trajanja
THEN sistem ne sprema evidenciju i prikazuje validacijsku poruku pored polja trajanja


AC2: Validacija vrijednosti trajanja

GIVEN serviser je u formi za evidenciju rada
WHEN unese negativnu vrijednost ili nulu
THEN sistem ne prihvata unos i prikazuje poruku o grešci


AC3: Uspješno spremanje trajanja

GIVEN serviser je unio validno trajanje i ostale obavezne podatke
WHEN potvrdi evidenciju rada
THEN sistem sprema trajanje uz ostale podatke evidencije


AC4: Vidljivost trajanja dispečeru

GIVEN serviser je uspješno evidentirao rad sa trajanjem
WHEN dispečer otvori pregled evidentiranog rada te intervencije
THEN sistem prikazuje uneseno trajanje uz ostale podatke evidencije


AC5: Zabrana evidencije bez trajanja

GIVEN serviser pokušava evidentirati rad na intervenciji
WHEN polje trajanja ostane prazno
THEN sistem u potpunosti blokira slanje forme do popunjavanja polja

---
US-39 — Audit trail sa starim i novim vrijednostima u historiji aktivnosti
Opis:
Kao dispečer, želim u historiji aktivnosti vidjeti stare i nove vrijednosti za svaku evidentiranu promjenu, kako bih imao potpun audit trail koji pokazuje šta se promijenilo, s čega na šta i ko je to uradio.
Poslovna vrijednost:
Ovaj story je važan jer sama evidencija da se nešto promijenilo nije dovoljna za operativni audit. Dispečer mora znati konkretno šta je bila prethodna vrijednost i šta je nova, kako bi mogao pratiti tok odlučivanja i razriješiti eventualne nesporazume.
Prioritet:
Srednji
Pretpostavke i otvorena pitanja:
Pretpostavka: Pretpostavlja se da sistem već evidentira historiju aktivnosti (US-32) i da model intervention_activities postoji u bazi.
Otvorena pitanja: Za koja sve polja treba evidentirati stare i nove vrijednosti? Da li se evidentiraju i promjene napomena ili samo strukturirani podaci?
Veze sa drugim storyjima:
Zavisi od storyja za pregled historije aktivnosti intervencije (US-32) i povezan je sa storyjima za tabelarni pregled historije aktivnosti (US-44) i promjenu izvršioca intervencije (US-28).
Acceptance Criteria:

AC1: Evidentiranje stare i nove vrijednosti

GIVEN korisnik izvrši promjenu na intervenciji (npr. promjena statusa, prioriteta ili izvršioca)
WHEN sistem evidentira aktivnost u historiji
THEN zapis u historiji sadrži naziv polja, staru vrijednost i novu vrijednost


AC2: Prikaz autora i vremena promjene

GIVEN promjena je evidentirana u historiji aktivnosti
WHEN dispečer pregleda historiju te intervencije
THEN sistem prikazuje ime korisnika koji je napravio promjenu i tačan vremenski pečat


AC3: Razumljiv prikaz promjene

GIVEN historija aktivnosti sadrži zapis s promjenom
WHEN dispečer pregleda taj zapis
THEN prikaz je razumljiv — jasno je vidljivo šta se promijenilo, s koje vrijednosti na koju


AC4: Nepromjenjivost audit zapisa

GIVEN promjena je evidentirana u historiji aktivnosti
WHEN bilo koji korisnik pokušava izmijeniti ili obrisati taj zapis
THEN sistem ne dozvoljava izmjenu niti brisanje audit zapisa


AC5: Ograničenje pristupa historiji

GIVEN korisnik bez odgovarajućeg ovlaštenja pokuša pristupiti historiji aktivnosti
WHEN sistem provjeri ulogu korisnika
THEN pristup je odbijen i prikazuje se odgovarajuća poruka

---
US-40 — Označavanje intervencije kao nije riješena
Opis:
Kao serviser, želim označiti intervenciju kao nije riješena, kako bi dispečer znao da problem nije otklonjen i može organizovati ponovni izlazak ili promijeniti pristup rješavanju.
Poslovna vrijednost:
Ovaj story je važan jer bez mogućnosti da serviser explicitno signalizira da problem nije riješen, dispečer može pogrešno zaključiti da je intervencija završena. Ova funkcionalnost osigurava tačnost operativnog stanja i sprečava zatvaranje intervencije bez stvarnog rješenja problema.
Prioritet:
Srednji
Pretpostavke i otvorena pitanja:
Pretpostavka: Pretpostavlja se da je intervencija prethodno dodijeljena serviseru i da je serviser na terenu.
Otvorena pitanja: Da li označavanje kao nije riješena automatski vraća intervenciju u dispečerski tok ili samo mijenja status uz notifikaciju?
Veze sa drugim storyjima:
Zavisi od storyja za ažuriranje statusa intervencije od strane servisera (US-14) i povezan je sa storyjima za praćenje ponovnih ciklusa (US-47) i promjenu izvršioca intervencije (US-28).
Acceptance Criteria:

AC1: Obavezan razlog označavanja

GIVEN serviser odabere opciju "Označi kao nije riješena"
WHEN pokuša potvrditi akciju
THEN sistem zahtijeva obavezan unos razloga i ne dozvoljava završetak bez toga


AC2: Promjena statusa intervencije

GIVEN serviser je potvrdio označavanje uz razlog
WHEN sistem obradi akciju
THEN status intervencije se ažurira i razlog je evidentiran u historiji aktivnosti


AC3: Inkrementiranje brojača ponovnih ciklusa

GIVEN serviser je označio intervenciju kao nije riješena
WHEN sistem obradi akciju
THEN brojač ponovnih ciklusa za tu intervenciju se povećava za jedan (US-47)


AC4: Vidljivost dispečeru

GIVEN intervencija je označena kao nije riješena
WHEN dispečer pregleda listu intervencija
THEN sistem prikazuje ažuriran status i oznaku na toj intervenciji


AC5: Evidentiranje u historiji aktivnosti

GIVEN akcija je uspješno izvršena
WHEN dispečer pregleda historiju aktivnosti intervencije
THEN zapis u historiji sadrži razlog, autora i vremenski pečat


AC6: Ograničenje pristupa

GIVEN korisnik koji nije dodijeljen serviser te intervencije pokuša označiti je kao nije riješena
WHEN sistem provjeri ovlaštenje
THEN akcija nije dostupna tom korisniku

---
US-41 — SLA praćenje intervencija
Opis:
Kao dispečer, želim vidjeti SLA status intervencija, kako bih mogao pravovremeno reagovati na intervencije kojima prijeti prekoračenje dogovorenih rokova.
Poslovna vrijednost:
Ovaj story je važan jer bez vidljivog SLA statusa dispečer ne može pravovremeno prioritizovati intervencije koje su blizu ili su već prekoračile dogovorene rokove, što direktno utiče na kvalitet usluge i zadovoljstvo korisnika.
Prioritet:
Srednji
Pretpostavke i otvorena pitanja:
Pretpostavka: Pretpostavlja se da su SLA rokovi definisani po prioritetu intervencije i da sistem zna vrijeme prijave zahtjeva.
Otvorena pitanja: Koji su konkretni SLA rokovi po prioritetu? Da li SLA sat počinje od prijave zahtjeva ili od momenta dodjele serviseru?
Veze sa drugim storyjima:
Povezan je sa storyjima za SLA eskalacije (US-45), određivanje prioriteta intervencije (US-12) i izvještaj odziva i trajanja po serviseru (US-42).
Acceptance Criteria:

AC1: Izračun SLA statusa

GIVEN u sistemu postoje aktivne intervencije s definisanim prioritetima
WHEN sistem izračuna SLA status za svaku intervenciju
THEN svaka intervencija dobija SLA status: u roku, upozorenje ili prekoračeno


AC2: Prikaz SLA badge-a

GIVEN intervencija ima izračunat SLA status
WHEN dispečer pregleda listu intervencija ili detalj pojedinačne intervencije
THEN sistem prikazuje SLA badge koji vizuelno ukazuje na trenutni status


AC3: KPI prikaz na dashboardu

GIVEN dispečer pristupi operativnom dashboardu
WHEN sistem učita podatke
THEN dashboard prikazuje KPI kartice s brojem intervencija po SLA statusu


AC4: Ažuriranje u realnom vremenu

GIVEN SLA status intervencije se promijeni zbog protoka vremena
WHEN dispečer osviježi prikaz
THEN sistem prikazuje ažurirani SLA status koji odgovara trenutnom stanju


AC5: Filtriranje po SLA statusu

GIVEN dispečer pregleda listu intervencija
WHEN odabere filter po SLA statusu
THEN sistem prikazuje samo intervencije koje odgovaraju odabranom SLA statusu


AC6: Ograničenje pristupa

GIVEN korisnik bez dispečerske uloge pokuša pristupiti SLA informacijama
WHEN sistem provjeri ulogu
THEN SLA informacije nisu vidljive tom korisniku


---
US-42 — Izvještaj odziva i trajanja po serviseru
Opis:
Kao dispečer, želim pregledati izvještaj koji prikazuje prosječno vrijeme odziva i prosječno trajanje intervencija po serviseru, kako bih mogao pratiti efikasnost tima i donositi informirane operativne odluke.
Poslovna vrijednost:
Ovaj story je važan jer bez agregiranih podataka o odzivima i trajanjima dispečer ne može objektivno procijeniti radni učinak servisera niti identificirati obrasce koji ukazuju na potrebu za poboljšanjem procesa ili preraspodjelom zadataka.
Prioritet:
Nizak
Pretpostavke i otvorena pitanja:
Pretpostavka: Pretpostavlja se da sistem već evidentira trajanje rada (US-38) i vremena dodjele i prihvatanja zadataka.
Otvorena pitanja: Koji je minimalni period za koji se može generisati izvještaj? Da li se prikazuju i serviseri bez evidentiranih intervencija u odabranom periodu?
Veze sa drugim storyjima:
Zavisi od storyja za obavezno trajanje pri evidentiranju rada (US-38) i povezan je sa storyjima za SLA praćenje (US-41) i pregled historije aktivnosti (US-32).
Acceptance Criteria:

AC1: Prikaz prosječnog odziva po serviseru

GIVEN dispečer pristupi stranici izvještaja
WHEN sistem učita podatke
THEN izvještaj prikazuje prosječno vrijeme odziva (od dodjele do prihvatanja zadatka) za svakog servisera


AC2: Prikaz prosječnog trajanja po serviseru

GIVEN dispečer pregleda izvještaj
WHEN sistem agregira podatke o evidentiranom radu
THEN izvještaj prikazuje prosječno trajanje intervencija po serviseru


AC3: Filtriranje po vremenskom periodu

GIVEN dispečer želi vidjeti podatke za određeni period
WHEN odabere vremenski raspon i primijeni filter
THEN sistem prikazuje izvještaj samo za intervencije u odabranom periodu


AC4: Konzistentnost podataka

GIVEN dispečer pregleda izvještaj
WHEN usporedi vrijednosti s evidentiranim podacima
THEN podaci u izvještaju su konzistentni s evidentiranim trajanjima i vremenima odziva


AC5: Ograničenje pristupa

GIVEN korisnik bez odgovarajućeg ovlaštenja pokuša pristupiti izvještaju
WHEN sistem provjeri ulogu
THEN pristup je odbijen i prikazuje se odgovarajuća poruka


---
US-43 — Upload fotografije intervencije
Opis:
Kao serviser, želim uploadovati fotografije vezane za intervenciju, kako bi vizuelna dokumentacija bila dostupna dispečeru i ostala trajno pohranjena uz evidenciju intervencije.
Poslovna vrijednost:
Ovaj story je važan jer fotografska dokumentacija pruža jasan dokaz o stanju kvara prije i nakon popravke, smanjuje sporove i nedoumice između servisera, dispečera i korisnika, te povećava transparentnost i kvalitet izvještavanja.
Prioritet:
Nizak
Pretpostavke i otvorena pitanja:
Pretpostavka: Pretpostavlja se da je Supabase Storage konfigurisan i dostupan za pohranu slika.
Otvorena pitanja: Koliki je maksimalni broj fotografija po intervenciji? Postoji li maksimalna veličina fajla?
Veze sa drugim storyjima:
Zavisi od storyja za evidentiranje izvršenog rada (US-17) i povezan je sa storyjem za pregled evidentiranog izvršenog rada (US-24).
Acceptance Criteria:

AC1: Uspješan upload fotografije

GIVEN serviser je otvorio detalje intervencije i odabrao opciju za upload fotografije
WHEN odabere validnu fotografiju i potvrdi upload
THEN sistem uspješno pohranjuje fotografiju i povezuje je sa intervencijom


AC2: Pohrana u Supabase Storage

GIVEN upload je uspješan
WHEN sistem obradi fajl
THEN fotografija je pohranjena u Supabase Storage bucket i dostupna putem sigurnog URL-a


AC3: Pregled galerije fotografija

GIVEN intervencija ima uploadovane fotografije
WHEN serviser ili dispečer otvori detalje intervencije
THEN sistem prikazuje galeriju svih fotografija vezanih za tu intervenciju


AC4: Validacija formata fajla

GIVEN serviser pokušava uploadovati fajl
WHEN sistem provjeri tip fajla
THEN sistem prihvata samo dozvoljene formate (JPEG, PNG, WebP) i odbija sve ostale s odgovarajućom porukom


AC5: Validacija putem magic bytes

GIVEN serviser uploaduje fajl s ispravnom ekstenzijom ali pogrešnim sadržajem
WHEN sistem provjeri binarne magic bytes fajla
THEN sistem odbija fajl čiji sadržaj ne odgovara deklarisanom tipu


AC6: Ograničenje pristupa

GIVEN korisnik bez odgovarajućeg ovlaštenja pokuša pristupiti fotografijama
WHEN sistem provjeri ulogu
THEN fotografije nisu dostupne tom korisniku


---
US-44 — Tabelarni pregled historije aktivnosti
Opis:
Kao dispečer, želim pregledati historiju aktivnosti intervencije u tabelarnom obliku s kolonama polje, stara vrijednost, nova vrijednost i autor, kako bih lakše pratio konkretne promjene na intervenciji.
Poslovna vrijednost:
Ovaj story je važan jer timeline prikaz historije pruža dobar hronološki pregled, ali nije optimalan za pregled konkretnih promjena vrijednosti. Tabelarni prikaz s eksplicitnim kolonama za staru i novu vrijednost čini audit trail preglednim i lakšim za analizu.
Prioritet:
Srednji
Pretpostavke i otvorena pitanja:
Pretpostavka: Pretpostavlja se da historija aktivnosti već evidentira stare i nove vrijednosti (US-39).
Otvorena pitanja: Da li tabelarni i timeline prikaz koegzistiraju kao dvije opcije ili tabelarni zamjenjuje timeline?
Veze sa drugim storyjima:
Zavisi od storyja za audit trail sa starim i novim vrijednostima (US-39) i pregled historije aktivnosti (US-32).
Acceptance Criteria:

AC1: Tabelarni prikaz aktivnosti

GIVEN intervencija ima evidentiranu historiju aktivnosti
WHEN dispečer odabere tabelarni prikaz historije
THEN sistem prikazuje tabelu s kolonama: polje, stara vrijednost, nova vrijednost i autor


AC2: Hronološki redosljed

GIVEN tabela aktivnosti je učitana
WHEN dispečer pregleda redove tabele
THEN zapisi su sortirani hronološki od najnovijeg prema najstarijem


AC3: Toggle između tabelarnog i timeline prikaza

GIVEN dispečer pregleda historiju aktivnosti
WHEN odabere opciju za promjenu načina prikaza
THEN sistem mijenja prikaz između tabelarnog i timeline formata bez gubitka podataka


AC4: Preglednost za veći broj zapisa

GIVEN intervencija ima velik broj evidentiranih aktivnosti
WHEN dispečer otvori tabelarni prikaz
THEN tabela ostaje pregledna i čitljiva, s podrškom za skrolanje ili paginaciju

---
US-45 — SLA eskalacije
Opis:
Kao dispečer, želim primati eskalacijske notifikacije kada intervencija prekorači SLA rok, kako bih mogao hitno reagovati i spriječiti daljnje kašnjenje.
Poslovna vrijednost:
Ovaj story je važan jer SLA praćenje samo po sebi nije dovoljno ako dispečer mora ručno provjeravati statuse. Automatska eskalacija osigurava da dispečer bude odmah obaviješten o prekoračenjima, što smanjuje rizik od dugotrajnih kašnjenja i negativnog uticaja na korisničko iskustvo.
Prioritet:
Srednji
Pretpostavke i otvorena pitanja:
Pretpostavka: Pretpostavlja se da je SLA praćenje implementirano (US-41) i da sistem evidentira vremena relevantnih događaja.
Otvorena pitanja: Koliki je cooldown period između ponovljenih eskalacija za istu intervenciju?
Veze sa drugim storyjima:
Zavisi od storyja za SLA praćenje (US-41) i povezan je sa storyjima za sistemske notifikacije (US-37) i historiju aktivnosti (US-32).
Acceptance Criteria:

AC1: Detekcija prekoračenja SLA

GIVEN intervencija je prešla definirani SLA rok bez zatvaranja
WHEN sistem periodično provjerava SLA statuse
THEN sistem detektuje prekoračenje i kreira eskalaciju za tu intervenciju


AC2: Slanje eskalacijske notifikacije

GIVEN eskalacija je kreirana za prekoračeni SLA
WHEN sistem obradi eskalaciju
THEN dispečer prima hitnu notifikaciju koja sadrži identifikator intervencije i informaciju o prekoračenju


AC3: Evidentiranje eskalacije u audit logu

GIVEN eskalacija je poslana dispečeru
WHEN sistem evidentira akciju
THEN zapis o eskalaciji je pohranjen u historiji aktivnosti intervencije s vremenskim pečatom


AC4: Cooldown period za sprečavanje duplikata

GIVEN eskalacija je već poslana za određenu intervenciju
WHEN SLA i dalje ostaje prekoračen unutar cooldown perioda
THEN sistem ne šalje ponovnu eskalaciju dok cooldown period ne istekne

---
US-46 — Evidencija materijala i dijelova
Opis:
Kao serviser, želim evidentirati materijale i dijelove korištene tokom intervencije, kako bi evidencija bila potpuna i transparentna za dispečera i za naknadnu analizu troškova.
Poslovna vrijednost:
Ovaj story je važan jer evidencija rada bez liste utrošenih materijala i dijelova nije potpuna. Ova informacija je neophodna za transparentno fakturisanje, analizu troškova po intervenciji i upravljanje zalihama.
Prioritet:
Srednji
Pretpostavke i otvorena pitanja:
Pretpostavka: Pretpostavlja se da je forma za evidentiranje rada već implementirana (US-17).
Otvorena pitanja: Da li postoji predefinisana lista materijala ili serviser slobodno unosi naziv? Da li se vodi evidencija zaliha?
Veze sa drugim storyjima:
Zavisi od storyja za evidentiranje izvršenog rada (US-17) i povezan je sa storyjem za pregled evidentiranog izvršenog rada (US-24).
Acceptance Criteria:

AC1: Dodavanje stavke materijala

GIVEN serviser evidentira rad na intervenciji
WHEN odabere opciju za dodavanje materijala i unese naziv, količinu i jedinicu mjere
THEN sistem dodaje stavku materijala uz evidenciju rada


AC2: Obaveznost sva tri polja

GIVEN serviser dodaje stavku materijala
WHEN jedno ili više od tri polja (naziv, količina, jedinica mjere) ostane prazno
THEN sistem ne sprema stavku i prikazuje validacijsku poruku za nepopunjena polja


AC3: Dodavanje više stavki

GIVEN serviser evidentira rad s više korištenih materijala
WHEN dodaje više stavki materijala
THEN sistem prihvata i sprema sve stavke vezane za jednu evidenciju


AC4: Vidljivost dispečeru

GIVEN serviser je uspješno evidentirao rad s materijalima
WHEN dispečer otvori pregled evidentiranog rada te intervencije
THEN sistem prikazuje listu svih evidentiranih materijala uz ostale podatke evidencije


AC5: Nepromjenjivost nakon zatvaranja

GIVEN intervencija je zatvorena
WHEN korisnik pokuša izmijeniti ili dodati stavke materijala
THEN sistem ne dozvoljava izmjenu — evidencija materijala je zaključana zajedno s ostatkom evidencije

---
US-47 — Praćenje intervencije nije riješene iz prve
Opis:
Kao dispečer, želim vidjeti koliko puta je intervencija vraćana ili označena kao nije riješena, kako bih identificirao problematične slučajeve koji zahtijevaju posebnu pažnju ili promjenu pristupa.
Poslovna vrijednost:
Ovaj story je važan jer intervencija koja se ponavlja više puta ukazuje na sistemski problem — bilo u opisu kvara, odabiru servisera, dostupnosti dijelova ili složenosti problema. Praćenje ponovnih ciklusa daje dispečeru i upravljačku informaciju za bolje planiranje i alokaciju resursa.
Prioritet:
Srednji
Pretpostavke i otvorena pitanja:
Pretpostavka: Pretpostavlja se da su implementirane funkcionalnosti vraćanja zadatka (US-29) i označavanja kao nije riješena (US-40).
Otvorena pitanja: Da li se broj ciklusa resetuje nakon uspješnog zatvaranja ili ostaje trajno vidljiv u historiji?
Veze sa drugim storyjima:
Zavisi od storyja za vraćanje zadatka na ponovnu dodjelu (US-29) i označavanje intervencije kao nije riješena (US-40).
Acceptance Criteria:

AC1: Automatsko brojanje ciklusa

GIVEN serviser vrati zadatak (US-29) ili označi intervenciju kao nije riješena (US-40)
WHEN sistem obradi akciju
THEN brojač ponovnih ciklusa za tu intervenciju se automatski povećava za jedan


AC2: Vidljivost brojača dispečeru

GIVEN intervencija ima evidentirane ponovne cikluse
WHEN dispečer pregleda listu intervencija ili detalj intervencije
THEN sistem prikazuje broj ponovnih ciklusa kao jasno vidljivi badge


AC3: Automatsko ažuriranje

GIVEN novi ciklus je evidentiran
WHEN dispečer osviježi prikaz
THEN badge prikazuje ažurirani broj ciklusa


AC4: Filtriranje po broju ciklusa

GIVEN dispečer želi identificirati problematične intervencije
WHEN primijeni filter za intervencije s više od jednog ciklusa
THEN sistem prikazuje samo intervencije čiji broj ponovnih ciklusa prelazi odabrani prag

---

# Raspodjela zadataka po sprintovima i sprint ciljevi:

Ovaj plan je organizovan tako da se razvoj sistema odvija **postepeno, smisleno i zavisno od blokatora**, pri čemu se u ranijim sprintovima prioritet daje **happy path-u**, a u kasnijim sprintovima se uvode **alternativni putevi** i dodatne funkcionalnosti.

---

## **Sprint 6**

### **Sprint broj**
**6**

### **Sprint cilj**
**Postaviti tehničku osnovu sistema i osposobiti korisnički pristup aplikaciji.**

### **Ključne stavke koje tim želi završiti**
- postavljanje projekta i Supabase okruženja  
- definisanje korisnika, uloga i osnovnih permisija (**US-04**)  
- registraciona forma za korisnika usluge (**US-01**)  
- login forma i osnovna prijava korisnika (**US-02**) 
- osnova forme za prijavu zahtjeva  (**US-05** - UI dio)
- definisanje modela zahtjeva i radnog naloga  (Podloga za **US-05** i **US-07**)

### **Rizici i zavisnosti**
- Sprint 6 predstavlja **tehnički temelj cijelog sistema** i od njegovog uspješnog završetka zavise svi naredni sprintovi.  
- Ako povezivanje sa **Supabase** platformom ne bude stabilno postavljeno na početku, kasnije funkcionalnosti vezane za autentifikaciju, spremanje podataka i prikaz zahtjeva mogu biti usporene ili potpuno blokirane.  
- Definisanje korisnika, uloga i permisija mora biti dovoljno jasno i jednostavno, jer od toga zavisi **kontrola pristupa** u svim kasnijim modulima.  
- Registracija i prijava korisnika moraju ostati u **osnovnoj i stabilnoj verziji**, bez širenja na dodatne funkcionalnosti koje nisu neophodne u ovoj fazi.  
- Forma za prijavu zahtjeva u ovom sprintu treba biti pripremljena kao **osnova za kasnije uvezivanje**, ali se ne treba opterećivati potpunim završetkom korisničkog toka.  
- Bez tehničke osnove, korisnika i autentifikacije nije moguće uvezati korisnički tok u narednom sprintu.  

---

## **Sprint 7**

### **Sprint broj**
**7**

### **Sprint cilj**
**Omogućiti korisniku da se prijavi, pošalje zahtjev i vidi da je zahtjev evidentiran u sistemu.**

### **Ključne stavke koje tim želi završiti**
- povezivanje registracije i prijave sa bazom (Finalizacija **US-01** i **US-02**) 
- spremanje zahtjeva u bazu (Backend dio - **US-05**) 
- dodjeljivanje početnog statusa zahtjevu  (Dio logike kreiranja zahtjeva - **US-05**)
- pregled vlastitog zahtjeva za korisnika  (**US-06**)
- prikaz zahtjeva u dispečerovoj listi zahtjeva koji čekaju obradu (**US-07**)
- podnosenje aplikacije za internu ulogu (dispecer/serviser) sa statusom `na_cekanju` (**US-35**)
- administratorski pregled i odobravanje aplikacije uz pokretanje kreiranja internog naloga (**US-18**)
- aktivacija Premium usluge (online aktivacija, status premium korisnika i period važenja) (**US-34**)
- premium zahtjev unutar prijave kvara (Hitnost/Premium korak, validacija prava i prioritetna obrada) (**US-33**)

### **Rizici i zavisnosti**
- Sprint 7 direktno zavisi od **tehničke osnove, korisničkih uloga, prijave korisnika i pripremljene forme zahtjeva** iz Sprinta 6.  
- Ako autentifikacija i povezivanje korisničkog naloga sa bazom nisu ispravno postavljeni, korisnik neće moći pouzdano slati i pregledati vlastite zahtjeve.  
- Spremanje zahtjeva u bazu i dodjeljivanje početnog statusa moraju biti **konzistentni**, jer od tih podataka kasnije zavise dispečerski pregled, prioriteti i dodjela izvršiocu.  
- Prikaz zahtjeva korisniku i dispečeru mora biti zasnovan na **istom izvoru podataka**, kako bi se izbjegla nedosljednost između korisničkog i internog pogleda na sistem.  
- U ovoj fazi ne treba previše širiti logiku statusa, već je zadržati na **osnovnom nivou** potrebnom za evidentiranje i pregled zahtjeva.  
- Premium tok uvodi dodatnu zavisnost između korisničkog statusa, naplate i prava korištenja Premium opcije, pa pravila aktivacije i validacije moraju biti jasno povezana sa US-05 kako ne bi došlo do nekonzistentnih zahtjeva.  
- Notifikacije za premium i standardne zahtjeve prema dispečeru/adminu moraju biti pouzdane, kako bi operativna obrada zahtjeva u narednom sprintu imala potpune ulazne informacije.  
- Ovaj sprint zatvara **prvi stvarni korisnički tok** i priprema sistem za dispečersku obradu u Sprintu 8.  

---

## **Sprint 8**

### **Sprint broj**
**8**

### **Sprint cilj**
**Omogućiti dispečeru da pregleda i obradi zahtjev te odredi njegov prioritet.**

### **Ključne stavke koje tim želi završiti**
- pregled otvorenih zahtjeva / intervencija (**US-07**)
- pregled detalja pojedinačne intervencije (**US-08**)
- pregled statusa intervencija od strane dispečera (**US-13**)
- pregled sažetog operativnog statusa intervencija na kontrolnoj tabli (**US-31**)
- SLA praćenje i vizualni indikatori (**US-41**)
- izvještaj odziva servisera (**US-42**)
- određivanje prioriteta intervencije (**US-12**)
- izmjena vlastitog zahtjeva (**US-26**)
- otkazivanje vlastitog zahtjeva (**US-27**)

### **Rizici i zavisnosti**
- Sprint 8 zavisi od toga da su zahtjevi iz Sprinta 7 već ispravno evidentirani u bazi i prikazani korisniku i dispečeru.
- Pregled otvorenih zahtjeva i detalja intervencije predstavlja osnovu za svu dalju dispečersku obradu, pa njihov prikaz mora biti jasan, stabilan i usklađen sa stanjem u bazi.
- Određivanje prioriteta i SLA indikatori moraju ostati na jednostavnom i pouzdanom modelu, uz mogućnost kasnijeg proširenja.
- Izmjena i otkazivanje zahtjeva moraju biti vremenski i statusno ograničeni, kako korisnik ne bi mogao mijenjati ili povlačiti zahtjev nakon što je već prešao u internu obradu ili dodjelu.
- Ovaj sprint treba zatvoriti korisničke alternativne tokove prije nego što zahtjev pređe u fazu dodjele serviseru.
- Završetkom ovog sprinta sistem mora biti spreman da dispečer iz zahtjeva pređe na operativnu dodjelu zadatka u narednom sprintu.

---

## **Sprint 9**

### **Sprint broj**
**9**

### **Sprint cilj**
**Zatvoriti kompletan MVP tok servisnih intervencija (operativni tok, kvaliteta, evidencija, administracija, izvještaji).**

### **Ključne stavke koje tim želi završiti**
- preraspodjela i alternativni tokovi (**US-28**, **US-29**, **US-40**, **US-47**)
- evidencija rada, trajanje i materijal (**US-38**, **US-46**, **US-17**)
- historija aktivnosti i audit (**US-32**, **US-39**, **US-44**)
- SLA i eskalacije (**US-41**, **US-45**)
- izvještaj performansi (**US-42**)
- foto dokumentacija (**US-43**)
- administracija naloga i notifikacije (**US-19–21**, **US-36**, **US-37**)
- regresija zatvaranja toka (**US-14–25**, **US-30**)
- QA SB-09-36 i automatski testovi

### **Rizici i zavisnosti**
- Sprint 9 nadograđuje Sprint 8 (dodjela, serviserski tok).
- Potrebna konzistentnost dokumentacije i test paketa za US-01–US-47.
- Završetkom Sprinta 9 MVP Inkrement 2 je spreman za demonstraciju.

---

## **Sprint 10**

### **Sprint broj**
**10**

### **Sprint cilj**
**Organizaciona faza projekta (stabilizacija, testiranje, predaja) — implementacioni scope je u Sprintu 9.**

### **Ključne stavke koje tim želi završiti**
- završno integraciono i regresijsko testiranje MVP toka
- ručno testiranje ključnih scenarija (SB-09-36)
- dorada korisničkog interfejsa gdje je potrebno
- završna priprema dokumentacije i demonstracije

### **Rizici i zavisnosti**
- Sprint 10 zavisi od završetka implementacionog opsega Sprinta 9.
- U ovoj fazi ne uvoditi nove funkcionalnosti — fokus na kvalitetu i predaju.

---

## **Sprint 11**

### **Sprint broj:**  
**11**  

### **Sprint cilj:**  
Stabilizovati sistem, otkloniti greške i pripremiti ga za završnu demonstraciju i predaju.  

### **Ključne stavke koje tim želi završiti:**
- Ispravke uočenih grešaka  
- Dorade postojećih funkcionalnosti  
- Smanjenje tehničkog duga  
- Završno integraciono testiranje  
- Završno regresijsko testiranje  
- Ručno testiranje ključnih scenarija  
- Dorada korisničkog interfejsa gdje je potrebno  
- Završna priprema dokumentacije  
- Završna priprema sistema za demonstraciju i predaju  

### **Rizici i zavisnosti:**
- Sprint 11 zavisi od završetka MVP implementacije u Sprintu 9 i stabilizacije u Sprintu 10.  
- U ovoj fazi ne uvoditi nove funkcionalnosti — fokus na predaju i demonstraciju.  
- Najveći fokus treba biti na stabilnosti sistema, usklađenosti postojećih modula i uklanjanju problema uočenih tokom ranijeg razvoja i testiranja.  
- Tehnički dug treba rješavati samo u mjeri koja ne ugrožava završetak projekta i spremnost sistema za demonstraciju.  
- Završno testiranje mora obuhvatiti kompletan *happy path* i najvažnije alternativne scenarije, kako bi sistem bio pouzdan za predaju i prezentaciju.
