# Test Strategy 

## Cilj testiranja

Cilj testiranja je provjeriti i osigurati da sistem za upravljanje servisnim intervencijama funkcioniše ispravno, pouzdano i u skladu sa definisanim zahtjevima, user storyjima i acceptance kriterijima. Pored funkcionalnih zahtjeva, testiranje obuhvata i provjeru nefunkcionalnih zahtjeva koji se odnose na performanse, pouzdanost, sigurnost, upotrebljivost, portabilnost i održivost sistema.

Testiranjem se ne provjerava samo da li su pojedine funkcionalnosti tehnički implementirane bez grešaka, nego i da li su osmišljene i realizovane u skladu sa stvarnim potrebama korisnika i predviđenim tokom poslovnog procesa.

Na taj način testiranje obuhvata i verifikaciju i validaciju sistema, kao i provjeru da li razvijeno rješenje zaista podržava rad svih relevantnih korisničkih uloga.

Glavni ciljevi testiranja su:
- provjeriti ispunjenost funkcionalnih zahtjeva
- potvrditi usklađenost sa acceptance kriterijima
- provjeriti ispravnost prava pristupa i korisničkih uloga
- osigurati ispravno odvijanje glavnog i alternativnih tokova rada
- smanjiti rizik od grešaka u produkciji
- obezbijediti pouzdan i upotrebljiv sistem za sve korisničke uloge
- provjeriti ispunjenost nefunkcionalnih zahtjeva
- potvrditi da sistem zadovoljava zahtjeve sigurnosti, dostupnosti, performansi i upotrebljivosti
- provjeriti da je sistem upotrebljiv i tehnički održiv u okviru MVP obima
- potvrditi da se premium naplata u MVP-u testira kao simulirani tok, bez verifikacije realnog payment gateway-a

## Nivoi testiranja

U okviru ovog projekta testiranje se organizuje kroz klasične nivoe testiranja, a dodatno se primjenjuju i pojedine vrste testiranja koje predstavljaju poseban fokus provjere kvaliteta. Na taj način se ne provjerava samo da li pojedinačne funkcionalnosti rade tehnički ispravno, nego i da li moduli pravilno sarađuju, da li kompletan sistem podržava predviđeni tok rada, da li su prava pristupa ispravno ograničena i da li je sistem razumljiv i upotrebljiv za različite korisničke uloge.


### Unit testiranje

Unit testiranje koristi se za provjeru manjih, izolovanih dijelova sistema, odnosno pojedinačnih funkcija, pravila i logičkih cjelina. Na ovom nivou fokus nije na kompletnom toku rada, nego na provjeri da li pojedinačna pravila implementacije daju ispravan rezultat.

U okviru ovog projekta unit testiranje primarno obuhvata:
- validaciju unosa u formama
- logiku određivanja prioriteta
- pravila prelaza statusa
- osnovne provjere prava pristupa
- pomoćne funkcije za obradu i prikaz podataka

### Integraciono testiranje

Integraciono testiranje koristi se za provjeru međusobne saradnje povezanih modula i komponenti sistema. Njegov cilj je utvrditi da li moduli koji su razvijani odvojeno pravilno razmjenjuju podatke i zajedno podržavaju predviđeni proces rada.

U okviru ovog projekta integraciono testiranje obuhvata, između ostalog:
- povezivanje registracije i prijave korisnika sa bazom podataka
- prijavu zahtjeva i njegovo evidentiranje u sistemu
- prikaz zahtjeva korisniku i dispečeru
- dodjelu zadatka serviseru i prikaz zadatka na serviserskoj strani
- evidentiranje rada i pregled izvršenog rada prije zatvaranja intervencije

### Sistemsko testiranje

Sistemsko testiranje koristi se za provjeru kompletnog sistema kao jedne funkcionalne cjeline. Na ovom nivou testiraju se glavni i alternativni tokovi rada kroz aplikaciju kako bi se potvrdilo da svi moduli zajedno ispravno podržavaju poslovni proces.

U okviru ovog projekta sistemsko testiranje obuhvata:
- glavni tok od registracije korisnika i prijave zahtjeva do zatvaranja intervencije
- dispečersku obradu zahtjeva, određivanje prioriteta i dodjelu izvršioca
- serviserski tok rada, uključujući prihvatanje zadatka, ažuriranje statusa i evidentiranje rada
- alternativne scenarije, kao što su izmjena i otkazivanje zahtjeva, odbijanje zadatka, promjena izvršioca i vraćanje zadatka na ponovnu dodjelu

### Prihvatno testiranje

Prihvatno testiranje koristi se za provjeru da li razvijeni sistem ispunjava zahtjeve definisane user storyjima i acceptance kriterijima te da li odgovara stvarnim potrebama korisnika. Ovaj nivo testiranja posebno je važan jer potvrđuje da sistem nije samo tehnički ispravno implementiran, nego i funkcionalno prikladan za upotrebu u predviđenom kontekstu.

