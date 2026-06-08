import Link from 'next/link';
import { Settings, Info, ShieldAlert } from 'lucide-react';
import { RegisterForm } from '@/components/forms/RegisterForm';

export default function RegistracijaPage() {
  return (
    <div
      className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12"
      style={{ backgroundColor: 'var(--first-tertiary)' }}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 hidden sm:block"
        style={{
          background:
            'radial-gradient(circle at 52% 35%, rgb(var(--first-septenary-rgb) / 0.11), transparent 44%), radial-gradient(circle at 82% 68%, rgb(var(--first-secondary-rgb) / 0.07), transparent 42%)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-0 hidden sm:block opacity-35"
        style={{
          backgroundImage:
            'linear-gradient(rgb(var(--first-secondary-rgb) / 0.06) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--first-secondary-rgb) / 0.06) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
          maskImage:
            'radial-gradient(circle at center, black 38%, transparent 85%)',
          WebkitMaskImage:
            'radial-gradient(circle at center, black 38%, transparent 85%)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-0 hidden sm:block"
        style={{
          background:
            'linear-gradient(180deg, rgb(var(--first-tertiary-rgb) / 0.15) 0%, rgb(var(--first-tertiary-rgb) / 0.3) 100%)',
        }}
        aria-hidden
      />

      {/* Brand */}
      <Link
        href="/#hero"
        className="relative z-10 mb-7 flex w-fit items-center gap-2.5 rounded-xl p-1 -m-1 outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[rgb(var(--first-septenary-rgb)/0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--first-tertiary)]"
        aria-label="InterServ - povratak na početnu stranicu"
      >
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ backgroundColor: 'var(--first-primary)' }}
        >
          <Settings className="h-5 w-5 text-white" />
        </div>
        <span
          className="text-lg font-bold tracking-tight"
          style={{ color: 'var(--first-octonary)' }}
        >
          InterServ
        </span>
      </Link>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">
        <div
          className="rounded-2xl p-7 shadow-card-lg sm:p-8"
          style={{
            backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.4)',
            border: '1px solid rgb(var(--first-quaternary-rgb) / 0.55)',
            boxShadow: '0 18px 42px rgb(var(--first-primary-rgb) / 0.1)',
            backdropFilter: 'blur(14px)',
          }}
        >
          <div className="mb-6">
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: 'var(--first-octonary)' }}
            >
              Kreirajte korisnički nalog
            </h1>
            <p
              className="mt-2 text-sm leading-relaxed"
              style={{ color: 'var(--first-nonary)' }}
            >
              Registracija je namijenjena korisnicima usluge koji žele prijaviti
              servisnu intervenciju.
            </p>
          </div>

          {/* Important notice */}
          <div
            className="mb-6 flex items-start gap-3 rounded-xl border px-4 py-3"
            style={{
              backgroundColor: 'rgb(var(--first-senary-rgb) / 0.06)',
              borderColor: 'rgb(var(--first-senary-rgb) / 0.25)',
            }}
          >
            <ShieldAlert
              className="mt-0.5 h-4 w-4 flex-shrink-0"
              style={{ color: 'var(--first-senary)' }}
            />
            <p
              className="text-xs leading-relaxed"
              style={{ color: 'var(--first-senary)' }}
            >
              <span className="font-semibold">Napomena za uposlenike:</span> Ako
              ste serviser ili uposlenik sistema, nalog vam kreira
              administrator. Ne registrujte se ovdje.
            </p>
          </div>

          <RegisterForm />

          <div
            className="mt-6 border-t pt-5"
            style={{ borderColor: 'rgb(var(--first-quaternary-rgb) / 0.4)' }}
          >
            <p
              className="text-center text-sm"
              style={{ color: 'var(--first-nonary)' }}
            >
              Već imate nalog?{' '}
              <Link
                href="/auth/login"
                className="font-semibold transition-opacity duration-200 hover:opacity-70"
                style={{ color: 'var(--first-primary)' }}
              >
                Prijavite se
              </Link>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div
          className="mt-4 flex items-start gap-2 rounded-xl px-4 py-3 text-xs"
          style={{ color: 'var(--first-nonary)' }}
        >
          <Info
            className="mt-0.5 h-3.5 w-3.5 flex-shrink-0"
            style={{ color: 'var(--first-secondary)' }}
          />
          <span>
            Kreiranjem naloga prihvatate naše uslove korištenja. Vaši podaci su
            zaštićeni i neće biti dijeljeni s trećim stranama.
          </span>
        </div>
      </div>
    </div>
  );
}
