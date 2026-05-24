# Initial Release Plan

## Planirani inkrementi / release cjeline

Ovaj initial release plan izrađen je na osnovu product backloga, user storyja, procijenjene složenosti funkcionalnosti, raspoloživog kapaciteta tima i realnog trajanja sprintova. Pri planiranju su uzeti u obzir kratko trajanje sprintova, neujednačen broj raspoloživih radnih dana, ograničeno iskustvo tima, kao i povećan organizacijski rizik u pojedinim sprintovima. Zbog toga release cjeline nisu planirane prečesto, nego su grupisane u veće i smislenije inkremente koji ostavljaju dovoljno prostora za implementaciju, integraciju, testiranje i doradu.

## Sažeti pregled release plana

| Inkrement | Fokus | Sprintovi | Release tačka |
|---|---|---|---|
| **Inkrement 1** | osnovni korisnički i dispečerski tok | 5-8 | kraj Sprinta 8 |
| **Inkrement 2** | izvršenje intervencije, zatvaranje i administrativna kontrola | 9 | kraj Sprinta 9 |

---

## Inkrement 1 - Osnovni korisnički i dispečerski tok

| Element | Opis |
|---|---|
| **Cilj inkrementa** | Uspostaviti prvi stabilan i upotrebljiv dio sistema koji omogućava pristup sistemu, prijavu zahtjeva za servisnu intervenciju, pregled vlastitih zahtjeva i njihovu početnu obradu od strane dispečera. Ovaj inkrement treba predstavljati prvu zaokruženu funkcionalnu cjelinu sistema koja korisniku i dispečeru daje stvarnu operativnu vrijednost. |
| **Glavne funkcionalnosti** | **Tehnička osnova i pristup sistemu**<br>- tehnički setup projekta i osnovni skeleton sistema<br>- osnovni model baze podataka<br>- registracija, prijava i odjava korisnika<br>- osnovna prava pristupa prema korisničkim ulogama<br><br>**Upravljanje zahtjevima korisnika**<br>- prijava zahtjeva za servisnu intervenciju<br>- pregled vlastitih zahtjeva i njihovih statusa<br>- izmjena vlastitog zahtjeva kada je to dozvoljeno<br>- otkazivanje vlastitog zahtjeva kada je to dozvoljeno<br><br>**Početna dispečerska obrada**<br>- pregled otvorenih i aktivnih intervencija od strane dispečera<br>- pregled detalja pojedinačne intervencije<br>- pregled statusa intervencije<br>- određivanje prioriteta intervencije<br>- planiranje termina intervencije |
| **Zavisnosti** | - uspješno postavljen osnovni skeleton projekta<br>- definisan i implementiran osnovni model baze podataka<br>- funkcionalna autentifikacija i upravljanje sesijom<br>- definisane korisničke uloge i osnovna prava pristupa<br>- usklađenost implementacije sa definisanom arhitekturom sistema |
| **Glavni rizici** | - kašnjenje u postavljanju tehničke osnove i modela baze<br>- problemi u autentifikaciji, upravljanju sesijom i pravima pristupa<br>- smanjen kapacitet tima u ranim sprintovima<br>- povećan organizacijski rizik u Sprintu 7<br>- potcjenjivanje složenosti logike statusa, prioriteta i dozvoljenih izmjena zahtjeva |
| **Okvirni sprintovi realizacije** | **Sprint 5-8**<br>**Planirana release tačka:** kraj Sprinta 8 |

> **Napomena:**
> Prvi inkrement obuhvata sprintove 5-8 jer se tek na kraju tog perioda formira dovoljno zaokružena i upotrebljiva funkcionalna cjelina. Ranije pravljenje release-a ne bi bilo smisleno, jer bi obuhvatalo samo djelimično implementirane i međusobno nedovoljno povezane funkcionalnosti, bez potpunog poslovnog toka koji bi sistemu davao stvarnu operativnu vrijednost.

## Kontrolna tabela pokrivenosti - Inkrement 1

