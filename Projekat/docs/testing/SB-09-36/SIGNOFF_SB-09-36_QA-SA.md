# SIGN-OFF — SB-09-36 (Sprint 9 MVP i regresija)

## Stavka

- ID: `SB-09-36`
- Naziv: Automatizirani i manuelni testovi Sprint 9
- Sprint: 9

## Obuhvat sign-offa

- Preraspodjela i alternativni tokovi (US-28, US-29, US-40, US-47)
- Obavezno trajanje evidencije rada (US-38) i materijali (US-46)
- Audit trail i tabelarna historija (US-39, US-44)
- SLA praćenje i eskalacije (US-41, US-45)
- Izvještaj odziva servisera (US-42)
- Upload fotografija intervencije (US-43)
- Administracija naloga (US-19–21, US-36)
- Sistemske notifikacije (US-37)
- Regresija dispečerskog i serviserskog toka (Sprint 7–8)
- E2E kompletni tokovi (US-25)

## Rezime rezultata

- Ukupno manualnih testova: 80 (`TC-S9-01` – `TC-S9-80`)
- Prošlo: 80
- Nije prošlo: 0
- Blokirano: 0
- Čeka ručnu QA potvrdu: 0
- Automatski testovi: 309/309 passed (Jest 286 + E2E 23)
- Coverage: Statements 98.88%, Branches 87.39%, Functions 100%, Lines 99.21%
- Otvoreni bugovi: 0

## Zaključak

SB-09-36 ima završenu automatsku regresiju i formalni ručni QA prolaz. Svi manualni testovi iz `EXEC_SB-09-36_Sprint9_ManualFlows.csv` imaju status `PASSED` (uključujući sve obavezne za sign-off, `Obavezno_za_signoff = DA`). Otvorenih kritičnih bugova nema.

Automatski dio pokriva unit/integration testove za SLA, serviserske i dispečerske API akcije Sprint 9 te E2E smoke i RBAC scenarije. Ručni dio potvrđuje operativne tokove po testerima (dispečer, serviser, audit/SLA, admin/E2E) u lokalnom i Vercel okruženju.

## Potpisnici

- QA: Ajna Ičić
- Manuelni testeri: Hamza Bunar, Eldin Begić, Kerim Gazić, Suada Peci
- Datum: 24/05/2026
