import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import {
  izracunajIstek,
  safeInsertPremiumEvent,
} from '@/lib/premium/lifecycle';

export const dynamic = 'force-dynamic';

function procitajNazivUloge(
  uloga:
    | { naziv?: string | null }
    | { naziv?: string | null }[]
    | null
    | undefined,
) {
  const zapis = Array.isArray(uloga) ? uloga[0] : uloga;
  return zapis?.naziv ?? '';
}

async function jeAdminKorisnik(db: any, idKorisnika: string): Promise<boolean> {
  const { data: uposlenik, error } = await db
    .from('uposlenici')
    .select('uloga:uloga(naziv)')
    .eq('id_uposlenika', idKorisnika)
    .maybeSingle();
  if (error || !uposlenik) return false;
  const naziv = procitajNazivUloge(uposlenik.uloga).toLowerCase();
  return naziv === 'administrator' || naziv === 'admin';
}

const legacyBodySchema = z.object({
  isPremium: z.boolean(),
});

const actionBodySchema = z.object({
  action: z.enum([
    'set_active',
    'set_inactive',
    'set_pending_payment',
    'set_cancelled',
    'set_expired',
  ]),
  reason: z.string().max(500).optional().nullable(),
});

type RouteParams = { id: string } | Promise<{ id: string }>;

async function upsertKorisnikUsluge(
  db: any,
  ciljId: string,
  patch: Record<string, unknown>,
): Promise<{ ok: true } | { ok: false; message: string; status: number }> {
  const { error } = await db
    .from('korisnik_usluge')
    .update(patch)
    .eq('id_korisnika_usluge', ciljId);
  if (error?.message?.includes('premium_cancelled_at')) {
    const {
      premium_cancelled_at: _a,
      premium_cancel_reason: _b,
      ...rest
    } = patch;
    const { error: fb } = await db
      .from('korisnik_usluge')
      .update(rest)
      .eq('id_korisnika_usluge', ciljId);
    if (fb) return { ok: false, message: fb.message, status: 500 };
    return { ok: true };
  }
  if (error) return { ok: false, message: error.message, status: 500 };
  return { ok: true };
}

