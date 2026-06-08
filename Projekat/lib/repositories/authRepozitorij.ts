import { mapirajGreskuPrijaveSupabase } from '@/lib/auth/greskaPrijave';
import { createClient } from '@/lib/supabase/server';

function normalizujEmail(email: string) {
  return email
    .trim()
    .replace(/^["']+|["']+$/g, '')
    .toLowerCase();
}

export type RegistracijaParams = {
  email: string;
  lozinka: string;
  ime: string;
  prezime: string;
  uloga: string;
};

export type RezultatPrijaveRepozitorija = {
  greska?: string;
  evidentirajNeuspjesanPokusaj?: boolean;
};

export interface IAuthRepozitorij {
  prijaviKorisnika(
    email: string,
    lozinka: string,
  ): Promise<RezultatPrijaveRepozitorija>;
  registrujKorisnika(params: RegistracijaParams): Promise<{ greska?: string }>;
  odjaviKorisnika(): Promise<void>;
}

export class SupabaseAuthRepozitorij implements IAuthRepozitorij {
  async prijaviKorisnika(email: string, lozinka: string) {
    const supabase = createClient();
    const normalizovanEmail = normalizujEmail(email);
    const { error } = await supabase.auth.signInWithPassword({
      email: normalizovanEmail,
      password: lozinka,
    });
    if (!error) return {};
    const { poruka, evidentirajNeuspjesanPokusaj } =
      mapirajGreskuPrijaveSupabase(error);
    return { greska: poruka, evidentirajNeuspjesanPokusaj };
  }

  async registrujKorisnika({
    email,
    lozinka,
    ime,
    prezime,
    uloga,
  }: RegistracijaParams) {
    const supabase = createClient();
    const normalizovanEmail = normalizujEmail(email);
    const { error } = await supabase.auth.signUp({
      email: normalizovanEmail,
      password: lozinka,
      options: { data: { ime, prezime, uloga } },
    });
    return { greska: error?.message };
  }

  async odjaviKorisnika() {
    const supabase = createClient();
    await supabase.auth.signOut();
  }
}
