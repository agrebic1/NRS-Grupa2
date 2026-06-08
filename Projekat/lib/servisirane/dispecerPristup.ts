export function getUlogaNaziv(uloga: unknown): string {
  if (!uloga) return '';
  if (Array.isArray(uloga))
    return (uloga[0] as { naziv?: string })?.naziv ?? '';
  return (uloga as { naziv?: string })?.naziv ?? '';
}

export function jeDispecerIliAdmin(nazivUloge: string): boolean {
  const n = nazivUloge.toLowerCase();
  return ['dispečer', 'dispecer', 'administrator', 'admin'].includes(n);
}

// supabase: any - izbjegava nekompatibilnost između @supabase/ssr i @supabase/supabase-js generičkih parametara
export async function assertDispatcherAccess(
  supabase: any,
  userId: string,
): Promise<boolean> {
  const { data: uposlenik } = await supabase
    .from('uposlenici')
    .select('uloga(naziv)')
    .eq('id_uposlenika', userId)
    .maybeSingle();

  const naziv = getUlogaNaziv(uposlenik?.uloga);
  return jeDispecerIliAdmin(naziv);
}
