type AnyDB = {
  rpc: (fn: string, params?: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>;
};

/**
 * US-47: atomično povećaj brojač ponovnih operativnih ciklusa i vrati novi broj.
 * Koristi DB funkciju fn_inkrementiraj_ponovni_ciklus (RETURNING) — nema race conditiona.
 */
export async function inkrementirajPonovniCiklus(
  db: AnyDB,
  zahtjevId: number,
): Promise<number> {
  const { data } = await db.rpc('fn_inkrementiraj_ponovni_ciklus', { p_zahtjev_id: zahtjevId });
  return typeof data === 'number' ? data : 1;
}

export function labelPonovnogCiklusa(broj: number): string | null {
  if (broj <= 0) return null;
  if (broj === 1) return 'Nije riješeno iz prve';
  return `Ponovni ciklus (${broj})`;
}
