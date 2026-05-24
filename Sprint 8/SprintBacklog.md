# Sprint Goal

### Sprint broj 8

### Sprint cilj
Omogućiti nastavak operativnog toka nakon dispečerske obrade zahtjeva kroz dodjelu intervencije serviseru, razvoj osnovnog serviserskog modula, praćenje statusa rada na terenu, evidentiranje izvršenog rada i pripremu intervencije za zatvaranje.

### Ključne stavke koje tim želi završiti
- završiti povezivanje dispečerskog toka sa serviserskim modulom
- omogućiti dodjelu intervencije jednom serviseru ili timu servisera
- omogućiti serviseru pregled dodijeljenih intervencija
- omogućiti serviseru pregled detalja zadatka na terenu
- omogućiti prihvatanje i odbijanje dodijeljenog zadatka
- omogućiti ažuriranje statusa intervencije od strane servisera
- omogućiti evidentiranje izvršenog rada
- omogućiti dispečeru pregled evidentiranog rada
- omogućiti potvrdu i zatvaranje intervencije
- omogućiti razmjenu napomena između dispečera i servisera
- omogućiti pregled historije aktivnosti intervencije
- testirati kompletan tok: dispečer → serviser → izvršenje → evidencija → zatvaranje

### Rizici i zavisnosti

Postoji rizik:
- da statusi intervencije ne budu konzistentni između dispečerskog i serviserskog prikaza
- da se intervencija dodijeli serviseru koji nije dostupan ili nema odgovarajuću ulogu
- da serviser ažurira status u pogrešnom redoslijedu
- da se intervencija zatvori bez evidentiranog izvršenog rada
- da napomene i historija aktivnosti ne budu dovoljno jasno povezane sa intervencijom
- da se zbog velikog obima serviserskog modula dio funkcionalnosti mora pojednostaviti u osnovnu verziju

Zavisnosti:
- završena autentifikacija i kontrola pristupa po ulozi
- postojeći dispečerski pregled aktivnih intervencija
- postojeći detaljni prikaz intervencije za dispečera
- prethodno definisani statusi i faze intervencije
- postojeći model korisnika, servisera i dispečera
- postojeći model zahtjeva/intervencije u bazi
- ispravno definisana pravila dodjele intervencije
- ispravno definisana pravila prelaza statusa
- dostupni testni podaci za dispečera, servisera i intervencije


# Sprint Backlog

