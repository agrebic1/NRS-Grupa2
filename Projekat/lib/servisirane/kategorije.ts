export type GlavnaKategorijaDef = {
  id: string;
  label: string;
  podkategorije: Array<{ id: string; label: string }>;
};

export const KATEGORIJE_KVARA: GlavnaKategorijaDef[] = [
  {
    id: 'vodovod_kanalizacija',
    label: 'Vodovod i kanalizacija',
    podkategorije: [
      { id: 'curenje_cijevi', label: 'Curenje cijevi' },
      { id: 'zacepljen_odvod', label: 'Začepljen odvod' },
      { id: 'wc_vodokotlic', label: 'WC / vodokotlić' },
      { id: 'slavina_mijesalica', label: 'Slavina / miješalica' },
      { id: 'pritisak_vode', label: 'Slab pritisak vode' },
      { id: 'bojler_prikljucak', label: 'Bojler / priključak' },
      { id: 'miris_iz_odvoda', label: 'Miris iz odvoda' },
      { id: 'ostalo', label: 'Ostalo' },
    ],
  },
  {
    id: 'elektro_rasvjeta',
    label: 'Elektro i rasvjeta',
    podkategorije: [
      { id: 'uticnica', label: 'Utičnica ne radi' },
      { id: 'prekidac', label: 'Prekidač ne radi' },
      { id: 'rasvjeta', label: 'Rasvjeta ne radi / treperi' },
      { id: 'osiguraci', label: 'Osigurači iskaču' },
      { id: 'razvodna_kutija', label: 'Razvodna kutija' },
      { id: 'kratki_spoj', label: 'Kratki spoj / miris paljevine' },
      { id: 'zvono_interfon', label: 'Zvono / interfon napajanje' },
      { id: 'ostalo', label: 'Ostalo' },
    ],
  },
  {
    id: 'grijanje_topla_voda',
    label: 'Grijanje i topla voda',
    podkategorije: [
      { id: 'radijator_ne_grije', label: 'Radijator ne grije' },
      { id: 'curenje_radijatora', label: 'Curenje radijatora' },
      { id: 'ventil_termostat', label: 'Ventil / termostat' },
      { id: 'kotao_pec', label: 'Kotao / peć greška' },
      { id: 'nema_tople_vode', label: 'Nema tople vode' },
      { id: 'slab_pritisak_grijanja', label: 'Slab pritisak grijanja' },
      { id: 'odzracivanje_sistema', label: 'Odzračivanje sistema' },
      { id: 'ostalo', label: 'Ostalo' },
    ],
  },
  {
    id: 'klima_ventilacija',
    label: 'Klima i ventilacija',
    podkategorije: [
      { id: 'ne_hladi_grije', label: 'Ne hladi / ne grije' },
      { id: 'curi_iz_klime', label: 'Curi voda iz klime' },
      { id: 'buka', label: 'Pojačana buka' },
      { id: 'filter_servis', label: 'Filter / redovni servis' },
      { id: 'daljinski_senzor', label: 'Daljinski / senzor' },
      { id: 'ventilator', label: 'Ventilator ne radi' },
      { id: 'slaba_ventilacija', label: 'Slaba ventilacija' },
      { id: 'ostalo', label: 'Ostalo' },
    ],
  },
  {
    id: 'bravarija_stolarija',
    label: 'Bravarija i stolarija',
    podkategorije: [
      { id: 'brava_kljuc', label: 'Brava / ključ' },
      { id: 'vrata_zatvaranje', label: 'Vrata se ne zatvaraju' },
      { id: 'sarke_kvake', label: 'Šarke / kvake' },
      { id: 'prozor_dihovanje', label: 'Prozor ne dihta' },
      { id: 'roletne_komarnici', label: 'Roletne / komarnici' },
      { id: 'sigurnosna_vrata', label: 'Sigurnosna vrata' },
      { id: 'manje_podesavanje', label: 'Manje podešavanje' },
      { id: 'ostalo', label: 'Ostalo' },
    ],
  },
  {
    id: 'gradjevinski_zavrsni',
    label: 'Građevinski i završni radovi',
    podkategorije: [
      { id: 'keramika_plocice', label: 'Keramika / pločice' },
      { id: 'gips_zidovi', label: 'Gips / zidovi' },
      { id: 'moleraj', label: 'Moleraj' },
      { id: 'fuge_silikon', label: 'Fuge / silikoniranje' },
      { id: 'staklo_ogledalo', label: 'Staklo / ogledalo' },
      { id: 'sitni_gradjevinski', label: 'Sitni građevinski popravci' },
      { id: 'plafon_ostecenja', label: 'Plafon / oštećenja' },
      { id: 'ostalo', label: 'Ostalo' },
    ],
  },
  {
    id: 'kucanski_uredjaji',
    label: 'Kućanski uređaji',
    podkategorije: [
      { id: 'ves_masina', label: 'Veš mašina' },
      { id: 'susilica', label: 'Sušilica' },
      { id: 'frizider_zamrzivac', label: 'Frižider / zamrzivač' },
      { id: 'sporet_rerna', label: 'Šporet / rerna' },
      { id: 'perilica_sudja', label: 'Perilica suđa' },
      { id: 'napa', label: 'Napa' },
      { id: 'mali_uredjaji', label: 'Mali uređaji' },
      { id: 'ostalo', label: 'Ostalo' },
    ],
  },
  {
    id: 'it_mreze_smart',
    label: 'IT / mreže / smart uređaji',
    podkategorije: [
      { id: 'internet_wifi', label: 'Internet / Wi-Fi' },
      { id: 'mrezni_prikljucak', label: 'Mrežni priključak' },
      { id: 'tv_signal', label: 'TV signal / STB' },
      { id: 'ip_kamera', label: 'IP kamera' },
      { id: 'smart_lock_interfon', label: 'Smart lock / interfon' },
      { id: 'router_switch', label: 'Router / switch' },
      { id: 'osnovni_softver', label: 'Osnovna konfiguracija softvera' },
      { id: 'ostalo', label: 'Ostalo' },
    ],
  },
  {
    id: 'ostalo',
    label: 'Ostalo',
    podkategorije: [
      { id: 'ciscenje', label: 'Čišćenje' },
      { id: 'eksterijer', label: 'Eksterijer' },
      { id: 'namjestaj', label: 'Namještaj' },
      { id: 'staklorez', label: 'Staklorez' },
      { id: 'transport_montaza', label: 'Transport / montaža' },
      { id: 'pregled_dijagnostika', label: 'Pregled / dijagnostika' },
      { id: 'drugo', label: 'Drugo' },
    ],
  },
];

