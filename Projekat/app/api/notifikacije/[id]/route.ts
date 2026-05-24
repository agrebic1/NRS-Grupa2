import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type RouteParams = { id: string } | Promise<{ id: string }>;

/** PATCH /api/notifikacije/[id] - označi jednu notifikaciju kao pročitanu */
export async function PATCH(
  _req: Request,
  { params }: { params: RouteParams }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 });

    const resolved = await params;
    const id = parseInt(resolved.id, 10);
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ error: 'Neispravan ID.' }, { status: 400 });
    }

    const db = supabase as any;
    const { error } = await db
      .from('notifikacije')
      .update({ procitano: true })
      .eq('id', id)
      .eq('korisnik_id', user.id); // osigurava vlasništvo

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Greška servera.' },
      { status: 500 }
    );
  }
}
