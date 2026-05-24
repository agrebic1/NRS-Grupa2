# Domain Model

## Glavni entiteti

Domain model sistema za servisne intervencije zasniva se na skupini ključnih entiteta koji zajedno podržavaju cjelokupan poslovni proces od trenutka prijave kvara, preko njegove obrade, pa sve do realizacije i zatvaranja intervencije.

Centralnu ulogu u modelu imaju korisnici sistema koji su podijeljeni na dvije osnovne kategorije: **Korisnik_usluge** i **Uposlenici**. Entitet **Korisnik_usluge** predstavlja krajnjeg korisnika koji inicira proces prijavom kvara, dok entitet **Uposlenici** obuhvata interne aktere sistema, poput dispečera i servisera, koji upravljaju i izvršavaju intervencije.

Proces započinje kreiranjem entiteta **Zahtjev**, koji sadrži osnovne informacije o prijavljenom kvaru, uključujući opis problema, vrijeme prijave i povezane atribute. Na osnovu jednog zahtjeva može se formirati entitet **Intervencija**, koji predstavlja konkretan operativni zadatak dodijeljen serviserima i koji se prati kroz različite faze realizacije.

Kako bi se omogućila organizacija i odgovornost u radu, uveden je entitet **Dodjela**, koji modelira odnos između intervencije i uključenih uposlenika. Ovaj entitet omogućava evidentiranje procesa raspodjele zadataka, uključujući prihvatanje ili odbijanje zadatka, kao i mogućnost više pokušaja dodjele iste intervencije. Pored glavnog servisera, sistem podržava i opcionalno dodjeljivanje pomoćnog servisera.

Tokom same realizacije intervencije, aktivnosti na terenu se evidentiraju kroz entitet **Evidencija_rada**, koji omogućava detaljan uvid u izvršene radnje, trajanje intervencije i korištene resurse.

---

## Pomoćni entiteti

Pored ključnih entiteta, model uključuje i skup pomoćnih entiteta koji omogućavaju bolju organizaciju podataka, standardizaciju i praćenje toka poslovnog procesa.

Entitet **Historija_aktivnosti** ima važnu ulogu u praćenju svih promjena nad intervencijama i povezanim objektima, čime se osigurava transparentnost i mogućnost naknadne analize (audit trag). Svaka promjena je povezana sa uposlenikom koji ju je izvršio putem atributa `id_autora`, čime se osigurava odgovornost i sljedivost izmjena u sistemu.

Komunikacija između dispečera i servisera dodatno je podržana kroz entitet **Napomena**, koji omogućava razmjenu informacija vezanih za konkretnu intervenciju. Svaka napomena ima autora putem atributa `id_autora`.

Prostorni aspekt kvara modeliran je kroz entitet **Lokacija**, koji definiše gdje se problem desio i omogućava efikasnije planiranje intervencija na terenu.

Klasifikacija kvarova ostvarena je putem entiteta **Kategorija_kvara**, čime se omogućava grupisanje i lakša obrada sličnih tipova problema.

Za prioritizaciju rada koristi se entitet **Prioritet**, koji definiše nivo hitnosti rješavanja intervencije i direktno utiče na redoslijed izvršavanja zadataka.

Entitet **Status** predstavlja centralizovani mehanizam za praćenje trenutnog stanja različitih objekata unutar sistema. Umjesto kreiranja više odvojenih entiteta kao što su *status_intervencije*, *status_zahtjeva* ili *status_dodjele*, u modelu je definisan jedinstven entitet **Status** koji se koristi u svim ovim kontekstima. Svi statusi se nalaze na jednom mjestu, čime se osigurava konzistentnost u njihovom korištenju i lakša kontrola nad promjenama. Razlikovanje između tipova statusa postiže se putem atributa `tip_statusa`, koji je definisan kao ENUM. Ovaj atribut određuje na koji se tip entiteta konkretni status odnosi (npr. zahtjev, intervencija, dodjela), čime se omogućava logičko razdvajanje bez potrebe za dodatnim tabelama.

Entitet **Uloga** definiše funkcionalnu podjelu sistema između korisnika.

---

## Ključni atributi

Entitet **Zahtjev** sadrži osnovne informacije o prijavi kvara. Povezan je sa **Status**, **Kategorija_kvara** i **Lokacija**. Atribut `datum_vrijeme` označava vrijeme kreiranja zahtjeva, `je_otkazan` označava otkazivanje, a `razlog_otkazivanja` razlog.

Entitet **Intervencija** koristi `planirani_datum`, `datum_zavrsetka`, `id_dispecera` i veze sa **Prioritet** i **Status**.

Entitet **Dodjela** koristi `datum_dodjele`, `datum_odgovora`, `razlog_odbijanja`, `id_servisera`, `id_pomocnog_servisera`, `id_dispecera`.

Entitet **Evidencija_rada** koristi `vrijeme_pocetka`, `vrijeme_zavrsetka`, `utroseno_vrijeme`, `utroseni_materijal`, `ishod_rada`.

Entitet **Uposlenici** koristi `ime`, `prezime`, `jmbg`, `email`, `lozinka_hash`, `id_uloge`.

Kod entiteta **Evidencija_rada**, pored vremena početka i završetka, ključan je atribut `utroseno_vrijeme` koji služi za analitiku rada.

Entitet **Lokacija** je direktno povezan sa **Zahtjev**, a **Intervencija** ga nasljeđuje kroz 1:1 vezu.

---
## Veze između entiteta

**Korisnik_usluge (1:N) Zahtjev**  
Jedan korisnik usluge može kreirati više zahtjeva, dok svaki zahtjev pripada tačno jednom korisniku putem atributa `id_korisnika_usluge`.

**Zahtjev (N:1) Status**  
Svaki zahtjev ima jedan status (`id_statusa`), dok jedan status može biti dodijeljen većem broju zahtjeva.

**Zahtjev (N:1) Kategorija_kvara**  
Svaki zahtjev pripada jednoj kategoriji kvara (`id_kategorije_kvara`), dok jedna kategorija može biti povezana sa više zahtjeva.

**Zahtjev (N:1) Lokacija**  
Svaki zahtjev je vezan za jednu lokaciju (`id_lokacije`), dok jedna lokacija može imati više zahtjeva.

**Zahtjev (1:1) Intervencija**  
Svaki zahtjev može rezultirati najviše jednom intervencijom, i svaka intervencija je vezana za tačno jedan zahtjev putem atributa `id_zahtjeva`.

---

**Intervencija (N:1) Status**  
Svaka intervencija ima jedan status (`id_statusa`), dok jedan status može biti dodijeljen većem broju intervencija.

**Intervencija (N:1) Prioritet**  
Svaka intervencija ima jedan prioritet (`id_prioriteta`), dok jedan prioritet može važiti za više intervencija.

**Intervencija (N:1) Uposlenici (dispečer)**  
Jedan uposlenik (u ulozi dispečera) može biti zadužen za više intervencija, dok svaka intervencija ima tačno jednog dispečera putem atributa `id_dispecera`.

---

**Intervencija (1:N) Dodjela**  
Jedna intervencija može imati više dodjela, dok svaka dodjela pripada jednoj intervenciji putem atributa `id_intervencije`.

**Dodjela (N:1) Status**  
Svaka dodjela ima jedan status (`id_statusa`), dok jedan status može biti povezan sa više dodjela.

**Dodjela (N:1) Uposlenici – trostruka relacija**  
Dodjela ostvaruje vezu sa entitetom **Uposlenici** putem tri strane uloge:
- `id_dispecera`
- `id_servisera`
- `id_pomocnog_servisera`

Jedan uposlenik može učestvovati u više dodjela u različitim ulogama (dispečer, glavni serviser, pomoćni serviser), dok svaka dodjela referencira tačno po jednog uposlenika za svaku od ovih uloga.

---

**Intervencija (1:N) Napomena**  
Jedna intervencija može imati više napomena, dok svaka napomena pripada jednoj intervenciji putem atributa `id_intervencije`.

**Napomena (N:1) Uposlenici (autor)**  
Jedan uposlenik može napisati više napomena, dok svaka napomena ima jednog autora putem atributa `id_autora`.

---

**Intervencija (1:N) Evidencija_rada**  
Jedna intervencija može imati više zapisa evidencije rada, dok svaki zapis pripada jednoj intervenciji putem atributa `id_intervencije`.

**Evidencija_rada (N:1) Uposlenici**  
Jedan uposlenik može imati više evidencija rada, dok svaka evidencija rada pripada jednom uposleniku putem atributa `id_servisera`.

---

**Historija_aktivnosti (N:1) Intervencija**  
Svaka aktivnost je vezana za jednu intervenciju, dok jedna intervencija može imati više zapisa u historiji aktivnosti putem atributa `id_intervencije`.

**Historija_aktivnosti (N:1) Uposlenici (autor)**  
Jedan uposlenik može biti autor više aktivnosti, dok svaka aktivnost ima tačno jednog autora putem atributa `id_autora`.

---

**Napomena:**  
Entitet **Historija_aktivnosti** omogućava vođenje hronološkog zapisa (audit trail) svih promjena nad intervencijama, uključujući informacije o autoru, vremenu i tipu promjene.

---

## Poslovna pravila

- **Prava pristupa zavise od `id_uloge`**  
  Svaki korisnik sistema ima dodijeljenu ulogu koja određuje njegova prava i dozvoljene akcije u sistemu. Na osnovu vrijednosti atributa `id_uloge`, sistem kontroliše pristup funkcionalnostima kao što su kreiranje zahtjeva, upravljanje intervencijama ili administracija podataka.

- **Svaka izmjena se evidentira u entitetu Historija_aktivnosti sa `id_autora`**  
  Svaka promjena nad podacima (npr. promjena statusa, dodjela servisera, ažuriranje opisa) mora biti zabilježena u entitetu **Historija_aktivnosti**. Uz svaku izmjenu obavezno se bilježi korisnik koji je izvršio promjenu putem atributa `id_autora`.

- **Historija mora biti vezana za `id_intervencije` i `id_autora`**  
  Svaki zapis u **Historija_aktivnosti** mora biti povezan sa tačno jednom intervencijom (`id_intervencije`) i jednim uposlenikom (`id_autora`). Na taj način se omogućava potpuna sljedivost svih promjena i odgovornosti u sistemu.

- **Status mora odgovarati `tip_statusa`**  
  Svaki status u sistemu mora biti usklađen sa unaprijed definisanim tipom statusa (`tip_statusa`). Sistem treba osigurati da se statusi koriste isključivo u odgovarajućem kontekstu (npr. statusi za zahtjeve, intervencije ili dodjele).

