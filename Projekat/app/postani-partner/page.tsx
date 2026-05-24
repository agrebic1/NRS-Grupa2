import Link from 'next/link';
import {
  Settings, ArrowLeft, Users, Wrench, Shield,
  ClipboardList, SearchCheck, Mail, Rocket,
} from 'lucide-react';
import { PartnerApplicationForm } from '@/components/forms/PartnerApplicationForm';

// ─── Benefiti ─────────────────────────────────────────────────────────────────

const BENEFITI = [
  {
    Ikona:  Users,
    naslov: 'Stabilan tok posla',
    opis:   'Primajte intervencije direktno kroz platformu bez ručne koordinacije.',
  },
  {
    Ikona:  Wrench,
    naslov: 'Digitalni radni nalozi',
    opis:   'Sve informacije na jednom mjestu - adresa, opis, prioritet.',
  },
  {
    Ikona:  Shield,
    naslov: 'Pravovremena plaćanja',
    opis:   'Transparentan sistem evidencije završenih radova i naknada.',
  },
];

// ─── Koraci procesa ───────────────────────────────────────────────────────────

const KORACI = [
  {
    Ikona:  ClipboardList,
    naslov: 'Popunite aplikaciju',
    opis:   'Unesite lične podatke i priložite dokaz o stručnosti',
  },
  {
    Ikona:  SearchCheck,
    naslov: 'Pregled aplikacije',
    opis:   'Administrator pregleda vašu prijavu u roku od 24h',
  },
  {
    Ikona:  Mail,
    naslov: 'Dobijate pristupne podatke',
    opis:   'Email s privremenom lozinkom za aktivaciju naloga',
  },
  {
    Ikona:  Rocket,
    naslov: 'Počnite primati intervencije',
    opis:   'Vaš profil je aktivan i vidljiv dispečerima',
  },
];

// ─── Stranica ─────────────────────────────────────────────────────────────────

export default function PostaniPartnerPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--first-tertiary)' }}>

      {/* Navigacija */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-5 py-4 sm:px-8"
        style={{
          backgroundColor: 'rgb(var(--first-tertiary-rgb) / 0.92)',
          backdropFilter:  'blur(12px)',
          borderBottom:    '1px solid rgb(var(--first-quaternary-rgb) / 0.3)',
        }}
      >
        <Link href="/" className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ backgroundColor: 'var(--first-primary)' }}
          >
            <Settings className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold tracking-tight" style={{ color: 'var(--first-octonary)' }}>
            InterServ
          </span>
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: 'var(--first-secondary)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Povratak
        </Link>
      </header>

      <main className="container mx-auto px-5 py-12 sm:px-8">
        {/* Hero */}
        <div className="mb-12 text-center">
          <div
            className="mx-auto mb-4 w-fit rounded-full px-4 py-1.5 text-xs font-semibold
              uppercase tracking-wide"
            style={{
              backgroundColor: 'rgb(var(--first-septenary-rgb) / 0.2)',
              color:           'var(--first-senary)',
              border:          '1px solid rgb(var(--first-septenary-rgb) / 0.4)',
            }}
          >
            Partneri platforme
          </div>
          <h1
            className="text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ color: 'var(--first-octonary)' }}
          >
            Postanite partner InterServ platforme
          </h1>
          <p
            className="mx-auto mt-4 max-w-xl text-base leading-relaxed"
            style={{ color: 'var(--first-nonary)' }}
          >
            Prijavite se kao serviser ili dispečer. Vaša aplikacija će biti
            pregledana u roku od 24 sata.
          </p>
        </div>

        {/* 60/40 split: lijevo benefiti+stepper, desno forma */}
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[3fr_2fr]">

          {/* ── Lijevo (60%): Benefiti + Vizuelni stepper ──────────────── */}
          <div className="flex flex-col gap-8">

            {/* Benefiti */}
            <div>
              <h2 className="mb-5 text-xl font-bold" style={{ color: 'var(--first-octonary)' }}>
                Zašto postati partner?
              </h2>
              <div className="flex flex-col gap-4">
                {BENEFITI.map(({ Ikona, naslov, opis }) => (
                  <div key={naslov} className="flex items-start gap-4">
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: 'rgb(var(--first-secondary-rgb) / 0.12)' }}
                    >
                      <Ikona className="h-5 w-5" style={{ color: 'var(--first-secondary)' }} />
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--first-octonary)' }}>
                        {naslov}
                      </p>
                      <p className="mt-0.5 text-sm leading-relaxed" style={{ color: 'var(--first-nonary)' }}>
                        {opis}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vizuelni stepper */}
            <div
              className="rounded-2xl p-6"
              style={{
                backgroundColor: 'rgb(var(--first-primary-rgb) / 0.05)',
                border:          '1px solid rgb(var(--first-primary-rgb) / 0.12)',
              }}
            >
              <h3
                className="mb-5 text-sm font-bold uppercase tracking-wide"
                style={{ color: 'var(--first-primary)' }}
              >
                Proces odobravanja
              </h3>

              <div className="flex flex-col gap-0">
                {KORACI.map(({ Ikona, naslov, opis }, i) => (
                  <div key={naslov} className="flex gap-4">
                    {/* Ikona + linija */}
                    <div className="flex flex-col items-center">
                      <div
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center
                          rounded-full text-sm font-bold"
                        style={{
                          backgroundColor: 'var(--first-primary)',
                          color:           'white',
                        }}
                      >
                        <Ikona className="h-4 w-4" />
                      </div>
                      {i < KORACI.length - 1 && (
                        <div
                          className="w-0.5 flex-1 my-1"
                          style={{ backgroundColor: 'rgb(var(--first-primary-rgb) / 0.2)' }}
                        />
                      )}
                    </div>

                    {/* Tekst */}
                    <div className={`pb-${i < KORACI.length - 1 ? '4' : '0'} min-w-0`}>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: 'var(--first-octonary)' }}
                      >
                        {naslov}
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed" style={{ color: 'var(--first-nonary)' }}>
                        {opis}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Desno (40%): Forma kartica sa shadow-2xl ────────────────── */}
          <div
            className="rounded-3xl p-7 shadow-2xl sm:p-8"
            style={{
              backgroundColor: '#ffffff',
              border:          '1px solid rgb(var(--first-quaternary-rgb) / 0.35)',
            }}
          >
            <h2 className="mb-6 text-lg font-bold" style={{ color: 'var(--first-octonary)' }}>
              Aplikacija za partnerstvo
            </h2>
            <PartnerApplicationForm />
          </div>
        </div>
      </main>
    </div>
  );
}
