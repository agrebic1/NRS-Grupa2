import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// ─── Shared helpers ───────────────────────────────────────────────────────────

type StatusKorisnika = 'aktivan' | 'neaktivan' | 'suspendovan';
type RouteParams = { id: string } | Promise<{ id: string }>;

function procitajNazivUloge(
  uloga: { naziv?: string | null } | { naziv?: string | null }[] | null | undefined,
  fallback = ''
) {
  const z = Array.isArray(uloga) ? uloga[0] : uloga;
  return z?.naziv ?? fallback;
}

function odrediStatus(user: {
  banned_until?: string | null;
  email_confirmed_at?: string | null;
  confirmed_at?: string | null;
}): StatusKorisnika {
  if (user.banned_until && new Date(user.banned_until) > new Date()) return 'suspendovan';
  if (user.email_confirmed_at || user.confirmed_at) return 'aktivan';
  return 'neaktivan';
}

async function provjeriAdminPristup(db: any, idKorisnika: string): Promise<boolean> {
  const { data: uposlenik } = await db
    .from('uposlenici')
    .select('uloga:uloga(naziv)')
    .eq('id_uposlenika', idKorisnika)
    .maybeSingle();
  if (!uposlenik) return false;
  const naziv = procitajNazivUloge(uposlenik.uloga).toLowerCase();
  return naziv === 'administrator' || naziv === 'admin';
}

async function upisiAuditLog(
  db: any,
  payload: {
    user_id: string;
    actor_id: string;
    akcija: string;
    detalji?: Record<string, unknown>;
    razlog?: string | null;
  }
) {
  await db.from('admin_user_audit_log').insert({
    user_id:   payload.user_id,
    actor_id:  payload.actor_id,
    akcija:    payload.akcija,
    detalji:   payload.detalji ?? {},
    razlog:    payload.razlog ?? null,
  });
}

// ─── GET /api/admin/users/[id] ────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    const resolved = await params;
    const ciljId = resolved.id;

    const sesija = createClient();
    const { data: { user } } = await sesija.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 });

    const db = sesija as any;
    if (!(await provjeriAdminPristup(db, user.id))) {
      return NextResponse.json({ error: 'Pristup odbijen.' }, { status: 403 });
    }

    let admin: ReturnType<typeof createAdminClient>;
    try { admin = createAdminClient(); } catch {
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY nije konfigurisan.' }, { status: 503 });
    }
    const adb = admin as any;

    // Auth user
    const { data: authData, error: authErr } = await admin.auth.admin.getUserById(ciljId);
    if (authErr || !authData.user) {
      return NextResponse.json({ error: 'Korisnik nije pronađen.' }, { status: 404 });
    }
    const authUser = authData.user;

    // Profile: try korisnik_usluge first, then uposlenici
    const [
      { data: profKorisnik },
      { data: profUposlenik },
      { data: profOsoba },
    ] = await Promise.all([
      adb.from('korisnik_usluge')
        .select('id_korisnika_usluge, ime, prezime, email, broj_telefona, adresa, is_premium, premium_status, premium_expires_at')
        .eq('id_korisnika_usluge', ciljId)
        .maybeSingle(),
      adb.from('uposlenici')
        .select('id_uposlenika, ime, prezime, email, broj_telefona, adresa, id_uloge, uloga:uloga(naziv)')
        .eq('id_uposlenika', ciljId)
        .maybeSingle(),
      // US-48: bazna lokacija (živi na supertype tabeli osoba)
      adb.from('osoba')
        .select('bazna_latitude, bazna_longitude')
        .eq('id_osobe', ciljId)
        .maybeSingle(),
    ]);

    // Fetch all uloge for role management dropdown
    const { data: sveUloge } = await adb.from('uloga').select('id_uloge, naziv');

    // Audit log (most recent 20 events)
    const { data: aktivnosti } = await adb
      .from('admin_user_audit_log')
      .select('id, akcija, detalji, razlog, created_at, actor_id')
      .eq('user_id', ciljId)
      .order('created_at', { ascending: false })
      .limit(20);

    const tip: 'korisnik' | 'uposlenik' = profKorisnik ? 'korisnik' : 'uposlenik';
    const profil = profKorisnik ?? profUposlenik;

    const korisnik = {
      id:              ciljId,
      ime:             profil?.ime   ?? authUser.user_metadata?.ime   ?? '',
      prezime:         profil?.prezime ?? authUser.user_metadata?.prezime ?? '',
      email:           profil?.email ?? authUser.email ?? '',
      broj_telefona:   profil?.broj_telefona ?? null,
      adresa:          profil?.adresa ?? null,
      tip,
      uloga:           tip === 'korisnik'
        ? 'Korisnik usluge'
        : procitajNazivUloge(profUposlenik?.uloga, 'Uposlenik'),
      uloga_id:        profUposlenik?.id_uloge ?? null,
      status:          odrediStatus(authUser),
      email_potvrden:  Boolean(authUser.email_confirmed_at || authUser.confirmed_at),
      zadnja_prijava:  authUser.last_sign_in_at ?? null,
      kreiran_at:      authUser.created_at,
      banned_until:    authUser.banned_until ?? null,
      isPremium:       Boolean(profKorisnik?.is_premium),
      premium_status:  profKorisnik?.premium_status ?? null,
      premium_expires_at: profKorisnik?.premium_expires_at ?? null,
      bazna_latitude:  profOsoba?.bazna_latitude  ?? null,
      bazna_longitude: profOsoba?.bazna_longitude ?? null,
    };

    return NextResponse.json({
      korisnik,
      uloge:     (sveUloge ?? []).filter((u: any) => u.naziv !== 'Korisnik usluge'),
      aktivnosti: aktivnosti ?? [],
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Greška servera.' }, { status: 500 });
  }
}

