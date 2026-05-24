# Početna lista nefunkcionalnih zahtjeva (NFR)

Kroz ovaj dokument obrađeni su nefunkcionalni zahtjevi (NFR) sistema. Svaki zahtjev formulisan je prema SMART kriteriju, sa jasno definisanom metrikom, mjernom jedinicom i granicom koja se može objektivno provjeriti, čime se izbjegavaju neprecizne formulacije koje se ne mogu izmjeriti niti jednoznačno potvrditi. Zahtjevi su klasifikovani prema Sommervilleovoj taksonomiji i prilagođeni realnom obimu MVP verzije sistema. 

# 1. Zahtjevi proizvoda 

## 1.1 Pregled 

| Kategorija | Broj zahtjeva | ID-evi | Prioritet |
|:-----------|:-------------:|:-------|:----------|
| Efikasnost (Performanse) | 3 | NFR-001, NFR-002, NFR-003 | 2× Visok, 1× Srednji |
| Pouzdanost | 3 | NFR-004, NFR-005, NFR-006 | 2× Visok, 1× Srednji |
| Sigurnost | 4 | NFR-007, NFR-008, NFR-009, NFR-010 | 4× Visok |
| Upotrebljivost | 3 | NFR-011, NFR-012, NFR-013 | 3× Visok |
| Portabilnost | 2 | NFR-014, NFR-015 | 1× Visok, 1× Srednji |
| Održivost | 2 | NFR-016, NFR-017 | 2× Srednji |
| **Ukupno** | **17** | | **12× Visok, 5× Srednji** |

### 1.1.1 Struktura zahtjeva
```
├── Efikasnost
│       ├── brzina učitavanja stranica
│       ├── vrijeme odgovora API-ja
│       └── ponašanje sistema pod opterećenjem
│
├── Sigurnost
│       ├── hashiranje lozinki
│       ├── istek sesije
│       ├── kontrola neovlaštenog pristupa
│       └── šifrovanje komunikacije
│
├── Pouzdanost
│       ├── dostupnost sistema u radnom vremenu
│       ├── zaštita potvrđenih podataka
│       └── redovno arhiviranje baze
│
├── Upotrebljivost
│       ├── minimalan broj koraka za servisera na terenu
│       ├── intuitivnost za klijenta
│       └── responzivnost interfejsa
│
├── Portabilnost
│       ├── podrška za glavne preglednike
│       └── rad bez ikakve dodatne instalacije
│
└── Održivost
        ├── modularna arhitektura otvorena za proširenje
        └── ažurna dokumentacija API-ja
```

## 1.2 Efikasnost (Performanse)

| ID | Kategorija | Opis zahtjeva | Način provjere | Prioritet | Napomena |
|:---|:-----------|:--------------|:---------------|:---------:|:---------|
| NFR-001 | Efikasnost (Performanse) | Stranica s pregledom aktivnih intervencija mora se u potpunosti učitati za najviše **3 sekunde** pri standardnoj internetskoj vezi brzine ≥ 10 Mbps i opterećenju od do 50 istovremenih korisnika. | Mjerenje vremena učitavanja putem Chrome DevTools (Network tab) sa 10 uzastopnih mjerenja u inkognito prozoru, prosječna vrijednost mora biti ≤ 3s. | Visok | Dispečer koristi dashboard kontinuirano tokom radnog dana, kašnjenje direktno usporava raspoređivanje intervencija. |
| NFR-002 | Efikasnost (Performanse) | Svaki API poziv za kreiranje, preuzimanje ili ažuriranje intervencije mora biti obrađen za najviše **1 sekundu** od slanja zahtjeva do prijema odgovora servera, pri normalnom opterećenju sistema do 20 istovremenih zahtjeva. | Mjerenje vremena odgovora API-ja putem alata Postman, 20 uzastopnih poziva za svaki tip operacije (GET, POST, PATCH), prosječno izmjereno vrijeme ne smije prelaziti 1s. | Visok | Posebno kritično za akciju ažuriranja statusa intervencije od strane servisera na terenu. |
| NFR-003 | Efikasnost (Performanse) | Sistem mora podržati istovremeni rad najmanje **50 korisnika** a da prosječno vrijeme odgovora ne poraste za više od **20%** u odnosu na bazno izmjereno vrijeme odgovora pri jednom korisniku. | Load testiranje putem alata k6 ili Apache JMeter. Simulacija 50 paralelnih sesija tokom 5 minuta, mjerenje prosječnog vremena odgovora i poređenje sa baznim rezultatom. | Srednji | Procjena kapaciteta zasnovana je na realnoj veličini organizacije za koju je sistem namijenjen u MVP fazi. |

