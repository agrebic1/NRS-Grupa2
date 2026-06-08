'use client';

// US-49: Lagani grafovi za analitički dashboard — čisti SVG/CSS, bez vanjskih
// zavisnosti (ne povećava bundle). Koriste design-system CSS varijable.

// ─── Horizontalni bar chart (CSS) ───────────────────────────────────────────────

export interface BarPodatak {
  labela: string;
  vrijednost: number;
  boja?: string;
}

export function BarChart({
  podaci,
  boja = 'var(--first-secondary)',
  formatVrijednost,
  praznoTekst = 'Nema podataka.',
}: {
  podaci: BarPodatak[];
  boja?: string;
  formatVrijednost?: (v: number) => string;
  praznoTekst?: string;
}) {
  if (podaci.length === 0) {
    return (
      <p
        className="py-4 text-center text-xs"
        style={{ color: 'var(--first-nonary)' }}
      >
        {praznoTekst}
      </p>
    );
  }
  const max = Math.max(1, ...podaci.map((d) => d.vrijednost));
  const opis = podaci.map((d) => `${d.labela}: ${d.vrijednost}`).join(', ');

  return (
    <div className="flex flex-col gap-2.5" role="img" aria-label={opis}>
      {podaci.map((d) => {
        const pct = Math.round((d.vrijednost / max) * 100);
        return (
          <div key={d.labela} className="flex items-center gap-3">
            <span
              className="w-24 shrink-0 truncate text-xs font-medium sm:w-32"
              style={{ color: 'var(--first-octonary)' }}
              title={d.labela}
            >
              {d.labela}
            </span>
            <div
              className="relative h-5 flex-1 overflow-hidden rounded-full"
              style={{
                backgroundColor: 'rgb(var(--first-quaternary-rgb) / 0.2)',
              }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(pct, d.vrijednost > 0 ? 4 : 0)}%`,
                  backgroundColor: d.boja ?? boja,
                }}
              />
            </div>
            <span
              className="w-12 shrink-0 text-right text-xs font-bold tabular-nums"
              style={{ color: 'var(--first-octonary)' }}
            >
              {formatVrijednost ? formatVrijednost(d.vrijednost) : d.vrijednost}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Donut chart (SVG) ──────────────────────────────────────────────────────────

export interface DonutSegment {
  labela: string;
  vrijednost: number;
  boja: string;
}

export function DonutChart({
  segmenti,
  velicina = 160,
  debljina = 22,
  centarLabela,
}: {
  segmenti: DonutSegment[];
  velicina?: number;
  debljina?: number;
  centarLabela?: string;
}) {
  const ukupno = segmenti.reduce((s, x) => s + x.vrijednost, 0);
  const r = (velicina - debljina) / 2;
  const obim = 2 * Math.PI * r;
  const cx = velicina / 2;
  const opis = segmenti.map((s) => `${s.labela}: ${s.vrijednost}`).join(', ');

  let offset = 0;

  return (
    <div className="flex flex-wrap items-center gap-5">
      <svg
        width={velicina}
        height={velicina}
        viewBox={`0 0 ${velicina} ${velicina}`}
        role="img"
        aria-label={`Raspodjela — ${opis}`}
      >
        <g transform={`rotate(-90 ${cx} ${cx})`}>
          {ukupno === 0 ? (
            <circle
              cx={cx}
              cy={cx}
              r={r}
              fill="none"
              stroke="rgb(var(--first-quaternary-rgb) / 0.3)"
              strokeWidth={debljina}
            />
          ) : (
            segmenti.map((seg) => {
              const dash = (seg.vrijednost / ukupno) * obim;
              const el = (
                <circle
                  key={seg.labela}
                  cx={cx}
                  cy={cx}
                  r={r}
                  fill="none"
                  stroke={seg.boja}
                  strokeWidth={debljina}
                  strokeDasharray={`${dash} ${obim - dash}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += dash;
              return el;
            })
          )}
        </g>
        <text
          x={cx}
          y={cx - 6}
          textAnchor="middle"
          className="font-extrabold"
          style={{ fontSize: 26, fill: 'var(--first-octonary)' }}
        >
          {ukupno}
        </text>
        {centarLabela && (
          <text
            x={cx}
            y={cx + 16}
            textAnchor="middle"
            style={{ fontSize: 11, fill: 'var(--first-nonary)' }}
          >
            {centarLabela}
          </text>
        )}
      </svg>

      {/* Legenda */}
      <ul className="flex flex-col gap-2">
        {segmenti.map((seg) => {
          const pct =
            ukupno > 0 ? Math.round((seg.vrijednost / ukupno) * 100) : 0;
          return (
            <li key={seg.labela} className="flex items-center gap-2 text-xs">
              <span
                className="h-3 w-3 shrink-0 rounded-sm"
                style={{ backgroundColor: seg.boja }}
              />
              <span style={{ color: 'var(--first-octonary)' }}>
                {seg.labela}
              </span>
              <span
                className="font-bold tabular-nums"
                style={{ color: 'var(--first-nonary)' }}
              >
                {seg.vrijednost} ({pct}%)
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── Line / area chart (SVG) ────────────────────────────────────────────────────

export interface LineTacka {
  labela: string;
  vrijednost: number;
}

export function LineChart({
  tacke,
  boja = 'var(--first-secondary)',
  visina = 140,
  praznoTekst = 'Nema podataka za period.',
}: {
  tacke: LineTacka[];
  boja?: string;
  visina?: number;
  praznoTekst?: string;
}) {
  if (tacke.length === 0) {
    return (
      <p
        className="py-8 text-center text-xs"
        style={{ color: 'var(--first-nonary)' }}
      >
        {praznoTekst}
      </p>
    );
  }

  const W = 100; // viewBox širina (responsive preko preserveAspectRatio)
  const H = visina;
  const max = Math.max(1, ...tacke.map((t) => t.vrijednost));
  const denom = Math.max(1, tacke.length - 1);
  const koords = tacke.map((t, i) => ({
    x: tacke.length === 1 ? W / 2 : (i / denom) * W,
    y: H - (t.vrijednost / max) * (H - 10) - 5,
  }));
  const linePts = koords.map((k) => `${k.x},${k.y}`).join(' ');
  const areaPts = `0,${H} ${linePts} ${W},${H}`;
  const opis = tacke.map((t) => `${t.labela}: ${t.vrijednost}`).join(', ');

  return (
    <div className="w-full">
      <svg
        width="100%"
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`Trend — ${opis}`}
      >
        <polygon points={areaPts} fill={boja} opacity={0.12} />
        <polyline
          points={linePts}
          fill="none"
          stroke={boja}
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {koords.map((k, i) => (
          <circle
            key={i}
            cx={k.x}
            cy={k.y}
            r={1.8}
            fill={boja}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      <div
        className="mt-1 flex justify-between text-[10px]"
        style={{ color: 'var(--first-nonary)' }}
      >
        <span>{tacke[0].labela}</span>
        {tacke.length > 1 && <span>{tacke[tacke.length - 1].labela}</span>}
      </div>
    </div>
  );
}