// ─── PATCH schemas ────────────────────────────────────────────────────────────

const urediPodatkeSchema = z.object({
  action:        z.literal('uredi_podatke'),
  ime:           z.string().min(1).max(100),
  prezime:       z.string().min(1).max(100),
  broj_telefona: z.string().max(30).optional().nullable(),
  adresa:        z.string().max(255).optional().nullable(),
  // US-48: bazna lokacija servisera (opcionalno)
  bazna_latitude:  z.number().min(-90).max(90).optional().nullable(),
  bazna_longitude: z.number().min(-180).max(180).optional().nullable(),
});

const suspendujSchema = z.object({
  action: z.literal('suspenduj'),
  razlog: z.string().min(3).max(500),
});

const aktivirajSchema = z.object({
  action: z.literal('aktiviraj'),
});

const promijeniUloguSchema = z.object({
  action:       z.literal('promijeni_ulogu'),
  nova_uloga_id: z.number().int().positive(),
});

const patchSchema = z.discriminatedUnion('action', [
  urediPodatkeSchema,
  suspendujSchema,
  aktivirajSchema,
  promijeniUloguSchema,
]);

// ─── PATCH /api/admin/users/[id] ─────────────────────────────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    const resolved = await params;
    const ciljId = resolved.id;

    const sesija = createClient();
    const { data: { user } } = await sesija.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 });

    const db = sesija as any;
    if (!(await provjeriAdminPristup(db, user.id))) {
      return NextResponse.json({ error: 'Pristup odbijen.' }, { status: 403 });
    }

    let admin: ReturnType<typeof createAdminClient>;
    try { admin = createAdminClient(); } catch {
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY nije konfigurisan.' }, { status: 503 });
    }
    const adb = admin as any;

    const raw = await req.json();
    const parsed = patchSchema.safeParse(raw);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? 'Neispravni podaci.';
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const body = parsed.data;

    // Determine if korisnik or uposlenik
    const { data: profKorisnik } = await adb
      .from('korisnik_usluge')
      .select('id_korisnika_usluge')
      .eq('id_korisnika_usluge', ciljId)
      .maybeSingle();
    const tip: 'korisnik' | 'uposlenik' = profKorisnik ? 'korisnik' : 'uposlenik';

    // ── uredi_podatke ─────────────────────────────────────────────────────────
    if (body.action === 'uredi_podatke') {
      const patch = {
        ime:           body.ime,
        prezime:       body.prezime,
        broj_telefona: body.broj_telefona ?? null,
        adresa:        body.adresa ?? null,
      };
      const tablica = tip === 'korisnik' ? 'korisnik_usluge' : 'uposlenici';
      const pkKolona = tip === 'korisnik' ? 'id_korisnika_usluge' : 'id_uposlenika';

      const { error } = await adb.from(tablica).update(patch).eq(pkKolona, ciljId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // US-48: bazna lokacija živi na supertype tabeli osoba — ažuriraj odvojeno.
      const promijenjeno = Object.keys(patch);
      if ('bazna_latitude' in body || 'bazna_longitude' in body) {
        const { error: osobaErr } = await adb
          .from('osoba')
          .update({
            bazna_latitude:  body.bazna_latitude  ?? null,
            bazna_longitude: body.bazna_longitude ?? null,
          })
          .eq('id_osobe', ciljId);
        if (osobaErr) return NextResponse.json({ error: osobaErr.message }, { status: 500 });
        promijenjeno.push('bazna_latitude', 'bazna_longitude');
      }

      await upisiAuditLog(adb, {
        user_id:  ciljId,
        actor_id: user.id,
        akcija:   'uredi_podatke',
        detalji:  { promijenjeno },
      });
      return NextResponse.json({ success: true });
    }

    // ── suspenduj ─────────────────────────────────────────────────────────────
    if (body.action === 'suspenduj') {
      if (ciljId === user.id) {
        return NextResponse.json(
          { error: 'Ne možete suspendovati vlastiti nalog.' },
          { status: 403 }
        );
      }
      const { error } = await admin.auth.admin.updateUserById(ciljId, {
        ban_duration: '876000h',
      } as any);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      await upisiAuditLog(adb, {
        user_id:  ciljId,
        actor_id: user.id,
        akcija:   'suspendovan',
        razlog:   body.razlog,
      });
      return NextResponse.json({ success: true });
    }

    // ── aktiviraj ─────────────────────────────────────────────────────────────
    if (body.action === 'aktiviraj') {
      const { error } = await admin.auth.admin.updateUserById(ciljId, {
        ban_duration: 'none',
      } as any);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      await upisiAuditLog(adb, {
        user_id:  ciljId,
        actor_id: user.id,
        akcija:   'aktiviran',
      });
      return NextResponse.json({ success: true });
    }

    // ── promijeni_ulogu ───────────────────────────────────────────────────────
    if (body.action === 'promijeni_ulogu') {
      if (tip !== 'uposlenik') {
        return NextResponse.json({
          error: 'Promjena uloge nije podržana za korisnike usluge.',
        }, { status: 400 });
      }
      const { data: novaUloga, error: ulogaErr } = await adb
        .from('uloga')
        .select('naziv')
        .eq('id_uloge', body.nova_uloga_id)
        .single();
      if (ulogaErr || !novaUloga) {
        return NextResponse.json({ error: 'Nepoznata uloga.' }, { status: 400 });
      }

      const { data: stara } = await adb
        .from('uposlenici')
        .select('id_uloge, uloga:uloga(naziv)')
        .eq('id_uposlenika', ciljId)
        .maybeSingle();

      const { error } = await adb
        .from('uposlenici')
        .update({ id_uloge: body.nova_uloga_id })
        .eq('id_uposlenika', ciljId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      await upisiAuditLog(adb, {
        user_id:  ciljId,
        actor_id: user.id,
        akcija:   'uloga_promijenjena',
        detalji:  {
          stara_uloga: procitajNazivUloge((stara as any)?.uloga),
          nova_uloga:  novaUloga.naziv,
        },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Nepoznata akcija.' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Greška servera.' }, { status: 500 });
  }
}
