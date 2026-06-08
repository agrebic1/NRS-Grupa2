import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { sendEmail, kreirajEmailOdobrenja } from '@/lib/email/sendEmail';

export const dynamic = 'force-dynamic';

function getUlogaNaziv(uloga: unknown): string {
  if (!uloga) return '';
  if (Array.isArray(uloga))
    return (uloga[0] as { naziv?: string })?.naziv ?? '';
  return (uloga as { naziv?: string })?.naziv ?? '';
}

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Niste prijavljeni.' },
        { status: 401 },
      );
    }

    const db = supabase as any;

    // Provjeri admin pristup
    const { data: uposlenik } = await db
      .from('uposlenici')
      .select('uloga(naziv)')
      .eq('id_uposlenika', user.id)
      .maybeSingle();

    const naziv = getUlogaNaziv(uposlenik?.uloga);
    if (naziv !== 'Administrator' && naziv !== 'admin') {
      return NextResponse.json({ error: 'Nemate dozvolu.' }, { status: 403 });
    }

    // Dohvati aplikaciju
    const { data: aplikacija, error: greskaAplikacije } = await db
      .from('partner_applications')
      .select('*')
      .eq('id', params.id)
      .single();

    if (greskaAplikacije || !aplikacija) {
      return NextResponse.json(
        { error: 'Aplikacija nije pronađena.' },
        { status: 404 },
      );
    }

    if (aplikacija.status !== 'na_cekanju') {
      return NextResponse.json(
        { error: 'Aplikacija je već obrađena.' },
        { status: 400 },
      );
    }

    // Generiši privremenu lozinku: Temp[Godina]![Prezime]
    const godina = new Date().getFullYear();
    const privremenalozinka = `Temp${godina}!${aplikacija.last_name}`;

    const ulogaMetadata =
      aplikacija.service_type === 'serviser' ? 'Serviser' : 'Dispečer';

    // Kreiraj auth korisnika - zahtijeva service role key
    let adminClient: ReturnType<typeof createAdminClient>;
    try {
      adminClient = createAdminClient();
    } catch {
      return NextResponse.json(
        {
          error:
            'Odobrenje zahtijeva SUPABASE_SERVICE_ROLE_KEY. Dodajte ovu env varijablu u Vercel podešavanja.',
        },
        { status: 503 },
      );
    }

    const { data: authKorisnik, error: greskaKreiranja } =
      await adminClient.auth.admin.createUser({
        email: aplikacija.email,
        password: privremenalozinka,
        email_confirm: true,
        user_metadata: {
          ime: aplikacija.first_name,
          prezime: aplikacija.last_name,
          uloga: ulogaMetadata,
        },
      });

    if (greskaKreiranja || !authKorisnik.user) {
      return NextResponse.json(
        {
          error: greskaKreiranja?.message ?? 'Greška pri kreiranju korisnika.',
        },
        { status: 500 },
      );
    }

    // Postavi is_verified = true na novom uposleniku
    await db
      .from('uposlenici')
      .update({ is_verified: true })
      .eq('id_uposlenika', authKorisnik.user.id);

    // Ažuriraj status aplikacije
    await db
      .from('partner_applications')
      .update({ status: 'odobreno' })
      .eq('id', params.id);

    // Pošalji email s pristupnim podacima
    const emailHtml = kreirajEmailOdobrenja({
      ime: aplikacija.first_name,
      prezime: aplikacija.last_name,
      email: aplikacija.email,
      privremena_lozinka: privremenalozinka,
      uloga: ulogaMetadata,
    });

    const emailRezultat = await sendEmail({
      to: aplikacija.email,
      subject: 'Vaša prijava je odobrena - Pristupni podaci | InterServ',
      html: emailHtml,
    });

    if (!emailRezultat.success) {
      console.warn('[approve] Email nije poslan:', emailRezultat.greska);
    }

    return NextResponse.json({
      success: true,
      privremena_lozinka: privremenalozinka,
      korisnik_id: authKorisnik.user.id,
      email: aplikacija.email,
      email_poslan: emailRezultat.success,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Greška servera.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
