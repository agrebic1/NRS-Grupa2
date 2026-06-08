import { getSlaStatus } from '@/lib/servisirane/slaPravila';
import { zabiljeziAktivnost } from '@/lib/servisirane/aktivnostiAudit';
import {
  dohvatiUposlenikIdsPoUlogama,
  kreirajViseNotifikacija,
} from '@/lib/servisirane/notifikacijeHelper';

type AnyDB = {
  from: (t: string) => {
    select: (c: string) => {
      eq: (
        col: string,
        val: unknown,
      ) => {
        filter: (
          a: string,
          b: string,
          c: string,
        ) => {
          maybeSingle: () => Promise<{ data: unknown }>;
        };
        maybeSingle: () => Promise<{ data: unknown }>;
      };
    };
    update: (p: Record<string, unknown>) => {
      eq: (
        col: string,
        val: unknown,
      ) => Promise<{ error: { message: string } | null }>;
    };
  };
};

const COOLDOWN_MS = 6 * 60 * 60 * 1000; // 6h između eskalacija po istoj intervenciji

interface ZahtjevZaEskalaciju {
  id: number;
  status: string;
  created_at: string;
  operativni_prioritet: string | null;
  sla_eskalacija_at: string | null;
}

/** US-45: eskalacija prekoračenog SLA - notifikacija dispečerima + audit. */
export async function obradiSlaEskalacijuZaZahtjev(
  db: AnyDB,
  zahtjev: ZahtjevZaEskalaciju,
  sistemAutorId: string,
): Promise<boolean> {
  const sla = getSlaStatus(
    zahtjev.created_at,
    zahtjev.operativni_prioritet,
    zahtjev.status,
  );
  if (sla !== 'prekoraceno') return false;

  if (zahtjev.sla_eskalacija_at) {
    const zadnja = new Date(zahtjev.sla_eskalacija_at).getTime();
    if (Date.now() - zadnja < COOLDOWN_MS) return false;
  }

  const ids = await dohvatiUposlenikIdsPoUlogama(db as any, [
    'Dispečer',
    'dispečer',
    'dispecer',
  ]);

  if (ids.length) {
    await kreirajViseNotifikacija(
      db as any,
      ids.map((id) => ({
        korisnik_id: id,
        uloga_korisnika: 'Dispečer',
        tip: 'sla_eskalacija',
        naslov: 'SLA prekoračen - potrebna reakcija',
        poruka: `Intervencija #${zahtjev.id} prekoračila je dogovoreni SLA rok. Provjerite prioritet i dodjelu.`,
        zahtjev_id: zahtjev.id,
      })),
    );
  }

  await zabiljeziAktivnost(db as any, {
    zahtjev_id: zahtjev.id,
    autor_id: sistemAutorId,
    tip: 'sla_eskalacija',
    sadrzaj: 'Sistem eskalirao prekoračen SLA dispečerima.',
    actor_role: 'sistem',
    metadata: { prioritet: zahtjev.operativni_prioritet },
  });

  await (db as any)
    .from('service_requests')
    .update({ sla_eskalacija_at: new Date().toISOString() })
    .eq('id', zahtjev.id);

  return true;
}

/** Batch provjera liste intervencija (dispečerski pregled). */
export async function obradiSlaEskalacijeBatch(
  db: AnyDB,
  zahtjevi: ZahtjevZaEskalaciju[],
  sistemAutorId: string,
): Promise<number> {
  let n = 0;
  for (const z of zahtjevi) {
    if (await obradiSlaEskalacijuZaZahtjev(db, z, sistemAutorId)) n += 1;
  }
  return n;
}