## 1.3 Pouzdanost

| ID | Kategorija | Opis zahtjeva | Način provjere | Prioritet | Napomena |
|:---|:-----------|:--------------|:---------------|:---------:|:---------|
| NFR-004 | Pouzdanost | Sistem mora biti dostupan korisnicima najmanje **99%** radnog vremena (07:00-21:00 radnim danima), što odgovara maksimalno **13 minuta nedostupnosti sedmično** u tom periodu. | Praćenje dostupnosti putem alata UptimeRobot (provjera svakih 5 minuta), evidentiranje svakog prekida u radu s oznakom trajanja i uzroka. | Visok | Nedostupnost sistema direktno blokira dispečera u dodjeli intervencija. |
| NFR-005 | Pouzdanost | Podaci o intervenciji koji su uspješno potvrđeni od strane servera (HTTP 200 ili 201) ne smiju biti izgubljeni ni u jednom slučaju normalnog serverskog pada. Gubitak potvrđenog zapisa nije prihvatljiv. | Simulacija serverskog gašenja odmah nakon uspješno primljenog API odgovora, provjera baze podataka da li je odgovarajući zapis pohranjen i ispravan. | Visok | Gubitak podataka o intervenciji direktno narušava povjerenje korisnika i onemogućava buduću analizu rada. |
| NFR-006 | Pouzdanost | Baza podataka mora biti automatski arhivirana (backup) najmanje **svakih 6 sati**, a svaka arhiva mora biti pohranjena na lokaciji fizički ili logički odvojenoj od primarne baze podataka. | Provjera konfiguracije automatskog backupa i potvrda da arhiva postoji na odvojenoj lokaciji, jednom po sprintu izvršiti testnu restauraciju arhive radi potvrde ispravnosti podataka. | Srednji | Backup svakih 6 sati znači maksimalni gubitak podataka od 6 sati u najgorem scenariju. |

## 1.4 Sigurnost

| ID | Kategorija | Opis zahtjeva | Način provjere | Prioritet | Napomena |
|:---|:-----------|:--------------|:---------------|:---------:|:---------|
| NFR-007 | Sigurnost | Lozinke korisnika moraju biti pohranjene isključivo u hashiranom obliku korištenjem **bcrypt** algoritma sa minimalnim **cost faktorom 10**. Pohrana u čitljivom ili reverzibilno enkriptovanom obliku nije prihvatljiva ni u kakvim okolnostima. | Nakon registracije testnog korisnika, direktan pregled kolone u bazi podataka, vrijednost mora počinjati s `$2b$10$` ili ekvivalentnim bcrypt prefiksom, plaintext lozinka ne smije biti vidljiva nigdje u sistemu. | Visok | |
| NFR-008 | Sigurnost | Autentifikacijski token (JWT ili session token) mora automatski isteći nakon **8 sati neaktivnosti** korisnika. Vremenski aktivna sesija bez ijedne korisničke interakcije ne smije ostati važeća duže od navedenog perioda. | Ručno testiranje: prijava u sistem, čekanje 8 sati bez korisničke akcije, pokušaj pristupa zaštićenoj ruti, server mora odgovoriti sa HTTP 401 i prikazati ekran za ponovnu prijavu. | Visok | Posebno važno za servisere koji sistem koriste na terenu, ponekad na dijeljenoj opremi. |
| NFR-009 | Sigurnost | Svaki pokušaj pristupa funkcionalnosti ili podatku koji nije dozvoljen korisnikovoj ulozi mora biti odbijen sa **HTTP statusom 403**, a svaki takav pokušaj mora biti evidentiran u sistemskom logu s vremenskom oznakom i identitetom korisnika. | Testiranje neovlaštenog pristupa sa računima različitih uloga, provjera da server vraća 403 i da log sadrži odgovarajući zapis. | Visok | |
| NFR-010 | Sigurnost | Sva komunikacija između klijentske aplikacije i servera mora biti šifrovana putem **HTTPS protokola (TLS 1.2 ili noviji)**. HTTP zahtjevi moraju biti automatski preusmjereni na HTTPS statusnim kodom 301. | Provjera u pregledniku, slanje ručnog HTTP zahtjeva i provjera da server odgovara sa 301 redirekcijom ka HTTPS adresi. | Visok | |

