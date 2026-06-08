import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  assertServiserAccess,
  assertServiserVlasnistvo,
} from '@/lib/servisirane/serviserPristup';
import { evidencijaRadaSchema } from '@/lib/validations/servisirane';
import { notifEvidencijaRada } from '@/lib/servisirane/notifikacijeHelper';

export const dynamic = 'force-dynamic';

type RouteParams = { id: string } | Promise<{ id: string }>;

export async function POST(
  request: Request,
  { params }: { params: RouteParams },
) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json(
        { error: 'Niste prijavljeni.' },
        { status: 401 },
      );

    const imaPriv = await assertServiserAccess(supabase, user.id);
    if (!imaPriv)
      return NextResponse.json({ error: 'Pristup odbijen.' }, { status: 403 });

    const resolved = await params;
    const zahtjevId = parseInt(resolved.id, 10);
    if (!Number.isFinite(zahtjevId) || zahtjevId <= 0) {
      return NextResponse.json({ error: 'Neispravan ID.' }, { status: 400 });
    }

    let db: any;
    try {
      db = createAdminClient() as any;
    } catch {
      db = supabase as any;
    }

    const provjera = await assertServiserVlasnistvo(db, zahtjevId, user.id);
    if (!provjera.ok)
      return NextResponse.json({ error: provjera.greska }, { status: 403 });

    const AKTIVNI = ['u_radu', 'u_izvrsenju', 'dodijeljeno'];
    if (!AKTIVNI.includes(provjera.status)) {
      return NextResponse.json(
        { error: 'Evidencija rada nije moguća u ovom statusu intervencije.' },
        { status: 400 },
      );
    }

    const body = await request.json();
    const rezultat = evidencijaRadaSchema.safeParse(body);
    if (!rezultat.success) {
      return NextResponse.json(
        { error: rezultat.error.errors[0].message },
        { status: 400 },
      );
    }

    const {
      opis_rada,
      trajanje_minuta,
      materijal,
      stavke_materijala,
      napomene,
    } = rezultat.data;
    const stavke = stavke_materijala ?? [];

    const { data: evidencija, error: evErr } = await db
      .from('work_evidence')
      .insert({
        zahtjev_id: zahtjevId,
        serviser_id: user.id,
        opis_rada,
        trajanje_minuta,
        materijal: materijal ?? null,
        stavke_materijala: stavke,
        napomene: napomene ?? null,
      })
      .select()
      .single();

    if (evErr)
      return NextResponse.json({ error: evErr.message }, { status: 500 });

    const trajanjeTekst = trajanje_minuta ? ` (${trajanje_minuta} min)` : '';
    await db.from('intervention_activities').insert({
      zahtjev_id: zahtjevId,
      autor_id: user.id,
      tip: 'evidencija',
      sadrzaj: `Evidentirani rad${trajanjeTekst}: ${opis_rada.substring(0, 100)}${opis_rada.length > 100 ? '...' : ''}`,
      metadata: { evidencija_id: evidencija?.id },
    });

    if (provjera.status === 'u_radu') {
      await db
        .from('service_requests')
        .update({
          status: 'u_izvrsenju',
          rad_evidentiran_at: new Date().toISOString(),
        })
        .eq('id', zahtjevId);
    } else if (provjera.status === 'u_izvrsenju') {
      await db
        .from('service_requests')
        .update({ rad_evidentiran_at: new Date().toISOString() })
        .eq('id', zahtjevId);
    }

    // Notifikacija dispečeru o evidentiranom radu
    const { data: osobaEv } = await db
      .from('osoba')
      .select('ime, prezime')
      .eq('id_osobe', user.id)
      .maybeSingle();
    const imeEv = osobaEv ? `${osobaEv.ime} ${osobaEv.prezime}` : 'Serviser';

    const { data: dodjelaAktEv } = await db
      .from('intervention_activities')
      .select('autor_id')
      .eq('zahtjev_id', zahtjevId)
      .in('tip', ['dodjela', 'promjena_izvrsioca'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (dodjelaAktEv?.autor_id) {
      await notifEvidencijaRada(db, dodjelaAktEv.autor_id, zahtjevId, imeEv);
    }

    return NextResponse.json({ success: true, evidencija }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Greška servera.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
