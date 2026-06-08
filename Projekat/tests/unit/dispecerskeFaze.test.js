const {
  normalizovanOperativniPrioritet,
  zahtjevJeNoviUPregleduDispecera,
  zahtjevJeUObradiUPregleduDispecera,
  zahtjevCekaDogovorTerminaDispecera,
  zahtjevCekaDodjeluServiseraDispecera,
  zahtjevCekaZavrsnuPotvrduCarobnjaka,
  uzmiDispecerskuFazuZaPregled,
  normalizujDispecerFilterIzParametra,
} = require('@/lib/servisirane/dispecerskeFaze');

function zahtjev(overrides = {}) {
  return {
    id: 1,
    user_id: 'u1',
    category: 'Vodoinstalacije',
    category_main: 'Vodoinstalacije',
    category_sub: 'Curenje',
    address: 'Test adresa',
    latitude: null,
    longitude: null,
    description: 'Opis kvara',
    contact_phone: '061111111',
    photo_url: null,
    is_premium: false,
    premium_terms_accepted: false,
    premium_requested_at: null,
    premium_priority_override_reason: null,
    status: 'pending_review',
    urgency_score: 40,
    system_score: 40,
    final_priority: null,
    rejection_reason: null,
    triage_json: null,
    preferred_schedule: null,
    cancel_reason: null,
    cancelled_at: null,
    is_verified_assigned: false,
    dispecer_agreed_schedule: null,
    serviser_dodijeljen_id: null,
    created_at: '2026-05-10T10:00:00Z',
    updated_at: '2026-05-10T10:00:00Z',
    ...overrides,
  };
}

describe('dispecerske faze pregleda', () => {
  test('normalizuje prazan operativni prioritet', () => {
    expect(normalizovanOperativniPrioritet(null)).toBeNull();
    expect(normalizovanOperativniPrioritet('   ')).toBeNull();
    expect(normalizovanOperativniPrioritet(' VISOKO ')).toBe('VISOKO');
  });

  test('zahtjev bez operativnog prioriteta je novi u pregledu', () => {
    const z = zahtjev({ status: 'na_cekanju', final_priority: null });

    expect(zahtjevJeNoviUPregleduDispecera(z)).toBe(true);
    expect(zahtjevJeUObradiUPregleduDispecera(z)).toBe(false);
    expect(uzmiDispecerskuFazuZaPregled(z)).toBe('ceka_operativni_prioritet');
  });

  test('zahtjev sa prioritetom ceka dogovor termina', () => {
    const z = zahtjev({ status: 'in_review', final_priority: 'SREDNJE' });

    expect(zahtjevJeUObradiUPregleduDispecera(z)).toBe(true);
    expect(zahtjevCekaDogovorTerminaDispecera(z)).toBe(true);
    expect(uzmiDispecerskuFazuZaPregled(z)).toBe('dogovor_termina');
  });

  test('zahtjev sa terminom ceka dodjelu servisera', () => {
    const z = zahtjev({
      status: 'in_review',
      final_priority: 'VISOKO',
      dispecer_agreed_schedule: {
        termini: [{ date: '2026-05-12', from: '08:00', to: '10:00' }],
      },
    });

    expect(zahtjevCekaDodjeluServiseraDispecera(z)).toBe(true);
    expect(uzmiDispecerskuFazuZaPregled(z)).toBe('dodjela_servisera');
  });

  test('zahtjev sa prioritetom terminom i serviserom ceka zavrsnu potvrdu', () => {
    const z = zahtjev({
      status: 'in_review',
      final_priority: 'HITNO',
      dispecer_agreed_schedule: {
        termini: [{ date: '2026-05-12', from: '10:00', to: '12:00' }],
      },
      serviser_dodijeljen_id: 'serviser-1',
    });

    expect(zahtjevCekaZavrsnuPotvrduCarobnjaka(z)).toBe(true);
    expect(uzmiDispecerskuFazuZaPregled(z)).toBe('konačna_potvrda');
  });

  test('normalizuje stare i nepoznate filtere na kanonske vrijednosti', () => {
    const dozvoljene = [
      'svi',
      'novi',
      'zakazivanje_termina',
      'dodjela_servisera',
      'korak_potvrde',
    ];

    expect(
      normalizujDispecerFilterIzParametra('ceka_prioritet', dozvoljene),
    ).toBe('novi');
    expect(normalizujDispecerFilterIzParametra('ceka_termin', dozvoljene)).toBe(
      'zakazivanje_termina',
    );
    expect(normalizujDispecerFilterIzParametra('nepoznato', dozvoljene)).toBe(
      'svi',
    );
    expect(normalizujDispecerFilterIzParametra(null, dozvoljene)).toBe('svi');
  });
});
