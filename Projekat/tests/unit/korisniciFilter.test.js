const {
  filtrirajKorisnikeListu,
  porukaPraznogStanjaKorisnika,
} = require('@/lib/admin/korisniciFilter');

const uzorak = [
  {
    imeIPrezime: 'Ana Test',
    email: 'ana.test@example.com',
    uloga: 'Korisnik usluge',
    status: 'aktivan',
    tip: 'korisnik',
  },
  {
    imeIPrezime: 'Marko Serviser',
    email: 'marko@firma.ba',
    uloga: 'Serviser',
    status: 'suspendovan',
    tip: 'uposlenik',
  },
  {
    imeIPrezime: 'Dina Dispecer',
    email: 'dina@firma.ba',
    uloga: 'Dispečer',
    status: 'aktivan',
    tip: 'uposlenik',
  },
];

describe('filtrirajKorisnikeListu', () => {
  test('pretraga po TEST u imenu', () => {
    const r = filtrirajKorisnikeListu(uzorak, {
      pretraga: 'TEST',
      status: 'svi',
      uloga: 'svi',
    });
    expect(r).toHaveLength(1);
    expect(r[0].imeIPrezime).toContain('Test');
  });

  test('nepostojeći upit vraća praznu listu', () => {
    const r = filtrirajKorisnikeListu(uzorak, {
      pretraga: 'NEPOSTOJECI_XYZ',
      status: 'svi',
      uloga: 'svi',
    });
    expect(r).toHaveLength(0);
  });

  test('filter statusa suspendovan', () => {
    const r = filtrirajKorisnikeListu(uzorak, {
      pretraga: '',
      status: 'suspendovan',
      uloga: 'svi',
    });
    expect(r).toHaveLength(1);
    expect(r[0].uloga).toBe('Serviser');
  });

  test('filter uloge serviser', () => {
    const r = filtrirajKorisnikeListu(uzorak, {
      pretraga: '',
      status: 'svi',
      uloga: 'serviser',
    });
    expect(r).toHaveLength(1);
  });
});

describe('porukaPraznogStanjaKorisnika', () => {
  test('poruka za pretragu bez rezultata', () => {
    expect(
      porukaPraznogStanjaKorisnika({
        pretraga: 'TEST',
        status: 'svi',
        uloga: 'svi',
        ukupno: 3,
      }),
    ).toMatch(/Nema rezultata/);
  });
});
