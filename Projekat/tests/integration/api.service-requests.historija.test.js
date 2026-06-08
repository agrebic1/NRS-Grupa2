/**
 * US-54 — Pregled historije intervencija korisnika.
 * Testira GET /api/service-requests/historija.
 *
 * AC1: Korisnik vidi listu svojih prethodnih intervencija.
 * AC2: Prikazuju se datum, tip kvara, status, ocjena.
 * AC3: Korisnik može otvoriti detalje intervencije.
 * AC4: Samo intervencije prijavljenog korisnika (ne tuđe).
 * AC5: Prazno stanje kada nema historije.
 * AC6: Blokiran pristup tuđoj historiji.
 */

const mockGetUser = jest.fn();
const mockFrom = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}));

jest.mock('@/lib/servisirane/korisnickiBrojZahtjeva', () => ({
  dodijeliKorisnickeBrojeveZahtjeva: (zahtjevi) =>
    zahtjevi.map((z, i) => ({ ...z, korisnickiBroj: i + 1 })),
}));

const { GET } = require('@/app/api/service-requests/historija/route');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function zahtjevZaHistoriju(overrides = {}) {
  return {
    id: 1,
    category: 'Elektro instalacije',
    category_main: 'Elektro instalacije',
    category_sub: null,
    address: 'Testna ul. 1, Sarajevo',
    created_at: '2026-03-14T10:00:00Z',
    status: 'zatvoreno',
    urgency_score: 60,
    final_priority: 'VISOKO',
    closed_at: '2026-03-16T14:00:00Z',
    updated_at: '2026-03-16T14:00:00Z',
    is_premium: false,
    cancel_reason: null,
    rejection_reason: null,
    ...overrides,
  };
}

function flexChain({
  listData = [],
  listError = null,
  singleData = null,
  singleError = null,
} = {}) {
  return {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockResolvedValue({ data: listData, error: listError }),
    order: jest.fn().mockReturnThis(),
    maybeSingle: jest
      .fn()
      .mockResolvedValue({ data: singleData, error: singleError }),
    single: jest
      .fn()
      .mockResolvedValue({ data: singleData, error: singleError }),
  };
}

// ─── Testovi ─────────────────────────────────────────────────────────────────

describe('GET /api/service-requests/historija', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockFrom.mockReset();
  });

  it('401 — neprijavljeni korisnik (AC6)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('200 — prazna historija (AC5)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockFrom.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: [], error: null }),
    }));

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.historija).toEqual([]);
  });

  it('200 — vraća historiju s ocjenom priključenom (AC2)', async () => {
    const zahtjev1 = zahtjevZaHistoriju({ id: 10 });
    const zahtjev2 = zahtjevZaHistoriju({
      id: 11,
      status: 'otkazano',
      cancel_reason: 'Sam riješio.',
    });

    const ocjene = [{ zahtjev_id: 10, ocjena: 5, komentar: 'Odlično!' }];

    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockFrom.mockImplementation((table) => {
      if (table === 'service_requests') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          in: jest.fn().mockReturnThis(),
          order: jest
            .fn()
            .mockResolvedValue({ data: [zahtjev1, zahtjev2], error: null }),
        };
      }
      if (table === 'intervencija_ocjene') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({ data: ocjene, error: null }),
        };
      }
      return flexChain();
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.historija).toHaveLength(2);

    // Zahtjev s ocjenom (AC2)
    const s10 = body.historija.find((z) => z.id === 10);
    expect(s10.ocjena).toMatchObject({ ocjena: 5, komentar: 'Odlično!' });

    // Zahtjev bez ocjene → null (AC2)
    const s11 = body.historija.find((z) => z.id === 11);
    expect(s11.ocjena).toBeNull();
  });

  it('200 — vraća samo historijske statuse (zatvoreno, otkazano, odbijeno, zavrseno)', async () => {
    // Aktivni zahtjevi (in_review, dodijeljeno...) ne smiju biti u historiji
    // Ovo je osigurano .in('status', HISTORIJSKI_STATUSI) u API-ju; ovdje provjeravamo response strukturu
    const zahtjevi = [
      zahtjevZaHistoriju({ id: 20, status: 'zatvoreno' }),
      zahtjevZaHistoriju({ id: 21, status: 'otkazano' }),
      zahtjevZaHistoriju({ id: 22, status: 'odbijeno' }),
      zahtjevZaHistoriju({ id: 23, status: 'zavrseno' }),
    ];

    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockFrom.mockImplementation((table) => {
      if (table === 'service_requests') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          in: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: zahtjevi, error: null }),
        };
      }
      if (table === 'intervencija_ocjene') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({ data: [], error: null }),
        };
      }
      return flexChain();
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.historija).toHaveLength(4);

    const statusi = body.historija.map((z) => z.status);
    expect(statusi).toContain('zatvoreno');
    expect(statusi).toContain('otkazano');
    expect(statusi).toContain('odbijeno');
    expect(statusi).toContain('zavrseno');
  });

  it('200 — korisnički brojevi su prikladni (AC2)', async () => {
    const zahtjevi = [
      zahtjevZaHistoriju({ id: 30 }),
      zahtjevZaHistoriju({ id: 31 }),
    ];

    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockFrom.mockImplementation((table) => {
      if (table === 'service_requests') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          in: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: zahtjevi, error: null }),
        };
      }
      if (table === 'intervencija_ocjene') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({ data: [], error: null }),
        };
      }
      return flexChain();
    });

    const res = await GET();
    const body = await res.json();
    // Svaki zapis ima korisnickiBroj (dodan helper-om)
    expect(body.historija[0]).toHaveProperty('korisnickiBroj');
    expect(body.historija[1]).toHaveProperty('korisnickiBroj');
  });

  it('500 — DB greška vraća 500', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockFrom.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      order: jest
        .fn()
        .mockResolvedValue({ data: null, error: { message: 'DB error' } }),
    }));

    const res = await GET();
    expect(res.status).toBe(500);
  });

  it('200 — nema lažnih intervencija (AC4: user_id filter sprječava IDOR)', async () => {
    // API ruta koristi .eq('user_id', user.id) — simuliramo da DB vraća []
    // za korisnika koji zapravo nema historije (eq filter eliminira tuđe)
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'u_bez_historije' } },
    });
    mockFrom.mockImplementation((table) => {
      if (table === 'service_requests') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          in: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: [], error: null }),
        };
      }
      return flexChain();
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.historija).toEqual([]);
  });

  it('200 — historija sadrži osnovna polja po zahtjevu (AC2)', async () => {
    const zahtjev = zahtjevZaHistoriju({ id: 50, status: 'zatvoreno' });

    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockFrom.mockImplementation((table) => {
      if (table === 'service_requests') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          in: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: [zahtjev], error: null }),
        };
      }
      if (table === 'intervencija_ocjene') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({ data: [], error: null }),
        };
      }
      return flexChain();
    });

    const res = await GET();
    const body = await res.json();
    const zapis = body.historija[0];

    expect(zapis).toHaveProperty('id');
    expect(zapis).toHaveProperty('category');
    expect(zapis).toHaveProperty('created_at');
    expect(zapis).toHaveProperty('status');
    expect(zapis).toHaveProperty('ocjena');
  });
});
