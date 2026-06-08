# Finalna korisnička dokumentacija: Sistem za upravljanje servisnim intervencijama

## Kratak opis sistema

**InterServ** je web aplikacija za digitalizaciju prijave i obrade servisnih intervencija (kvarovi u stanu ili objektu: vodovod, elektro, grijanje, klima, bravarija, građevinski radovi, kućanski uređaji, IT/mreže i ostalo). Sistem pokriva cijeli tok rada: od prijave kvara od strane korisnika, preko dispečerske trijaže, određivanja prioriteta, planiranja termina i dodjele servisera, do evidencije obavljenog rada i formalnog zatvaranja intervencije. Svaka promjena ostaje zabilježena u historiji, a pristup je kontrolisan po ulogama.

Sistem rješava problem ručnog vođenja servisnih naloga (telefonski pozivi, tabele) tako što uvodi jedinstvenu platformu sa standardiziranim tokom rada, objektivnim bodovanjem hitnosti (trijaža 0–110), praćenjem rokova (SLA), obavijestima unutar aplikacije i izvještajima. Aplikacija je dostupna kao online demo na adresi https://nrs-grupa2.vercel.app/.

## Ko su korisnici sistema

Sistem definiše **četiri uloge**:

- **Korisnik usluge (Klijent)**: prijavljuje kvar (zahtjev), prati status svoje intervencije, predlaže termine, otkazuje zahtjev dok je u početnom statusu, ocjenjuje završenu intervenciju i pregleda svoju historiju. Može aktivirati **Premium** uslugu za prioritetnu (hitnu) obradu i, uz aktivan premium paket, označiti pojedini zahtjev kao hitan u čarobnjaku za prijavu.
- **Dispečer**: radi trijažu pristiglih zahtjeva, određuje operativni prioritet, dogovara termin, dodjeljuje servisera (uključujući opcionalne pomoćne servisere u timu), prati izvršenje, mijenja izvršioca, formalno zatvara intervenciju te koristi izvještaj odziva. Napredna analitika postoji na posebnoj stranici, ali nije u glavnom meniju.
- **Serviser**: vidi dodijeljene intervencije (kao glavni ili pomoćni izvršilac), prihvata ili odbija zadatak, mijenja statuse na terenu (na putu → na lokaciji → završeno), evidentira obavljeni rad i utrošeni materijal, koristi radnu checklistu, dodaje slike i napomene, te može vratiti zadatak na ponovnu dodjelu ili označiti „nije riješeno”. Ima prikaz rute od svoje bazne lokacije do intervencije.
- **Administrator**: upravlja korisnicima i ulogama, kreira interne naloge, suspenduje i aktivira naloge, mijenja premium status korisnika i odobrava prijave partnera (servisera/dispečera).

**Više uloga:** zaposlenici (serviser, dispečer, administrator) automatski imaju i ulogu klijenta. Ako korisnik ima više uloga, nakon prijave bira aktivnu zonu na stranici **Odabir uloge** (`/odabir-uloge`); promjenu uloge može kasnije obaviti iz profila.

Pored prijavljenih korisnika, **neprijavljeni posjetilac** može pristupiti javnim stranicama: početna stranica, prijava, registracija i stranica „Postani partner”. Slanje prijave za partnera dozvoljeno je i anonimno.

## Osnovni način korištenja

Tok za novog korisnika:

1. **Pristup aplikaciji**: otvoriti početnu stranicu. Posjetilac vidi opis sistema i dugmad **Prijava** / **Registracija**.
2. **Registracija**: unijeti ime, prezime, email, broj telefona i lozinku. Lozinka mora imati **najmanje 8 znakova**, uključujući veliko i malo slovo, broj i specijalni znak. Standardna samostalna registracija je za ulogu **Klijent**; uloge Serviser/Dispečer se dodjeljuju kroz partnersko odobrenje ili od strane administratora.
3. **Potvrda emaila**: sistem traži potvrdu email adrese. Slanje servisnog zahtjeva je blokirano dok email nije potvrđen.
4. **Prijava**: unijeti email i lozinku. Nakon uspješne prijave korisnik se preusmjerava na početnu stranicu, a zatim — prema broju uloga — u odgovarajuću zonu ili na odabir uloge.
5. **Profil** (`/profil`): pregled i izmjena ličnih podataka, promjena lozinke; serviser dodatno postavlja **baznu lokaciju** (potrebna za procjenu rute).
6. **Glavni tok po ulozi:**
   - **Korisnik:** „Kreiraj zahtjev” → čarobnjak u 6 koraka → praćenje statusa.
   - **Dispečer:** kontrolna tabla → red pristiglih zahtjeva → čarobnjak planiranja (5 koraka) ili obrada iz detalja zahtjeva → praćenje intervencije.
   - **Serviser:** pregled zadataka → otvaranje intervencije → prihvatanje → statusi na terenu → evidencija rada.
   - **Administrator:** pregled sistema (sažeci, korisnici i zahtjevi) → upravljanje korisnicima → upravljanje uposlenicima → odobravanje prijava partnera.

