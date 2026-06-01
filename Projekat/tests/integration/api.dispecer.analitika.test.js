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
  createAdminClient: () => ({
    auth: { getUser: mockSessionGetUser },
    from: mockFrom,
  }),
}));

jest.mock('@/lib/servisirane/dispecerPristup', () => ({
  assertDispatcherAccess: (...args) => mockAssertDispatcherAccess(...args),
}));

const { GET } = require('@/app/api/dispecer/analitika/route');

function inChain(result = { data: [], error: null }) {
  const chain = {
    select: jest.fn().mockReturnThis(),
    in: jest.fn(),
  };
  chain.in.mockReturnValueOnce(chain).mockResolvedValueOnce(result);
  return chain;
}

function rangeChain(result = { data: [], error: null }) {
  return {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    not: jest.fn().mockReturnThis(),
    in: jest.fn().mockResolvedValue(result),
  };
}

function cohortChain(result = { data: [], error: null }) {
  const chain = {
    select: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn(),
  };
  chain.lte.mockResolvedValue(result);
  return chain;
}

describe('/api/dispecer/analitika - Sprint 10 (US-49)', () => {
  beforeEach(() => {
    mockSessionGetUser.mockReset();
    mockFrom.mockReset();
    mockAssertDispatcherAccess.mockReset();
  });

  test('GET → 401 bez sesije', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: null } });

    const response = await GET(new Request('http://localhost/api/dispecer/analitika'));
    expect(response.status).toBe(401);
  });

  test('GET → 403 bez dispečerskog pristupa', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockAssertDispatcherAccess.mockResolvedValue(false);

    const response = await GET(new Request('http://localhost/api/dispecer/analitika'));
    expect(response.status).toBe(403);
  });

  test('GET → 400 za neispravan datum', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'd1' } } });
    mockAssertDispatcherAccess.mockResolvedValue(true);

    const response = await GET(
      new Request('http://localhost/api/dispecer/analitika?od=xyz&do=2026-06-01'),
    );
    expect(response.status).toBe(400);
  });

  test('GET → 200 prazne metrike kad nema podataka', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'd1' } } });
    mockAssertDispatcherAccess.mockResolvedValue(true);

    let zahtjevUpit = 0;
    mockFrom.mockImplementation((table) => {
      if (table === 'service_requests') {
        zahtjevUpit += 1;
        if (zahtjevUpit === 1) {
          return cohortChain({ data: [], error: null });
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lte: jest.fn().mockReturnThis(),
          not: jest.fn().mockResolvedValue({ data: [], error: null }),
        };
      }
      return rangeChain({ data: [], error: null });
    });

    const response = await GET(
      new Request('http://localhost/api/dispecer/analitika?od=2026-06-01&do=2026-06-30'),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.period).toEqual({ od: '2026-06-01', do: '2026-06-30' });
    expect(body.ukupno_zahtjeva).toBe(0);
    expect(body.ukupno_zavrsenih).toBe(0);
    expect(body.po_statusu).toEqual([]);
  });

  test('GET → 200 sa agregiranim KPI za kohortu', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'd1' } } });
    mockAssertDispatcherAccess.mockResolvedValue(true);

    const kohorta = [
      {
        id: 1,
        status: 'zavrseno',
        final_priority: 'VISOKO',
        created_at: '2026-06-10T10:00:00Z',
        updated_at: '2026-06-12T12:00:00Z',
        serviser_dodijeljen_id: 's1',
        broj_ponovnih_ciklusa: 0,
      },
      {
        id: 2,
        status: 'na_cekanju',
        final_priority: null,
        created_at: '2026-06-11T10:00:00Z',
        updated_at: '2026-06-11T10:00:00Z',
        serviser_dodijeljen_id: null,
        broj_ponovnih_ciklusa: 2,
      },
    ];

    let zahtjevUpit = 0;
    mockFrom.mockImplementation((table) => {
      if (table === 'service_requests') {
        zahtjevUpit += 1;
        if (zahtjevUpit === 1) {
          return cohortChain({ data: kohorta, error: null });
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lte: jest.fn().mockReturnThis(),
          not: jest.fn().mockResolvedValue({ data: [kohorta[0]], error: null }),
        };
      }
      if (table === 'work_evidence') {
        return inChain({
          data: [{ zahtjev_id: 1, trajanje_minuta: 45 }],
          error: null,
        });
      }
      if (table === 'intervention_activities') {
        return inChain({ data: [], error: null });
      }
      if (table === 'osoba') {
        return rangeChain({
          data: [{ id_osobe: 's1', ime: 'Ana', prezime: 'Serviser' }],
          error: null,
        });
      }
      return rangeChain();
    });

    const response = await GET(
      new Request('http://localhost/api/dispecer/analitika?od=2026-06-01&do=2026-06-30'),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ukupno_zahtjeva).toBe(2);
    expect(body.ukupno_zavrsenih).toBe(1);
    expect(body.po_statusu.length).toBeGreaterThan(0);
  });
});
