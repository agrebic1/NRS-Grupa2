const mockSessionGetUser = jest.fn();
const mockFrom = jest.fn();
const mockAssertDispatcherAccess = jest.fn();
const mockStorageUpload = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mockSessionGetUser },
    from: mockFrom,
    storage: { from: () => ({ upload: mockStorageUpload }) },
  }),
}));

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    storage: {
      from: () => ({
        upload: mockStorageUpload,
        getPublicUrl: () => ({
          data: { publicUrl: 'https://example.com/slika.jpg' },
        }),
      }),
    },
    from: mockFrom,
  }),
}));

jest.mock('@/lib/servisirane/dispecerPristup', () => ({
  assertDispatcherAccess: (...args) => mockAssertDispatcherAccess(...args),
}));

const { NextRequest } = require('next/server');
const { GET, POST } = require('@/app/api/slike/route');

function slikeUrl(query = '') {
  return new NextRequest(
    `http://localhost/api/slike${query ? `?${query}` : ''}`,
  );
}

function listChain(data = []) {
  return {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockResolvedValue({ data, error: null }),
  };
}

describe('/api/slike - Sprint 9 (US-43)', () => {
  beforeEach(() => {
    mockSessionGetUser.mockReset();
    mockFrom.mockReset();
    mockAssertDispatcherAccess.mockReset();
    mockStorageUpload.mockReset();
    mockStorageUpload.mockResolvedValue({ error: null });
  });

  test('GET → 401 bez sesije', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: null } });

    const response = await GET(slikeUrl('zahtjev_id=1'));
    expect(response.status).toBe(401);
  });

  test('GET → 400 za neispravan zahtjev_id', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 's1' } } });

    const response = await GET(slikeUrl('zahtjev_id=abc'));
    expect(response.status).toBe(400);
  });

  test('GET → 200 lista slika', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 's1' } } });
    mockFrom.mockImplementation((table) => {
      if (table === 'slike_intervencija') {
        return listChain([
          { id: 1, zahtjev_id: 5, image_url: 'https://example.com/a.jpg' },
        ]);
      }
      return listChain([]);
    });

    const response = await GET(slikeUrl('zahtjev_id=5'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.slike).toHaveLength(1);
  });

  test('POST → 401 bez sesije', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: null } });

    const form = new FormData();
    form.append('zahtjev_id', '1');
    const response = await POST(
      new NextRequest('http://localhost/api/slike', {
        method: 'POST',
        body: form,
      }),
    );
    expect(response.status).toBe(401);
  });

  test('POST → 403 kad korisnik nije dodijeljeni serviser ni dispecer', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'u-tudji' } } });
    mockAssertDispatcherAccess.mockResolvedValue(false);
    mockFrom.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          serviser_dodijeljen_id: '11111111-1111-1111-1111-111111111101',
        },
        error: null,
      }),
    }));

    const file = new File(['x'], 'foto.jpg', { type: 'image/jpeg' });
    const form = new FormData();
    form.append('file', file);
    form.append('zahtjev_id', '1');

    const response = await POST(
      new NextRequest('http://localhost/api/slike', {
        method: 'POST',
        body: form,
      }),
    );
    expect(response.status).toBe(403);
  });

  test('POST → 400 bez priloženog fajla', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 's1' } } });
    mockFrom.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { serviser_dodijeljen_id: 's1' },
        error: null,
      }),
    }));

    const form = new FormData();
    form.append('zahtjev_id', '1');

    const response = await POST(
      new NextRequest('http://localhost/api/slike', {
        method: 'POST',
        body: form,
      }),
    );
    expect(response.status).toBe(400);
  });

  test('POST → 400 za nedozvoljeni MIME tip', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 's1' } } });
    mockFrom.mockImplementation((table) => {
      if (table === 'service_requests') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { serviser_dodijeljen_id: 's1' },
            error: null,
          }),
        };
      }
      return listChain();
    });

    const file = new File(['x'], 'doc.pdf', { type: 'application/pdf' });
    const form = new FormData();
    form.append('file', file);
    form.append('zahtjev_id', '1');

    const response = await POST(
      new NextRequest('http://localhost/api/slike', {
        method: 'POST',
        body: form,
      }),
    );
    expect(response.status).toBe(400);
  });
});
