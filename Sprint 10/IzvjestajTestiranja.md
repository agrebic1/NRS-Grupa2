# Izvještaj testiranja

## Sprint 10

Datum: 01/06/2026

## Obuhvat

Validacija je rađena kroz:

- **automatske testove** (unit + integration) za US-48, US-49, regresiju bugfixeva i postojeći MVP
- **manuelne testove** regresije cijelog MVP toka (US-01–US-47) i novih funkcionalnosti (T1–T4, **107** scenarija)

Pokriveni domeni (Sprint 10 fokus):

| User story | Opis | Automatski | Manuelno |
|------------|------|------------|----------|
| US-48 | Geo-preporuka servisera (Haversine, scoring, UI udaljenost) | Da | T2-11 |
| US-49 | Analitički dashboard dispečera | Da | / |
| US-50 | Responsive / a11y serviser | Djelomično (lint/UI) | T4-26 |
| S10-T1 | E2E RBAC | `tests/e2e/rbac.cross-access.spec.ts` (23/23 e2e) | T4-16–19, T4-25 |

Regresija MVP (manuelno): auth, zahtjevi, dispečer, serviser, admin.

**Artefakti (template SB-10-107):**

- Test matrica: [`Projekat/docs/testing/SB-10-107/TC_SB-10-107_Sprint10_ManualFlows.csv`](../Projekat/docs/testing/SB-10-107/TC_SB-10-107_Sprint10_ManualFlows.csv)
- Izvršenje: [`EXEC_SB-10-107_Sprint10_ManualFlows.csv`](../Projekat/docs/testing/SB-10-107/EXEC_SB-10-107_Sprint10_ManualFlows.csv)
- Izvještaj: [`IZVJESTAJ_SB-10-107_Sprint10_Testiranje.md`](../Projekat/docs/testing/SB-10-107/IZVJESTAJ_SB-10-107_Sprint10_Testiranje.md)
- Sign-off: [`SIGNOFF_SB-10-107_QA-SA.md`](../Projekat/docs/testing/SB-10-107/SIGNOFF_SB-10-107_QA-SA.md)
- Sažetak: [`ManualniTestovi.md`](ManualniTestovi.md)

---

## Rezultati automatskih testova

Komande (01/06/2026):

```text
npm run test:unit
npm run test:integration
npm test
npm run test:e2e
```

### Unit

| Metrika | Rezultat |
|---------|----------|
| Test suiteovi | 24/24 PASS |
| Testovi | **321/321 PASS** |

Novi / prošireni suiteovi (Sprint 10):

- `tests/unit/preporukaServisera.test.ts` · US-48 Haversine, scoring, bonus blizine
- `tests/unit/analitikaMetrike.test.ts` · US-49 agregacije KPI
- `tests/unit/korisniciFilter.test.js` · US-19 admin pretraga/filter
- `tests/unit/ponovniCiklus.test.js` · US-47 inkrement ciklusa
- `tests/unit/aktivnostiPrikaz.test.js` · US-39/44 prikaz imena u historiji
- `tests/unit/kontaktTelefon.test.ts` · validacija telefona (T1-16)
- `tests/unit/dodjelaServisera.test.js` · prošireno `provjeriServiserPristup`
- `tests/unit/serviserskeAkcije.test.js` · US-46 stavke materijala

### Integration

| Metrika | Rezultat |
|---------|----------|
| Test suiteovi | 15/15 PASS |
| Testovi | **124/124 PASS** |
| Novi Sprint 10 | `api.dispecer.analitika.test.js`, `api.dispecer.preporuka.test.js` |
| Ispravke mockova | `api.admin.users.test.js` (`korisnik_usluge` upsert), `api.auth.uloge.test.js` (multi-uloga) |

### E2E (Playwright · S10-T1)

| Metrika | Rezultat |
|---------|----------|
| Testovi | **23/23 PASS** |
| RBAC | `tests/e2e/rbac.cross-access.spec.ts` (4 scenarija) |
| Ostalo | auth smoke, korisnik zahtjev, admin create, dispečer/serviser tokovi |

Ispravka S10-T1: middleware dozvoljava `/korisnik` zaposlenicima bez reda u `korisnik_usluge` (usklađeno s `GET /api/auth/uloge`). Time su prošla oba ranija pada u RBAC e2e.