U okviru ovog projekta prihvatno testiranje obuhvata provjeru:
- da li korisnik usluge može uspješno prijaviti i pratiti zahtjev
- da li dispečer može pregledati, obraditi i dodijeliti intervenciju
- da li serviser može preuzeti zadatak, evidentirati rad i ažurirati tok izvršenja
- da li administrator može upravljati internim korisnicima i pravima pristupa
- da li sistem u cjelini podržava predviđeni poslovni proces i potrebe svih relevantnih korisničkih uloga

### Tabelarni pregled nivoa testiranja

| Nivo testiranja | Svrha | Šta se testira u projektu |
|-----------------|-------|---------------------------|
| **Unit testiranje** | Provjera pojedinačnih funkcija, pravila i logičkih cjelina | validacija unosa, logika prioriteta, pravila prelaza statusa, osnovne provjere prava pristupa, pomoćne funkcije |
| **Integraciono testiranje** | Provjera saradnje povezanih modula i razmjene podataka | registracija i prijava sa bazom, prijava zahtjeva i evidentiranje, prikaz zahtjeva korisniku i dispečeru, dodjela zadatka serviseru, evidentiranje i pregled rada |
| **Sistemsko testiranje** | Provjera kompletnog sistema kao jedne funkcionalne cjeline | glavni tok od prijave zahtjeva do zatvaranja intervencije, dispečerska obrada, serviserski tok rada, alternativni scenariji |
| **Prihvatno testiranje** | Provjera usklađenosti sistema sa zahtjevima, user storyjima i potrebama korisnika | podrška radu korisnika usluge, dispečera, servisera i administratora, kao i usklađenost sa predviđenim poslovnim procesom |

Kombinovanjem navedenih nivoa testiranja nastoji se osigurati da sistem bude tehnički ispravan, međusobno usklađen i funkcionalno prikladan za stvarnu upotrebu u okviru predviđenog poslovnog procesa.

## Dodatne vrste testiranja 

Pored navedenih nivoa testiranja, u okviru projekta primjenjuju se i dodatne vrste testiranja koje predstavljaju poseban fokus provjere kvaliteta.

### Regresijsko testiranje

Regresijsko testiranje koristi se za provjeru da nove izmjene i funkcionalnosti nisu narušile ispravnost dijelova sistema koji su ranije implementirani. Ovo je posebno važno u agilnom načinu razvoja, gdje se sistem proširuje postepeno i gdje svaka nova izmjena može uticati na postojeće funkcionalnosti.

U okviru ovog projekta regresijsko testiranje provodi se nakon uvođenja novih funkcionalnosti i obuhvata provjeru ključnih ranije implementiranih tokova, posebno:
- autentifikacije i pristupa sistemu
- prijave i pregleda zahtjeva
- dispečerskog pregleda i dodjele
- serviserskog rada na zadatku
- zatvaranja intervencije

### Testiranje korisničkog interfejsa (UI testiranje)

Testiranje korisničkog interfejsa koristi se za provjeru ispravnosti i preglednosti korisničkog interfejsa. Na ovom nivou provjerava se da li forme, prikazi, poruke i osnovna navigacija funkcionišu ispravno i da li su razumljivi korisnicima različitih uloga.

U okviru ovog projekta testiranje korisničkog interfejsa obuhvata:
- formu za registraciju i prijavu korisnika
- formu za prijavu zahtjeva
- pregled zahtjeva i intervencija
- prikaz poruka o grešci i validacijskih upozorenja
- pregled statusa, detalja i napomena
- osnovnu preglednost i upotrebljivost interfejsa za korisnike usluge, dispečera, servisera i administratora

### Sigurnosno testiranje
Sigurnosno testiranje koristi se za provjeru zaštite sistema, korisničkih naloga, sesija i prava pristupa. Njegov cilj je potvrditi da neovlašteni korisnici ne mogu pristupiti funkcionalnostima i podacima koji im ne pripadaju, te da autentifikacija i autorizacija rade ispravno.

U okviru ovog projekta sigurnosno testiranje obuhvata:
- provjeru autentifikacije i upravljanja sesijom
- provjeru pristupa funkcionalnostima prema korisničkoj ulozi
- provjeru zabrane pristupa tuđim zahtjevima i intervencijama
- provjeru sigurnosti osjetljivih operacija nad korisničkim nalozima i podacima

### Testiranje upotrebljivosti
Testiranje upotrebljivosti koristi se za provjeru da li je sistem razumljiv, pregledan i praktičan za korištenje različitim korisničkim ulogama. Fokus nije samo na tehničkoj ispravnosti, nego i na tome da li korisnici mogu lako razumjeti prikazane informacije i izvršiti potrebne akcije bez zabune.

