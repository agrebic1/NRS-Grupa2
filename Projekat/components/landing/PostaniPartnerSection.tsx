import Link from 'next/link';
import { ArrowRight, Wrench, Headphones, ShieldCheck } from 'lucide-react';

const PREDNOSTI = [
  {
    Ikona: Wrench,
    tekst: 'Kontinuiran tok intervencija bez ručne koordinacije',
  },
  {
    Ikona: Headphones,
    tekst: 'Dispečerska podrška i digitalni radni nalozi',
  },
  {
    Ikona: ShieldCheck,
    tekst: 'Verifikacioni badge koji gradi povjerenje kod klijenata',
  },
];

export function PostaniPartnerSection() {
  return (
    <section
      className="py-20"
      style={{ backgroundColor: 'var(--first-primary)' }}
    >
      <div className="container mx-auto px-5 sm:px-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-10 lg:flex-row lg:gap-16">
          {/* Tekst */}
          <div className="flex flex-col gap-6 lg:flex-1">
            <div
              className="w-fit rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide"
              style={{
                backgroundColor: 'rgb(var(--first-septenary-rgb) / 0.2)',
                color:           'var(--first-septenary)',
                border:          '1px solid rgb(var(--first-septenary-rgb) / 0.35)',
              }}
            >
              Postanite partner
            </div>
            <h2
              className="text-3xl font-bold leading-tight text-white sm:text-4xl"
            >
              Serviseri i dispečeri - proširite posao s nama
            </h2>
            <p
              className="text-base leading-relaxed"
              style={{ color: 'rgb(var(--first-tertiary-rgb) / 0.75)' }}
            >
              Prijavite se kao partner i počnite primati intervencije direktno
              kroz platformu. Verifikacija stručnosti gradi povjerenje kod
              klijenata.
            </p>
            <ul className="flex flex-col gap-3">
              {PREDNOSTI.map(({ Ikona, tekst }) => (
                <li key={tekst} className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: 'rgb(var(--first-septenary-rgb) / 0.18)' }}
                  >
                    <Ikona
                      className="h-4 w-4"
                      style={{ color: 'var(--first-septenary)' }}
                    />
                  </div>
                  <span
                    className="text-sm"
                    style={{ color: 'rgb(var(--first-tertiary-rgb) / 0.8)' }}
                  >
                    {tekst}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA kartica */}
          <div
            className="w-full max-w-sm flex-shrink-0 rounded-2xl p-8"
            style={{
              backgroundColor: 'rgb(255 255 255 / 0.07)',
              border:          '1px solid rgb(255 255 255 / 0.15)',
              backdropFilter:  'blur(12px)',
            }}
          >
            <p
              className="mb-2 text-sm font-semibold uppercase tracking-widest"
              style={{ color: 'rgb(var(--first-quaternary-rgb) / 0.7)' }}
            >
              Prijava partnerstva
            </p>
            <h3 className="mb-3 text-xl font-bold text-white">
              Besplatna prijava - odgovor za 24h
            </h3>
            <p
              className="mb-6 text-sm leading-relaxed"
              style={{ color: 'rgb(var(--first-tertiary-rgb) / 0.65)' }}
            >
              Popunite kratku formu sa vašim podacima i certifikatom. Nakon
              odobrenja, dobijate nalog i možete odmah početi.
            </p>
            <Link
              href="/postani-partner"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-base font-semibold transition-colors duration-200"
              style={{
                backgroundColor: 'var(--first-septenary)',
                color:           'var(--first-octonary)',
              }}
            >
              Aplicirajte sada
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
