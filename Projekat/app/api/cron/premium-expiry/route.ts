import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

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

async function obradiIstekPremiuma(request: Request) {
  try {
    if (!autorizovanCronPoziv(request)) {
      return NextResponse.json(
        { error: 'Nedozvoljen cron poziv.' },
        { status: 401 },
      );
    }

    let supabase: ReturnType<typeof createAdminClient>;
    try {
      supabase = createAdminClient();
    } catch {
      return NextResponse.json({
        success: true,
        expiredCount: 0,
        skipped: 'service_role_key_not_configured',
      });
    }

    const sadaIso = new Date().toISOString();
    const db = supabase as any;

    const { data: istekli, error: selectErr } = await db
      .from('korisnik_usluge')
      .select('id_korisnika_usluge')
      .eq('premium_status', 'active')
      .not('premium_expires_at', 'is', null)
      .lt('premium_expires_at', sadaIso);

    if (selectErr?.message?.includes("'premium_status' column")) {
      return NextResponse.json(
        {
          error:
            'Premium lifecycle kolone ne postoje. Primijenite premium lifecycle migraciju.',
        },
        { status: 400 },
      );
    }
    if (selectErr) {
      return NextResponse.json({ error: selectErr.message }, { status: 500 });
    }

    const userIds = (istekli ?? []).map((k: any) => k.id_korisnika_usluge);
    if (userIds.length === 0) {
      return NextResponse.json({ success: true, expiredCount: 0 });
    }

    const { error: updateErr } = await db
      .from('korisnik_usluge')
      .update({
        is_premium: false,
        premium_status: 'expired',
        premium_plan: null,
      })
      .in('id_korisnika_usluge', userIds);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    const { error: eventsErr } = await db.from('premium_events').insert(
      userIds.map((userId: string) => ({
        user_id: userId,
        actor_user_id: null,
        event_type: 'premium_expired',
        payload_json: {
          source: 'cron_premium_expiry',
          expired_at: sadaIso,
        },
      })),
    );

    if (eventsErr && !eventsErr.message.includes("'premium_events'")) {
      return NextResponse.json({ error: eventsErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      expiredCount: userIds.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Greška servera.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return obradiIstekPremiuma(request);
}

export async function POST(request: Request) {
  return obradiIstekPremiuma(request);
}
