import { z } from 'zod';

export const partnerApplicationSchema = z.object({
  first_name:      z.string().min(2, 'Ime mora imati najmanje 2 karaktera').max(100),
  last_name:       z.string().min(2, 'Prezime mora imati najmanje 2 karaktera').max(100),
  email:           z.string().email('Unesite ispravnu email adresu'),
  phone:           z
    .string()
    .min(6, 'Unesite ispravan broj telefona')
    .regex(/^[0-9+\-\/ ]*$/, 'Dozvoljeni su samo brojevi i znakovi +, -, /.'),
  service_type:    z.enum(['serviser', 'dispecer'], {
    errorMap: () => ({ message: 'Odaberite tip usluge' }),
  }),
  education_level: z.enum(['SSS', 'VŠS', 'VSS', 'Certifikovani majstor'], {
    errorMap: () => ({ message: 'Odaberite stepen obrazovanja' }),
  }),
  experience:      z.string().min(20, 'Opis iskustva mora imati najmanje 20 karaktera').max(2000),
  document_url:    z.string().url().optional().nullable(),
  specialnosti:    z.array(z.string()).optional(),
});

export const adminCreateUserSchema = z.object({
  first_name: z.string().min(2, 'Ime mora imati najmanje 2 karaktera').max(100),
  last_name: z.string().min(2, 'Prezime mora imati najmanje 2 karaktera').max(100),
  email: z.string().email('Unesite ispravnu email adresu'),
  role: z.enum(['serviser', 'dispecer', 'administrator'], {
    errorMap: () => ({ message: 'Odaberite validnu internu ulogu' }),
  }),
});

// Zod sheme po koracima wizarda
export const wizardKorak1Schema = z.object({
  category: z.string().min(1, 'Odaberite kategoriju zahtjeva'),
  address:  z
    .string()
    .min(5, 'Adresa mora imati najmanje 5 karaktera')
    .max(500, 'Adresa ne smije biti duža od 500 karaktera'),
});

export const terminSlotSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Neispravan format datuma'),
    from: z.string().min(1, 'Unesite početno vrijeme'),
    to:   z.string().min(1, 'Unesite završno vrijeme'),
  })
  .refine((d) => !d.from || !d.to || d.from < d.to, {
    message: '"Vrijeme do" mora biti nakon "Vrijeme od"',
  });

export const wizardKorakTerminSchema = z.object({
  termini: z.array(terminSlotSchema).min(1, 'Odaberite najmanje jedan datum'),
});

export const preferredScheduleBaseSchema = z.object({
  termini:              z.array(terminSlotSchema).default([]),
  no_preferred_time:    z.boolean().optional(),
  preferred_time_label: z.string().max(64).optional().nullable(),
});

export const preferredScheduleSchema = preferredScheduleBaseSchema
  .superRefine((data, ctx) => {
    const bezPreference = data.no_preferred_time === true;
    if (bezPreference) {
      if (data.termini.length > 0) {
        ctx.addIssue({
          code:    z.ZodIssueCode.custom,
          message: 'Uz opciju bez preferiranog termina ne šaljite termine.',
          path:    ['termini'],
        });
      }
      return;
    }

    if (data.termini.length === 0) {
      ctx.addIssue({
        code:    z.ZodIssueCode.custom,
        message: 'Odaberite preferirani termin ili označite da nemate preferenciju.',
        path:    ['termini'],
      });
      return;
    }

    if (data.termini.length > 3) {
      ctx.addIssue({
        code:    z.ZodIssueCode.custom,
        message: 'Dozvoljeno je najviše tri preferirana termina.',
        path:    ['termini'],
      });
    }
  });

export const wizardKorak2Schema = z.object({
  description:  z
    .string()
    .min(20, 'Opis zahtjeva mora sadržavati dovoljno informacija za obradu.')
    .max(2000, 'Opis ne smije biti duži od 2000 karaktera'),
  contactPhone: z
    .string()
    .min(1, 'Unesite kontakt telefon.')
    .regex(/^[+]?[0-9\s\-()]{8,20}$/, 'Unesite ispravan kontakt telefon.'),
});

export const wizardKorak3Schema = z.object({
  opasnost:       z.boolean({ required_error: 'Odgovorite na pitanje o sigurnosti' }),
  funkcionalnost: z.enum(['potpuni_prekid', 'otezana', 'manja_smetnja'], {
    errorMap: () => ({ message: 'Odaberite uticaj na funkcionisanje' }),
  }),
  steta:     z.boolean({ required_error: 'Odgovorite na pitanje o riziku od štete' }),
  ranjivost: z.boolean({ required_error: 'Odgovorite na pitanje o ranjivim osobama' }),
  obuhvat:   z.boolean({ required_error: 'Odgovorite na pitanje o obimu uticaja' }),
});

