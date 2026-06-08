'use client';

import {
  Check,
  ClipboardList,
  Truck,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

// ─── Definicija faza ──────────────────────────────────────────────────────────

export interface WorkflowFaza {
  kljuc: string;
  naziv: string;
  Ikona: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
}

export const WORKFLOW_FAZE: WorkflowFaza[] = [
  { kljuc: 'dodijeljeno', naziv: 'Dodijeljeno', Ikona: ClipboardList },
  { kljuc: 'u_radu', naziv: 'Na putu', Ikona: Truck },
  { kljuc: 'u_izvrsenju', naziv: 'Na terenu', Ikona: MapPin },
  { kljuc: 'zavrseno', naziv: 'Završeno', Ikona: CheckCircle2 },
];

// ─── Pozicija statusa u workflow-u ────────────────────────────────────────────

export function statusUIndeks(status: string): number {
  return WORKFLOW_FAZE.findIndex((f) => f.kljuc === status);
}

// ─── Horizontalni progress za kartice ────────────────────────────────────────

const ZIVE_FAZE = new Set(['u_radu', 'u_izvrsenju']);

export function IntervencijaWorkflowProgress({ status }: { status: string }) {
  const aktivniIndeks = statusUIndeks(status);
  const jeZiva = ZIVE_FAZE.has(status);

  return (
    <div className="space-y-1.5">
      {jeZiva && (
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
              style={{ backgroundColor: 'var(--first-secondary)' }}
            />
            <span
              className="relative inline-flex h-2 w-2 rounded-full"
              style={{ backgroundColor: 'var(--first-secondary)' }}
            />
          </span>
          <span
            className="text-[10px] font-bold uppercase tracking-wide"
            style={{ color: 'var(--first-secondary)' }}
          >
            U toku
          </span>
        </div>
      )}
      <div className="flex items-center gap-0.5">
        {WORKFLOW_FAZE.map((faza, i) => {
          const jeZavrsena = aktivniIndeks > i;
          const jeAktivna = aktivniIndeks === i;
          const jeHorizontalna = i < WORKFLOW_FAZE.length - 1;

          return (
            <div key={faza.kljuc} className="flex flex-1 items-center">
              <div
                className="flex flex-col items-center gap-0.5"
                title={faza.naziv}
              >
                <div
                  className="flex h-5 w-5 items-center justify-center rounded-full"
                  style={{
                    backgroundColor:
                      jeZavrsena || jeAktivna
                        ? 'var(--first-secondary)'
                        : 'rgb(var(--first-quaternary-rgb)/0.35)',
                    boxShadow: jeAktivna
                      ? '0 0 0 3px rgba(45,91,159,0.18)'
                      : 'none',
                    transition: 'background-color 0.2s',
                  }}
                >
                  {jeZavrsena ? (
                    <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                  ) : (
                    <faza.Ikona
                      className="h-2.5 w-2.5"
                      style={{
                        color: jeAktivna ? '#fff' : 'var(--first-nonary)',
                      }}
                    />
                  )}
                </div>
              </div>
              {jeHorizontalna && (
                <div
                  className="mx-0.5 h-0.5 flex-1"
                  style={{
                    backgroundColor: jeZavrsena
                      ? 'var(--first-secondary)'
                      : 'rgb(var(--first-quaternary-rgb)/0.3)',
                    transition: 'background-color 0.2s',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Vertikalni timeline za detail ekran ──────────────────────────────────────

export function IntervencijaWorkflowTimeline({
  status,
  terminPocetak,
  radEvidentiran,
}: {
  status: string;
  terminPocetak?: string | null;
  radEvidentiran?: string | null;
}) {
  const aktivniIndeks = statusUIndeks(status);

  const vremenaMapa: Record<string, string | null | undefined> = {
    dodijeljeno: undefined,
    u_radu: terminPocetak,
    u_izvrsenju: radEvidentiran,
    zavrseno: radEvidentiran,
  };

  return (
    <div className="flex flex-col">
      {WORKFLOW_FAZE.map((faza, i) => {
        const jeZavrsena = aktivniIndeks > i;
        const jeAktivna = aktivniIndeks === i;
        const jePoslednja = i === WORKFLOW_FAZE.length - 1;
        const Ikona = faza.Ikona;
        const vrijemeStr = vremenaMapa[faza.kljuc];

        return (
          <div key={faza.kljuc} className="flex gap-3">
            {/* Ikona + vertikalna linija */}
            <div className="flex flex-col items-center">
              <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                style={{
                  backgroundColor: jeZavrsena
                    ? 'var(--first-secondary)'
                    : jeAktivna
                      ? 'var(--first-secondary)'
                      : 'rgb(var(--first-quinary-rgb)/0.45)',
                  boxShadow: jeAktivna
                    ? '0 0 0 4px rgba(45,91,159,0.15)'
                    : 'none',
                }}
              >
                {jeZavrsena ? (
                  <Check className="h-4 w-4 text-white" strokeWidth={2.5} />
                ) : (
                  <Ikona
                    className="h-4 w-4"
                    style={{
                      color: jeAktivna ? '#fff' : 'var(--first-quinary)',
                    }}
                  />
                )}
              </div>
              {!jePoslednja && (
                <div
                  className="mt-1 w-0.5 flex-1 min-h-[1.5rem]"
                  style={{
                    backgroundColor: jeZavrsena
                      ? 'var(--first-secondary)'
                      : 'rgb(var(--first-quaternary-rgb)/0.3)',
                    minHeight: '1.5rem',
                  }}
                />
              )}
            </div>

            {/* Tekst */}
            <div className="pb-5 min-w-0">
              <p
                className="text-sm font-semibold leading-tight"
                style={{
                  color: jeAktivna
                    ? 'var(--first-secondary)'
                    : jeZavrsena
                      ? 'var(--first-octonary)'
                      : 'var(--first-nonary)',
                }}
              >
                {faza.naziv}
              </p>
              {vrijemeStr && (
                <p
                  className="mt-0.5 text-xs"
                  style={{ color: 'var(--first-nonary)' }}
                >
                  {new Date(vrijemeStr).toLocaleString('bs-BA', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
              {jeAktivna && (
                <span
                  className="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{
                    backgroundColor: 'rgb(var(--first-secondary-rgb)/0.1)',
                    color: 'var(--first-secondary)',
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
  );
}
