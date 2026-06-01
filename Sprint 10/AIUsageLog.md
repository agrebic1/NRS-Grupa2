# AI Usage Log


| Polje                       | Opis                                                                                                                                                                                                       |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Datum                       | 30.05.2026.                                                                                                                                                                                                |
| Sprint broj                 | 10                                                                                                                                                                                                         |
| Alat koji je korišten       | Claude Code                                                                                                                                                                                                |
| Svrha korištenja            | Implementacija geo-preporuke servisera po blizini lokacije intervencije                                                                                                                                    |
| Kratak opis zadatka         | Implementacija logike za preporuku servisera na osnovu udaljenosti između lokacije zahtjeva i bazne lokacije servisera prema US-48.                                                                        |
| Šta je AI generisao         | Početnu verziju haversine funkcije za izračun udaljenosti, proširenje scoring sistema u `preporukaServisera.ts`, helper funkcije za rad sa koordinatama i prijedlog prikaza udaljenosti u UI komponentama. |
| Šta je tim prihvatio        | Kombinovani scoring model koji uz stručnost, opterećenje i verifikaciju uključuje i faktor blizine servisera.                                                                                              |
| Šta je tim izmijenio        | Ručno prilagođeni težinski faktori scoring algoritma i fallback logika kada koordinate nisu dostupne.                                                                                                      |
| Šta je tim odbacio          | Potpuno automatsko određivanje servisera isključivo po udaljenosti bez ostalih poslovnih faktora.                                                                                                          |
| Rizici, problemi ili greške | Potrebna dodatna validacija za slučajeve nedostajućih koordinata i nekonzistentnih lokacijskih podataka.                                                                                                   |
| Ko je koristio alat         | Ajla Ćesir                                                                                                                                                                                                 |  

  

| Polje                       | Opis                                                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Datum                       | 30.05.2026.                                                                                                               |
| Sprint broj                 | 10                                                                                                                        |
| Alat koji je korišten       | Claude Code                                                                                                               |
| Svrha korištenja            | Implementacija analitičkog dashboarda za dispečera                                                                        |
| Kratak opis zadatka         | Kreiranje vizuelnog dashboard prikaza ključnih KPI pokazatelja sistema prema US-49.                                       |
| Šta je AI generisao         | Strukturu KPI kartica, prijedloge grafova, agregacione helper funkcije i početni layout analitičke stranice.              |
| Šta je tim prihvatio        | Vizuelni pregled intervencija po statusu, SLA pokazatelje, pregled opterećenja servisera i filtere po vremenskom periodu. |
| Šta je tim izmijenio        | Ručno optimizovan raspored kartica, agregacija podataka i responsive prikaz dashboarda.                                   |
| Šta je tim odbacio          | Uvođenje dodatne kompleksne chart biblioteke zbog performansi i veličine bundle-a.                                        |
| Rizici, problemi ili greške | Potrebna pažnja na performanse agregacija i konzistentnost podataka između dashboarda i izvještaja odziva.                |
| Ko je koristio alat         | Ajla Ćesir                                                                                                                |



| Polje                       | Opis                                                                                                              |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Datum                       | 31.05.2026.                                                                                                       |
| Sprint broj                 | 10                                                                                                                |
| Alat koji je korišten       | Claude Code                                                                                                       |
| Svrha korištenja            | Responsive i UX unapređenja serviserskog modula                                                                   |
| Kratak opis zadatka         | Dorada serviserskih i dispečerskih ekrana radi bolje upotrebljivosti na mobilnim uređajima prema US-50.           |
| Šta je AI generisao         | Prijedloge responsive layouta, prazna/loading stanja, mobile-first raspored komponenti i accessibility preporuke. |
| Šta je tim prihvatio        | Responsive prikaz serviserskih zadataka, sticky operativne panele i standardizovana loading/prazna stanja.        |
| Šta je tim izmijenio        | Ručno prilagođeni breakpointi, spacing i prikaz određenih komponenti na manjim ekranima.                          |
| Šta je tim odbacio          | Potpuno odvojenu mobile aplikaciju zbog MVP scope-a.                                                              |
| Rizici, problemi ili greške | Potrebno dodatno testiranje na manjim uređajima i različitim rezolucijama.                                        |
| Ko je koristio alat         | Ajla Ćesir                                                                                                        |



| Polje                       | Opis                                                                                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Datum                       | 31.05.2026.                                                                                                                                |
| Sprint broj                 | 10                                                                                                                                         |
| Alat koji je korišten       | Claude Code                                                                                                                                |
| Svrha korištenja            | QA stabilizacija, refaktorisanje i tehnički dug                                                                                            |
| Kratak opis zadatka         | Analiza i stabilizacija postojećeg sistema kroz popravku testova, refaktorisanje i usklađivanje dokumentacije.                             |
| Šta je AI generisao         | Prijedloge za popravku failing testova, identifikaciju mrtvog koda, prijedloge refaktorisanja i pregled nekonzistentnosti u dokumentaciji. |
| Šta je tim prihvatio        | Čišćenje mrtvog SLA puta, usklađivanje RBAC testova i dopunu traceability dokumentacije.                                                   |
| Šta je tim izmijenio        | Ručno prilagođeni test mockovi i određeni dijelovi middleware logike.                                                                      |
| Šta je tim odbacio          | Veliku reorganizaciju arhitekture projekta pred završetak MVP-a.                                                                           |
| Rizici, problemi ili greške | Potencijalne regresije nakon refaktorisanja zahtijevale dodatne integration i e2e provjere.                                                |
| Ko je koristio alat         | Ajla Ćesir                                                                                                                                 |



| Polje                       | Opis                                                                                                                        |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Datum                       | 31.05.2026.                                                                                                                 |
| Sprint broj                 | 10                                                                                                                          |
| Alat koji je korišten       | Claude Code                                                                                                                 |
| Svrha korištenja            | Sigurnosna analiza i provjera usklađenosti sa dobrim praksama                                                               |
| Kratak opis zadatka         | Analiza sigurnosnih aspekata aplikacije, RBAC pristupa, validacije podataka i zaštite ruta.                                 |
| Šta je AI generisao         | Preporuke za sigurnosne provjere, STRIDE analizu, validacione obrasce i prijedloge dodatne zaštite API ruta i middleware-a. |
| Šta je tim prihvatio        | Dodatnu validaciju pristupa serviserskim i dispečerskim rutama i provjeru role-based pristupa.                              |
| Šta je tim izmijenio        | Ručno usklađene autorizacione provjere sa postojećom arhitekturom aplikacije.                                               |
| Šta je tim odbacio          | Preveliko proširenje sigurnosnog sloja koje bi zahtijevalo značajnu promjenu postojeće arhitekture pred predaju projekta.   |
| Rizici, problemi ili greške | Potrebno kontinuirano pratiti moguće edge-case scenarije kod pristupa osjetljivim podacima i workflow akcijama.             |
| Ko je koristio alat         | Ajla Ćesir                                                                                                                  |
