# Decision Log

## Odluka #001 – Obavezno trajanje pri evidenciji rada

| Polje | Opis |
|---|---|
| ID odluke | DLI-001 |
| Datum | 22.05.2026. |
| Kratak naziv odluke | Obavezno trajanje evidencije rada |
| Opis problema | Polje trajanja u evidenciji rada bilo je opcionalno, što je moglo dovesti do nepotpunih zapisa i nepouzdanih izvještaja o stvarno utrošenom vremenu servisera. |
| Razmatrane opcije | 1. Ostaviti trajanje opcionalno <br> 2. Učiniti trajanje obaveznim uz validaciju 1–1440 minuta <br> 3. Automatski izračunavati trajanje iz vremenskih oznaka |
| Odabrana opcija | Trajanje rada je obavezno polje uz validaciju u rasponu od 1 do 1440 minuta |
| Razlog izbora | Ova opcija daje pouzdan podatak o vremenu rada, a istovremeno je jednostavnija i sigurnija za implementaciju od automatskog izračuna trajanja |
| Posljedice odluke | API pozivi i evidencije rada bez trajanja više nisu validni; potrebno je uskladiti UI, backend validaciju i testove |
| Status odluke | aktivna |

### Trade-off analiza (Decision Matrix)

#### Težine kriterija

| Kriterij | Težina |
|---|---|
| Pouzdanost izvještaja | 5 |
| Jednostavnost implementacije | 4 |
| Tačnost evidencije rada | 5 |
| Rizik greške | 4 |
| Korisničko opterećenje | 3 |

#### Ocjenjivanje i rezultat

| Opcija | Pouzdanost | Jednostavnost | Tačnost | Rizik greške | UX opterećenje | Ukupno |
|---|---:|---:|---:|---:|---:|---:|
| Opcionalno trajanje | 2 | 5 | 2 | 2 | 5 | 58 |
| Obavezno trajanje | 5 | 4 | 5 | 4 | 4 | 91 |
| Automatski izračun | 5 | 2 | 4 | 3 | 5 | 79 |

### Sažetak odluke

**Krajnja odluka:** Trajanje rada je obavezno pri evidenciji intervencije.

| Stavka | Objašnjenje |
|---|---|
| Razlog izbora | Sistem mora imati pouzdane podatke o utrošenom vremenu |
| Prednosti | Tačniji izvještaji, bolja analiza rada servisera, manje nepotpunih zapisa |
| Nedostaci | Serviser mora unijeti još jedan obavezan podatak |
| Napomena | Validacija se radi na backendu i u korisničkom interfejsu |
| Implementacija | Zod validacija `.int().min(1).max(1440)` i required polje u UI |

### Detaljno obrazloženje

U sistemu servisnih intervencija evidencija utrošenog vremena je važna za operativno praćenje, izvještaje o radu servisera i analizu efikasnosti. Ako trajanje ostane opcionalno, sistem može imati veliki broj intervencija bez jasnog podatka koliko je rad stvarno trajao.

Zbog toga je odlučeno da trajanje bude obavezno. Automatski izračun iz vremenskih oznaka bio bi dugoročno koristan, ali u ovoj fazi nosi veći rizik jer zavisi od preciznog korištenja statusa i vremena početka/završetka rada.

Obavezno ručno trajanje je najstabilnije rješenje za Sprint 9 jer omogućava pouzdan unos bez velikog tehničkog rizika.

---

## Odluka #002 – SLA rokovi po operativnom prioritetu

| Polje | Opis |
|---|---|
| ID odluke | DLI-002 |
| Datum | 22.05.2026. |
| Kratak naziv odluke | SLA engine po prioritetu |
| Opis problema | Dispečer nije imao centralizovan način da vidi kada se intervencija približava roku odziva ili kada je rok već prekoračen. |
| Razmatrane opcije | 1. Ručna procjena dispečera <br> 2. Jedan fiksni SLA rok za sve intervencije <br> 3. SLA rokovi prema operativnom prioritetu |
| Odabrana opcija | SLA rokovi se računaju prema operativnom prioritetu intervencije |
| Razlog izbora | Različiti prioriteti zahtijevaju različite rokove odziva, pa je ovaj model najbliži stvarnom operativnom radu |
| Posljedice odluke | Potrebno je implementirati SLA engine, status badgeve, KPI prikaz i filtere za prekoračene intervencije |
| Status odluke | aktivna |

