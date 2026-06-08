import { test, expect } from '@playwright/test';

test.describe('Auth smoke', () => {
  test('registration page flow and login page availability', async ({
    page,
  }) => {
    await page.goto('/auth/registracija');
    await expect(
      page.getByRole('heading', { name: 'Kreirajte korisnički nalog' }),
    ).toBeVisible();

    await page.getByRole('textbox', { name: 'Ime', exact: true }).fill('Test');
    await page
      .getByRole('textbox', { name: 'Prezime', exact: true })
      .fill('Korisnik');
    await page
      .getByRole('textbox', { name: 'Email adresa' })
      .fill(`test.${Date.now()}@example.com`);
    await page
      .getByRole('textbox', { name: 'Broj telefona' })
      .fill('+38761111222');
    await page.getByRole('button', { name: 'Nastavi' }).click();

    await expect(page.getByLabel('Lozinka')).toBeVisible();
    await page.getByLabel('Lozinka').fill('Abcd123!');
    await page.getByLabel('Potvrda lozinke').fill('Abcd123!');

    await page.goto('/auth/login');
    await expect(
      page.getByRole('heading', { name: 'Dobrodošli nazad' }),
    ).toBeVisible();
    await page.getByLabel('Email adresa').fill('user@example.com');
    await page.getByLabel('Lozinka').fill('Abcd123!');
    await expect(
      page.getByRole('button', { name: 'Prijavi se' }),
    ).toBeVisible();
  });

  test('private route redirects unauthenticated user to login', async ({
    page,
  }) => {
    await page.goto('/korisnik');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('blocks brute-force login attempts after repeated failures', async ({
    page,
  }) => {
    await page.goto('/auth/login');

    for (let i = 0; i < 5; i += 1) {
      await page.getByLabel('Email adresa').fill('limit@example.com');
      await page.getByLabel('Lozinka').fill('PogresnaLozinka123!');
      await page.getByRole('button', { name: 'Prijavi se' }).click();
      await expect(
        page.getByText('Neispravni podaci za prijavu.'),
      ).toBeVisible();
    }

    await page.getByRole('button', { name: 'Prijavi se' }).click();
    await expect(
      page.getByText(
        'Previše pokušaja prijave. Sačekajte 5 minuta i pokušajte ponovo.',
      ),
    ).toBeVisible();
  });

  test('shows error for invalid credentials on login', async ({ page }) => {
    await page.goto('/auth/login');
    await page
      .getByLabel('Email adresa')
      .fill(`invalid.${Date.now()}@example.com`);
    await page.getByLabel('Lozinka').fill('PogresnaLozinka123!');
    await page.getByRole('button', { name: 'Prijavi se' }).click();
    await expect(page.getByText('Neispravni podaci za prijavu.')).toBeVisible();
  });
});
