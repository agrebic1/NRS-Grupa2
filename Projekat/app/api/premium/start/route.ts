import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { premiumStartCheckout } from '@/lib/premium/lifecycle';
import { premiumStartSchema } from '@/lib/validations/servisirane';

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
    const parsed = premiumStartSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Neispravan unos.' },
        { status: 400 },
      );
    }

    const rez = await premiumStartCheckout(
      supabase as any,
      user.id,
      user.id,
      parsed.data.plan,
    );
    if (!rez.ok) {
      return NextResponse.json({ error: rez.message }, { status: rez.status });
    }

    return NextResponse.json({
      success: true,
      premium_status: 'pending_payment' as const,
      premium_plan: parsed.data.plan,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Greška servera.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
