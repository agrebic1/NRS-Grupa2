import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/** GET /api/notifikacije - lista notifikacija za prijavljenog korisnika */
export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 });

    const url    = new URL(request.url);
    const samo_neprocitane = url.searchParams.get('neprocitane') === 'true';
    const limit  = Math.min(Number(url.searchParams.get('limit') ?? '30'), 50);

    const db = supabase as any;
    let query = db
      .from('notifikacije')
      .select('*')
      .eq('korisnik_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (samo_neprocitane) query = query.eq('procitano', false);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { count } = await db
      .from('notifikacije')
      .select('*', { count: 'exact', head: true })
      .eq('korisnik_id', user.id)
      .eq('procitano', false);

    return NextResponse.json({ notifikacije: data ?? [], neprocitane: count ?? 0 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Greška servera.' },
      { status: 500 }
    );
  }
}

/** PATCH /api/notifikacije - označi sve kao pročitano */
export async function PATCH() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 });

    const db = supabase as any;
    const { error } = await db
      .from('notifikacije')
      .update({ procitano: true })
      .eq('korisnik_id', user.id)
      .eq('procitano', false);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Greška servera.' },
      { status: 500 }
    );
  }
}
