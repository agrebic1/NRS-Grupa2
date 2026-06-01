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
| US-48 | Kao dispečer, želim da mi sistem pri dodjeli preporuči servisere i prema blizini lokacije intervencije, kako bih smanjio vrijeme odziva i troškove izlaska na teren. | Visok | 8 pts | Dodati baznu lokaciju servisera u bazu, omogućiti unos lokacije kroz profil servisera i admin uređivanje, implementirati Haversine izračun udaljenosti, proširiti scoring preporuke servisera faktorom blizine, omogućiti fallback kada koordinate nedostaju, prikazati udaljenost i oznaku “Najbliži” u kartici servisera, dodati unit testove za izračun i scoring. | AC1: Sistem računa udaljenost kada zahtjev i serviser imaju koordinate. AC2: Najbliži serviser dobija dodatni scoring bonus. AC3: Udaljenost se prikazuje u UI-u. AC4: Ako koordinate nedostaju, sistem nastavlja rad bez greške. AC5: Funkcija je dostupna samo dispečeru. |
| US-49 | Kao dispečer, želim vizuelni analitički dashboard sa grafovima ključnih pokazatelja, kako bih brzo razumio stanje i opterećenje sistema. | Srednji | 8 pts | Kreirati agregacione funkcije za metrike, implementirati API za analitiku, prikazati KPI kartice, implementirati grafove za status, SLA, opterećenje servisera i trend završavanja, dodati filter po periodu, dodati prazno/loading/error stanje, ograničiti pristup na dispečera. | AC1: Dispečer vidi grafove i KPI metrike. AC2: Podaci su konzistentni sa postojećim izvještajima. AC3: Dashboard ima filter po vremenskom periodu. AC4: Prikazana su prazna i loading stanja. AC5: Neovlašten korisnik ne može pristupiti analitici. |
| US-50 | Kao serviser na terenu, želim da aplikacija bude pregledna i upotrebljiva na mobilnom uređaju, kako bih mogao lakše raditi bez računara. | Srednji | 5 pts | Pregledati serviserske ekrane na manjim širinama, ukloniti horizontalni scroll, poboljšati kartice intervencija, dodati prazna i loading stanja, dodati aria-label na ikon-dugmad, osigurati vidljiv fokus, ujednačiti spacing, badgeve i responsive ponašanje. | AC1: Serviserski ekrani rade na širini oko 360px. AC2: Nema horizontalnog scrolla. AC3: Ikon-dugmad imaju aria-label. AC4: Fokus je vidljiv pri navigaciji tastaturom. AC5: Prazna i loading stanja su jasno prikazana. |
| S10-T1 | Popravka e2e RBAC testova | Visok | 3 pts | Uskladiti testne pretpostavke i seed podatke, provjeriti cross-access scenarije, vratiti e2e testove na zeleno bez slabljenja sigurnosnih provjera. | AC1: e2e RBAC testovi prolaze. AC2: Negativni 403 slučajevi ostaju validni. AC3: Neovlašten pristup je i dalje blokiran. |
| S10-T2 | Popravka mrtvog inline SLA puta | Srednji | 2 pts | Provjeriti mapiranje prioriteta u dispečerskoj listi, uskladiti `final_priority` sa SLA logikom ili ukloniti mrtav inline put ako cron već pokriva funkcionalnost. | AC1: SLA status koristi ispravan prioritet. AC2: Ne postoji mrtav kod koji zavarava prikaz. AC3: Testovi potvrđuju očekivano ponašanje. |
| S10-T3 | Repo-wide prettier i formatiranje | Nizak | 1 pt | Pokrenuti formatiranje repozitorija u zasebnom commitu, osigurati da prettier check prolazi. | AC1: Prettier check prolazi. AC2: Formatiranje ne miješa funkcionalne izmjene. |
| S10-T4 | Usklađivanje dokumentacije | Srednji | 2 pts | Dopuniti Traceability za US-48, US-49 i US-50, uskladiti statuse sprintova, ažurirati decision log, review summary i demo dokumentaciju. | AC1: Dokumentacija odgovara stvarnom stanju implementacije. AC2: US-48 do US-50 su evidentirane. AC3: Nema očiglednih neslaganja između koda i dokumentacije. |
| S10-T5 | Primjena migracija na živu bazu | Visok | 2 pts | Primijeniti migracije za baznu lokaciju servisera i RLS politike, provjeriti da migracije prolaze, validirati rad na živoj bazi. | AC1: Migracije su uspješno primijenjene. AC2: RLS politike rade očekivano. AC3: Geo-preporuka ima potrebne podatke u bazi. |
