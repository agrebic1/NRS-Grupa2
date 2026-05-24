const {
  validirajServiserPrelaz,
  validirajDispecerasPrelaz,
  jeTerminalniStatus,
  jeReadOnly,
} = require('@/lib/servisirane/statusPrelazi');

describe('statusni prelazi - serviser', () => {
  test.each([
    ['dodijeljeno', 'u_radu'],
    ['dodijeljeno', 'potvrdeno'],    // vrati_na_dodjelu
    ['u_radu',      'u_izvrsenju'],
    ['u_radu',      'potvrdeno'],    // vrati_na_dodjelu
    ['u_izvrsenju', 'zavrseno'],
    ['u_izvrsenju', 'potvrdeno'],    // nije_rijeseno
  ])('dozvoljava serviser prelaz %s → %s', (iz, u) => {
    expect(validirajServiserPrelaz(iz, u)).toEqual({ ok: true });
  });

  test.each([
    ['u_izvrsenju', 'zatvoreno'],
    ['dodijeljeno', 'u_izvrsenju'],
    ['u_radu',      'dodijeljeno'],
    ['u_radu',      'zavrseno'],
    ['potvrdeno',   'u_radu'],
  ])('blokira nedozvoljeni serviser prelaz %s → %s', (iz, u) => {
    const rez = validirajServiserPrelaz(iz, u);
    expect(rez.ok).toBe(false);
    expect(typeof rez.greska).toBe('string');
  });

  test.each(['zatvoreno', 'otkazano', 'odbijeno'])(
    'blokira svaku promjenu iz terminalnog statusa %s',
    (status) => {
      const rez = validirajServiserPrelaz(status, 'u_radu');
      expect(rez.ok).toBe(false);
      expect(rez.greska).toMatch(/terminalnom/i);
    },
  );

  test('greška sadrži popis dozvoljenih prelaza', () => {
    const rez = validirajServiserPrelaz('dodijeljeno', 'zavrseno');
    expect(rez.ok).toBe(false);
    expect(rez.greska).toContain('u_radu');
  });

  test('greška za status bez dozvoljenih prelaza pominje nema', () => {
    // 'potvrdeno' nije u SERVISER_PRELAZI → lista dozvoljenih je prazna → "nema"
    const rez = validirajServiserPrelaz('potvrdeno', 'u_radu');
    expect(rez.ok).toBe(false);
    expect(rez.greska).toMatch(/nema/i);
  });
});

describe('statusni prelazi - dispečer', () => {
  test.each([
    ['u_izvrsenju', 'zavrseno'],
    ['u_izvrsenju', 'potvrdeno'],
    ['zavrseno',    'zatvoreno'],
    ['dodijeljeno', 'potvrdeno'],
    ['u_radu',      'potvrdeno'],
  ])('dozvoljava dispečer prelaz %s → %s', (iz, u) => {
    expect(validirajDispecerasPrelaz(iz, u)).toEqual({ ok: true });
  });

  test.each([
    ['dodijeljeno', 'zavrseno'],
    ['dodijeljeno', 'zatvoreno'],
    ['u_radu',      'zatvoreno'],
    ['u_radu',      'zavrseno'],
    ['potvrdeno',   'u_radu'],
    ['potvrdeno',   'zatvoreno'],
  ])('blokira nedozvoljeni dispečer prelaz %s → %s', (iz, u) => {
    const rez = validirajDispecerasPrelaz(iz, u);
    expect(rez.ok).toBe(false);
    expect(typeof rez.greska).toBe('string');
  });

  test.each(['zatvoreno', 'otkazano', 'odbijeno'])(
    'blokira prijelaz iz terminalnog statusa %s u ne-potvrdeno',
    (status) => {
      const rez = validirajDispecerasPrelaz(status, 'u_radu');
      expect(rez.ok).toBe(false);
      expect(rez.greska).toMatch(/terminalnom/i);
    },
  );
});

describe('jeTerminalniStatus', () => {
  test.each(['zatvoreno', 'otkazano', 'odbijeno'])(
    '%s je terminalni status',
    (status) => {
      expect(jeTerminalniStatus(status)).toBe(true);
    },
  );

  test.each(['dodijeljeno', 'u_radu', 'u_izvrsenju', 'potvrdeno', 'zavrseno', 'pending_review'])(
    '%s nije terminalni status',
    (status) => {
      expect(jeTerminalniStatus(status)).toBe(false);
    },
  );
});

describe('jeReadOnly', () => {
  test('zatvoreno je read-only', () => {
    expect(jeReadOnly('zatvoreno')).toBe(true);
  });

  test.each(['otkazano', 'odbijeno', 'u_radu', 'zavrseno', 'dodijeljeno'])(
    '%s nije read-only',
    (status) => {
      expect(jeReadOnly(status)).toBe(false);
    },
  );
});