Sigurnosna napomena: pri prijavi se koriste **neutralne poruke** — sistem ne otkriva da li nalog postoji, da li je neaktivan ili nepotvrđen; sve takve situacije prikazuju istu poruku „Neispravni podaci za prijavu.”.

---

## Ključne funkcionalnosti

### 1. Prijava i nalog
- Registracija (ime, prezime, email, broj telefona, lozinka sa pravilima snage) te prijava i odjava.
- Potvrda email adrese i ponovno slanje verifikacionog linka.
- Zaštita od pogađanja lozinke: privremeno blokiranje prijave nakon **5 neuspjelih pokušaja u 5 minuta** (blok traje 5 minuta).
- Profil korisnika: pregled i izmjena ličnih podataka, promjena lozinke.
- Odabir aktivne uloge kada korisnik ima više uloga.

### 2. Servisni zahtjevi (Korisnik)
- **Čarobnjak za novi zahtjev** u **6 koraka**:
  1. **Vrsta zahtjeva**: kategorija i podkategorija kvara
  2. **Lokacija**: adresa, opcionalno odabir tačke na mapi ili GPS
  3. **Termin**: predloženi termini (do 3 slota) ili „nemam preferenciju”
  4. **Opis**: opis problema (min. 20 znakova), kontakt telefon, opcionalna slika
  5. **Hitnost**: kratka procjena hitnosti (trijaža) ili premium opcija
  6. **Pregled**: sažetak prije slanja
- **Dvoslojne kategorije kvara**: **9 glavnih oblasti** sa **71 podkategorijom** (8 podkategorija po glavnoj kategoriji, uključujući „Ostalo”; kategorija „Ostalo” ima 7 podkategorija, uključujući „Drugo”).
- **Trijaža (samoprocjena hitnosti)**: 5 pitanja (sigurnost, zastoj, materijalna šteta, ranjivost, obuhvat) na osnovu kojih sistem računa nivo hitnosti (0–110).
- **Premium zahtjev u čarobnjaku**: korisnik sa **aktivnim** premium paketom može označiti zahtjev kao hitan (preskače trijažu); potrebna je i potvrda uslova korištenja.
- **Praćenje statusa**, **uređivanje** zahtjeva dok je u početnom statusu i **otkazivanje** uz razlog.
- **Historija intervencija**: pregled zatvorenih, operativno završenih, otkazanih i odbijenih intervencija (statusi: `zatvoreno`, `zavrseno`, `otkazano`, `odbijeno`).
- **Ocjena intervencije**: ocjena 1–5 i opcionalni komentar nakon formalnog zatvaranja; ocjena se **ne može mijenjati** nakon unosa.

### 3. Premium usluga (Korisnik)
- Aktivacija premium paketa (mjesečni ili godišnji) za **hitnu, prioritetnu obradu** zahtjeva.
- **Napomena**: u trenutnoj verziji (MVP) naplata je **simulirana**, ne postoji stvarni platni sistem.
- Premium prolazi kroz stanja: neaktivan → čeka uplatu → aktivan → istekao/otkazan.
- Premium se može pokrenuti, potvrditi (simulirana uplata), obnoviti i otkazati; sve promjene se bilježe.
- Otkazivanje aktivnog paketa zadržava važenje do isteka perioda.

### 4. Dispečerska obrada (Dispečer)
- **Red obrade** sa sortiranjem po hitnosti (premium i starije prijave imaju prednost).
- **Čarobnjak planiranja** (5 koraka): pregled → operativni prioritet → planiranje termina → pregled naloga → potvrda i dodjela servisera.
- **Alternativni tok iz detalja zahtjeva**: određivanje prioriteta, potvrda, dodjela servisera i zatvaranje bez punog čarobnjaka.
- **Operativni prioritet**: Nisko / Srednje / Visoko / Kritično / Hitno (premium zahtjevi ne smiju biti degradirani bez obrazloženja).
- **Odbijanje zahtjeva** uz obavezan razlog.
- **Dodjela i ponovna dodjela servisera**, uključujući **pomoćne servisere** u timu intervencije, uz upozorenje ako serviser već ima drugu intervenciju u istom terminu.
- **Preporuka najbližeg servisera** prema njegovoj baznoj lokaciji.
- **Promjena izvršioca** aktivne intervencije i **formalno zatvaranje** uz napomenu.
- **Upozorenje o dugom čekanju**: vizuelna oznaka za intervencije koje predugo stoje u određenom statusu (npr. 2 h bez obrade, 8 h bez dodjele servisera).
- **Izvještaj odziva** (u glavnom meniju). **Analitika** sa grafikonima i KPI-jevima dostupna je na `/dispecer/analitika`, ali nije u glavnoj navigaciji.

