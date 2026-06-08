import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  cancelRequestSchema,
  updateRequestSchema,
} from '@/lib/validations/servisirane';
import { korisnickiBrojZahtjevaZaId } from '@/lib/servisirane/korisnickiBrojZahtjeva';
import { korisnikSmijeMijenjatiIliOtkazatiZahtjev } from '@/lib/servisirane/statusZahtjeva';

export const dynamic = 'force-dynamic';

type RouteParams = { id: string } | Promise<{ id: string }>;

async function resolveRequestId(params: RouteParams): Promise<number | null> {
  const resolved = await params;
  const parsed = Number.parseInt(resolved.id, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

export async function GET(
  _request: Request,
  { params }: { params: RouteParams },
) {
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

    const requestId = await resolveRequestId(params);
    if (!requestId) {
      return NextResponse.json(
        { error: 'Neispravan ID zahtjeva.' },
        { status: 400 },
      );
    }

    const db = supabase as any;
    const { data, error } = await db
      .from('service_requests')
      .select('*')
      .eq('id', requestId)
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Zahtjev nije pronađen.' },
        { status: 404 },
      );
    }

    const { data: redoviAsc } = await db
      .from('service_requests')
      .select('id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .order('id', { ascending: true });

    const korisnicki_broj_zahtjeva = redoviAsc
      ? korisnickiBrojZahtjevaZaId(redoviAsc, requestId)
      : null;

    return NextResponse.json({
      zahtjev: {
        ...data,
        korisnicki_broj_zahtjeva: korisnicki_broj_zahtjeva ?? undefined,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Greška servera.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: RouteParams },
) {
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

    const requestId = await resolveRequestId(params);
    if (!requestId) {
      return NextResponse.json(
        { error: 'Neispravan ID zahtjeva.' },
        { status: 400 },
      );
    }

    const db = supabase as any;

    // Provjeri vlasništvo i status
    const { data: zahtjev } = await db
      .from('service_requests')
      .select('status, user_id, final_priority')
      .eq('id', requestId)
      .single();

    if (!zahtjev) {
      return NextResponse.json(
        { error: 'Zahtjev nije pronađen.' },
        { status: 404 },
      );
    }
    if (zahtjev.user_id !== user.id) {
      return NextResponse.json({ error: 'Pristup odbijen.' }, { status: 403 });
    }
    if (
      !korisnikSmijeMijenjatiIliOtkazatiZahtjev(
        zahtjev.status,
        zahtjev.final_priority,
      )
    ) {
      return NextResponse.json(
        {
          error:
            'Zahtjev se može mijenjati ili otkazati samo dok je „novi“ i dok dispečer još nije snimio operativni prioritet.',
        },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { action, ...rest } = body as { action?: string } & Record<
      string,
      unknown
    >;

    if (action === 'cancel') {
      const rezultat = cancelRequestSchema.safeParse(rest);
      if (!rezultat.success) {
        return NextResponse.json(
          { error: rezultat.error.errors[0].message },
          { status: 400 },
        );
      }

      const { error } = await db
        .from('service_requests')
        .update({
          status: 'otkazano',
          cancel_reason: rezultat.data.cancel_reason,
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error)
        return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    const rezultat = updateRequestSchema.safeParse(rest);
    if (!rezultat.success) {
      return NextResponse.json(
        { error: rezultat.error.errors[0].message },
        { status: 400 },
      );
    }

    const { error } = await db
      .from('service_requests')
      .update(rezultat.data)
      .eq('id', requestId);

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Greška servera.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
