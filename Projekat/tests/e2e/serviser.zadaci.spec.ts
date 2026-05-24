import { test, expect, type Page } from '@playwright/test';

type RoleCreds = { email: string; password: string };

function ucitajKredencijale(role: 'dispecer' | 'serviser'): RoleCreds | null {
  const prefix = role === 'dispecer' ? 'E2E_DISPECER' : 'E2E_SERVISER';
  const email    = process.env[`${prefix}_EMAIL`];
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

test.describe('Serviser - pregled zadataka i RBAC', () => {
  const serviser = ucitajKredencijale('serviser');
  const dispecer = ucitajKredencijale('dispecer');

  test.skip(!serviser, 'Missing E2E servicer credentials in environment variables.');

  test('serviser može otvoriti dashboard i dobiti listu intervencija', async ({ page }) => {
    await prijaviSe(page, serviser as RoleCreds);

    const dashboard = await page.goto('/serviser');
    expect(dashboard?.ok()).toBeTruthy();

    const apiRezultat = await page.evaluate(async () => {
      const r    = await fetch('/api/serviser/intervencije', { cache: 'no-store' });
      const body = await r.json().catch(() => ({}));
      return { status: r.status, body };
    });

    expect(apiRezultat.status).toBe(200);
    expect(Array.isArray(apiRezultat.body.intervencije)).toBe(true);
  });

  test('serviser može otvoriti stranicu detalja zadatka (ako postoji dodijeljena)', async ({ page }) => {
    await prijaviSe(page, serviser as RoleCreds);

    const apiRez = await page.evaluate(async () => {
      const r    = await fetch('/api/serviser/intervencije', { cache: 'no-store' });
      const body = await r.json().catch(() => ({}));
      return { status: r.status, intervencije: body.intervencije ?? [] };
    });

    expect(apiRez.status).toBe(200);

    const prvaIntervencija = apiRez.intervencije[0];
    if (prvaIntervencija?.id) {
      const detalj = await page.goto(`/serviser/intervencije/${prvaIntervencija.id}`);
      expect(detalj?.ok()).toBeTruthy();
    }
  });

  test('serviser ne može pristupiti dispečerskim API rutama → 403', async ({ page }) => {
    await prijaviSe(page, serviser as RoleCreds);
    await page.goto('/serviser');

    const status = await page.evaluate(async () => {
      const r = await fetch('/api/dispecer/zahtjevi/1', {
        method:  'PATCH',
        headers: { 'content-type': 'application/json' },
        body:    JSON.stringify({ action: 'promijeni_prioritet', final_priority: 'SREDNJE' }),
      });
      return r.status;
    });

    expect(status).toBe(403);
  });

  test('dispečer ne može koristiti serviser PATCH endpoint → 403', async ({ page }) => {
    test.skip(!dispecer, 'Missing E2E dispatcher credentials in environment variables.');

    await prijaviSe(page, dispecer as RoleCreds);
    await page.goto('/dispecer');

    const status = await page.evaluate(async () => {
      const r = await fetch('/api/serviser/intervencije/0', {
        method:  'PATCH',
        headers: { 'content-type': 'application/json' },
        body:    JSON.stringify({ action: 'prihvati' }),
      });
      return r.status;
    });

    expect(status).toBe(403);
  });
});
