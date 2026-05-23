import {
  izracunajUrgency,
  kategorizirajHitnost,
  efektivniKorisnickiUrgencyScore,
  URGENCY_SCORE_MAKS,
} from '@/lib/servisirane/urgency';
import type { TriageOdgovori } from '@/domain/types/servisirane';

const PRAZNA_TRIJAZA: TriageOdgovori = {
  opasnost:       false,
  funkcionalnost: 'manja_smetnja',
  steta:          false,
  ranjivost:      false,
  obuhvat:        false,
};

const PUNA_TRIJAZA: TriageOdgovori = {
  opasnost:       true,
  funkcionalnost: 'potpuni_prekid',
  steta:          true,
  ranjivost:      true,
  obuhvat:        true,
};

describe('izracunajUrgency', () => {
  it('vraća 0 za praznu trijažu', () => {
    expect(izracunajUrgency(PRAZNA_TRIJAZA)).toBe(0);
  });

  it('vraća maksimum (110) za potpunu trijažu', () => {
    expect(izracunajUrgency(PUNA_TRIJAZA)).toBe(110);
  });

  it('dodaje 50 boda samo za opasnost', () => {
    expect(izracunajUrgency({ ...PRAZNA_TRIJAZA, opasnost: true })).toBe(50);
  });

  it('dodaje 25 boda za potpuni_prekid funkcionalnosti', () => {
    expect(izracunajUrgency({ ...PRAZNA_TRIJAZA, funkcionalnost: 'potpuni_prekid' })).toBe(25);
  });

  it('dodaje 10 boda za otezanu funkcionalnost', () => {
    expect(izracunajUrgency({ ...PRAZNA_TRIJAZA, funkcionalnost: 'otezana' })).toBe(10);
  });

  it('dodaje 15 boda za steta', () => {
    expect(izracunajUrgency({ ...PRAZNA_TRIJAZA, steta: true })).toBe(15);
  });

  it('dodaje 10 boda za ranjivost', () => {
    expect(izracunajUrgency({ ...PRAZNA_TRIJAZA, ranjivost: true })).toBe(10);
  });

  it('dodaje 10 boda za obuhvat', () => {
    expect(izracunajUrgency({ ...PRAZNA_TRIJAZA, obuhvat: true })).toBe(10);
  });

  it('kombinacija opasnost + steta = 65 (VISOKO nivo)', () => {
    expect(izracunajUrgency({ ...PRAZNA_TRIJAZA, opasnost: true, steta: true })).toBe(65);
  });

  it('ne prelazi URGENCY_SCORE_MAKS (110)', () => {
    expect(izracunajUrgency(PUNA_TRIJAZA)).toBeLessThanOrEqual(URGENCY_SCORE_MAKS);
  });
});

describe('kategorizirajHitnost', () => {
  it('score >= 80 → KRITIČNO', () => {
    expect(kategorizirajHitnost(80)).toBe('KRITIČNO');
    expect(kategorizirajHitnost(110)).toBe('KRITIČNO');
    expect(kategorizirajHitnost(100)).toBe('KRITIČNO');
  });

  it('score 79 → VISOKO (granična vrijednost ispod KRITIČNO)', () => {
    expect(kategorizirajHitnost(79)).toBe('VISOKO');
  });

  it('score >= 50 i < 80 → VISOKO', () => {
    expect(kategorizirajHitnost(50)).toBe('VISOKO');
    expect(kategorizirajHitnost(65)).toBe('VISOKO');
  });

  it('score 49 → SREDNJE (granična vrijednost ispod VISOKO)', () => {
    expect(kategorizirajHitnost(49)).toBe('SREDNJE');
  });

  it('score >= 20 i < 50 → SREDNJE', () => {
    expect(kategorizirajHitnost(20)).toBe('SREDNJE');
    expect(kategorizirajHitnost(35)).toBe('SREDNJE');
  });

  it('score 19 → NISKO (granična vrijednost ispod SREDNJE)', () => {
    expect(kategorizirajHitnost(19)).toBe('NISKO');
  });

  it('score < 20 → NISKO', () => {
    expect(kategorizirajHitnost(0)).toBe('NISKO');
    expect(kategorizirajHitnost(10)).toBe('NISKO');
  });
});

describe('efektivniKorisnickiUrgencyScore', () => {
  it('premium korisnik uvijek dobija URGENCY_SCORE_MAKS', () => {
    expect(efektivniKorisnickiUrgencyScore({ is_premium: true, urgency_score: 0 }))
      .toBe(URGENCY_SCORE_MAKS);
    expect(efektivniKorisnickiUrgencyScore({ is_premium: true, urgency_score: 50 }))
      .toBe(URGENCY_SCORE_MAKS);
  });

  it('ne-premium korisnik dobija stvarni urgency_score', () => {
    expect(efektivniKorisnickiUrgencyScore({ is_premium: false, urgency_score: 65 })).toBe(65);
    expect(efektivniKorisnickiUrgencyScore({ is_premium: false, urgency_score: 0 })).toBe(0);
  });
});
