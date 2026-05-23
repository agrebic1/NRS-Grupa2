/**
 * Re-export barrel — backward-kompatibilnost.
 * Logika je razdvojena u tri fajla prema SRP:
 *   statusTypes.ts       — tipovi, konstante
 *   statusMapping.ts     — mapiranje DB statusa → KorisnickiDashboardStatus
 *   statusPermissions.ts — provjere dozvola po ulozi
 */
export type { KorisnickiDashboardStatus } from './statusTypes';
export {
  TERMINALNI_STATUSI_ZAHTJEVA,
  PRAG_KORISNICKE_HITNOSTI_HITNO,
  STATUSI_ZA_KORISNICKU_IZMJENU,
  STATUSI_ZA_DISPECERSKU_IZMJENU_PRIORITETA,
} from './statusTypes';

export { korisnickiDashboardStatus } from './statusMapping';

export {
  zahtjevCekaObraduUInboxuDispecera,
  zahtjevJeNoviPrijeCarobnjakaDispecera,
  zahtjevJeUCarobnjakuDispecera,
  jeZahtjevAktivan,
  korisnikSmijeMijenjatiIliOtkazatiZahtjev,
  zahtjevJeUToku,
  dispecerSmijeMijenjatiOperativniPrioritet,
} from './statusPermissions';
