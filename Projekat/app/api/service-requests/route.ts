import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  preferredScheduleBaseSchema,
  preferredScheduleSchema,
  serviceRequestSchema,
} from '@/lib/validations/servisirane';
import {
  izracunajUrgency,
  URGENCY_SCORE_MAKS,
} from '@/lib/servisirane/urgency';
import type { TriageOdgovori } from '@/domain/types/servisirane';
import {
  serializujKategoriju,
  validnaKombinacijaKategorije,
} from '@/lib/servisirane/kategorije';
import { dodijeliKorisnickeBrojeveZahtjeva } from '@/lib/servisirane/korisnickiBrojZahtjeva';
import {
  notifKorisnikusZahtjevPrimljen,
  notifUposleniciNoviZahtjev,
} from '@/lib/servisirane/notifikacijeHelper';
import { checkRateLimit } from '@/lib/rateLimiter';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

type PremiumStatus =
  | 'inactive'
  | 'pending_payment'
  | 'active'
  | 'expired'
  | 'cancelled';

function danasIsoLokalno(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Preferirani termin (Sprint 7): jedan slot ili bez preferencije. */
const scheduleSchema = z
  .object(preferredScheduleBaseSchema.shape)
  .superRefine((data, ctx) => {
    const base = preferredScheduleSchema.safeParse(data);
    if (!base.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: base.error.errors[0].message,
        path: base.error.errors[0].path,
      });
      return;
    }

    const bezPreference = data.no_preferred_time === true;
    if (bezPreference) {
      return;
    }

    const t = data.termini[0];
    if (t.date < danasIsoLokalno()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Datum ne smije biti u prošlosti.',
        path: ['termini', 0, 'date'],
      });
    }
  })
  .optional()
  .nullable();