| ID | User Story | Prioritet | Procjena težine | Zadaci | Acceptance Criteria |
|---|---|---|---:|---|---|
| US-09 | Kao dispečer, želim dodijeliti intervenciju odgovornom serviseru, kako bi bilo jasno ko preuzima izvršenje zadatka. | Visok | 5 pts | Implementirati izbor odgovornog servisera u dispečerskom wizardu, prikazati listu dostupnih servisera kroz kartice, povezati odabranog servisera sa intervencijom u stanju forme, prikazati odabranog servisera u pregledu naloga i detaljima intervencije, pripremiti payload za backend/PostgreSQL upis. | AC1: Dispečer može uspješno dodijeliti intervenciju serviseru. AC2: Sistem evidentira dodjelu i povezuje intervenciju sa odabranim serviserom. AC3: Sistem ne dozvoljava potvrdu dodjele bez odabranog servisera. AC4: Dodijeljena intervencija se prikazuje serviseru u njegovom pregledu zadataka. AC5: Korisnik bez ovlaštenja ne može pristupiti funkciji dodjele. |
| US-10 | Kao dispečer, želim dodijeliti intervenciju timu servisera, kako bi složeniji zadaci mogli biti organizovani timski. | Srednji | 3 pts | Implementirati mogućnost višestruke dodjele servisera na jednu intervenciju, omogućiti prikaz više članova tima kroz kartice ili listu, spriječiti duplu dodjelu istog servisera, prikazati tim izvršilaca u detaljima intervencije i serviserskom dashboardu, pripremiti strukturu za PostgreSQL relaciju više servisera na jednu intervenciju. | AC1: Dispečer može dodijeliti više servisera istoj intervenciji. AC2: Sistem prikazuje kompletan tim izvršilaca povezan sa intervencijom. AC3: Sistem ne dozvoljava dodjelu istog servisera više puta istoj intervenciji. AC4: Svaki dodijeljeni serviser vidi intervenciju u svom pregledu zadataka. AC5: Promjene u timu izvršilaca evidentiraju se u historiji aktivnosti intervencije. |
| US-11 | Kao dispečer, želim planirati intervenciju unaprijed, kako bih mogao organizovati termin, resurse i izvršenje zadatka. | Visok | 5 pts | Implementirati UI za izbor planiranog termina, prikazati termin kroz vizuelne elemente kalendara/sata, omogućiti izbor datuma, vremena početka i očekivanog trajanja, prikazati planirani termin u pregledu naloga i detaljima intervencije, pripremiti strukturu za provjeru konflikata termina. | AC1: Dispečer može uspješno postaviti termin intervencije. AC2: Sistem ne prihvata nepotpune podatke o terminu. AC3: Sistem ne dozvoljava termin u prošlosti. AC4: Sistem upozorava na preklapanje termina za servisera ili tim. AC5: Sistem vizuelno označava zauzete termine. AC6: Sistem prihvata ručno trajanje ili dodjeljuje podrazumijevano trajanje. |
| US-15 | Kao serviser, želim pregledati intervencije koje su mi dodijeljene, kako bih znao koje zadatke trebam izvršiti i kojim redoslijedom ih trebam obrađivati. | Visok | 5 pts | Implementirati serviserski dashboard, prikazati KPI kartice za statuse intervencija, omogućiti filtriranje liste klikom na KPI, prikazati dodijeljene intervencije kroz kartice, osigurati da serviser vidi samo svoje intervencije, prilagoditi prikaz za mobile varijantu. | AC1: Serviser vidi listu aktivnih intervencija koje su mu dodijeljene. AC2: Sistem prikazuje osnovne podatke o svakoj intervenciji. AC3: Serviser ne vidi intervencije koje nisu njemu dodijeljene. AC4: Ako nema dodijeljenih intervencija, sistem prikazuje prazno stanje. AC5: Promjena statusa intervencije se odražava u serviserovom pregledu. |
| US-16 | Kao serviser, želim pregledati detalje zadatka na terenu, kako bih imao sve potrebne informacije za pravilno i efikasno izvršenje. | Visok | 5 pts | Implementirati detaljan prikaz intervencije za servisera, prikazati lokaciju, termin, korisnika, kontakt, opis problema, napomenu dispečera, prioritet i status, dodati map preview ili map komponentu, prikazati tok intervencije kroz horizontalni tracking, ukloniti irelevantne administrativne podatke iz serviserskog prikaza. | AC1: Serviser može otvoriti detalje dodijeljene intervencije. AC2: Sistem prikazuje sve informacije potrebne za izvršenje zadatka. AC3: Sistem prikazuje trenutni status intervencije. AC4: Serviser ne može otvoriti detalje intervencije koja mu nije dodijeljena. AC5: Prikaz je prilagođen radu na terenu i ne prikazuje nepotrebne interne podatke. |
| US-22 | Kao serviser, želim prihvatiti dodijeljeni zadatak, kako bih potvrdio da preuzimam odgovornost za njegovu realizaciju. | Visok | 3 pts | Dodati akciju za prihvatanje zadatka u serviserskom prikazu, promijeniti status intervencije u odgovarajuće stanje, prikazati vizuelnu potvrdu preuzimanja, evidentirati stanje u activity feedu ili pripremiti strukturu za backend evidenciju. | AC1: Serviser može prihvatiti zadatak koji mu je dodijeljen. AC2: Sistem mijenja status zadatka nakon prihvatanja. AC3: Sistem evidentira vrijeme ili događaj prihvatanja. AC4: Serviser ne može prihvatiti zadatak koji mu nije dodijeljen. AC5: Dispečer vidi da je zadatak prihvaćen. |
| US-23 | Kao serviser, želim odbiti dodijeljeni zadatak, kako bi dispečer mogao reagovati i izvršiti novu dodjelu. | Srednji | 3 pts | Dodati akciju za odbijanje zadatka, omogućiti unos razloga odbijanja, vratiti intervenciju u tok dispečerske obrade, prikazati razlog odbijanja u historiji aktivnosti, pripremiti vezu sa ponovnom dodjelom. | AC1: Serviser može odbiti dodijeljeni zadatak. AC2: Sistem zahtijeva unos razloga odbijanja. AC3: Sistem evidentira odbijanje i razlog. AC4: Intervencija se vraća u stanje koje zahtijeva novu dodjelu. AC5: Dispečer vidi da je zadatak odbijen i može reagovati. |
| US-14 | Kao serviser, želim po potrebi ažurirati status intervencije na kojoj radim, kako bi sistem odražavao trenutno stanje rada na terenu. | Visok | 5 pts | Implementirati statusni tok intervencije: dodijeljeno, na putu, na terenu, završeno, prikazati horizontalni live tracking, omogućiti promjenu statusa samo kroz dozvoljene prelaze, sinhronizovati prikaz statusa na serviserskom i dispečerskom prikazu, prikazati aktivni status vizuelno dominantno. | AC1: Serviser može promijeniti status intervencije koju je prihvatio. AC2: Serviser ne može mijenjati status intervencije koja mu nije dodijeljena. AC3: Sistem ne dozvoljava nevalidan status ili nedozvoljen prelaz. AC4: Završena intervencija se više ne može proizvoljno mijenjati. AC5: Promjena statusa je vidljiva dispečeru. |
| US-17 | Kao serviser, želim evidentirati izvršeni rad, kako bi sistem sadržavao tačan zapis o aktivnostima obavljenim tokom intervencije. | Srednji | 5 pts | Implementirati UI za evidenciju izvršenog rada, omogućiti unos opisa rada, napomena i eventualnog materijala, dodati checklistu intervencije, omogućiti/pripremiti upload foto dokumentacije, prikazati evidenciju rada u detaljima intervencije. | AC1: Serviser može unijeti opis izvršenog rada. AC2: Sistem povezuje evidenciju rada sa konkretnom intervencijom. AC3: Sistem ne dozvoljava spremanje prazne ili nevalidne evidencije ako je unos obavezan. AC4: Evidentirani rad je vidljiv u detaljima intervencije. AC5: Evidencija se može koristiti kao osnova za pregled i zatvaranje intervencije. |
| US-24 | Kao dispečer, želim pregledati evidentirani izvršeni rad, kako bih imao uvid u ono što je serviser uradio prije zatvaranja intervencije. | Visok | 3 pts | Prikazati evidentirani rad unutar detalja intervencije, prikazati opis rada, napomene, checklistu i foto dokumentaciju ako postoji, omogućiti dispečeru pregled prije potvrde zatvaranja, vizuelno odvojiti evidenciju rada od opisa problema. | AC1: Dispečer može pregledati evidentirani izvršeni rad. AC2: Sistem prikazuje podatke koje je serviser unio. AC3: Evidencija rada je povezana sa odgovarajućom intervencijom. AC4: Dispečer može koristiti evidenciju kao osnovu za kontrolu i zatvaranje intervencije. |
| US-25 | Kao dispečer, želim potvrditi i zatvoriti završenu intervenciju, kako bi proces bio formalno okončan u sistemu. | Visok | 5 pts | Implementirati finalni korak pregleda i potvrde, prikazati operativnu potvrdu umjesto digitalnog potpisa, validirati da intervencija ima potreban status i evidentiran rad, zaključati dalju obradu nakon zatvaranja ili pripremiti backend logiku zaključavanja, prikazati završni status. | AC1: Dispečer može zatvoriti završenu intervenciju. AC2: Sistem ne dozvoljava zatvaranje ako prethodni uslovi nisu ispunjeni. AC3: Zatvaranjem se mijenja status intervencije u završeno/zatvoreno. AC4: Nakon zatvaranja intervencija se ne može dalje uređivati kroz operativni tok. AC5: Zatvaranje se evidentira u historiji aktivnosti. |
| US-30 | Kao dispečer ili serviser, želim dodati kratku napomenu na konkretnu intervenciju, kako bi sve važne operativne informacije bile dostupne na jednom mjestu. | Srednji | 3 pts | Implementirati prikaz napomena na intervenciji, omogućiti unos nove napomene ako je funkcionalnost dostupna u sprintu, vizuelno odvojiti napomene dispečera od opisa problema, prikazati autora i vrijeme napomene, povezati napomene sa intervencijom. | AC1: Dispečer ili serviser može dodati napomenu na intervenciju. AC2: Sistem povezuje napomenu sa konkretnom intervencijom. AC3: Napomena prikazuje autora i vrijeme unosa. AC4: Napomene su vidljive relevantnim učesnicima procesa. AC5: Korisnici bez prava pristupa ne mogu vidjeti ili dodavati napomene. |
| US-32 | Kao dispečer, želim vidjeti listu svih prethodnih promjena i aktivnosti na zahtjevu, kako bih imao jasan uvid u hronologiju obrade od trenutka prijave do trenutnog statusa. | Srednji | 4 pts | Implementirati activity feed/historiju aktivnosti, prikazati promjene statusa, dodjelu servisera, planiranje termina, napomene, prihvatanje/odbijanje zadatka i zatvaranje, prikazati hronološki redoslijed događaja, koristiti vizuelni timeline sa ikonama iz postojeće biblioteke, bez hardkodiranih emoji ikona. | AC1: Sistem prikazuje hronološku listu aktivnosti intervencije. AC2: Svaka aktivnost ima opis, vrijeme i korisnika koji je izvršio akciju ako je dostupno. AC3: Promjene statusa se evidentiraju u historiji. AC4: Historija aktivnosti je dostupna dispečeru u detaljima intervencije. AC5: Korisnik bez ovlaštenja ne može pristupiti historiji aktivnosti. |

**Napomena:** Finalizacija operativnog toka, US-44–47, SLA eskalacije, strukturirani materijal i QA SB-09-36 planirani su u **Sprintu 9** (v. `Sprint 9/SprintBacklog.md`).
