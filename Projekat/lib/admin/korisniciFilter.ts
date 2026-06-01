import type { StatusKorisnika } from '@/lib/admin/statusKorisnika';

export type KorisnikZaFilter = {
  imeIPrezime: string;
  email: string;
  uloga: string;
  status: StatusKorisnika;
  tip: 'korisnik' | 'uposlenik';
};

export type StatusFilterKorisnika = 'svi' | StatusKorisnika;
export type UlogaFilterKorisnika =
  | 'svi'
  | 'korisnik_usluge'
  | 'serviser'
  | 'dispecer'
  | 'administrator';

export function korisnikOdgovaraUlozi(
  korisnik: KorisnikZaFilter,
  filter: UlogaFilterKorisnika,
): boolean {
  if (filter === 'svi') return true;
  if (filter === 'korisnik_usluge') return korisnik.tip === 'korisnik';
  const u = korisnik.uloga.toLowerCase();
  if (filter === 'serviser') return u.includes('serviser');
  if (filter === 'dispecer') return u.includes('dispe');
  if (filter === 'administrator') return u.includes('admin');
  return true;
}

/** US-19: pretraga po imenu/emailu/ulozi + filter statusa i uloge. */
export function filtrirajKorisnikeListu<T extends KorisnikZaFilter>(
  korisnici: T[],
  opts: {
    pretraga: string;
    status: StatusFilterKorisnika;
    uloga: UlogaFilterKorisnika;
  },
): T[] {
  let lista = korisnici;

  if (opts.status !== 'svi') {
    lista = lista.filter((k) => k.status === opts.status);
  }

  if (opts.uloga !== 'svi') {
    lista = lista.filter((k) => korisnikOdgovaraUlozi(k, opts.uloga));
  }

  const termin = opts.pretraga.trim().toLowerCase();
  if (!termin) return lista;

  return lista.filter(
    (k) =>
      k.imeIPrezime.toLowerCase().includes(termin) ||
      k.email.toLowerCase().includes(termin) ||
      k.uloga.toLowerCase().includes(termin),
  );
}

export function porukaPraznogStanjaKorisnika(opts: {
  pretraga: string;
  status: StatusFilterKorisnika;
  uloga: UlogaFilterKorisnika;
  ukupno: number;
}): string {
  if (opts.ukupno === 0) {
    return 'Nema korisničkih naloga u sistemu.';
  }
  if (opts.pretraga.trim()) {
    return `Nema rezultata za upit „${opts.pretraga.trim()}". Pokušajte drugi pojam ili resetujte filtere.`;
  }
  if (opts.status !== 'svi' || opts.uloga !== 'svi') {
    return 'Nema korisnika koji odgovaraju odabranim filterima.';
  }
  return 'Nema korisnika za prikaz.';
}
