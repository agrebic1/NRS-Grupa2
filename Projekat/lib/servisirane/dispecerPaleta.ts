/**
 * Dispečerska paleta - odvojeni sustavi da se vizualno ne miješaju:
 *
 * 1. **STATUS** (životni ciklus) - `DispecerStatusBadge` i KPI na tabli dijele iste slotove:
 *    **plava** novi (prije čarobnjaka) → **ljubičasta** u obradi → **zelena** potvrđeno (nakon čarobnjaka) → nebo **dodijeljeno** → tamnija **ljubičasta** na terenu;
 *    KPI „Svi aktivni“ = **siva** (`DISPECER_PALETA_KPI_AKTIVNI`).
 *
 * 2. **HITNOST** (korisnička procjena): crvena → amber → slate.
 *
 * 3. **PREMIUM** - zaseban akcent.
 *
 * 4. **OPERATIVNI PRIORITET** (`final_priority`) - dispečerova trijaža: teal → indigo → narančasta → magenta → tamnocrveni „maks“ (`vizuelOperativnogPrioriteta`). Namjerno nije u istim hexovima kao (2) niti (1).
 */

/** Korisnička procjena hitnosti - chip, rub kartice, boja naslova grupe u inboxu. */
export const DISPECER_PALETA_HITNOST = {
  Hitno: {
    tekst: '#BE123C',
    pozadina: 'rgba(255, 228, 230, 0.92)',
    border: 'rgba(190, 18, 60, 0.45)',
    grupaNaslov: '#BE123C',
  },
  /** Amber - srednji sloj između hitnog (crveno) i redovnog (slate). */
  Srednja: {
    tekst: '#B45309',
    pozadina: 'rgba(255, 251, 235, 0.96)',
    border: 'rgba(217, 119, 6, 0.45)',
    grupaNaslov: '#C2410C',
  },
  Niska: {
    tekst: '#475569',
    pozadina: 'rgba(241, 245, 249, 0.92)',
    border: 'rgba(100, 116, 139, 0.4)',
    /** Eksplicitan hladni slate - čitljiv naslov grupe, ne „izađe“ u običan tekst. */
    grupaNaslov: '#64748B',
  },
} as const;

/** Faze obrade - usklađeno s `DispecerStatusBadge` i KPI pločicama. */
export const DISPECER_PALETA_STATUS = {
  inbox: {
    tekst: '#1D4ED8',
    pozadina: 'rgba(219, 234, 254, 0.92)',
    border: 'rgba(29, 78, 216, 0.38)',
    /** KPI + tag „Novi“ (prije čarobnjaka) - plava. */
    kpi: '#2563EB',
  },
  uObradi: {
    tekst: '#7E22CE',
    pozadina: 'rgba(250, 245, 255, 0.96)',
    border: 'rgba(147, 51, 234, 0.4)',
    /** Ljubičasta - „U obradi“ / čarobnjak (`in_review`). Za teren v. `uToku`. */
    kpi: '#A855F7',
  },
  dodijeljeno: {
    tekst: '#0369A1',
    pozadina: 'rgba(224, 242, 254, 0.95)',
    border: 'rgba(2, 132, 199, 0.4)',
    /** Nebo - prije zelenog „termin potvrđen“. */
    kpi: '#0284C7',
  },
  terminPotvrden: {
    tekst: '#166534',
    pozadina: 'rgba(220, 252, 231, 0.95)',
    border: 'rgba(22, 163, 74, 0.45)',
    /** Zelena - potvrđeno u čarobnjaku (prioritet i termin). */
    kpi: '#16A34A',
  },
  uToku: {
    tekst: '#6D28D9',
    pozadina: 'rgba(237, 233, 254, 0.95)',
    border: 'rgba(124, 58, 237, 0.42)',
    /** Ljubičasta - tag + KPI „U toku“ (teren). */
    kpi: '#7C3AED',
  },
  zavrseno: {
    tekst: 'var(--first-secondary)',
    pozadina: 'rgb(var(--first-secondary-rgb) / 0.1)',
    border: 'rgb(var(--first-secondary-rgb) / 0.25)',
    kpi: 'var(--first-secondary)',
  },
  neutral: {
    tekst: 'var(--first-nonary)',
    pozadina: 'rgb(var(--first-quinary-rgb) / 0.25)',
    border: 'rgb(var(--first-quaternary-rgb) / 0.4)',
    kpi: 'rgb(var(--first-nonary-rgb) / 0.85)',
  },
  zatvoreno: {
    tekst: 'var(--first-nonary)',
    pozadina: 'rgb(var(--first-quinary-rgb) / 0.22)',
    border: 'rgb(var(--first-quaternary-rgb) / 0.35)',
    kpi: 'rgb(var(--first-nonary-rgb) / 0.8)',
  },
  /** Odbijeno - tamniji crveni od korisničke „Hitno“ (rose). */
  odbijeno: {
    tekst: '#991B1B',
    pozadina: 'rgba(254, 226, 226, 0.88)',
    border: 'rgba(153, 27, 27, 0.38)',
    kpi: '#991B1B',
  },
} as const;

