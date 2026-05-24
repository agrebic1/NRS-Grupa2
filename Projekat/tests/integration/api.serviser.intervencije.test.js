const mockGetUser              = jest.fn();
const mockFrom                 = jest.fn();
const mockAssertServiserAccess = jest.fn();
const mockAssertVlasnistvo     = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}));

jest.mock('@/lib/servisirane/serviserPristup', () => {
  const actual = jest.requireActual('@/lib/servisirane/serviserPristup');
  return {
    ...actual,
    assertServiserAccess:    (...a) => mockAssertServiserAccess(...a),
    assertServiserVlasnistvo: (...a) => mockAssertVlasnistvo(...a),
  };
});

jest.mock('@/lib/servisirane/notifikacijeHelper', () => ({
  notifPrihvatanjeZadatka:       jest.fn().mockResolvedValue(undefined),
  notifOdbijanjeZadatka:         jest.fn().mockResolvedValue(undefined),
  notifKorisnikusServiserNaPutu: jest.fn().mockResolvedValue(undefined),
  notifKorisnikusServiserNaTerenu: jest.fn().mockResolvedValue(undefined),
  notifNovaNapomenaDispecer:     jest.fn().mockResolvedValue(undefined),
  notifServiserNaTerenu:         jest.fn().mockResolvedValue(undefined),
  notifEvidencijaRada:           jest.fn().mockResolvedValue(undefined),
}));

const { GET, PATCH } = require('@/app/api/serviser/intervencije/[id]/route');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function flexChain(overrides = {}) {
  const base = {
    select:      jest.fn().mockReturnThis(),
    eq:          jest.fn().mockReturnThis(),
    order:       jest.fn().mockReturnThis(),
    limit:       jest.fn().mockReturnThis(),
    single:      jest.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    insert:      jest.fn().mockResolvedValue({ data: { id: 1 }, error: null }),
    update:      jest.fn(() => ({ eq: jest.fn().mockResolvedValue({ error: null }) })),
  };
  return { ...base, ...overrides };
}

function mockFromPatch({ updateError = null } = {}) {
  return (table) => {
    if (table === 'service_requests') {
      return {
        update: jest.fn(() => ({ eq: jest.fn().mockResolvedValue({ error: updateError }) })),
        select: jest.fn().mockReturnThis(),
        eq:     jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { user_id: 'u1' }, error: null }),
        maybeSingle: jest.fn().mockResolvedValue({ data: { user_id: 'u1' }, error: null }),
      };
    }
    if (table === 'intervention_activities') {
      return {
        insert:      jest.fn().mockResolvedValue({ data: null, error: null }),
        select:      jest.fn().mockReturnThis(),
        eq:          jest.fn().mockReturnThis(),
        order:       jest.fn().mockReturnThis(),
        limit:       jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: { autor_id: 'd1' }, error: null }),
      };
    }
    return flexChain();
  };
}

function patchRequest(body) {
  return new Request('http://localhost/api/serviser/intervencije/1', {
    method:  'PATCH',
    body:    JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

const PARAMS = { params: { id: '1' } };
const PARAMS_NEVAZECI = { params: { id: 'x' } };

// ─── GET ─────────────────────────────────────────────────────────────────────

describe('GET /api/serviser/intervencije/[id]', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockFrom.mockReset();
    mockAssertServiserAccess.mockReset();
    mockAssertVlasnistvo.mockReset();
  });

  test('vraća 401 bez sesije', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await GET(new Request('http://localhost/api/serviser/intervencije/1'), PARAMS);
    expect(res.status).toBe(401);
  });

  test('vraća 400 za nevažeći ID', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 's1' } } });
    mockAssertServiserAccess.mockResolvedValue(true);
    const res = await GET(new Request('http://localhost/api/serviser/intervencije/x'), PARAMS_NEVAZECI);
    expect(res.status).toBe(400);
  });

  test('vraća 403 ako korisnik nije serviser', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockAssertServiserAccess.mockResolvedValue(false);
    const res = await GET(new Request('http://localhost/api/serviser/intervencije/1'), PARAMS);
    expect(res.status).toBe(403);
  });

  test('vraća 403 ako serviser nije vlasnik', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 's1' } } });
    mockAssertServiserAccess.mockResolvedValue(true);
    mockAssertVlasnistvo.mockResolvedValue({ ok: false, greska: 'Nemate pristup.' });
    const res = await GET(new Request('http://localhost/api/serviser/intervencije/1'), PARAMS);
    expect(res.status).toBe(403);
  });

  test('vraća 200 s detaljem intervencije', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 's1' } } });
    mockAssertServiserAccess.mockResolvedValue(true);
    mockAssertVlasnistvo.mockResolvedValue({ ok: true, status: 'dodijeljeno', is_premium: false });

    mockFrom.mockImplementation((table) => {
      if (table === 'service_requests') {
        return {
          select: jest.fn().mockReturnThis(),
          eq:     jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { id: 1, user_id: 'u1', status: 'dodijeljeno' }, error: null,
          }),
        };
      }
      return flexChain();
    });

    const res  = await GET(new Request('http://localhost/api/serviser/intervencije/1'), PARAMS);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.zahtjev.id).toBe(1);
  });
});

// ─── PATCH - prihvati ─────────────────────────────────────────────────────────

