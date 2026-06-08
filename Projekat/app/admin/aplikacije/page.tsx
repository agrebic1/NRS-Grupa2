'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  Copy,
  Eye,
  EyeOff,
  FileText,
  ExternalLink,
  Wrench,
  Headphones,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { AlertMessage } from '@/components/ui/AlertMessage';
import type {
  PartnerAplikacija,
  StatusAplikacije,
} from '@/domain/types/servisirane';
import { formatirajDatumPrikaz } from '@/lib/format/datumi';

// ─── Status badge konfiguracija ───────────────────────────────────────────────

const STATUS_BADGE: Record<
  StatusAplikacije,
  {
    oznaka: string;
    pozadina: string;
    boja: string;
    Ikona: React.ComponentType<{
      className?: string;
      style?: React.CSSProperties;
    }>;
  }
> = {
  na_cekanju: {
    oznaka: 'Na čekanju',
    pozadina: 'rgb(var(--first-septenary-rgb) / 0.18)',
    boja: 'var(--first-senary)',
    Ikona: Clock,
  },
  odobreno: {
    oznaka: 'Odobreno',
    pozadina: 'rgb(var(--first-secondary-rgb) / 0.12)',
    boja: 'var(--first-secondary)',
    Ikona: CheckCircle,
  },
  odbijeno: {
    oznaka: 'Odbijeno',
    pozadina: 'rgb(var(--first-senary-rgb) / 0.1)',
    boja: 'var(--first-senary)',
    Ikona: XCircle,
  },
};

// Triple Coding za uloge partnera
const ULOGA_BADGE: Record<
  string,
  {
    oznaka: string;
    boja: string;
    pozadina: string;
    Ikona: React.ComponentType<{
      className?: string;
      style?: React.CSSProperties;
    }>;
  }
> = {
  serviser: {
    oznaka: 'Serviser',
    boja: 'var(--first-senary)',
    pozadina: 'rgb(var(--first-senary-rgb) / 0.12)',
    Ikona: Wrench,
  },
  dispecer: {
    oznaka: 'Dispečer',
    boja: 'var(--first-septenary)',
    pozadina: 'rgb(var(--first-septenary-rgb) / 0.15)',
    Ikona: Headphones,
  },
};

// ─── Rezultat odobravanja ─────────────────────────────────────────────────────

interface OdobravanjeRezultat {
  privremena_lozinka: string;
  email: string;
}

// ─── Red tabele ───────────────────────────────────────────────────────────────

