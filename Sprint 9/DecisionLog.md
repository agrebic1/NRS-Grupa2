# Decision Log

## Odluka #001 – Obavezno trajanje pri evidenciji rada

| Polje | Opis |
|---|---|
| ID odluke | DLI-016 |
| Datum | 22.05.2026. |
| Kratak naziv odluke | Obavezno `trajanje_minuta` |
| Opis problema | Polje trajanja u evidenciji rada bilo je opcionalno, što je dovodilo do nepotpunih zapisa i nerealnih izvještaja o utrošenom vremenu. |
| Razmatrane opcije | 1. Ostaviti trajanje opcionalno <br> 2. Učiniti trajanje obaveznim s validacijom 1–1440 minuta <br> 3. Automatski izračunati trajanje iz vremenskih oznaka |
| Odabrana opcija | Obavezno trajanje s Zod validacijom `.int().min(1).max(1440)` na backendu i required poljem u UI |
| Razlog izbora | Najmanji rizik implementacije u odnosu na automatski izračun; direktno ispunjava US-38 AC1–AC3 |
| Posljedice odluke | Postojeći testovi i API pozivi bez trajanja vraćaju 400; ažurirani integration testovi u Sprintu 9 |
| Status odluke | aktivna |

---

## Odluka #002 – SLA rokovi po operativnom prioritetu

| Polje | Opis |
|---|---|
| ID odluke | DLI-017 |
| Datum | 22.05.2026. |
| Kratak naziv odluke | SLA engine po prioritetu |
| Opis problema | Dispečer nije imao centralizovan uvid kada intervencija približava ili prelazi dogovoreni rok odziva. |
| Razmatrane opcije | 1. Ručna procjena dispečera <br> 2. Fiksni rok za sve intervencije <br> 3. Rokovi po prioritetu (HITNO/KRITIČNO 2h, VISOKO 8h, SREDNJE 24h, NISKO 72h) |
| Odabrana opcija | Modul `slaPravila.ts` s izračunom roka od `created_at`, statusima `ok` / `upozorenje` (<2h) / `prekoračeno` |
| Razlog izbora | Usklađeno s US-41 AC5; ne primjenjuje se na zatvorene/otkazane intervencije |
| Posljedice odluke | GET liste intervencija dispečera vraća `sla_status` i `sla_preostalo`; KPI dashboard prikazuje broj prekoračenih |
| Status odluke | aktivna |

---

## Odluka #003 – Audit trail sa `old_value` / `new_value`

| Polje | Opis |
|---|---|
| ID odluke | DLI-018 |
| Datum | 22.05.2026. |
| Kratak naziv odluke | Strukturirani audit u aktivnostima |
| Opis problema | Historija aktivnosti prikazivala je tip promjene bez konkretnih vrijednosti prije/poslije. |
| Razmatrane opcije | 1. Samo tekstualni `opis` <br> 2. Kolone `old_value` / `new_value` u `intervention_activities` <br> 3. Odvojeni audit servis |
| Odabrana opcija | Popunjavanje `old_value`/`new_value` u handlerima za status, servisera i prioritet; UI prikaz `→` |
| Razlog izbora | Kolone postoje od Sprinta 8; minimalan dodatni rad, ispunjava US-39 |
| Posljedice odluke | Svi relevantni PATCH handleri moraju logovati par vrijednosti |
| Status odluke | aktivna |

---

## Odluka #004 – „Nije riješeno“ vraća intervenciju u `potvrdeno`

| Polje | Opis |
|---|---|
| ID odluke | DLI-019 |
| Datum | 22.05.2026. |
| Kratak naziv odluke | Povrat u dispečerski tok |
| Opis problema | Serviser ponekad ne može završiti rad u statusu `u_izvrsenju` bez ponovne organizacije. |
| Razmatrane opcije | 1. Novi status `nije_rijeseno` <br> 2. Povratak na `potvrdeno` uz brisanje `serviser_dodijeljen_id` <br> 3. Automatska dodjela drugom serviseru |
| Odabrana opcija | Akcija `oznaci_nije_rijesen` iz `u_izvrsenju` → `potvrdeno`, audit tip `nije_rijeseno`, notifikacija dispečeru |
| Razlog izbora | Konzistentno s `vrati_na_ponovnu_dodjelu`; dispečer ponovo dodjeljuje iz poznatog stanja |
| Posljedice odluke | Novi tip aktivnosti i notifikacijska funkcija `notifNijeRijesen` |
| Status odluke | aktivna |

---

## Odluka #005 – Konsolidacija serviserske navigacije

| Polje | Opis |
|---|---|
| ID odluke | DLI-020 |
| Datum | 22.05.2026. |
| Kratak naziv odluke | Redirect `/serviser/zadaci` |
| Opis problema | Duplikat rute i navigacije (`zadaci` vs `intervencije`) zbunjivao je korisnike i testove. |
| Razmatrane opcije | 1. Zadržati obje rute <br> 2. Redirect na `/serviser/intervencije` i ukloniti duplikat iz nav-a |
| Odabrana opcija | Redirect 308/rewrite na kanonsku rutu `intervencije` |
| Razlog izbora | Jedan izvor istine za serviserski pregled (N7) |
| Posljedice odluke | Bookmark na staru rutu i dalje radi |
| Status odluke | aktivna |

---

## Odluka #006 — Tabelarni prikaz historije (US-44)

| ID odluke | DLI-022 |
| Odabrana opcija | `AktivnostiTabela` + toggle u `HistorijaAktivnostiSekcija` |

---

## Odluka #007 — SLA eskalacije (US-45)

| ID odluke | DLI-023 |
| Odabrana opcija | `slaEskalacije.ts`, cooldown 6h |

---

## Odluka #008 — Materijal stavke (US-46)

| ID odluke | DLI-024 |
| Odabrana opcija | JSONB `stavke_materijala` |
