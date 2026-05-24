const {
  serviserSmijeMijenjatiStatus,
  assertServiserVlasnistvo,
} = require('@/lib/servisirane/serviserPristup');

const {
  odbijZadatakSchema,
  dodijelijeSchema,
} = require('@/lib/validations/servisirane');

// ─── Helper: mock supabase client ─────────────────────────────────────────────

function supabaseZaVlasnistvo(data) {
  return {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq:     jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data, error: null }),
    })),
  };
}

// ─── serviserSmijeMijenjatiStatus ─────────────────────────────────────────────

describe('serviserSmijeMijenjatiStatus', () => {
  test.each([
    ['dodijeljeno', 'u_radu',      true],
    ['u_radu',      'u_izvrsenju', true],
  ])('%s → %s: dozvoljeno=%s', (iz, u, ocekivano) => {
    expect(serviserSmijeMijenjatiStatus(iz, u)).toBe(ocekivano);
  });

  test.each([
    ['u_izvrsenju', 'zavrseno'],
    ['u_izvrsenju', 'u_radu'],
    ['dodijeljeno', 'u_izvrsenju'],
    ['u_radu',      'dodijeljeno'],
    ['potvrdeno',   'u_radu'],
    ['zavrseno',    'u_radu'],
    ['',            'u_radu'],
    ['nepoznato',   'u_radu'],
  ])('blokira %s → %s', (iz, u) => {
    expect(serviserSmijeMijenjatiStatus(iz, u)).toBe(false);
  });
});

// ─── assertServiserVlasnistvo ─────────────────────────────────────────────────

describe('assertServiserVlasnistvo', () => {
  test('vraća ok:true kada je serviser vlasnik', async () => {
    const db = supabaseZaVlasnistvo({
      serviser_dodijeljen_id: 's1',
      status: 'dodijeljeno',
      is_premium: false,
    });
    const rez = await assertServiserVlasnistvo(db, 1, 's1');
    expect(rez.ok).toBe(true);
    if (rez.ok) {
      expect(rez.status).toBe('dodijeljeno');
      expect(rez.is_premium).toBe(false);
    }
  });

  test('vraća ok:false kada serviser nije vlasnik', async () => {
    const db = supabaseZaVlasnistvo({
      serviser_dodijeljen_id: 'drugi-serviser',
      status: 'dodijeljeno',
      is_premium: false,
    });
    const rez = await assertServiserVlasnistvo(db, 1, 's1');
    expect(rez.ok).toBe(false);
    if (!rez.ok) expect(rez.greska).toBeTruthy();
  });

  test('vraća ok:false kada zahtjev nije pronađen', async () => {
    const db = supabaseZaVlasnistvo(null);
    const rez = await assertServiserVlasnistvo(db, 999, 's1');
    expect(rez.ok).toBe(false);
  });

  test('tretira is_premium null kao false', async () => {
    const db = supabaseZaVlasnistvo({
      serviser_dodijeljen_id: 's1',
      status: 'u_radu',
      is_premium: null,
    });
    const rez = await assertServiserVlasnistvo(db, 1, 's1');
    expect(rez.ok).toBe(true);
    if (rez.ok) expect(rez.is_premium).toBe(false);
  });
});

// ─── odbijZadatakSchema ───────────────────────────────────────────────────────

describe('odbijZadatakSchema - validacija razloga odbijanja', () => {
  test('prihvata razlog koji zadovoljava minimum', () => {
    expect(odbijZadatakSchema.safeParse({ razlog: 'Nema kapaciteta.' }).success).toBe(true);
  });

  test('odbija prazan razlog', () => {
    expect(odbijZadatakSchema.safeParse({ razlog: '' }).success).toBe(false);
  });

  test('odbija razlog kraći od 10 karaktera', () => {
    expect(odbijZadatakSchema.safeParse({ razlog: 'Kratko' }).success).toBe(false);
  });

  test('odbija razlog dulji od 500 karaktera', () => {
    const dugi = 'x'.repeat(501);
    expect(odbijZadatakSchema.safeParse({ razlog: dugi }).success).toBe(false);
  });

  test('prihvata razlog od tačno 10 karaktera', () => {
    expect(odbijZadatakSchema.safeParse({ razlog: '1234567890' }).success).toBe(true);
  });
});

// ─── dodijelijeSchema ─────────────────────────────────────────────────────────

describe('dodijelijeSchema - validacija dodjele servisera', () => {
  const validan = {
    action:      'dodijeli',
    serviser_id: '00000000-0000-0000-0000-000000000001',
  };

  test('prihvata minimalnu validnu dodjelu', () => {
    expect(dodijelijeSchema.safeParse(validan).success).toBe(true);
  });

  test('odbija dodjelu bez serviser_id', () => {
    const { serviser_id: _, ...bez } = validan;
    expect(dodijelijeSchema.safeParse(bez).success).toBe(false);
  });

  test('odbija neispravan UUID za serviser_id', () => {
    expect(dodijelijeSchema.safeParse({ ...validan, serviser_id: 'nije-uuid' }).success).toBe(false);
  });

  test('prihvata opcionalne termin i trajanje', () => {
    const payload = {
      ...validan,
      termin_planirani_pocetak: '2026-06-01T08:00:00+02:00',
      termin_planirani_kraj:    '2026-06-01T10:00:00+02:00',
      procijenjeno_trajanje:    90,
      dispecer_napomene:        'Nositi alat.',
    };
    expect(dodijelijeSchema.safeParse(payload).success).toBe(true);
  });

  test('odbija procijenjeno_trajanje izvan opsega', () => {
    expect(dodijelijeSchema.safeParse({ ...validan, procijenjeno_trajanje: 4 }).success).toBe(false);
    expect(dodijelijeSchema.safeParse({ ...validan, procijenjeno_trajanje: 1441 }).success).toBe(false);
  });
});
