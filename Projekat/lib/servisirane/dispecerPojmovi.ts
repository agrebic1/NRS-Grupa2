/**
 * Kratki tekstovi za dispečerski UI (bosanski) - razdvajanje korisničke procjene i operativnog prioriteta.
 */

export const DISPECER_HITNOST_KORISNIK_NASLOV = 'Procjena hitnosti';

export const DISPECER_OPERATIVNI_NASLOV = 'Operativni prioritet';
export const DISPECER_OPERATIVNI_OPIS_NEDOSTAJE = '-';

export const DISPECER_OPERATIVNI_SELECT_NASLOV = 'Operativni prioritet';
export const DISPECER_OPERATIVNI_SELECT_OPIS =
  'Vrijednost koja se upisuje u sistem kad kliknete „Sačuvaj operativni prioritet“ ili „Sačuvaj i nastavi“.';

export const DISPECER_INBOX_GRUPA_HITNO_NASLOV = 'Hitna obrada';
export const DISPECER_INBOX_GRUPA_HITNO_TITLE =
  'Grupa prema procjeni hitnosti korisnika (Visoka, uklj. premium). Unutar grupe prvo premium zahtjevi, zatim starije prijave (raniji datum) prije novijih.';
export const DISPECER_INBOX_GRUPA_SREDNJE_NASLOV = 'Srednji red';
export const DISPECER_INBOX_GRUPA_SREDNJE_TITLE =
  'Grupa prema procjeni hitnosti korisnika (Srednja). Unutar grupe starije prijave prije novijih.';
export const DISPECER_INBOX_GRUPA_NISKO_NASLOV = 'Redovni red';
export const DISPECER_INBOX_GRUPA_NISKO_TITLE =
  'Grupa prema procjeni hitnosti korisnika (Niska). Unutar grupe starije prijave prije novijih.';

/** Tooltip na chipu procjene - usklađen s inbox grupama. */
export const DISPECER_HITNOST_KORISNIK_CHIP_TITLE =
  'Procjena hitnosti korisnika; ista osnova kao i grupe u inboxu.';
