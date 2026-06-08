'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Shield,
  ShieldOff,
  ShieldCheck,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Wrench,
  Headphones,
  Crown,
  KeyRound,
  MailCheck,
  History,
  ChevronRight,
  X,
  Lock,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { AlertMessage } from '@/components/ui/AlertMessage';
import { OdabirLokacije } from '@/components/shared/MapaOdabir';

// ─── Types ────────────────────────────────────────────────────────────────────

type StatusKorisnika = 'aktivan' | 'neaktivan' | 'suspendovan';

interface UlogaOpcija {
  id_uloge: number;
  naziv: string;
}

interface AktivnostZapis {
  id: number;
  akcija: string;
  detalji: Record<string, unknown>;
  razlog: string | null;
  created_at: string;
  actor_id: string;
}

interface KorisnikDetalj {
  id: string;
  ime: string;
  prezime: string;
  email: string;
  broj_telefona: string | null;
  adresa: string | null;
  tip: 'korisnik' | 'uposlenik';
  uloga: string;
  uloga_id: number | null;
  status: StatusKorisnika;
  email_potvrden: boolean;
  zadnja_prijava: string | null;
  kreiran_at: string;
  banned_until: string | null;
  isPremium: boolean;
  premium_status: string | null;
  premium_expires_at: string | null;
  bazna_latitude: number | null;
  bazna_longitude: number | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<
  StatusKorisnika,
  { oznaka: string; boja: string; pozadina: string }
> = {
  aktivan: {
    oznaka: 'Aktivan',
    boja: 'var(--first-secondary)',
    pozadina: 'rgb(var(--first-secondary-rgb)/0.12)',
  },
  neaktivan: {
    oznaka: 'Neaktivan',
    boja: 'var(--first-nonary)',
    pozadina: 'rgb(var(--first-quaternary-rgb)/0.25)',
  },
  suspendovan: {
    oznaka: 'Suspendovan',
    boja: '#DC2626',
    pozadina: 'rgba(220,38,38,0.10)',
  },
};

const ULOGA_CFG: Record<
  string,
  {
    boja: string;
    pozadina: string;
    Ikona: React.ComponentType<{
      className?: string;
      style?: React.CSSProperties;
    }>;
  }
> = {
  'Korisnik usluge': {
    boja: 'var(--first-secondary)',
    pozadina: 'rgb(var(--first-secondary-rgb)/0.10)',
    Ikona: User,
  },
  Serviser: {
    boja: 'var(--first-primary)',
    pozadina: 'rgb(var(--first-primary-rgb)/0.10)',
    Ikona: Wrench,
  },
  Dispečer: {
    boja: '#7C3AED',
    pozadina: 'rgba(124,58,237,0.10)',
    Ikona: Headphones,
  },
  Administrator: {
    boja: '#DC2626',
    pozadina: 'rgba(220,38,38,0.10)',
    Ikona: Shield,
  },
};

const AKCIJA_CFG: Record<string, { oznaka: string; boja: string }> = {
  kreiran: { oznaka: 'Nalog kreiran', boja: 'var(--first-secondary)' },
  uredi_podatke: {
    oznaka: 'Podaci izmijenjeni',
    boja: 'var(--first-secondary)',
  },
  suspendovan: { oznaka: 'Nalog suspendovan', boja: '#DC2626' },
  aktiviran: { oznaka: 'Nalog aktiviran', boja: '#16A34A' },
  uloga_promijenjena: { oznaka: 'Uloga promijenjena', boja: '#7C3AED' },
};

function fmtDatumVrijeme(iso: string | null | undefined): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('bs-BA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function fmtDatum(iso: string | null | undefined): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('bs-BA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function ulogaCfg(naziv: string) {
  return (
    ULOGA_CFG[naziv] ?? {
      boja: 'var(--first-nonary)',
      pozadina: 'rgb(var(--first-quaternary-rgb)/0.2)',
      Ikona: User,
    }
  );
}

// ─── Suspension Modal ─────────────────────────────────────────────────────────

function SuspenzijaModal({
  onPotvrdi,
  onZatvori,
  jeSlanje,
}: {
  onPotvrdi: (razlog: string) => void;
  onZatvori: () => void;
  jeSlanje: boolean;
}) {
  const [razlog, setRazlog] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onZatvori();
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl"
        style={{
          backgroundColor: 'var(--first-tertiary)',
          border: '1px solid rgba(220,38,38,0.25)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-6 py-4"
          style={{ borderColor: 'rgba(220,38,38,0.2)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ backgroundColor: 'rgba(220,38,38,0.1)' }}
            >
              <ShieldOff className="h-5 w-5" style={{ color: '#DC2626' }} />
            </div>
            <div>
              <h2
                className="text-base font-bold"
                style={{ color: 'var(--first-octonary)' }}
              >
                Suspenduj nalog
              </h2>
              <p className="text-xs" style={{ color: 'var(--first-nonary)' }}>
                Korisnik više neće moći pristupiti sistemu
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onZatvori}
            aria-label="Zatvori"
            className="rounded-lg transition-opacity hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-celestial-teal/40"
            style={{ color: 'var(--first-nonary)' }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          <div
            className="flex items-start gap-2 rounded-xl px-4 py-3"
            style={{
              backgroundColor: 'rgba(220,38,38,0.06)',
              border: '1px solid rgba(220,38,38,0.18)',
            }}
          >
            <AlertTriangle
              className="h-4 w-4 flex-shrink-0 mt-0.5"
              style={{ color: '#DC2626' }}
            />
            <p className="text-sm" style={{ color: 'var(--first-octonary)' }}>
              Suspendovanjem naloga korisnik gubi pristup svim funkcijama
              sistema. Ova akcija je reverzibilna.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-semibold"
              style={{ color: 'var(--first-octonary)' }}
            >
              Razlog suspendovanja *
            </label>
            <textarea
              ref={inputRef}
              rows={3}
              value={razlog}
              onChange={(e) => setRazlog(e.target.value)}
              placeholder="Unesite razlog suspendovanja naloga..."
              className="w-full resize-none rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
              style={{
                borderColor: 'rgba(220,38,38,0.3)',
                backgroundColor: 'rgb(255 255 255/0.85)',
                color: 'var(--first-octonary)',
              }}
            />
          </div>
        </div>

        <div
          className="flex items-center justify-end gap-3 border-t px-6 py-4"
          style={{ borderColor: 'rgb(var(--first-quaternary-rgb)/0.3)' }}
        >
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={onZatvori}
            disabled={jeSlanje}
          >
            Odustani
          </Button>
          <Button
            type="button"
            size="md"
            onClick={() => {
              if (razlog.trim().length >= 3) onPotvrdi(razlog.trim());
            }}
            isLoading={jeSlanje}
            loadingText="Suspendovanje..."
            disabled={razlog.trim().length < 3}
            style={
              {
                backgroundColor: '#DC2626',
                color: '#fff',
                border: 'none',
              } as React.CSSProperties
            }
          >
            <ShieldOff className="h-4 w-4" />
            Suspenduj nalog
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Role change Modal ────────────────────────────────────────────────────────

function PromijeniUloguModal({
  trenutnaUloga,
  uloge,
  onPotvrdi,
  onZatvori,
  jeSlanje,
}: {
  trenutnaUloga: string;
  uloge: UlogaOpcija[];
  onPotvrdi: (ulogaId: number) => void;
  onZatvori: () => void;
  jeSlanje: boolean;
}) {
  const [odabrana, setOdabrana] = useState<number | null>(null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onZatvori();
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl"
        style={{
          backgroundColor: 'var(--first-tertiary)',
          border: '1px solid rgb(var(--first-quaternary-rgb)/0.4)',
        }}
      >
        <div
          className="flex items-center justify-between border-b px-6 py-4"
          style={{ borderColor: 'rgb(var(--first-quaternary-rgb)/0.3)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ backgroundColor: 'rgb(var(--first-primary-rgb)/0.1)' }}
            >
              <Shield
                className="h-5 w-5"
                style={{ color: 'var(--first-primary)' }}
              />
            </div>
            <div>
              <h2
                className="text-base font-bold"
                style={{ color: 'var(--first-octonary)' }}
              >
                Promjena uloge
              </h2>
              <p className="text-xs" style={{ color: 'var(--first-nonary)' }}>
                Trenutna: {trenutnaUloga}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onZatvori}
            aria-label="Zatvori"
            className="rounded-lg transition-opacity hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-celestial-teal/40"
            style={{ color: 'var(--first-nonary)' }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-2 px-6 py-5">
          {uloge.map((u) => {
            const cfg = ulogaCfg(u.naziv);
            const Ikona = cfg.Ikona;
            const jeOdabrana = odabrana === u.id_uloge;
            return (
              <button
                key={u.id_uloge}
                type="button"
                onClick={() => setOdabrana(u.id_uloge)}
                className="flex items-center gap-3 rounded-xl p-3.5 text-left transition-all"
                style={{
                  backgroundColor: jeOdabrana
                    ? cfg.pozadina
                    : 'rgb(255 255 255/0.7)',
                  border: jeOdabrana
                    ? `2px solid ${cfg.boja}`
                    : '1px solid rgb(var(--first-quaternary-rgb)/0.35)',
                }}
              >
                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: cfg.pozadina }}
                >
                  <Ikona className="h-4 w-4" style={{ color: cfg.boja }} />
                </div>
                <span
                  className="flex-1 text-sm font-semibold"
                  style={{ color: 'var(--first-octonary)' }}
                >
                  {u.naziv}
                </span>
                {jeOdabrana && (
                  <CheckCircle2
                    className="h-4 w-4"
                    style={{ color: cfg.boja }}
                  />
                )}
              </button>
            );
          })}

          {odabrana !== null &&
            uloge.find((u) => u.id_uloge === odabrana)?.naziv ===
              'Administrator' && (
              <div
                className="flex items-start gap-2 rounded-xl px-3 py-2.5"
                style={{
                  backgroundColor: 'rgba(220,38,38,0.06)',
                  border: '1px solid rgba(220,38,38,0.2)',
                }}
              >
                <AlertTriangle
                  className="h-3.5 w-3.5 flex-shrink-0 mt-0.5"
                  style={{ color: '#DC2626' }}
                />
                <p className="text-xs" style={{ color: '#DC2626' }}>
                  Dodjeljujete administratorsku ulogu. Korisnik će imati puni
                  pristup sistemu.
                </p>
              </div>
            )}
        </div>

        <div
          className="flex items-center justify-end gap-3 border-t px-6 py-4"
          style={{ borderColor: 'rgb(var(--first-quaternary-rgb)/0.3)' }}
        >
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={onZatvori}
            disabled={jeSlanje}
          >
            Odustani
          </Button>
          <Button
            type="button"
            size="md"
            onClick={() => {
              if (odabrana) onPotvrdi(odabrana);
            }}
            isLoading={jeSlanje}
            loadingText="Snimanje..."
            disabled={odabrana === null}
          >
            <Shield className="h-4 w-4" />
            Potvrdi promjenu
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function UrediKorisnikaPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;

  const [korisnik, setKorisnik] = useState<KorisnikDetalj | null>(null);
  const [uloge, setUloge] = useState<UlogaOpcija[]>([]);
  const [aktivnosti, setAktivnosti] = useState<AktivnostZapis[]>([]);
  const [ucitava, setUcitava] = useState(true);
  const [greska, setGreska] = useState<string | null>(null);
  const [uspjeh, setUspjeh] = useState<string | null>(null);
  const [jeSlanje, setJeSlanje] = useState(false);
  const [prijavjenId, setPrijavjenId] = useState<string | null>(null);

  // Form state
  const [ime, setIme] = useState('');
  const [prezime, setPrezime] = useState('');
  const [telefon, setTelefon] = useState('');
  const [adresa, setAdresa] = useState('');
  const [baznaLat, setBaznaLat] = useState<number | null>(null);
  const [baznaLng, setBaznaLng] = useState<number | null>(null);

  // Modals
  const [suspenzijaMod, setSuspenzijaMod] = useState(false);
  const [ulogaMod, setUlogaMod] = useState(false);

  async function ucitaj() {
    setUcitava(true);
    setGreska(null);
    try {
      const r = await fetch(`/api/admin/users/${userId}`, {
        cache: 'no-store',
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Greška pri učitavanju.');
      setKorisnik(d.korisnik);
      setUloge(d.uloge ?? []);
      setAktivnosti(d.aktivnosti ?? []);
      setIme(d.korisnik.ime ?? '');
      setPrezime(d.korisnik.prezime ?? '');
      setTelefon(d.korisnik.broj_telefona ?? '');
      setAdresa(d.korisnik.adresa ?? '');
      setBaznaLat(d.korisnik.bazna_latitude ?? null);
      setBaznaLng(d.korisnik.bazna_longitude ?? null);
    } catch (e) {
      setGreska(e instanceof Error ? e.message : 'Greška.');
    } finally {
      setUcitava(false);
    }
  }

  // Namjerno se pokreće samo na promjenu `userId`; `ucitaj` nije memoizirana funkcija.
  useEffect(() => {
    if (userId) ucitaj();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Učitaj ID prijavljenog admina da bismo zabranili akcije na vlastitom nalogu
  useEffect(() => {
    fetch('/api/profil', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (d?.profil?.id) setPrijavjenId(d.profil.id);
      })
      .catch(() => {});
  }, []);

  // True kada admin gleda vlastiti nalog
  const jeSamSebe = prijavjenId !== null && prijavjenId === userId;

  async function posaljiPatch(
    body: Record<string, unknown>,
    uspjehPoruka: string,
  ) {
    setJeSlanje(true);
    setGreska(null);
    setUspjeh(null);
    try {
      const r = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Greška.');
      if (d.korisnik?.ime) setIme(d.korisnik.ime);
      if (d.korisnik?.prezime) setPrezime(d.korisnik.prezime);
      setUspjeh(
        d.upozorenje ? `${uspjehPoruka} (${d.upozorenje})` : uspjehPoruka,
      );
      await ucitaj();
      setTimeout(() => setUspjeh(null), 4000);
    } catch (e) {
      setGreska(e instanceof Error ? e.message : 'Greška.');
    } finally {
      setJeSlanje(false);
    }
  }

  function sacuvajPodatke() {
    const imeT = ime.trim();
    const prezimeT = prezime.trim();
    if (!imeT) {
      setGreska('Ime je obavezno.');
      return;
    }
    if (!prezimeT) {
      setGreska('Prezime je obavezno.');
      return;
    }
    if (telefon.trim().length > 30) {
      setGreska('Broj telefona je predugačak (maks. 30 znakova).');
      return;
    }

    const body: Record<string, unknown> = {
      action: 'uredi_podatke',
      ime: imeT,
      prezime: prezimeT,
      broj_telefona: telefon.trim() || null,
      adresa: adresa.trim() || null,
    };

    const jeServiser = (korisnik?.uloga ?? '')
      .toLowerCase()
      .includes('serviser');
    if (jeServiser) {
      const latOk = typeof baznaLat === 'number' && Number.isFinite(baznaLat);
      const lngOk = typeof baznaLng === 'number' && Number.isFinite(baznaLng);
      body.bazna_latitude = latOk ? baznaLat : null;
      body.bazna_longitude = lngOk ? baznaLng : null;
    }

    posaljiPatch(body, 'Podaci uspješno sačuvani.');
  }

  async function suspenduj(razlog: string) {
    await posaljiPatch(
      { action: 'suspenduj', razlog },
      'Nalog je suspendovan.',
    );
    setSuspenzijaMod(false);
  }

  async function aktiviraj() {
    await posaljiPatch({ action: 'aktiviraj' }, 'Nalog je aktiviran.');
  }

  async function promijeniUlogu(ulogaId: number) {
    await posaljiPatch(
      { action: 'promijeni_ulogu', nova_uloga_id: ulogaId },
      'Uloga je promijenjena.',
    );
    setUlogaMod(false);
  }

  const karticaStil = {
    backgroundColor: 'rgb(255 255 255/0.85)',
    border: '1px solid rgb(var(--first-quaternary-rgb)/0.32)',
  };

  const sekcijaNaslovStil = {
    backgroundColor: 'rgb(var(--first-quinary-rgb)/0.15)',
    border: '1px solid rgb(var(--first-quaternary-rgb)/0.28)',
  };

  const inputStil = {
    borderColor: 'rgb(var(--first-quaternary-rgb)/0.45)',
    backgroundColor: 'rgb(255 255 255/0.85)',
    color: 'var(--first-octonary)',
  };

  if (ucitava) {
    return (
      <AppShell uloga="admin" imeKorisnika="Administrator">
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div
              className="h-6 w-6 animate-spin rounded-full border-2 border-transparent"
              style={{ borderTopColor: 'var(--first-secondary)' }}
            />
            <p className="text-sm" style={{ color: 'var(--first-nonary)' }}>
              Učitavanje podataka...
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (greska && !korisnik) {
    return (
      <AppShell uloga="admin" imeKorisnika="Administrator">
        <div className="flex flex-col items-center gap-4 py-16">
          <XCircle className="h-12 w-12" style={{ color: '#DC2626' }} />
          <p className="text-base font-semibold" style={{ color: '#DC2626' }}>
            {greska}
          </p>
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => router.push('/admin/korisnici')}
          >
            <ArrowLeft className="h-4 w-4" />
            Nazad na korisnike
          </Button>
        </div>
      </AppShell>
    );
  }

  if (!korisnik) return null;

  const statusCfg = STATUS_CFG[korisnik.status];
  const ulogaCfgObj = ulogaCfg(korisnik.uloga);
  const UlogaIkona = ulogaCfgObj.Ikona;

  return (
    <AppShell uloga="admin" imeKorisnika="Administrator">
      {/* Modals */}
      {suspenzijaMod && (
        <SuspenzijaModal
          onPotvrdi={suspenduj}
          onZatvori={() => setSuspenzijaMod(false)}
          jeSlanje={jeSlanje}
        />
      )}
      {ulogaMod && (
        <PromijeniUloguModal
          trenutnaUloga={korisnik.uloga}
          uloge={uloge}
          onPotvrdi={promijeniUlogu}
          onZatvori={() => setUlogaMod(false)}
          jeSlanje={jeSlanje}
        />
      )}

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => router.push('/admin/korisnici')}
        className="mb-5 flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
        style={{ color: 'var(--first-secondary)' }}
      >
        <ArrowLeft className="h-4 w-4" />
        Nazad na korisnike
      </button>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: 'var(--first-octonary)' }}
            >
              Uredi korisnički nalog
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <p
                className="text-sm font-semibold"
                style={{ color: 'var(--first-octonary)' }}
              >
                {korisnik.ime} {korisnik.prezime}
              </p>
              <span style={{ color: 'var(--first-nonary)' }}>·</span>
              <p className="text-sm" style={{ color: 'var(--first-nonary)' }}>
                {korisnik.email}
              </p>
            </div>
          </div>

          {/* Status + role badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
              style={{
                backgroundColor: statusCfg.pozadina,
                color: statusCfg.boja,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: statusCfg.boja }}
              />
              {statusCfg.oznaka}
            </span>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
              style={{
                backgroundColor: ulogaCfgObj.pozadina,
                color: ulogaCfgObj.boja,
              }}
            >
              <UlogaIkona className="h-3 w-3" />
              {korisnik.uloga}
            </span>
            {korisnik.isPremium && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
                style={{
                  backgroundColor: 'rgba(234,179,8,0.12)',
                  color: '#B45309',
                }}
              >
                <Crown className="h-3 w-3" />
                Premium
              </span>
            )}
          </div>
        </div>

        {/* Header actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {korisnik.status === 'suspendovan' ? (
            <Button
              type="button"
              size="md"
              onClick={aktiviraj}
              isLoading={jeSlanje}
              loadingText="Aktiviranje..."
            >
              <ShieldCheck className="h-4 w-4" />
              Aktiviraj nalog
            </Button>
          ) : !jeSamSebe ? (
            <Button
              type="button"
              size="md"
              variant="ghost"
              onClick={() => setSuspenzijaMod(true)}
              disabled={jeSlanje}
              style={{ color: '#DC2626' } as React.CSSProperties}
            >
              <ShieldOff className="h-4 w-4" />
              Suspenduj nalog
            </Button>
          ) : null}
          <Button
            type="button"
            size="md"
            onClick={sacuvajPodatke}
            isLoading={jeSlanje}
            loadingText="Snimanje..."
          >
            <Save className="h-4 w-4" />
            Sačuvaj izmjene
          </Button>
        </div>
      </div>

      {greska && (
        <div className="mb-4">
          <AlertMessage variant="error" message={greska} />
        </div>
      )}
      {uspjeh && (
        <div className="mb-4">
          <AlertMessage variant="success" message={uspjeh} />
        </div>
      )}

      {/* ── Two-column layout ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        {/* ══ LEFT - forms ═══════════════════════════════════════════════ */}
        <div className="min-w-0 flex-1 flex flex-col gap-5">
          {/* Osnovni podaci */}
          <div className="rounded-2xl p-5 sm:p-6" style={karticaStil}>
            <div className="mb-5 flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: 'rgb(var(--first-secondary-rgb)/0.1)',
                }}
              >
                <User
                  className="h-4 w-4"
                  style={{ color: 'var(--first-secondary)' }}
                />
              </div>
              <h2
                className="text-sm font-bold uppercase tracking-wide"
                style={{ color: 'var(--first-nonary)' }}
              >
                Osnovni podaci
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Ime */}
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--first-nonary)' }}
                >
                  Ime
                </label>
                <input
                  type="text"
                  value={ime}
                  onChange={(e) => setIme(e.target.value)}
                  className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                  style={inputStil}
                />
              </div>

              {/* Prezime */}
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--first-nonary)' }}
                >
                  Prezime
                </label>
                <input
                  type="text"
                  value={prezime}
                  onChange={(e) => setPrezime(e.target.value)}
                  className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                  style={inputStil}
                />
              </div>

              {/* Email - read-only */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <div className="flex items-center gap-2">
                  <label
                    className="text-xs font-semibold uppercase tracking-wide"
                    style={{ color: 'var(--first-nonary)' }}
                  >
                    Email adresa
                  </label>
                  <span
                    className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold"
                    style={{
                      backgroundColor: 'rgb(var(--first-quaternary-rgb)/0.3)',
                      color: 'var(--first-nonary)',
                    }}
                  >
                    <Lock className="h-2.5 w-2.5" />
                    Samo čitanje
                  </span>
                </div>
                <div
                  className="flex items-center gap-2.5 rounded-xl border px-4 py-2.5"
                  style={{ ...inputStil, opacity: 0.65, cursor: 'not-allowed' }}
                >
                  <Mail
                    className="h-4 w-4 flex-shrink-0"
                    style={{ color: 'var(--first-nonary)' }}
                  />
                  <span className="text-sm">{korisnik.email}</span>
                </div>
                <p
                  className="text-[11px]"
                  style={{ color: 'var(--first-nonary)' }}
                >
                  Email adresa se mijenja kroz Supabase Auth panel ili
                  korisnikovu zahtjev za promjenom.
                </p>
              </div>

              {/* Telefon */}
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--first-nonary)' }}
                >
                  Broj telefona
                </label>
                <div
                  className="flex items-center gap-2 rounded-xl border overflow-hidden"
                  style={{
                    borderColor: 'rgb(var(--first-quaternary-rgb)/0.45)',
                    backgroundColor: 'rgb(255 255 255/0.85)',
                  }}
                >
                  <Phone
                    className="ml-4 h-4 w-4 flex-shrink-0"
                    style={{ color: 'var(--first-nonary)' }}
                  />
                  <input
                    type="tel"
                    value={telefon}
                    onChange={(e) => setTelefon(e.target.value)}
                    placeholder="npr. +387 61 123 456"
                    className="flex-1 bg-transparent px-2 py-2.5 text-sm focus:outline-none"
                    style={{ color: 'var(--first-octonary)' }}
                  />
                </div>
              </div>

              {/* Adresa */}
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--first-nonary)' }}
                >
                  Adresa
                </label>
                <div
                  className="flex items-center gap-2 rounded-xl border overflow-hidden"
                  style={{
                    borderColor: 'rgb(var(--first-quaternary-rgb)/0.45)',
                    backgroundColor: 'rgb(255 255 255/0.85)',
                  }}
                >
                  <MapPin
                    className="ml-4 h-4 w-4 flex-shrink-0"
                    style={{ color: 'var(--first-nonary)' }}
                  />
                  <input
                    type="text"
                    value={adresa}
                    onChange={(e) => setAdresa(e.target.value)}
                    placeholder="Ulica i broj, grad"
                    className="flex-1 bg-transparent px-2 py-2.5 text-sm focus:outline-none"
                    style={{ color: 'var(--first-octonary)' }}
                  />
                </div>
              </div>
            </div>

            {/* Bazna lokacija — samo za servisere (US-48) */}
            {(korisnik.uloga ?? '').toLowerCase().includes('serviser') && (
              <div
                className="mt-5 border-t pt-5"
                style={{ borderColor: 'rgb(var(--first-quaternary-rgb)/0.25)' }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <MapPin
                    className="h-4 w-4"
                    style={{ color: 'var(--first-secondary)' }}
                  />
                  <h3
                    className="text-xs font-bold uppercase tracking-wide"
                    style={{ color: 'var(--first-nonary)' }}
                  >
                    Bazna lokacija (geo-preporuka)
                  </h3>
                </div>
                <OdabirLokacije
                  latitude={baznaLat}
                  longitude={baznaLng}
                  label="Adresa bazne lokacije"
                  prikaziGps={false}
                  onChange={({ latitude, longitude }) => {
                    setBaznaLat(latitude);
                    setBaznaLng(longitude);
                  }}
                />
                <p
                  className="mt-2 text-[11px]"
                  style={{ color: 'var(--first-nonary)' }}
                >
                  Opcionalno. Koristi se da dispečer serviseru dodjeljuje bliže
                  intervencije.
                </p>
              </div>
            )}

            {/* Save footer */}
            <div
              className="mt-5 flex justify-end border-t pt-4"
              style={{ borderColor: 'rgb(var(--first-quaternary-rgb)/0.25)' }}
            >
              <Button
                type="button"
                size="md"
                onClick={sacuvajPodatke}
                isLoading={jeSlanje}
                loadingText="Snimanje..."
              >
                <Save className="h-4 w-4" />
                Sačuvaj izmjene
              </Button>
            </div>
          </div>

          {/* Uloge i pristup */}
          <div className="rounded-2xl p-5 sm:p-6" style={karticaStil}>
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: 'rgb(var(--first-primary-rgb)/0.1)',
                  }}
                >
                  <Shield
                    className="h-4 w-4"
                    style={{ color: 'var(--first-primary)' }}
                  />
                </div>
                <h2
                  className="text-sm font-bold uppercase tracking-wide"
                  style={{ color: 'var(--first-nonary)' }}
                >
                  Uloge i pristup
                </h2>
              </div>
              {korisnik.tip === 'uposlenik' && (
                <button
                  type="button"
                  onClick={() => setUlogaMod(true)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition hover:opacity-80"
                  style={{
                    backgroundColor: 'rgb(var(--first-primary-rgb)/0.08)',
                    color: 'var(--first-primary)',
                  }}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                  Promijeni ulogu
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2.5">
              {/* Primary role badge */}
              <div
                className="flex items-center gap-3 rounded-2xl p-4"
                style={sekcijaNaslovStil}
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ backgroundColor: ulogaCfgObj.pozadina }}
                >
                  <UlogaIkona
                    className="h-5 w-5"
                    style={{ color: ulogaCfgObj.boja }}
                  />
                </div>
                <div>
                  <p
                    className="text-sm font-bold"
                    style={{ color: 'var(--first-octonary)' }}
                  >
                    {korisnik.uloga}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: 'var(--first-nonary)' }}
                  >
                    {korisnik.tip === 'korisnik'
                      ? 'Korisnik usluge sistema'
                      : 'Interni uposlenik'}
                  </p>
                </div>
              </div>

              {/* Premium badge for korisnik_usluge */}
              {korisnik.tip === 'korisnik' && (
                <div
                  className="flex items-center gap-3 rounded-2xl p-4"
                  style={sekcijaNaslovStil}
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: korisnik.isPremium
                        ? 'rgba(234,179,8,0.12)'
                        : 'rgb(var(--first-quaternary-rgb)/0.2)',
                    }}
                  >
                    <Crown
                      className="h-5 w-5"
                      style={{
                        color: korisnik.isPremium
                          ? '#B45309'
                          : 'var(--first-nonary)',
                      }}
                    />
                  </div>
                  <div>
                    <p
                      className="text-sm font-bold"
                      style={{ color: 'var(--first-octonary)' }}
                    >
                      {korisnik.isPremium
                        ? 'Premium aktivan'
                        : 'Standardni plan'}
                    </p>
                    {korisnik.premium_expires_at && (
                      <p
                        className="text-xs"
                        style={{ color: 'var(--first-nonary)' }}
                      >
                        Istječe: {fmtDatum(korisnik.premium_expires_at)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {korisnik.tip === 'korisnik' && (
              <p
                className="mt-3 text-xs"
                style={{ color: 'var(--first-nonary)' }}
              >
                Promjena statusa premium pretplate dostupna je na kartici
                korisnika u listi korisnika.
              </p>
            )}
          </div>
        </div>

        {/* ══ RIGHT - operational panel ═══════════════════════════════════ */}
        <div className="lg:w-80 xl:w-88 flex-shrink-0 flex flex-col gap-4">
          {/* Status naloga */}
          <div className="rounded-2xl p-5" style={karticaStil}>
            <div className="mb-4 flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{ backgroundColor: statusCfg.pozadina }}
              >
                <ShieldCheck
                  className="h-4 w-4"
                  style={{ color: statusCfg.boja }}
                />
              </div>
              <h2
                className="text-sm font-bold uppercase tracking-wide"
                style={{ color: 'var(--first-nonary)' }}
              >
                Status naloga
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              {/* Status badge row */}
              <div className="flex items-center justify-between">
                <span
                  className="text-xs"
                  style={{ color: 'var(--first-nonary)' }}
                >
                  Trenutni status
                </span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
                  style={{
                    backgroundColor: statusCfg.pozadina,
                    color: statusCfg.boja,
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: statusCfg.boja }}
                  />
                  {statusCfg.oznaka}
                </span>
              </div>

              <div
                className="my-1 border-t"
                style={{ borderColor: 'rgb(var(--first-quaternary-rgb)/0.2)' }}
              />

              {[
                {
                  Ikona: Clock,
                  label: 'Registrovan',
                  vrijednost: fmtDatumVrijeme(korisnik.kreiran_at),
                },
                {
                  Ikona: MailCheck,
                  label: 'Email potvrđen',
                  vrijednost: korisnik.email_potvrden
                    ? 'Da ✓'
                    : 'Nije potvrđen',
                },
                {
                  Ikona: Clock,
                  label: 'Zadnja prijava',
                  vrijednost: fmtDatumVrijeme(korisnik.zadnja_prijava),
                },
                {
                  Ikona: Shield,
                  label: 'Tip naloga',
                  vrijednost:
                    korisnik.tip === 'korisnik'
                      ? 'Korisnik usluge'
                      : 'Interni uposlenik',
                },
              ].map(({ Ikona, label, vrijednost }) => (
                <div
                  key={label}
                  className="flex items-start justify-between gap-3"
                >
                  <div className="flex items-center gap-1.5">
                    <Ikona
                      className="h-3.5 w-3.5 flex-shrink-0"
                      style={{ color: 'var(--first-nonary)' }}
                    />
                    <span
                      className="text-xs"
                      style={{ color: 'var(--first-nonary)' }}
                    >
                      {label}
                    </span>
                  </div>
                  <span
                    className="text-right text-xs font-semibold"
                    style={{
                      color:
                        label === 'Email potvrđen' && !korisnik.email_potvrden
                          ? '#DC2626'
                          : 'var(--first-octonary)',
                    }}
                  >
                    {vrijednost}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sigurnosne akcije */}
          <div className="rounded-2xl p-5" style={karticaStil}>
            <div className="mb-4 flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{ backgroundColor: 'rgb(var(--first-primary-rgb)/0.1)' }}
              >
                <KeyRound
                  className="h-4 w-4"
                  style={{ color: 'var(--first-primary)' }}
                />
              </div>
              <h2
                className="text-sm font-bold uppercase tracking-wide"
                style={{ color: 'var(--first-nonary)' }}
              >
                Sigurnosne akcije
              </h2>
            </div>

            <div className="flex flex-col gap-2">
              {korisnik.status === 'suspendovan' ? (
                <button
                  type="button"
                  onClick={aktiviraj}
                  disabled={jeSlanje}
                  className="flex w-full items-center gap-3 rounded-xl p-3.5 text-left transition-all hover:opacity-80 disabled:opacity-50"
                  style={{
                    backgroundColor: 'rgba(22,163,74,0.08)',
                    border: '1px solid rgba(22,163,74,0.2)',
                  }}
                >
                  <ShieldCheck
                    className="h-4 w-4 flex-shrink-0"
                    style={{ color: '#16A34A' }}
                  />
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: '#16A34A' }}
                    >
                      Aktiviraj nalog
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: 'var(--first-nonary)' }}
                    >
                      Ukloni suspenziju
                    </p>
                  </div>
                </button>
              ) : jeSamSebe ? (
                <div
                  className="flex w-full items-center gap-3 rounded-xl p-3.5"
                  style={{
                    backgroundColor: 'rgb(var(--first-quinary-rgb)/0.15)',
                    border: '1px dashed rgb(var(--first-quaternary-rgb)/0.4)',
                    opacity: 0.6,
                  }}
                >
                  <ShieldOff
                    className="h-4 w-4 flex-shrink-0"
                    style={{ color: 'var(--first-nonary)' }}
                  />
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: 'var(--first-octonary)' }}
                    >
                      Suspenduj nalog
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: 'var(--first-nonary)' }}
                    >
                      Ne možete suspendovati vlastiti nalog
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setSuspenzijaMod(true)}
                  disabled={jeSlanje}
                  className="flex w-full items-center gap-3 rounded-xl p-3.5 text-left transition-all hover:opacity-80 disabled:opacity-50"
                  style={{
                    backgroundColor: 'rgba(220,38,38,0.06)',
                    border: '1px solid rgba(220,38,38,0.15)',
                  }}
                >
                  <ShieldOff
                    className="h-4 w-4 flex-shrink-0"
                    style={{ color: '#DC2626' }}
                  />
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: '#DC2626' }}
                    >
                      Suspenduj nalog
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: 'var(--first-nonary)' }}
                    >
                      Blokira pristup sistemu
                    </p>
                  </div>
                </button>
              )}

              {/* Password reset - informational (no backend yet) */}
              <div
                className="flex w-full items-center gap-3 rounded-xl p-3.5 opacity-50"
                style={{
                  backgroundColor: 'rgb(var(--first-quinary-rgb)/0.15)',
                  border: '1px dashed rgb(var(--first-quaternary-rgb)/0.4)',
                }}
              >
                <KeyRound
                  className="h-4 w-4 flex-shrink-0"
                  style={{ color: 'var(--first-nonary)' }}
                />
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: 'var(--first-octonary)' }}
                  >
                    Resetuj lozinku
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: 'var(--first-nonary)' }}
                  >
                    Dostupno u narednoj verziji
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Historija aktivnosti */}
          <div className="rounded-2xl p-5" style={karticaStil}>
            <div className="mb-4 flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: 'rgb(var(--first-secondary-rgb)/0.1)',
                }}
              >
                <History
                  className="h-4 w-4"
                  style={{ color: 'var(--first-secondary)' }}
                />
              </div>
              <h2
                className="text-sm font-bold uppercase tracking-wide"
                style={{ color: 'var(--first-nonary)' }}
              >
                Historija aktivnosti
              </h2>
            </div>

            {/* Synthetic "Nalog kreiran" event always shown */}
            <div className="flex flex-col gap-0">
              {/* Audit log entries */}
              {aktivnosti.map((a, i) => {
                const cfg = AKCIJA_CFG[a.akcija] ?? {
                  oznaka: a.akcija,
                  boja: 'var(--first-nonary)',
                };
                const jePosljednji = i === aktivnosti.length - 1;
                return (
                  <div key={a.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className="h-2 w-2 flex-shrink-0 rounded-full mt-1.5"
                        style={{ backgroundColor: cfg.boja }}
                      />
                      {!jePosljednji && (
                        <div
                          className="mt-1 w-px flex-1 min-h-[20px]"
                          style={{
                            backgroundColor:
                              'rgb(var(--first-quaternary-rgb)/0.3)',
                          }}
                        />
                      )}
                    </div>
                    <div className="pb-4 min-w-0">
                      <p
                        className="text-xs font-semibold"
                        style={{ color: cfg.boja }}
                      >
                        {cfg.oznaka}
                      </p>
                      {a.razlog && (
                        <p
                          className="mt-0.5 text-xs"
                          style={{ color: 'var(--first-nonary)' }}
                        >
                          Razlog: {a.razlog}
                        </p>
                      )}
                      {!!a.detalji?.nova_uloga && (
                        <p
                          className="mt-0.5 text-xs"
                          style={{ color: 'var(--first-nonary)' }}
                        >
                          {String(a.detalji.stara_uloga ?? '')} →{' '}
                          {String(a.detalji.nova_uloga)}
                        </p>
                      )}
                      <p
                        className="mt-0.5 text-[11px] tabular-nums"
                        style={{ color: 'var(--first-nonary)' }}
                      >
                        {fmtDatumVrijeme(a.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Always show creation as the base event */}
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className="h-2 w-2 flex-shrink-0 rounded-full mt-1.5"
                    style={{ backgroundColor: 'var(--first-secondary)' }}
                  />
                </div>
                <div className="pb-1 min-w-0">
                  <p
                    className="text-xs font-semibold"
                    style={{ color: 'var(--first-secondary)' }}
                  >
                    Nalog kreiran
                  </p>
                  {korisnik.email_potvrden && (
                    <p
                      className="mt-0.5 text-xs"
                      style={{ color: 'var(--first-nonary)' }}
                    >
                      Email potvrđen
                    </p>
                  )}
                  <p
                    className="mt-0.5 text-[11px] tabular-nums"
                    style={{ color: 'var(--first-nonary)' }}
                  >
                    {fmtDatumVrijeme(korisnik.kreiran_at)}
                  </p>
                </div>
              </div>

              {aktivnosti.length === 0 && (
                <p
                  className="mt-2 text-xs text-center py-3"
                  style={{ color: 'var(--first-nonary)' }}
                >
                  Nema evidentiranih promjena.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