type KategorijaLike = {
  category?: string | null;
  category_main?: string | null;
  category_sub?: string | null;
};

function nadjiGlavnu(id: string | null | undefined): GlavnaKategorijaDef | undefined {
  if (!id) return undefined;
  return KATEGORIJE_KVARA.find((k) => k.id === id);
}

export function glavnaKategorijaPoId(id: string | null | undefined): GlavnaKategorijaDef | null {
  return nadjiGlavnu(id) ?? null;
}

function parseLegacyCategory(category: string | null | undefined): {
  glavnaLabel: string;
  podkategorijaLabel: string | null;
} {
  const trimmed = (category ?? '').trim();
  if (!trimmed) return { glavnaLabel: 'Zahtjev', podkategorijaLabel: null };
  const match = trimmed.match(/^(.+?)\s*[-\u2013\u2014]\s*(.+)$/);
  if (match) return { glavnaLabel: match[1].trim(), podkategorijaLabel: match[2].trim() || null };
  return { glavnaLabel: trimmed, podkategorijaLabel: null };
}

export function labelKategorije(input: KategorijaLike): { glavna: string; podkategorija: string | null } {
  const glavna = nadjiGlavnu(input.category_main);
  if (!glavna) {
    const leg = parseLegacyCategory(input.category);
    return { glavna: leg.glavnaLabel, podkategorija: leg.podkategorijaLabel };
  }

  const pod = glavna.podkategorije.find((p) => p.id === input.category_sub);
  return {
    glavna: glavna.label,
    podkategorija: pod?.label ?? null,
  };
}

export function validnaKombinacijaKategorije(mainId: string | null | undefined, subId: string | null | undefined): boolean {
  if (!mainId) return false;
  const glavna = nadjiGlavnu(mainId);
  if (!glavna) return false;
  if (glavna.podkategorije.length === 0) return !subId;
  if (!subId) return false;
  return glavna.podkategorije.some((p) => p.id === subId);
}

export function serializujKategoriju(mainId: string, subId?: string | null): {
  category: string;
  category_main: string;
  category_sub: string | null;
} {
  const glavna = nadjiGlavnu(mainId);
  const pod = subId ? glavna?.podkategorije.find((p) => p.id === subId) : undefined;
  const glavnaLabel = glavna?.label ?? mainId;
  const podLabel = pod?.label ?? null;
  return {
    category: podLabel ? `${glavnaLabel} - ${podLabel}` : glavnaLabel,
    category_main: mainId,
    category_sub: subId ?? null,
  };
}
