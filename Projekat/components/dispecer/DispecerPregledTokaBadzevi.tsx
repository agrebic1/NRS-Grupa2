'use client';

import type { ServisniZahtjev } from '@/domain/types/servisirane';
import { DispecerStatusBadge } from '@/components/servisirane/zahtjevBadgeovi';
import { DISPECER_PALETA_STATUS } from '@/lib/servisirane/dispecerPaleta';
import {
  fazaObradeNazivZaKarticu,
  zahtjevJeNoviUPregleduDispecera,
} from '@/lib/servisirane/dispecerskeFaze';
import { zahtjevCekaObraduUInboxuDispecera } from '@/lib/servisirane/statusZahtjeva';

type DispecerPaletaStatus = (typeof DISPECER_PALETA_STATUS)[keyof typeof DISPECER_PALETA_STATUS];

function stilBedza(pal: DispecerPaletaStatus) {
  return {
    color: pal.tekst,
    backgroundColor: pal.pozadina,
    border: `1px solid ${pal.border}`,
  } as const;
}

function FazaBedz({ naziv, title }: { naziv: string; title?: string }) {
  return (
    <span
      className="inline-flex max-w-[12.5rem] truncate rounded-md px-2 py-0.5 text-[10px] font-semibold"
      style={stilBedza(DISPECER_PALETA_STATUS.neutral)}
      title={title ?? naziv}
    >
      {naziv}
    </span>
  );
}

/**
 * Prikazuje STATUS zahtjeva + FAZU obrade kao odvojene bedževe.
 *
 * - Inbox: "Novi" ili "U obradi" + faza (Procjena zahtjeva / Dogovor termina / Izbor servisera / Potvrda termina)
 * - Potvrdeno + odbijeno: crveni "Serviser odbio" badge umjesto zelenog Potvrđeno
 * - Ostali aktivni statusi: samo DispecerStatusBadge + faza
 */
export function DispecerPregledTokaBadzevi({ zahtjev }: { zahtjev: ServisniZahtjev }) {
  const uInboxu = zahtjevCekaObraduUInboxuDispecera(zahtjev.status);

  // Requests outside inbox (potvrdeno, dodijeljeno, u_radu, u_izvrsenju, zavrseno, etc.)
  if (!uInboxu) {
    // Poseban slučaj: serviser odbio — status ostaje 'potvrdeno' ali treba crveni badge
    const jeOdbijen = zahtjev.status === 'potvrdeno' && !!zahtjev.serviser_odbio_razlog;
    if (jeOdbijen) {
      return (
        <span className="flex flex-wrap items-center gap-1">
          <span
            className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold"
            style={{
              color:           '#DC2626',
              backgroundColor: 'rgba(220,38,38,0.1)',
              border:          '1px solid rgba(220,38,38,0.28)',
            }}
          >
            Serviser odbio
          </span>
          <FazaBedz naziv="Ponovna dodjela" />
        </span>
      );
    }

    const fazaNaziv = fazaObradeNazivZaKarticu(zahtjev);
    return (
      <span className="flex flex-wrap items-center gap-1">
        <DispecerStatusBadge status={zahtjev.status} />
        {fazaNaziv ? <FazaBedz naziv={fazaNaziv} /> : null}
      </span>
    );
  }

  const jeNovi    = zahtjevJeNoviUPregleduDispecera(zahtjev);
  const glavnaPal = jeNovi ? DISPECER_PALETA_STATUS.inbox : DISPECER_PALETA_STATUS.uObradi;
  const fazaNaziv = fazaObradeNazivZaKarticu(zahtjev);

  return (
    <span className="flex flex-wrap items-center gap-1">
      <span
        className="inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold"
        style={stilBedza(glavnaPal)}
      >
        {jeNovi ? 'Novi' : 'U obradi'}
      </span>
      {fazaNaziv ? (
        <FazaBedz naziv={fazaNaziv} title={`Faza: ${fazaNaziv}`} />
      ) : null}
    </span>
  );
}