## 1.5 Upotrebljivost

| ID | Kategorija | Opis zahtjeva | Način provjere | Prioritet | Napomena |
|:---|:-----------|:--------------|:---------------|:---------:|:---------|
| NFR-011 | Upotrebljivost | Serviser mora biti u mogućnosti ažurirati status intervencije u **najviše 3 korisničke akcije** od trenutka otvaranja detalja intervencije, bez ikakvog scrollanja na ekranu mobilnog uređaja standardne veličine (360×800px). | Korisničko testiranje s 3 ispitanika koji nisu učestvovali u dizajnu sistema. Broji se broj koraka od otvaranja ekrana do uspješnog ažuriranja statusa, svi ispitanici moraju završiti zadatak u ≤ 3 koraka. | Visok | Serviseri sistem koriste na terenu u ograničenim uvjetima. Minimalan broj koraka za najčešću akciju je direktna operativna vrijednost. |
| NFR-012 | Upotrebljivost | Novi korisnik (klijent) koji prvi put koristi sistem mora biti u mogućnosti uspješno prijaviti kvar unutar **5 minuta** od prvog pokretanja aplikacije, bez prethodnog uputstva ili obuke. | Korisničko testiranje s 3 ispitanika koji nikad nisu vidjeli sistem, mjerenje vremena od pokretanja aplikacije do prikaza potvrdne poruke o uspješnoj prijavi, svi ispitanici moraju završiti zadatak unutar 5 minuta. | Visok | Ako prijava kvara nije intuitivna, klijenti će nastaviti koristiti telefon kao alternativu, čime se gubi osnovna vrijednost sistema.|
| NFR-013 | Upotrebljivost | Korisnički interfejs mora biti funkcionalan, čitljiv i vizualno konzistentan na svim uređajima sa širinom ekrana između **360px i 1920px**, bez pojave horizontalnog scrollanja, presijecanja elemenata ili gubitka kritičnih akcijskih gumba. | Vizualna provjera u Chrome DevTools na četiri standardne rezolucije: 360px (mobilni), 768px (tablet), 1280px i 1920px (desktop), za svaku rezoluciju proći kroz ključne ekrane: login, dashboard, forma za kvar, detalji intervencije. | Visok | |

## 1.6 Portabilnost

| ID | Kategorija | Opis zahtjeva | Način provjere | Prioritet | Napomena |
|:---|:-----------|:--------------|:---------------|:---------:|:---------|
| NFR-014 | Portabilnost | Sistem mora biti u potpunosti funkcionalan u **posljednje dvije stabilne verzije** sljedećih preglednika: Google Chrome, Mozilla Firefox, Microsoft Edge i Safari (iOS). Funkcionalnost i vizualni prikaz ne smiju se razlikovati između navedenih preglednika. | Ručno testiranje ključnih korisničkih tokova (prijava, kreiranje intervencije, ažuriranje statusa, odjava) u svakom navedenom pregledniku, evidentirati sve vizualne ili funkcionalne razlike. | Srednji | |
| NFR-015 | Portabilnost | Sistem ne smije zahtijevati instalaciju nikakvih dodatnih plugina, proširenja, runtime okruženja niti softverskih paketa na korisničkom uređaju. Jedini preduvjet za pristup sistemu je web preglednik. | Testiranje na čistom profilu preglednika (incognito, bez ekstenzija) i na uređaju bez posebnih konfiguracija, sistem mora biti u potpunosti operativan bez ijedne prethodne instalacije. | Visok | Kritično za servisere koji sistem koriste na terenu, ponekad na uređajima bez administratorskih prava. |

## 1.7 Održivost

