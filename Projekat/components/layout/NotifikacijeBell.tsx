'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell, CheckCheck, Clock, ClipboardList, CheckCircle2, XCircle,
  RefreshCw, Wrench, Lock, Calendar, UserMinus, Users, MessageSquare,
  Plus, Shield, ShieldCheck, AlertCircle,
} from 'lucide-react';
import type { Notifikacija, TipNotifikacije } from '@/domain/types/servisirane';
import type { LucideIcon } from 'lucide-react';
import type { UserRole } from '@/domain/types';

// ─── Config ───────────────────────────────────────────────────────────────────

const POLL_MS = 30_000;

interface TipConfig {
  Ikona: LucideIcon;
  boja:  string;
}

const TIP_CFG: Record<TipNotifikacije | string, TipConfig> = {
  dodjela_intervencije:   { Ikona: ClipboardList,  boja: 'var(--first-primary)'   },
  tim_dodjela:            { Ikona: Users,           boja: 'var(--first-secondary)' },
  uklanjanje_servisera:   { Ikona: UserMinus,       boja: '#DC2626'                },
  promjena_termina:       { Ikona: Calendar,        boja: '#D97706'                },
  nova_napomena:          { Ikona: MessageSquare,   boja: 'var(--first-secondary)' },
  prihvatanje_zadatka:    { Ikona: CheckCircle2,    boja: '#16A34A'                },
  odbijanje_zadatka:      { Ikona: XCircle,         boja: '#DC2626'                },
  evidencija_rada:        { Ikona: Wrench,          boja: 'var(--first-secondary)' },
  novi_zahtjev:           { Ikona: Plus,            boja: 'var(--first-senary)'    },
  promjena_statusa:       { Ikona: RefreshCw,       boja: 'var(--first-secondary)' },
  zavrsetak_intervencije: { Ikona: CheckCircle2,    boja: '#16A34A'                },
  zatvaranje_intervencije:{ Ikona: Lock,            boja: 'var(--first-nonary)'    },
  promjena_uloge:         { Ikona: Shield,          boja: '#7C3AED'                },
  promjena_statusa_naloga:{ Ikona: ShieldCheck,     boja: 'var(--first-secondary)' },
  sistemska_obavijest:    { Ikona: AlertCircle,     boja: '#D97706'                },
  sla_eskalacija:         { Ikona: AlertCircle,     boja: '#DC2626'                },
};

const FALLBACK_CFG: TipConfig = { Ikona: Bell, boja: 'var(--first-nonary)' };

// ─── Routing by role ──────────────────────────────────────────────────────────

function getHref(n: Notifikacija, uloga: UserRole): string | null {
  // Admin: link to the user page if available
  if (uloga === 'admin') {
    if (n.povezani_entitet_tip === 'user' && n.povezani_entitet_id) {
      return `/admin/korisnici/${n.povezani_entitet_id}/uredi`;
    }
    if (n.zahtjev_id) return `/dispecer/intervencije/${n.zahtjev_id}`;
    return null;
  }
  if (!n.zahtjev_id) return null;
  if (uloga === 'serviser')  return `/serviser/intervencije/${n.zahtjev_id}`;
  if (uloga === 'dispecer')  return `/dispecer/intervencije/${n.zahtjev_id}`;
  if (uloga === 'korisnik')  return `/korisnik/zahtjevi/${n.zahtjev_id}`;
  return null;
}

// ─── Time helpers ─────────────────────────────────────────────────────────────

type Grupa = 'danas' | 'jucer' | 'ranije';

function getGrupa(iso: string): Grupa {
  const d     = new Date(iso);
  const danas = new Date();
  const jucer = new Date(danas);
  jucer.setDate(jucer.getDate() - 1);
  if (d.toDateString() === danas.toDateString()) return 'danas';
  if (d.toDateString() === jucer.toDateString()) return 'jucer';
  return 'ranije';
}

const GRUPA_LABEL: Record<Grupa, string> = {
  danas:  'Danas',
  jucer:  'Jučer',
  ranije: 'Ranije',
};

