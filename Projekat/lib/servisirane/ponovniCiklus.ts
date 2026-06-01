type AnyDB = {
  rpc: (fn: string, params?: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>;
  from: (table: string) => {
    select: (cols: string) => {
      eq: (col: string, val: unknown) => {
        eq?: (col: string, val: unknown) => {
          maybeSingle: () => Promise<{ data: { broj_ponovnih_ciklusa?: number | null } | null; error: { message: string } | null }>;
          single: () => Promise<{ data: { broj_ponovnih_ciklusa?: number | null } | null; error: { message: string } | null }>;
        };
        maybeSingle: () => Promise<{ data: { broj_ponovnih_ciklusa?: number | null } | null; error: { message: string } | null }>;
        single: () => Promise<{ data: { broj_ponovnih_ciklusa?: number | null } | null; error: { message: string } | null }>;
      };
    };
    update: (vals: Record<string, unknown>) => {
      eq: (col: string, val: unknown) => {
        select: (cols: string) => {
          single: () => Promise<{ data: { broj_ponovnih_ciklusa?: number | null } | null; error: { message: string } | null }>;
        };
      };
    };
  };
};

/**
 * US-47: atomično povećaj brojač ponovnih operativnih ciklusa i vrati novi broj.
 * Koristi DB funkciju fn_inkrementiraj_ponovni_ciklus; ako RPC nije dostupan, fallback UPDATE.
 */
export async function inkrementirajPonovniCiklus(
  db: AnyDB,
  zahtjevId: number,
): Promise<number> {
  const { data, error } = await db.rpc('fn_inkrementiraj_ponovni_ciklus', { p_zahtjev_id: zahtjevId });

  if (!error && typeof data === 'number' && Number.isFinite(data)) {
    return data;
  }

  const { data: row, error: readErr } = await db
    .from('service_requests')
    .select('broj_ponovnih_ciklusa')
    .eq('id', zahtjevId)
    .maybeSingle();

  if (readErr || !row) {
    const rpcMsg = error?.message?.trim();
    throw new Error(
      rpcMsg
        ? `Brojač ponovnih ciklusa nije ažuriran (RPC): ${rpcMsg}`
        : readErr?.message ?? 'Zahtjev nije pronađen pri ažuriranju brojača ponovnih ciklusa.',
    );
  }

  const novi = (row.broj_ponovnih_ciklusa ?? 0) + 1;
  const { data: updated, error: updErr } = await db
    .from('service_requests')
    .update({ broj_ponovnih_ciklusa: novi })
    .eq('id', zahtjevId)
    .select('broj_ponovnih_ciklusa')
    .single();

  if (updErr || updated?.broj_ponovnih_ciklusa == null) {
    throw new Error(updErr?.message ?? 'Ažuriranje brojača ponovnih ciklusa nije uspjelo.');
  }

  return updated.broj_ponovnih_ciklusa;
}

export function labelPonovnogCiklusa(broj: number): string | null {
  if (broj <= 0) return null;
  if (broj === 1) return 'Nije riješeno iz prve';
  return `Ponovni ciklus (${broj})`;
}
