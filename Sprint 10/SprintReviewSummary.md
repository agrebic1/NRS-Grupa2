# Sprint Review Summary

### Sprint broj 10

### Planirani sprint goal

Finalizirati i stabilizirati aplikaciju pred predaju kroz nadogradnju već kompletnog MVP toka, dodavanje geo-preporuke servisera po blizini, analitičkog dashboarda sa grafovima, responsive i accessibility poboljšanja, te završno usklađivanje dokumentacije, migracija i demo pripreme.

Sprint 10 nije bio usmjeren na dovršavanje osnovnog MVP-a, jer su korisničke priče US-01 do US-47 već implementirane u prethodnim sprintovima. Fokus ovog sprinta bio je podizanje kvaliteta, operativne vrijednosti i prezentacijske spremnosti sistema kroz korisničke priče US-48, US-49 i US-50, uz dodatnu stabilizaciju, testiranje i tehničko sređivanje aplikacije.

Za razliku od prethodnog sprinta, gdje je primarni cilj bio funkcionalno zatvaranje kompletnog operativnog toka sistema servisnih intervencija, Sprint 10 imao je karakter završnog unapređenja sistema. Cilj sprinta bio je da aplikacija postane preglednija, stabilnija, responzivnija i spremnija za završnu demonstraciju i predaju.

---

## Šta je završeno

Planirane aktivnosti koje su završene u ovom sprintu su:

- implementirana geo-preporuka servisera po blizini lokacije intervencije (US-48)
- dodata bazna lokacija servisera kroz korisnički profil i administrativno uređivanje
- implementiran izračun udaljenosti između lokacije zahtjeva i bazne lokacije servisera
- proširena logika preporuke servisera faktorom blizine
- implementiran fallback mehanizam za slučajeve kada lokacijski podaci nisu dostupni
- prikazana udaljenost servisera i oznaka najbližeg servisera u procesu dodjele intervencije
- implementiran analitički dashboard sa KPI metrikama i grafovima (US-49)
- prikazane metrike vezane za statuse intervencija, SLA stanje, odziv servisera, trajanje intervencija i opterećenost servisera
- omogućeno filtriranje dashboard podataka po vremenskom periodu
- implementirana loading, empty i error stanja na dashboard ekranima
- izvršena responsive unapređenja ključnih serviserskih i dispečerskih ekrana (US-50)
- uklonjen horizontalni scroll na manjim rezolucijama
- unaprijeđene kartice intervencija, spacing, badgevi i vizuelna konzistentnost sistema
- implementirana accessibility poboljšanja kroz aria oznake, vidljiv fokus i bolji kontrast
- popravljeni e2e RBAC testovi
- izvršena provjera i stabilizacija sigurnosnih provjera pristupa
- uklonjen mrtvi SLA kod i usklađena logika prioriteta sa SLA pravilima
- izvršeno repo-wide formatiranje koda
- primijenjene migracije vezane za baznu lokaciju servisera
- usklađena i dopunjena projektna dokumentacija
- izvršena završna demo priprema sistema

Pored implementacije novih funkcionalnosti, značajan dio rada bio je usmjeren na:

- stabilizaciju postojećeg sistema
- provjeru konzistentnosti podataka i poslovne logike
- uklanjanje tehničkog duga
- dodatno testiranje postojećih funkcionalnosti
- provjeru sigurnosnih pravila i RBAC zaštite
- usklađivanje dokumentacije sa stvarnim stanjem sistema
- završno UX i UI poliranje aplikacije

Sprint 10 predstavljao je završni korak transformacije sistema iz funkcionalnog MVP-a u stabilnu i prezentacijski spremnu aplikaciju.

---

## Šta nije završeno

Sve planirane stavke definisane Sprint Backlogom Sprinta 10 su uspješno završene.

---

## Demonstrirane funkcionalnosti ili artefakti

U ovom sprintu demonstrirane su sljedeće funkcionalnosti i artefakti:

- Sprint Backlog Sprinta 10
- geo-preporuka servisera po blizini lokacije intervencije
- bazna lokacija servisera
- prikaz udaljenosti servisera od lokacije intervencije
- oznaka najbližeg servisera
- fallback logika za nedostajuće lokacijske podatke
- analitički dashboard sa grafovima
- KPI kartice operativnog stanja sistema
- pregled SLA metrika
- pregled odziva i trajanja intervencija
- pregled opterećenosti servisera
- filtriranje dashboard podataka po periodu
- loading, empty i error stanja
- responsive prikaz serviserskih i dispečerskih ekrana
- accessibility unapređenja
- popravljeni e2e RBAC testovi
- usklađena SLA logika
- primijenjene migracije i sigurnosne provjere

---

## Ključne odluke donesene u sprintu

- Geo-preporuka servisera uvedena je kao pomoć pri dodjeli intervencija, ali ne zamjenjuje odluku dispečera. Konačna odluka o dodjeli ostaje na korisniku sistema.
- Za izračun udaljenosti između servisera i lokacije intervencije usvojena je logika bazne lokacije servisera, uz fallback mehanizam za slučajeve kada lokacijski podaci nisu dostupni.
- Analitički dashboard koristi postojeće poslovne podatke i SLA pravila kako bi se osigurala konzistentnost između operativnih pregleda i izvještaja.
- KPI pokazatelji i grafovi implementirani su kao podrška donošenju odluka, a ne kao zamjena za detaljne operativne preglede intervencija.
- Responsive i accessibility unapređenja fokusirana su na najčešće korištene korisničke tokove kako bi se postigao najveći efekat uz ograničeno vrijeme sprinta.
- Loading, empty i error stanja uvedena su kao standardni dio korisničkog iskustva na novim i postojećim ekranima.
- Uklonjen je dio tehničkog duga vezan za RBAC testove, SLA logiku i nekonzistentnosti u kodu kako bi sistem bio stabilniji za završnu demonstraciju.
- Posebna pažnja posvećena je usklađivanju dokumentacije sa stvarnim stanjem implementacije kako bi se izbjegli problemi uočeni tokom prethodnog sprinta.

---

## Povratna informacija Product Ownera

Product Owner je tokom sprint review prezentacije detaljno prošao kroz kompletnu aplikaciju i izrazio zadovoljstvo urađenim poslom. Posebno je istakao da mu se dopada cjelokupan koncept sistema, način na koji su povezani poslovni procesi, preglednost aplikacije, kao i vizuelni izgled i organizacija korisničkog interfejsa. Pozitivno je ocijenio napredak projekta kroz prethodne sprintove i činjenicu da sistem sada funkcioniše kao zaokružena i logički povezana cjelina.

Također, tokom prezentacije Product Owner je predložio dodatnu funkcionalnost koju je ocijenio korisnom za dalje unapređenje sistema. Pored toga, predložio je timu da samostalno identifikuje još nekoliko funkcionalnosti koje bi mogle dodatno zaokružiti poslovni tok aplikacije i unaprijediti korisničko iskustvo. Tim je nakon analize postojećeg sistema i implementiranih korisničkih priča predložio dodatne user storyje koji se prirodno nadovezuju na postojeći sistem servisnih intervencija. Product Owner je pregledao predložene funkcionalnosti, ocijenio ih relevantnim za projekat i dao saglasnost da budu uključene u naredni sprint kao proširenje postojećeg opsega sistema.

---

## Zaključak za naredni sprint

U narednom sprintu planirana je implementacija dodatnih korisničkih priča predloženih i odobrenih od strane Product Ownera, uz završnu stabilizaciju, testiranje i pripremu sistema za konačnu demonstraciju i predaju projekta.
