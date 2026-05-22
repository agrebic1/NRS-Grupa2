'use client';

import {
  ArrowRightLeft, MessageSquare, UserCheck, ClipboardCheck,
  UserX, Cog, Clock, Image as ImageIcon, Users, UserMinus, Lock, AlertTriangle,
  Headphones, Wrench, User, RotateCcw, ArrowRight,
} from 'lucide-react';
import type { InterventionActivity, TipAktivnosti } from '@/domain/types/servisirane';
import type { LucideIcon } from 'lucide-react';

// ─── Role ikonice ─────────────────────────────────────────────────────────────

function ulogaIkona(uloga?: string): LucideIcon {
  if (uloga === 'dispecer') return Headphones;
  if (uloga === 'serviser') return Wrench;
  if (uloga === 'korisnik') return User;
  return Cog;
}

function ulogaNaziv(uloga?: string, ime?: string): string {
  if (ime) return ime;
  if (uloga === 'dispecer') return 'Dispečer';
  if (uloga === 'serviser') return 'Serviser';
  if (uloga === 'korisnik') return 'Korisnik';
  return 'Sistem';
}

// ─── Config po tipu aktivnosti ───────────────────────────────────────────────

const TIP_CONFIG: Record<TipAktivnosti, {
  Ikona: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  boja:  string;
  rgb:   string;
}> = {
  status_promjena:   { Ikona: ArrowRightLeft, boja: 'var(--first-secondary)', rgb: '45,91,159' },
  napomena:          { Ikona: MessageSquare,  boja: '#617089',                rgb: '97,112,137' },
  dodjela:           { Ikona: UserCheck,      boja: 'var(--first-secondary)', rgb: '45,91,159' },
  evidencija:        { Ikona: ClipboardCheck, boja: '#D97706',                rgb: '217,119,6' },
  odbijanje:         { Ikona: UserX,          boja: '#DC2626',                rgb: '220,38,38' },
  sistem:            { Ikona: Cog,            boja: '#9CA3AF',                rgb: '156,163,175' },
  slika:             { Ikona: ImageIcon,      boja: '#7C3AED',                rgb: '124,58,237' },
  tim_dodjela:       { Ikona: Users,          boja: 'var(--first-secondary)', rgb: '45,91,159' },
  tim_uklanjanje:    { Ikona: UserMinus,      boja: '#D97706',                rgb: '217,119,6' },
  zatvaranje:           { Ikona: Lock,           boja: 'var(--first-primary)',   rgb: '16,37,65' },
  konflikt_override:    { Ikona: AlertTriangle,  boja: '#D97706',                rgb: '217,119,6' },
  nije_rijeseno:        { Ikona: AlertTriangle,  boja: '#DC2626',                rgb: '220,38,38' },
  promjena_izvrsioca:   { Ikona: ArrowRightLeft, boja: '#7C3AED',                rgb: '124,58,237' },
  vracanje_na_dodjelu:  { Ikona: RotateCcw,      boja: '#D97706',                rgb: '217,119,6' },
  sla_eskalacija:        { Ikona: AlertTriangle,  boja: '#DC2626',                rgb: '220,38,38' },
};

// ─── Status label ─────────────────────────────────────────────────────────────

const STATUS_LABELE: Record<string, string> = {
  na_cekanju:    'Na čekanju',
  pending_review:'Na pregledu',
  in_review:     'U pregledu',
  potvrdeno:     'Potvrđeno',
  dodijeljeno:   'Dodijeljeno',
  u_radu:        'Na putu',
  u_izvrsenju:   'Na terenu',
  zavrseno:      'Završeno',
  zatvoreno:     'Zatvoreno',
  odbijeno:      'Odbijeno',
  otkazano:      'Otkazano',
};

function statusLabel(v: string): string {
  return STATUS_LABELE[v] ?? v;
}

// ─── Format vremena ───────────────────────────────────────────────────────────

function formatirajVrijeme(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('bs-BA', {
    day:    '2-digit',
    month:  '2-digit',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  });
}

// ─── Komponenta ───────────────────────────────────────────────────────────────

interface AktivnostiTimelineProps {
  aktivnosti: InterventionActivity[];
  ucitava?:   boolean;
}

export function AktivnostiTimeline({ aktivnosti, ucitava }: AktivnostiTimelineProps) {
  if (ucitava) {
    return (
      <div className="flex items-center gap-2 py-6">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: 'var(--first-primary)' }} />
        <p className="text-sm" style={{ color: 'var(--first-nonary)' }}>
          Učitavanje aktivnosti...
        </p>
      </div>
    );
  }

  if (aktivnosti.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <Clock className="h-8 w-8" style={{ color: 'var(--first-quinary)' }} />
        <p className="text-sm" style={{ color: 'var(--first-nonary)' }}>
          Nema zabilježenih aktivnosti.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0">
      {aktivnosti.map((a, idx) => {
        const cfg       = TIP_CONFIG[a.tip] ?? TIP_CONFIG.sistem;
        const Ikona     = cfg.Ikona;
        const jeLast    = idx === aktivnosti.length - 1;
        const imePrezime = a.autor ? `${a.autor.ime} ${a.autor.prezime}`.trim() : '';
        const autorIme  = ulogaNaziv(a.autor?.uloga, imePrezime);
        const AutorIkona = ulogaIkona(a.autor?.uloga);

        return (
          <div key={a.id} className="flex gap-3">
            {/* Ikona + linija */}
            <div className="flex flex-col items-center">
              <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                style={{
                  backgroundColor: `rgba(${cfg.rgb}, 0.12)`,
                  border:          `1.5px solid rgba(${cfg.rgb}, 0.3)`,
                }}
              >
                <Ikona className="h-4 w-4" style={{ color: cfg.boja }} />
              </div>
              {!jeLast && (
                <div
                  className="w-px flex-1 my-1"
                  style={{ backgroundColor: 'rgb(var(--first-quaternary-rgb) / 0.4)' }}
                />
              )}
            </div>

            {/* Sadržaj */}
            <div className={`min-w-0 flex-1 ${jeLast ? '' : 'pb-4'}`}>
              <div className="flex flex-wrap items-start gap-2">
                <p
                  className="text-sm font-medium leading-snug"
                  style={{ color: 'var(--first-octonary)' }}
                >
                  {a.sadrzaj}
                </p>
              </div>
              {(a.old_value || a.new_value) && (
                <div className="mt-1.5 flex items-center gap-1.5">
                  {a.old_value && (
                    <span className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
                      style={{ backgroundColor: 'rgba(156,163,175,0.12)', color: '#6B7280', border: '1px solid rgba(156,163,175,0.3)' }}>
                      {statusLabel(a.old_value)}
                    </span>
                  )}
                  {a.old_value && a.new_value && (
                    <ArrowRight className="h-3 w-3 flex-shrink-0" style={{ color: 'var(--first-nonary)' }} />
                  )}
                  {a.new_value && (
                    <span className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
                      style={{ backgroundColor: `rgba(${cfg.rgb},0.1)`, color: cfg.boja, border: `1px solid rgba(${cfg.rgb},0.25)` }}>
                      {statusLabel(a.new_value)}
                    </span>
                  )}
                </div>
              )}
              <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs" style={{ color: 'var(--first-nonary)' }}>
                <span className="flex items-center gap-1">
                  <AutorIkona className="h-3 w-3 flex-shrink-0" />
                  {autorIme}
                </span>
                <span>{formatirajVrijeme(a.created_at)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
