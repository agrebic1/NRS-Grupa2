import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { assertDispatcherAccess } from '@/lib/servisirane/dispecerPristup';
import { korisnickiBrojZahtjevaZaId } from '@/lib/servisirane/korisnickiBrojZahtjeva';
import { premiumZahtijevaObrazlozenjeSmanjenjaPrioriteta } from '@/lib/servisirane/operativniPrioritet';
import { dispecerSmijeMijenjatiOperativniPrioritet } from '@/lib/servisirane/statusZahtjeva';
import { dodijelijeSchema, razlogOperativniSchema } from '@/lib/validations/servisirane';
import { provjeriKonfliktServiseraNaTerminu } from '@/lib/servisirane/konfliktiTermina';
import {
  notifDodjelaIntervencije,
  notifReDodjela,
  notifZatvaranjeIntervencije,
  notifUklanjanjeServisera,
  notifPromjenaIzvrsioca,
  notifKorisnikusServiserDodijeljen,
  notifKorisnikusIntervencijaZavrsena,
  notifKorisnikusIntervencijaZatvorena,
  notifKorisnikusZahtjevUObradi,
  notifNovaNapomenaServiser,
} from '@/lib/servisirane/notifikacijeHelper';
import { z } from 'zod';
import { mapAktivnostiResponse, ucitajAktivnostiSaAutorom } from '@/lib/servisirane/aktivnostiQuery';
import { labelOperativnogPrioriteta } from '@/lib/servisirane/aktivnostiPrikaz';

export const dynamic = 'force-dynamic';

const potvrdiSchema = z.object({
  action:         z.literal('potvrdi'),
  final_priority: z.enum(['NISKO', 'SREDNJE', 'VISOKO', 'KRITIČNO', 'HITNO']),
  premium_downgrade_reason: z.string().max(500).optional(),
});

const odbijSchema = z.object({
  action:           z.literal('odbij'),
  rejection_reason: z.string().min(5, 'Objasnite razlog odbijanja (min. 5 karaktera)').max(500),
});

const promijeniPrioritetSchema = z.object({
  action:                   z.literal('promijeni_prioritet'),
  final_priority:           potvrdiSchema.shape.final_priority,
  premium_downgrade_reason: z.string().max(500).optional(),
});

const zatvorSchema = z.object({
  action:    z.literal('zatvori'),
  napomene:  z.string().max(1000).optional().nullable(),
});

const napomenaDispeSchema = z.object({
  action:  z.literal('napomena'),
  sadrzaj: z.string().min(1, 'Napomena ne može biti prazna.').max(2000, 'Napomena je predugačka (max 2000 znakova).'),
});

const zatvoriFormalnoSchema = z.object({
  action:       z.literal('zatvoriFormalno'),
  closure_note: z.string().max(1000).optional().nullable(),
});

const promijeniIzvrsiocaSchema = z.object({
  action:           z.literal('promijeni_izvrsioca'),
  novi_serviser_id: z.string().uuid('Neispravan ID servisera'),
  razlog:           razlogOperativniSchema,
});

const actionSchema = z.discriminatedUnion('action', [
  potvrdiSchema,
  odbijSchema,
  promijeniPrioritetSchema,
  dodijelijeSchema,
  zatvorSchema,
  napomenaDispeSchema,
  zatvoriFormalnoSchema,
  promijeniIzvrsiocaSchema,
]);
/** Statusi u kojima dispečer može potvrditi/odbiti (MVP: uključuje in_review ako je u inboxu). */
const PENDING_STATUSES = new Set(['na_cekanju', 'pending_review', 'in_review']);

/** Kad dispečer prvi put snimi operativni prioritet, zahtjev prelazi u čarobnjak - korisnik više ne smije uređivati. */
const STATUS_PRE_CAROBNJAKA = new Set(['na_cekanju', 'pending_review']);
type RouteParams = { id: string } | Promise<{ id: string }>;

