# Decision Log

## Odluka #001 - Sprint 10 kao finalni sprint za dodanu vrijednost, stabilizaciju i predaju

| Polje               | Opis                                                                                                                                                                                                                                                     |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID odluke           | DLI-001                                                                                                                                                                                                                                                  |
| Datum               | 29.05.2026.                                                                                                                                                                                                                                              |
| Kratak naziv odluke | Opseg finalnog sprinta                                                                                                                                                                                                                                   |
| Opis problema       | Nakon implementacije svih kanonskih korisničkih priča US-01…US-47 bilo je potrebno odlučiti da li Sprint 10 treba koristiti za nove velike funkcionalnosti, samo za ispravke ili za balans između dodatne vrijednosti, stabilizacije i pripreme predaje. |
| Razmatrane opcije   | 1. Dodavati što više novih funkcionalnosti <br> 2. Raditi samo tehničko čišćenje i bug fixing <br> 3. Balansirati nove funkcionalnosti, UX poliranje, stabilizaciju i dokumentaciju                                                                      |
| Odabrana opcija     | Balansiran sprint sa tri toka: nove funkcionalnosti, UX poliranje i stabilizacija/predaja                                                                                                                                                                |
| Razlog izbora       | Pošto je MVP već funkcionalno zatvoren, najveću vrijednost u finalnom sprintu donosi kombinacija korisnih dopuna, stabilnosti, boljeg UX-a i usklađene dokumentacije                                                                                     |
| Posljedice odluke   | Sprint 10 uvodi nove story-je US-48, US-49 i US-50, ali istovremeno uključuje tehnički dug, testove, migracije, dokumentaciju i demo pripremu                                                                                                               |
| Status odluke       | aktivna                                                                                                                                                                                                                                                  |

### Trade-off analiza (Decision Matrix)

#### Težine kriterija

| Kriterij                           | Težina |
| ---------------------------------- | ------ |
| Vrijednost za finalnu prezentaciju | 5      |
| Stabilnost sistema                 | 5      |
| Rizik regresije                    | 4      |
| Usklađenost dokumentacije          | 4      |
| Izvodljivost u sprintu             | 4      |

#### Ocjenjivanje i rezultat

| Opcija                      | Vrijednost | Stabilnost | Rizik regresije | Dokumentacija | Izvodljivost | Ukupno |
| --------------------------- | ---------: | ---------: | --------------: | ------------: | -----------: | -----: |
| Mnogo novih funkcionalnosti |          5 |          2 |               2 |             2 |            2 |     50 |
| Samo bug fixing             |          2 |          5 |               5 |             4 |            5 |     86 |
| Balansiran finalni sprint   |          5 |          5 |               4 |             5 |            4 |     94 |

### Sažetak odluke

**Krajnja odluka:** Sprint 10 se koristi kao finalni sprint za dodanu vrijednost, stabilizaciju, UX poliranje i pripremu predaje.

| Stavka         | Objašnjenje                                                                                                                 |
| -------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Razlog izbora  | Sistem je već funkcionalno zatvoren kroz US-01…US-47, pa finalni sprint treba povećati kvalitet i prezentacijsku vrijednost |
| Prednosti      | Bolji demo, stabilniji sistem, jasnija dokumentacija i manji rizik pred predaju                                             |
| Nedostaci      | Manje prostora za velike nove funkcionalnosti                                                                               |
| Napomena       | Nove priče US-48…US-50 se dodaju kao nadogradnja na već kompletan MVP                                                       |
| Implementacija | Geo-preporuka, analitika, responsive/a11y poliranje, tehnički dug i finalni artefakti                                       |

### Detaljno obrazloženje

Sprint 10 se nalazi na kraju razvojnog ciklusa, neposredno pred predaju projekta. U tom trenutku više nije optimalno širiti sistem velikim brojem novih funkcionalnosti koje bi mogle ugroziti stabilnost već implementiranog toka aplikacije.

S obzirom da je kompletan kanonski opseg US-01…US-47 već implementiran, Sprint 10 ima drugačiju ulogu od ranijih sprintova. Njegov cilj nije da zatvori osnovne funkcionalnosti, nego da podigne vrijednost sistema kroz pažljivo odabrane dopune i da istovremeno stabilizuje aplikaciju za demonstraciju.