| ID | Kategorija | Opis zahtjeva | Način provjere | Prioritet | Napomena |
|:---|:-----------|:--------------|:---------------|:---------:|:---------|
| NFR-016 | Održivost | Sistem mora biti strukturisan prema principu **modularnosti**, izmjena jednog modula ne smije zahtijevati izmjene u nepovezanim modulima. Dodavanje nove korisničke uloge ne smije zahtijevati promjene u poslovnoj logici postojećih uloga. | Code review od strane tehničkih članova tima, svaki PR koji uvodi promjene u jedan modul mora biti praćen potvrdom da nijedan neovisni modul nije morao biti istovremeno modificiran. | Srednji | Ključno za proširenje sistema u kasnijim sprintovima |
| NFR-017 | Održivost | Svaka implementirana API ruta mora biti dokumentovana sa: nazivom rute, HTTP metodom, ulaznim parametrima (tip i format), primjerom odgovora i mogućim statusnim kodovima. Dokumentacija mora biti usklađena sa stanjem implementacije pri predaji svakog sprinta. | Pregled API dokumentacije u repozitoriju (Postman Collection, Swagger/OpenAPI ili ručna .md dokumentacija), svaka implementirana ruta mora imati odgovarajući zapis, nekompatibilnost između koda i dokumentacije smatra se neispunjenjem zahtjeva. | Srednji | Direktno olakšava paralelni rad frontend i backend dijelova tima i ubrzava razumijevanje sistema od strane svih članova. |

---






# 2. Organizacioni zahtjevi

## 2.1 Isporuka

| ID | Kategorija | Opis zahtjeva | Način provjere | Prioritet | Napomena |
|:---|:-----------|:--------------|:---------------|:---------:|:---------|
| ORG-ISP-01 | Isporuka – Rok isporuke sistema | Sistem mora biti spreman za demonstraciju i evaluaciju do dogovorenog roka projekta. Sve funkcionalne cjeline definirane u product backlogu moraju biti implementirane i verificirane. Isporuka se ne podrazumijeva kao produkcijsko okruženje, nego kao stabilan i demonstrabilan MVP. | Sve stavke iz product backlog-a (PBI-001 do PBI-016) moraju biti implementirane i testirane do datuma završetka projekta. Interno testiranje i finalni demo provode se s predstavnicima projektnog tima. Sistem koji ne može biti demonstriran ne smatra se isporučenim. | Visoko | Rok isporuke je akademski definiran. Isporuka se planira u završnom sprintu uz interni demo period u kojem tim testira scenarije od prijave kvara do zatvaranja intervencije. |
| ORG-ISP-02 | Isporuka – Iterativna isporuka po sprintovima | Svaki sprint mora rezultirati funkcionalnom i testiranom inkrementalnom verzijom koja može biti demonstrirana. Inkrementalne verzije moraju biti deployirane i podvrgnute osnovnom regresijskom testiranju. Svaki sprint završava sprint review sesijom. | Na kraju svakog sprinta isporučuje se stabilna build verzija sistema. Scrum master dokumentira napredak i neisporučene stavke prenosi u sljedeći sprint uz kratku analizu uzroka. | Visoko | Preporučuje se da mentor/klijent prisustvuje sprint review sesijama kako bi kontinuirano pratio razvoj funkcionalnosti. |
| ORG-ISP-03 | Isporuka – Standardi dokumentacije | Tehnička i korisnička dokumentacija mora biti izrađena prema dogovorenim standardima tima. Uključuje: kratak korisnički vodič, opis arhitekture sistema, osnovnu tehničku dokumentaciju i API dokumentaciju za ključne rute. Svaka izmjena u sistemu mora biti praćena ažuriranjem dokumentacije u istom sprintu. | Dokumentacija mora pokriti ključne korisničke scenarije (prijava kvara, dodjela servisera, ažuriranje statusa, zatvaranje intervencije) prije finalne isporuke. Provjerava se kroz peer review unutar tima. | Srednje | Preporučuje se GitHub Wiki ili README fajlovi za centralnu pohranu. API dokumentacija generira se putem Swagger/OpenAPI. Za testiranje API-ja koristi se Bruno (open-source, bez limita). |

## 2.2 Implementacija