export const serviceRequestSchema = z
  .object({
    category:      z.string().min(1),
    category_main: z.string().min(1).optional(),
    category_sub:  z.string().min(1).optional(),
    address:       z.string().min(5).max(500),
    description:   z.string().min(20).max(2000),
    // Usklađeno s wizardom (PHONE_REGEX): 8–20 znakova
    contact_phone: z
      .string()
      .min(8, 'Unesite ispravan kontakt telefon.')
      .max(20, 'Kontakt telefon je predugačak.')
      .regex(/^[+]?[0-9\s\-()]{8,20}$/, 'Unesite ispravan kontakt telefon.'),
    photo_url:     z.string().url().optional().nullable(),
    /** Opcionalno: GPS / mapa (AC15) */
    latitude:      z.number().min(-90).max(90).optional().nullable(),
    longitude:     z.number().min(-180).max(180).optional().nullable(),
    is_premium:    z.boolean().optional(),
    premium_terms_accepted: z.boolean().optional(),
    /** Za premium hitnu može biti `null` / izostavljeno — trijaža se ne primjenjuje. */
    triage:        z.union([wizardKorak3Schema, z.null()]).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.is_premium === true) return;
    const r = wizardKorak3Schema.safeParse(data.triage);
    if (!r.success) {
      ctx.addIssue({
        code:    z.ZodIssueCode.custom,
        message: r.error.errors[0]?.message ?? 'Odgovorite na sva pitanja trijaže.',
        path:    ['triage'],
      });
    }
  });

export const cancelRequestSchema = z.object({
  cancel_reason: z.string().min(1, 'Odaberite razlog otkazivanja').max(500),
});

export const updateRequestSchema = z
  .object({
    description:        z.string().min(10, 'Opis mora imati najmanje 10 karaktera').max(2000).optional(),
    address:            z.string().min(5, 'Unesite ispravnu adresu').max(500).optional(),
    contact_phone:      z.string().min(1, 'Unesite kontakt telefon.').regex(/^[+]?[0-9\s\-()]{8,20}$/, 'Unesite ispravan kontakt telefon.').optional(),
    preferred_schedule: preferredScheduleSchema.optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: 'Nema polja za ažuriranje',
  });

export const profilUpdateSchema = z.object({
  ime:           z.string().min(2, 'Ime mora imati najmanje 2 karaktera').max(100).optional(),
  prezime:       z.string().min(2, 'Prezime mora imati najmanje 2 karaktera').max(100).optional(),
  broj_telefona: z
    .string()
    .regex(/^[+]?[0-9\s\-()]+$/, 'Neispravan format broja')
    .optional()
    .nullable(),
  adresa: z.string().max(255).optional().nullable(),
});

/** MVP: otkazivanje premiuma (simulacija naplate). */
export const premiumCancelSchema = z.object({
  reason: z.string().max(500).optional().nullable(),
});

export const premiumPlanSchema = z.enum(['monthly', 'yearly'], {
  errorMap: () => ({ message: 'Odaberite validan premium plan.' }),
});

export const premiumStartSchema = z.object({
  plan: premiumPlanSchema,
});

export const premiumConfirmSchema = z.object({
  plan: premiumPlanSchema,
});

// ─── Sprint 8: Serviserski modul ──────────────────────────────────────────────

export const razlogOperativniSchema = z.string()
  .trim()
  .min(10, 'Razlog mora imati minimalno 10 znakova')
  .max(500, 'Razlog ne smije prelaziti 500 znakova');

export const materijalStavkaSchema = z.object({
  naziv:    z.string().min(1, 'Naziv je obavezan').max(200),
  kolicina: z.number().positive('Količina mora biti pozitivna').max(99999),
  jedinica: z.string().min(1, 'Jedinica je obavezna').max(20),
});

export const evidencijaRadaSchema = z.object({
  opis_rada:       z.string()
    .min(5,   'Opis mora imati najmanje 5 karaktera')
    .max(2000, 'Opis ne smije biti duži od 2000 karaktera'),
  trajanje_minuta: z.number()
    .int('Trajanje mora biti cijeli broj')
    .min(1,    'Trajanje je obavezno. Unesite pozitivan broj minuta (minimalno 1).')
    .max(1440, 'Trajanje ne može biti duže od 24 sata'),
  materijal: z.string().max(500).optional().nullable(),
  stavke_materijala: z.array(materijalStavkaSchema).max(20).optional().default([]),
  napomene:  z.string().max(1000).optional().nullable(),
});

export const odbijZadatakSchema = z.object({
  razlog: z.string()
    .min(10,  'Razlog mora imati najmanje 10 karaktera')
    .max(500, 'Razlog ne smije biti duži od 500 karaktera'),
});

export const dodijelijeSchema = z.object({
  action:                   z.literal('dodijeli'),
  serviser_id:              z.string().uuid('Neispravan ID servisera'),
  termin_planirani_pocetak: z.string().datetime({ offset: true, local: true }).optional().nullable(),
  termin_planirani_kraj:    z.string().datetime({ offset: true, local: true }).optional().nullable(),
  procijenjeno_trajanje:    z.number().int().min(5).max(1440).optional().nullable(),
  dispecer_napomene:        z.string().max(1000).optional().nullable(),
});

export const napomenaSchema = z.object({
  sadrzaj: z.string()
    .min(2,   'Napomena mora imati najmanje 2 karaktera')
    .max(2000, 'Napomena ne smije biti duža od 2000 karaktera'),
});
