import { inicijaliPodnosiocaKratko } from '@/lib/servisirane/zahtjevPrikaz';

/**
 * Redni broj zahtjeva po korisniku: najstariji prijavljeni = 1 (created_at ASC, zatim id).
 * Isto kao zbroj zahtjeva nakon novog unosa (POST count).
 */

export function dodijeliKorisnickeBrojeveZahtjeva<
  T extends { id: number; created_at: string },
>(rows: T[]): (T & { korisnicki_broj_zahtjeva: number })[] {
  if (rows.length === 0) return [];
  const sortedAsc = [...rows].sort((a, b) => {
    const t =
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (t !== 0) return t;
    return a.id - b.id;
  });
  const idToBroj = new Map<number, number>(
    sortedAsc.map((r, i) => [r.id, i + 1]),
  );
  return rows.map((r) => ({
    ...r,
    korisnicki_broj_zahtjeva: idToBroj.get(r.id)!,
  }));
}

/** Niz mora biti sortiran kao kod dodjele (created_at ASC, id ASC). */
export function korisnickiBrojZahtjevaZaId(
  redoviAsc: { id: number }[],
  requestId: number,
): number | null {
  const idx = redoviAsc.findIndex((r) => r.id === requestId);
  return idx >= 0 ? idx + 1 : null;
}

type RedZaBrojPoKorisniku = { id: number; user_id: string; created_at: string };

/** Svi zahtjevi (bilo koji status) grupisani po `user_id`: najstariji = 1. */
export function korisnickiBrojeviMapPoKorisniku(
  rows: RedZaBrojPoKorisniku[],
): Map<number, number> {
  const byUser = new Map<string, RedZaBrojPoKorisniku[]>();
  for (const r of rows) {
    const arr = byUser.get(r.user_id);
    if (arr) arr.push(r);
    else byUser.set(r.user_id, [r]);
  }
  const idToBroj = new Map<number, number>();
  for (const grupa of byUser.values()) {
    const sortedAsc = [...grupa].sort((a, b) => {
      const t =
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (t !== 0) return t;
      return a.id - b.id;
    });
    sortedAsc.forEach((row, i) => idToBroj.set(row.id, i + 1));
  }
  return idToBroj;
}

export function brojZahtjevaZaPrikaz(zahtjev: {
  korisnicki_broj_zahtjeva?: number | null;
  id: number;
}): number {
  const b = zahtjev.korisnicki_broj_zahtjeva;
  return typeof b === 'number' && b > 0 ? b : zahtjev.id;
}

/**
 * Jedinstvena oznaka u dispečerskom pregledu: redni broj u listi (1…n) ako postoji,
 * inače korisnički broj + inicijale podnosioca (npr. `3·A.M`) da se ne ponavljaju brojevi među korisnicima.
 */
export function oznakaZaDispecerskiPrikazBroja(zahtjev: {
  dispecerski_redni_u_pregledu?: number | null;
  korisnicki_broj_zahtjeva?: number | null;
  id: number;
  podnosilac?: { ime: string; prezime: string } | null;
}): string {
  const d = zahtjev.dispecerski_redni_u_pregledu;
  if (typeof d === 'number' && d > 0) return String(d);
  const kBr = brojZahtjevaZaPrikaz(zahtjev);
  const ini = inicijaliPodnosiocaKratko(zahtjev.podnosilac ?? null);
  return ini ? `${kBr}·${ini}` : String(kBr);
}
