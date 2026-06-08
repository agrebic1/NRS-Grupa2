import type { KorisnickiDashboardStatus } from './statusTypes';

/**
 * Mapira DB status (+ opcioni finalPriority) na kategoriju kartice na početnoj korisnika.
 *
 * `pending_review` ≡ `na_cekanju` - oba su inicijalni status, tretiraju se identično.
 */
export function korisnickiDashboardStatus(
  status: string | null | undefined,
  /** Kad je postavljen operativni prioritet, zahtjev je u dispečerskoj obradi. */
  finalPriority?: string | null | undefined,
): KorisnickiDashboardStatus {
  const s = (status ?? '').toLowerCase();
  const imaOperativniPrioritet = Boolean((finalPriority ?? '').trim());

  if (s === 'zatvoreno') return 'zatvoreno';
  if (s === 'zavrseno') return 'zavrseno';
  if (s === 'otkazano') return 'otkazano';
  if (s === 'odbijeno') return 'odbijeno';

  if (s === 'u_radu' || s === 'u_izvrsenju') return 'u_toku';

  if (s === 'potvrdeno' || s === 'dodijeljeno') return 'potvrdeno';

  if (s === 'in_review') return 'u_obradi';
  if ((s === 'pending_review' || s === 'na_cekanju') && imaOperativniPrioritet)
    return 'u_obradi';

  return 'novi';
}
