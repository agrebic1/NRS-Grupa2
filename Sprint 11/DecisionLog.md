# Decision Log

---

## Odluka #001 – Prikaz rute do intervencije bez komercijalnog routing API-ja

| Polje | Opis |
|---|---|
| ID odluke | DL11-001 |
| Datum | 06.06.2026. |
| Kratak naziv odluke | OSM/haversine umjesto komercijalnog routing API-ja |
| Opis problema | Potrebno je prikazati rutu od bazne lokacije servisera do lokacije intervencije bez uvođenja eksternih plaćenih API servisa koji bi povećali kompleksnost i troškove projekta. |
| Razmatrane opcije | 1. Komercijalni routing API (Google Maps Directions, Mapbox) <br> 2. OpenStreetMap + haversine izračun udaljenosti i trajanja <br> 3. Samo deep link na vanjsku navigaciju bez prikaza rute u aplikaciji |
| Odabrana opcija | OpenStreetMap dual-marker mapa s haversine izračunom + deep link na Google Maps navigaciju |
| Razlog izbora | Eliminacija zavisnosti od plaćenih API-ja, dovoljna preciznost za MVP, prikaz rute ostaje informativan i funkcionalan za demonstraciju. |
| Posljedice odluke | Procjena trajanja puta nije bazirana na stvarnom saobraćaju; ruta se ne prikazuje ako nedostaje bazna ili lokacija intervencije. |
| Status odluke | aktivna |

### Trade-off analiza (Decision Matrix)

#### Težine kriterija

| Kriterij | Težina |
|---|---|
| Implementacijska kompleksnost | 5 |
| Troškovi i zavisnosti | 5 |
| Tačnost prikaza rute | 3 |
| Korisničko iskustvo | 4 |
| Održivost | 4 |

#### Ocjenjivanje i rezultat

| Opcija | Kompleksnost | Troškovi | Tačnost | UX | Održivost | Ukupno |
|---|---|---|---|---|---|---|
| Komercijalni routing API | 2 | 1 | 5 | 5 | 3 | 56 |
| OSM + haversine + deep link | 4 | 5 | 3 | 4 | 5 | **82** |
| Samo deep link | 5 | 5 | 1 | 2 | 5 | 68 |

### Sažetak odluke

**Krajnja odluka:** OSM dual-marker mapa s haversine izračunom i deep linkom na Google Maps

| Stavka | Objašnjenje |
|---|---|
| Razlog izbora | Nema troškova, dovoljna preciznost za informativni prikaz u MVP-u |
| Prednosti | Nema vendor lock-in, nema API ključeva, brza implementacija |
| Nedostaci | Procjena trajanja ne uzima u obzir stvarni saobraćaj |
| Napomena | Komercijalni API može se dodati u post-MVP fazi bez promjene arhitekture |
| Implementacija | `RutaMapa.tsx`, `RutaKartica.tsx`, modul `geoIzracun.ts` |

### Detaljno obrazloženje

Uvođenje komercijalnog routing API-ja zahtijeva upravljanje API ključevima, nosi troškove pri većem broju zahtjeva i uvodi eksternu zavisnost koja nije neophodna za MVP. Haversine formula daje dovoljno preciznu vazdušnu udaljenost za informativni prikaz, a serviser ionako otvara Google Maps za stvarnu navigaciju putem deep linka.

Ovakav pristup omogućava kompletnu funkcionalnost prikaza rute bez ijednog eksternog API poziva unutar aplikacije.

---

## Odluka #002 – Real-time GPS praćenje servisera isključeno iz opsega

