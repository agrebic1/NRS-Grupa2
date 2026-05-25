import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { SLA_ROKOVI_SATI, type SlaPrioritet } from '@/lib/servisirane/slaPravila';

export const dynamic = 'force-dynamic';

/**
 * US-45 — SLA eskalacije
 *
 * Pokreće se svaki sat putem Vercel Cron.
 * Za svaku prekoračenu aktivnu intervenciju kreira notifikacije svim dispečerima —
 * ali samo jedanput po intervenciji svaka 2 sata (anti-spam).
 */

const AKTIVNI_STATUSI = ['pending_review', 'u_obradi', 'potvrdeno', 'dodijeljeno', 'u_radu', 'u_izvrsenju'];
const ANTI_SPAM_SATI  = 2; // ponovi eskalaciju tek nakon 2h ako i dalje kasni

function autorizovanCronPoziv(request: Request): boolean {
  const tajna = process.env.CRON_SECRET;
  const zahtijevajTajnu = process.env.NODE_ENV === 'production';
  if (zahtijevajTajnu) {
    if (!tajna) return false;
    const auth = request.headers.get('authorization') ?? '';
    return auth === `Bearer ${tajna}`;
  }
  if (!tajna) return true;
  const auth = request.headers.get('authorization') ?? '';
  return auth === `Bearer ${tajna}`;
}

async function obradiSlaEskalacije(request: Request) {
  try {
    if (!autorizovanCronPoziv(request)) {
      return NextResponse.json({ error: 'Nedozvoljen cron poziv.' }, { status: 401 });
    }

    let db: ReturnType<typeof createAdminClient>;
    try {
      db = createAdminClient();
    } catch {
      return NextResponse.json({
        success: true,
        eskalirano: 0,
        skipped: 'service_role_key_not_configured',
      });
    }

    const sada = new Date();

    // 1. Dohvati sve aktivne intervencije s postavljenim prioritetom
    const { data: zahtjevi, error: zErr } = await (db as any)
      .from('service_requests')
      .select('id, created_at, final_priority, status')
      .in('status', AKTIVNI_STATUSI)
      .not('final_priority', 'is', null);

    if (zErr) return NextResponse.json({ error: zErr.message }, { status: 500 });
    if (!zahtjevi || zahtjevi.length === 0) {
      return NextResponse.json({ success: true, eskalirano: 0, provjreno: 0 });
    }

    // 2. Filtriraj one čiji je SLA rok prošao
    const prekoraceni = (zahtjevi as Array<{
      id: number; created_at: string; final_priority: string; status: string;
    }>).filter((z) => {
      const prioritet = z.final_priority as SlaPrioritet;
      if (!(prioritet in SLA_ROKOVI_SATI)) return false;
      const rokMs  = SLA_ROKOVI_SATI[prioritet] * 3_600_000;
      const kratMs = sada.getTime() - new Date(z.created_at).getTime();
      return kratMs > rokMs;
    });

    if (prekoraceni.length === 0) {
      return NextResponse.json({ success: true, eskalirano: 0, provjereno: zahtjevi.length });
    }

    const prekoraceniIds = prekoraceni.map((z) => z.id);

    // 3. Provjeri koje intervencije već imaju SLA notifikaciju u zadnja 2h (anti-spam)
    const antiSpamOd = new Date(sada.getTime() - ANTI_SPAM_SATI * 3_600_000).toISOString();
    const { data: postojeceNotif } = await (db as any)
      .from('notifikacije')
      .select('zahtjev_id')
      .in('zahtjev_id', prekoraceniIds)
      .eq('tip', 'sla_eskalacija')
      .gte('created_at', antiSpamOd);

    const vecEskalirani = new Set<number>(
      (postojeceNotif ?? []).map((n: any) => n.zahtjev_id as number)
    );

    const zaEskalaciju = prekoraceni.filter((z) => !vecEskalirani.has(z.id));
    if (zaEskalaciju.length === 0) {
      return NextResponse.json({
        success:     true,
        eskalirano:  0,
        provjereno:  zahtjevi.length,
        prekoraceni: prekoraceni.length,
        poruka:      'Sve prekoračene intervencije su već eskalirane u zadnja 2h.',
      });
    }

    // 4. Dohvati sve dispečere
    const { data: dispeceri } = await (db as any)
      .from('uposlenici')
      .select('id_uposlenika, uloga:uloga(naziv)')
      .filter('uloga.naziv', 'ilike', '%ispe%'); // Dispečer / dispečer

    const dispecerIds: string[] = (dispeceri ?? [])
      .filter((u: any) => {
        const naziv = Array.isArray(u.uloga) ? u.uloga[0]?.naziv : u.uloga?.naziv;
        return naziv && naziv.toLowerCase().includes('ispe');
      })
      .map((u: any) => u.id_uposlenika as string);

    if (dispecerIds.length === 0) {
      return NextResponse.json({
        success:    true,
        eskalirano: 0,
        poruka:     'Nema dispečera u sistemu.',
      });
    }

    // 5. Kreiraj notifikacije: po jedna po kombinaciji (zahtjev × dispečer)
    const notifikacije = zaEskalaciju.flatMap((z) => {
      const prioritet  = z.final_priority as SlaPrioritet;
      const rokSati    = SLA_ROKOVI_SATI[prioritet];
      const kasnjenjeMins = Math.floor(
        (sada.getTime() - new Date(z.created_at).getTime()) / 60_000 - rokSati * 60
      );
      const kasnjenjeStr = kasnjenjeMins >= 60
        ? `${Math.floor(kasnjenjeMins / 60)}h ${kasnjenjeMins % 60}min`
        : `${kasnjenjeMins}min`;

      return dispecerIds.map((dispId) => ({
        korisnik_id:     dispId,
        uloga_korisnika: 'Dispečer',
        tip:             'sla_eskalacija',
        naslov:          `⚠ SLA prekoračen — Intervencija #${z.id}`,
        poruka:          `Intervencija #${z.id} (prioritet ${prioritet}) prekoračila je SLA rok (${rokSati}h) za ${kasnjenjeStr}. Potrebna hitna reakcija.`,
        zahtjev_id:      z.id,
      }));
    });

    const { error: insertErr } = await (db as any)
      .from('notifikacije')
      .insert(notifikacije);

    if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

    // 6. Audit log u intervention_activities za svaku eskaliranu intervenciju
    const aktivnosti = zaEskalaciju.map((z) => ({
      zahtjev_id: z.id,
      autor_id:   null,             // sistemska akcija
      tip:        'sla_eskalacija',
      sadrzaj:    `Automatska SLA eskalacija — prioritet ${z.final_priority}, status ${z.status}`,
      metadata:   {
        prioritet:    z.final_priority,
        status:       z.status,
        created_at:   z.created_at,
        eskalirano_at: sada.toISOString(),
      },
    }));

    // Upiši u intervention_activities; ignoriši grešku (ne kritično)
    await (db as any).from('intervention_activities').insert(aktivnosti).throwOnError().catch(() => {});

    return NextResponse.json({
      success:          true,
      eskalirano:       zaEskalaciju.length,
      notifikacij:      notifikacije.length,
      provjereno:       zahtjevi.length,
      prekoraceni:      prekoraceni.length,
      vec_eskalirani:   vecEskalirani.size,
      dispeceri:        dispecerIds.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Greška servera.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return obradiSlaEskalacije(request);
}

export async function POST(request: Request) {
  return obradiSlaEskalacije(request);
}
