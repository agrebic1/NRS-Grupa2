import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { premiumRenewSimulated } from '@/lib/premium/lifecycle';

export const dynamic = 'force-dynamic';

export async function POST() {
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

    const rez = await premiumRenewSimulated(supabase as any, user.id, user.id);
    if (!rez.ok) {
      return NextResponse.json({ error: rez.message }, { status: rez.status });
    }

    return NextResponse.json({
      success: true,
      premium_status: 'active' as const,
      premium_started_at: rez.premium_started_at,
      premium_expires_at: rez.premium_expires_at,
      premium_plan: rez.premium_plan,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Greška servera.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
