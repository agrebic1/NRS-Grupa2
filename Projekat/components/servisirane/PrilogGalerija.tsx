'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { ZoomIn } from 'lucide-react';

const GALERIJA_GRADIJENT =
  'linear-gradient(135deg, rgb(var(--first-secondary-rgb) / 0.22), rgb(var(--first-quaternary-rgb) / 0.16))';

type PrilogGalerijaProps = {
  urls: string[];
  className?: string;
};

/**
 * Pregled priloženih slika: uokvirena glavna slika, minijature za više URL-ova, lightbox na klik.
 */
export function PrilogGalerija({ urls, className = '' }: PrilogGalerijaProps) {
  const [ix, setIx] = useState(0);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const kljuc = urls.join('\0');
  useEffect(() => {
    setIx(0);
  }, [kljuc]);

  if (urls.length === 0) return null;

  const bez = Math.min(ix, urls.length - 1);
  const trenutna = urls[bez] ?? urls[0];

  return (
    <div className={className}>
      <div
        className="rounded-2xl p-[3px] shadow-md"
        style={{ background: GALERIJA_GRADIJENT }}
      >
        <div
          className="relative overflow-hidden rounded-[13px]"
          style={{
            backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.09)',
            boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.4)',
          }}
        >
          <button
            type="button"
            className="group relative block w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-celestial-teal/45 focus-visible:ring-offset-2"
            onClick={() => setLightbox(trenutna)}
            onAuxClick={(e) => {
              if (e.button === 1) {
                e.preventDefault();
                window.open(trenutna, '_blank', 'noopener,noreferrer');
              }
            }}
            aria-label="Povećaj prilog. Srednji klik otvara sliku u novom tabu."
          >
            <div className="relative aspect-[4/3] w-full max-h-[min(26rem,72vh)] sm:aspect-[16/10] sm:max-h-[28rem]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={trenutna}
                alt=""
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/[0.03] opacity-70 transition group-hover:opacity-100" />
              <span className="pointer-events-none absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-lg bg-black/50 px-2.5 py-1.5 text-[11px] font-semibold text-white/95 shadow-lg backdrop-blur-[2px]">
                <ZoomIn className="h-3.5 w-3.5 opacity-90" aria-hidden />
                Povećaj
              </span>
            </div>
          </button>
        </div>
      </div>

      {urls.length > 1 && (
        <ul
          className="mt-3.5 flex flex-wrap gap-2.5"
          aria-label="Miniture priloženih slika"
        >
          {urls.map((url, i) => {
            const odabrano = i === bez;
            return (
              <li key={url}>
                <button
                  type="button"
                  onClick={() => setIx(i)}
                  onAuxClick={(e) => {
                    if (e.button === 1) {
                      e.preventDefault();
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }
                  }}
                  className={[
                    'relative overflow-hidden rounded-xl transition-all duration-200',
                    'h-[4.25rem] w-[4.25rem] sm:h-[4.75rem] sm:w-[4.75rem]',
                    'shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-celestial-teal/45',
                    odabrano
                      ? 'border-[3px] border-celestial-teal shadow-md'
                      : 'border border-[rgb(var(--first-quaternary-rgb)/0.5)] hover:border-[rgb(var(--first-secondary-rgb)/0.65)] hover:shadow',
                  ].join(' ')}
                  style={{
                    backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.14)',
                  }}
                  aria-label={`Prikaži sliku ${i + 1} od ${urls.length}`}
                  aria-current={odabrano ? 'true' : undefined}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {urls.length === 1 && (
        <p
          className="mt-2 text-center text-[11px] leading-snug"
          style={{ color: 'rgb(var(--first-nonary-rgb) / 0.68)' }}
        >
          Klik na sliku za puni pregled
        </p>
      )}

      {lightbox && (
        <button
          type="button"
          className="fixed inset-0 z-[100] flex cursor-default items-center justify-center bg-black/80 p-4"
          aria-label="Zatvori pregled slike"
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt=""
            className="max-h-[min(98vh,1400px)] max-w-[min(98vw,1600px)] cursor-auto object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </button>
      )}
    </div>
  );
}

type OkvirGalerijeProps = {
  children: ReactNode;
  className?: string;
};

/** Istovjetan okvir kao glavna slika u PrilogGaleriji - za blob pregled u čarobnjaku / kartice. */
export function OkvirGalerije({
  children,
  className = '',
}: OkvirGalerijeProps) {
  return (
    <div
      className={`rounded-2xl p-[3px] shadow-md ${className}`}
      style={{ background: GALERIJA_GRADIJENT }}
    >
      <div
        className="overflow-hidden rounded-[13px]"
        style={{
          backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.09)',
          boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.4)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
