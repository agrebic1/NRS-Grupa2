const {
  prijavnaShema,
  registracijskaShema,
  ZAHTJEVI_LOZINKE,
} = require('@/lib/validations/authValidation');

describe('authValidation', () => {
  test('prijavnaShema accepts valid input and normalizes email', () => {
    const parsed = prijavnaShema.parse({
      email: '  "USER@Example.COM"  ',
      lozinka: 'secret',
    });

    expect(parsed.email).toBe('user@example.com');
  });

  test('prijavnaShema rejects invalid email', () => {
    const result = prijavnaShema.safeParse({
      email: 'not-an-email',
      lozinka: 'abc',
    });
    expect(result.success).toBe(false);
  });

  test('registracijskaShema rejects weak password and mismatch', () => {
    const weak = registracijskaShema.safeParse({
      ime: 'Ime',
      prezime: 'Prezime',
      email: 'user@example.com',
      telefon: '+38761111222',
      lozinka: 'abc123',
      potvrdaLozinke: 'abc123',
    });
    const mismatch = registracijskaShema.safeParse({
      ime: 'Ime',
      prezime: 'Prezime',
      email: 'user@example.com',
      telefon: '+38761111222',
      lozinka: 'Abcd123!',
      potvrdaLozinke: 'Abcd123!x',
    });
    expect(weak.success).toBe(false);
    expect(mismatch.success).toBe(false);
  });

  test('password requirement helpers evaluate each rule', () => {
    const checks = Object.fromEntries(
      ZAHTJEVI_LOZINKE.map((rule) => [rule.id, rule.provjeri('Abcd123!')]),
    );
    expect(checks).toEqual({
      duzina: true,
      veliko: true,
      malo: true,
      broj: true,
      poseban: true,
    });
  });
});
