'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  MapPin,
  Phone,
  TriangleAlert,
  Wrench,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AlertMessage } from '@/components/ui/AlertMessage';
import { PreciznaLokacijaChip } from '@/components/servisirane/zahtjevBadgeovi';
import { OkvirGalerije } from '@/components/servisirane/PrilogGalerija';
import { KorakKategorija } from '@/components/wizard/KorakKategorija';
import { KorakLokacija }    from '@/components/wizard/KorakLokacija';
import { KorakTermin }      from '@/components/wizard/KorakTermin';
import type { TerminSlot }  from '@/domain/types/servisirane';
import { KorakOpis }        from '@/components/wizard/KorakOpis';
import { KorakTrijaza, type TriageFormState, INITIAL_TRIAGE } from '@/components/wizard/KorakTrijaza';
import { jeValidanKontaktTelefon, wizardKorak2Schema, wizardKorak3Schema } from '@/lib/validations/servisirane';
import type { TriageOdgovori } from '@/domain/types/servisirane';
import { formatirajDatumPrikaz, formatirajDatumVrijemeZaPrikaz } from '@/lib/format/datumi';
import { izracunajUrgency, oznakaHitnostiZaKorisnika } from '@/lib/servisirane/urgency';
import { glavnaKategorijaPoId, labelKategorije, serializujKategoriju, validnaKombinacijaKategorije } from '@/lib/servisirane/kategorije';
import { kreirajKlijenta } from '@/lib/supabase/klijent';

// ─── Konstante ────────────────────────────────────────────────────────────────

const SERVICE_REQUEST_PHOTOS_BUCKET = 'service-request-photos';

// ─── Wizard state ─────────────────────────────────────────────────────────────

interface WizardState {
  // Step 1 - Kategorija
  selectedCategory:    string | null;
  selectedSubcategory: string | null;
  // Step 2 - Lokacija
  address:                  string;
  latitude:                 number | null;
  longitude:                number | null;
  isLocating:               boolean;
  locationError:            string | null;
  hasSelectedMapLocation:   boolean;
  isMapVisible:             boolean;
  locationSuccessMessage:   string | null;
  // Step 3 - Preferirani termini (do 3 slota)
  termini:             TerminSlot[];
  noPreferredTime:     boolean;
  timeValidationError: string | null;
  // Step 4 - Opis
  description:      string;
  contactPhone:     string;
  accountPhone:     string;
  useAccountPhone:  boolean;
  photoFile:        File | null;
  // Step 5 - Trijaža
  triage:           TriageFormState;
  isPremiumUser:    boolean;
  /** Lifecycle iz /api/profil (za poruke kada nije `active`). */
  premiumLifecycleStatus: 'inactive' | 'pending_payment' | 'active' | 'expired' | 'cancelled' | null;
  premiumRequested: boolean;
  premiumTermsAccepted: boolean;
}

const INITIAL: WizardState = {
  selectedCategory:    null,
  selectedSubcategory: null,
  address:                  '',
  latitude:                 null,
  longitude:                null,
  isLocating:               false,
  locationError:            null,
  hasSelectedMapLocation:   false,
  isMapVisible:             false,
  locationSuccessMessage:   null,
  termini:             [],
  noPreferredTime:     false,
  timeValidationError: null,
  description:         '',
  contactPhone:        '',
  accountPhone:        '',
  useAccountPhone:     false,
  photoFile:           null,
  triage:              INITIAL_TRIAGE,
  isPremiumUser:       false,
  premiumLifecycleStatus: null,
  premiumRequested:    false,
  premiumTermsAccepted: false,
};

const ODUSTANI_PORUKA =
  'Jeste li sigurni da želite odustati od prijave? Svi uneseni podaci će biti odbačeni.';

/** Validnost prvog koraka: glavna kategorija ili Ostalo + podkategorija. */
export function isStepOneValid(s: WizardState): boolean {
  return validnaKombinacijaKategorije(s.selectedCategory, s.selectedSubcategory);
}

