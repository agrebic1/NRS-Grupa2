import { Check, X } from 'lucide-react';
import { ZAHTJEVI_LOZINKE } from '@/lib/validations/authValidation';

// Nivoi snage lozinke

interface NivoSnage {
  oznaka: string;
  boja: string;
  minimalniBroj: number;
}

const NIVOI_SNAGE: NivoSnage[] = [
  { oznaka: 'Slaba lozinka', boja: 'var(--first-senary)', minimalniBroj: 0 },
  {
    oznaka: 'Srednja lozinka',
    boja: 'var(--first-septenary)',
    minimalniBroj: 3,
  },
  { oznaka: 'Jaka lozinka', boja: 'var(--first-primary)', minimalniBroj: 5 },
];

const UKUPAN_BROJ_TRAKA = 5;

function odrediNivoSnage(lozinka: string): NivoSnage {
  const brojIspunjenih = ZAHTJEVI_LOZINKE.filter((z) =>
    z.provjeri(lozinka),
  ).length;
  return (
    [...NIVOI_SNAGE]
      .reverse()
      .find((nivo) => brojIspunjenih >= nivo.minimalniBroj) ?? NIVOI_SNAGE[0]
  );
}

// Komponenta

interface PasswordStrengthIndicatorProps {
  lozinka: string;
  prikaziZahtjeve?: boolean;
}

export function PasswordStrengthIndicator({
  lozinka,
  prikaziZahtjeve = true,
}: PasswordStrengthIndicatorProps) {
  if (!lozinka) return null;

  const brojIspunjenih = ZAHTJEVI_LOZINKE.filter((z) =>
    z.provjeri(lozinka),
  ).length;
  const nivo = odrediNivoSnage(lozinka);

  return (
    <div className="flex flex-col gap-3">
      {/* Trake snage + oznaka */}
      <div className="flex flex-col gap-1.5">
        <div className="flex gap-1">
          {Array.from({ length: UKUPAN_BROJ_TRAKA }).map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{
                backgroundColor:
                  i < brojIspunjenih ? nivo.boja : 'var(--first-quinary)',
                opacity: i < brojIspunjenih ? 1 : 0.35,
              }}
            />
          ))}
        </div>
        <p className="text-xs" style={{ color: 'var(--first-nonary)' }}>
          Jačina lozinke:{' '}
          <span className="font-semibold" style={{ color: nivo.boja }}>
            {nivo.oznaka}
          </span>
        </p>
      </div>

      {/* Lista zahtjeva */}
      {prikaziZahtjeve && (
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
          {ZAHTJEVI_LOZINKE.map((zahtjev) => {
            const jeIspunjen = zahtjev.provjeri(lozinka);
            return (
              <div key={zahtjev.id} className="flex items-center gap-1.5">
                {jeIspunjen ? (
                  <Check
                    className="h-3.5 w-3.5 flex-shrink-0"
                    style={{ color: 'var(--first-secondary)' }}
                  />
                ) : (
                  <X
                    className="h-3.5 w-3.5 flex-shrink-0"
                    style={{ color: 'var(--first-senary)' }}
                  />
                )}
                <span
                  className="text-xs transition-colors duration-200"
                  style={{
                    color: jeIspunjen
                      ? 'var(--first-secondary)'
                      : 'var(--first-senary)',
                  }}
                >
                  {zahtjev.oznaka}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
