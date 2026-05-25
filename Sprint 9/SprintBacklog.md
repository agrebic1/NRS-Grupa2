# Sprint Goal

## Sprint broj 9

### Sprint cilj

Zatvoriti kompletan MVP tok servisnih intervencija: preraspodjela i alternativni operativni tokovi, kontrola kvaliteta (SLA, eskalacije, audit), evidencija rada na terenu, administracija naloga, izvještaji performansi i priprema za predaju.

### Ključne stavke koje tim želi završiti

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
- praćenje intervencije nije riješene iz prve (US-47)
- pregled, promjena uloge i deaktivacija korisničkih naloga (US-19–21, US-36)
- sistemske notifikacije po ulozi (US-37)
- regresija serviserskog toka i zatvaranja (US-14–25, US-30, US-32)
- automatizirani i manuelni testovi (SB-09-36)
- STRIDE pregled i ciljani refaktoring (modali, audit helper)

### Rizici i zavisnosti

Sprint 9 nadograđuje funkcionalan tok iz Sprinta 8. Kritične zavisnosti:

- stabilni statusni prelazi i RBAC
- model `service_requests`, `intervention_activities`, `work_evidence`, `notifikacije`
- Supabase Storage `intervencije-slike`

### Postoji rizik:

- regresije pri eskalacijama SLA i ponovnim ciklusima
- nekonzistentnost dokumentacije ako se storyji ne provuku kroz sve sprint artefakte
- preopterećenje dispečerskog detalja bez postupne ekstrakcije komponenti

### Zavisnosti:

- završena dodjela i serviserski tok (Sprint 8)
- definisani US-01–US-47 u `Sprint 2/User Stories.md`


# Sprint Backlog


| ID    | User Story                                 | Prioritet | Procjena | Status   | Zadaci                                                    | Acceptance Criteria                                       |
| ----- | ------------------------------------------ | --------- | -------- | -------- | --------------------------------------------------------- | --------------------------------------------------------- |
| US-28 | Promjena izvršioca intervencije            | Srednji   | 8        | Završeno | PATCH `promijeni_izvrsioca`, modal, audit, notifikacije   | AC1–AC4                                                   |
| US-29 | Vraćanje zadatka na ponovnu dodjelu        | Srednji   | 5        | Završeno | PATCH `vrati_na_ponovnu_dodjelu`, US-47 inkrement         | AC1–AC4                                                   |
| US-40 | Označavanje intervencije kao nije riješena | Srednji   | 3        | Završeno | PATCH `oznaci_nije_rijesen`, US-47 inkrement              | AC1–AC6                                                   |
| US-38 | Obavezno trajanje pri evidentiranju rada   | Visok     | 3        | Završeno | Zod + `EvidencijaRadaModal`                               | AC1–AC5                                                   |
| US-39 | Audit trail staro/novo u historiji         | Srednji   | 5        | Završeno | `old_value`/`new_value` u handlerima + timeline           | AC1–AC5                                                   |
| US-41 | SLA praćenje                               | Srednji   | 5        | Završeno | `slaPravila.ts`, badge, KPI                               | AC1–AC6                                                   |
| US-42 | Izvještaj odziva servisera                 | Nizak     | 5        | Završeno | `izvjestajiOdziva.ts`, stranica odziva                    | AC1–AC5                                                   |
| US-43 | Upload fotografije intervencije            | Nizak     | 3        | Završeno | Storage + galerija                                        | AC1–AC6                                                   |
| US-44 | Tabelarni pregled historije aktivnosti     | Srednji   | 3        | Završeno | `AktivnostiTabela`, toggle u `HistorijaAktivnostiSekcija` | AC1–AC4: tabela hronološki, kolone polje/stara/nova/autor |
| US-45 | SLA eskalacije                             | Srednji   | 5        | Završeno | `slaEskalacije.ts`, notifikacije dispečeru, audit         | AC1–AC4: eskalacija prekoračenog SLA, cooldown            |
| US-46 | Evidencija materijala i dijelova           | Srednji   | 5        | Završeno | `stavke_materijala` JSONB, modal stavke                   | AC1–AC5: naziv/količina/jedinica                          |
| US-47 | Praćenje nije riješeno iz prve             | Srednji   | 3        | Završeno | `broj_ponovnih_ciklusa`, `PonovniCiklusBadge`             | AC1–AC4: brojač i vidljivost dispečeru                    |
| US-19 | Pregled korisničkih naloga                 | Srednji   | 3        | Završeno | `admin/korisnici` — lista korisnika sa karticama, badge statusa, filter po tipu | AC iz US-19 |
| US-20 | Promjena korisničke uloge                  | Srednji   | 3        | Završeno | PATCH `promijeni_ulogu`, `PromijeniUloguModal`, audit log | AC iz US-20 |
| US-21 | Deaktivacija korisničkog naloga            | Srednji   | 3        | Završeno | PATCH `suspenduj`/`aktiviraj`, `SuspenzijaModal`, ban_duration, audit log | AC iz US-21 |
| US-36 | Uređivanje korisničkog naloga              | Srednji   | 3        | Završeno | PATCH `uredi_podatke`, `/admin/korisnici/[id]/uredi`, ime/prezime/telefon/adresa | AC iz US-36 |
| US-37 | Sistemske notifikacije                     | Srednji   | 3        | Završeno | `NotifikacijeBell`, polling 30s, grupiranje po danu, mapping svih tipova događaja | AC1–AC6 |


