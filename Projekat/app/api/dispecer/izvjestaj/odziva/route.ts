import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { assertDispatcherAccess } from '@/lib/servisirane/dispecerPristup';
import { SLA_ROKOVI_SATI } from '@/lib/servisirane/slaPravila';
import type { ServiserOdzivaRed, IntervencijaOdzivaRed, IzvjestajOdzivaOdgovor } from '@/lib/servisirane/izvjestajiOdziva';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 });

    const imaPriv = await assertDispatcherAccess(supabase, user.id);
    if (!imaPriv) return NextResponse.json({ error: 'Pristup odbijen.' }, { status: 403 });

    let db: any;
    try { db = createAdminClient() as any; } catch { db = supabase as any; }

    // Parsiranje datumskog opsega iz query stringa
    const url      = new URL(request.url);
    const odParam  = url.searchParams.get('od');
    const doParam  = url.searchParams.get('do');

    const sada  = new Date();
    const odDat = odParam
      ? new Date(odParam)
      : new Date(sada.getFullYear(), sada.getMonth(), 1); // početak tekućeg mjeseca
    const doDat = doParam
      ? new Date(doParam + 'T23:59:59')
      : sada;

    if (isNaN(odDat.getTime()) || isNaN(doDat.getTime())) {
      return NextResponse.json({ error: 'Neispravan format datuma (YYYY-MM-DD).' }, { status: 400 });
    }

    // Dohvati završene intervencije u periodu
    const { data: zahtjevi, error: zErr } = await db
      .from('service_requests')
      .select('id, serviser_dodijeljen_id, final_priority, created_at, updated_at')
      .eq('status', 'zavrseno')
      .gte('updated_at', odDat.toISOString())
      .lte('updated_at', doDat.toISOString())
      .not('serviser_dodijeljen_id', 'is', null);

    if (zErr) return NextResponse.json({ error: zErr.message }, { status: 500 });
    if (!zahtjevi || zahtjevi.length === 0) {
      return NextResponse.json({
        period:    { od: odDat.toISOString().substring(0, 10), do: doDat.toISOString().substring(0, 10) },
        serviseri: [],
        ukupno:    { broj_intervencija: 0, avg_odziv_minuta: null, avg_trajanje_minuta: null, sla_compliance_posto: null },
      } as IzvjestajOdzivaOdgovor);
    }

    const zahtjevIds = zahtjevi.map((z: any) => z.id);

    // Evidencija rada za sve zahjeве
    const { data: evidencije } = await db
      .from('work_evidence')
      .select('zahtjev_id, trajanje_minuta, serviser_id')
      .in('zahtjev_id', zahtjevIds);

    // Aktivnosti: dodjela i prihvat (u_radu) za izračun odziva
    const { data: aktivnosti } = await db
      .from('intervention_activities')
      .select('zahtjev_id, tip, created_at, metadata')
      .in('zahtjev_id', zahtjevIds)
      .in('tip', ['dodjela', 'status_promjena']);

    // Profili servisera
    const serviserIds = [...new Set(zahtjevi.map((z: any) => z.serviser_dodijeljen_id as string))];
    const { data: serviseriProfili } = await db
      .from('osoba')
      .select('id_osobe, ime, prezime')
      .in('id_osobe', serviserIds);

    const profilMap = new Map<string, { ime: string; prezime: string }>(
      (serviseriProfili ?? []).map((p: any) => [p.id_osobe, { ime: p.ime, prezime: p.prezime }])
    );

    // Grupiraj evidencije po zahtjev_id
    const evidByZah = new Map<number, number>(); // zahtjev_id → ukupno minuta
    for (const e of evidencije ?? []) {
      if (!e.trajanje_minuta) continue;
      evidByZah.set(e.zahtjev_id, (evidByZah.get(e.zahtjev_id) ?? 0) + e.trajanje_minuta);
    }

    // Grupiraj aktivnosti po zahtjev_id
    const aktByZah = new Map<number, { dodjelaAt: string | null; prihvatAt: string | null }>();
    for (const a of aktivnosti ?? []) {
      const cur = aktByZah.get(a.zahtjev_id) ?? { dodjelaAt: null, prihvatAt: null };
      if (a.tip === 'dodjela' && !cur.dodjelaAt) cur.dodjelaAt = a.created_at;
      if (
        a.tip === 'status_promjena' &&
        typeof a.metadata === 'object' && a.metadata !== null &&
        (a.metadata as Record<string, string>).u === 'u_radu' &&
        !cur.prihvatAt
      ) {
        cur.prihvatAt = a.created_at;
      }
      aktByZah.set(a.zahtjev_id, cur);
    }

    // Agregacija po serviseru
    const aggMap = new Map<string, {
      broj:         number;
      odzvMin:      number[];
      trajMin:      number[];
      slaOk:        number;
      intervencije: IntervencijaOdzivaRed[];
    }>();

    for (const z of zahtjevi) {
      const sid = z.serviser_dodijeljen_id;
      if (!aggMap.has(sid)) aggMap.set(sid, { broj: 0, odzvMin: [], trajMin: [], slaOk: 0, intervencije: [] });
      const agg = aggMap.get(sid)!;

      agg.broj++;

      // Trajanje iz evidencija
      const traj = evidByZah.get(z.id) ?? null;
      if (traj) agg.trajMin.push(traj);

      // Odziv (dodjela → prihvat)
      const akt = aktByZah.get(z.id);
      let odzivMin: number | null = null;
      if (akt?.dodjelaAt && akt?.prihvatAt) {
        const odziv = (new Date(akt.prihvatAt).getTime() - new Date(akt.dodjelaAt).getTime()) / 60_000;
        if (odziv >= 0) { odzivMin = Math.round(odziv); agg.odzvMin.push(odzivMin); }
      }

      // SLA compliance: je li intervencija završena u roku?
      let slaOk: boolean | null = null;
      if (z.final_priority && z.final_priority in SLA_ROKOVI_SATI) {
        const slaMs = SLA_ROKOVI_SATI[z.final_priority as keyof typeof SLA_ROKOVI_SATI] * 3_600_000;
        const trajMs = new Date(z.updated_at).getTime() - new Date(z.created_at).getTime();
        slaOk = trajMs <= slaMs;
        if (slaOk) agg.slaOk++;
      }

      // Detalj intervencije za expand
      agg.intervencije.push({
        zahtjev_id:      z.id,
        zavrseno_at:     z.updated_at,
        final_priority:  z.final_priority ?? null,
        odziv_minuta:    odzivMin,
        trajanje_minuta: traj,
        sla_ok:          slaOk,
      });
    }

    // Sortiraj intervencije svake serviserke po datumu (najnovije prvo)
    for (const agg of aggMap.values()) {
      agg.intervencije.sort(
        (a, b) => new Date(b.zavrseno_at).getTime() - new Date(a.zavrseno_at).getTime()
      );
    }

    const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length) : null;

    const serviseri: ServiserOdzivaRed[] = [...aggMap.entries()].map(([sid, agg]) => {
      const profil = profilMap.get(sid);
      const slaPosto = agg.broj > 0 ? Math.round((agg.slaOk / agg.broj) * 100) : null;
      return {
        serviser_id:          sid,
        ime:                  profil?.ime ?? 'Nepoznat',
        prezime:              profil?.prezime ?? '',
        broj_intervencija:    agg.broj,
        avg_odziv_minuta:     avg(agg.odzvMin),
        avg_trajanje_minuta:  avg(agg.trajMin),
        sla_compliance_posto: slaPosto,
        intervencije:         agg.intervencije,
      };
    }).sort((a, b) => b.broj_intervencija - a.broj_intervencija);

    // Globalni prosjeci
    const sviBrojevi  = serviseri.map((s) => s.broj_intervencija);
    const sviOdzivi   = serviseri.flatMap((s) => s.avg_odziv_minuta != null ? [s.avg_odziv_minuta] : []);
    const sviTrajanje = serviseri.flatMap((s) => s.avg_trajanje_minuta != null ? [s.avg_trajanje_minuta] : []);
    const sviSla      = serviseri.flatMap((s) => s.sla_compliance_posto != null ? [s.sla_compliance_posto] : []);

    const odgovor: IzvjestajOdzivaOdgovor = {
      period:    { od: odDat.toISOString().substring(0, 10), do: doDat.toISOString().substring(0, 10) },
      serviseri,
      ukupno: {
        broj_intervencija:    sviBrojevi.reduce((s, v) => s + v, 0),
        avg_odziv_minuta:     avg(sviOdzivi),
        avg_trajanje_minuta:  avg(sviTrajanje),
        sla_compliance_posto: sviSla.length ? Math.round(sviSla.reduce((s, v) => s + v, 0) / sviSla.length) : null,
      },
    };

    return NextResponse.json(odgovor);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Greška servera.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
