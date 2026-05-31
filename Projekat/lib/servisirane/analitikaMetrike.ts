// US-49: Analitičke metrike za dispečerski dashboard.
//
// Sve funkcije su čiste (pure) i rade nad već dohvaćenim redovima — izračun se
// može jedinično testirati neovisno o bazi. SLA ocjena koristi iste rokove kao
// izvještaj odziva (US-42), pa su prikazani podaci konzistentni.

import { SLA_ROKOVI_SATI } from '@/lib/servisirane/slaPravila';

// ─── Ulazni redovi (podskup kolona service_requests) ───────────────────────────

export interface AnalitikaZahtjevRed {
  id:                       number;
  status:                   string;
  final_priority:           string | null;
  created_at:               string;
  updated_at:               string;
  serviser_dodijeljen_id:   string | null;
  broj_ponovnih_ciklusa:    number | null;
}

// ─── Izlazni tipovi ─────────────────────────────────────────────────────────────

export interface StatusRaspodjela {
  status: string;
  broj:   number;
}

export interface SlaRaspodjela {
  na_vrijeme:   number;
  prekoraceno:  number;
  bez_podataka: number;
}

export interface ServiserOpterecenje {
  serviser_id: string;
  ime:         string;
  aktivnih:    number;
  zavrsenih:   number;
}

export interface VremenskiTrend {
  datum: string; // YYYY-MM-DD
  broj:  number;
}

export interface PonovniCiklusiMetrika {
  zahtjeva_s_ponavljanjem: number;
  ukupno_ciklusa:          number;
}

export interface AnalitikaMetrike {
  period:               { od: string; do: string };
  ukupno_zahtjeva:      number;
  ukupno_zavrsenih:     number;
  po_statusu:           StatusRaspodjela[];
  sla:                  SlaRaspodjela;
  avg_odziv_minuta:     number | null;
  avg_trajanje_minuta:  number | null;
  opterecenje_servisera: ServiserOpterecenje[];
  ponovni_ciklusi:      PonovniCiklusiMetrika;
  trend_zavrsenih:      VremenskiTrend[];
}

export interface AnalitikaUlaz {
  period:            { od: string; do: string };
  /** Svi relevantni zahtjevi (za raspodjelu po statusu, opterećenje, ponovne cikluse). */
  sviZahtjevi:       AnalitikaZahtjevRed[];
  /** Zahtjevi završeni u periodu (po updated_at) — za SLA, trend, učinak po serviseru. */
  zavrseniZahtjevi:  AnalitikaZahtjevRed[];
  /** Sve evidentirane vrijednosti trajanja (minuta) završenih intervencija. */
  trajanjaMinuta:    number[];
  /** Svi izračunati odzivi (minuta, dodjela → prihvat). */
  odziviMinuta:      number[];
  /** Mapiranje serviser_id → puno ime (ime prezime). */
  imenaServisera:    Record<string, string>;
}

// ─── Statusi koji se broje kao aktivno opterećenje servisera ────────────────────

const AKTIVNI_STATUSI = new Set(['dodijeljeno', 'u_radu', 'u_izvrsenju']);

// ─── Pure helperi ───────────────────────────────────────────────────────────────

export function prosjek(vrijednosti: number[]): number | null {
  if (vrijednosti.length === 0) return null;
  return Math.round(vrijednosti.reduce((s, v) => s + v, 0) / vrijednosti.length);
}