### Trade-off analiza (Decision Matrix)

#### Težine kriterija

| Kriterij | Težina |
|---|---|
| Operativna preciznost | 5 |
| Jednostavnost razumijevanja | 4 |
| Prilagodljivost prioritetima | 5 |
| Implementacijska složenost | 3 |
| Korisnost za dispečera | 5 |

#### Ocjenjivanje i rezultat

| Opcija | Preciznost | Razumljivost | Prioriteti | Složenost | Korisnost | Ukupno |
|---|---:|---:|---:|---:|---:|---:|
| Ručna procjena | 2 | 3 | 2 | 5 | 2 | 58 |
| Fiksni rok | 3 | 5 | 2 | 5 | 3 | 71 |
| Rokovi po prioritetu | 5 | 4 | 5 | 4 | 5 | 95 |

### Sažetak odluke

**Krajnja odluka:** SLA rokovi se određuju prema operativnom prioritetu.

| Stavka | Objašnjenje |
|---|---|
| Razlog izbora | Hitne i niske intervencije ne mogu imati isti rok odziva |
| Prednosti | Bolja kontrola rokova, jasniji dispečerski pregled, lakše uočavanje kašnjenja |
| Nedostaci | Potrebno održavati pravila po prioritetima |
| Napomena | SLA se ne primjenjuje na zatvorene i otkazane intervencije |
| Implementacija | `slaPravila.ts`, SLA badge, KPI “Prekoračen SLA” i filter na listi intervencija |

### Detaljno obrazloženje

SLA pravila pomažu dispečeru da prepozna koje intervencije zahtijevaju pažnju prije nego što problem postane ozbiljan. Ručna procjena nije dovoljno pouzdana jer zavisi od pažnje i iskustva pojedinačnog dispečera.

Fiksni rok za sve intervencije bio bi jednostavan, ali ne bi odražavao stvarnu razliku između hitne intervencije i intervencije niskog prioriteta. Zato je odabrano pravilo da se rok odziva računa prema operativnom prioritetu.

Ovaj pristup omogućava sistemu da automatski označi intervencije kao `ok`, `upozorenje` ili `prekoračeno`, čime se smanjuje rizik da dispečer previdi važan slučaj.

---

## Odluka #003 – Audit trail sa starom i novom vrijednošću

| Polje | Opis |
|---|---|
| ID odluke | DLI-003 |
| Datum | 22.05.2026. |
| Kratak naziv odluke | Strukturirani audit trail |
| Opis problema | Historija aktivnosti je prikazivala da se promjena desila, ali nije uvijek jasno prikazivala vrijednost prije i poslije promjene. |
| Razmatrane opcije | 1. Samo tekstualni opis aktivnosti <br> 2. Popunjavanje `old_value` i `new_value` u postojećoj tabeli aktivnosti <br> 3. Kreiranje posebnog audit servisa |
| Odabrana opcija | Popunjavanje `old_value` i `new_value` u postojećoj tabeli aktivnosti |
| Razlog izbora | Postojeća tabela već podržava potrebna polja, pa se audit može poboljšati bez velikog arhitektonskog zahvata |
| Posljedice odluke | Svi relevantni handleri moraju dosljedno upisivati staru i novu vrijednost |
| Status odluke | aktivna |

### Trade-off analiza (Decision Matrix)

#### Težine kriterija

| Kriterij | Težina |
|---|---|
| Preglednost historije | 5 |
| Implementacijska jednostavnost | 4 |
| Audit pouzdanost | 5 |
| Usklađenost sa postojećom bazom | 4 |
| Skalabilnost | 3 |

#### Ocjenjivanje i rezultat

