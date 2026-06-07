/**
 * MECE verifikacija operativne faze.
 * Svaki DB status → tačno jedna faza; intake i intervencija skupovi su disjunktni.
 */
import {
  operativnaFazaZahtjeva,
  jeZahtjevIntakeFaza,
  jeIntervencijaFaza,
  type OperativnaFaza,
} from '@/lib/servisirane/operativnaFaza';

// ─── Tip minimalnog zahtjeva za test ──────────────────────────────────────────

type MinZ = {
  status: string;
  final_priority?: string | null;
  serviser_odbio_razlog?: string | null;
};

function z(status: string, final_priority?: string | null, serviser_odbio_razlog?: string | null): MinZ {
  return { status, final_priority: final_priority ?? null, serviser_odbio_razlog: serviser_odbio_razlog ?? null };
}

// ─── Intake faze ──────────────────────────────────────────────────────────────

describe('operativnaFazaZahtjeva — intake', () => {
  it('pending_review bez prioriteta → novi', () => {
    expect(operativnaFazaZahtjeva(z('pending_review'))).toBe('novi');
  });

  it('na_cekanju bez prioriteta → novi', () => {
    expect(operativnaFazaZahtjeva(z('na_cekanju'))).toBe('novi');
  });

  it('in_review bez prioriteta → novi', () => {
    expect(operativnaFazaZahtjeva(z('in_review'))).toBe('novi');
  });

  it('pending_review s prioritetom → u_obradi', () => {
    expect(operativnaFazaZahtjeva(z('pending_review', 'VISOKO'))).toBe('u_obradi');
  });

  it('in_review s prioritetom → u_obradi', () => {
    expect(operativnaFazaZahtjeva(z('in_review', 'SREDNJE'))).toBe('u_obradi');
  });

  it('potvrdeno bez odbijanja → ceka_dodjelu', () => {
    expect(operativnaFazaZahtjeva(z('potvrdeno'))).toBe('ceka_dodjelu');
    expect(operativnaFazaZahtjeva(z('potvrdeno', 'VISOKO'))).toBe('ceka_dodjelu');
  });

  it('potvrdeno s razlogom odbijanja → odbijen_serviser', () => {
    expect(operativnaFazaZahtjeva(z('potvrdeno', 'VISOKO', 'Ne mogu doći'))).toBe('odbijen_serviser');
    expect(operativnaFazaZahtjeva(z('potvrdeno', null, 'Bolestan sam'))).toBe('odbijen_serviser');
  });
});

// ─── Intervencija faze ────────────────────────────────────────────────────────

describe('operativnaFazaZahtjeva — intervencija', () => {
  it('dodijeljeno → dodijeljeno', () => {
    expect(operativnaFazaZahtjeva(z('dodijeljeno'))).toBe('dodijeljeno');
  });

  it('u_radu → u_putu', () => {
    expect(operativnaFazaZahtjeva(z('u_radu'))).toBe('u_putu');
  });

  it('u_izvrsenju → na_terenu', () => {
    expect(operativnaFazaZahtjeva(z('u_izvrsenju'))).toBe('na_terenu');
  });

  it('zavrseno → ceka_zatvaranje', () => {
    expect(operativnaFazaZahtjeva(z('zavrseno'))).toBe('ceka_zatvaranje');
  });

  it('zatvoreno → zatvoreno', () => {
    expect(operativnaFazaZahtjeva(z('zatvoreno'))).toBe('zatvoreno');
  });
});

// ─── Terminalni statusi ───────────────────────────────────────────────────────

describe('operativnaFazaZahtjeva — terminalni', () => {
  it('otkazano → otkazano', () => {
    expect(operativnaFazaZahtjeva(z('otkazano'))).toBe('otkazano');
  });

  it('odbijeno → otkazano', () => {
    expect(operativnaFazaZahtjeva(z('odbijeno'))).toBe('otkazano');
  });

  it('nepoznat status → otkazano (sigurni fallback)', () => {
    expect(operativnaFazaZahtjeva(z('nepostojeci_status'))).toBe('otkazano');
  });
});

// ─── MECE dokaz: svaki status → tačno jedna faza ─────────────────────────────

describe('MECE: svaki status → tačno jedna faza, bez preklapanja', () => {
  const sviStatusi = [
    'pending_review', 'na_cekanju', 'in_review',
    'potvrdeno',
    'dodijeljeno', 'u_radu', 'u_izvrsenju', 'zavrseno', 'zatvoreno',
    'otkazano', 'odbijeno',
  ];

  const sveFaze: OperativnaFaza[] = [
    'novi', 'u_obradi', 'ceka_dodjelu', 'odbijen_serviser',
    'dodijeljeno', 'u_putu', 'na_terenu', 'ceka_zatvaranje',
    'zatvoreno', 'otkazano',
  ];

  it('svaki status mapira na jednu od definisanih faza', () => {
    for (const s of sviStatusi) {
      const faza = operativnaFazaZahtjeva(z(s));
      expect(sveFaze).toContain(faza);
    }
  });

  it('intake i intervencija skupovi su disjunktni (nijedna faza nije u oba)', () => {
    for (const faza of sveFaze) {
      const intake = jeZahtjevIntakeFaza(faza);
      const interv = jeIntervencijaFaza(faza);
      expect(intake && interv).toBe(false);
    }
  });

  it('in_review bez prioriteta → intake; s prioritetom → intake (uvijek zahtjev, nikad intervencija)', () => {
    const bezPri = operativnaFazaZahtjeva(z('in_review'));
    const sPri   = operativnaFazaZahtjeva(z('in_review', 'HITNO'));
    expect(jeZahtjevIntakeFaza(bezPri)).toBe(true);
    expect(jeZahtjevIntakeFaza(sPri)).toBe(true);
    expect(jeIntervencijaFaza(bezPri)).toBe(false);
    expect(jeIntervencijaFaza(sPri)).toBe(false);
  });

  it('potvrdeno uvijek intake, nikad intervencija', () => {
    const bezOdb = operativnaFazaZahtjeva(z('potvrdeno'));
    const sOdb   = operativnaFazaZahtjeva(z('potvrdeno', null, 'razlog'));
    expect(jeZahtjevIntakeFaza(bezOdb)).toBe(true);
    expect(jeZahtjevIntakeFaza(sOdb)).toBe(true);
    expect(jeIntervencijaFaza(bezOdb)).toBe(false);
    expect(jeIntervencijaFaza(sOdb)).toBe(false);
  });

  it('u_radu i u_izvrsenju su uvijek intervencija, nikad intake', () => {
    const uRadu = operativnaFazaZahtjeva(z('u_radu'));
    const uIzv  = operativnaFazaZahtjeva(z('u_izvrsenju'));
    expect(jeIntervencijaFaza(uRadu)).toBe(true);
    expect(jeIntervencijaFaza(uIzv)).toBe(true);
    expect(jeZahtjevIntakeFaza(uRadu)).toBe(false);
    expect(jeZahtjevIntakeFaza(uIzv)).toBe(false);
  });
});
