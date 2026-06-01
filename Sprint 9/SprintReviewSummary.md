# Sprint Review Summary

### Sprint broj 9

### Planirani sprint goal

Zatvoriti kompletan MVP tok sistema servisnih intervencija kroz implementaciju alternativnih operativnih tokova, SLA kontrole i eskalacija, proširenje audit sistema, evidenciju rada na terenu, naprednije praćenje intervencija, stabilizaciju workflow-a i dodatno sigurnosno i UX unapređenje aplikacije.

Sprint 9 predstavljao je jedan od najobimnijih i najzahtjevnijih sprintova projekta jer je uključivao veliki broj međusobno povezanih korisničkih priča koje su morale biti integrisane u postojeći sistem bez narušavanja stabilnosti aplikacije i postojećih workflow tokova.

Dodatni izazov predstavljala je činjenica da je sprint trajao kraće nego što je prvobitno planirano, zbog čega je tim imao manje efektivnog vremena za implementaciju, testiranje, dokumentaciju i završno usklađivanje kompletnog sistema.

Uprkos tome, cilj sprinta bio je ne samo implementirati nove funkcionalnosti, nego i funkcionalno zatvoriti ključni operativni tok aplikacije kako bi sistem počeo djelovati kao jedna zaokružena i operativno smisleno povezana cjelina.

---

## Šta je završeno

Planirane aktivnosti koje su završene u ovom sprintu su:

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
- praćenje intervencije koja nije riješena iz prve (US-47)
- sistemske notifikacije po ulozi (US-37)
- regresiono testiranje serviserskog toka i zatvaranja intervencije
- automatizovani i manuelni testovi sistema
- STRIDE pregled sigurnosnih rizika i ciljani refaktoring workflow i audit log logike
- stabilizacija workflow tranzicija i fail-fast backend validacija

Pored same implementacije funkcionalnosti, veliki dio rada u ovom sprintu odnosio se na:
- održavanje konzistentnosti između dispečerskog i serviserskog modula,
- stabilizaciju postojećih workflow tokova,
- refaktorisanje ranije implementiranih dijelova sistema,
- dodatne sigurnosne validacije,
- audit i historiju aktivnosti,
- provjeru edge-case scenarija,
- zaštitu sistema od nekonzistentnih statusnih tranzicija.

Sprint nije bio samo “dodavanje novih funkcionalnosti”, nego ozbiljan pokušaj da se veliki broj kompleksnih operativnih procesa poveže u jedan stabilan i logički konzistentan sistem.

---

## Šta nije završeno

Sve stavke koje su planirane u okviru Sprinta 9 su završene.

---

## Demonstrirane funkcionalnosti ili artefakti

U ovom sprintu demonstrirane su sljedeće funkcionalnosti i artefakti:

- AI Usage Log
- Decision Log
- Sprint Backlog
- promjena izvršioca intervencije
- vraćanje zadatka na ponovnu dodjelu
- označavanje intervencije kao nije riješena
- SLA engine i SLA pravila po prioritetima
- SLA upozorenja i eskalacije
- audit trail sa starim i novim vrijednostima
- tabelarni pregled historije aktivnosti
- evidencija materijala i dijelova
- upload i pregled foto dokumentacije intervencije
- izvještaji odziva i trajanja po serviseru
- praćenje ponovnih ciklusa intervencije
- prošireni audit log i historija aktivnosti
- fail-fast backend validacije
- proširene RBAC provjere pristupa
- regresiono testiranje kompletnog toka aplikacije

Demonstrirani sistem pokazao je značajno viši nivo operativne zrelosti nego u ranijim sprintovima i prvi put je aplikacija počela djelovati kao ozbiljan i međusobno povezan sistem servisnih intervencija, a ne samo skup odvojenih funkcionalnosti.

---

## Glavni problemi i blokeri

Sprint 9 predstavljao je jedan od najtežih sprintova projekta zbog:
- velikog broja međusobno povezanih funkcionalnosti,
- kompleksnosti workflow logike,
- velikog broja statusnih tranzicija,
- proširenja audit sistema,
- uvođenja SLA pravila i eskalacija,
- dodatnih sigurnosnih validacija,
- potrebe da svi moduli ostanu međusobno konzistentni.

Dodatni izazov predstavljalo je kraće trajanje sprinta i manji broj efektivnih radnih dana nego što je prvobitno planirano.

