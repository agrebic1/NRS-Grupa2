import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { assertDispatcherAccess } from '@/lib/servisirane/dispecerPristup';
import { korisnickiBrojeviMapPoKorisniku } from '@/lib/servisirane/korisnickiBrojZahtjeva';
import { obradiSlaEskalacijeBatch } from '@/lib/servisirane/slaEskalacije';

export const dynamic = 'force-dynamic';

function parsirajStatuseIzUpita(request: Request): string[] | null {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get('status');
  if (raw == null || raw.trim() === '') return null;
  const lista = raw.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  return lista.length > 0 ? lista : null;
}

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 });

    const imaPriv = await assertDispatcherAccess(supabase, user.id);
    if (!imaPriv) return NextResponse.json({ error: 'Pristup odbijen.' }, { status: 403 });

    const db = supabase as any;
    const statusFiltar = parsirajStatuseIzUpita(request);

    // Zavrsene stavke starije od 7 dana se ne prikazuju (previše historije),
    // ali nedavne se uključuju da bi filter "Završeni" i KPI "Završeni danas" radili.
    const sedamDanaAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    let upit = db.from('service_requests').select('*');

    if (statusFiltar) {
      upit = upit.in('status', statusFiltar);
    } else {
      // Isključi terminalne statuse (zatvoreno/otkazano/odbijeno);
      // zavrseno uključi samo zadnjih 7 dana.
      upit = upit
        .not('status', 'in', '("zatvoreno","otkazano","odbijeno")')
        .or(`status.neq.zavrseno,updated_at.gte.${sedamDanaAgo}`);
    }

    let { data, error } = await upit
      .order('is_premium', { ascending: false })
      .order('created_at', { ascending: true });

    if (error?.message?.includes("'is_premium' column")) {
      let fb = db.from('service_requests').select('*');
      if (statusFiltar) {
        fb = fb.in('status', statusFiltar);
      } else {
        fb = fb
          .not('status', 'in', '("zatvoreno","otkazano","odbijeno")')
          .or(`status.neq.zavrseno,updated_at.gte.${sedamDanaAgo}`);
      }
      const fallback = await fb.order('created_at', { ascending: true });
      data = fallback.data;
      error = fallback.error;
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const userIds = [...new Set((data ?? []).map((z: any) => z.user_id as string))];
    let profili: Record<string, { ime: string; prezime: string; broj_telefona: string | null }> = {};
    let idDoKorisnickogBroja = new Map<number, number>();

    if (userIds.length > 0) {
      const { data: sviZaKorisnike, error: brojErr } = await db
        .from('service_requests')
        .select('id, user_id, created_at')
        .in('user_id', userIds);
      if (!brojErr && sviZaKorisnike) {
        idDoKorisnickogBroja = korisnickiBrojeviMapPoKorisniku(sviZaKorisnike);
      }

      const { data: osobeData } = await db
        .from('osoba')
        .select('id_osobe, ime, prezime, broj_telefona')
        .in('id_osobe', userIds);

      for (const o of osobeData ?? []) {
        profili[o.id_osobe] = { ime: o.ime, prezime: o.prezime, broj_telefona: o.broj_telefona };
      }
    }

    await obradiSlaEskalacijeBatch(
      db,
      (data ?? []).map((z: any) => ({
        id:                    z.id,
        status:                z.status,
        created_at:            z.created_at,
        operativni_prioritet:  z.operativni_prioritet ?? null,
        sla_eskalacija_at:     z.sla_eskalacija_at ?? null,
      })),
      user.id,
    );

    const zahtjeviSaPodnosiocima = (data ?? []).map((z: any, indeks: number) => ({
      ...z,
      podnosilac: profili[z.user_id] ?? null,
      korisnicki_broj_zahtjeva: idDoKorisnickogBroja.get(z.id),
      dispecerski_redni_u_pregledu: indeks + 1,
    }));

    return NextResponse.json({ zahtjevi: zahtjeviSaPodnosiocima });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Greška servera.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
