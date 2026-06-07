/**
 * US-53 — Detekcija intervencija koje predugo čekaju.
 * Testira: pragove po statusu, getDugoChekanje, formatiraTrajanje, OPIS_TIPA.
 */
import {
  getDugoChekanje,
  formatiraTrajanje,
  DUGO_CEKANJE_PRAGOVI_SATI,
  OPIS_TIPA,
} from '@/lib/servisirane/dugoChekanje';

function prijeNSati(n: number): string {
  return new Date(Date.now() - n * 3_600_000).toISOString();
}

function prijeNMin(n: number): string {
  return new Date(Date.now() - n * 60_000).toISOString();
}

// ─── Pragovi ──────────────────────────────────────────────────────────────────

describe('DUGO_CEKANJE_PRAGOVI_SATI — definirani pragovi po statusu', () => {
  it('pending_review prag = 2h', () => {
    expect(DUGO_CEKANJE_PRAGOVI_SATI['pending_review']).toBe(2);
  });

  it('na_cekanju prag = 2h (sinonim za pending_review)', () => {
    expect(DUGO_CEKANJE_PRAGOVI_SATI['na_cekanju']).toBe(2);
  });

  it('in_review prag = 6h', () => {
    expect(DUGO_CEKANJE_PRAGOVI_SATI['in_review']).toBe(6);
  });

  it('potvrdeno prag = 8h', () => {
    expect(DUGO_CEKANJE_PRAGOVI_SATI['potvrdeno']).toBe(8);
  });

  it('dodijeljeno prag = 4h', () => {
    expect(DUGO_CEKANJE_PRAGOVI_SATI['dodijeljeno']).toBe(4);
  });

  it('izvršni statusi nemaju prag (u_radu, u_izvrsenju, zatvoreno)', () => {
    expect(DUGO_CEKANJE_PRAGOVI_SATI['u_radu']).toBeUndefined();
    expect(DUGO_CEKANJE_PRAGOVI_SATI['u_izvrsenju']).toBeUndefined();
    expect(DUGO_CEKANJE_PRAGOVI_SATI['zatvoreno']).toBeUndefined();
    expect(DUGO_CEKANJE_PRAGOVI_SATI['zavrseno']).toBeUndefined();
    expect(DUGO_CEKANJE_PRAGOVI_SATI['otkazano']).toBeUndefined();
    expect(DUGO_CEKANJE_PRAGOVI_SATI['odbijeno']).toBeUndefined();
  });
});

// ─── Ispod praga → null ───────────────────────────────────────────────────────

describe('getDugoChekanje — ispod praga → null', () => {
  it('pending_review 1h (prag 2h) → null', () => {
    expect(getDugoChekanje('pending_review', prijeNSati(1))).toBeNull();
  });

  it('na_cekanju 30min (prag 2h) → null', () => {
    expect(getDugoChekanje('na_cekanju', prijeNMin(30))).toBeNull();
  });

  it('in_review 5h 59min (prag 6h) → null', () => {
    expect(getDugoChekanje('in_review', prijeNMin(359))).toBeNull();
  });

  it('potvrdeno 7h (prag 8h) → null', () => {
    expect(getDugoChekanje('potvrdeno', prijeNSati(7))).toBeNull();
  });

  it('dodijeljeno 3h 59min (prag 4h) → null', () => {
    expect(getDugoChekanje('dodijeljeno', prijeNMin(239))).toBeNull();
  });
});

// ─── Iznad praga → DugoChekanje ───────────────────────────────────────────────

describe('getDugoChekanje — iznad praga → DugoChekanje objekt', () => {
  it('pending_review 3h → tip nema_obrade, prag 2h', () => {
    const r = getDugoChekanje('pending_review', prijeNSati(3));
    expect(r).not.toBeNull();
    expect(r!.tip).toBe('nema_obrade');
    expect(r!.prag_ms).toBe(2 * 3_600_000);
    expect(r!.trajanje_ms).toBeGreaterThan(r!.prag_ms);
  });

  it('na_cekanju 3h → tip nema_obrade', () => {
    const r = getDugoChekanje('na_cekanju', prijeNSati(3));
    expect(r!.tip).toBe('nema_obrade');
  });

  it('in_review 7h → tip nema_obrade, prag 6h', () => {
    const r = getDugoChekanje('in_review', prijeNSati(7));
    expect(r!.tip).toBe('nema_obrade');
    expect(r!.prag_ms).toBe(6 * 3_600_000);
  });

  it('potvrdeno 10h → tip nema_dodjele, prag 8h', () => {
    const r = getDugoChekanje('potvrdeno', prijeNSati(10));
    expect(r!.tip).toBe('nema_dodjele');
    expect(r!.prag_ms).toBe(8 * 3_600_000);
  });

  it('dodijeljeno 5h → tip ceka_prihvatanje, prag 4h', () => {
    const r = getDugoChekanje('dodijeljeno', prijeNSati(5));
    expect(r!.tip).toBe('ceka_prihvatanje');
    expect(r!.prag_ms).toBe(4 * 3_600_000);
  });

  it('trajanje_ms je uvijek > prag_ms pri prekoračenju', () => {
    const r = getDugoChekanje('dodijeljeno', prijeNSati(5));
    expect(r!.trajanje_ms).toBeGreaterThan(r!.prag_ms);
  });

  it('trajanje_ms odgovara stvarnom vremenu (±5s tolerancija)', () => {
    const r = getDugoChekanje('pending_review', prijeNSati(3));
    const ocekivano = 3 * 3_600_000;
    expect(r!.trajanje_ms).toBeGreaterThan(ocekivano - 5_000);
    expect(r!.trajanje_ms).toBeLessThan(ocekivano + 5_000);
  });
});

