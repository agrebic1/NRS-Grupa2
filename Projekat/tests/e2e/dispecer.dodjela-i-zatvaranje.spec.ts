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

test.describe('Dispečer - dodjela i zatvaranje intervencije', () => {
  const dispecer = ucitajKredencijale('dispecer');

  test.skip(!dispecer, 'Missing E2E dispatcher credentials in environment variables.');

  test('PATCH dodijeli s nevažećim ID-jem vraća 400', async ({ page }) => {
    await prijaviSe(page, dispecer as RoleCreds);
    await page.goto('/dispecer');

    const status = await page.evaluate(async () => {
      const r = await fetch('/api/dispecer/zahtjevi/0', {
        method:  'PATCH',
        headers: { 'content-type': 'application/json' },
        body:    JSON.stringify({
          action:      'dodijeli',
          serviser_id: '00000000-0000-0000-0000-000000000001',
        }),
      });
      return r.status;
    });

    expect(status).toBe(400);
  });

  test('PATCH zatvori na nepostojećem zahtjevu vraća 400', async ({ page }) => {
    await prijaviSe(page, dispecer as RoleCreds);
    await page.goto('/dispecer');

    const status = await page.evaluate(async () => {
      const r = await fetch('/api/dispecer/zahtjevi/0', {
        method:  'PATCH',
        headers: { 'content-type': 'application/json' },
        body:    JSON.stringify({ action: 'zatvori' }),
      });
      return r.status;
    });

    expect(status).toBe(400);
  });

  test('dispečer vidi listu aktivnih zahtjeva i može učitati detalj', async ({ page }) => {
    await prijaviSe(page, dispecer as RoleCreds);

    const apiRez = await page.evaluate(async () => {
      const r    = await fetch('/api/dispecer/zahtjevi', { cache: 'no-store' });
      const body = await r.json().catch(() => ({}));
      return { status: r.status, zahtjevi: body.zahtjevi ?? [] };
    });

    expect(apiRez.status).toBe(200);
    expect(Array.isArray(apiRez.zahtjevi)).toBe(true);

    const prviZahtjev = apiRez.zahtjevi[0];
    if (prviZahtjev?.id) {
      const apiDetalj = await page.evaluate(async (id: number) => {
        const r    = await fetch(`/api/dispecer/zahtjevi/${id}`, { cache: 'no-store' });
        const body = await r.json().catch(() => ({}));
        return { status: r.status, body };
      }, prviZahtjev.id);

      expect(apiDetalj.status).toBe(200);
      expect(apiDetalj.body.zahtjev?.id).toBe(prviZahtjev.id);
    }
  });
});
