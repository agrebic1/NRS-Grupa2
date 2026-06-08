import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ocjenaSchema } from '@/lib/validations/servisirane';
import { zabiljeziAktivnost } from '@/lib/servisirane/aktivnostiAudit';

export const dynamic = 'force-dynamic';

// ─── GET: Dohvati ocjenu za zahtjev ──────────────────────────────────────────

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const zahtjevId = parseInt(params.id, 10);
    if (isNaN(zahtjevId)) {
      return NextResponse.json(
        { error: 'Neispravan ID zahtjeva.' },
        { status: 400 },
      );
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json(
        { error: 'Niste prijavljeni.' },
        { status: 401 },
      );

    const db = supabase as any;

    // Provjeri da korisnik ima pristup zahtjevu
    const { data: zahtjev } = await db
      .from('service_requests')
      .select('id, user_id, serviser_dodijeljen_id, status')
      .eq('id', zahtjevId)
      .maybeSingle();

    if (!zahtjev) {
      return NextResponse.json(
        { error: 'Zahtjev nije pronađen.' },
        { status: 404 },
      );
    }

    // Provjeri ulogu — korisnik, serviser ili dispečer/admin
    const jeVlasnik = zahtjev.user_id === user.id;
    const jeServiser = zahtjev.serviser_dodijeljen_id === user.id;

    const { data: uposlenik } = await db
      .from('uposlenici')
      .select('uloga:uloga(naziv)')
      .eq('id_uposlenika', user.id)
      .maybeSingle();

    const uloge: string[] = Array.isArray(uposlenik?.uloga)
      ? (uposlenik.uloga as { naziv: string }[]).map((u) =>
          u.naziv.toLowerCase(),
        )
      : uposlenik?.uloga
        ? [(uposlenik.uloga as { naziv: string }).naziv.toLowerCase()]
        : [];

    const jeDispecer = uloge.some((u) =>
      ['dispečer', 'dispecer', 'administrator', 'admin'].includes(u),
    );

    if (!jeVlasnik && !jeServiser && !jeDispecer) {
      return NextResponse.json(
        { error: 'Nemate pristup ovom zahtjevu.' },
        { status: 403 },
      );
    }

    const { data: ocjena } = await db
      .from('intervencija_ocjene')
      .select('id, ocjena, komentar, created_at, korisnik_id')
      .eq('zahtjev_id', zahtjevId)
      .maybeSingle();

    return NextResponse.json({ ocjena: ocjena ?? null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Greška servera.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── POST: Unesi ocjenu ───────────────────────────────────────────────────────

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const zahtjevId = parseInt(params.id, 10);
    if (isNaN(zahtjevId)) {
      return NextResponse.json(
        { error: 'Neispravan ID zahtjeva.' },
        { status: 400 },
      );
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json(
        { error: 'Niste prijavljeni.' },
        { status: 401 },
      );

    const body = await request.json();
    const rezultat = ocjenaSchema.safeParse(body);
    if (!rezultat.success) {
      return NextResponse.json(
        { error: rezultat.error.errors[0]?.message ?? 'Neispravni podaci.' },
        { status: 400 },
      );
    }

    const db = supabase as any;

    // AC1/AC6: provjeri da je ovo vlasnikova zatvorena intervencija
    const { data: zahtjev } = await db
      .from('service_requests')
      .select('id, user_id, status')
      .eq('id', zahtjevId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!zahtjev) {
      return NextResponse.json(
        { error: 'Zahtjev nije pronađen ili niste vlasnik.' },
        { status: 403 },
      );
    }

    if (zahtjev.status !== 'zatvoreno') {
      return NextResponse.json(
        { error: 'Ocjena je moguća samo za zatvorene intervencije.' },
        { status: 422 },
      );
    }

    // AC4: provjeri duplikat
    const adminDb = createAdminClient() as any;
    const { data: postojecaOcjena } = await adminDb
      .from('intervencija_ocjene')
      .select('id, ocjena')
      .eq('zahtjev_id', zahtjevId)
      .eq('korisnik_id', user.id)
      .maybeSingle();

    if (postojecaOcjena) {
      return NextResponse.json(
        {
          error: 'Već ste ocijenili ovu intervenciju.',
          ocjena: postojecaOcjena,
        },
        { status: 409 },
      );
    }

    // Unesi ocjenu
    const { data: novaOcjena, error: greskaInsert } = await adminDb
      .from('intervencija_ocjene')
      .insert({
        zahtjev_id: zahtjevId,
        korisnik_id: user.id,
        ocjena: rezultat.data.ocjena,
        komentar: rezultat.data.komentar ?? null,
      })
      .select()
      .single();

    if (greskaInsert) {
      return NextResponse.json(
        { error: greskaInsert.message },
        { status: 500 },
      );
    }

    // Audit log
    await zabiljeziAktivnost(adminDb, {
      zahtjev_id: zahtjevId,
      autor_id: user.id,
      tip: 'ocjena',
      sadrzaj: `Korisnik ocijenio intervenciju: ${rezultat.data.ocjena}/5${rezultat.data.komentar ? ` — "${rezultat.data.komentar}"` : ''}`,
      actor_role: 'korisnik',
      new_value: String(rezultat.data.ocjena),
    });

    return NextResponse.json({ ocjena: novaOcjena }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Greška servera.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
