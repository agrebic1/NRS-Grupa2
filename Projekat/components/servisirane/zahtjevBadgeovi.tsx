'use client';

import type { ComponentType, CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Ban,
  Calendar,
  CheckCircle2,
  Clock,
  Crown,
  MapPin,
  Truck,
  XCircle,
} from 'lucide-react';
import type { StatusZahtjeva } from '@/domain/types/servisirane';
import { kategorizirajHitnost, oznakaKorisnickeHitnostiTriRazine } from '@/lib/servisirane/urgency';
import type { NivoHitnosti } from '@/domain/types/servisirane';
import {
  DISPECER_PALETA_HITNOST,
  DISPECER_PALETA_PREMIUM,
  DISPECER_PALETA_STATUS,
  normalizujKljucOperativnogPrioriteta,
  vizuelOperativnogPrioriteta,
} from '@/lib/servisirane/dispecerPaleta';

type StatusCfg = {
  oznaka: string;
  /** Tooltip - faza u odnosu na čarobnjak obrade. */
  title: string;
  boja: string;
  pozadina: string;
  border: string;
  Ikona: ComponentType<{ className?: string; style?: CSSProperties }>;
};

function statusBadgeCfg(
  slot: { tekst: string; pozadina: string; border: string },
  oznaka: string,
  title: string,
  Ikona: StatusCfg['Ikona'],
): StatusCfg {
  return { oznaka, title, boja: slot.tekst, pozadina: slot.pozadina, border: slot.border, Ikona };
}

const PS = DISPECER_PALETA_STATUS;

/** Status zahtjeva - `DISPECER_PALETA_STATUS`; nazivi usklađeni s čarobnjakom obrade (bosanski). */
const DISPECER_STATUS_BADGE: Record<string, StatusCfg> = {
  pending_review: statusBadgeCfg(
    PS.inbox,
    'Novi',
    'Još nije otvoren wizard. Naredno: Pregled → Prioritet → Termin i serviser → Potvrda.',
    Clock,
  ),
  na_cekanju: statusBadgeCfg(
    PS.inbox,
    'Novi',
    'Još nije otvoren wizard (korisnik još može uređivati zahtjev).',
    Clock,
  ),
  in_review: statusBadgeCfg(
    PS.uObradi,
    'U wizardu',
    'Dispečer radi u wizardu: Pregled, Prioritet, Termin i serviser, Pregled naloga, Potvrda.',
    Clock,
  ),
  assigned: statusBadgeCfg(PS.dodijeljeno, 'Dodijeljeno serviseru', 'Serviser dodijeljen; prije odlaska na teren.', CheckCircle2),
  dodijeljeno: statusBadgeCfg(PS.dodijeljeno, 'Dodijeljeno serviseru', 'Serviser dodijeljen; prije odlaska na teren.', CheckCircle2),
  scheduled: statusBadgeCfg(
    PS.terminPotvrden,
    'Potvrđeno',
    'Prioritet i termin potvrđeni u wizardu; naredno je dodjela ili teren.',
    CheckCircle2,
  ),
  potvrdeno: statusBadgeCfg(
    PS.terminPotvrden,
    'Potvrđeno',
    'Završena obrada u wizardu; naredno je intervencija (dodjela ili teren). Korisnik prati tijek na stranici intervencije.',
    CheckCircle2,
  ),
  in_progress: statusBadgeCfg(PS.uToku, 'Na terenu', 'Izvršavanje na lokaciji korisnika.', Truck),
  u_radu: statusBadgeCfg(PS.uToku, 'Na terenu', 'Izvršavanje na lokaciji korisnika.', Truck),
  u_izvrsenju: statusBadgeCfg(PS.uToku, 'Na terenu', 'Izvršavanje na lokaciji korisnika.', Truck),
  completed: statusBadgeCfg(PS.zavrseno, 'Završeno', 'Zahtjev je uspješno zatvoren.', CheckCircle2),
  zavrseno: statusBadgeCfg(PS.zavrseno, 'Završeno', 'Zahtjev je uspješno zatvoren.', CheckCircle2),
  cancelled: statusBadgeCfg(PS.neutral, 'Otkazano', 'Zahtjev je otkazan.', Ban),
  otkazano: statusBadgeCfg(PS.neutral, 'Otkazano', 'Zahtjev je otkazan.', Ban),
  closed: statusBadgeCfg(PS.zatvoreno, 'Zatvoreno', 'Zahtjev je zatvoren.', CheckCircle2),
  odbijeno: statusBadgeCfg(PS.odbijeno, 'Odbijeno', 'Dispečer je odbio zahtjev.', XCircle),
};