### Ukupno automatskih (unit + integration + e2e)

**468/468 PASS** (321 + 124 + 23)

---

## Rezultati manuelnih testova

**Izvor:** QA matrica tima (Suada Peci, Kerim Gazić, Eldin Begić, Hamza Bunar), 01/06/2026.  
**Puna lista:** [`ManualniTestovi.md`](ManualniTestovi.md)

### Sažetak

| Grupa | Broj | Pass | Partial | Fail |
|-------|-----:|-----:|--------:|-----:|
| T1: Korisnik | 28 | 28 | 0 | 0 |
| T2: Dispečer | 28 | 28 | 0 | 0 |
| T3: Serviser | 25 | 25 | 0 | 0 |
| T4: Admin / RBAC | 26 | 26 | 0 | 0 |
| **Ukupno** | **107** | **107** | **0** | **0** |

**Stopa uspjeha:** 100 %

### T1: Korisnik

| ID | Naziv | US | Status | Testirao |
|----|-------|-----|--------|----------|
| T1-01 | Otvaranje početne stranice | / | Pass | Suada Peci |
| T1-02 | Registracija - prazna polja | US-01 | Pass | Suada Peci |
| T1-03 | Registracija - neispravan email | US-01 | Pass | Suada Peci |
| T1-04 | Registracija - slaba lozinka | US-01 | Pass | Suada Peci |
| T1-05 | Registracija - lozinke se ne podudaraju | US-01 | Pass | Suada Peci |
| T1-06 | Uspješna registracija | US-01 | Pass | Suada Peci |
| T1-07 | Ponovno slanje verifikacijskog emaila | US-01 | Pass | Suada Peci |
| T1-08 | Prijava - pogrešna lozinka | US-02 | Pass | Suada Peci |
| T1-09 | Prijava - dugme onemogućeno | US-02 | Pass | Suada Peci |
| T1-10 | Uspješna prijava | US-02 | Pass | Suada Peci |
| T1-11 | Prikaz/skrivanje lozinke | US-02 | Pass | Suada Peci |
| T1-12 | Korisnička početna stranica | US-06 | Pass | Suada Peci |
| T1-13 | Kreiranje - Vrsta zahtjeva | US-05 | Pass | Suada Peci |
| T1-14 | Kreiranje - Lokacija | US-05 | Pass | Suada Peci |
| T1-15 | Kreiranje - Termin | US-05 | Pass | Suada Peci |
| T1-16 | Kreiranje - Opis i kontakt | US-05 | Pass | Suada Peci |
| T1-17 | Kreiranje - Hitnost | US-05 | Pass | Suada Peci |
| T1-18 | Kreiranje - Pregled i slanje | US-05 | Pass | Suada Peci |
| T1-19 | Odustajanje od prijave | US-05 | Pass | Suada Peci |
| T1-20 | Pregled mojih zahtjeva | US-06 | Pass | Suada Peci |
| T1-21 | Detalj zahtjeva i status | US-06 | Pass | Suada Peci |
| T1-22 | Izmjena vlastitog zahtjeva | US-26 | Pass | Suada Peci |
| T1-23 | Otkazivanje zahtjeva | US-27 | Pass | Suada Peci |
| T1-24 | Premium - aktivacija | US-34 | Pass | Suada Peci |
| T1-25 | Premium hitna intervencija | US-33 | Pass | Suada Peci |
| T1-26 | Uređivanje profila | US-36 | Pass | Suada Peci |
| T1-27 | Notifikacije | US-37 | Pass | Suada Peci |
| T1-28 | Odjava | US-03 | Pass | Suada Peci |

### T2: Dispečer

