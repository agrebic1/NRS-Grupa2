'use client';

import { razloziAdresu } from '@/lib/servisirane/adresaPrikaz';

const SUMMARY_KLASA =
  'mt-1 cursor-pointer list-none text-xs font-semibold underline-offset-2 hover:underline [&::-webkit-details-marker]:hidden';

type Variant = 'lista' | 'kartica' | 'panel';

export function AdresaProsiriva({
  address,
  variant,
  className = '',
}: {
  address: string | null | undefined;
  variant: Variant;
  className?: string;
}) {
  const r = razloziAdresu(address);

  const tekstKlasaPanel =
    variant === 'panel'
      ? 'break-words font-medium leading-snug'
      : variant === 'kartica'
        ? 'line-clamp-2 break-words text-sm font-medium leading-snug'
        : 'break-words text-sm font-medium leading-snug';

  const bojaTeksta =
    variant === 'kartica'
      ? ({ color: 'var(--first-nonary)' } as const)
      : ({ color: 'var(--first-octonary)' } as const);

  if (variant === 'lista') {
    return (
      <span
        className={['min-w-0 max-w-[min(100%,32rem)] truncate', className]
          .filter(Boolean)
          .join(' ')}
        title={r.cjelovita || undefined}
      >
        {r.skraceniPrikaz}
      </span>
    );
  }

  const tooltip = r.imaSkriveno && r.cjelovita ? r.cjelovita : undefined;

  return (
    <div className={['min-w-0', className].filter(Boolean).join(' ')}>
      <p className={tekstKlasaPanel} style={bojaTeksta} title={tooltip}>
        {r.skraceniPrikaz}
      </p>

      {r.administrativniNastavak ? (
        <details className="mt-1.5">
          <summary
            className={SUMMARY_KLASA}
            style={{ color: 'var(--first-secondary)' }}
          >
            Općina, kanton, država…
          </summary>
          <p
            className="mt-2 break-words text-sm leading-relaxed"
            style={bojaTeksta}
          >
            {r.administrativniNastavak}
          </p>
        </details>
      ) : null}

      {r.imaSkriveno && !r.administrativniNastavak ? (
        <details className="mt-1.5">
          <summary
            className={SUMMARY_KLASA}
            style={{ color: 'var(--first-secondary)' }}
          >
            Puna adresa
          </summary>
          <p
            className="mt-2 break-words text-sm leading-relaxed"
            style={bojaTeksta}
          >
            {r.cjelovita}
          </p>
        </details>
      ) : null}
    </div>
  );
}
