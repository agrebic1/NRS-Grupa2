# Release Notes

# InterServ v1.0 (MVP)

## 1. Šta je uključeno u finalnu verziju

Finalna verzija (v1.0 / MVP) isporučuje **kompletan operativni tok servisne intervencije** za sve 4 uloge (korisnik, dispečer, serviser, administrator): od prijave kvara, preko trijaže, planiranja i dodjele, do evidencije rada, zatvaranja i ocjene, uz audit historiju, SLA praćenje, notifikacije i kontrolu pristupa. Sve korisničke priče **US-01 → US-54** su implementirane.

## 2. Najvažnije funkcionalnosti

- Registracija, prijava i kontrola pristupa po ulogama (troslojni RBAC)
- Prijava kvara kroz wizard u 6 koraka; izmjena/otkazivanje
- Dispečerska trijaža (bodovanje 0–110), prioritet, planiranje termina
- Dodjela servisera i timova + geo-preporuka najbližeg
- Serviserski tok na terenu: statusi, evidencija rada i materijala, slike, ruta
- Zatvaranje intervencije i ocjena korisnika
- Napomene i audit historija (timeline + tabela)
- SLA praćenje, eskalacije i isticanje intervencija koje dugo čekaju
- Premium usluga (**simulirana naplata**)
- Notifikacije u aplikaciji, analitički dashboard, izvještaj odziva, historija po korisniku
- Partner onboarding (prijava za internu ulogu)

## 3. Poznata ograničenja

- **Premium naplata je simulirana** (nema stvarnog plaćanja).
- **Nema offline rada** i **nema real-time push** obavijesti (obavijesti u aplikaciji uz osvježavanje).
- **Email** se šalje samo uz konfigurisan `RESEND_API_KEY` (inače log u konzolu).
- **Ruta servisera** je procjena (haversine/OSM), zavisi od postavljene bazne lokacije.
- **Coverage** je namjerno fokusiran na kritične module (≥98%); UI pokrivaju E2E + ručni testovi.

## 4. Poznati bugovi

Nema otvorenih **kritičnih** bugova. ????

## 5. Šta nije dio finalne isporuke (planirano, ali nezavršeno)

- Integracija **stvarnog payment gateway-a** (premium ostaje simuliran).
- **Real-time push** notifikacije.
- **Offline** način rada.