Tim je morao u veoma kratkom periodu:
- implementirati veliki broj novih funkcionalnosti,
- održati stabilnost postojećeg sistema,
- provesti regresiono testiranje,
- proširiti dokumentaciju,
- rješavati sigurnosne probleme,
- i paralelno pripremati sprint demonstraciju.

Veliki broj novih user storyja povećao je rizik regresije postojećih funkcionalnosti, zbog čega je značajan dio sprinta bio usmjeren na stabilizaciju i dodatno testiranje sistema.

Neposredno pred prezentaciju dodatni problem predstavljale su zlonamjerne izmjene unutar aplikacije koje su izazvale ozbiljne probleme sa administratorskim pristupom i stabilnošću sistema, što je dodatno povećalo stres i pritisak nad timom u završnoj fazi sprinta.

---

## Ključne odluke donesene u sprintu

- Obavezno trajanje evidencije rada - evidencija rada više ne može biti spremljena bez trajanja intervencije, uvedena validacija raspona 1-1440 minuta.
- Centralizovani audit log aktivnosti - sve aktivnosti nad intervencijama evidentiraju se kroz jedinstveni sistem historije aktivnosti.
- Audit trail sa starim i novim vrijednostima - svaka promjena statusa, prioriteta ili izvršioca čuva prethodnu i novu vrijednost radi potpunog audita sistema.
- Evidencija neriješenog problema - sistem omogućava označavanje da problem nije riješen tokom prve intervencije i zahtijeva dodatni izlazak na teren.
- SLA engine sa upozorenjima i eskalacijama - uvedena SLA pravila po prioritetima i vizuelna upozorenja za prekoračenja rokova.
- Fail-fast validacija workflow-a - nevalidni statusni prelazi i nekonzistentni zahtjevi blokiraju se odmah na backend nivou.
- Proširene RBAC validacije - korisnici mogu pristupiti samo intervencijama i funkcijama koje pripadaju njihovoj ulozi.
- Foto dokumentacija intervencije - upload fotografija validira se provjerom magic bytes potpisa fajla radi sigurnosti.
- Praćenje ponovnih ciklusa intervencije - sistem prati koliko puta je intervencija vraćena ili označena kao nije riješena.
- Refaktorisanje workflow logike - uklonjeni su pojedini duplicirani dijelovi koda i usklađeni nazivi i statusi kroz aplikaciju.

---

# Povratna informacija Product Ownera

Product Owner je bio zadovoljan demonstriranim funkcionalnostima i ukupnim stanjem aplikacije. Posebno je pozitivno ocijenjen veliki broj implementiranih funkcionalnosti i činjenica da je kompletan operativni tok sistema uspješno povezan i funkcionalno zatvoren. Što se tiče same implementacije i demonstriranih funkcionalnosti, nije bilo značajnijih zamjerki i ocijenjeno je da je tehnički dio sprinta kvalitetno realizovan.

Primjedba Product Ownera odnosila se prvenstveno na format dokumentacije, odnosno način prikaza user storyja unutar sprint artefakata. Umjesto punog standardizovanog formata korisničkih priča, u pojedinim dijelovima dokumentacije korišten je samo naziv user storyja. Zbog manjeg odstupanja od očekivanog template formata i činjenice da je greškom uploadovana starija verzija dokumenta, sprint je ocijenjen niže u dokumentacionom dijelu.

Važno je naglasiti da zamjerke nisu bile vezane za kvalitet aplikacije niti implementiranih funkcionalnosti, nego isključivo za način prikaza user storyja.

---

# Zaključak za naredni sprint

S obzirom da je Sprint 9 funkcionalno zatvorio kompletan osnovni operativni tok sistema servisnih intervencija, Sprint 10 će biti fokusiran prvenstveno na završnu stabilizaciju i unapređenje kvaliteta kompletnog sistema. Fokus narednog sprinta biće na testiranju i stabilizaciji sistema, UI/UX unapređenjima i završnom poliranju aplikacije, dodatnim funkcionalnostima koje unapređuju korisničko iskustvo, refaktoringu i uklanjanju tehničkog duga, sigurnosnim provjerama i validacijama, usklađivanju i finalnoj provjeri dokumentacije, demo pripremi i završnoj prezentaciji sistema. Cilj Sprinta 10 više neće biti veliki broj novih funkcionalnosti, nego završno povezivanje, provjera, stabilizacija i poliranje sistema kako bi aplikacija djelovala kao konzistentna, pouzdana i profesionalno zaokružena cjelina.
