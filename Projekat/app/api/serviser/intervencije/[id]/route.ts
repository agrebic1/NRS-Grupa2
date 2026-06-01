import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  assertServiserAccess,
  assertServiserVlasnistvo,
  provjeriServiserPristupDetalju,
  serviserSmijeMijenjatiStatus,
} from '@/lib/servisirane/serviserPristup';
import { odbijZadatakSchema, razlogOperativniSchema } from '@/lib/validations/servisirane';
import {
  notifPrihvatanjeZadatka,
  notifOdbijanjeZadatka,
  kreirajViseNotifikacija,
  dohvatiUposlenikIdsPoUlogama,
  notifVratanjaNaPonovnuDodjelu,
  notifNijeRijesen,
  notifKorisnikusServiserNaPutu,
  notifKorisnikusServiserNaTerenu,
  notifNovaNapomenaDispecer,
  notifServiserNaTerenu,
  notifEvidencijaRada,
} from '@/lib/servisirane/notifikacijeHelper';
import { mapAktivnostiResponse, ucitajAktivnostiSaAutorom } from '@/lib/servisirane/aktivnostiQuery';
import { inkrementirajPonovniCiklus } from '@/lib/servisirane/ponovniCiklus';

export const dynamic = 'force-dynamic';

type RouteParams = { id: string } | Promise<{ id: string }>;

async function resolveId(params: RouteParams): Promise<number | null> {
  const resolved = await params;
  const n = parseInt(resolved.id, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function GET(
  _req: Request,
  { params }: { params: RouteParams }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 });

    const imaPriv = await assertServiserAccess(supabase, user.id);
    if (!imaPriv) return NextResponse.json({ error: 'Pristup odbijen.' }, { status: 403 });

    const zahtjevId = await resolveId(params);
    if (!zahtjevId) return NextResponse.json({ error: 'Neispravan ID.' }, { status: 400 });

    // Admin klijent zaobilazi RLS - serviseri moraju čitati redove gdje su
    // dodjeljeni (serviser_dodijeljen_id), što session klijent ne može vidjeti.
    let db: any;
    try {
      db = createAdminClient() as any;
    } catch {
      db = supabase as any;
    }

    const provjera = await provjeriServiserPristupDetalju(db, zahtjevId, user.id);
    if (!provjera.ok) return NextResponse.json({ error: provjera.greska }, { status: 403 });

    const { data: zahtjev, error } = await db
      .from('service_requests')
      .select('*')
      .eq('id', zahtjevId)
      .single();

    if (error || !zahtjev) return NextResponse.json({ error: 'Zahtjev nije pronađen.' }, { status: 404 });

    const { data: osoba } = await db
      .from('osoba')
      .select('ime, prezime, broj_telefona')
      .eq('id_osobe', zahtjev.user_id)
      .maybeSingle();

    const { data: evidencije } = await db
      .from('work_evidence')
      .select('*')
      .eq('zahtjev_id', zahtjevId)
      .order('created_at', { ascending: false });

    const aktivnosti = await ucitajAktivnostiSaAutorom(db, zahtjevId);

    return NextResponse.json({
      zahtjev:    { ...zahtjev, podnosilac: osoba ?? null },
      evidencije: evidencije ?? [],
      aktivnosti: mapAktivnostiResponse(aktivnosti),
      pristup: {
        nivo: provjera.nivo,
        samo_citanje: provjera.samo_citanje,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Greška servera.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

const akcijaPatchSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('prihvati') }),
  z.object({ action: z.literal('pocni') }),
  z.object({ action: z.literal('zavrsi') }),
  z.object({ action: z.literal('odbij'), razlog: odbijZadatakSchema.shape.razlog }),
  z.object({ action: z.literal('napomena'), sadrzaj: z.string().min(1).max(2000) }),
  z.object({ action: z.literal('vrati_na_ponovnu_dodjelu'), razlog: razlogOperativniSchema }),
  z.object({ action: z.literal('oznaci_nije_rijesen'), razlog: razlogOperativniSchema }),
]);

