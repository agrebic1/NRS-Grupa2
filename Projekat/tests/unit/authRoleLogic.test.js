const mockSignInWithPassword = jest.fn();
const mockResend = jest.fn();
const mockSignUp = jest.fn();
const mockSignOut = jest.fn();
const mockGetUser = jest.fn();
const mockFrom = jest.fn();

jest.mock('@/lib/supabase/klijent', () => ({
  kreirajKlijenta: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      resend: mockResend,
      signUp: mockSignUp,
      signOut: mockSignOut,
      getUser: mockGetUser,
    },
    from: mockFrom,
  }),
}));

const {
  getUlogeKorisnika,
  odrediRedirectNakonPrijave,
  posaljiPonovoVerifikacijskiEmail,
  prijaviSeEmailom,
  registrujKorisnika,
  odjaviSe,
  getTrenutnogKorisnika,
} = require('@/services/auth/authService');
const { resetLoginRateLimitStore } = require('@/lib/security/loginRateLimiter');

function builder(result) {
  return {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue(result),
    single: jest.fn().mockResolvedValue(result),
  };
}

describe('auth service role logic and auth flows', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    resetLoginRateLimitStore();
    mockFrom.mockReset();
    mockSignInWithPassword.mockReset();
    mockResend.mockReset();
    mockSignUp.mockReset();
    mockSignOut.mockReset();
    mockGetUser.mockReset();
  });

  test('login maps auth errors to neutral or technical messages', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: null,
      error: { message: 'Email not confirmed' },
    });
    await expect(prijaviSeEmailom({ email: 'user@example.com', lozinka: 'x' })).rejects.toThrow(
      'Neispravni podaci za prijavu.'
    );

    mockSignInWithPassword.mockResolvedValueOnce({
      data: null,
      error: { message: 'Invalid login credentials' },
    });
    await expect(prijaviSeEmailom({ email: 'user@example.com', lozinka: 'x' })).rejects.toThrow(
      'Neispravni podaci za prijavu.'
    );

    mockSignInWithPassword.mockResolvedValueOnce({
      data: null,
      error: { message: 'Internal error', status: 503 },
    });
    await expect(prijaviSeEmailom({ email: 'user@example.com', lozinka: 'x' })).rejects.toThrow(
      'Trenutno nije moguće izvršiti prijavu. Pokušajte ponovo.'
    );

    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: { id: 'u1' } },
      error: null,
    });
    await expect(prijaviSeEmailom({ email: ' USER@EXAMPLE.COM ', lozinka: 'x' })).resolves.toEqual({
      user: { id: 'u1' },
    });
  });

  test('resend verification validates email', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';

    await expect(posaljiPonovoVerifikacijskiEmail('los-email')).rejects.toThrow(
      'Unesite ispravnu email adresu.'
    );
    mockResend.mockResolvedValue({ error: null });
    await expect(posaljiPonovoVerifikacijskiEmail(' User@Example.Com ')).resolves.toBeUndefined();
    expect(mockResend).toHaveBeenCalledWith({
      type: 'signup',
      email: 'user@example.com',
      options: {
        emailRedirectTo: 'https://example.com/auth/callback',
      },
    });
    mockResend.mockResolvedValue({ error: { message: 'redirect_to is not allowed' } });
    await expect(posaljiPonovoVerifikacijskiEmail('user@example.com')).rejects.toThrow(
      'Potvrda emaila trenutno nije dostupna'
    );
  });

  test('registration maps errors and succeeds', async () => {
    await expect(
      registrujKorisnika({
        ime: 'A',
        prezime: 'B',
        email: 'bad-email',
        telefon: '061111222',
        lozinka: 'Abcd123!',
      })
    ).rejects.toThrow('Unesite ispravnu email adresu.');

    mockSignUp.mockResolvedValueOnce({
      data: null,
      error: { message: 'Too many requests', status: 429 },
    });
    await expect(
      registrujKorisnika({
        ime: 'A',
        prezime: 'B',
        email: 'user@example.com',
        telefon: '061111222',
        lozinka: 'Abcd123!',
      })
    ).rejects.toThrow('Previše pokušaja registracije');

    mockSignUp.mockResolvedValueOnce({
      data: null,
      error: { message: 'Unexpected auth error', status: 400 },
    });
    await expect(
      registrujKorisnika({
        ime: 'A',
        prezime: 'B',
        email: 'user@example.com',
        telefon: '061111222',
        lozinka: 'Abcd123!',
      })
    ).rejects.toThrow('Unexpected auth error');

    mockSignUp.mockResolvedValueOnce({
      data: null,
      error: { message: 'User already registered', status: 422 },
    });
    await expect(
      registrujKorisnika({
        ime: 'A',
        prezime: 'B',
        email: 'user@example.com',
        telefon: '061111222',
        lozinka: 'Abcd123!',
      })
    ).rejects.toThrow('Nalog sa ovom email adresom već postoji');

    mockSignUp.mockResolvedValueOnce({
      data: {},
      error: null,
    });
    await expect(
      registrujKorisnika({
        ime: 'A',
        prezime: 'B',
        email: 'user@example.com',
        telefon: '061111222',
        lozinka: 'Abcd123!',
      })
    ).rejects.toThrow('Kreiranje naloga nije uspjelo');

    mockSignUp.mockResolvedValueOnce({
      data: {
        user: { id: 'id-existing', email: 'user@example.com', identities: [] },
        session: null,
      },
      error: null,
    });
    await expect(
      registrujKorisnika({
        ime: 'A',
        prezime: 'B',
        email: 'user@example.com',
        telefon: '061111222',
        lozinka: 'Abcd123!',
      })
    ).rejects.toThrow('Nalog sa ovom email adresom već postoji');

    const osobaUpdate = builder({ data: null });
    mockFrom.mockImplementation((table) => {
      if (table === 'osoba') return osobaUpdate;
      return builder({ data: null });
    });
    mockSignUp.mockResolvedValueOnce({
      data: { user: { id: 'id-1' }, session: null },
      error: null,
    });
    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: { id: 'id-1' }, session: { access_token: 't' } },
      error: null,
    });
    await expect(
      registrujKorisnika({
        ime: 'A',
        prezime: 'B',
        email: ' USER@EXAMPLE.COM ',
        telefon: '061111222',
        lozinka: 'Abcd123!',
      })
    ).resolves.toEqual({
      user: { id: 'id-1' },
      session: { access_token: 't' },
    });
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'Abcd123!',
    });

    mockSignUp.mockResolvedValueOnce({
      data: { user: { id: 'id-2' }, session: { access_token: 'direct' } },
      error: null,
    });
    await expect(
      registrujKorisnika({
        ime: 'A',
        prezime: 'B',
        email: 'two@example.com',
        telefon: '061111222',
        lozinka: 'Abcd123!',
      })
    ).resolves.toEqual({
      user: { id: 'id-2' },
      session: { access_token: 'direct' },
    });
    const poziviNakonDirektneSesije = mockSignInWithPassword.mock.calls.length;
    mockSignUp.mockResolvedValueOnce({
      data: { user: { id: 'id-1' }, session: null },
      error: null,
    });
    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'Email not confirmed' },
    });
    await expect(
      registrujKorisnika({
        ime: 'A',
        prezime: 'B',
        email: 'unconfirmed@example.com',
        telefon: '061111222',
        lozinka: 'Abcd123!',
      })
    ).rejects.toMatchObject({
      name: 'PotrebnaPotvrdaEmailaError',
      email: 'unconfirmed@example.com',
    });
    expect(mockSignInWithPassword.mock.calls.length).toBe(poziviNakonDirektneSesije + 1);

    mockSignUp.mockResolvedValueOnce({
      data: {
        user: {
          id: 'id-3',
          email: 'generic-login-error@example.com',
          identities: [{ id: 'identity-1' }],
        },
        session: null,
      },
      error: null,
    });
    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    });
    await expect(
      registrujKorisnika({
        ime: 'A',
        prezime: 'B',
        email: 'generic-login-error@example.com',
        telefon: '061111222',
        lozinka: 'Abcd123!',
      })
    ).rejects.toThrow('Neispravni podaci za prijavu.');
  });

  test('maps roles and redirects', async () => {
    global.fetch.mockRejectedValue(new Error('offline'));
    mockFrom.mockImplementation((table) => {
      if (table === 'korisnik_usluge') return builder({ data: { id_korisnika_usluge: 'u1' } });
      if (table === 'uposlenici') return builder({ data: { id_uloge: 2 } });
      if (table === 'uloga') return builder({ data: { naziv: 'Dispecer' } });
      return builder({ data: null });
    });
    const roles = await getUlogeKorisnika('u1');
    expect(roles).toEqual(expect.arrayContaining(['korisnik', 'dispecer']));

    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ uloge: ['korisnik'] }) });
    await expect(odrediRedirectNakonPrijave('u1')).resolves.toBe('/korisnik');

    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ uloge: ['admin', 'serviser'] }) });
    await expect(odrediRedirectNakonPrijave('u1')).resolves.toBe('/odabir-uloge');

    // Server ruta nedostupna → fallback. Nepoznata interna uloga se preskače,
    // ali uposlenik i dalje dobije ulogu 'korisnik'.
    global.fetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) });
    mockFrom.mockImplementation((table) => {
      if (table === 'korisnik_usluge') return builder({ data: null });
      if (table === 'uposlenici') return builder({ data: { id_uloge: 2 } });
      if (table === 'uloga') return builder({ data: { naziv: 'X-unknown' } });
      return builder({ data: null });
    });
    await expect(getUlogeKorisnika('u2')).resolves.toEqual(['korisnik']);

    // Zaposleni (bez zasebnog korisnik_usluge zapisa) uvijek dobije i ulogu
    // 'korisnik' uz svoju internu ulogu, isto kao server ruta /api/auth/uloge.
    global.fetch.mockRejectedValue(new Error('offline'));
    mockFrom.mockImplementation((table) => {
      if (table === 'korisnik_usluge') return builder({ data: null });
      if (table === 'uposlenici') return builder({ data: { id_uloge: 3 } });
      if (table === 'uloga') return builder({ data: { naziv: 'Serviser' } });
      return builder({ data: null });
    });
    await expect(getUlogeKorisnika('u3')).resolves.toEqual(['korisnik', 'serviser']);

    global.fetch.mockRejectedValue(new Error('offline'));
    mockFrom.mockImplementation((table) => {
      if (table === 'korisnik_usluge') return builder({ data: null });
      if (table === 'uposlenici') return builder({ data: { id_uloge: 4 } });
      if (table === 'uloga') return builder({ data: { naziv: 'Admin' } });
      return builder({ data: null });
    });
    await expect(getUlogeKorisnika('u4')).resolves.toEqual(['korisnik', 'admin']);

    // Uposlenik čija uloga već mapira na 'korisnik' ne smije dati duplikat.
    global.fetch.mockRejectedValue(new Error('offline'));
    mockFrom.mockImplementation((table) => {
      if (table === 'korisnik_usluge') return builder({ data: null });
      if (table === 'uposlenici') return builder({ data: { id_uloge: 5 } });
      if (table === 'uloga') return builder({ data: { naziv: 'Korisnik usluge' } });
      return builder({ data: null });
    });
    await expect(getUlogeKorisnika('u5')).resolves.toEqual(['korisnik']);
  });

  test('session helpers work', async () => {
    mockSignOut.mockResolvedValueOnce({ error: { message: 'x' } });
    await expect(odjaviSe()).rejects.toThrow('Greška pri odjavi iz sistema');
    mockSignOut.mockResolvedValueOnce({ error: null });
    await expect(odjaviSe()).resolves.toBeUndefined();

    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u5' } } });
    await expect(getTrenutnogKorisnika()).resolves.toEqual({ id: 'u5' });
  });

  test('blocks login after too many failed attempts', async () => {
    for (let i = 0; i < 5; i += 1) {
      mockSignInWithPassword.mockResolvedValueOnce({
        data: null,
        error: { message: 'Invalid login credentials' },
      });
      await expect(prijaviSeEmailom({ email: 'limit@example.com', lozinka: 'x' })).rejects.toThrow(
        'Neispravni podaci za prijavu.'
      );
    }

    await expect(prijaviSeEmailom({ email: 'limit@example.com', lozinka: 'x' })).rejects.toThrow(
      'Previše pokušaja prijave. Sačekajte 5 minuta i pokušajte ponovo.'
    );
    expect(mockSignInWithPassword).toHaveBeenCalledTimes(5);
  });
});
