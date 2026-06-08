import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { assertDispatcherAccess } from '@/lib/servisirane/dispecerPristup';

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

    const imaPriv = await assertDispatcherAccess(supabase, user.id);
    if (!imaPriv)
      return NextResponse.json({ error: 'Pristup odbijen.' }, { status: 403 });

    const db = supabase as any;

    // Admin klijent zaobilazi RLS - dispečer mora vidjeti sve zaposlenike,
    // ne samo vlastiti red. Fallback na session klijent ako ključ nije postavljen.
    let adminClient: ReturnType<typeof createAdminClient> | null = null;
    let dbEmp: any;
    try {
      adminClient = createAdminClient();
      dbEmp = adminClient as any;
    } catch {
      dbEmp = supabase as any;
    }

    const { data: ulogaPodaci, error: ulogaError } = await dbEmp
      .from('uloga')
      .select('id_uloge')
      .ilike('naziv', 'Serviser')
      .maybeSingle();

    if (ulogaError)
      return NextResponse.json({ error: ulogaError.message }, { status: 500 });
    if (!ulogaPodaci) return NextResponse.json({ serviseri: [] });

    const { data: uposlenici, error } = await dbEmp
      .from('uposlenici')
      .select(
        `
        id_uposlenika,
        is_verified,
        osoba!id_uposlenika(ime, prezime, bazna_latitude, bazna_longitude)
      `,
      )
      .eq('id_uloge', ulogaPodaci.id_uloge);

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    // Filtriraj suspendirane korisnike (banned_until > sada u auth.users).
    let aktivniUposlenici = uposlenici ?? [];
    if (adminClient && aktivniUposlenici.length > 0) {
      const { data: authData } = await adminClient.auth.admin.listUsers({
        perPage: 1000,
        page: 1,
      });
      const sada = new Date();
      const suspendovaniIds = new Set(
        (authData?.users ?? [])
          .filter((u) => u.banned_until && new Date(u.banned_until) > sada)
          .map((u) => u.id),
      );
      aktivniUposlenici = aktivniUposlenici.filter(
        (u: any) => !suspendovaniIds.has(u.id_uposlenika),
      );
    }

    const serviseriIds = aktivniUposlenici.map((u: any) => u.id_uposlenika);

    let aktivniMap: Record<string, number> = {};
    if (serviseriIds.length > 0) {
      const { data: zadaci } = await db
        .from('service_requests')
        .select('serviser_dodijeljen_id')
        .in('serviser_dodijeljen_id', serviseriIds)
        .not('status', 'in', '("zavrseno","otkazano","odbijeno")');

      if (zadaci) {
        aktivniMap = (zadaci as any[]).reduce<Record<string, number>>(
          (acc, z) => {
            if (z.serviser_dodijeljen_id) {
              acc[z.serviser_dodijeljen_id] =
                (acc[z.serviser_dodijeljen_id] ?? 0) + 1;
            }
            return acc;
          },
          {},
        );
      }
    }

    const serviseri = aktivniUposlenici.map((u: any) => {
      const osoba = Array.isArray(u.osoba) ? u.osoba[0] : u.osoba;
      return {
        id: u.id_uposlenika,
        ime: (osoba as { ime?: string })?.ime ?? '',
        prezime: (osoba as { prezime?: string })?.prezime ?? '',
        is_verified: u.is_verified,
        aktivnih_zadataka: aktivniMap[u.id_uposlenika] ?? 0,
        specialnosti: [] as string[],
        latitude:
          (osoba as { bazna_latitude?: number | null })?.bazna_latitude ?? null,
        longitude:
          (osoba as { bazna_longitude?: number | null })?.bazna_longitude ??
          null,
      };
    });

    serviseri.sort(
      (a: any, b: any) => a.aktivnih_zadataka - b.aktivnih_zadataka,
    );

    return NextResponse.json({ serviseri });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Greška servera.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