### 5. Terenski rad (Serviser)
- Pregled dodijeljenih zadataka, mini-kalendar i lista aktivnosti na pregledu.
- **Tok statusa na terenu**: prihvatanje → na putu → na lokaciji → završeno.
- **Radna checklista** uz intervenciju (operativni koraci na terenu).
- **Evidencija rada** (opis, trajanje, utrošeni materijal); intervencija se **ne može završiti bez evidencije**.
- **Odbijanje zadatka**, **vraćanje na ponovnu dodjelu** i oznaka **„nije riješeno”** uz razlog.
- **Pomoćni serviser** u timu ima pristup intervenciji u režimu **samo za čitanje**.
- **Ruta do intervencije**: okvirna udaljenost i procjena vremena dolaska od bazne lokacije, uz mogućnost otvaranja navigacije.
- Dodavanje napomena i slika uz intervenciju.

### 6. Administracija (Administrator)
- Pregled, pretraga i filtriranje korisnika; kreiranje internih naloga (serviser, dispečer, administrator).
- Uređivanje profila, **suspendovanje i aktivacija** naloga, promjena uloge zaposlenika.
- Upravljanje premium statusom korisnika (aktivan, neaktivan, čeka uplatu, otkazan, istekao).
- **Odobravanje prijava partnera**: sistem kreira nalog i šalje email s privremenim pristupnim podacima.
- **Napomena**: odbijanje partnerske prijave kroz sučelje **nije implementirano** — dostupno je samo odobravanje.

### 7. Obavijesti i praćenje rokova (SLA)
- **Obavijesti unutar aplikacije** (zvono s brojačem nepročitanih).
- **Rokovi obrade po prioritetu (SLA)**: Nisko 72 h, Srednje 24 h, Visoko 8 h, Kritično/Hitno 2 h — računaju se od trenutka kreiranja zahtjeva.
- **Automatska eskalacija** prekoračenih intervencija dispečerima (zakazani dnevni posao).
- **Historija aktivnosti** svake intervencije (hronološki prikaz svih promjena).

---

## Ograničenja sistema

- **Premium naplata je simulirana**: nema integracije stvarnog platnog sistema; status i period važenja postavljaju se automatski nakon simulirane uplate.
- **Nema praćenja servisera u realnom vremenu (GPS)**: ruta se računa od bazne (fiksne) lokacije servisera, a ne od trenutne pozicije; dispečer ne vidi kretanje servisera na mapi.
- **Procjena vremena dolaska nije bazirana na stvarnom saobraćaju**: koristi se okvirna (zračna) udaljenost; ruta se ne prikazuje ako nedostaje bazna lokacija servisera ili lokacija intervencije.
- **Historija korisnika prikazuje završene, zatvorene, otkazane i odbijene intervencije** (ne uključuje aktivne); aktivne se prate kroz „Moji zahtjevi”. Napredna pretraga historije (po datumu ili tipu kvara) nije dostupna u ovoj verziji.
- **Detekcija dugog čekanja je klijentska**: računa se u pregledaču i nema push obavijesti; pragovi su po statusu, ali mjere se od trenutka kreiranja zahtjeva.
- **Stvarno slanje email obavijesti zavisi od konfiguracije** servisa Resend; ako ključ nije postavljen, poruke se ne šalju (u razvoju se ispisuju u konzolu).
- Aplikacija je dostupna samo na **bosanskom jeziku**.

---

## Poznati nedostaci ili posebne napomene

- **Stanje kvaliteta**: prema izvještaju testiranja Sprint 11 (07.06.2026.) svi testovi prolaze — **533 automatska** (355 unit + 141 integracija + 37 e2e) i **42 manuelna** scenarija; nema evidentiranih otvorenih grešaka. Lokalna regresiona provjera (unit + integracija) i lint također prolaze.
- **Potvrda email adrese je obavezna** prije slanja prvog zahtjeva; dok email nije potvrđen, slanje zahtjeva je onemogućeno uz odgovarajuću poruku.
- **Neutralne poruke pri prijavi**: korisniku se namjerno ne prikazuje tačan razlog neuspjeha prijave (sigurnosna mjera), to je očekivano ponašanje, a ne greška.
- **Ograničenje učestalosti**: slanje zahtjeva je ograničeno na najviše **5 novih zahtjeva u jednom minutu** po korisniku; previše neuspjelih prijava privremeno blokira prijavu na 5 minuta.
- **Privremena lozinka za partnere i interne naloge**: prilikom odobrenja prijave partneru ili kreiranja internog naloga generiše se privremena lozinka i šalje emailom; preporučuje se promjena nakon prve prijave.
- **Partnerske prijave**: admin može samo **odobriti** prijavu; odbijanje kroz aplikaciju nije dostupno.
- Brojevi prikazani na početnoj (marketinškoj) stranici (npr. „1.200+ kompanija”, „98%”) su **ilustrativni** i ne predstavljaju stvarne podatke iz sistema.
