'use client';

import type { ServisniZahtjev } from '@/domain/types/servisirane';
import { DispecerStatusBadge } from '@/components/servisirane/zahtjevBadgeovi';
import {
  DISPECER_PALETA_HITNOST,
  DISPECER_PALETA_STATUS,
} from '@/lib/servisirane/dispecerPaleta';
import {
  nazivDispecerskeFazePregleda,
  uzmiDispecerskuFazuZaPregled,
  zahtjevJeNoviUPregleduDispecera,
  type DispecerskaFazaPregleda,
} from '@/lib/servisirane/dispecerskeFaze';
import { zahtjevCekaObraduUInboxuDispecera } from '@/lib/servisirane/statusZahtjeva';
import {
  inboxGrupaIzKorisnickeProcjene,
  oznakaInboxHitnostiCekaObradu,
} from '@/lib/servisirane/urgency';

type SlotSaRubom = { tekst: string; pozadina: string; border: string };

function stilBedza(pal: SlotSaRubom) {
  return {
    color: pal.tekst,
    backgroundColor: pal.pozadina,
    border: `1px solid ${pal.border}`,
  } as const;
}

/** Čitljiviji naziv završne pod-faze (izbjegava dvosmislenost sa statusom „potvrđeno“). */
function nazivFazeZaKorisnika(faza: DispecerskaFazaPregleda): string {
  if (faza === 'konačna_potvrda') return 'Završna potvrda';
  return nazivDispecerskeFazePregleda(faza);
}

/**
 * Ista logika kao `DispecerPregledTokaBadzevi` (inbox + pod-faze prema `final_priority`, terminu, serviseru),
 * s korisničkim nazivima - usklađeno s dispečerskim pregledom zahtjeva.
 */
export function KorisnikPregledTokaBadzevi({
  zahtjev,
}: {
  zahtjev: ServisniZahtjev;
}) {
  if (!zahtjevCekaObraduUInboxuDispecera(zahtjev.status)) {
    return <DispecerStatusBadge status={zahtjev.status} variant="korisnik" />;
  }

  const jeNovi = zahtjevJeNoviUPregleduDispecera(zahtjev);
  const faza = uzmiDispecerskuFazuZaPregled(zahtjev);
  /** U inboxu - ista hitnosna paleta kao rub kartice / dispečerski inbox (rose · amber · slate). */
  const glavnaPalHitnost =
    DISPECER_PALETA_HITNOST[inboxGrupaIzKorisnickeProcjene(zahtjev)];
  const glavnaPal = jeNovi ? glavnaPalHitnost : DISPECER_PALETA_STATUS.uObradi;
  const prikaziPodfazu = !jeNovi && faza !== 'ceka_operativni_prioritet';

  return (
    <span className="flex flex-wrap items-center gap-1">
      <span
        className="inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold"
        style={stilBedza(glavnaPal)}
      >
        {jeNovi ? oznakaInboxHitnostiCekaObradu(zahtjev) : 'Dispečer obrađuje'}
      </span>
      {prikaziPodfazu ? (
        <span
          className="inline-flex max-w-[12.5rem] truncate rounded-md px-2 py-0.5 text-[10px] font-semibold"
          style={stilBedza(DISPECER_PALETA_STATUS.neutral)}
          title={nazivFazeZaKorisnika(faza)}
        >
          {nazivFazeZaKorisnika(faza)}
        </span>
      ) : null}
    </span>
  );
}
