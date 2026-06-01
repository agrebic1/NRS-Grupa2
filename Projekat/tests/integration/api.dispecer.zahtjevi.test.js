const mockSessionGetUser = jest.fn();
const mockFrom = jest.fn();
const mockAssertDispatcherAccess = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mockSessionGetUser },
    from: mockFrom,
  }),
}));

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({}),
}));

jest.mock('@/lib/servisirane/dispecerPristup', () => ({
  assertDispatcherAccess: (...args) => mockAssertDispatcherAccess(...args),
}));

const { GET } = require('@/app/api/dispecer/zahtjevi/route');

function serviceRequestsQuery(result, terminalOrderCall = 2) {
  const query = {
    select: jest.fn().mockReturnThis(),
    not: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    order: jest.fn(() => {
      if (query.order.mock.calls.length >= terminalOrderCall) {
        return Promise.resolve(result);
      }
      return query;
    }),
  };
  return query;
}

function osobaQuery(result) {
  return {
    select: jest.fn().mockReturnValue({
      in: jest.fn().mockResolvedValue(result),
    }),
  };
}

describe('/api/dispecer/zahtjevi route', () => {
  beforeEach(() => {
    mockSessionGetUser.mockReset();
    mockFrom.mockReset();
    mockAssertDispatcherAccess.mockReset();
  });

  test('returns 401 without session', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: null } });

    const response = await GET(
      new Request('http://localhost/api/dispecer/zahtjevi'),
    );

    expect(response.status).toBe(401);
    expect(mockAssertDispatcherAccess).not.toHaveBeenCalled();
  });

  test('returns 403 when user is not dispatcher or admin', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockAssertDispatcherAccess.mockResolvedValue(false);

    const response = await GET(
      new Request('http://localhost/api/dispecer/zahtjevi'),
    );

    expect(response.status).toBe(403);
  });

  test('returns active requests with requester profiles', async () => {
    let serviceReqFromCalls = 0;
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'd1' } } });
    mockAssertDispatcherAccess.mockResolvedValue(true);

    const zahtjevi = [
      {
        id: 1,
        user_id: 'u1',
        status: 'pending_review',
        is_premium: true,
        created_at: '2026-05-10',
      },
      {
        id: 2,
        user_id: 'u2',
        status: 'in_review',
        is_premium: false,
        created_at: '2026-05-10',
      },
    ];
    const serviceQuery = serviceRequestsQuery({ data: zahtjevi, error: null });

    mockFrom.mockImplementation((table) => {
      if (table === 'service_requests') {
        serviceReqFromCalls += 1;
        if (serviceReqFromCalls === 1) return serviceQuery;
        return {
          select: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({
            data: zahtjevi.map((z) => ({
              id: z.id,
              user_id: z.user_id,
              created_at: z.created_at ?? '2026-05-10T00:00:00Z',
            })),
            error: null,
          }),
        };
      }
      if (table === 'osoba') {
        return osobaQuery({
          data: [
            {
              id_osobe: 'u1',
              ime: 'A',
              prezime: 'B',
              broj_telefona: '061111111',
            },
            { id_osobe: 'u2', ime: 'C', prezime: 'D', broj_telefona: null },
          ],
          error: null,
        });
      }
      return serviceRequestsQuery({ data: [], error: null });
    });

    const response = await GET(
      new Request('http://localhost/api/dispecer/zahtjevi'),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(serviceQuery.not).toHaveBeenCalledWith(
      'status',
      'in',
      '("zatvoreno","otkazano","odbijeno")',
    );
    // `zavrseno` se ne isključuje u .not() - nedavno završeni se prikazuju preko .or() (7-dnevni prozor).
    expect(serviceQuery.or).toHaveBeenCalled();
    expect(body.zahtjevi).toHaveLength(2);
    expect(body.zahtjevi[0].podnosilac).toEqual({
      ime: 'A',
      prezime: 'B',
      broj_telefona: '061111111',
    });
    expect(body.zahtjevi[0].korisnicki_broj_zahtjeva).toBe(1);
    expect(body.zahtjevi[1].korisnicki_broj_zahtjeva).toBe(1);
    expect(body.zahtjevi[0].dispecerski_redni_u_pregledu).toBe(1);
    expect(body.zahtjevi[1].dispecerski_redni_u_pregledu).toBe(2);
  });

  test('applies status query filter when provided', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'd1' } } });
    mockAssertDispatcherAccess.mockResolvedValue(true);

    const serviceQuery = serviceRequestsQuery({ data: [], error: null });
    mockFrom.mockImplementation((table) => {
      if (table === 'service_requests') return serviceQuery;
      if (table === 'osoba') return osobaQuery({ data: [], error: null });
      return serviceRequestsQuery({ data: [], error: null });
    });

    const response = await GET(
      new Request(
        'http://localhost/api/dispecer/zahtjevi?status=pending_review,in_review',
      ),
    );

    expect(response.status).toBe(200);
    expect(serviceQuery.in).toHaveBeenCalledWith('status', [
      'pending_review',
      'in_review',
    ]);
  });

  test('falls back when is_premium ordering column is missing', async () => {
    let serviceReqFromCalls = 0;
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'd1' } } });
    mockAssertDispatcherAccess.mockResolvedValue(true);

    const firstQuery = serviceRequestsQuery({
      data: null,
      error: { message: "'is_premium' column does not exist" },
    });
    const fallbackQuery = serviceRequestsQuery(
      {
        data: [{ id: 1, user_id: 'u1', created_at: '2026-05-01T00:00:00Z' }],
        error: null,
      },
      1,
    );

    mockFrom.mockImplementation((table) => {
      if (table === 'service_requests') {
        serviceReqFromCalls += 1;
        if (serviceReqFromCalls === 1) return firstQuery;
        if (serviceReqFromCalls === 2) return fallbackQuery;
        return {
          select: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({
            data: [
              { id: 1, user_id: 'u1', created_at: '2026-05-01T00:00:00Z' },
            ],
            error: null,
          }),
        };
      }
      if (table === 'osoba') return osobaQuery({ data: [], error: null });
      return serviceRequestsQuery({ data: [], error: null });
    });

    const response = await GET(
      new Request('http://localhost/api/dispecer/zahtjevi'),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.zahtjevi).toHaveLength(1);
    expect(body.zahtjevi[0].korisnicki_broj_zahtjeva).toBe(1);
    expect(body.zahtjevi[0].dispecerski_redni_u_pregledu).toBe(1);
  });
});
