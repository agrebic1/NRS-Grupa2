import type { PreferredSchedule, ServisniZahtjev } from '@/domain/types/servisirane';
import { formatirajDatumPrikaz } from '@/lib/format/datumi';

export function skracenTekst(tekst: string, maxLen = 150): string {
  const t = (tekst ?? '').trim();
  if (!t) return '';
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen).trim()}…`;
}

export function uRecenicu(tekst: string): string {
  const t = (tekst ?? '').trim();
  if (!t) return '';
  const lower = t.toLocaleLowerCase('hr-HR');
  return lower.charAt(0).toLocaleUpperCase('hr-HR') + lower.slice(1);
}

export function hrefZaTelefon(prikaz: string): string | null {
  const očišćeno = prikaz.replace(/[^\d+]/g, '');
  if (!očišćeno) return null;
  return `tel:${očišćeno}`;
}

function formatKratkiDatum(datumStr: string): string {
  const d = formatirajDatumPrikaz(datumStr, '');
  if (!d) return '';
  return d.replace(/\s+/g, '').replace(/\.$/, '');
}

export type OpcijePreferiranogTerminaDispecer = {
  /**
   * US-07 AC10: u dispečerskom pregledu jasno da treba kontaktirati korisnika.
   * Korisnički pregledi ostaju na kratkoj poruci.
   */
  dispecerskiPregled?: boolean;
};

export function preferiraniTerminZaDispecera(
  zahtjev: ServisniZahtjev,
  opcije?: OpcijePreferiranogTerminaDispecer,
): {
  tekstCijeli:    string;
  imaPreferirani: boolean;
} {
  const bezPreferiranogTermina =
    opcije?.dispecerskiPregled === true
      ? 'Dogovor naknadno (kontaktirati korisnika)'
      : 'Dogovor naknadno';

  const schedule = zahtjev.preferred_schedule;
  const nema =
    !schedule ||
    schedule.no_preferred_time === true ||
    (schedule.termini?.length ?? 0) === 0;
  if (nema) return { tekstCijeli: bezPreferiranogTermina, imaPreferirani: false };

  const prvi = schedule.termini[0];
  if (!prvi?.date) return { tekstCijeli: bezPreferiranogTermina, imaPreferirani: false };

  const datum = formatKratkiDatum(prvi.date);
  const tekst = prvi.from && prvi.to ? `${datum}, ${prvi.from}-${prvi.to}` : datum;
  return { tekstCijeli: tekst, imaPreferirani: true };
}

/** Returns all preferred slots for dispatcher display (primarni + alternativni). */
export function sviPreferinaniTermini(
  zahtjev: ServisniZahtjev,
): Array<{ datum: string; od?: string; do?: string; tip: string }> {
  const schedule = zahtjev.preferred_schedule;
  if (!schedule || schedule.no_preferred_time || !schedule.termini?.length) return [];
  const tipovi = ['Primarni', 'Alternativni 1', 'Alternativni 2'];
  return schedule.termini
    .filter(t => t?.date)
    .map((t, i) => ({
      datum: formatKratkiDatum(t.date),
      od:    t.from || undefined,
      do:    t.to   || undefined,
      tip:   tipovi[i] ?? `Termin ${i + 1}`,
    }));
}

export function formatPrijavljenoDatumVrijeme(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = String(d.getFullYear());
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}.${mm}.${yyyy}, ${hh}:${min}`;
}

const MS_MIN = 60_000;
const MS_HOUR = 3_600_000;
const MS_DAY = 86_400_000;

function brojSatiHrvatski(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} sat`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} sata`;
  return `${n} sati`;
}

function brojDanaHrvatski(n: number): string {
  if (n === 1) return '1 dan';
  return `${n} dana`;
}

export type RelativnoPrijavljenoTonDispecer = 'fresh' | 'yesterday' | 'stale';