| PBI | Naziv funkcionalnosti | User Story |
|---|---|---|
| PBI-001 | Registracija, prijava i odjava korisnika | US-01 Samostalna registracija korisnika usluge |
| PBI-001 | Registracija, prijava i odjava korisnika | US-02 Prijava korisnika u sistem |
| PBI-001 | Registracija, prijava i odjava korisnika | US-03 Odjava korisnika iz sistema |
| PBI-002 | Kontrola pristupa prema korisničkoj ulozi (RBAC) | US-04 Kontrola pristupa prema korisničkoj ulozi |
| PBI-004 | Kreiranje zahtjeva za servisnu intervenciju | US-05 Prijava zahtjeva za servisnu intervenciju |
| PBI-005 | Pregled detalja vlastitog zahtjeva | US-06 Pregled vlastitog zahtjeva |
| PBI-006 | Izmjena i otkazivanje vlastitog zahtjeva | US-26 Izmjena vlastitog zahtjeva |
| PBI-006 | Izmjena i otkazivanje vlastitog zahtjeva | US-27 Otkazivanje vlastitog zahtjeva |
| PBI-007 | Pregled liste aktivnih i otvorenih intervencija | US-07 Pregled otvorenih intervencija |
| PBI-007 | Pregled liste aktivnih i otvorenih intervencija | US-13 Pregled statusa intervencija od strane dispečera |
| PBI-008 | Pregled detalja pojedinačne intervencije za dispečera | US-08 Pregled detalja pojedinačne intervencije |
| PBI-010 | Određivanje prioriteta intervencije | US-12 Određivanje prioriteta intervencije |
| PBI-011 | Planiranje izlazaka na teren | US-11 Planiranje intervencije |

---

## Inkrement 2 - Izvršenje intervencije, zatvaranje i administrativna kontrola

| Element | Opis |
|---|---|
| **Cilj inkrementa** | Zaokružiti sistem kroz funkcionalnosti koje omogućavaju stvarnu operativnu realizaciju intervencije, saradnju između dispečera i servisera, evidentiranje i zatvaranje rada, kao i osnovnu administrativnu i nadzornu kontrolu nad korisnicima i aktivnostima sistema. Ovaj inkrement treba predstavljati prvu cjelovitu funkcionalnu verziju sistema. |
| **Glavne funkcionalnosti** | **Dodjela i operativna organizacija rada**<br>- dodjela intervencije glavnom izvršiocu<br>- dodjela intervencije timu servisera<br>- promjena izvršioca intervencije<br>- vraćanje zadatka na ponovnu dodjelu<br><br>**Serviserski tok izvršenja**<br>- pregled dodijeljenih intervencija od strane servisera<br>- pregled detalja zadatka na terenu<br>- prihvatanje zadatka<br>- odbijanje zadatka<br>- ažuriranje statusa intervencije od strane servisera<br>- evidentiranje izvršenog rada<br><br>**Zatvaranje i praćenje intervencije**<br>- pregled evidentiranog rada od strane dispečera<br>- potvrda i zatvaranje intervencije<br>- razmjena napomena na intervenciji<br>- pregled historije aktivnosti intervencije<br><br>**Administrativna i nadzorna kontrola**<br>- pregled korisničkih naloga<br>- promjena korisničke uloge<br>- deaktivacija korisničkog naloga<br>- pregled sažetog operativnog statusa na kontrolnoj tabli |
| **Zavisnosti** | - stabilno implementiran prvi inkrement<br>- jasno definisana pravila statusnih prelaza<br>- konzistentan model intervencije, dodjele i izvršioca<br>- funkcionalna veza između korisničkog, dispečerskog i serviserskog dijela sistema<br>- osnovna podrška za evidenciju aktivnosti i audit trag |
| **Glavni rizici** | - visoka složenost alternativnih i operativnih tokova<br>- ograničeno backend znanje u timu i oslanjanje na manji broj ključnih članova<br>- problemi pri dodjeli, odbijanju i preraspodjeli zadataka<br>- regresije ranije implementiranih funkcionalnosti<br>- greške u evidenciji rada, historiji aktivnosti i zatvaranju intervencije<br>- prenatrpanost sprintova 9 i 10 ako se previše složenih funkcionalnosti razvija paralelno |
| **Okvirni sprintovi realizacije** | **Sprint 9**<br>**Planirana release tačka:** kraj Sprinta 9 |

