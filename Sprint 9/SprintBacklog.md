# Sprint Goal

## Sprint broj 9

### Sprint cilj

Zatvoriti kompletan MVP tok servisnih intervencija: preraspodjela i alternativni operativni tokovi, kontrola kvaliteta (SLA, eskalacije, audit), evidencija rada na terenu, administracija naloga, izvještaji performansi i priprema za predaju.

### Ključne stavke koje tim želi završiti

- promjena izvršioca intervencije od strane dispečera (US-28)
- vraćanje zadatka na ponovnu dodjelu od strane servisera (US-29)
- označavanje intervencije kao nije riješena (US-40)
- obavezno trajanje pri evidentiranju rada (US-38)
- audit trail sa starim i novim vrijednostima u historiji aktivnosti (US-39)
- tabelarni pregled historije aktivnosti (US-44)
- SLA praćenje i eskalacije na dispečerskim pregledima (US-41, US-45)
- izvještaj odziva i trajanja po serviseru (US-42)
- upload i pregled foto dokumentacije intervencije (US-43)
- strukturirana evidencija materijala i dijelova (US-46)
- praćenje intervencije nije riješene iz prve (US-47)
- pregled, promjena uloge i deaktivacija korisničkih naloga (US-19–21, US-36)
- sistemske notifikacije po ulozi (US-37)
- regresija serviserskog toka i zatvaranja (US-14–25, US-30, US-32)
- automatizirani i manuelni testovi (SB-09-36)
- STRIDE pregled i ciljani refaktoring (modali, audit helper)

### Rizici i zavisnosti

Sprint 9 nadograđuje funkcionalan tok iz Sprinta 8. Kritične zavisnosti:

- stabilni statusni prelazi i RBAC
- model `service_requests`, `intervention_activities`, `work_evidence`, `notifikacije`
- Supabase Storage `intervencije-slike`

### Postoji rizik:

- regresije pri eskalacijama SLA i ponovnim ciklusima
- nekonzistentnost dokumentacije ako se storyji ne provuku kroz sve sprint artefakte
- preopterećenje dispečerskog detalja bez postupne ekstrakcije komponenti

### Zavisnosti:

- završena dodjela i serviserski tok (Sprint 8)
- definisani US-01–US-47 u `Sprint 2/User Stories.md`

---

# Sprint Backlog
 