Zbog toga je odabran balansiran pristup. U sprint su uključene dvije funkcionalnosti koje imaju jasnu vrijednost za sistem i prezentaciju: geo-preporuka servisera po blizini i analitički dashboard s grafovima. Pored toga, uključeno je UX poliranje kroz responsive prikaz, prazna/loading stanja i accessibility poboljšanja. Treći tok se odnosi na tehnički dug, dokumentaciju, migracije i demo pripremu.

Ova odluka smanjuje rizik da finalni sprint postane preširok, a istovremeno osigurava da proizvod na kraju izgleda zrelije, stabilnije i profesionalnije.

---

## Odluka #002 - Geo-preporuka servisera po blizini kao dopuna scoring modelu

| Polje               | Opis                                                                                                                                                             |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID odluke           | DLI-002                                                                                                                                                          |
| Datum               | 29.05.2026.                                                                                                                                                      |
| Kratak naziv odluke | Geo-preporuka servisera                                                                                                                                          |
| Opis problema       | Postojeća preporuka servisera nije uzimala u obzir udaljenost servisera od lokacije intervencije, što je moglo dovesti do sporijeg odziva i neoptimalne dodjele. |
| Razmatrane opcije   | 1. Zadržati postojeću preporuku bez lokacije <br> 2. Dodjeljivati servisera samo po blizini <br> 3. Dodati blizinu kao dodatni faktor u postojeći scoring model  |
| Odabrana opcija     | Blizina servisera dodaje se kao jedan od faktora u kombinovani scoring model                                                                                     |
| Razlog izbora       | Ova opcija optimizuje vrijeme odziva, ali ne zanemaruje stručnost, opterećenje i verifikaciju servisera                                                          |
| Posljedice odluke   | Potrebno je čuvati baznu lokaciju servisera, računati udaljenost i prikazivati udaljenost u UI-u                                                                 |
| Status odluke       | aktivna                                                                                                                                                          |

### Trade-off analiza (Decision Matrix)

#### Težine kriterija

| Kriterij                             | Težina |
| ------------------------------------ | ------ |
| Vrijeme odziva                       | 5      |
| Kvalitet dodjele                     | 5      |
| Jednostavnost implementacije         | 3      |
| Fleksibilnost sistema                | 4      |
| Pouzdanost kod nedostajućih podataka | 4      |

#### Ocjenjivanje i rezultat

| Opcija                          | Odziv | Kvalitet | Jednostavnost | Fleksibilnost | Fallback | Ukupno |
| ------------------------------- | ----: | -------: | ------------: | ------------: | -------: | -----: |
| Bez lokacijskog faktora         |     2 |        4 |             5 |             3 |        5 |     74 |
| Samo najbliži serviser          |     5 |        2 |             4 |             2 |        2 |     61 |
| Kombinovani scoring sa blizinom |     5 |        5 |             3 |             5 |        4 |     92 |

### Sažetak odluke

**Krajnja odluka:** U scoring preporuke servisera dodaje se faktor udaljenosti, ali blizina nije jedini kriterij.

| Stavka         | Objašnjenje                                                                         |
| -------------- | ----------------------------------------------------------------------------------- |
| Razlog izbora  | Potrebno je smanjiti vrijeme odziva bez narušavanja kvaliteta dodjele               |
| Prednosti      | Brži izlazak na teren, bolja operativna raspodjela, jasnija preporuka dispečeru     |
| Nedostaci      | Potrebni su lokacijski podaci servisera i zahtjeva                                  |
| Napomena       | Ako koordinate nedostaju, sistem se vraća na postojeći scoring bez greške           |
| Implementacija | Haversine izračun udaljenosti, `udaljenost_km`, prikaz “Najbliži” i fallback logika |

### Detaljno obrazloženje

U sistemu servisnih intervencija vrijeme odziva je jedna od najvažnijih operativnih metrika. Ako se serviser dodjeljuje samo prema stručnosti ili trenutnom opterećenju, može se desiti da sistem preporuči osobu koja jeste kvalifikovana, ali se nalazi daleko od lokacije intervencije. To posebno postaje problem kod hitnih zahtjeva i SLA pravila.

