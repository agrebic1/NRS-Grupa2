// Integration testovi za razmjenu napomena na intervenciji (US-30)
// Napomene se dodaju putem PATCH action:'napomena' na serviser rutu.

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
    assertServiserAccess:     (...a) => mockAssertServiserAccess(...a),
    assertServiserVlasnistvo: (...a) => mockAssertVlasnistvo(...a),
  };
});

jest.mock('@/lib/servisirane/notifikacijeHelper', () => ({
  notifPrihvatanjeZadatka:        jest.fn().mockResolvedValue(undefined),
  notifOdbijanjeZadatka:          jest.fn().mockResolvedValue(undefined),
  notifKorisnikusServiserNaPutu:  jest.fn().mockResolvedValue(undefined),
  notifKorisnikusServiserNaTerenu: jest.fn().mockResolvedValue(undefined),
  notifNovaNapomenaDispecer:      jest.fn().mockResolvedValue(undefined),
  notifServiserNaTerenu:          jest.fn().mockResolvedValue(undefined),
  notifEvidencijaRada:            jest.fn().mockResolvedValue(undefined),
}));

const { PATCH } = require('@/app/api/serviser/intervencije/[id]/route');

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function patchRequest(body) {
  return new Request('http://localhost/api/serviser/intervencije/1', {
    method:  'PATCH',
    body:    JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

const PARAMS = { params: { id: '1' } };

function setupAuth(status = 'u_radu') {
  mockGetUser.mockResolvedValue({ data: { user: { id: 's1' } } });
  mockAssertServiserAccess.mockResolvedValue(true);
  mockAssertVlasnistvo.mockResolvedValue({ ok: true, status, is_premium: false });
  mockFrom.mockImplementation(() => flexChain());
}

// ─── Napomene - serviser ──────────────────────────────────────────────────────

describe('PATCH napomena - serviser dodaje internu napomenu', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockFrom.mockReset();
    mockAssertServiserAccess.mockReset();
    mockAssertVlasnistvo.mockReset();
  });

  test('uspješno dodaje napomenu → 200', async () => {
    setupAuth('u_radu');
    const res  = await PATCH(patchRequest({ action: 'napomena', sadrzaj: 'Dijelovi naručeni.' }), PARAMS);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });

  test('odbija praznu napomenu → 400', async () => {
    setupAuth();
    const res = await PATCH(patchRequest({ action: 'napomena', sadrzaj: '' }), PARAMS);
    expect(res.status).toBe(400);
  });

  test('odbija napomenu bez sadrzaj polja → 400', async () => {
    setupAuth();
    const res = await PATCH(patchRequest({ action: 'napomena' }), PARAMS);
    expect(res.status).toBe(400);
  });

  test('odbija napomenu dužu od 2000 karaktera → 400', async () => {
    setupAuth();
    const res = await PATCH(patchRequest({ action: 'napomena', sadrzaj: 'x'.repeat(2001) }), PARAMS);
    expect(res.status).toBe(400);
  });

  test('prihvata napomenu od tačno 1 karaktera → 200', async () => {
    setupAuth();
    const res = await PATCH(patchRequest({ action: 'napomena', sadrzaj: 'X' }), PARAMS);
    expect(res.status).toBe(200);
  });

  test('napomena moguća i u statusu dodijeljeno → 200', async () => {
    setupAuth('dodijeljeno');
    const res = await PATCH(patchRequest({ action: 'napomena', sadrzaj: 'Stižem za 30 min.' }), PARAMS);
    expect(res.status).toBe(200);
  });

  test('neovlašteni korisnik ne može dodati napomenu → 403', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 's1' } } });
    mockAssertServiserAccess.mockResolvedValue(true);
    mockAssertVlasnistvo.mockResolvedValue({ ok: false, greska: 'Nemate pristup.' });
    const res = await PATCH(patchRequest({ action: 'napomena', sadrzaj: 'Napomena.' }), PARAMS);
    expect(res.status).toBe(403);
  });

  test('neautorizovani poziv bez sesije → 401', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await PATCH(patchRequest({ action: 'napomena', sadrzaj: 'Test.' }), PARAMS);
    expect(res.status).toBe(401);
  });
});
