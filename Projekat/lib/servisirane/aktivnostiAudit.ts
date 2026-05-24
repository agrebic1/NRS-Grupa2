import type { TipAktivnosti } from '@/domain/types/servisirane';

export interface ZabiljeziAktivnostParams {
  zahtjev_id: number;
  autor_id:   string;
  tip:        TipAktivnosti;
  sadrzaj:    string;
  actor_role?: string | null;
  old_value?:  string | null;
  new_value?:  string | null;
  razlog?:     string | null;
  metadata?:   Record<string, unknown> | null;
}

/** Centralni insert u intervention_activities (Sprint 9 - konzistentan audit). */
export async function zabiljeziAktivnost(
  db: AnyDB,
  params: ZabiljeziAktivnostParams,
): Promise<void> {
  const { error } = await db.from('intervention_activities').insert({
    zahtjev_id: params.zahtjev_id,
    autor_id:   params.autor_id,
    tip:        params.tip,
    sadrzaj:    params.sadrzaj,
    actor_role: params.actor_role ?? null,
    old_value:  params.old_value ?? null,
    new_value:  params.new_value ?? null,
    razlog:     params.razlog ?? null,
    metadata:   params.metadata ?? null,
  });
  if (error) throw new Error(error.message);
}

type AnyDB = { from: (table: string) => { insert: (row: unknown) => Promise<{ error: { message: string } | null }> } };