Zbog toga je odlučeno da se u postojeći scoring model doda i faktor blizine. Međutim, blizina nije uzeta kao jedini kriterij, jer najbliži serviser ne mora uvijek biti najbolji izbor. Serviser može biti blizu, ali preopterećen, nedovoljno stručan za kategoriju intervencije ili neadekvatno verifikovan.

Kombinovani scoring model omogućava da se svi relevantni faktori posmatraju zajedno. Na taj način sistem dispečeru daje kvalitetniju preporuku, a ne potpuno automatsku odluku bez konteksta.

Važan dio odluke je i graceful fallback. Ako zahtjev ili serviser nemaju koordinate, sistem ne smije pasti niti dati pogrešan rezultat. U tom slučaju se blizina jednostavno izostavlja iz scoringa i koristi se postojeća logika preporuke.

---

## Odluka #003 - Bazna lokacija servisera se čuva na tabeli `osoba`

| Polje               | Opis                                                                                                                                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ID odluke           | DLI-003                                                                                                                                                            |
| Datum               | 29.05.2026.                                                                                                                                                        |
| Kratak naziv odluke | Bazna lokacija servisera                                                                                                                                           |
| Opis problema       | Za geo-preporuku servisera bilo je potrebno odlučiti gdje čuvati koordinate servisera koje predstavljaju njegovu baznu lokaciju.                                   |
| Razmatrane opcije   | 1. Čuvati koordinate u posebnoj tabeli lokacija <br> 2. Čuvati koordinate direktno na tabeli servisera <br> 3. Čuvati bazne koordinate na supertype tabeli `osoba` |
| Odabrana opcija     | Bazna lokacija servisera čuva se kroz kolone `bazna_latitude` i `bazna_longitude` na tabeli `osoba`                                                                |
| Razlog izbora       | Tabela `osoba` već predstavlja zajednički profilni sloj za korisnike i uposlenike, pa je logično mjesto za osnovne lokacijske podatke                              |
| Posljedice odluke   | Potrebna je migracija baze i UI za unos bazne lokacije servisera kroz profil/admin uređivanje                                                                      |
| Status odluke       | aktivna                                                                                                                                                            |

### Trade-off analiza (Decision Matrix)

#### Težine kriterija

| Kriterij                          | Težina |
| --------------------------------- | ------ |
| Usklađenost sa postojećim modelom | 5      |
| Jednostavnost implementacije      | 4      |
| Fleksibilnost                     | 4      |
| Normalizacija podataka            | 3      |
| Održavanje                        | 4      |

#### Ocjenjivanje i rezultat

| Opcija                       | Model | Jednostavnost | Fleksibilnost | Normalizacija | Održavanje | Ukupno |
| ---------------------------- | ----: | ------------: | ------------: | ------------: | ---------: | -----: |
| Posebna tabela lokacija      |     4 |             2 |             5 |             5 |          3 |     76 |
| Direktno na tabeli servisera |     3 |             4 |             3 |             3 |          3 |     64 |
| Na tabeli `osoba`            |     5 |             5 |             4 |             4 |          5 |     93 |

### Sažetak odluke

**Krajnja odluka:** Bazna lokacija servisera čuva se na tabeli `osoba`.

| Stavka         | Objašnjenje                                                                               |
| -------------- | ----------------------------------------------------------------------------------------- |
| Razlog izbora  | `osoba` već predstavlja zajednički profilni sloj i omogućava čistije povezivanje podataka |
| Prednosti      | Jednostavnija migracija, manje dupliranja, lakši pristup podacima                         |
| Nedostaci      | Polja postoje na `osoba`, iako se funkcionalno koriste samo za servisere                  |
| Napomena       | UI prikazuje i šalje baznu lokaciju samo za servisere                                     |
| Implementacija | Migracija `bazna_latitude` / `bazna_longitude`, profil i admin uređivanje lokacije        |

### Detaljno obrazloženje

