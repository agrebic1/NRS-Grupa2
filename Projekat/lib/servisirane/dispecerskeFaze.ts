import type {
  PreferredSchedule,
  ServisniZahtjev,
} from '@/domain/types/servisirane';
import {
  zahtjevCekaObraduUInboxuDispecera,
  zahtjevJeUToku,
} from '@/lib/servisirane/statusZahtjeva';

export function normalizovanOperativniPrioritet(
  finalPriority: string | null | undefined,
): string | null {
  const t = finalPriority?.trim();
  return t ? t : null;
}

export function zahtjevImaOperativniPrioritet(zahtjev: {
  final_priority: string | null;
}): boolean {
  return normalizovanOperativniPrioritet(zahtjev.final_priority) != null;
}

function imaDogovoreniTerminIzRasporeda(
  s: PreferredSchedule | null | undefined,
): boolean {
  const termini = s?.termini;
  return Array.isArray(termini) && termini.length > 0;
}

/** Dispečer je u čarobnjaku potvrio / unio dogovoreni termin. */
export function zahtjevImaDogovoreniTerminDispecera(zahtjev: {
  dispecer_agreed_schedule?: PreferredSchedule | null;
}): boolean {
  return imaDogovoreniTerminIzRasporeda(
    zahtjev.dispecer_agreed_schedule ?? null,
  );
}

/** U čarobnjaku je odabran serviser (prije završne potvrde koja prebacuje u `potvrdeno`). */
export function zahtjevImaDodijeljenogServiseraUCarobnjaku(zahtjev: {
  serviser_dodijeljen_id?: string | null;
}): boolean {
  const id = zahtjev.serviser_dodijeljen_id?.trim();
  return Boolean(id);
}

/** Serviser je potvrdio dogovoreni termin (`is_verified_assigned` u bazi). */
export function serviserJePotvrdioDogovoreniTermin(zahtjev: {
  is_verified_assigned?: boolean | null;
}): boolean {
  return zahtjev.is_verified_assigned === true;
}

/**
 * Pregled zahtjeva: **Novi** dok dispečer nije potvrdio operativni prioritet (`final_priority`).
 */
export function zahtjevJeNoviUPregleduDispecera(
  zahtjev: ServisniZahtjev,
): boolean {
  return (
    zahtjevCekaObraduUInboxuDispecera(zahtjev.status) &&
    !zahtjevImaOperativniPrioritet(zahtjev)
  );
}

/**
 * Pregled zahtjeva: **U obradi** - prioritet je postavljen; još u inboxu (prije statusa `potvrdeno`).
 */
export function zahtjevJeUObradiUPregleduDispecera(
  zahtjev: ServisniZahtjev,
): boolean {
  return (
    zahtjevCekaObraduUInboxuDispecera(zahtjev.status) &&
    zahtjevImaOperativniPrioritet(zahtjev)
  );
}

/** 1. U čarobnjaku - još nema operativnog prioriteta (korak Prioritet). */
export function zahtjevCekaOperativniPrioritetDispecera(
  zahtjev: ServisniZahtjev,
): boolean {
  return (
    zahtjevCekaObraduUInboxuDispecera(zahtjev.status) &&
    !zahtjevImaOperativniPrioritet(zahtjev)
  );
}

/**
 * 2. Operativni prioritet postavljen, čeka se dogovor termina.
 * Ako `dispecer_agreed_schedule` još nije u bazi (stari redovi), svi s prioritetom padaju ovdje dok se ne popune novi podaci.
 */
export function zahtjevCekaDogovorTerminaDispecera(
  zahtjev: ServisniZahtjev,
): boolean {
  if (
    !zahtjevCekaObraduUInboxuDispecera(zahtjev.status) ||
    !zahtjevImaOperativniPrioritet(zahtjev)
  ) {
    return false;
  }
  return !zahtjevImaDogovoreniTerminDispecera(zahtjev);
}

