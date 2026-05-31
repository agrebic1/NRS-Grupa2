import {
  prosjek,
  raspodjelaPoStatusu,
  jeSlaIspunjen,
  slaRaspodjela,
  opterecenjePoServiseru,
  ponovniCiklusiMetrika,
  trendZavrsenih,
  sastaviMetrike,
} from '@/lib/servisirane/analitikaMetrike';
import type { AnalitikaZahtjevRed } from '@/lib/servisirane/analitikaMetrike';

function zahtjev(over: Partial<AnalitikaZahtjevRed> & { id: number }): AnalitikaZahtjevRed {
  return {
    status:                 'na_cekanju',
    final_priority:         null,
    created_at:             '2026-05-01T08:00:00.000Z',
    updated_at:             '2026-05-01T09:00:00.000Z',
    serviser_dodijeljen_id: null,
    broj_ponovnih_ciklusa:  0,
    ...over,
  };
}

describe('prosjek', () => {
  test('null za prazan niz', () => {
    expect(prosjek([])).toBeNull();
  });
  test('zaokružen prosjek', () => {
    expect(prosjek([10, 20, 31])).toBe(20); // 61/3 = 20.33 → 20
  });
});

describe('raspodjelaPoStatusu', () => {
  test('broji i sortira silazno', () => {
    const r = raspodjelaPoStatusu([
      { status: 'zavrseno' },
      { status: 'u_radu' },
      { status: 'zavrseno' },
      { status: 'zavrseno' },
    ]);
    expect(r[0]).toEqual({ status: 'zavrseno', broj: 3 });
    expect(r[1]).toEqual({ status: 'u_radu', broj: 1 });
  });
});

describe('jeSlaIspunjen', () => {
  test('null kad nema prioriteta', () => {
    expect(jeSlaIspunjen(null, '2026-05-01T00:00:00Z', '2026-05-01T01:00:00Z')).toBeNull();
  });
  test('true kad je unutar roka (SREDNJE = 24h)', () => {
    expect(jeSlaIspunjen('SREDNJE', '2026-05-01T00:00:00Z', '2026-05-01T10:00:00Z')).toBe(true);
  });
  test('false kad je prekoračen rok (VISOKO = 8h)', () => {
    expect(jeSlaIspunjen('VISOKO', '2026-05-01T00:00:00Z', '2026-05-02T00:00:00Z')).toBe(false);
  });
});

describe('slaRaspodjela', () => {
  test('grupiše na_vrijeme / prekoraceno / bez_podataka', () => {
    const r = slaRaspodjela([
      zahtjev({ id: 1, final_priority: 'SREDNJE', created_at: '2026-05-01T00:00:00Z', updated_at: '2026-05-01T05:00:00Z' }), // ok
      zahtjev({ id: 2, final_priority: 'VISOKO',  created_at: '2026-05-01T00:00:00Z', updated_at: '2026-05-03T00:00:00Z' }), // prekoraceno
      zahtjev({ id: 3, final_priority: null }), // bez podataka
    ]);
    expect(r).toEqual({ na_vrijeme: 1, prekoraceno: 1, bez_podataka: 1 });
  });
});

describe('opterecenjePoServiseru', () => {
  test('broji aktivne i završene po serviseru', () => {
    const svi = [
      zahtjev({ id: 1, status: 'u_radu',      serviser_dodijeljen_id: 's1' }),
      zahtjev({ id: 2, status: 'dodijeljeno', serviser_dodijeljen_id: 's1' }),
      zahtjev({ id: 3, status: 'na_cekanju',  serviser_dodijeljen_id: null }),
    ];
    const zavrseni = [
      zahtjev({ id: 4, status: 'zavrseno', serviser_dodijeljen_id: 's1' }),
      zahtjev({ id: 5, status: 'zavrseno', serviser_dodijeljen_id: 's2' }),
    ];
    const r = opterecenjePoServiseru(svi, zavrseni, { s1: 'Ana A', s2: 'Boris B' });
    const s1 = r.find((x) => x.serviser_id === 's1')!;
    expect(s1).toEqual({ serviser_id: 's1', ime: 'Ana A', aktivnih: 2, zavrsenih: 1 });
    expect(r.find((x) => x.serviser_id === 's2')!.zavrsenih).toBe(1);
    // s1 ima veće ukupno opterećenje → prvi u nizu
    expect(r[0].serviser_id).toBe('s1');
  });

  test('fallback ime kad serviser nije u mapi', () => {
    const r = opterecenjePoServiseru(
      [zahtjev({ id: 1, status: 'u_radu', serviser_dodijeljen_id: 'x' })],
      [],
      {},
    );
    expect(r[0].ime).toBe('Nepoznat serviser');
  });
});

describe('ponovniCiklusiMetrika', () => {
  test('broji zahtjeve s ponavljanjem i ukupne cikluse', () => {
    const r = ponovniCiklusiMetrika([
      { broj_ponovnih_ciklusa: 0 },
      { broj_ponovnih_ciklusa: 2 },
      { broj_ponovnih_ciklusa: 1 },
      { broj_ponovnih_ciklusa: null },
    ]);
    expect(r).toEqual({ zahtjeva_s_ponavljanjem: 2, ukupno_ciklusa: 3 });
  });
});

describe('trendZavrsenih', () => {
  test('grupiše po danu, sortirano uzlazno', () => {
    const r = trendZavrsenih([
      { updated_at: '2026-05-02T10:00:00Z' },
      { updated_at: '2026-05-01T08:00:00Z' },
      { updated_at: '2026-05-02T14:00:00Z' },
    ]);
    expect(r).toEqual([
      { datum: '2026-05-01', broj: 1 },
      { datum: '2026-05-02', broj: 2 },
    ]);
  });
});

describe('sastaviMetrike', () => {
  test('spaja sve metrike u jedan objekt', () => {
    const svi = [
      zahtjev({ id: 1, status: 'u_radu', serviser_dodijeljen_id: 's1', broj_ponovnih_ciklusa: 1 }),
      zahtjev({ id: 2, status: 'na_cekanju' }),
    ];
    const zavrseni = [
      zahtjev({ id: 3, status: 'zavrseno', serviser_dodijeljen_id: 's1', final_priority: 'SREDNJE', created_at: '2026-05-01T00:00:00Z', updated_at: '2026-05-01T03:00:00Z' }),
    ];
    const m = sastaviMetrike({
      period:           { od: '2026-05-01', do: '2026-05-31' },
      sviZahtjevi:      svi,
      zavrseniZahtjevi: zavrseni,
      trajanjaMinuta:   [60, 120],
      odziviMinuta:     [10, 20],
      imenaServisera:   { s1: 'Ana A' },
    });
    expect(m.ukupno_zahtjeva).toBe(2);
    expect(m.ukupno_zavrsenih).toBe(1);
    expect(m.avg_trajanje_minuta).toBe(90);
    expect(m.avg_odziv_minuta).toBe(15);
    expect(m.sla.na_vrijeme).toBe(1);
    expect(m.ponovni_ciklusi.ukupno_ciklusa).toBe(1);
    expect(m.opterecenje_servisera[0].serviser_id).toBe('s1');
  });
});
