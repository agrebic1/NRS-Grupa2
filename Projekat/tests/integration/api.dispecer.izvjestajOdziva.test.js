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

const { GET } = require('@/app/api/dispecer/izvjestaj/odziva/route');

function zahtjeviChain(result = { data: [], error: null }) {
  return {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    not: jest.fn().mockResolvedValue(result),
  };
}

function inChain(result = { data: [], error: null }) {
  const chain = {
    select: jest.fn().mockReturnThis(),
    in: jest.fn(),
  };
  chain.in.mockReturnValueOnce(chain).mockResolvedValueOnce(result);
  return chain;
}

describe('/api/dispecer/izvjestaj/odziva — Sprint 9 (US-42)', () => {
  beforeEach(() => {
    mockSessionGetUser.mockReset();
    mockFrom.mockReset();
    mockAssertDispatcherAccess.mockReset();
  });

  test('GET → 401 bez sesije', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: null } });

    const response = await GET(new Request('http://localhost/api/dispecer/izvjestaj/odziva'));
    expect(response.status).toBe(401);
  });

  test('GET → 403 bez dispecerskog pristupa', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockAssertDispatcherAccess.mockResolvedValue(false);

    const response = await GET(new Request('http://localhost/api/dispecer/izvjestaj/odziva'));
    expect(response.status).toBe(403);
  });

  test('GET → 400 za neispravan datum', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'd1' } } });
    mockAssertDispatcherAccess.mockResolvedValue(true);

    const response = await GET(
      new Request('http://localhost/api/dispecer/izvjestaj/odziva?od=xyz&do=2026-05-22'),
    );
    expect(response.status).toBe(400);
  });

  test('GET → 200 prazan izvještaj kad nema završenih intervencija', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'd1' } } });
    mockAssertDispatcherAccess.mockResolvedValue(true);

    mockFrom.mockImplementation((table) => {
      if (table === 'service_requests') {
        return zahtjeviChain({ data: [], error: null });
      }
      return inChain();
    });

    const response = await GET(
      new Request('http://localhost/api/dispecer/izvjestaj/odziva?od=2026-05-01&do=2026-05-31'),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.serviseri).toEqual([]);
    expect(body.ukupno.broj_intervencija).toBe(0);
  });

  test('GET → 200 sa agregiranim podacima', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'd1' } } });
    mockAssertDispatcherAccess.mockResolvedValue(true);

    const serviserId = '11111111-1111-1111-1111-111111111101';
    mockFrom.mockImplementation((table) => {
      if (table === 'service_requests') {
        return zahtjeviChain({
          data: [
            {
              id: 10,
              serviser_dodijeljen_id: serviserId,
              final_priority: 'VISOKO',
              created_at: '2026-05-10T08:00:00Z',
              updated_at: '2026-05-10T12:00:00Z',
            },
          ],
          error: null,
        });
      }
      if (table === 'work_evidence') {
        return inChain({
          data: [{ zahtjev_id: 10, trajanje_minuta: 90, serviser_id: serviserId }],
          error: null,
        });
      }
      if (table === 'intervention_activities') {
        return inChain({ data: [], error: null });
      }
      if (table === 'osoba') {
        return inChain({
          data: [{ id_osobe: serviserId, ime: 'Serv', prezime: 'Jedan' }],
          error: null,
        });
      }
      return inChain();
    });

    const response = await GET(
      new Request('http://localhost/api/dispecer/izvjestaj/odziva?od=2026-05-01&do=2026-05-31'),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.serviseri.length).toBeGreaterThanOrEqual(1);
    expect(body.serviseri[0].serviser_id).toBe(serviserId);
    expect(body.ukupno.broj_intervencija).toBeGreaterThanOrEqual(1);
  });
});
