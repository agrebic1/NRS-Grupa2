# Sprint Retrospective Summary

Ova retrospektiva nam je pomogla da spoznamo kako se sistem ponaša u svojoj punoj kompleksnosti. Uspješno smo zaokružili kompletan MVP tok, što nam je dalo jasan uvid u to koliko su odluke o stabilnoj arhitekturi baze i RBAC-u (Role Based Access Control) bile ključne za uvođenje naprednih funkcija poput SLA praćenja i audit traila.

## Šta je išlo dobro

* **Kompletiranje MVP-a i administrativnog modula:** Uspjeli smo realizovati sve planirane stavke, uključujući i modul za administraciju korisnika (US-19–21) te sistemske notifikacije (US-37). Sistem je sada zaokružena cjelina koja omogućava upravljanje ulogama i profilima paralelno sa operativnim radom.
* **Zatvaranje kompletnog operativnog ciklusa:** Realizovan je ključni cilj sprinta, sistem podržava realne "edge-case" situacije poput promjene servisera (US-28), vraćanja zadatka na ponovnu dodjelu (US-29) i rješavanja intervencija koje nisu uspjele iz prve (US-40, US-47).
* **Implementacija operativne inteligencije (SLA i Audit):** Uvođenje SLA praćenja (US-41, US-45) i detaljnog audit traila (US-39) podiglo je aplikaciju na nivo ozbiljnog poslovnog sistema koji omogućava potpunu kontrolu kvaliteta i hronologiju promjena.
* **Tehnička zrelost i multimedija:** Implementacija obaveznog trajanja rada (US-38) i evidencije materijala (US-46) osigurala je čistoću podataka, dok je integracija sa Supabase Storage (US-43) omogućila serviserima slanje dokaza o radu direktno s terena.
* **Regresiona stabilnost:** Uprkos velikom broju novih funkcionalnosti i promjena stanja, osnovni serviserski tok je ostao stabilan, što je direktna posljedica ranije uspostavljene discipline u grananju i kontroli koda.

---

## Šta nije išlo dobro

* **Zagušenje dispečerskog interfejsa:** Sa uvođenjem SLA badgeva, audit tabela, evidencije materijala i historije, dispečerski "detalj" zahtjeva postaje vizuelno preopterećen. Primijećen je kognitivni pritisak pri pokušaju praćenja svih informacija na jednom ekranu.
* **Potcijenjena kompleksnost naizgled jednostavnih modula:** Iako su administrativni moduli (US-19–21) uspješno završeni, njihova implementacija je trajala duže od planiranog. Povezivanje uloga sa sistemskim notifikacijama i sigurnosnim pravilima pokazalo je da "pomoćni" moduli zahtijevaju jednaku pažnju kao i srž biznis logike.
* **Rizik regresije pri SLA eskalacijama:** Kompleksna logika SLA cooldown-a i notifikacija u realnom vremenu uvela je nekoliko izazova koji su zahtijevali hitne ispravke, što je ponovo opteretilo iskusnije članove tima tokom faze stabilizacije.

---

## Šta treba promijeniti

* **Dekompozicija UI komponenti:** Kako se sistem širi, moramo preći sa velikih monolitnih ekrana na modularne komponente (ekstrakcija modala i tabova), kako bi dispečerski dashboard ostao pregledan i intuitivan.
* **Automatizacija kao imperativ:** Pokazalo se da manuelno testiranje SLA eskalacija oduzima previše vremena. Potrebno je više se osloniti na testne skripte (SB-09-36) kako bismo osigurali stabilnost bez ručne provjere svakog statusa.
* **Ranije planiranje integracijskih tačaka:** Moduli koji se tiču korisničkih prava i notifikacija moraju se u startu tretirati kao visoko prioritetni zbog njihove povezanosti sa svim ostalim dijelovima sistema.

---

## Koje konkretne akcije tim uvodi u narednom sprintu

1. **UX Cleanup i Polishing:** Fokus se pomjera sa implementacije na peglanje postojećeg. To uključuje reviziju svih modala, empty state-ova i vizuelno rasterećenje dispečerskog interfejsa.
2. **STRIDE i Security Refaktoring:** Implementacija zaključaka iz STRIDE pregleda, sa posebnim fokusom na zaštitu API ruta za audit trail i administrativne akcije.
3. **Priprema za predaju i dokumentacija:** Finalizacija tehničke dokumentacije za sve User Storyje i usklađivanje decision logova sa stvarnom implementacijom na produkciji.
4. **Zatvaranje audit helpera:** Generalizacija koda koji prati promjene (staro/novo) kako bismo ga mogli lako primijeniti na sve entitete bez duplanja logike.
5. **Finalna provjera notifikacijskog sistema:** Testiranje svih okidača (triggera) za notifikacije kako bi se osiguralo da pravi korisnici dobijaju informacije u pravo vrijeme bez "spamanja".

---

**Zaključak:**
Sprint 9 je bio test izdržljivosti arhitekture i tima. Uspjeli smo implementirati apsolutno sve planirane funkcionalnosti i dokazati da sistem može pratiti i najkompleksnije tokove rada. Ulazimo u završnu fazu sa potpuno funkcionalnim MVP-om koji je spreman za finalnu stabilizaciju.
