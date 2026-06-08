/**
 * US-52 — Ocjena korisnika nakon zatvorene intervencije.
 * Testira GET i POST /api/service-requests/[id]/ocjena.
 *
 * AC1: Korisnik može ocijeniti samo svoju zatvorenu intervenciju.
 * AC2: Ocjena u rasponu 1–5.
 * AC3: Komentar se sprema uz ocjenu.
 * AC4: Sistem ne dozvoljava višestruko ocjenjivanje.
 * AC5: Ovlašteni korisnici mogu vidjeti ocjenu.
 * AC6: Neovlašteni korisnici ne mogu pristupiti tuđim ocjenama.
 */

const mockGetUser = jest.fn();
const mockFromServer = jest.fn();
const mockFromAdmin = jest.fn();
const mockZabiljezi = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: mockFromServer,
  }),
}));

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    auth: { getUser: mockGetUser },
    from: mockFromAdmin,
  }),
}));

jest.mock('@/lib/servisirane/aktivnostiAudit', () => ({
  zabiljeziAktivnost: (...args) => mockZabiljezi(...args),
}));

const { GET, POST } = require('@/app/api/service-requests/[id]/ocjena/route');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeParams(id) {
  return { params: { id: String(id) } };
}

function makeRequest(body) {
  return {
    json: () => Promise.resolve(body),
  };
}

function maybeSingleChain(data, error = null) {
  return {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue({ data, error }),
  };
}

function insertChain(data, error = null) {
  return {
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data, error }),
  };
}

// ─── GET ─────────────────────────────────────────────────────────────────────

describe('GET /api/service-requests/[id]/ocjena', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockFromServer.mockReset();
    mockFromAdmin.mockReset();
    mockZabiljezi.mockReset();
  });

  it('401 — neprijavljeni korisnik', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const res = await GET({}, makeParams(1));
    expect(res.status).toBe(401);
  });

  it('400 — neispravan ID zahtjeva', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });

    const res = await GET({}, makeParams('abc'));
    expect(res.status).toBe(400);
  });

  it('404 — zahtjev ne postoji', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockFromServer.mockImplementation(() => maybeSingleChain(null));

    const res = await GET({}, makeParams(99));
    expect(res.status).toBe(404);
  });

  it('403 — korisnik nije vlasnik ni ovlašteni uposlenik (AC6)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'stranac' } } });
    mockFromServer.mockImplementation((table) => {
      if (table === 'service_requests') {
        return maybeSingleChain({
          id: 1,
          user_id: 'vlasnik',
          serviser_dodijeljen_id: 'serviser1',
          status: 'zatvoreno',
        });
      }
      if (table === 'uposlenici') {
        return maybeSingleChain(null);
      }
      return maybeSingleChain(null);
    });

    const res = await GET({}, makeParams(1));
    expect(res.status).toBe(403);
  });

  it('200 — vlasnik dobija ocjenu (AC5)', async () => {
    const ocjena = {
      id: 10,
      ocjena: 5,
      komentar: 'Odlično!',
      created_at: '2026-06-07',
      korisnik_id: 'u1',
    };
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockFromServer.mockImplementation((table) => {
      if (table === 'service_requests') {
        return maybeSingleChain({
          id: 1,
          user_id: 'u1',
          serviser_dodijeljen_id: null,
          status: 'zatvoreno',
        });
      }
      if (table === 'uposlenici') {
        return maybeSingleChain(null);
      }
      if (table === 'intervencija_ocjene') {
        return maybeSingleChain(ocjena);
      }
      return maybeSingleChain(null);
    });

    const res = await GET({}, makeParams(1));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ocjena).toMatchObject({ ocjena: 5, komentar: 'Odlično!' });
  });

  it('200 — nema ocjene vraća null (AC5 — intervencija bez ocjene)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockFromServer.mockImplementation((table) => {
      if (table === 'service_requests') {
        return maybeSingleChain({
          id: 1,
          user_id: 'u1',
          serviser_dodijeljen_id: null,
          status: 'zatvoreno',
        });
      }
      if (table === 'uposlenici') return maybeSingleChain(null);
      if (table === 'intervencija_ocjene') return maybeSingleChain(null);
      return maybeSingleChain(null);
    });

    const res = await GET({}, makeParams(1));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ocjena).toBeNull();
  });

  it('200 — serviser dodijeljen zahtjevu može vidjeti ocjenu (AC5)', async () => {
    const ocjena = {
      id: 11,
      ocjena: 4,
      komentar: null,
      created_at: '2026-06-07',
      korisnik_id: 'u1',
    };
    mockGetUser.mockResolvedValue({ data: { user: { id: 'serviser1' } } });
    mockFromServer.mockImplementation((table) => {
      if (table === 'service_requests') {
        return maybeSingleChain({
          id: 1,
          user_id: 'u1',
          serviser_dodijeljen_id: 'serviser1',
          status: 'zatvoreno',
        });
      }
      if (table === 'uposlenici') return maybeSingleChain(null);
      if (table === 'intervencija_ocjene') return maybeSingleChain(ocjena);
      return maybeSingleChain(null);
    });

    const res = await GET({}, makeParams(1));
    expect(res.status).toBe(200);
  });
});

// ─── POST ─────────────────────────────────────────────────────────────────────

