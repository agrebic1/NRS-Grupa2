import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { dodijeliKorisnickeBrojeveZahtjeva } from '@/lib/servisirane/korisnickiBrojZahtjeva';

export const dynamic = 'force-dynamic';

/** Statusi koji čine historiju (završene, zatvorene, otkazane, odbijene). */
const HISTORIJSKI_STATUSI = ['zatvoreno', 'zavrseno', 'otkazano', 'odbijeno'] as const;

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 });
    }

    const db = supabase as any;

    // AC4/AC6: RLS + eksplicitni user_id filter sprječava IDOR
    const { data, error } = await db
      .from('service_requests')
      .select(
        'id, category, category_main, category_sub, address, created_at, status, ' +
        'urgency_score, final_priority, closed_at, updated_at, is_premium, ' +
        'cancel_reason, rejection_reason'
      )
      .eq('user_id', user.id)
      .in('status', HISTORIJSKI_STATUSI)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const zahtjevi = data ?? [];
    const saBrojevima = dodijeliKorisnickeBrojeveZahtjeva(zahtjevi);

    // Dohvati ocjene za historijske zahtjeve
    const ids = zahtjevi.map((z: { id: number }) => z.id);
    let ocjeneMap: Record<number, { ocjena: number; komentar: string | null }> = {};

    if (ids.length > 0) {
      const { data: ocjene } = await db
        .from('intervencija_ocjene')
        .select('zahtjev_id, ocjena, komentar')
        .eq('korisnik_id', user.id)
        .in('zahtjev_id', ids);

      if (ocjene) {
        ocjeneMap = Object.fromEntries(
          (ocjene as { zahtjev_id: number; ocjena: number; komentar: string | null }[])
            .map((o) => [o.zahtjev_id, { ocjena: o.ocjena, komentar: o.komentar }])
        );
      }
    }

    const historija = saBrojevima.map((z) => ({
      ...z,
      ocjena: ocjeneMap[z.id] ?? null,
    }));

    return NextResponse.json({ historija });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Greška servera.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
