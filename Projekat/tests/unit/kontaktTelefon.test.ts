import {
  jeValidanKontaktTelefon,
  kontaktTelefonSchema,
  serviceRequestSchema,
  wizardKorak2Schema,
} from '@/lib/validations/servisirane';

describe('jeValidanKontaktTelefon', () => {
  const validni = [
    '+387 61 000 000',
    '061 000 000',
    '061000000',
    '033-123-456',
    '+38761234567',
    '(061) 123 456',
  ];

  test.each(validni)('prihvata ispravan broj "%s"', (broj) => {
    expect(jeValidanKontaktTelefon(broj)).toBe(true);
  });

  const neispravni: [string, string][] = [
    ['', 'prazno'],
    ['   ', 'samo razmaci'],
    ['---------', 'samo separatori, 0 cifara'],
    ['( ) - - - - -', 'separatori bez cifara'],
    ['12 34 56 78', 'samo 8 cifara'],
    ['0611234', '7 cifara'],
    ['abcdefghij', 'slova'],
    ['061/123/456', 'kosa crta nije dozvoljena'],
    ['1234567890123456', '16 cifara (previše)'],
  ];

  test.each(neispravni)('odbija "%s" (%s)', (broj) => {
    expect(jeValidanKontaktTelefon(broj)).toBe(false);
  });
});

describe('kontaktTelefonSchema', () => {
  test('odbija broj sa premalo cifara uz separatore', () => {
    const r = kontaktTelefonSchema.safeParse('12 34 56 78');
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.errors[0].message).toBe(
        'Unesite ispravan kontakt telefon.',
      );
    }
  });

  test('prazan unos vraća poruku o obaveznom polju', () => {
    const r = kontaktTelefonSchema.safeParse('');
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.errors[0].message).toBe('Unesite kontakt telefon.');
    }
  });

  test('prihvata ispravan broj', () => {
    expect(kontaktTelefonSchema.safeParse('+387 61 000 000').success).toBe(
      true,
    );
  });
});

describe('integracija sa wizard/zahtjev šemama', () => {
  test('wizardKorak2Schema odbija neispravan telefon', () => {
    const r = wizardKorak2Schema.safeParse({
      description: 'Validan opis zahtjeva sa dovoljno karaktera.',
      contactPhone: '---------',
    });
    expect(r.success).toBe(false);
  });

  test('serviceRequestSchema odbija telefon sa premalo cifara', () => {
    const r = serviceRequestSchema.safeParse({
      category: 'vodoinstalacije',
      address: 'Zmaja od Bosne 1',
      description: 'Validan opis zahtjeva sa dovoljno karaktera.',
      contact_phone: '12 34 56 78',
      triage: {
        opasnost: false,
        funkcionalnost: 'manja_smetnja',
        steta: false,
        ranjivost: false,
        obuhvat: false,
      },
    });
    expect(r.success).toBe(false);
  });
});
