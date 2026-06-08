'use client';

import type { ServisniZahtjev } from '@/domain/types/servisirane';
import { DispecerStatusBadge } from '@/components/servisirane/zahtjevBadgeovi';
import { DISPECER_PALETA_STATUS } from '@/lib/servisirane/dispecerPaleta';
import {
  fazaObradeNazivZaKarticu,
  zahtjevJeNoviUPregleduDispecera,
} from '@/lib/servisirane/dispecerskeFaze';
import { zahtjevCekaObraduUInboxuDispecera } from '@/lib/servisirane/statusZahtjeva';

type DispecerPaletaStatus =
  (typeof DISPECER_PALETA_STATUS)[keyof typeof DISPECER_PALETA_STATUS];

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
 * - Inbox (novi/u_obradi): "Novi" ili "U obradi" + pod-faza
 * - potvrdeno + serviser_odbio_razlog: crveni "Serviser odbio" + "Ponovna dodjela"
 * - potvrdeno (čeka dodjelu): zeleni "Čeka dodjelu"
 * - Izvršenje (dodijeljeno/u_radu/u_izvrsenju): DispecerStatusBadge + faza
 */
export function DispecerPregledTokaBadzevi({
  zahtjev,
}: {
  zahtjev: ServisniZahtjev;
}) {
  const uInboxu = zahtjevCekaObraduUInboxuDispecera(zahtjev.status);

  // potvrdeno je tehnički "u inboxu" (dozvolama), ali vizualno je zasebna faza
  if (zahtjev.status === 'potvrdeno') {
    if (zahtjev.serviser_odbio_razlog) {
      return (
        <span className="flex flex-wrap items-center gap-1">
          <span
            className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold"
            style={{
              color: '#DC2626',
              backgroundColor: 'rgba(220,38,38,0.1)',
              border: '1px solid rgba(220,38,38,0.28)',
            }}
          >
            Serviser odbio
          </span>
          <FazaBedz naziv="Ponovna dodjela" />
        </span>
      );
    }
    return (
      <span className="flex flex-wrap items-center gap-1">
        <span
          className="inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold"
          style={stilBedza(DISPECER_PALETA_STATUS.terminPotvrden)}
        >
          Čeka dodjelu
        </span>
      </span>
    );
  }

  // Statusi van inboxu (dodijeljeno, u_radu, u_izvrsenju, zavrseno, ...)
  if (!uInboxu) {
    const fazaNaziv = fazaObradeNazivZaKarticu(zahtjev);
    return (
      <span className="flex flex-wrap items-center gap-1">
        <DispecerStatusBadge status={zahtjev.status} />
        {fazaNaziv ? <FazaBedz naziv={fazaNaziv} /> : null}
      </span>
    );
  }

  // Inbox: Novi ili U obradi (pending_review / na_cekanju / in_review)
  const jeNovi = zahtjevJeNoviUPregleduDispecera(zahtjev);
  const glavnaPal = jeNovi
    ? DISPECER_PALETA_STATUS.inbox
    : DISPECER_PALETA_STATUS.uObradi;
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