/** 3. Termin dogovoren, čeka se dodjela servisera. */
export function zahtjevCekaDodjeluServiseraDispecera(
  zahtjev: ServisniZahtjev,
): boolean {
  if (
    !zahtjevCekaObraduUInboxuDispecera(zahtjev.status) ||
    !zahtjevImaOperativniPrioritet(zahtjev) ||
    !zahtjevImaDogovoreniTerminDispecera(zahtjev)
  ) {
    return false;
  }
  return !zahtjevImaDodijeljenogServiseraUCarobnjaku(zahtjev);
}

/** 4. Serviser odabran, čeka završnu potvrdu čarobnjaka (korak Potvrda) prije `potvrdeno`. */
export function zahtjevCekaZavrsnuPotvrduCarobnjaka(
  zahtjev: ServisniZahtjev,
): boolean {
  if (
    !zahtjevCekaObraduUInboxuDispecera(zahtjev.status) ||
    !zahtjevImaOperativniPrioritet(zahtjev) ||
    !zahtjevImaDogovoreniTerminDispecera(zahtjev) ||
    !zahtjevImaDodijeljenogServiseraUCarobnjaku(zahtjev)
  ) {
    return false;
  }
  return true;
}

/** Cijeli inbox dispečera (faze 1-4 prije `potvrdeno`). */
export function zahtjevJeUReduObradeDispecera(
  zahtjev: ServisniZahtjev,
): boolean {
  return zahtjevCekaObraduUInboxuDispecera(zahtjev.status);
}

/**
 * U inboxu je i operativni prioritet je snimljen (`final_priority`).
 * Isto što i `zahtjevJeUObradiUPregleduDispecera` za inbox.
 */
export function zahtjevJeUObradiUCarobnjakuDispecera(
  zahtjev: ServisniZahtjev,
): boolean {
  return (
    zahtjevJeUReduObradeDispecera(zahtjev) &&
    zahtjevImaOperativniPrioritet(zahtjev)
  );
}

/**
 * Pod-faza uz „U obradi“ (samo kad je `final_priority` postavljen).
 * Za „Novi“ nema pod-kategorija u UI-ju.
 */
export type DispecerskaFazaPregleda =
  | 'ceka_operativni_prioritet'
  | 'dogovor_termina'
  | 'dodjela_servisera'
  | 'konačna_potvrda';

const NAZIV_FAZE_PREGLEDA: Record<DispecerskaFazaPregleda, string> = {
  ceka_operativni_prioritet: 'Procjena zahtjeva',
  dogovor_termina: 'Dogovor termina',
  dodjela_servisera: 'Izbor servisera',
  konačna_potvrda: 'Potvrda termina',
};

export function nazivDispecerskeFazePregleda(
  faza: DispecerskaFazaPregleda,
): string {
  return NAZIV_FAZE_PREGLEDA[faza];
}

/** Faza za sporedni bedž; dok nema prioriteta vraća `ceka_operativni_prioritet` (ne prikazuje se uz „Novi“ ako je skriveno u UI-ju). */
export function uzmiDispecerskuFazuZaPregled(
  zahtjev: ServisniZahtjev,
): DispecerskaFazaPregleda {
  if (!zahtjevCekaObraduUInboxuDispecera(zahtjev.status)) {
    return 'konačna_potvrda';
  }
  if (!zahtjevImaOperativniPrioritet(zahtjev)) {
    return 'ceka_operativni_prioritet';
  }
  if (!zahtjevImaDogovoreniTerminDispecera(zahtjev)) return 'dogovor_termina';
  if (!zahtjevImaDodijeljenogServiseraUCarobnjaku(zahtjev))
    return 'dodjela_servisera';
  return 'konačna_potvrda';
}

export function zahtjevUFaziDogovoraTerminaPregled(
  zahtjev: ServisniZahtjev,
): boolean {
  return zahtjevCekaDogovorTerminaDispecera(zahtjev);
}

export function zahtjevUFaziDodjeleServiseraPregled(
  zahtjev: ServisniZahtjev,
): boolean {
  return zahtjevCekaDodjeluServiseraDispecera(zahtjev);
}

/** Zadnji korak čarobnjaka u inboxu prije službenog statusa `potvrdeno`. */
export function zahtjevUFaziKorakaPotvrdePregled(
  zahtjev: ServisniZahtjev,
): boolean {
  return zahtjevCekaZavrsnuPotvrduCarobnjaka(zahtjev);
}