---

## Kontrolna tabela pokrivenosti - Inkrement 2

| PBI | Naziv funkcionalnosti | User Story |
|---|---|---|
| PBI-003 | Upravljanje korisničkim nalozima | US-18 Administrativno kreiranje internog korisničkog naloga |
| PBI-003 | Upravljanje korisničkim nalozima | US-19 Pregled postojećih korisničkih naloga |
| PBI-003 | Upravljanje korisničkim nalozima | US-20 Promjena korisničke uloge |
| PBI-003 | Upravljanje korisničkim nalozima | US-21 Deaktivacija korisničkog naloga |
| PBI-009 | Pregled operativnog statusa na kontrolnoj tabli | US-31 Pregled sažetog operativnog statusa intervencija |
| PBI-012 | Dodjela intervencije izvršiocu ili timu | US-09 Dodjela intervencije odgovornom serviseru |
| PBI-012 | Dodjela intervencije izvršiocu ili timu | US-10 Dodjela intervencije timu servisera |
| PBI-013 | Preraspodjela i ponovna dodjela intervencije | US-28 Promjena izvršioca intervencije |
| PBI-013 | Preraspodjela i ponovna dodjela intervencije | US-29 Vraćanje zadatka na ponovnu dodjelu |
| PBI-014 | Pregled dodijeljenih zadataka | US-15 Pregled dodijeljenih intervencija |
| PBI-014 | Pregled dodijeljenih zadataka | US-16 Pregled detalja zadatka na terenu |
| PBI-015 | Prihvatanje ili odbijanje dodijeljenog zadatka | US-22 Prihvatanje dodijeljenog zadatka |
| PBI-015 | Prihvatanje ili odbijanje dodijeljenog zadatka | US-23 Odbijanje dodijeljenog zadatka |
| PBI-016 | Ažuriranje statusa intervencije od strane servisera | US-14 Ažuriranje statusa intervencije od strane servisera |
| PBI-017 | Evidentiranje izvršenog rada | US-17 Evidentiranje izvršenog rada |
| PBI-018 | Pregled evidentiranog izvršenog rada | US-24 Pregled evidentiranog izvršenog rada |
| PBI-019 | Potvrda i zatvaranje intervencije | US-25 Potvrda i zatvaranje intervencije |
| PBI-020 | Napomene na intervenciji | US-30 Razmjena napomena na intervenciji |
| PBI-021 | Historija aktivnosti intervencije | US-32 Pregled historije aktivnosti intervencije |
| PBI-021 | Historija aktivnosti intervencije | US-39 Audit trail sa starim i novim vrijednostima |
| PBI-021 | Historija aktivnosti intervencije | US-44 Tabelarni pregled historije aktivnosti |
| PBI-009 | Pregled operativnog statusa na kontrolnoj tabli | US-41 SLA praćenje |
| PBI-009 | Pregled operativnog statusa na kontrolnoj tabli | US-45 SLA eskalacije |
| PBI-017 | Evidentiranje izvršenog rada | US-38 Obavezno trajanje pri evidentiranju rada |
| PBI-017 | Evidentiranje izvršenog rada | US-43 Upload fotografije intervencije |
| PBI-017 | Evidentiranje izvršenog rada | US-46 Evidencija materijala i dijelova |
| PBI-013 | Preraspodjela i ponovna dodjela intervencije | US-40 Označavanje intervencije kao nije riješena |
| PBI-013 | Preraspodjela i ponovna dodjela intervencije | US-47 Praćenje nije riješeno iz prve |

> **Napomena:** Kontrolne tabele obuhvataju PBI-jeve i user storyje US-01–US-47 raspoređene u dva planirana inkrementa. Sprint 9 zatvara Inkrement 2.

## Završna stabilizacija

Sprint 11 nije planiran kao poseban inkrement, nego kao završni sprint usmjeren na:

- ispravljanje uočenih grešaka
- regresijsko testiranje
- integraciono i sistemsko testiranje
- doradu postojećih funkcionalnosti
- dopunu dokumentacije
- pripremu za demonstraciju i predaju