describe('POST /api/service-requests/[id]/ocjena', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockFromServer.mockReset();
    mockFromAdmin.mockReset();
    mockZabiljezi.mockReset();
  });

  it('401 — neprijavljeni korisnik', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const res = await POST(makeRequest({ ocjena: 5 }), makeParams(1));
    expect(res.status).toBe(401);
  });

  it('400 — neispravan ID zahtjeva', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });

    const res = await POST(makeRequest({ ocjena: 5 }), makeParams('xyz'));
    expect(res.status).toBe(400);
  });

  it('400 — ocjena 0 (ispod raspona 1–5) se odbija (AC2)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });

    const res = await POST(makeRequest({ ocjena: 0 }), makeParams(1));
    expect(res.status).toBe(400);
  });

  it('400 — ocjena 6 (iznad raspona 1–5) se odbija (AC2)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });

    const res = await POST(makeRequest({ ocjena: 6 }), makeParams(1));
    expect(res.status).toBe(400);
  });

  it('400 — ocjena nedostaje u body-ju', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });

    const res = await POST(makeRequest({}), makeParams(1));
    expect(res.status).toBe(400);
  });

  it('403 — korisnik nije vlasnik zahtjeva (AC1/AC6)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'stranac' } } });
    mockFromServer.mockImplementation(() => maybeSingleChain(null));

    const res = await POST(makeRequest({ ocjena: 5 }), makeParams(1));
    expect(res.status).toBe(403);
  });

  it('422 — zahtjev nije zatvoren (AC1)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockFromServer.mockImplementation(() =>
      maybeSingleChain({ id: 1, user_id: 'u1', status: 'u_izvrsenju' }),
    );

    const res = await POST(makeRequest({ ocjena: 4 }), makeParams(1));
    expect(res.status).toBe(422);
  });

  it('409 — duplikat ocjene za isti zahtjev (AC4)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockFromServer.mockImplementation(() =>
      maybeSingleChain({ id: 1, user_id: 'u1', status: 'zatvoreno' }),
    );
    mockFromAdmin.mockImplementation((table) => {
      if (table === 'intervencija_ocjene') {
        return maybeSingleChain({ id: 5, ocjena: 3 });
      }
      return {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn(),
      };
    });

    const res = await POST(makeRequest({ ocjena: 5 }), makeParams(1));
    expect(res.status).toBe(409);
  });

  it('201 — uspješno ocjenjivanje s komentarom (AC3)', async () => {
    const novaOcjena = {
      id: 1,
      zahtjev_id: 1,
      korisnik_id: 'u1',
      ocjena: 5,
      komentar: 'Odlično!',
      created_at: '2026-06-07',
    };
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockFromServer.mockImplementation(() =>
      maybeSingleChain({ id: 1, user_id: 'u1', status: 'zatvoreno' }),
    );
    mockFromAdmin.mockImplementation((table) => {
      if (table === 'intervencija_ocjene') {
        let poziv = 0;
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest.fn().mockImplementation(() => {
            poziv++;
            if (poziv === 1)
              return Promise.resolve({ data: null, error: null }); // nema duplikata
            return Promise.resolve({ data: novaOcjena, error: null });
          }),
          insert: jest.fn().mockReturnThis(),
          single: jest
            .fn()
            .mockResolvedValue({ data: novaOcjena, error: null }),
        };
      }
      return maybeSingleChain(null);
    });
    mockZabiljezi.mockResolvedValue(undefined);

    const res = await POST(
      makeRequest({ ocjena: 5, komentar: 'Odlično!' }),
      makeParams(1),
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.ocjena).toMatchObject({ ocjena: 5, komentar: 'Odlično!' });
  });

  it('201 — ocjenjivanje bez komentara (AC3 — komentar nije obavezan)', async () => {
    const novaOcjena = {
      id: 2,
      zahtjev_id: 1,
      korisnik_id: 'u1',
      ocjena: 3,
      komentar: null,
      created_at: '2026-06-07',
    };
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockFromServer.mockImplementation(() =>
      maybeSingleChain({ id: 1, user_id: 'u1', status: 'zatvoreno' }),
    );
    mockFromAdmin.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      insert: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: novaOcjena, error: null }),
    }));
    mockZabiljezi.mockResolvedValue(undefined);

    const res = await POST(makeRequest({ ocjena: 3 }), makeParams(1));
    expect(res.status).toBe(201);
  });

  it('201 — sve dozvoljene ocjene 1–5 su prihvaćene (AC2)', async () => {
    for (const ocjena of [1, 2, 3, 4, 5]) {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
      mockFromServer.mockImplementation(() =>
        maybeSingleChain({ id: 1, user_id: 'u1', status: 'zatvoreno' }),
      );
      mockFromAdmin.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
        insert: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: ocjena,
            zahtjev_id: 1,
            korisnik_id: 'u1',
            ocjena,
            komentar: null,
          },
          error: null,
        }),
      }));
      mockZabiljezi.mockResolvedValue(undefined);

      const res = await POST(makeRequest({ ocjena }), makeParams(1));
      expect(res.status).toBe(201);

      mockGetUser.mockReset();
      mockFromServer.mockReset();
      mockFromAdmin.mockReset();
    }
  });
});