/** Nakon završne potvrde u čarobnjaku. */
export function zahtjevJePotvrdenPrijeIntervencije(zahtjev: {
  status: string;
}): boolean {
  return zahtjev.status === 'potvrdeno';
}

/** Praćenje intervencije (npr. stranica /korisnik/intervencija/[id]): dodjela i teren. */
export function zahtjevJeUFaziIntervencije(zahtjev: {
  status: string;
}): boolean {
  return zahtjevJeUToku(zahtjev.status);
}

/**
 * Svi zahtjevi koji su u inboxu dispečera - i oni bez prioriteta (Novi) i oni s prioritetom (U obradi).
 * Koristi se za novi glavni status filter "U obradi" koji obuhvata cijeli inbox.
 */
export function zahtjevJeUObradiSirokoGledano(
  zahtjev: ServisniZahtjev,
): boolean {
  return zahtjevCekaObraduUInboxuDispecera(zahtjev.status);
}

/**
 * Naziv faze obrade za prikaz na kartici - radi za sve statuse.
 * Vraća `null` za terminal statuse (zavrseno, otkazano, odbijeno).
 */
export function fazaObradeNazivZaKarticu(
  zahtjev: ServisniZahtjev,
): string | null {
  const s = zahtjev.status;
  if (s === 'potvrdeno') return 'Čeka dodjelu';
  if (s === 'dodijeljeno') return 'Servis dodijeljen';
  if (s === 'u_radu') return 'Servis u toku';
  if (s === 'u_izvrsenju') return 'Servis na terenu';
  if (!zahtjevCekaObraduUInboxuDispecera(s)) return null;
  return nazivDispecerskeFazePregleda(uzmiDispecerskuFazuZaPregled(zahtjev));
}

/**
 * Synonymi za `?filter=` - stari i skraćeni ključevi preusmjeravaju na kanonske nazive.
 * Kanon (novi): svi, novi, u_obradi, ceka_dodjelu, odbijeni.
 * Izvršenje (dodijeljeno/u_radu/u_izvrsenju/zavrseno) je isključivo na /dispecer/intervencije.
 */
const SYNONIMI_DISPECER_FILTRA: Record<string, string> = {
  red_obrade: 'svi',
  inbox: 'svi',
  bez_prioriteta: 'novi',
  carobnjak: 'svi',
  ceka_prioritet: 'novi',
  // Stari alias → stari kanon (hop1); stari kanon → novi kanon (hop2)
  ceka_termin: 'zakazivanje_termina',
  ceka_servisera: 'dodjela_servisera',
  ceka_zavrsnu_potvrdu: 'korak_potvrde',
  konacna_potvrda: 'korak_potvrde',
  // Stari kanon → novi kanon
  zakazivanje_termina: 'u_obradi',
  dodjela_servisera: 'u_obradi',
  korak_potvrde: 'u_obradi',
  // Stari nazivi za potvrdeni/potvrdeno → novi kanon ceka_dodjelu
  potvrdeni: 'ceka_dodjelu',
  potvrdeno: 'ceka_dodjelu',
  // Stari izvršenje tabovi → svi (ne postoji na zahtjevi stranici; trebaju ići na /intervencije)
  na_terenu: 'svi',
  u_toku: 'svi',
  intervencija: 'svi',
  teren: 'svi',
  dodijeljeno: 'svi',
  zavrseni: 'svi',
  ponovni_ciklus: 'svi',
};

export function normalizujDispecerFilterIzParametra(
  raw: string | null | undefined,
  dozvoljene: string[],
): string {
  const v = raw?.trim() || 'svi';
  const hop1 = SYNONIMI_DISPECER_FILTRA[v] ?? v;
  // Support two-hop: old-alias → old-canonical → new-canonical
  const hop2 = SYNONIMI_DISPECER_FILTRA[hop1] ?? hop1;
  if (dozvoljene.includes(hop1)) return hop1;
  if (dozvoljene.includes(hop2)) return hop2;
  return 'svi';
}
