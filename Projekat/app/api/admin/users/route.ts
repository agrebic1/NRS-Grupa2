import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { formatirajDatumPrikaz } from '@/lib/format/datumi';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { sendEmail, kreirajEmailInternogNaloga } from '@/lib/email/sendEmail';
import { adminCreateUserSchema } from '@/lib/validations/servisirane';

export const dynamic = 'force-dynamic';

type StatusKorisnika = 'aktivan' | 'neaktivan' | 'suspendovan';

type PremiumLifecycleStatus = 'inactive' | 'pending_payment' | 'active' | 'expired' | 'cancelled';

type PremiumRedIzBaze = {
  id_korisnika_usluge: string;
  is_premium?: boolean | null;
  premium_status?: string | null;
  premium_started_at?: string | null;
  premium_expires_at?: string | null;
  premium_plan?: string | null;
  premium_cancelled_at?: string | null;
  premium_cancel_reason?: string | null;
};

interface ProfilKorisnika {
  id: string;
  ime: string | null;
  prezime: string | null;
  email: string | null;
  uloga: string | null;
  tip: 'korisnik' | 'uposlenik';
  is_premium?: boolean;
  premium_status?: PremiumLifecycleStatus;
  premium_started_at?: string | null;
  premium_expires_at?: string | null;
  premium_plan?: string | null;
  premium_cancelled_at?: string | null;
  premium_cancel_reason?: string | null;
}

function procitajNazivUloge(
  uloga: { naziv?: string | null } | { naziv?: string | null }[] | null | undefined,
  fallback: string
) {
  const zapis = Array.isArray(uloga) ? uloga[0] : uloga;
  return zapis?.naziv ?? fallback;
}

function formatirajDatum(vrijednost: string | null | undefined) {
  return formatirajDatumPrikaz(vrijednost ?? null, '-');
}

function odrediStatus(user: { banned_until?: string | null; email_confirmed_at?: string | null; confirmed_at?: string | null }): StatusKorisnika {
  if (user.banned_until && new Date(user.banned_until) > new Date()) {
    return 'suspendovan';
  }

  if (user.email_confirmed_at || user.confirmed_at) {
    return 'aktivan';
  }

  return 'neaktivan';
}

async function provjeriAdminPristup(db: any, idKorisnika: string) {
  const { data: uposlenik, error } = await db
    .from('uposlenici')
    .select('id_uloge')
    .eq('id_uposlenika', idKorisnika)
    .maybeSingle();

  if (error || !uposlenik?.id_uloge) return false;

  const { data: ulogaPodaci, error: ulogaError } = await db
    .from('uloga')
    .select('naziv')
    .eq('id_uloge', uposlenik.id_uloge)
    .maybeSingle();

  if (ulogaError) return false;

  const nazivUloge = procitajNazivUloge(ulogaPodaci, '');
  return nazivUloge === 'Administrator' || nazivUloge === 'admin';
}

function mapirajUlogu(role: 'serviser' | 'dispecer' | 'administrator') {
  if (role === 'serviser') return 'Serviser';
  if (role === 'dispecer') return 'Dispečer';
  return 'Administrator';
}

function generisiPrivremenuLozinku() {
  const godina = new Date().getFullYear();
  const randomPart = randomBytes(4).toString('hex');
  return `Temp${godina}!${randomPart}`;
}

async function upisiAdminCreateAudit(
  supabase: any,
  payload: {
    created_user_id: string | null;
    created_by_user_id: string;
    target_email: string;
    target_role: string;
    success: boolean;
    error_message?: string | null;
    email_sent?: boolean | null;
  }
) {
  await supabase.from('admin_user_create_audit').insert(payload);
}

