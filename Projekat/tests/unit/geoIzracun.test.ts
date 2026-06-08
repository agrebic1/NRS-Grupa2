/**
 * US-51 — Geo-izračun rute servisera do intervencije.
 * Testira: haversineKm, izracunajRutu, formatirajUdaljenost, formatirajTrajanjePuta.
 */
import {
  haversineKm,
  izracunajRutu,
  formatirajUdaljenost,
  formatirajTrajanjePuta,
} from '@/lib/servisirane/geoIzracun';

// ─── haversineKm ──────────────────────────────────────────────────────────────

describe('haversineKm — Haversine formula za pravocrtnu udaljenost', () => {
  it('ista tačka → 0 km', () => {
    expect(haversineKm(43.86, 18.43, 43.86, 18.43)).toBeCloseTo(0, 5);
  });

  it('Sarajevo Centar → Stari Grad ≈ 1–3 km', () => {
    const d = haversineKm(43.8563, 18.4131, 43.86, 18.432);
    expect(d).toBeGreaterThan(0.5);
    expect(d).toBeLessThan(5);
  });

  it('Sarajevo → Mostar ≈ 65–75 km', () => {
    const d = haversineKm(43.8486, 18.3564, 43.3439, 17.8075);
    expect(d).toBeGreaterThan(60);
    expect(d).toBeLessThan(80);
  });

  it('premještaj za ~1° lat ≈ 111 km', () => {
    const d = haversineKm(43.0, 18.0, 44.0, 18.0);
    expect(d).toBeGreaterThan(108);
    expect(d).toBeLessThan(114);
  });

  it('simetrija: d(A,B) === d(B,A)', () => {
    const d1 = haversineKm(43.8486, 18.3564, 43.91, 18.34);
    const d2 = haversineKm(43.91, 18.34, 43.8486, 18.3564);
    expect(d1).toBeCloseTo(d2, 6);
  });

  it('uvijek vraća nenegativan broj', () => {
    expect(haversineKm(0, 0, 90, 180)).toBeGreaterThanOrEqual(0);
    expect(haversineKm(-43, 18, 43, -18)).toBeGreaterThanOrEqual(0);
  });
});

// ─── izracunajRutu ────────────────────────────────────────────────────────────

describe('izracunajRutu — procjena cestovne rute', () => {
  const LAT1 = 43.8486,
    LNG1 = 18.3564;
  const LAT2 = 43.91,
    LNG2 = 18.34;

  it('vraća objekt s pravacKm, procjenaKm i minuteProcjena', () => {
    const r = izracunajRutu(LAT1, LNG1, LAT2, LNG2);
    expect(r).toHaveProperty('pravacKm');
    expect(r).toHaveProperty('procjenaKm');
    expect(r).toHaveProperty('minuteProcjena');
  });

  it('pravacKm odgovara haversine vrijednosti', () => {
    const r = izracunajRutu(LAT1, LNG1, LAT2, LNG2);
    expect(r.pravacKm).toBeCloseTo(haversineKm(LAT1, LNG1, LAT2, LNG2), 5);
  });

  it('procjenaKm = pravacKm × 1.35 (cestovni faktor)', () => {
    const r = izracunajRutu(LAT1, LNG1, LAT2, LNG2);
    expect(r.procjenaKm).toBeCloseTo(r.pravacKm * 1.35, 5);
  });

  it('procjenaKm > pravacKm za nenultu udaljenost', () => {
    const r = izracunajRutu(LAT1, LNG1, LAT2, LNG2);
    expect(r.procjenaKm).toBeGreaterThan(r.pravacKm);
  });

  it('minuteProcjena > 0 za nenultu udaljenost', () => {
    const r = izracunajRutu(LAT1, LNG1, LAT2, LNG2);
    expect(r.minuteProcjena).toBeGreaterThan(0);
  });

  it('ista tačka → pravacKm, procjenaKm i minuteProcjena ≈ 0', () => {
    const r = izracunajRutu(43.86, 18.43, 43.86, 18.43);
    expect(r.pravacKm).toBeCloseTo(0, 5);
    expect(r.procjenaKm).toBeCloseTo(0, 5);
    expect(r.minuteProcjena).toBeCloseTo(0, 5);
  });

  it('dulja ruta daje veće minuteProcjena od kraće', () => {
    const kratka = izracunajRutu(43.86, 18.43, 43.861, 18.431);
    const duga = izracunajRutu(43.8486, 18.3564, 43.91, 18.34);
    expect(duga.minuteProcjena).toBeGreaterThan(kratka.minuteProcjena);
  });
});