/** Korak 2: adresa je obavezna (≥5 znakova). Mapa/GPS su dodatno preciziranje. */
export function isStepTwoValid(s: WizardState): boolean {
  return s.address.trim().length >= 5;
}

export function danasIsoLokalno(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Polja koraka „Preferirani termini”. */
export type StanjePreferiranogTermina = Pick<WizardState, 'termini' | 'noPreferredTime'>;

export function isPreferiraniTerminKorakValid(s: StanjePreferiranogTermina): boolean {
  if (s.noPreferredTime) return true;
  if (s.termini.length === 0) return false;
  const t = s.termini[0];
  if (!t?.date) return false;
  if (t.date < danasIsoLokalno()) return false;
  if (!t.from || !t.to) return false;
  return t.from < t.to;
}

export function isStepThreeValid(s: WizardState): boolean {
  return isPreferiraniTerminKorakValid(s);
}

export function isStepFourValid(s: Pick<WizardState, 'description' | 'contactPhone'>): boolean {
  return s.description.trim().length >= 20 && jeValidanKontaktTelefon(s.contactPhone);
}

export function izracunajGreskuPreferiranogVremena(
  s: StanjePreferiranogTermina
): string | null {
  if (s.noPreferredTime) return null;
  const t = s.termini[0];
  if (!t?.from || !t.to) return null;
  if (t.from >= t.to) return '"Vrijeme do" mora biti nakon "Vrijeme od".';
  return null;
}

export function porukaValidacijePreferiranogTermina(s: StanjePreferiranogTermina): string | null {
  if (s.noPreferredTime) return null;
  const t = s.termini[0];
  if (!t?.date) return 'Odaberite datum ili označite da nemate preferirani termin.';
  if (t.date < danasIsoLokalno()) return 'Primarni datum ne smije biti u prošlosti.';
  if (!t.from || !t.to) return 'Odaberite vremenski raspon primarnog termina (od - do).';
  if (t.from >= t.to) return '"Vrijeme do" mora biti nakon "Vrijeme od".';
  return null;
}

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEP_OZNAKE = ['Vrsta zahtjeva', 'Lokacija', 'Termin', 'Opis', 'Hitnost', 'Pregled'];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-8 flex items-center justify-center gap-1">
      {STEP_OZNAKE.map((oznaka, i) => {
        const step     = i + 1;
        const isActive = step === currentStep;
        const isDone   = step < currentStep;
        return (
          <div key={step} className="flex items-center gap-1">
            <div className="flex flex-col items-center gap-1">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold
                  transition-all duration-300"
                style={{
                  backgroundColor: isDone
                    ? 'var(--first-secondary)'
                    : isActive
                    ? 'var(--first-primary)'
                    : 'rgb(var(--first-quinary-rgb) / 0.4)',
                  color: isDone || isActive ? 'white' : 'var(--first-nonary)',
                }}
              >
                {isDone ? '✓' : step}
              </div>
              <span
                className="hidden text-xs font-medium sm:block"
                style={{ color: isActive ? 'var(--first-primary)' : 'var(--first-nonary)' }}
              >
                {oznaka}
              </span>
            </div>
            {step < STEP_OZNAKE.length && (
              <div
                className="mb-4 h-0.5 w-4 sm:w-8"
                style={{
                  backgroundColor: isDone
                    ? 'var(--first-secondary)'
                    : 'rgb(var(--first-quinary-rgb) / 0.4)',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Validacija po koraku ─────────────────────────────────────────────────────

function validirajKorak(k: number, s: WizardState): string | null {
  if (k === 1) {
    if (!s.selectedCategory) return 'Odaberite vrstu zahtjeva prije nastavka.';
    if (!validnaKombinacijaKategorije(s.selectedCategory, s.selectedSubcategory)) {
      return 'Odabrana kombinacija kategorije i podkategorije nije ispravna.';
    }
    return null;
  }
  if (k === 2) {
    if (isStepTwoValid(s)) {
      if (s.address.trim().length > 500) return 'Adresa ne smije biti duža od 500 karaktera.';
      return null;
    }
    if (s.address.trim().length > 0 && s.address.trim().length < 5) {
      return 'Adresa mora sadržavati dovoljno informacija za pronalazak lokacije.';
    }
    return 'Unesite adresu intervencije prije nastavka.';
  }
  if (k === 3) {
    return porukaValidacijePreferiranogTermina(s);
  }
  if (k === 4) {
    if (s.description.trim().length === 0) return 'Unesite opis zahtjeva prije nastavka.';
    if (s.description.trim().length < 20) {
      return 'Opis mora sadržavati dovoljno informacija za obradu zahtjeva.';
    }
    const r = wizardKorak2Schema.safeParse({
      description:  s.description,
      contactPhone: s.contactPhone.trim(),
    });
    if (!r.success) return r.error.errors[0].message;
    if (!s.contactPhone.trim()) return 'Unesite kontakt telefon.';
    if (!jeValidanKontaktTelefon(s.contactPhone)) return 'Unesite ispravan kontakt telefon.';
    return null;
  }
  if (k === 5) {
    if (s.premiumRequested && !s.isPremiumUser) {
      return 'Premium hitnu intervenciju možete koristiti samo sa aktivnim premium statusom. Otvorite stranicu „Premium usluga” i dovršite aktivaciju.';
    }
    if (s.premiumRequested && !s.premiumTermsAccepted) {
      return 'Za premium hitnu intervenciju potrebno je potvrditi uslove i dodatne troškove.';
    }
    if (s.premiumRequested && s.isPremiumUser && s.premiumTermsAccepted) {
      return null;
    }
    const r = wizardKorak3Schema.safeParse(s.triage);
    return r.success ? null : r.error.errors[0].message;
  }
  return null;
}

/** Blokira „Dalje” dok korak nije ispunjen (uključujući korak 1 - kategorija). */
function jeKorakBlokiran(k: number, s: WizardState): boolean {
  if (k === 1) return !isStepOneValid(s);
  if (k === 2) return !isStepTwoValid(s);
  if (k === 3) {
    return !isStepThreeValid(s);
  }
  if (k === 4) {
    return !isStepFourValid(s);
  }
  return false;
}

function porukaBlokiranja(k: number): string {
  if (k === 1) return 'Odaberite vrstu zahtjeva prije nastavka.';
  if (k === 2) return 'Unesite adresu intervencije prije nastavka.';
  if (k === 3) {
    return '"Dalje" je onemogućen - odaberite preferirani termin (datum i raspon) ili opciju bez preferencije.';
  }
  return '"Dalje" je onemogućen - unesite opis (min. 20) i ispravan kontakt telefon.';
}

function naslovDaljeDugmeta(k: number, s: WizardState): string | undefined {
  if (!jeKorakBlokiran(k, s)) return undefined;
  if (k === 1) {
    if (!s.selectedCategory) {
      return 'Odaberite vrstu zahtjeva prije nastavka.';
    }
    const glavna = glavnaKategorijaPoId(s.selectedCategory);
    if (glavna && glavna.podkategorije.length > 0 && !s.selectedSubcategory) {
      return 'Odaberite podkategoriju prije nastavka.';
    }
    return 'Dovršite odabir kategorije prije nastavka.';
  }
  if (k === 2) {
    if (s.address.trim().length > 0 && s.address.trim().length < 5) {
      return 'Adresa mora sadržavati dovoljno informacija za pronalazak lokacije.';
    }
    return 'Unesite adresu intervencije prije nastavka.';
  }
  return porukaBlokiranja(k);
}

// ─── Glavni wizard ────────────────────────────────────────────────────────────

interface ServiceRequestWizardProps {
  onSubmitted?: () => void | Promise<void>;
  /** Cilj „Odustani od prijave” (zadano: lista zahtjeva). */
  odustaniHref?: string;
}

interface ConfirmationData {
  id: number;
  requestNumber: number;
  status: string;
  createdAt: string;
}

function formatirajTermin(state: WizardState): string {
  if (state.noPreferredTime) return 'Nema preferirani termin';
  if (state.termini.length === 0) return 'Nema preferirani termin';
  const oznake = ['Primarni', 'Alt. 1', 'Alt. 2'];
  return state.termini
    .filter(t => t?.date)
    .map((t, i) => `${oznake[i]}: ${formatirajDatumPrikaz(t.date)}${t.from && t.to ? ` (${t.from}-${t.to})` : ''}`)
    .join(' · ');
}

function formatirajStatusZaPrikaz(status: string): string {
  const s = status.toLowerCase();
  if (s === 'pending_review' || s === 'na_cekanju') return 'Novi';
  if (s === 'in_review') return 'U wizardu';
  if (s === 'potvrdeno') return 'Potvrđeno';
  if (s === 'dodijeljeno') return 'Dodijeljeno serviseru';
  if (s === 'u_radu' || s === 'u_izvrsenju') return 'Na terenu';
  return status;
}

function PregledFotografije({ file }: { file: File }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const blobUrl = URL.createObjectURL(file);
    setPreviewUrl(blobUrl);
    return () => URL.revokeObjectURL(blobUrl);
  }, [file]);

  if (!previewUrl) return null;

  return (
    <div className="mt-2 max-w-md">
      <OkvirGalerije>
        {/* Blob preview is generated client-side from selected file. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt="Pregled fotografije zahtjeva"
          className="aspect-[4/3] w-full max-h-44 object-cover sm:max-h-48"
        />
      </OkvirGalerije>
    </div>
  );
}

function PregledZahtjevaKorak({
  state,
  onEditStep,
}: {
  state: WizardState;
  onEditStep: (step: number) => void;
}) {
  const hitnost =
    state.premiumRequested && state.isPremiumUser
      ? 'Hitna intervencija (premium)'
      : oznakaHitnostiZaKorisnika(izracunajUrgency(state.triage as TriageOdgovori));
  const kategorija = labelKategorije({
    category_main: state.selectedCategory,
    category_sub: state.selectedSubcategory,
  });
  const imaKoordinate = state.latitude !== null && state.longitude !== null;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="mb-1 text-xl font-bold" style={{ color: 'var(--first-octonary)' }}>
          Pregled zahtjeva
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--first-nonary)' }}>
          Pregledajte unesene podatke prije slanja zahtjeva.
        </p>
      </div>

      <div className="rounded-xl border p-4" style={{ borderColor: 'rgb(var(--first-quaternary-rgb) / 0.35)', backgroundColor: 'rgb(255 255 255 / 0.5)' }}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4" style={{ color: 'var(--first-primary)' }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--first-octonary)' }}>Vrsta zahtjeva</h3>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => onEditStep(1)}>Uredi</Button>
        </div>
        <p className="text-sm" style={{ color: 'var(--first-octonary)' }}>
          {kategorija.podkategorija ? `${kategorija.glavna} - ${kategorija.podkategorija}` : kategorija.glavna}
        </p>
      </div>

      <div className="rounded-xl border p-4" style={{ borderColor: 'rgb(var(--first-quaternary-rgb) / 0.35)', backgroundColor: 'rgb(255 255 255 / 0.5)' }}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" style={{ color: 'var(--first-primary)' }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--first-octonary)' }}>Lokacija</h3>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => onEditStep(2)}>Uredi</Button>
        </div>
        <p className="text-sm break-words [overflow-wrap:anywhere]" style={{ color: 'var(--first-octonary)' }}>
          {(state.address ?? '').trim() || '-'}
        </p>
        {imaKoordinate && (
          <div className="mt-2">
            <PreciznaLokacijaChip />
          </div>
        )}
      </div>

      <div className="rounded-xl border p-4" style={{ borderColor: 'rgb(var(--first-quaternary-rgb) / 0.35)', backgroundColor: 'rgb(255 255 255 / 0.5)' }}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" style={{ color: 'var(--first-primary)' }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--first-octonary)' }}>Preferirani termin</h3>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => onEditStep(3)}>Uredi</Button>
        </div>
        <p className="text-sm" style={{ color: 'var(--first-octonary)' }}>{formatirajTermin(state)}</p>
        <p className="mt-1 text-xs" style={{ color: 'var(--first-nonary)' }}>
          Konačan termin potvrđuje dispečer.
        </p>
      </div>

      <div className="rounded-xl border p-4" style={{ borderColor: 'rgb(var(--first-quaternary-rgb) / 0.35)', backgroundColor: 'rgb(255 255 255 / 0.5)' }}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" style={{ color: 'var(--first-primary)' }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--first-octonary)' }}>Opis i kontakt</h3>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => onEditStep(4)}>Uredi</Button>
        </div>
        <p
          className="text-sm whitespace-pre-wrap break-words [overflow-wrap:anywhere]"
          style={{ color: 'var(--first-octonary)' }}
        >
          {state.description}
        </p>
        <p className="mt-2 text-sm" style={{ color: 'var(--first-octonary)' }}>
          Kontakt telefon: {state.contactPhone}
        </p>
        {state.photoFile ? (
          <div className="mt-2">
            <p className="inline-flex items-center gap-1 text-xs" style={{ color: 'var(--first-nonary)' }}>
              <ImageIcon className="h-3.5 w-3.5" />
              Fotografija je dodana ({state.photoFile.name}).
            </p>
            <PregledFotografije file={state.photoFile} />
          </div>
        ) : (
          <p className="mt-2 text-xs" style={{ color: 'var(--first-nonary)' }}>
            Fotografija nije dodana.
          </p>
        )}
      </div>

      <div className="rounded-xl border p-4" style={{ borderColor: 'rgb(var(--first-quaternary-rgb) / 0.35)', backgroundColor: 'rgb(255 255 255 / 0.5)' }}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TriangleAlert className="h-4 w-4" style={{ color: 'var(--first-primary)' }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--first-octonary)' }}>Hitnost</h3>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => onEditStep(5)}>Uredi</Button>
        </div>
        <p className="text-sm font-semibold" style={{ color: 'var(--first-octonary)' }}>{hitnost}</p>
        {state.premiumRequested && state.isPremiumUser && (
          <p className="mt-2 text-xs" style={{ color: 'var(--first-nonary)' }}>
            Trijaža nije potrebna - prioritet određuje premium paket.
          </p>
        )}
      </div>
    </div>
  );
}

function ConfirmationScreen({
  confirmation,
  onReset,
}: {
  confirmation: ConfirmationData;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border p-6" style={{ borderColor: 'rgb(var(--first-quaternary-rgb) / 0.35)', backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.22)' }}>
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-6 w-6" style={{ color: 'var(--first-secondary)' }} />
        <h2 className="text-xl font-bold" style={{ color: 'var(--first-octonary)' }}>
          Zahtjev je uspješno poslan
        </h2>
      </div>
      <p className="text-sm" style={{ color: 'var(--first-nonary)' }}>
        Vaš zahtjev je evidentiran i čeka obradu.
      </p>

      <div className="grid gap-3 rounded-xl border p-4" style={{ borderColor: 'rgb(var(--first-quaternary-rgb) / 0.35)', backgroundColor: 'rgb(255 255 255 / 0.6)' }}>
        <p className="text-sm" style={{ color: 'var(--first-octonary)' }}>
          Broj zahtjeva: <span className="font-semibold">#{confirmation.requestNumber}</span>
        </p>
        <p className="text-sm" style={{ color: 'var(--first-octonary)' }}>
          Status: <span className="font-semibold">{formatirajStatusZaPrikaz(confirmation.status)}</span>
        </p>
        <p className="text-sm" style={{ color: 'var(--first-octonary)' }}>
          Datum prijave: <span className="font-semibold">{formatirajDatumVrijemeZaPrikaz(confirmation.createdAt)}</span>
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Link href={`/korisnik/zahtjevi/${confirmation.id}`} className="w-full sm:w-auto">
          <Button size="md" className="w-full">Pregledaj zahtjev</Button>
        </Link>
        <Button type="button" variant="secondary" size="md" onClick={onReset}>
          Kreiraj novi zahtjev
        </Button>
      </div>
    </div>
  );
}

export function ServiceRequestWizard({
  onSubmitted,
  odustaniHref = '/korisnik/zahtjevi',
}: ServiceRequestWizardProps) {
  const router = useRouter();
  const [korak,       setKorak]      = useState(1);
  const [state,       setState]      = useState<WizardState>(INITIAL);
  const [greska,      setGreska]     = useState<string | null>(null);
  const [triageError, setTriageError] = useState<string | null>(null);
  const [jeSlanje,    setJeSlanje]   = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationData | null>(null);
  const [odustaniModalOtvoren, setOdustaniModalOtvoren] = useState(false);

  useEffect(() => {
    if (!odustaniModalOtvoren) return;
    function onKey(ev: KeyboardEvent) {
      if (ev.key === 'Escape') setOdustaniModalOtvoren(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [odustaniModalOtvoren]);

  useEffect(() => {
    fetch('/api/profil', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (d.profil) {
          const ps =
            d.profil.premium_status ??
            (d.profil.is_premium ? ('active' as const) : ('inactive' as const));
          const aktivanPremium = ps === 'active';
          setState((prev) => ({
            ...prev,
            address:      prev.address      || d.profil.adresa        || '',
            contactPhone: prev.contactPhone || d.profil.broj_telefona || '',
            accountPhone: d.profil.broj_telefona || '',
            premiumLifecycleStatus: ps,
            isPremiumUser: aktivanPremium,
            premiumRequested: aktivanPremium ? prev.premiumRequested : false,
            premiumTermsAccepted: aktivanPremium ? prev.premiumTermsAccepted : false,
          }));
        }
      })
      .catch(() => {});
  }, []);

  function azuriraj(updates: Partial<WizardState>) {
    setState((prev) => {
      const next = { ...prev, ...updates };
      if ('locationError' in updates) {
        next.locationError = updates.locationError ?? null;
        if (updates.locationError) next.locationSuccessMessage = null;
      } else if (
        'address' in updates &&
        !('locationSuccessMessage' in updates)
      ) {
        next.locationError = null;
        next.locationSuccessMessage = null;
        next.isLocating = false;
      } else if (
        'latitude' in updates ||
        'longitude' in updates ||
        'isLocating' in updates ||
        'hasSelectedMapLocation' in updates
      ) {
        next.locationError = null;
      }
      const korak3Polja = 'termini' in updates || 'noPreferredTime' in updates;
      if (korak3Polja) {
        next.timeValidationError = izracunajGreskuPreferiranogVremena(next);
      }
      return next;
    });
    setGreska(null);
    setTriageError(null);
  }

  function sljedeciKorak() {
    if (jeKorakBlokiran(korak, state)) {
      const err = validirajKorak(korak, state);
      if (err) setGreska(err);
      return;
    }
    const err = validirajKorak(korak, state);
    if (err) { setGreska(err); return; }
    setGreska(null);
    setKorak((k) => Math.min(k + 1, 6));
  }

  function prethodniKorak() {
    setGreska(null);
    setTriageError(null);
    setKorak((k) => Math.max(k - 1, 1));
  }

  async function uploadFotografijuKvara(file: File): Promise<string> {
    const supabase = kreirajKlijenta();
    const sigurnoIme = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${Date.now()}-${crypto.randomUUID()}-${sigurnoIme}`;

    const { error } = await supabase.storage
      .from(SERVICE_REQUEST_PHOTOS_BUCKET)
      .upload(fileName, file, { upsert: false });

    if (error) {
      throw new Error(`Upload fotografije nije uspio: ${error.message}`);
    }

    const { data } = supabase.storage
      .from(SERVICE_REQUEST_PHOTOS_BUCKET)
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  async function posaljiZahtjev() {
    for (let k = 1; k <= 5; k += 1) {
      const err = validirajKorak(k, state);
      if (err) {
        setKorak(k);
        if (k === 5) setTriageError(err);
        else setGreska(err);
        return;
      }
    }

    setJeSlanje(true);
    setGreska(null);
    setTriageError(null);

    try {
      const photoUrl = state.photoFile ? await uploadFotografijuKvara(state.photoFile) : null;
      if (!state.selectedCategory) {
        throw new Error('Odaberite glavnu kategoriju prije slanja.');
      }
      const kategorijaPayload = serializujKategoriju(state.selectedCategory, state.selectedSubcategory);

      const odgovor = await fetch('/api/service-requests', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category:      kategorijaPayload.category,
          category_main: kategorijaPayload.category_main,
          category_sub:  kategorijaPayload.category_sub,
          address:       state.address.trim(),
          description:   state.description,
          contact_phone: state.contactPhone,
          photo_url:     photoUrl,
          is_premium: state.premiumRequested,
          premium_terms_accepted: state.premiumTermsAccepted,
          latitude:      state.latitude,
          longitude:     state.longitude,
          preferred_schedule: state.noPreferredTime
            ? { termini: [], no_preferred_time: true }
            : {
                termini:           state.termini.filter(t => t?.date && t.from && t.to),
                no_preferred_time: false,
              },
          triage:
            state.premiumRequested && state.isPremiumUser ? null : (state.triage as TriageOdgovori),
        }),
      });

      const podaci = await odgovor.json();
      if (!odgovor.ok) throw new Error(podaci.error ?? 'Greška pri slanju zahtjeva.');
      setConfirmation({
        id: podaci.zahtjev.id,
        requestNumber:
          podaci.zahtjev.korisnicki_broj_zahtjeva ??
          podaci.korisnicki_broj_zahtjeva ??
          podaci.zahtjev.id,
        status: podaci.zahtjev.status,
        createdAt: podaci.zahtjev.created_at,
      });
      await onSubmitted?.();
    } catch (err) {
      setGreska(err instanceof Error ? err.message : 'Greška pri slanju zahtjeva.');
    } finally {
      setJeSlanje(false);
    }
  }

  if (confirmation) {
    return (
      <ConfirmationScreen
        confirmation={confirmation}
        onReset={() => {
          setState(INITIAL);
          setKorak(1);
          setConfirmation(null);
        }}
      />
    );
  }

  const blokiran     = jeKorakBlokiran(korak, state);
  const jePosljednji = korak === 6;

  return (
    <>
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-end">
        {!jeSlanje && (
          <button
            type="button"
            onClick={() => setOdustaniModalOtvoren(true)}
            className="inline-flex items-center justify-center gap-1.5 self-stretch rounded-xl border px-3 py-2 text-sm font-semibold transition-colors duration-150 hover:bg-soft-beige/25 sm:self-auto sm:border-0 sm:px-2 sm:py-1"
            style={{
              borderColor: 'rgb(var(--first-quaternary-rgb) / 0.45)',
              color: 'var(--first-nonary)',
            }}
          >
            <X className="h-4 w-4 shrink-0" aria-hidden />
            Odustani od prijave
          </button>
        )}
      </div>

      <StepIndicator currentStep={korak} />

      {korak !== 5 && korak !== 3 && greska && <AlertMessage variant="error" message={greska} />}

      {blokiran && korak !== 1 && korak !== 2 && korak !== 3 && korak !== 4 && (
        <AlertMessage variant="warning" message={porukaBlokiranja(korak)} />
      )}

      {korak === 1 && (
        <KorakKategorija
          selectedCategory={state.selectedCategory}
          selectedSubcategory={state.selectedSubcategory}
          onUpdate={azuriraj}
        />
      )}
      {korak === 2 && (
        <KorakLokacija
          address={state.address}
          latitude={state.latitude}
          longitude={state.longitude}
          isLocating={state.isLocating}
          locationError={state.locationError}
          locationSuccessMessage={state.locationSuccessMessage}
          isMapVisible={state.isMapVisible}
          onUpdate={azuriraj}
          error={greska ?? undefined}
        />
      )}
      {korak === 3 && (
        <KorakTermin
          termini={state.termini}
          noPreferredTime={state.noPreferredTime}
          validationError={state.timeValidationError ?? greska}
          onUpdate={azuriraj}
        />
      )}
      {korak === 4 && (
        <KorakOpis
          description={state.description}
          contactPhone={state.contactPhone}
          accountPhone={state.accountPhone}
          useAccountPhone={state.useAccountPhone}
          photoFile={state.photoFile}
          onUpdate={azuriraj}
          validationError={greska}
        />
      )}
      {korak === 5 && (
        <KorakTrijaza
          triage={state.triage}
          onUpdate={(u) => azuriraj({ triage: { ...state.triage, ...u } })}
          triageError={triageError ?? greska}
          isPremium={state.isPremiumUser}
          premiumLifecycleStatus={state.premiumLifecycleStatus}
          premiumRequested={state.premiumRequested}
          premiumTermsAccepted={state.premiumTermsAccepted}
          onPremiumRequestedChange={(value) =>
            azuriraj({
              premiumRequested: value,
              premiumTermsAccepted: value ? state.premiumTermsAccepted : false,
              ...(value && state.isPremiumUser ? { triage: INITIAL_TRIAGE } : {}),
            })
          }
          onPremiumTermsAcceptedChange={(value) => azuriraj({ premiumTermsAccepted: value })}
        />
      )}
      {korak === 6 && (
        <PregledZahtjevaKorak state={state} onEditStep={(step) => setKorak(step)} />
      )}

      <div
        className="mt-2 flex min-h-[52px] items-center justify-between gap-4 border-t border-slate-200/60 pt-5"
      >
        {korak > 1 ? (
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={prethodniKorak}
            disabled={jeSlanje}
            className="min-h-[44px] rounded-[12px] border border-slate-300/80 bg-white px-5 font-semibold !text-[var(--first-octonary)]
              shadow-none hover:bg-slate-50 hover:!text-[var(--first-octonary)]"
          >
            <ChevronLeft className="h-4 w-4" />
            Nazad
          </Button>
        ) : (
          <div />
        )}

        {!jePosljednji ? (
          <Button
            type="button"
            size="md"
            onClick={sljedeciKorak}
            disabled={blokiran}
            title={naslovDaljeDugmeta(korak, state)}
            className="min-h-[44px] max-h-[48px] rounded-[12px] px-6"
          >
            Dalje
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            size="lg"
            onClick={posaljiZahtjev}
            isLoading={jeSlanje}
            loadingText="Slanje zahtjeva..."
            className="rounded-[12px]"
          >
            Pošalji zahtjev
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>

    {odustaniModalOtvoren && (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center px-4 backdrop-blur-sm"
        style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOdustaniModalOtvoren(false);
        }}
        role="presentation"
      >
        <div
          className="w-full max-w-md overflow-hidden rounded-2xl shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="odustani-naslov"
          style={{
            backgroundColor: 'var(--first-tertiary)',
            border: '1px solid rgb(var(--first-quaternary-rgb) / 0.4)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="border-b px-6 py-4"
            style={{ borderColor: 'rgb(var(--first-quaternary-rgb) / 0.3)' }}
          >
            <h2
              id="odustani-naslov"
              className="text-lg font-bold"
              style={{ color: 'var(--first-octonary)' }}
            >
              Odustajanje od prijave
            </h2>
          </div>
          <div className="px-6 py-4">
            <p className="text-sm leading-relaxed" style={{ color: 'var(--first-nonary)' }}>
              {ODUSTANI_PORUKA}
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                size="md"
                className="w-full sm:w-auto"
                onClick={() => setOdustaniModalOtvoren(false)}
              >
                Nastavi prijavu
              </Button>
              <Button
                type="button"
                variant="danger"
                size="md"
                className="w-full sm:w-auto"
                onClick={() => {
                  setOdustaniModalOtvoren(false);
                  router.push(odustaniHref);
                }}
              >
                Da, odustajem
              </Button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