| ID | Naziv | US | Status | Testirao |
|----|-------|-----|--------|----------|
| T2-01 | Prijava dispečer | US-02 | Pass | Kerim Gazić |
| T2-02 | Kontrolna ploča | US-31 | Pass | Kerim Gazić |
| T2-03 | Pregled zahtjeva | US-07 | Pass | Kerim Gazić |
| T2-04 | Filtriranje/sortiranje | US-13 | Pass | Kerim Gazić |
| T2-05 | Detalj zahtjeva | US-08 | Pass | Kerim Gazić |
| T2-06 | Operativni prioritet | US-12 | Pass | Kerim Gazić |
| T2-07 | Premium prioritet HITNO | US-33 | Pass | Kerim Gazić |
| T2-08 | Smanjenje prioriteta | US-12 | Pass | Kerim Gazić |
| T2-09 | Planiranje termina | US-11 | Pass | Kerim Gazić |
| T2-10 | Konflikt termina | US-11 | Pass | Kerim Gazić |
| T2-11 | Preporuka servisera (score) | US-09 | Pass | Kerim Gazić |
| T2-12 | Dodjela serviseru | US-09 | Pass | Kerim Gazić |
| T2-13 | Dodjela timu | US-10 | Pass | Kerim Gazić |
| T2-14 | Anti-duplikat tima | US-10 | Pass | Kerim Gazić |
| T2-15 | Promjena izvršioca | US-28 | Pass | Kerim Gazić |
| T2-16 | SLA badge | US-41 | Pass | Kerim Gazić |
| T2-17 | Filter SLA | US-41 | Pass | Kerim Gazić |
| T2-18 | Pregled intervencija | US-13 | Pass | Kerim Gazić |
| T2-19 | Evidencija rada (pregled) | US-24 | Pass | Kerim Gazić |
| T2-20 | Zatvaranje bez evidencije | US-25 | Pass | Kerim Gazić |
| T2-21 | Zatvaranje intervencije | US-25 | Pass | Kerim Gazić |
| T2-22 | Napomene | US-30 | Pass | Kerim Gazić |
| T2-23 | Historija - timeline | US-32 | Pass | Kerim Gazić |
| T2-24 | Historija - tabela | US-44 | Pass | Kerim Gazić |
| T2-25 | Audit stara/nova | US-39 | Pass | Kerim Gazić |
| T2-26 | Izvještaj odziva | US-42 | Pass | Kerim Gazić |
| T2-27 | Ponovni ciklusi (badge) | US-47 | Pass | Kerim Gazić |
| T2-28 | Notifikacije dispečera | US-37 | Pass | Kerim Gazić |

### T3: Serviser

| ID | Naziv | US | Status | Testirao |
|----|-------|-----|--------|----------|
| T3-01 | Prijava serviser | US-02 | Pass | Eldin Begić |
| T3-02 | Serviserski pregled | US-15 | Pass | Eldin Begić |
| T3-03 | Lista intervencija | US-15 | Pass | Eldin Begić |
| T3-04 | Detalj zadatka | US-16 | Pass | Eldin Begić |
| T3-05 | Prihvatanje zadatka | US-22 | Pass | Eldin Begić |
| T3-06 | Odbijanje zadatka | US-23 | Pass | Eldin Begić |
| T3-07 | Promjena faze rada | US-14 | Pass | Eldin Begić |
| T3-08 | Kontrolna lista | US-17 | Pass | Eldin Begić |
| T3-09 | Otvaranje evidencije | US-17 | Pass | Eldin Begić |
| T3-10 | Obavezno trajanje | US-38 | Pass | Eldin Begić |
| T3-11 | Dodavanje materijala | US-46 | Pass | Eldin Begić |
| T3-12 | Više stavki materijala | US-46 | Pass | Eldin Begić |
| T3-13 | Spremanje evidencije | US-17 | Pass | Eldin Begić |
| T3-14 | Upload JPG/PNG | US-43 | Pass | Eldin Begić |
| T3-15 | Upload neispravan | US-43 | Pass | Eldin Begić |
| T3-16 | Galerija fotografija | US-43 | Pass | Eldin Begić |
| T3-17 | Vraćanje na ponovnu dodjelu | US-29 | Pass | Eldin Begić |
| T3-18 | Nije riješeno | US-40 | Pass | Eldin Begić |
| T3-19 | Brojač ponovnih ciklusa | US-47 | Pass | Eldin Begić |
| T3-20 | Napomena servisera | US-30 | Pass | Eldin Begić |
| T3-21 | Historija aktivnosti | US-32 | Pass | Eldin Begić |
| T3-22 | Završetak bez evidencije | US-25 | Pass | Eldin Begić |
| T3-23 | Notifikacija novi zadatak | US-37 | Pass | Eldin Begić |
| T3-24 | Samo svoje intervencije | US-04 | Pass | Eldin Begić |
| T3-25 | Odjava | US-03 | Pass | Eldin Begić |

### T4: Administrator i RBAC

