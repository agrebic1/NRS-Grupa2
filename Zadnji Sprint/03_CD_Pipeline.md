# Continuous Deployment pipeline (InterServ)

---

## 1. Gdje se skripta nalazi


| Artefakt                | Putanja u repou                         | Namjena                               |
| ----------------------- | --------------------------------------- | ------------------------------------- |
| GitHub Actions workflow | `.github/workflows/deploy.yml`          | Automatizovan pipeline (CI/CD)        |
| PowerShell skripta      | `Projekat/tools/deploy.ps1`             | Ručni/lokalni ekvivalent istih koraka |


Postojeći CI (zasebno): `.github/workflows/test.yml` (testovi) i `lint.yml` (lint) rade na svaki push/PR. Workflow fajlovi su u **rootu repozitorija** (`.github/workflows/`) jer GitHub Actions otkriva workflow-e samo iz roota; aplikativni kod je u `Projekat/`, na šta workflow-i pokazuju preko `working-directory: Projekat`.

---

## 2. Šta se tačno deploya

- **Frontend + backend = jedan Next.js deployment** na Vercel. Pošto je InterServ monolit (stranice + API rute u istom projektu), **jedan build i jedan deploy** isporučuju oba sloja; time su frontend i backend **automatski povezani** (API rute su na istom domenu, `…/api/`*).
- **Baza:** migracije iz `Projekat/supabase/migrations/` primjenjuju se na **Supabase** (odvojeni managed servis) kroz `supabase db push`.
- **Zakazani poslovi:** `vercel.json` (cron `premium-expiry`, `sla-eskalacija`) se isporučuje kao dio Vercel deploya.

---

## 3. Koraci pipeline-a (šta radi `deploy.yml` / `deploy.ps1`)


| #   | Korak                           | Komanda                                | Profesorova tačka                         |
| --- | ------------------------------- | -------------------------------------- | ----------------------------------------- |
| 1   | Instalacija zavisnosti          | `npm ci`                               | (priprema)                                |
| 2   | Quality gate                    | `npm test`                             | (ne deployamo ako testovi padaju)         |
| 3   | Priprema/povezivanje baze       | `supabase link --project-ref …`        | priprema ili povezivanje baze             |
| 4   | Primjena migracija              | `supabase db push`                     | primjena migracija                        |
| 5   | Povlačenje env konfiguracije    | `vercel pull --environment=production` | postavljanje env varijabli                |
| 6   | **Build (frontend + backend)**  | `vercel build --prod`                  | build backend + build frontend            |
| 7   | **Deploy (frontend + backend)** | `vercel deploy --prebuilt --prod`      | deployment backend + deployment frontend  |
| 8   | Povezivanje FE↔BE API           | (implicitno — isti deployment/domen)   | povezivanje frontend-a sa backend API-jem |
| 9   | **Smoke provjera**              | `curl -fsS $PROD_URL`                  | osnovna provjera dostupnosti              |


> **Build backend i build frontend** su jedan korak jer je riječ o monolitu — `vercel build --prod` builda cijeli Next.js (i stranice i API rute). Isto vrijedi za deploy.

---

## 4. Kako se pokreće

**A) Automatizovano (GitHub Actions — preporučeno za demonstraciju):**

1. GitHub → **Actions** → workflow **„Deploy (production)"** → **Run workflow** (okidač `workflow_dispatch`).
2. Pipeline prolazi korake 1–9; rezultat je vidljiv u logu runa (zeleno = uspjeh).
3. (Opcionalno) Za automatski deploy na svaki push u `main`, odkomentarisati `push: branches: [main]` blok u `deploy.yml` — **tek nakon** što su svi secrets postavljeni.

**B) Ručno (PowerShell, lokalno):**

```powershell
cd Projekat
# postaviti env varijable (vidi §6), zatim:
./tools/deploy.ps1
```

> **Napomena o odnosu s Vercel auto-deployom:** Vercel-ova GitHub integracija već automatski deploya na push u `main`. Ovaj pipeline je **eksplicitna, dokumentovana, ponovljiva** varijanta koja dodatno radi **migracije baze** i **smoke provjeru** — i može se demonstrirati na zahtjev (`workflow_dispatch`). Zato je podrazumijevani okidač ručni, da se izbjegne dupli deploy.

---

## 5. Preduvjeti