| ID | Kategorija | Opis zahtjeva | Način provjere | Prioritet | Napomena |
|:---|:-----------|:--------------|:---------------|:---------:|:---------|
| ORG-IMP-01 | Implementacija – Tech stack | Tim koristi dogovoreni tech stack: Next.js kao full-stack okvir, Supabase kao backend-as-a-service s PostgreSQL bazom, ugrađenom autentifikacijom i file storageom, te Vercel kao platforma za deployment. Opcionalno: Tailwind CSS za stilizovanje i Supabase Edge Functions za serverless logiku. Svako značajno tehničko odstupanje dogovara se na razini tima i dokumentira u repozitoriju. | Tim koristi dogovoreni tech stack (Next.js, Supabase, Vercel). Svako značajno odstupanje dogovara se na razini tima. Code review uključuje provjeru usklađenosti s odabranim tehnologijama. | Visoko | VS Code je preporučeni editor za sve članove tima. Odabir tehnologije dokumentira se u README fajlu repozitorija. |
| ORG-IMP-02 | Implementacija – Platforma za razvoj i deployment | Sistem se razvija i deployira koristeći Vercel (hosting Next.js aplikacije) i Supabase (managed cloud backend s PostgreSQL bazom). Lokalni razvoj provodi se pokretanjem Next.js development servera s konekcijom na Supabase projekt. | Deployment se provodi na Vercel platformi s automatskom GitHub integracijom. Supabase projekat konfiguriran je s odgovarajućim environment varijablama i RLS pravilima. Provjera se vrši kroz Vercel deployment logove i Supabase dashboard. | Visoko | Vercel i Supabase nude besplatne planove pogodne za studentske projekte. Vercel automatski pruža HTTPS, globalni CDN i preview deploymente za svaki pull request. |
| ORG-IMP-03 | Implementacija – Verzionisanje koda | Sav izvorni kod mora biti pohranjen na GitHub repozitoriju s feature branch strategijom grananja. Preporučuje se minimalno jedno code review pri mergu u main granu. GitHub Actions može se koristiti za automatizaciju CI koraka (linting, testovi). | 100% izvornog koda mora biti pohranjeno u Git repozitoriju. Svaki merge u main granu preporučuje se uz minimalno jedno odobreno code review. Historija commitova mora biti pratljiva. | Visoko | Koristi se GitHub za hosting s feature branch strategijom. Svaki branch treba biti vezan za odgovarajući backlog zadatak (npr. feature/PB-007-planiranje-izlazaka). Vercel GitHub integracija automatski kreira preview deployment za svaki pull request. |

## 2.3 Standardi

| ID | Kategorija | Opis zahtjeva | Način provjere | Prioritet | Napomena |
|:---|:-----------|:--------------|:---------------|:---------:|:---------|
| ORG-STD-01 | Standardi – Standardi kodiranja | Sav kod mora biti napisan u skladu s coding standardima tima: konzistentne konvencije imenovanja, struktura fajlova po modulu i dokumentiranje poslovne logike. Linter i formatter moraju biti konfigurisani i verzonirani u repozitoriju. | Provjera usklađenosti s coding standardima provodi se putem ESLint-a i Prettier-a (ugrađeni u Next.js). Konfiguracija (.eslintrc i .prettierrc) verzionirana je u repozitoriju i primjenjuje se na svim razvojnim mašinama. | Srednje | Preporučuje se dijeljeni `.vscode/settings.json` i `.vscode/extensions.json` u repozitoriju za konzistentno razvojno okruženje. |
| ORG-STD-02 | Standardi – Pokrivenost testovima | Kod mora imati odgovarajuću pokrivenost automatskim testovima s naglaskom na kritičnu poslovnu logiku (raspoređivanje intervencija, upravljanje statusima, evidencija rada). Unit testovi putem Jest-a verificiraju ponašanje individualnih komponenti. E2E testovi putem Playwright-a pokrivaju ključne korisničke scenarije. | Ciljna pokrivenost iznosi 40–50% za ključnu poslovnu logiku, bez tvrdog blokiranja merge-a ispod praga. GitHub Actions CI prikazuje izvještaj o pokrivenosti pri svakom pull requestu. E2E testovi ključnih tokova provode se putem Playwright-a. | Visoko | Fokus testiranja: prijava kvara, dodjela servisera, promjena statusa, zatvaranje intervencije. Test piramida: više unit testova za poslovnu logiku, manji broj E2E testova za ključne scenarije. |
| ORG-STD-03 | Standardi – API dizajn | Svi API-ji moraju biti dizajnirani prema RESTful principima s konzistentnom upotrebom HTTP metoda, standardnih statusnih kodova i predvidljive strukture URL putanja (npr. `/api/v1/interventions`). API dokumentacija generira se iz izvornog koda putem Swagger/OpenAPI. | Ključni API endpointi dokumentirani su putem Bruno kolekcije verzonirane direktno u Git repozitoriju (Bruno kolekcije su plain-text fajlovi kompatibilni s Gitom). Swagger/OpenAPI dokumentacija generira se za ključne rute. API dizajn review provodi se kao dio code review procesa. | Visoko | Preporučuje se Bruno kao besplatna open-source alternativa Postmanu — kolekcije se čuvaju lokalno kao plain-text fajlovi i verzioniraju u Gitu bez ograničenja. Postman free plan ima limite od 3 API-ja i 25 pokretanja kolekcija/mj. Bruno nema takvih ograničenja. Next.js API rute strukturiraju se prema RESTful principima unutar `/api/v1/` putanje. |
| ORG-STD-04 | Standardi – Git commit poruke | Svaki commit treba pratiti Conventional Commits format kako bi se osigurala čitljivost historije razvoja. Konvencija commit poruka mora biti dokumentirana u CONTRIBUTING.md fajlu. Provjera se provodi kroz code review, bez automatskog blokiranja. | Tim dokumentira konvenciju commit poruka u CONTRIBUTING.md fajlu. Provjera se provodi kao dio code review procesa pri pregledu pull requesta, bez automatskog blokiranja. | Nisko | Primjer ispravnih commit poruka: `feat: dodaj dodjelu prioriteta intervenciji`, `fix: ispravi validaciju statusa pri zatvaranju intervencije`, `docs: azuriraj README s uputama za Supabase setup`. |

