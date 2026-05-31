# Sistem za upravljanje servisnim intervencijama

Web aplikacija za digitalizaciju prijave kvarova, planiranja izlazaka na teren, dodjele servisera i praćenja statusa servisnih intervencija. Pokriva tok od prijave zahtjeva, preko dispečerske trijaže i dodjele, do evidencije rada i formalnog zatvaranja, uz audit historiju i kontrolu pristupa po ulogama (RBAC).

Live demo: https://nrs-grupa2.vercel.app/

## Tehnologije

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Supabase** (PostgreSQL, Auth, Storage, Row Level Security)
- **Tailwind CSS**, **React Hook Form** + **Zod**, **TanStack Query**
- Testiranje: **Jest** (unit + integration), **Playwright** (e2e)

## Uloge

- **Korisnik**: prijavljuje zahtjev i prati status
- **Dispečer**: trijaža, prioritet, planiranje i dodjela servisera, zatvaranje
- **Serviser**: pregled dodijeljenih intervencija, promjena statusa, evidencija rada
- **Administrator**: upravljanje korisnicima i ulogama

## Pokretanje (lokalno)

Preduslovi: Node.js 20+ i pristup Supabase projektu.

```bash
npm install
# Kreiraj .env.local (vidi ispod), zatim:
npm run dev          # http://localhost:3000
```

### Varijable okruženja (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...          # server-side (API rute, cron)
CRON_SECRET=...                        # zaštita cron ruta u produkciji
```

Za e2e testove potrebni su i kredencijali test-naloga (vidi `docs/testing/README.md`).

## Skripte

| Komanda                       | Opis                                                          |
| ----------------------------- | ------------------------------------------------------------- |
| `npm run dev`                 | Razvojni server                                               |
| `npm run build` / `npm start` | Produkcijski build / pokretanje                               |
| `npm run lint`                | ESLint                                                        |
| `npm run format`              | Prettier (write)                                              |
| `npm test`                    | Unit + integration (Jest)                                     |
| `npm run test:coverage`       | Jest s coverage izvještajem                                   |
| `npm run test:e2e`            | Playwright e2e                                                |
| `npm run test:izvjestaj`      | Pokreće sve i generiše izvještaj u `docs/testing/Izvjestaji/` |

## Struktura

```
app/             Next.js App Router (stranice + /api rute po ulogama)
components/      React komponente (ui, forms, po ulogama, wizard)
lib/             Poslovna logika (servisirane/, auth, supabase klijenti, validacije)
domain/types/    TypeScript tipovi domene
supabase/        SQL migracije i konfiguracija (RLS, sheme)
tests/           unit / integration / e2e
docs/testing/    Test strategija, izvještaji i ručni test scenariji
```

## Baza i migracije

Shema i RLS politike su u `supabase/migrations/` (primjenjuju se kroz Supabase CLI / `supabase db push`). Pristup podacima je dodatno zaštićen RLS politikama; serverske rute koriste service-role klijent gdje je potrebno zaobići RLS.
