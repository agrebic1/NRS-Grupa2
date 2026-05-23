import type { CSSProperties } from 'react';
import type { ServisniZahtjev } from '@/domain/types/servisirane';
import { DISPECER_PALETA_HITNOST } from '@/lib/servisirane/dispecerPaleta';
import { KORISNIK_PALETA_DASHBOARD_STATUS } from '@/lib/servisirane/statusBoja';
import {
  korisnickiDashboardStatus,
  type KorisnickiDashboardStatus,
} from '@/lib/servisirane/statusZahtjeva';
import {
  efektivniKorisnickiUrgencyScore,
  oznakaInboxHitnostiCekaObradu,
  oznakaKorisnickeHitnostiTriRazine,
} from '@/lib/servisirane/urgency';

/**
 * Tekst bedža u korisničkoj listi/detalju — jedna oznaka životnog ciklusa.
 */
export function korisnickiTokBedzTekst(zahtjev: ServisniZahtjev): string {
  const d = korisnickiDashboardStatus(zahtjev.status, zahtjev.final_priority);
  if (d === 'novi') return oznakaInboxHitnostiCekaObradu(zahtjev);
  const MAP: Record<KorisnickiDashboardStatus, string> = {
    novi:      '',
    u_obradi:  'Dispečer obrađuje',
    potvrdeno: 'Serviser dodijeljen',
    u_toku:    'Na terenu',
    zavrseno:  'Završeno',
    zatvoreno: 'Zatvoreno',
    otkazano:  'Otkazano',
    odbijeno:  'Odbijeno',
  };
  return MAP[d] ?? d;
}

function stilHitnostiZaNovi(zahtjev: ServisniZahtjev): CSSProperties {
  const tri = oznakaKorisnickeHitnostiTriRazine(efektivniKorisnickiUrgencyScore(zahtjev));
  const kljuc = tri === 'Niska' ? 'Niska' : tri === 'Srednja' ? 'Srednja' : 'Hitno';
  const cfg = DISPECER_PALETA_HITNOST[kljuc];
  return {
    backgroundColor: cfg.pozadina,
    color: cfg.tekst,
    border: `1px solid ${cfg.border}`,
  };
}

/** Stil bedža — usklađeno s `stilStatusBedzaZaDashboard` na početnoj korisnika. */
export function korisnickiTokBedzStil(zahtjev: ServisniZahtjev): CSSProperties {
  const d = korisnickiDashboardStatus(zahtjev.status, zahtjev.final_priority);
  if (d === 'novi') return stilHitnostiZaNovi(zahtjev);

  const slot = KORISNIK_PALETA_DASHBOARD_STATUS[d as keyof typeof KORISNIK_PALETA_DASHBOARD_STATUS];
  if (!slot) return { backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.22)', color: 'var(--first-nonary)' };
  return { backgroundColor: slot.pozadina, color: slot.boja };
}
