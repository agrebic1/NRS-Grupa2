import { kreirajKlijenta } from '@/lib/supabase/klijent';
import type { UserRole } from '@/domain/types';
import { PREUSMJERANJE_PO_ULOZI } from '@/domain/types';
import {
  PORUKA_RATE_LIMIT_PRIJAVA,
  mapirajGreskuPrijaveSupabase,
} from '@/lib/auth/greskaPrijave';
import {
  clearLoginRateLimit,
  isLoginBlocked,
  recordFailedLoginAttempt,
} from '@/lib/security/loginRateLimiter';
import { getAuthEmailRedirectUrl } from '@/lib/auth/emailRedirect';

function normalizujEmail(email: string) {
  return email
    .trim()
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width characters copied from rich text.
    .replace(/[“”„‟"']/g, '') // Remove straight and smart quotes anywhere in the value.
    .replace(/\s+/g, ''); // Remove accidental spaces inside/outside email.
}

function jeEmailValidan(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function mapirajAuthGresku(greska: {
  message: string;
  status?: number;
  code?: string;
}) {
  const poruka = greska.message?.toLowerCase() ?? '';

  if (
    greska.status === 429 ||
    poruka.includes('too many requests') ||
    poruka.includes('rate limit')
  ) {
    return 'Previše pokušaja registracije. Sačekajte 1-2 minute i pokušajte ponovo.';
  }

  if (
    poruka.includes('already registered') ||
    poruka.includes('already exists') ||
    poruka.includes('user already') ||
    poruka.includes('email address is already')
  ) {
    return 'Nalog sa ovom email adresom već postoji. Koristite prijavu ili reset lozinke.';
  }

  return greska.message;
}

function mapirajResendGresku(greska: { message: string; status?: number }) {
  const poruka = greska.message?.toLowerCase() ?? '';

  if (
    greska.status === 429 ||
    poruka.includes('too many') ||
    poruka.includes('rate limit')
  ) {
    return 'Previše zahtjeva za novi link. Sačekajte nekoliko minuta i pokušajte ponovo.';
  }

  if (poruka.includes('redirect') || poruka.includes('redirect_to')) {
    return 'Potvrda emaila trenutno nije dostupna zbog konfiguracije preusmjeravanja. Kontaktirajte podršku.';
  }

  if (
    poruka.includes('already confirmed') ||
    poruka.includes('already verified') ||
    poruka.includes('email confirmed')
  ) {
    return 'Email je već potvrđen. Prijavite se na nalog.';
  }

  return 'Slanje verifikacijskog emaila nije uspjelo. Pokušajte ponovo.';
}

// Prijava

export async function prijaviSeEmailom(podaci: {
  email: string;
  lozinka: string;
}) {
  const supabase = kreirajKlijenta();
  const email = normalizujEmail(podaci.email);

  if (isLoginBlocked(email)) {
    throw new Error(PORUKA_RATE_LIMIT_PRIJAVA);
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: podaci.lozinka,
  });

  if (error) {
    const { poruka, evidentirajNeuspjesanPokusaj } =
      mapirajGreskuPrijaveSupabase(error);
    if (evidentirajNeuspjesanPokusaj) recordFailedLoginAttempt(email);
    throw new Error(poruka);
  }

  clearLoginRateLimit(email);
  return data;
}

export async function posaljiPonovoVerifikacijskiEmail(emailAdresa: string) {
  const supabase = kreirajKlijenta();
  const email = normalizujEmail(emailAdresa);

  if (!jeEmailValidan(email)) {
    throw new Error('Unesite ispravnu email adresu.');
  }

  const emailRedirectTo = getAuthEmailRedirectUrl();
  if (!emailRedirectTo) {
    throw new Error(
      'Potvrda emaila nije konfigurisana (NEXT_PUBLIC_SITE_URL).',
    );
  }

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo,
    },
  });

  if (error) {
    throw new Error(mapirajResendGresku(error));
  }
}

/** Baciti kada je nalog kreiran ali prijava traži potvrdu emaila (npr. Supabase Email confirmations). */
export class PotrebnaPotvrdaEmailaError extends Error {
  readonly email: string;

