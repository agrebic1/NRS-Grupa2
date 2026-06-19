# Korisnički priručnik (User manual)

## 1. Kome je sistem namijenjen

InterServ je web aplikacija za prijavu i obradu **servisnih intervencija** (kvarovi u stanu ili objektu: vodovod, elektro, grijanje, klima, bravarija, građevinski radovi, kućanski uređaji, IT/mreže i ostalo). Namijenjen je:

- **korisnicima** koji žele prijaviti kvar i pratiti njegovo rješavanje,
- **servisnoj firmi** (dispečerima i serviserima) koja organizuje i izvodi intervencije,
- **administratorima** koji upravljaju nalozima i ulogama.

Aplikacija radi u web pregledniku, bez instalacije. Zamjenjuje ručno vođenje naloga (telefon, tabele) jedinstvenom platformom sa standardiziranim tokom rada, praćenjem rokova i obavijestima.

---

## 2. Koje korisničke uloge postoje


| Uloga                  | Šta radi                                                                                                                                                                                                   |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Korisnik (Klijent)** | Prijavljuje kvar, prati status, predlaže termine, otkazuje zahtjev (dok je u početnom statusu), ocjenjuje završenu intervenciju, gleda svoju historiju. Može aktivirati **Premium** za prioritetnu obradu. |
| **Dispečer**           | Pregleda pristigle zahtjeve, određuje prioritet (trijaža), dogovara termin, dodjeljuje servisera (i pomoćni tim), prati izvršenje, zatvara intervenciju, koristi izvještaje i analitiku.                   |
| **Serviser**           | Vidi dodijeljene intervencije, prihvata/odbija zadatak, mijenja statuse na terenu, evidentira obavljeni rad i materijal, dodaje slike, vidi rutu do lokacije.                                              |
| **Administrator**      | Upravlja korisnicima i ulogama, kreira interne naloge, suspenduje/aktivira naloge, mijenja premium status, odobrava prijave partnera.                                                                      |


> **Više uloga:** zaposleni (serviser/dispečer/admin) automatski imaju i ulogu korisnika. Ako imate više uloga, nakon prijave birate aktivnu zonu na stranici **Odabir uloge**.

---

## 3. Kako se korisnik prijavljuje

**Registracija (novi korisnik):**

1. Otvorite `https://nrs-grupa2.vercel.app/` i kliknite **Registracija**.
2. Unesite ime, prezime, email, broj telefona i lozinku (najmanje **8 znakova**: veliko i malo slovo, broj i specijalni znak).
3. Potvrdite registraciju.
  - **Očekivani rezultat:** sistem kreira nalog i traži **potvrdu email adrese**; slanje zahtjeva je blokirano dok email nije potvrđen.
4. Otvorite email i kliknite na link za potvrdu.
  - **Očekivani rezultat:** nalog postaje aktivan i možete koristiti funkcionalnosti korisnika.

**Prijava:**

1. Kliknite **Prijava**, unesite email i lozinku.
  - **Očekivani rezultat:** nakon uspješne prijave sistem vas vodi u vašu zonu, ili ako imate više uloga na **Odabir uloge**.

