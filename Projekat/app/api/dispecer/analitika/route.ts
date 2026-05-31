import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { assertDispatcherAccess } from '@/lib/servisirane/dispecerPristup';
import { sastaviMetrike } from '@/lib/servisirane/analitikaMetrike';
import type { AnalitikaZahtjevRed } from '@/lib/servisirane/analitikaMetrike';

export const dynamic = 'force-dynamic';

const ZAHTJEV_KOLONE =
  'id, status, final_priority, created_at, updated_at, serviser_dodijeljen_id, broj_ponovnih_ciklusa';

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 });

    const imaPriv = await assertDispatcherAccess(supabase, user.id);
    if (!imaPriv) return NextResponse.json({ error: 'Pristup odbijen.' }, { status: 403 });

    let db: any;
    try { db = createAdminClient() as any; } catch { db = supabase as any; }

    // ── Datumski opseg ────────────────────────────────────────────────────────
    const url     = new URL(request.url);
    const odParam = url.searchParams.get('od');
    const doParam = url.searchParams.get('do');

    const sada  = new Date();
    const odDat = odParam ? new Date(odParam) : new Date(sada.getFullYear(), sada.getMonth(), 1);
    const doDat = doParam ? new Date(doParam + 'T23:59:59') : sada;

    if (isNaN(odDat.getTime()) || isNaN(doDat.getTime())) {
      return NextResponse.json({ error: 'Neispravan format datuma (YYYY-MM-DD).' }, { status: 400 });
    }
    const odISO = odDat.toISOString();
    const doISO = doDat.toISOString();
    const period = { od: odISO.substring(0, 10), do: doISO.substring(0, 10) };

    // ── Zahtjevi kreirani u periodu (kohorta za status/opterećenje/cikluse) ─────
    const { data: sviZahtjevi, error: zErr } = await db
      .from('service_requests')
      .select(ZAHTJEV_KOLONE)
      .gte('created_at', odISO)
      .lte('created_at', doISO);
    if (zErr) return NextResponse.json({ error: zErr.message }, { status: 500 });

    // ── Završene intervencije u periodu (po updated_at) — kao US-42 izvještaj ────
    const { data: zavrseni, error: zavErr } = await db
      .from('service_requests')
      .select(ZAHTJEV_KOLONE)
      .eq('status', 'zavrseno')
      .gte('updated_at', odISO)
      .lte('updated_at', doISO)
      .not('serviser_dodijeljen_id', 'is', null);
    if (zavErr) return NextResponse.json({ error: zavErr.message }, { status: 500 });

    const zavrseniRedovi: AnalitikaZahtjevRed[] = zavrseni ?? [];
    const zavrseniIds = zavrseniRedovi.map((z) => z.id);

    // ── Trajanja (evidencija rada) ──────────────────────────────────────────────
    const trajanjaMinuta: number[] = [];
    if (zavrseniIds.length > 0) {
      const { data: evidencije } = await db
        .from('work_evidence')
        .select('zahtjev_id, trajanje_minuta')
        .in('zahtjev_id', zavrseniIds);
      const trajPoZah = new Map<number, number>();
      for (const e of evidencije ?? []) {
        if (!e.trajanje_minuta) continue;
        trajPoZah.set(e.zahtjev_id, (trajPoZah.get(e.zahtjev_id) ?? 0) + e.trajanje_minuta);
      }
      trajanjaMinuta.push(...trajPoZah.values());
    }

    // ── Odzivi (dodjela → prihvat u_radu), isto kao izvještaj odziva ────────────
    const odziviMinuta: number[] = [];
    if (zavrseniIds.length > 0) {
      const { data: aktivnosti } = await db
        .from('intervention_activities')
        .select('zahtjev_id, tip, created_at, metadata')
        .in('zahtjev_id', zavrseniIds)
        .in('tip', ['dodjela', 'status_promjena']);

      const parovi = new Map<number, { dodjelaAt: string | null; prihvatAt: string | null }>();
      for (const a of aktivnosti ?? []) {
        const cur = parovi.get(a.zahtjev_id) ?? { dodjelaAt: null, prihvatAt: null };
        if (a.tip === 'dodjela' && !cur.dodjelaAt) cur.dodjelaAt = a.created_at;
        if (
          a.tip === 'status_promjena' &&
          typeof a.metadata === 'object' && a.metadata !== null &&
          (a.metadata as Record<string, string>).u === 'u_radu' &&
          !cur.prihvatAt
        ) {
          cur.prihvatAt = a.created_at;
        }
        parovi.set(a.zahtjev_id, cur);
      }
      for (const { dodjelaAt, prihvatAt } of parovi.values()) {
        if (dodjelaAt && prihvatAt) {
          const odziv = (new Date(prihvatAt).getTime() - new Date(dodjelaAt).getTime()) / 60_000;
          if (odziv >= 0) odziviMinuta.push(Math.round(odziv));
        }
      }
    }

    // ── Imena servisera (završeni + aktivni iz kohorte) ─────────────────────────
    const serviserIds = [
      ...new Set(
        [
          ...zavrseniRedovi.map((z) => z.serviser_dodijeljen_id),
          ...(sviZahtjevi ?? []).map((z: AnalitikaZahtjevRed) => z.serviser_dodijeljen_id),
        ].filter((x): x is string => Boolean(x)),
      ),
    ];
    const imenaServisera: Record<string, string> = {};
    if (serviserIds.length > 0) {
      const { data: profili } = await db
        .from('osoba')
        .select('id_osobe, ime, prezime')
        .in('id_osobe', serviserIds);
      for (const p of profili ?? []) {
        imenaServisera[p.id_osobe] = `${p.ime ?? ''} ${p.prezime ?? ''}`.trim() || 'Nepoznat serviser';
      }
    }

    const metrike = sastaviMetrike({
      period,
      sviZahtjevi:      (sviZahtjevi ?? []) as AnalitikaZahtjevRed[],
      zavrseniZahtjevi: zavrseniRedovi,
      trajanjaMinuta,
      odziviMinuta,
      imenaServisera,
    });

    return NextResponse.json(metrike);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Greška servera.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