- **Intervencija ne može postojati bez Zahtjeva**  
  Svaka intervencija mora biti direktno povezana sa jednim zahtjevom putem atributa `id_zahtjeva`. Nije dozvoljeno kreirati intervenciju bez prethodno evidentiranog zahtjeva.

- **Svaka Intervencija mora imati definisan Prioritet**  
  Prilikom kreiranja intervencije obavezno je dodijeliti prioritet (`id_prioriteta`). Prioritet određuje redoslijed izvršavanja intervencija i nivo njihove hitnosti.

- **Dodjela mora imati tačno jednog glavnog servisera (`id_servisera`)**  
  Svaka dodjela mora sadržavati jednog i samo jednog glavnog servisera koji je odgovoran za izvršenje zadatka. Ovaj podatak se evidentira kroz atribut `id_servisera`.

- **`id_pomocnog_servisera` je opcionalan**  
  U okviru dodjele moguće je definisati pomoćnog servisera, ali ovaj podatak nije obavezan. Sistem mora omogućiti da vrijednost atributa `id_pomocnog_servisera` bude NULL.

- **Status "u toku" zahtijeva definisan `datum_odgovora`**  
  Nije dozvoljeno postaviti status u stanje "u toku" ukoliko nije evidentiran datum odgovora (`datum_odgovora`). Ovim pravilom se osigurava da je svaka aktivna obrada zahtjeva vremenski evidentirana.

- **Zahtjev i Intervencija moraju imati definisanu lokaciju (`id_lokacije`)**  
  Svaki zahtjev mora biti vezan za tačnu lokaciju putem atributa `id_lokacije`, a ta lokacija se prenosi i na intervenciju. Lokacija predstavlja ključni kontekst za izvršenje servisne aktivnosti.

- **Intervencija se može završiti samo uz `ishod_rada` i završni status**  
  Intervencija se smatra završenom tek kada je definisan ishod rada (`ishod_rada`) i kada je postavljen odgovarajući završni status. Bez ova dva elementa nije moguće zatvoriti intervenciju.

- **`utroseni_materijal` može biti NULL**  
  Atribut `utroseni_materijal` u entitetu evidencije rada nije obavezan. U slučajevima kada tokom intervencije nije korišten materijal, ova vrijednost može ostati nedefinisana (NULL).
 
### Tabela entiteta i atributa

U sljedećoj tabeli su prikazani svi entiteti i svi atributi koji im pripadaju:

| **Entitet** | Atributi |
|----------|----------|
| **Uposlenici** | `id_uposlenika`, `id_uloge`, `ime`, `prezime`, `JMBG`, `broj_telefona`, `email`, `adresa`, `lozinka_hash` |
| **Uloga** | `id_uloge`, `naziv`, `opis` |
| **Korisnik usluge** | `id_korisnika_usluge`, `ime`, `prezime`, `broj_telefona`, `email`, `adresa`, `lozinka_hash` |
| **Zahtjev** | `id_zahtjeva`, `id_statusa`, `id_kategorije_kvara`, `id_korisnika_usluge`, `id_lokacije`, `opis_kvara`, `datum`, `vrijeme`, `je_otkazan`, `razlog_otkazivanja` |
| **Intervencija** | `id_intervencije`, `id_prioriteta`, `id_dispecera`, `id_zahtjeva`, `id_statusa`, `planirani_datum`, `datum_izvrsavanja`, `vrijeme_izvrsavanja`, `datum_kreiranja` |
| **Dodjela** | `id_dodjela`, `id_pomocnog_servisera`, `id_intervencije`, `id_servisera`, `id_dispecera`, `id_statusa`, `datum_dodjele`, `datum_odgovora`, `razlog_odbijanja` |
| **Evidencija_rada** | `id_evidencije`, `id_intervencije`, `id_servisera`, `datum_pocetka`, `datum_zavrsetka`, `vrijeme_pocetka`, `vrijeme_zavrsetka`, `utroseno_vrijeme`, `utroseni_materijal`, `opis`, `ishod_rada` |
| **Status** | `id_statusa`, `naziv`, `opis`, `tip_statusa` |
| **Prioritet** | `id_prioriteta`, `naziv`, `opis` |
| **Kategorija kvara** | `id_kategorije_kvara`, `naziv`, `opis` |
| **Lokacija** | `id_lokacije`, `adresa`, `grad`, `opcina`, `opis` |
| **Napomene** | `id_napomene`, `id_intervencije`, `id_autora`, `tekst`, `datum`, `vrijeme`, `tip_napomene` |
| **Historija aktivnosti** | `id_historije_aktivnosti`, `id_intervencije`, `id_autora`, `akcija`, `stara_vrijednost`, `nova_vrijednost`, `datum_promjene`, `vrijeme_promjene` |

---

# Use case model 
        
## Use Case 01 (US-01)

| Stavka | Sadržaj |
|--------|---------|
| **Aktor** | Neregistrovani korisnici |
| **Naziv use case-a** | Samostalna registracija korisnika usluge |
| **Kratak opis** | Ovaj use case opisuje proces u kojem korisnik usluge samostalno kreira novi korisnički nalog kako bi kasnije mogao pristupiti sistemu i koristiti njegove funkcionalnosti. |
| **Preduslovi** | Korisnik ima pristup registracionoj formi.<br>Sistem je dostupan i funkcionalan. |
| **Glavni tok** | 1. Korisnik otvara formu za registraciju.<br>2. Korisnik unosi potrebne podatke za registraciju (ime, email, lozinka i sl.).<br>3. Korisnik potvrđuje registraciju.<br>4. Sistem validira unesene podatke.<br>5. Sistem kreira novi korisnički nalog.<br>6. Sistem automatski dodjeljuje korisničku ulogu.<br>7. Sistem prikazuje poruku o uspješnoj registraciji. |
| **Alternativni tokovi** | **A1: Neispravni ili nepotpuni podaci**<br>&nbsp;&nbsp;3a. Korisnik potvrdi registraciju sa nepotpunim ili neispravnim podacima.<br>&nbsp;&nbsp;4a. Sistem detektuje grešku u unosu.<br>&nbsp;&nbsp;5a. Sistem ne kreira novi nalog.<br>&nbsp;&nbsp;6a. Sistem prikazuje poruku o grešci i traži ispravku podataka.<br><br>**A2: Korisnik već postoji u sistemu**<br>&nbsp;&nbsp;4b. Sistem utvrdi da korisnik sa istim jedinstvenim podacima već postoji.<br>&nbsp;&nbsp;5b. Sistem ne kreira novi nalog.<br>&nbsp;&nbsp;6b. Sistem prikazuje poruku da korisnik već postoji. |
| **Ishod** | Korisnički nalog je uspješno kreiran.<br>Korisniku je dodijeljena odgovarajuća korisnička uloga.<br>Korisnik se može prijaviti u sistem. |

  
## Use Case 02 (US-02)

| Stavka | Sadržaj |
|--------|---------|
| **Aktor** | Registrovani korisnici |
| **Naziv use case-a** | Prijava korisnika u sistem |
| **Kratak opis** | Ovaj use case opisuje proces u kojem registrovani korisnik unosi svoje kredencijale kako bi se prijavio u sistem i pristupio funkcionalnostima koje su mu dostupne. |
| **Preduslovi** | Korisnik ima kreiran korisnički nalog.<br>Korisnik ima pristup login formi.<br>Sistem je dostupan i funkcionalan. |
| **Glavni tok** | 1. Korisnik otvara formu za prijavu.<br>2. Korisnik unosi email i lozinku.<br>3. Korisnik potvrđuje prijavu.<br>4. Sistem validira unesene podatke.<br>5. Sistem provjerava kredencijale korisnika.<br>6. Sistem kreira korisničku sesiju.<br>7. Sistem preusmjerava korisnika na odgovarajuću početnu stranicu. |
| **Alternativni tokovi** | **A1: Neispravni kredencijali**<br>&nbsp;&nbsp;3a. Korisnik potvrdi prijavu sa netačnim kredencijalima.<br>&nbsp;&nbsp;4a. Sistem utvrđuje da kredencijali nisu ispravni.<br>&nbsp;&nbsp;5a. Sistem ne dozvoljava prijavu.<br>&nbsp;&nbsp;6a. Sistem prikazuje poruku o grešci.<br><br>**A2: Nepotpuni podaci za prijavu**<br>&nbsp;&nbsp;2a. Korisnik ne unese email ili lozinku.<br>&nbsp;&nbsp;3a. Sistem detektuje nedostatak podataka.<br>&nbsp;&nbsp;4a. Sistem prikazuje poruku da su polja obavezna.<br><br>**A3: Neaktivan korisnički nalog**<br>&nbsp;&nbsp;5a. Sistem utvrđuje da korisnički nalog nije aktivan.<br>&nbsp;&nbsp;6a. Sistem ne dozvoljava prijavu.<br>&nbsp;&nbsp;7a. Sistem prikazuje odgovarajuću poruku. |
| **Ishod** | Korisnik je uspješno prijavljen u sistem.<br>Kreirana je aktivna korisnička sesija.<br>Korisnik ima pristup funkcionalnostima u skladu sa svojom ulogom. |

## Use Case 03 (US-03)

| Stavka | Sadržaj |
|--------|---------|
| **Aktor** | Korisnik sistema |
| **Naziv use case-a** | Odjava korisnika iz sistema |
| **Kratak opis** | Ovaj use case opisuje proces u kojem prijavljeni korisnik završava svoju sesiju u sistemu kako bi spriječio neovlašten pristup svom korisničkom nalogu nakon završetka rada. |
| **Preduslovi** | Korisnik je prijavljen u sistem.<br>Postoji aktivna korisnička sesija.<br>Sistem je dostupan i funkcionalan. |
| **Glavni tok** | 1. Korisnik klikne na opciju za odjavu (logout).<br>2. Sistem prima zahtjev za odjavu.<br>3. Sistem invalidira korisničku sesiju.<br>4. Sistem briše sesijske podatke.<br>5. Sistem preusmjerava korisnika na login stranicu.<br>6. Sistem prikazuje poruku o uspješnoj odjavi. |
| **Alternativni tokovi** | **A1: Istek sesije (automatska odjava)**<br>&nbsp;&nbsp;1a. Korisnik je neaktivan tokom definisanog vremenskog perioda.<br>&nbsp;&nbsp;2a. Sistem automatski završava korisničku sesiju.<br>&nbsp;&nbsp;3a. Sistem preusmjerava korisnika na login stranicu.<br>&nbsp;&nbsp;4a. Sistem prikazuje poruku da je sesija istekla. |
| **Ishod** | Korisnik je uspješno odjavljen iz sistema.<br>Sesija je zatvorena.<br>Onemogućen je dalji pristup bez ponovne prijave. |