| Polje | Opis |
|---|---|
| ID odluke | DL11-002 |
| Datum | 06.06.2026. |
| Kratak naziv odluke | Bez real-time GPS praćenja servisera |
| Opis problema | Razmatrano je da li sistem treba pratiti trenutnu poziciju servisera u realnom vremenu i prikazivati je dispečeru ili ažurirati rutu dinamički. |
| Razmatrane opcije | 1. Real-time GPS praćenje servisera uz Supabase Realtime <br> 2. Statična bazna lokacija + ruta na osnovu fiksnih koordinata <br> 3. Ručno osvježavanje lokacije od strane servisera |
| Odabrana opcija | Statična bazna lokacija servisera bez real-time praćenja |
| Razlog izbora | Real-time praćenje uvodi kompleksnost na nivou baze, sigurnosti i privatnosti koja prelazi MVP opseg; bazna lokacija je dovoljna za planiranje dolaska. |
| Posljedice odluke | Ruta se računa od bazne, a ne od trenutne lokacije servisera; dispečer ne vidi servisera na mapi u toku izvršenja. |
| Status odluke | aktivna |

### Sažetak odluke

| Stavka | Objašnjenje |
|---|---|
| Razlog izbora | Prevelika kompleksnost za završni sprint; privatnost korisnika |
| Prednosti | Jednostavnija implementacija, nema sigurnosnih izazova GPS praćenja |
| Nedostaci | Dispečer ne zna stvarnu lokaciju servisera tokom intervencije |
| Napomena | Može se razmatrati u post-MVP fazi uz eksplicitnu saglasnost servisera |
| Implementacija | Bazna lokacija pohranjuje se kroz profil servisera; nema Realtime GPS stream-a |

---

## Odluka #003 – Ocjena intervencije nije izmjenjiva nakon unosa

| Polje | Opis |
|---|---|
| ID odluke | DL11-003 |
| Datum | 06.06.2026. |
| Kratak naziv odluke | Ocjena je nepromjenjiva jednom unesena |
| Opis problema | Nakon što korisnik unese ocjenu i komentar za zatvorenu intervenciju, potrebno je definisati da li mu je dozvoljena naknadna izmjena. |
| Razmatrane opcije | 1. Izmjena ocjene dozvoljena u određenom vremenskom roku <br> 2. Izmjena ocjene uvijek dozvoljena <br> 3. Ocjena je nepromjenjiva jednom unesena |
| Odabrana opcija | Ocjena je nepromjenjiva jednom unesena |
| Razlog izbora | Sprečava manipulaciju povratnim informacijama, osigurava integritet podataka i pojednostavnjuje poslovnu logiku validacije. |
| Posljedice odluke | Korisnik koji pogrešno unese ocjenu ne može je ispraviti; sistem prikazuje postojeću ocjenu umjesto obrasca za ponovni unos. |
| Status odluke | aktivna |

### Trade-off analiza (Decision Matrix)

#### Težine kriterija

| Kriterij | Težina |
|---|---|
| Integritet podataka | 5 |
| Jednostavnost implementacije | 4 |
| Korisničko iskustvo | 4 |
| Zaštita od zloupotrebe | 5 |
| Konzistentnost s audit logom | 4 |

#### Ocjenjivanje i rezultat

| Opcija | Integritet | Jednostavnost | UX | Zaštita | Audit | Ukupno |
|---|---|---|---|---|---|---|
| Izmjena u vremenskom roku | 3 | 2 | 4 | 3 | 3 | 63 |
| Uvijek izmjenjivo | 2 | 3 | 5 | 1 | 2 | 52 |
| Nepromjenjivo jednom uneseno | 5 | 5 | 3 | 5 | 5 | **88** |

### Sažetak odluke

| Stavka | Objašnjenje |
|---|---|
| Razlog izbora | Jednostavnost logike, integritet ocjena, zaštita od naknadnih izmjena |
| Prednosti | Nema kompleksnog upravljanja vremenskim rokom izmjene; pouzdaniji audit trail |
| Nedostaci | Korisnik ne može ispraviti grešku pri unosu |
| Napomena | Mogućnost izmjene može se dodati u kasnijoj verziji uz admin override |
| Implementacija | `OcjenaIntervencije.tsx` prikazuje samo postojeću ocjenu ako je već unesena; API odbija duplikate |

---

## Odluka #004 – Agregacija ocjena u analitičkom dashboardu odložena

