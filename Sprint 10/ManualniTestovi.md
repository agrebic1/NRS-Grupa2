# Manuelni testovi · Sprint 10 (regresija MVP + US-48–50)

**Aplikacija:** https://nrs-grupa2.vercel.app/  
**Datum izvršenja:** 01/06/2026  
**Izvor:** QA matrica tima (T1 korisnik, T2 dispečer, T3 serviser, T4 admin/RBAC)

Sažetak: **107/107 Pass** (nakon ispravki i retesta na produkciji).

---

## T1: Korisnik (Suada Peci)

| ID | Naziv testa | Pokriva | Status | Napomena |
|----|-------------|---------|--------|----------|
| T1-01 | Otvaranje početne stranice | / | Pass | |
| T1-02 | Registracija - prazna polja | US-01 | Pass | |
| T1-03 | Registracija - neispravan email | US-01 | Pass | |
| T1-04 | Registracija - slaba lozinka | US-01 | Pass | |
| T1-05 | Registracija - lozinke se ne podudaraju | US-01 | Pass | |
| T1-06 | Uspješna registracija | US-01 | Pass | |
| T1-07 | Ponovno slanje verifikacijskog emaila | US-01 | Pass | |
| T1-08 | Prijava - pogrešna lozinka | US-02 | Pass | |
| T1-09 | Prijava - dugme onemogućeno dok je prazno | US-02 | Pass | |
| T1-10 | Uspješna prijava | US-02 | Pass | |
| T1-11 | Prikaz/skrivanje lozinke | US-02 | Pass | |
| T1-12 | Korisnička početna stranica | US-06 | Pass | |
| T1-13 | Kreiranje zahtjeva - korak Vrsta zahtjeva | US-05 | Pass | |
| T1-14 | Kreiranje zahtjeva - korak Lokacija | US-05 | Pass | |
| T1-15 | Kreiranje zahtjeva - korak Termin | US-05 | Pass | |
| T1-16 | Kreiranje zahtjeva - korak Opis i kontakt | US-05 | Pass | |
| T1-17 | Kreiranje zahtjeva - korak Hitnost (trijaža) | US-05 | Pass | |
| T1-18 | Kreiranje zahtjeva - Pregled i slanje | US-05 | Pass | |
| T1-19 | Odustajanje od prijave | US-05 | Pass | |
| T1-20 | Pregled mojih zahtjeva | US-06 | Pass | |
| T1-21 | Detalj zahtjeva i status | US-06 | Pass | |
| T1-22 | Izmjena vlastitog zahtjeva | US-26 | Pass | |
| T1-23 | Otkazivanje zahtjeva | US-27 | Pass | |
| T1-24 | Premium usluga - pregled i aktivacija | US-34 | Pass | |
| T1-25 | Premium hitna intervencija u zahtjevu | US-33 | Pass | |
| T1-26 | Uređivanje profila | US-36 | Pass | |
| T1-27 | Notifikacije (zvono) | US-37 | Pass | |
| T1-28 | Odjava | US-03 | Pass | |

---

## T2: Dispečer (Kerim Gazić)

| ID | Naziv testa | Pokriva | Status | Napomena |
|----|-------------|---------|--------|----------|
| T2-01 | Prijava kao dispečer | US-02 | Pass | |
| T2-02 | Kontrolna ploča (sažetak) | US-31 | Pass | |
| T2-03 | Pregled svih zahtjeva | US-07 | Pass | |
| T2-04 | Filtriranje/sortiranje liste | US-13 | Pass | |
| T2-05 | Detalj pojedinačnog zahtjeva | US-08 | Pass | |
| T2-06 | Postavljanje operativnog prioriteta | US-12 | Pass | |
| T2-07 | Premium → automatski prioritet HITNO | US-33 | Pass | |
| T2-08 | Smanjenje premium prioriteta uz obrazloženje | US-12 | Pass | |
| T2-09 | Planiranje intervencije (termin) | US-11 | Pass | |
| T2-10 | Konflikt termina servisera | US-11 | Pass | |
| T2-11 | Preporuka servisera (score) | US-09 | Pass | |
| T2-12 | Dodjela serviseru | US-09 | Pass | |
| T2-13 | Dodjela timu (više servisera) | US-10 | Pass | |
| T2-14 | Anti-duplikat člana tima | US-10 | Pass | |
| T2-15 | Promjena izvršioca | US-28 | Pass | |
| T2-16 | SLA status badge | US-41 | Pass | |
| T2-17 | Filter po SLA statusu | US-41 | Pass | |
| T2-18 | Pregled intervencija | US-13 | Pass | |
| T2-19 | Pregled evidentiranog rada | US-24 | Pass | |
| T2-20 | Zatvaranje bez evidencije je blokirano | US-25 | Pass | |
| T2-21 | Uspješno zatvaranje intervencije | US-25 | Pass | |
| T2-22 | Napomene na intervenciji | US-30 | Pass | |
| T2-23 | Historija aktivnosti - timeline | US-32 | Pass | |
| T2-24 | Historija - tabelarni prikaz | US-44 | Pass | |
| T2-25 | Audit: stara → nova vrijednost | US-39 | Pass | |
| T2-26 | Izvještaj odziva po serviseru | US-42 | Pass | |
| T2-27 | Broj ponovnih ciklusa (badge) | US-47 | Pass | |
| T2-28 | Notifikacije dispečera | US-37 | Pass | |