const FALLBACK_DISPECER_STATUS: StatusCfg = {
  oznaka: 'Nepoznat status',
  title: 'Status nije prepoznat u sistemu.',
  boja: 'var(--first-nonary)',
  pozadina: 'rgb(var(--first-quinary-rgb) / 0.2)',
  border: 'rgb(var(--first-quaternary-rgb) / 0.35)',
  Ikona: Clock,
};

export function DispecerStatusBadge({
  status,
  variant = 'dispecer',
}: {
  status: StatusZahtjeva | string;
  /** Korisnički prikaz: npr. `in_review` → „Dispečer obrađuje“ umjesto „U čarobnjaku“. */
  variant?: 'dispecer' | 'korisnik';
}) {
  const cfg = DISPECER_STATUS_BADGE[status] ?? FALLBACK_DISPECER_STATUS;
  const Ikona = cfg.Ikona;
  const oznaka =
    variant === 'korisnik' && status === 'in_review' ? 'Dispečer obrađuje' : cfg.oznaka;
  const title =
    variant === 'korisnik' && status === 'in_review'
      ? 'Dispečer obrađuje zahtjev (prioritet, termin, serviser).'
      : cfg.title;
  return (
    <span
      title={title}
      className="inline-flex max-w-[min(100%,16rem)] shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold sm:max-w-none"
      style={{
        backgroundColor: cfg.pozadina,
        color: cfg.boja,
        border: `1px solid ${cfg.border}`,
      }}
    >
      <Ikona className="h-3 w-3 flex-shrink-0" />
      <span className="truncate">{oznaka}</span>
    </span>
  );
}

