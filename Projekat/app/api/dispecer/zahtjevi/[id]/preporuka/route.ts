import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { assertDispatcherAccess } from '@/lib/servisirane/dispecerPristup';
import { izracunajPreporuke } from '@/lib/servisirane/preporukaServisera';

export const dynamic = 'force-dynamic';

/**
 * US-48 fallback: kad zahtjev nema GPS koordinate, jednom geokodiramo njegovu
 * adresu (OpenStreetMap/Nominatim) da bi geo-preporuka radila i bez GPS-a.
 * Best-effort: kratak timeout, tihi povratak na null pri grešci.
 */
async function geokodirajAdresu(adresa: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 3500);
    const r = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(adresa)}&format=json&limit=1&countrycodes=ba,hr,rs,si`,
      { headers: { 'User-Agent': 'NRS-Servisirane/1.0', Accept: 'application/json' }, signal: ctrl.signal },
    );
    clearTimeout(t);
    if (!r.ok) return null;
    const d = await r.json();
    if (Array.isArray(d) && d[0]?.lat && d[0]?.lon) {
      const lat = parseFloat(d[0].lat);
      const lon = parseFloat(d[0].lon);
      if (Number.isFinite(lat) && Number.isFinite(lon)) return { lat, lon };
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET(
  req:    NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 });

    const imaPriv = await assertDispatcherAccess(supabase, user.id);
    if (!imaPriv) return NextResponse.json({ error: 'Pristup odbijen.' }, { status: 403 });

    const db = supabase as any;

    // Admin klijent zaobilazi RLS za čitanje zaposlenika (dispečer mora vidjeti sve).
    let adminClient: ReturnType<typeof createAdminClient> | null = null;
    let dbEmp: any;
    try {
      adminClient = createAdminClient();
      dbEmp = adminClient as any;
    } catch {
      dbEmp = db;
    }

    // Fetch category + location info from zahtjev (latitude/longitude za geo-preporuku, US-48)
    const { data: zahtjev } = await db
      .from('service_requests')
      .select('category_main, category_sub, latitude, longitude, address')
      .eq('id', params.id)
      .single();

    // US-48: koordinate zahtjeva — iz GPS-a ako postoje, inače geokodiraj adresu (fallback).
    let zahtjevLat: number | null = typeof zahtjev?.latitude  === 'number' ? zahtjev.latitude  : null;
    let zahtjevLng: number | null = typeof zahtjev?.longitude === 'number' ? zahtjev.longitude : null;
    if ((zahtjevLat == null || zahtjevLng == null) && zahtjev?.address) {
      const geo = await geokodirajAdresu(zahtjev.address);
      if (geo) { zahtjevLat = geo.lat; zahtjevLng = geo.lon; }
    }

    // Parse excluded IDs: ?izuzeti=uuid1,uuid2
    const url = new URL(req.url);
    const izuzetiParam = url.searchParams.get('izuzeti') ?? '';
    const izuzeti = izuzetiParam.split(',').filter(Boolean);

    // Fetch all verified servicers - two-step: lookup role ID first to avoid
    // unreliable .eq('uloga.naziv', ...) filter on PostgREST embedded resources.
    const { data: ulogaPodaci, error: ulogaError } = await dbEmp
      .from('uloga')
      .select('id_uloge')
      .ilike('naziv', 'Serviser')
      .maybeSingle();

    if (ulogaError) return NextResponse.json({ error: ulogaError.message }, { status: 500 });
    if (!ulogaPodaci) return NextResponse.json({ preporuke: [] });

    const { data: uposlenici, error } = await dbEmp
      .from('uposlenici')
      .select(`
        id_uposlenika,
        is_verified,
        osoba!id_uposlenika(ime, prezime, bazna_latitude, bazna_longitude)
      `)
      .eq('id_uloge', ulogaPodaci.id_uloge);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Filtriraj suspendirane korisnike (banned_until > sada u auth.users).
    let aktivniUposlenici = uposlenici ?? [];
    if (adminClient && aktivniUposlenici.length > 0) {
      const { data: authData } = await adminClient.auth.admin.listUsers({ perPage: 1000, page: 1 });
      const sada = new Date();
      const suspendovaniIds = new Set(
        (authData?.users ?? [])
          .filter(u => u.banned_until && new Date(u.banned_until) > sada)
          .map(u => u.id)
      );
      aktivniUposlenici = aktivniUposlenici.filter((u: any) => !suspendovaniIds.has(u.id_uposlenika));
    }

    const serviseriIds = aktivniUposlenici.map((u: any) => u.id_uposlenika);

    // Count active (non-terminal) assignments per servicer
    let aktivniMap: Record<string, number> = {};
    if (serviseriIds.length > 0) {
      const { data: zadaci } = await db
        .from('service_requests')
        .select('serviser_dodijeljen_id')
        .in('serviser_dodijeljen_id', serviseriIds)
        .not('status', 'in', '("zavrseno","otkazano","odbijeno","zatvoreno")');

      if (zadaci) {
        aktivniMap = (zadaci as any[]).reduce<Record<string, number>>((acc, z) => {
          if (z.serviser_dodijeljen_id) {
            acc[z.serviser_dodijeljen_id] = (acc[z.serviser_dodijeljen_id] ?? 0) + 1;
          }
          return acc;
        }, {});
      }
    }

    const serviseri = aktivniUposlenici.map((u: any) => {
      const osoba = Array.isArray(u.osoba) ? u.osoba[0] : u.osoba;
      return {
        id:                u.id_uposlenika as string,
        ime:               (osoba as any)?.ime  ?? '',
        prezime:           (osoba as any)?.prezime ?? '',
        is_verified:       Boolean(u.is_verified),
        aktivnih_zadataka: aktivniMap[u.id_uposlenika] ?? 0,
        specialnosti:      [] as string[],
        latitude:          (osoba as any)?.bazna_latitude  ?? null,
        longitude:         (osoba as any)?.bazna_longitude ?? null,
      };
    });

    const preporuke = izracunajPreporuke(serviseri, {
      kategorija: zahtjev?.category_main ?? null,
      izuzeti,
      zahtjevLat,
      zahtjevLng,
    });

    // Nađi ID-eve servisera koji su prethodno odbili ovaj zahtjev (intervention_activities, tip='odbijanje')
    const { data: odbijanjeAktivnosti } = await db
      .from('intervention_activities')
      .select('autor_id')
      .eq('zahtjev_id', params.id)
      .eq('tip', 'odbijanje');
    const odbijeniServiserIds: string[] = Array.from(
      new Set((odbijanjeAktivnosti ?? []).map((a: any) => a.autor_id as string).filter(Boolean))
    );

    return NextResponse.json({ preporuke, odbijeniServiserIds });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Greška servera.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
