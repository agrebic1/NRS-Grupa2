/** @jest-environment node */

const {
  labelOperativnogPrioriteta,
  nazivPoljaAktivnosti,
  prikazOpisaAktivnosti,
  prikazStareNoveVrijednostiAktivnosti,
  prikazVrijednostiAktivnosti,
} = require('@/lib/servisirane/aktivnostiPrikaz');

describe('aktivnostiPrikaz', () => {
  test('mapira status kodove na labele', () => {
    expect(prikazVrijednostiAktivnosti('u_radu')).toBe('Na putu');
    expect(prikazVrijednostiAktivnosti('dodijeljeno')).toBe('Dodijeljeno');
  });

  test('mapira prioritet na labele', () => {
    expect(labelOperativnogPrioriteta('VISOKO')).toBe('Visoko');
    expect(labelOperativnogPrioriteta(null)).toBe('Nije postavljen');
  });

  test('promjena izvršioca koristi imena iz metadata', () => {
    const a = {
      id: 1,
      zahtjev_id: 1,
      autor_id: 'd1',
      tip: 'promjena_izvrsioca',
      sadrzaj: 'x',
      metadata: {
        iz_servisera_ime: 'Stari Serviser',
        na_servisera_ime: 'Novi Serviser',
      },
      old_value: '00000000-0000-4000-8000-000000000001',
      new_value: '00000000-0000-4000-8000-000000000002',
      actor_role: 'dispecer',
      razlog: 'Preopterećen raspored',
      created_at: new Date().toISOString(),
    };
    expect(prikazStareNoveVrijednostiAktivnosti(a)).toEqual({
      stara: 'Stari Serviser',
      nova: 'Novi Serviser',
    });
    expect(prikazOpisaAktivnosti(a)).toContain('Preopterećen raspored');
    expect(nazivPoljaAktivnosti(a)).toBe('Izvršilac');
  });

  test('promjena prioriteta koristi labele iz metadata', () => {
    const a = {
      id: 3,
      zahtjev_id: 1,
      autor_id: 'd1',
      tip: 'promjena_prioriteta',
      sadrzaj: 'Operativni prioritet: Nisko → Visoko',
      metadata: {
        stari_prioritet: 'NISKO',
        novi_prioritet: 'VISOKO',
        stari_prioritet_label: 'Nisko',
        novi_prioritet_label: 'Visoko',
      },
      old_value: 'Nisko',
      new_value: 'Visoko',
      actor_role: 'dispecer',
      razlog: null,
      created_at: new Date().toISOString(),
    };
    expect(prikazStareNoveVrijednostiAktivnosti(a)).toEqual({
      stara: 'Nisko',
      nova: 'Visoko',
    });
    expect(nazivPoljaAktivnosti(a)).toBe('Operativni prioritet');
  });

  test('dodjela prikazuje ime servisera', () => {
    const a = {
      id: 4,
      zahtjev_id: 1,
      autor_id: 'd1',
      tip: 'dodjela',
      sadrzaj: 'Dodjela serviseru: Kenan Karić',
      metadata: {
        serviser_ime: 'Kenan Karić',
        iz: 'potvrdeno',
        u: 'dodijeljeno',
      },
      old_value: 'potvrdeno',
      new_value: 'Kenan Karić',
      actor_role: 'dispecer',
      razlog: null,
      created_at: new Date().toISOString(),
    };
    expect(prikazStareNoveVrijednostiAktivnosti(a).nova).toBe(
      'Dodijeljeno — Kenan Karić',
    );
  });
});
