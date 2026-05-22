# AI Usage Log

| Polje | Opis |
|---|---|
| Datum | 21.05.2026. |
| Sprint broj | 9 |
| Alat koji je korišten | Claude AI |
| Svrha korištenja | Priprema backend osnove za Sprint 9 akcije (validacije, tipovi, statusni prelazi, notifikacije) |
| Kratak opis zadatka | Implementacija zajedničkih Zod shema i TypeScript tipova za `promijeni_izvrsioca`, `vrati_na_ponovnu_dodjelu` i `oznaci_nije_rijesen`, uz proširenje `SERVISER_PRELAZI` i helper funkcija u `notifikacijeHelper.ts`. |
| Šta je AI generisao | Predlog `razlogOperativniSchema`, obaveznog `trajanje_minuta` u `evidencijaRadaSchema`, proširen `TipAktivnosti` i `InterventionActivity` interface, mapu dozvoljenih prelaza i tri notifikacijske funkcije. |
| Šta je tim prihvatio | Zajednička shema razloga (min. 10 znakova), obavezno trajanje evidencije, nove tipove aktivnosti u audit logu i status-driven prelaze prema US-28, US-29 i US-40. |
| Šta je tim izmijenio | Inline provjere statusa ostale u pojedinačnim PATCH handlerima umjesto potpunog spajanja `serviserPristup` i `statusPrelazi` u jedan modul. |
| Šta je tim odbacio | Automatsko generisanje migracija baze za nove kolone koje su već postojale u `intervention_activities`. |
| Rizici, problemi ili greške | Postojeći unit testovi za evidenciju očekivali opcionalno `trajanje_minuta` — riješeno kasnije u test tasku. |
| Ko je koristio alat | Amina Grebić |


| Polje | Opis |
|---|---|
| Datum | 21.05.2026. |
| Sprint broj | 9 |
| Alat koji je korišten | Cursor |
| Svrha korištenja | Implementacija SLA engine modula i tipova za izvještaj odziva servisera |
| Kratak opis zadatka | Kreiranje čistih backend modula `lib/servisirane/slaPravila.ts` i `lib/servisirane/izvjestajiOdziva.ts` bez UI zavisnosti, prema US-41 i US-42. |
| Šta je AI generisao | Funkcije `izracunajSlaRok`, `getSlaStatus`, `formatirajPreostaloVrijeme`, konstante `SLA_ROKOVI_SATI` po prioritetu, te TypeScript tipove `ServiserOdzivaRed` i `IzvjestajOdzivaOdgovor`. |
| Šta je tim prihvatio | SLA pragove po prioritetu (2h / 8h / 24h / 72h), status `ok` / `upozorenje` / `prekoraceno`, isključenje zatvorenih intervencija i strukturu odgovora za agregaciju metrika po serviseru. |
| Šta je tim izmijenio | Ispravljen naziv export funkcije za formatiranje vremena u kodu; agregacija odziva u API ruti kasnije ručno usklađena s postojećim aktivnostima u bazi. |
| Šta je tim odbacio | Timezone-aware biblioteku umjesto jednostavnog `Date` pristupa zbog ograničenja sprinta. |
| Rizici, problemi ili greške | Granični slučaj SLA upozorenja na tačno 2h zahtijevao ručnu provjeru u unit testovima. |
| Ko je koristio alat | Ajla Ćesir |