| ID | User Story | Prioritet | Procjena | Status | Zadaci | Acceptance Criteria |
|----|------------|-----------|----------|--------|--------|---------------------|
| US-28 | Kao dispečer, želim promijeniti izvršioca intervencije kako bi zadatak mogao biti dodijeljen drugom serviseru kada prvobitni ne može preuzeti ili završiti rad. | Srednji | 8 | Završeno | Implementirati modal za promjenu izvršioca s listom dostupnih servisera; kreirati PATCH endpoint `promijeni_izvrsioca` s validacijom statusa intervencije; ukloniti intervenciju sa liste aktivnog zaduženja prethodnog servisera; evidentirati promjenu u audit logu s imenima oba servisera, razlogom i vremenskim pečatom; poslati notifikacije novom i prethodnom serviseru | Dispečer može promijeniti izvršioca intervencije odabirom novog servisera s liste. Sistem oslobađa prethodnog servisera, obavještava oba i evidentira promjenu u audit logu. Akcija nije moguća na zatvorenim ili otkazanim intervencijama. |
| US-29 | Kao serviser, želim vratiti zadatak na ponovnu dodjelu kako bi dispečer mogao organizovati dalje izvršenje kada zadatak nije moguće završiti. | Srednji | 5 | Završeno | Implementirati akciju "Vrati na ponovnu dodjelu" u serviserskom sučelju s obaveznim poljem za obrazloženje; kreirati PATCH endpoint `vrati_na_ponovnu_dodjelu`; promijeniti status intervencije u "Čeka ponovnu dodjelu"; ukloniti intervenciju sa liste aktivnih zaduženja servisera; inkrementirati brojač ponovnih ciklusa (US-47); poslati hitnu notifikaciju dispečeru s ID zadatka i obrazloženjem | Serviser može vratiti zadatak uz obavezno obrazloženje. Status se mijenja u "Čeka ponovnu dodjelu", zadatak se uklanja iz serviserove liste i dispečer prima hitnu notifikaciju. Akcija nije dostupna na zatvorenim intervencijama. |
| US-40 | Kao serviser, želim označiti intervenciju kao nije riješena kako bi dispečer znao da problem nije otklonjen i može organizovati ponovni izlazak. | Srednji | 3 | Završeno | Implementirati akciju "Označi kao nije riješena" u serviserskom sučelju s obaveznim razlogom; kreirati PATCH endpoint `oznaci_nije_rijesen`; promijeniti status intervencije i evidentirati razlog u historiji aktivnosti; inkrementirati brojač ponovnih ciklusa (US-47); ograničiti akciju samo na servisera dodijeljenog toj intervenciji i samo za aktivne statuse | Serviser može označiti intervenciju kao nije riješena uz obavezan razlog. Sistem inkrementira brojač ciklusa, evidentira razlog u historiji i ažurira status. Akcija nije dostupna za zatvorene intervencije niti za servisere koji nisu dodijeljeni. |
| US-38 | Kao serviser, želim da sistem zahtijeva unos trajanja pri evidentiranju rada kako bi evidencija bila potpuna i korisna za izvještaje. | Visok | 3 | Završeno | Dodati obavezno polje trajanja (u minutama ili satima) u `EvidencijaRadaModal`; implementirati Zod validaciju koja odbija prazne, nulte i negativne vrijednosti; prikazati jasnu validacijsku poruku pri neispravnom unosu; pohraniti trajanje uz ostatak evidencije; prikazati trajanje u dispečerskom pregledu evidentiranog rada | Polje trajanja je obavezno pri evidenciji rada. Sistem odbija prazne, nulte i negativne vrijednosti uz validacijsku poruku. Uneseno trajanje se sprema i prikazuje dispečeru u pregledu evidencije. |
| US-39 | Kao dispečer, želim u historiji aktivnosti vidjeti stare i nove vrijednosti promjena kako bih imao potpun audit trail. | Srednji | 5 | Završeno | Proširiti model `intervention_activities` s kolonama `old_value` i `new_value`; ažurirati sve handlere koji pišu u historiju da uključuju stare i nove vrijednosti; prikazati staru i novu vrijednost u timeline prikazu i tabelarnom pregledu (US-44); osigurati da su audit zapisi nepromjenjivi i da pristup imaju samo ovlaštene uloge | Svaka promjena u historiji aktivnosti sadrži staru i novu vrijednost, autora i vremenski pečat. Zapisi su nepromjenjivi i dostupni samo ovlaštenim ulogama. |
| US-41 | Kao dispečer, želim vidjeti SLA status intervencija kako bih mogao pravovremeno reagovati na prekoračenja rokova. | Srednji | 5 | Završeno | Implementirati `slaPravila.ts` s definicijom SLA rokova po prioritetu; izračunavati SLA status za svaku aktivnu intervenciju; prikazati SLA badge na listi i detalju intervencije; dodati SLA KPI kartice na dispečerski dashboard; omogućiti filtriranje intervencija po SLA statusu; ograničiti prikaz SLA informacija na ovlaštene uloge | Sistem izračunava i prikazuje SLA status na listi i detalju intervencije putem badge-a. Dashboard prikazuje KPI kartice po SLA statusu. Dispečer može filtrirati intervencije po SLA statusu. |
| US-42 | Kao dispečer, želim pregledati izvještaj odziva i trajanja po serviseru kako bih mogao pratiti efikasnost tima. | Nizak | 5 | Završeno | Implementirati `izvjestajiOdziva.ts` s logikom agregacije podataka po serviseru; kreirati stranicu izvještaja s tabelarnim prikazom prosječnog odziva i trajanja; dodati filter po vremenskom periodu; osigurati da su podaci konzistentni s evidentiranim vrijednostima; ograničiti pristup izvještaju na ovlaštene uloge | Dispečer može pregledati izvještaj s prosječnim odzivom i trajanjem po serviseru uz filtriranje po periodu. Podaci su konzistentni s evidentiranim vrijednostima. Pristup je ograničen na ovlaštene uloge. |
| US-43 | Kao serviser, želim uploadovati fotografije intervencije kako bi dokumentacija bila vizualno potpuna. | Nizak | 3 | Završeno | Implementirati upload fotografija u Supabase Storage bucket `intervencije-slike`; validirati tip fajla provjerom magic bytes (JPEG, PNG, WebP); prikazati galeriju uploadovanih fotografija na detalju intervencije; dozvoliti pregled i preuzimanje fotografija serviserima i dispečerima; ograničiti pristup na ovlaštene uloge | Serviser može uploadovati fotografije u dozvoljenim formatima (JPEG, PNG, WebP). Fotografije su dostupne u galeriji na detalju intervencije ovlaštenim korisnicima. Fajlovi s neispravnim magic bytes se odbijaju. |
| US-44 | Kao dispečer, želim pregledati historiju aktivnosti intervencije u tabelarnom obliku kako bih lakše pratio promjene. | Srednji | 3 | Završeno | Implementirati komponentu `AktivnostiTabela` s kolonama polje, stara vrijednost, nova vrijednost i autor; dodati toggle u `HistorijaAktivnostiSekcija` za prelaz između tabelarnog i timeline prikaza; sortirati zapise hronološki od najnovijeg; osigurati preglednost tabele i za veći broj zapisa | Historija aktivnosti dostupna je u tabelarnom prikazu s kolonama polje, stara vrijednost, nova vrijednost i autor, sortirano hronološki. Korisnik može toggleovati između tabelarnog i timeline prikaza. |
| US-45 | Kao dispečer, želim primati eskalacijske notifikacije za prekoračene SLA rokove kako bih mogao hitno reagovati. | Srednji | 5 | Završeno | Implementirati `slaEskalacije.ts` s logikom detekcije prekoračenja SLA; kreirati mehanizam slanja hitnih notifikacija dispečeru s podacima o intervenciji; evidentirati eskalaciju u audit logu; implementirati cooldown period koji sprečava slanje duplikata za isti slučaj u kratkom vremenskom razmaku | Sistem šalje hitnu notifikaciju dispečeru kada intervencija prekorači SLA rok i evidentira eskalaciju u audit logu. Duplikati su spriječeni cooldown periodom. |
| US-46 | Kao serviser, želim evidentirati materijale i dijelove korištene tokom intervencije kako bi evidencija bila potpuna. | Srednji | 5 | Završeno | Dodati JSONB kolonu `stavke_materijala` u model evidencije rada; implementirati modal za dodavanje stavki s poljima naziv, količina i jedinica mjere; validirati obaveznost sva tri polja; omogućiti dodavanje više stavki u jednoj evidenciji; prikazati listu materijala dispečeru u pregledu evidentiranog rada; zaključati materijale uz ostatak evidencije nakon zatvaranja intervencije | Serviser može evidentirati materijale i dijelove s obaveznim poljem naziv, količina i jedinica mjere. Moguće je dodati više stavki. Materijali su vidljivi dispečeru i nepromjenjivi nakon zatvaranja intervencije. |
| US-47 | Kao dispečer, želim vidjeti koliko puta je intervencija vraćana ili označena kao nije riješena kako bih pratio problematične slučajeve. | Srednji | 3 | Završeno | Dodati kolonu `broj_ponovnih_ciklusa` u model intervencije; inkrementirati brojač pri svakom vraćanju (US-29) i označavanju kao nije riješena (US-40); implementirati `PonovniCiklusBadge` komponentu vidljivu na listi i detalju intervencije; omogućiti filtriranje intervencija s više od jednog ciklusa | Sistem broji i prikazuje broj ponovnih ciklusa kao badge na listi i detalju intervencije. Brojač se ažurira automatski. Dispečer može filtrirati intervencije s više od jednog ciklusa. |
| US-19 | Kao administrator, želim pregledati postojeće korisničke naloge kako bih imao uvid u korisnike sistema i mogao njima upravljati. | Srednji | 3 | Završeno | Implementirati stranicu `admin/korisnici` s tabelarnim prikazom svih korisničkih naloga; prikazati ime, ulogu i status naloga za svakog korisnika; implementirati prikaz praznog stanja kada nema korisnika; zaštititi rutu i API endpoint isključivo za administratorsku ulogu | Administrator može pregledati listu svih korisničkih naloga s imenom, ulogom i statusom. Pristup je ograničen isključivo na administratorsku ulogu. |
| US-20 | Kao administrator, želim promijeniti korisničku ulogu kako bi korisnik imao pristup funkcionalnostima koje odgovaraju njegovoj novoj odgovornosti. | Srednji | 3 | Završeno | Implementirati PATCH endpoint `promijeni_ulogu` s validacijom odabrane uloge; dodati UI kontrolu za promjenu uloge u admin pregledu korisnika; odmah primijeniti novu ulogu na nalog; zaštititi funkcionalnost isključivo za administratorsku ulogu | Administrator može promijeniti korisničku ulogu. Nova uloga se primjenjuje odmah i vidljiva je u pregledu naloga. Akcija nije dostupna korisnicima bez administratorske uloge. |
| US-21 | Kao administrator, želim deaktivirati korisnički nalog kako bih spriječio dalji pristup korisniku koji više ne treba koristiti sistem. | Srednji | 3 | Završeno | Implementirati PATCH endpoint `suspenduj` koji mijenja status naloga u "Neaktivan" i bilježi vrijeme deaktivacije; prekinuti aktivnu sesiju deaktiviranog korisnika; prikazati deaktivirane naloge s jasnom vizuelnom oznakom u listi; sačuvati sve historijske podatke vezane za deaktivirani nalog; zaštititi akciju isključivo za administratorsku ulogu | Administrator može deaktivirati nalog. Deaktivirani korisnik gubi pristup sistemu odmah. Nalog ostaje vidljiv u listi s oznakom "Neaktivan", a svi historijski podaci ostaju sačuvani. |
| US-36 | Kao korisnik, želim urediti podatke svog naloga kako bih ih mogao ažurirati kada se promijene. | Srednji | 3 | Završeno | Implementirati stranicu `/profil` s formom za izmjenu dozvoljenih podataka korisnika; dodati Zod validaciju za sva obavezna polja; implementirati admin funkcionalnost za uređivanje naloga drugog korisnika; spriječiti korisnika da mijenja vlastitu ulogu ili status — te akcije su isključivo u nadležnosti administratora | Korisnik može urediti vlastite podatke na stranici profila. Promjena uloge i statusa naloga dostupna je isključivo administratoru. Nevalidni unosi se odbijaju uz validacijsku poruku. |
| US-37 | Kao korisnik, želim primati relevantne sistemske notifikacije kako bih bio pravovremeno informisan o promjenama vezanim za moje intervencije i nalog. | Srednji | 3 | Završeno | Implementirati `NotifikacijeBell` komponentu s unread badge-om; kreirati mapping događaja po ulogama koji određuje koje notifikacije prima svaka uloga; pohraniti notifikacije u tabelu i prikazati ih hronološki; implementirati oznaku notifikacije kao pročitane; spriječiti slanje duplikata za isti događaj | Svaka uloga prima samo sebi relevantne notifikacije. Nepročitane notifikacije su vizuelno istaknute badge-om. Korisnik može označiti notifikacije kao pročitane. Duplikati za isti događaj se ne šalju. |


