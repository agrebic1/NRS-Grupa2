'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CheckCircle, Upload, X, FileText,
  User, Mail, Phone, Wrench, Headphones,
  Droplets, Zap, Wind, KeyRound, Monitor,
} from 'lucide-react';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { AlertMessage } from '@/components/ui/AlertMessage';
import { kreirajKlijenta } from '@/lib/supabase/klijent';

// ─── Zod shema ────────────────────────────────────────────────────────────────

const shema = z.object({
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
  experience: z
    .string()
    .min(20, 'Opis iskustva mora imati najmanje 20 karaktera')
    .max(2000, 'Maksimalno 2000 karaktera'),
});

type PartnerFormData = z.infer<typeof shema>;

type PartnerApiResponse = {
  error?: string;
};

// ─── Uloge - Action kartice ───────────────────────────────────────────────────

const ULOGE = [
  {
    value:  'serviser' as const,
    label:  'Serviser',
    opis:   'Terenski rad i intervencije na objektima',
    Ikona:  Wrench,
    boja:   'var(--first-senary)',
    rgb:    'var(--first-senary-rgb)',
  },
  {
    value:  'dispecer' as const,
    label:  'Dispečer',
    opis:   'Koordinacija i upravljanje zahtjevima',
    Ikona:  Headphones,
    boja:   'var(--first-septenary)',
    rgb:    'var(--first-septenary-rgb)',
  },
];

// ─── Specijalnosti serviserskih oblasti ───────────────────────────────────────

const SPECIALNOSTI = [
  { value: 'Voda',          Ikona: Droplets },
  { value: 'Struja',        Ikona: Zap },
  { value: 'Klimatizacija', Ikona: Wind },
  { value: 'Bravarija',     Ikona: KeyRound },
  { value: 'IT',            Ikona: Monitor },
];

// ─── Stepen obrazovanja ───────────────────────────────────────────────────────

const OBRAZOVANJE = [
  { value: 'SSS',                  label: 'SSS' },
  { value: 'VŠS',                  label: 'VŠS' },
  { value: 'VSS',                  label: 'VSS' },
  { value: 'Certifikovani majstor', label: 'Cert.' },
];

async function procitajPartnerApiResponse(odgovor: Response): Promise<PartnerApiResponse> {
  const contentType = odgovor.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return {};
  }

  try {
    return (await odgovor.json()) as PartnerApiResponse;
  } catch {
    return {};
  }
}

// ─── Input s ikonom ───────────────────────────────────────────────────────────

interface InputPoljeProps {
  label:       string;
  id:          string;
  type?:       string;
  placeholder: string;
  error?:      string;
  Ikona:       React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  inputProps:  React.InputHTMLAttributes<HTMLInputElement>;
}