## Use Case 04 (US-04)

| Stavka | Sadržaj |
|--------|---------|
| **Aktor** | Administrator |
| **Naziv use case-a** | Kontrola pristupa prema korisničkoj ulozi |
| **Kratak opis** | Ovaj use case opisuje proces u kojem administrator upravlja korisničkim ulogama i pristupom funkcionalnostima sistema, kako bi svaki korisnik imao pristup samo onim podacima i akcijama koje odgovaraju njegovoj odgovornosti. |
| **Preduslovi** | Administrator je prijavljen u sistem.<br>U sistemu postoje definisane korisničke uloge.<br>Korisnici su evidentirani u sistemu.<br>Sistem je dostupan i funkcionalan. |
| **Glavni tok** | 1. Administrator pristupa modulu za upravljanje korisnicima i pravima pristupa.<br>2. Administrator bira korisnika iz liste.<br>3. Sistem prikazuje trenutnu korisničku ulogu i dostupne opcije pristupa.<br>4. Administrator dodjeljuje ili mijenja korisničku ulogu.<br>5. Sistem validira odabranu ulogu i pripadajuća pravila pristupa.<br>6. Sistem ažurira prava pristupa korisnika u skladu sa odabranom ulogom.<br>7. Sistem sprema promjene.<br>8. Sistem prikazuje potvrdu o uspješnoj izmjeni. |
| **Alternativni tokovi** | **A1: Nevažeća ili nedozvoljena uloga**<br>&nbsp;&nbsp;4a. Administrator odabere nepostojeću ili nedozvoljenu ulogu.<br>&nbsp;&nbsp;5a. Sistem detektuje grešku.<br>&nbsp;&nbsp;6a. Sistem ne dozvoljava izmjenu.<br>&nbsp;&nbsp;7a. Sistem prikazuje poruku o grešci.<br><br>**A2: Korisnik nije dostupan u sistemu**<br>&nbsp;&nbsp;2a. Administrator odabere korisnika koji više nije dostupan ili nije moguće učitati njegove podatke.<br>&nbsp;&nbsp;3a. Sistem prikazuje poruku o grešci.<br><br>**A3: Nedozvoljen pristup modulu**<br>&nbsp;&nbsp;1a. Korisnik bez administratorskih ovlaštenja pokuša pristupiti modulu za upravljanje korisnicima i pravima pristupa.<br>&nbsp;&nbsp;2a. Sistem odbija pristup.<br>&nbsp;&nbsp;3a. Sistem prikazuje poruku o nedozvoljenom pristupu. |
| **Ishod** | Korisniku je dodijeljena ili izmijenjena odgovarajuća korisnička uloga.<br>Pristup funkcionalnostima i podacima sistema je usklađen sa korisničkom ulogom.<br>Sistem osigurava kontrolu pristupa i jasnu raspodjelu odgovornosti. |

## Use Case 05 (US-05)

| Stavka | Sadržaj |
|--------|---------|
| **Aktor** | Korisnik usluge |
| **Naziv use case-a** | Prijava zahtjeva za servisnu intervenciju |
| **Kratak opis** | Ovaj use case opisuje proces u kojem korisnik usluge prijavljuje kvar ili zahtjev za servisnu intervenciju. Sistem evidentira unesene podatke, validira ih i kreira novi zahtjev koji postaje dostupan za dalju obradu. |
| **Preduslovi** | Korisnik je registrovan u sistemu.<br>Korisnik je prijavljen u sistem.<br>Korisnik ima pristup formi za prijavu zahtjeva.<br>Sistem je dostupan i funkcionalan. |
| **Glavni tok** | 1. Korisnik otvara formu za prijavu zahtjeva.<br>2. Korisnik unosi podatke o kvaru ili zahtjevu (opis, lokacija, vrijeme i sl.).<br>3. Korisnik potvrđuje slanje zahtjeva.<br>4. Sistem validira unesene podatke.<br>5. Sistem kreira novi zahtjev u bazi podataka.<br>6. Sistem automatski dodjeljuje početni status zahtjevu.<br>7. Sistem povezuje zahtjev sa korisnikom koji ga je podnio.<br>8. Sistem prikazuje potvrdu o uspješnoj prijavi. |
| **Alternativni tokovi** | **A1: Nepotpuni podaci**<br>&nbsp;&nbsp;2a. Korisnik ne unese sve obavezne podatke.<br>&nbsp;&nbsp;4a. Sistem detektuje nedostatak podataka.<br>&nbsp;&nbsp;5a. Sistem ne kreira zahtjev.<br>&nbsp;&nbsp;6a. Sistem prikazuje poruku o grešci i traži dopunu podataka.<br><br>**A2: Nevažeći podaci**<br>&nbsp;&nbsp;2a. Korisnik unese podatke u neispravnom formatu ili unese nevažeće vrijednosti.<br>&nbsp;&nbsp;4a. Sistem detektuje grešku u unosu.<br>&nbsp;&nbsp;5a. Sistem ne kreira zahtjev.<br>&nbsp;&nbsp;6a. Sistem prikazuje poruku o grešci.<br><br>**A3: Greška pri kreiranju zahtjeva**<br>&nbsp;&nbsp;5a. Dođe do greške pri kreiranju zahtjeva u sistemu.<br>&nbsp;&nbsp;6a. Sistem ne sprema zahtjev.<br>&nbsp;&nbsp;7a. Sistem obavještava korisnika da pokuša ponovo. |
| **Ishod** | Novi zahtjev za servisnu intervenciju je kreiran.<br>Zahtjev je povezan sa korisnikom koji ga je podnio.<br>Zahtjevu je dodijeljen početni status.<br>Zahtjev je spreman za dalju obradu od strane dispečera. |

## Use Case 06 (US-06)

| Stavka | Sadržaj |
|--------|---------|
| **Aktor** | Korisnik usluge |
| **Naziv use case-a** | Pregled vlastitog zahtjeva |
| **Kratak opis** | Ovaj use case opisuje proces u kojem korisnik pregledava svoje prethodno prijavljene zahtjeve, uključujući osnovne informacije i trenutni status obrade. |
| **Preduslovi** | Korisnik je registrovan u sistemu.<br>Korisnik je prijavljen u sistem.<br>Sistem je dostupan i funkcionalan. |
| **Glavni tok** | 1. Korisnik otvara listu svojih zahtjeva.<br>2. Sistem prikazuje listu svih zahtjeva povezanih sa korisnikom.<br>3. Korisnik bira jedan zahtjev za pregled.<br>4. Sistem prikazuje detalje odabranog zahtjeva (opis, status, datum i druge relevantne informacije).<br>5. Korisnik pregledava prikazane informacije. |
| **Alternativni tokovi** | **A1: Korisnik nema prijavljenih zahtjeva**<br>&nbsp;&nbsp;1a. Korisnik nema nijedan evidentiran zahtjev u sistemu.<br>&nbsp;&nbsp;2a. Sistem prikazuje poruku da nema dostupnih zahtjeva.<br><br>**A2: Greška pri učitavanju zahtjeva**<br>&nbsp;&nbsp;2a. Sistem ne može učitati listu zahtjeva ili detalje odabranog zahtjeva.<br>&nbsp;&nbsp;3a. Sistem prikazuje poruku o grešci.<br><br>**A3: Pokušaj pristupa tuđem zahtjevu**<br>&nbsp;&nbsp;3a. Korisnik pokuša otvoriti zahtjev koji nije povezan sa njegovim nalogom.<br>&nbsp;&nbsp;4a. Sistem blokira pristup.<br>&nbsp;&nbsp;5a. Sistem prikazuje poruku o zabrani pristupa. |
| **Ishod** | Korisnik vidi listu svojih zahtjeva.<br>Korisnik može pregledati detalje pojedinačnog zahtjeva.<br>Prikazan je tačan status i relevantne informacije o zahtjevu. |

## Use Case 07 (US-07)

| Stavka | Sadržaj |
|--------|---------|
| **Aktor** | Dispečer |
| **Naziv use case-a** | Pregled otvorenih intervencija |
| **Kratak opis** | Ovaj use case opisuje proces u kojem dispečer pregledava sve otvorene i aktivne intervencije kako bi imao jasan uvid u zahtjeve koji čekaju obradu ili su trenutno u toku. |
| **Preduslovi** | Dispečer je prijavljen u sistemu.<br>Sistem je dostupan i funkcionalan. |
| **Glavni tok** | 1. Dispečer otvara pregled intervencija (dashboard ili lista).<br>2. Sistem prikazuje listu svih otvorenih i aktivnih intervencija.<br>3. Sistem prikazuje ključne informacije o svakoj intervenciji (status, prioritet, lokacija, dodijeljeni serviser i sl.).<br>4. Dispečer pregledava listu i identifikuje relevantne intervencije.<br>5. Dispečer može odabrati intervenciju za detaljniji pregled ili dalju obradu. |
| **Alternativni tokovi** | **A1: Nema otvorenih intervencija**<br>&nbsp;&nbsp;2a. Sistem ne pronalazi nijednu otvorenu ili aktivnu intervenciju.<br>&nbsp;&nbsp;3a. Sistem prikazuje poruku da nema aktivnih intervencija.<br><br>**A2: Greška pri učitavanju intervencija**<br>&nbsp;&nbsp;2a. Sistem ne može učitati listu intervencija.<br>&nbsp;&nbsp;3a. Sistem prikazuje poruku o grešci.<br><br>**A3: Nedozvoljen pristup**<br>&nbsp;&nbsp;1a. Korisnik bez odgovarajuće uloge pokuša pristupiti pregledu intervencija.<br>&nbsp;&nbsp;2a. Sistem blokira pristup.<br>&nbsp;&nbsp;3a. Sistem prikazuje poruku o zabrani pristupa. |
| **Ishod** | Dispečer ima pregled svih aktivnih intervencija.<br>Intervencije su prikazane sa ključnim informacijama.<br>Omogućen je dalji rad nad odabranim intervencijama. |

## Use Case 08 (US-08)