Za geo-preporuku servisera sistem mora znati odakle serviser najčešće kreće ili koja je njegova bazna lokacija. Ta informacija nije isto što i lokacija zahtjeva, nego pripada profilu servisera.

Razmatrana je mogućnost posebne tabele lokacija, ali bi to u ovoj fazi povećalo kompleksnost bez velike potrebe. Također je razmatrano da se koordinate čuvaju direktno na tabeli servisera, ali to bi dodatno vezalo lokacijske podatke za jednu konkretnu ulogu.

Odabrano je da se bazna lokacija čuva na tabeli `osoba`, jer ta tabela već predstavlja osnovni profilni sloj. Time se dobija jednostavniji model i lakše povezivanje sa postojećim korisničkim podacima.

Iako se polja fizički nalaze na tabeli `osoba`, aplikacija ih koristi samo za servisere. Time se čuva fleksibilnost, a UI i backend pravila osiguravaju da se lokacija ne prikazuje ili ne koristi za uloge kojima nije potrebna.

---

## Odluka #004 - Analitički dashboard s grafovima bez nove npm zavisnosti

| Polje               | Opis                                                                                                                                                           |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID odluke           | DLI-004                                                                                                                                                        |
| Datum               | 29.05.2026.                                                                                                                                                    |
| Kratak naziv odluke | Grafovi bez dodatne biblioteke                                                                                                                                 |
| Opis problema       | Za analitički dashboard bilo je potrebno odlučiti da li koristiti novu chart biblioteku ili implementirati grafove kroz postojeći stack.                       |
| Razmatrane opcije   | 1. Uvesti novu biblioteku za grafove <br> 2. Koristiti čisti SVG/CSS i postojeći React/Tailwind stack <br> 3. Prikazati samo tabelarne KPI podatke bez grafova |
| Odabrana opcija     | Grafovi se implementiraju kroz čisti SVG/CSS bez nove npm zavisnosti                                                                                           |
| Razlog izbora       | Smanjuje se rizik povećanja bundle-a i novih zavisnosti, a dashboard i dalje dobija vizuelno uvjerljiv prikaz                                                  |
| Posljedice odluke   | Grafovi moraju biti jednostavniji i pažljivo ručno implementirani                                                                                              |
| Status odluke       | aktivna                                                                                                                                                        |

### Trade-off analiza (Decision Matrix)

#### Težine kriterija

| Kriterij              | Težina |
| --------------------- | ------ |
| Vizuelna vrijednost   | 5      |
| Performanse           | 4      |
| Rizik zavisnosti      | 4      |
| Brzina implementacije | 3      |
| Održavanje            | 3      |

#### Ocjenjivanje i rezultat

| Opcija                | Vizuelna vrijednost | Performanse | Rizik zavisnosti | Brzina | Održavanje | Ukupno |
| --------------------- | ------------------: | ----------: | ---------------: | -----: | ---------: | -----: |
| Nova chart biblioteka |                   5 |           3 |                2 |      5 |          4 |     75 |
| Čisti SVG/CSS         |                   4 |           5 |                5 |      3 |          4 |     88 |
| Samo tabele/KPI       |                   2 |           5 |                5 |      5 |          5 |     81 |

### Sažetak odluke

**Krajnja odluka:** Analitički dashboard koristi ručno implementirane SVG/CSS grafove bez nove chart biblioteke.

| Stavka         | Objašnjenje                                                                         |
| -------------- | ----------------------------------------------------------------------------------- |
| Razlog izbora  | Potrebni su vizuelni grafovi, ali bez povećanja tehničkog rizika u finalnom sprintu |
| Prednosti      | Manji bundle, manje zavisnosti, čist build                                          |
| Nedostaci      | Manje naprednih chart mogućnosti                                                    |
| Napomena       | Grafovi moraju imati `aria-label` i osnovnu pristupačnost                           |
| Implementacija | Bar chart, donut chart i line chart kroz reusable React komponente                  |

### Detaljno obrazloženje

Analitički dashboard je važan za finalnu prezentaciju jer omogućava dispečeru da brzo razumije stanje sistema kroz vizuelne pokazatelje. Međutim, finalni sprint nije idealan trenutak za uvođenje nove velike biblioteke ako se isti cilj može postići jednostavnijim pristupom.