  constructor(email: string) {
    super(
      'Na vašu adresu poslan je link za potvrdu naloga. Otvorite inbox, potvrdite nalog, pa se prijavite.',
    );
    this.name = 'PotrebnaPotvrdaEmailaError';
    this.email = email;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// Registracija (samo Korisnik usluge)

export async function registrujKorisnika(podaci: {
  ime: string;
  prezime: string;
  email: string;
  telefon: string;
  lozinka: string;
}) {
  const supabase = kreirajKlijenta();
  const email = normalizujEmail(podaci.email);
  if (!jeEmailValidan(email)) {
    throw new Error('Unesite ispravnu email adresu.');
  }

  const emailRedirectTo = getAuthEmailRedirectUrl();

  const { data: authPodaci, error: greskaAuth } = await supabase.auth.signUp({
    email,
    password: podaci.lozinka,
    options: {
      // DB trigger reads these from raw_user_meta_data and inserts into osoba + odgovarajuci subtype
      data: { ime: podaci.ime, prezime: podaci.prezime, uloga: 'Klijent' },
      ...(emailRedirectTo ? { emailRedirectTo } : {}),
    },
  });

  if (greskaAuth) throw new Error(mapirajAuthGresku(greskaAuth));
  if (!authPodaci.user) throw new Error('Kreiranje naloga nije uspjelo');

  const identities = authPodaci.user.identities ?? [];
  const jeMaskiraniDuplikat =
    authPodaci.session == null &&
    authPodaci.user.email?.toLowerCase() === email &&
    Array.isArray(identities) &&
    identities.length === 0;

  // Supabase za postojeći email može vratiti "uspjeh" bez error-a (anti-enumeration).
  if (jeMaskiraniDuplikat) {
    throw new Error(
      'Nalog sa ovom email adresom već postoji. Koristite prijavu ili reset lozinke.',
    );
  }

  let sesija = authPodaci.session;
  let korisnik = authPodaci.user;

  if (!sesija) {
    const { data: prijavaPodaci, error: greskaPrijava } =
      await supabase.auth.signInWithPassword({
        email,
        password: podaci.lozinka,
      });

    if (greskaPrijava) {
      const sy = greskaPrijava.message?.toLowerCase() ?? '';
      if (sy.includes('email not confirmed') || sy.includes('not confirmed')) {
        throw new PotrebnaPotvrdaEmailaError(email);
      }
      const { poruka, evidentirajNeuspjesanPokusaj } =
        mapirajGreskuPrijaveSupabase(greskaPrijava);
      if (evidentirajNeuspjesanPokusaj) recordFailedLoginAttempt(email);
      throw new Error(poruka);
    }

    sesija = prijavaPodaci.session;
    korisnik = prijavaPodaci.user ?? korisnik;
  }

  clearLoginRateLimit(email);

  // Trigger kreira osobu; broj telefona se sada cuva u tabeli osoba (nakon sesije radi RLS).
  await supabase
    .from('osoba')
    .update({ broj_telefona: podaci.telefon })
    .eq('id_osobe', korisnik.id);

  return { user: korisnik, session: sesija };
}

// Detekcija uloga

function mapirajNazivUloge(naziv: string | null | undefined): UserRole | null {
  const normalizovanNaziv = naziv?.toLowerCase();

  switch (normalizovanNaziv) {
    case 'klijent':
    case 'korisnik':
    case 'korisnik usluge':
      return 'korisnik';
    case 'serviser':
      return 'serviser';
    case 'dispečer':
    case 'dispecer':
      return 'dispecer';
    case 'administrator':
    case 'admin':
      return 'admin';
    default:
      return null;
  }
}

export async function getUlogeKorisnika(
  idKorisnika: string,
): Promise<UserRole[]> {
  const supabase = kreirajKlijenta();
  const pronadjeneUloge: UserRole[] = [];

  try {
    const odgovor = await fetch('/api/auth/uloge', { cache: 'no-store' });
    const podaci = await odgovor.json();

    if (odgovor.ok && Array.isArray(podaci.uloge)) {
      return podaci.uloge;
    }
  } catch {
    // Ako server ruta nije dostupna, nastavi sa direktnom provjerom ispod.
  }

  // Provjera korisnik_usluge i uposlenici tabela (isto kao /api/auth/uloge).
  const { data: korisnikUsluge } = await supabase
    .from('korisnik_usluge')
    .select('id_korisnika_usluge')
    .eq('id_korisnika_usluge', idKorisnika)
    .maybeSingle();

  const { data: uposlenik } = await supabase
    .from('uposlenici')
    .select('id_uloge')
    .eq('id_uposlenika', idKorisnika)
    .maybeSingle();

  // Zaposleni uvijek imaju i opciju korištenja sistema kao korisnik usluge,
  // pa stranica za odabir uloge može ponuditi oba izbora.
  if (korisnikUsluge || uposlenik) {
    pronadjeneUloge.push('korisnik');
  }

  if (uposlenik?.id_uloge) {
    const { data: ulogaPodaci } = await supabase
      .from('uloga')
      .select('naziv')
      .eq('id_uloge', uposlenik.id_uloge)
      .maybeSingle();

    const uloga = mapirajNazivUloge(ulogaPodaci?.naziv);

    if (uloga && !pronadjeneUloge.includes(uloga)) {
      pronadjeneUloge.push(uloga);
    }
  }

  return pronadjeneUloge;
}

// Određivanje redirect-a nakon prijave

export async function odrediRedirectNakonPrijave(
  idKorisnika: string,
): Promise<string> {
  const uloge = await getUlogeKorisnika(idKorisnika);

  // Jedna uloga → direktno na odgovarajući dashboard
  if (uloge.length === 1) return PREUSMJERANJE_PO_ULOZI[uloge[0]];

  // Više uloga ILI nema uloga → stranica za odabir (ona obrađuje oba slučaja)
  return '/odabir-uloge';
}

// Session helpers

export async function odjaviSe() {
  const supabase = kreirajKlijenta();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error('Greška pri odjavi iz sistema');
}

export async function getTrenutnogKorisnika() {
  const supabase = kreirajKlijenta();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