/** Premium / hitna intervencija - ne dijeli hex s `DISPECER_PALETA_HITNOST.Hitno`. */
export const DISPECER_PALETA_PREMIUM = {
  akcent: '#E11D48',
  toast: '#E11D48',
} as const;

export type OperativniPrioritetKljuc = 'NISKO' | 'SREDNJE' | 'VISOKO' | 'KRITIČNO' | 'HITNO';

/**
 * Boje isključivo za `final_priority` (trijaža dispečera).
 * Nije `DISPECER_PALETA_HITNOST` (korisnik), niti `DISPECER_PALETA_STATUS` (životni ciklus).
 */
export const DISPECER_PALETA_OPERATIVNI_PRIORITET: Record<
  OperativniPrioritetKljuc,
  { tekst: string; pozadina: string; border: string; tamnaPozadina?: boolean }
> = {
  NISKO: {
    tekst: '#0F766E',
    pozadina: 'rgba(204, 251, 241, 0.92)',
    border: 'rgba(15, 118, 110, 0.38)',
  },
  SREDNJE: {
    tekst: '#3730A3',
    pozadina: 'rgba(238, 242, 255, 0.96)',
    border: 'rgba(67, 56, 202, 0.36)',
  },
  VISOKO: {
    tekst: '#C2410C',
    pozadina: 'rgba(255, 237, 213, 0.96)',
    border: 'rgba(234, 88, 12, 0.42)',
  },
  'KRITIČNO': {
    tekst: '#86198F',
    pozadina: 'rgba(250, 232, 255, 0.95)',
    border: 'rgba(134, 25, 143, 0.4)',
  },
  HITNO: {
    tekst: '#FEF2F2',
    pozadina: '#881337',
    border: '#4C0519',
    tamnaPozadina: true,
  },
} as const;

/** Mapira vrijednost iz baze na ključ palete (ASCII / dijakritika). */
export function normalizujKljucOperativnogPrioriteta(oznakaRaw: string): OperativniPrioritetKljuc {
  const u = oznakaRaw.trim().toUpperCase();
  if (u === 'NISKO') return 'NISKO';
  if (u === 'SREDNJE') return 'SREDNJE';
  if (u === 'VISOKO') return 'VISOKO';
  if (u === 'HITNO') return 'HITNO';
  if (u === 'KRITIČNO' || u === 'KRITICNO') return 'KRITIČNO';
  return 'SREDNJE';
}

export function vizuelOperativnogPrioriteta(oznakaRaw: string) {
  return DISPECER_PALETA_OPERATIVNI_PRIORITET[normalizujKljucOperativnogPrioriteta(oznakaRaw)];
}

/** Tekstualni prikaz vrijednosti (detalji / expand) - ista semantika boja kao chip. */
export function stilTekstaOperativnogPrioriteta(vrijednost: string): {
  className: string;
  style: { color: string };
} {
  const slot = vizuelOperativnogPrioriteta(vrijednost);
  const k = normalizujKljucOperativnogPrioriteta(vrijednost);
  const naglasak = k === 'HITNO' || k === 'KRITIČNO' || k === 'VISOKO';
  const bojaTeksta = slot.tamnaPozadina ? slot.pozadina : slot.tekst;
  return {
    className: ['text-sm leading-snug', naglasak ? 'font-bold' : 'font-semibold'].join(' '),
    style: { color: bojaTeksta },
  };
}

/**
 * Relativno vrijeme u listi - nije ista skala kao hitnost (stale = pažnja bez rose crvene).
 */
export const DISPECER_PALETA_RELATIVNO_VRIJEME = {
  fresh: 'rgb(var(--first-nonary-rgb) / 0.68)',
  yesterday: 'rgb(var(--first-nonary-rgb) / 0.86)',
  stale: '#A16207',
} as const;

/** KPI „Svi aktivni“ - siva (agregat, bez boje faze). */
export const DISPECER_PALETA_KPI_AKTIVNI = '#64748B';

export function bojaRelativnogPrijaveDispecera(ton: 'fresh' | 'yesterday' | 'stale'): string {
  return DISPECER_PALETA_RELATIVNO_VRIJEME[ton];
}
