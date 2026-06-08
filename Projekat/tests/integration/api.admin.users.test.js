const mockSessionGetUser = jest.fn();
const mockFrom = jest.fn();
const mockListUsers = jest.fn();
const mockCreateUser = jest.fn();
const mockSendEmail = jest.fn();
const mockKreirajEmailInternogNaloga = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mockSessionGetUser },
    from: mockFrom,
  }),
}));

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockFrom,
    auth: { admin: { listUsers: mockListUsers, createUser: mockCreateUser } },
  }),
}));

jest.mock('@/lib/email/sendEmail', () => ({
  sendEmail: (...args) => mockSendEmail(...args),
  kreirajEmailInternogNaloga: (...args) =>
    mockKreirajEmailInternogNaloga(...args),
}));

const { GET, POST } = require('@/app/api/admin/users/route');

function maybeSingle(result) {
  return {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue(result),
  };
}

function selectOnly(result) {
  return {
    select: jest.fn().mockResolvedValue(result),
  };
}

function insertOnly(result) {
  return {
    insert: jest.fn().mockResolvedValue(result),
  };
}

function upsertOnly(result = { data: null, error: null }) {
  return {
    upsert: jest.fn().mockResolvedValue(result),
  };
}

describe('/api/admin/users route', () => {
  beforeEach(() => {
    mockFrom.mockReset();
    mockListUsers.mockReset();
    mockCreateUser.mockReset();
    mockSessionGetUser.mockReset();
    mockSendEmail.mockReset();
    mockKreirajEmailInternogNaloga.mockReset();
    mockSendEmail.mockResolvedValue({ success: true });
    mockKreirajEmailInternogNaloga.mockReturnValue('<p>email</p>');
  });

  test('returns 401 when no session', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: null } });
    const response = await GET();
    expect(response.status).toBe(401);
  });

  test('returns 403 when user is not admin', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockFrom.mockImplementation((table) => {
      if (table === 'uposlenici')
        return maybeSingle({ data: null, error: null });
      return maybeSingle({ data: null, error: null });
    });
    const response = await GET();
    expect(response.status).toBe(403);
  });

  test('returns 200 with users for admin', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });

    const ulogaLookup = {
      select: jest.fn().mockImplementation((query) => {
        if (query === 'naziv') {
          return {
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest
                .fn()
                .mockResolvedValue({
                  data: { naziv: 'Administrator' },
                  error: null,
                }),
            }),
          };
        }
        return Promise.resolve({
          data: [{ id_uloge: 2, naziv: 'Serviser' }],
          error: null,
        });
      }),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn(),
    };

    mockFrom.mockImplementation((table) => {
      if (table === 'uposlenici') {
        return maybeSingle({ data: { id_uloge: 1 }, error: null });
      }
      if (table === 'uloga') {
        return ulogaLookup;
      }
      if (table === 'v_korisnik_usluge') {
        return selectOnly({
          data: [
            {
              id_korisnika_usluge: 'k1',
              ime: 'K',
              prezime: 'U',
              email: 'k@example.com',
            },
          ],
          error: null,
        });
      }
      if (table === 'v_uposlenici') {
        return selectOnly({
          data: [
            {
              id_uposlenika: 'u2',
              id_uloge: 2,
              ime: 'A',
              prezime: 'B',
              email: 'a@example.com',
            },
          ],
          error: null,
        });
      }
      return selectOnly({ data: [], error: null });
    });

    mockListUsers.mockResolvedValue({
      data: {
        users: [
          {
            id: 'k1',
            email: 'k@example.com',
            created_at: '2026-01-01T00:00:00.000Z',
            user_metadata: {},
            email_confirmed_at: '2026-01-02T00:00:00.000Z',
          },
          {
            id: 'k2',
            email: null,
            created_at: null,
            user_metadata: {},
            confirmed_at: null,
            banned_until: '2999-01-01T00:00:00.000Z',
          },
          {
            id: 'k3',
            email: 'k3@example.com',
            created_at: '2026-01-03T00:00:00.000Z',
            user_metadata: {},
            confirmed_at: null,
            email_confirmed_at: null,
            banned_until: null,
          },
        ],
      },
      error: null,
    });

    const response = await GET();
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(Array.isArray(body.users)).toBe(true);
    expect(body.users.some((u) => u.status === 'aktivan')).toBe(true);
    expect(body.users.some((u) => u.status === 'suspendovan')).toBe(true);
    expect(body.users.some((u) => u.status === 'neaktivan')).toBe(true);
  });

  test('returns 500 when listUsers fails', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockFrom.mockImplementation((table) => {
      if (table === 'uposlenici')
        return maybeSingle({ data: { id_uloge: 1 }, error: null });
      if (table === 'uloga') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest
                .fn()
                .mockResolvedValue({ data: { naziv: 'admin' }, error: null }),
            }),
          }),
        };
      }
      return selectOnly({ data: [], error: null });
    });
    mockListUsers.mockResolvedValue({
      data: null,
      error: { message: 'auth failed' },
    });
    const response = await GET();
    expect(response.status).toBe(500);
  });

  test('returns 500 for table read failures and catch fallback', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockFrom.mockImplementation((table) => {
      if (table === 'uposlenici')
        return maybeSingle({ data: null, error: { message: 'db uposlenici' } });
      return maybeSingle({ data: null, error: null });
    });
    const r1 = await GET();
    expect(r1.status).toBe(403);

    mockFrom.mockImplementation((table) => {
      if (table === 'uposlenici')
        return maybeSingle({ data: { id_uloge: 1 }, error: null });
      if (table === 'uloga') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest
                .fn()
                .mockResolvedValue({
                  data: { naziv: 'Administrator' },
                  error: null,
                }),
            }),
          }),
        };
      }
      if (table === 'v_korisnik_usluge')
        return selectOnly({ data: null, error: { message: 'korisnici err' } });
      if (table === 'v_uposlenici')
        return selectOnly({ data: [], error: null });
      return selectOnly({ data: [], error: null });
    });
    mockListUsers.mockResolvedValue({ data: { users: [] }, error: null });
    const r2 = await GET();
    expect(r2.status).toBe(500);

    mockSessionGetUser.mockRejectedValue(new Error('boom'));
    const r3 = await GET();
    expect(r3.status).toBe(500);
  });

  test('returns 500 for uposlenici/uloge errors after admin check', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockFrom.mockImplementation((table) => {
      if (table === 'uposlenici')
        return maybeSingle({ data: { id_uloge: 1 }, error: null });
      if (table === 'uloga') {
        return {
          select: jest.fn().mockImplementation((query) => {
            if (query === 'naziv') {
              return {
                eq: jest.fn().mockReturnValue({
                  maybeSingle: jest
                    .fn()
                    .mockResolvedValue({
                      data: { naziv: 'Administrator' },
                      error: null,
                    }),
                }),
              };
            }
            return Promise.resolve({
              data: null,
              error: { message: 'uloge table fail' },
            });
          }),
        };
      }
      if (table === 'v_korisnik_usluge')
        return selectOnly({ data: [], error: null });
      if (table === 'v_uposlenici')
        return selectOnly({
          data: null,
          error: { message: 'uposlenici table fail' },
        });
      return selectOnly({ data: [], error: null });
    });
    mockListUsers.mockResolvedValue({ data: { users: [] }, error: null });
    const response = await GET();
    expect(response.status).toBe(500);
  });

  test('returns 500 when uloge query in Promise.all fails', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockFrom.mockImplementation((table) => {
      if (table === 'uposlenici')
        return maybeSingle({ data: { id_uloge: 1 }, error: null });
      if (table === 'uloga') {
        return {
          select: jest.fn().mockImplementation((query) => {
            if (query === 'naziv') {
              return {
                eq: jest.fn().mockReturnValue({
                  maybeSingle: jest
                    .fn()
                    .mockResolvedValue({
                      data: { naziv: 'Administrator' },
                      error: null,
                    }),
                }),
              };
            }
            return Promise.resolve({
              data: null,
              error: { message: 'uloge fail' },
            });
          }),
        };
      }
      if (table === 'v_korisnik_usluge')
        return selectOnly({ data: [], error: null });
      if (table === 'v_uposlenici')
        return selectOnly({ data: [], error: null });
      return selectOnly({ data: [], error: null });
    });
    mockListUsers.mockResolvedValue({ data: { users: [] }, error: null });
    const response = await GET();
    expect(response.status).toBe(500);
  });

  test('GET uses premium fallback queries when primary premium query fails', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });

    const ulogaLookup = {
      select: jest.fn().mockImplementation((query) => {
        if (query === 'naziv') {
          return {
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest
                .fn()
                .mockResolvedValue({
                  data: { naziv: 'Administrator' },
                  error: null,
                }),
            }),
          };
        }
        return Promise.resolve({
          data: [{ id_uloge: 1, naziv: 'Administrator' }],
          error: null,
        });
      }),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn(),
    };

    const premiumSelect = jest
      .fn()
      .mockResolvedValueOnce({
        data: null,
        error: { message: 'missing premium columns' },
      })
      .mockResolvedValueOnce({
        data: [
          {
            id_korisnika_usluge: 'k1',
            is_premium: true,
            premium_status: 'active',
          },
        ],
        error: null,
      });

    mockFrom.mockImplementation((table) => {
      if (table === 'uposlenici')
        return maybeSingle({ data: { id_uloge: 1 }, error: null });
      if (table === 'uloga') return ulogaLookup;
      if (table === 'v_korisnik_usluge') {
        return selectOnly({
          data: [
            {
              id_korisnika_usluge: 'k1',
              ime: 'K',
              prezime: 'U',
              email: 'k@example.com',
            },
          ],
          error: null,
        });
      }
      if (table === 'v_uposlenici')
        return selectOnly({ data: [], error: null });
      if (table === 'korisnik_usluge') {
        return {
          select: premiumSelect,
        };
      }
      return selectOnly({ data: [], error: null });
    });

    mockListUsers.mockResolvedValue({
      data: {
        users: [
          {
            id: 'k1',
            email: 'k@example.com',
            created_at: '2026-01-01T00:00:00.000Z',
            user_metadata: {},
            email_confirmed_at: '2026-01-02T00:00:00.000Z',
          },
        ],
      },
      error: null,
    });

    const response = await GET();
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.users[0].isPremium).toBe(true);
    expect(body.users[0].premium_status).toBe('active');
    expect(premiumSelect).toHaveBeenCalledTimes(2);
  });

  test('GET returns 500 when all premium fallback queries fail', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });

    const ulogaLookup = {
      select: jest.fn().mockImplementation((query) => {
        if (query === 'naziv') {
          return {
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest
                .fn()
                .mockResolvedValue({
                  data: { naziv: 'Administrator' },
                  error: null,
                }),
            }),
          };
        }
        return Promise.resolve({
          data: [{ id_uloge: 1, naziv: 'Administrator' }],
          error: null,
        });
      }),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn(),
    };

    const premiumSelect = jest
      .fn()
      .mockResolvedValueOnce({
        data: null,
        error: { message: 'missing premium columns' },
      })
      .mockResolvedValueOnce({
        data: null,
        error: { message: 'fallback 2 fail' },
      })
      .mockResolvedValueOnce({
        data: null,
        error: { message: 'fallback 3 fail' },
      });

    mockFrom.mockImplementation((table) => {
      if (table === 'uposlenici')
        return maybeSingle({ data: { id_uloge: 1 }, error: null });
      if (table === 'uloga') return ulogaLookup;
      if (table === 'v_korisnik_usluge')
        return selectOnly({ data: [], error: null });
      if (table === 'v_uposlenici')
        return selectOnly({ data: [], error: null });
      if (table === 'korisnik_usluge') {
        return {
          select: premiumSelect,
        };
      }
      return selectOnly({ data: [], error: null });
    });

    mockListUsers.mockResolvedValue({ data: { users: [] }, error: null });
    const response = await GET();
    expect(response.status).toBe(500);
  });

  test('GET uses minimal premium fallback mapping when only is_premium is available', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });

    const ulogaLookup = {
      select: jest.fn().mockImplementation((query) => {
        if (query === 'naziv') {
          return {
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest
                .fn()
                .mockResolvedValue({
                  data: { naziv: 'Administrator' },
                  error: null,
                }),
            }),
          };
        }
        return Promise.resolve({
          data: [{ id_uloge: 1, naziv: 'Administrator' }],
          error: null,
        });
      }),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn(),
    };

    const premiumSelect = jest
      .fn()
      .mockResolvedValueOnce({
        data: null,
        error: { message: 'missing premium columns' },
      })
      .mockResolvedValueOnce({
        data: null,
        error: { message: 'fallback 2 fail' },
      })
      .mockResolvedValueOnce({
        data: [{ id_korisnika_usluge: 'k1', is_premium: true }],
        error: null,
      });

    mockFrom.mockImplementation((table) => {
      if (table === 'uposlenici')
        return maybeSingle({ data: { id_uloge: 1 }, error: null });
      if (table === 'uloga') return ulogaLookup;
      if (table === 'v_korisnik_usluge') {
        return selectOnly({
          data: [
            {
              id_korisnika_usluge: 'k1',
              ime: 'K',
              prezime: 'U',
              email: 'k@example.com',
            },
          ],
          error: null,
        });
      }
      if (table === 'v_uposlenici')
        return selectOnly({ data: [], error: null });
      if (table === 'korisnik_usluge') {
        return {
          select: premiumSelect,
        };
      }
      return selectOnly({ data: [], error: null });
    });

    mockListUsers.mockResolvedValue({
      data: {
        users: [
          {
            id: 'k1',
            email: 'k@example.com',
            created_at: '2026-01-01T00:00:00.000Z',
            user_metadata: {},
            email_confirmed_at: '2026-01-02T00:00:00.000Z',
          },
        ],
      },
      error: null,
    });

    const response = await GET();
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.users[0].isPremium).toBe(true);
    expect(body.users[0].premium_status).toBe('active');
  });
});

