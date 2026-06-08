'use client';

import { useState, type ReactNode } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface RazlogOperativniModalProps {
  naslov: string;
  ikona?: ReactNode;
  upozorenje: string;
  labelRazloga: string;
  placeholder?: string;
  potvrdiTekst: string;
  variantPotvrdi?: 'primary' | 'danger';
  onZatvori: () => void;
  onPotvrdi: (razlog: string) => Promise<void>;
}

export function RazlogOperativniModal({
  naslov,
  ikona,
  upozorenje,
  labelRazloga,
  placeholder = 'Unesite razlog (min. 10 znakova)...',
  potvrdiTekst,
  variantPotvrdi = 'primary',
  onZatvori,
  onPotvrdi,
}: RazlogOperativniModalProps) {
  const [razlog, setRazlog] = useState('');
  const [jeSlanje, setJeSlanje] = useState(false);
  const [greska, setGreska] = useState<string | null>(null);

  async function potvrdi() {
    if (razlog.trim().length < 10) {
      setGreska('Unesite razlog (min. 10 karaktera).');
      return;
    }
    setJeSlanje(true);
    setGreska(null);
    try {
      await onPotvrdi(razlog.trim());
      onZatvori();
    } catch (e) {
      setGreska(e instanceof Error ? e.message : 'Greška.');
    } finally {
      setJeSlanje(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div
          className="px-6 py-5 border-b"
          style={{ borderColor: 'rgb(var(--first-quaternary-rgb)/0.25)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {ikona ?? (
                <AlertTriangle
                  className="h-4 w-4"
                  style={{ color: '#D97706' }}
                />
              )}
              <p
                className="font-bold"
                style={{ color: 'var(--first-octonary)' }}
              >
                {naslov}
              </p>
            </div>
            <button
              type="button"
              onClick={onZatvori}
              className="flex h-7 w-7 items-center justify-center rounded-lg transition hover:bg-black/[0.06]"
            >
              <X className="h-4 w-4" style={{ color: 'var(--first-nonary)' }} />
            </button>
          </div>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div
            className="flex items-start gap-3 rounded-xl p-3"
            style={{
              backgroundColor: 'rgba(217,119,6,0.06)',
              border: '1px solid rgba(217,119,6,0.2)',
            }}
          >
            <AlertTriangle
              className="h-4 w-4 flex-shrink-0 mt-0.5"
              style={{ color: '#D97706' }}
            />
            <p className="text-sm" style={{ color: 'var(--first-octonary)' }}>
              {upozorenje}
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-semibold"
              style={{ color: 'var(--first-octonary)' }}
            >
              {labelRazloga} *
            </label>
            <textarea
              rows={3}
              value={razlog}
              onChange={(e) => setRazlog(e.target.value)}
              placeholder={placeholder}
              className="w-full resize-none rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
              style={{
                borderColor: 'rgb(var(--first-quaternary-rgb)/0.4)',
                color: 'var(--first-octonary)',
              }}
            />
            {greska && (
              <p className="text-xs" style={{ color: '#DC2626' }}>
                {greska}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={variantPotvrdi}
              size="md"
              onClick={potvrdi}
              isLoading={jeSlanje}
              loadingText="Slanje..."
            >
              {potvrdiTekst}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={onZatvori}
              disabled={jeSlanje}
            >
              Odustani
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