U okviru ovog projekta testiranje upotrebljivosti obuhvata:
- razumljivost formi i poruka sistema
- preglednost lista, detaljnih prikaza i statusa
- jasnoću akcija za dispečera, servisera, administratora i korisnika usluge
- praktičnost osnovnih tokova rada kroz sistem

### Testiranje nefunkcionalnih zahtjeva

Pored funkcionalnih zahtjeva, u okviru ovog projekta provjerava se i ispunjenost nefunkcionalnih zahtjeva definisanih za performanse, pouzdanost, sigurnost, upotrebljivost, portabilnost i održivost sistema. Ovi zahtjevi ne provjeravaju se kroz jedan poseban nivo testiranja, nego kroz kombinaciju više nivoa i dodatnih vrsta testiranja, u zavisnosti od njihove prirode.

Zahtjevi vezani za performanse i efikasnost provjeravaju se kroz sistemsko testiranje i po potrebi, dodatna mjerenja odziva i opterećenja, posebno za učitavanje ključnih ekrana i vrijeme odgovora API poziva. Pouzdanost sistema provjerava se kroz testiranje dostupnosti, zaštite potvrđenih podataka i validnosti backup mehanizama. Sigurnosni zahtjevi provjeravaju se kroz sigurnosno, integraciono i sistemsko testiranje, posebno u dijelu autentifikacije, autorizacije, upravljanja sesijom, zaštite pristupa podacima i šifrovanja komunikacije.

Zahtjevi upotrebljivosti provjeravaju se kroz UI testiranje i testiranje upotrebljivosti, s fokusom na broj koraka, intuitivnost korištenja i responzivnost interfejsa. Portabilnost sistema provjerava se testiranjem u podržanim preglednicima i na različitim veličinama ekrana, dok se održivost procjenjuje kroz code review, modularnost arhitekture i usklađenost dokumentacije sa implementacijom.

Na ovaj način testiranje obuhvata ne samo provjeru funkcionalne ispravnosti sistema, nego i provjeru da li sistem ispunjava kvalitetne karakteristike definisane nefunkcionalnim zahtjevima.

Pored formalno izdvojenih vrsta testiranja, pojedini nefunkcionalni zahtjevi provjeravaju se i kroz specifične metode kao što su mjerenje performansi, load testiranje, pregled dokumentacije i code review.

### Povezanost vrsta i aspekata testiranja sa nivoima testiranja

Dodatne vrste testiranja ne predstavljaju zaseban nivo testiranja, nego se provode unutar jednog ili više nivoa, u zavisnosti od toga šta se provjerava i koji je fokus testiranja.

| Vrsta / aspekt testiranja | Unit | Integraciono | Sistemsko | Prihvatno |
|---------------------------|------|--------------|-----------|-----------|
| **Funkcionalno testiranje** | ✓ | ✓ | ✓ | ✓ |
| **Regresijsko testiranje** | ✓ | ✓ | ✓ | ✓ |
| **Testiranje korisničkog interfejsa** |  | ✓ | ✓ | ✓ |
| **Sigurnosno testiranje** | ✓ | ✓ | ✓ | ✓ |
| **Testiranje upotrebljivosti** |  |  | ✓ | ✓ |
| **Testiranje performansi i pouzdanosti** |  | ✓ | ✓ |  |
| **Testiranje portabilnosti** |  |  | ✓ | ✓ |
| **Testiranje održivosti** | ✓ | ✓ |  |  |

### Provjera rješenja razvijenih uz podršku AI alata

S obzirom na intenzivno korištenje AI alata u razvoju sistema tokom sprintova 5 do 11, poseban fokus testiranja stavlja se i na provjeru rješenja koja su djelimično ili u potpunosti nastala uz podršku AI alata. Tim ne prihvata AI-generisana rješenja bez dodatne provjere, nego ih verifikuje kroz ručni pregled, poređenje sa zahtjevima, user storyjima, acceptance kriterijima i poslovnim pravilima, kao i kroz odgovarajuće nivoe testiranja.

Na taj način osigurava se da AI-podržana implementacija nije samo tehnički uvjerljiva, nego i stvarno ispravna, korisna i usklađena sa potrebama sistema. Odgovornost za ispravnost implementacije zadržava tim, bez obzira na to da li je određeno rješenje nastalo ručno ili uz podršku AI alata.
  
## Šta se testira na kojem nivou

Nakon definisanja nivoa i dodatnih vrsta testiranja, potrebno je jasno odrediti koje funkcionalnosti i aspekti sistema se provjeravaju na kojem nivou. Time se osigurava da testiranje bude direktno povezano sa konkretnim dijelovima sistema i stvarnim poslovnim tokom servisnih intervencija.

### Tabelarni pregled funkcionalnosti i nivoa / vrsta testiranja

