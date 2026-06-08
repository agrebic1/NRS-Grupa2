'use client';

import {
  Check,
  ClipboardList,
  Truck,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

// ─── Definicija koraka ────────────────────────────────────────────────────────

interface Korak {
  kljuc: string;
  naziv: string;
  skrNaziv: string; // Za mobilni prikaz
  Ikona: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
}

const KORACI: Korak[] = [
  {
    kljuc: 'dodijeljeno',
    naziv: 'Dodijeljeno',
    skrNaziv: 'Dodjela',
    Ikona: ClipboardList,
  },
  {
    kljuc: 'u_radu',
    naziv: 'Prihvaćeno',
    skrNaziv: 'Prihv.',
    Ikona: CheckCircle2,
  },
  { kljuc: 'u_izvrsenju', naziv: 'Na terenu', skrNaziv: 'Teren', Ikona: Truck },
  {
    kljuc: 'zavrseno',
    naziv: 'Završeno',
    skrNaziv: 'Završ.',
    Ikona: CheckCircle2,
  },
];

// ─── Redoslijed statusa ───────────────────────────────────────────────────────

const REDOSLIJED: string[] = [
  'dodijeljeno',
  'u_radu',
  'u_izvrsenju',
  'zavrseno',
];

function indeksKoraka(status: string): number {
  return REDOSLIJED.indexOf(status);
}

// ─── Boje ─────────────────────────────────────────────────────────────────────

const ZELENA = '#22C55E';
const CRVENA = '#DC2626';
const SIVA_BG = 'rgba(156,163,175,0.18)';
const SIVA_RUBA = 'rgba(156,163,175,0.4)';
const SIVA_TXT = '#9CA3AF';

// ─── Komponenta ───────────────────────────────────────────────────────────────

export function IntervencijaProgressStepper({ status }: { status: string }) {
  const jeOtkazanoOdbijeno = status === 'otkazano' || status === 'odbijeno';

  const aktivniIndeks = indeksKoraka(status);

  // ── Slučaj: otkazano / odbijeno ────────────────────────────────────────────
  if (jeOtkazanoOdbijeno) {
    const oznaka = status === 'otkazano' ? 'Otkazano' : 'Odbijeno';
    return (
      <div className="flex flex-col items-center gap-2 py-2">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full"
          style={{
            backgroundColor: 'rgba(220,38,38,0.12)',
            border: `2px solid rgba(220,38,38,0.35)`,
          }}
        >
          <XCircle className="h-6 w-6" style={{ color: CRVENA }} />
        </div>
        <span
          className="text-xs font-semibold tracking-wide uppercase"
          style={{ color: CRVENA }}
        >
          {oznaka}
        </span>
      </div>
    );
  }

  // ── Normalni tok ───────────────────────────────────────────────────────────
  return (
    <div className="w-full px-1 py-2">
      <div className="flex items-start">
        {KORACI.map((korak, idx) => {
          const jeZavrsen = aktivniIndeks > idx;
          const jeAktivan = aktivniIndeks === idx;
          const jeBudući = aktivniIndeks < idx;
          const jePoslednji = idx === KORACI.length - 1;
          const IkonaKoraka = korak.Ikona;

          return (
            <div
              key={korak.kljuc}
              className="flex flex-1 flex-col items-center"
            >
              {/* Gornji red: krug + linija */}
              <div className="flex w-full items-center">
                {/* Lijeva linija (nije kod prvog) */}
                {idx > 0 && (
                  <div
                    className="h-0.5 flex-1 transition-colors duration-500"
                    style={{
                      backgroundColor:
                        jeZavrsen || jeAktivan ? ZELENA : SIVA_RUBA,
                    }}
                  />
                )}

                {/* Krug */}
                <div className="relative flex-shrink-0">
                  {/* Pulsni prsten za aktivni korak */}
                  {jeAktivan && (
                    <span
                      className="absolute inset-0 -m-1.5 animate-ping rounded-full opacity-30"
                      style={{ backgroundColor: 'var(--first-secondary)' }}
                    />
                  )}

                  <div
                    className="relative flex items-center justify-center rounded-full transition-all duration-300"
                    style={{
                      width: jeAktivan ? '2.25rem' : '1.875rem',
                      height: jeAktivan ? '2.25rem' : '1.875rem',
                      backgroundColor: jeZavrsen
                        ? ZELENA
                        : jeAktivan
                          ? 'var(--first-secondary)'
                          : SIVA_BG,
                      border:
                        jeZavrsen || jeAktivan
                          ? 'none'
                          : `2px solid ${SIVA_RUBA}`,
                    }}
                  >
                    {jeZavrsen ? (
                      <Check
                        className="h-3.5 w-3.5 flex-shrink-0"
                        style={{ color: '#ffffff' }}
                      />
                    ) : jeAktivan ? (
                      <IkonaKoraka
                        className="h-4 w-4 flex-shrink-0"
                        style={{ color: '#ffffff' }}
                      />
                    ) : (
                      <IkonaKoraka
                        className="h-3.5 w-3.5 flex-shrink-0"
                        style={{ color: SIVA_TXT }}
                      />
                    )}
                  </div>
                </div>

                {/* Desna linija (nije kod posljednjeg) */}
                {!jePoslednji && (
                  <div
                    className="h-0.5 flex-1 transition-colors duration-500"
                    style={{
                      backgroundColor: jeZavrsen ? ZELENA : SIVA_RUBA,
                    }}
                  />
                )}
              </div>

              {/* Oznaka ispod kruga */}
              <div className="mt-2 text-center">
                {/* Na mobilnom: prikazuj samo naziv aktivnog koraka, za ostale skraćenicu */}
                <span
                  className={`hidden text-xs font-medium sm:block ${
                    jeAktivan ? 'font-semibold' : ''
                  }`}
                  style={{
                    color: jeZavrsen
                      ? ZELENA
                      : jeAktivan
                        ? 'var(--first-secondary)'
                        : SIVA_TXT,
                  }}
                >
                  {korak.naziv}
                </span>
                {/* Mobilni prikaz */}
                <span
                  className={`block text-[10px] font-medium sm:hidden ${
                    jeBudući && !jeAktivan ? 'invisible' : ''
                  }`}
                  style={{
                    color: jeZavrsen
                      ? ZELENA
                      : jeAktivan
                        ? 'var(--first-secondary)'
                        : SIVA_TXT,
                  }}
                >
                  {jeAktivan ? korak.naziv : korak.skrNaziv}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
