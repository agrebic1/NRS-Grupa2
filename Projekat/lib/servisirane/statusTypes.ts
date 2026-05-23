import type { StatusZahtjeva } from '@/domain/types/servisirane';

/**
 * Sažetak za korisnički dashboard — 8 stanja koja korisnik razumije.
 *
 * RAZLIKA od DB statusa:
 * - `novi`       = zahtjev primljen, čeka dispečera
 * - `u_obradi`   = dispečer obrađuje (wizard: prioritet, termin, serviser)
 * - `potvrdeno`  = sve potvrđeno, serviser uskoro stiže
 * - `u_toku`     = serviser aktivan (na putu ili na terenu)
 * - `zavrseno`   = intervencija završena
 * - `zatvoreno`  = zahtjev formalno zatvoren
 * - `otkazano`   = korisnik otkazao
 * - `odbijeno`   = dispečer odbio zahtjev
 *
 * NAPOMENA: `hitno` je urgency_score korisnika, ne operativni prioritet dispečera.
 * Prikazuje se kao badge uz `novi` / `u_obradi`, ne kao poseban status.
 */
export type KorisnickiDashboardStatus =
  | 'novi'
  | 'u_obradi'
  | 'potvrdeno'
  | 'u_toku'
  | 'zavrseno'
  | 'zatvoreno'
  | 'otkazano'
  | 'odbijeno';

/**
 * Završni statusi — ne ulaze u operativni pregled aktivnih.
 * `zavrseno`  = operativno završeno, dispečer može formalno zatvoriti
 * `zatvoreno` = formalno zatvoreno, read-only za sve uloge
 */
export const TERMINALNI_STATUSI_ZAHTJEVA = new Set<string>([
  'zavrseno',
  'zatvoreno',
  'otkazano',
  'odbijeno',
]);

/** Prag za urgency badge na korisničkom dashboardu — prikazuje se kao badge, ne kao status. */
export const PRAG_KORISNICKE_HITNOSTI_HITNO = 80;

/** Statusi u kojima korisnik smije mijenjati ili otkazati zahtjev (service-requests PATCH). */
export const STATUSI_ZA_KORISNICKU_IZMJENU: ReadonlySet<StatusZahtjeva> = new Set([
  'na_cekanju',
  'pending_review',
]);

/** Aktivni zahtjevi u kojima dispečer smije mijenjati `final_priority` bez promjene statusa. */
export const STATUSI_ZA_DISPECERSKU_IZMJENU_PRIORITETA: ReadonlySet<StatusZahtjeva> = new Set([
  'pending_review',
  'na_cekanju',
  'in_review',
  'potvrdeno',
  'dodijeljeno',
  'u_radu',
  'u_izvrsenju',
]);