| Stavka | Sadržaj |
|--------|--------|
| **Aktor** | Dispečer |
| **Naziv use case-a** | Pregled detalja pojedinačne intervencije |
| **Kratak opis** | Ovaj use case opisuje proces u kojem dispečer pregledava detaljne informacije o jednoj intervenciji kako bi imao potpuni uvid u njen status, tok i zaduženja. |
| **Preduslovi** | Dispečer je prijavljen u sistem.<br>Dispečer ima pristup listi intervencija.<br>Sistem je dostupan. |
| **Glavni tok** | 1. Dispečer otvara listu intervencija.<br>2. Dispečer odabire jednu intervenciju.<br>3. Sistem prikazuje detalje intervencije.<br>4. Sistem prikazuje informacije (opis, status, prioritet, lokacija, dodijeljeni serviser, historija aktivnosti itd.).<br>5. Dispečer pregledava podatke. |
| **Alternativni tokovi** | **A1: Intervencija ne postoji**<br>2a. Odabrana intervencija više ne postoji.<br>3a. Sistem prikazuje poruku o grešci.<br><br>**A2: Greška pri učitavanju detalja**<br>3a. Sistem ne može učitati detalje.<br>4a. Sistem prikazuje poruku o grešci.<br><br>**A3: Neovlašten pristup**<br>2a. Korisnik bez prava pristupa pokuša otvoriti intervenciju.<br>3a. Sistem blokira pristup.<br>4a. Sistem prikazuje poruku o zabrani. |
| **Ishod** | Dispečer ima detaljan uvid u intervenciju.<br>Prikazani su svi relevantni podaci.<br>Omogućeno donošenje odluka (dodjela, promjena prioriteta itd.). |

## Use Case 09 (US-09)

| Stavka | Sadržaj |
|--------|--------|
| **Aktor** | Dispečer |
| **Naziv use case-a** | Dodjela intervencije odgovornom serviseru |
| **Kratak opis** | Ovaj use case opisuje proces u kojem dispečer dodjeljuje intervenciju odgovornom serviseru kako bi bilo jasno ko preuzima izvršenje zadatka. |
| **Preduslovi** | Dispečer je prijavljen u sistem.<br>Dispečer ima pristup intervenciji.<br>Sistem je dostupan. |
| **Glavni tok** | 1. Dispečer otvara detalje intervencije.<br>2. Dispečer bira opciju za dodjelu servisera.<br>3. Sistem prikazuje listu dostupnih servisera.<br>4. Dispečer odabire servisera.<br>5. Dispečer potvrđuje dodjelu.<br>6. Sistem dodjeljuje intervenciju izabranom serviseru.<br>7. Sistem ažurira status intervencije (npr. "Dodijeljeno").<br>8. Sistem bilježi promjenu u historiji aktivnosti.<br>9. Sistem obavještava servisera o dodjeli. |
| **Alternativni tokovi** | **A1: Nema dostupnih servisera**<br>3a. Sistem ne pronalazi dostupne servisere.<br>4a. Sistem prikazuje poruku da nema dostupnih izvršilaca.<br><br>**A2: Greška pri dodjeli**<br>6a. Sistem ne uspije dodijeliti intervenciju.<br>7a. Sistem prikazuje poruku o grešci.<br><br>**A3: Promjena dodjele**<br>4a. Intervencija je već dodijeljena.<br>5a. Dispečer bira drugog servisera.<br>6a. Sistem ažurira dodjelu novim serviserom. |
| **Ishod** | Intervencija je dodijeljena odgovornom serviseru.<br>Serviser je obaviješten o zadatku.<br>Status intervencije je ažuriran.<br>Promjena je evidentirana u sistemu. |

## Use Case 10 (US-10)

| Stavka | Sadržaj |
|--------|--------|
| **Aktor** | Dispečer |
| **Naziv use case-a** | Dodjela intervencije serviserima |
| **Kratak opis** | Ovaj use case opisuje proces u kojem dispečer dodjeljuje intervenciju serviserima kroz entitet **Dodjela**, pri čemu definiše glavnog i opcionalno pomoćnog servisera. |
| **Preduslovi** | Dispečer je prijavljen u sistem.<br>Postoji intervencija kojoj se može pristupiti.<br>Intervencija ima odgovarajući status (`id_statusa`).<br>Sistem je dostupan. |
| **Glavni tok** | 1. Dispečer otvara detalje intervencije.<br>2. Sistem prikazuje postojeće informacije i eventualne dodjele.<br>3. Dispečer bira opciju za dodjelu servisera.<br>4. Sistem prikazuje listu dostupnih uposlenika (servisera).<br>5. Dispečer odabire glavnog servisera (`id_servisera`) i opcionalno pomoćnog servisera (`id_pomocnog_servisera`).<br>6. Dispečer potvrđuje dodjelu.<br>7. Sistem kreira zapis u entitetu **Dodjela** (`id_intervencije`, `id_dispecera`, `id_servisera`, `id_pomocnog_servisera`, `datum_dodjele`, `id_statusa`).<br>8. Sistem ažurira status intervencije (`id_statusa`).<br>9. Sistem bilježi promjenu u **Historija_aktivnosti** (`id_intervencije`, `id_autora`).<br>10. Sistem obavještava odabrane servisere. |
| **Alternativni tokovi** | **A1: Nema dostupnih servisera**<br>4a. Sistem ne pronalazi dostupne servisere.<br>5a. Sistem prikazuje poruku da nema dostupnih servisera.<br><br>**A2: Greška pri dodjeli**<br>7a. Sistem ne uspije kreirati zapis u **Dodjela**.<br>8a. Sistem prikazuje poruku o grešci.<br><br>**A3: Promjena dodjele**<br>2a. Intervencija već ima postojeću dodjelu.<br>3a. Dispečer bira izmjenu dodjele.<br>4a. Sistem kreira novi zapis u **Dodjela** ili ažurira postojeći.<br>5a. Sistem evidentira promjenu u **Historija_aktivnosti**. |
| **Ishod** | Intervencija je dodijeljena serviserima kroz entitet **Dodjela**.<br>Definisan je glavni (`id_servisera`) i opcionalno pomoćni serviser (`id_pomocnog_servisera`).<br>Status intervencije je ažuriran.<br>Promjena je evidentirana u **Historija_aktivnosti**.<br>Serviseri su obaviješteni. |

## Use Case 11 (US-11)

| Stavka | Sadržaj |
|--------|--------|
| **Aktor** | Dispečer |
| **Naziv use case-a** | Planiranje intervencije |
| **Kratak opis** | Ovaj use case opisuje proces u kojem dispečer planira intervenciju unaprijed definisanjem termina, resursa i organizacije izvršenja zadatka. |
| **Preduslovi** | Dispečer je prijavljen u sistem.<br>Postoji kreirana intervencija.<br>Intervencija ima osnovne podatke (lokacija, opis itd.).<br>Dostupni su serviseri ili timovi.<br>Sistem je dostupan. |
| **Glavni tok** | 1. Dispečer otvara detalje intervencije.<br>2. Dispečer bira opciju planiranja.<br>3. Sistem prikazuje dostupne termine i resurse.<br>4. Dispečer odabire datum i vrijeme intervencije.<br>5. Dispečer određuje potrebne resurse (serviser/tim).<br>6. Dispečer potvrđuje plan.<br>7. Sistem sprema planirane podatke.<br>8. Sistem ažurira status intervencije (npr. "Planirano").<br>9. Sistem obavještava uključene servisere. |
| **Alternativni tokovi** | **A1: Nema dostupnih termina**<br>3a. Sistem ne pronalazi slobodan termin.<br>4a. Sistem prikazuje poruku o nedostupnosti.<br><br>**A2: Konflikt termina**<br>4a. Odabrani termin se preklapa sa drugim zadatkom.<br>5a. Sistem upozorava dispečera.<br>6a. Dispečer bira novi termin.<br><br>**A3: Greška pri spremanju**<br>7a. Sistem ne uspije spremiti plan.<br>8a. Sistem prikazuje poruku o grešci. |
| **Ishod** | Intervencija ima definisan termin i resurse.<br>Status intervencije je ažuriran.<br>Serviseri su obaviješteni o planu.<br>Omogućeno efikasnije izvršenje zadatka. |


## Use Case 12 (US-12)

| Stavka | Sadržaj |
|--------|--------|
| **Aktor** | Dispečer |
| **Naziv use case-a** | Određivanje prioriteta intervencije |
| **Kratak opis** | Ovaj use case opisuje proces u kojem dispečer određuje prioritet intervencije kako bi zahtjevi bili obrađeni i raspoređeni prema njihovoj hitnosti i važnosti. |
| **Preduslovi** | Dispečer je prijavljen u sistem.<br>Postoji kreirana intervencija.<br>Intervencija ima osnovne informacije (opis, lokacija, hitnost).<br>Sistem je dostupan. |
| **Glavni tok** | 1. Dispečer otvara detalje intervencije.<br>2. Dispečer bira opciju za postavljanje prioriteta.<br>3. Sistem prikazuje dostupne nivoe prioriteta (npr. nizak, srednji, visok).<br>4. Dispečer odabire nivo prioriteta.<br>5. Dispečer potvrđuje izbor.<br>6. Sistem sprema odabrani prioritet.<br>7. Sistem ažurira prikaz intervencije.<br>8. Sistem bilježi promjenu u historiji aktivnosti. |
| **Alternativni tokovi** | **A1: Već postavljen prioritet**<br>2a. Intervencija već ima prioritet.<br>3a. Dispečer može promijeniti postojeći prioritet.<br><br>**A2: Greška pri spremanju**<br>6a. Sistem ne uspije spremiti promjenu.<br>7a. Sistem prikazuje poruku o grešci.<br><br>**A3: Neovlašten pristup**<br>2a. Korisnik bez uloge dispečera pokuša promijeniti prioritet.<br>3a. Sistem blokira akciju. |
| **Ishod** | Intervencija ima definisan prioritet.<br>Prioritet je vidljiv u sistemu.<br>Promjena je evidentirana.<br>Omogućena bolja organizacija i raspodjela zadataka. |


## Use Case 13 (US-13)

