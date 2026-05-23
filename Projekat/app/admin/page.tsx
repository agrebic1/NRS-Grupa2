'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  UserX,
  ShieldOff,
  ChevronRight,
  PlusCircle,
  RefreshCw,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/servisirane/ZahtjevKartica';
import type { ServisniZahtjev } from '@/domain/types/servisirane';
import { formatirajDatumPrikaz } from '@/lib/format/datumi';
import { BADGE_STATUSA, type StatusKorisnika } from '@/lib/admin/statusKorisnika';

type PremiumLifecycleStatus = 'inactive' | 'pending_payment' | 'active' | 'expired' | 'cancelled';

interface KorisnikSistema {
  id: string;
  imeIPrezime: string;
  email: string;
  uloga: string;
  status: StatusKorisnika;
  datumRegistracije: string;
  tip: 'korisnik' | 'uposlenik';
  isPremium: boolean;
  premium_status?: PremiumLifecycleStatus;
  premium_expires_at?: string | null;
  premium_plan?: string | null;
}

interface ZahtjevSaPodnosiocem extends ServisniZahtjev {
  podnosilac: { ime: string; prezime: string; broj_telefona: string | null } | null;
}

export default function AdminPage() {
  const [korisnici, setKorisnici] = useState<KorisnikSistema[]>([]);
  const [zahtjevi, setZahtjevi] = useState<ZahtjevSaPodnosiocem[]>([]);
  const [greska, setGreska] = useState<string | null>(null);
  const [ucitava, setUcitava] = useState(true);
  const [premiumLoadingId, setPremiumLoadingId] = useState<string | null>(null);

  async function ucitajKorisnike() {
    setUcitava(true);
    setGreska(null);

    try {
      const odgovor = await fetch('/api/admin/users', { cache: 'no-store' });
      const podaci = await odgovor.json();

      if (!odgovor.ok) {
        throw new Error(podaci.error ?? 'Nije moguce ucitati korisnike.');
      }

      setKorisnici(podaci.users ?? []);
    } catch (error) {
      setGreska(error instanceof Error ? error.message : 'Nije moguce ucitati korisnike.');
    } finally {
      setUcitava(false);
    }
  }

  useEffect(() => {
    ucitajKorisnike();
  }, []);

  useEffect(() => {
    fetch('/api/dispecer/zahtjevi', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setZahtjevi(d.zahtjevi ?? []))
      .catch(() => {});
  }, []);

  async function primijeniPremiumLifecycle(korisnikId: string, lifecycle: PremiumLifecycleStatus) {
    setPremiumLoadingId(korisnikId);
    setGreska(null);
    try {
      const actionMap: Record<PremiumLifecycleStatus, string> = {
        active: 'set_active',
        inactive: 'set_inactive',
        pending_payment: 'set_pending_payment',
        cancelled: 'set_cancelled',
        expired: 'set_expired',
      };
      const r = await fetch(`/api/admin/users/${korisnikId}/premium`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionMap[lifecycle] }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Neuspjela izmjena premium statusa.');
      await ucitajKorisnike();
    } catch (error) {
      setGreska(error instanceof Error ? error.message : 'Neuspjela izmjena premium statusa.');
    } finally {
      setPremiumLoadingId(null);
    }
  }

  const kpiKartice = useMemo(
    () => [
      { oznaka: 'Ukupno korisnika', vrijednost: korisnici.length, boja: 'var(--first-primary)', Ikona: Users },
      {
        oznaka: 'Aktivni',
        vrijednost: korisnici.filter((korisnik) => korisnik.status === 'aktivan').length,
        boja: 'var(--first-secondary)',
        Ikona: UserCheck,
      },
      {
        oznaka: 'Neaktivni',
        vrijednost: korisnici.filter((korisnik) => korisnik.status === 'neaktivan').length,
        boja: 'var(--first-septenary)',
        Ikona: UserX,
      },
      {
        oznaka: 'Suspendovani',
        vrijednost: korisnici.filter((korisnik) => korisnik.status === 'suspendovan').length,
        boja: 'var(--first-senary)',
        Ikona: ShieldOff,
      },
    ],
    [korisnici]
  );

  return (
    <AppShell uloga="admin" imeKorisnika="Administrator">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--first-octonary)' }}>
            Pregled sistema
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--first-nonary)' }}>
            Upravljanje korisnicima i podesavanjima sistema.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={ucitajKorisnike}
            isLoading={ucitava}
            loadingText="Ucitavanje..."
          >
            <RefreshCw className="h-4 w-4" />
            Osvjezi
          </Button>
          <Link href="/admin/korisnici/novi">
            <Button size="md" className="w-full sm:w-auto">
              <PlusCircle className="h-4 w-4" />
              Dodaj korisnika
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {kpiKartice.map(({ oznaka, vrijednost, boja, Ikona }) => (
          <div
            key={oznaka}
            className="flex flex-col gap-3 rounded-2xl p-5 shadow-card"
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

      <div
        className="mb-8 rounded-2xl shadow-card"
        style={{
          backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.22)',
          border: '1px solid rgb(var(--first-quaternary-rgb) / 0.35)',
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgb(var(--first-quaternary-rgb) / 0.3)' }}
        >
          <h2 className="font-semibold" style={{ color: 'var(--first-octonary)' }}>
            Servisni zahtjevi ({zahtjevi.length})
          </h2>
          <Link
            href="/dispecer"
            className="flex items-center gap-1 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: 'var(--first-secondary)' }}
          >
            Otvori pregled <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <ul className="divide-y" style={{ borderColor: 'rgb(var(--first-quaternary-rgb) / 0.2)' }}>
          {zahtjevi.slice(0, 5).map((z) => (
            <li key={z.id} className="flex items-center justify-between px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium" style={{ color: 'var(--first-octonary)' }}>
                  {z.category}
                </p>
                <p className="text-xs" style={{ color: 'var(--first-nonary)' }}>
                  {formatirajDatumPrikaz(z.created_at)}
                </p>
              </div>
              <StatusBadge status={z.status} />
            </li>
          ))}
          {zahtjevi.length === 0 && (
            <li className="px-5 py-4 text-sm" style={{ color: 'var(--first-nonary)' }}>
              Nema servisnih zahtjeva.
            </li>
          )}
        </ul>
      </div>

      <div
        className="rounded-2xl shadow-card"
        style={{
          backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.22)',
          border: '1px solid rgb(var(--first-quaternary-rgb) / 0.35)',
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgb(var(--first-quaternary-rgb) / 0.3)' }}
        >
          <h2 className="font-semibold" style={{ color: 'var(--first-octonary)' }}>
            Korisnici sistema
          </h2>
          <Link
            href="/admin/korisnici"
            className="flex items-center gap-1 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: 'var(--first-secondary)' }}
          >
            Svi korisnici <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {greska && (
          <div
            className="mx-5 mt-4 rounded-xl border px-4 py-3 text-sm"
            style={{
              borderColor: 'rgb(var(--first-senary-rgb) / 0.25)',
              backgroundColor: 'rgb(var(--first-senary-rgb) / 0.06)',
              color: 'var(--first-senary)',
            }}
          >
            {greska}
          </div>
        )}

        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgb(var(--first-quaternary-rgb) / 0.25)' }}>
                {['Ime i prezime', 'Email', 'Uloga', 'Status', 'Premium lifecycle', 'Registrovan', ''].map((zaglavlje) => (
                  <th
                    key={zaglavlje}
                    className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--first-nonary)' }}
                  >
                    {zaglavlje}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'rgb(var(--first-quaternary-rgb) / 0.2)' }}>
              {ucitava && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center" style={{ color: 'var(--first-nonary)' }}>
                    Ucitavanje korisnika...
                  </td>
                </tr>
              )}

              {!ucitava && korisnici.length === 0 && !greska && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center" style={{ color: 'var(--first-nonary)' }}>
                    Nema korisnika za prikaz.
                  </td>
                </tr>
              )}

              {!ucitava &&
                korisnici.map((korisnik) => {
                  const badge = BADGE_STATUSA[korisnik.status];

                  return (
                    <tr key={korisnik.id} className="transition-colors hover:bg-soft-beige/10">
                      <td className="px-5 py-3.5 font-medium" style={{ color: 'var(--first-octonary)' }}>
                        {korisnik.imeIPrezime}
                      </td>
                      <td className="px-5 py-3.5" style={{ color: 'var(--first-nonary)' }}>
                        {korisnik.email}
                      </td>
                      <td className="px-5 py-3.5" style={{ color: 'var(--first-nonary)' }}>
                        {korisnik.uloga}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                          style={{ backgroundColor: badge.pozadina, color: badge.boja }}
                        >
                          {badge.oznaka}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {korisnik.tip === 'korisnik' ? (
                          <div className="flex min-w-[10rem] flex-col gap-1">
                            <select
                              className="rounded-lg border px-2 py-1.5 text-xs font-medium"
                              style={{
                                borderColor: 'rgb(var(--first-quaternary-rgb) / 0.45)',
                                color: 'var(--first-octonary)',
                                backgroundColor: 'rgb(255 255 255 / 0.9)',
                              }}
                              value={korisnik.premium_status ?? (korisnik.isPremium ? 'active' : 'inactive')}
                              disabled={premiumLoadingId === korisnik.id}
                              onChange={(e) => {
                                const v = e.target.value as PremiumLifecycleStatus;
                                void primijeniPremiumLifecycle(korisnik.id, v);
                              }}
                            >
                              <option value="inactive">Neaktivan</option>
                              <option value="pending_payment">Čeka uplatu</option>
                              <option value="active">Aktivan</option>
                              <option value="expired">Istekao</option>
                              <option value="cancelled">Otkazan</option>
                            </select>
                            {korisnik.premium_expires_at && korisnik.premium_status === 'active' && (
                              <span className="text-[10px]" style={{ color: 'var(--first-nonary)' }}>
                                Istek: {formatirajDatumPrikaz(korisnik.premium_expires_at)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--first-nonary)' }}>—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5" style={{ color: 'var(--first-nonary)' }}>
                        {korisnik.datumRegistracije}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href={`/admin/korisnici/${korisnik.id}`}
                          className="text-xs font-medium transition-opacity hover:opacity-70"
                          style={{ color: 'var(--first-secondary)' }}
                        >
                          Uredi
                        </Link>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <ul className="divide-y sm:hidden" style={{ borderColor: 'rgb(var(--first-quaternary-rgb) / 0.25)' }}>
          {ucitava && (
            <li className="px-5 py-6 text-center text-sm" style={{ color: 'var(--first-nonary)' }}>
              Ucitavanje korisnika...
            </li>
          )}

          {!ucitava && korisnici.length === 0 && !greska && (
            <li className="px-5 py-6 text-center text-sm" style={{ color: 'var(--first-nonary)' }}>
              Nema korisnika za prikaz.
            </li>
          )}

          {!ucitava &&
            korisnici.map((korisnik) => {
              const badge = BADGE_STATUSA[korisnik.status];

              return (
                <li key={korisnik.id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="font-medium" style={{ color: 'var(--first-octonary)' }}>
                      {korisnik.imeIPrezime}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--first-nonary)' }}>
                      {korisnik.email}
                    </p>
                    {korisnik.tip === 'korisnik' && (
                      <p className="mt-1 text-xs" style={{ color: 'var(--first-nonary)' }}>
                        Premium: {korisnik.premium_status ?? (korisnik.isPremium ? 'active' : 'inactive')}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={{ backgroundColor: badge.pozadina, color: badge.boja }}
                    >
                      {badge.oznaka}
                    </span>
                    {korisnik.tip === 'korisnik' && (
                      <select
                        className="mt-1 w-full max-w-[11rem] rounded-lg border px-2 py-1.5 text-xs font-medium"
                        style={{
                          borderColor: 'rgb(var(--first-quaternary-rgb) / 0.45)',
                          color: 'var(--first-octonary)',
                          backgroundColor: 'rgb(255 255 255 / 0.9)',
                        }}
                        value={korisnik.premium_status ?? (korisnik.isPremium ? 'active' : 'inactive')}
                        disabled={premiumLoadingId === korisnik.id}
                        onChange={(e) => {
                          const v = e.target.value as PremiumLifecycleStatus;
                          void primijeniPremiumLifecycle(korisnik.id, v);
                        }}
                      >
                        <option value="inactive">Neaktivan</option>
                        <option value="pending_payment">Čeka uplatu</option>
                        <option value="active">Aktivan</option>
                        <option value="expired">Istekao</option>
                        <option value="cancelled">Otkazan</option>
                      </select>
                    )}
                  </div>
                </li>
              );
            })}
        </ul>
      </div>
    </AppShell>
  );
}
