// ─── Status korisničkog naloga - dijeli admin/korisnici i admin/serviseri ─────

export type StatusKorisnika = 'aktivan' | 'neaktivan' | 'suspendovan';

export const BADGE_STATUSA: Record<
  StatusKorisnika,
  { oznaka: string; pozadina: string; boja: string }
> = {
  aktivan: {
    oznaka: 'Aktivan',
    pozadina: 'rgb(var(--first-secondary-rgb) / 0.15)',
    boja: 'var(--first-secondary)',
  },
  neaktivan: {
    oznaka: 'Neaktivan',
    pozadina: 'rgb(var(--first-septenary-rgb) / 0.2)',
    boja: 'var(--first-septenary)',
  },
  suspendovan: {
    oznaka: 'Suspendovan',
    pozadina: 'rgb(var(--first-senary-rgb) / 0.12)',
    boja: 'var(--first-senary)',
  },
};
