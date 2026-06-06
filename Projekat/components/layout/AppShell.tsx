'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, ShieldCheck, Wrench, Headphones,
  LayoutDashboard, ClipboardList, PlusCircle,
  Users, LogOut, Menu, X, ChevronRight,
  UserCircle, ArrowLeftRight, ChevronDown, BarChart2, History,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { UserRole } from '@/domain/types';
import { odjaviSe } from '@/services/auth/authService';
import { NotifikacijeBell } from '@/components/layout/NotifikacijeBell';

// ─── Triple Coding po ulozi ───────────────────────────────────────────────────

const ROLE_IDENTITET: Record<
  UserRole,
  { boja: string; pozadina: string; oznaka: string; LogoIkona: LucideIcon }
> = {
  // Plava (#2D5B9F) - konzistentna s KPI "Aktivnih zahtjeva"
  korisnik: {
    boja:      'var(--first-secondary)',
    pozadina:  'rgb(var(--first-secondary-rgb) / 0.12)',
    oznaka:    'Korisnički nalog',
    LogoIkona: Home,
  },
  // Indigo - autoritetna, tamna boja za administraciju
  admin: {
    boja:      '#4F46E5',
    pozadina:  'rgba(79,70,229,0.12)',
    oznaka:    'Admin Panel',
    LogoIkona: ShieldCheck,
  },
  // Narandžasta (#D98400) - konzistentna s KPI "Hitnih slučajeva"
  serviser: {
    boja:      'var(--first-senary)',
    pozadina:  'rgb(var(--first-senary-rgb) / 0.12)',
    oznaka:    'Servisni nalog',
    LogoIkona: Wrench,
  },
  // Zlatna (#F2C94C) - dispečer = koordinator, akcentna boja
  dispecer: {
    boja:      'var(--first-septenary)',
    pozadina:  'rgb(var(--first-septenary-rgb) / 0.15)',
    oznaka:    'Dispečerski panel',
    LogoIkona: Headphones,
  },
};

// ─── Navigacija po ulozi ──────────────────────────────────────────────────────

interface StavkaNavigacije {
  href:   string;
  oznaka: string;
  Ikona:  LucideIcon;
}

const NAVIGACIJA_PO_ULOZI: Record<UserRole, StavkaNavigacije[]> = {
  korisnik: [
    { href: '/korisnik',               oznaka: 'Pregled',       Ikona: LayoutDashboard },
    { href: '/korisnik/zahtjevi',      oznaka: 'Moji zahtjevi', Ikona: ClipboardList },
    { href: '/korisnik/historija',     oznaka: 'Historija',      Ikona: History },
    { href: '/korisnik/premium',       oznaka: 'Premium usluga', Ikona: ShieldCheck },
    { href: '/korisnik/zahtjevi/novi', oznaka: 'Kreiraj zahtjev',  Ikona: PlusCircle },
  ],
  serviser: [
    { href: '/serviser',               oznaka: 'Pregled',        Ikona: LayoutDashboard },
    { href: '/serviser/intervencije',  oznaka: 'Intervencije',   Ikona: Wrench },
  ],
  dispecer: [
    { href: '/dispecer',                      oznaka: 'Kontrolna ploča',  Ikona: LayoutDashboard },
    { href: '/dispecer/zahtjevi',             oznaka: 'Pregled zahtjeva', Ikona: ClipboardList },
    { href: '/dispecer/intervencije',         oznaka: 'Intervencije',     Ikona: Wrench },
    { href: '/dispecer/izvjestaj/odziva',     oznaka: 'Izvještaj odziva', Ikona: BarChart2 },
  ],
  admin: [
    { href: '/admin',                  oznaka: 'Pregled',       Ikona: LayoutDashboard },
    { href: '/admin/korisnici',        oznaka: 'Korisnici',     Ikona: Users },
    { href: '/admin/serviseri',        oznaka: 'Uposlenici',    Ikona: Wrench },
    { href: '/admin/aplikacije',       oznaka: 'Aplikacije',    Ikona: ClipboardList },
  ],
};

// ─── Nav stavka s longest-prefix aktivnim stanjem ─────────────────────────────

function VezaNavigacije({
  stavka,
  jeAktivna,
  roleColor,
  onKlik,
}: {
  stavka:     StavkaNavigacije;
  jeAktivna:  boolean;
  roleColor:  string;
  onKlik?:    () => void;
}) {
  return (
    <Link
      href={stavka.href}
      onClick={onKlik}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200"
      style={{
        backgroundColor: jeAktivna ? `${roleColor}18` : 'transparent',
        color:           jeAktivna ? roleColor : 'var(--first-nonary)',
        fontWeight:      jeAktivna ? 600 : 400,
      }}
    >
      <stavka.Ikona className="h-4 w-4 flex-shrink-0" />
      {stavka.oznaka}
    </Link>
  );
}

