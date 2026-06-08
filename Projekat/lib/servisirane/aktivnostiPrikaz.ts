import type {
  InterventionActivity,
  TipAktivnosti,
} from '@/domain/types/servisirane';

const STATUS_LABELE: Record<string, string> = {
  na_cekanju: 'Na čekanju',
  pending_review: 'Na pregledu',
  in_review: 'U pregledu',
  potvrdeno: 'Potvrđeno',
  dodijeljeno: 'Dodijeljeno',
  u_radu: 'Na putu',
  u_izvrsenju: 'Na terenu',
  zavrseno: 'Završeno',
  zavrseno_zatvoreno: 'Završeno i zatvoreno',
  zatvoreno: 'Zatvoreno',
  odbijeno: 'Odbijeno',
  otkazano: 'Otkazano',
};

const PRIORITET_LABELE: Record<string, string> = {
  NISKO: 'Nisko',
  SREDNJE: 'Srednje',
  VISOKO: 'Visoko',
  HITNO: 'Hitno',
  KRITIČNO: 'Kritično',
  KRITICNO: 'Kritično',
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function formatirajImeOsobe(
  ime?: string | null,
  prezime?: string | null,
): string {
  return `${ime ?? ''} ${prezime ?? ''}`.trim();
}

/** Čitljiv operativni prioritet za audit (US-39). */
export function labelOperativnogPrioriteta(
  v: string | null | undefined,
): string {
  if (!v?.trim()) return 'Nije postavljen';
  const k = v.trim().toUpperCase();
  return PRIORITET_LABELE[k] ?? v.trim();
}

function jeUuid(v: string): boolean {
  return UUID_RE.test(v.trim());
}

function metaString(meta: Record<string, unknown>, key: string): string | null {
  const v = meta[key];
  return typeof v === 'string' && v.trim().length > 0 ? v.trim() : null;
}

/** Naziv polja u tabeli historije (US-44). */
export function nazivPoljaAktivnosti(a: InterventionActivity): string {
  const meta = (a.metadata ?? {}) as Record<string, unknown>;
  switch (a.tip) {
    case 'promjena_prioriteta':
      return 'Operativni prioritet';
    case 'promjena_izvrsioca':
      return 'Izvršilac';
    case 'dodjela':
      return 'Dodjela servisera';
    case 'status_promjena':
    case 'zatvaranje':
    case 'vracanje_na_dodjelu':
    case 'nije_rijeseno':
      return 'Status';
    case 'odbijanje':
      return 'Odluka o zahtjevu';
    case 'napomena':
      return 'Napomena';
    case 'evidencija':
      return 'Evidencija rada';
    case 'konflikt_override':
      return 'Konflikt termina';
    case 'tim_dodjela':
    case 'tim_uklanjanje':
      return 'Tim';
    case 'sla_eskalacija':
      return 'SLA eskalacija';
    case 'slika':
      return 'Prilog';
    default:
      return meta.polje ? String(meta.polje) : 'Događaj';
  }
}

/** Čitljiv prikaz vrijednosti u historiji (statusi, prioriteti, imena). */
export function prikazVrijednostiAktivnosti(
  v: string | null | undefined,
): string | null {
  if (!v) return null;
  const trimmed = v.trim();
  if (!trimmed) return null;
  if (jeUuid(trimmed)) return null;
  return (
    STATUS_LABELE[trimmed] ?? PRIORITET_LABELE[trimmed.toUpperCase()] ?? trimmed
  );
}

/** Stara/nova vrijednost za audit prikaz (tabela i timeline). */
export function prikazStareNoveVrijednostiAktivnosti(a: InterventionActivity): {
  stara: string | null;
  nova: string | null;
} {
  const meta = (a.metadata ?? {}) as Record<string, unknown>;

  if (a.tip === 'promjena_prioriteta') {
    return {
      stara:
        metaString(meta, 'stari_prioritet_label') ??
        labelOperativnogPrioriteta(metaString(meta, 'stari_prioritet')) ??
        prikazVrijednostiAktivnosti(a.old_value) ??
        'Nije postavljen',
      nova:
        metaString(meta, 'novi_prioritet_label') ??
        labelOperativnogPrioriteta(metaString(meta, 'novi_prioritet')) ??
        prikazVrijednostiAktivnosti(a.new_value) ??
        null,
    };
  }

  if (a.tip === 'promjena_izvrsioca') {
    const stara =
      metaString(meta, 'iz_servisera_ime') ??
      prikazVrijednostiAktivnosti(a.old_value) ??
      (a.old_value && jeUuid(a.old_value) ? 'Prethodni serviser' : null);
    const nova =
      metaString(meta, 'na_servisera_ime') ??
      prikazVrijednostiAktivnosti(a.new_value) ??
      (a.new_value && jeUuid(a.new_value) ? 'Novi serviser' : null);
    return { stara, nova };
  }

  if (a.tip === 'dodjela') {
    const serviser =
      metaString(meta, 'serviser_ime') ??
      (a.new_value && !jeUuid(a.new_value) && !STATUS_LABELE[a.new_value]
        ? a.new_value
        : null);
    return {
      stara:
        prikazVrijednostiAktivnosti(a.old_value) ??
        prikazVrijednostiAktivnosti(metaString(meta, 'iz')),
      nova: serviser
        ? `Dodijeljeno — ${serviser}`
        : (prikazVrijednostiAktivnosti(a.new_value) ?? 'Dodijeljeno'),
    };
  }

  if (a.tip === 'status_promjena' && metaString(meta, 'final_priority')) {
    const p = labelOperativnogPrioriteta(metaString(meta, 'final_priority'));
    return {
      stara: prikazVrijednostiAktivnosti(a.old_value),
      nova: `${prikazVrijednostiAktivnosti(a.new_value) ?? a.new_value} (prioritet: ${p})`,
    };
  }

  if (a.tip === 'sla_eskalacija') {
    const p = metaString(meta, 'prioritet');
    return {
      stara: null,
      nova: p ? `Prioritet: ${labelOperativnogPrioriteta(p)}` : null,
    };
  }

  return {
    stara: prikazVrijednostiAktivnosti(a.old_value),
    nova: prikazVrijednostiAktivnosti(a.new_value),
  };
}

/** Opis događaja u tabeli / timelineu. */
export function prikazOpisaAktivnosti(a: InterventionActivity): string {
  const meta = (a.metadata ?? {}) as Record<string, unknown>;

  if (a.tip === 'promjena_prioriteta') {
    const razlog =
      a.razlog?.trim() || metaString(meta, 'premium_downgrade_reason');
    const osnova = a.sadrzaj?.trim() || 'Promjena operativnog prioriteta';
    return razlog ? `${osnova}. Obrazloženje: ${razlog}` : osnova;
  }

  if (a.tip === 'promjena_izvrsioca') {
    const razlog = a.razlog?.trim();
    if (razlog) return `Promjena izvršioca — razlog: ${razlog}`;
    if (a.sadrzaj?.trim()) return a.sadrzaj;
    return 'Promjena izvršioca';
  }

  if (a.tip === 'dodjela') {
    const serviser = metaString(meta, 'serviser_ime');
    if (serviser) return `Dodjela serviseru: ${serviser}`;
    return a.sadrzaj?.trim() || 'Dodjela servisera';
  }

  if (a.tip === 'napomena') {
    return a.sadrzaj?.trim() || 'Napomena';
  }

  return a.sadrzaj?.trim() || nazivPoljaAktivnosti(a);
}
