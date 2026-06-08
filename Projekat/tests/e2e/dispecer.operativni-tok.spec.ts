import { test, expect, type Page } from '@playwright/test';

type RoleCreds = {
  email: string;
  password: string;
};

function ucitajKredencijale(role: 'dispecer' | 'serviser'): RoleCreds | null {
  const prefix = role === 'dispecer' ? 'E2E_DISPECER' : 'E2E_SERVISER';
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

test.describe('Dispecer operativni tok', () => {
  const dispecer = ucitajKredencijale('dispecer');
  const serviser = ucitajKredencijale('serviser');

  test.skip(
    !dispecer,
    'Missing E2E dispatcher credentials in environment variables.',
  );

  test('dispecer moze otvoriti dashboard listu i detalj aktivnog zahtjeva', async ({
    page,
  }) => {
    await prijaviSe(page, dispecer as RoleCreds);

    const dashboard = await page.goto('/dispecer');
    expect(dashboard?.ok()).toBeTruthy();

    const lista = await page.goto('/dispecer/zahtjevi?filter=novi');
    expect(lista?.ok()).toBeTruthy();

    const apiRezultat = await page.evaluate(async () => {
      const r = await fetch(
        '/api/dispecer/zahtjevi?status=pending_review,in_review',
        {
          cache: 'no-store',
        },
      );
      const body = await r.json().catch(() => ({}));
      return { status: r.status, body };
    });

    expect(apiRezultat.status).toBe(200);
    expect(Array.isArray(apiRezultat.body.zahtjevi)).toBe(true);

    const prviZahtjev = apiRezultat.body.zahtjevi[0];
    if (prviZahtjev?.id) {
      const detalj = await page.goto(`/dispecer/zahtjevi/${prviZahtjev.id}`);
      expect(detalj?.ok()).toBeTruthy();
    }
  });

  test('dispecer dobija validacioni odgovor na PATCH bez mutiranja stvarnog zahtjeva', async ({
    page,
  }) => {
    await prijaviSe(page, dispecer as RoleCreds);
    await page.goto('/dispecer');

    const status = await page.evaluate(async () => {
      const r = await fetch('/api/dispecer/zahtjevi/0', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action: 'promijeni_prioritet',
          final_priority: 'SREDNJE',
        }),
      });
      return r.status;
    });

    expect(status).toBe(400);
  });

  test('serviser ne moze koristiti dispecerski PATCH endpoint', async ({
    page,
  }) => {
    test.skip(
      !serviser,
      'Missing E2E servicer credentials in environment variables.',
    );

    await prijaviSe(page, serviser as RoleCreds);
    await page.goto('/korisnik');

    const status = await page.evaluate(async () => {
      const r = await fetch('/api/dispecer/zahtjevi/1', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action: 'promijeni_prioritet',
          final_priority: 'SREDNJE',
        }),
      });
      return r.status;
    });

    expect(status).toBe(403);
  });
});
