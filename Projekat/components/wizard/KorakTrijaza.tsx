'use client';

import Link from 'next/link';
import { ShieldAlert, PauseCircle, AlertTriangle, Users, UsersRound, Check, Crown } from 'lucide-react';
import { AlertMessage } from '@/components/ui/AlertMessage';

// ─── Triage state ─────────────────────────────────────────────────────────────

export interface TriageFormState {
  opasnost:       boolean | null;
  funkcionalnost: 'potpuni_prekid' | 'otezana' | 'manja_smetnja' | null;
  steta:          boolean | null;
  ranjivost:      boolean | null;
  obuhvat:        boolean | null;
}

export const INITIAL_TRIAGE: TriageFormState = {
  opasnost:       null,
  funkcionalnost: null,
  steta:          null,
  ranjivost:      null,
  obuhvat:        null,
};

// ─── Pitanja ──────────────────────────────────────────────────────────────────
// Ikone ShieldAlert i AlertTriangle su amber - standardni UI znak upozorenja.
// Sve ostale ikone su neutralno sive. Boja interakcije je plava (var(--first-primary)).

const PITANJA = [
  {
    id:        'opasnost' as const,
    naslov:    'Sigurnost',
    pitanje:   'Da li postoji direktna opasnost po ljude ili imovinu?',
    Ikona:     ShieldAlert,
    ikonaStil: { color: '#F59E0B' } as React.CSSProperties,
    opcije:    [
      { v: 'true',  o: 'Da, postoji opasnost' },
      { v: 'false', o: 'Ne, nema opasnosti'   },
    ],
  },
  {
    id:        'funkcionalnost' as const,
    naslov:    'Zastoj',
    pitanje:   'Kakav je uticaj na svakodnevno funkcioniranje?',
    Ikona:     PauseCircle,
    ikonaStil: {} as React.CSSProperties,
    opcije:    [
      { v: 'potpuni_prekid', o: 'Potpuni prekid rada' },
      { v: 'otezana',        o: 'Otežan rad'          },
      { v: 'manja_smetnja',  o: 'Manja smetnja'       },
    ],
  },
  {
    id:        'steta' as const,
    naslov:    'Materijalna šteta',
    pitanje:   'Postoji li rizik od sekundarne štete (poplava, oštećenje opreme i sl.)?',
    Ikona:     AlertTriangle,
    ikonaStil: { color: '#F59E0B' } as React.CSSProperties,
    opcije:    [
      { v: 'true',  o: 'Da, postoji rizik' },
      { v: 'false', o: 'Ne, nema rizika'   },
    ],
  },
  {
    id:        'ranjivost' as const,
    naslov:    'Ranjive grupe',
    pitanje:   'Da li su prisutna djeca, starije ili bolesne osobe?',
    Ikona:     Users,
    ikonaStil: {} as React.CSSProperties,
    opcije:    [
      { v: 'true',  o: 'Da' },
      { v: 'false', o: 'Ne' },
    ],
  },
  {
    id:        'obuhvat' as const,
    naslov:    'Obim uticaja',
    pitanje:   'Da li problem pogađa više stanara ili korisnika?',
    Ikona:     UsersRound,
    ikonaStil: {} as React.CSSProperties,
    opcije:    [
      { v: 'true',  o: 'Da, više korisnika' },
      { v: 'false', o: 'Ne, samo ja'        },
    ],
  },
] as const;

// ─── Opcija gumb - plava kad je odabrana ─────────────────────────────────────

function OpcijaBtn({
  oznaka,
  aktivan,
  onClick,
}: {
  oznaka:  string;
  aktivan: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={aktivan}
      className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium
        transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1"
      style={
        aktivan
          ? {
              borderColor:     'var(--first-primary)',
              backgroundColor: 'var(--first-primary)',
              color:           '#ffffff',
            }
          : {
              borderColor:     'rgb(var(--first-quaternary-rgb) / 0.45)',
              backgroundColor: 'rgb(255 255 255 / 0.8)',
              color:           'var(--first-octonary)',
            }
      }
    >
      {aktivan && <Check className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={2.5} />}
      {oznaka}
    </button>
  );
}

// ─── Korak 5: Trijaža ─────────────────────────────────────────────────────────

type PremiumLifecycle = 'inactive' | 'pending_payment' | 'active' | 'expired' | 'cancelled' | null;

interface KorakTrijazaProps {
  triage:      TriageFormState;
  onUpdate:    (updates: Partial<TriageFormState>) => void;
  triageError: string | null;
  isPremium: boolean;
  premiumLifecycleStatus?: PremiumLifecycle;
  premiumRequested: boolean;
  premiumTermsAccepted: boolean;
  onPremiumRequestedChange: (value: boolean) => void;
  onPremiumTermsAcceptedChange: (value: boolean) => void;
}

