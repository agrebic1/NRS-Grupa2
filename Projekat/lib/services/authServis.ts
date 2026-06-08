import { z } from 'zod';
import {
  type IAuthRepozitorij,
  type RegistracijaParams,
  SupabaseAuthRepozitorij,
} from '@/lib/repositories/authRepozitorij';
import {
  clearLoginRateLimit,
  isLoginBlocked,
  recordFailedLoginAttempt,
} from '@/lib/security/loginRateLimiter';

function normalizujEmail(email: string) {
  return email
    .trim()
    .replace(/^["']+|["']+$/g, '')
    .toLowerCase();
}

export const prijavaSchema = z.object({
  email: z
    .string()
    .transform(normalizujEmail)
    .pipe(
      z
        .string()
        .min(1, 'Unesite email i lozinku.')
        .email('Unesite ispravnu email adresu.'),
    ),
  lozinka: z
    .string()
    .min(1, 'Unesite email i lozinku.')
    .min(6, 'Lozinka mora imati najmanje 6 znakova.'),
});

export const registracijaSchema = z.object({
  email: z
    .string()
    .transform(normalizujEmail)
    .pipe(z.string().email('Neispravna email adresa.')),
  lozinka: z.string().min(6, 'Lozinka mora imati najmanje 6 znakova.'),
  ime: z.string().min(1, 'Ime je obavezno.'),
  prezime: z.string().min(1, 'Prezime je obavezno.'),
  uloga: z.enum(['Klijent', 'Dispečer', 'Serviser', 'Administrator'], {
    errorMap: () => ({ message: 'Odabrana uloga nije dozvoljena.' }),
  }),
});

export type PrijavaParams = z.infer<typeof prijavaSchema>;

type RezultatOperacije = { greska?: string };

export class AuthServis {
  constructor(
    private readonly repozitorij: IAuthRepozitorij = new SupabaseAuthRepozitorij(),
  ) {}

  async prijava(params: PrijavaParams): Promise<RezultatOperacije> {
    const rezultat = prijavaSchema.safeParse(params);
    if (!rezultat.success) {
      return { greska: rezultat.error.errors[0].message };
    }

    const email = rezultat.data.email;
    if (isLoginBlocked(email)) {
      return {
        greska:
          'Previše pokušaja prijave. Sačekajte 5 minuta i pokušajte ponovo.',
      };
    }

    const response = await this.repozitorij.prijaviKorisnika(
      email,
      rezultat.data.lozinka,
    );
    if (response.greska) {
      if (response.evidentirajNeuspjesanPokusaj !== false) {
        recordFailedLoginAttempt(email);
      }
      return { greska: response.greska };
    }

    clearLoginRateLimit(email);
    return response;
  }

  async registracija(params: RegistracijaParams): Promise<RezultatOperacije> {
    const rezultat = registracijaSchema.safeParse(params);
    if (!rezultat.success) {
      return { greska: rezultat.error.errors[0].message };
    }
    return this.repozitorij.registrujKorisnika(rezultat.data);
  }

  async odjava(): Promise<void> {
    await this.repozitorij.odjaviKorisnika();
  }
}