export async function GET() {
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

    const db = supabase as any;
    const { data, error } = await db
      .from('service_requests')
      .select('*')
      .eq('user_id', user.id)
      // Samo aktivni zahtjevi — završeni/otkazani/odbijeni su u /historija.
      .not('status', 'in', '("zavrseno","zatvoreno","otkazano","odbijeno")')
      .order('created_at', { ascending: false });

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    const zahtjevi = dodijeliKorisnickeBrojeveZahtjeva(data ?? []);
    return NextResponse.json({ zahtjevi });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Greška servera.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

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

    if (!user.email_confirmed_at) {
      return NextResponse.json(
        { error: 'Potvrdite email adresu prije slanja zahtjeva.' },
        { status: 403 },
      );
    }

    // API-RISK-6: max 5 novih zahtjeva po korisniku u 60 sekundi
    const rl = checkRateLimit(`service-request:${user.id}`, {
      windowMs: 60_000,
      max: 5,
    });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Previše zahtjeva. Pričekajte minutu i pokušajte ponovo.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
          },
        },
      );
    }

    const db = supabase as any;
    let { data: korisnikUsluge, error: korisnikUslugeError } = await db
      .from('korisnik_usluge')
      .select('id_korisnika_usluge, is_premium, premium_status')
      .eq('id_korisnika_usluge', user.id)
      .maybeSingle();
    if (korisnikUslugeError?.message?.includes("'premium_status' column")) {
      const fallback = await db
        .from('korisnik_usluge')
        .select('id_korisnika_usluge, is_premium')
        .eq('id_korisnika_usluge', user.id)
        .maybeSingle();
      korisnikUsluge = fallback.data as typeof korisnikUsluge;
      korisnikUslugeError = fallback.error;
    }
    if (korisnikUslugeError?.message?.includes("'is_premium' column")) {
      const fallback = await db
        .from('korisnik_usluge')
        .select('id_korisnika_usluge')
        .eq('id_korisnika_usluge', user.id)
        .maybeSingle();
      korisnikUsluge = fallback.data as typeof korisnikUsluge;
      korisnikUslugeError = fallback.error;
    }

    if (korisnikUslugeError) {
      return NextResponse.json(
        { error: korisnikUslugeError.message },
        { status: 500 },
      );
    }
    if (!korisnikUsluge) {
      return NextResponse.json(
        { error: 'Samo korisnik usluge može kreirati zahtjev.' },
        { status: 403 },
      );
    }

    const body = await request.json();

    // Validate
    const rezultat = serviceRequestSchema.safeParse(body);
    if (!rezultat.success) {
      return NextResponse.json(
        { error: rezultat.error.errors[0].message },
        { status: 400 },
      );
    }

    const scheduleResult = scheduleSchema.safeParse(body.preferred_schedule);
    if (!scheduleResult.success) {
      return NextResponse.json(
        { error: scheduleResult.error.errors[0].message },
        { status: 400 },
      );
    }

    const {
      triage,
      category,
      category_main,
      category_sub,
      is_premium,
      premium_terms_accepted,
      ...ostalo
    } = rezultat.data;
    const premiumStatus =
      (korisnikUsluge.premium_status as PremiumStatus | null | undefined) ??
      null;
    const premiumAktivan =
      premiumStatus === 'active' ||
      (korisnikUsluge.is_premium === true && premiumStatus === null);
    if (is_premium && !premiumAktivan) {
      const razlog =
        premiumStatus === 'pending_payment'
          ? 'Premium aktivacija je u toku. Dovršite aktivaciju prije slanja premium zahtjeva.'
          : premiumStatus === 'expired'
            ? 'Premium paket je istekao. Obnovite premium uslugu prije slanja premium zahtjeva.'
            : 'Premium hitna intervencija je dostupna samo za premium korisnike.';
      return NextResponse.json({ error: razlog }, { status: 403 });
    }
    if (is_premium && premium_terms_accepted !== true) {
      return NextResponse.json(
        { error: 'Potrebno je potvrditi uslove premium usluge.' },
        { status: 400 },
      );
    }
    const kombinacijaValidna = validnaKombinacijaKategorije(
      category_main,
      category_sub,
    );
    const resolvedCategory =
      kombinacijaValidna && category_main && category_sub
        ? serializujKategoriju(category_main, category_sub)
        : null;
    if ((category_main || category_sub) && !kombinacijaValidna) {
      return NextResponse.json(
        { error: 'Neispravna kombinacija kategorije i podkategorije.' },
        { status: 400 },
      );
    }
    const premiumZahtjev = is_premium === true;
    const urgency_score = premiumZahtjev
      ? URGENCY_SCORE_MAKS
      : izracunajUrgency(triage as TriageOdgovori);
    const triage_json = premiumZahtjev ? null : (triage as TriageOdgovori);

    const insertPayload = {
      user_id: user.id,
      ...ostalo,
      category: resolvedCategory?.category ?? category,
      category_main: resolvedCategory?.category_main ?? null,
      category_sub: resolvedCategory?.category_sub ?? null,
      is_premium: premiumZahtjev,
      premium_terms_accepted: premiumZahtjev ? true : false,
      premium_requested_at: premiumZahtjev ? new Date().toISOString() : null,
      urgent_requested: premiumZahtjev,
      urgent_requested_at: premiumZahtjev ? new Date().toISOString() : null,
      triage_json,
      urgency_score,
      system_score: urgency_score,
      status: 'pending_review',
      final_priority: null,
      preferred_schedule: scheduleResult.data,
    };

    let { data, error } = await db
      .from('service_requests')
      .insert(insertPayload)
      .select()
      .single();

    // Fallback: ako DB još nema latitude/longitude kolone, pokušaj bez njih.
    if (
      error?.message?.includes("'latitude' column") ||
      error?.message?.includes("'longitude' column")
    ) {
      const bezKoordinata: Record<string, unknown> = { ...insertPayload };
      delete bezKoordinata.latitude;
      delete bezKoordinata.longitude;
      const retry = await db
        .from('service_requests')
        .insert(bezKoordinata)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    // Fallback: ako DB još nema category_main/category_sub kolone, pokušaj bez njih.
    if (
      error?.message?.includes("'category_main' column") ||
      error?.message?.includes("'category_sub' column")
    ) {
      const legacyKategorijePayload: Record<string, unknown> = {
        ...insertPayload,
      };
      delete legacyKategorijePayload.category_main;
      delete legacyKategorijePayload.category_sub;
      const retry = await db
        .from('service_requests')
        .insert(legacyKategorijePayload)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    // Fallback: ako DB još nema premium kolone, pokušaj bez njih.
    if (
      error?.message?.includes("'is_premium' column") ||
      error?.message?.includes("'premium_terms_accepted' column") ||
      error?.message?.includes("'premium_requested_at' column")
    ) {
      const legacyPremiumPayload: Record<string, unknown> = {
        ...insertPayload,
      };
      delete legacyPremiumPayload.is_premium;
      delete legacyPremiumPayload.premium_terms_accepted;
      delete legacyPremiumPayload.premium_requested_at;
      const retry = await db
        .from('service_requests')
        .insert(legacyPremiumPayload)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    // Fallback: ako DB još nema urgent_requested kolone, pokušaj bez njih.
    if (
      error?.message?.includes("'urgent_requested' column") ||
      error?.message?.includes("'urgent_requested_at' column")
    ) {
      const legacyUrgentPayload: Record<string, unknown> = { ...insertPayload };
      delete legacyUrgentPayload.urgent_requested;
      delete legacyUrgentPayload.urgent_requested_at;
      const retry = await db
        .from('service_requests')
        .insert(legacyUrgentPayload)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    // Backward-compat fallback: postojeće šeme koriste status 'na_cekanju'.
    if (error?.message?.toLowerCase().includes('status')) {
      const legacyPayload = {
        ...insertPayload,
        status: 'na_cekanju' as const,
      };
      const legacyRetry = await db
        .from('service_requests')
        .insert(legacyPayload)
        .select()
        .single();
      data = legacyRetry.data;
      error = legacyRetry.error;
    }

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    if (data?.id) {
      const kategorijaLabel =
        (data.category as string | null) ??
        resolvedCategory?.category ??
        category ??
        'Servisni zahtjev';

      await notifKorisnikusZahtjevPrimljen(db, user.id, data.id);
      await notifUposleniciNoviZahtjev(db, data.id, kategorijaLabel);

      // Zadržano: realtime toast na dispečerskom dashboardu
      const { data: uposlenici } = await db
        .from('uposlenici')
        .select('id_uposlenika, uloga:uloga(naziv)');
      const recipients = (uposlenici ?? []).filter((u: any) => {
        const naziv = Array.isArray(u.uloga)
          ? (u.uloga[0] as { naziv?: string } | undefined)?.naziv
          : (u.uloga as { naziv?: string } | null)?.naziv;
        const n = (naziv ?? '').toLowerCase();
        return (
          n === 'dispečer' ||
          n === 'dispecer' ||
          n === 'administrator' ||
          n === 'admin'
        );
      });
      if (recipients.length > 0) {
        const isPremiumRequest = is_premium === true;
        const alertTitle = isPremiumRequest
          ? 'Premium zahtjev'
          : 'Novi zahtjev';
        const alertMessage = isPremiumRequest
          ? `Premium zahtjev #${data.id} čeka prioritetnu obradu.`
          : `Novi zahtjev #${data.id} je pristigao i čeka obradu.`;
        await db.from('dispatcher_alerts').insert(
          recipients.map((u: any) => ({
            recipient_user_id: u.id_uposlenika,
            service_request_id: data.id,
            title: alertTitle,
            message: alertMessage,
          })),
        );
      }
    }

    const { data: sviRedovi } = await db
      .from('service_requests')
      .select('id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .order('id', { ascending: true });
    const sBrojevima = dodijeliKorisnickeBrojeveZahtjeva(sviRedovi ?? []);
    const ovaj = sBrojevima.find((r: any) => r.id === data.id);
    const korisnickiBrojZahtjeva =
      ovaj?.korisnicki_broj_zahtjeva ?? sBrojevima.length;

    return NextResponse.json(
      {
        zahtjev: { ...data, korisnicki_broj_zahtjeva: korisnickiBrojZahtjeva },
        korisnicki_broj_zahtjeva: korisnickiBrojZahtjeva,
      },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Greška servera.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