Uvođenje nove chart biblioteke donijelo bi bržu implementaciju kompleksnijih grafova, ali bi povećalo bundle i uvelo dodatnu zavisnost neposredno pred predaju. To nije optimalno kada je cilj stabilnost i pouzdanost.

Zato je donesena odluka da se grafovi implementiraju kroz čisti SVG/CSS. Ovaj pristup je dovoljan za potrebne prikaze: raspodjelu po statusu, SLA stanje, opterećenje servisera i trend završenih intervencija.

Odluka zadržava vizuelnu vrijednost dashboarda, ali bez nepotrebnog povećanja tehničkog rizika.

---

## Odluka #005 - Analitički dashboard koristi postojeće metrike i izvještaje kao izvor istine

| Polje               | Opis                                                                                                                                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ID odluke           | DLI-005                                                                                                                                                            |
| Datum               | 29.05.2026.                                                                                                                                                        |
| Kratak naziv odluke | Konzistentnost analitike                                                                                                                                           |
| Opis problema       | Novi analitički dashboard mogao je imati vlastitu logiku računanja metrika, što bi moglo dovesti do razlike između dashboarda i postojećih izvještaja.             |
| Razmatrane opcije   | 1. Implementirati potpuno novu logiku metrika <br> 2. Ponovno koristiti postojeće agregacije i pravila gdje je moguće <br> 3. Prikazati samo statične/demo podatke |
| Odabrana opcija     | Dashboard koristi postojeća pravila i agregacije gdje je moguće                                                                                                    |
| Razlog izbora       | Osigurava konzistentnost podataka između analitike i već postojećih izvještaja                                                                                     |
| Posljedice odluke   | Potrebno je uskladiti API dashboarda sa postojećim izvještajnim modulima                                                                                           |
| Status odluke       | aktivna                                                                                                                                                            |

### Trade-off analiza (Decision Matrix)

#### Težine kriterija

| Kriterij                  | Težina |
| ------------------------- | ------ |
| Konzistentnost podataka   | 5      |
| Pouzdanost izvještaja     | 5      |
| Brzina implementacije     | 3      |
| Održavanje                | 4      |
| Prezentacijska vrijednost | 4      |

#### Ocjenjivanje i rezultat

| Opcija                   | Konzistentnost | Pouzdanost | Brzina | Održavanje | Prezentacija | Ukupno |
| ------------------------ | -------------: | ---------: | -----: | ---------: | -----------: | -----: |
| Nova logika              |              3 |          3 |      4 |          2 |            5 |     67 |
| Reuse postojećih pravila |              5 |          5 |      4 |          5 |            5 |     96 |
| Statični/demo podaci     |              1 |          1 |      5 |          3 |            3 |     45 |

### Sažetak odluke

**Krajnja odluka:** Analitički dashboard koristi postojeće agregacije, SLA pravila i izvještajne konvencije gdje god je moguće.

| Stavka         | Objašnjenje                                                                                |
| -------------- | ------------------------------------------------------------------------------------------ |
| Razlog izbora  | Dashboard ne smije prikazivati metrike koje se razlikuju od postojećih izvještaja          |
| Prednosti      | Konzistentni podaci, manje dupliranja logike, lakše održavanje                             |
| Nedostaci      | Dashboard zavisi od postojećih izvještajnih definicija                                     |
| Napomena       | Semantika perioda mora biti jasno dokumentovana                                            |
| Implementacija | `analitikaMetrike.ts`, API za `/dispecer/analitika`, reuse SLA pravila i izvještaja odziva |

### Detaljno obrazloženje

Analitički dashboard treba pomoći dispečeru da brzo razumije stanje sistema. Međutim, ako bi dashboard koristio drugačiju logiku računanja od postojećih izvještaja, korisnici bi mogli dobiti različite rezultate za iste podatke.

Zbog toga je odlučeno da se dashboard oslanja na postojeće koncepte i pravila gdje god je moguće. Posebno je važno da SLA prikaz i izvještaji odziva budu usklađeni, jer su to metrike koje utiču na razumijevanje performansi sistema.