| Opcija | Preglednost | Jednostavnost | Pouzdanost | Usklađenost | Skalabilnost | Ukupno |
|---|---:|---:|---:|---:|---:|---:|
| Samo tekstualni opis | 2 | 5 | 2 | 5 | 2 | 61 |
| `old_value` / `new_value` | 5 | 4 | 5 | 5 | 4 | 94 |
| Odvojeni audit servis | 5 | 2 | 5 | 3 | 5 | 84 |

### Sažetak odluke

**Krajnja odluka:** Historija aktivnosti prikazuje staru i novu vrijednost promjene.

| Stavka | Objašnjenje |
|---|---|
| Razlog izbora | Korisnik i tim mogu jasnije vidjeti šta je promijenjeno |
| Prednosti | Bolji audit trag, lakše otkrivanje grešaka, veća transparentnost |
| Nedostaci | Handleri moraju dosljedno slati dodatne vrijednosti |
| Napomena | Posebno važno za status, prioritet i promjenu servisera |
| Implementacija | Popunjavanje `old_value` / `new_value` i UI prikaz u historiji aktivnosti |

### Detaljno obrazloženje

Kod operativnog sistema nije dovoljno znati da se promjena desila. Važno je znati šta je tačno promijenjeno. Na primjer, promjena servisera, statusa ili prioriteta može biti važna za kasniju provjeru toka intervencije.

Zbog toga je donesena odluka da se postojeća historija aktivnosti proširi strukturiranim prikazom stare i nove vrijednosti. Time sistem dobija bolji audit trag bez potrebe za uvođenjem potpuno novog audit servisa.

---

## Odluka #004 – Povrat intervencije kada problem nije riješen

| Polje | Opis |
|---|---|
| ID odluke | DLI-004 |
| Datum | 22.05.2026. |
| Kratak naziv odluke | Nije riješeno – povrat u dispečerski tok |
| Opis problema | Serviser ponekad ne može riješiti problem iz prve, pa sistem mora podržati povrat intervencije u dispečerski tok radi ponovne organizacije. |
| Razmatrane opcije | 1. Uvesti novi status `nije_rijeseno` <br> 2. Vratiti intervenciju u postojeći status `potvrdeno` i ukloniti dodijeljenog servisera <br> 3. Automatski dodijeliti drugog servisera |
| Odabrana opcija | Intervencija se vraća u `potvrdeno`, briše se dodijeljeni serviser i evidentira se aktivnost `nije_rijeseno` |
| Razlog izbora | Koristi postojeći dispečerski tok i izbjegava nepotrebno širenje statusa u bazi |
| Posljedice odluke | Dispečer ponovo preuzima intervenciju i odlučuje o daljoj dodjeli |
| Status odluke | aktivna |

### Trade-off analiza (Decision Matrix)

#### Težine kriterija

| Kriterij | Težina |
|---|---|
| Jasnoća workflow-a | 5 |
| Jednostavnost implementacije | 4 |
| Kontrola dispečera | 5 |
| Rizik od širenja statusa | 4 |
| Operativna fleksibilnost | 5 |

#### Ocjenjivanje i rezultat

| Opcija | Workflow | Jednostavnost | Kontrola | Status rizik | Fleksibilnost | Ukupno |
|---|---:|---:|---:|---:|---:|---:|
| Novi status `nije_rijeseno` | 4 | 3 | 4 | 2 | 4 | 73 |
| Povrat u `potvrdeno` | 5 | 5 | 5 | 5 | 4 | 96 |
| Automatska dodjela | 3 | 3 | 2 | 4 | 5 | 67 |

### Sažetak odluke

**Krajnja odluka:** Ako problem nije riješen, intervencija se vraća dispečeru kroz postojeći tok.

| Stavka | Objašnjenje |
|---|---|
| Razlog izbora | Dispečer treba procijeniti sljedeći korak, a ne sistem automatski |
| Prednosti | Manje statusa, jasniji tok, veća kontrola dispečera |
| Nedostaci | Status `potvrdeno` nosi više značenja i mora se pažljivo prikazati u UI |
| Napomena | Aktivnost `nije_rijeseno` jasno objašnjava razlog povratka |
| Implementacija | Akcija `oznaci_nije_rijesen`, audit zapis i notifikacija dispečeru |

