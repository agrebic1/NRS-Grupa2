// SLA engine — US-41

export type SlaPrioritet = 'NISKO' | 'SREDNJE' | 'VISOKO' | 'KRITIČNO' | 'HITNO';
export type SlaStatus    = 'ok' | 'upozorenje' | 'prekoraceno';

/** SLA rok u satima po prioritetu (AC5). */
export const SLA_ROKOVI_SATI: Record<SlaPrioritet, number> = {
  NISKO:    72,
  SREDNJE:  24,
  VISOKO:    8,
  'KRITIČNO': 2,
  HITNO:     2,
};

/** Statusi za koje se SLA ne primjenjuje (AC6). */
const ZATVORENI_STATUSI = new Set([
  'zavrseno', 'zatvoreno', 'otkazano', 'odbijeno',
]);

/** Vraća deadline kao Date objekt na osnovu created_at i prioriteta. */
export function izracunajSlaRok(createdAt: string, prioritet: SlaPrioritet): Date {
  const rok = new Date(createdAt);
  rok.setHours(rok.getHours() + SLA_ROKOVI_SATI[prioritet]);
  return rok;
}

/**
 * Vraća SLA status intervencije.
 * Vraća null ako SLA ne vrijedi (zatvorene/otkazane intervencije ili bez prioriteta).
 */
export function getSlaStatus(
  createdAt: string,
  prioritet: string | null,
  status: string,
): SlaStatus | null {
  if (ZATVORENI_STATUSI.has(status)) return null;
  if (!prioritet || !(prioritet in SLA_ROKOVI_SATI)) return null;

  const rok    = izracunajSlaRok(createdAt, prioritet as SlaPrioritet);
  const sada   = new Date();
  const razlikaMs = rok.getTime() - sada.getTime();

  if (razlikaMs < 0)           return 'prekoraceno';
  if (razlikaMs <= 2 * 3600_000) return 'upozorenje';
  return 'ok';
}

/** Vraća preostalo vrijeme do SLA roka kao formatirani string. */
export function formatirајPreostaloVrijeme(createdAt: string, prioritet: string | null): string | null {
  if (!prioritet || !(prioritet in SLA_ROKOVI_SATI)) return null;
  const rok    = izracunajSlaRok(createdAt, prioritet as SlaPrioritet);
  const sada   = new Date();
  const ms     = rok.getTime() - sada.getTime();
  if (ms < 0) {
    const prekoraMs = Math.abs(ms);
    const h = Math.floor(prekoraMs / 3_600_000);
    const m = Math.floor((prekoraMs % 3_600_000) / 60_000);
    return h > 0 ? `-${h}h ${m}min` : `-${m}min`;
  }
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}