| Stavka | Sadržaj |
|--------|--------|
| **Aktor** | Dispečer |
| **Naziv use case-a** | Pregled statusa intervencija od strane dispečera |
| **Kratak opis** | Ovaj use case opisuje proces u kojem dispečer pregledava statuse intervencija kako bi mogao pratiti tok rada i imati jasan uvid u trenutnu fazu obrade svakog zahtjeva. |
| **Preduslovi** | Dispečer je prijavljen u sistem.<br>Dispečer ima pristup pregledu intervencija.<br>Sistem je dostupan. |
| **Glavni tok** | 1. Dispečer otvara pregled intervencija.<br>2. Sistem prikazuje listu intervencija sa njihovim statusima.<br>3. Sistem prikazuje dodatne informacije (npr. prioritet, dodijeljeni serviser, rok).<br>4. Dispečer pregledava statuse intervencija.<br>5. Dispečer prati tok rada i identifikuje intervencije koje zahtijevaju pažnju. |
| **Alternativni tokovi** | **A1: Nema intervencija**<br>2a. Sistem ne pronalazi nijednu intervenciju.<br>3a. Sistem prikazuje poruku da nema dostupnih podataka.<br><br>**A2: Greška pri učitavanju**<br>2a. Sistem ne može učitati podatke.<br>3a. Sistem prikazuje poruku o grešci.<br><br>**A3: Neovlašten pristup**<br>1a. Korisnik bez uloge dispečera pokuša pristupiti.<br>2a. Sistem blokira pristup.<br>3a. Sistem prikazuje poruku o zabrani pristupa. |
| **Ishod** | Dispečer ima pregled statusa svih intervencija.<br>Omogućen je nadzor procesa.<br>Lakše se uočavaju zastoji i problemi.<br>Omogućena je bolja kontrola rada. |

## Use Case 14 (US-14)

| Stavka | Sadržaj |
|--------|--------|
| **Aktor** | Serviser |
| **Naziv use case-a** | Ažuriranje statusa intervencije od strane servisera |
| **Kratak opis** | Ovaj use case opisuje proces u kojem serviser po potrebi ažurira status intervencije na kojoj radi, kako bi sistem odražavao trenutno stanje rada na terenu. |
| **Preduslovi** | Serviser je prijavljen u sistem.<br>Serviser ima pristup svojim intervencijama.<br>Sistem je dostupan. |
| **Glavni tok** | 1. Serviser otvara listu svojih dodijeljenih intervencija.<br>2. Serviser odabire intervenciju.<br>3. Serviser bira opciju za promjenu statusa.<br>4. Sistem prikazuje dostupne statuse (npr. "U toku", "Završeno", "Na čekanju").<br>5. Serviser odabire novi status.<br>6. Serviser potvrđuje izmjenu.<br>7. Sistem ažurira status intervencije.<br>8. Sistem bilježi promjenu u historiji aktivnosti. |
| **Alternativni tokovi** | **A1: Nevažeći status**<br>5a. Serviser odabere nevažeći status.<br>6a. Sistem detektuje grešku.<br>7a. Sistem ne dozvoljava izmjenu.<br>8a. Sistem prikazuje poruku o grešci.<br><br>**A2: Greška pri spremanju**<br>7a. Sistem ne uspije spremiti promjenu.<br>8a. Sistem prikazuje poruku o grešci.<br><br>**A3: Neovlašten pristup**<br>2a. Serviser pokuša pristupiti intervenciji koja mu nije dodijeljena.<br>3a. Sistem blokira pristup.<br>4a. Sistem prikazuje poruku o zabrani pristupa. |
| **Ishod** | Status intervencije je ažuriran.<br>Sistem prikazuje tačno stanje rada.<br>Smanjena je potreba za dodatnim provjerama.<br>Poboljšana je koordinacija između učesnika. |

## Use Case 15 (US-15)

| Stavka | Sadržaj |
|--------|--------|
| **Aktor** | Serviser |
| **Naziv use case-a** | Pregled dodijeljenih intervencija |
| **Kratak opis** | Ovaj use case opisuje proces u kojem serviser pregledava intervencije koje su mu dodijeljene, kako bi znao koje zadatke treba izvršiti i kojim redoslijedom ih treba obraditi. |
| **Preduslovi** | Serviser je prijavljen u sistem.<br>Serviser ima pristup svojim intervencijama.<br>Sistem je dostupan. |
| **Glavni tok** | 1. Serviser otvara listu svojih dodijeljenih intervencija.<br>2. Sistem prikazuje listu intervencija dodijeljenih serviseru.<br>3. Sistem prikazuje ključne informacije (status, prioritet, lokacija, rok itd.).<br>4. Serviser pregledava listu i organizuje redoslijed rada.<br>5. Serviser može odabrati intervenciju za detaljniji pregled. |
| **Alternativni tokovi** | **A1: Nema dodijeljenih intervencija**<br>2a. Sistem ne pronalazi nijednu intervenciju.<br>3a. Sistem prikazuje poruku da nema dodijeljenih zadataka.<br><br>**A2: Greška pri učitavanju**<br>2a. Sistem ne može učitati intervencije.<br>3a. Sistem prikazuje poruku o grešci.<br><br>**A3: Neovlašten pristup**<br>1a. Neautorizovan korisnik pokuša pristupiti listi.<br>2a. Sistem blokira pristup.<br>3a. Sistem prikazuje poruku o zabrani pristupa. |
| **Ishod** | Serviser ima pregled svojih zadataka.<br>Omogućena je lakša organizacija rada.<br>Smanjen je broj propuštenih intervencija.<br>Serviser može planirati izvršenje zadataka. |

## Use Case 16 (US-16)

| Stavka | Sadržaj |
|--------|--------|
| **Aktor** | Serviser |
| **Naziv use case-a** | Pregled detalja zadatka na terenu |
| **Kratak opis** | Ovaj use case opisuje proces u kojem serviser pregledava detalje zadatka na terenu kako bi imao sve potrebne informacije za njegovo pravilno i efikasno izvršavanje. |
| **Preduslovi** | Serviser je prijavljen u sistem.<br>Serviser ima pristup svojim intervencijama.<br>Sistem je dostupan. |
| **Glavni tok** | 1. Serviser otvara listu svojih intervencija.<br>2. Serviser odabire intervenciju.<br>3. Sistem prikazuje detalje zadatka.<br>4. Sistem prikazuje informacije (opis kvara, lokacija, prioritet, status, napomene itd.).<br>5. Serviser pregledava podatke prije izvršenja zadatka. |
| **Alternativni tokovi** | **A1: Intervencija ne postoji**<br>2a. Odabrana intervencija više ne postoji.<br>3a. Sistem prikazuje poruku o grešci.<br><br>**A2: Greška pri učitavanju**<br>3a. Sistem ne može učitati detalje.<br>4a. Sistem prikazuje poruku o grešci.<br><br>**A3: Neovlašten pristup**<br>2a. Serviser pokuša pristupiti intervenciji koja mu nije dodijeljena.<br>3a. Sistem blokira pristup.<br>4a. Sistem prikazuje poruku o zabrani pristupa. |
| **Ishod** | Serviser ima sve potrebne informacije za izvršenje zadatka.<br>Smanjen je broj grešaka tokom rada.<br>Poboljšana je priprema prije intervencije.<br>Omogućeno efikasnije izvršenje zadatka. |

## Use Case 17 (US-17)

| Stavka | Sadržaj |
|--------|--------|
| **Aktor** | Serviser |
| **Naziv use case-a** | Evidentiranje izvršenog rada |
| **Kratak opis** | Ovaj use case opisuje proces u kojem serviser evidentira izvršeni rad kako bi sistem sadržavao tačan zapis o aktivnostima obavljenim tokom intervencije. |
| **Preduslovi** | Serviser je prijavljen u sistem.<br>Serviser ima pristup svojim intervencijama.<br>Sistem je dostupan.|
| **Glavni tok** | 1. Serviser otvara detalje intervencije.<br>2. Serviser bira opciju za evidentiranje rada.<br>3. Serviser unosi podatke o izvršenim aktivnostima (opis rada, utrošeno vrijeme, materijal itd.).<br>4. Serviser potvrđuje unos.<br>5. Sistem validira unesene podatke.<br>6. Sistem sprema evidenciju rada.<br>7. Sistem povezuje zapis sa intervencijom.<br>8. Sistem bilježi promjenu u historiji aktivnosti. |
| **Alternativni tokovi** | **A1: Nepotpuni podaci**<br>3a. Serviser ne unese sve obavezne podatke.<br>5a. Sistem detektuje nedostatak podataka.<br>6a. Sistem ne sprema zapis.<br>7a. Sistem prikazuje poruku o grešci.<br><br>**A2: Greška pri spremanju**<br>6a. Sistem ne uspije spremiti podatke.<br>7a. Sistem prikazuje poruku o grešci.<br><br>**A3: Neovlašten pristup**<br>1a. Serviser pokuša pristupiti intervenciji koja mu nije dodijeljena.<br>2a. Sistem blokira pristup.<br>3a. Sistem prikazuje poruku o zabrani pristupa. |
| **Ishod** | Evidencija izvršenog rada je uspješno zabilježena.<br>Podaci o intervenciji su ažurirani.<br>Omogućena je transparentnost procesa.<br>Omogućen je pregled izvršenja rada. |

## Use Case 18 (US-18)

| Stavka | Sadržaj |
|--------|--------|
| **Aktor** | Administrator |
| **Naziv use case-a** | Administrativno kreiranje internog korisničkog naloga |
| **Kratak opis** | Ovaj use case opisuje proces u kojem administrator kreira korisnički nalog za internog korisnika sistema, kako bi mu omogućio pristup sistemu u skladu sa njegovom ulogom. |
| **Preduslovi** | Administrator je prijavljen u sistem.<br>Postoje definisane korisničke uloge.<br>Sistem je dostupan i funkcionalan. |
| **Glavni tok** | 1. Administrator otvara modul za upravljanje korisnicima.<br>2. Administrator bira opciju za kreiranje novog korisnika.<br>3. Administrator unosi podatke o korisniku (ime, email, uloga itd.).<br>4. Administrator potvrđuje unos.<br>5. Sistem validira unesene podatke.<br>6. Sistem kreira novi korisnički nalog.<br>7. Sistem dodjeljuje odgovarajuću ulogu korisniku.<br>8. Sistem sprema podatke.<br>9. Sistem prikazuje potvrdu o uspješnom kreiranju naloga. |
| **Alternativni tokovi** | **A1: Nepotpuni ili nevažeći podaci**<br>3a. Administrator unese nepotpune ili neispravne podatke.<br>5a. Sistem detektuje grešku.<br>6a. Sistem ne kreira nalog.<br>7a. Sistem prikazuje poruku o grešci.<br><br>**A2: Duplikat korisnika**<br>3a. Administrator unese email koji već postoji u sistemu.<br>5a. Sistem detektuje duplikat.<br>6a. Sistem ne dozvoljava kreiranje naloga.<br>7a. Sistem prikazuje poruku da korisnik već postoji.<br><br>**A3: Neovlašten pristup**<br>1a. Korisnik bez administratorske uloge pokuša pristupiti modulu.<br>2a. Sistem blokira pristup.<br>3a. Sistem prikazuje poruku o zabrani pristupa. |
| **Ishod** | Novi korisnički nalog je kreiran.<br>Korisniku je dodijeljena odgovarajuća uloga.<br>Omogućen je pristup sistemu.<br>Jasno su definisane odgovornosti korisnika. |