/** Broj zahtjeva po statusu, sortirano silazno. */
export function raspodjelaPoStatusu(
  zahtjevi: Pick<AnalitikaZahtjevRed, 'status'>[],
): StatusRaspodjela[] {
  const map = new Map<string, number>();
  for (const z of zahtjevi) {
    map.set(z.status, (map.get(z.status) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([status, broj]) => ({ status, broj }))
    .sort((a, b) => b.broj - a.broj);
}

/**
 * Je li intervencija završena unutar SLA roka?
 * null = nema prioriteta ili prioritet nije u tablici rokova.
 */
export function jeSlaIspunjen(
  final_priority: string | null,
  created_at: string,
  updated_at: string,
): boolean | null {
  if (!final_priority || !(final_priority in SLA_ROKOVI_SATI)) return null;
  const slaMs  = SLA_ROKOVI_SATI[final_priority as keyof typeof SLA_ROKOVI_SATI] * 3_600_000;
  const trajMs = new Date(updated_at).getTime() - new Date(created_at).getTime();
  return trajMs <= slaMs;
}

/** SLA raspodjela (na vrijeme / prekoračeno / bez podataka) nad završenim zahtjevima. */
export function slaRaspodjela(zavrseni: AnalitikaZahtjevRed[]): SlaRaspodjela {
  const r: SlaRaspodjela = { na_vrijeme: 0, prekoraceno: 0, bez_podataka: 0 };
  for (const z of zavrseni) {
    const ok = jeSlaIspunjen(z.final_priority, z.created_at, z.updated_at);
    if (ok === null) r.bez_podataka++;
    else if (ok) r.na_vrijeme++;
    else r.prekoraceno++;
  }
  return r;
}

/** Opterećenje po serviseru: aktivnih (u radu) + završenih u periodu. */
export function opterecenjePoServiseru(
  sviZahtjevi: AnalitikaZahtjevRed[],
  zavrseniZahtjevi: AnalitikaZahtjevRed[],
  imena: Record<string, string>,
): ServiserOpterecenje[] {
  const aktivni  = new Map<string, number>();
  const zavrseni = new Map<string, number>();

  for (const z of sviZahtjevi) {
    if (z.serviser_dodijeljen_id && AKTIVNI_STATUSI.has(z.status)) {
      aktivni.set(z.serviser_dodijeljen_id, (aktivni.get(z.serviser_dodijeljen_id) ?? 0) + 1);
    }
  }
  for (const z of zavrseniZahtjevi) {
    if (z.serviser_dodijeljen_id) {
      zavrseni.set(z.serviser_dodijeljen_id, (zavrseni.get(z.serviser_dodijeljen_id) ?? 0) + 1);
    }
  }

  const sviIds = new Set<string>([...aktivni.keys(), ...zavrseni.keys()]);
  return [...sviIds]
    .map((id) => ({
      serviser_id: id,
      ime:         imena[id] ?? 'Nepoznat serviser',
      aktivnih:    aktivni.get(id) ?? 0,
      zavrsenih:   zavrseni.get(id) ?? 0,
    }))
    .sort((a, b) => b.aktivnih + b.zavrsenih - (a.aktivnih + a.zavrsenih));
}

/** Broj zahtjeva s ponovnim ciklusima i ukupan broj ciklusa. */
export function ponovniCiklusiMetrika(
  zahtjevi: Pick<AnalitikaZahtjevRed, 'broj_ponovnih_ciklusa'>[],
): PonovniCiklusiMetrika {
  let zahtjeva = 0;
  let ukupno   = 0;
  for (const z of zahtjevi) {
    const n = z.broj_ponovnih_ciklusa ?? 0;
    if (n > 0) {
      zahtjeva++;
      ukupno += n;
    }
  }
  return { zahtjeva_s_ponavljanjem: zahtjeva, ukupno_ciklusa: ukupno };
}

/** Trend završenih intervencija po danu (sortirano uzlazno po datumu). */
export function trendZavrsenih(
  zavrseni: Pick<AnalitikaZahtjevRed, 'updated_at'>[],
): VremenskiTrend[] {
  const map = new Map<string, number>();
  for (const z of zavrseni) {
    const datum = z.updated_at.substring(0, 10);
    map.set(datum, (map.get(datum) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([datum, broj]) => ({ datum, broj }))
    .sort((a, b) => a.datum.localeCompare(b.datum));
}

// ─── Kompozitni izračun ──────────────────────────────────────────────────────────

export function sastaviMetrike(ulaz: AnalitikaUlaz): AnalitikaMetrike {
  return {
    period:                ulaz.period,
    ukupno_zahtjeva:       ulaz.sviZahtjevi.length,
    ukupno_zavrsenih:      ulaz.zavrseniZahtjevi.length,
    po_statusu:            raspodjelaPoStatusu(ulaz.sviZahtjevi),
    sla:                   slaRaspodjela(ulaz.zavrseniZahtjevi),
    avg_odziv_minuta:      prosjek(ulaz.odziviMinuta),
    avg_trajanje_minuta:   prosjek(ulaz.trajanjaMinuta),
    opterecenje_servisera: opterecenjePoServiseru(ulaz.sviZahtjevi, ulaz.zavrseniZahtjevi, ulaz.imenaServisera),
    ponovni_ciklusi:       ponovniCiklusiMetrika(ulaz.sviZahtjevi),
    trend_zavrsenih:       trendZavrsenih(ulaz.zavrseniZahtjevi),
  };
}
