'use client';

import Link from 'next/link';
import { Clock, CalendarCheck, Truck, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// ─── Paper airplane SVG ───────────────────────────────────────────────────────

function PaperAirplane({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M44 4L22 26"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M44 4L30 44L22 26L4 18L44 4Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.15"
      />
    </svg>
  );
}

// ─── Lifecycle step ───────────────────────────────────────────────────────────

interface LifecycleStepProps {
  Ikona:   React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  oznaka:  string;
  opis:    string;
  boja:    string;
  aktivan: boolean;
}

function LifecycleStep({ Ikona, oznaka, opis, boja, aktivan }: LifecycleStepProps) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
        style={{
          backgroundColor: aktivan ? boja : `${boja}22`,
          border:          `1.5px solid ${boja}50`,
        }}
      >
        <Ikona
          className="h-4 w-4"
          style={{ color: aktivan ? '#fff' : boja }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="text-sm font-semibold"
          style={{ color: aktivan ? 'var(--first-octonary)' : 'var(--first-nonary)' }}
        >
          {oznaka}
          {aktivan && (
            <span
              className="ml-2 rounded-full px-2 py-0.5 text-xs font-bold"
              style={{ backgroundColor: `${boja}22`, color: boja }}
            >
              Trenutni status
            </span>
          )}
        </p>
        <p className="text-xs" style={{ color: 'var(--first-quinary)' }}>
          {opis}
        </p>
      </div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface SuccessModalProps {
  onZatvori?: () => void;
}

export function SuccessModal({ onZatvori }: SuccessModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-3xl shadow-card-lg"
        style={{
          backgroundColor: 'var(--first-tertiary)',
          border:          '1px solid rgb(var(--first-quaternary-rgb) / 0.4)',
        }}
      >
        {/* Pozadinska dekoracija */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 70% 20%, var(--first-secondary) 0%, transparent 60%)',
          }}
          aria-hidden
        />

        {/* Animacija aviončića */}
        <div className="relative flex h-24 items-center justify-center overflow-hidden">
          <div
            className="animate-[flight_1.8s_ease-out_forwards]"
            style={{ color: 'var(--first-secondary)' }}
          >
            <PaperAirplane className="h-14 w-14 drop-shadow-md" />
          </div>
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            aria-hidden
          >
            <path
              d="M 10 80 Q 60 40 88 16"
              stroke="var(--first-secondary)"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              fill="none"
              opacity="0.35"
            />
          </svg>
        </div>

        <div className="px-7 pb-7">
          {/* Naslov */}
          <h2
            className="mb-1 text-center text-xl font-bold"
            style={{ color: 'var(--first-octonary)' }}
          >
            Zahtjev uspješno poslan!
          </h2>
          <p
            className="mb-5 text-center text-sm"
            style={{ color: 'var(--first-nonary)' }}
          >
            Vaš zahtjev je primljen i čeka pregled dispečera.
          </p>

          {/* Žuta faza - objašnjenje */}
          <div
            className="mb-5 rounded-2xl border p-4"
            style={{
              borderColor:     'rgba(217,119,6,0.3)',
              backgroundColor: 'rgba(217,119,6,0.06)',
            }}
          >
            <p
              className="mb-3 text-xs font-bold uppercase tracking-wide"
              style={{ color: '#D97706' }}
            >
              Životni ciklus zahtjeva
            </p>

            <div className="flex flex-col gap-3">
              <LifecycleStep
                Ikona={Clock}
                oznaka="Na čekanju"
                opis="Dispečer pregleda zahtjev i određuje prioritet"
                boja="#D97706"
                aktivan
              />
              <LifecycleStep
                Ikona={CalendarCheck}
                oznaka="Potvrđeno"
                opis="Termin i serviser su dodjeljeni"
                boja="#2563EB"
                aktivan={false}
              />
              <LifecycleStep
                Ikona={Truck}
                oznaka="U izvršenju"
                opis="Serviser je na putu ili na terenu"
                boja="#22C55E"
                aktivan={false}
              />
              <LifecycleStep
                Ikona={CheckCircle}
                oznaka="Završeno"
                opis="Intervencija je uspješno okončana"
                boja="#6B7280"
                aktivan={false}
              />
            </div>
          </div>

          {/* Akcije */}
          <div className="flex flex-col gap-2.5">
            <Link href="/korisnik" className="block">
              <Button size="lg" className="w-full">
                Idi na Dashboard
              </Button>
            </Link>
            <Link href="/korisnik/zahtjevi" className="block">
              <Button variant="secondary" size="md" className="w-full">
                Prati status zahtjeva
              </Button>
            </Link>
            {onZatvori && (
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={onZatvori}
                className="w-full"
              >
                Pošalji novi zahtjev
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* CSS animacija aviončića */}
      <style>{`
        @keyframes flight {
          0%   { transform: translate(0, 0) rotate(0deg) scale(0.8); opacity: 0; }
          20%  { opacity: 1; }
          60%  { transform: translate(30px, -20px) rotate(-15deg) scale(1.1); }
          100% { transform: translate(80px, -55px) rotate(-25deg) scale(0.7); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
