// Pokriva preostale grane mapiranja grešaka pri ponovnom slanju verifikacijskog
// emaila u services/auth/authService.ts (rate limit, već potvrđen email, generička
// greška i nedostajuća NEXT_PUBLIC_SITE_URL konfiguracija).
const mockResend = jest.fn();

jest.mock('@/lib/supabase/klijent', () => ({
  kreirajKlijenta: () => ({
    auth: {
      resend: mockResend,
    },
  }),
}));

const {
  posaljiPonovoVerifikacijskiEmail,
} = require('@/services/auth/authService');

describe('posaljiPonovoVerifikacijskiEmail – mapiranje grešaka ponovnog slanja verifikacije', () => {
  const ORIGINALNI_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
  const ORIGINALNI_APP_URL = process.env.NEXT_PUBLIC_APP_URL;

  beforeEach(() => {
    mockResend.mockReset();
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';
    delete process.env.NEXT_PUBLIC_APP_URL;
  });

  afterAll(() => {
    if (ORIGINALNI_SITE_URL === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    } else {
      process.env.NEXT_PUBLIC_SITE_URL = ORIGINALNI_SITE_URL;
    }
    if (ORIGINALNI_APP_URL === undefined) {
      delete process.env.NEXT_PUBLIC_APP_URL;
    } else {
      process.env.NEXT_PUBLIC_APP_URL = ORIGINALNI_APP_URL;
    }
  });

  test('rate limit (status 429) → poruka o previše zahtjeva za novi link', async () => {
    mockResend.mockResolvedValue({
      error: { message: 'Too many requests', status: 429 },
    });
    await expect(
      posaljiPonovoVerifikacijskiEmail('user@example.com'),
    ).rejects.toThrow('Previše zahtjeva za novi link');
  });

  test('rate limit prepoznat i po tekstu poruke', async () => {
    mockResend.mockResolvedValue({
      error: { message: 'Email rate limit exceeded' },
    });
    await expect(
      posaljiPonovoVerifikacijskiEmail('user@example.com'),
    ).rejects.toThrow('Previše zahtjeva za novi link');
  });

  test('već potvrđen email → poruka da je email već potvrđen', async () => {
    mockResend.mockResolvedValue({
      error: { message: 'Email already confirmed' },
    });
    await expect(
      posaljiPonovoVerifikacijskiEmail('user@example.com'),
    ).rejects.toThrow('Email je već potvrđen');
  });

  test('nepoznata greška → generička poruka o neuspjelom slanju', async () => {
    mockResend.mockResolvedValue({
      error: { message: 'SMTP server unreachable' },
    });
    await expect(
      posaljiPonovoVerifikacijskiEmail('user@example.com'),
    ).rejects.toThrow('Slanje verifikacijskog emaila nije uspjelo');
  });

  test('nedostaje NEXT_PUBLIC_SITE_URL → poruka da potvrda emaila nije konfigurisana', async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    await expect(
      posaljiPonovoVerifikacijskiEmail('user@example.com'),
    ).rejects.toThrow('Potvrda emaila nije konfigurisana');
    expect(mockResend).not.toHaveBeenCalled();
  });
});
