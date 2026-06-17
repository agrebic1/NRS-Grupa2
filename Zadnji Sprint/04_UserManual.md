# Korisnički priručnik (User Manual)

# InterServ

## 1. Kome je sistem namijenjen

InterServ je web aplikacija za prijavu i obradu **servisnih intervencija** (kvarovi u stanu ili objektu: vodovod, elektro, grijanje, klima, bravarija, građevinski radovi, kućanski uređaji, IT/mreže i ostalo). Namijenjen je:

- **korisnicima** koji žele prijaviti kvar i pratiti njegovo rješavanje,
- **servisnoj firmi** (dispečerima i serviserima) koja organizuje i izvodi intervencije,
- **administratorima** koji upravljaju nalozima i ulogama.

Aplikacija radi u web pregledniku, bez instalacije. Zamjenjuje ručno vođenje naloga (telefon, tabele) jedinstvenom platformom sa standardiziranim tokom rada, praćenjem rokova i obavijestima.

---

## 2. Koje korisničke uloge postoje


| Uloga                  | Šta radi                                                                                                                                                                                                   |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Korisnik (Klijent)** | Prijavljuje kvar, prati status, predlaže termine, otkazuje zahtjev (dok je u početnom statusu), ocjenjuje završenu intervenciju, gleda svoju historiju. Može aktivirati **Premium** za prioritetnu obradu. |
| **Dispečer**           | Pregleda pristigle zahtjeve, određuje prioritet (trijaža), dogovara termin, dodjeljuje servisera (i pomoćni tim), prati izvršenje, zatvara intervenciju, koristi izvještaje i analitiku.                   |
| **Serviser**           | Vidi dodijeljene intervencije, prihvata/odbija zadatak, mijenja statuse na terenu, evidentira obavljeni rad i materijal, dodaje slike, vidi rutu do lokacije.                                              |
| **Administrator**      | Upravlja korisnicima i ulogama, kreira interne naloge, suspenduje/aktivira naloge, mijenja premium status, odobrava prijave partnera.                                                                      |


> **Više uloga:** zaposleni (serviser/dispečer/admin) automatski imaju i ulogu korisnika. Ako imate više uloga, nakon prijave birate aktivnu zonu na stranici **Odabir uloge**.

---

## 3. Kako se korisnik prijavljuje

**Registracija (novi korisnik):**

1. Otvorite `https://nrs-grupa2.vercel.app/` i kliknite **Registracija**.
2. Unesite ime, prezime, email, broj telefona i lozinku (najmanje **8 znakova**: veliko i malo slovo, broj i specijalni znak).
3. Potvrdite registraciju.
  - **Očekivani rezultat:** sistem kreira nalog i traži **potvrdu email adrese**; slanje zahtjeva je blokirano dok email nije potvrđen.
4. Otvorite email i kliknite na link za potvrdu.
  - **Očekivani rezultat:** nalog postaje aktivan i možete koristiti funkcionalnosti korisnika.

**Prijava:**

1. Kliknite **Prijava**, unesite email i lozinku.
  - **Očekivani rezultat:** nakon uspješne prijave sistem vas vodi u vašu zonu, ili ako imate više uloga na **Odabir uloge**.

> **Sigurnosna napomena:** ako prijava ne uspije, sistem prikazuje **istu, neutralnu poruku** („Neispravni podaci za prijavu.") i ne otkriva da li nalog postoji ili je neaktivan/nepotvrđen, to je namjerno, radi sigurnosti.

---

## 4. Testni korisnici / demo kredencijali


| Uloga         | Email          | Lozinka        |
| ------------- | -------------- | -------------- |
| Administrator | `____________` | `____________` |
| Dispečer      | `____________` | `____________` |
| Serviser      | `____________` | `____________` |
| Korisnik      | `____________` | `____________` |


---

## 5. Opis glavnih ekrana

**...............................**

---

## 6. Korak-po-korak: najvažniji tokovi

> Format: **Kao ****, da bih ****, uradim korake 1, 2, 3. Očekivani rezultat: …**

## ....

## 7. Premium usluga (važna napomena)

Premium omogućava **prioritetnu (hitnu)** obradu i, uz aktivan paket, označavanje pojedinog zahtjeva kao hitnog. U ovoj verziji je **naplata simulirana**, ne postoji stvarno plaćanje karticom; aktivacija i period važenja se postavljaju sistemski.

---

## 8. Objašnjenje ograničenja sistema

- **Premium naplata je simulirana** -> nema stvarnog plaćanja.
- **Email obavijesti** rade samo ako je sistem konfigurisan za slanje emaila (inače se ne šalju).
- **Ruta servisera** je procjena (udaljenost/trajanje), nije navigacijski precizna; zahtijeva postavljenu **baznu lokaciju** servisera.
- **Nema offline rada** -> potreban je internet.
- **Nema „push" obavijesti** -> obavijesti se vide u aplikaciji (uz osvježavanje).
- Aplikacija je **demo/MVP** -> namijenjena prikazu i testiranju, ne masovnoj produkciji.

---

## 9. Šta korisnik ne može raditi

- Ne može **slati zahtjev** dok ne potvrdi email adresu.
- Ne može **izmijeniti ili otkazati** zahtjev nakon što uđe u obradu (dozvoljeno samo u početnom statusu).
- Ne može **ocijeniti** intervenciju koja nije zatvorena, niti ocjenu mijenjati nakon spremanja (jedna ocjena po intervenciji).
- Ne može vidjeti **tuđe** zahtjeve/intervencije (kontrola pristupa po ulozi).
- Korisnik ne može pristupiti dispečerskim/serviserskim/admin ekranima (sistem preusmjerava).
- Premium zahtjev (hitno) može kreirati samo korisnik s **aktivnim** premium statusom.

.................