### Detaljno obrazloženje

U praksi se može desiti da serviser izađe na teren, ali problem ne može riješiti zbog nedostatka materijala, pogrešne specijalizacije, dodatne kompleksnosti ili potrebe za drugim serviserom. Sistem mora podržati taj scenario.

Umjesto uvođenja novog statusa, odlučeno je da se intervencija vrati u postojeći dispečerski tok. Time se izbjegava širenje statusnog modela, a dispečer zadržava kontrolu nad narednim korakom.

---

## Odluka #005 – Konsolidacija serviserske navigacije

| Polje | Opis |
|---|---|
| ID odluke | DLI-005 |
| Datum | 22.05.2026. |
| Kratak naziv odluke | Kanonska ruta serviserskih intervencija |
| Opis problema | Postojanje ruta `zadaci` i `intervencije` za sličan sadržaj moglo je zbuniti servisere i otežati održavanje navigacije. |
| Razmatrane opcije | 1. Zadržati obje rute ravnopravno <br> 2. Uvesti redirect sa `/serviser/zadaci` na `/serviser/intervencije` <br> 3. Preimenovati cijeli modul u zadatke |
| Odabrana opcija | `/serviser/intervencije` postaje kanonska ruta, a stara ruta se preusmjerava |
| Razlog izbora | Jedan izvor istine za serviserski pregled smanjuje konfuziju i olakšava održavanje |
| Posljedice odluke | Stari bookmarki i linkovi i dalje rade, ali korisnik završava na kanonskoj ruti |
| Status odluke | aktivna |

### Trade-off analiza (Decision Matrix)

#### Težine kriterija

| Kriterij | Težina |
|---|---|
| Jasnoća navigacije | 5 |
| Održavanje | 5 |
| Kompatibilnost starih linkova | 4 |
| Implementacijska jednostavnost | 4 |
| UX konzistentnost | 5 |

#### Ocjenjivanje i rezultat

| Opcija | Navigacija | Održavanje | Kompatibilnost | Jednostavnost | UX | Ukupno |
|---|---:|---:|---:|---:|---:|---:|
| Zadržati obje rute | 2 | 2 | 5 | 5 | 2 | 58 |
| Redirect na kanonsku rutu | 5 | 5 | 5 | 4 | 5 | 96 |
| Preimenovati sve u zadatke | 4 | 3 | 2 | 2 | 4 | 66 |

### Sažetak odluke

**Krajnja odluka:** Serviserski pregled se standardizuje na rutu `/serviser/intervencije`.

| Stavka | Objašnjenje |
|---|---|
| Razlog izbora | Manje konfuzije i jasniji model aplikacije |
| Prednosti | Jedinstvena navigacija, lakše održavanje, kompatibilnost postojećih linkova |
| Nedostaci | Potrebno je dodati redirect/rewrite |
| Napomena | Termin “intervencija” se koristi kao glavni pojam za serviserski rad |
| Implementacija | Redirect 308 ili rewrite sa stare rute |

### Detaljno obrazloženje

Za servisera intervencija zapravo predstavlja njegov radni zadatak. Ipak, ako se isti modul na jednom mjestu zove “zadaci”, a na drugom “intervencije”, korisnik može imati osjećaj da se radi o različitim stvarima.

Zbog toga je odlučeno da se koristi jedan kanonski naziv i jedna ruta. Stara ruta ostaje podržana kroz preusmjerenje kako se ne bi pokvarili postojeći linkovi.

---

## Odluka #006 – Tabelarni prikaz historije aktivnosti

| Polje | Opis |
|---|---|
| ID odluke | DLI-006 |
| Datum | 22.05.2026. |
| Kratak naziv odluke | Tabela historije aktivnosti |
| Opis problema | Timeline prikaz aktivnosti je vizuelno dobar, ali kod većeg broja promjena može biti nepregledan za analizu i poređenje podataka. |
| Razmatrane opcije | 1. Zadržati samo timeline prikaz <br> 2. Uvesti samo tabelarni prikaz <br> 3. Omogućiti toggle između timeline i tabelarnog prikaza |
| Odabrana opcija | Uvesti tabelarni prikaz aktivnosti uz mogućnost prebacivanja prikaza |
| Razlog izbora | Timeline je bolji za brz pregled, a tabela je bolja za analizu i audit |
| Posljedice odluke | Potrebno je dodati komponentu `AktivnostiTabela` i toggle u sekciji historije aktivnosti |
| Status odluke | aktivna |

