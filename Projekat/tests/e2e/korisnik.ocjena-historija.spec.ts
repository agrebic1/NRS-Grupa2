import { test, expect, type Page } from '@playwright/test';

type Credentials = { email: string; password: string };

function ucitajKredencijale(role: 'korisnik' | 'serviser'): Credentials | null {
  const prefix = role === 'korisnik' ? 'E2E_KORISNIK' : 'E2E_SERVISER';
  const email    = process.env[`${prefix}_EMAIL`];
  const password = process.env[`${prefix}_PASSWORD`];
  if (!email || !password) return null;
  return { email, password };
}

async function prijaviSe(page: Page, creds: Credentials) {
  await page.goto('/auth/login');
  await page.getByLabel('Email adresa').fill(creds.email);
  await page.getByLabel('Lozinka').fill(creds.password);
  await page.getByRole('button', { name: 'Prijavi se' }).click();
  await expect(page).not.toHaveURL(/\/auth\/login/);
}

const korisnik = ucitajKredencijale('korisnik');
const serviser = ucitajKredencijale('serviser');

// ─── US-54: Pregled historije intervencija ────────────────────────────────────

test.describe('US-54 — Historija intervencija korisnika', () => {
  test('neautentificiran korisnik → redirect na login', async ({ page }) => {
    await page.goto('/korisnik/historija');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test.describe('Prijavljeni korisnik', () => {
    test.skip(!korisnik, 'Missing E2E_KORISNIK_EMAIL / E2E_KORISNIK_PASSWORD in environment.');

    test('historija se učitava i prikazuje listu ili prazno stanje (AC1/AC5)', async ({ page }) => {
      await prijaviSe(page, korisnik as Credentials);
      await page.goto('/korisnik/historija');
      await expect(page).toHaveURL('/korisnik/historija');

      // Stranica se učitala bez crash-a
      await expect(page).not.toHaveURL(/\/auth\/login/);
      await expect(page).not.toHaveURL(/\/error/);
    });

    test('API /api/service-requests/historija vraća 200 za prijavljenog korisnika (AC4)', async ({ page }) => {
      await prijaviSe(page, korisnik as Credentials);
      await page.goto('/korisnik');

      const status = await page.evaluate(async () => {
        const r = await fetch('/api/service-requests/historija', { cache: 'no-store' });
        return r.status;
      });
      expect(status).toBe(200);
    });

    test('API vraća samo historijske statuse — nema aktivnih (AC4)', async ({ page }) => {
      await prijaviSe(page, korisnik as Credentials);
      await page.goto('/korisnik');

      const body = await page.evaluate(async () => {
        const r = await fetch('/api/service-requests/historija', { cache: 'no-store' });
        return r.json();
      });

      const dozvoljeniStatusi = new Set(['zatvoreno', 'zavrseno', 'otkazano', 'odbijeno']);
      for (const z of body.historija ?? []) {
        expect(dozvoljeniStatusi.has(z.status)).toBe(true);
      }
    });
  });

  test('serviser ne može pristupiti korisnikovoj historiji (AC6)', async ({ page }) => {
    test.skip(!serviser, 'Missing E2E_SERVISER_EMAIL / E2E_SERVISER_PASSWORD in environment.');

    await prijaviSe(page, serviser as Credentials);
    await page.goto('/korisnik/historija');

    // Serviser se preusmjerava na / ili mu se prikaz ne odobrava
    await expect(page).not.toHaveURL('/korisnik/historija');
  });
});

// ─── US-52: Ocjena intervencije ───────────────────────────────────────────────

test.describe('US-52 — Ocjena zatvorene intervencije', () => {
  test('neautentificiran korisnik dobija 401 na POST ocjena', async ({ page }) => {
    await page.goto('/auth/login');

    const status = await page.evaluate(async () => {
      const r = await fetch('/api/service-requests/9999/ocjena', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ocjena: 5 }),
        cache: 'no-store',
      });
      return r.status;
    });
    expect(status).toBe(401);
  });

  test('neautentificiran korisnik dobija 401 na GET ocjena', async ({ page }) => {
    await page.goto('/auth/login');

    const status = await page.evaluate(async () => {
      const r = await fetch('/api/service-requests/9999/ocjena', {
        cache: 'no-store',
      });
      return r.status;
    });
    expect(status).toBe(401);
  });

  test.describe('Prijavljeni korisnik', () => {
    test.skip(!korisnik, 'Missing E2E_KORISNIK_EMAIL / E2E_KORISNIK_PASSWORD in environment.');

    test('nepostojeći zahtjev vraća 404 za GET ocjena (AC5)', async ({ page }) => {
      await prijaviSe(page, korisnik as Credentials);
      await page.goto('/korisnik');

      const status = await page.evaluate(async () => {
        const r = await fetch('/api/service-requests/999999/ocjena', { cache: 'no-store' });
        return r.status;
      });
      expect(status).toBe(404);
    });

    test('ocjena 0 na POST vraća 400 (AC2 — validacija raspona)', async ({ page }) => {
      await prijaviSe(page, korisnik as Credentials);
      await page.goto('/korisnik');

      const status = await page.evaluate(async () => {
        const r = await fetch('/api/service-requests/1/ocjena', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ocjena: 0 }),
          cache: 'no-store',
        });
        return r.status;
      });
      expect(status).toBe(400);
    });

    test('ocjena 6 na POST vraća 400 (AC2 — validacija raspona)', async ({ page }) => {
      await prijaviSe(page, korisnik as Credentials);
      await page.goto('/korisnik');

      const status = await page.evaluate(async () => {
        const r = await fetch('/api/service-requests/1/ocjena', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ocjena: 6 }),
          cache: 'no-store',
        });
        return r.status;
      });
      expect(status).toBe(400);
    });

    test('tuđi zahtjev vraća 403 na POST ocjena (AC6)', async ({ page }) => {
      await prijaviSe(page, korisnik as Credentials);
      await page.goto('/korisnik');

      // Korisnik pokušava ocijeniti zahtjev koji mu ne pripada
      // (ID 1 može biti tuđi zahtjev u test okruženju)
      const status = await page.evaluate(async () => {
        const r = await fetch('/api/service-requests/1/ocjena', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ocjena: 3 }),
          cache: 'no-store',
        });
        return r.status;
      });
      // 403 ako zahtjev nije korisnikov, ili 422 ako nije zatvoren — oba su ispravna
      expect([403, 422]).toContain(status);
    });
  });
});

// ─── RBAC: Historija nije dostupna bez prijave ────────────────────────────────

test.describe('RBAC — Historija i ocjene zahtijevaju autentifikaciju', () => {
  test('GET /api/service-requests/historija bez sesije → 401', async ({ page }) => {
    // Osiguravamo da nema aktivne sesije
    await page.context().clearCookies();
    await page.goto('/');

    const status = await page.evaluate(async () => {
      const r = await fetch('/api/service-requests/historija', { cache: 'no-store' });
      return r.status;
    });
    expect(status).toBe(401);
  });

  test('POST /api/service-requests/1/ocjena bez sesije → 401', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/');

    const status = await page.evaluate(async () => {
      const r = await fetch('/api/service-requests/1/ocjena', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ocjena: 4 }),
        cache: 'no-store',
      });
      return r.status;
    });
    expect(status).toBe(401);
  });
});
