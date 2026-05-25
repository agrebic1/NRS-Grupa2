# Sprint Review Summary

## Sprint broj 8

## Planirani sprint goal

Omogućiti nastavak operativnog toka nakon dispečerske obrade zahtjeva kroz dodjelu intervencije serviseru, razvoj osnovnog serviserskog modula, praćenje statusa rada na terenu, evidentiranje izvršenog rada i pripremu intervencije za zatvaranje.

---

## Šta je završeno

Planirane aktivnosti koje su završene u ovom sprintu su:

- dodjela intervencije jednom serviseru (US-09)
- dodjela intervencije timu servisera (US-10)
- pregled dodijeljenih intervencija za servisera (US-15)
- pregled detalja zadatka na terenu (US-16)
- prihvatanje dodijeljenog zadatka od strane servisera (US-22)
- odbijanje dodijeljenog zadatka uz automatski povratak u dispečerski tok (US-23)
- ažuriranje statusa intervencije od strane servisera (US-14)
- evidentiranje izvršenog rada sa opisom, trajanjem i materijalima (US-17)
- pregled evidentiranog rada od strane dispečera (US-24)
- potvrda i zatvaranje intervencije (US-25)
- razmjena napomena između dispečera i servisera (US-30)
- pregled historije aktivnosti intervencije (US-32)
- implementacija centralnog notification sistema za sve korisničke uloge (US-37)
- implementacija centralizovanog audit loga svih aktivnosti nad intervencijom
- UX/UI redesign dispečerskog modula – dispatch control panel pristup
- implementacija horizontalnog workflow trackera sa vizuelnim praćenjem faza intervencije
- implementacija vizuelnih prioritet kartica sa sistemskom preporukom
- implementacija sticky operativnog summary panela na detalju intervencije
- uklanjanje silent mock fallback podataka – backend greške su vidljive korisniku
- testiranje kompletnog toka: dispečer → serviser → izvršenje → evidencija → zatvaranje

---

## Šta nije završeno

Sve stavke koje su planirane u okviru Sprinta 8 su završene.

---

## Demonstrirane funkcionalnosti ili artefakti

U ovom sprintu demonstrirane su sljedeće funkcionalnosti i artefakti:

- AI Usage Log
- Decision Log
- Sprint Backlog
- Dodjela intervencije jednom serviseru ili timu
- Serviserski pregled dodijeljenih intervencija
- Detaljan prikaz zadatka na terenu
- Prihvatanje i odbijanje dodijeljenog zadatka
- Ažuriranje statusa intervencije od strane servisera
- Evidentiranje izvršenog rada (opis, trajanje, materijali)
- Dispečerski pregled evidentiranog rada (read-only)
- Potvrda i zatvaranje intervencije
- Razmjena napomena na intervenciji
- Historija aktivnosti intervencije (audit timeline)
- Centralni notification sistem (notification bell, unread badge i notification panel)
- Dispatch control panel – redesign detalja intervencije
- Horizontalni workflow tracker sa vizuelnim praćenjem faza
- Vizuelne prioritet kartice sa sistemskom preporukom
- Sticky operativni summary panel
- End-to-end testiranje kompletnog operativnog toka

---

## Glavni problemi i blokeri

- Kompleksnost sinhronizacije statusa između dispečerskog i serviserskog prikaza zahtijevala je posebnu pažnju pri definisanju API validacija i pravila statusnih tranzicija.
- Rizik dodjele serviseru koji nema odgovarajuću ulogu riješen je filterom dostupnih servisera pri prikazu liste za dodjelu.
- Pravilno vraćanje odbijenog zadatka u dispečerski tok zahtijevalo je dodatnu validaciju statusnih prijelaza i evidenciju razloga odbijanja.
- Zatvaranje intervencije bez evidentiranog rada blokirano je na nivou API validacije uz jasnu UX poruku korisniku.
- Veliki obim serviserskog modula zahtijevao je pažljivo balansiranje između planiranih funkcionalnosti i realnog opsega sprinta.
- Implementacija UX redesign-a uz primjenu dispatch control panel koncepta zahtijevala je iterativno usklađivanje s postojećim dizajnom sistema.

---

## Ključne odluke donesene u sprintu

- Višestruki preferirani termini korisnika – korisnik može odabrati do tri preferirana termina (primarni i do dva alternativna) radi veće fleksibilnosti planiranja i usklađivanja rasporeda.
- Validacija dodjele prema statusu intervencije – dodjela servisera moguća je samo iz ispravnih statusnih faza; fail-fast backend validacija sprečava pogrešne prijelaze.
- Odbijanje zadatka s obaveznim razlogom – odbijeni zadatak automatski se vraća u dispečerski tok; serviser mora unijeti razlog odbijanja koji se evidentira u audit logu.
- Struktura evidentiranja rada – evidencija uključuje opis rada, utrošeno vrijeme, listu materijala i fotografije; sve je read-only za dispečera radi integriteta podataka.
- Zatvaranje intervencije uvjetovano evidencijom rada – zatvaranje je moguće samo ako je serviser evidentirao rad; zatvorena intervencija je zaključana za daljnje izmjene.
- Napomene između dispečera i servisera su interne – nisu vidljive korisniku usluge; cilj je centralizacija operativnih informacija i čist audit trag.
- Centralizovani audit log – sistem vodi hronološki audit log svih važnih aktivnosti nad intervencijom radi transparentnosti i operativnog pregleda.
- Centralni notification sistem – svaka uloga vidi samo sebi relevantne notifikacije; implementirani notification bell, unread badge i notification panel.
- Uklanjanje silent mock fallback podataka – backend greške su sada vidljive korisniku umjesto da se maskiraju mock podacima.
- Vraćanje intervencije u prethodnu fazu – moguće uz obavezno obrazloženje; svako vraćanje evidentira se u audit logu.
- Vizuelne prioritet kartice umjesto dropdown liste – dispečer bira prioritet kroz vizuelne kartice; sistem ističe preporučenu opciju, dispečer zadržava pravo konačne odluke.
- Dispatch control panel pristup detaljima intervencije – detalji intervencije prikazani su kao operativna kontrolna tabla, a ne kao klasična CRUD forma.

---

## Povratna informacija Product Ownera

Product Owner je izrazio zadovoljstvo implementiranim funkcionalnostima i načinom na koji je tim realizovao planirane aktivnosti u okviru Sprinta 8. Naglašeno je da tim nastavi sa istim pristupom rada i organizacije i u narednom sprintu, uz fokus na održavanje kvaliteta implementacije i konzistentnosti sistema.

---

## Zaključak za naredni sprint

S obzirom na uspješnu implementaciju serviserskog modula, dodjele intervencija, evidentiranja rada i zatvaranja intervencija, tim može preći na aktivnosti vezane za sprint 9.