| Polje | Opis |
|---|---|
| ID odluke | DL11-004 |
| Datum | 06.06.2026. |
| Kratak naziv odluke | Agregacija ocjena nije uključena u Sprint 11 |
| Opis problema | Nakon implementacije ocjena po intervenciji, razmatrano je da li Sprint 11 treba uključiti i prikaz agregatnih metrika ocjena (prosječna ocjena po serviseru, ukupan trend) na analitičkom dashboardu. |
| Razmatrane opcije | 1. Implementirati agregaciju ocjena u dashboardu unutar Sprinta 11 <br> 2. Odložiti agregaciju za post-MVP fazu |
| Odabrana opcija | Agregacija ocjena odložena za post-MVP fazu |
| Razlog izbora | Završni sprint ima ograničen kapacitet; stabilnost i testiranje prioritetniji su od proširenja analitike. Individualna ocjena po intervenciji je dovoljna za MVP demonstraciju. |
| Posljedice odluke | Dashboard ne prikazuje prosječne ocjene; ocjene su vidljive samo na nivou pojedinačne intervencije i u historiji korisnika. |
| Status odluke | aktivna |

### Sažetak odluke

| Stavka | Objašnjenje |
|---|---|
| Razlog izbora | Kapacitet sprinta i stabilnost ispred proširenja analitike |
| Prednosti | Manje rizika regresije; demo ne zahtijeva agregatne podatke |
| Nedostaci | Dispečer i admin ne vide prosječnu ocjenu po serviseru |
| Napomena | Ocjene su u bazi i dostupne za kasniju analitiku bez strukturnih promjena |
| Implementacija | `intervencija_ocjene` tabela pohranjena; agregacijski upiti nisu implementirani |

---

## Odluka #005 – Detekcija dugog čekanja na klijentskoj strani bez server-side cron joba

| Polje | Opis |
|---|---|
| ID odluke | DL11-005 |
| Datum | 06.06.2026. |
| Kratak naziv odluke | Client-side izračun čekanja bez cron joba |
| Opis problema | Potrebno je definisati gdje se vrši detekcija intervencija koje predugo čekaju — na serveru putem zakazanog posla ili na klijentu u trenutku prikaza. |
| Razmatrane opcije | 1. Server-side cron job koji periodično skenira bazu i eskalira intervencije <br> 2. Client-side izračun na osnovu `created_at` pri svakom renderovanju liste <br> 3. Hibridni pristup: server označi flag u bazi, klijent ga prikazuje |
| Odabrana opcija | Client-side izračun bez novih DB kolona i bez cron joba |
| Razlog izbora | Cron job uvodi infrastrukturnu kompleksnost (Supabase Edge Functions ili external scheduler) neprikladnu za završni sprint; client-side izračun je dovoljan za vizuelno upozorenje u MVP-u. |
| Posljedice odluke | Izračun se temelji na `created_at`, a ne na vremenu ulaska u konkretni status; upozorenje je vidljivo samo dok je dispečerski ekran otvoren, nema pozadinskih notifikacija. |
| Status odluke | aktivna |

### Trade-off analiza (Decision Matrix)

#### Težine kriterija

| Kriterij | Težina |
|---|---|
| Implementacijska kompleksnost | 5 |
| Tačnost detekcije | 4 |
| Infrastrukturne zavisnosti | 5 |
| Vidljivost upozorenja | 3 |
| Održivost | 4 |

#### Ocjenjivanje i rezultat

| Opcija | Kompleksnost | Tačnost | Infrastruktura | Vidljivost | Održivost | Ukupno |
|---|---|---|---|---|---|---|
| Server-side cron job | 1 | 5 | 1 | 5 | 3 | 54 |
| Client-side izračun | 5 | 3 | 5 | 3 | 5 | **84** |
| Hibridni pristup | 3 | 4 | 3 | 4 | 4 | 72 |

### Sažetak odluke