### Trade-off analiza (Decision Matrix)

#### Težine kriterija

| Kriterij | Težina |
|---|---|
| Preglednost za korisnika | 5 |
| Audit upotrebljivost | 5 |
| Jednostavnost implementacije | 4 |
| Vizuelna jasnoća | 4 |
| Skalabilnost prikaza | 4 |

#### Ocjenjivanje i rezultat

| Opcija | Preglednost | Audit | Jednostavnost | Vizuelno | Skalabilnost | Ukupno |
|---|---:|---:|---:|---:|---:|---:|
| Samo timeline | 4 | 2 | 5 | 5 | 2 | 70 |
| Samo tabela | 3 | 5 | 4 | 3 | 5 | 77 |
| Toggle prikaz | 5 | 5 | 4 | 5 | 5 | 96 |

### Sažetak odluke

**Krajnja odluka:** Historija aktivnosti podržava i timeline i tabelarni prikaz.

| Stavka | Objašnjenje |
|---|---|
| Razlog izbora | Različiti korisnici trebaju različit način pregleda historije |
| Prednosti | Bolji audit, lakše poređenje promjena, fleksibilniji UI |
| Nedostaci | Potrebno održavati dvije varijante prikaza |
| Napomena | Timeline ostaje pogodan za operativni pregled |
| Implementacija | `AktivnostiTabela` + toggle u `HistorijaAktivnostiSekcija` |

### Detaljno obrazloženje

Historija aktivnosti može služiti za brz operativni pregled, ali i za detaljnu analizu. Timeline je intuitivan kada korisnik želi brzo vidjeti redoslijed događaja, ali tabela je bolja kada treba porediti stare i nove vrijednosti, filtrirati tipove promjena ili pregledati veći broj aktivnosti.

Zato je odlučeno da se podrže oba prikaza. Time se ne gubi vizuelna jasnoća timeline-a, a dobija se ozbiljniji audit prikaz.

---

## Odluka #007 – SLA eskalacije sa cooldown periodom

| Polje | Opis |
|---|---|
| ID odluke | DLI-007 |
| Datum | 22.05.2026. |
| Kratak naziv odluke | SLA eskalacije |
| Opis problema | Kada je SLA prekoračen ili u riziku, sistem treba izbjeći i ignorisanje problema i prečesto ponavljanje istih upozorenja. |
| Razmatrane opcije | 1. Samo vizuelni SLA badge <br> 2. Automatska eskalacija bez ograničenja <br> 3. Eskalacije sa cooldown periodom |
| Odabrana opcija | SLA eskalacije se evidentiraju uz cooldown od 6 sati |
| Razlog izbora | Sistem upozorava na problem, ali ne zatrpava korisnike ponovljenim eskalacijama |
| Posljedice odluke | Potrebno je voditi evidenciju zadnje eskalacije i provjeravati cooldown |
| Status odluke | aktivna |

### Trade-off analiza (Decision Matrix)

#### Težine kriterija

| Kriterij | Težina |
|---|---|
| Pravovremeno upozorenje | 5 |
| Smanjenje alert fatigue-a | 5 |
| Implementacijska složenost | 3 |
| Operativna vrijednost | 5 |
| Skalabilnost | 4 |

#### Ocjenjivanje i rezultat

| Opcija | Upozorenje | Alert fatigue | Složenost | Vrijednost | Skalabilnost | Ukupno |
|---|---:|---:|---:|---:|---:|---:|
| Samo badge | 2 | 5 | 5 | 2 | 3 | 65 |
| Eskalacija bez ograničenja | 5 | 1 | 4 | 3 | 3 | 62 |
| Cooldown eskalacija | 5 | 5 | 4 | 5 | 5 | 97 |