| Polje | Opis |
|---|---|
| Datum | 21.05.2026. |
| Sprint broj | 9 |
| Alat koji je korišten | Claude AI |
| Svrha korištenja | Implementacija dispečerskog API handlera za promjenu izvršioca intervencije (US-28) |
| Kratak opis zadatka | Proširenje `app/api/dispecer/zahtjevi/[id]/route.ts` discriminated union shemom `promijeni_izvrsioca`, handler logikom, audit INSERT-om i pozivima notifikacija. |
| Šta je AI generisao | Zod shemu akcije, handler koji validira status (`dodijeljeno`, `u_radu`, `u_izvrsenju`), ažurira `serviser_dodijeljen_id`, bilježi `old_value`/`new_value` i šalje notifikacije starom i novom serviseru. |
| Šta je tim prihvatio | Backend kao izvor istine za promjenu izvršioca, obavezan razlog i audit zapis tipa `promjena_izvrsioca`. |
| Šta je tim izmijenio | SELECT upit proširen ručno; poruke grešaka prilagođene postojećem API formatu aplikacije. |
| Šta je tim odbacio | Automatsku dodjelu bez dispečerske potvrde i batch promjenu izvršioca za više intervencija odjednom. |
| Rizici, problemi ili greške | Potrebna je bila ručna provjera da `notifUklanjanjeServisera` koristi ispravan ID dispečera iz aktivnosti dodjele. |
| Ko je koristio alat | Amina Grebić |


| Polje | Opis |
|---|---|
| Datum | 21.05.2026. |
| Sprint broj | 9 |
| Alat koji je korišten | Claude AI |
| Svrha korištenja | Implementacija serviserskih PATCH akcija za vraćanje zadatka na ponovnu dodjelu (US-29) |
| Kratak opis zadatka | Proširenje `app/api/serviser/intervencije/[id]/route.ts` akcijom `vrati_na_ponovnu_dodjelu` i usklađivanje `evidencija/route.ts` da ne šalje `null` za `trajanje_minuta`. |
| Šta je AI generisao | Handler koji iz statusa `dodijeljeno`/`u_radu` vraća intervenciju na `potvrdeno`, briše `serviser_dodijeljen_id`, upisuje audit `vracanje_na_dodjelu` i poziva `notifVratanjaNaPonovnuDodjelu`. |
| Šta je tim prihvatio | Obavezan razlog, povrat u `potvrdeno` za ponovnu dispečersku dodjelu i uklanjanje `trajanje_minuta ?? null` fallbacka u evidenciji. |
| Šta je tim izmijenio | Dohvat dispečera za notifikaciju implementiran preko postojeće aktivnosti dodjele, ne hardkodiranog ID-a. |
| Šta je tim odbacio | Novi status `ceka_ponovnu_dodjelu` u bazi — korišten postojeći `potvrdeno`. |
| Rizici, problemi ili greške | Integration testovi za evidenciju pali su nakon obaveznog trajanja — popravljeni u zasebnom test tasku. |
| Ko je koristio alat | Ajna Ičić |


| Polje | Opis |
|---|---|
| Datum | 22.05.2026. |
| Sprint broj | 9 |
| Alat koji je korišten | Claude AI |
| Svrha korištenja | Implementacija serviserskih i dispečerskih UI modala za preraspodjelu i označavanje nije riješeno (US-28, US-29, US-40) |
| Kratak opis zadatka | React komponente `PromijeniIzvrsiocaModal`, `VratiNaPonovnuDodjeluModal`, `OznaciNijeRijesenoModal` i integracija dugmadi u `app/dispecer/intervencije/[id]/page.tsx` i `app/serviser/intervencije/[id]/page.tsx`. |
| Šta je AI generisao | Modale s textarea za razlog, PATCH pozive, state za prikaz/sakrivanje, dugmad u blokovima statusa i vizuelno razlikovanje narančastog (vrati) i crvenog (nije riješeno) stila. |
| Šta je tim prihvatio | Modalni tok s obaveznim razlogom, optimističko osvježavanje liste nakon uspješnog PATCH-a i vidljivost akcija samo u dozvoljenim statusima. |
| Šta je tim izmijenio | Fetch liste servisera u modalu prilagođen postojećem API-ju; breadcrumb linkovi usklađeni s kanonskom rutom `/serviser/intervencije`. |
| Šta je tim odbacio | Potpuno novi dizajn dispečerskog detalja — zadržan postojeći layout i dodane akcije u „Brze akcije“. |
| Rizici, problemi ili greške | Rizik duplog modala ako korisnik brzo klikne dvije akcije — riješeno disable stanjem na submit dugmetu. |
| Ko je koristio alat | Amina Grebić |


