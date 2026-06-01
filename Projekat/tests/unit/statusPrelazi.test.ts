import {
  validirajServiserPrelaz,
  validirajDispecerasPrelaz,
  jeTerminalniStatus,
  jeZavrsenoIliZatvoreno,
} from '@/lib/servisirane/statusPrelazi';

describe('validirajServiserPrelaz', () => {
  // ── Dozvoljeni prelazi ────────────────────────────────────────────────────────
  it('dodijeljeno → u_radu: dozvoljen', () => {
    expect(validirajServiserPrelaz('dodijeljeno', 'u_radu').ok).toBe(true);
  });

  it('dodijeljeno → potvrdeno (odbijanje): dozvoljen', () => {
    expect(validirajServiserPrelaz('dodijeljeno', 'potvrdeno').ok).toBe(true);
  });

  it('u_radu → u_izvrsenju: dozvoljen', () => {
    expect(validirajServiserPrelaz('u_radu', 'u_izvrsenju').ok).toBe(true);
  });

  it('u_radu → potvrdeno (povratak): dozvoljen', () => {
    expect(validirajServiserPrelaz('u_radu', 'potvrdeno').ok).toBe(true);
  });

  it('u_izvrsenju → zavrseno: dozvoljen', () => {
    expect(validirajServiserPrelaz('u_izvrsenju', 'zavrseno').ok).toBe(true);
  });

  it('u_izvrsenju → potvrdeno (povratak): dozvoljen', () => {
    expect(validirajServiserPrelaz('u_izvrsenju', 'potvrdeno').ok).toBe(true);
  });

  // ── Zabranjeni prelazi ────────────────────────────────────────────────────────
  it('zavrseno → u_radu: zabranjen (terminalni)', () => {
    const r = validirajServiserPrelaz('zavrseno', 'u_radu');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.greska).toContain('završena ili zatvorena');
  });

  it('zatvoreno → u_radu: zabranjen (terminalni)', () => {
    expect(validirajServiserPrelaz('zatvoreno', 'u_radu').ok).toBe(false);
  });

  it('otkazano → u_radu: zabranjen (terminalni)', () => {
    expect(validirajServiserPrelaz('otkazano', 'u_radu').ok).toBe(false);
  });

  it('odbijeno → u_radu: zabranjen (terminalni)', () => {
    expect(validirajServiserPrelaz('odbijeno', 'u_radu').ok).toBe(false);
  });

  it('pending_review → u_radu: zabranjen (pogrešna faza)', () => {
    expect(validirajServiserPrelaz('pending_review', 'u_radu').ok).toBe(false);
  });

  it('dodijeljeno → zavrseno: zabranjen (preskakanje koraka)', () => {
    expect(validirajServiserPrelaz('dodijeljeno', 'zavrseno').ok).toBe(false);
  });
});

describe('validirajDispecerasPrelaz', () => {
  // ── Dozvoljeni prelazi ────────────────────────────────────────────────────────
  it('u_izvrsenju → zavrseno: dozvoljen', () => {
    expect(validirajDispecerasPrelaz('u_izvrsenju', 'zavrseno').ok).toBe(true);
  });

  it('dodijeljeno → potvrdeno (rollback): dozvoljen', () => {
    expect(validirajDispecerasPrelaz('dodijeljeno', 'potvrdeno').ok).toBe(true);
  });

  it('u_radu → potvrdeno (rollback): dozvoljen', () => {
    expect(validirajDispecerasPrelaz('u_radu', 'potvrdeno').ok).toBe(true);
  });

  // ── Zabranjeni prelazi ────────────────────────────────────────────────────────
  it('zavrseno → zatvoreno: zabranjen (zatvaranje ide preko closed_at, ne statusa)', () => {
    expect(validirajDispecerasPrelaz('zavrseno', 'zatvoreno').ok).toBe(false);
  });

  it('zatvoreno → zavrseno: zabranjen (zaključan)', () => {
    const r = validirajDispecerasPrelaz('zatvoreno', 'zavrseno');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.greska).toContain('zaključanom statusu');
  });

  it('otkazano → u_radu: zabranjen (zaključan)', () => {
    expect(validirajDispecerasPrelaz('otkazano', 'u_radu').ok).toBe(false);
  });

  it('odbijeno → potvrdeno: zabranjen (zaključan)', () => {
    expect(validirajDispecerasPrelaz('odbijeno', 'potvrdeno').ok).toBe(false);
  });
});

describe('jeTerminalniStatus', () => {
  it('zaključani statusi su terminalni', () => {
    expect(jeTerminalniStatus('zatvoreno')).toBe(true);
    expect(jeTerminalniStatus('otkazano')).toBe(true);
    expect(jeTerminalniStatus('odbijeno')).toBe(true);
  });

  it('zavrseno NIJE terminalni (dispečer može zatvoriti)', () => {
    expect(jeTerminalniStatus('zavrseno')).toBe(false);
  });

  it('aktivni statusi nisu terminalni', () => {
    [
      'pending_review',
      'in_review',
      'potvrdeno',
      'dodijeljeno',
      'u_radu',
    ].forEach((s) => expect(jeTerminalniStatus(s)).toBe(false));
  });
});

describe('jeZavrsenoIliZatvoreno', () => {
  it('zavrseno i zatvoreno vraćaju true', () => {
    expect(jeZavrsenoIliZatvoreno('zavrseno')).toBe(true);
    expect(jeZavrsenoIliZatvoreno('zatvoreno')).toBe(true);
  });

  it('drugi statusi vraćaju false', () => {
    ['otkazano', 'odbijeno', 'u_radu', 'potvrdeno', 'in_review'].forEach((s) =>
      expect(jeZavrsenoIliZatvoreno(s)).toBe(false),
    );
  });
});