### Sažetak odluke

**Krajnja odluka:** SLA eskalacije koriste cooldown period od 6 sati.

| Stavka | Objašnjenje |
|---|---|
| Razlog izbora | Upozorenja ostaju korisna, ali ne postaju spam |
| Prednosti | Bolja kontrola, manje ponovljenih notifikacija, ozbiljniji SLA tok |
| Nedostaci | Potrebna dodatna logika provjere zadnje eskalacije |
| Napomena | Cooldown period može se kasnije podesiti prema realnim potrebama |
| Implementacija | `slaEskalacije.ts` i cooldown od 6 sati |

### Detaljno obrazloženje

SLA eskalacije imaju smisla samo ako zaista pomažu dispečeru da reaguje na vrijeme. Ako se upozorenja šalju prečesto, korisnici ih počinju ignorisati. Ako ih nema, rizikuje se kašnjenje bez reakcije.

Zato je odabrano srednje rješenje: sistem evidentira eskalaciju, ali ne ponavlja istu eskalaciju prečesto. Cooldown od 6 sati je prihvatljiv za MVP i može se kasnije prilagoditi.

---

## Odluka #008 – Evidencija materijala kroz JSONB stavke

| Polje | Opis |
|---|---|
| ID odluke | DLI-008 |
| Datum | 22.05.2026. |
| Kratak naziv odluke | JSONB evidencija materijala |
| Opis problema | Serviser treba moći evidentirati dijelove i materijale korištene tokom intervencije, ali struktura materijala može varirati od slučaja do slučaja. |
| Razmatrane opcije | 1. Jedno tekstualno polje za materijal <br> 2. Posebna relaciona tabela za materijale <br> 3. JSONB `stavke_materijala` |
| Odabrana opcija | Korištenje JSONB polja `stavke_materijala` |
| Razlog izbora | JSONB omogućava fleksibilan unos više stavki bez dodatnog širenja modela baze u ovoj fazi |
| Posljedice odluke | Potrebna je validacija strukture JSON podataka u aplikacijskom sloju |
| Status odluke | aktivna |

### Trade-off analiza (Decision Matrix)

#### Težine kriterija

| Kriterij | Težina |
|---|---|
| Fleksibilnost unosa | 5 |
| Jednostavnost implementacije | 4 |
| Izvještavanje | 4 |
| Skalabilnost | 4 |
| Integritet podataka | 5 |

#### Ocjenjivanje i rezultat

| Opcija | Fleksibilnost | Jednostavnost | Izvještaji | Skalabilnost | Integritet | Ukupno |
|---|---:|---:|---:|---:|---:|---:|
| Tekstualno polje | 2 | 5 | 1 | 2 | 1 | 43 |
| Relaciona tabela | 5 | 3 | 5 | 5 | 5 | 89 |
| JSONB stavke | 5 | 5 | 4 | 4 | 4 | 92 |

### Sažetak odluke

**Krajnja odluka:** Materijal se evidentira kroz JSONB `stavke_materijala`.

| Stavka | Objašnjenje |
|---|---|
| Razlog izbora | Dovoljno fleksibilno za MVP i jednostavnije od nove relacione strukture |
| Prednosti | Više stavki, fleksibilna struktura, brža implementacija |
| Nedostaci | Potrebna aplikacijska validacija i pažljivije izvještavanje |
| Napomena | Relaciona tabela može biti buduće unapređenje ako materijali postanu kompleksniji |
| Implementacija | JSONB polje sa validiranim stavkama materijala |

### Detaljno obrazloženje

Evidencija materijala je važna za transparentnost rada, obračun troškova i kasnije izvještaje. Jedno tekstualno polje ne bi bilo dovoljno strukturirano, jer bi bilo teško analizirati koliko je čega potrošeno.

Relaciona tabela je najčistije dugoročno rješenje, ali za trenutni MVP uvodi dodatnu složenost. JSONB predstavlja dobar kompromis jer omogućava unos više strukturiranih stavki bez većeg refaktora baze.



