const mockSessionGetUser = jest.fn();
const mockFrom = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mockSessionGetUser },
    from: mockFrom,
  }),
}));

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({}),
}));

const { GET } = require('@/app/api/auth/uloge/route');

function qb(result) {
  return {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue(result),
  };
}

describe('/api/auth/uloge route', () => {
  beforeEach(() => {
    mockFrom.mockReset();
    mockSessionGetUser.mockReset();
  });

  test('returns 401 without session', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const response = await GET();
    expect(response.status).toBe(401);
  });

  test('returns role list for logged in user', async () => {
    mockSessionGetUser.mockResolvedValue({
      data: { user: { id: 'u1' } },
      error: null,
    });
    mockFrom.mockImplementation((table) => {
      if (table === 'korisnik_usluge')
        return qb({ data: { id_korisnika_usluge: 'u1' }, error: null });
      if (table === 'uposlenici')
        return qb({ data: { id_uloge: 7 }, error: null });
      if (table === 'uloga')
        return qb({ data: { naziv: 'Dispecer' }, error: null });
      return qb({ data: null, error: null });
    });
    const response = await GET();
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.uloge).toEqual(
      expect.arrayContaining(['korisnik', 'dispecer']),
    );
  });

  test('maps serviser and admin role names', async () => {
    mockSessionGetUser.mockResolvedValue({
      data: { user: { id: 'u1' } },
      error: null,
    });
    mockFrom.mockImplementation((table) => {
      if (table === 'korisnik_usluge') return qb({ data: null, error: null });
      if (table === 'uposlenici')
        return qb({ data: { id_uloge: 7 }, error: null });
      if (table === 'uloga')
        return qb({ data: { naziv: 'Serviser' }, error: null });
      return qb({ data: null, error: null });
    });
    const serviserResp = await GET();
    const serviserBody = await serviserResp.json();
    expect(serviserBody.uloge).toEqual(['korisnik', 'serviser']);

    mockFrom.mockImplementation((table) => {
      if (table === 'korisnik_usluge') return qb({ data: null, error: null });
      if (table === 'uposlenici')
        return qb({ data: { id_uloge: 1 }, error: null });
      if (table === 'uloga')
        return qb({ data: { naziv: 'Administrator' }, error: null });
      return qb({ data: null, error: null });
    });
    const adminResp = await GET();
    const adminBody = await adminResp.json();
    expect(adminBody.uloge).toEqual(['korisnik', 'admin']);

    mockFrom.mockImplementation((table) => {
      if (table === 'korisnik_usluge') return qb({ data: null, error: null });
      if (table === 'uposlenici')
        return qb({ data: { id_uloge: 1 }, error: null });
      if (table === 'uloga')
        return qb({ data: { naziv: 'korisnik' }, error: null });
      return qb({ data: null, error: null });
    });
    const korisnikResp = await GET();
    const korisnikBody = await korisnikResp.json();
    expect(korisnikBody.uloge).toEqual(['korisnik']);
  });

  test('ignores unknown role names but keeps korisnik for zaposleni', async () => {
    mockSessionGetUser.mockResolvedValue({
      data: { user: { id: 'u1' } },
      error: null,
    });
    mockFrom.mockImplementation((table) => {
      if (table === 'korisnik_usluge') return qb({ data: null, error: null });
      if (table === 'uposlenici')
        return qb({ data: { id_uloge: 7 }, error: null });
      if (table === 'uloga')
        return qb({ data: { naziv: 'nepoznata' }, error: null });
      return qb({ data: null, error: null });
    });
    const response = await GET();
    const body = await response.json();
    expect(body.uloge).toEqual(['korisnik']);
  });

  test('returns 500 when db lookup fails', async () => {
    mockSessionGetUser.mockResolvedValue({
      data: { user: { id: 'u1' } },
      error: null,
    });
    mockFrom.mockImplementation((table) => {
      if (table === 'korisnik_usluge')
        return qb({ data: null, error: { message: 'db fail' } });
      return qb({ data: null, error: null });
    });
    const response = await GET();
    expect(response.status).toBe(500);
  });

  test('returns 401 when getUser returns auth error', async () => {
    mockSessionGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'session error' },
    });
    const response = await GET();
    expect(response.status).toBe(401);
  });

  test('returns 500 for uposlenici/uloga query failures', async () => {
    mockSessionGetUser.mockResolvedValue({
      data: { user: { id: 'u1' } },
      error: null,
    });
    mockFrom.mockImplementation((table) => {
      if (table === 'korisnik_usluge') return qb({ data: null, error: null });
      if (table === 'uposlenici')
        return qb({ data: null, error: { message: 'uposlenici fail' } });
      return qb({ data: null, error: null });
    });
    const responseUposlenici = await GET();
    expect(responseUposlenici.status).toBe(500);

    mockFrom.mockImplementation((table) => {
      if (table === 'korisnik_usluge') return qb({ data: null, error: null });
      if (table === 'uposlenici')
        return qb({ data: { id_uloge: 1 }, error: null });
      if (table === 'uloga')
        return qb({ data: null, error: { message: 'uloga fail' } });
      return qb({ data: null, error: null });
    });
    const responseUloga = await GET();
    expect(responseUloga.status).toBe(500);
  });

  test('returns 500 from catch fallback', async () => {
    mockSessionGetUser.mockRejectedValue(new Error('boom'));
    const response = await GET();
    expect(response.status).toBe(500);
  });
});
