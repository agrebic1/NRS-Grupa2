/**
 * Jedini izvor istine za operativnu fazu zahtjeva (MECE).
 *
 * Svaki zahtjev pada u tačno jednu fazu; intake i intervencija skupovi su disjunktni.
 * Ne mijenjati zahtjevCekaObraduUInboxuDispecera — ona kontrolira dozvole i pokriven
 * je unit testom; ovaj fajl je odvojena klasifikacijska logika.
 */

import { zahtjevImaOperativniPrioritet } from '@/lib/servisirane/dispecerskeFaze';
import { getSlaStatus } from '@/lib/servisirane/slaPravila';
import { getDugoChekanje } from '@/lib/servisirane/dugoChekanje';

// Intake statusi (bez potvrdeno — ono mapira na ceka_dodjelu ili odbijen_serviser)
const INTAKE_STATUSI = new Set(['pending_review', 'na_cekanju', 'in_review']);

export type OperativnaFaza =
  | 'novi' // intake, nema final_priority
  | 'u_obradi' // intake, ima final_priority (wizard: termin → serviser → potvrda)
  | 'ceka_dodjelu' // status=potvrdeno, nema odbijanja
  | 'odbijen_serviser' // status=potvrdeno + serviser_odbio_razlog
  | 'dodijeljeno' // serviser dodijeljen, čeka prihvat
  | 'u_putu' // u_radu — serviser na putu
  | 'na_terenu' // u_izvrsenju — servis u toku
  | 'ceka_zatvaranje' // zavrseno, nije zatvoreno
  | 'zatvoreno' // zatvoreno (arhiva)
  | 'otkazano'; // otkazano | odbijeno (terminal)

/**
 * Klasificira zahtjev u tačno jednu operativnu fazu.
 * Jedina funkcija koja čita status + final_priority + serviser_odbio_razlog zajedno.
 */
export function operativnaFazaZahtjeva(z: {
  status: string;
  final_priority?: string | null;
  serviser_odbio_razlog?: string | null;
}): OperativnaFaza {
  const s = z.status.toLowerCase();

  if (INTAKE_STATUSI.has(s)) {
    return zahtjevImaOperativniPrioritet({
      final_priority: z.final_priority ?? null,
    })
      ? 'u_obradi'
      : 'novi';
  }

  if (s === 'potvrdeno') {
    return z.serviser_odbio_razlog ? 'odbijen_serviser' : 'ceka_dodjelu';
  }

  if (s === 'dodijeljeno') return 'dodijeljeno';
  if (s === 'u_radu') return 'u_putu';
  if (s === 'u_izvrsenju') return 'na_terenu';
  if (s === 'zavrseno') return 'ceka_zatvaranje';
  if (s === 'zatvoreno') return 'zatvoreno';

  return 'otkazano'; // otkazano | odbijeno | nepoznato
}

/** Vraća true za sve faze koje su na Zahtjevi strani (prijem/obrada/planiranje). */
export function jeZahtjevIntakeFaza(faza: OperativnaFaza): boolean {
  return (
    faza === 'novi' ||
    faza === 'u_obradi' ||
    faza === 'ceka_dodjelu' ||
    faza === 'odbijen_serviser'
  );
}

/** Vraća true za sve faze koje su na Intervencije strani (izvršenje). */
export function jeIntervencijaFaza(faza: OperativnaFaza): boolean {
  return (
    faza === 'dodijeljeno' ||
    faza === 'u_putu' ||
    faza === 'na_terenu' ||
    faza === 'ceka_zatvaranje'
  );
}

// ─── Cross-cutting predikati (centralizirani, bez duplikata) ──────────────────

/** Hitna intervencija po korisničkoj procjeni (score >= 75 ili premium). */
export function jeHitan(z: {
  urgency_score?: number | null;
  is_premium?: boolean | null;
}): boolean {
  return (z.urgency_score ?? 0) >= 75 || Boolean(z.is_premium);
}

/** SLA rok prekoračen za aktivne (ne-završene) zahtjeve. */
export function jeSlaPrekoracen(z: {
  created_at: string;
  final_priority?: string | null;
  status: string;
}): boolean {
  return (
    getSlaStatus(z.created_at, z.final_priority ?? null, z.status) ===
    'prekoraceno'
  );
}

/** Zahtjev predugo čeka u datom statusu (klijentski računato). */
export function jeDugoCeka(z: { status: string; created_at: string }): boolean {
  return getDugoChekanje(z.status, z.created_at) !== null;
}

/** Planirani termin je prošao, a intervencija nije završena. */
export function jeKasni(z: {
  termin_planirani_pocetak?: string | null;
  status: string;
}): boolean {
  if (!z.termin_planirani_pocetak) return false;
  if (['zavrseno', 'zatvoreno', 'otkazano', 'odbijeno'].includes(z.status))
    return false;
  return new Date(z.termin_planirani_pocetak) < new Date();
}

// ─── Labeli za prikaz ─────────────────────────────────────────────────────────

export const FAZA_LABEL: Record<OperativnaFaza, string> = {
  novi: 'Novi',
  u_obradi: 'U obradi',
  ceka_dodjelu: 'Čeka dodjelu',
  odbijen_serviser: 'Serviser odbio',
  dodijeljeno: 'Dodijeljeno',
  u_putu: 'Na putu',
  na_terenu: 'Na terenu',
  ceka_zatvaranje: 'Čeka zatvaranje',
  zatvoreno: 'Zatvoreno',
  otkazano: 'Otkazano',
};
