'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Crown, Mail, RefreshCw, Search, User, Users, Pencil, UserSearch } from 'lucide-react';
import { type StatusKorisnika, BADGE_STATUSA } from '@/lib/admin/statusKorisnika';
import {
  filtrirajKorisnikeListu,
  porukaPraznogStanjaKorisnika,
  type StatusFilterKorisnika,
  type UlogaFilterKorisnika,
} from '@/lib/admin/korisniciFilter';
import { AdminKorisniciPretragaFilter } from '@/components/admin/AdminKorisniciPretragaFilter';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { formatirajDatumPrikaz } from '@/lib/format/datumi';

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
}

export default function AdminKorisniciPage() {
  const [korisnici, setKorisnici] = useState<KorisnikSistema[]>([]);
  const [greska, setGreska] = useState<string | null>(null);
  const [ucitava, setUcitava] = useState(true);
  const [pretraga, setPretraga] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterKorisnika>('svi');
  const [ulogaFilter, setUlogaFilter] = useState<UlogaFilterKorisnika>('svi');

  async function ucitajKorisnike() {
    setUcitava(true);
    setGreska(null);
    try {
      const odgovor = await fetch('/api/admin/users', { cache: 'no-store' });
      const podaci = await odgovor.json();
      if (!odgovor.ok) throw new Error(podaci.error ?? 'Nije moguce ucitati korisnike.');
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

  const filtrirani = useMemo(
    () =>
      filtrirajKorisnikeListu(korisnici, {
        pretraga,
        status: statusFilter,
        uloga: ulogaFilter,
      }),
    [korisnici, pretraga, statusFilter, ulogaFilter],
  );

  const porukaPrazno = porukaPraznogStanjaKorisnika({
    pretraga,
    status: statusFilter,
    uloga: ulogaFilter,
    ukupno: korisnici.length,
  });

  return (
    <AppShell uloga="admin" imeKorisnika="Administrator">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--first-octonary)' }}>
            Korisnici
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--first-nonary)' }}>
            Pregled svih korisničkih naloga — pretraga, filteri i upravljanje profilima.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={ucitajKorisnike}
          isLoading={ucitava}
          loadingText="Učitavanje..."
        >
          <RefreshCw className="h-4 w-4" />
          Osvježi
        </Button>
      </div>

      <AdminKorisniciPretragaFilter
        pretraga={pretraga}
        onPretragaChange={setPretraga}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        ulogaFilter={ulogaFilter}
        onUlogaFilterChange={setUlogaFilter}
        brojRezultata={ucitava ? undefined : filtrirani.length}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { oznaka: 'Ukupno naloga', vrijednost: korisnici.length, boja: 'var(--first-primary)', Ikona: Users },
          {
            oznaka: 'Aktivni',
            vrijednost: korisnici.filter((k) => k.status === 'aktivan').length,
            boja: 'var(--first-secondary)',
            Ikona: User,
          },
          {
            oznaka: 'Korisnici usluge',
            vrijednost: korisnici.filter((k) => k.tip === 'korisnik').length,
            boja: 'var(--first-septenary)',
            Ikona: UserSearch,
          },
          {
            oznaka: 'Premium aktivan',
            vrijednost: korisnici.filter((k) => k.premium_status === 'active').length,
            boja: 'var(--first-senary)',
            Ikona: Crown,
          },
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
        <div
          className="mb-6 rounded-xl border px-4 py-3 text-sm"
          style={{
            borderColor: 'rgb(var(--first-senary-rgb) / 0.25)',
            backgroundColor: 'rgb(var(--first-senary-rgb) / 0.08)',
            color: 'var(--first-senary)',
          }}
        >
          {greska}
        </div>
      )}

      {ucitava && (
        <p className="py-8 text-center text-sm" style={{ color: 'var(--first-nonary)' }}>
          Učitavanje korisnika...
        </p>
      )}

      {!ucitava && filtrirani.length === 0 && !greska && (
        <div
          className="mb-6 flex flex-col items-center gap-3 rounded-2xl px-6 py-12 text-center"
          style={{
            backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.15)',
            border: '1px dashed rgb(var(--first-quaternary-rgb) / 0.4)',
          }}
          role="status"
        >
          <Search className="h-10 w-10 opacity-40" style={{ color: 'var(--first-nonary)' }} aria-hidden />
          <p className="max-w-md text-sm font-medium" style={{ color: 'var(--first-octonary)' }}>
            {porukaPrazno}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {!ucitava &&
          filtrirani.map((korisnik) => {
            const badge = BADGE_STATUSA[korisnik.status];
            return (
              <article
                key={korisnik.id}
                className="rounded-2xl p-5 shadow-card"
                style={{
                  backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.22)',
                  border: '1px solid rgb(var(--first-quaternary-rgb) / 0.35)',
                }}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold" style={{ color: 'var(--first-octonary)' }}>
                      {korisnik.imeIPrezime}
                    </h2>
                    <p className="mt-1 flex items-center gap-1.5 truncate text-sm" style={{ color: 'var(--first-nonary)' }}>
                      <Mail className="h-4 w-4 shrink-0" />
                      {korisnik.email}
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
                  <div className="flex justify-between gap-3">
                    <dt style={{ color: 'var(--first-nonary)' }}>Uloga</dt>
                    <dd className="text-right font-medium" style={{ color: 'var(--first-octonary)' }}>
                      {korisnik.uloga}
                    </dd>
                  </div>
                  {korisnik.tip === 'korisnik' && (
                    <>
                      <div className="flex justify-between gap-3">
                        <dt style={{ color: 'var(--first-nonary)' }}>Premium</dt>
                        <dd className="text-right font-medium" style={{ color: 'var(--first-octonary)' }}>
                          {korisnik.premium_status ?? (korisnik.isPremium ? 'active' : 'inactive')}
                        </dd>
                      </div>
                      {korisnik.premium_status === 'active' && korisnik.premium_expires_at && (
                        <div className="flex justify-between gap-3">
                          <dt style={{ color: 'var(--first-nonary)' }}>Premium ističe</dt>
                          <dd className="text-right font-medium" style={{ color: 'var(--first-octonary)' }}>
                            {formatirajDatumPrikaz(korisnik.premium_expires_at)}
                          </dd>
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex justify-between gap-3">
                    <dt style={{ color: 'var(--first-nonary)' }}>Registrovan</dt>
                    <dd className="text-right font-medium" style={{ color: 'var(--first-octonary)' }}>
                      {korisnik.datumRegistracije}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 border-t pt-3" style={{ borderColor: 'rgb(var(--first-quaternary-rgb)/0.25)' }}>
                  <Link
                    href={`/admin/korisnici/${korisnik.id}/uredi`}
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
    </AppShell>
  );
}
