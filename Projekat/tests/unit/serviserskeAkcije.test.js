const {
  serviserSmijeMijenjatiStatus,
} = require('@/lib/servisirane/serviserPristup');

const { evidencijaRadaSchema } = require('@/lib/validations/servisirane');

// ─── serviserSmijeMijenjatiStatus - rub slučajevi ─────────────────────────────

describe('serviserSmijeMijenjatiStatus - rub slučajevi', () => {
  test('vraća false za nedefinirani status', () => {
    expect(serviserSmijeMijenjatiStatus(undefined, 'u_radu')).toBe(false);
    expect(serviserSmijeMijenjatiStatus(null, 'u_radu')).toBe(false);
  });

  test('vraća false za prazan string status', () => {
    expect(serviserSmijeMijenjatiStatus('', 'u_radu')).toBe(false);
  });

  test('vraća false za isti status (nema prelaza u sebi)', () => {
    expect(serviserSmijeMijenjatiStatus('u_radu', 'u_radu')).toBe(false);
    expect(serviserSmijeMijenjatiStatus('dodijeljeno', 'dodijeljeno')).toBe(
      false,
    );
  });

  test('vraća false za sve terminalne statuse', () => {
    for (const s of ['zatvoreno', 'otkazano', 'odbijeno']) {
      expect(serviserSmijeMijenjatiStatus(s, 'u_radu')).toBe(false);
      expect(serviserSmijeMijenjatiStatus(s, 'u_izvrsenju')).toBe(false);
    }
  });

  test('strogo je case-sensitive (DODIJELJENO nije dodijeljeno)', () => {
    expect(serviserSmijeMijenjatiStatus('DODIJELJENO', 'u_radu')).toBe(false);
  });
});

// ─── evidencijaRadaSchema ─────────────────────────────────────────────────────

describe('evidencijaRadaSchema - validacija evidencije rada', () => {
  const validan = {
    opis_rada: 'Zamijenjen bojler u kupaonici.',
    trajanje_minuta: 60,
  };

  test('prihvata minimalni validan objekt (opis + trajanje)', () => {
    expect(evidencijaRadaSchema.safeParse(validan).success).toBe(true);
  });

  test('odbija opis kraći od 5 karaktera', () => {
    const rez = evidencijaRadaSchema.safeParse({ ...validan, opis_rada: 'Kv' });
    expect(rez.success).toBe(false);
    expect(rez.error.errors[0].message).toMatch(/5/);
  });

  test('odbija opis dulji od 2000 karaktera', () => {
    const rez = evidencijaRadaSchema.safeParse({
      ...validan,
      opis_rada: 'x'.repeat(2001),
    });
    expect(rez.success).toBe(false);
  });

  test('prihvata opis od tačno 5 karaktera', () => {
    expect(
      evidencijaRadaSchema.safeParse({ ...validan, opis_rada: '12345' })
        .success,
    ).toBe(true);
  });

  test('prihvata trajanje_minuta u granicama', () => {
    expect(
      evidencijaRadaSchema.safeParse({ ...validan, trajanje_minuta: 60 })
        .success,
    ).toBe(true);
  });

  test('odbija trajanje_minuta manji od 1', () => {
    expect(
      evidencijaRadaSchema.safeParse({ ...validan, trajanje_minuta: 0 })
        .success,
    ).toBe(false);
  });

  test('odbija trajanje_minuta veći od 1440 (24h)', () => {
    expect(
      evidencijaRadaSchema.safeParse({ ...validan, trajanje_minuta: 1441 })
        .success,
    ).toBe(false);
  });

  test('odbija evidenciju bez trajanja_minuta (obavezno polje)', () => {
    const bezTrajanja = { opis_rada: 'Zamijenjen bojler u kupaonici.' };
    expect(evidencijaRadaSchema.safeParse(bezTrajanja).success).toBe(false);
  });

  test('prihvata sva opcionalna polja', () => {
    const payload = {
      opis_rada: 'Detaljan opis izvršenog rada.',
      trajanje_minuta: 120,
      materijal: 'Novi bojler 50L',
      napomene: 'Instalacija završena bez poteškoća.',
    };
    expect(evidencijaRadaSchema.safeParse(payload).success).toBe(true);
  });

  test('odbija materijal dulji od 500 karaktera', () => {
    const payload = { ...validan, materijal: 'x'.repeat(501) };
    expect(evidencijaRadaSchema.safeParse(payload).success).toBe(false);
  });

  test('odbija napomene dulje od 1000 karaktera', () => {
    const payload = { ...validan, napomene: 'x'.repeat(1001) };
    expect(evidencijaRadaSchema.safeParse(payload).success).toBe(false);
  });

  test('odbija nepostojeći opis (obavezno polje)', () => {
    expect(evidencijaRadaSchema.safeParse({}).success).toBe(false);
  });

  test('odbija stavku materijala s praznim nazivom (US-46 / T3-11)', () => {
    const payload = {
      ...validan,
      stavke_materijala: [{ naziv: '', kolicina: 1, jedinica: 'kom' }],
    };
    expect(evidencijaRadaSchema.safeParse(payload).success).toBe(false);
  });

  test('odbija stavku materijala s nultom količinom', () => {
    const payload = {
      ...validan,
      stavke_materijala: [{ naziv: 'Cijev', kolicina: 0, jedinica: 'kom' }],
    };
    expect(evidencijaRadaSchema.safeParse(payload).success).toBe(false);
  });
});