function fmtVrijeme(iso: string): string {
  const d       = new Date(iso);
  const razlika = Math.floor((Date.now() - d.getTime()) / 60_000);
  if (razlika < 1)  return 'Upravo sada';
  if (razlika < 60) return `Prije ${razlika} min`;
  const h = Math.floor(razlika / 60);
  if (h < 24) return `Prije ${h}h`;
  return d.toLocaleDateString('bs-BA', { day: '2-digit', month: '2-digit' });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NotifikacijeBell({
  boja,
  uloga = 'korisnik',
}: {
  boja?:  string;
  uloga?: UserRole;
}) {
  const [otvoren,      setOtvoren]      = useState(false);
  const [notifikacije, setNotifikacije] = useState<Notifikacija[]>([]);
  const [neprocitane,  setNeprocitane]  = useState(0);
  const [ucitava,      setUcitava]      = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const router   = useRouter();

  const fetchNotifikacije = useCallback(async () => {
    try {
      const r = await fetch('/api/notifikacije?limit=30', { cache: 'no-store' });
      if (!r.ok) return;
      const d = await r.json();
      setNotifikacije(d.notifikacije ?? []);
      setNeprocitane(d.neprocitane ?? 0);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchNotifikacije();
    const timer = setInterval(fetchNotifikacije, POLL_MS);
    return () => clearInterval(timer);
  }, [fetchNotifikacije]);

  useEffect(() => {
    if (!otvoren) return;
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOtvoren(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [otvoren]);

  async function označiSveKaoProcitano() {
    setUcitava(true);
    try {
      await fetch('/api/notifikacije', { method: 'PATCH' });
      setNotifikacije((prev) => prev.map((n) => ({ ...n, procitano: true })));
      setNeprocitane(0);
    } finally { setUcitava(false); }
  }

  async function klikNaNotifikaciju(n: Notifikacija) {
    if (!n.procitano) {
      await fetch(`/api/notifikacije/${n.id}`, { method: 'PATCH' });
      setNotifikacije((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, procitano: true } : x))
      );
      setNeprocitane((prev) => Math.max(0, prev - 1));
    }
    setOtvoren(false);
    const href = getHref(n, uloga);
    if (href) router.push(href);
  }

  // Group notifications by day
  const grupe = notifikacije.reduce<Record<Grupa, Notifikacija[]>>(
    (acc, n) => {
      const g = getGrupa(n.created_at);
      acc[g].push(n);
      return acc;
    },
    { danas: [], jucer: [], ranije: [] }
  );
  const grupeRedoslijed: Grupa[] = ['danas', 'jucer', 'ranije'];

  const akcentBoja = boja ?? 'var(--first-secondary)';

  return (
    <div ref={panelRef} className="relative">

      {/* ── Bell button ───────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => { setOtvoren((v) => !v); if (!otvoren) fetchNotifikacije(); }}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-black/[0.06]"
        style={{ color: neprocitane > 0 ? akcentBoja : 'var(--first-nonary)' }}
        aria-label="Obavještenja"
      >
        <Bell className="h-4 w-4" />
        {neprocitane > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-black text-white"
            style={{ backgroundColor: '#DC2626' }}
          >
            {neprocitane > 99 ? '99+' : neprocitane}
          </span>
        )}
      </button>

      {/* ── Dropdown panel ────────────────────────────────────────────── */}
      {otvoren && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-[22rem] overflow-hidden rounded-2xl shadow-xl"
          style={{
            backgroundColor: 'var(--first-tertiary)',
            border:          '1px solid rgb(var(--first-quaternary-rgb)/0.35)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between border-b px-4 py-3"
            style={{ borderColor: 'rgb(var(--first-quaternary-rgb)/0.3)' }}
          >
            <div className="flex items-center gap-2">
              <Bell className="h-3.5 w-3.5" style={{ color: akcentBoja }} />
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--first-nonary)' }}>
                Obavještenja
              </p>
              {neprocitane > 0 && (
                <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                  style={{ backgroundColor: 'rgba(220,38,38,0.10)', color: '#DC2626' }}>
                  {neprocitane} novo
                </span>
              )}
            </div>
            {neprocitane > 0 && (
              <button
                type="button"
                onClick={označiSveKaoProcitano}
                disabled={ucitava}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold transition hover:bg-black/[0.06] disabled:opacity-50"
                style={{ color: 'var(--first-secondary)' }}
              >
                <CheckCheck className="h-3 w-3" />
                Sve pročitano
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[28rem] overflow-y-auto">
            {notifikacije.length === 0 ? (

              /* Empty state */
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: 'rgb(var(--first-secondary-rgb)/0.08)' }}>
                  <Bell className="h-5 w-5" style={{ color: 'var(--first-secondary)', opacity: 0.35 }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--first-octonary)' }}>
                  Nema obavještenja
                </p>
                <p className="text-xs" style={{ color: 'var(--first-nonary)' }}>
                  Novi događaji će se prikazati ovdje
                </p>
              </div>

            ) : (

              /* Grouped list */
              grupeRedoslijed.map((g) => {
                const lista = grupe[g];
                if (!lista.length) return null;
                return (
                  <div key={g}>
                    {/* Group header */}
                    <div className="sticky top-0 px-4 py-1.5"
                      style={{ backgroundColor: 'var(--first-tertiary)', borderBottom: '1px solid rgb(var(--first-quaternary-rgb)/0.15)' }}>
                      <p className="text-[10px] font-bold uppercase tracking-widest"
                        style={{ color: 'var(--first-quinary)' }}>
                        {GRUPA_LABEL[g]}
                      </p>
                    </div>

                    {lista.map((n) => {
                      const cfg    = TIP_CFG[n.tip] ?? FALLBACK_CFG;
                      const Ikona  = cfg.Ikona;
                      const href   = getHref(n, uloga);
                      return (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => klikNaNotifikaciju(n)}
                          disabled={!href && n.procitano}
                          className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-black/[0.04] disabled:cursor-default"
                          style={{
                            backgroundColor: !n.procitano
                              ? `color-mix(in srgb, ${cfg.boja} 5%, transparent)`
                              : 'transparent',
                            borderBottom: '1px solid rgb(var(--first-quaternary-rgb)/0.12)',
                          }}
                        >
                          {/* Type icon */}
                          <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
                            style={{ backgroundColor: `color-mix(in srgb, ${cfg.boja} 12%, transparent)` }}>
                            <Ikona className="h-3.5 w-3.5" style={{ color: cfg.boja }} />
                          </div>

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-bold leading-snug"
                                style={{ color: n.procitano ? 'var(--first-nonary)' : 'var(--first-octonary)' }}>
                                {n.naslov}
                              </p>
                              {!n.procitano && (
                                <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                                  style={{ backgroundColor: akcentBoja }} />
                              )}
                            </div>
                            <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed"
                              style={{ color: n.procitano ? 'var(--first-quinary)' : 'var(--first-nonary)' }}>
                              {n.poruka}
                            </p>
                            <div className="mt-1 flex items-center gap-1" style={{ color: 'var(--first-quinary)' }}>
                              <Clock className="h-2.5 w-2.5" />
                              <span className="text-[10px] tabular-nums">{fmtVrijeme(n.created_at)}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