| Funkcionalnost / cjelina | Unit | Integraciono | Sistemsko | Prihvatno | Regresijsko | UI | Sigurnosno | Upotrebljivost |
|--------------------------|------|--------------|-----------|-----------|-------------|----|------------|----------------|
| Autentifikacija i pristup sistemu | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |  |
| Upravljanje korisnicima, ulogama i pravima pristupa | ✓ | ✓ | ✓ | ✓ | ✓ |  | ✓ |  |
| Prijava i pregled zahtjeva korisnika usluge | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |  | ✓ |
| Izmjena i otkazivanje zahtjeva | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |  | ✓ |
| Dispečerski pregled i obrada intervencija | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |  | ✓ |
| Određivanje prioriteta intervencije | ✓ | ✓ | ✓ | ✓ | ✓ |  |  |  |
| Dodjela i organizacija izvršenja intervencije |  | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Planiranje intervencije | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |  | ✓ |
| Pregled i preuzimanje zadataka od strane servisera |  | ✓ | ✓ | ✓ | ✓ | ✓ |  | ✓ |
| Ažuriranje toka rada na terenu | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |  | ✓ |
| Evidentiranje i pregled izvršenog rada | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |  | ✓ |
| Zatvaranje intervencije |  | ✓ | ✓ | ✓ | ✓ | ✓ |  | ✓ |
| Komunikacija na intervenciji |  | ✓ | ✓ | ✓ | ✓ | ✓ |  | ✓ |
| Praćenje historije aktivnosti |  | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |  |


**Autentifikacija i pristup sistemu** testiraju se kroz više nivoa jer obuhvataju validaciju unosa, vezu sa bazom podataka, upravljanje sesijom, prikaz formi i sigurnost pristupa prema korisničkim ulogama.

**Upravljanje korisnicima, ulogama i pravima pristupa** zahtijeva provjeru poslovnih pravila dodjele uloga, stvarnog ograničenja pristupa i sigurnosti administratorskih operacija.

**Prijava, izmjena i otkazivanje zahtjeva** testiraju se zbog validacije unosa, pravilnog spremanja podataka, prikaza korisniku i logike dozvoljenih promjena u zavisnosti od faze obrade.

**Dispečerski pregled, obrada, određivanje prioriteta, dodjela i planiranje intervencije** testiraju se kao jezgro operativnog toka sistema, jer direktno utiču na organizaciju izvršenja i tok rada svih narednih koraka.

**Serviserski tok rada**, uključujući pregled zadataka, prihvatanje ili odbijanje zadatka, ažuriranje statusa i evidentiranje izvršenog rada, testira se kako bi se osiguralo da sistem pravilno podržava rad na terenu i razmjenu informacija sa dispečerom.

**Zatvaranje intervencije, napomene i historija aktivnosti** testiraju se radi provjere završnog dijela procesa, transparentnosti rada i dosljedne evidencije svih važnih promjena nad intervencijom.


## Veza sa acceptance kriterijima

Testiranje u okviru ovog projekta direktno se oslanja na acceptance kriterije definisane uz user storyje. Acceptance kriteriji predstavljaju konkretne uslove koje funkcionalnost mora ispuniti da bi se smatrala prihvatljivo implementiranom, te zbog toga služe kao osnova za planiranje i provođenje testiranja.

Veza između testiranja i acceptance kriterija važna je jer osigurava jasnu povezanost između zahtjeva, implementacije i provjere kvaliteta. Na taj način testiranje nije zasnovano samo na opštoj procjeni da li funkcionalnost „radi“, nego na jasno definisanim uslovima koji opisuju očekivano ponašanje sistema u različitim situacijama.

U okviru ovog projekta acceptance kriteriji se koriste za:
- definisanje testnih scenarija
- određivanje očekivanih rezultata testiranja
- provjeru da li je user story u potpunosti ispunjen
- povezivanje funkcionalnosti sa odgovarajućim nivoima testiranja

Pojedini acceptance kriteriji mogu se provjeravati na više nivoa testiranja, u zavisnosti od njihove prirode. Na primjer, kriteriji koji se odnose na validaciju unosa mogu biti predmet unit i UI testiranja, dok kriteriji koji opisuju tok rada između više korisničkih uloga češće pripadaju integracionom, sistemskom i prihvatnom testiranju.

### Tabelarni pregled veze sa acceptance kriterijima

