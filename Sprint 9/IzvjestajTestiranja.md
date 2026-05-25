# Izvještaj testiranja

## Sprint 9

Datum: 24/05/2026

## Obuhvat

Validacija je rađena kroz:

- automatske testove (unit, integration, e2e)
- manuelne testove za Sprint 9 MVP i regresiju Sprint 7–8 (`TC-S9-01` do `TC-S9-80`, SB-09-36)

Pokriveni domeni:

- promjena izvršioca, vraćanje na ponovnu dodjelu, nije riješena (US-28, US-29, US-40, US-47)
- obavezno trajanje i materijali u evidenciji rada (US-38, US-46)
- audit trail i tabelarna historija aktivnosti (US-39, US-44)
- SLA praćenje, eskalacije i izvještaj odziva (US-41, US-42, US-45)
- upload i pregled fotografija intervencije (US-43)
- administracija korisničkih naloga (US-19–21, US-36)
- sistemske notifikacije po ulozi (US-37)
- regresija dispečerskog i serviserskog operativnog toka (US-07–US-31, US-14–US-25)
- E2E kompletni tokovi od prijave zahtjeva do zatvaranja (US-25)

## Podjela po sprintovima

- Sprint 5: auth/RBAC osnova, registracija, prijava, odjava, sesija, role redirect i kontrola pristupa.
- Sprint 6: korisnički zahtjevi, admin kreiranje korisnika, onboarding partnera i premium tokovi.
- Sprint 7: dispečerski dashboard, liste, detalj intervencije, wizard, operativni prioritet, statusi i RBAC API provjere.
- Sprint 8: serviserski modul, dodjela i planiranje, statusni prelazi, evidencija rada, zatvaranje intervencije, napomene i historija aktivnosti.
- Sprint 9: preraspodjela, SLA, izvještaji, upload slika, admin modul, notifikacije i QA SB-09-36.

## Dodano u Sprintu 9

- Automatski testovi: +61 u odnosu na Sprint 8 zbir (225 → 286 Jest; E2E 16 → 23).
- Manuelni test scenariji: +80 za `SB-09-36` (matrica iz `QA-Sprint9NRS.xlsx`).
- Novi automatski testovi pokrivaju SLA engine, Sprint 9 serviserske API akcije, regresiju evidencije i prošireni E2E RBAC.

## Rezultati automatskih testova

Izvršene komande:

1. `npm test`
2. `npm run test:coverage`
3. `npm run test:e2e`

Rezultat:

- Unit testovi: 174/174 PASS
- Integration testovi: 112/112 PASS
- E2E testovi: 23/23 PASS
- Ukupno automatskih: 309/309 PASS

Coverage (`npm run test:coverage`):

- Statements: 98.88%
- Branches: 87.39%
- Functions: 100%
- Lines: 99.21%

Status cilja pokrivenosti:

- traženi minimum: 98%
- ostvareno: cilj ispunjen

Run artefakti: `Projekat/docs/testing/Izvjestaji/` (inicijalni run `2026-05-22_21-08-17`; E2E pad riješen DLI-021, finalno 23/23 PASS).

## Rezultati manuelnih testova (SB-09-36)

Izvor: `Projekat/docs/testing/SB-09-36/EXEC_SB-09-36_Sprint9_ManualFlows.csv`  
Test case matrica: `Projekat/docs/testing/SB-09-36/TC_SB-09-36_Sprint9_ManualFlows.csv`

- Ukupno testova: 80
- Prošlo: 80
- Nije prošlo: 0
- Blokirano: 0
- Čeka ručnu QA potvrdu: 0
- Izvršioci: Hamza Bunar (TC-S9-01–20), Eldin Begić (TC-S9-21–40), Kerim Gazić (TC-S9-41–60), Suada Peci (TC-S9-61–80); datumi izvršenja: 23–24/05/2026

## Bug status

Izvor: `Projekat/docs/testing/SB-09-36/BUG_SB-09-36_Sprint9_ManualFlows.csv`

- Otvoreni bugovi: 0

## Artefakti

- sprint izvještaj: `Projekat/docs/testing/SB-09-36/IZVJESTAJ_SB-09-36_Sprint9_Testiranje.md`
- sign-off: `Projekat/docs/testing/SB-09-36/SIGNOFF_SB-09-36_QA-SA.md`
- QA matrica (izvor): `QA-Sprint9NRS.xlsx`
- automatski timestamp izvještaji: `Projekat/docs/testing/Izvjestaji/`
- zadnji run pointer: `Projekat/docs/testing/Izvjestaji/ZADNJI_RUN.txt`

## Zaključak

Sprint 9 automatsko i manuelno testiranje je uspješno završeno. Svi automatski testovi prolaze (309/309), nema otvorenih bugova u evidenciji, a pokrivenost kritičnih modula je iznad traženog praga. Svih 80 manuelnih testova za MVP i regresiju (SB-09-36) izvršeno je sa statusom PASSED; QA sign-off: Ajna Ičić, 24/05/2026. Detalji u `Projekat/docs/testing/SB-09-36/`.
