# Izvještaj testiranja
## Sprint 8

Datum: 18/05/2026

## Obuhvat

Validacija je rađena kroz:
- automatske testove (unit, integration, e2e)
- manuelne testove za Sprint 8 serviserske tokove (`TC-01` do `TC-28`)

Pokriveni domeni:
- dodjela intervencije odgovornom serviseru i timu servisera
- planiranje termina intervencije
- serviserski dashboard i pregled dodijeljenih zadataka
- pregled detalja zadatka na terenu
- prihvatanje i odbijanje dodijeljenog zadatka
- ažuriranje statusa intervencije od strane servisera i validacija statusnih prelaza
- evidentiranje izvršenog rada
- pregled evidentiranog rada od strane dispečera (read-only)
- potvrda i zatvaranje intervencije
- promjena izvršioca i vraćanje zadatka na ponovnu dodjelu
- razmjena internih napomena između dispečera i servisera
- pregled historije aktivnosti intervencije (audit trail)
- autorizacija serviserskih stranica i API endpointa (RBAC)

## Podjela po sprintovima

- Sprint 5: auth/RBAC osnova, registracija, prijava, odjava, sesija, role redirect i kontrola pristupa.
- Sprint 6: korisnički zahtjevi, admin kreiranje korisnika, onboarding partnera i premium tokovi.
- Sprint 7: dispečerski dashboard, liste, detalj intervencije, wizard, operativni prioritet, statusi i RBAC API provjere.
- Sprint 8: serviserski modul, dodjela i planiranje, statusni prelazi, evidencija rada, zatvaranje intervencije, napomene i historija aktivnosti.

## Dodano u Sprintu 8

- Automatski testovi: +114 u odnosu na Sprint 7 zbir (sa 111 na 225 automatskih testova).
- Manuelni test scenariji: +28 za `SB-08-XX`.
- Novi Sprint 8 automatski testovi pokrivaju statusne prelaze servisera i dispečera, validaciju dodjele servisera, API serviserskog modula (prihvatanje, odbijanje, ažuriranje statusa, evidencija rada), API dispečerskog modula (dodjela, zatvaranje), napomene i E2E smoke tok serviserskog i dispečerskog toka dodjele.

## Rezultati automatskih testova

Izvršene komande:
1. `npm test`
2. `npm run test:coverage`
3. `npm run test:e2e`

Rezultat:
- Unit testovi: 145/145 PASS
- Integration testovi: 80/80 PASS
- E2E testovi: 16/16 PASS
- Ukupno automatskih: 225/225 PASS

Coverage (`npm run test:coverage`):
- Statements: 98.88%
- Branches: 87.39%
- Functions: 100%
- Lines: 99.21%

Status cilja pokrivenosti:
- traženi minimum: 98%
- ostvareno: cilj ispunjen

## Rezultati manuelnih testova (SB-08-XX)

Izvor: `Projekat/docs/testing/SB-08-XX/EXEC_SB-08-XX_Sprint8_ServiserManualFlows.csv`

- Ukupno testova: 28
- Prošlo: 28
- Nije prošlo: 0
- Blokirano: 0
- Čeka ručnu QA potvrdu: 0
- Izvršioci: Eldin Begić, Hamza Bunar, Kerim Gazić, Suada Peci; datum izvrsenja: 19/05/2026

## Bug status

Izvor: `Projekat/docs/testing/SB-08-XX/BUG_SB-08-XX_Sprint8_ServiserManualFlows.csv`

- Otvoreni bugovi: 0

## Zaključak

Sprint 8 automatsko i manuelno testiranje je uspješno završeno. Svi automatski testovi prolaze (225/225), nema otvorenih bugova u evidenciji, a pokrivenost kritićnih modula je iznad traženog praga. Svi manualni testovi za serviserski operativni tok (SB-08-XX) izvršeni su sa statusom PASSED; QA sign-off: Ajna Ičić, 18/05/2026. Detalji u `Projekat/docs/testing/SB-08-XX/`.