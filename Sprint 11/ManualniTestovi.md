# Manualni testovi — Sprint 11

Datum: 07/06/2026  
Artefakt: `SB-11-42` | 42 testova | 42/42 PASS

---

## T1: Korisnik — US-54 (Historija) i US-52 (Ocjena)

| ID | Naziv | US | Status | Testirao |
|----|-------|-----|--------|----------|
| T1-01 | Historija — otvaranje stranice | US-54 | Pass | Suada Peci |
| T1-02 | Historija — detalji intervencije | US-54 | Pass | Suada Peci |
| T1-03 | Historija — prazno stanje | US-54 | Pass | Suada Peci |
| T1-04 | Historija — aktivni zahtjevi nisu u historiji | US-54 | Pass | Suada Peci |
| T1-05 | Historija — RBAC blokiranje bez prijave | US-54 | Pass | Suada Peci |
| T1-06 | Historija — API IDOR zaštita | US-54 | Pass | Suada Peci |
| T1-07 | Ocjena — obrazac za zatvorenu intervenciju | US-52 | Pass | Suada Peci |
| T1-08 | Ocjena — unos ocjene i komentara | US-52 | Pass | Suada Peci |
| T1-09 | Ocjena — bez komentara | US-52 | Pass | Suada Peci |
| T1-10 | Ocjena — duplikat blokiran | US-52 | Pass | Suada Peci |
| T1-11 | Ocjena — nije zatvorena intervencija | US-52 | Pass | Suada Peci |
| T1-12 | Ocjena — API prihvata samo 1–5 | US-52 | Pass | Suada Peci |
| T1-13 | Ocjena — tuđa intervencija blokirana | US-52 | Pass | Suada Peci |
| T1-14 | Ocjena — vidljiva u historiji | US-52 | Pass | Suada Peci |

---

## T2: Dispečer — US-53 (Dugo čekanje)

| ID | Naziv | US | Status | Testirao |
|----|-------|-----|--------|----------|
| T2-01 | Dugo čekanje — vizualni bedž na kartici | US-53 | Pass | Kerim Gazić |
| T2-02 | Dugo čekanje — poruka u detalju zahtjeva | US-53 | Pass | Kerim Gazić |
| T2-03 | Dugo čekanje — pravilni pragovi po statusu | US-53 | Pass | Kerim Gazić |
| T2-04 | Dugo čekanje — ukida se po napretku | US-53 | Pass | Kerim Gazić |
| T2-05 | Dugo čekanje — dashboard KPI | US-53 | Pass | Kerim Gazić |
| T2-06 | Dugo čekanje — nema bedža za izvršne statuse | US-53 | Pass | Kerim Gazić |
| T2-07 | Dugo čekanje — RBAC blokira korisnika | US-53 | Pass | Kerim Gazić |

---

## T3: Serviser — US-51 (Bazna lokacija i ruta)

| ID | Naziv | US | Status | Testirao |
|----|-------|-----|--------|----------|
| T3-01 | Bazna lokacija — unos koordinata | US-51 | Pass | Eldin Begić |
| T3-02 | Bazna lokacija — izmjena | US-51 | Pass | Eldin Begić |
| T3-03 | Ruta — prikaz mape za intervenciju | US-51 | Pass | Eldin Begić |
| T3-04 | Ruta — prikazana udaljenost i trajanje | US-51 | Pass | Eldin Begić |
| T3-05 | Ruta — vanjska navigacija | US-51 | Pass | Eldin Begić |
| T3-06 | Ruta — fallback bez bazne lokacije | US-51 | Pass | Eldin Begić |
| T3-07 | Ruta — fallback bez lokacije intervencije | US-51 | Pass | Eldin Begić |
| T3-08 | Ruta — RBAC blokira nedodijeljenu intervenciju | US-51 | Pass | Eldin Begić |
| T3-09 | Ruta — korisnik ne vidi rutu servisera | US-51 | Pass | Eldin Begić |

---

## T4: Regresija MVP i RBAC (S11-T1, S11-T2, S11-T3)

| ID | Naziv | US | Status | Testirao |
|----|-------|-----|--------|----------|
| T4-01 | Kompletan workflow od prijave do zatvaranja | S11-T1 | Pass | Hamza Bunar |
| T4-02 | Dispečerski dashboard učitava se ispravno | S11-T1 | Pass | Hamza Bunar |
| T4-03 | Analitički dashboard (US-49) | S11-T1 | Pass | Hamza Bunar |
| T4-04 | Serviser vidi samo svoje intervencije | S11-T1 | Pass | Hamza Bunar |
| T4-05 | Notifikacije dispečera/korisnika | S11-T1 | Pass | Hamza Bunar |
| T4-06 | RBAC: korisnik ne može pristupiti dispečerskim rutama | S11-T2 | Pass | Hamza Bunar |
| T4-07 | RBAC: serviser ne može pristupiti admin rutama | S11-T2 | Pass | Hamza Bunar |
| T4-08 | RBAC: korisnik ne može pristupiti historiji drugog korisnika | S11-T2 | Pass | Hamza Bunar |
| T4-09 | RBAC: korisnik ne može ocijeniti tuđu intervenciju (API) | S11-T2 | Pass | Hamza Bunar |
| T4-10 | RBAC: dispečer može vidjeti ocjenu bilo koje intervencije | S11-T2 | Pass | Hamza Bunar |
| T4-11 | UI: prazna stanja su jasna i konzistentna | S11-T3 | Pass | Hamza Bunar |
| T4-12 | UI: loading stanje je vidljivo pri dohvatu historije | S11-T3 | Pass | Hamza Bunar |

---

## Sažetak

| Grupa | Broj | Pass | Fail |
|-------|-----:|-----:|-----:|
| T1: Korisnik | 14 | 14 | 0 |
| T2: Dispečer | 7 | 7 | 0 |
| T3: Serviser | 9 | 9 | 0 |
| T4: Regresija MVP + RBAC | 12 | 12 | 0 |
| **Ukupno** | **42** | **42** | **0** |

**Stopa uspjeha:** 100 %
