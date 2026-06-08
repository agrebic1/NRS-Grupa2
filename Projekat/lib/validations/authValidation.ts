import { z } from 'zod';

function normalizujEmail(email: string) {
  return email
    .trim()
    .replace(/^["']+|["']+$/g, '')
    .toLowerCase();
}

// ─── Zahtjevi za lozinku (dijele forma i indikator snage) ─────────────────────

export const ZAHTJEVI_LOZINKE = [
  {
    id: 'duzina',
    oznaka: 'Minimalno 8 karaktera',
    provjeri: (l: string) => l.length >= 8,
  },
  {
    id: 'veliko',
    oznaka: 'Jedno veliko slovo',
    provjeri: (l: string) => /[A-Z]/.test(l),
  },
  {
    id: 'malo',
    oznaka: 'Jedno malo slovo',
    provjeri: (l: string) => /[a-z]/.test(l),
  },
  {
    id: 'broj',
    oznaka: 'Jedan broj',
    provjeri: (l: string) => /[0-9]/.test(l),
  },
  {
    id: 'poseban',
    oznaka: 'Jedan specijalni znak',
    provjeri: (l: string) => /[^A-Za-z0-9]/.test(l),
  },
] as const;

const shemaLozinke = z
  .string()
  .min(8, 'Minimalno 8 karaktera')
  .regex(/[A-Z]/, 'Potrebno je jedno veliko slovo')
  .regex(/[a-z]/, 'Potrebno je jedno malo slovo')
  .regex(/[0-9]/, 'Potreban je jedan broj')
  .regex(/[^A-Za-z0-9]/, 'Potreban je jedan specijalni znak');

// ─── Shema za prijavu ─────────────────────────────────────────────────────────

export const prijavnaShema = z.object({
  email: z
    .string()
    .transform(normalizujEmail)
    .pipe(
      z
        .string()
        .min(1, 'Unesite email i lozinku.')
        .email('Unesite ispravnu email adresu.'),
    ),
  lozinka: z.string().min(1, 'Unesite email i lozinku.'),
});

// ─── Shema za registraciju (samo Korisnik usluge) ─────────────────────────────

export const registracijskaShema = z
  .object({
    ime: z.string().min(2, 'Ime mora imati najmanje 2 karaktera').max(50),
    prezime: z
      .string()
      .min(2, 'Prezime mora imati najmanje 2 karaktera')
      .max(50),
    email: z
      .string()
      .transform(normalizujEmail)
      .pipe(
        z
          .string()
          .min(1, 'Email adresa je obavezna')
          .email('Unesite ispravnu email adresu'),
      ),
    telefon: z
      .string()
      .min(9, 'Unesite ispravan broj telefona')
      .regex(/^[+]?[0-9\s\-()]+$/, 'Unesite ispravan broj telefona'),
    lozinka: shemaLozinke,
    potvrdaLozinke: z.string().min(1, 'Potvrda lozinke je obavezna'),
  })
  .refine((podaci) => podaci.lozinka === podaci.potvrdaLozinke, {
    message: 'Lozinke se ne podudaraju',
    path: ['potvrdaLozinke'],
  });

export type PrijavniPodaci = z.infer<typeof prijavnaShema>;
export type RegistracijskiPodaci = z.infer<typeof registracijskaShema>;
