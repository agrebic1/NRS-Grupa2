type AnyDB = {
  from: (t: string) => {
    select: (c: string) => {
      eq: (col: string, val: unknown) => { single: () => Promise<{ data: { broj_ponovnih_ciklusa?: number } | null }> };
    };
    update: (p: Record<string, unknown>) => {
      eq: (col: string, val: unknown) => Promise<{ error: { message: string } | null }>;
    };
  };
};

/** US-47: povećaj brojač ponovnih operativnih ciklusa. */
export async function inkrementirajPonovniCiklus(
  db: AnyDB,
  zahtjevId: number,
): Promise<number> {
  const { data } = await db
    .from('service_requests')
    .select('broj_ponovnih_ciklusa')
    .eq('id', zahtjevId)
    .single();

  const trenutni = data?.broj_ponovnih_ciklusa ?? 0;
  const novi = trenutni + 1;

  await db
    .from('service_requests')
    .update({ broj_ponovnih_ciklusa: novi })
    .eq('id', zahtjevId);

  return novi;
}

export function labelPonovnogCiklusa(broj: number): string | null {
  if (broj <= 0) return null;
  if (broj === 1) return 'Nije riješeno iz prve';
  return `Ponovni ciklus (${broj})`;
}
