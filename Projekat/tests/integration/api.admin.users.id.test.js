const mockSessionGetUser = jest.fn();
const mockFrom = jest.fn();
const mockGetUserById = jest.fn();
const mockUpdateUserById = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mockSessionGetUser },
    from: mockFrom,
  }),
}));

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockFrom,
    auth: {
      admin: {
        getUserById: mockGetUserById,
        updateUserById: mockUpdateUserById,
      },
    },
  }),
}));

const { PATCH } = require('@/app/api/admin/users/[id]/route');

function adminChain() {
  return {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue({
      data: { uloga: { naziv: 'Administrator' } },
      error: null,
    }),
  };
}

describe('PATCH /api/admin/users/[id] uredi_podatke', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1' } },
    });
    mockGetUserById.mockResolvedValue({
      data: {
        user: {
          id: 'cilj-1',
          email: 'hamza@example.com',
          user_metadata: { ime: 'Hamza', prezime: 'Bunar' },
        },
      },
      error: null,
    });
    mockUpdateUserById.mockResolvedValue({ data: { user: {} }, error: null });
  });

  test('upsert osoba i vraća success', async () => {
    const upsertSingle = jest.fn().mockResolvedValue({
      data: { id_osobe: 'cilj-1', ime: 'Hamza', prezime: 'Bunar Updated' },
      error: null,
    });
    const upsertSelect = jest.fn().mockReturnValue({ single: upsertSingle });
    const upsert = jest.fn().mockReturnValue({ select: upsertSelect });
    const insert = jest.fn().mockResolvedValue({ error: null });

    mockFrom.mockImplementation((table) => {
      if (table === 'uposlenici') return adminChain();
      if (table === 'korisnik_usluge') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest.fn().mockResolvedValue({
            data: { id_korisnika_usluge: 'cilj-1' },
            error: null,
          }),
        };
      }
      if (table === 'osoba') {
        return { upsert };
      }
      if (table === 'admin_user_audit_log') {
        return { insert };
      }
      return adminChain();
    });

    const req = new Request('http://localhost/api/admin/users/cilj-1', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        action: 'uredi_podatke',
        ime: 'Hamza',
        prezime: 'Bunar Updated',
        broj_telefona: '+38761111222',
        adresa: 'Sarajevo',
      }),
    });

    const res = await PATCH(req, { params: { id: 'cilj-1' } });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.korisnik.prezime).toBe('Bunar Updated');
    expect(upsert).toHaveBeenCalled();
    expect(mockUpdateUserById).toHaveBeenCalled();
  });

  test('odbija prazno ime', async () => {
    mockFrom.mockImplementation((table) => {
      if (table === 'uposlenici') return adminChain();
      return adminChain();
    });

    const req = new Request('http://localhost/api/admin/users/cilj-1', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        action: 'uredi_podatke',
        ime: '',
        prezime: 'Bunar',
      }),
    });

    const res = await PATCH(req, { params: { id: 'cilj-1' } });
    expect(res.status).toBe(400);
  });
});