async function resolveRequestId(params: RouteParams): Promise<number | null> {
  const resolved = await params;
  const parsed = Number.parseInt(resolved.id, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

export async function GET(
  _request: Request,
  { params }: { params: RouteParams }
) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 });
    }

    const requestId = await resolveRequestId(params);
    if (!requestId) {
      return NextResponse.json({ error: 'Neispravan ID zahtjeva.' }, { status: 400 });
    }

    const imaPriv = await assertDispatcherAccess(supabase, user.id);
    if (!imaPriv) {
      return NextResponse.json({ error: 'Pristup odbijen.' }, { status: 403 });
    }

    // Admin klijent zaobilazi RLS za čitanje work_evidence i intervention_activities
    let db: any;
    try {
      db = createAdminClient() as any;
    } catch {
      db = supabase as any;
    }

    const { data: zahtjev, error } = await db
      .from('service_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (error || !zahtjev) {
      return NextResponse.json({ error: 'Zahtjev nije pronađen.' }, { status: 404 });
    }

    const { data: osoba } = await db
      .from('osoba')
      .select('ime, prezime, broj_telefona')
      .eq('id_osobe', zahtjev.user_id)
      .maybeSingle();

    const { data: redoviAsc } = await db
      .from('service_requests')
      .select('id, created_at')
      .eq('user_id', zahtjev.user_id)
      .order('created_at', { ascending: true })
      .order('id', { ascending: true });

    const korisnicki_broj_zahtjeva = redoviAsc
      ? korisnickiBrojZahtjevaZaId(redoviAsc, requestId)
      : null;

    // Serviser profil (ako je dodijeljen)
    let serviserProfil: { id: string; ime: string; prezime: string; broj_telefona: string | null } | null = null;
    if (zahtjev.serviser_dodijeljen_id) {
      const { data: sp } = await db
        .from('osoba')
        .select('id_osobe, ime, prezime, broj_telefona')
        .eq('id_osobe', zahtjev.serviser_dodijeljen_id)
        .maybeSingle();
      if (sp) serviserProfil = { id: sp.id_osobe, ime: sp.ime, prezime: sp.prezime, broj_telefona: sp.broj_telefona };
    }

    const aktivnosti = await ucitajAktivnostiSaAutorom(db, requestId);

    // Evidencija rada
    const { data: evidencije } = await db
      .from('work_evidence')
      .select('*')
      .eq('zahtjev_id', requestId)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      zahtjev: {
        ...zahtjev,
        podnosilac:               osoba ?? null,
        serviser:                 serviserProfil,
        korisnicki_broj_zahtjeva: korisnicki_broj_zahtjeva ?? undefined,
      },
      aktivnosti: mapAktivnostiResponse(aktivnosti),
      evidencije: evidencije  ?? [],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Greška servera.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: RouteParams }
) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 });
    }

    const requestId = await resolveRequestId(params);
    if (!requestId) {
      return NextResponse.json({ error: 'Neispravan ID zahtjeva.' }, { status: 400 });
    }

    const imaPriv = await assertDispatcherAccess(supabase, user.id);
    if (!imaPriv) {
      return NextResponse.json({ error: 'Pristup odbijen.' }, { status: 403 });
    }

    // Admin klijent zaobilazi RLS za pisanje u service_requests.
    // Auth provjera je već urađena via assertDispatcherAccess iznad.
    let db: any;
    try {
      db = createAdminClient() as any;
    } catch {
      db = supabase as any;
    }

    const body     = await request.json();
    const rezultat = actionSchema.safeParse(body);

    if (!rezultat.success) {
      return NextResponse.json({ error: rezultat.error.errors[0].message }, { status: 400 });
    }

    const { data: zahtjev } = await db
      .from('service_requests')
      .select('status, is_premium, closed_at, serviser_dodijeljen_id, final_priority, serviser_odbio_razlog')
      .eq('id', requestId)
      .single();

    if (!zahtjev) {
      return NextResponse.json({ error: 'Zahtjev nije pronađen.' }, { status: 404 });
    }

    const podaci = rezultat.data;

    // ── US-28: Promjena izvršioca ─────────────────────────────────────────────
    if (podaci.action === 'promijeni_izvrsioca') {
      const DOZVOLJENI_STATUSI = new Set(['dodijeljeno', 'u_radu', 'u_izvrsenju']);
      if (!DOZVOLJENI_STATUSI.has(zahtjev.status)) {
        return NextResponse.json(
          { error: 'Promjena izvršioca moguća je samo za aktivne intervencije (dodijeljeno, u_radu, u_izvrsenju).' },
          { status: 422 }
        );
      }

      const stariServIserId = zahtjev.serviser_dodijeljen_id as string | null;

      // Provjeri da novi serviser postoji
      const { data: noviServiser } = await db
        .from('osoba')
        .select('ime, prezime')
        .eq('id_osobe', podaci.novi_serviser_id)
        .maybeSingle();
      if (!noviServiser) {
        return NextResponse.json({ error: 'Novi serviser nije pronađen.' }, { status: 404 });
      }

      const noviServiserIme = `${noviServiser.ime} ${noviServiser.prezime}`.trim();

      let stariServiserIme: string | null = null;
      if (stariServIserId) {
        const { data: stariOsoba } = await db
          .from('osoba')
          .select('ime, prezime')
          .eq('id_osobe', stariServIserId)
          .maybeSingle();
        if (stariOsoba) {
          stariServiserIme = `${stariOsoba.ime} ${stariOsoba.prezime}`.trim();
        }
      }
      const stariServiserPrikaz = stariServiserIme ?? 'Nije bio dodijeljen';

      const { error: updErr } = await db
        .from('service_requests')
        .update({ serviser_dodijeljen_id: podaci.novi_serviser_id })
        .eq('id', requestId);
      if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

      // Audit: old/new = imena servisera (US-39 / US-28), ID-evi u metadata
      await db.from('intervention_activities').insert({
        zahtjev_id: requestId,
        autor_id:   user.id,
        tip:        'promjena_izvrsioca',
        sadrzaj:    `Promjena izvršioca: ${stariServiserPrikaz} → ${noviServiserIme}. Razlog: ${podaci.razlog}`,
        old_value:  stariServiserPrikaz,
        new_value:  noviServiserIme,
        actor_role: 'dispecer',
        razlog:     podaci.razlog,
        metadata:   {
          iz_servisera_id: stariServIserId,
          na_servisera_id: podaci.novi_serviser_id,
          iz_servisera_ime: stariServiserIme,
          na_servisera_ime: noviServiserIme,
        },
      });

      // Notifikacija novom serviseru
      const imeStarogServs = stariServiserIme ?? 'prethodnog servisera';
      await notifPromjenaIzvrsioca(db, podaci.novi_serviser_id, requestId, imeStarogServs);

      // Notifikacija starom serviseru (uklanjanje)
      if (stariServIserId && stariServIserId !== podaci.novi_serviser_id) {
        await notifUklanjanjeServisera(db, stariServIserId, requestId);
      }

      return NextResponse.json({ success: true, novi_serviser_id: podaci.novi_serviser_id });
    }

    if (podaci.action === 'promijeni_prioritet') {
      if (!dispecerSmijeMijenjatiOperativniPrioritet(zahtjev.status)) {
        return NextResponse.json(
          { error: 'Operativni prioritet se ne može mijenjati u ovom statusu.' },
          { status: 400 },
        );
      }
      if (
        zahtjev.is_premium === true &&
        premiumZahtijevaObrazlozenjeSmanjenjaPrioriteta(podaci.final_priority) &&
        (!podaci.premium_downgrade_reason || podaci.premium_downgrade_reason.trim().length < 10)
      ) {
        return NextResponse.json(
          {
            error:
              'Premium zahtjev mora ostati u hitnoj operativnoj grupi (HITNO, KRITIČNO ili VISOKO) ili unesite obrazloženje (min. 10 karaktera).',
          },
          { status: 400 },
        );
      }
      const izmjena: {
        final_priority: string;
        premium_priority_override_reason: string | null;
        status?: 'in_review';
      } = {
        final_priority: podaci.final_priority,
        premium_priority_override_reason:
          zahtjev.is_premium === true &&
          premiumZahtijevaObrazlozenjeSmanjenjaPrioriteta(podaci.final_priority)
            ? podaci.premium_downgrade_reason?.trim() ?? null
            : null,
      };
      if (STATUS_PRE_CAROBNJAKA.has(zahtjev.status)) {
        izmjena.status = 'in_review';
      }

      const { error } = await db.from('service_requests').update(izmjena).eq('id', requestId);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      const stariPrioritet = (zahtjev.final_priority as string | null) ?? null;
      const stariLabel = labelOperativnogPrioriteta(stariPrioritet);
      const noviLabel = labelOperativnogPrioriteta(podaci.final_priority);
      const premiumRazlog =
        zahtjev.is_premium === true &&
        premiumZahtijevaObrazlozenjeSmanjenjaPrioriteta(podaci.final_priority)
          ? podaci.premium_downgrade_reason?.trim() ?? null
          : null;

      await db.from('intervention_activities').insert({
        zahtjev_id: requestId,
        autor_id:   user.id,
        tip:        'promjena_prioriteta',
        sadrzaj:    `Operativni prioritet: ${stariLabel} → ${noviLabel}`,
        old_value:  stariLabel,
        new_value:  noviLabel,
        actor_role: 'dispecer',
        razlog:     premiumRazlog,
        metadata:   {
          stari_prioritet: stariPrioritet,
          novi_prioritet: podaci.final_priority,
          stari_prioritet_label: stariLabel,
          novi_prioritet_label: noviLabel,
          ...(premiumRazlog ? { premium_downgrade_reason: premiumRazlog } : {}),
        },
      });

      if (izmjena.status) {
        await db.from('intervention_activities').insert({
          zahtjev_id: requestId,
          autor_id:   user.id,
          tip:        'status_promjena',
          sadrzaj:    'Zahtjev prebačen u obradu nakon postavljanja prioriteta.',
          old_value:  zahtjev.status,
          new_value:  'in_review',
          actor_role: 'dispecer',
          metadata:   { iz: zahtjev.status, u: 'in_review', final_priority: podaci.final_priority },
        });
      }

      return NextResponse.json({ success: true });
    }

    // ── Dodjela servisera (s provjerom konflikta termina) ─────────────────────
    if (podaci.action === 'dodijeli') {
      const DOZVOLJENI_ZA_DODJELU = new Set(['potvrdeno', 'dodijeljeno', 'na_cekanju', 'pending_review', 'in_review']);
      if (!DOZVOLJENI_ZA_DODJELU.has(zahtjev.status)) {
        return NextResponse.json(
          { error: 'Dodjela servisera moguća je samo za potvrđene zahtjeve.' },
          { status: 400 }
        );
      }

      // Provjera konflikta termina (samo ako su oba termina prisutna i override nije aktivan)
      if (
        podaci.termin_planirani_pocetak &&
        podaci.termin_planirani_kraj &&
        !podaci.override_konflikt
      ) {
        const konflikt = await provjeriKonfliktServiseraNaTerminu(
          db,
          podaci.serviser_id,
          podaci.termin_planirani_pocetak,
          podaci.termin_planirani_kraj,
          requestId
        );
        if (konflikt) {
          return NextResponse.json(
            {
              error:    'Serviser ima drugu intervenciju u odabranom terminu.',
              kod:      'KONFLIKT_TERMINA',
              konflikt,
            },
            { status: 409 }
          );
        }
      }

      // Evidentiramo override konflikta ako je prisutan
      if (podaci.override_konflikt) {
        await db.from('intervention_activities').insert({
          zahtjev_id: requestId,
          autor_id:   user.id,
          tip:        'konflikt_override',
          sadrzaj:    `Dispečer prihvatio konflikt termina. Razlog: ${podaci.razlog_konflikta ?? 'nije naveden'}`,
          metadata:   { serviser_id: podaci.serviser_id },
        });
      }

      const izmjena: Record<string, unknown> = {
        status:                 'dodijeljeno',
        serviser_dodijeljen_id: podaci.serviser_id,
        serviser_odbio_razlog:  null, // resetuj pri svakoj novoj dodjeli
      };
      if (podaci.termin_planirani_pocetak !== undefined)
        izmjena.termin_planirani_pocetak = podaci.termin_planirani_pocetak;
      if (podaci.termin_planirani_kraj !== undefined)
        izmjena.termin_planirani_kraj = podaci.termin_planirani_kraj;
      if (podaci.procijenjeno_trajanje !== undefined)
        izmjena.procijenjeno_trajanje = podaci.procijenjeno_trajanje;
      if (podaci.dispecer_napomene !== undefined)
        izmjena.dispecer_napomene = podaci.dispecer_napomene;

      const { error: updErr } = await db
        .from('service_requests')
        .update(izmjena)
        .eq('id', requestId);

      if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

      const { data: serviserOsoba } = await db
        .from('osoba')
        .select('ime, prezime')
        .eq('id_osobe', podaci.serviser_id)
        .maybeSingle();
      const imeServisera = serviserOsoba
        ? `${serviserOsoba.ime} ${serviserOsoba.prezime}`.trim()
        : 'Serviser';

      await db.from('intervention_activities').insert({
        zahtjev_id: requestId,
        autor_id:   user.id,
        tip:        'dodjela',
        sadrzaj:    `Dodjela serviseru: ${imeServisera}`,
        old_value:  zahtjev.status,
        new_value:  imeServisera,
        actor_role: 'dispecer',
        metadata:   {
          serviser_id: podaci.serviser_id,
          serviser_ime: imeServisera,
          iz: zahtjev.status,
          u: 'dodijeljeno',
        },
      });

      // Notifikacija serviseru — posebna poruka ako je re-dodjela (prethodni serviser je odbio)
      const razlogOdbijanja = zahtjev.serviser_odbio_razlog as string | null;
      if (razlogOdbijanja) {
        await notifReDodjela(db, podaci.serviser_id, requestId, razlogOdbijanja);
      } else {
        await notifDodjelaIntervencije(db, podaci.serviser_id, requestId);
      }

      // Notifikacija korisniku - serviser dodijeljen
      const { data: zahtjevUser } = await db
        .from('service_requests').select('user_id').eq('id', requestId).maybeSingle();
      const terminTekst  = podaci.termin_planirani_pocetak
        ? new Date(podaci.termin_planirani_pocetak as string).toLocaleString('bs-BA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : undefined;
      if (zahtjevUser?.user_id) {
        await notifKorisnikusServiserDodijeljen(db, zahtjevUser.user_id, requestId, imeServisera, terminTekst);
      }

      return NextResponse.json({ success: true, novi_status: 'dodijeljeno' });
    }

    // ── US-30: Napomena dispečera ─────────────────────────────────────────────
    if (podaci.action === 'napomena') {
      const { error: insErr } = await db.from('intervention_activities').insert({
        zahtjev_id: requestId,
        autor_id:   user.id,
        tip:        'napomena',
        sadrzaj:    podaci.sadrzaj.trim(),
        metadata:   null,
      });
      if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

      // Notify assigned serviser about dispatcher note
      const { data: zahtjevNap } = await db
        .from('service_requests').select('serviser_dodijeljen_id').eq('id', requestId).maybeSingle();
      if (zahtjevNap?.serviser_dodijeljen_id) {
        await notifNovaNapomenaServiser(db, zahtjevNap.serviser_dodijeljen_id, requestId);
      }

      return NextResponse.json({ success: true });
    }

    // ── Zatvaranje intervencije (dispečer) ────────────────────────────────────
    if (podaci.action === 'zatvori') {
      const DOZVOLJENI_ZA_ZATVARANJE = new Set(['dodijeljeno', 'u_radu', 'u_izvrsenju']);
      if (!DOZVOLJENI_ZA_ZATVARANJE.has(zahtjev.status)) {
        return NextResponse.json(
          { error: 'Zatvaranje je moguće samo za aktivne intervencije.' },
          { status: 400 }
        );
      }

      const { error: updErr } = await db
        .from('service_requests')
        .update({ status: 'zavrseno' })
        .eq('id', requestId);

      if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

      await db.from('intervention_activities').insert({
        zahtjev_id: requestId,
        autor_id:   user.id,
        tip:        'status_promjena',
        sadrzaj:    podaci.napomene?.trim()
          ? `Dispečer zatvorio intervenciju. Napomena: ${podaci.napomene.trim()}`
          : 'Dispečer zatvorio intervenciju.',
        old_value:  zahtjev.status,
        new_value:  'zavrseno',
        actor_role: 'dispecer',
        metadata:   { iz: zahtjev.status, u: 'zavrseno' },
      });

      // Notify korisnik - intervention complete
      const { data: zahtjevZav } = await db
        .from('service_requests').select('user_id').eq('id', requestId).maybeSingle();
      if (zahtjevZav?.user_id) {
        await notifKorisnikusIntervencijaZavrsena(db, zahtjevZav.user_id, requestId);
      }

      return NextResponse.json({ success: true, novi_status: 'zavrseno' });
    }

    // ── Formalno zatvaranje intervencije (zavrseno + closed_at) ──────────────
    if (podaci.action === 'zatvoriFormalno') {
      if (zahtjev.status !== 'zavrseno') {
        return NextResponse.json(
          { error: 'Formalno zatvaranje moguće je samo za intervencije u statusu "zavrseno".' },
          { status: 400 }
        );
      }
      if (zahtjev.closed_at) {
        return NextResponse.json(
          { error: 'Intervencija je već formalno zatvorena.' },
          { status: 400 }
        );
      }

      // Provjeri da postoji evidencija rada
      const { count: evidCount } = await db
        .from('work_evidence')
        .select('*', { count: 'exact', head: true })
        .eq('zahtjev_id', requestId);

      if (!evidCount || evidCount === 0) {
        return NextResponse.json(
          { error: 'Intervencija ne može biti zatvorena bez evidencije rada. Serviser mora evidentirati obavljeni posao.' },
          { status: 400 }
        );
      }

      const { error: updErr } = await db
        .from('service_requests')
        .update({
          status:       'zatvoreno',
          closed_at:    new Date().toISOString(),
          closed_by:    user.id,
          closure_note: podaci.closure_note?.trim() || null,
        })
        .eq('id', requestId);

      if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

      await db.from('intervention_activities').insert({
        zahtjev_id: requestId,
        autor_id:   user.id,
        tip:        'zatvaranje',
        sadrzaj:    podaci.closure_note?.trim()
          ? `Intervencija formalno zatvorena. Napomena: ${podaci.closure_note.trim()}`
          : 'Intervencija formalno zatvorena.',
        old_value:  'zavrseno',
        new_value:  'zatvoreno',
        actor_role: 'dispecer',
        metadata:   { iz: 'zavrseno', u: 'zavrseno_zatvoreno' },
      });

      // Notifikacije svim servisirima u timu
      const { data: zahtjevFull } = await db
        .from('service_requests')
        .select('serviser_dodijeljen_id')
        .eq('id', requestId)
        .single();

      if (zahtjevFull?.serviser_dodijeljen_id) {
        await notifZatvaranjeIntervencije(db, zahtjevFull.serviser_dodijeljen_id, requestId);
      }

      // Pomoćni serviseri
      const { data: tim } = await db
        .from('tim_intervencije')
        .select('serviser_id')
        .eq('zahtjev_id', requestId);

      for (const clan of tim ?? []) {
        await notifZatvaranjeIntervencije(db, clan.serviser_id, requestId);
      }

      // Notify korisnik - formally closed
      const { data: zahtjevZatv } = await db
        .from('service_requests').select('user_id').eq('id', requestId).maybeSingle();
      if (zahtjevZatv?.user_id) {
        await notifKorisnikusIntervencijaZatvorena(db, zahtjevZatv.user_id, requestId);
      }

      return NextResponse.json({ success: true, novi_status: 'zavrseno_zatvoreno' });
    }

    if (!PENDING_STATUSES.has(zahtjev.status)) {
      return NextResponse.json(
        { error: 'Akcija je moguća samo za zahtjeve koji još nisu potvrđeni ili odbijeni.' },
        { status: 400 }
      );
    }

    // US-12: operativni prioritet uz potvrdu (status → potvrdeno).
    if (podaci.action === 'potvrdi') {
      if (
        zahtjev.is_premium === true &&
        premiumZahtijevaObrazlozenjeSmanjenjaPrioriteta(podaci.final_priority) &&
        (!podaci.premium_downgrade_reason || podaci.premium_downgrade_reason.trim().length < 10)
      ) {
        return NextResponse.json(
          {
            error:
              'Premium zahtjev mora ostati u hitnoj operativnoj grupi (HITNO, KRITIČNO ili VISOKO) ili unesite obrazloženje (min. 10 karaktera).',
          },
          { status: 400 }
        );
      }
      const { error } = await db
        .from('service_requests')
        .update({
          status:         'potvrdeno',
          final_priority: podaci.final_priority,
          premium_priority_override_reason:
            zahtjev.is_premium === true &&
            premiumZahtijevaObrazlozenjeSmanjenjaPrioriteta(podaci.final_priority)
              ? podaci.premium_downgrade_reason?.trim() ?? null
              : null,
        })
        .eq('id', requestId);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      const noviPrioritetLabel = labelOperativnogPrioriteta(podaci.final_priority);
      const stariPrioritet = (zahtjev.final_priority as string | null) ?? null;

      await db.from('intervention_activities').insert({
        zahtjev_id: requestId,
        autor_id:   user.id,
        tip:        'status_promjena',
        sadrzaj:    `Dispečer potvrdio zahtjev (prioritet: ${noviPrioritetLabel})`,
        old_value:  zahtjev.status,
        new_value:  'potvrdeno',
        actor_role: 'dispecer',
        metadata:   {
          iz: zahtjev.status,
          u: 'potvrdeno',
          final_priority: podaci.final_priority,
          final_priority_label: noviPrioritetLabel,
        },
      });

      if (!stariPrioritet || stariPrioritet !== podaci.final_priority) {
        await db.from('intervention_activities').insert({
          zahtjev_id: requestId,
          autor_id:   user.id,
          tip:        'promjena_prioriteta',
          sadrzaj:    `Operativni prioritet pri potvrdi: ${labelOperativnogPrioriteta(stariPrioritet)} → ${noviPrioritetLabel}`,
          old_value:  labelOperativnogPrioriteta(stariPrioritet),
          new_value:  noviPrioritetLabel,
          actor_role: 'dispecer',
          metadata:   {
            stari_prioritet: stariPrioritet,
            novi_prioritet: podaci.final_priority,
            stari_prioritet_label: labelOperativnogPrioriteta(stariPrioritet),
            novi_prioritet_label: noviPrioritetLabel,
            izvor: 'potvrda_zahtjeva',
          },
        });
      }

      // Notify korisnik - request in processing
      const { data: zahtjevPotv } = await db
        .from('service_requests').select('user_id').eq('id', requestId).maybeSingle();
      if (zahtjevPotv?.user_id) {
        await notifKorisnikusZahtjevUObradi(db, zahtjevPotv.user_id, requestId);
      }

      return NextResponse.json({ success: true, novi_status: 'potvrdeno' });
    }

    if (podaci.action === 'odbij') {
      const { error } = await db
        .from('service_requests')
        .update({
          status:           'odbijeno',
          rejection_reason: podaci.rejection_reason,
        })
        .eq('id', requestId);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      await db.from('intervention_activities').insert({
        zahtjev_id: requestId,
        autor_id:   user.id,
        tip:        'odbijanje',
        sadrzaj:    `Dispečer odbio zahtjev. Razlog: ${podaci.rejection_reason}`,
        old_value:  zahtjev.status,
        new_value:  'odbijeno',
        actor_role: 'dispecer',
        metadata:   { iz: zahtjev.status, u: 'odbijeno' },
      });

      return NextResponse.json({ success: true, novi_status: 'odbijeno' });
    }

    return NextResponse.json({ error: 'Nepoznata akcija.' }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Greška servera.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
