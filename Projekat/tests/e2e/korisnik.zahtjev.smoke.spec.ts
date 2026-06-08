import { test, expect } from '@playwright/test';

test.describe('Korisnik zahtjev smoke', () => {
  test('unauthenticated access to zahtjevi/novi redirects to login', async ({
    page,
  }) => {
    await page.goto('/korisnik/zahtjevi/novi');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('login page offers registration navigation', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(
      page.getByRole('link', { name: 'Kreirajte korisnički nalog' }),
    ).toBeVisible();
  });
});