Ova odluka smanjuje dupliranje poslovne logike i olakšava održavanje. Ako se kasnije promijene SLA pravila ili definicija odziva, dovoljno je ažurirati centralnu logiku, a dashboard i izvještaji ostaju usklađeni.

---

## Odluka #006 - Responsive, accessibility i prazna/loading stanja kao dio finalnog kvaliteta

| Polje               | Opis                                                                                                                                                                         |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID odluke           | DLI-006                                                                                                                                                                      |
| Datum               | 29.05.2026.                                                                                                                                                                  |
| Kratak naziv odluke | UX poliranje finalnog sprinta                                                                                                                                                |
| Opis problema       | Iako je funkcionalnost MVP-a implementirana, određeni ekrani su zahtijevali bolju upotrebljivost na mobilnim uređajima, jasnija prazna/loading stanja i bolju pristupačnost. |
| Razmatrane opcije   | 1. Ne dirati UI jer funkcionalnost već radi <br> 2. Raditi samo vizuelno poliranje <br> 3. Uvesti responsive, a11y i prazna/loading stanja kao formalni dio Sprinta 10       |
| Odabrana opcija     | Responsive, a11y i prazna/loading stanja se tretiraju kao posebna korisnička priča US-50                                                                                     |
| Razlog izbora       | Serviseri rade na terenu, pa aplikacija mora biti upotrebljiva i na manjim ekranima, uz jasne povratne informacije korisniku                                                 |
| Posljedice odluke   | Potrebno je proći kroz serviserske i ključne dispečerske ekrane i ujednačiti UX ponašanje                                                                                    |
| Status odluke       | aktivna                                                                                                                                                                      |

### Trade-off analiza (Decision Matrix)

#### Težine kriterija

| Kriterij                 | Težina |
| ------------------------ | ------ |
| Upotrebljivost na terenu | 5      |
| Profesionalni izgled     | 4      |
| Pristupačnost            | 4      |
| Tehnički rizik           | 3      |
| Vrijednost za demo       | 4      |

#### Ocjenjivanje i rezultat

| Opcija                     | Teren | Izgled | A11y | Rizik | Demo | Ukupno |
| -------------------------- | ----: | -----: | ---: | ----: | ---: | -----: |
| Ne dirati UI               |     2 |      2 |    2 |     5 |    2 |     49 |
| Samo vizuelno poliranje    |     3 |      5 |    2 |     4 |    4 |     68 |
| Responsive + a11y + stanja |     5 |      5 |    5 |     4 |    5 |     95 |

### Sažetak odluke

**Krajnja odluka:** UX poliranje se ne tretira kao kozmetika, nego kao funkcionalni kvalitet sistema kroz US-50.

| Stavka         | Objašnjenje                                                                                        |
| -------------- | -------------------------------------------------------------------------------------------------- |
| Razlog izbora  | Serviseri koriste sistem na terenu, a dispečeri trebaju jasna stanja sistema                       |
| Prednosti      | Bolji mobile UX, bolja pristupačnost, jasniji loading/error/empty prikazi                          |
| Nedostaci      | Troši vrijeme finalnog sprinta koje se moglo koristiti za nove feature-e                           |
| Napomena       | Fokus je na ključnim serviserskim i dispečerskim ekranima                                          |
| Implementacija | Responsive layout, `aria-label`, focus-visible, prazna/loading stanja i konzistentan dizajn-sistem |

### Detaljno obrazloženje

U finalnom sprintu nije dovoljno da aplikacija samo funkcionalno radi. Važno je da bude upotrebljiva, jasna i dovoljno stabilna za realan scenario korištenja. Posebno je važno da serviseri mogu koristiti aplikaciju na manjim ekranima jer rade na terenu, a ne samo za desktop računarom.

Zbog toga je responsive i accessibility dorada tretirana kao posebna korisnička priča, a ne kao neobavezno vizuelno poliranje. Prazna i loading stanja su također važna jer korisnik mora razumjeti šta se dešava kada podaci još nisu učitani ili kada nema rezultata.

Ova odluka povećava ukupni kvalitet sistema i smanjuje kognitivno opterećenje korisnika.

---