export async function PATCH(
  request: Request,
  { params }: { params: RouteParams }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 });

    const imaPriv = await assertServiserAccess(supabase, user.id);
    if (!imaPriv) return NextResponse.json({ error: 'Pristup odbijen.' }, { status: 403 });

    const zahtjevId = await resolveId(params);
    if (!zahtjevId) return NextResponse.json({ error: 'Neispravan ID.' }, { status: 400 });

    let db: any;
    try {
      db = createAdminClient() as any;
    } catch {
      db = supabase as any;
    }

    const provjera = await assertServiserVlasnistvo(db, zahtjevId, user.id);
    if (!provjera.ok) return NextResponse.json({ error: provjera.greska }, { status: 403 });

    const body     = await request.json();
    const rezultat = akcijaPatchSchema.safeParse(body);
    if (!rezultat.success) {
      return NextResponse.json({ error: rezultat.error.errors[0].message }, { status: 400 });
    }

    const podaci         = rezultat.data;
    const trenutniStatus = provjera.status;

    if (podaci.action === 'prihvati') {
      if (!serviserSmijeMijenjatiStatus(trenutniStatus, 'u_radu')) {
        return NextResponse.json(
          { error: `Nije moguće prihvatiti zadatak u statusu "${trenutniStatus}".` },
          { status: 400 }
        );
      }
      const { error } = await db.from('service_requests').update({ status: 'u_radu' }).eq('id', zahtjevId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      await db.from('intervention_activities').insert({
        zahtjev_id: zahtjevId,
        autor_id: user.id,
        tip: 'status_promjena',
        sadrzaj: 'Serviser prihvatio zadatak.',
        old_value: trenutniStatus,
        new_value: 'u_radu',
        actor_role: 'serviser',
        metadata: { iz: trenutniStatus, u: 'u_radu' },
      });

      // Notifikacija dispečeru
      const { data: zah } = await db
        .from('service_requests')
        .select('osoba!user_id(id_osobe)')
        .eq('id', zahtjevId)
        .single();
      const { data: osoba } = await db
        .from('osoba')
        .select('ime, prezime')
        .eq('id_osobe', user.id)
        .maybeSingle();
      const imeServisera = osoba ? `${osoba.ime} ${osoba.prezime}` : 'Serviser';

      // Nađi dispečere koji prate ovu intervenciju (author of dodjela activity)
      const { data: dodjelaActivity } = await db
        .from('intervention_activities')
        .select('autor_id')
        .eq('zahtjev_id', zahtjevId)
        .in('tip', ['dodjela', 'promjena_izvrsioca'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (dodjelaActivity?.autor_id) {
        await notifPrihvatanjeZadatka(db, dodjelaActivity.autor_id, zahtjevId, imeServisera);
      }

      // Notify korisnik that serviser is on the way
      const { data: zahtjevRow } = await db
        .from('service_requests')
        .select('user_id')
        .eq('id', zahtjevId)
        .maybeSingle();
      if (zahtjevRow?.user_id) {
        await notifKorisnikusServiserNaPutu(db, zahtjevRow.user_id, zahtjevId, imeServisera);
      }

      void zah; // suppress unused variable
      return NextResponse.json({ success: true, novi_status: 'u_radu' });
    }

    if (podaci.action === 'pocni') {
      if (!serviserSmijeMijenjatiStatus(trenutniStatus, 'u_izvrsenju')) {
        return NextResponse.json(
          { error: `Nije moguće pokrenuti intervenciju u statusu "${trenutniStatus}".` },
          { status: 400 }
        );
      }
      const { error } = await db.from('service_requests').update({ status: 'u_izvrsenju' }).eq('id', zahtjevId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      await db.from('intervention_activities').insert({
        zahtjev_id: zahtjevId,
        autor_id: user.id,
        tip: 'status_promjena',
        sadrzaj: 'Serviser je na lokaciji — intervencija u toku.',
        old_value: trenutniStatus,
        new_value: 'u_izvrsenju',
        actor_role: 'serviser',
        metadata: { iz: trenutniStatus, u: 'u_izvrsenju' },
      });

      // Notify korisnik + dispecer that serviser is on-site
      const { data: osoba2 } = await db
        .from('osoba')
        .select('ime, prezime')
        .eq('id_osobe', user.id)
        .maybeSingle();
      const imeServ2 = osoba2 ? `${osoba2.ime} ${osoba2.prezime}` : 'Serviser';

      const { data: zahtjevRow2 } = await db
        .from('service_requests')
        .select('user_id')
        .eq('id', zahtjevId)
        .maybeSingle();
      if (zahtjevRow2?.user_id) {
        await notifKorisnikusServiserNaTerenu(db, zahtjevRow2.user_id, zahtjevId, imeServ2);
      }
      const { data: dodjelaAkt2 } = await db
        .from('intervention_activities')
        .select('autor_id')
        .eq('zahtjev_id', zahtjevId)
        .in('tip', ['dodjela', 'promjena_izvrsioca'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (dodjelaAkt2?.autor_id) {
        await notifServiserNaTerenu(db, dodjelaAkt2.autor_id, zahtjevId, imeServ2);
      }

      return NextResponse.json({ success: true, novi_status: 'u_izvrsenju' });
    }

    // ── Završetak intervencije (serviser) ────────────────────────────────────
    if (podaci.action === 'zavrsi') {
      if (trenutniStatus !== 'u_izvrsenju') {
        return NextResponse.json(
          { error: `Nije moguće završiti intervenciju u statusu "${trenutniStatus}".` },
          { status: 400 }
        );
      }

      const { count: evidCount } = await (db as any)
        .from('work_evidence')
        .select('*', { count: 'exact', head: true })
        .eq('zahtjev_id', zahtjevId);

      if (!evidCount || evidCount === 0) {
        return NextResponse.json(
          { error: 'Intervencija se ne može završiti bez evidencije rada.' },
          { status: 400 }
        );
      }

      const { error } = await db.from('service_requests').update({ status: 'zavrseno' }).eq('id', zahtjevId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      await db.from('intervention_activities').insert({
        zahtjev_id: zahtjevId,
        autor_id:   user.id,
        tip:        'status_promjena',
        sadrzaj:    'Serviser završio intervenciju — čeka formalno zatvaranje dispečera.',
        old_value:  trenutniStatus,
        new_value:  'zavrseno',
        actor_role: 'serviser',
        metadata:   { iz: trenutniStatus, u: 'zavrseno' },
      });

      // Notifikacija dispečeru
      const { data: osobaZav } = await db
        .from('osoba').select('ime, prezime').eq('id_osobe', user.id).maybeSingle();
      const imeZav = osobaZav ? `${osobaZav.ime} ${osobaZav.prezime}` : 'Serviser';
      const { data: dodjelaAktZav } = await db
        .from('intervention_activities')
        .select('autor_id').eq('zahtjev_id', zahtjevId).eq('tip', 'dodjela')
        .order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (dodjelaAktZav?.autor_id) {
        await notifEvidencijaRada(db, dodjelaAktZav.autor_id, zahtjevId, `${imeZav} (završena intervencija)`);
      }

      return NextResponse.json({ success: true, novi_status: 'zavrseno' });
    }

    // ── US-30: Napomena servisera ─────────────────────────────────────────────
    if (podaci.action === 'napomena') {
      const { error: insErr } = await db.from('intervention_activities').insert({
        zahtjev_id: zahtjevId,
        autor_id:   user.id,
        tip:        'napomena',
        sadrzaj:    podaci.sadrzaj.trim(),
        metadata:   null,
      });
      if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

      // Notify dispecer about serviser note
      const { data: osobaN } = await db
        .from('osoba').select('ime, prezime').eq('id_osobe', user.id).maybeSingle();
      const imeNap = osobaN ? `${osobaN.ime} ${osobaN.prezime}` : 'Serviser';
      const { data: dodjelaAktN } = await db
        .from('intervention_activities')
        .select('autor_id').eq('zahtjev_id', zahtjevId).eq('tip', 'dodjela')
        .order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (dodjelaAktN?.autor_id) {
        await notifNovaNapomenaDispecer(db, dodjelaAktN.autor_id, zahtjevId, imeNap);
      }

      return NextResponse.json({ success: true });
    }

    // ── US-29: Vraćanje na ponovnu dodjelu ──────────────────────────────────
    if (podaci.action === 'vrati_na_ponovnu_dodjelu') {
      const DOZVOLJENI = new Set(['dodijeljeno', 'u_radu']);
      if (!DOZVOLJENI.has(trenutniStatus)) {
        return NextResponse.json(
          { error: 'Vraćanje na ponovnu dodjelu moguće je samo u statusu "dodijeljeno" ili "u_radu".' },
          { status: 422 }
        );
      }

      const { error: updErr } = await db
        .from('service_requests')
        .update({ status: 'potvrdeno', serviser_dodijeljen_id: null })
        .eq('id', zahtjevId);
      if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

      await db.from('intervention_activities').insert({
        zahtjev_id: zahtjevId,
        autor_id:   user.id,
        tip:        'vracanje_na_dodjelu',
        sadrzaj:    `Serviser vratio zadatak na ponovnu dodjelu. Razlog: ${podaci.razlog}`,
        old_value:  trenutniStatus,
        new_value:  'potvrdeno',
        actor_role: 'serviser',
        razlog:     podaci.razlog,
        metadata:   { iz: trenutniStatus, u: 'potvrdeno' },
      });

      // Notifikacija dispečeru
      const { data: osobaVN } = await db
        .from('osoba').select('ime, prezime').eq('id_osobe', user.id).maybeSingle();
      const imeVN = osobaVN ? `${osobaVN.ime} ${osobaVN.prezime}` : 'Serviser';

      const { data: dodjelaAktVN } = await db
        .from('intervention_activities')
        .select('autor_id').eq('zahtjev_id', zahtjevId)
        .in('tip', ['dodjela', 'promjena_izvrsioca'])
        .order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (dodjelaAktVN?.autor_id) {
        await notifVratanjaNaPonovnuDodjelu(db, dodjelaAktVN.autor_id, zahtjevId, imeVN, podaci.razlog);
      } else {
        const { data: sviDispVN } = await db.from('uposlenici').select('id_uposlenika, uloga:uloga(naziv)');
        const idsVN: string[] = (sviDispVN ?? [])
          .filter((u: any) => { const n = Array.isArray(u.uloga) ? u.uloga[0]?.naziv : u.uloga?.naziv; return n === 'Dispečer'; })
          .map((u: any) => u.id_uposlenika as string);
        if (idsVN.length > 0) {
          await kreirajViseNotifikacija(db, idsVN.map((id) => ({
            korisnik_id: id, uloga_korisnika: 'Dispečer', tip: 'odbijanje_zadatka',
            naslov: 'Serviser vratio zadatak na ponovnu dodjelu',
            poruka: `${imeVN} je vratio intervenciju #${zahtjevId} na ponovnu dodjelu. Razlog: ${podaci.razlog}`,
            zahtjev_id: zahtjevId,
          })));
        }
      }

      let brojCiklusa: number;
      try {
        brojCiklusa = await inkrementirajPonovniCiklus(db, zahtjevId);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Brojač ponovnih ciklusa nije ažuriran.';
        return NextResponse.json({ error: msg }, { status: 500 });
      }
      return NextResponse.json({ success: true, novi_status: 'potvrdeno', broj_ponovnih_ciklusa: brojCiklusa });
    }

    // ── US-40: Označi nije riješeno ──────────────────────────────────────────
    if (podaci.action === 'oznaci_nije_rijesen') {
      if (trenutniStatus !== 'u_izvrsenju') {
        return NextResponse.json(
          { error: 'Označavanje "nije riješeno" moguće je samo u statusu "u_izvrsenju".' },
          { status: 422 }
        );
      }

      const { error: updErr } = await db
        .from('service_requests')
        .update({ status: 'potvrdeno', serviser_dodijeljen_id: null })
        .eq('id', zahtjevId);
      if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

      await db.from('intervention_activities').insert({
        zahtjev_id: zahtjevId,
        autor_id:   user.id,
        tip:        'nije_rijeseno',
        sadrzaj:    `Serviser označio intervenciju kao nerješenu. Razlog: ${podaci.razlog}`,
        old_value:  'u_izvrsenju',
        new_value:  'potvrdeno',
        actor_role: 'serviser',
        razlog:     podaci.razlog,
        metadata:   { iz: 'u_izvrsenju', u: 'potvrdeno' },
      });

      const { data: osobaNR } = await db
        .from('osoba').select('ime, prezime').eq('id_osobe', user.id).maybeSingle();
      const imeNR = osobaNR ? `${osobaNR.ime} ${osobaNR.prezime}` : 'Serviser';

      const { data: dodjelaAktNR } = await db
        .from('intervention_activities')
        .select('autor_id').eq('zahtjev_id', zahtjevId)
        .in('tip', ['dodjela', 'promjena_izvrsioca'])
        .order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (dodjelaAktNR?.autor_id) {
        await notifNijeRijesen(db, dodjelaAktNR.autor_id, zahtjevId, imeNR, podaci.razlog);
      } else {
        const { data: sviDispNR } = await db.from('uposlenici').select('id_uposlenika, uloga:uloga(naziv)');
        const idsNR: string[] = (sviDispNR ?? [])
          .filter((u: any) => { const n = Array.isArray(u.uloga) ? u.uloga[0]?.naziv : u.uloga?.naziv; return n === 'Dispečer'; })
          .map((u: any) => u.id_uposlenika as string);
        if (idsNR.length > 0) {
          await kreirajViseNotifikacija(db, idsNR.map((id) => ({
            korisnik_id: id, uloga_korisnika: 'Dispečer', tip: 'odbijanje_zadatka',
            naslov: 'Intervencija označena kao nije riješena',
            poruka: `${imeNR} je označio intervenciju #${zahtjevId} kao nije riješenu. Razlog: ${podaci.razlog}`,
            zahtjev_id: zahtjevId,
          })));
        }
      }

      let brojCiklusaNR: number;
      try {
        brojCiklusaNR = await inkrementirajPonovniCiklus(db, zahtjevId);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Brojač ponovnih ciklusa nije ažuriran.';
        return NextResponse.json({ error: msg }, { status: 500 });
      }
      return NextResponse.json({
        success: true,
        novi_status: 'potvrdeno',
        broj_ponovnih_ciklusa: brojCiklusaNR,
      });
    }

    if (podaci.action === 'odbij') {
      if (trenutniStatus !== 'dodijeljeno') {
        return NextResponse.json(
          { error: 'Zadatak se može odbiti samo u statusu "Dodijeljeno".' },
          { status: 400 }
        );
      }
      const { error } = await db.from('service_requests').update({
        status: 'potvrdeno', serviser_dodijeljen_id: null, serviser_odbio_razlog: podaci.razlog,
      }).eq('id', zahtjevId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      await db.from('intervention_activities').insert({
        zahtjev_id: zahtjevId,
        autor_id: user.id,
        tip: 'odbijanje',
        sadrzaj: `Serviser odbio zadatak: ${podaci.razlog}`,
        old_value: trenutniStatus,
        new_value: 'potvrdeno',
        actor_role: 'serviser',
        razlog: podaci.razlog,
        metadata: { iz: trenutniStatus, u: 'potvrdeno' },
      });

      // Notifikacija dispečeru
      const { data: osobaOdb } = await db
        .from('osoba')
        .select('ime, prezime')
        .eq('id_osobe', user.id)
        .maybeSingle();
      const imeOdb = osobaOdb ? `${osobaOdb.ime} ${osobaOdb.prezime}` : 'Serviser';

      // Pokušaj naći dispečera koji je dodijelio zadatak
      const { data: dodjelaAkt } = await db
        .from('intervention_activities')
        .select('autor_id')
        .eq('zahtjev_id', zahtjevId)
        .in('tip', ['dodjela', 'promjena_izvrsioca'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (dodjelaAkt?.autor_id) {
        // Pošalji specifičnom dispečeru koji je napravio posljednju dodjelu
        await notifOdbijanjeZadatka(db, dodjelaAkt.autor_id, zahtjevId, imeOdb, podaci.razlog);
      } else {
        // Fallback: nema zapisa dodjele — obavijesti sve dispečere
        const dispIds = await dohvatiUposlenikIdsPoUlogama(db, ['Dispečer', 'dispečer', 'dispecer']);

        if (dispIds.length > 0) {
          await kreirajViseNotifikacija(db, dispIds.map((id) => ({
            korisnik_id:     id,
            uloga_korisnika: 'Dispečer',
            tip:             'odbijanje_zadatka',
            naslov:          'Serviser odbio zadatak',
            poruka:          `${imeOdb} je odbio intervenciju #${zahtjevId}. Razlog: ${podaci.razlog}`,
            zahtjev_id:      zahtjevId,
          })));
        }
      }

      return NextResponse.json({ success: true, novi_status: 'potvrdeno' });
    }

    return NextResponse.json({ error: 'Nepoznata akcija.' }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Greška servera.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
