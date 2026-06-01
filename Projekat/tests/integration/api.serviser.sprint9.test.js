const mockGetUser = jest.fn();
const mockFrom = jest.fn();
const mockAssertServiserAccess = jest.fn();
const mockAssertVlasnistvo = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}));

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
    rpc: jest.fn().mockResolvedValue({ data: 1, error: null }),
  }),
}));

jest.mock('@/lib/servisirane/serviserPristup', () => {
  const actual = jest.requireActual('@/lib/servisirane/serviserPristup');
  return {
    ...actual,
    assertServiserAccess: (...a) => mockAssertServiserAccess(...a),
    assertServiserVlasnistvo: (...a) => mockAssertVlasnistvo(...a),
  };
});

jest.mock('@/lib/servisirane/notifikacijeHelper', () => ({
  notifPrihvatanjeZadatka: jest.fn().mockResolvedValue(undefined),
  notifOdbijanjeZadatka: jest.fn().mockResolvedValue(undefined),
  notifVratanjaNaPonovnuDodjelu: jest.fn().mockResolvedValue(undefined),
  notifNijeRijesen: jest.fn().mockResolvedValue(undefined),
  notifKorisnikusServiserNaPutu: jest.fn().mockResolvedValue(undefined),
  notifKorisnikusServiserNaTerenu: jest.fn().mockResolvedValue(undefined),
  notifNovaNapomenaDispecer: jest.fn().mockResolvedValue(undefined),
  notifServiserNaTerenu: jest.fn().mockResolvedValue(undefined),
  notifEvidencijaRada: jest.fn().mockResolvedValue(undefined),
}));

const { PATCH } = require('@/app/api/serviser/intervencije/[id]/route');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function flexChain(overrides = {}) {
  const base = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    insert: jest.fn().mockResolvedValue({ data: { id: 1 }, error: null }),
    update: jest.fn(() => ({
      eq: jest.fn().mockResolvedValue({ error: null }),
    })),
  };
  return { ...base, ...overrides };
}

function mockFromForStatus(currentStatus) {
  return (table) => {
    if (table === 'service_requests') {
      return {
        update: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({ error: null }),
        })),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: { user_id: 'u1' }, error: null }),
        maybeSingle: jest
          .fn()
          .mockResolvedValue({ data: { user_id: 'u1' }, error: null }),
      };
    }
    if (table === 'intervention_activities') {
      return {
        insert: jest.fn().mockResolvedValue({ data: null, error: null }),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        maybeSingle: jest
          .fn()
          .mockResolvedValue({ data: { autor_id: 'd1' }, error: null }),
      };
    }
    return flexChain();
  };
}

function patchRequest(body) {
  return new Request('http://localhost/api/serviser/intervencije/1', {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

const RAZLOG_VALIDAN = 'Nema odgovarajuće opreme za ovu intervenciju.';
const PARAMS = { params: { id: '1' } };

// ─── PATCH - vrati_na_ponovnu_dodjelu ─────────────────────────────────────────

describe('PATCH vrati_na_ponovnu_dodjelu (US-29)', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockFrom.mockReset();
    mockAssertServiserAccess.mockReset();
    mockAssertVlasnistvo.mockReset();
  });

  test('vraća 401 bez sesije', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await PATCH(
      patchRequest({
        action: 'vrati_na_ponovnu_dodjelu',
        razlog: RAZLOG_VALIDAN,
      }),
      PARAMS,
    );
    expect(res.status).toBe(401);
  });

  test('vraća 403 za non-servisera', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockAssertServiserAccess.mockResolvedValue(false);
    const res = await PATCH(
      patchRequest({
        action: 'vrati_na_ponovnu_dodjelu',
        razlog: RAZLOG_VALIDAN,
      }),
      PARAMS,
    );
    expect(res.status).toBe(403);
  });

  test('vraća 400 bez razloga', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 's1' } } });
    mockAssertServiserAccess.mockResolvedValue(true);
    mockAssertVlasnistvo.mockResolvedValue({
      ok: true,
      status: 'dodijeljeno',
      is_premium: false,
    });
    const res = await PATCH(
      patchRequest({ action: 'vrati_na_ponovnu_dodjelu' }),
      PARAMS,
    );
    expect(res.status).toBe(400);
  });

  test('vraća 400 za prekratak razlog (< 10 znakova)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 's1' } } });
    mockAssertServiserAccess.mockResolvedValue(true);
    mockAssertVlasnistvo.mockResolvedValue({
      ok: true,
      status: 'dodijeljeno',
      is_premium: false,
    });
    const res = await PATCH(
      patchRequest({ action: 'vrati_na_ponovnu_dodjelu', razlog: 'Kratko' }),
      PARAMS,
    );
    expect(res.status).toBe(400);
  });

  test('vraća 200 i novi_status=potvrdeno iz statusa dodijeljeno', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 's1' } } });
    mockAssertServiserAccess.mockResolvedValue(true);
    mockAssertVlasnistvo.mockResolvedValue({
      ok: true,
      status: 'dodijeljeno',
      is_premium: false,
    });
    mockFrom.mockImplementation(mockFromForStatus('dodijeljeno'));

    const res = await PATCH(
      patchRequest({
        action: 'vrati_na_ponovnu_dodjelu',
        razlog: RAZLOG_VALIDAN,
      }),
      PARAMS,
    );
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.novi_status).toBe('potvrdeno');
    expect(body.broj_ponovnih_ciklusa).toBe(1);
  });

  test('vraća 200 i novi_status=potvrdeno iz statusa u_radu', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 's1' } } });
    mockAssertServiserAccess.mockResolvedValue(true);
    mockAssertVlasnistvo.mockResolvedValue({
      ok: true,
      status: 'u_radu',
      is_premium: false,
    });
    mockFrom.mockImplementation(mockFromForStatus('u_radu'));

    const res = await PATCH(
      patchRequest({
        action: 'vrati_na_ponovnu_dodjelu',
        razlog: RAZLOG_VALIDAN,
      }),
      PARAMS,
    );
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.novi_status).toBe('potvrdeno');
  });

  test('vraća 422 za nedozvoljeni status u_izvrsenju', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 's1' } } });
    mockAssertServiserAccess.mockResolvedValue(true);
    mockAssertVlasnistvo.mockResolvedValue({
      ok: true,
      status: 'u_izvrsenju',
      is_premium: false,
    });
    mockFrom.mockImplementation(mockFromForStatus('u_izvrsenju'));

    const res = await PATCH(
      patchRequest({
        action: 'vrati_na_ponovnu_dodjelu',
        razlog: RAZLOG_VALIDAN,
      }),
      PARAMS,
    );
    expect(res.status).toBe(422);
  });
});