export async function GET() {
  try {
    const supabaseSesija = createClient();
    const {
      data: { user },
    } = await supabaseSesija.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 });
    }

    const db = supabaseSesija as any;
    const jeAdmin = await provjeriAdminPristup(db, user.id);

    if (!jeAdmin) {
      return NextResponse.json({ error: 'Nemate dozvolu za pregled korisnika.' }, { status: 403 });
    }

    let supabase: ReturnType<typeof createAdminClient>;
    try {
      supabase = createAdminClient();
    } catch {
      return NextResponse.json(
        { error: 'Upravljanje korisnicima zahtijeva SUPABASE_SERVICE_ROLE_KEY. Lokalno: dodajte u .env.local. Na Vercel: dodajte u Project Settings → Environment Variables.' },
        { status: 503 }
      );
    }
    const adminDb = supabase as any;

    const [
      { data: authPodaci, error: authGreska },
      { data: korisnici, error: korisniciGreska },
      { data: premiumStatusi, error: premiumStatusiGreska },
      { data: uposlenici, error: uposleniciGreska },
      { data: uloge, error: ulogeGreska },
    ] =
      await Promise.all([
        supabase.auth.admin.listUsers({ page: 1, perPage: 1000 }),
        adminDb
          .from('v_korisnik_usluge')
          .select('id_korisnika_usluge, ime, prezime, email'),
        adminDb
          .from('korisnik_usluge')
          .select(
            'id_korisnika_usluge, is_premium, premium_status, premium_started_at, premium_expires_at, premium_plan, premium_cancelled_at, premium_cancel_reason'
          ),
        adminDb
          .from('v_uposlenici')
          .select('id_uposlenika, id_uloge, ime, prezime, email'),
        adminDb
          .from('uloga')
          .select('id_uloge, naziv'),
      ]);

    if (authGreska) {
      return NextResponse.json({ error: authGreska.message }, { status: 500 });
    }

    if (korisniciGreska) {
      return NextResponse.json({ error: korisniciGreska.message }, { status: 500 });
    }

    if (uposleniciGreska) {
      return NextResponse.json({ error: uposleniciGreska.message }, { status: 500 });
    }

    let premiumRedovi: PremiumRedIzBaze[] = (premiumStatusi as PremiumRedIzBaze[] | null) ?? [];
    if (premiumStatusiGreska) {
      const r2 = await adminDb
        .from('korisnik_usluge')
        .select('id_korisnika_usluge, is_premium, premium_status, premium_started_at, premium_expires_at, premium_plan');
      if (!r2.error && r2.data) {
        premiumRedovi = r2.data as PremiumRedIzBaze[];
      } else {
        const r3 = await adminDb.from('korisnik_usluge').select('id_korisnika_usluge, is_premium');
        if (r3.error) {
          return NextResponse.json({ error: premiumStatusiGreska.message }, { status: 500 });
        }
        premiumRedovi = (r3.data ?? []).map((row: any) => ({
          id_korisnika_usluge: row.id_korisnika_usluge,
          is_premium: row.is_premium,
          premium_status: row.is_premium ? 'active' : 'inactive',
          premium_started_at: null,
          premium_expires_at: null,
          premium_plan: null,
          premium_cancelled_at: null,
          premium_cancel_reason: null,
        }));
      }
    }

    if (ulogeGreska) {
      return NextResponse.json({ error: ulogeGreska.message }, { status: 500 });
    }

    const nazivUlogePoId = new Map<number, string>();
    for (const uloga of uloge ?? []) {
      nazivUlogePoId.set(uloga.id_uloge, uloga.naziv);
    }

    const premiumPoId = new Map<
      string,
      {
        is_premium: boolean;
        premium_status: PremiumLifecycleStatus;
        premium_started_at: string | null;
        premium_expires_at: string | null;
        premium_plan: string | null;
        premium_cancelled_at: string | null;
        premium_cancel_reason: string | null;
      }
    >();
    for (const r of premiumRedovi) {
      const st = (r.premium_status as PremiumLifecycleStatus | undefined) ?? 'inactive';
      premiumPoId.set(r.id_korisnika_usluge, {
        is_premium: Boolean(r.is_premium),
        premium_status: st,
        premium_started_at: r.premium_started_at ?? null,
        premium_expires_at: r.premium_expires_at ?? null,
        premium_plan: r.premium_plan ?? null,
        premium_cancelled_at: r.premium_cancelled_at ?? null,
        premium_cancel_reason: r.premium_cancel_reason ?? null,
      });
    }

    const profili = new Map<string, ProfilKorisnika>();

    for (const korisnik of korisnici ?? []) {
      const prem = premiumPoId.get(korisnik.id_korisnika_usluge);
      profili.set(korisnik.id_korisnika_usluge, {
        id: korisnik.id_korisnika_usluge,
        ime: korisnik.ime,
        prezime: korisnik.prezime,
        email: korisnik.email,
        uloga: 'Korisnik usluge',
        tip: 'korisnik',
        is_premium: prem?.is_premium ?? false,
        premium_status: prem?.premium_status ?? 'inactive',
        premium_started_at: prem?.premium_started_at ?? null,
        premium_expires_at: prem?.premium_expires_at ?? null,
        premium_plan: prem?.premium_plan ?? null,
        premium_cancelled_at: prem?.premium_cancelled_at ?? null,
        premium_cancel_reason: prem?.premium_cancel_reason ?? null,
      });
    }

    for (const uposlenik of uposlenici ?? []) {
      profili.set(uposlenik.id_uposlenika, {
        id: uposlenik.id_uposlenika,
        ime: uposlenik.ime,
        prezime: uposlenik.prezime,
        email: uposlenik.email,
        uloga: nazivUlogePoId.get(uposlenik.id_uloge) ?? 'Uposlenik',
        tip: 'uposlenik',
      });
    }

    const users = authPodaci.users.map((user) => {
      const profil = profili.get(user.id);
      const ime = profil?.ime ?? user.user_metadata?.ime ?? '';
      const prezime = profil?.prezime ?? user.user_metadata?.prezime ?? '';
      const imeIPrezime = `${ime} ${prezime}`.trim() || user.email || 'Nepoznat korisnik';

      return {
        id: user.id,
        imeIPrezime,
        email: profil?.email ?? user.email ?? '-',
        uloga: profil?.uloga ?? 'Bez uloge',
        status: odrediStatus(user),
        datumRegistracije: formatirajDatum(user.created_at),
        tip: profil?.tip ?? 'korisnik',
        isPremium: profil?.is_premium ?? false,
        premium_status: profil?.premium_status,
        premium_started_at: profil?.premium_started_at,
        premium_expires_at: profil?.premium_expires_at,
        premium_plan: profil?.premium_plan,
        premium_cancelled_at: profil?.premium_cancelled_at,
        premium_cancel_reason: profil?.premium_cancel_reason,
      };
    });

    return NextResponse.json({ users });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Nije moguce ucitati korisnike.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let actorId = '';
  let targetEmail = '';
  let targetRole = '';
  let createdUserId: string | null = null;

  try {
    const supabaseSesija = createClient();
    const {
      data: { user },
    } = await supabaseSesija.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 });
    }

    actorId = user.id;
    const jeAdmin = await provjeriAdminPristup(supabaseSesija as any, user.id);
    if (!jeAdmin) {
      return NextResponse.json({ error: 'Nemate dozvolu za kreiranje korisnika.' }, { status: 403 });
    }

    let supabase: ReturnType<typeof createAdminClient>;
    try {
      supabase = createAdminClient();
    } catch {
      return NextResponse.json(
        { error: 'Kreiranje korisnika zahtijeva SUPABASE_SERVICE_ROLE_KEY. Dodajte ovu env varijablu u Vercel podešavanja.' },
        { status: 503 }
      );
    }
    const body = await request.json();
    const parsed = adminCreateUserSchema.safeParse(body);
    if (!parsed.success) {
      const poruka = parsed.error.issues[0]?.message ?? 'Neispravni podaci za kreiranje internog naloga.';
      return NextResponse.json({ error: poruka }, { status: 400 });
    }

    const podaci = parsed.data;
    targetEmail = podaci.email.trim().toLowerCase();
    targetRole = mapirajUlogu(podaci.role);

    const sviKorisnici = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (sviKorisnici.error) {
      throw new Error(sviKorisnici.error.message);
    }

    const postojiKorisnik = sviKorisnici.data.users.some((u) => (u.email ?? '').toLowerCase() === targetEmail);
    if (postojiKorisnik) {
      await upisiAdminCreateAudit(supabase, {
        created_user_id: null,
        created_by_user_id: actorId,
        target_email: targetEmail,
        target_role: targetRole,
        success: false,
        error_message: 'Duplikat email adrese.',
        email_sent: false,
      });
      return NextResponse.json({ error: 'Korisnik sa ovom email adresom već postoji.' }, { status: 409 });
    }

    const privremenaLozinka = generisiPrivremenuLozinku();
    const createResult = await supabase.auth.admin.createUser({
      email: targetEmail,
      password: privremenaLozinka,
      email_confirm: true,
      user_metadata: {
        ime: podaci.first_name,
        prezime: podaci.last_name,
        uloga: targetRole,
      },
    });

    if (createResult.error || !createResult.data.user) {
      await upisiAdminCreateAudit(supabase, {
        created_user_id: null,
        created_by_user_id: actorId,
        target_email: targetEmail,
        target_role: targetRole,
        success: false,
        error_message: createResult.error?.message ?? 'Greška pri kreiranju korisnika.',
        email_sent: false,
      });
      return NextResponse.json(
        { error: createResult.error?.message ?? 'Greška pri kreiranju korisnika.' },
        { status: 500 }
      );
    }

    createdUserId = createResult.data.user.id;

    // Osiguraj da zaposleni ima korisnik_usluge zapis kako bi mogao koristiti
    // sistem i u ulozi korisnika (odabir-uloge prikazuje oba izbora).
    // handle_new_user trigger kreira uposlenici zapis; korisnik_usluge mora biti eksplicitno dodat.
    await (supabase as any).from('korisnik_usluge').upsert(
      { id_korisnika_usluge: createdUserId },
      { onConflict: 'id_korisnika_usluge', ignoreDuplicates: true }
    );

    const emailHtml = kreirajEmailInternogNaloga({
      ime: podaci.first_name,
      prezime: podaci.last_name,
      email: targetEmail,
      privremena_lozinka: privremenaLozinka,
      uloga: targetRole,
    });

    const emailRezultat = await sendEmail({
      to: targetEmail,
      subject: 'InterServ - Kreiran interni korisnicki nalog',
      html: emailHtml,
    });

    await upisiAdminCreateAudit(supabase, {
      created_user_id: createdUserId,
      created_by_user_id: actorId,
      target_email: targetEmail,
      target_role: targetRole,
      success: true,
      error_message: emailRezultat.success ? null : emailRezultat.greska ?? 'Email nije poslan.',
      email_sent: emailRezultat.success,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: createdUserId,
        email: targetEmail,
        role: targetRole,
      },
      privremena_lozinka: privremenaLozinka,
      email_poslan: emailRezultat.success,
    });
  } catch (error) {
    if (actorId && targetEmail && targetRole) {
      try {
        const supabase = createAdminClient();
        await upisiAdminCreateAudit(supabase, {
          created_user_id: createdUserId,
          created_by_user_id: actorId,
          target_email: targetEmail,
          target_role: targetRole,
          success: false,
          error_message: error instanceof Error ? error.message : 'Neočekivana greška pri kreiranju korisnika.',
          email_sent: false,
        });
      } catch {
        // audit nije kritičan - nastavi s greškom
      }
    }
    const message = error instanceof Error ? error.message : 'Neočekivana greška pri kreiranju korisnika.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