> **Sigurnosna napomena:** ako prijava ne uspije, sistem prikazuje **istu, neutralnu poruku** („Neispravni podaci za prijavu.") i ne otkriva da li nalog postoji ili je neaktivan/nepotvrđen, to je namjerno, radi sigurnosti.

---

## 4. Testni korisnici / demo kredencijali


| Uloga         | Email          | Lozinka        |
| ------------- | -------------- | -------------- |
| Administrator | `admin@nrs.local` | `Admin123!Strong` |
| Dispečer      | `dispecer@nrs.local` | `Dispecer123!Strong` |
| Serviser      | `serviser@nrs.local` | `Dispecer123!Strong` |
| Korisnik      | `test@gmail.com` | `123456789Aa@` |


---

## 5. Opis glavnih ekrana

### 5.1 Landing stranica i Auth ekrani (`/`)

Početna stranica nudi dvije opcije: **Registracija** (za nove korisnike usluge) i **Prijava** (za postojeće korisnike). Interno osoblje (dispečeri, serviseri) ne registruje se javno — njihove naloge kreira administrator.

**Registracija** `/auth/register` — forma sa poljima: ime, prezime, email, broj telefona, lozinka. Nakon uspješnog slanja sistem prikazuje obavijest da je link za potvrdu poslan na email. Bez potvrde emaila prijava zahtjeva nije moguća.  

<img width="1895" height="911" alt="Screenshot 2026-06-19 203849" src="https://github.com/user-attachments/assets/4d6a302d-d352-4d73-96e3-8b4f17849d1f" />

<img width="1890" height="906" alt="image" src="https://github.com/user-attachments/assets/6b1dbd94-e3f3-4750-93ad-d703a8018c64" />

<!-- SLIKA: Screenshot forme za registraciju (/auth/register) — prikazati popunjena polja i dugme "Registracija" -->

**Prijava** `/auth/login` — forma sa email i lozinkom. U slučaju greške sistem prikazuje istu neutralnu poruku bez otkrivanja razloga (namjerno, radi sigurnosti).

<img width="1912" height="898" alt="image" src="https://github.com/user-attachments/assets/d87353a0-e4b7-4eb4-b06a-7d2c079106e4" />

<!-- SLIKA: Screenshot forme za prijavu (/auth/login) — prikazati praznu formu ili primjer greške prijave -->

**Odabir uloge** `/odabir-uloge` — prikazuje se samo korisnicima koji imaju više od jedne uloge (npr. serviser koji je ujedno i korisnik usluge). Svaka uloga prikazana je kao kartica s opisom. Nakon odabira sistem preusmjerava na odgovarajući dashboard.

<img width="1910" height="900" alt="image" src="https://github.com/user-attachments/assets/e6c4dc64-45dc-4f93-b0bb-cbc2b3454724" />

<!-- SLIKA: Screenshot stranice za odabir uloge — prikazati kartice uloga (Korisnik, Serviser, Dispečer, Administrator) -->

---

### 5.2 Dashboard korisnika usluge (`/korisnik`)

Početni ekran za korisnika koji je prijavio kvar. Sadrži:

- **4 KPI kartice** u gornjem dijelu: ukupan broj zahtjeva, broj aktivnih, broj hitnih i sljedeći dolazak servisera.
- **Moji zahtjevi** — lista kartica zahtjeva koji čekaju obradu (statusi: novi, hitno, u obradi). Svaka kartica prikazuje broj zahtjeva, kategoriju, adresu, datum prijave i trenutni status označen bojom.
- **Svi zahtjevi** — stranica `/korisnik/zahtjevi` s kompletnom historijom, uključujući završene i otkazane.
- Dugme **Prijavi novi kvar** vodi na formu za prijavu.

Korisnik ne vidi interne operativne podatke (napomene dispečera, operativni prioritet).

<img width="1910" height="905" alt="image" src="https://github.com/user-attachments/assets/88c4bf59-5cb0-48d7-9bd2-25d24de52510" />

<!-- SLIKA: Screenshot korisničkog dashboarda — prikazati KPI kartice u gornjem dijelu i listu zahtjeva ispod, idealno s jednim aktivnim zahtjevom -->

---

### 5.3 Forma za prijavu zahtjeva — wizard (`/korisnik/zahtjevi/novi`)

Višekoračna forma (wizard) koja vodi korisnika kroz prijavu kvara. Koraci se prikazuju u nizu; nije moguće preskočiti nepopunjen korak.

| Korak | Naziv | Šta se unosi |
|---|---|---|
| 1 | Vrsta zahtjeva | Odabir glavne kategorije (vodovod, elektro, grijanje, klima, bravarija, građevinski radovi, kućanski uređaji, IT/mreže, ostalo) i podkategorije gdje postoji |
| 2 | Lokacija | Adresa kvara (obavezno, min. 5 znakova); opciono: preciziranje GPS-om ili klikom na mapu |
| 3 | Preferirani termin | Datum i vremenski raspon (primarni + do 2 alternativna termina), ili odabir „Nemam preferirani termin" |
| 4 | Opis i kontakt | Opis kvara (min. 20, max. 2000 znakova), kontakt telefon (obavezno), opciono: fotografija kvara |
| 5 | Hitnost / Premium | Trijaža (pitanja o opasnosti, funkcionalnosti, šteti, ranjivim osobama, obimu). Za korisnike s aktivnim Premium statusom ovaj korak se preskače i zahtjev automatski dobiva prioritet HITNO |
| Pregled | Sažetak | Pregled svih unesenih podataka prije slanja |  

<img width="1893" height="902" alt="image" src="https://github.com/user-attachments/assets/b39e9834-3c8b-44cd-be66-997243492cb1" />
<img width="1893" height="902" alt="image" src="https://github.com/user-attachments/assets/d4a922cf-434d-4ad9-b629-0a0f1f50a76b" />
<img width="1892" height="906" alt="image" src="https://github.com/user-attachments/assets/45e378f1-1146-4496-bc00-4c74fa1938a4" />
<img width="1895" height="907" alt="image" src="https://github.com/user-attachments/assets/9e5dc849-478e-497c-895c-8755dbeaeaa9" />
<img width="1898" height="906" alt="image" src="https://github.com/user-attachments/assets/523b0f49-4b75-46b0-bc86-423af2aaf6b5" />
<img width="1896" height="901" alt="image" src="https://github.com/user-attachments/assets/fe0f2f0e-4203-4f36-a481-d84da0dcc3b7" />


**Očekivani rezultat:** sistem kreira zahtjev, dodjeljuje mu redni broj i status *Novi*, te ga odmah prikazuje u korisničkom dashboardu i dispečerovoj listi.
<img width="1915" height="900" alt="image" src="https://github.com/user-attachments/assets/ce768b5d-6e9a-45b2-8d85-b591ed037f57" />


---

### 5.4 Detalj zahtjeva korisnika (`/korisnik/zahtjevi/[id]`)

Stranica prikazuje sve informacije o konkretnom zahtjevu: kategorija, adresa, preferirani termin, opis, kontakt, fotografija (ako je priložena), status s vremenskom linijom promjena.

Dostupne akcije prema statusu:
- **Izmijeni** — vidljivo samo dok je zahtjev u početnom statusu (`na_cekanju`); korisnik može ispraviti opis, adresu, kontakt ili termin, ali ne i kategoriju.
- **Otkaži** — vidljivo samo u početnom statusu; zahtjeva potvrdu.

Nakon što dispečer počne obradu (status prelazi u `u obradi` ili dalje), izmjena i otkazivanje više nisu dostupni.

<img width="1887" height="902" alt="image" src="https://github.com/user-attachments/assets/eb51098b-f3ce-403e-b755-0eaa9308e049" />


<!-- SLIKA: Screenshot detalja zahtjeva korisnika — prikazati status badge, osnovne podatke i dugmad "Izmijeni" / "Otkaži" dok je zahtjev u statusu Novi -->

---

### 5.5 Dashboard dispečera (`/dispecer`)

Operativni pregled stanja sistema. Sadrži:

- **KPI kartice** s brojevima: Novi (čekaju obradu bez postavljenog prioriteta), U obradi (prioritet postavljen, u wizardu), Potvrđeno (čekaju dodjelu servisera).
- **Kratke sekcije** s najvažnijim zahtjevima koji zahtijevaju pažnju — klik na karticu otvara detaljnu listu s odgovarajućim filterom.

Dashboard ne prikazuje kompletne liste; one su u zasebnim modulima.

<!-- SLIKA: Screenshot dispečerovog dashboarda — prikazati KPI kartice na vrhu i kratke sekcije zahtjeva koji zahtijevaju pažnju -->

---

### 5.6 Lista zahtjeva dispečera (`/dispecer/zahtjevi`)

Kompletan operativni pregled svih aktivnih zahtjeva. Terminalni statusi (završeno, otkazano, odbijeno) nisu u aktivnoj listi.

Dostupni filteri: Svi, Novi, U obradi, Zakazivanje termina, Dodjela servisera, Korak potvrde, Potvrđeno.

Svaka kartica zahtjeva prikazuje: redni broj, kategoriju, adresu, datum prijave, korisnički nivo hitnosti, indikator da li postoji prilog i lokacija, te trenutnu fazu obrade.

<img width="1892" height="898" alt="image" src="https://github.com/user-attachments/assets/a70550c3-4890-4bea-9a3c-753652fbffdf" />
<img width="1895" height="902" alt="image" src="https://github.com/user-attachments/assets/74162915-3f44-4496-8b8c-891daf34b06f" />

<!-- SLIKA: Screenshot liste zahtjeva dispečera — prikazati filter traku na vrhu i nekoliko kartica zahtjeva s različitim statusima/fazama -->

---

### 5.7 Wizard obrade zahtjeva — dispečer (`/dispecer/planiranje/[id]`)

Višekoračni wizard kojim dispečer obrađuje svaki zahtjev. Prolazi kroz 5 koraka:

| Korak | Naziv | Šta dispečer radi |
|---|---|---|
| 1 | Pregled zahtjeva | Čita sve korisničke podatke; ne unosi ništa |
| 2 | Operativni prioritet | Bira prioritet (NISKO / SREDNJE / VISOKO / KRITIČNO / HITNO); sistem preporučuje prioritet na osnovu trijaže i urgency score-a |
| 3 | Planiranje | Unosi dogovoreni termin (datum i raspon) koji će biti vidljiv serviseru |
| 4 | Pregled naloga | Bira odgovornog servisera s liste dostupnih; opciono i pomoćni serviseri |
| 5 | Potvrda | Pregledava sve uneseno i potvrđuje; zahtjev prelazi u status *Potvrđeno* |

Ako dispečer odabere manji prioritet od preporučenog, sistem prikazuje upozorenje — dispečer može nastaviti, ali se razlika bilježi.

<!-- SLIKA: Screenshot Koraka 2 čarobnjaka — prikazati listu prioriteta (NISKO do HITNO) s preporučenim prioritetom istaknutim -->

<!-- SLIKA: Screenshot Koraka 4 čarobnjaka — prikazati listu dostupnih servisera s karticama za odabir -->

---

### 5.8 Detalj intervencije — dispečer (`/dispecer/zahtjevi/[id]`)

Potpun pregled jedne intervencije: korisnički podaci, adresa s mapom, operativni prioritet, dogovoreni termin, dodijeljeni serviser, evidencija rada (po završetku), napomene, historija aktivnosti.

Dostupne akcije (prema statusu):
- **Otvori wizard** — dok je u inboxu (Novi / U obradi).
- **Promijeni servisera** — dok intervencija nije u terminalnom statusu.
- **Zatvori intervenciju** — kad je serviser završio rad (status `u_izvrsenju`); sistem zahtijeva da postoji evidentiran rad.
- **Formalno zatvori** — prelaz iz `završeno` u `zatvoreno` (read-only); moguće samo uz evidenciju rada.

<!-- SLIKA: Screenshot detalja intervencije na dispečerskoj strani — prikazati gornji dio s podacima korisnika, status badge i dostupne akcije -->

---

### 5.9 Dashboard servisera (`/serviser`)

Početni ekran za servisera prikazuje listu dodijeljenih intervencija. Svaka kartica sadrži: adresu, kategoriju kvara, dogovoreni termin, status i ime korisnika.

<!-- SLIKA: Screenshot serviserskog dashboarda — prikazati listu kartica dodijeljenih intervencija s različitim statusima -->

---

### 5.10 Detalj zadatka — serviser (`/serviser/intervencije/[id]`)

Detaljna stranica intervencije za servisera. Prikazuje sve relevantne podatke: opis kvara, adresu, kontakt korisnika, dogovoreni termin i historiju promjena statusa.

Dostupne akcije prema statusu:
- **Prihvati** — prelaz iz `dodijeljeno` u `u_radu`; serviser potvrđuje da kreće na intervenciju.
- **Odbij** — dostupno samo dok nije prihvaćeno; obavezno unosi razlog. Dispečer dobiva obavijest i intervencija se vraća na dodjelu.
- **Počni izvršenje** — prelaz iz `u_radu` u `u_izvrsenju`.
- **Evidentiraj rad** — unos opisa obavljenog posla, utrošenog vremena i materijala; dostupno u statusu `u_izvrsenju`.

<!-- SLIKA: Screenshot detalja zadatka na serviserskoj strani — prikazati podatke o intervenciji i dugmad "Prihvati" / "Odbij" dok je status Dodijeljeno -->

<!-- SLIKA: Screenshot forme za evidenciju rada — prikazati polja za opis rada, utrošeno vrijeme i materijal -->

---

### 5.11 Admin panel — upravljanje korisnicima (`/admin/korisnici`)

Lista svih korisnika u sistemu. Za svakog korisnika prikazuje: ime, email, ulogu, status (aktivan/neaktivan/suspendovan) i datum registracije.

Dostupne akcije na pojedinačnom korisniku (`/admin/korisnici/[id]/uredi`):
- **Promijeni ulogu** — bira se nova uloga iz liste; za dodjelu uloge Administrator prikazuje se upozorenje.
- **Suspenduj** — unosi se razlog; korisniku se onemogućava pristup uz prikaz poruke o suspenziji.
- **Aktiviraj** — vraća suspendovani nalog u aktivan status.

Napomena: interni nalozi (dispečer, serviser) kreiraju se kroz administratorski modul, ne javnom registracijom.

<!-- SLIKA: Screenshot admin liste korisnika — prikazati tabelu korisnika s kolonama ime, email, uloga, status; idealno s jednim suspendovanim nalogom radi ilustracije -->

<!-- SLIKA: Screenshot stranice za uređivanje korisnika (/admin/korisnici/[id]/uredi) — prikazati sekciju "Promjena uloge" s karticama uloga -->

---

## 6. Korak-po-korak: najvažniji tokovi

---

### TOK 1 — Korisnik prijavljuje kvar

**Kao korisnik usluge, da bih prijavio kvar, radim:**

1. Prijavim se na `https://nrs-grupa2.vercel.app/` i otvorim **Korisnik** dashboard.
2. Kliknem **Prijavi novi kvar** (dugme u gornjem desnom uglu dashboarda).
3. **Korak 1 — Vrsta zahtjeva:** iz liste odaberem glavnu kategoriju (npr. *Vodovod*) i podkategoriju (npr. *Curenje vode*). Kliknem **Dalje**.
4. **Korak 2 — Lokacija:** unesem adresu kvara (npr. *Ul. Ferhadija 12, Sarajevo*). Opciono mogu kliknuti *Koristi GPS* ili *Preciziraj na mapi*. Kliknem **Dalje**.
5. **Korak 3 — Preferirani termin:** odaberem datum i vremenski raspon (npr. *ponedjeljak 09:00–12:00*) ili označim *Nemam preferirani termin*. Kliknem **Dalje**.
6. **Korak 4 — Opis i kontakt:** unesem opis kvara (min. 20 znakova, npr. *Curi voda ispod sudopere, stalno kapa*), kontakt telefon i opciono dodajem fotografiju. Kliknem **Dalje**.
7. **Korak 5 — Hitnost:** odgovorim na pitanja trijaže (opasnost po sigurnost, uticaj na funkcionisanje, rizik od štete, ranjive osobe, obim uticaja). Kliknem **Dalje**.
8. Na **Pregledu** vidim sažetak svih unesenih podataka. Kliknem **Pošalji zahtjev**.

<!-- SLIKA: Screenshot ekrana potvrde nakon slanja zahtjeva — prikazati poruku s brojem zahtjeva i statusom "Novi" -->

**Očekivani rezultat:** sistem kreira zahtjev, dodjeljuje mu redni broj i prikazuje potvrdu s brojem zahtjeva i statusom *Novi*. Zahtjev je odmah vidljiv u korisničkom dashboardu i dispečerovoj listi aktivnih zahtjeva.

---

### TOK 2 — Korisnik izmijeni ili otkaže zahtjev

**Kao korisnik usluge, da bih izmijenio zahtjev koji još nije preuzet u obradu, radim:**

1. Na dashboardu pronađem zahtjev sa statusom **Novi**.
2. Otvorim detalj zahtjeva klikom na karticu.
3. Kliknem **Izmijeni**.
4. Ispravim podatke (opis, adresu, kontakt telefon ili preferirani termin). Kategoriju kvara nije moguće mijenjati.
5. Kliknem **Spremi izmjene**.

**Očekivani rezultat:** sistem sprema izmjene i prikazuje ažurirane podatke. Status zahtjeva ostaje *Novi*.

**Da bih otkazao zahtjev, radim:**

1. Na detaljima zahtjeva sa statusom **Novi** kliknem **Otkaži zahtjev**.
2. Potvrdim akciju u dijalogu.

<!-- SLIKA: Screenshot dijaloga za potvrdu otkazivanja — prikazati modal s porukom upozorenja i dugmadima "Potvrdi" / "Odustani" -->

**Očekivani rezultat:** status zahtjeva prelazi u *Otkazano*; zahtjev se premješta u historiju i više nije u aktivnom pregledu. Izmjena i otkazivanje nisu dostupni čim dispečer počne obradu.

---

### TOK 3 — Dispečer obradi zahtjev i dodijeli servisera

**Kao dispečer, da bih obradio zahtjev i dodijelio ga serviseru, radim:**

1. Otvorim `/dispecer` dashboard i vidim KPI kartice. U sekciji **Novi** pojavljuje se novi zahtjev.
2. Kliknem na karticu ili otvorim `/dispecer/zahtjevi` i iz liste odaberem zahtjev.
3. Kliknem **Otvori čarobnjak** (ili sistem me automatski vodi u čarobnjak).
4. **Korak 1 — Pregled zahtjeva:** čitam sve korisničke podatke (kategorija, adresa, opis, termin, hitnost, fotografija ako postoji). Kliknem **Dalje**.
5. **Korak 2 — Operativni prioritet:** sistem mi preporučuje prioritet na osnovu trijaže (npr. *VISOKO*). Mogu prihvatiti preporuku ili odabrati drugi prioritet. Kliknem **Dalje**.
6. **Korak 3 — Planiranje:** unosim dogovoreni termin — datum i vremenski raspon koji će biti vidljiv serviseru. Kliknem **Dalje**.
7. **Korak 4 — Pregled naloga:** iz liste dostupnih servisera odaberem odgovornog servisera. Opciono dodajem i pomoćnog servisera. Kliknem **Dalje**.
8. **Korak 5 — Potvrda:** pregledavam sve uneseno (prioritet, termin, serviser). Kliknem **Potvrdi**.

<!-- SLIKA: Screenshot Koraka 5 čarobnjaka (Potvrda) — prikazati sažetak odabranog prioriteta, termina i servisera s dugmetom "Potvrdi" -->

**Očekivani rezultat:** zahtjev prelazi iz dispečerovog inboxa u status *Potvrđeno*, a zatim *Dodijeljeno*. Serviseru se dodjeljuje zadatak koji odmah postaje vidljiv u njegovu dashboardu.

---

### TOK 4 — Serviser prihvati i izvrši intervenciju

**Kao serviser, da bih prihvatio i izvršio dodijeljeni zadatak, radim:**

1. Otvorim serviserski dashboard; vidim karticu nove intervencije sa statusom **Dodijeljeno**.
2. Kliknem na karticu i otvorim detalj zadatka: vidim adresu, kategoriju, opis korisnika i dogovoreni termin.
3. Kliknem **Prihvati zadatak**.
   - **Očekivani rezultat:** status prelazi u *U radu*; dispečer vidi da sam preuzeo zadatak.
4. Po dolasku na lokaciju kliknem **Počni izvršenje**.
   - **Očekivani rezultat:** status prelazi u *U izvršenju*.
5. Nakon obavljenog posla kliknem **Evidentiraj rad** i unosim: opis obavljenog rada, utrošeno vrijeme i materijal. Potvrđujem unos.
   - **Očekivani rezultat:** evidencija rada je snimljena i vidljiva dispečeru na detaljima intervencije.

**Da bih odbio zadatak (ako ga ne mogu preuzeti), radim:**

1. Na detaljima zadatka (dok je status *Dodijeljeno*) kliknem **Odbij zadatak**.
2. Iz padajućeg menija odaberem razlog ili ga unesem tekstualno. Potvrdim.

<!-- SLIKA: Screenshot forme za odbijanje zadatka — prikazati padajući meni s razlozima odbijanja i polje za komentar -->

**Očekivani rezultat:** zadatak se uklanja iz moje liste. Dispečer prima obavijest o odbijanju s razlogom i može dodijeliti intervenciju drugom serviseru.

---

### TOK 5 — Dispečer zatvori intervenciju

**Kao dispečer, da bih zatvorio završenu intervenciju, radim:**

1. Otvorim detalj intervencije koja je u statusu **U izvršenju** (serviser je evidentirao rad).
2. Pregledam evidenciju obavljenog rada u sekciji na dnu stranice.

<!-- SLIKA: Screenshot sekcije "Evidencija rada" na detaljima intervencije — prikazati uneseni opis rada, utrošeno vrijeme i materijal koji je serviser dodao -->

3. Kliknem **Zatvori intervenciju**.
   - **Očekivani rezultat:** status prelazi u *Završeno*; korisnik prima obavijest da je intervencija završena.
4. Za formalno arhiviranje kliknem **Formalno zatvori** (dostupno samo u statusu *Završeno*).
   - **Očekivani rezultat:** status prelazi u *Zatvoreno*; intervencija postaje read-only — izmjene više nisu moguće ni za koga.

> **Napomena:** formalno zatvaranje nije moguće bez evidentirane historije rada. Ako serviser nije evidentirao rad, sistem blokira akciju i prikazuje odgovarajuću poruku.

---

### TOK 6 — Administrator kreira interni nalog i dodijeli ulogu

**Kao administrator, da bih kreirao nalog za novog servisera ili dispečera, radim:**

1. Otvorim `/admin/korisnici` i vidim listu svih korisnika.
2. Kliknem **Novi korisnik** (ili ekvivalentnu opciju za kreiranje internog naloga).
3. Unosim podatke novog korisnika: ime, prezime, email i ulogu (serviser ili dispečer).
4. Potvrdim kreiranje.

**Očekivani rezultat:** sistem kreira nalog, novi korisnik može se prijaviti sa dodijeljenim kredencijalima i odmah pristupiti sistemu u svojoj ulozi.

**Da bih promijenio ulogu postojećeg korisnika, radim:**

1. Iz liste korisnika kliknem na korisnika i otvorim `/admin/korisnici/[id]/uredi`.
2. Kliknem **Promijeni ulogu**.
3. Iz liste odaberem novu ulogu. Ako biram ulogu Administrator, sistem prikazuje upozorenje.
4. Potvrdim izmjenu.

**Očekivani rezultat:** korisniku je dodijeljena nova uloga; pri sljedećoj prijavi vidjet će odgovarajući dashboard.

**Da bih suspendovao nalog, radim:**

1. Na stranici za uređivanje korisnika kliknem **Suspenduj**.
2. Unosim razlog suspenzije i potvrdim.

<!-- SLIKA: Screenshot potvrde uspješne suspenzije — prikazati poruku o uspjehu i ažurirani status korisnika u listi -->

**Očekivani rezultat:** korisnik ne može više da se prijavi i prikazuje mu se poruka *„Vaš nalog je suspendovan. Kontaktirajte administratora."* Historija i podaci ostaju sačuvani.

---

## 7. Premium usluga (važna napomena)

Premium omogućava **prioritetnu (hitnu)** obradu i, uz aktivan paket, označavanje pojedinog zahtjeva kao hitnog. U ovoj verziji je **naplata simulirana**, ne postoji stvarno plaćanje karticom; aktivacija i period važenja se postavljaju sistemski.

---

## 8. Objašnjenje ograničenja sistema

- **Premium naplata je simulirana** -> nema stvarnog plaćanja.
- **Email obavijesti** rade samo ako je sistem konfigurisan za slanje emaila (inače se ne šalju).
- **Ruta servisera** je procjena (udaljenost/trajanje), nije navigacijski precizna; zahtijeva postavljenu **baznu lokaciju** servisera.
- **Nema offline rada** -> potreban je internet.
- **Nema „push" obavijesti** -> obavijesti se vide u aplikaciji (uz osvježavanje).
- Aplikacija je **demo/MVP** -> namijenjena prikazu i testiranju, ne masovnoj produkciji.

---

## 9. Šta korisnik ne može raditi

- Ne može **slati zahtjev** dok ne potvrdi email adresu.
- Ne može **izmijeniti ili otkazati** zahtjev nakon što uđe u obradu (dozvoljeno samo u početnom statusu).
- Ne može **ocijeniti** intervenciju koja nije zatvorena, niti ocjenu mijenjati nakon spremanja (jedna ocjena po intervenciji).
- Ne može vidjeti **tuđe** zahtjeve/intervencije (kontrola pristupa po ulozi).
- Korisnik ne može pristupiti dispečerskim/serviserskim/admin ekranima (sistem preusmjerava).
- Premium zahtjev (hitno) može kreirati samo korisnik s **aktivnim** premium statusom.
