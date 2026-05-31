import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { profilUpdateSchema } from '@/lib/validations/servisirane';

export const dynamic = 'force-dynamic';

type PremiumStatus = 'inactive' | 'pending_payment' | 'active' | 'expired' | 'cancelled';

export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 });
    }

    const db = supabase as any;

    const { data: osoba, error: greskaOsoba } = await db
      .from('osoba')
      .select('ime, prezime, broj_telefona, adresa, email, bazna_latitude, bazna_longitude')
      .eq('id_osobe', user.id)
      .maybeSingle();

    if (greskaOsoba) {
      return NextResponse.json({ error: greskaOsoba.message }, { status: 500 });
    }

    const uloge: string[] = [];
    let isVerified = false;

    let { data: korisnikUsluge, error: korisnikUslugeErr } = await db
      .from('korisnik_usluge')
      .select(
        'id_korisnika_usluge, is_premium, premium_status, premium_started_at, premium_expires_at, premium_plan, premium_cancelled_at, premium_cancel_reason'
      )
      .eq('id_korisnika_usluge', user.id)
      .maybeSingle();
    if (
      korisnikUslugeErr?.message?.includes("'premium_status' column") ||
      korisnikUslugeErr?.message?.includes('premium_cancelled_at')
    ) {
      const fallback = await db
        .from('korisnik_usluge')
        .select(
          'id_korisnika_usluge, is_premium, premium_status, premium_started_at, premium_expires_at, premium_plan'
        )
        .eq('id_korisnika_usluge', user.id)
        .maybeSingle();
      korisnikUsluge = fallback.data;
      korisnikUslugeErr = fallback.error;
    }
    if (korisnikUslugeErr?.message?.includes("'premium_status' column")) {
      const fallback = await db
        .from('korisnik_usluge')
        .select('id_korisnika_usluge, is_premium')
        .eq('id_korisnika_usluge', user.id)
        .maybeSingle();
      korisnikUsluge = fallback.data;
      korisnikUslugeErr = fallback.error;
    }
    if (korisnikUslugeErr?.message?.includes("'is_premium' column")) {
      const fallback = await db
        .from('korisnik_usluge')
        .select('id_korisnika_usluge')
        .eq('id_korisnika_usluge', user.id)
        .maybeSingle();
      korisnikUsluge = fallback.data;
      korisnikUslugeErr = fallback.error;
    }
    if (korisnikUslugeErr) {
      return NextResponse.json({ error: korisnikUslugeErr.message }, { status: 500 });
    }

    const premiumStatus = (korisnikUsluge?.premium_status as PremiumStatus | null | undefined) ?? 'inactive';
    const isPremium =
      premiumStatus === 'active' || (korisnikUsluge?.is_premium === true && !korisnikUsluge?.premium_status);

    if (korisnikUsluge) uloge.push('korisnik');

    const { data: uposlenik } = await db
      .from('uposlenici')
      .select('id_uloge, is_verified, uloga:uloga(naziv)')
      .eq('id_uposlenika', user.id)
      .maybeSingle();

    if (uposlenik) {
      isVerified = uposlenik.is_verified ?? false;
      const nazivi = Array.isArray(uposlenik.uloga)
        ? (uposlenik.uloga as { naziv: string }[]).map((u) => u.naziv)
        : uposlenik.uloga
        ? [(uposlenik.uloga as { naziv: string }).naziv]
        : [];

      for (const naziv of nazivi) {
        const n = naziv?.toLowerCase();
        if (n === 'serviser') uloge.push('serviser');
        else if (n === 'dispečer' || n === 'dispecer') uloge.push('dispecer');
        else if (n === 'administrator' || n === 'admin') uloge.push('admin');
      }
    }

    return NextResponse.json({
      profil: {
        id:            user.id,
        ime:           osoba?.ime ?? '',
        prezime:       osoba?.prezime ?? '',
        email:         osoba?.email ?? user.email ?? '',
        broj_telefona: osoba?.broj_telefona ?? null,
        adresa:        osoba?.adresa ?? null,
        bazna_latitude:  osoba?.bazna_latitude  ?? null,
        bazna_longitude: osoba?.bazna_longitude ?? null,
        uloge,
        is_verified:   isVerified,
        is_premium:    isPremium,
        premium_status: premiumStatus,
        premium_started_at: korisnikUsluge?.premium_started_at ?? null,
        premium_expires_at: korisnikUsluge?.premium_expires_at ?? null,
        premium_plan: korisnikUsluge?.premium_plan ?? null,
        premium_cancelled_at:
          (korisnikUsluge as { premium_cancelled_at?: string | null } | null | undefined)?.premium_cancelled_at ?? null,
        premium_cancel_reason:
          (korisnikUsluge as { premium_cancel_reason?: string | null } | null | undefined)?.premium_cancel_reason ?? null,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Greška servera.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 });
    }

    const body = await request.json();
    const rezultat = profilUpdateSchema.safeParse(body);

    if (!rezultat.success) {
      return NextResponse.json(
        { error: rezultat.error.errors[0].message },
        { status: 400 }
      );
    }

    const db = supabase as any;
    const { error } = await db
      .from('osoba')
      .update(rezultat.data)
      .eq('id_osobe', user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Greška servera.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
