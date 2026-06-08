'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Calendar,
  Clock,
  ClipboardCheck,
  CheckCircle2,
  Truck,
  UserX,
  FileText,
  History,
  RefreshCw,
  ChevronRight,
  AlertTriangle,
  Radio,
  Navigation,
  Shield,
  User,
  Headphones,
  Users,
  ClipboardList,
  Activity,
  Wrench,
  RotateCcw,
  X,
  Image as ImageIcon,
  ExternalLink,
  Trash2,
  Ban,
  XCircle,
  Lock,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { AlertMessage } from '@/components/ui/AlertMessage';
import { RutaKartica } from '@/components/serviser/RutaKartica';
import { NapomeneThread } from '@/components/shared/NapomeneThread';
import { ImageUploader } from '@/components/shared/ImageUploader';
import { HistorijaAktivnostiSekcija } from '@/components/serviser/HistorijaAktivnostiSekcija';
import { EvidencijaRadaModal } from '@/components/serviser/EvidencijaRadaModal';
import { RazlogOperativniModal } from '@/components/servisirane/RazlogOperativniModal';
import { PonovniCiklusBadge } from '@/components/servisirane/PonovniCiklusBadge';
import { IntervencijaChecklist } from '@/components/serviser/IntervencijaChecklist';
import type {
  ServisniZahtjev,
  WorkEvidence,
  InterventionActivity,
  StatusZahtjeva,
} from '@/domain/types/servisirane';
import { labelKategorije } from '@/lib/servisirane/kategorije';
import {
  prioritetBoja,
  statusBoja,
  statusOznaka,
} from '@/lib/servisirane/statusBoja';
import { fmtSat, fmtDatumKratki } from '@/lib/format/datumi';

