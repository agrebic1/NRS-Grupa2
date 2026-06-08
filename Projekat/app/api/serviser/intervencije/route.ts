import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { assertServiserAccess } from '@/lib/servisirane/serviserPristup';

export const dynamic = 'force-dynamic';

export async function GET() {
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

    // Admin klijent zaobilazi RLS za čitanje dodijeljenih intervencija.
    let db: any;
    try {
      db = createAdminClient() as any;
    } catch {
      db = supabase as any;
    }

    // 1. Intervencije gdje je glavni serviser
    const { data: glavneData, error: glavnaErr } = await db
      .from('service_requests')
      .select('*')
      .eq('serviser_dodijeljen_id', user.id)
      .order('termin_planirani_pocetak', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (glavnaErr)
      return NextResponse.json({ error: glavnaErr.message }, { status: 500 });

    // 2. Intervencije gdje je pomoćni serviser (tim_intervencije)
    const { data: timRedovi } = await db
      .from('tim_intervencije')
      .select('zahtjev_id')
      .eq('serviser_id', user.id);

    const pomocniIds: number[] = (timRedovi ?? []).map(
      (t: { zahtjev_id: number }) => t.zahtjev_id,
    );
    const glavniIds = new Set(
      (glavneData ?? []).map((z: Record<string, unknown>) => z.id as number),
    );
    const noviIds = pomocniIds.filter((id) => !glavniIds.has(id));

    let pomocneData: Record<string, unknown>[] = [];
    if (noviIds.length > 0) {
      const { data } = await db
        .from('service_requests')
        .select('*')
        .in('id', noviIds)
        .order('termin_planirani_pocetak', {
          ascending: true,
          nullsFirst: false,
        });
      pomocneData = data ?? [];
    }

    // 3. Spoji i označi ulogu servisera
    const sveIntervencije: Record<string, unknown>[] = [
      ...(glavneData ?? []).map((z: Record<string, unknown>) => ({
        ...z,
        uloga_u_intervenciji: 'glavni',
      })),
      ...pomocneData.map((z) => ({ ...z, uloga_u_intervenciji: 'pomocni' })),
    ];

    // 4. Podaci o podnosiocima
    const userIds = [
      ...new Set(sveIntervencije.map((z) => z.user_id as string)),
    ];
    let osobeMap: Record<
      string,
      { ime: string; prezime: string; broj_telefona: string | null }
    > = {};
    if (userIds.length > 0) {
      const { data: osobe } = await db
        .from('osoba')
        .select('id_osobe, ime, prezime, broj_telefona')
        .in('id_osobe', userIds);
      osobeMap = Object.fromEntries(
        (
          (osobe ?? []) as {
            id_osobe: string;
            ime: string;
            prezime: string;
            broj_telefona: string | null;
          }[]
        ).map((o) => [o.id_osobe, o]),
      );
    }

    const rezultat = sveIntervencije.map((z) => ({
      ...z,
      podnosilac: osobeMap[z.user_id as string] ?? null,
    }));

    return NextResponse.json({ intervencije: rezultat });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Greška servera.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
