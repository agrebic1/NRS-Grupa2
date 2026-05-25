'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Mail, RefreshCw, ShieldCheck, UserCheck,
  Wrench, Pencil, Headphones, Shield, Users,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { type StatusKorisnika, BADGE_STATUSA } from '@/lib/admin/statusKorisnika';

// ─── Tip ─────────────────────────────────────────────────────────────────────

interface KorisnikSistema {
  id: string;
  imeIPrezime: string;
  email: string;
  uloga: string;
  status: StatusKorisnika;
  datumRegistracije: string;
  tip: 'korisnik' | 'uposlenik';
}

type FilterUloge = 'svi' | 'serviser' | 'dispecer' | 'administrator';

const FILTER_LABELE: Record<FilterUloge, string> = {
  svi:           'Svi uposlenici',
  serviser:      'Serviseri',
  dispecer:      'Dispečeri',
  administrator: 'Administratori',
};

// ─── Stranica ─────────────────────────────────────────────────────────────────

export default function AdminServiseriPage() {
  const [korisnici, setKorisnici] = useState<KorisnikSistema[]>([]);
  const [greska,    setGreska]    = useState<string | null>(null);
  const [ucitava,   setUcitava]   = useState(true);
  const [filter,    setFilter]    = useState<FilterUloge>('svi');

  async function ucitajKorisnike() {
    setUcitava(true);
    setGreska(null);
    try {
      const odgovor = await fetch('/api/admin/users', { cache: 'no-store' });
      const podaci  = await odgovor.json();
      if (!odgovor.ok) throw new Error(podaci.error ?? 'Nije moguće učitati uposlenike.');
      setKorisnici(podaci.users ?? []);
    } catch (error) {
      setGreska(error instanceof Error ? error.message : 'Nije moguće učitati uposlenike.');
    } finally {
      setUcitava(false);
    }
  }

  useEffect(() => { ucitajKorisnike(); }, []);

  // Svi interni uposlenici (tip === 'uposlenik')
  const uposlenici = useMemo(
    () => korisnici.filter((k) => k.tip === 'uposlenik'),
    [korisnici],
  );

  const filtrirani = useMemo(() => {
    if (filter === 'svi') return uposlenici;
    return uposlenici.filter((k) => {
      const u = k.uloga.toLowerCase();
      if (filter === 'serviser')      return u.includes('serviser');
      if (filter === 'dispecer')      return u.includes('dispe');
      if (filter === 'administrator') return u.includes('admin');
      return true;
    });
  }, [uposlenici, filter]);

  // KPI
  const brServisera     = useMemo(() => uposlenici.filter((k) => k.uloga.toLowerCase().includes('serviser')).length,      [uposlenici]);
  const brDispecera     = useMemo(() => uposlenici.filter((k) => k.uloga.toLowerCase().includes('dispe')).length,          [uposlenici]);
  const brAktivnih      = useMemo(() => uposlenici.filter((k) => k.status === 'aktivan').length,                           [uposlenici]);

  const filteri: FilterUloge[] = ['svi', 'serviser', 'dispecer', 'administrator'];

  return (
    <AppShell uloga="admin" imeKorisnika="Administrator">

      {/* Naslov */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--first-octonary)' }}>
            Uposlenici
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--first-nonary)' }}>
            Pregled internih uposlenika — serviseri, dispečeri i administratori.
          </p>
        </div>
        <Button
          type="button" variant="secondary" size="md"
          onClick={ucitajKorisnike} isLoading={ucitava} loadingText="Učitavanje..."
        >
          <RefreshCw className="h-4 w-4" />
          Osvježi
        </Button>
      </div>

      {/* KPI kartice */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { oznaka: 'Ukupno uposlenika', vrijednost: uposlenici.length,  boja: 'var(--first-primary)',   Ikona: Users        },
          { oznaka: 'Aktivni',           vrijednost: brAktivnih,          boja: 'var(--first-secondary)', Ikona: UserCheck    },
          { oznaka: 'Serviseri',         vrijednost: brServisera,         boja: 'var(--first-senary)',    Ikona: Wrench       },
          { oznaka: 'Dispečeri',         vrijednost: brDispecera,         boja: 'var(--first-septenary)', Ikona: Headphones   },
        ].map(({ oznaka, vrijednost, boja, Ikona }) => (
          <div
            key={oznaka}
            className="flex items-center gap-3 rounded-2xl p-5 shadow-card"
            style={{
              backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.22)',
              border: '1px solid rgb(var(--first-quaternary-rgb) / 0.35)',
            }}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: `color-mix(in srgb, ${boja} 10%, transparent)` }}
            >
              <Ikona className="h-5 w-5" style={{ color: boja }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: boja }}>{vrijednost}</p>
              <p className="text-xs"            style={{ color: 'var(--first-nonary)' }}>{oznaka}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabovi */}
      <div
        className="mb-6 flex flex-wrap gap-2 rounded-2xl p-2"
        style={{
          backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.15)',
          border: '1px solid rgb(var(--first-quaternary-rgb) / 0.25)',
        }}
      >
        {filteri.map((f) => {
          const jeAktivan = filter === f;
          const count = f === 'svi'
            ? uposlenici.length
            : uposlenici.filter((k) => {
                const u = k.uloga.toLowerCase();
                if (f === 'serviser')      return u.includes('serviser');
                if (f === 'dispecer')      return u.includes('dispe');
                if (f === 'administrator') return u.includes('admin');
                return false;
              }).length;

          const IkonaFnc = f === 'serviser'      ? Wrench
                         : f === 'dispecer'      ? Headphones
                         : f === 'administrator' ? Shield
                         : Users;

          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all"
              style={{
                backgroundColor: jeAktivan ? 'var(--first-primary)' : 'transparent',
                color:           jeAktivan ? '#fff'                  : 'var(--first-nonary)',
              }}
            >
              <IkonaFnc className="h-3.5 w-3.5" />
              {FILTER_LABELE[f]}
              <span
                className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                style={{
                  backgroundColor: jeAktivan ? 'rgba(255,255,255,0.25)' : 'rgb(var(--first-quaternary-rgb)/0.35)',
                  color:           jeAktivan ? '#fff' : 'var(--first-nonary)',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Greška */}
      {greska && (
        <div
          className="mb-6 rounded-xl border px-4 py-3 text-sm"
          style={{
            borderColor:     'rgb(var(--first-senary-rgb) / 0.25)',
            backgroundColor: 'rgb(var(--first-senary-rgb) / 0.08)',
            color:           'var(--first-senary)',
          }}
        >
          {greska}
        </div>
      )}

      {/* Grid kartica */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {!ucitava && filtrirani.map((uposlenik) => {
          const badge    = BADGE_STATUSA[uposlenik.status];
          const ulogaLow = uposlenik.uloga.toLowerCase();
          const ulogaBoja = ulogaLow.includes('admin')    ? '#DC2626'
                          : ulogaLow.includes('dispe')    ? '#7C3AED'
                          : ulogaLow.includes('serviser') ? 'var(--first-senary)'
                          : 'var(--first-nonary)';
          const UlogaIkona = ulogaLow.includes('admin')    ? Shield
                           : ulogaLow.includes('dispe')    ? Headphones
                           : ulogaLow.includes('serviser') ? Wrench
                           : ShieldCheck;

          return (
            <article
              key={uposlenik.id}
              className="rounded-2xl p-5 shadow-card"
              style={{
                backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.22)',
                border: '1px solid rgb(var(--first-quaternary-rgb) / 0.35)',
              }}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold" style={{ color: 'var(--first-octonary)' }}>
                    {uposlenik.imeIPrezime}
                  </h2>
                  <p className="mt-1 flex items-center gap-1.5 truncate text-sm" style={{ color: 'var(--first-nonary)' }}>
                    <Mail className="h-4 w-4" />
                    {uposlenik.email}
                  </p>
                </div>
                <span
                  className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{ backgroundColor: badge.pozadina, color: badge.boja }}
                >
                  {badge.oznaka}
                </span>
              </div>

              <dl className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt style={{ color: 'var(--first-nonary)' }}>Uloga</dt>
                  <dd className="flex items-center gap-1.5 text-right font-semibold" style={{ color: ulogaBoja }}>
                    <UlogaIkona className="h-3.5 w-3.5" />
                    {uposlenik.uloga}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt style={{ color: 'var(--first-nonary)' }}>Registrovan</dt>
                  <dd className="text-right font-medium" style={{ color: 'var(--first-octonary)' }}>
                    {uposlenik.datumRegistracije}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 border-t pt-3" style={{ borderColor: 'rgb(var(--first-quaternary-rgb)/0.25)' }}>
                <Link
                  href={`/admin/korisnici/${uposlenik.id}/uredi`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all hover:opacity-80"
                  style={{
                    backgroundColor: 'rgb(var(--first-secondary-rgb)/0.08)',
                    color: 'var(--first-secondary)',
                    border: '1px solid rgb(var(--first-secondary-rgb)/0.2)',
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Uredi
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      {ucitava && (
        <p className="py-8 text-center text-sm" style={{ color: 'var(--first-nonary)' }}>
          Učitavanje uposlenika...
        </p>
      )}
      {!ucitava && filtrirani.length === 0 && !greska && (
        <p className="py-8 text-center text-sm" style={{ color: 'var(--first-nonary)' }}>
          Nema uposlenika za odabrani filter.
        </p>
      )}
    </AppShell>
  );
}