## Use Case 19 (US-19)

| Stavka | Sadržaj |
|--------|--------|
| **Aktor** | Administrator |
| **Naziv use case-a** | Pregled postojećih korisničkih naloga |
| **Kratak opis** | Ovaj use case opisuje proces u kojem administrator pregledava postojeće korisničke naloge kako bi imao uvid u korisnike sistema i mogao njima upravljati. |
| **Preduslovi** | Administrator je prijavljen u sistem.<br>Administrator ima pristup modulu za upravljanje korisnicima.<br>Sistem je dostupan. |
| **Glavni tok** | 1. Administrator otvara modul za upravljanje korisnicima.<br>2. Sistem prikazuje listu svih korisničkih naloga.<br>3. Sistem prikazuje osnovne informacije (ime, email, uloga, status itd.).<br>4. Administrator pregledava listu korisnika.<br>5. Administrator može odabrati korisnika za detaljniji pregled ili izmjene. |
| **Alternativni tokovi** | **A1: Nema korisničkih naloga**<br>2a. Sistem ne pronalazi nijedan korisnički nalog.<br>3a. Sistem prikazuje poruku da nema dostupnih korisnika.<br><br>**A2: Greška pri učitavanju**<br>2a. Sistem ne može učitati korisničke naloge.<br>3a. Sistem prikazuje poruku o grešci.<br><br>**A3: Neovlašten pristup**<br>1a. Korisnik bez administratorske uloge pokuša pristupiti modulu.<br>2a. Sistem blokira pristup.<br>3a. Sistem prikazuje poruku o zabrani pristupa. |
| **Ishod** | Administrator ima pregled svih korisničkih naloga.<br>Omogućen je uvid u korisničke uloge.<br>Olakšano je upravljanje korisnicima.<br>Sistem omogućava dalje administrativne akcije. |

## Use Case 20 (US-20)

| Stavka | Sadržaj |
|--------|--------|
| **Aktor** | Administrator |
| **Naziv use case-a** | Promjena korisničke uloge |
| **Kratak opis** | Ovaj use case opisuje proces u kojem administrator mijenja korisničku ulogu kako bi korisnik imao pristup funkcionalnostima koje odgovaraju njegovoj novoj odgovornosti u sistemu. |
| **Preduslovi** | Administrator je prijavljen u sistem.<br>Administrator ima pristup modulu za upravljanje korisnicima.<br>Sistem je dostupan. |
| **Glavni tok** | 1. Administrator otvara modul za upravljanje korisnicima.<br>2. Administrator bira korisnika iz liste.<br>3. Administrator pregleda trenutnu korisničku ulogu.<br>4. Administrator bira novu korisničku ulogu.<br>5. Administrator potvrđuje izmjenu.<br>6. Sistem validira odabranu ulogu.<br>7. Sistem ažurira korisničku ulogu.<br>8. Sistem sprema promjene.<br>9. Sistem prikazuje potvrdu o uspješnoj izmjeni. |
| **Alternativni tokovi** | **A1: Nevažeća uloga**<br>4a. Administrator odabere nepostojeću ili nevažeću ulogu.<br>6a. Sistem detektuje grešku.<br>7a. Sistem ne dozvoljava izmjenu.<br>8a. Sistem prikazuje poruku o grešci.<br><br>**A2: Greška pri spremanju**<br>7a. Sistem ne uspije spremiti promjene.<br>8a. Sistem prikazuje poruku o grešci.<br><br>**A3: Neovlašten pristup**<br>1a. Korisnik bez administratorske uloge pokuša pristupiti modulu.<br>2a. Sistem blokira pristup.<br>3a. Sistem prikazuje poruku o zabrani pristupa. |
| **Ishod** | Korisniku je dodijeljena nova uloga.<br>Pristup funkcionalnostima je ažuriran.<br>Osigurana je sigurnost sistema.<br>Omogućena je bolja organizacija rada. |

## Use Case 21 (US-21)

| Stavka | Sadržaj |
|--------|--------|
| **Aktor** | Administrator |
| **Naziv use case-a** | Deaktivacija korisničkog naloga |
| **Kratak opis** | Ovaj use case opisuje proces u kojem administrator deaktivira korisnički nalog kako bi spriječio dalji pristup korisniku koji više ne treba koristiti sistem. |
| **Preduslovi** | Administrator je prijavljen u sistem.<br>Administrator ima pristup modulu za upravljanje korisnicima.<br>Sistem je dostupan. |
| **Glavni tok** | 1. Administrator otvara modul za upravljanje korisnicima.<br>2. Administrator bira korisnički nalog iz liste.<br>3. Administrator pregleda detalje korisnika.<br>4. Administrator bira opciju za deaktivaciju naloga.<br>5. Administrator potvrđuje deaktivaciju.<br>6. Sistem mijenja status naloga u "deaktiviran".<br>7. Sistem onemogućava dalju prijavu korisnika.<br>8. Sistem sprema promjene.<br>9. Sistem prikazuje potvrdu o uspješnoj deaktivaciji. |
| **Alternativni tokovi** | **A1: Već deaktiviran nalog**<br>4a. Administrator pokuša deaktivirati već deaktiviran nalog.<br>5a. Sistem prikazuje informaciju da je nalog već deaktiviran.<br><br>**A2: Greška pri spremanju**<br>6a. Sistem ne uspije promijeniti status naloga.<br>7a. Sistem prikazuje poruku o grešci.<br><br>**A3: Neovlašten pristup**<br>1a. Korisnik bez administratorske uloge pokuša izvršiti deaktivaciju.<br>2a. Sistem blokira pristup.<br>3a. Sistem prikazuje poruku o zabrani pristupa. |
| **Ishod** | Korisnički nalog je deaktiviran.<br>Korisniku je onemogućen pristup sistemu.<br>Podaci o korisniku ostaju sačuvani u sistemu.<br>Osigurana je sigurnost i kontrola pristupa. |

## Use Case 22 (US-22)

| Stavka | Sadržaj |
|--------|--------|
| **Aktor** | Serviser |
| **Naziv use case-a** | Prihvatanje dodijeljenog zadatka |
| **Kratak opis** | Ovaj use case opisuje proces u kojem serviser prihvata dodijeljeni zadatak kako bi potvrdio da preuzima odgovornost za njegovu realizaciju. |
| **Preduslovi** | Serviser je prijavljen u sistem.<br>Postoji dodijeljena intervencija serviseru.<br>Serviser ima pristup listi svojih zadataka.<br>Sistem je dostupan i funkcionalan. |
| **Glavni tok** | 1. Serviser otvara listu dodijeljenih intervencija.<br>2. Serviser bira jednu intervenciju.<br>3. Serviser pregleda detalje zadatka.<br>4. Serviser bira opciju za prihvatanje zadatka.<br>5. Serviser potvrđuje prihvatanje.<br>6. Sistem ažurira status intervencije (npr. "U toku").<br>7. Sistem bilježi promjenu u historiji aktivnosti.<br>8. Sistem prikazuje potvrdu o uspješnom prihvatanju. |
| **Alternativni tokovi** | **A1: Zadatak već prihvaćen**<br>4a. Intervencija je već prihvaćena od strane servisera.<br>5a. Sistem prikazuje informaciju da je zadatak već u obradi.<br><br>**A2: Greška pri ažuriranju**<br>6a. Sistem ne uspije ažurirati status.<br>7a. Sistem prikazuje poruku o grešci.<br><br>**A3: Neovlašten pristup**<br>2a. Korisnik koji nije dodijeljeni serviser pokušava pristupiti zadatku.<br>3a. Sistem blokira pristup.<br>4a. Sistem prikazuje poruku o zabrani pristupa. |
| **Ishod** | Zadatak je prihvaćen od strane servisera.<br>Status intervencije je ažuriran.<br>Serviser preuzima odgovornost za izvršenje.<br>Promjena je evidentirana u sistemu. |

## Use Case 23 (US-23)

| Stavka | Sadržaj |
|--------|--------|
| **Aktor** | Serviser |
| **Naziv use case-a** | Odbijanje dodijeljenog zadatka |
| **Kratak opis** | Ovaj use case opisuje proces u kojem serviser odbija dodijeljeni zadatak kako bi dispečer mogao pravovremeno reagovati i dodijeliti ga drugom izvršiocu. |
| **Preduslovi** | Serviser je prijavljen u sistem.<br>Postoji dodijeljena intervencija serviseru.<br>Serviser ima pristup listi svojih zadataka.<br>Sistem je dostupan i funkcionalan. |
| **Glavni tok** | 1. Serviser otvara listu dodijeljenih intervencija.<br>2. Serviser bira jednu intervenciju.<br>3. Serviser pregleda detalje zadatka.<br>4. Serviser bira opciju za odbijanje zadatka.<br>5. Serviser unosi razlog odbijanja (opcionalno).<br>6. Serviser potvrđuje odbijanje.<br>7. Sistem ažurira status intervencije (npr. "Odbijeno").<br>8. Sistem bilježi promjenu u historiji aktivnosti.<br>9. Sistem obavještava dispečera o odbijanju. |
| **Alternativni tokovi** | **A1: Zadatak već prihvaćen**<br>4a. Intervencija je već prihvaćena od strane servisera.<br>5a. Sistem ne dozvoljava odbijanje i prikazuje poruku.<br><br>**A2: Greška pri ažuriranju**<br>7a. Sistem ne uspije ažurirati status.<br>8a. Sistem prikazuje poruku o grešci.<br><br>**A3: Neovlašten pristup**<br>2a. Korisnik koji nije dodijeljeni serviser pokušava izvršiti akciju.<br>3a. Sistem blokira pristup.<br>4a. Sistem prikazuje poruku o zabrani pristupa. |
| **Ishod** | Zadatak je odbijen od strane servisera.<br>Dispečer je obaviješten o odbijanju.<br>Intervencija je spremna za ponovnu dodjelu.<br>Promjena je evidentirana u sistemu. |

## Use Case 24 (US-24)