describe('PATCH prihvati (dodijeljeno → u_radu)', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockFrom.mockReset();
    mockAssertServiserAccess.mockReset();
    mockAssertVlasnistvo.mockReset();
  });

  test('vraća 401 bez sesije', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await PATCH(patchRequest({ action: 'prihvati' }), PARAMS);
    expect(res.status).toBe(401);
  });

  test('vraća 403 za non-servisera', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockAssertServiserAccess.mockResolvedValue(false);
    const res = await PATCH(patchRequest({ action: 'prihvati' }), PARAMS);
    expect(res.status).toBe(403);
  });

  test('vraća 400 za nevažeće tijelo', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 's1' } } });
    mockAssertServiserAccess.mockResolvedValue(true);
    mockAssertVlasnistvo.mockResolvedValue({ ok: true, status: 'dodijeljeno', is_premium: false });
    const res = await PATCH(patchRequest({ action: 'nepostojeca' }), PARAMS);
    expect(res.status).toBe(400);
  });

  test('prihvata zadatak u statusu dodijeljeno → 200, novi_status u_radu', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 's1' } } });
    mockAssertServiserAccess.mockResolvedValue(true);
    mockAssertVlasnistvo.mockResolvedValue({ ok: true, status: 'dodijeljeno', is_premium: false });
    mockFrom.mockImplementation(mockFromPatch());

    const res  = await PATCH(patchRequest({ action: 'prihvati' }), PARAMS);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.novi_status).toBe('u_radu');
  });

  test('odbija prihvatanje kada status nije dodijeljeno → 400', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 's1' } } });
    mockAssertServiserAccess.mockResolvedValue(true);
    mockAssertVlasnistvo.mockResolvedValue({ ok: true, status: 'u_izvrsenju', is_premium: false });
    mockFrom.mockImplementation(mockFromPatch());

    const res = await PATCH(patchRequest({ action: 'prihvati' }), PARAMS);
    expect(res.status).toBe(400);
  });
});

// ─── PATCH - pocni ────────────────────────────────────────────────────────────

describe('PATCH pocni (u_radu → u_izvrsenju)', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockFrom.mockReset();
    mockAssertServiserAccess.mockReset();
    mockAssertVlasnistvo.mockReset();
  });

  test('prelaz u_radu → u_izvrsenju → 200', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 's1' } } });
    mockAssertServiserAccess.mockResolvedValue(true);
    mockAssertVlasnistvo.mockResolvedValue({ ok: true, status: 'u_radu', is_premium: false });
    mockFrom.mockImplementation(mockFromPatch());

    const res  = await PATCH(patchRequest({ action: 'pocni' }), PARAMS);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.novi_status).toBe('u_izvrsenju');
  });

  test('blokira pocni iz dodijeljeno → 400', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 's1' } } });
    mockAssertServiserAccess.mockResolvedValue(true);
    mockAssertVlasnistvo.mockResolvedValue({ ok: true, status: 'dodijeljeno', is_premium: false });
    mockFrom.mockImplementation(mockFromPatch());

    const res = await PATCH(patchRequest({ action: 'pocni' }), PARAMS);
    expect(res.status).toBe(400);
  });
});

// ─── PATCH - odbij ────────────────────────────────────────────────────────────

describe('PATCH odbij zadatak', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockFrom.mockReset();
    mockAssertServiserAccess.mockReset();
    mockAssertVlasnistvo.mockReset();
  });

  test('odbija zadatak s razlogom → 200, novi_status potvrdeno', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 's1' } } });
    mockAssertServiserAccess.mockResolvedValue(true);
    mockAssertVlasnistvo.mockResolvedValue({ ok: true, status: 'dodijeljeno', is_premium: false });
    mockFrom.mockImplementation(mockFromPatch());

    const res  = await PATCH(patchRequest({ action: 'odbij', razlog: 'Nema kapaciteta danas.' }), PARAMS);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.novi_status).toBe('potvrdeno');
  });

  test('odbija bez razloga → 400', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 's1' } } });
    mockAssertServiserAccess.mockResolvedValue(true);
    mockAssertVlasnistvo.mockResolvedValue({ ok: true, status: 'dodijeljeno', is_premium: false });

    const res = await PATCH(patchRequest({ action: 'odbij' }), PARAMS);
    expect(res.status).toBe(400);
  });

  test('odbija sa prekratkim razlogom → 400', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 's1' } } });
    mockAssertServiserAccess.mockResolvedValue(true);
    mockAssertVlasnistvo.mockResolvedValue({ ok: true, status: 'dodijeljeno', is_premium: false });

    const res = await PATCH(patchRequest({ action: 'odbij', razlog: 'Kratko' }), PARAMS);
    expect(res.status).toBe(400);
  });

  test('blokira odbijanje iz statusa u_radu → 400', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 's1' } } });
    mockAssertServiserAccess.mockResolvedValue(true);
    mockAssertVlasnistvo.mockResolvedValue({ ok: true, status: 'u_radu', is_premium: false });
    mockFrom.mockImplementation(mockFromPatch());

    const res = await PATCH(patchRequest({ action: 'odbij', razlog: 'Nema kapaciteta danas.' }), PARAMS);
    expect(res.status).toBe(400);
  });
});
