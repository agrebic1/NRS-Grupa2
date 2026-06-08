import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { premiumCancelSchema } from '@/lib/validations/servisirane';
import { premiumCancelSelfService } from '@/lib/premium/lifecycle';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
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

    const body = await request.json().catch(() => ({}));
    const parsed = premiumCancelSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Neispravan unos.' },
        { status: 400 },
      );
    }

    const rez = await premiumCancelSelfService(
      supabase as any,
      user.id,
      user.id,
      parsed.data.reason,
    );
    if (!rez.ok) {
      return NextResponse.json({ error: rez.message }, { status: rez.status });
    }

    return NextResponse.json({
      success: true,
      premium_status: rez.premium_status,
      cancel_at_period_end: rez.cancel_at_period_end,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Greška servera.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