type SlikaIntervencije = { id: number; image_url: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDatum(iso: string): string {
  return new Date(iso).toLocaleDateString('bs-BA', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}
const fmtKratki = fmtDatumKratki;

function trajanjeOznaka(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60),
    m = min % 60;
  return m ? `${h}h ${m}min` : `${h}h`;
}
function jeKasni(z: IntervencijaDetalji): boolean {
  if (!z.termin_planirani_pocetak) return false;
  if (['zavrseno', 'otkazano', 'odbijeno'].includes(z.status)) return false;
  return new Date(z.termin_planirani_pocetak) < new Date();
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface IntervencijaDetalji extends ServisniZahtjev {
  podnosilac: {
    ime: string;
    prezime: string;
    broj_telefona: string | null;
  } | null;
}

// ─── Real-time tracker ────────────────────────────────────────────────────────

const TRACKER_KORACI = [
  { kljuc: 'dodijeljeno', naziv: 'Dodijeljeno', Ikona: ClipboardList },
  { kljuc: 'u_radu', naziv: 'Na putu', Ikona: Truck },
  { kljuc: 'u_izvrsenju', naziv: 'Na terenu', Ikona: MapPin },
  { kljuc: 'zavrseno', naziv: 'Završeno', Ikona: CheckCircle2 },
] as const;

const REDOSLIJED = ['dodijeljeno', 'u_radu', 'u_izvrsenju', 'zavrseno'];

function ServiserTracker({
  status,
  aktivnosti,
  terminPocetak,
}: {
  status: string;
  aktivnosti: InterventionActivity[];
  terminPocetak?: string | null;
}) {
  const aktivniIdx = REDOSLIJED.indexOf(status);
  const jeAktivna = ['u_radu', 'u_izvrsenju'].includes(status);

  function vrijemeKoraka(kljuc: string): string | null {
    if (kljuc === 'dodijeljeno' && terminPocetak) return fmtSat(terminPocetak);
    const a = aktivnosti.find(
      (x) =>
        (x.tip === 'status_promjena' || x.tip === 'dodjela') &&
        typeof x.metadata === 'object' &&
        x.metadata !== null &&
        (x.metadata as Record<string, string>).u === kljuc,
    );
    return a ? fmtSat(a.created_at) : null;
  }

  return (
    <div
      className="rounded-2xl px-5 py-4"
      style={{
        backgroundColor: 'rgb(255 255 255/0.85)',
        border: '1px solid rgb(var(--first-quaternary-rgb)/0.28)',
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity
            className="h-4 w-4"
            style={{ color: 'var(--first-secondary)' }}
          />
          <span
            className="text-xs font-bold uppercase tracking-wide"
            style={{ color: 'var(--first-nonary)' }}
          >
            Tok intervencije
          </span>
        </div>
        {jeAktivna && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
            style={{
              backgroundColor: 'rgb(var(--first-secondary-rgb)/0.1)',
              color: 'var(--first-secondary)',
              border: '1px solid rgb(var(--first-secondary-rgb)/0.2)',
            }}
          >
            <Radio className="h-3 w-3 animate-pulse" />
            LIVE
          </span>
        )}
      </div>

      <div className="flex items-start">
        {TRACKER_KORACI.map((korak, i) => {
          const done = aktivniIdx > i;
          const active = aktivniIdx === i;
          const future = aktivniIdx < i;
          const last = i === TRACKER_KORACI.length - 1;
          const Ikona = korak.Ikona;
          const sat = vrijemeKoraka(korak.kljuc);

          return (
            <div
              key={korak.kljuc}
              className="flex flex-1 flex-col items-center"
            >
              <div className="flex w-full items-center">
                {i > 0 && (
                  <div
                    className="h-0.5 flex-1 transition-colors duration-500"
                    style={{
                      backgroundColor:
                        done || active
                          ? 'var(--first-secondary)'
                          : 'rgb(var(--first-quaternary-rgb)/0.28)',
                    }}
                  />
                )}
                <div
                  className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: done
                      ? 'var(--first-secondary)'
                      : active
                        ? 'var(--first-primary)'
                        : 'rgb(var(--first-quaternary-rgb)/0.35)',
                    boxShadow: active
                      ? '0 0 0 4px rgb(var(--first-primary-rgb)/0.18)'
                      : 'none',
                  }}
                >
                  {done ? (
                    <CheckCircle2
                      className="h-4.5 w-4.5 text-white"
                      strokeWidth={2.5}
                      style={{ width: '1.125rem', height: '1.125rem' }}
                    />
                  ) : (
                    <Ikona
                      className="h-4 w-4"
                      style={{
                        color: done || active ? '#fff' : 'var(--first-nonary)',
                      }}
                    />
                  )}
                  {active && (
                    <span
                      className="absolute inset-0 rounded-full animate-ping"
                      style={{
                        backgroundColor: 'var(--first-primary)',
                        opacity: 0.15,
                      }}
                    />
                  )}
                </div>
                {!last && (
                  <div
                    className="h-0.5 flex-1 transition-colors duration-500"
                    style={{
                      backgroundColor: done
                        ? 'var(--first-secondary)'
                        : 'rgb(var(--first-quaternary-rgb)/0.28)',
                    }}
                  />
                )}
              </div>
              <div className="mt-2 flex flex-col items-center gap-0.5 text-center px-1">
                <span
                  className="text-[11px] font-bold leading-tight"
                  style={{
                    color: active
                      ? 'var(--first-primary)'
                      : done
                        ? 'var(--first-secondary)'
                        : 'var(--first-nonary)',
                    opacity: future ? 0.5 : 1,
                  }}
                >
                  {korak.naziv}
                </span>
                {sat && (
                  <span
                    className="text-[10px] tabular-nums"
                    style={{ color: 'var(--first-nonary)' }}
                  >
                    {sat}
                  </span>
                )}
                {active && (
                  <span
                    className="mt-0.5 rounded-full px-1.5 py-px text-[9px] font-bold"
                    style={{
                      backgroundColor: 'rgb(var(--first-primary-rgb)/0.1)',
                      color: 'var(--first-primary)',
                    }}
                  >
                    Trenutno
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Termin vizual ────────────────────────────────────────────────────────────

function TerminVizual({ zahtjev }: { zahtjev: IntervencijaDetalji }) {
  const kasni = jeKasni(zahtjev);
  if (!zahtjev.termin_planirani_pocetak) return null;

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        backgroundColor: kasni
          ? 'rgba(220,38,38,0.03)'
          : 'rgb(255 255 255/0.85)',
        border: kasni
          ? '1px solid rgba(220,38,38,0.2)'
          : '1px solid rgb(var(--first-quaternary-rgb)/0.28)',
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar
            className="h-3.5 w-3.5"
            style={{ color: 'var(--first-secondary)' }}
          />
          <p
            className="text-[10px] font-bold uppercase tracking-wide"
            style={{ color: 'var(--first-nonary)' }}
          >
            Termin
          </p>
        </div>
        {kasni && (
          <span
            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{
              backgroundColor: 'rgba(220,38,38,0.1)',
              color: '#DC2626',
              border: '1px solid rgba(220,38,38,0.2)',
            }}
          >
            <AlertTriangle className="h-2.5 w-2.5" />
            Kasni
          </span>
        )}
      </div>

      {/* Datum */}
      <p
        className="text-sm font-bold capitalize mb-2"
        style={{ color: 'var(--first-octonary)' }}
      >
        {fmtDatum(zahtjev.termin_planirani_pocetak)}
      </p>

      {/* Timeline bar */}
      <div className="flex items-center gap-2">
        <span
          className="text-sm font-black tabular-nums"
          style={{ color: 'var(--first-primary)' }}
        >
          {fmtSat(zahtjev.termin_planirani_pocetak)}
        </span>
        <div className="relative flex-1 flex items-center">
          <div
            className="h-1.5 w-full overflow-hidden rounded-full"
            style={{ backgroundColor: 'rgb(var(--first-quaternary-rgb)/0.25)' }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: kasni ? '100%' : '60%',
                backgroundColor: kasni ? '#DC2626' : 'var(--first-secondary)',
              }}
            />
          </div>
        </div>
        {zahtjev.termin_planirani_kraj && (
          <span
            className="text-sm font-black tabular-nums"
            style={{ color: 'var(--first-primary)' }}
          >
            {fmtSat(zahtjev.termin_planirani_kraj)}
          </span>
        )}
      </div>

      {zahtjev.procijenjeno_trajanje && (
        <div className="mt-2 flex items-center gap-1.5">
          <Clock className="h-3 w-3" style={{ color: 'var(--first-nonary)' }} />
          <span className="text-xs" style={{ color: 'var(--first-nonary)' }}>
            {trajanjeOznaka(zahtjev.procijenjeno_trajanje)} procijenjeno
          </span>
        </div>
      )}
    </div>
  );
}

type ServiserAkcijaOdgovor = {
  novi_status?: StatusZahtjeva;
  broj_ponovnih_ciklusa?: number;
};

async function patchServiserAkcija(
  zahtjevId: number,
  action: string,
  razlog: string,
): Promise<ServiserAkcijaOdgovor> {
  const r = await fetch(`/api/serviser/intervencije/${zahtjevId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, razlog }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error ?? 'Greška.');
  return d as ServiserAkcijaOdgovor;
}

// ─── Akcije servisera ─────────────────────────────────────────────────────────

function AkcijeServiser({
  status,
  zahtjevId,
  onRefresh,
  onEvidencija,
  imaEvidenciju,
  onVratiNaDodjelu,
  onOznaciNijeRijesen,
  checklistSveIspunjeno,
  onEvidencijaBlokirana,
}: {
  status: string;
  zahtjevId: number;
  onRefresh: () => void;
  onEvidencija: () => void;
  imaEvidenciju: boolean;
  onVratiNaDodjelu: () => void;
  checklistSveIspunjeno?: boolean;
  onEvidencijaBlokirana?: () => void;
  onOznaciNijeRijesen: () => void;
}) {
  const [showOdbij, setShowOdbij] = useState(false);
  const [razlog, setRazlog] = useState('');
  const [jeSlanje, setJeSlanje] = useState(false);
  const [greska, setGreska] = useState<string | null>(null);

  async function akcija(
    action: 'prihvati' | 'pocni' | 'zavrsi',
    razlogOdbijanja?: string,
  ) {
    setJeSlanje(true);
    setGreska(null);
    try {
      const body: Record<string, string> = { action };
      if (razlogOdbijanja) body.razlog = razlogOdbijanja;
      const r = await fetch(`/api/serviser/intervencije/${zahtjevId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Greška.');
      onRefresh();
    } catch (e) {
      setGreska(e instanceof Error ? e.message : 'Greška.');
    } finally {
      setJeSlanje(false);
    }
  }

  async function odbijSaRazlogom() {
    if (razlog.trim().length < 10) {
      setGreska('Razlog mora imati najmanje 10 karaktera.');
      return;
    }
    setJeSlanje(true);
    setGreska(null);
    try {
      const r = await fetch(`/api/serviser/intervencije/${zahtjevId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'odbij', razlog: razlog.trim() }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Greška.');
      onRefresh();
    } catch (e) {
      setGreska(e instanceof Error ? e.message : 'Greška.');
    } finally {
      setJeSlanje(false);
    }
  }

  if (status === 'dodijeljeno') {
    if (showOdbij) {
      return (
        <div
          className="rounded-2xl p-5"
          style={{
            backgroundColor: 'rgba(220,38,38,0.03)',
            border: '1px solid rgba(220,38,38,0.18)',
          }}
        >
          <div className="mb-3 flex items-center gap-2">
            <UserX className="h-4 w-4" style={{ color: '#DC2626' }} />
            <p className="text-sm font-bold" style={{ color: '#DC2626' }}>
              Odbijanje zadatka
            </p>
          </div>
          {greska && (
            <p
              className="mb-2 text-xs font-medium"
              style={{ color: '#DC2626' }}
            >
              {greska}
            </p>
          )}
          <textarea
            rows={3}
            value={razlog}
            onChange={(e) => setRazlog(e.target.value)}
            placeholder="Objasnite zašto odbijate ovaj zadatak (min. 10 karaktera)..."
            className="mb-3 w-full resize-none rounded-xl border px-4 py-2.5 text-sm focus:outline-none"
            style={{
              borderColor: 'rgba(220,38,38,0.3)',
              color: 'var(--first-octonary)',
              backgroundColor: 'rgb(255 255 255/0.9)',
            }}
          />
          <div className="flex gap-2">
            <Button
              variant="danger"
              size="md"
              onClick={odbijSaRazlogom}
              isLoading={jeSlanje}
              loadingText="Odbijanje..."
            >
              <UserX className="h-4 w-4" />
              Potvrdi odbijanje
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={() => {
                setShowOdbij(false);
                setGreska(null);
              }}
              disabled={jeSlanje}
            >
              Odustani
            </Button>
          </div>
        </div>
      );
    }
    return (
      <div
        className="rounded-2xl p-5"
        style={{
          backgroundColor: 'rgba(217,119,6,0.04)',
          border: '1px solid rgba(217,119,6,0.2)',
        }}
      >
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" style={{ color: '#D97706' }} />
          <p className="text-sm font-bold" style={{ color: '#D97706' }}>
            Čeka vaše prihvatanje
          </p>
        </div>
        {greska && (
          <p className="mb-3 text-xs" style={{ color: '#DC2626' }}>
            {greska}
          </p>
        )}
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => akcija('prihvati')}
            disabled={jeSlanje}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: 'var(--first-primary)', color: '#fff' }}
          >
            <CheckCircle2 className="h-4 w-4" />
            {jeSlanje ? 'Prihvatanje...' : 'Prihvati zadatak'}
          </button>
          <button
            type="button"
            onClick={() => setShowOdbij(true)}
            disabled={jeSlanje}
            className="flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold transition-all hover:opacity-80 sm:flex-none"
            style={{
              backgroundColor: 'rgba(220,38,38,0.08)',
              color: '#DC2626',
              border: '1px solid rgba(220,38,38,0.2)',
            }}
          >
            <UserX className="h-4 w-4" />
            Odbij
          </button>
        </div>
        <button
          type="button"
          onClick={onVratiNaDodjelu}
          disabled={jeSlanje}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-80"
          style={{
            backgroundColor: 'rgba(217,119,6,0.06)',
            color: '#D97706',
            border: '1px solid rgba(217,119,6,0.2)',
          }}
        >
          <RotateCcw className="h-4 w-4" />
          Vrati na ponovnu dodjelu
        </button>
      </div>
    );
  }

  if (status === 'u_radu') {
    return (
      <div
        className="rounded-2xl p-5"
        style={{
          backgroundColor: 'rgb(var(--first-secondary-rgb)/0.05)',
          border: '1px solid rgb(var(--first-secondary-rgb)/0.2)',
        }}
      >
        <div className="mb-4 flex items-center gap-2">
          <Truck
            className="h-4 w-4"
            style={{ color: 'var(--first-secondary)' }}
          />
          <p
            className="text-sm font-bold"
            style={{ color: 'var(--first-secondary)' }}
          >
            Prihvaćeno - na putu ste
          </p>
        </div>
        {greska && (
          <p className="mb-3 text-xs" style={{ color: '#DC2626' }}>
            {greska}
          </p>
        )}
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => akcija('pocni')}
            disabled={jeSlanje}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: 'var(--first-primary)', color: '#fff' }}
          >
            <MapPin className="h-4 w-4" />
            {jeSlanje ? 'Ažuriranje...' : 'Stigao sam - počni intervenciju'}
          </button>
          <button
            type="button"
            onClick={onEvidencija}
            className="flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold transition-all hover:opacity-80 sm:flex-none"
            style={{
              backgroundColor: 'rgb(var(--first-secondary-rgb)/0.1)',
              color: 'var(--first-secondary)',
              border: '1px solid rgb(var(--first-secondary-rgb)/0.2)',
            }}
          >
            <ClipboardCheck className="h-4 w-4" />
            Evidentiraj
          </button>
        </div>
        <button
          type="button"
          onClick={onVratiNaDodjelu}
          disabled={jeSlanje}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-80"
          style={{
            backgroundColor: 'rgba(217,119,6,0.06)',
            color: '#D97706',
            border: '1px solid rgba(217,119,6,0.2)',
          }}
        >
          <RotateCcw className="h-4 w-4" />
          Vrati na ponovnu dodjelu
        </button>
      </div>
    );
  }

  if (status === 'u_izvrsenju') {
    const checklistBlokira = checklistSveIspunjeno === false;
    return (
      <div
        className="rounded-2xl p-5"
        style={{
          backgroundColor: 'rgb(var(--first-secondary-rgb)/0.05)',
          border: '1px solid rgb(var(--first-secondary-rgb)/0.2)',
        }}
      >
        <div className="mb-4 flex items-center gap-2">
          <MapPin
            className="h-4 w-4"
            style={{ color: 'var(--first-secondary)' }}
          />
          <p
            className="text-sm font-bold"
            style={{ color: 'var(--first-secondary)' }}
          >
            Na terenu - intervencija u toku
          </p>
        </div>
        {greska && (
          <p className="mb-3 text-xs font-medium" style={{ color: '#DC2626' }}>
            {greska}
          </p>
        )}
        <button
          type="button"
          onClick={() => {
            if (checklistBlokira) {
              onEvidencijaBlokirana?.();
              return;
            }
            onEvidencija();
          }}
          disabled={jeSlanje}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all hover:opacity-90 disabled:opacity-60"
          style={{
            backgroundColor: checklistBlokira
              ? 'rgba(100,116,139,0.12)'
              : 'var(--first-primary)',
            color: checklistBlokira ? 'var(--first-nonary)' : '#fff',
            border: checklistBlokira
              ? '1px dashed rgba(100,116,139,0.4)'
              : 'none',
            cursor: checklistBlokira ? 'not-allowed' : 'pointer',
          }}
        >
          <ClipboardCheck className="h-5 w-5" />
          {imaEvidenciju ? 'Dodaj još evidencije' : 'Evidentiraj rad'}
          {checklistBlokira && (
            <span className="ml-1 text-[11px] font-semibold opacity-70">
              (ispuni listu)
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={onOznaciNijeRijesen}
          disabled={jeSlanje}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-80"
          style={{
            backgroundColor: 'rgba(220,38,38,0.06)',
            color: '#DC2626',
            border: '1px solid rgba(220,38,38,0.18)',
          }}
        >
          <AlertTriangle className="h-4 w-4" />
          Nije riješeno
        </button>
      </div>
    );
  }

  return null;
}

// ─── Kartica završene intervencije ────────────────────────────────────────────

function KarticaZavrseneIntervencije({
  status,
  zahtjev,
}: {
  status: string;
  zahtjev: IntervencijaDetalji;
}) {
  if (status === 'zavrseno') {
    return (
      <div
        className="rounded-2xl p-5"
        style={{
          backgroundColor: 'rgba(34,197,94,0.05)',
          border: '1px solid rgba(34,197,94,0.25)',
        }}
      >
        <div className="mb-3 flex items-center gap-2">
          <CheckCircle2
            className="h-5 w-5 flex-shrink-0"
            style={{ color: '#16A34A' }}
          />
          <p className="text-sm font-bold" style={{ color: '#16A34A' }}>
            Rad završen — čeka zatvaranje dispečera
          </p>
        </div>
        <p
          className="text-sm leading-relaxed"
          style={{ color: 'var(--first-nonary)' }}
        >
          Intervencija je evidentirana i označena kao završena. Dispečer će
          pregledati evidenciju rada i formalno zatvoriti nalog.
        </p>
      </div>
    );
  }

  if (status === 'zatvoreno') {
    return (
      <div
        className="rounded-2xl p-5"
        style={{
          backgroundColor: 'rgb(var(--first-quinary-rgb)/0.3)',
          border: '1px solid rgb(var(--first-quaternary-rgb)/0.35)',
        }}
      >
        <div className="mb-3 flex items-center gap-2">
          <Lock
            className="h-4 w-4 flex-shrink-0"
            style={{ color: 'var(--first-secondary)' }}
          />
          <p
            className="text-sm font-bold"
            style={{ color: 'var(--first-secondary)' }}
          >
            Intervencija formalno zatvorena
          </p>
        </div>
        {(zahtjev as any).closed_at && (
          <p
            className="mb-1.5 text-xs"
            style={{ color: 'var(--first-nonary)' }}
          >
            Zatvorena:{' '}
            {new Date((zahtjev as any).closed_at).toLocaleDateString('bs-BA', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        )}
        {(zahtjev as any).closure_note && (
          <p
            className="mt-2 rounded-xl border-l-4 py-2 pl-3 pr-4 text-sm leading-relaxed"
            style={{
              borderLeftColor: 'var(--first-secondary)',
              backgroundColor: 'rgb(255 255 255/0.6)',
              color: 'var(--first-octonary)',
            }}
          >
            {(zahtjev as any).closure_note}
          </p>
        )}
      </div>
    );
  }

  if (status === 'otkazano') {
    return (
      <div
        className="rounded-2xl p-5"
        style={{
          backgroundColor: 'rgba(100,116,139,0.05)',
          border: '1px solid rgba(100,116,139,0.25)',
        }}
      >
        <div className="mb-3 flex items-center gap-2">
          <Ban className="h-4 w-4 flex-shrink-0" style={{ color: '#64748B' }} />
          <p className="text-sm font-bold" style={{ color: '#64748B' }}>
            Zahtjev otkazan
          </p>
        </div>
        {(zahtjev as any).cancel_reason ? (
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--first-nonary)' }}
          >
            Razlog: {(zahtjev as any).cancel_reason}
          </p>
        ) : (
          <p className="text-sm" style={{ color: 'var(--first-nonary)' }}>
            Korisnik je otkazao zahtjev.
          </p>
        )}
      </div>
    );
  }

  if (status === 'odbijeno') {
    return (
      <div
        className="rounded-2xl p-5"
        style={{
          backgroundColor: 'rgba(220,38,38,0.04)',
          border: '1px solid rgba(220,38,38,0.2)',
        }}
      >
        <div className="mb-3 flex items-center gap-2">
          <XCircle
            className="h-4 w-4 flex-shrink-0"
            style={{ color: '#DC2626' }}
          />
          <p className="text-sm font-bold" style={{ color: '#DC2626' }}>
            Zahtjev odbijen
          </p>
        </div>
        <p
          className="text-sm leading-relaxed"
          style={{ color: 'var(--first-nonary)' }}
        >
          Dispečer je odbio ovaj zahtjev.
          {(zahtjev as any).dispecer_napomene &&
            ` Napomena: ${(zahtjev as any).dispecer_napomene}`}
        </p>
      </div>
    );
  }

  return null;
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function SidebarPanel({
  zahtjev,
  tim,
  baznaLat,
  baznaLng,
}: {
  zahtjev: IntervencijaDetalji;
  tim: Array<{
    serviser_id: string;
    serviser?: { ime: string; prezime: string } | null;
  }>;
  baznaLat: number | null;
  baznaLng: number | null;
}) {
  const tel = zahtjev.podnosilac?.broj_telefona ?? zahtjev.contact_phone;

  const kartica = {
    backgroundColor: 'rgb(255 255 255/0.85)',
    border: '1px solid rgb(var(--first-quaternary-rgb)/0.28)',
  };

  return (
    <div className="flex flex-col gap-4 lg:w-80 xl:w-88 flex-shrink-0 lg:sticky lg:top-4">
      {/* US-51: Ruta od bazne lokacije servisera do intervencije */}
      <RutaKartica
        baznaLat={baznaLat}
        baznaLng={baznaLng}
        intervencijaLat={zahtjev.latitude}
        intervencijaLng={zahtjev.longitude}
        adresaIntervencije={zahtjev.address}
      />

      {/* Termin */}
      <TerminVizual zahtjev={zahtjev} />

      {/* Korisnik */}
      {zahtjev.podnosilac && (
        <div className="rounded-2xl p-4" style={kartica}>
          <p
            className="mb-3 text-[10px] font-bold uppercase tracking-wide"
            style={{ color: 'var(--first-nonary)' }}
          >
            Podnosilac
          </p>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: 'rgb(var(--first-quinary-rgb)/0.5)' }}
            >
              <User
                className="h-4 w-4"
                style={{ color: 'var(--first-nonary)' }}
              />
            </div>
            <div>
              <p
                className="text-sm font-bold"
                style={{ color: 'var(--first-octonary)' }}
              >
                {zahtjev.podnosilac.ime} {zahtjev.podnosilac.prezime}
              </p>
              {zahtjev.is_premium ? (
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3" style={{ color: '#DC2626' }} />
                  <span
                    className="text-[11px] font-bold"
                    style={{ color: '#DC2626' }}
                  >
                    Premium korisnik
                  </span>
                </div>
              ) : (
                <p
                  className="text-[11px]"
                  style={{ color: 'var(--first-nonary)' }}
                >
                  Korisnik
                </p>
              )}
            </div>
          </div>
          {tel && (
            <a
              href={`tel:${tel}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-80"
              style={{
                backgroundColor: 'rgb(var(--first-secondary-rgb)/0.1)',
                color: 'var(--first-secondary)',
                border: '1px solid rgb(var(--first-secondary-rgb)/0.2)',
              }}
            >
              <Phone className="h-4 w-4" />
              {tel}
            </a>
          )}
        </div>
      )}

      {/* Tim - pomoćni serviseri */}
      {tim.length > 0 && (
        <div className="rounded-2xl p-4" style={kartica}>
          <div className="mb-3 flex items-center gap-2">
            <Users
              className="h-3.5 w-3.5"
              style={{ color: 'var(--first-secondary)' }}
            />
            <p
              className="text-[10px] font-bold uppercase tracking-wide"
              style={{ color: 'var(--first-nonary)' }}
            >
              Pomoćni serviseri ({tim.length})
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {tim.map((c) => (
              <div key={c.serviser_id} className="flex items-center gap-2">
                <div
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: 'rgb(var(--first-secondary-rgb)/0.1)',
                  }}
                >
                  <Wrench
                    className="h-3.5 w-3.5"
                    style={{ color: 'var(--first-secondary)' }}
                  />
                </div>
                <p
                  className="text-sm font-medium"
                  style={{ color: 'var(--first-octonary)' }}
                >
                  {c.serviser
                    ? `${c.serviser.ime} ${c.serviser.prezime}`
                    : 'Serviser'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Brze akcije — poziv korisniku */}
      {tel && (
        <div className="rounded-2xl p-4" style={kartica}>
          <p
            className="mb-3 text-[10px] font-bold uppercase tracking-wide"
            style={{ color: 'var(--first-nonary)' }}
          >
            Brze akcije
          </p>
          <a
            href={`tel:${tel}`}
            className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-80"
            style={{
              backgroundColor: 'rgb(var(--first-secondary-rgb)/0.08)',
              color: 'var(--first-secondary)',
              border: '1px solid rgb(var(--first-secondary-rgb)/0.2)',
            }}
          >
            <Phone className="h-4 w-4" />
            Pozovi korisnika
          </a>
        </div>
      )}
    </div>
  );
}

// ─── Stranica ─────────────────────────────────────────────────────────────────

export default function ServiserIntervencijaDetaljiPage() {
  const { id } = useParams<{ id: string }>();

  const [zahtjev, setZahtjev] = useState<IntervencijaDetalji | null>(null);
  const [evidencije, setEvidencije] = useState<WorkEvidence[]>([]);
  const [aktivnosti, setAktivnosti] = useState<InterventionActivity[]>([]);
  const [tim, setTim] = useState<
    Array<{
      serviser_id: string;
      serviser?: { ime: string; prezime: string } | null;
    }>
  >([]);
  const [slike, setSlike] = useState<SlikaIntervencije[]>([]);
  const [brisanjeSlikaId, setBrisanjeSlikaId] = useState<number | null>(null);
  const [ucitava, setUcitava] = useState(true);
  const [greska, setGreska] = useState<string | null>(null);
  const [samoCitanje, setSamoCitanje] = useState(false);
  // US-51: bazna lokacija servisera za rutu
  const [baznaLat, setBaznaLat] = useState<number | null>(null);
  const [baznaLng, setBaznaLng] = useState<number | null>(null);
  const [nivoPristupa, setNivoPristupa] = useState<
    'glavni' | 'pomocni' | 'arhiva'
  >('glavni');
  const [pokaziEvid, setPokaziEvid] = useState(false);
  const [pokaziUspjeh, setPokaziUspjeh] = useState(false);
  const [uspjehPoruka, setUspjehPoruka] = useState<string | null>(null);
  const [pokaziVratiNaDodjelu, setPokaziVratiNaDodjelu] = useState(false);
  const [pokaziNijeRijesen, setPokaziNijeRijesen] = useState(false);
  const [scrollToZavrsi, setScrollToZavrsi] = useState(false);
  const zavrsiRef = useRef<HTMLDivElement>(null);
  // Kontrolna lista
  const [checklistOznaceni, setChecklistOznaceni] = useState<boolean[]>(
    Array(6).fill(false),
  );
  const [checklistHighlight, setChecklistHighlight] = useState(false);
  const checklistRef = useRef<HTMLDivElement>(null);
  const checklistStorageKey = `serviser-checklist-${id}`;

  async function ucitaj(opts?: { silent?: boolean }) {
    if (!opts?.silent) setUcitava(true);
    setGreska(null);
    try {
      const [intR, timR, slikeR, profilR] = await Promise.all([
        fetch(`/api/serviser/intervencije/${id}`, { cache: 'no-store' }),
        fetch(`/api/dispecer/zahtjevi/${id}/tim`, { cache: 'no-store' }),
        fetch(`/api/slike?zahtjev_id=${id}`, { cache: 'no-store' }),
        fetch('/api/profil', { cache: 'no-store' }),
      ]);
      const intD = await intR.json();
      if (!intR.ok) throw new Error(intD.error ?? 'Zahtjev nije pronađen.');
      setZahtjev(intD.zahtjev);
      setEvidencije(intD.evidencije ?? []);
      setAktivnosti(intD.aktivnosti ?? []);
      setSamoCitanje(Boolean(intD.pristup?.samo_citanje));
      setNivoPristupa(intD.pristup?.nivo ?? 'glavni');
      if (timR.ok) {
        const timD = await timR.json();
        setTim(timD.tim ?? []);
      }
      if (slikeR.ok) {
        const slikeD = await slikeR.json();
        setSlike(
          (slikeD.slike ?? []).map((s: { id: number; image_url: string }) => ({
            id: s.id,
            image_url: s.image_url,
          })),
        );
      }
      // US-51: dohvati baznu lokaciju servisera
      if (profilR.ok) {
        const profilD = await profilR.json();
        setBaznaLat(profilD.profil?.bazna_latitude ?? null);
        setBaznaLng(profilD.profil?.bazna_longitude ?? null);
      }
    } catch (e) {
      setGreska(e instanceof Error ? e.message : 'Greška pri učitavanju.');
    } finally {
      setUcitava(false);
    }
  }

  function dodajSliku(slika: SlikaIntervencije) {
    setSlike((prev) =>
      prev.some((s) => s.id === slika.id) ? prev : [...prev, slika],
    );
  }

  async function obrisiSliku(slikaId: number) {
    setBrisanjeSlikaId(slikaId);
    try {
      const r = await fetch(`/api/slike?id=${slikaId}`, { method: 'DELETE' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Greška pri brisanju slike.');
      setSlike((prev) => prev.filter((s) => s.id !== slikaId));
    } catch (e) {
      setGreska(e instanceof Error ? e.message : 'Greška pri brisanju slike.');
    } finally {
      setBrisanjeSlikaId(null);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    ucitaj();
  }, [id]);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(checklistStorageKey);
      if (!saved) return;
      const parsed = JSON.parse(saved) as unknown;
      if (
        Array.isArray(parsed) &&
        parsed.length === 6 &&
        parsed.every((v) => typeof v === 'boolean')
      ) {
        setChecklistOznaceni(parsed);
      }
    } catch {
      /* ignorisi neispravan cache */
    }
  }, [checklistStorageKey]);

  useEffect(() => {
    try {
      sessionStorage.setItem(
        checklistStorageKey,
        JSON.stringify(checklistOznaceni),
      );
    } catch {
      /* quota / privatni mod */
    }
  }, [checklistOznaceni, checklistStorageKey]);

  useEffect(() => {
    if (
      scrollToZavrsi &&
      !ucitava &&
      evidencije.length > 0 &&
      zavrsiRef.current
    ) {
      setScrollToZavrsi(false);
      setTimeout(
        () =>
          zavrsiRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          }),
        80,
      );
    }
  }, [scrollToZavrsi, ucitava, evidencije.length]);

  if (ucitava && !pokaziEvid && !pokaziUspjeh) {
    return (
      <AppShell uloga="serviser">
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div
              className="h-8 w-8 animate-spin rounded-full border-2 border-transparent"
              style={{ borderTopColor: 'var(--first-secondary)' }}
            />
            <p className="text-sm" style={{ color: 'var(--first-nonary)' }}>
              Učitavanje intervencije...
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (greska || !zahtjev) {
    return (
      <AppShell uloga="serviser">
        <AlertMessage
          variant="error"
          message={greska ?? 'Intervencija nije pronađena.'}
        />
        <Link href="/serviser/intervencije">
          <Button variant="secondary" size="md" className="mt-4">
            <ArrowLeft className="h-4 w-4" />
            Nazad
          </Button>
        </Link>
      </AppShell>
    );
  }

  const kat = labelKategorije(zahtjev);
  const naslov = kat.podkategorija ? `${kat.podkategorija}` : kat.glavna;
  const pboja = prioritetBoja(zahtjev.final_priority);
  const kasni = jeKasni(zahtjev);
  const jeAktivna = ['dodijeljeno', 'u_radu', 'u_izvrsenju'].includes(
    zahtjev.status,
  );
  const jeTerminalni = [
    'zavrseno',
    'zatvoreno',
    'otkazano',
    'odbijeno',
  ].includes(zahtjev.status);
  const mozeMijenjati = jeAktivna && !samoCitanje;

  const sboja = statusBoja(zahtjev.status);

  return (
    <AppShell uloga="serviser">
      {/* ─── Breadcrumb ─────────────────────────────────────────────────────── */}
      <div className="mb-4 flex items-center justify-between">
        <div
          className="flex items-center gap-1.5 text-sm"
          style={{ color: 'var(--first-nonary)' }}
        >
          <Link
            href="/serviser/intervencije"
            className="flex items-center gap-1 rounded-lg px-2 py-1 transition-all hover:bg-black/[0.04]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Zadaci
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span
            className="font-semibold"
            style={{ color: 'var(--first-octonary)' }}
          >
            #{id}
          </span>
        </div>
        <button
          type="button"
          onClick={() => void ucitaj()}
          aria-label="Osvježi intervenciju"
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:bg-black/[0.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-celestial-teal/40"
        >
          <RefreshCw
            className="h-4 w-4"
            style={{ color: 'var(--first-nonary)' }}
          />
        </button>
      </div>

      {/* ─── Success banner ─────────────────────────────────────────────────── */}
      {samoCitanje && (
        <div className="mb-4">
          <AlertMessage
            variant="info"
            message={
              nivoPristupa === 'pomocni'
                ? 'Pregledate intervenciju kao pomoćni član tima — izmjene nisu dozvoljene.'
                : nivoPristupa === 'arhiva'
                  ? 'Pregled arhive — intervencija je završena; prikazani su podaci s vašeg rada.'
                  : 'Samo pregled — intervencija više nije dodijeljena vama.'
            }
          />
        </div>
      )}

      {pokaziUspjeh && (
        <div
          className="mb-4 flex items-center gap-3 rounded-2xl px-5 py-3.5"
          style={{
            backgroundColor: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.25)',
          }}
        >
          <svg
            className="h-5 w-5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{ color: '#16A34A' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <p className="text-sm font-semibold" style={{ color: '#16A34A' }}>
            {uspjehPoruka ?? 'Evidencija rada je uspješno sačuvana.'}
          </p>
        </div>
      )}

      {/* ─── HERO KARTICA ───────────────────────────────────────────────────── */}
      <div
        className="mb-5 overflow-hidden rounded-2xl"
        style={{
          backgroundColor: 'rgb(255 255 255/0.9)',
          border: '1px solid rgb(var(--first-quaternary-rgb)/0.28)',
          borderLeftWidth: '5px',
          borderLeftColor: zahtjev.is_premium ? '#DC2626' : pboja,
        }}
      >
        <div className="px-5 py-4">
          {/* Badges */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span
              className="rounded-md px-2 py-0.5 text-[11px] font-bold tabular-nums"
              style={{
                backgroundColor: 'rgb(var(--first-quaternary-rgb)/0.22)',
                color: 'var(--first-nonary)',
              }}
            >
              #{zahtjev.id}
            </span>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold"
              style={{
                backgroundColor: `${sboja}14`
                  .replace(
                    'var(--first-secondary)',
                    'rgb(var(--first-secondary-rgb)',
                  )
                  .replace(')', '/0.08)'),
                color: sboja,
                border: `1.5px solid ${sboja}28`.replace(
                  'var(--first-secondary)',
                  'rgb(var(--first-secondary-rgb)/0.2)',
                ),
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: sboja }}
              />
              {statusOznaka(zahtjev.status)}
            </span>
            {zahtjev.final_priority && (
              <span
                className="rounded-full px-2.5 py-1 text-xs font-bold"
                style={{
                  backgroundColor: `${pboja}12`,
                  color: pboja,
                  border: `1px solid ${pboja}28`,
                }}
              >
                {zahtjev.final_priority}
              </span>
            )}
            {zahtjev.is_premium && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold"
                style={{
                  backgroundColor: 'rgba(220,38,38,0.08)',
                  color: '#DC2626',
                  border: '1px solid rgba(220,38,38,0.2)',
                }}
              >
                Premium
              </span>
            )}
            {kasni && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold"
                style={{
                  backgroundColor: 'rgba(220,38,38,0.08)',
                  color: '#DC2626',
                  border: '1px solid rgba(220,38,38,0.2)',
                }}
              >
                <AlertTriangle className="h-3 w-3" />
                Kasni
              </span>
            )}
            <PonovniCiklusBadge broj={zahtjev.broj_ponovnih_ciklusa ?? 0} />
          </div>

          {/* Naslov */}
          <h1
            className="text-xl font-black leading-snug mb-1"
            style={{ color: 'var(--first-octonary)' }}
          >
            {naslov}
          </h1>
          {kat.podkategorija && (
            <p
              className="text-sm mb-3"
              style={{ color: 'var(--first-nonary)' }}
            >
              {kat.glavna}
            </p>
          )}

          {/* Meta */}
          <div
            className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm"
            style={{ color: 'var(--first-nonary)' }}
          >
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="line-clamp-1">{zahtjev.address}</span>
            </div>
            {zahtjev.termin_planirani_pocetak && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                <span>
                  {fmtKratki(zahtjev.termin_planirani_pocetak)} ·{' '}
                  {fmtSat(zahtjev.termin_planirani_pocetak)}
                </span>
                {zahtjev.termin_planirani_kraj && (
                  <span>- {fmtSat(zahtjev.termin_planirani_kraj)}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Real-time tracker ──────────────────────────────────────────────── */}
      <div className="mb-5">
        <ServiserTracker
          status={zahtjev.status}
          aktivnosti={aktivnosti}
          terminPocetak={zahtjev.termin_planirani_pocetak}
        />
      </div>

      {/* ─── Dva stupca ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        {/* ── Lijevi stupac (glavni sadržaj) ──────────────────────────────── */}
        <div className="min-w-0 flex-1 flex flex-col gap-4">
          {/* Akcije (aktivna intervencija) ili stanje završene */}
          {mozeMijenjati ? (
            <AkcijeServiser
              status={zahtjev.status}
              zahtjevId={zahtjev.id}
              onRefresh={ucitaj}
              onEvidencija={() => setPokaziEvid(true)}
              imaEvidenciju={evidencije.length > 0}
              onVratiNaDodjelu={() => setPokaziVratiNaDodjelu(true)}
              onOznaciNijeRijesen={() => setPokaziNijeRijesen(true)}
              checklistSveIspunjeno={
                zahtjev.status === 'u_izvrsenju'
                  ? checklistOznaceni.every(Boolean)
                  : undefined
              }
              onEvidencijaBlokirana={() => {
                setChecklistHighlight(true);
                setTimeout(() => {
                  checklistRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  });
                }, 50);
              }}
            />
          ) : jeTerminalni ? (
            <KarticaZavrseneIntervencije
              status={zahtjev.status}
              zahtjev={zahtjev}
            />
          ) : null}

          {/* Opis problema */}
          <div
            className="rounded-2xl p-5"
            style={{
              backgroundColor: 'rgb(255 255 255/0.85)',
              border: '1px solid rgb(var(--first-quaternary-rgb)/0.28)',
            }}
          >
            <div className="mb-3 flex items-center gap-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: 'rgb(var(--first-secondary-rgb)/0.1)',
                }}
              >
                <FileText
                  className="h-3.5 w-3.5"
                  style={{ color: 'var(--first-secondary)' }}
                />
              </div>
              <p
                className="text-[10px] font-bold uppercase tracking-wide"
                style={{ color: 'var(--first-nonary)' }}
              >
                Opis problema
              </p>
            </div>
            <div
              className="rounded-xl border-l-4 px-4 py-3"
              style={{
                borderLeftColor: 'var(--first-secondary)',
                backgroundColor: 'rgb(var(--first-secondary-rgb)/0.04)',
              }}
            >
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--first-octonary)' }}
              >
                {zahtjev.description}
              </p>
            </div>
          </div>

          {/* Napomene dispečera */}
          {zahtjev.dispecer_napomene && (
            <div
              className="rounded-2xl p-5"
              style={{
                backgroundColor: 'rgba(217,132,0,0.04)',
                border: '1px solid rgba(217,132,0,0.2)',
              }}
            >
              <div className="mb-3 flex items-center gap-2">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg"
                  style={{ backgroundColor: 'rgba(217,132,0,0.1)' }}
                >
                  <Headphones
                    className="h-3.5 w-3.5"
                    style={{ color: 'var(--first-senary)' }}
                  />
                </div>
                <p
                  className="text-[10px] font-bold uppercase tracking-wide"
                  style={{ color: 'var(--first-senary)' }}
                >
                  Instrukcija dispečera
                </p>
              </div>
              <p
                className="text-sm leading-relaxed font-medium"
                style={{ color: 'var(--first-octonary)' }}
              >
                {zahtjev.dispecer_napomene}
              </p>
            </div>
          )}

          {/* Komunikacija dispečer ↔ serviser */}
          <NapomeneThread
            aktivnosti={aktivnosti}
            apiEndpoint={`/api/serviser/intervencije/${zahtjev.id}`}
            mojaUloga="serviser"
            onDodana={ucitaj}
            disabled={!mozeMijenjati}
          />

          {/* Kontrolna lista - samo korak 3 (na terenu) */}
          {zahtjev.status === 'u_izvrsenju' && (
            <div
              ref={checklistRef}
              className="rounded-2xl p-5 transition-all"
              style={{
                backgroundColor:
                  checklistHighlight && !checklistOznaceni.every(Boolean)
                    ? 'rgba(220,38,38,0.02)'
                    : 'rgb(255 255 255/0.85)',
                border:
                  checklistHighlight && !checklistOznaceni.every(Boolean)
                    ? '1px solid rgba(220,38,38,0.25)'
                    : '1px solid rgb(var(--first-quaternary-rgb)/0.28)',
              }}
            >
              <div className="mb-4 flex items-center gap-2">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: 'rgb(var(--first-secondary-rgb)/0.1)',
                  }}
                >
                  <ClipboardCheck
                    className="h-3.5 w-3.5"
                    style={{ color: 'var(--first-secondary)' }}
                  />
                </div>
                <p
                  className="text-[10px] font-bold uppercase tracking-wide"
                  style={{ color: 'var(--first-nonary)' }}
                >
                  Kontrolna lista
                </p>
              </div>
              <IntervencijaChecklist
                status={zahtjev.status}
                oznaceni={checklistOznaceni}
                onPromjena={(oznaceni) => {
                  setChecklistOznaceni(oznaceni);
                  if (oznaceni.some(Boolean)) setChecklistHighlight(false);
                }}
                highlightNepopunjena={checklistHighlight}
              />
            </div>
          )}

          {/* Foto dokumentacija */}
          {(slike.length > 0 || zahtjev.status === 'u_izvrsenju') && (
            <div
              className="rounded-2xl p-5"
              style={{
                backgroundColor: 'rgb(255 255 255/0.85)',
                border: '1px solid rgb(var(--first-quaternary-rgb)/0.28)',
              }}
            >
              <div className="mb-4 flex items-center gap-2">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: 'rgb(var(--first-secondary-rgb)/0.1)',
                  }}
                >
                  <ImageIcon
                    className="h-3.5 w-3.5"
                    style={{ color: 'var(--first-secondary)' }}
                  />
                </div>
                <p
                  className="text-[10px] font-bold uppercase tracking-wide"
                  style={{ color: 'var(--first-nonary)' }}
                >
                  Foto dokumentacija
                  {slike.length > 0 ? ` (${slike.length})` : ''}
                </p>
              </div>

              {slike.length > 0 && (
                <div className="mb-4 grid grid-cols-3 gap-2">
                  {slike.map((slika, i) => (
                    <div
                      key={slika.id}
                      className="group relative aspect-square overflow-hidden rounded-xl border transition-all hover:shadow-md"
                      style={{
                        borderColor: 'rgb(var(--first-quaternary-rgb)/0.3)',
                      }}
                    >
                      <a
                        href={slika.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block h-full w-full"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={slika.image_url}
                          alt={`Slika ${i + 1}`}
                          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/20">
                          <ExternalLink className="h-4 w-4 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                      </a>
                      {zahtjev.status === 'u_izvrsenju' && (
                        <button
                          type="button"
                          title="Obriši sliku"
                          aria-label="Obriši sliku"
                          disabled={brisanjeSlikaId === slika.id}
                          onClick={() => void obrisiSliku(slika.id)}
                          className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/65 text-white opacity-0 transition-opacity hover:bg-red-600 focus-visible:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white group-hover:opacity-100 disabled:opacity-50"
                        >
                          {brisanjeSlikaId === slika.id ? (
                            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {zahtjev.status === 'u_izvrsenju' && (
                <ImageUploader
                  zahtjevId={zahtjev.id}
                  onUspjeh={dodajSliku}
                  mozeBrisati
                  maxFajlova={10}
                />
              )}
            </div>
          )}

          {/* Evidencija rada */}
          {evidencije.length > 0 && (
            <div
              className="rounded-2xl p-5"
              style={{
                backgroundColor: 'rgb(255 255 255/0.85)',
                border: '1px solid rgb(var(--first-quaternary-rgb)/0.28)',
              }}
            >
              <div className="mb-4 flex items-center gap-2">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: 'rgb(var(--first-secondary-rgb)/0.1)',
                  }}
                >
                  <Wrench
                    className="h-3.5 w-3.5"
                    style={{ color: 'var(--first-secondary)' }}
                  />
                </div>
                <p
                  className="text-[10px] font-bold uppercase tracking-wide"
                  style={{ color: 'var(--first-nonary)' }}
                >
                  Evidencija rada ({evidencije.length})
                </p>
              </div>
              <div className="flex flex-col gap-3">
                {evidencije.map((e) => (
                  <div
                    key={e.id}
                    className="rounded-xl border p-4"
                    style={{
                      borderColor: 'rgb(var(--first-quaternary-rgb)/0.28)',
                      backgroundColor: 'rgb(var(--first-quinary-rgb)/0.1)',
                    }}
                  >
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: 'var(--first-octonary)' }}
                    >
                      {e.opis_rada}
                    </p>
                    <div
                      className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs"
                      style={{ color: 'var(--first-nonary)' }}
                    >
                      {e.trajanje_minuta && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {trajanjeOznaka(e.trajanje_minuta)}
                        </span>
                      )}
                      {e.materijal && <span>Materijal: {e.materijal}</span>}
                      {(e.stavke_materijala?.length ?? 0) > 0 && (
                        <span>
                          Stavke:{' '}
                          {e
                            .stavke_materijala!.map(
                              (s) => `${s.naziv} (${s.kolicina} ${s.jedinica})`,
                            )
                            .join(', ')}
                        </span>
                      )}
                      <span>
                        {new Date(e.created_at).toLocaleDateString('bs-BA')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Završi intervenciju - zadnji korak (samo kad ima evidencija i status u_izvrsenju) */}
          {zahtjev.status === 'u_izvrsenju' && evidencije.length > 0 && (
            <div
              ref={zavrsiRef}
              className="rounded-2xl overflow-hidden scroll-mt-4"
              style={{
                border: '2px solid var(--first-primary)',
                backgroundColor: 'rgb(255 255 255/0.92)',
              }}
            >
              <div
                className="px-5 py-4"
                style={{ backgroundColor: 'var(--first-primary)' }}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                  <p className="text-sm font-bold text-white">
                    Zadnji korak - završi intervenciju
                  </p>
                </div>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: 'rgba(255,255,255,0.75)' }}
                >
                  Nakon što ste završili sve radove i evidentirali ih, označite
                  intervenciju kao završenu.
                </p>
              </div>
              <div className="p-5">
                <p
                  className="mb-4 text-sm"
                  style={{ color: 'var(--first-nonary)' }}
                >
                  Dispečer će pregledati evidenciju rada i formalno zatvoriti
                  intervenciju.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    const r = await fetch(
                      `/api/serviser/intervencije/${zahtjev.id}`,
                      {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'zavrsi' }),
                      },
                    );
                    const d = await r.json();
                    if (r.ok) {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      ucitaj();
                    } else alert(d.error ?? 'Greška pri završavanju.');
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--first-primary)',
                    color: '#fff',
                  }}
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Završi intervenciju
                </button>
              </div>
            </div>
          )}

          <HistorijaAktivnostiSekcija
            aktivnosti={aktivnosti}
            ucitava={ucitava}
          />
        </div>

        {/* ── Desni sidebar ────────────────────────────────────────────────── */}
        <SidebarPanel
          zahtjev={zahtjev}
          tim={tim}
          baznaLat={baznaLat}
          baznaLng={baznaLng}
        />
      </div>

      {/* ─── Mobile sticky bar ──────────────────────────────────────────────── */}
      {mozeMijenjati && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
          style={{
            backgroundColor: 'rgb(255 255 255/0.97)',
            borderTop: '1px solid rgb(var(--first-quaternary-rgb)/0.28)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center gap-2 px-4 py-3">
            {zahtjev.status === 'dodijeljeno' && (
              <>
                <button
                  type="button"
                  onClick={async () => {
                    const r = await fetch(
                      `/api/serviser/intervencije/${zahtjev.id}`,
                      {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'prihvati' }),
                      },
                    );
                    if (r.ok) ucitaj();
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold"
                  style={{
                    backgroundColor: 'var(--first-primary)',
                    color: '#fff',
                  }}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Prihvati
                </button>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(zahtjev.address ?? '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Navigiraj do lokacije"
                  className="flex items-center justify-center gap-1 rounded-xl px-4 py-3 text-sm font-semibold"
                  style={{
                    backgroundColor: 'rgb(var(--first-secondary-rgb)/0.1)',
                    color: 'var(--first-secondary)',
                    border: '1px solid rgb(var(--first-secondary-rgb)/0.2)',
                  }}
                >
                  <Navigation className="h-4 w-4" />
                </a>
              </>
            )}
            {zahtjev.status === 'u_radu' && (
              <>
                <button
                  type="button"
                  onClick={async () => {
                    const r = await fetch(
                      `/api/serviser/intervencije/${zahtjev.id}`,
                      {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'pocni' }),
                      },
                    );
                    if (r.ok) ucitaj();
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold"
                  style={{
                    backgroundColor: 'var(--first-primary)',
                    color: '#fff',
                  }}
                >
                  <MapPin className="h-4 w-4" />
                  Počni intervenciju
                </button>
                <button
                  type="button"
                  onClick={() => setPokaziEvid(true)}
                  aria-label="Evidentiraj rad"
                  className="flex items-center justify-center gap-1 rounded-xl px-4 py-3 text-sm font-semibold"
                  style={{
                    backgroundColor: 'rgb(var(--first-secondary-rgb)/0.1)',
                    color: 'var(--first-secondary)',
                    border: '1px solid rgb(var(--first-secondary-rgb)/0.2)',
                  }}
                >
                  <ClipboardCheck className="h-4 w-4" />
                </button>
              </>
            )}
            {zahtjev.status === 'u_izvrsenju' && (
              <>
                <button
                  type="button"
                  onClick={() => setPokaziEvid(true)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold"
                  style={{
                    backgroundColor: 'rgb(var(--first-secondary-rgb)/0.1)',
                    color: 'var(--first-secondary)',
                    border: '1px solid rgb(var(--first-secondary-rgb)/0.2)',
                  }}
                >
                  <ClipboardCheck className="h-4 w-4" />
                  {evidencije.length > 0
                    ? 'Dodaj evidenciju'
                    : 'Evidentiraj rad'}
                </button>
                {evidencije.length > 0 && (
                  <button
                    type="button"
                    onClick={async () => {
                      const r = await fetch(
                        `/api/serviser/intervencije/${zahtjev.id}`,
                        {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ action: 'zavrsi' }),
                        },
                      );
                      if (r.ok) {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        ucitaj();
                      }
                    }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold"
                    style={{
                      backgroundColor: 'var(--first-primary)',
                      color: '#fff',
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Završi
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
      {mozeMijenjati && <div className="h-20 lg:hidden" />}

      {/* Modal za evidenciju */}
      {pokaziEvid && (
        <EvidencijaRadaModal
          zahtjevId={zahtjev.id}
          onZatvori={() => setPokaziEvid(false)}
          onUspjeh={() => {
            setPokaziEvid(false);
            setScrollToZavrsi(true);
            ucitaj();
          }}
        />
      )}

      {pokaziVratiNaDodjelu && (
        <RazlogOperativniModal
          naslov="Vrati na ponovnu dodjelu"
          ikona={<RotateCcw className="h-4 w-4" style={{ color: '#D97706' }} />}
          upozorenje='Intervencija će biti vraćena dispečeru na ponovnu dodjelu. Status će biti promijenjen u "Potvrđeno".'
          labelRazloga="Razlog vraćanja"
          placeholder="Npr. Nedostupnost alata, konflikt termina, hitna situacija..."
          potvrdiTekst="Vrati na dodjelu"
          onZatvori={() => setPokaziVratiNaDodjelu(false)}
          onPotvrdi={async (razlog) => {
            const odg = await patchServiserAkcija(
              zahtjev.id,
              'vrati_na_ponovnu_dodjelu',
              razlog,
            );
            setPokaziVratiNaDodjelu(false);
            setZahtjev((z) =>
              z
                ? {
                    ...z,
                    status: odg.novi_status ?? 'potvrdeno',
                    serviser_dodijeljen_id: null,
                    broj_ponovnih_ciklusa:
                      odg.broj_ponovnih_ciklusa ?? z.broj_ponovnih_ciklusa,
                  }
                : z,
            );
            setSamoCitanje(true);
            setNivoPristupa('arhiva');
            setUspjehPoruka(
              odg.broj_ponovnih_ciklusa
                ? `Zadatak vraćen dispečeru. Ponovni ciklus: ${odg.broj_ponovnih_ciklusa}.`
                : 'Zadatak vraćen dispečeru na ponovnu dodjelu.',
            );
            setPokaziUspjeh(true);
            void ucitaj({ silent: true });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {pokaziNijeRijesen && (
        <RazlogOperativniModal
          naslov="Nije riješeno"
          ikona={
            <AlertTriangle className="h-4 w-4" style={{ color: '#DC2626' }} />
          }
          upozorenje='Intervencija će biti vraćena dispečeru kao nerješena. Status će biti promijenjen u "Potvrđeno".'
          labelRazloga="Razlog nerješavanja"
          placeholder="Npr. Problem zahtijeva dodatnu opremu, potreban specijalistički uvid..."
          potvrdiTekst="Potvrdi"
          variantPotvrdi="danger"
          onZatvori={() => setPokaziNijeRijesen(false)}
          onPotvrdi={async (razlog) => {
            const odg = await patchServiserAkcija(
              zahtjev.id,
              'oznaci_nije_rijesen',
              razlog,
            );
            setPokaziNijeRijesen(false);
            setZahtjev((z) =>
              z
                ? {
                    ...z,
                    status: odg.novi_status ?? 'potvrdeno',
                    serviser_dodijeljen_id: null,
                    broj_ponovnih_ciklusa:
                      odg.broj_ponovnih_ciklusa ?? z.broj_ponovnih_ciklusa,
                  }
                : z,
            );
            setSamoCitanje(true);
            setNivoPristupa('arhiva');
            setUspjehPoruka(
              odg.broj_ponovnih_ciklusa
                ? `Označeno kao nije riješeno. Ponovni ciklus: ${odg.broj_ponovnih_ciklusa}.`
                : 'Intervencija označena kao nije riješena.',
            );
            setPokaziUspjeh(true);
            void ucitaj({ silent: true });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}
    </AppShell>
  );
}
