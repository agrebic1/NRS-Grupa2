'use client';

import type { CSSProperties, ComponentType } from 'react';
import {
  Droplets,
  Zap,
  Flame,
  Wind,
  Key,
  Hammer,
  Refrigerator,
  Monitor,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { KATEGORIJE_KVARA } from '@/lib/servisirane/kategorije';

const IKONE_GLAVNIH: Record<
  string,
  {
    Ikona: ComponentType<{ className?: string; style?: CSSProperties }>;
    boja: string;
  }
> = {
  vodovod_kanalizacija: { Ikona: Droplets, boja: 'var(--first-secondary)' },
  elektro_rasvjeta: { Ikona: Zap, boja: 'var(--first-septenary)' },
  grijanje_topla_voda: { Ikona: Flame, boja: 'var(--first-senary)' },
  klima_ventilacija: { Ikona: Wind, boja: 'var(--first-primary)' },
  bravarija_stolarija: { Ikona: Key, boja: 'var(--first-octonary)' },
  gradjevinski_zavrsni: { Ikona: Hammer, boja: 'var(--first-secondary)' },
  kucanski_uredjaji: { Ikona: Refrigerator, boja: 'var(--first-primary)' },
  it_mreze_smart: { Ikona: Monitor, boja: 'var(--first-septenary)' },
  ostalo: { Ikona: Plus, boja: 'var(--first-nonary)' },
};

// ─── Korak 1: Kategorija ──────────────────────────────────────────────────────

export interface KorakKategorijaProps {
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  onUpdate: (p: {
    selectedCategory?: string | null;
    selectedSubcategory?: string | null;
  }) => void;
}

export function KorakKategorija({
  selectedCategory,
  selectedSubcategory,
  onUpdate,
}: KorakKategorijaProps) {
  function odaberiGlavnu(id: string) {
    onUpdate({
      selectedCategory: id,
      selectedSubcategory: null,
    });
  }

  function handleSubkategorijaOdabir(id: string) {
    onUpdate({ selectedSubcategory: id });
  }

  const aktivnaGlavna = KATEGORIJE_KVARA.find((k) => k.id === selectedCategory);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2
          className="mb-1 text-xl font-bold"
          style={{ color: 'var(--first-octonary)' }}
        >
          Vrsta zahtjeva
        </h2>
        <p className="text-sm" style={{ color: 'var(--first-nonary)' }}>
          Prvo odaberite glavnu kategoriju, zatim podkategoriju koja najbolje
          opisuje zahtjev.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {KATEGORIJE_KVARA.map(({ id, label }) => {
          const cfg = IKONE_GLAVNIH[id] ?? IKONE_GLAVNIH.ostalo;
          const odabrana = selectedCategory === id;
          const Ikona = cfg.Ikona;
          return (
            <button
              key={id}
              type="button"
              onClick={() => odaberiGlavnu(id)}
              className="flex flex-col items-center gap-2.5 rounded-2xl border p-5 text-center
                transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-celestial-teal/40"
              style={{
                borderColor: odabrana
                  ? cfg.boja
                  : 'rgb(var(--first-quaternary-rgb) / 0.4)',
                backgroundColor: odabrana
                  ? `color-mix(in srgb, ${cfg.boja} 8%, rgb(255 255 255 / 0.5))`
                  : 'rgb(255 255 255 / 0.45)',
                boxShadow: odabrana ? `0 0 0 2px ${cfg.boja}33` : 'none',
              }}
              aria-pressed={odabrana}
            >
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl transition-colors duration-200"
                style={{
                  backgroundColor: odabrana
                    ? `color-mix(in srgb, ${cfg.boja} 18%, transparent)`
                    : 'rgb(var(--first-quinary-rgb) / 0.4)',
                }}
              >
                <Ikona
                  className="h-7 w-7"
                  style={{ color: odabrana ? cfg.boja : 'var(--first-nonary)' }}
                />
              </div>
              <span
                className="text-sm font-semibold leading-tight"
                style={{ color: 'var(--first-octonary)' }}
              >
                {label}
              </span>
              {odabrana && (
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: cfg.boja }}
                />
              )}
            </button>
          );
        })}
      </div>

      {aktivnaGlavna && (
        <div>
          <p className="mb-3 text-sm" style={{ color: 'var(--first-nonary)' }}>
            Podkategorije za:{' '}
            <span style={{ color: 'var(--first-octonary)' }}>
              {aktivnaGlavna.label}
            </span>
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {aktivnaGlavna.podkategorije.map((pod) => {
              const odabrana = selectedSubcategory === pod.id;
              return (
                <Button
                  key={pod.id}
                  type="button"
                  variant={odabrana ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleSubkategorijaOdabir(pod.id)}
                  className="justify-center py-3 text-center"
                >
                  {pod.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
