import type { StatusZahtjeva } from '@/domain/types/servisirane';
import {
  TERMINALNI_STATUSI_ZAHTJEVA,
  STATUSI_ZA_KORISNICKU_IZMJENU,
  STATUSI_ZA_DISPECERSKU_IZMJENU_PRIORITETA,
} from './statusTypes';

export function zahtjevCekaObraduUInboxuDispecera(status: string): boolean {
  const s = status.toLowerCase();
  return s === 'pending_review' || s === 'na_cekanju' || s === 'in_review' || s === 'potvrdeno';
}

/** Još nije otvoren dispečerski čarobnjak (prije koraka Prioritet / Termin…). */
export function zahtjevJeNoviPrijeCarobnjakaDispecera(status: string): boolean {
  const s = status.toLowerCase();
  return s === 'pending_review' || s === 'na_cekanju';
}

/** Dispečer radi čarobnjak (Pregled → Prioritet → Termin i serviser → …). */
export function zahtjevJeUCarobnjakuDispecera(status: string): boolean {
  return status.toLowerCase() === 'in_review';
}

export function jeZahtjevAktivan(status: string): boolean {
  return !TERMINALNI_STATUSI_ZAHTJEVA.has(status);
}

/**
 * Korisnik smije uređivati/otkazati samo dok zahtjev još nije u aktivnoj dispečerskoj obradi:
 * status mora biti `na_cekanju` / `pending_review` i **ne smije** biti snimljen operativni prioritet.
 */
export function korisnikSmijeMijenjatiIliOtkazatiZahtjev(
  status: string,
  finalPriority?: string | null,
): boolean {
  if (!STATUSI_ZA_KORISNICKU_IZMJENU.has(status as StatusZahtjeva)) {
    return false;
  }
  if (Boolean((finalPriority ?? '').trim())) {
    return false;
  }
  return true;
}

/** Zahtjev dodijeljen serviseru ili aktivno u izvršenju (sažetak kontrolne table). */
export function zahtjevJeUToku(status: string): boolean {
  return ['dodijeljeno', 'u_radu', 'u_izvrsenju'].includes(status);
}

export function dispecerSmijeMijenjatiOperativniPrioritet(status: string): boolean {
  return STATUSI_ZA_DISPECERSKU_IZMJENU_PRIORITETA.has(status as StatusZahtjeva);
}
