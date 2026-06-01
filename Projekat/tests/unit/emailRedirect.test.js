/** @jest-environment node */
const { getAuthEmailRedirectUrl, AUTH_CALLBACK_PATH } = require('@/lib/auth/emailRedirect');

describe('getAuthEmailRedirectUrl', () => {
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  afterEach(() => {
    if (originalSiteUrl === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    } else {
      process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
    }
  });

  test('uses NEXT_PUBLIC_SITE_URL when set', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://nrs-grupa2.vercel.app/';
    expect(getAuthEmailRedirectUrl()).toBe(`https://nrs-grupa2.vercel.app${AUTH_CALLBACK_PATH}`);
  });

  test('returns empty string when no site url and no window', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(getAuthEmailRedirectUrl()).toBe('');
  });
});