/** Hitna intervencija (premium) - kruna uz naziv; korisnička visoka hitnost kao kontekst. */
export function PremiumHitnaBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex w-fit max-w-full flex-col items-start gap-1 text-left ${className}`}
    >
      <span
        className="inline-flex w-fit max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold text-white"
        style={{ backgroundColor: DISPECER_PALETA_PREMIUM.akcent }}
      >
        <Crown className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} aria-hidden />
        <span className="leading-tight">Hitna intervencija (premium)</span>
      </span>
      <span
        className="max-w-[14rem] pl-0.5 text-[11px] font-semibold leading-snug sm:max-w-none"
        style={{ color: 'rgb(80 52 42)' }}
      >
        Visoka hitnost od strane korisnika
      </span>
    </span>
  );
}

/** Mala kruna uz premium zahtjev na dispečerskim listama i sažetku. */
export function DispecerPremiumKruna({
  className = '',
  title = 'Premium hitna intervencija - visoka hitnost od strane korisnika',
}: {
  className?: string;
  title?: string;
}) {
  return (
    <span title={title} className="inline-flex shrink-0" aria-label={title}>
      <Crown
        className={`h-3.5 w-3.5 ${className}`}
        style={{ color: DISPECER_PALETA_PREMIUM.akcent }}
        strokeWidth={2.25}
        aria-hidden
      />
    </span>
  );
}

/** Korisnička hitnost - `DISPECER_PALETA_HITNOST` (hitno = rose, srednje = amber, nisko = slate). */
export const KORISNICKA_HITNOST_CHIP: Record<
  'Hitno' | 'Srednja' | 'Niska',
  { boja: string; pozadina: string; border: string }
> = {
  Hitno: {
    boja: DISPECER_PALETA_HITNOST.Hitno.tekst,
    pozadina: DISPECER_PALETA_HITNOST.Hitno.pozadina,
    border: DISPECER_PALETA_HITNOST.Hitno.border,
  },
  Srednja: {
    boja: DISPECER_PALETA_HITNOST.Srednja.tekst,
    pozadina: DISPECER_PALETA_HITNOST.Srednja.pozadina,
    border: DISPECER_PALETA_HITNOST.Srednja.border,
  },
  Niska: {
    boja: DISPECER_PALETA_HITNOST.Niska.tekst,
    pozadina: DISPECER_PALETA_HITNOST.Niska.pozadina,
    border: DISPECER_PALETA_HITNOST.Niska.border,
  },
};

function korisnickaHitnostKljuc(score: number): 'Hitno' | 'Srednja' | 'Niska' {
  const nivo = oznakaKorisnickeHitnostiTriRazine(score);
  if (nivo === 'Niska') return 'Niska';
  if (nivo === 'Srednja') return 'Srednja';
  return 'Hitno';
}

export function korisnickaHitnostStil(score: number) {
  const label = korisnickaHitnostKljuc(score);
  const cfg = KORISNICKA_HITNOST_CHIP[label];
  return { label, ...cfg };
}

export function KorisnickaHitnostOutlinedChip({
  score,
  className = '',
  prikaziPredgovor = false,
}: {
  score: number;
  className?: string;
  /** Npr. zaglavlje dispečera: „Korisnička hitnost: Niska“. */
  prikaziPredgovor?: boolean;
}) {
  const { label, boja, pozadina, border } = korisnickaHitnostStil(score);
  return (
    <span
      className={`inline-flex w-fit max-w-full shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${className}`}
      style={{
        backgroundColor: pozadina,
        color: boja,
        border: `1px solid ${border}`,
      }}
    >
      {prikaziPredgovor ? (
        <>
          <span className="font-medium opacity-[0.92]">Procjena hitnosti:</span>
          <span>{label}</span>
        </>
      ) : (
        label
      )}
    </span>
  );
}

/** Značka u zaglavlju / listama: „Operativni prioritet: HITNO“. */
export function OperativniPrioritetChip({
  vrijednost,
  className = '',
}: {
  vrijednost: string;
  className?: string;
}) {
  const v = vrijednost.trim();
  if (!v) return null;
  const pal = vizuelOperativnogPrioriteta(v);
  const k = normalizujKljucOperativnogPrioriteta(v);
  const naglasiVrijednost = k === 'HITNO' || k === 'KRITIČNO' || k === 'VISOKO';

  return (
    <span
      className={`inline-flex max-w-[min(100%,18rem)] shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${className}`}
      style={{
        backgroundColor: pal.pozadina,
        color: pal.tekst,
        border: `1px solid ${pal.border}`,
      }}
    >
      <span className={pal.tamnaPozadina ? 'font-medium opacity-90' : 'font-medium opacity-[0.92]'}>
        Operativni prioritet:
      </span>
      <span className={naglasiVrijednost ? 'font-bold' : ''}>{v}</span>
    </span>
  );
}

/** Operativni nivo (enum u bazi) - ista paleta kao {@link OperativniPrioritetChip} (ne korisnička procjena). */
export function NivoHitnostiOutlinedChip({ nivo }: { nivo: NivoHitnosti }) {
  const pal = vizuelOperativnogPrioriteta(nivo);
  return (
    <span
      className="inline-flex w-fit items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
      style={{
        backgroundColor: pal.pozadina,
        color: pal.tekst,
        border: `1px solid ${pal.border}`,
      }}
    >
      {nivo}
    </span>
  );
}

/** Isti stil svugdje gdje se označava da su koordinate/GPS dodani. */
export function PreciznaLokacijaChip({
  className = '',
  compact = false,
}: {
  className?: string;
  /** Suptilniji prikaz (npr. korisnički detalj zahtjeva). */
  compact?: boolean;
}) {
  return (
    <span
      className={[
        'inline-flex w-fit max-w-full items-center rounded-full font-medium leading-tight',
        compact
          ? 'gap-0.5 px-1.5 py-0.5 text-[10px]'
          : 'gap-1 px-2 py-0.5 text-[11px] font-semibold',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        backgroundColor: compact
          ? 'rgb(var(--first-quinary-rgb) / 0.35)'
          : 'rgb(255 255 255 / 0.55)',
        color: 'var(--first-octonary)',
        border: '1px solid rgb(var(--first-quaternary-rgb) / 0.35)',
      }}
    >
      <MapPin
        className={compact ? 'h-2.5 w-2.5 flex-shrink-0' : 'h-3 w-3 flex-shrink-0'}
        style={{ color: 'var(--first-secondary)' }}
        aria-hidden
      />
      Precizna lokacija dodana
    </span>
  );
}

/** Evidencijski tagovi u expand panelu (preferirani termin / precizna lokacija) - isti outlined stil. */
export function ExpandEvidenceChip({
  Ikona,
  children,
  className = '',
}: {
  Ikona: LucideIcon;
  children: React.ReactNode;
  className?: string;
}) {
  const chipBoja = 'var(--first-nonary)';
  return (
    <span
      className={`inline-flex w-fit max-w-full items-center gap-1 rounded border bg-transparent px-2 py-0.5 text-xs font-medium leading-tight ${className}`}
      style={{
        borderColor: 'rgb(var(--first-quaternary-rgb) / 0.55)',
        color: chipBoja,
      }}
    >
      <Ikona className="h-3 w-3 shrink-0" style={{ color: chipBoja }} aria-hidden strokeWidth={2} />
      {children}
    </span>
  );
}

export function ExpandPanelTerminNavedenChip() {
  return <ExpandEvidenceChip Ikona={Calendar}>Preferirani termin naveden</ExpandEvidenceChip>;
}

export function ExpandPanelPreciznaLokacijaChip() {
  return <ExpandEvidenceChip Ikona={MapPin}>Precizna lokacija dodana</ExpandEvidenceChip>;
}