| Stavka | Objašnjenje |
|---|---|
| Razlog izbora | Nula infrastrukturnih zavisnosti, brza implementacija, dovoljna preciznost za MVP |
| Prednosti | Nema potrebe za Edge Functions ili eksternim schedulerom |
| Nedostaci | Prag se mjeri od `created_at`, ne od vremena ulaska u status; nema push notifikacija |
| Napomena | Cron-bazirana eskalacija može se dodati u post-MVP bez promjene UI logike |
| Implementacija | Modul `dugoChekanje.ts` s pragovima po statusu; `DugoChekanjeBadge.tsx` u dispečerskim listama i dashboardu |

---

## Odluka #006 – Pragovi čekanja definirani po statusu, ne po prioritetu

| Polje | Opis |
|---|---|
| ID odluke | DL11-006 |
| Datum | 06.06.2026. |
| Kratak naziv odluke | Pragovi čekanja vezani za status, ne za prioritet intervencije |
| Opis problema | Potrebno je definisati da li prag za upozorenje o dugom čekanju treba biti jedinstven za sve intervencije, vezan za prioritet ili vezan za konkretni status u workflow-u. |
| Razmatrane opcije | 1. Jedinstven prag za sve intervencije bez obzira na status ili prioritet <br> 2. Prag zavisi od prioriteta intervencije (hitno = kraći rok) <br> 3. Različiti pragovi po statusu (`pending_review`, `potvrdeno`, `dodijeljeno`) |
| Odabrana opcija | Različiti pragovi po statusu intervencije |
| Razlog izbora | Svaki status ima drugačije operativno značenje i drugačije realistično trajanje obrade; prag vezan za status je precizniji i konzistentan s postojećim SLA praćenjem. |
| Posljedice odluke | Tim je ručno kalibrirao pragove po statusu; pragovi su hardcodirani u modulu i mogu se mijenjati bez promjene poslovne logike. |
| Status odluke | aktivna |

### Sažetak odluke

| Stavka | Objašnjenje |
|---|---|
| Razlog izbora | Operativna logika zahtijeva različit tretman različitih faza toka rada |
| Prednosti | Preciznost upozorenja; konzistentnost s SLA logikom; manji broj lažnih alarma |
| Nedostaci | Pragovi su inicijalno procijenjeni i možda zahtijevaju kalibraciju u produkciji |
| Napomena | Pragovi su izolovani u `dugoChekanje.ts` — izmjena ne zahtijeva promjenu komponenti |
| Implementacija | `dugoChekanje.ts` definira zasebne pragove za `pending_review`, `potvrdeno` i `dodijeljeno` |

---

## Odluka #007 – Historija korisnika filtrira samo zatvorene intervencije

| Polje | Opis |
|---|---|
| ID odluke | DL11-007 |
| Datum | 06.06.2026. |
| Kratak naziv odluke | Historija prikazuje isključivo završene intervencije prijavljenog korisnika |
| Opis problema | Potrebno je definisati koje intervencije su vidljive u historiji korisnika — samo završene, sve ili one u terminalnim statusima. |
| Razmatrane opcije | 1. Sve intervencije korisnika (aktivne i završene) <br> 2. Samo intervencije u terminalnim statusima (`zatvoreno`, `otkazano`) <br> 3. Samo intervencije sa statusom `zatvoreno` |
| Odabrana opcija | Intervencije prijavljenog korisnika u terminalnim statusima (zatvorene i otkazane), uz striktnu RBAC provjeru na API nivou |
| Razlog izbora | Aktivne intervencije su dostupne kroz standardni prikaz vlastitih zahtjeva (US-06); historija treba prikazivati isključivo završene tokove; otkazane intervencije su relevantan historijski podatak. |
| Posljedice odluke | Korisnik ne vidi aktivne intervencije u historiji; stroga API provjera sprečava pristup tuđim podacima čak i pri URL manipulaciji. |
| Status odluke | aktivna |

### Sažetak odluke

