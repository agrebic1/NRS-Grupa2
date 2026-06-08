/** Tri grupe u inboxu / sortiranju - isključivo iz `final_priority`, ne iz korisničke hitnosti. */
export type DispecerskaOperativnaGrupa = 'Hitno' | 'Srednja' | 'Niska';

/**
 * Operativna grupa za dispečera. Ako prioritet još nije postavljen (`null`/prazno),
 * tretira se kao srednji red (čekaju trijažu od dispečera).
 */
export function operativnaGrupaIzFinalnogPrioriteta(
  finalPriority: string | null | undefined,
): DispecerskaOperativnaGrupa {
  const v = (finalPriority ?? '').trim().toUpperCase();
  if (['HITNO', 'KRITIČNO', 'VISOKO'].includes(v)) return 'Hitno';
  if (v === 'NISKO') return 'Niska';
  if (v === 'SREDNJE') return 'Srednja';
  return 'Srednja';
}

/** Niži broj = viši prioritet (za sort). */
export function rangOperativnogPrioriteta(
  finalPriority: string | null | undefined,
): number {
  const g = operativnaGrupaIzFinalnogPrioriteta(finalPriority);
  if (g === 'Hitno') return 0;
  if (g === 'Srednja') return 1;
  return 2;
}

/**
 * Premium zahtjevi imaju ugovorenu „hitnu“ obradu u smislu operativne grupe inboxa
 * (`HITNO`, `KRITIČNO`, `VISOKO` → {@link operativnaGrupaIzFinalnogPrioriteta} `Hitno`).
 * Obrazloženje je obavezno tek ako se prioritet spusti u srednju ili nisku grupu.
 */
export function premiumZahtijevaObrazlozenjeSmanjenjaPrioriteta(
  finalPriority: string | null | undefined,
): boolean {
  return operativnaGrupaIzFinalnogPrioriteta(finalPriority) !== 'Hitno';
}
