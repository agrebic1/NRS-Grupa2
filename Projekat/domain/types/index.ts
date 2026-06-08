// ─── Osnovni tipovi uloga ─────────────────────────────────────────────────────

export type UserRole = 'admin' | 'dispecer' | 'serviser' | 'korisnik';

export type StatusZahtjeva = 'novi' | 'u_obradi' | 'zavrsen';

export type StatusIntervencije = 'planirana' | 'u_toku' | 'zavrsena';

// ─── Konstante ────────────────────────────────────────────────────────────────

export const PREUSMJERANJE_PO_ULOZI: Record<UserRole, string> = {
  korisnik: '/korisnik',
  serviser: '/serviser',
  dispecer: '/dispecer',
  admin: '/admin',
} as const;

// ─── Domain interfejsi ────────────────────────────────────────────────────────

export interface ProfilKorisnika {
  id: string;
  ime: string;
  prezime: string;
  email: string;
  brojTelefona: string | null;
  adresa: string | null;
  uloga: UserRole;
}

export interface Lokacija {
  id_lokacije: number;
  adresa: string;
  grad: string;
  opcina: string;
  opis: string | null;
}

export interface Zahtjev {
  id_zahtjeva: number;
  opis_kvara: string | null;
  adresa: string | null;
  datum: string | null;
  id_kategorije_kvara: number | null;
  id_lokacije: number | null;
  id_statusa: number | null;
  id_korisnika_usluge: string | null;
  je_otkazan: boolean | null;
  razlog_otkazivanja: string | null;
  vrijeme: string | null;
}