| Stavka | Objašnjenje |
|---|---|
| Razlog izbora | Jasno razdvajanje aktivnog toka od historijskog prikaza; konzistentno s US-06 |
| Prednosti | Čistiji UX; korisnik ne vidi duplikate aktivnih zahtjeva u dva ekrana |
| Nedostaci | Korisnik ne može iz historije pratiti aktivnu intervenciju |
| Napomena | Napredna pretraga i filtriranje historije po datumu/tipu kvara odloženi za post-MVP |
| Implementacija | API ruta `app/api/service-requests/historija/route.ts` filtrira po `user_id` i terminalnim statusima; RLS + backend provjera |

---

## Odluka #008 – Centralizacija operativne faze intervencije u zasebni modul

| Polje | Opis |
|---|---|
| ID odluke | DL11-008 |
| Datum | 07.06.2026. |
| Kratak naziv odluke | Refaktorisanje operativne faze u `operativnaFaza.ts` |
| Opis problema | Tokom implementacije Sprint 11 funkcionalnosti, logika određivanja operativne faze intervencije bila je raspršena po više komponenti, što je otežavalo konzistentnost prikaza i povećavalo rizik regresije pri izmjenama. |
| Razmatrane opcije | 1. Zadržati logiku operativne faze unutar svake komponente zasebno <br> 2. Centralizovati u domenski modul `operativnaFaza.ts` |
| Odabrana opcija | Centralizacija u modul `operativnaFaza.ts` |
| Razlog izbora | Jedan izvor istine za mapiranje statusa u operativnu fazu; smanjuje rizik nekonzistentnog prikaza između dispečerskih ekrana, listi i dashboarda. |
| Posljedice odluke | Refaktorisanje je moglo izazvati regresiju u prikazu statusa — pokriveno dodatnim unit testovima i manualnom provjerom svih pogođenih ekrana. |
| Status odluke | aktivna |

### Sažetak odluke

| Stavka | Objašnjenje |
|---|---|
| Razlog izbora | Open-Closed princip; promjena mapiranja faze utječe na jedno mjesto |
| Prednosti | Konzistentnost prikaza faze na svim ekranima; lakše testiranje |
| Nedostaci | Refaktorisanje u završnom sprintu nosi rizik regresije |
| Napomena | Ublaženo unit testovima za `operativnaFaza.ts` i manualnom provjeru workflow progress komponente |
| Implementacija | `operativnaFaza.ts`; workflow progress komponenta prilagođena ručno |

---

## Odluka #009 – ESLint `react/no-unescaped-entities` ispravljen ciljano, ne globalno

| Polje | Opis |
|---|---|
| ID odluke | DL11-009 |
| Datum | 07.06.2026. |
| Kratak naziv odluke | Ciljana ispravka ESLint greške umjesto globalnog onemogućavanja pravila |
| Opis problema | Produkcijski build na Vercelu pao je zbog ESLint pravila `react/no-unescaped-entities` u dvije datoteke koje su sadržavale literalne navodnike (`"`) u JSX tekstu. |
| Razmatrane opcije | 1. Globalno onemogućiti `react/no-unescaped-entities` u `.eslintrc` <br> 2. Ciljano ispraviti problematične datoteke zamjenom literala template literalima |
| Odabrana opcija | Ciljana ispravka u dvije datoteke |
| Razlog izbora | Globalno onemogućavanje ESLint pravila smanjuje kvalitet koda i može prikriti slične probleme u budućim izmjenama; ciljana ispravka ne mijenja vizuelni prikaz. |
| Posljedice odluke | Produkcijski build prošao; sličan problem može se ponoviti pri budućem dodavanju JSX teksta s navodnicima. |
| Status odluke | aktivna |

### Sažetak odluke

| Stavka | Objašnjenje |
|---|---|
| Razlog izbora | Održavanje standarda koda; minimalna izmjena s maksimalnim efektom |
| Prednosti | Build prošao; ESLint pravila ostaju aktivna za buduće provjere |
| Nedostaci | Slična situacija može se pojaviti pri dodavanju novog JSX sadržaja |
| Napomena | Preporučena provjera: `npm run build` lokalno prije svakog pusha koji uključuje JSX tekst s navodnicima |
| Implementacija | Izmjena u `app/korisnik/historija/page.tsx` i `components/korisnik/OcjenaIntervencije.tsx` |