---

# 3. Vanjski zahtjevi

## 3.1 Zakonski zahtjevi

| ID | Kategorija | Opis zahtjeva | Način provjere | Prioritet | Napomena |
|:---|:-----------|:--------------|:---------------|:---------:|:---------|
| EXT-ZAK-01 | Zakonski – GDPR usklađenost | Sistem mora implementirati osnovu zaštite ličnih podataka u skladu s GDPR principima: minimalno prikupljanje podataka, jasna svrha obrade, i mogućnost izmjene ili brisanja korisničkog naloga. Klijenti moraju imati pristup, ispravku i mogućnost brisanja podataka koje su unijeli. Lokacijski podaci prikupljeni pri prijavi kvara moraju biti posebno zaštićeni. | Korisnik usluge može zatražiti brisanje svog naloga i vezanih podataka putem sistema. Lični podaci se minimalno prikupljaju i ne dijele s trećim stranama bez osnove. Privacy by Design princip ugrađen je u arhitekturu od početka. | Visoko | Napomena: za studentski MVP nije potreban formalni DPO audit niti garantovani rok od 72h. Supabase pohranjuje podatke na serverima unutar EU što zadovoljava osnovne zahtjeve. |
| EXT-ZAK-02 | Zakonski – Historija aktivnosti intervencije | Sistem treba bilježiti hronološki pregled ključnih promjena na intervenciji (promjene statusa, dodjele servisera, napomene) radi transparentnosti toka rada. Uvid u historiju aktivnosti na konkretnoj intervenciji imaju dispečeri i serviseri koji su učesnici u procesu. Klasični audit log (sa IP adresama, nepromjenjivim logovima i višegodišnjim čuvanjem) nije dio MVP-a. | Ključne akcije u sistemu (promjena statusa intervencije, dodjela servisera, zatvaranje zahtjeva, dodavanje napomene) evidentiraju se s identitetom korisnika i vremenskom oznakom. Historija aktivnosti vidljiva je dispečerima i serviserima unutar detalja konkretne intervencije (timeline i tabela — US-32, US-39, US-44). | Srednje | US-32, US-39, US-44. Supabase: tabela `intervention_activities`. Klasični administratorski audit log nije obavezan za MVP. |
| EXT-ZAK-03 | Zakonski – Lokalna regulativa BiH | Sistem treba biti dizajniran s uvažavanjem relevantnih propisa BiH o zaštiti ličnih podataka i elektroničkom poslovanju. Minimalno prikupljanje podataka i jasna svrha obrade trebaju biti dokumentirani. | Osnovna dokumentacija o tome koji podaci se prikupljaju i u koje svrhe mora biti dostupna unutar sistema (politika privatnosti ili sekcija o podacima). | Srednje | Za studentski projekat nije potreban formalni pravni pregled od ovlaštenog pravnog savjetnika. Dovoljno je osnovno poštivanje principa privatnosti i dokumentovanje namjene obrade podataka. |
| EXT-ZAK-04 | Zakonski – Kolačići i sesije | Web sučelje koristi isključivo funkcionalne session kolačiće neophodne za autentifikaciju i rad sesije. Ako se koriste analitički alati, korisnik mora biti obaviješten. Funkcionalni session kolačići izuzeti su od zahtjeva za pristankom. | Session kolačići koriste se isključivo za autentifikaciju (Supabase session). Ako se uvode analitički ili marketinški kolačići, implementira se osnovna cookie obavijest. | Nisko | Za MVP koji ne koristi analitičke kolačiće izvan sessiona, granularni consent centar nije potreban. Dovoljno je kratko objašnjenje o korištenju session kolačića. |

