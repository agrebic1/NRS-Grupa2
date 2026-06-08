// Integration tests za akcije 'dodijeli' i 'zatvori' (dispatcher route)
// i za POST /api/serviser/intervencije/[id]/evidencija

const mockSessionGetUser = jest.fn();
const mockFrom = jest.fn();
const mockAssertDispatcherAccess = jest.fn();
const mockAssertServiserAccess = jest.fn();
const mockAssertVlasnistvo = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mockSessionGetUser },
    from: mockFrom,
  }),
}));

jest.mock('@/lib/servisirane/dispecerPristup', () => ({
  assertDispatcherAccess: (...a) => mockAssertDispatcherAccess(...a),
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
  notifKorisnikusServiserNaPutu: jest.fn().mockResolvedValue(undefined),
  notifKorisnikusServiserNaTerenu: jest.fn().mockResolvedValue(undefined),
  notifNovaNapomenaDispecer: jest.fn().mockResolvedValue(undefined),
  notifServiserNaTerenu: jest.fn().mockResolvedValue(undefined),
  notifEvidencijaRada: jest.fn().mockResolvedValue(undefined),
  notifDodjelaIntervencije: jest.fn().mockResolvedValue(undefined),
  notifZatvaranjeIntervencije: jest.fn().mockResolvedValue(undefined),
  notifTimDodjela: jest.fn().mockResolvedValue(undefined),
  notifKorisnikusServiserDodijeljen: jest.fn().mockResolvedValue(undefined),
  notifKorisnikusIntervencijaZavrsena: jest.fn().mockResolvedValue(undefined),
  notifKorisnikusIntervencijaZatvorena: jest.fn().mockResolvedValue(undefined),
  notifKorisnikusZahtjevUObradi: jest.fn().mockResolvedValue(undefined),
  notifNovaNapomenaServiser: jest.fn().mockResolvedValue(undefined),
}));

const {
  PATCH: DISPECER_PATCH,
} = require('@/app/api/dispecer/zahtjevi/[id]/route');
const {
  POST: EVIDENCIJA_POST,
} = require('@/app/api/serviser/intervencije/[id]/evidencija/route');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function flexChain() {
  return {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    insert: jest.fn().mockResolvedValue({ data: null, error: null }),
    update: jest.fn(() => ({
      eq: jest.fn().mockResolvedValue({ error: null }),
    })),
  };
}

function singleQuery(data) {
  return {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data, error: null }),
    maybeSingle: jest.fn().mockResolvedValue({ data, error: null }),
  };
}

function updateQuery(onUpdate = jest.fn()) {
  return {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    update: jest.fn((payload) => {
      onUpdate(payload);
      return { eq: jest.fn().mockResolvedValue({ error: null }) };
    }),
  };
}

function dispecerPatch(body) {
  return new Request('http://localhost/api/dispecer/zahtjevi/1', {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

function evidencijaPost(body) {
  return new Request(
    'http://localhost/api/serviser/intervencije/1/evidencija',
    {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'content-type': 'application/json' },
    },
  );
}

const PARAMS = { params: { id: '1' } };

// ─── PATCH dodijeli ───────────────────────────────────────────────────────────

describe('PATCH dodijeli servisera (dispečer)', () => {
  beforeEach(() => {
    mockSessionGetUser.mockReset();
    mockFrom.mockReset();
    mockAssertDispatcherAccess.mockReset();
  });

  test('vraća 401 bez sesije', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: null } });
    const res = await DISPECER_PATCH(
      dispecerPatch({
        action: 'dodijeli',
        serviser_id: '00000000-0000-0000-0000-000000000001',
      }),
      PARAMS,
    );
    expect(res.status).toBe(401);
  });

  test('vraća 403 za non-dispečera', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 's1' } } });
    mockAssertDispatcherAccess.mockResolvedValue(false);
    const res = await DISPECER_PATCH(
      dispecerPatch({
        action: 'dodijeli',
        serviser_id: '00000000-0000-0000-0000-000000000001',
      }),
      PARAMS,
    );
    expect(res.status).toBe(403);
  });

  test('dodjela zahtjeva u statusu potvrdeno → 200', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'd1' } } });
    mockAssertDispatcherAccess.mockResolvedValue(true);

    const onUpdate = jest.fn();
    let srCalls = 0;
    mockFrom.mockImplementation((table) => {
      if (table === 'service_requests') {
        srCalls += 1;
        if (srCalls === 1) {
          return singleQuery({ status: 'potvrdeno', is_premium: false });
        }
        return updateQuery(onUpdate);
      }
      return flexChain();
    });

    const res = await DISPECER_PATCH(
      dispecerPatch({
        action: 'dodijeli',
        serviser_id: '00000000-0000-0000-0000-000000000001',
      }),
      PARAMS,
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.novi_status).toBe('dodijeljeno');
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        serviser_dodijeljen_id: '00000000-0000-0000-0000-000000000001',
      }),
    );
  });

  test('blokira dodjelu u statusu u_izvrsenju → 400', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'd1' } } });
    mockAssertDispatcherAccess.mockResolvedValue(true);

    mockFrom.mockImplementation((table) => {
      if (table === 'service_requests') {
        return singleQuery({ status: 'u_izvrsenju', is_premium: false });
      }
      return flexChain();
    });

    const res = await DISPECER_PATCH(
      dispecerPatch({
        action: 'dodijeli',
        serviser_id: '00000000-0000-0000-0000-000000000001',
      }),
      PARAMS,
    );
    expect(res.status).toBe(400);
  });

  test('validacijska greška bez serviser_id → 400', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'd1' } } });
    mockAssertDispatcherAccess.mockResolvedValue(true);

    mockFrom.mockImplementation((table) => {
      if (table === 'service_requests') {
        return singleQuery({ status: 'potvrdeno', is_premium: false });
      }
      return flexChain();
    });

    const res = await DISPECER_PATCH(
      dispecerPatch({ action: 'dodijeli' }),
      PARAMS,
    );
    expect(res.status).toBe(400);
  });
});