// ─── Statusi bez praga → null ─────────────────────────────────────────────────

describe('getDugoChekanje — statusi bez praga uvijek vraćaju null', () => {
  it('u_radu → null (serviser na putu, ne broji se)', () => {
    expect(getDugoChekanje('u_radu', prijeNSati(24))).toBeNull();
  });

  it('u_izvrsenju → null (rad u toku)', () => {
    expect(getDugoChekanje('u_izvrsenju', prijeNSati(24))).toBeNull();
  });

  it('zavrseno → null (čeka zatvaranje)', () => {
    expect(getDugoChekanje('zavrseno', prijeNSati(10))).toBeNull();
  });

  it('zatvoreno → null (arhiva)', () => {
    expect(getDugoChekanje('zatvoreno', prijeNSati(100))).toBeNull();
  });

  it('otkazano → null (terminal)', () => {
    expect(getDugoChekanje('otkazano', prijeNSati(50))).toBeNull();
  });

  it('odbijeno → null (terminal)', () => {
    expect(getDugoChekanje('odbijeno', prijeNSati(50))).toBeNull();
  });

  it('nepoznat status → null (sigurni fallback)', () => {
    expect(getDugoChekanje('nepostojeci_status', prijeNSati(999))).toBeNull();
  });
});

// ─── formatiraTrajanje ────────────────────────────────────────────────────────

describe('formatiraTrajanje', () => {
  it('0 ms → "0min"', () => {
    expect(formatiraTrajanje(0)).toBe('0min');
  });

  it('1 min → "1min"', () => {
    expect(formatiraTrajanje(60_000)).toBe('1min');
  });

  it('30 min → "30min"', () => {
    expect(formatiraTrajanje(30 * 60_000)).toBe('30min');
  });

  it('59 min → "59min"', () => {
    expect(formatiraTrajanje(59 * 60_000)).toBe('59min');
  });

  it('tačno 60 min → "1h"', () => {
    expect(formatiraTrajanje(60 * 60_000)).toBe('1h');
  });

  it('tačno 2h → "2h"', () => {
    expect(formatiraTrajanje(2 * 3_600_000)).toBe('2h');
  });

  it('1h 30min → "1h 30min"', () => {
    expect(formatiraTrajanje(90 * 60_000)).toBe('1h 30min');
  });

  it('2h 5min → "2h 5min"', () => {
    expect(formatiraTrajanje(125 * 60_000)).toBe('2h 5min');
  });

  it('12h → "12h"', () => {
    expect(formatiraTrajanje(12 * 3_600_000)).toBe('12h');
  });

  it('24h → "24h"', () => {
    expect(formatiraTrajanje(24 * 3_600_000)).toBe('24h');
  });
});

// ─── OPIS_TIPA ────────────────────────────────────────────────────────────────

describe('OPIS_TIPA — svaki tip ima neprazan string opis', () => {
  it('nema_obrade ima opis', () => {
    expect(typeof OPIS_TIPA['nema_obrade']).toBe('string');
    expect(OPIS_TIPA['nema_obrade'].length).toBeGreaterThan(0);
  });

  it('nema_dodjele ima opis', () => {
    expect(typeof OPIS_TIPA['nema_dodjele']).toBe('string');
    expect(OPIS_TIPA['nema_dodjele'].length).toBeGreaterThan(0);
  });

  it('ceka_prihvatanje ima opis', () => {
    expect(typeof OPIS_TIPA['ceka_prihvatanje']).toBe('string');
    expect(OPIS_TIPA['ceka_prihvatanje'].length).toBeGreaterThan(0);
  });
});
