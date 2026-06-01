// Lokalni tipovi za tabele koje nisu u generiranim DB tipovima
// ili čiji join rezultati nisu automatski inferovani
type UposlenikSaUlogom = {
  id_uloge: number | null
  uloga: { naziv: string | null } | { naziv: string | null }[] | null
}

type ServiceRequestBasic = {
  serviser_dodijeljen_id: string | null
  status: string
  is_premium: boolean | null
}

const TERMINALNI_STATUSI_ARHIVA = new Set(['zavrseno', 'zatvoreno']);

function getUlogaNaziv(uloga: unknown): string {
  if (!uloga) return '';
  if (Array.isArray(uloga)) return (uloga[0] as { naziv?: string })?.naziv ?? '';
  return (uloga as { naziv?: string })?.naziv ?? '';
}

export async function assertServiserAccess(
  supabase: any,
  userId:   string
): Promise<boolean> {
  const { data } = await supabase
    .from('uposlenici')
    .select('id_uloge, uloga(naziv)')
    .eq('id_uposlenika', userId)
    .maybeSingle() as unknown as { data: UposlenikSaUlogom | null }

  if (!data) return false;
  const naziv = getUlogaNaziv(data.uloga);
  return naziv === 'Serviser' || naziv === 'serviser';
}

export type ServiserPristupDetalj =
  | {
      ok: true;
      status: string;
      is_premium: boolean;
      nivo: 'glavni';
      samo_citanje: false;
    }
  | {
      ok: true;
      status: string;
      is_premium: boolean;
      nivo: 'pomocni' | 'arhiva';
      samo_citanje: true;
    }
  | { ok: false; greska: string };

async function serviserJeUTimu(
  supabase: any,
  zahtjevId: number,
  serviserId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from('tim_intervencije')
    .select('serviser_id')
    .eq('zahtjev_id', zahtjevId)
    .eq('serviser_id', serviserId)
    .maybeSingle();
  return !!data;
}

async function serviserImaEvidenciju(
  supabase: any,
  zahtjevId: number,
  serviserId: string,
): Promise<boolean> {
  const { count } = await supabase
    .from('work_evidence')
    .select('*', { count: 'exact', head: true })
    .eq('zahtjev_id', zahtjevId)
    .eq('serviser_id', serviserId);
  return (count ?? 0) > 0;
}

async function serviserImaAktivnostNaZahtjevu(
  supabase: any,
  zahtjevId: number,
  serviserId: string,
): Promise<boolean> {
  const { count } = await supabase
    .from('intervention_activities')
    .select('*', { count: 'exact', head: true })
    .eq('zahtjev_id', zahtjevId)
    .eq('autor_id', serviserId);
  return (count ?? 0) > 0;
}

const STATUSI_PREGLED_NAKON_SUDJELOVANJA = new Set(['potvrdeno', 'in_review']);

/**
 * Detalj intervencije: glavni serviser (puna prava), član tima ili arhiva (samo čitanje).
 */
export async function provjeriServiserPristupDetalju(
  supabase: any,
  zahtjevId: number,
  serviserId: string,
): Promise<ServiserPristupDetalj> {
  const { data } = await supabase
    .from('service_requests')
    .select('serviser_dodijeljen_id, status, is_premium')
    .eq('id', zahtjevId)
    .maybeSingle() as unknown as { data: ServiceRequestBasic | null };

  if (!data) return { ok: false, greska: 'Zahtjev nije pronađen.' };

  const isPremium = Boolean(data.is_premium);
  const status = data.status;

  if (data.serviser_dodijeljen_id === serviserId) {
    return {
      ok: true,
      status,
      is_premium: isPremium,
      nivo: 'glavni',
      samo_citanje: false,
    };
  }

  if (await serviserJeUTimu(supabase, zahtjevId, serviserId)) {
    return {
      ok: true,
      status,
      is_premium: isPremium,
      nivo: 'pomocni',
      samo_citanje: true,
    };
  }

  if (STATUSI_PREGLED_NAKON_SUDJELOVANJA.has(status)) {
    const [imaAktivnost, imaEvidenciju] = await Promise.all([
      serviserImaAktivnostNaZahtjevu(supabase, zahtjevId, serviserId),
      serviserImaEvidenciju(supabase, zahtjevId, serviserId),
    ]);
    if (imaAktivnost || imaEvidenciju) {
      return {
        ok: true,
        status,
        is_premium: isPremium,
        nivo: 'arhiva',
        samo_citanje: true,
      };
    }
  }

  if (TERMINALNI_STATUSI_ARHIVA.has(status)) {
    const imaEvidenciju = await serviserImaEvidenciju(supabase, zahtjevId, serviserId);
    if (imaEvidenciju) {
      return {
        ok: true,
        status,
        is_premium: isPremium,
        nivo: 'arhiva',
        samo_citanje: true,
      };
    }
  }

  if (TERMINALNI_STATUSI_ARHIVA.has(status)) {
    return {
      ok: false,
      greska:
        'Ova intervencija je završena i više niste dodijeljeni kao izvršilac. Pregled je dostupan samo za zadatke na kojima ste radili.',
    };
  }

  return {
    ok: false,
    greska:
      'Nemate pristup ovom zadatku. Moguće je da je intervencija vraćena dispečeru ili dodijeljena drugom serviseru.',
  };
}

/** Striktna provjera za PATCH — samo trenutno dodijeljeni glavni serviser. */
export async function assertServiserVlasnistvo(
  supabase:   any,
  zahtjevId:  number,
  servizerId: string
): Promise<{ ok: true; status: string; is_premium: boolean } | { ok: false; greska: string }> {
  const pristup = await provjeriServiserPristupDetalju(supabase, zahtjevId, servizerId);
  if (!pristup.ok) return pristup;
  if (pristup.nivo !== 'glavni') {
    return {
      ok: false,
      greska: 'Samo dodijeljeni glavni serviser može mijenjati ovaj zadatak.',
    };
  }
  return { ok: true, status: pristup.status, is_premium: pristup.is_premium };
}

export const SERVISER_DOZVOLJENI_PRIJELAZI: Record<string, string[]> = {
  dodijeljeno:  ['u_radu'],
  u_radu:       ['u_izvrsenju'],
  u_izvrsenju:  [],
};

export function serviserSmijeMijenjatiStatus(
  trenutni: string,
  novi:     string
): boolean {
  return (SERVISER_DOZVOLJENI_PRIJELAZI[trenutni] ?? []).includes(novi);
}