| Stavka | Sadržaj |
|--------|--------|
| **Aktor** | Dispečer |
| **Naziv use case-a** | Pregled evidentiranog izvršenog rada |
| **Kratak opis** | Ovaj use case opisuje proces u kojem dispečer pregledava evidentirani izvršeni rad kako bi imao uvid u aktivnosti koje je serviser obavio prije zatvaranja intervencije. |
| **Preduslovi** | Dispečer je prijavljen u sistem.<br>Dispečer ima pristup intervencijama.<br>Sistem je dostupan. |
| **Glavni tok** | 1. Dispečer otvara listu intervencija.<br>2. Dispečer bira intervenciju za pregled.<br>3. Dispečer otvara sekciju evidentiranog rada.<br>4. Sistem prikazuje detalje izvršenog rada (opis, vrijeme, utrošeni materijal itd.).<br>5. Dispečer pregledava unesene informacije.<br>6. Dispečer donosi odluku o daljim koracima (npr. zatvaranje intervencije). |
| **Alternativni tokovi** | **A1: Nema evidentiranog rada**<br>3a. Intervencija nema unesene podatke o radu.<br>4a. Sistem prikazuje poruku da nema dostupnih informacija.<br><br>**A2: Greška pri učitavanju**<br>4a. Sistem ne može učitati podatke.<br>5a. Sistem prikazuje poruku o grešci.<br><br>**A3: Neovlašten pristup**<br>2a. Korisnik bez uloge dispečera pokuša pristupiti.<br>3a. Sistem blokira pristup.<br>4a. Sistem prikazuje poruku o zabrani. |
| **Ishod** | Dispečer ima uvid u izvršeni rad.<br>Podaci o radu su jasno prikazani.<br>Omogućena je kontrola i verifikacija rada.<br>Intervencija je spremna za zatvaranje ili dodatne akcije. |

## Use Case 25 (US-25)

| Stavka | Sadržaj |
|--------|--------|
| **Aktor** | Dispečer |
| **Naziv use case-a** | Potvrda i zatvaranje intervencije |
| **Kratak opis** | Ovaj use case opisuje proces u kojem dispečer potvrđuje i zatvara završenu intervenciju, kako bi proces bio formalno okončan u sistemu. |
| **Preduslovi** | Dispečer je prijavljen u sistem.<br>Dispečer ima pristup intervenciji.<br>Sistem je dostupan. |
| **Glavni tok** | 1. Dispečer otvara listu intervencija.<br>2. Dispečer bira završenu intervenciju.<br>3. Dispečer pregledava evidentirani rad i detalje intervencije.<br>4. Dispečer bira opciju za zatvaranje intervencije.<br>5. Dispečer potvrđuje zatvaranje.<br>6. Sistem mijenja status intervencije u "Zatvoreno".<br>7. Sistem bilježi promjenu u historiji aktivnosti.<br>8. Sistem prikazuje potvrdu o uspješnom zatvaranju. |
| **Alternativni tokovi** | **A1: Nije evidentiran rad**<br>3a. Intervencija nema evidentiran izvršeni rad.<br>4a. Sistem ne dozvoljava zatvaranje.<br>5a. Sistem prikazuje poruku o grešci.<br><br>**A2: Greška pri zatvaranju**<br>6a. Sistem ne uspije promijeniti status.<br>7a. Sistem prikazuje poruku o grešci.<br><br>**A3: Neovlašten pristup**<br>1a. Korisnik bez uloge dispečera pokuša zatvoriti intervenciju.<br>2a. Sistem blokira pristup.<br>3a. Sistem prikazuje poruku o zabrani pristupa. |
| **Ishod** | Intervencija je formalno zatvorena.<br>Status intervencije je ažuriran.<br>Proces je završen i evidentiran.<br>Osigurana je uredna evidencija i kontrola procesa. |


## Use Case 26 (US-26)

| Stavka | Sadržaj |
|--------|--------|
| **Aktor** | Korisnik usluge |
| **Naziv use case-a** | Izmjena vlastitog zahtjeva |
| **Kratak opis** | Ovaj use case opisuje proces u kojem korisnik usluge može izmijeniti svoj zahtjev dok još nije preuzet u obradu, kako bi ispravio pogrešno unesene ili nepotpune podatke. |
| **Preduslovi** | Korisnik je prijavljen u sistem.<br>Postoji kreiran zahtjev od strane korisnika.<br>Zahtjev još nije preuzet u obradu.<br>Sistem je dostupan i funkcionalan. |
| **Glavni tok** | 1. Korisnik otvara listu svojih zahtjeva.<br>2. Korisnik bira zahtjev koji želi izmijeniti.<br>3. Sistem prikazuje detalje zahtjeva.<br>4. Korisnik bira opciju za izmjenu.<br>5. Korisnik mijenja podatke (opis, lokacija, itd.).<br>6. Korisnik potvrđuje izmjene.<br>7. Sistem validira unesene podatke.<br>8. Sistem sprema izmjene.<br>9. Sistem prikazuje potvrdu o uspješnoj izmjeni. |
| **Alternativni tokovi** | **A1: Zahtjev već u obradi**<br>2a. Zahtjev je već preuzet u obradu.<br>3a. Sistem ne dozvoljava izmjene.<br>4a. Sistem prikazuje poruku o zabrani izmjene.<br><br>**A2: Neispravni podaci**<br>5a. Korisnik unese nevažeće ili nepotpune podatke.<br>7a. Sistem detektuje grešku.<br>8a. Sistem ne sprema izmjene.<br>9a. Sistem prikazuje poruku o grešci.<br><br>**A3: Greška pri spremanju**<br>8a. Sistem ne uspije spremiti izmjene.<br>9a. Sistem prikazuje poruku o grešci. |
| **Ishod** | Zahtjev je uspješno izmijenjen.<br>Podaci su ažurirani u sistemu.<br>Smanjena je mogućnost grešaka u obradi.<br>Zahtjev je spreman za dalju obradu sa tačnim informacijama. |


## Use Case 27 (US-27)

| Stavka | Sadržaj |
|--------|--------|
| **Aktor** | Korisnik usluge |
| **Naziv use case-a** | Otkazivanje vlastitog zahtjeva |
| **Kratak opis** | Ovaj use case opisuje proces u kojem korisnik usluge može otkazati svoj zahtjev dok još nije u aktivnoj obradi, kako bi povukao greškom prijavljeni ili više nepotreban zahtjev. |
| **Preduslovi** | Korisnik je prijavljen u sistem.<br>Postoji kreiran zahtjev od strane korisnika.<br>Zahtjev nije u aktivnoj obradi.<br>Sistem je dostupan i funkcionalan. |
| **Glavni tok** | 1. Korisnik otvara listu svojih zahtjeva.<br>2. Korisnik bira zahtjev koji želi otkazati.<br>3. Sistem prikazuje detalje zahtjeva.<br>4. Korisnik bira opciju za otkazivanje zahtjeva.<br>5. Korisnik potvrđuje otkazivanje.<br>6. Sistem mijenja status zahtjeva u "Otkazan".<br>7. Sistem bilježi promjenu u historiji aktivnosti.<br>8. Sistem prikazuje potvrdu o uspješnom otkazivanju. |
| **Alternativni tokovi** | **A1: Zahtjev već u obradi**<br>2a. Zahtjev je već u aktivnoj obradi.<br>3a. Sistem ne dozvoljava otkazivanje.<br>4a. Sistem prikazuje poruku o zabrani.<br><br>**A2: Greška pri otkazivanju**<br>6a. Sistem ne uspije promijeniti status zahtjeva.<br>7a. Sistem prikazuje poruku o grešci.<br><br>**A3: Neovlašten pristup**<br>2a. Korisnik pokuša pristupiti zahtjevu koji nije njegov.<br>3a. Sistem blokira pristup.<br>4a. Sistem prikazuje poruku o zabrani pristupa. |
| **Ishod** | Zahtjev je uspješno otkazan.<br>Status zahtjeva je ažuriran.<br>Smanjen je broj nepotrebnih zahtjeva u sistemu.<br>Sistem održava urednu evidenciju zahtjeva. |


## Use Case 28 (US-28)

| Stavka | Sadržaj |
|--------|--------|
| **Aktor** | Dispečer |
| **Naziv use case-a** | Promjena izvršioca intervencije |
| **Kratak opis** | Ovaj use case opisuje proces u kojem dispečer mijenja izvršioca intervencije kako bi zadatak mogao biti dodijeljen drugom serviseru kada prvobitno dodijeljeni izvršilac ne može preuzeti ili završiti rad. |
| **Preduslovi** | Dispečer je prijavljen u sistem.<br>Dispečer ima pristup dodijeljenoj intervenciji.<br>Sistem je dostupan.|
| **Glavni tok** | 1. Dispečer otvara listu intervencija.<br>2. Dispečer bira intervenciju kojoj želi promijeniti izvršioca.<br>3. Dispečer otvara opciju za promjenu izvršioca.<br>4. Sistem prikazuje listu dostupnih servisera.<br>5. Dispečer odabire novog servisera.<br>6. Dispečer potvrđuje promjenu.<br>7. Sistem ažurira izvršioca intervencije.<br>8. Sistem bilježi promjenu u historiji aktivnosti.<br>9. Sistem obavještava novog servisera o dodjeli. |
| **Alternativni tokovi** | **A1: Nema dostupnih servisera**<br>4a. Sistem ne pronalazi dostupne servisere.<br>5a. Sistem prikazuje poruku da nema dostupnih izvršilaca.<br><br>**A2: Greška pri promjeni**<br>7a. Sistem ne uspije ažurirati izvršioca.<br>8a. Sistem prikazuje poruku o grešci.<br><br>**A3: Neovlašten pristup**<br>2a. Korisnik bez uloge dispečera pokuša izvršiti promjenu.<br>3a. Sistem blokira pristup.<br>4a. Sistem prikazuje poruku o zabrani pristupa. |
| **Ishod** | Izvršilac intervencije je uspješno promijenjen.<br>Novi serviser je obaviješten.<br>Osiguran je kontinuitet procesa.<br>Promjena je evidentirana u sistemu. |


## Use Case 29 (US-29)