function InputPolje({ label, id, type = 'text', placeholder, error, Ikona, inputProps }: InputPoljeProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium" style={{ color: 'var(--first-octonary)' }} htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2">
          <Ikona className="h-4 w-4" style={{ color: error ? '#DC2626' : 'var(--first-nonary)' }} />
        </div>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm transition-all
            focus:outline-none focus:ring-2"
          style={{
            borderColor:     error ? '#DC2626' : 'rgb(var(--first-quaternary-rgb) / 0.45)',
            backgroundColor: error ? 'rgba(220,38,38,0.03)' : 'rgb(255 255 255 / 0.8)',
            color:           'var(--first-octonary)',
          }}
          {...inputProps}
        />
      </div>
      {error && (
        <p className="text-xs font-medium" style={{ color: '#DC2626' }}>
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Forma ────────────────────────────────────────────────────────────────────

export function PartnerApplicationForm() {
  const [greska,       setGreska]       = useState<string | null>(null);
  const [jeUspjelo,    setJeUspjelo]    = useState(false);
  const [dokument,     setDokument]     = useState<File | null>(null);
  const [uploading,    setUploading]    = useState(false);
  const [docError,     setDocError]     = useState<string | null>(null);
  const [specialnosti, setSpecialnosti] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PartnerFormData>({
    resolver:      zodResolver(shema),
    mode:          'onBlur',   // Validacija na onBlur
    defaultValues: { service_type: 'serviser' },
  });

  const odabranaUloga  = watch('service_type');
  const odabranoObraz  = watch('education_level');
  const iskustvoText   = watch('experience') ?? '';

  function toggleSpecijalnost(val: string) {
    setSpecialnosti((prev) =>
      prev.includes(val) ? prev.filter((s) => s !== val) : [...prev, val]
    );
  }

  function handleDokument(file: File | null) {
    setDocError(null);
    if (!file) { setDokument(null); return; }
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setDocError('Dozvoljen je samo PDF, JPG ili PNG.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setDocError('Dokument ne smije biti veći od 10 MB.');
      return;
    }
    setDokument(file);
  }

  async function uploadDokument(file: File): Promise<string> {
    const supabase  = kreirajKlijenta();
    const fileName  = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const { error } = await supabase.storage
      .from('partner-documents')
      .upload(fileName, file, { upsert: false });
    if (error) throw new Error(`Upload greška: ${error.message}`);
    const { data: { publicUrl } } = supabase.storage
      .from('partner-documents')
      .getPublicUrl(fileName);
    return publicUrl;
  }

  async function posalji(podaci: PartnerFormData) {
    setGreska(null);
    setUploading(true);
    try {
      let documentUrl: string | null = null;
      if (dokument) documentUrl = await uploadDokument(dokument);

      const odgovor = await fetch('/api/partner-applications', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          ...podaci,
          document_url: documentUrl,
          specialnosti: podaci.service_type === 'serviser' ? specialnosti : [],
        }),
      });

      const rezultat = await procitajPartnerApiResponse(odgovor);
      if (!odgovor.ok) {
        throw new Error(
          rezultat.error ??
            (odgovor.status === 401 || odgovor.status === 403
              ? 'Sesija je istekla ili nemate dozvolu. Prijavite se ponovo.'
              : 'Greška pri slanju aplikacije.')
        );
      }
      setJeUspjelo(true);
    } catch (err) {
      setGreska(err instanceof Error ? err.message : 'Greška pri slanju aplikacije.');
    } finally {
      setUploading(false);
    }
  }

  // ─── Uspješno stanje ──────────────────────────────────────────────────────

  if (jeUspjelo) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgb(var(--first-secondary-rgb) / 0.12)' }}
        >
          <CheckCircle className="h-8 w-8" style={{ color: 'var(--first-secondary)' }} />
        </div>
        <h3 className="text-lg font-bold" style={{ color: 'var(--first-octonary)' }}>
          Aplikacija uspješno poslana!
        </h3>
        <p className="max-w-xs text-sm leading-relaxed" style={{ color: 'var(--first-nonary)' }}>
          Vaša aplikacija je evidentirana. Administrator će je pregledati
          i kontaktirati vas na navedenu email adresu u roku od 24 sata.
        </p>
      </div>
    );
  }

  const jeSlanje = isSubmitting || uploading;

  return (
    <form onSubmit={handleSubmit(posalji)} noValidate className="flex flex-col gap-5">
      {greska && <AlertMessage variant="error" message={greska} />}

      {/* ── 1. Action kartice za odabir uloge ────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold" style={{ color: 'var(--first-octonary)' }}>
          Odaberite ulogu
        </span>
        <div className="grid grid-cols-2 gap-3">
          {ULOGE.map(({ value, label, opis, Ikona, boja, rgb }) => {
            const jeAktivan = odabranaUloga === value;
            return (
              <label key={value} className="relative cursor-pointer">
                <input
                  type="radio"
                  value={value}
                  className="sr-only"
                  {...register('service_type')}
                />
                <div
                  className="flex flex-col gap-2 rounded-2xl border-2 p-4 transition-all duration-200"
                  style={{
                    borderColor:     jeAktivan ? boja : 'rgb(var(--first-quaternary-rgb) / 0.4)',
                    backgroundColor: jeAktivan ? `rgb(${rgb} / 0.08)` : 'rgb(255 255 255 / 0.6)',
                  }}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: jeAktivan ? `rgb(${rgb} / 0.15)` : 'rgb(var(--first-quaternary-rgb) / 0.2)',
                    }}
                  >
                    <Ikona
                      className="h-5 w-5"
                      style={{ color: jeAktivan ? boja : 'var(--first-nonary)' }}
                    />
                  </div>
                  <div>
                    <p
                      className="text-sm font-bold"
                      style={{ color: jeAktivan ? boja : 'var(--first-octonary)' }}
                    >
                      {label}
                    </p>
                    <p className="mt-0.5 text-xs leading-snug" style={{ color: 'var(--first-nonary)' }}>
                      {opis}
                    </p>
                  </div>
                  {jeAktivan && (
                    <div
                      className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full"
                      style={{ backgroundColor: boja }}
                    >
                      <CheckCircle className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                </div>
              </label>
            );
          })}
        </div>
        {errors.service_type && (
          <p className="text-xs font-medium" style={{ color: '#DC2626' }}>
            {errors.service_type.message}
          </p>
        )}
      </div>

      {/* ── 2. Specijalnosti (samo za serviser) ──────────────────────────── */}
      {odabranaUloga === 'serviser' && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold" style={{ color: 'var(--first-octonary)' }}>
            Oblasti specijalnosti{' '}
            <span className="font-normal" style={{ color: 'var(--first-nonary)' }}>
              (odaberite sve koje primjenjujete)
            </span>
          </span>
          <div className="flex flex-wrap gap-2">
            {SPECIALNOSTI.map(({ value, Ikona }) => {
              const jeOdabran = specialnosti.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleSpecijalnost(value)}
                  className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm
                    font-medium transition-all duration-150"
                  style={{
                    borderColor:     jeOdabran ? 'var(--first-senary)' : 'rgb(var(--first-quaternary-rgb) / 0.4)',
                    backgroundColor: jeOdabran ? 'rgb(var(--first-senary-rgb) / 0.08)' : 'rgb(255 255 255 / 0.7)',
                    color:           jeOdabran ? 'var(--first-senary)' : 'var(--first-octonary)',
                  }}
                >
                  <Ikona className="h-3.5 w-3.5 flex-shrink-0" />
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 3. Lični podaci ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputPolje
          label="Ime"
          id="partner-ime"
          placeholder="Vaše ime"
          error={errors.first_name?.message}
          Ikona={User}
          inputProps={register('first_name')}
        />
        <InputPolje
          label="Prezime"
          id="partner-prezime"
          placeholder="Vaše prezime"
          error={errors.last_name?.message}
          Ikona={User}
          inputProps={register('last_name')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputPolje
          label="Email adresa"
          id="partner-email"
          type="email"
          placeholder="vas@email.com"
          error={errors.email?.message}
          Ikona={Mail}
          inputProps={{ ...register('email'), autoComplete: 'email' }}
        />
        <InputPolje
          label="Broj telefona"
          id="partner-telefon"
          type="tel"
          placeholder="+387 61 000 000"
          error={errors.phone?.message}
          Ikona={Phone}
          inputProps={{ ...register('phone'), autoComplete: 'tel' }}
        />
      </div>

      {/* ── 4. Stepen obrazovanja ────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold" style={{ color: 'var(--first-octonary)' }}>
          Stepen obrazovanja / certifikat
        </span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {OBRAZOVANJE.map(({ value, label }) => {
            const jeAktivan = odabranoObraz === value;
            return (
              <label key={value} className="cursor-pointer">
                <input
                  type="radio"
                  value={value}
                  className="sr-only"
                  {...register('education_level')}
                />
                <div
                  className="flex items-center justify-center rounded-xl border px-3 py-2.5
                    text-center text-xs font-medium transition-all duration-150"
                  style={{
                    borderColor:     jeAktivan ? 'var(--first-primary)' : 'rgb(var(--first-quaternary-rgb) / 0.4)',
                    backgroundColor: jeAktivan ? 'rgb(var(--first-primary-rgb) / 0.06)' : 'rgb(255 255 255 / 0.6)',
                    color:           jeAktivan ? 'var(--first-primary)' : 'var(--first-octonary)',
                    fontWeight:      jeAktivan ? 700 : 500,
                  }}
                >
                  {label}
                </div>
              </label>
            );
          })}
        </div>
        {errors.education_level && (
          <p className="text-xs font-medium" style={{ color: '#DC2626' }}>
            {errors.education_level.message}
          </p>
        )}
      </div>

      {/* ── 5. Upload dokumenta ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold" style={{ color: 'var(--first-octonary)' }}>
          Dokaz o stručnosti{' '}
          <span className="font-normal" style={{ color: 'var(--first-nonary)' }}>
            (diploma, certifikat - PDF ili slika)
          </span>
        </label>
        {dokument ? (
          <div
            className="flex items-center justify-between rounded-xl border px-4 py-3"
            style={{
              borderColor:     'rgb(var(--first-secondary-rgb) / 0.4)',
              backgroundColor: 'rgb(var(--first-secondary-rgb) / 0.06)',
            }}
          >
            <div className="flex min-w-0 items-center gap-2">
              <FileText className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--first-secondary)' }} />
              <span className="truncate text-sm" style={{ color: 'var(--first-octonary)' }}>
                {dokument.name}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setDokument(null)}
              className="ml-3 flex-shrink-0 transition-opacity hover:opacity-70"
            >
              <X className="h-4 w-4" style={{ color: 'var(--first-nonary)' }} />
            </button>
          </div>
        ) : (
          <div
            className="flex cursor-pointer flex-col items-center gap-2 rounded-xl
              border-2 border-dashed px-5 py-5 text-center transition-colors"
            style={{ borderColor: 'rgb(var(--first-quaternary-rgb) / 0.5)' }}
            onClick={() => document.getElementById('partner-doc-input')?.click()}
          >
            <Upload className="h-6 w-6" style={{ color: 'var(--first-nonary)' }} />
            <p className="text-sm" style={{ color: 'var(--first-nonary)' }}>
              Kliknite za odabir dokumenta
            </p>
            <p className="text-xs" style={{ color: 'var(--first-quinary)' }}>
              PDF, JPG, PNG - max 10 MB
            </p>
            <input
              id="partner-doc-input"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={(e) => handleDokument(e.target.files?.[0] ?? null)}
            />
          </div>
        )}
        {docError && (
          <p className="text-xs font-medium" style={{ color: '#DC2626' }}>
            {docError}
          </p>
        )}
      </div>

      {/* ── 6. Iskustvo ──────────────────────────────────────────────────── */}
      <Textarea
        label={odabranaUloga === 'serviser'
          ? 'Radno iskustvo i opis rada'
          : 'Iskustvo u koordinaciji i upravljanju'
        }
        id="partner-iskustvo"
        rows={4}
        placeholder={odabranaUloga === 'serviser'
          ? 'Opišite vaše tehničko iskustvo, alate i oblasti rada (min. 20 karaktera)...'
          : 'Opišite vaše iskustvo u koordinaciji, dispečerskom radu ili upravljanju timovima...'
        }
        showCharacterCount
        maxCharacters={2000}
        currentLength={iskustvoText.length}
        error={errors.experience?.message}
        {...register('experience')}
      />

      <Button
        type="submit"
        isLoading={jeSlanje}
        loadingText={uploading ? 'Prijenos dokumenta...' : 'Slanje aplikacije...'}
        size="lg"
        className="w-full"
      >
        Pošalji aplikaciju
      </Button>
    </form>
  );
}
