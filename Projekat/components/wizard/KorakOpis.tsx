'use client';

import { useEffect, useMemo, useState } from 'react';
import { Upload, X, AlertCircle, FileText, Phone } from 'lucide-react';
import { Textarea } from '@/components/ui/Textarea';
import { OkvirGalerije } from '@/components/servisirane/PrilogGalerija';
import { jeValidanKontaktTelefon } from '@/lib/validations/servisirane';

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const DOZVOLJENI_FORMATI = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

function validirajTelefon(tel: string): string | null {
  if (!tel.trim()) return 'Unesite kontakt telefon.';
  if (!jeValidanKontaktTelefon(tel)) return 'Unesite ispravan kontakt telefon.';
  return null;
}

interface KorakOpisProps {
  description: string;
  contactPhone: string;
  accountPhone?: string;
  useAccountPhone?: boolean;
  photoFile: File | null;
  onUpdate: (p: {
    description?: string;
    contactPhone?: string;
    useAccountPhone?: boolean;
    photoFile?: File | null;
  }) => void;
  validationError?: string | null;
}

export function KorakOpis({
  description,
  contactPhone,
  accountPhone,
  useAccountPhone = false,
  photoFile,
  onUpdate,
  validationError,
}: KorakOpisProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [descriptionTouched, setDescriptionTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);

  const descriptionError =
    description.trim().length === 0
      ? 'Unesite opis zahtjeva prije nastavka.'
      : description.trim().length < 20
        ? 'Opis mora sadržavati dovoljno informacija za obradu zahtjeva.'
        : null;
  const phoneError = validirajTelefon(contactPhone);
  const previewUrl = useMemo(
    () => (photoFile ? URL.createObjectURL(photoFile) : null),
    [photoFile],
  );
  const imaPokusajSlanja = Boolean(validationError);
  const prikaziDescriptionError =
    descriptionTouched || imaPokusajSlanja ? descriptionError : null;
  const prikaziPhoneError =
    phoneTouched || imaPokusajSlanja ? phoneError : null;

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handlePhoneChange(val: string) {
    onUpdate({ contactPhone: val });
  }

  function toggleKoristiBrojSaRacuna(checked: boolean) {
    if (!accountPhone?.trim()) return;
    if (checked) {
      onUpdate({ useAccountPhone: true, contactPhone: accountPhone });
    } else {
      onUpdate({ useAccountPhone: false });
    }
    setPhoneTouched(true);
  }

  function handleFile(file: File | null) {
    if (!file) {
      setPhotoError(null);
      onUpdate({ photoFile: null });
      return;
    }
    if (!DOZVOLJENI_FORMATI.includes(file.type)) {
      setPhotoError('Dozvoljeni formati su JPG, PNG i WEBP.');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError('Fotografija ne smije biti veća od 5 MB.');
      return;
    }
    setPhotoError(null);
    onUpdate({ photoFile: file });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2
          className="mb-1 text-xl font-bold"
          style={{ color: 'var(--first-octonary)' }}
        >
          Opis zahtjeva
        </h2>
        <p
          className="text-sm leading-relaxed"
          style={{ color: 'var(--first-nonary)' }}
        >
          Opišite šta se desilo, kada je problem počeo i šta ste već pokušali.
          Ovi podaci pomažu dispečeru da pravilno obradi zahtjev.
        </p>
      </div>

      <div>
        <div className="mb-1.5 flex items-center gap-2">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-md"
            style={{
              backgroundColor: 'rgb(var(--first-quaternary-rgb) / 0.4)',
            }}
          >
            <FileText
              className="h-3.5 w-3.5"
              style={{ color: 'var(--first-nonary)' }}
            />
          </div>
          <span
            className="text-sm font-semibold"
            style={{ color: 'var(--first-octonary)' }}
          >
            Opis zahtjeva *
          </span>
        </div>
        <Textarea
          label=""
          id="wizard-opis"
          rows={5}
          placeholder="Opišite šta se desilo, kada je počelo i šta ste već pokušali..."
          value={description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          onBlur={() => setDescriptionTouched(true)}
          showCharacterCount
          maxCharacters={2000}
          currentLength={description.length}
          error={prikaziDescriptionError ?? undefined}
        />
        <p className="mt-1 text-xs" style={{ color: 'var(--first-quinary)' }}>
          Minimum 20 karaktera.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="mb-0.5 flex items-center gap-2">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-md"
            style={{
              backgroundColor: 'rgb(var(--first-quaternary-rgb) / 0.4)',
            }}
          >
            <Phone
              className="h-3.5 w-3.5"
              style={{ color: 'var(--first-nonary)' }}
            />
          </div>
          <label
            className="text-sm font-semibold"
            style={{ color: 'var(--first-octonary)' }}
          >
            Kontakt telefon *
          </label>
        </div>
        <div className="relative">
          <input
            id="wizard-telefon"
            type="tel"
            inputMode="tel"
            placeholder="+387 61 000 000"
            value={contactPhone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            onBlur={() => setPhoneTouched(true)}
            autoComplete="tel"
            disabled={useAccountPhone}
            className="w-full rounded-xl border px-4 py-2.5 pr-10 text-sm transition-all duration-200
              placeholder:text-text-muted/60 focus:outline-none focus:ring-2 disabled:cursor-not-allowed"
            style={{
              borderColor: prikaziPhoneError
                ? '#DC2626'
                : 'rgb(var(--first-quaternary-rgb) / 0.4)',
              backgroundColor: useAccountPhone
                ? 'rgb(var(--first-quaternary-rgb) / 0.25)'
                : prikaziPhoneError
                  ? 'rgba(220,38,38,0.04)'
                  : 'rgb(255 255 255 / 0.6)',
              color: 'var(--first-octonary)',
              opacity: useAccountPhone ? 0.78 : 1,
            }}
          />
          {prikaziPhoneError && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              <AlertCircle className="h-4 w-4" style={{ color: '#DC2626' }} />
            </div>
          )}
        </div>
        <p className="text-xs" style={{ color: 'var(--first-quinary)' }}>
          Ovaj broj ćemo koristiti ako dispečer ili serviser treba dodatne
          informacije.
        </p>
        {accountPhone?.trim() && (
          <label className="mt-0.5 inline-flex w-fit cursor-pointer items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={useAccountPhone}
              onChange={(e) => toggleKoristiBrojSaRacuna(e.target.checked)}
              className="h-4 w-4 rounded border"
              style={{ accentColor: 'var(--first-primary)' }}
            />
            <span style={{ color: 'var(--first-primary)' }}>
              Koristi broj sa računa ({accountPhone})
            </span>
          </label>
        )}
        {prikaziPhoneError && (
          <p className="text-xs font-medium" style={{ color: '#DC2626' }}>
            {prikaziPhoneError}
          </p>
        )}
      </div>

      <div>
        <label
          className="mb-1.5 block text-sm font-medium"
          style={{ color: 'var(--first-octonary)' }}
        >
          Fotografija (neobavezno)
        </label>
        <p className="mb-2 text-xs" style={{ color: 'var(--first-quinary)' }}>
          Fotografija može pomoći u bržem razumijevanju problema.
        </p>

        {photoFile ? (
          <div
            className="flex flex-col gap-3 rounded-xl border px-4 py-4"
            style={{
              borderColor: 'rgb(var(--first-secondary-rgb) / 0.4)',
              backgroundColor: 'rgb(var(--first-secondary-rgb) / 0.06)',
            }}
          >
            {previewUrl && (
              <div className="max-w-md">
                <OkvirGalerije>
                  {/* Blob preview is client-generated; keep native img for local preview. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Pregled fotografije zahtjeva"
                    className="aspect-[4/3] w-full max-h-48 object-cover sm:max-h-52"
                  />
                </OkvirGalerije>
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              <span
                className="min-w-0 truncate text-sm"
                style={{ color: 'var(--first-octonary)' }}
              >
                {photoFile.name}
              </span>
              <button
                type="button"
                onClick={() => handleFile(null)}
                className="inline-flex flex-shrink-0 items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70"
                style={{ color: 'var(--first-nonary)' }}
              >
                <X className="h-4 w-4" />
                Ukloni fotografiju
              </button>
            </div>
          </div>
        ) : (
          <div
            className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-5 py-8 text-center transition-colors duration-200"
            style={{
              borderColor: isDragging
                ? 'var(--first-secondary)'
                : 'rgb(var(--first-quaternary-rgb) / 0.5)',
              backgroundColor: isDragging
                ? 'rgb(var(--first-secondary-rgb) / 0.05)'
                : 'transparent',
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFile(e.dataTransfer.files[0] ?? null);
            }}
            onClick={() =>
              document.getElementById('wizard-foto-input')?.click()
            }
          >
            <Upload
              className="h-7 w-7"
              style={{ color: 'var(--first-nonary)' }}
            />
            <p className="text-sm" style={{ color: 'var(--first-nonary)' }}>
              Prevucite sliku ili{' '}
              <span style={{ color: 'var(--first-secondary)' }}>
                kliknite za odabir
              </span>
            </p>
            <p className="text-xs" style={{ color: 'var(--first-quinary)' }}>
              JPG, PNG ili WEBP, maksimalno 5 MB.
            </p>
            <input
              id="wizard-foto-input"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
          </div>
        )}

        {photoError && (
          <p className="mt-2 text-xs font-medium" style={{ color: '#DC2626' }}>
            {photoError}
          </p>
        )}
      </div>

      {validationError && (
        <p className="text-xs font-medium" style={{ color: '#DC2626' }}>
          {validationError}
        </p>
      )}
    </div>
  );
}
