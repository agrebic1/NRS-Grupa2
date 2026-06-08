import { test, expect, type Page } from '@playwright/test';

type RoleCreds = {
  email: string;
  password: string;
};

function ucitajKredencijale(role: 'serviser' | 'dispecer'): RoleCreds | null {
  const prefix = role === 'serviser' ? 'E2E_SERVISER' : 'E2E_DISPECER';
  const email = process.env[`${prefix}_EMAIL`];
  const password = process.env[`${prefix}_PASSWORD`];

  if (!email || !password) return null;

  return { email, password };
}

async function prijaviSe(page: Page, creds: RoleCreds) {
  await page.goto('/auth/login');
  await page.getByLabel('Email adresa').fill(creds.email);
  await page.getByLabel('Lozinka').fill(creds.password);
  await page.getByRole('button', { name: 'Prijavi se' }).click();
  await expect(page).not.toHaveURL(/\/auth\/login/);
}

/** Sprint 10 · S10-T1: cross-access između uloga (stranice + API). */
test.describe('RBAC cross-access', () => {
  const serviser = ucitajKredencijale('serviser');
  const dispecer = ucitajKredencijale('dispecer');

  test.skip(
    !serviser || !dispecer,
    'Missing E2E role credentials in environment variables.',
  );

  test('serviser moze korisnik, ali ne moze dispecer rutu', async ({
    page,
  }) => {
    await prijaviSe(page, serviser as RoleCreds);

    await page.goto('/korisnik');
    await expect(page).toHaveURL('/korisnik');

    await page.goto('/dispecer');
    await expect(page).toHaveURL('/');
  });

  test('dispecer moze korisnik, ali ne moze serviser rutu', async ({
    page,
  }) => {
    await prijaviSe(page, dispecer as RoleCreds);

    await page.goto('/korisnik');
    await expect(page).toHaveURL('/korisnik');

    await page.goto('/serviser');
    await expect(page).toHaveURL('/');
  });

  test('serviser dobija 403 na GET /api/dispecer/zahtjevi', async ({
    page,
  }) => {
    await prijaviSe(page, serviser as RoleCreds);
    await page.goto('/korisnik');
    const status = await page.evaluate(async () => {
      const r = await fetch('/api/dispecer/zahtjevi', { cache: 'no-store' });
      return r.status;
    });
    expect(status).toBe(403);
  });

  test('dispecer dobija 200 na GET /api/dispecer/zahtjevi', async ({
    page,
  }) => {
    await prijaviSe(page, dispecer as RoleCreds);
    await page.goto('/dispecer');
    const status = await page.evaluate(async () => {
      const r = await fetch('/api/dispecer/zahtjevi', { cache: 'no-store' });
      return r.status;
    });
    expect(status).toBe(200);
  });
});
