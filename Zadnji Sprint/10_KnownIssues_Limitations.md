# Known Issues / Limitations (InterServ)

## 1. Poznati bugovi / zapažanja

Nema otvorenih **kritičnih** bugova.

---

## 2. Tehnička ograničenja


| Ograničenje                               | Opis                                                                                                                                                                                                      | Uticaj                                                                                                  |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Nema offline rada                         | Web aplikacija zavisi od Supabase cloud servisa                                                                                                                                                           | Bez internet konekcije nema pristupa; prihvatljivo za MVP                                               |
| Nema real-time (push) notifikacija        | Notifikacije su u aplikaciji; nema Supabase Realtime/push                                                                                                                                                 | Potrebno osvježavanje za nove zadatke/obavijesti                                                        |
| Monolitna Next.js aplikacija              | Frontend i backend su jedan deployment                                                                                                                                                                    | Nema nezavisnog skaliranja modula; dovoljno za ciljani obim (~50 korisnika, NFR-003)                    |
| Ruta servisera = haversine/OSM procjena   | `lib/servisirane/geoIzracun.ts` koristi geometrijsku procjenu udaljenosti/trajanja, ne stvarni saobraćaj                                                                                                  | Procjena dolaska je orijentaciona, ne navigaciona tačnost                                               |
| Email zavisi od `RESEND_API_KEY`          | Bez ključa poruke se samo loguju u konzolu (ne šalju se)                                                                                                                                                  | U okruženju bez ključa korisnici ne primaju email obavijesti                                            |
| Coverage je fokusiran, ne projektno-širok | Coverage gate (`collectCoverageFrom`) namjerno mjeri kritične module (auth/RBAC/admin) gdje drži ≥98% (mjereno 98.92/87.03/99.25); UI se pokriva E2E + ručnim testovima i ne uračunava se u Jest coverage | Jest postotak nije pokrivenost cijelog projekta; svjesna strategija -> `test:coverage` prolazi (exit 0) |
| E2E zavisi od test-naloga                 | `npm run test:e2e` traži `E2E_`* kredencijale za 4 uloge                                                                                                                                                  | E2E se ne može pokrenuti bez ručno pripremljenih naloga                                                 |


---

## 3. Sigurnosna ograničenja


| Ograničenje                       | Opis                                                                      | Uticaj / mitigacija                                                                                                         |
| --------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Premium = simulirana naplata      | Nema stvarnog payment gateway-a; status i period se postavljaju sistemski | Ne smije se predstavljati kao stvarna naplata; audit ostaje u `premium_events`                                              |
| Oslanjanje na Supabase RLS        | Sigurnost podataka u velikoj mjeri ovisi o ispravnosti RLS politika       | Mitigacija: troslojni RBAC (middleware + API ponovna provjera + RLS); RLS testiran kroz uloge                               |
| Login rate-limit u memoriji       | `lib/security/loginRateLimiter.ts` čuva stanje u memoriji procesa         | U serverless/multi-instance okruženju limit nije globalno dijeljen; dovoljno za MVP, za produkciju razmotriti vanjski store |
| Cron rute zaštićene `CRON_SECRET` | Bez ispravnog `CRON_SECRET` cron rute vraćaju 401                         | Secret se mora postaviti u produkciji (Vercel)                                                                              |
| Service-role ključ                | `SUPABASE_SERVICE_ROLE_KEY` zaobilazi RLS i koristi se samo server-side   | Ne smije nikad biti izložen klijentu; drži se samo u server env varijablama                                                 |


---

## 4. Nedovršene funkcionalnosti (Deferred / izvan MVP opsega)


| Stavka                                 | Status      | Razlog                                                                                              |
| -------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------- |
| Integracija stvarnog payment gateway-a | 🟦 Deferred | Premium je u MVP-u simuliran (PRAVILA.md §3); stvarni checkout/webhook/neuspjeli payment = post-MVP |
| Real-time push notifikacije            | 🟦 Deferred | Izvan MVP opsega (Sprint 3/ArchitectureOverview.md §6)                                              |
| Offline način rada                     | 🟦 Deferred | Izvan MVP opsega                                                                                    |


---

## 5. Pretpostavke koje sistem pravi

- Ciljani obim ~50 istovremenih korisnika (NFR-003); arhitektura nije optimizovana za masovni saobraćaj.
- EU hosting / GDPR kontekst (Supabase + Vercel); minimalno prikupljanje ličnih podataka.
- Jedan primarni serviser po intervenciji + opcionalni pomoćni serviseri (tim).
- Jedna ocjena po zatvorenoj intervenciji (US-52), bez naknadne izmjene.
- Korisnik mora potvrditi email prije slanja servisnog zahtjeva.
- Termine predlaže korisnik, a potvrđuje dispečer (hibridni model).

---

## 6. Dijelovi koje NE treba predstavljati kao potpuno završene

- **Premium naplata** -> funkcionalno radi, ali je **simulacija**; ne demonstrirati kao stvarno plaćanje.
- **Procjena rute/dolaska servisera** -> orijentaciona (haversine/OSM), ne navigacijski precizna; uz to OBS-03 (prikaz bazne lokacije na karti).
- **Coverage metrika** -> fokusirana je na kritične module (≥98%) i ne predstavlja pokrivenost cijelog projekta; UI pokrivaju E2E + ručni testovi. Ne predstavljati kao „pokrivenost cijelog koda".
- **Email obavijesti** -> rade samo uz konfigurisan `RESEND_API_KEY`.