export async function PATCH(
  request: Request,
  { params }: { params: RouteParams },
) {
  try {
    const resolved = await params;
    const ciljId = resolved.id;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Niste prijavljeni.' },
        { status: 401 },
      );
    }

    const db = supabase as any;
    const jeAdmin = await jeAdminKorisnik(db, user.id);
    if (!jeAdmin) {
      return NextResponse.json(
        { error: 'Nemate dozvolu za ovu akciju.' },
        { status: 403 },
      );
    }

    const raw = await request.json();

    const { data: postojeci, error: checkErr } = await db
      .from('korisnik_usluge')
      .select('id_korisnika_usluge')
      .eq('id_korisnika_usluge', ciljId)
      .maybeSingle();
    if (checkErr) {
      return NextResponse.json({ error: checkErr.message }, { status: 500 });
    }
    if (!postojeci) {
      return NextResponse.json(
        { error: 'Premium status je dostupan samo korisnicima usluge.' },
        { status: 400 },
      );
    }

    const actionParsed = actionBodySchema.safeParse(raw);
    if (actionParsed.success) {
      const { action, reason } = actionParsed.data;
      const sada = new Date();
      const trimmedReason = reason?.trim() || null;

      let patch: Record<string, unknown>;
      let eventType: string;
      let payload: Record<string, unknown>;

      switch (action) {
        case 'set_active': {
          const premium_started_at = sada.toISOString();
          const premium_expires_at = izracunajIstek(sada);
          patch = {
            is_premium: true,
            premium_status: 'active',
            premium_started_at,
            premium_expires_at,
            premium_plan: 'monthly',
            premium_cancelled_at: null,
            premium_cancel_reason: null,
          };
          eventType = 'premium_activated_admin';
          payload = {
            premium_status: 'active',
            premium_started_at,
            premium_expires_at,
            premium_plan: 'monthly',
            source: 'admin_lifecycle',
            action: 'set_active',
          };
          break;
        }
        case 'set_inactive': {
          patch = {
            is_premium: false,
            premium_status: 'inactive',
            premium_started_at: null,
            premium_expires_at: null,
            premium_plan: null,
            premium_cancelled_at: null,
            premium_cancel_reason: null,
          };
          eventType = 'premium_deactivated_admin';
          payload = {
            premium_status: 'inactive',
            source: 'admin_lifecycle',
            action: 'set_inactive',
            reason: trimmedReason,
          };
          break;
        }
        case 'set_pending_payment': {
          patch = {
            is_premium: false,
            premium_status: 'pending_payment',
            premium_started_at: null,
            premium_expires_at: null,
            premium_plan: null,
            premium_cancelled_at: null,
            premium_cancel_reason: null,
          };
          eventType = 'premium_admin_pending_payment';
          payload = {
            premium_status: 'pending_payment',
            source: 'admin_lifecycle',
            action: 'set_pending_payment',
            reason: trimmedReason,
          };
          break;
        }
        case 'set_cancelled': {
          const premium_cancelled_at = sada.toISOString();
          patch = {
            is_premium: false,
            premium_status: 'cancelled',
            premium_started_at: null,
            premium_expires_at: null,
            premium_plan: null,
            premium_cancelled_at,
            premium_cancel_reason: trimmedReason,
          };
          eventType = 'premium_admin_cancelled';
          payload = {
            premium_status: 'cancelled',
            premium_cancel_reason: trimmedReason,
            source: 'admin_lifecycle',
            action: 'set_cancelled',
          };
          break;
        }
        case 'set_expired': {
          patch = {
            is_premium: false,
            premium_status: 'expired',
            premium_started_at: null,
            premium_expires_at: null,
            premium_plan: null,
            premium_cancelled_at: null,
            premium_cancel_reason: null,
          };
          eventType = 'premium_admin_expired';
          payload = {
            premium_status: 'expired',
            source: 'admin_lifecycle',
            action: 'set_expired',
            reason: trimmedReason,
          };
          break;
        }
        default:
          return NextResponse.json(
            { error: 'Nepoznata akcija.' },
            { status: 400 },
          );
      }

      const up = await upsertKorisnikUsluge(db, ciljId, patch);
      if (!up.ok)
        return NextResponse.json({ error: up.message }, { status: up.status });

      const ev = await safeInsertPremiumEvent(db, {
        user_id: ciljId,
        actor_user_id: user.id,
        event_type: eventType,
        payload_json: payload,
      });
      if (!ev.ok)
        return NextResponse.json({ error: ev.message }, { status: 500 });

      return NextResponse.json({ success: true });
    }

    const legacyParsed = legacyBodySchema.safeParse(raw);
    if (!legacyParsed.success) {
      return NextResponse.json(
        { error: 'Neispravan payload. Koristite isPremium ili action.' },
        { status: 400 },
      );
    }

    const { isPremium } = legacyParsed.data;
    const sada = new Date();
    const premium_started_at = isPremium ? sada.toISOString() : null;
    const premium_expires_at = isPremium ? izracunajIstek(sada) : null;
    const premium_status = isPremium ? 'active' : 'inactive';

    const patch: Record<string, unknown> = {
      is_premium: isPremium,
      premium_status,
      premium_started_at,
      premium_expires_at,
      premium_plan: isPremium ? 'monthly' : null,
      premium_cancelled_at: null,
      premium_cancel_reason: null,
    };

    const up = await upsertKorisnikUsluge(db, ciljId, patch);
    if (up.ok === false) {
      if (up.message?.includes("'is_premium' column")) {
        return NextResponse.json(
          {
            error:
              'Kolona is_premium ne postoji. Primijenite premium migracije.',
          },
          { status: 400 },
        );
      }
      return NextResponse.json({ error: up.message }, { status: up.status });
    }

    const ev = await safeInsertPremiumEvent(db, {
      user_id: ciljId,
      actor_user_id: user.id,
      event_type: isPremium
        ? 'premium_activated_admin'
        : 'premium_deactivated_admin',
      payload_json: {
        premium_status,
        premium_started_at,
        premium_expires_at,
        premium_plan: isPremium ? 'monthly' : null,
        source: 'admin_override',
      },
    });

    if (!ev.ok)
      return NextResponse.json({ error: ev.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Greška servera.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