// ─── PATCH - oznaci_nije_rijesen ──────────────────────────────────────────────

describe('PATCH oznaci_nije_rijesen (US-40)', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockFrom.mockReset();
    mockAssertServiserAccess.mockReset();
    mockAssertVlasnistvo.mockReset();
  });

  test('vraća 401 bez sesije', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await PATCH(
      patchRequest({ action: 'oznaci_nije_rijesen', razlog: RAZLOG_VALIDAN }),
      PARAMS,
    );
    expect(res.status).toBe(401);
  });

  test('vraća 403 za non-servisera', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockAssertServiserAccess.mockResolvedValue(false);
    const res = await PATCH(
      patchRequest({ action: 'oznaci_nije_rijesen', razlog: RAZLOG_VALIDAN }),
      PARAMS,
    );
    expect(res.status).toBe(403);
  });

  test('vraća 400 bez razloga', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 's1' } } });
    mockAssertServiserAccess.mockResolvedValue(true);
    mockAssertVlasnistvo.mockResolvedValue({
      ok: true,
      status: 'u_izvrsenju',
      is_premium: false,
    });
    const res = await PATCH(
      patchRequest({ action: 'oznaci_nije_rijesen' }),
      PARAMS,
    );
    expect(res.status).toBe(400);
  });

  test('vraća 400 za prekratak razlog (< 10 znakova)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 's1' } } });
    mockAssertServiserAccess.mockResolvedValue(true);
    mockAssertVlasnistvo.mockResolvedValue({
      ok: true,
      status: 'u_izvrsenju',
      is_premium: false,
    });
    const res = await PATCH(
      patchRequest({ action: 'oznaci_nije_rijesen', razlog: 'Kratko' }),
      PARAMS,
    );
    expect(res.status).toBe(400);
  });

  test('vraća 200 i novi_status=potvrdeno iz statusa u_izvrsenju', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 's1' } } });
    mockAssertServiserAccess.mockResolvedValue(true);
    mockAssertVlasnistvo.mockResolvedValue({
      ok: true,
      status: 'u_izvrsenju',
      is_premium: false,
    });
    mockFrom.mockImplementation(mockFromForStatus('u_izvrsenju'));

    const res = await PATCH(
      patchRequest({ action: 'oznaci_nije_rijesen', razlog: RAZLOG_VALIDAN }),
      PARAMS,
    );
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.novi_status).toBe('potvrdeno');
  });

  test('vraća 422 za nedozvoljeni status dodijeljeno', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 's1' } } });
    mockAssertServiserAccess.mockResolvedValue(true);
    mockAssertVlasnistvo.mockResolvedValue({
      ok: true,
      status: 'dodijeljeno',
      is_premium: false,
    });
    mockFrom.mockImplementation(mockFromForStatus('dodijeljeno'));

    const res = await PATCH(
      patchRequest({ action: 'oznaci_nije_rijesen', razlog: RAZLOG_VALIDAN }),
      PARAMS,
    );
    expect(res.status).toBe(422);
  });

  test('vraća 422 za nedozvoljeni status u_radu', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 's1' } } });
    mockAssertServiserAccess.mockResolvedValue(true);
    mockAssertVlasnistvo.mockResolvedValue({
      ok: true,
      status: 'u_radu',
      is_premium: false,
    });
    mockFrom.mockImplementation(mockFromForStatus('u_radu'));

    const res = await PATCH(
      patchRequest({ action: 'oznaci_nije_rijesen', razlog: RAZLOG_VALIDAN }),
      PARAMS,
    );
    expect(res.status).toBe(422);
  });
});
