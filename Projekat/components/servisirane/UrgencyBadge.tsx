'use client';

import { kategorizirajHitnost } from '@/lib/servisirane/urgency';
import {
  KorisnickaHitnostOutlinedChip,
  NivoHitnostiOutlinedChip,
} from '@/components/servisirane/zahtjevBadgeovi';

interface UrgencyBadgeProps {
  score: number;
  showScore?: boolean;
  /** Korisnički prikaz: Visoka / Srednja / Niska (bez broja bodova). */
  korisnickiPrikaz?: boolean;
  size?: 'sm' | 'md';
}

export function UrgencyBadge({
  score,
  showScore = false,
  korisnickiPrikaz = false,
  size = 'sm',
}: UrgencyBadgeProps) {
  const nivo = kategorizirajHitnost(score);
  const padding = size === 'md' ? 'px-3.5 py-1.5 text-sm' : '';

  if (korisnickiPrikaz) {
    return <KorisnickaHitnostOutlinedChip score={score} className={padding} />;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 ${padding}`}>
      <NivoHitnostiOutlinedChip nivo={nivo} />
      {showScore && (
        <span className="text-xs font-normal tabular-nums opacity-70">
          ({score})
        </span>
      )}
    </span>
  );
}