function AplikacijaRed({
  aplikacija,
  onOdobri,
  odobravanje,
  jeUToku,
}: {
  aplikacija: PartnerAplikacija;
  onOdobri: (id: number) => void;
  odobravanje: OdobravanjeRezultat | undefined;
  jeUToku: boolean;
}) {
  const badge = STATUS_BADGE[aplikacija.status];
  const BadgeIkona = badge.Ikona;
  const datum = formatirajDatumPrikaz(aplikacija.created_at);
  const [pokaziLozinku, setPokaziLozinku] = useState(false);

  return (
    <tr className="transition-colors hover:bg-soft-beige/10">
      <td className="px-5 py-4" style={{ color: 'var(--first-octonary)' }}>
        <p className="font-medium">
          {aplikacija.first_name} {aplikacija.last_name}
        </p>
        <p className="text-xs" style={{ color: 'var(--first-nonary)' }}>
          {aplikacija.email}
        </p>
        <p className="text-xs" style={{ color: 'var(--first-nonary)' }}>
          {aplikacija.phone}
        </p>
      </td>
      <td className="px-5 py-4">
        {(() => {
          const u =
            ULOGA_BADGE[aplikacija.service_type] ?? ULOGA_BADGE.serviser;
          return (
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{ backgroundColor: u.pozadina, color: u.boja }}
            >
              <u.Ikona className="h-3 w-3" />
              {u.oznaka}
            </span>
          );
        })()}
      </td>
      <td
        className="hidden px-5 py-4 text-sm md:table-cell"
        style={{ color: 'var(--first-nonary)' }}
      >
        <p className="line-clamp-2 max-w-xs">{aplikacija.experience}</p>
        {(aplikacija as PartnerAplikacija & { document_url?: string })
          .document_url && (
          <a
            href={
              (aplikacija as PartnerAplikacija & { document_url?: string })
                .document_url!
            }
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-xs transition-opacity hover:opacity-70"
            style={{ color: 'var(--first-secondary)' }}
          >
            <FileText className="h-3 w-3" />
            Dokument
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </td>
      <td className="px-5 py-4">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
          style={{ backgroundColor: badge.pozadina, color: badge.boja }}
        >
          <BadgeIkona className="h-3 w-3" />
          {badge.oznaka}
        </span>
      </td>
      <td
        className="px-5 py-4 text-xs"
        style={{ color: 'var(--first-nonary)' }}
      >
        {datum}
      </td>
      <td className="px-5 py-4">
        {aplikacija.status === 'na_cekanju' && !odobravanje && (
          <Button
            size="sm"
            onClick={() => onOdobri(aplikacija.id)}
            isLoading={jeUToku}
            loadingText="Kreiranje..."
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Odobri
          </Button>
        )}

        {odobravanje && (
          <div
            className="rounded-xl border p-3 text-xs"
            style={{
              borderColor: 'rgb(var(--first-secondary-rgb) / 0.3)',
              backgroundColor: 'rgb(var(--first-secondary-rgb) / 0.06)',
            }}
          >
            <p
              className="mb-1 font-semibold"
              style={{ color: 'var(--first-secondary)' }}
            >
              Nalog kreiran!
            </p>
            <p style={{ color: 'var(--first-nonary)' }}>
              Email: {odobravanje.email}
            </p>
            <div className="mt-1 flex items-center gap-1.5">
              <span style={{ color: 'var(--first-nonary)' }}>
                Lozinka:{' '}
                {pokaziLozinku ? odobravanje.privremena_lozinka : '••••••••'}
              </span>
              <button
                type="button"
                onClick={() => setPokaziLozinku((v) => !v)}
                className="transition-opacity hover:opacity-70"
                style={{ color: 'var(--first-secondary)' }}
              >
                {pokaziLozinku ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
              <button
                type="button"
                onClick={() =>
                  navigator.clipboard.writeText(odobravanje.privremena_lozinka)
                }
                className="transition-opacity hover:opacity-70"
                style={{ color: 'var(--first-secondary)' }}
                title="Kopiraj lozinku"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
            <p
              className="mt-1 text-xs opacity-70"
              style={{ color: 'var(--first-senary)' }}
            >
              Podaci su automatski poslani korisniku odmah nakon odobravanja.
            </p>
          </div>
        )}
      </td>
    </tr>
  );
}

// ─── Stranica ─────────────────────────────────────────────────────────────────

export default function AdminAplikacijePage() {
  const [aplikacije, setAplikacije] = useState<PartnerAplikacija[]>([]);
  const [ucitava, setUcitava] = useState(true);
  const [greska, setGreska] = useState<string | null>(null);
  const [odobravanja, setOdobravanja] = useState<
    Record<number, OdobravanjeRezultat>
  >({});
  const [uTokuSet, setUTokuSet] = useState<Set<number>>(new Set());

  async function ucitajAplikacije() {
    setUcitava(true);
    setGreska(null);
    try {
      const odgovor = await fetch('/api/partner-applications', {
        cache: 'no-store',
      });
      const podaci = await odgovor.json();
      if (!odgovor.ok)
        throw new Error(podaci.error ?? 'Greška pri učitavanju.');
      setAplikacije(podaci.aplikacije ?? []);
    } catch (err) {
      setGreska(
        err instanceof Error
          ? err.message
          : 'Greška pri učitavanju aplikacija.',
      );
    } finally {
      setUcitava(false);
    }
  }

  async function odobriAplikaciju(id: number) {
    setUTokuSet((prev) => new Set([...prev, id]));
    setGreska(null);
    try {
      const odgovor = await fetch(`/api/partner-applications/${id}/approve`, {
        method: 'POST',
      });
      const podaci = await odgovor.json();
      if (!odgovor.ok)
        throw new Error(podaci.error ?? 'Greška pri odobravanju.');

      setOdobravanja((prev) => ({
        ...prev,
        [id]: {
          privremena_lozinka: podaci.privremena_lozinka as string,
          email: podaci.email as string,
        },
      }));
      setAplikacije((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: 'odobreno' as const } : a,
        ),
      );
    } catch (err) {
      setGreska(err instanceof Error ? err.message : 'Greška pri odobravanju.');
    } finally {
      setUTokuSet((prev) => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
    }
  }

  useEffect(() => {
    ucitajAplikacije();
  }, []);

  const pending = aplikacije.filter((a) => a.status === 'na_cekanju').length;
  const approved = aplikacije.filter((a) => a.status === 'odobreno').length;

  return (
    <AppShell uloga="admin" imeKorisnika="Administrator">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: 'var(--first-octonary)' }}
          >
            Partner aplikacije
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--first-nonary)' }}>
            Pregled i odobravanje zahtjeva za partnerstvo.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={ucitajAplikacije}
          isLoading={ucitava}
          loadingText="Učitavanje..."
        >
          <RefreshCw className="h-4 w-4" />
          Osvježi
        </Button>
      </div>

      {/* KPI kartice */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          {
            oznaka: 'Ukupno',
            vrijednost: aplikacije.length,
            boja: 'var(--first-primary)',
            Ikona: Users,
          },
          {
            oznaka: 'Na čekanju',
            vrijednost: pending,
            boja: 'var(--first-senary)',
            Ikona: Clock,
          },
          {
            oznaka: 'Odobreno',
            vrijednost: approved,
            boja: 'var(--first-secondary)',
            Ikona: CheckCircle,
          },
        ].map(({ oznaka, vrijednost, boja, Ikona }) => (
          <div
            key={oznaka}
            className="flex items-center gap-4 rounded-2xl p-5 shadow-card"
            style={{
              backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.22)',
              border: '1px solid rgb(var(--first-quaternary-rgb) / 0.35)',
            }}
          >
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
              style={{
                backgroundColor: `color-mix(in srgb, ${boja} 12%, transparent)`,
              }}
            >
              <Ikona className="h-5 w-5" style={{ color: boja }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: boja }}>
                {vrijednost}
              </p>
              <p className="text-xs" style={{ color: 'var(--first-nonary)' }}>
                {oznaka}
              </p>
            </div>
          </div>
        ))}
      </div>

      {greska && (
        <div className="mb-6">
          <AlertMessage variant="error" message={greska} />
        </div>
      )}

      {/* Tabela */}
      <div
        className="overflow-hidden rounded-2xl shadow-card"
        style={{
          backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.22)',
          border: '1px solid rgb(var(--first-quaternary-rgb) / 0.35)',
        }}
      >
        <div
          className="px-5 py-4"
          style={{
            borderBottom: '1px solid rgb(var(--first-quaternary-rgb) / 0.3)',
          }}
        >
          <h2
            className="font-semibold"
            style={{ color: 'var(--first-octonary)' }}
          >
            Pristigle aplikacije
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{
                  borderBottom:
                    '1px solid rgb(var(--first-quaternary-rgb) / 0.25)',
                }}
              >
                {[
                  'Podnosilac',
                  'Tip usluge',
                  'Iskustvo',
                  'Status',
                  'Datum',
                  'Akcija',
                ].map((z) => (
                  <th
                    key={z}
                    className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--first-nonary)' }}
                  >
                    {z}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody
              className="divide-y"
              style={{ borderColor: 'rgb(var(--first-quaternary-rgb) / 0.2)' }}
            >
              {ucitava && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-8 text-center"
                    style={{ color: 'var(--first-nonary)' }}
                  >
                    Učitavanje aplikacija...
                  </td>
                </tr>
              )}
              {!ucitava && aplikacije.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-8 text-center"
                    style={{ color: 'var(--first-nonary)' }}
                  >
                    Nema pristiglih aplikacija.
                  </td>
                </tr>
              )}
              {!ucitava &&
                aplikacije.map((aplikacija) => (
                  <AplikacijaRed
                    key={aplikacija.id}
                    aplikacija={aplikacija}
                    onOdobri={odobriAplikaciju}
                    odobravanje={odobravanja[aplikacija.id]}
                    jeUToku={uTokuSet.has(aplikacija.id)}
                  />
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