export function KorakTrijaza({
  triage,
  onUpdate,
  triageError,
  isPremium,
  premiumLifecycleStatus = null,
  premiumRequested,
  premiumTermsAccepted,
  onPremiumRequestedChange,
  onPremiumTermsAcceptedChange,
}: KorakTrijazaProps) {
  function getOdabrana(id: keyof TriageFormState): string | undefined {
    const v = triage[id];
    if (v === null || v === undefined) return undefined;
    if (typeof v === 'boolean') return String(v);
    return v;
  }

  const odgovoreno = Object.values(triage).filter((v) => v !== null).length;
  const ukupno     = PITANJA.length;
  const trijažaPreskočena = isPremium && premiumRequested;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="mb-1 text-xl font-bold" style={{ color: 'var(--first-octonary)' }}>
          Procjena hitnosti
        </h2>
        <p className="text-sm" style={{ color: 'var(--first-nonary)' }}>
          {trijažaPreskočena
            ? 'Uz uključenu premium hitnu intervenciju upitnik se ne popunjava - zahtjev se obrađuje kao hitan prema pravilima paketa.'
            : 'Odgovorite na sva pitanja - sistem automatski određuje prioritet zahtjeva.'}
        </p>
      </div>

      {/* Traka napretka */}
      {!trijažaPreskočena && (
        <div className="flex items-center gap-3">
          <div
            className="h-1.5 flex-1 overflow-hidden rounded-full"
            style={{ backgroundColor: 'rgb(var(--first-quaternary-rgb) / 0.25)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width:           `${(odgovoreno / ukupno) * 100}%`,
                backgroundColor: odgovoreno === ukupno ? 'var(--first-secondary)' : 'var(--first-primary)',
              }}
            />
          </div>
          <span
            className="shrink-0 text-xs font-medium tabular-nums"
            style={{ color: 'var(--first-nonary)' }}
          >
            {odgovoreno}/{ukupno}
          </span>
        </div>
      )}

      {triageError && <AlertMessage variant="error" message={triageError} />}

      <div
        className="rounded-xl border p-4"
        style={{
          borderColor: isPremium ? 'rgba(217, 119, 6, 0.35)' : 'rgb(var(--first-quaternary-rgb) / 0.35)',
          backgroundColor: isPremium ? 'rgba(255, 251, 235, 0.95)' : 'rgb(var(--first-quinary-rgb) / 0.2)',
          boxShadow: isPremium ? '0 4px 14px rgba(217, 119, 6, 0.1)' : 'none',
        }}
      >
        <div>
          <p
            className="inline-flex flex-wrap items-center gap-1.5 text-sm font-semibold"
            style={{ color: '#3F2F1E' }}
          >
            <Crown className="h-4 w-4 shrink-0" style={{ color: '#A16207' }} aria-hidden />
            <span>Hitna intervencija (premium)</span>
          </p>
          <p className="mt-1 text-xs font-semibold leading-snug" style={{ color: '#7A6047' }}>
            Visoka hitnost od strane korisnika
          </p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: '#5B4A3A' }}>
            Premium zahtjev dobija prioritetnu obradu prema pravilima premium paketa.
          </p>
        </div>
        {isPremium ? (
          <div className="mt-3 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => onPremiumRequestedChange(!premiumRequested)}
              className="inline-flex w-full items-center rounded-lg border px-4 py-3 text-sm font-semibold transition-all duration-150 hover:brightness-[1.02] focus:outline-none focus:ring-2"
              style={{
                borderColor: premiumRequested ? '#C18820' : '#D4A340',
                backgroundColor: premiumRequested ? 'rgba(245, 158, 11, 0.2)' : 'rgba(252, 211, 77, 0.2)',
                color: '#5A3B1A',
                boxShadow: premiumRequested
                  ? '0 0 0 2px rgba(212, 163, 64, 0.25), inset 0 1px 0 rgba(255,255,255,0.55)'
                  : '0 0 0 1px rgba(212, 163, 64, 0.22), inset 0 1px 0 rgba(255,255,255,0.7)',
                outlineColor: 'rgba(212, 163, 64, 0.5)',
              }}
            >
              {premiumRequested
                ? 'Premium hitna intervencija je uključena'
                : 'Uključi premium hitnu intervenciju'}
              {premiumRequested && (
                <Check className="ml-auto h-4 w-4" style={{ color: '#A16207' }} />
              )}
            </button>
            {premiumRequested && (
              <label className="inline-flex items-start gap-2 text-xs" style={{ color: '#5A3B1A' }}>
                <input
                  type="checkbox"
                  checked={premiumTermsAccepted}
                  onChange={(e) => onPremiumTermsAcceptedChange(e.target.checked)}
                  className="mt-0.5"
                  style={{ accentColor: '#B45309' }}
                />
                Potvrđujem da razumijem uslove premium usluge i pravila prioritetne obrade.
              </label>
            )}
          </div>
        ) : (
          <div className="mt-3 space-y-2 text-xs font-medium" style={{ color: 'var(--first-senary)' }}>
            <p>
              {premiumLifecycleStatus === 'pending_payment' &&
                'Premium čeka potvrdu simulirane uplate - prvo dovršite korake na stranici Premium usluge.'}
              {premiumLifecycleStatus === 'expired' && 'Premium je istekao - obnovite ga na stranici Premium usluge.'}
              {premiumLifecycleStatus === 'cancelled' && 'Premium je otkazan - možete ga ponovo aktivirati na stranici Premium usluge.'}
              {(premiumLifecycleStatus === 'inactive' || premiumLifecycleStatus === null) &&
                'Ova opcija je dostupna samo sa aktivnim premium statusom.'}
            </p>
            <Link
              href="/korisnik/premium"
              className="inline-block font-semibold underline"
              style={{ color: 'var(--first-primary)' }}
            >
              Otvori Premium usluga
            </Link>
          </div>
        )}
      </div>

      {/* Lista pitanja */}
      <div
        className={`relative flex flex-col gap-3 ${trijažaPreskočena ? 'pointer-events-none select-none rounded-xl' : ''}`}
        style={trijažaPreskočena ? { opacity: 0.45 } : undefined}
      >
        {PITANJA.map(({ id, naslov, pitanje, Ikona, ikonaStil, opcije }, index) => {
          const odabrana     = getOdabrana(id);
          const jeOdgovoreno = odabrana !== undefined;

          return (
            <div
              key={id}
              className="overflow-hidden rounded-xl border transition-all duration-200"
              style={{
                borderColor:     jeOdgovoreno
                  ? 'rgb(var(--first-primary-rgb) / 0.35)'
                  : 'rgb(var(--first-quaternary-rgb) / 0.35)',
                backgroundColor: jeOdgovoreno
                  ? 'rgb(var(--first-primary-rgb) / 0.03)'
                  : 'rgb(255 255 255 / 0.65)',
              }}
            >
              {/* Zaglavlje */}
              <div
                className="flex items-center gap-3 border-b px-4 py-3"
                style={{
                  borderColor:     jeOdgovoreno
                    ? 'rgb(var(--first-primary-rgb) / 0.15)'
                    : 'rgb(var(--first-quaternary-rgb) / 0.2)',
                  backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.08)',
                }}
              >
                {/* Redni broj - plavi */}
                <div
                  className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full
                    text-xs font-bold"
                  style={{ backgroundColor: 'var(--first-primary)', color: '#ffffff' }}
                >
                  {index + 1}
                </div>

                {/* Ikona */}
                <Ikona
                  className="h-4 w-4 flex-shrink-0"
                  style={
                    Object.keys(ikonaStil).length > 0
                      ? ikonaStil
                      : { color: 'var(--first-nonary)' }
                  }
                />

                {/* Tekst */}
                <div className="min-w-0 flex-1">
                  <span
                    className="text-xs font-semibold uppercase tracking-wide"
                    style={{ color: 'var(--first-nonary)' }}
                  >
                    {naslov}
                  </span>
                  <p
                    className="text-sm font-medium leading-snug"
                    style={{ color: 'var(--first-octonary)' }}
                  >
                    {pitanje}
                  </p>
                </div>

                {/* Odgovoreno indikator */}
                {jeOdgovoreno && (
                  <div
                    className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: 'var(--first-secondary)' }}
                  >
                    <Check className="h-3 w-3 text-white" strokeWidth={2.5} />
                  </div>
                )}
              </div>

              {/* Opcije */}
              <div className="flex flex-wrap gap-2 px-4 py-3.5">
                {opcije.map(({ v, o }) => (
                  <OpcijaBtn
                    key={v}
                    oznaka={o}
                    aktivan={odabrana === v}
                    onClick={() => {
                      if (id === 'funkcionalnost') {
                        onUpdate({ funkcionalnost: v as TriageFormState['funkcionalnost'] });
                      } else {
                        onUpdate({ [id]: v === 'true' } as Partial<TriageFormState>);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