/** Relativno vrijeme prijave za red dispečerske liste (tooltip = puni datum iz `formatPrijavljenoDatumVrijeme`). */
export function relativnoPrijavljenoZaDispecera(
  iso: string,
  referenca: Date = new Date(),
): { label: string; ton: RelativnoPrijavljenoTonDispecer; tooltipApsolutno: string } {
  const kreirano = new Date(iso);
  const tooltipApsolutno = formatPrijavljenoDatumVrijeme(iso);
  if (Number.isNaN(kreirano.getTime())) {
    return { label: '-', ton: 'fresh', tooltipApsolutno };
  }

  const diffMs = referenca.getTime() - kreirano.getTime();
  if (diffMs < 0) {
    return { label: tooltipApsolutno, ton: 'fresh', tooltipApsolutno };
  }

  if (diffMs < MS_DAY) {
    if (diffMs < MS_MIN) {
      return { label: 'upravo sada', ton: 'fresh', tooltipApsolutno };
    }
    if (diffMs < MS_HOUR) {
      const m = Math.max(1, Math.floor(diffMs / MS_MIN));
      return { label: `prije ${m} min`, ton: 'fresh', tooltipApsolutno };
    }
    const h = Math.max(1, Math.min(23, Math.floor(diffMs / MS_HOUR)));
    return { label: `prije ${brojSatiHrvatski(h)}`, ton: 'fresh', tooltipApsolutno };
  }

  if (diffMs <= 2 * MS_DAY) {
    const hh = String(kreirano.getHours()).padStart(2, '0');
    const min = String(kreirano.getMinutes()).padStart(2, '0');
    return { label: `jučer u ${hh}:${min}`, ton: 'yesterday', tooltipApsolutno };
  }

  const d = Math.max(1, Math.floor(diffMs / MS_DAY));
  return { label: `prije ${brojDanaHrvatski(d)}`, ton: 'stale', tooltipApsolutno };
}

/**
 * Puno ime podnosioca za prikaz. Sprječava „Nepoznato Nepoznato“ kad API
 * u oba polja stavi isti placeholder.
 */
export function imePrezimePodnosioca(
  podnosilac: { ime: string; prezime: string } | null | undefined,
): string {
  if (!podnosilac) return 'Nepoznato';
  const i = (podnosilac.ime ?? '').trim();
  const p = (podnosilac.prezime ?? '').trim();
  const nep = (s: string) => {
    const l = s.toLowerCase();
    return l === 'nepoznato' || l === 'n/a' || l === '-' || l === 'unknown';
  };
  if (!i && !p) return 'Nepoznato';
  if (nep(i) && nep(p)) return 'Nepoznato';
  if (nep(i) && p) return p;
  if (nep(p) && i) return i;
  const puno = `${i} ${p}`.trim();
  return puno || 'Nepoznato';
}

/** Kratke inicijale za jednoznačnu oznaku uz redni broj zahtjeva (npr. A.M.). */
export function inicijaliPodnosiocaKratko(
  podnosilac: { ime: string; prezime: string } | null | undefined,
): string | null {
  if (!podnosilac) return null;
  const i = (podnosilac.ime ?? '').trim().charAt(0);
  const p = (podnosilac.prezime ?? '').trim().charAt(0);
  const slovo = (c: string) => (/[a-zA-ZČčĆćŽžŠšĐđ]/.test(c) ? c.toLocaleUpperCase('hr-HR') : '');
  const ii = slovo(i);
  const pp = slovo(p);
  if (ii && pp) return `${ii}.${pp}`;
  if (ii) return ii;
  if (pp) return pp;
  return null;
}

/** Prvi slot: dogovoreni termin dispečera, inače korisnikov preferirani. */
export function prviZakazaniTerminSlot(
  agreed: PreferredSchedule | null | undefined,
  preferred: PreferredSchedule | null | undefined,
): { date: string; from?: string; to?: string } | null {
  const a = agreed?.termini?.[0];
  if (a?.date) return { date: a.date, from: a.from, to: a.to };
  const p = preferred?.termini?.[0];
  if (p?.date) return { date: p.date, from: p.from, to: p.to };
  return null;
}
