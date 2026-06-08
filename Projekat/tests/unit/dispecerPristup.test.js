jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(),
}));

const {
  getUlogaNaziv,
  jeDispecerIliAdmin,
  assertDispatcherAccess,
} = require('@/lib/servisirane/dispecerPristup');

function supabaseSaUlogom(naziv) {
  return {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: { uloga: naziv == null ? null : { naziv } },
        error: null,
      }),
    })),
  };
}

describe('dispecerski pristup', () => {
  test('cita naziv uloge iz objekta ili niza', () => {
    expect(getUlogaNaziv({ naziv: 'dispecer' })).toBe('dispecer');
    expect(getUlogaNaziv([{ naziv: 'administrator' }])).toBe('administrator');
    expect(getUlogaNaziv(null)).toBe('');
  });

  test.each(['dispecer', 'dispečer', 'admin', 'administrator'])(
    'dozvoljava dispecersku ili administratorsku ulogu: %s',
    (uloga) => {
      expect(jeDispecerIliAdmin(uloga)).toBe(true);
    },
  );

  test.each(['serviser', 'korisnik', '', 'manager'])(
    'odbija neovlastenu ulogu: %s',
    (uloga) => {
      expect(jeDispecerIliAdmin(uloga)).toBe(false);
    },
  );

  test('assertDispatcherAccess provjerava ulogu preko uposlenici relacije', async () => {
    await expect(
      assertDispatcherAccess(supabaseSaUlogom('Dispecer'), 'u1'),
    ).resolves.toBe(true);
    await expect(
      assertDispatcherAccess(supabaseSaUlogom('Serviser'), 'u1'),
    ).resolves.toBe(false);
  });
});
