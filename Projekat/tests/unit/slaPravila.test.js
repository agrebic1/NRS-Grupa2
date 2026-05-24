const {
  SLA_ROKOVI_SATI,
  izracunajSlaRok,
  getSlaStatus,
  formatirајPreostaloVrijeme,
} = require('@/lib/servisirane/slaPravila');

// ─── SLA_ROKOVI_SATI - konstante ──────────────────────────────────────────────

describe('SLA_ROKOVI_SATI - rokovi po prioritetu', () => {
  test.each([
    ['NISKO',    72],
    ['SREDNJE',  24],
    ['VISOKO',    8],
    ['KRITIČNO',  2],
    ['HITNO',     2],
  ])('%s ima rok %d sati', (prioritet, sati) => {
    expect(SLA_ROKOVI_SATI[prioritet]).toBe(sati);
  });
});

// ─── izracunajSlaRok ──────────────────────────────────────────────────────────

describe('izracunajSlaRok', () => {
  test('HITNO - dodaje 2 sata na created_at', () => {
    const baza = '2025-01-01T10:00:00.000Z';
    const rok  = izracunajSlaRok(baza, 'HITNO');
    expect(rok.toISOString()).toBe('2025-01-01T12:00:00.000Z');
  });

  test('NISKO - dodaje 72 sata (3 dana)', () => {
    const baza = '2025-01-01T00:00:00.000Z';
    const rok  = izracunajSlaRok(baza, 'NISKO');
    expect(rok.toISOString()).toBe('2025-01-04T00:00:00.000Z');
  });

  test('SREDNJE - dodaje 24 sata', () => {
    const baza = '2025-06-15T08:00:00.000Z';
    const rok  = izracunajSlaRok(baza, 'SREDNJE');
    expect(rok.toISOString()).toBe('2025-06-16T08:00:00.000Z');
  });

  test('VISOKO - dodaje 8 sati', () => {
    const baza = '2025-03-10T06:00:00.000Z';
    const rok  = izracunajSlaRok(baza, 'VISOKO');
    expect(rok.toISOString()).toBe('2025-03-10T14:00:00.000Z');
  });

  test('vraća Date objekt', () => {
    const rok = izracunajSlaRok('2025-01-01T10:00:00.000Z', 'SREDNJE');
    expect(rok).toBeInstanceOf(Date);
  });
});

// ─── getSlaStatus ─────────────────────────────────────────────────────────────

describe('getSlaStatus - zatvorene intervencije', () => {
  test.each(['zavrseno', 'zatvoreno', 'otkazano', 'odbijeno'])(
    'vraća null za terminalni status %s',
    (status) => {
      const createdAt = new Date(Date.now() - 100 * 3600_000).toISOString();
      expect(getSlaStatus(createdAt, 'HITNO', status)).toBeNull();
    },
  );
});

describe('getSlaStatus - nepostojeci ili null prioritet', () => {
  test('vraća null za null prioritet', () => {
    const createdAt = new Date(Date.now() - 1 * 3600_000).toISOString();
    expect(getSlaStatus(createdAt, null, 'dodijeljeno')).toBeNull();
  });

  test('vraća null za nepoznati prioritet', () => {
    const createdAt = new Date(Date.now() - 1 * 3600_000).toISOString();
    expect(getSlaStatus(createdAt, 'NEPOZNATO', 'u_radu')).toBeNull();
  });
});

describe('getSlaStatus - aktivne intervencije', () => {
  test('vraća "prekoraceno" kada je rok prošao', () => {
    // HITNO = 2h; postavljamo created_at na 5 sati nazad → rok je 3h u prošlosti
    const createdAt = new Date(Date.now() - 5 * 3600_000).toISOString();
    expect(getSlaStatus(createdAt, 'HITNO', 'u_radu')).toBe('prekoraceno');
  });

  test('vraća "upozorenje" kada je <2h do roka (SREDNJE, kreiran 23h ago)', () => {
    // SREDNJE = 24h; kreiran 23h ago → 1h do roka → upozorenje
    const createdAt = new Date(Date.now() - 23 * 3600_000).toISOString();
    expect(getSlaStatus(createdAt, 'SREDNJE', 'dodijeljeno')).toBe('upozorenje');
  });

  test('vraća "ok" kada je >2h do roka (NISKO, kreiran 1h ago)', () => {
    // NISKO = 72h; kreiran 1h ago → 71h do roka → ok
    const createdAt = new Date(Date.now() - 1 * 3600_000).toISOString();
    expect(getSlaStatus(createdAt, 'NISKO', 'u_izvrsenju')).toBe('ok');
  });

  test('vraća "upozorenje" tačno na granici 2h (VISOKO, kreiran 6h ago)', () => {
    // VISOKO = 8h; kreiran 6h ago → 2h do roka → upozorenje
    const createdAt = new Date(Date.now() - 6 * 3600_000).toISOString();
    expect(getSlaStatus(createdAt, 'VISOKO', 'u_radu')).toBe('upozorenje');
  });
});

// ─── formatirајPreostaloVrijeme ───────────────────────────────────────────────

describe('formatirајPreostaloVrijeme', () => {
  test('vraća null za null prioritet', () => {
    expect(formatirајPreostaloVrijeme('2025-01-01T00:00:00Z', null)).toBeNull();
  });

  test('vraća null za nepoznati prioritet', () => {
    expect(formatirајPreostaloVrijeme('2025-01-01T00:00:00Z', 'NEPOSTOJECI')).toBeNull();
  });

  test('formatira preostalo vrijeme s satima i minutama', () => {
    // NISKO = 72h; kreiran 10min ago → ~71h 50min preostalo
    const createdAt = new Date(Date.now() - 10 * 60_000).toISOString();
    const rez = formatirајPreostaloVrijeme(createdAt, 'NISKO');
    expect(rez).toMatch(/^\d+h \d+min$/);
  });

  test('formatira preostalo bez sati ako < 1h', () => {
    // HITNO = 2h; kreiran 1h 50min ago → ~10min preostalo
    const createdAt = new Date(Date.now() - 110 * 60_000).toISOString();
    const rez = formatirајPreostaloVrijeme(createdAt, 'HITNO');
    expect(rez).toMatch(/^\d+min$/);
  });

  test('vraća negativno preostalo (prekoračenje) sa prefiksom -', () => {
    // HITNO = 2h; kreiran 5h ago → 3h prekoračenja
    const createdAt = new Date(Date.now() - 5 * 3600_000).toISOString();
    const rez = formatirајPreostaloVrijeme(createdAt, 'HITNO');
    expect(rez).toMatch(/^-\d+h \d+min$/);
  });

  test('vraća negativno u minutama ako prekoračenje < 1h', () => {
    // HITNO = 2h; kreiran 2h 30min ago → 30min prekoračenja
    const createdAt = new Date(Date.now() - 150 * 60_000).toISOString();
    const rez = formatirајPreostaloVrijeme(createdAt, 'HITNO');
    expect(rez).toMatch(/^-\d+min$/);
  });
});