| ID storyja | Acceptance kriterij | Nivo / vrsta testiranja | Način provjere | Očekivani rezultat |
|------------|---------------------|-------------------------|----------------|--------------------|
| **US-01** | Korisnik može uspješno kreirati nalog unosom validnih podataka | Unit, integraciono, sistemsko, UI | test validacije unosa, kreiranja naloga i prikaza forme | korisnički nalog je uspješno kreiran |
| **US-02** | Registrovani korisnik može uspješno prijaviti u sistem sa ispravnim kredencijalima | Integraciono, sistemsko, UI, sigurnosno | test autentifikacije, sesije i pristupa sistemu | korisnik dobija pristup sistemu u skladu sa svojom ulogom |
| **US-03** | Prijavljeni korisnik može uspješno završiti sesiju odjavom iz sistema | Sistemsko, UI | test odjave i prekida sesije | korisnička sesija je prekinuta i pristup bez ponovne prijave nije moguć |
| **US-04** | Korisnicima su dostupne samo funkcionalnosti i podaci koji odgovaraju njihovoj ulozi | Sistemsko, prihvatno, sigurnosno | test autorizacije i vidljivosti funkcionalnosti | korisnik vidi i koristi samo dozvoljene funkcionalnosti |
| **US-05** | Korisnik usluge može uspješno prijaviti zahtjev za servisnu intervenciju | Unit, integraciono, sistemsko, prihvatno, UI | test validacije unosa, spremanja zahtjeva i dodjele početnog statusa | zahtjev je evidentiran, povezan sa korisnikom i dobija početni status |
| **US-06** | Korisnik usluge može pregledati vlastite zahtjeve i njihove statuse | Sistemsko, UI | test prikaza liste i detalja zahtjeva | korisnik vidi svoje zahtjeve i njihove osnovne informacije |
| **US-07** | Dispečer može pregledati otvorene i aktivne intervencije | Sistemsko, UI | test prikaza liste intervencija | prikazane su otvorene i aktivne intervencije sa ključnim podacima |
| **US-08** | Dispečer može pregledati detalje pojedinačne intervencije | Sistemsko, UI | test prikaza detaljnog pregleda intervencije | prikazani su svi relevantni podaci o odabranoj intervenciji |
| **US-09** | Dispečer može dodijeliti intervenciju glavnom izvršiocu | Integraciono, sistemsko, prihvatno | test dodjele izvršioca i promjene statusa | intervencija je uspješno dodijeljena odgovornom izvršiocu |
| **US-10** | Dispečer može dodijeliti intervenciju timu servisera | Integraciono, sistemsko, prihvatno | test timske dodjele i prikaza članova tima | intervencija je uspješno dodijeljena odabranom timu servisera |
| **US-11** | Dispečer može planirati termin izvršenja intervencije | Unit, integraciono, sistemsko, UI | test unosa termina i provjere ograničenja planiranja | termin je uspješno postavljen i vidljiv u sistemu |
| **US-12** | Dispečer može odrediti prioritet intervencije | Unit, integraciono, sistemsko | test logike određivanja prioriteta i prikaza prioriteta | prioritet je uspješno spremljen i prikazan u relevantnim pregledima |
| **US-13** | Dispečer može pregledati statuse intervencija | Sistemsko, UI | test prikaza statusa i osvježavanja liste | prikazani su tačni i ažurirani statusi intervencija |
| **US-14** | Serviser može ažurirati status intervencije u skladu sa pravilima toka rada | Unit, integraciono, sistemsko, UI | test promjene statusa i dozvoljenih prelaza između statusa | status je ispravno ažuriran i odražava stvarni tok rada |
| **US-15** | Serviser može pregledati svoje dodijeljene intervencije | Sistemsko, UI | test prikaza liste zadataka | serviser vidi samo svoje dodijeljene intervencije |
| **US-16** | Serviser može pregledati detalje zadatka na terenu | Sistemsko, UI | test prikaza detalja zadatka | prikazani su opis, lokacija, prioritet i ostale relevantne informacije |
| **US-17** | Serviser može evidentirati izvršeni rad na intervenciji | Unit, integraciono, sistemsko, UI | test unosa evidencije rada i povezivanja sa intervencijom | podaci o izvršenom radu su uspješno spremljeni i povezani sa intervencijom |
| **US-18** | Administrator može kreirati interni korisnički nalog | Sistemsko, sigurnosno | test administratorske funkcionalnosti kreiranja korisnika | interni korisnik je uspješno kreiran |
| **US-19** | Administrator može pregledati postojeće korisničke naloge | Sistemsko, UI | test prikaza liste korisnika | prikazana je lista postojećih korisničkih naloga sa osnovnim informacijama |
| **US-20** | Administrator može promijeniti korisničku ulogu | Sistemsko, sigurnosno | test izmjene uloge i ažuriranja pristupa | korisniku je dodijeljena nova uloga i pristup je ažuriran |
| **US-21** | Administrator može deaktivirati korisnički nalog | Sistemsko, sigurnosno | test promjene statusa naloga i zabrane pristupa | korisnički nalog je deaktiviran i dalja prijava nije moguća |
| **US-22** | Serviser može prihvatiti dodijeljeni zadatak | Integraciono, sistemsko | test prihvatanja zadatka i promjene statusa | zadatak je prihvaćen i status je ispravno ažuriran |
| **US-23** | Serviser može odbiti dodijeljeni zadatak | Integraciono, sistemsko | test odbijanja zadatka i evidentiranja razloga odbijanja | zadatak je odbijen, a informacija je proslijeđena za dalju obradu |
| **US-24** | Dispečer može pregledati evidentirani izvršeni rad | Sistemsko, UI | test prikaza evidencije rada | dispečer vidi unesene podatke o izvršenom radu |
| **US-25** | Dispečer može potvrditi i zatvoriti intervenciju nakon ispunjavanja definisanih uslova | Sistemsko, prihvatno | test zatvaranja intervencije nakon završetka rada | intervencija dobija završni status tek nakon potpune evidencije rada |
| **US-26** | Korisnik usluge može izmijeniti vlastiti zahtjev kada je to dozvoljeno | Sistemsko, UI | test izmjene zahtjeva u dozvoljenoj fazi procesa | podaci zahtjeva su uspješno ažurirani |
| **US-27** | Korisnik usluge može otkazati vlastiti zahtjev kada je to dozvoljeno | Sistemsko | test otkazivanja zahtjeva i promjene statusa | zahtjev dobija odgovarajući status otkazivanja |
| **US-28** | Dispečer može promijeniti izvršioca intervencije | Integraciono, sistemsko | test preraspodjele izvršioca | novi izvršilac je uspješno dodijeljen intervenciji |
| **US-29** | Dispečer može vratiti zadatak na ponovnu dodjelu | Integraciono, sistemsko | test vraćanja zadatka u operativni tok | zadatak je vraćen u odgovarajuću fazu ponovne dodjele |
| **US-30** | Učesnici procesa mogu razmjenjivati napomene na intervenciji | Sistemsko, UI | test unosa i prikaza napomena | napomena je uspješno spremljena i vidljiva na intervenciji |
| **US-31** | Dispečer može pregledati sažeti operativni status intervencija na kontrolnoj tabli | Sistemsko, UI | test prikaza kontrolne table i operativnog statusa | prikazan je tačan i pregledan operativni status intervencija |
| **US-32** | Ovlašteni korisnik može pregledati historiju aktivnosti intervencije | Sistemsko, UI | test audit traga i prikaza historije aktivnosti | prikazana je hronološka historija aktivnosti i promjena |
| **US-44** | Tabelarni pregled historije aktivnosti | Sistemsko, UI | test toggle tabele/timeline i kolona polje/stara/nova vrijednost | tabela prikazuje audit zapise s autorom i ulogom |
| **US-45** | SLA eskalacije | Integraciono, sistemsko | test batch eskalacije i notifikacije dispečeru | prekoračen SLA generiše aktivnost i obavijest (cooldown) |
| **US-46** | Evidencija materijala i dijelova | Unit, integraciono, UI | test JSONB stavki u evidenciji rada | stavke (naziv, količina, jedinica) spremljene i vidljive |
| **US-47** | Praćenje intervencije nije riješene iz prve | Integraciono, UI | test brojača ponovnog ciklusa i badge-a | broj ciklusa raste na vrati/nije riješeno; KPI reflektira |

