import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { assertDispatcherAccess } from '@/lib/servisirane/dispecerPristup';
import { notifTimDodjela } from '@/lib/servisirane/notifikacijeHelper';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

type RouteParams = { id: string } | Promise<{ id: string }>;

async function resolveId(params: RouteParams): Promise<number | null> {
  const resolved = await params;
  const n = parseInt(resolved.id, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

const dodajSchema = z.object({
  serviser_id: z.string().uuid('Neispravan UUID servisera.'),
});

/** GET /api/dispecer/zahtjevi/[id]/tim - lista pomoćnih servisera */
export async function GET(
  _req: Request,
  { params }: { params: RouteParams }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 });

    const zahtjevId = await resolveId(params);
    if (!zahtjevId) return NextResponse.json({ error: 'Neispravan ID.' }, { status: 400 });

    const imaPriv = await assertDispatcherAccess(supabase, user.id);
    if (!imaPriv) return NextResponse.json({ error: 'Pristup odbijen.' }, { status: 403 });

    const db = supabase as any;
    const { data: tim, error } = await db
      .from('tim_intervencije')
      .select('*, serviser:osoba!serviser_id(ime, prezime, broj_telefona)')
      .eq('zahtjev_id', zahtjevId)
      .order('dodijeljeno_at', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      tim: (tim ?? []).map((t: Record<string, unknown>) => ({
        ...t,
        serviser: Array.isArray(t.serviser) ? t.serviser[0] : t.serviser,
      })),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Greška servera.' },
      { status: 500 }
    );
  }
}

/** POST /api/dispecer/zahtjevi/[id]/tim - dodaj pomoćnog servisera */
export async function POST(
  request: Request,
  { params }: { params: RouteParams }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 });

    const zahtjevId = await resolveId(params);
    if (!zahtjevId) return NextResponse.json({ error: 'Neispravan ID.' }, { status: 400 });

    const imaPriv = await assertDispatcherAccess(supabase, user.id);
    if (!imaPriv) return NextResponse.json({ error: 'Pristup odbijen.' }, { status: 403 });

    const body    = await request.json();
    const rezultat = dodajSchema.safeParse(body);
    if (!rezultat.success) {
      return NextResponse.json({ error: rezultat.error.errors[0].message }, { status: 400 });
    }

    const { serviser_id } = rezultat.data;
    const db = supabase as any;

    // Provjeri da serviser nije već u timu
    const { data: postoji } = await db
      .from('tim_intervencije')
      .select('id')
      .eq('zahtjev_id', zahtjevId)
      .eq('serviser_id', serviser_id)
      .maybeSingle();

    if (postoji) {
      return NextResponse.json({ error: 'Serviser je već u timu ove intervencije.' }, { status: 409 });
    }

    // Provjeri da serviser nije glavni serviser na ovoj intervenciji
    const { data: zahtjev } = await db
      .from('service_requests')
      .select('serviser_dodijeljen_id')
      .eq('id', zahtjevId)
      .single();

    if (zahtjev?.serviser_dodijeljen_id === serviser_id) {
      return NextResponse.json(
        { error: 'Serviser je već dodijeljen kao glavni serviser ove intervencije.' },
        { status: 409 }
      );
    }

    // Dodaj u tim
    const { data: noviClan, error: insertError } = await db
      .from('tim_intervencije')
      .insert({
        zahtjev_id:    zahtjevId,
        serviser_id,
        uloga:         'pomocni',
        dodijelio_id:  user.id,
      })
      .select('*, serviser:osoba!serviser_id(ime, prezime, broj_telefona)')
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Audit log
    const clan = Array.isArray(noviClan.serviser) ? noviClan.serviser[0] : noviClan.serviser;
    const imeServisera = clan ? `${clan.ime} ${clan.prezime}` : serviser_id;

    await db.from('intervention_activities').insert({
      zahtjev_id: zahtjevId,
      autor_id:   user.id,
      tip:        'tim_dodjela',
      sadrzaj:    `Dodan pomoćni serviser: ${imeServisera}`,
      metadata:   { serviser_id, uloga: 'pomocni' },
    });

    // Notifikacija serviseru
    await notifTimDodjela(db, serviser_id, zahtjevId, 'pomoćni');

    return NextResponse.json({
      success: true,
      clan: { ...noviClan, serviser: clan },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Greška servera.' },
      { status: 500 }
    );
  }
}

/** DELETE /api/dispecer/zahtjevi/[id]/tim?serviser_id=UUID - ukloni pomoćnog servisera */
export async function DELETE(
  request: Request,
  { params }: { params: RouteParams }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 });

    const zahtjevId = await resolveId(params);
    if (!zahtjevId) return NextResponse.json({ error: 'Neispravan ID.' }, { status: 400 });

    const imaPriv = await assertDispatcherAccess(supabase, user.id);
    if (!imaPriv) return NextResponse.json({ error: 'Pristup odbijen.' }, { status: 403 });

    const url         = new URL(request.url);
    const serviser_id = url.searchParams.get('serviser_id');
    if (!serviser_id) {
      return NextResponse.json({ error: 'Parametar serviser_id je obavezan.' }, { status: 400 });
    }

    const db = supabase as any;

    // Dohvati info za audit log
    const { data: clan } = await db
      .from('tim_intervencije')
      .select('id, serviser:osoba!serviser_id(ime, prezime)')
      .eq('zahtjev_id', zahtjevId)
      .eq('serviser_id', serviser_id)
      .maybeSingle();

    if (!clan) {
      return NextResponse.json({ error: 'Serviser nije pronađen u timu.' }, { status: 404 });
    }

    await db
      .from('tim_intervencije')
      .delete()
      .eq('zahtjev_id', zahtjevId)
      .eq('serviser_id', serviser_id);

    const serv = Array.isArray(clan.serviser) ? clan.serviser[0] : clan.serviser;
    const imeServisera = serv ? `${serv.ime} ${serv.prezime}` : serviser_id;

    await db.from('intervention_activities').insert({
      zahtjev_id: zahtjevId,
      autor_id:   user.id,
      tip:        'tim_uklanjanje',
      sadrzaj:    `Uklonjen pomoćni serviser: ${imeServisera}`,
      metadata:   { serviser_id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Greška servera.' },
      { status: 500 }
    );
  }
}