- Vercel projekt povezan sa repom `agrebic1/NRS-Grupa2`, **Root Directory = `Projekat`**, sa postavljenim env varijablama (vidi [02_DeploymentProcedura.md](02_DeploymentProcedura.md) §10).
- Supabase projekt sa primijenjenom početnom shemom; `SUPABASE_DB_PASSWORD` poznat.
- Postavljeni **Repository Secrets** (§6) u: GitHub → Settings → Secrets and variables → Actions.
- Lokalno (za `deploy.ps1`): instalirani Node 20+, Supabase CLI, Vercel CLI.

---

## 6. Varijable i secrets koje pipeline koristi

> Postavljaju se kao **GitHub Repository Secrets** (nikad u kodu). Iste vrijednosti za `deploy.ps1` se postavljaju kao env varijable u PowerShell sesiji.


| Secret                  | Svrha                       | Gdje se nabavlja                                                     |
| ----------------------- | --------------------------- | -------------------------------------------------------------------- |
| `VERCEL_TOKEN`          | Autentikacija Vercel CLI    | Vercel → Account Settings → Tokens                                   |
| `VERCEL_ORG_ID`         | ID Vercel organizacije      | `.vercel/project.json` nakon `vercel link` / Vercel project settings |
| `VERCEL_PROJECT_ID`     | ID Vercel projekta          | isto kao gore                                                        |
| `SUPABASE_ACCESS_TOKEN` | Autentikacija Supabase CLI  | Supabase → Account → Access Tokens                                   |
| `SUPABASE_PROJECT_REF`  | Referenca Supabase projekta | Supabase Dashboard URL / `supabase/.temp/project-ref`                |
| `SUPABASE_DB_PASSWORD`  | Lozinka baze (za `db push`) | Supabase → Project Settings → Database                               |
| `PROD_URL`              | URL za smoke provjeru       | `https://nrs-grupa2.vercel.app`                                      |


> Aplikativne env varijable (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `CRON_SECRET`, …) se ne stavljaju ovdje, njih `vercel pull` povlači iz Vercel Project Settings.

---

## 7. Kako su frontend, backend i baza povezani

- **Frontend ↔ Backend:** isti Next.js deployment na istom Vercel domenu → frontend poziva API rute relativnim putanjama (`/api/...`); nema zasebnog backend URL-a ni CORS konfiguracije.
- **Backend ↔ Baza:** API rute i cron koriste Supabase klijente (`lib/supabase/`*) sa `NEXT_PUBLIC_SUPABASE_URL` + ključevima iz Vercel env-a; `SUPABASE_SERVICE_ROLE_KEY` se koristi server-side gdje treba zaobići RLS.
- **Migracije ↔ Baza:** `supabase db push` primjenjuje shemu/RLS na isti Supabase projekt koji aplikacija koristi.

---

## 8. Gdje se provjerava rezultat deploymenta

- **GitHub Actions log:** Actions → run „Deploy (production)" → koraci moraju biti zeleni; korak **„Smoke test"** ispisuje „Smoke OK" i pada (crveno) ako aplikacija nije dostupna.
- **Live aplikacija:** `https://nrs-grupa2.vercel.app/` — mora se učitati (HTTP 2xx).
- **Vercel Dashboard:** Deployments → status „Ready" za zadnji deployment.
- **Supabase:** Database → migracije primijenjene (tabele/politike prisutne).

---

## 9. Ručni koraci koji nisu automatizovani (i zašto)

- **Prvo postavljanje env vrijednosti** u Vercel i Supabase (jednokratno), sigurnosno se ne drže u repou.
- **Kreiranje secrets-a** u GitHub-u (jednokratno).
- **Kreiranje početnog admin/demo naloga** kroz Supabase Auth, auth korisnici se ne seedaju automatski iz sigurnosnih razloga.

Svi ostali koraci (build, migracije, deploy, provjera) su automatizovani u pipeline-u.

---

## 10. Kako demonstrirati ponovljiv deployment (checklist)

- [ ] Postaviti sve secrets iz §6.
- [ ] Pokrenuti workflow `workflow_dispatch` (ili `./tools/deploy.ps1`).
- [ ] Potvrditi da su koraci 1–9 zeleni i da „Smoke test" ispisuje „Smoke OK".
- [ ] Sačuvati **dokaz** (screenshot zelenog runa / log) u `Zadnji Sprint/03_dokazi/`.
- [ ] (Test da provjera radi) namjerno postaviti pogrešan `PROD_URL` → smoke korak mora pasti (crveno).