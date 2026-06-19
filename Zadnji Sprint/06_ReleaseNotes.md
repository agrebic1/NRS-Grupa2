# **Release Notes**

## **InterServ v1.0 (MVP)**

---

## **1. Šta je uključeno u finalnu verziju**

Finalna verzija (**v1.0 / MVP**) predstavlja stabilnu implementaciju sistema za upravljanje servisnim intervencijama. Sistem pokriva kompletan tok rada: od prijave kvara, preko obrade i planiranja, do zatvaranja i evaluacije.

Podržane su sve ključne uloge:

* **korisnik**
* **dispečer**
* **serviser**
* **administrator**

Implementirane su sve korisničke priče (**US-01 → US-54**), uz kontrolu pristupa, audit historiju i osnovno SLA praćenje.

---

## **2. Najvažnije funkcionalnosti**

* **Registracija i prijava korisnika**
* **RBAC (role-based access control)**
* **Prijava kvara kroz wizard (više koraka)**
* **Izmjena i otkazivanje zahtjeva**
* **Dispečerski pregled aktivnih zahtjeva (US-07)**
* **Detaljan pregled zahtjeva (US-08)**
* **Trijaža i određivanje prioriteta**
* **Dodjela servisera**
* **Evidencija rada i materijala**
* **Zatvaranje zahtjeva i ocjena**
* **Audit historija (timeline)**
* **SLA praćenje**
* **Premium usluga (simulirana)**
* **Notifikacije unutar aplikacije**
* **Analitički dashboard**
* **Partner onboarding**

---

## **3. Poznata ograničenja**

* **Premium naplata je simulirana**
* **Nema offline podrške**
* **Nema real-time push notifikacija**
* **Email funkcionalnost zavisi od konfiguracije**
* **Geo-lokacija je aproksimativna**
* **Fokus testiranja na ključnim modulima**

---

## **4. Poznati bugovi**

Trenutno nema otvorenih kritičnih bugova.

Manji poznati problemi:

* Povremeno kašnjenje osvježavanja liste
* Ograničena validacija u pojedinim UI scenarijima
* Moguće razlike u testnim podacima

---

## **5. Nije dio finalne verzije**

* **Integracija stvarnog payment gateway-a**
* **Real-time notifikacije**
* **Offline način rada**
* **Napredna optimizacija ruta**
* **Prošireni analitički izvještaji**

---

## **6. GitHub i razvoj**

Projekat je razvijan koristeći standardne Git prakse:

* **Feature branch model** (`feature/*`)
* Svaka funkcionalnost u zasebnom branchu
* **Pull Request za svaku funkcionalnost**
* **Code review prije merge-a**
* Jasne commit poruke
* Razdvojena struktura (**frontend / backend / services**)
* Testiranje kroz:

  * **unit testove**
  * **integration testove**
  * **E2E testove**

---

## **7. Pokretanje projekta**

```bash
npm install
npm run dev
```

Aplikacija će biti dostupna na:

```text
http://localhost:3000
```

---

## **8. Zaključak**

**InterServ v1.0** predstavlja funkcionalan MVP sistem koji pokriva osnovne procese servisnih intervencija. Sistem omogućava efikasno upravljanje zahtjevima i predstavlja kvalitetnu osnovu za dalji razvoj.

Fokus narednih verzija:

* poboljšanje performansi
* real-time komunikacija
* integracija eksternih servisa
* unapređenje korisničkog iskustva