### Veza testiranja sa nefunkcionalnim zahtjevima
| ID zahtjeva | Oblast | Šta se provjerava | Nivo / vrsta testiranja | Način provjere | Očekivani rezultat |
|-------------|--------|-------------------|-------------------------|----------------|--------------------|
| NFR-001 | Performanse | Vrijeme učitavanja pregleda aktivnih intervencija | Sistemsko, performansno | mjerenje učitavanja ključnog ekrana | ekran se učitava unutar definisanog vremenskog ograničenja |
| NFR-002 | Performanse | Vrijeme odgovora API poziva | Integraciono, sistemsko | mjerenje odziva API-ja za GET, POST i PATCH operacije | prosječno vrijeme odgovora ostaje unutar definisane granice |
| NFR-003 | Performanse | Ponašanje sistema pod opterećenjem | Sistemsko, performansno | load testiranje sa većim brojem paralelnih korisnika | sistem zadržava prihvatljiv odziv pri definisanom opterećenju |
| NFR-004 | Pouzdanost | Dostupnost sistema u radnom vremenu | Sistemsko | praćenje uptime-a i evidencija prekida rada | sistem ostaje dostupan u definisanom procentu vremena |
| NFR-005 | Pouzdanost | Očuvanje potvrđenih podataka | Integraciono, sistemsko | simulacija pada nakon potvrđenog zapisa | potvrđeni zapis nije izgubljen |
| NFR-006 | Pouzdanost | Ispravnost i dostupnost backup-a | Sistemsko | provjera backup konfiguracije i testna restauracija | backup postoji i može se uspješno vratiti |
| NFR-007 | Sigurnost | Hashiranje lozinki | Sigurnosno, integraciono | provjera načina pohrane lozinki | lozinke nisu pohranjene u čitljivom obliku |
| NFR-008 | Sigurnost | Istek sesije nakon neaktivnosti | Sigurnosno, sistemsko | testiranje isteka sesije i pristupa zaštićenim rutama | neaktivna sesija postaje nevažeća u definisanom roku |
| NFR-009 | Sigurnost | Odbijanje neovlaštenog pristupa i logovanje pokušaja | Sigurnosno, sistemsko | testiranje pristupa sa različitim korisničkim ulogama | pristup je odbijen, a pokušaj evidentiran |
| NFR-010 | Sigurnost | HTTPS komunikacija i redirekcija sa HTTP-a | Sigurnosno, sistemsko | provjera protokola i redirekcije | sva komunikacija koristi HTTPS |
| NFR-011 | Upotrebljivost | Broj koraka za ažuriranje statusa intervencije | UI, upotrebljivost | korisničko testiranje serviserskog toka | zadatak se izvršava unutar definisanog broja koraka |
| NFR-012 | Upotrebljivost | Intuitivnost prijave kvara za novog korisnika | UI, upotrebljivost, prihvatno | korisničko testiranje bez prethodne obuke | novi korisnik može prijaviti kvar u definisanom vremenu |
| NFR-013 | Upotrebljivost | Responzivnost i preglednost interfejsa | UI, upotrebljivost | vizualna provjera na više rezolucija | interfejs ostaje čitljiv i funkcionalan |
| NFR-014 | Portabilnost | Ispravnost rada u podržanim preglednicima | Sistemsko, UI | testiranje ključnih tokova u više browsera | funkcionalnost i prikaz ostaju dosljedni |
| NFR-015 | Portabilnost | Rad bez dodatne instalacije | Sistemsko | testiranje pristupa sistemu na čistom uređaju / profilu | sistem radi bez dodatnih plugina i instalacija |
| NFR-016 | Održivost | Modularnost i niska povezanost modula | Unit, integraciono, code review | pregled promjena i analiza uticaja izmjena | izmjene jednog modula ne zahtijevaju izmjene nepovezanih modula |
| NFR-017 | Održivost | Dokumentovanost API ruta | Integraciono, code review | pregled API dokumentacije i implementacije | dokumentacija odgovara stvarnom stanju implementacije |

