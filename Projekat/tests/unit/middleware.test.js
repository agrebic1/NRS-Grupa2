const mockGetUser = jest.fn();
const mockRpc = jest.fn();
const mockFrom = jest.fn();

const mockNext = jest.fn((payload) => ({
  type: 'next',
  payload,
  cookies: { set: jest.fn() },
}));
const mockRedirect = jest.fn((url) => ({ type: 'redirect', url: url.toString() }));

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    auth: { getUser: mockGetUser },
    rpc: mockRpc,
    from: mockFrom,
  })),
}));

jest.mock('next/server', () => ({
  NextResponse: {
    next: (...args) => mockNext(...args),
    redirect: (...args) => mockRedirect(...args),
  },
}));

const { middleware } = require('@/middleware');

let tableResponses;

function setTableResponse(table, response) {
  tableResponses[table] = response;
}

function createQueryBuilder(table) {
  return {
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        maybeSingle: jest.fn(async () => tableResponses[table] ?? { data: null, error: null }),
      })),
    })),
  };
}

function req(pathname) {
  return {
    nextUrl: { pathname },
    url: `http://localhost:3000${pathname}`,
    cookies: {
      getAll: jest.fn(() => []),
      set: jest.fn(),
    },
  };
}

describe('middleware auth and role checks', () => {
  const oldUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const oldKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://sb.local';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon';
    tableResponses = {};
    mockGetUser.mockReset();
    mockRpc.mockReset();
    mockFrom.mockImplementation((table) => createQueryBuilder(table));
    mockNext.mockClear();
    mockRedirect.mockClear();
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = oldUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = oldKey;
  });

  test('redirects unauthenticated user to login on private route', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const response = await middleware(req('/korisnik/dashboard'));

    expect(response.type).toBe('redirect');
    expect(response.url).toContain('/auth/login');
    expect(response.url).toContain('redirectTo=%2Fkorisnik%2Fdashboard');
  });

  test.each([
    ['/admin', 'is_admin'],
    ['/serviser', 'is_serviser'],
    ['/dispecer', 'is_dispecer'],
  ])('redirects on role mismatch for %s', async (prefix, rpcName) => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockRpc.mockResolvedValue({ data: false, error: null });

    const response = await middleware(req(`${prefix}/dashboard`));

    expect(mockRpc).toHaveBeenCalledWith(rpcName);
    expect(response.type).toBe('redirect');
    expect(response.url).toBe('http://localhost:3000/');
  });

  test('redirects korisnik route when nema ni korisnik_usluge ni uposlenik', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    setTableResponse('korisnik_usluge', { data: null, error: null });
    setTableResponse('uposlenici', { data: null, error: null });

    const response = await middleware(req('/korisnik/dashboard'));

    expect(mockFrom).toHaveBeenCalledWith('korisnik_usluge');
    expect(response.type).toBe('redirect');
    expect(response.url).toBe('http://localhost:3000/');
  });

  test('allows korisnik route for uposlenik without korisnik_usluge row', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    setTableResponse('korisnik_usluge', { data: null, error: null });
    setTableResponse('uposlenici', { data: { id_uloge: 2 }, error: null });
    setTableResponse('uloga', { data: { naziv: 'serviser' }, error: null });

    const response = await middleware(req('/korisnik/dashboard'));

    expect(response.type).toBe('next');
  });

  test.each([
    ['/admin', () => {
      setTableResponse('uposlenici', { data: { id_uloge: 1 }, error: null });
      setTableResponse('uloga', { data: { naziv: 'admin' }, error: null });
    }],
    ['/serviser', () => {
      setTableResponse('uposlenici', { data: { id_uloge: 1 }, error: null });
      setTableResponse('uloga', { data: { naziv: 'serviser' }, error: null });
    }],
    ['/dispecer', () => {
      setTableResponse('uposlenici', { data: { id_uloge: 1 }, error: null });
      setTableResponse('uloga', { data: { naziv: 'dispecer' }, error: null });
    }],
    ['/korisnik', () => {
      setTableResponse('korisnik_usluge', { data: { id_korisnika_usluge: 'u1' }, error: null });
    }],
  ])('allows pass-through for valid role at %s', async (prefix, arrange) => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    arrange();

    const response = await middleware(req(`${prefix}/dashboard`));

    expect(response.type).toBe('next');
  });

  test('allows korisnik route when korisnik_usluge exists even with serviser role', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    setTableResponse('korisnik_usluge', { data: { id_korisnika_usluge: 'u1' }, error: null });
    setTableResponse('uposlenici', { data: { id_uloge: 2 }, error: null });
    setTableResponse('uloga', { data: { naziv: 'serviser' }, error: null });

    const response = await middleware(req('/korisnik/dashboard'));

    expect(response.type).toBe('next');
  });

  test('denies dispecer route for serviser role', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    setTableResponse('uposlenici', { data: { id_uloge: 2 }, error: null });
    setTableResponse('uloga', { data: { naziv: 'serviser' }, error: null });

    const response = await middleware(req('/dispecer/dashboard'));

    expect(response.type).toBe('redirect');
    expect(response.url).toBe('http://localhost:3000/');
  });

  test('allows korisnik route and denies serviser route for dispecer role with korisnik_usluge', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    setTableResponse('korisnik_usluge', { data: { id_korisnika_usluge: 'u1' }, error: null });
    setTableResponse('uposlenici', { data: { id_uloge: 3 }, error: null });
    setTableResponse('uloga', { data: { naziv: 'dispecer' }, error: null });

    const korisnikResponse = await middleware(req('/korisnik/dashboard'));
    const serviserResponse = await middleware(req('/serviser/dashboard'));

    expect(korisnikResponse.type).toBe('next');
    expect(serviserResponse.type).toBe('redirect');
    expect(serviserResponse.url).toBe('http://localhost:3000/');
  });

  test('falls back to NextResponse.next when env vars are missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const response = await middleware(req('/admin'));

    expect(response.type).toBe('next');
    expect(mockGetUser).not.toHaveBeenCalled();
  });
});