| ID | Naziv | US | Status | Testirao |
|----|-------|-----|--------|----------|
| T4-01 | Prijava admin | US-02 | Pass | Hamza Bunar |
| T4-02 | Admin pregled | US-19 | Pass | Hamza Bunar |
| T4-03 | Pregled korisnika | US-19 | Pass | Hamza Bunar |
| T4-04 | Pretraga / prazno stanje | US-19 | Pass | Hamza Bunar |
| T4-05 | Kreiranje naloga | US-18 | Pass | Hamza Bunar |
| T4-06 | Duplikat emaila | US-18 | Pass | Hamza Bunar |
| T4-07 | Promjena uloge | US-20 | Pass | Hamza Bunar |
| T4-08 | Deaktivacija | US-21 | Pass | Hamza Bunar |
| T4-09 | Deaktivirani gubi pristup | US-21 | Pass | Hamza Bunar |
| T4-10 | Admin uređuje tuđi nalog | US-36 | Pass | Hamza Bunar |
| T4-11 | Zaštita vlastitog naloga | US-21 | Pass | Hamza Bunar |
| T4-12 | Pregled uposlenika | US-19 | Pass | Hamza Bunar |
| T4-13 | Partner aplikacije | US-35 | Pass | Hamza Bunar |
| T4-14 | Obrada partner aplikacije | US-35 | Pass | Hamza Bunar |
| T4-15 | Postani partner (javno) | US-35 | Pass | Hamza Bunar |
| T4-16 | RBAC korisnik → dispečer | US-04 | Pass | Hamza Bunar |
| T4-17 | RBAC korisnik → admin | US-04 | Pass | Hamza Bunar |
| T4-18 | RBAC serviser → admin | US-04 | Pass | Hamza Bunar |
| T4-19 | RBAC tuđi zahtjev URL | US-04 | Pass | Hamza Bunar |
| T4-20 | Rate-limit prijava | US-02 | Pass | Hamza Bunar |
| T4-21 | Jačina lozinke | US-01 | Pass | Hamza Bunar |
| T4-22 | Promjena uloge (multi-role) | US-04 | Pass | Hamza Bunar |
| T4-23 | Odjava + back | US-03 | Pass | Hamza Bunar |
| T4-24 | Notifikacije admin | US-37 | Pass | Hamza Bunar |
| T4-25 | Neovlašten pristup | US-04 | Pass | Hamza Bunar |
| T4-26 | Mobilni meni | / | Pass | Hamza Bunar |

---

## Mapiranje automatskih testova → user stories

| US | Automatski testovi |
|----|-------------------|
| US-48 | `preporukaServisera.test.ts`, `api.dispecer.preporuka.test.js` |
| US-49 | `analitikaMetrike.test.ts`, `api.dispecer.analitika.test.js` |
| US-19 | `korisniciFilter.test.js` |
| US-36 | `api.admin.users.id.test.js`, `api.admin.users.test.js` |
| US-46 | `serviserskeAkcije.test.js` |
| US-47 | `ponovniCiklus.test.js`, `dodjelaServisera.test.js`, `api.serviser.intervencije.test.js` |
| US-39/44 | `aktivnostiPrikaz.test.js` |
| US-04 (uloge) | `api.auth.uloge.test.js`, `middleware.test.js`, `rbac.cross-access.spec.ts` |
| S10-T1 | `rbac.cross-access.spec.ts` + ostali e2e (23) |
| Regresija | postojeći integration suiteovi (dispečer, serviser, sprint9) |

---

## Zaključak

Sprint 10 testiranje je završeno uspješno:

- **Automatski:** 468/468 PASS (321 unit + 124 integration + 23 e2e)
- **Manuelni:** 107/107 PASS (regresija MVP + US-48–50)

Geo-preporuka (US-48) i analitički dashboard (US-49) pokriveni su unit i integration testovima. Manuelna regresija potvrđuje stabilnost cijelog operativnog toka na produkciji.

**Artefakti:**

- `Projekat/docs/testing/SB-10-107/` (TC, EXEC, BUG, IZVJESTAJ, SIGNOFF)
- [`ManualniTestovi.md`](ManualniTestovi.md)
- `Projekat/tests/unit/preporukaServisera.test.ts`, `analitikaMetrike.test.ts`
- `Projekat/tests/integration/api.dispecer.analitika.test.js`, `api.dispecer.preporuka.test.js`
