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

jest.mock('@/lib/servisirane/notifikacijeHelper', () => ({
  notifPromjenaIzvrsioca:    jest.fn().mockResolvedValue(undefined),
  notifUklanjanjeServisera:  jest.fn().mockResolvedValue(undefined),
  notifDodjelaIntervencije:  jest.fn().mockResolvedValue(undefined),
}));

const { PATCH } = require('@/app/api/dispecer/zahtjevi/[id]/route');

function flexChain() {
  return {
    select:      jest.fn().mockReturnThis(),
    eq:          jest.fn().mockReturnThis(),
    order:       jest.fn().mockReturnThis(),
    limit:       jest.fn().mockReturnThis(),
    single:      jest.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    insert:      jest.fn().mockResolvedValue({ data: null, error: null }),
    update:      jest.fn(() => ({ eq: jest.fn().mockResolvedValue({ error: null }) })),
  };
}

function singleQuery(result) {
  return {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(result),
  };
}

function jsonRequest(body) {
  return new Request('http://localhost/api/dispecer/zahtjevi/1', {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

const VALID_RAZLOG = 'Serviser nije dostupan zbog drugog zadatka na terenu.';
const SERVISER_A = '11111111-1111-1111-1111-111111111101';
const SERVISER_B = '11111111-1111-1111-1111-111111111102';
const SERVISER_UNKNOWN = '00000000-0000-0000-0000-000000000099';

describe('/api/dispecer/zahtjevi/[id] - Sprint 9 (US-28)', () => {
  beforeEach(() => {
    mockSessionGetUser.mockReset();
    mockFrom.mockReset();
    mockAssertDispatcherAccess.mockReset();
  });

  test('promijeni_izvrsioca → 401 bez sesije', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: null } });

    const response = await PATCH(
      jsonRequest({
        action: 'promijeni_izvrsioca',
        novi_serviser_id: SERVISER_B,
        razlog: VALID_RAZLOG,
      }),
      { params: { id: '1' } },
    );

    expect(response.status).toBe(401);
  });

  test('promijeni_izvrsioca → 403 bez dispecerskog pristupa', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockAssertDispatcherAccess.mockResolvedValue(false);

    const response = await PATCH(
      jsonRequest({
        action: 'promijeni_izvrsioca',
        novi_serviser_id: SERVISER_B,
        razlog: VALID_RAZLOG,
      }),
      { params: { id: '1' } },
    );

    expect(response.status).toBe(403);
  });

  test('promijeni_izvrsioca → 400 bez razloga', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'd1' } } });
    mockAssertDispatcherAccess.mockResolvedValue(true);

    const response = await PATCH(
      jsonRequest({
        action: 'promijeni_izvrsioca',
        novi_serviser_id: SERVISER_B,
      }),
      { params: { id: '1' } },
    );

    expect(response.status).toBe(400);
  });

  test('promijeni_izvrsioca → 422 u nedozvoljenom statusu', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'd1' } } });
    mockAssertDispatcherAccess.mockResolvedValue(true);

    mockFrom.mockImplementation((table) => {
      if (table === 'service_requests') {
        return singleQuery({
          data: {
            status: 'zavrseno',
            is_premium: false,
            serviser_dodijeljen_id: SERVISER_A,
            final_priority: 'SREDNJE',
          },
          error: null,
        });
      }
      return flexChain();
    });

    const response = await PATCH(
      jsonRequest({
        action: 'promijeni_izvrsioca',
        novi_serviser_id: SERVISER_B,
        razlog: VALID_RAZLOG,
      }),
      { params: { id: '1' } },
    );

    expect(response.status).toBe(422);
  });

  test('promijeni_izvrsioca → 404 kad novi serviser ne postoji', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'd1' } } });
    mockAssertDispatcherAccess.mockResolvedValue(true);

    let osobaCalls = 0;
    mockFrom.mockImplementation((table) => {
      if (table === 'service_requests') {
        return singleQuery({
          data: {
            status: 'u_radu',
            is_premium: false,
            serviser_dodijeljen_id: SERVISER_A,
            final_priority: 'VISOKO',
          },
          error: null,
        });
      }
      if (table === 'osoba') {
        osobaCalls += 1;
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
        };
      }
      return flexChain();
    });

    const response = await PATCH(
      jsonRequest({
        action: 'promijeni_izvrsioca',
        novi_serviser_id: SERVISER_UNKNOWN,
        razlog: VALID_RAZLOG,
      }),
      { params: { id: '1' } },
    );

    expect(response.status).toBe(404);
    expect(osobaCalls).toBeGreaterThan(0);
  });

  test('promijeni_izvrsioca → 200 iz statusa u_radu', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'd1' } } });
    mockAssertDispatcherAccess.mockResolvedValue(true);

    const onUpdate = jest.fn();
    const onActivityInsert = jest.fn().mockResolvedValue({ data: null, error: null });
    let srCalls = 0;

    mockFrom.mockImplementation((table) => {
      if (table === 'service_requests') {
        srCalls += 1;
        if (srCalls === 1) {
          return singleQuery({
            data: {
              status: 'u_radu',
              is_premium: false,
              serviser_dodijeljen_id: SERVISER_A,
              final_priority: 'VISOKO',
            },
            error: null,
          });
        }
        return {
          update: jest.fn((payload) => {
            onUpdate(payload);
            return { eq: jest.fn().mockResolvedValue({ error: null }) };
          }),
        };
      }
      if (table === 'osoba') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockImplementation((_col, id) => ({
            maybeSingle: jest.fn().mockResolvedValue({
              data:
                id === SERVISER_A
                  ? { ime: 'Stari', prezime: 'Serviser' }
                  : { ime: 'Novi', prezime: 'Serviser' },
              error: null,
            }),
          })),
        };
      }
      if (table === 'intervention_activities') {
        return { insert: onActivityInsert };
      }
      return flexChain();
    });

    const response = await PATCH(
      jsonRequest({
        action: 'promijeni_izvrsioca',
        novi_serviser_id: SERVISER_B,
        razlog: VALID_RAZLOG,
      }),
      { params: { id: '1' } },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.novi_serviser_id).toBe(SERVISER_B);
    expect(onUpdate).toHaveBeenCalledWith({ serviser_dodijeljen_id: SERVISER_B });
    expect(onActivityInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        tip: 'promjena_izvrsioca',
        old_value: 'Stari Serviser',
        new_value: 'Novi Serviser',
        razlog: VALID_RAZLOG,
        metadata: expect.objectContaining({
          iz_servisera_id: SERVISER_A,
          na_servisera_id: SERVISER_B,
          iz_servisera_ime: 'Stari Serviser',
          na_servisera_ime: 'Novi Serviser',
        }),
      }),
    );
  });
});