| Polje | Opis |
|---|---|
| Datum | 22.05.2026. |
| Sprint broj | 9 |
| Alat koji je korišten | Cursor |
| Svrha korištenja | Popuna audit trail logike i prikaz historije aktivnosti sa starim i novim vrijednostima (US-39) |
| Kratak opis zadatka | Dopuna INSERT poziva u `app/api/dispecer/zahtjevi/[id]/route.ts` (`dodijeli`, `potvrdi`, `odbij`, `zatvori`) i proširenje `components/serviser/AktivnostiTimeline.tsx` prikazom `old_value → new_value`. |
| Šta je AI generisao | Audit polja u handlerima koji su ranije imali samo `sadrzaj`, `STATUS_LABELE` mapu, badge prikaz za promjenu statusa/servisera i ikone za tipove `promjena_izvrsioca`, `vracanje_na_dodjelu`, `nije_rijeseno`. |
| Šta je tim prihvatio | Konzistentno popunjavanje `old_value`/`new_value`/`actor_role` u svim relevantnim API handlerima i vizuelni prikaz strelice između vrijednosti u timeline komponenti. |
| Šta je tim izmijenio | Ručno dodani INSERT-i za `potvrdi` i `odbij` handler koji ranije nisu logovali aktivnost. |
| Šta je tim odbacio | Odvojeni audit servis — logika ostala u postojećim route handlerima. |
| Rizici, problemi ili greške | Prikaz ID servisera umjesto imena u timeline — ostavljen tekstualni prikaz dok nema lookup tabele. |
| Ko je koristio alat | Ajna Ičić |


| Polje | Opis |
|---|---|
| Datum | 22.05.2026. |
| Sprint broj | 9 |
| Alat koji je korišten | Cursor |
| Svrha korištenja | Integracija SLA indikatora u dispečerske liste i dashboard (US-41) |
| Kratak opis zadatka | Nova komponenta `components/dispecer/SlaStatusBadge.tsx`, integracija u `app/dispecer/intervencije/page.tsx` (KPI + filter + kartice) i `app/dispecer/page.tsx` (KPI kartica prekoračenog SLA). |
| Šta je AI generisao | Reusable badge (zelena/žuta/crvena), `useMemo` brojanje prekoračenih, proširenje `KpiFilter` tipa s `'sla'` i prikaz badge-a na svakoj `IntervencijaKartica`. |
| Šta je tim prihvatio | SLA badge na listi intervencija, KPI „Prekoračen SLA“ na dashboardu i filter koji prikazuje samo prekoračene intervencije. |
| Šta je tim izmijenio | Grid kolone KPI kartica prilagođen (`lg:grid-cols-8` / `lg:grid-cols-7`) da stane nova kartica bez lomljenja layouta. |
| Šta je tim odbacio | Zasebnu stranicu samo za SLA pregled — filter na postojećoj listi intervencija. |
| Rizici, problemi ili greške | Performanse `useMemo` na velikoj listi — prihvatljivo za MVP obim podataka u test okruženju. |
| Ko je koristio alat | Ajla Ćesir |


