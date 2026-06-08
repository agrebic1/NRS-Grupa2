// US-53 — Detekcija intervencija koje predugo čekaju bez obrade ili dodjele.
// Logika je u potpunosti client-side computed (nema novih DB kolona).

import type { DugoChekanje, DugoChekanjeTip } from '@/domain/types/servisirane';

/** Pragovi čekanja u satima po statusu intervencije. */
export const DUGO_CEKANJE_PRAGOVI_SATI: Partial<Record<string, number>> = {
  pending_review: 2, // Čeka prvu dispečersku obradu
  na_cekanju: 2, // Sinonim za pending_review
  in_review: 6, // Dispečer je otvorio čarobnjak ali nije završio
  potvrdeno: 8, // Potvrđeno ali serviser još nije dodijeljen
  dodijeljeno: 4, // Dodijeljen serviser koji nije prihvatio zadatak
};

const TIP_PO_STATUSU: Partial<Record<string, DugoChekanjeTip>> = {
  pending_review: 'nema_obrade',
  na_cekanju: 'nema_obrade',
  in_review: 'nema_obrade',
  potvrdeno: 'nema_dodjele',
  dodijeljeno: 'ceka_prihvatanje',
};

export const OPIS_TIPA: Record<DugoChekanjeTip, string> = {
  nema_obrade: 'Čeka dispečersku obradu',
  nema_dodjele: 'Potvrđeno — serviser nije dodijeljen',
  ceka_prihvatanje: 'Serviser nije prihvatio zadatak',
};

/**
 * Vraća `DugoChekanje` ako intervencija predugo čeka u datom statusu,
 * inače `null`.
 */
export function getDugoChekanje(
  status: string,
  createdAt: string,
): DugoChekanje | null {
  const pragSati = DUGO_CEKANJE_PRAGOVI_SATI[status];
  if (pragSati == null) return null;

  const prag_ms = pragSati * 3_600_000;
  const trajanje_ms = Date.now() - new Date(createdAt).getTime();

  if (trajanje_ms < prag_ms) return null;

  const tip = TIP_PO_STATUSU[status];
  if (!tip) return null;

  return { tip, trajanje_ms, prag_ms };
}

/** Formatira trajanje čekanja kao human-readable string. */
export function formatiraTrajanje(trajanje_ms: number): string {
  const ukupnoMin = Math.floor(trajanje_ms / 60_000);
  if (ukupnoMin < 60) return `${ukupnoMin}min`;
  const h = Math.floor(ukupnoMin / 60);
  const m = ukupnoMin % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}
