import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import type { Database } from './domain/types/supabase';
import type { UserRole } from './domain/types';

const JAVNE_RUTE = [
  '/',
  '/auth/login',
  '/auth/callback',
  '/auth/registracija',
  '/auth/odabir-uloge',
  '/odabir-uloge',
  '/postani-partner',
] as const;

const ADMIN_PREFIX = '/admin';
const SERVISER_PREFIX = '/serviser';
const DISPECER_PREFIX = '/dispecer';
const KORISNIK_PREFIX = '/korisnik';
const PARTNER_APPLICATIONS_API = '/api/partner-applications';

function mapirajNazivUloge(naziv: string | null | undefined): UserRole | null {
  const normalizovanNaziv = naziv?.toLowerCase();

  switch (normalizovanNaziv) {
    case 'klijent':
    case 'korisnik':
    case 'korisnik usluge':
      return 'korisnik';
    case 'serviser':
      return 'serviser';
    case 'dispecer':
    case 'dispečer':
      return 'dispecer';
    case 'administrator':
    case 'admin':
      return 'admin';
    default:
      return null;
  }
}

export async function middleware(zahtjev: NextRequest) {
  let supabaseResponse = NextResponse.next({ request: zahtjev });
  const { pathname } = zahtjev.nextUrl;
  const { method } = zahtjev;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Gracefully skip auth if env vars aren't configured yet
  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  let user: { id: string } | null = null;
  let jeAdministrator = false;
  let jeServiser = false;
  let jeDispecer = false;
  let jeKorisnik = false;
  try {
    const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return zahtjev.cookies.getAll();
        },
        setAll(kolacici: { name: string; value: string; options: CookieOptions }[]) {
          kolacici.forEach(({ name, value }) => zahtjev.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request: zahtjev });
          kolacici.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    // Must use getUser(), not getSession() - prevents CSRF token spoofing
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;

    if (authUser) {
      const { data: korisnikUsluge, error: greskaKorisnikaUsluge } = await supabase
        .from('korisnik_usluge')
        .select('id_korisnika_usluge')
        .eq('id_korisnika_usluge', authUser.id)
        .maybeSingle();

      const { data: uposlenik, error: greskaUposlenika } = await supabase
        .from('uposlenici' as any)
        .select('id_uloge')
        .eq('id_uposlenika', authUser.id)
        .maybeSingle();

      let uposlenikUloga: UserRole | null = null;
      const idUloge = (uposlenik as { id_uloge?: number | null } | null)?.id_uloge;
      if (!greskaUposlenika && idUloge) {
        const { data: ulogaPodaci, error: greskaUloge } = await supabase
          .from('uloga' as any)
          .select('naziv')
          .eq('id_uloge', idUloge)
          .maybeSingle();

        if (!greskaUloge) {
          uposlenikUloga = mapirajNazivUloge(
            (ulogaPodaci as { naziv?: string | null } | null)?.naziv
          );
        }
      }

      // Fallback na postojece RPC funkcije ako relacijski upit ne vrati ulogu.
      if (!uposlenikUloga && (pathname.startsWith(ADMIN_PREFIX) || pathname.startsWith(SERVISER_PREFIX) || pathname.startsWith(DISPECER_PREFIX))) {
        if (pathname.startsWith(ADMIN_PREFIX)) {
          const { data: adminIzBaze, error } = await supabase.rpc('is_admin');
          jeAdministrator = !error && adminIzBaze === true;
        } else if (pathname.startsWith(SERVISER_PREFIX)) {
          const { data: serviserIzBaze, error } = await supabase.rpc('is_serviser');
          jeServiser = !error && serviserIzBaze === true;
        } else if (pathname.startsWith(DISPECER_PREFIX)) {
          const { data: dispecerIzBaze, error } = await supabase.rpc('is_dispecer');
          jeDispecer = !error && dispecerIzBaze === true;
        }
      } else {
        jeAdministrator = uposlenikUloga === 'admin';
        jeServiser = uposlenikUloga === 'serviser';
        jeDispecer = uposlenikUloga === 'dispecer';
      }

      // Korisnicka zona: korisnik_usluge profil ili zaposleni nalog (usklađeno s GET /api/auth/uloge).
      const imaKorisnikUslugu = !greskaKorisnikaUsluge && !!korisnikUsluge;
      const imaUposlenikZapis = !greskaUposlenika && !!uposlenik;
      jeKorisnik = imaKorisnikUslugu || imaUposlenikZapis;
    }
  } catch (error) {
    console.error('Middleware auth provjera nije uspjela:', error);
  }

  const jeJavnaRuta = JAVNE_RUTE.some(
    (ruta) => pathname === ruta || pathname.startsWith(ruta + '/')
  );
  const jeJavniApiZaPartnerAplikaciju =
    method === 'POST' &&
    (pathname === PARTNER_APPLICATIONS_API || pathname.startsWith(`${PARTNER_APPLICATIONS_API}/`));
  /** API rute moraju vratiti JSON (401/403), ne HTML redirect - inače klijent baca „Unexpected token '<'”. */
  const jeApiRuta = pathname.startsWith('/api/');

  if (!user && !jeJavnaRuta && !jeJavniApiZaPartnerAplikaciju && !jeApiRuta) {
    const loginUrl = new URL('/auth/login', zahtjev.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && pathname.startsWith(ADMIN_PREFIX)) {
    if (!jeAdministrator) {
      return NextResponse.redirect(new URL('/', zahtjev.url));
    }
  }

  if (user && pathname.startsWith(SERVISER_PREFIX)) {
    if (!jeServiser) {
      return NextResponse.redirect(new URL('/', zahtjev.url));
    }
  }

  if (user && pathname.startsWith(DISPECER_PREFIX)) {
    if (!jeDispecer) {
      return NextResponse.redirect(new URL('/', zahtjev.url));
    }
  }

  if (user && pathname.startsWith(KORISNIK_PREFIX)) {
    if (!jeKorisnik) {
      return NextResponse.redirect(new URL('/', zahtjev.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