---

## T3: Serviser (Eldin Begić)

| ID | Naziv testa | Pokriva | Status | Napomena |
|----|-------------|---------|--------|----------|
| T3-01 | Prijava kao serviser | US-02 | Pass | |
| T3-02 | Serviserski pregled (dashboard) | US-15 | Pass | |
| T3-03 | Lista dodijeljenih intervencija | US-15 | Pass | |
| T3-04 | Detalj zadatka na terenu | US-16 | Pass | |
| T3-05 | Prihvatanje zadatka | US-22 | Pass | |
| T3-06 | Odbijanje zadatka (razlog obavezan) | US-23 | Pass | |
| T3-07 | Promjena statusa / faze rada | US-14 | Pass | |
| T3-08 | Kontrolna lista prije evidencije | US-17 | Pass | |
| T3-09 | Otvaranje evidencije rada | US-17 | Pass | |
| T3-10 | Obavezno trajanje rada | US-38 | Pass | |
| T3-11 | Dodavanje materijala/dijela | US-46 | Pass | |
| T3-12 | Više stavki materijala | US-46 | Pass | |
| T3-13 | Spremanje evidencije rada | US-17 | Pass | |
| T3-14 | Upload fotografije (ispravan format) | US-43 | Pass | |
| T3-15 | Upload fotografije (neispravan format) | US-43 | Pass | |
| T3-16 | Pregled galerije fotografija | US-43 | Pass | |
| T3-17 | Vraćanje na ponovnu dodjelu | US-29 | Pass | |
| T3-18 | Označavanje „nije riješeno“ | US-40 | Pass | |
| T3-19 | Brojač ponovnih ciklusa | US-47 | Pass | |
| T3-20 | Napomena servisera | US-30 | Pass | |
| T3-21 | Historija aktivnosti (serviser) | US-32 | Pass | |
| T3-22 | Završetak intervencije traži evidenciju | US-25 | Pass | |
| T3-23 | Notifikacija o novom zadatku | US-37 | Pass | |
| T3-24 | Pristup samo svojim intervencijama | US-04 | Pass | |
| T3-25 | Odjava | US-03 | Pass | |

---

## T4: Administrator i RBAC (Hamza Bunar)

| ID | Naziv testa | Pokriva | Status | Napomena |
|----|-------------|---------|--------|----------|
| T4-01 | Prijava kao administrator | US-02 | Pass | |
| T4-02 | Admin pregled | US-19 | Pass | |
| T4-03 | Pregled korisničkih naloga | US-19 | Pass | |
| T4-04 | Pretraga / prazno stanje | US-19 | Pass | |
| T4-05 | Kreiranje novog naloga | US-18 | Pass | |
| T4-06 | Kreiranje naloga - duplikat emaila | US-18 | Pass | |
| T4-07 | Promjena uloge korisnika | US-20 | Pass | |
| T4-08 | Deaktivacija naloga | US-21 | Pass | |
| T4-09 | Deaktivirani korisnik gubi pristup | US-21 | Pass | |
| T4-10 | Admin uređuje tuđi nalog | US-36 | Pass | |
| T4-11 | Zaštita vlastitog naloga | US-21 | Pass | |
| T4-12 | Pregled uposlenika/servisera | US-19 | Pass | |
| T4-13 | Pregled partner aplikacija | US-35 | Pass | |
| T4-14 | Obrada partner aplikacije | US-35 | Pass | |
| T4-15 | Javna forma „Postani partner“ | US-35 | Pass | |
| T4-16 | RBAC - korisnik ne smije dispečerske stranice | US-04 | Pass | |
| T4-17 | RBAC - korisnik ne smije admin stranice | US-04 | Pass | |
| T4-18 | RBAC - serviser ne smije admin stranice | US-04 | Pass | |
| T4-19 | RBAC - tuđi resurs preko URL-a | US-04 | Pass | |
| T4-20 | Ograničenje pokušaja prijave (rate-limit) | US-02 | Pass | |
| T4-21 | Indikator jačine lozinke | US-01 | Pass | |
| T4-22 | Promjena uloge (multi-role nalog) | US-04 | Pass | |
| T4-23 | Sesija - odjava poništava pristup | US-03 | Pass | |
| T4-24 | Notifikacije po ulozi (admin) | US-37 | Pass | |
| T4-25 | Neovlašteni pristup odjavljenog | US-04 | Pass | |
| T4-26 | Mobilni meni (responzivnost) | / | Pass | |

---

Detaljni koraci, preduslovi i očekivani rezultati: [`Projekat/docs/testing/SB-10-107/TC_SB-10-107_Sprint10_ManualFlows.csv`](../Projekat/docs/testing/SB-10-107/TC_SB-10-107_Sprint10_ManualFlows.csv) (mapiranje T1-01 = TC-S10-001, …, T4-26 = TC-S10-107). Izvršenje: [`EXEC_SB-10-107_Sprint10_ManualFlows.csv`](../Projekat/docs/testing/SB-10-107/EXEC_SB-10-107_Sprint10_ManualFlows.csv).