describe('/api/admin/users POST route', () => {
  beforeEach(() => {
    mockFrom.mockReset();
    mockListUsers.mockReset();
    mockCreateUser.mockReset();
    mockSessionGetUser.mockReset();
    mockSendEmail.mockReset();
    mockKreirajEmailInternogNaloga.mockReset();
    mockSendEmail.mockResolvedValue({ success: true });
    mockKreirajEmailInternogNaloga.mockReturnValue('<p>email</p>');
  });

  function baseAdminMock() {
    mockFrom.mockImplementation((table) => {
      if (table === 'uposlenici')
        return maybeSingle({ data: { id_uloge: 1 }, error: null });
      if (table === 'uloga') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest
                .fn()
                .mockResolvedValue({
                  data: { naziv: 'Administrator' },
                  error: null,
                }),
            }),
          }),
        };
      }
      if (table === 'admin_user_create_audit')
        return insertOnly({ data: null, error: null });
      if (table === 'korisnik_usluge') return upsertOnly();
      return selectOnly({ data: [], error: null });
    });
  }

  test('returns 401 when no session', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: null } });
    const request = new Request('http://localhost/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  test('returns 403 when user is not admin', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockFrom.mockImplementation((table) => {
      if (table === 'uposlenici')
        return maybeSingle({ data: null, error: null });
      return maybeSingle({ data: null, error: null });
    });
    const request = new Request('http://localhost/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: 'A',
        last_name: 'B',
        email: 'ab@example.com',
        role: 'serviser',
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(403);
  });

  test('returns 400 for invalid payload', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    baseAdminMock();
    const request = new Request('http://localhost/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: '',
        last_name: 'B',
        email: 'not-email',
        role: 'x',
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  test('returns 409 for duplicate user email', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    baseAdminMock();
    mockListUsers.mockResolvedValue({
      data: { users: [{ email: 'dup@example.com' }] },
      error: null,
    });
    const request = new Request('http://localhost/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: 'Amina',
        last_name: 'Admin',
        email: 'dup@example.com',
        role: 'serviser',
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(409);
  });

  test('returns 200 on successful user creation', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    baseAdminMock();
    mockListUsers.mockResolvedValue({ data: { users: [] }, error: null });
    mockCreateUser.mockResolvedValue({
      data: { user: { id: 'new-user-id', email: 'novi@example.com' } },
      error: null,
    });
    const request = new Request('http://localhost/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: 'Novi',
        last_name: 'Serviser',
        email: 'novi@example.com',
        role: 'serviser',
      }),
    });
    const response = await POST(request);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.user.id).toBe('new-user-id');
    expect(body.privremena_lozinka).toBeTruthy();
  });

  test('POST maps role to Dispečer and marks email send failure as soft-success', async () => {
    mockSendEmail.mockResolvedValue({ success: false, greska: 'smtp fail' });
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    baseAdminMock();
    mockListUsers.mockResolvedValue({ data: { users: [] }, error: null });
    mockCreateUser.mockResolvedValue({
      data: { user: { id: 'new-dispecer-id', email: 'd@example.com' } },
      error: null,
    });

    const request = new Request('http://localhost/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: 'Dino',
        last_name: 'Dispecer',
        email: 'd@example.com',
        role: 'dispecer',
      }),
    });

    const response = await POST(request);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.user.role).toBe('Dispečer');
    expect(body.email_poslan).toBe(false);
  });

  test('POST returns 500 when listUsers fails before duplicate check', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    baseAdminMock();
    mockListUsers.mockResolvedValue({
      data: null,
      error: { message: 'list users failed before create' },
    });

    const request = new Request('http://localhost/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: 'Amir',
        last_name: 'Basic',
        email: 'ab2@example.com',
        role: 'administrator',
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(500);
  });

  test('POST returns 500 when createUser fails', async () => {
    mockSessionGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    baseAdminMock();
    mockListUsers.mockResolvedValue({ data: { users: [] }, error: null });
    mockCreateUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'create failed' },
    });

    const request = new Request('http://localhost/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: 'Amir',
        last_name: 'Basic',
        email: 'create-fail@example.com',
        role: 'administrator',
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(500);
  });
});