| Polje | Opis |
|---|---|
| Datum | 22.05.2026. |
| Sprint broj | 9 |
| Alat koji je korišten | Claude AI |
| Svrha korištenja | Implementacija API izvještaja odziva i UI stranice za dispečera (US-42) |
| Kratak opis zadatka | Kreiranje `app/api/dispecer/izvjestaj/odziva/route.ts` (GET, RBAC, agregacija po serviseru) i `app/dispecer/izvjestaj/odziva/page.tsx` s datumskim filterom, KPI karticama i tabelom performansi. |
| Šta je AI generisao | Endpoint s query parametrima `od`/`do`, logiku agregacije odziva i trajanja iz `work_evidence` i aktivnosti, te React stranicu s tabelom i progress barom za SLA postotak. |
| Šta je tim prihvatio | RBAC preko `assertDispatcherAccess`, default period tekući mjesec, sortiranje servisera po broju intervencija i link u navigaciji (`AppShell`). |
| Šta je tim izmijenio | SLA postotak u tabeli obojen pragovima (zelena ≥90%, narančasta ≥70%, crvena ispod); loading i prazno stanje dodani ručno. |
| Šta je tim odbacio | Export CSV/PDF izvještaja i grafikone trenda — ostavljeni za kasniju fazu. |
| Rizici, problemi ili greške | Agregacija odziva ovisi o konzistentnosti timestampa u `intervention_activities` — provjereno na test podacima. |
| Ko je koristio alat | Ajla Ćesir |


| Polje | Opis |
|---|---|
| Datum | 22.05.2026. |
| Sprint broj | 9 |
| Alat koji je korišten | Claude AI |
| Svrha korištenja | Dopuna uploada slika, galerije i obavezne evidencije trajanja u UI (US-38, US-43) |
| Kratak opis zadatka | Izmjene u `app/api/slike/route.ts` (limit 10 MB, ownership provjera), `ImageUploader.tsx`, galerija u dispečer/serviser detaljima, te `EvidencijaRadaModal.tsx` (obavezno trajanje, disabled submit). |
| Šta je AI generisao | POST validaciju vlasništva intervencije, sinhronizaciju klijentskog limita 10 MB, `Promise.all` učitavanje slika iz `/api/slike` i UX validaciju trajanja u evidenciji rada. |
| Šta je tim prihvatio | Upload samo za dodijeljenog servisera ili dispečera, grid thumbnaila u detaljima i blokadu slanja evidencije bez unesenog trajanja. |
| Šta je tim izmijenio | Uklonjen GIF iz dozvoljenih tipova; legacy slike (`photo_url`) i dalje spajaju s uploadom iz baze u dispečerskom prikazu. |
| Šta je tim odbacio | Zasebnu komponentu galerije s lightbox bibliotekom — korišten jednostavan grid s linkom na punu sliku. |
| Rizici, problemi ili greške | Label je ranije pisao „opciono“ za trajanje iako je polje postalo obavezno — ispravljeno u istom tasku. |
| Ko je koristio alat | Ajna Ičić |


| Polje | Opis |
|---|---|
| Datum | 22.05.2026. |
| Sprint broj | 9 |
| Alat koji je korišten | Cursor |
| Svrha korištenja | Automatski testovi za Sprint 9 izmjene i regresija postojećih integration testova |
| Kratak opis zadatka | Novi fajlovi `tests/unit/slaPravila.test.js` i `tests/integration/api.serviser.sprint9.test.js`, ažuriranje `statusPrelazi.test.js` i `serviserskeAkcije.test.js`, te popravke mockova u dispečerskim integration testovima. |
| Šta je AI generisao | 18 unit testova za SLA engine, 14 integration testova za `vrati_na_ponovnu_dodjelu` i `oznaci_nije_rijesen`, te ispravke testova koji su pali zbog obaveznog `trajanje_minuta` i proširenog status filtera. |
| Šta je tim prihvatio | Jest mock pattern kao u postojećim serviser testovima, pokrivenost 401/403/400/422/200 scenarija i cilj 268/268 prolaznih testova. |
| Šta je tim izmijenio | `createAdminClient` mock delegira na `mockFrom`; assertion filtera u `api.dispecer.zahtjevi.test.js` proširen s `'zatvoreno'`. |
| Šta je tim odbacio | Generisanje E2E Playwright scenarija za Sprint 9 u ovom tasku — E2E ostao nepromijenjen (16 testova). |
| Rizici, problemi ili greške | Prvi run je otkrio 5 padajućih testova zbog promjene sheme evidencije — svi popravljeni prije zatvaranja sprinta. |
| Ko je koristio alat | Ajla Ćesir |

