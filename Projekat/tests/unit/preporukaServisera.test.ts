import { haversineKm, izracunajPreporuke } from '@/lib/servisirane/preporukaServisera';
import type { ServiserZaDodjelu } from '@/domain/types/servisirane';

// ─── Pomoćni tvorac servisera ──────────────────────────────────────────────────

function serviser(over: Partial<ServiserZaDodjelu> & { id: string }): ServiserZaDodjelu {
  return {
    ime:               'Test',
    prezime:           'Serviser',
    is_verified:       true,
    aktivnih_zadataka: 0,
    specialnosti:      [],
    latitude:          null,
    longitude:         null,
    ...over,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// haversineKm
// ═══════════════════════════════════════════════════════════════════════════════

describe('haversineKm', () => {
  test('udaljenost iste tačke je 0', () => {
    expect(haversineKm(43.85, 18.41, 43.85, 18.41)).toBeCloseTo(0, 6);
  });

  test('1° geografske širine ≈ 111 km', () => {
    const d = haversineKm(0, 0, 1, 0);
    expect(d).toBeGreaterThan(110);
    expect(d).toBeLessThan(112);
  });

  test('simetrična je (A→B == B→A)', () => {
    const ab = haversineKm(43.8563, 18.4131, 43.3438, 17.8078);
    const ba = haversineKm(43.3438, 17.8078, 43.8563, 18.4131);
    expect(ab).toBeCloseTo(ba, 9);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// izracunajPreporuke — fallback bez koordinata (postojeći scoring se NE mijenja)
// ═══════════════════════════════════════════════════════════════════════════════

describe('izracunajPreporuke — bez koordinata (graceful fallback)', () => {
  test('udaljenost_km je null kad nema koordinata', () => {
    const [p] = izracunajPreporuke([serviser({ id: 'a' })]);
    expect(p.udaljenost_km).toBeNull();
  });

  test('verificiran + slobodan bez specijalnosti = 60 (35 opt + 25 ver)', () => {
    const [p] = izracunajPreporuke([
      serviser({ id: 'a', is_verified: true, aktivnih_zadataka: 0 }),
    ]);
    expect(p.score).toBe(60);
  });

  test('specijalista za kategoriju + verificiran + slobodan = 100', () => {
    const [p] = izracunajPreporuke(
      [serviser({ id: 'a', specialnosti: ['Vodoinstalacije'], is_verified: true })],
      { kategorija: 'vodoinstalacije' },
    );
    expect(p.score).toBe(100);
  });

  test('zahtjev ima koordinate, ali serviser nema → blizina se preskače', () => {
    const [p] = izracunajPreporuke([serviser({ id: 'a' })], {
      zahtjevLat: 43.85,
      zahtjevLng: 18.41,
    });
    expect(p.udaljenost_km).toBeNull();
    expect(p.score).toBe(60); // identično fallbacku
  });

  test('izuzeti serviseri se ne pojavljuju u rezultatu', () => {
    const res = izracunajPreporuke(
      [serviser({ id: 'a' }), serviser({ id: 'b' })],
      { izuzeti: ['a'] },
    );
    expect(res.map((r) => r.serviser.id)).toEqual(['b']);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// izracunajPreporuke — blizina uračunata kad obje strane imaju koordinate
// ═══════════════════════════════════════════════════════════════════════════════

describe('izracunajPreporuke — geo-preporuka (US-48)', () => {
  const opcije = { zahtjevLat: 0, zahtjevLng: 0 };

  test('bliži serviser dobija veći score od daljeg (uz inače jednake faktore)', () => {
    const res = izracunajPreporuke(
      [
        serviser({ id: 'blizu', latitude: 0, longitude: 0 }),       // 0 km
        serviser({ id: 'daleko', latitude: 0, longitude: 5 }),      // ~556 km
      ],
      opcije,
    );
    const blizu  = res.find((r) => r.serviser.id === 'blizu')!;
    const daleko = res.find((r) => r.serviser.id === 'daleko')!;

    expect(blizu.udaljenost_km).toBe(0);
    expect(daleko.udaljenost_km).toBeGreaterThan(100);
    expect(blizu.score).toBeGreaterThan(daleko.score);
  });

  test('najbliži serviser je rangiran prvi i ima razlog "Najbliži"', () => {
    const res = izracunajPreporuke(
      [
        serviser({ id: 'daleko', latitude: 0, longitude: 5 }),
        serviser({ id: 'blizu', latitude: 0, longitude: 0 }),
      ],
      opcije,
    );
    expect(res[0].serviser.id).toBe('blizu');
    expect(res[0].jePreporucen).toBe(true);
    expect(res[0].razlozi.some((r) => r.startsWith('Najbliži'))).toBe(true);
  });

  test('dalji serviser ima udaljenost u razlozima ali ne oznaku "Najbliži"', () => {
    const res = izracunajPreporuke(
      [
        serviser({ id: 'blizu', latitude: 0, longitude: 0 }),
        serviser({ id: 'daleko', latitude: 0, longitude: 5 }),
      ],
      opcije,
    );
    const daleko = res.find((r) => r.serviser.id === 'daleko')!;
    expect(daleko.razlozi.some((r) => r.endsWith('km'))).toBe(true);
    expect(daleko.razlozi.some((r) => r.startsWith('Najbliži'))).toBe(false);
  });

  test('miješano: serviser bez koordinata dobija null udaljenost, onaj s koordinatama dobija km', () => {
    const res = izracunajPreporuke(
      [
        serviser({ id: 'sa', latitude: 0, longitude: 0 }),
        serviser({ id: 'bez' }), // bez koordinata
      ],
      opcije,
    );
    const sa  = res.find((r) => r.serviser.id === 'sa')!;
    const bez = res.find((r) => r.serviser.id === 'bez')!;
    expect(sa.udaljenost_km).toBe(0);
    expect(bez.udaljenost_km).toBeNull();
  });
});
