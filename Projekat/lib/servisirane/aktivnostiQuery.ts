/** Učitavanje intervention_activities + autor (osoba + uloga iz actor_role / uposlenici). */

export type AktivnostSaAutorom = Record<string, unknown> & {
  autor?: { ime: string; prezime: string; uloga: string } | null;
};

type DbClient = { from: (table: string) => unknown };

export async function ucitajAktivnostiSaAutorom(
  db: DbClient,
  zahtjevId: number
): Promise<AktivnostSaAutorom[]> {
  const table = db.from('intervention_activities') as {
    select: (cols: string) => {
      eq: (col: string, val: number) => {
        order: (
          col: string,
          opts: { ascending: boolean }
        ) => Promise<{
          data: Record<string, unknown>[] | null;
          error: { message: string } | null;
        }>;
      };
    };
  };

  const { data: rows, error } = await table
    .select('*')
    .eq('zahtjev_id', zahtjevId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[aktivnostiQuery]', error.message);
    return [];
  }
  if (!rows?.length) return [];

  const autorIds = [...new Set(rows.map((r) => r.autor_id as string).filter(Boolean))];

  const osobaTable = db.from('osoba') as {
    select: (cols: string) => {
      in: (
        col: string,
        vals: string[]
      ) => Promise<{
        data: { id_osobe: string; ime: string; prezime: string }[] | null;
        error: { message: string } | null;
      }>;
    };
  };
  const { data: osobe, error: osobaErr } = await osobaTable
    .select('id_osobe, ime, prezime')
    .in('id_osobe', autorIds);

  if (osobaErr) {
    console.error('[aktivnostiQuery] osoba:', osobaErr.message);
  }

  const uposleniciTable = db.from('uposlenici') as {
    select: (cols: string) => {
      in: (
        col: string,
        vals: string[]
      ) => Promise<{
        data: { id_uposlenika: string; uloga: { naziv: string } | { naziv: string }[] | null }[] | null;
      }>;
    };
  };
  const { data: uposlenici } = await uposleniciTable
    .select('id_uposlenika, uloga(naziv)')
    .in('id_uposlenika', autorIds);

  const ulogaIzUposlenika = new Map<string, string>();
  for (const u of uposlenici ?? []) {
    const naziv = Array.isArray(u.uloga)
      ? u.uloga[0]?.naziv
      : u.uloga?.naziv;
    if (naziv) {
      ulogaIzUposlenika.set(
        u.id_uposlenika,
        naziv.toLowerCase().includes('dispe')
          ? 'dispecer'
          : naziv.toLowerCase().includes('servis')
            ? 'serviser'
            : naziv.toLowerCase()
      );
    }
  }

  const osobaMap = new Map(
    (osobe ?? []).map((o) => [o.id_osobe, { ime: o.ime, prezime: o.prezime }])
  );

  return rows.map((a) => {
    const os = osobaMap.get(a.autor_id as string);
    const uloga =
      (a.actor_role as string) ||
      ulogaIzUposlenika.get(a.autor_id as string) ||
      'sistem';
    return {
      ...a,
      autor: os
        ? { ime: os.ime, prezime: os.prezime, uloga }
        : { ime: 'Nepoznato', prezime: '', uloga },
    };
  }) as AktivnostSaAutorom[];
}

export function mapAktivnostiResponse(aktivnosti: AktivnostSaAutorom[]) {
  return aktivnosti.map((a) => ({
    ...a,
    autor: Array.isArray(a.autor) ? a.autor[0] : a.autor,
  }));
}