## 3.2 Etički zahtjevi

| ID | Kategorija | Opis zahtjeva | Način provjere | Prioritet | Napomena |
|:---|:-----------|:--------------|:---------------|:---------:|:---------|
| EXT-ETI-01 | Etički – Pristupačnost (WCAG 2.1) | Korisničko sučelje mora primjenjivati osnovna WCAG 2.1 načela: dobar kontrast teksta (minimalno 4.5:1 za normalni tekst), tastaturna navigacija za ključne stranice, i tekstualne alternative za ikone statusa intervencija. Pristupačnost mobilnog sučelja je posebno važna za servisere na terenu. | Ključne stranice provjeravaju se putem Lighthouse alata u Chrome DevTools-u. Aplikacija je navigabilna putem tastature za sve ključne akcije. Tailwind CSS utility klase za kontrast boja koriste se prema WCAG AA standardu. | Srednje | Tailwind CSS nudi ugrađene utility klase za pristupačnost (`sr-only` za screen reader tekst, `focus:ring` za vidljivi fokus). Lighthouse je besplatan alat dostupan u Chrome-u. |
| EXT-ETI-02 | Etički – Jezična inkluzivnost (BHS) | Interfejs sistema implementiran je na jednom BHS jeziku (bosanski) bez hardcodeanih tekstualnih stringova direktno u komponentama. Arhitektura treba omogućiti kasniju višejezičnost bez izmjena izvornog koda. | Svi tekstualni resursi externalizirani su iz komponenti (bez hardcodeanih stringova u kodu). Formatiranje datuma, valute (KM) i brojeva usklađeno je s regionalnim standardima BiH. | Visoko | Ako se pristupa višejezičnosti, preporučuje se `next-intl` ili `next-i18next` biblioteka. Puni i18n za tri BHS varijante nije obavezan za MVP. |
| EXT-ETI-03 | Etički – Nediskriminatorni algoritmi | Sistem ne smije implementirati mehanizme koji direktno ili indirektno diskriminiraju korisnike ili servisere na osnovu zaštićenih ličnih karakteristika. Algoritam koji asistira dispečeru pri određivanju prioriteta mora biti zasnovan isključivo na relevantnim poslovnim kriterijima (lokacija kvara, tip kvara, dostupnost servisera, hitnost). | Parametri algoritma za raspoređivanje i prioritizaciju intervencija dokumentirani su i provjereni da ne uključuju zaštićene karakteristike. Code review uključuje provjeru ulaznih parametara algoritma. | Visoko | Za studentski MVP nije potreban formalni statistički audit (disparate impact analiza). Dovoljno je dokumentirati ulazne parametre algoritma i osigurati da se zaštićene karakteristike ne koriste. |
| EXT-ETI-04 | Etički – Transparentnost prema korisnicima | Klijenti moraju imati jasan uvid u koje podatke sistem prikuplja i u koje svrhe. Politika privatnosti ili sekcija o podacima mora biti dostupna i pisana razumljivim jezikom bez pravnog žargona. | Politika privatnosti ili sekcija o podacima dostupna je na maksimalno dva klika od glavne stranice. Svaka nova funkcionalnost koja obrađuje lične podatke mora biti opisana u dokumentu. | Srednje | Preporučuje se kratak sažetak koji objašnjava što se dešava s podacima klijenta nakon prijave kvara. Nije potrebno CEFR B2 mjerenje čitljivosti niti automatsko obavještavanje emailom o svakoj promjeni politike. |