## Način evidentiranja rezultata testiranja

Rezultati testiranja evidentiraju se na sistematičan, pregledan i dosljedan način kako bi tim u svakom trenutku imao jasan uvid u to šta je testirano, kakav je bio ishod testiranja, koje su greške uočene i da li su one naknadno otklonjene.

Za svaki izvršeni test bilježe se:
- identifikator testa
- funkcionalnost ili modul koji se testira
- kratak opis testnog scenarija
- sprint ili faza u kojoj je test izvršen
- datum testiranja
- osoba koja je izvršila testiranje
- očekivani rezultat
- stvarni rezultat
- status testa
- dodatna napomena

### Obrazac za evidentiranje rezultata testiranja

| ID testa | Funkcionalnost / modul | Opis testa | Sprint / faza | Datum testiranja | Izvršilac testiranja | Očekivani rezultat | Stvarni rezultat | Status testa | Napomena |
|----------|------------------------|------------|---------------|------------------|----------------------|--------------------|------------------|--------------|----------|
| TC-01 |  |  |  |  |  |  |  |  |  |

### Status testa

| Oznaka | Značenje |
|--------|----------|
| **Prošao** | funkcionalnost radi u skladu sa očekivanim rezultatom |
| **Nije prošao** | uočen je problem ili odstupanje od očekivanog rezultata |
| **Djelimično prošao** | dio funkcionalnosti radi ispravno, ali postoje određena ograničenja ili nedostaci |
| **Nije testirano** | test još nije izvršen |

Kada rezultat testiranja ukaže na problem, pored osnovnog rezultata testiranja evidentira se i uočena greška. Time se osigurava da rezultati testiranja ne ostanu samo na nivou konstatacije da nešto ne radi, nego da služe kao osnova za dalje otklanjanje problema i unapređenje sistema.

Za svaku uočenu grešku bilježe se:
- identifikator greške
- povezani identifikator testa
- funkcionalnost ili modul u kojem je greška uočena
- kratak opis greške
- prioritet greške
- status greške
- sprint ili faza u kojoj je greška uočena
- dodatna napomena o planiranoj doradi ili ispravci

### Obrazac za evidentiranje uočenih grešaka

| ID greške | Povezani ID testa | Funkcionalnost / modul | Opis greške | Prioritet greške | Status greške | Sprint / faza | Napomena |
|-----------|-------------------|------------------------|-------------|------------------|---------------|---------------|----------|
| B-01 |  |  |  |  |  |  |  |