// ─── formatirajUdaljenost ─────────────────────────────────────────────────────

describe('formatirajUdaljenost', () => {
  it('0 km → "< 100 m"', () => {
    expect(formatirajUdaljenost(0)).toBe('< 100 m');
  });

  it('0.05 km (50 m) → "< 100 m"', () => {
    expect(formatirajUdaljenost(0.05)).toBe('< 100 m');
  });

  it('0.099 km → "< 100 m" (granična vrijednost)', () => {
    expect(formatirajUdaljenost(0.099)).toBe('< 100 m');
  });

  it('0.1 km (100 m) → "100 m"', () => {
    expect(formatirajUdaljenost(0.1)).toBe('100 m');
  });

  it('0.5 km → "500 m"', () => {
    expect(formatirajUdaljenost(0.5)).toBe('500 m');
  });

  it('0.999 km → "999 m"', () => {
    expect(formatirajUdaljenost(0.999)).toBe('999 m');
  });

  it('1.0 km → "1.0 km"', () => {
    expect(formatirajUdaljenost(1.0)).toBe('1.0 km');
  });

  it('5.5 km → "5.5 km"', () => {
    expect(formatirajUdaljenost(5.5)).toBe('5.5 km');
  });

  it('9.99 km → "10.0 km" (zaokruži na 1 decimalu)', () => {
    expect(formatirajUdaljenost(9.99)).toBe('10.0 km');
  });

  it('10 km → "10 km" (bez decimala)', () => {
    expect(formatirajUdaljenost(10)).toBe('10 km');
  });

  it('15.7 km → "16 km" (zaokruži)', () => {
    expect(formatirajUdaljenost(15.7)).toBe('16 km');
  });

  it('100 km → "100 km"', () => {
    expect(formatirajUdaljenost(100)).toBe('100 km');
  });
});

// ─── formatirajTrajanjePuta ───────────────────────────────────────────────────

describe('formatirajTrajanjePuta', () => {
  it('0 min → "< 1 min"', () => {
    expect(formatirajTrajanjePuta(0)).toBe('< 1 min');
  });

  it('0.9 min → "< 1 min"', () => {
    expect(formatirajTrajanjePuta(0.9)).toBe('< 1 min');
  });

  it('1 min → "1 min"', () => {
    expect(formatirajTrajanjePuta(1)).toBe('1 min');
  });

  it('15 min → "15 min"', () => {
    expect(formatirajTrajanjePuta(15)).toBe('15 min');
  });

  it('59 min → "59 min"', () => {
    expect(formatirajTrajanjePuta(59)).toBe('59 min');
  });

  it('tačno 60 min → "1h"', () => {
    expect(formatirajTrajanjePuta(60)).toBe('1h');
  });

  it('120 min → "2h"', () => {
    expect(formatirajTrajanjePuta(120)).toBe('2h');
  });

  it('90 min → "1h 30min"', () => {
    expect(formatirajTrajanjePuta(90)).toBe('1h 30min');
  });

  it('65 min → "1h 5min"', () => {
    expect(formatirajTrajanjePuta(65)).toBe('1h 5min');
  });

  it('125 min → "2h 5min"', () => {
    expect(formatirajTrajanjePuta(125)).toBe('2h 5min');
  });
});
