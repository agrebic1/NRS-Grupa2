const mockSessionGetUser = jest.fn();
const mockFrom = jest.fn();
const mockAssertDispatcherAccess = jest.fn();
const mockAdminFrom = jest.fn();
const mockListUsers = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mockSessionGetUser },
    from: mockFrom,
  }),
}));

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    auth: {
      getUser: mockSessionGetUser,
      admin: { listUsers: mockListUsers },
    },
    from: mockAdminFrom,
  }),
}));

jest.mock('@/lib/servisirane/dispecerPristup', () => ({
  assertDispatcherAccess: (...args) => mockAssertDispatcherAccess(...args),
}));

const { GET } = require('@/app/api/dispecer/zahtjevi/[id]/preporuka/route');

function zahtjevChain(data) {
  return {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data, error: null }),
  };
}

function aktivnostiChain(data = []) {
  return {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    eq: jest.fn().mockResolvedValue({ data, error: null }),
  };
}

describe('/api/dispecer/zahtjevi/[id]/preporuka - Sprint 10 (US-48)', () => {
  beforeEach(() => {
    mockSessionGetUser.mockReset();
    mockFrom.mockReset();
    mockAdminFrom.mockReset();
    mockAssertDispatcherAccess.mockReset();
    mockListUsers.mockReset();
  });

  test('GET → 401 bez sesije', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: null } });

    const response = await GET(
      new Request('http://localhost/api/dispecer/zahtjevi/1/preporuka'),
      { params: { id: '1' } },
    );
    expect(response.status).toBe(401);
  });

  test('GET → 403 bez dispečerskog pristupa', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockAssertDispatcherAccess.mockResolvedValue(false);

    const response = await GET(
      new Request('http://localhost/api/dispecer/zahtjevi/1/preporuka'),
      { params: { id: '1' } },
    );
    expect(response.status).toBe(403);
  });

  test('GET → 200 prazne preporuke kad nema uloge Serviser', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'd1' } } });
    mockAssertDispatcherAccess.mockResolvedValue(true);

    mockFrom.mockImplementation((table) => {
      if (table === 'service_requests') {
        return zahtjevChain({
          category_main: 'Voda',
          category_sub: null,
          latitude: 43.85,
          longitude: 18.35,
          address: 'Sarajevo',
        });
      }
      if (table === 'intervention_activities') {
        return aktivnostiChain([]);
      }
      return zahtjevChain(null);
    });

    mockAdminFrom.mockImplementation((table) => {
      if (table === 'uloga') {
        return {
          select: jest.fn().mockReturnThis(),
          ilike: jest.fn().mockReturnThis(),
          maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
        };
      }
      return zahtjevChain(null);
    });

    mockListUsers.mockResolvedValue({ data: { users: [] } });

    const response = await GET(
      new Request('http://localhost/api/dispecer/zahtjevi/42/preporuka'),
      { params: { id: '42' } },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.preporuke).toEqual([]);
  });

  test('GET → 200 rangira servisere s udaljenosti (US-48)', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'd1' } } });
    mockAssertDispatcherAccess.mockResolvedValue(true);

    const serviseri = [
      {
        id_uposlenika: 's-bliz',
        is_verified: true,
        osoba: {
          ime: 'Bliz',
          prezime: 'Serviser',
          bazna_latitude: 43.86,
          bazna_longitude: 18.42,
        },
      },
      {
        id_uposlenika: 's-dalek',
        is_verified: true,
        osoba: {
          ime: 'Dalek',
          prezime: 'Serviser',
          bazna_latitude: 44.5,
          bazna_longitude: 19.0,
        },
      },
    ];

    mockFrom.mockImplementation((table) => {
      if (table === 'service_requests') {
        const chain = zahtjevChain({
          category_main: 'Voda',
          category_sub: null,
          latitude: 43.8563,
          longitude: 18.4131,
          address: 'Sarajevo',
        });
        chain.single = jest.fn().mockResolvedValue({
          data: {
            category_main: 'Voda',
            category_sub: null,
            latitude: 43.8563,
            longitude: 18.4131,
            address: 'Sarajevo',
          },
          error: null,
        });
        chain.in = jest.fn().mockReturnThis();
        chain.not = jest.fn().mockResolvedValue({ data: [], error: null });
        return chain;
      }
      if (table === 'intervention_activities') {
        const c = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
        };
        c.eq
          .mockReturnValueOnce(c)
          .mockResolvedValueOnce({ data: [], error: null });
        return c;
      }
      return zahtjevChain(null);
    });

    mockAdminFrom.mockImplementation((table) => {
      if (table === 'uloga') {
        return {
          select: jest.fn().mockReturnThis(),
          ilike: jest.fn().mockReturnThis(),
          maybeSingle: jest
            .fn()
            .mockResolvedValue({
              data: { id_uloge: 'role-serviser' },
              error: null,
            }),
        };
      }
      if (table === 'uposlenici') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({ data: serviseri, error: null }),
        };
      }
      if (table === 'service_requests') {
        return {
          select: jest.fn().mockReturnThis(),
          in: jest.fn().mockReturnThis(),
          not: jest.fn().mockResolvedValue({ data: [], error: null }),
        };
      }
      return zahtjevChain(null);
    });

    mockListUsers.mockResolvedValue({ data: { users: [] } });

    const response = await GET(
      new Request('http://localhost/api/dispecer/zahtjevi/99/preporuka'),
      { params: { id: '99' } },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.preporuke.length).toBe(2);
    expect(body.preporuke[0].serviser.id).toBe('s-bliz');
    expect(typeof body.preporuke[0].score).toBe('number');
    expect(body.preporuke[0].udaljenost_km).not.toBeNull();
  });
});