### Prioritet greške

| Kategorija | Opis |
|------------|------|
| **Nizak** | greška ne blokira osnovni tok rada i ima manji uticaj na korištenje sistema |
| **Srednji** | greška otežava korištenje funkcionalnosti, ali ne blokira cijeli proces |
| **Visok** | greška značajno narušava rad sistema ili blokira važan dio procesa |
| **Kritičan** | greška onemogućava izvršavanje ključnog toka rada ili ozbiljno ugrožava ispravnost sistema |

### Status greške

| Oznaka | Značenje |
|--------|----------|
| **Otvorena** | greška je evidentirana i čeka obradu |
| **U obradi** | radi se na otklanjanju greške |
| **Ispravljena** | greška je otklonjena i spremna za ponovnu provjeru |
| **Zatvorena** | greška je potvrđeno otklonjena i više nije prisutna |



## Glavni rizici kvaliteta

Pored tehničkih i organizacijskih rizika koji se prate kroz Risk Register, u okviru test strategije posebno je važno prepoznati i rizike kvaliteta, odnosno one situacije u kojima sistem može formalno biti implementiran, ali i dalje ne pružati očekivani nivo ispravnosti, dosljednosti, sigurnosti i upotrebljivosti.

Rizici kvaliteta u ovom projektu najviše se odnose na ispravnost prava pristupa, konzistentnost podataka između korisničkih uloga, tačnost statusnog toka intervencije, validaciju unosa, logiku dodjele zadataka, evidentiranje rada i pouzdanost završnih koraka procesa.

### Tabelarni pregled glavnih rizika kvaliteta

| ID | Rizik kvaliteta | Opis rizika | Moguće posljedice | Strategija mitigacije |
|----|-----------------|-------------|-------------------|-----------------------|
| QR-01 | Pogrešna prava pristupa | Korisnik vidi podatke koje ne bi smio vidjeti ili ima funkcionalnosti koje ne bi smio imati | sigurnosni i funkcionalni problem, narušena kontrola pristupa | testiranje po korisničkim ulogama i sigurnosno testiranje |
| QR-02 | Nekonzistentan prikaz podataka | Različiti korisnici vide različite, neažurne ili netačne podatke o istoj intervenciji | nepouzdani podaci i pogrešne operativne odluke | integraciono i sistemsko testiranje prikaza i razmjene podataka |
| QR-03 | Neispravan tok statusa intervencije | Status intervencije ne prati stvarni tok rada ili dozvoljava nedozvoljene prelaze | pogrešno praćenje procesa i zabuna u radu korisnika | testiranje scenarija promjene statusa i dozvoljenih prelaza |
| QR-04 | Greške pri dodjeli i preraspodjeli zadataka | Dodjela izvršioca, promjena izvršioca ili vraćanje zadatka ne rade ispravno | kašnjenje u izvršenju zadataka i nejasna odgovornost | integraciono i sistemsko testiranje dodjele i preraspodjele |
| QR-05 | Neispravna validacija unosa | Sistem prihvata neispravne, nepotpune ili nelogične podatke | greške u obradi i loš kvalitet podataka | unit i UI testiranje validacije unosa |
| QR-06 | Problemi sa autentifikacijom i pristupom | Korisnik se ne može prijaviti ili pristup nije pravilno ograničen | onemogućen rad sistema ili sigurnosni rizik | testiranje prijave, sesije, prava pristupa i sigurnosno testiranje |
| QR-07 | Gubitak ili neispravno spremanje podataka | Podaci se ne spremaju ispravno ili se gube tokom rada | gubitak informacija i narušena pouzdanost sistema | integraciono i sistemsko testiranje spremanja i prikaza podataka |
| QR-08 | Loš prikaz u korisničkom interfejsu | Podaci, poruke ili akcije nisu dovoljno jasno prikazani korisniku | loše korisničko iskustvo i povećan broj grešaka u radu | UI testiranje i testiranje upotrebljivosti |
| QR-09 | Neispravno planiranje termina | Sistem dozvoljava nevalidne ili nelogične termine intervencije | konflikti u organizaciji rada i otežano izvršenje intervencija | unit, integraciono i sistemsko testiranje planiranja |
| QR-10 | Neispravno evidentiranje rada | Podaci o izvršenom radu nisu potpuni, tačni ili dosljedno povezani sa intervencijom | netačni izvještaji i otežano zatvaranje intervencije | testiranje unosa, spremanja i pregleda evidencije rada |
| QR-11 | Slabe performanse pri većoj količini podataka | Sistem postaje spor pri radu sa listama, statusima ili historijom aktivnosti | loše korisničko iskustvo i otežan operativni rad | sistemsko testiranje prikaza i provjera odziva ključnih dijelova sistema |