| Stavka | Sadržaj |
|--------|--------|
| **Aktor** | Serviser |
| **Naziv use case-a** | Vraćanje zadatka na ponovnu dodjelu |
| **Kratak opis** | Ovaj use case opisuje proces u kojem serviser vraća zadatak na ponovnu dodjelu, kako bi dispečer mogao organizovati dalje izvršenje kada zadatak nije moguće završiti u postojećim okolnostima. |
| **Preduslovi** | Serviser je prijavljen u sistem.<br>Serviser ima dodijeljenu intervenciju.<br>Intervencija je u toku ili nije završena.<br>Sistem je dostupan i funkcionalan. |
| **Glavni tok** | 1. Serviser otvara listu svojih intervencija.<br>2. Serviser bira intervenciju koju ne može završiti.<br>3. Serviser otvara opciju za vraćanje zadatka.<br>4. Serviser unosi razlog vraćanja (opcionalno).<br>5. Serviser potvrđuje akciju.<br>6. Sistem mijenja status intervencije (npr. "Za ponovnu dodjelu").<br>7. Sistem uklanja trenutnog izvršioca sa zadatka.<br>8. Sistem bilježi promjenu u historiji aktivnosti.<br>9. Sistem obavještava dispečera. |
| **Alternativni tokovi** | **A1: Zadatak nije u toku**<br>2a. Intervencija nije u odgovarajućem statusu.<br>3a. Sistem ne dozvoljava vraćanje zadatka.<br>4a. Sistem prikazuje poruku o grešci.<br><br>**A2: Greška pri ažuriranju**<br>6a. Sistem ne uspije promijeniti status.<br>7a. Sistem prikazuje poruku o grešci.<br><br>**A3: Neovlašten pristup**<br>2a. Serviser pokuša pristupiti intervenciji koja mu nije dodijeljena.<br>3a. Sistem blokira pristup.<br>4a. Sistem prikazuje poruku o zabrani pristupa. |
| **Ishod** | Intervencija je vraćena na ponovnu dodjelu.<br>Zadatak je dostupan dispečeru za novu organizaciju.<br>Smanjen je rizik od zastoja.<br>Promjena je evidentirana u sistemu. |


## Use Case 30 (US-30)

| Stavka | Sadržaj |
|--------|--------|
| **Aktor** | Dispečer ili Serviser |
| **Naziv use case-a** | Razmjena napomena na intervenciji |
| **Kratak opis** | Ovaj use case opisuje proces u kojem dispečer ili serviser dodaje kratku napomenu na konkretnu intervenciju kako bi sve važne operativne informacije bile dostupne na jednom mjestu svim učesnicima u procesu. |
| **Preduslovi** | Korisnik (dispečer ili serviser) je prijavljen u sistem.<br>Postoji aktivna intervencija.<br>Korisnik ima pristup intervenciji.<br>Sistem je dostupan i funkcionalan. |
| **Glavni tok** | 1. Korisnik otvara detalje intervencije.<br>2. Korisnik bira opciju za dodavanje napomene.<br>3. Korisnik unosi tekst napomene.<br>4. Korisnik potvrđuje unos.<br>5. Sistem validira unos.<br>6. Sistem sprema napomenu uz intervenciju.<br>7. Sistem bilježi promjenu u historiji aktivnosti.<br>8. Sistem prikazuje potvrdu o uspješnom unosu. |
| **Alternativni tokovi** | **A1: Prazna napomena**<br>3a. Korisnik ne unese tekst napomene.<br>5a. Sistem detektuje grešku.<br>6a. Sistem ne sprema napomenu.<br>7a. Sistem prikazuje poruku o grešci.<br><br>**A2: Greška pri spremanju**<br>6a. Sistem ne uspije spremiti napomenu.<br>7a. Sistem prikazuje poruku o grešci.<br><br>**A3: Neovlašten pristup**<br>1a. Korisnik pokuša pristupiti intervenciji bez prava.<br>2a. Sistem blokira pristup.<br>3a. Sistem prikazuje poruku o zabrani pristupa. |
| **Ishod** | Napomena je uspješno dodana uz intervenciju.<br>Informacije su dostupne svim relevantnim učesnicima.<br>Poboljšana je interna komunikacija.<br>Sve promjene su evidentirane u sistemu. |


## Use Case 31 (US-31)

| Stavka | Sadržaj |
|--------|--------|
| **Aktor** | Dispečer |
| **Naziv use case-a** | Pregled sažetog operativnog statusa intervencija |
| **Kratak opis** | Ovaj use case opisuje proces u kojem dispečer na početnom ekranu vidi sažet operativni status intervencija, kako bi odmah imao pregled trenutnog obima posla i stanja intervencija po ključnim fazama obrade. |
| **Preduslovi** | Dispečer je prijavljen u sistem.<br>Postoje intervencije u sistemu.<br>Intervencije imaju definisane statuse.<br>Sistem je dostupan i funkcionalan. |
| **Glavni tok** | 1. Dispečer se prijavljuje u sistem.<br>2. Sistem prikazuje početni ekran (dashboard).<br>3. Sistem prikazuje sažet pregled intervencija (broj po statusima, prioritetima itd.).<br>4. Sistem prikazuje ključne indikatore (npr. broj aktivnih, završenih, na čekanju).<br>5. Dispečer analizira prikazane podatke.<br>6. Dispečer koristi pregled za donošenje odluka ili dalju navigaciju. |
| **Alternativni tokovi** | **A1: Nema podataka**<br>3a. Sistem ne pronalazi intervencije.<br>4a. Sistem prikazuje poruku da nema dostupnih podataka.<br><br>**A2: Greška pri učitavanju**<br>3a. Sistem ne može učitati podatke.<br>4a. Sistem prikazuje poruku o grešci.<br><br>**A3: Neovlašten pristup**<br>1a. Korisnik bez uloge dispečera pokuša pristupiti dashboardu.<br>2a. Sistem blokira pristup.<br>3a. Sistem prikazuje poruku o zabrani pristupa. |
| **Ishod** | Dispečer ima brz pregled stanja sistema.<br>Omogućeno je brzo uočavanje zastoja.<br>Poboljšano je operativno odlučivanje.<br>Omogućen je lakši pristup detaljnim pregledima. |


## Use Case 32 (US-32)

| Stavka | Sadržaj |
|--------|--------|
| **Aktor** | Dispečer |
| **Naziv use case-a** | Pregled historije aktivnosti intervencije |
| **Kratak opis** | Ovaj use case opisuje proces u kojem dispečer pregledava listu svih prethodnih promjena i aktivnosti na zahtjevu, kako bi imao jasan uvid u hronologiju obrade od trenutka prijave do trenutnog statusa. |
| **Preduslovi** | Dispečer je prijavljen u sistem.<br>Postoji intervencija u sistemu.<br>Postoji evidentirana historija aktivnosti.<br>Sistem je dostupan i funkcionalan. |
| **Glavni tok** | 1. Dispečer otvara listu intervencija.<br>2. Dispečer bira intervenciju.<br>3. Dispečer otvara sekciju historije aktivnosti.<br>4. Sistem prikazuje hronološki zapis svih aktivnosti (statusi, promjene, dodjele itd.).<br>5. Sistem prikazuje dodatne informacije (vrijeme, korisnik, opis aktivnosti).<br>6. Dispečer pregledava historiju i analizira tok obrade. |
| **Alternativni tokovi** | **A1: Nema historije aktivnosti**<br>3a. Intervencija nema evidentiranu historiju.<br>4a. Sistem prikazuje poruku da nema dostupnih podataka.<br><br>**A2: Greška pri učitavanju**<br>4a. Sistem ne može učitati podatke.<br>5a. Sistem prikazuje poruku o grešci.<br><br>**A3: Neovlašten pristup**<br>2a. Korisnik bez odgovarajuće uloge pokuša pristupiti.<br>3a. Sistem blokira pristup.<br>4a. Sistem prikazuje poruku o zabrani pristupa. |
| **Ishod** | Dispečer ima potpun uvid u tok obrade intervencije.<br>Osigurana je transparentnost procesa.<br>Omogućeno je praćenje svih promjena.<br>Sistem podržava audit i kontrolu rada. |

## Use Case 44 (US-44)

| Stavka | Sadržaj |
|--------|--------|
| **Aktor** | Dispečer, Serviser |
| **Naziv use case-a** | Tabelarni pregled historije aktivnosti |
| **Kratak opis** | Ovlašteni korisnik pregledava audit zapise u tabelarnom prikazu uz timeline (polje, stara/nova vrijednost, autor, uloga). |
| **Preduslovi** | Korisnik je prijavljen; postoji intervencija s historijom aktivnosti. |
| **Glavni tok** | 1. Korisnik otvara detalj intervencije.<br>2. Otvara historiju.<br>3. Prebacuje na Tabelu.<br>4. Sistem prikazuje audit redove.<br>5. Korisnik analizira promjene. |
| **Ishod** | Transparentan tabelarni audit pregled. |

## Use Case 45 (US-45)

| Stavka | Sadržaj |
|--------|--------|
| **Aktor** | Sistem, Dispečer |
| **Naziv use case-a** | SLA eskalacija |
| **Kratak opis** | Prekoračen SLA prag pokreće aktivnost i notifikaciju dispečeru (cooldown 6h). |
| **Preduslovi** | Aktivna intervencija; SLA prekoračen. |
| **Glavni tok** | 1. Sistem detektuje prekoračenje.<br>2. Bilježi sla_eskalacija.<br>3. Šalje notifikaciju.<br>4. Ažurira sla_eskalacija_at. |
| **Ishod** | Pravovremena reakcija na prekoračenje. |

## Use Case 46 (US-46)

| Stavka | Sadržaj |
|--------|--------|
| **Aktor** | Serviser |
| **Naziv use case-a** | Evidencija materijala i dijelova |
| **Kratak opis** | Strukturirane stavke (naziv, količina, jedinica) uz evidenciju rada. |
| **Preduslovi** | Intervencija u izvršenju. |
| **Glavni tok** | 1. Serviser otvara evidenciju.<br>2. Unosi stavke.<br>3. Sistem sprema stavke_materijala. |
| **Ishod** | Materijal strukturirano evidentiran. |

## Use Case 47 (US-47)

| Stavka | Sadržaj |
|--------|--------|
| **Aktor** | Serviser, Dispečer |
| **Naziv use case-a** | Praćenje intervencije nije riješene iz prve |
| **Kratak opis** | Brojač ponovnih ciklusa i badge na detalju/KPI. |
| **Preduslovi** | Dozvoljen alternativni tok. |
| **Glavni tok** | 1. Serviser vrati/nije riješeno.<br>2. Sistem inkrementira broj_ponovnih_ciklusa.<br>3. Prikazuje badge. |
| **Ishod** | Vidljivost ponovnih pokušaja rješavanja. |
