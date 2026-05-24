/** Korisničke poruke za prijavu - neutralne (bez otkrivanja stanja naloga). */

export const PORUKA_NEISPRAVNA_PRIJAVA =
  'Neispravni podaci za prijavu.';

export const PORUKA_TEHNICKA_PRIJAVA =
  'Trenutno nije moguće izvršiti prijavu. Pokušajte ponovo.';

export const PORUKA_RATE_LIMIT_PRIJAVA =
  'Previše pokušaja prijave. Sačekajte 5 minuta i pokušajte ponovo.';

export type MapiranaGreskaPrijave = {
  poruka: string;
  evidentirajNeuspjesanPokusaj: boolean;
};

function jeTehnickaGreska(greska: { message?: string; status?: number }): boolean {
  const status = greska.status;
  if (typeof status === 'number' && status >= 500) return true;
  const m = (greska.message ?? '').toLowerCase();
  return (
    m.includes('failed to fetch') ||
    m.includes('networkerror') ||
    m.includes('network request failed') ||
    m.includes('load failed')
  );
}

/** Mapira Supabase Auth grešku nakon signInWithPassword. */
export function mapirajGreskuPrijaveSupabase(greska: {
  message: string;
  status?: number;
}): MapiranaGreskaPrijave {
  const porukaLower = greska.message?.toLowerCase() ?? '';
  const status = greska.status;

  if (status === 429 || porukaLower.includes('too many requests')) {
    return { poruka: PORUKA_RATE_LIMIT_PRIJAVA, evidentirajNeuspjesanPokusaj: false };
  }

  if (jeTehnickaGreska(greska)) {
    return { poruka: PORUKA_TEHNICKA_PRIJAVA, evidentirajNeuspjesanPokusaj: false };
  }

  return { poruka: PORUKA_NEISPRAVNA_PRIJAVA, evidentirajNeuspjesanPokusaj: true };
}