// ─── PATCH zatvori ────────────────────────────────────────────────────────────

describe('PATCH zatvori intervenciju (dispečer)', () => {
  beforeEach(() => {
    mockSessionGetUser.mockReset();
    mockFrom.mockReset();
    mockAssertDispatcherAccess.mockReset();
  });

  test('zatvara intervenciju u u_izvrsenju → 200', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'd1' } } });
    mockAssertDispatcherAccess.mockResolvedValue(true);

    let srCalls = 0;
    mockFrom.mockImplementation((table) => {
      if (table === 'service_requests') {
        srCalls += 1;
        if (srCalls === 1)
          return singleQuery({ status: 'u_izvrsenju', is_premium: false });
        return updateQuery();
      }
      return flexChain();
    });

    const res = await DISPECER_PATCH(
      dispecerPatch({ action: 'zatvori' }),
      PARAMS,
    );
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.novi_status).toBe('zavrseno');
  });

  test('blokira zatvaranje u statusu pending_review → 400', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'd1' } } });
    mockAssertDispatcherAccess.mockResolvedValue(true);

    mockFrom.mockImplementation((table) => {
      if (table === 'service_requests')
        return singleQuery({ status: 'pending_review', is_premium: false });
      return flexChain();
    });

    const res = await DISPECER_PATCH(
      dispecerPatch({ action: 'zatvori' }),
      PARAMS,
    );
    expect(res.status).toBe(400);
  });

  test('prihvata opcionalne napomene uz zatvaranje → 200', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'd1' } } });
    mockAssertDispatcherAccess.mockResolvedValue(true);

    let srCalls = 0;
    mockFrom.mockImplementation((table) => {
      if (table === 'service_requests') {
        srCalls += 1;
        if (srCalls === 1)
          return singleQuery({ status: 'dodijeljeno', is_premium: false });
        return updateQuery();
      }
      return flexChain();
    });

    const res = await DISPECER_PATCH(
      dispecerPatch({
        action: 'zatvori',
        napomene: 'Sve urađeno prema nalogu.',
      }),
      PARAMS,
    );
    expect(res.status).toBe(200);
  });
});

// ─── POST evidencija rada ─────────────────────────────────────────────────────

describe('POST /api/serviser/intervencije/[id]/evidencija', () => {
  beforeEach(() => {
    mockSessionGetUser.mockReset();
    mockFrom.mockReset();
    mockAssertServiserAccess.mockReset();
    mockAssertVlasnistvo.mockReset();
  });

  test('vraća 401 bez sesije', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: null } });
    const res = await EVIDENCIJA_POST(
      evidencijaPost({ opis_rada: 'Zamijenjena pumpa.' }),
      PARAMS,
    );
    expect(res.status).toBe(401);
  });

  test('vraća 403 za non-servisera', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockAssertServiserAccess.mockResolvedValue(false);
    const res = await EVIDENCIJA_POST(
      evidencijaPost({ opis_rada: 'Zamijenjena pumpa.' }),
      PARAMS,
    );
    expect(res.status).toBe(403);
  });

  test('vraća 403 ako serviser nije vlasnik', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 's1' } } });
    mockAssertServiserAccess.mockResolvedValue(true);
    mockAssertVlasnistvo.mockResolvedValue({
      ok: false,
      greska: 'Nemate pristup.',
    });
    const res = await EVIDENCIJA_POST(
      evidencijaPost({ opis_rada: 'Zamijenjena pumpa.' }),
      PARAMS,
    );
    expect(res.status).toBe(403);
  });

  test('blokira evidenciju u statusu potvrdeno → 400', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 's1' } } });
    mockAssertServiserAccess.mockResolvedValue(true);
    mockAssertVlasnistvo.mockResolvedValue({
      ok: true,
      status: 'potvrdeno',
      is_premium: false,
    });
    const res = await EVIDENCIJA_POST(
      evidencijaPost({ opis_rada: 'Zamijenjena pumpa.' }),
      PARAMS,
    );
    expect(res.status).toBe(400);
  });

  test('validacijska greška za opis kraći od 5 karaktera → 400', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 's1' } } });
    mockAssertServiserAccess.mockResolvedValue(true);
    mockAssertVlasnistvo.mockResolvedValue({
      ok: true,
      status: 'u_radu',
      is_premium: false,
    });
    const res = await EVIDENCIJA_POST(
      evidencijaPost({ opis_rada: 'Kv' }),
      PARAMS,
    );
    expect(res.status).toBe(400);
  });

  test('uspješna evidencija u statusu u_radu → 201', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 's1' } } });
    mockAssertServiserAccess.mockResolvedValue(true);
    mockAssertVlasnistvo.mockResolvedValue({
      ok: true,
      status: 'u_radu',
      is_premium: false,
    });

    mockFrom.mockImplementation((table) => {
      if (table === 'work_evidence') {
        return {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest
            .fn()
            .mockResolvedValue({ data: { id: 42 }, error: null }),
        };
      }
      return flexChain();
    });

    const res = await EVIDENCIJA_POST(
      evidencijaPost({ opis_rada: 'Zamijenjena pumpa.', trajanje_minuta: 60 }),
      PARAMS,
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});