// ─── Korisnik dropdown (desktop) ──────────────────────────────────────────────

function KorisnikDropdown({
  imeKorisnika,
  uloga,
  identitet,
  onOdjava,
  jeOdjavaUToku,
  mozePromijenitiUlogu,
}: {
  imeKorisnika?: string;
  uloga:         UserRole;
  identitet:     typeof ROLE_IDENTITET[UserRole];
  onOdjava:      () => void;
  jeOdjavaUToku: boolean;
  mozePromijenitiUlogu: boolean;
}) {
  const [otvoren, setOtvoren] = useState(false);
  const { LogoIkona, boja, pozadina, oznaka } = identitet;

  return (
    <div className="relative hidden md:block">
      <button
        type="button"
        onClick={() => setOtvoren((v) => !v)}
        className="flex items-center gap-2 rounded-xl px-3 py-1.5 transition-colors hover:bg-soft-beige/30"
      >
        <div
          className="flex h-7 w-7 items-center justify-center rounded-full"
          style={{ backgroundColor: pozadina }}
        >
          <LogoIkona className="h-3.5 w-3.5" style={{ color: boja }} />
        </div>
        <div className="text-left">
          <p className="text-xs font-semibold leading-none" style={{ color: 'var(--first-octonary)' }}>
            {imeKorisnika ?? 'Korisnik'}
          </p>
          <p className="text-xs leading-tight" style={{ color: boja }}>
            {oznaka}
          </p>
        </div>
        <ChevronDown
          className="h-3.5 w-3.5 transition-transform duration-200"
          style={{ color: 'var(--first-nonary)', transform: otvoren ? 'rotate(180deg)' : 'none' }}
        />
      </button>

      {otvoren && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOtvoren(false)} />
          <div
            className="absolute right-0 top-full z-40 mt-1.5 w-52 rounded-2xl py-1.5 shadow-card-lg"
            style={{
              backgroundColor: 'var(--first-tertiary)',
              border:          '1px solid rgb(var(--first-quaternary-rgb) / 0.4)',
            }}
          >
            <Link
              href="/profil"
              onClick={() => setOtvoren(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-soft-beige/30"
              style={{ color: 'var(--first-octonary)' }}
            >
              <UserCircle className="h-4 w-4" style={{ color: 'var(--first-nonary)' }} />
              Profil i postavke
            </Link>
            {mozePromijenitiUlogu && (
              <Link
                href="/odabir-uloge"
                onClick={() => setOtvoren(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-soft-beige/30"
                style={{ color: 'var(--first-octonary)' }}
              >
                <ArrowLeftRight className="h-4 w-4" style={{ color: 'var(--first-nonary)' }} />
                Promijeni ulogu
              </Link>
            )}
            <div className="mx-3 my-1.5 h-px" style={{ backgroundColor: 'rgb(var(--first-quaternary-rgb) / 0.35)' }} />
            <button
              type="button"
              onClick={() => { setOtvoren(false); onOdjava(); }}
              disabled={jeOdjavaUToku}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium
                transition-colors hover:bg-soft-beige/30 disabled:opacity-50"
              style={{ color: '#DC2626' }}
            >
              <LogOut className="h-4 w-4" />
              {jeOdjavaUToku ? 'Odjavljivanje...' : 'Odjava'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Glavna komponenta ────────────────────────────────────────────────────────

interface AppShellProps {
  children:      ReactNode;
  uloga:         UserRole;
  imeKorisnika?: string;
}

export function AppShell({ children, uloga, imeKorisnika }: AppShellProps) {
  const [jeMenuOtvoren, setJeMenuOtvoren] = useState(false);
  const [jeOdjavaUToku, setJeOdjavaUToku] = useState(false);
  const [mozePromijenitiUlogu, setMozePromijenitiUlogu] = useState(false);
  const router           = useRouter();
  const putanja          = usePathname();
  const stavke           = NAVIGACIJA_PO_ULOZI[uloga] ?? [];
  const identitet        = ROLE_IDENTITET[uloga];
  const { boja, pozadina, oznaka, LogoIkona } = identitet;

  // Longest-prefix active matching
  const aktivnaHref = stavke
    .filter((s) => putanja === s.href || putanja.startsWith(s.href + '/'))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href ?? null;

  async function odjaviKorisnika() {
    setJeOdjavaUToku(true);
    try { await odjaviSe(); router.replace('/auth/login'); }
    finally { setJeOdjavaUToku(false); }
  }

  useEffect(() => {
    let aktivan = true;
    async function ucitajUloge() {
      try {
        const odgovor = await fetch('/api/profil', { cache: 'no-store' });
        const podaci = await odgovor.json();
        const ulogeKorisnika = Array.isArray(podaci?.profil?.uloge) ? podaci.profil.uloge : [];
        if (aktivan) setMozePromijenitiUlogu(ulogeKorisnika.length > 1);
      } catch {
        if (aktivan) setMozePromijenitiUlogu(false);
      }
    }
    ucitajUloge();
    return () => { aktivan = false; };
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--first-tertiary)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 flex h-14 items-center justify-between px-4 md:px-6"
        style={{
          backgroundColor: 'rgb(var(--first-tertiary-rgb) / 0.92)',
          backdropFilter:  'blur(12px)',
          borderBottom:    `1px solid ${boja}25`,
        }}
      >
        {/* Brand - logo ikon se mijenja po ulozi */}
        <Link href={`/${uloga}`} className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ backgroundColor: boja }}
          >
            <LogoIkona className="h-4 w-4 text-white" />
          </div>
          <div className="hidden sm:flex sm:flex-col sm:leading-none">
            <span className="text-sm font-bold tracking-tight" style={{ color: 'var(--first-octonary)' }}>
              InterServ
            </span>
            <span className="text-xs" style={{ color: boja }}>
              {oznaka}
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {stavke.map((stavka) => (
            <VezaNavigacije
              key={stavka.href}
              stavka={stavka}
              jeAktivna={stavka.href === aktivnaHref}
              roleColor={boja}
            />
          ))}
        </nav>

        {/* Desno */}
        <div className="flex items-center gap-1">
          <NotifikacijeBell boja={boja} uloga={uloga} />

          <KorisnikDropdown
            imeKorisnika={imeKorisnika}
            uloga={uloga}
            identitet={identitet}
            onOdjava={odjaviKorisnika}
            jeOdjavaUToku={jeOdjavaUToku}
            mozePromijenitiUlogu={mozePromijenitiUlogu}
          />

          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-soft-beige/30 md:hidden"
            style={{ color: 'var(--first-octonary)' }}
            onClick={() => setJeMenuOtvoren(true)}
            aria-label="Otvori meni"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobilni drawer */}
      {jeMenuOtvoren && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setJeMenuOtvoren(false)}
          />
          <div
            className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col p-5 md:hidden"
            style={{ backgroundColor: 'var(--first-tertiary)', borderRight: `2px solid ${boja}30` }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: boja }}>
                  <LogoIkona className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--first-octonary)' }}>InterServ</p>
                  <p className="text-xs" style={{ color: boja }}>{oznaka}</p>
                </div>
              </div>
              <button onClick={() => setJeMenuOtvoren(false)} className="rounded-lg p-1.5 hover:bg-soft-beige/30" style={{ color: 'var(--first-nonary)' }}>
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Kartica korisnika */}
            <div className="mb-4 flex items-center gap-3 rounded-xl px-4 py-3" style={{ backgroundColor: pozadina }}>
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${boja}20` }}>
                <LogoIkona className="h-4 w-4" style={{ color: boja }} />
              </div>
              <div>
                <p className="font-semibold" style={{ color: 'var(--first-octonary)' }}>{imeKorisnika ?? 'Korisnik'}</p>
                <p className="text-xs" style={{ color: boja }}>{oznaka}</p>
              </div>
            </div>

            <nav className="flex flex-col gap-1">
              {stavke.map((stavka) => (
                <VezaNavigacije
                  key={stavka.href}
                  stavka={stavka}
                  jeAktivna={stavka.href === aktivnaHref}
                  roleColor={boja}
                  onKlik={() => setJeMenuOtvoren(false)}
                />
              ))}
            </nav>

            <div className="mt-auto border-t pt-4" style={{ borderColor: `${boja}25` }}>
              <Link href="/profil" onClick={() => setJeMenuOtvoren(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-soft-beige/30"
                style={{ color: 'var(--first-nonary)' }}>
                <UserCircle className="h-4 w-4" />
                Profil i postavke
              </Link>
              {mozePromijenitiUlogu && (
                <Link href="/odabir-uloge" onClick={() => setJeMenuOtvoren(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-soft-beige/30"
                  style={{ color: 'var(--first-nonary)' }}>
                  <ArrowLeftRight className="h-4 w-4" />
                  Promijeni ulogu
                </Link>
              )}
              <button
                type="button"
                onClick={odjaviKorisnika}
                disabled={jeOdjavaUToku}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium
                  transition-colors disabled:cursor-not-allowed disabled:opacity-60 hover:bg-soft-beige/30"
                style={{ color: '#DC2626' }}
              >
                <span className="flex items-center gap-3">
                  <LogOut className="h-4 w-4" />
                  {jeOdjavaUToku ? 'Odjavljivanje...' : 'Odjava'}
                </span>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Sadržaj */}
      <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
