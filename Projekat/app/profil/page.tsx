'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User, Shield, Lock, ArrowLeftRight, Check, AlertTriangle, MapPin,
} from 'lucide-react';
import { OdabirLokacije } from '@/components/shared/MapaOdabir';
import { AppShell } from '@/components/layout/AppShell';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AlertMessage } from '@/components/ui/AlertMessage';
import { VerificationBadge } from '@/components/servisirane/VerificationBadge';
import { kreirajKlijenta } from '@/lib/supabase/klijent';
import type { ProfilKorisnika } from '@/domain/types/servisirane';
import type { UserRole } from '@/domain/types';
import { PREUSMJERANJE_PO_ULOZI } from '@/domain/types';
import Link from 'next/link';

// ─── Sheme ────────────────────────────────────────────────────────────────────

const profilShema = z.object({
  ime:           z.string().min(2, 'Ime mora imati najmanje 2 karaktera').max(100),
  prezime:       z.string().min(2, 'Prezime mora imati najmanje 2 karaktera').max(100),
  broj_telefona: z
    .string()
    .regex(/^[+]?[0-9\s\-()]*$/, 'Neispravan format broja')
    .optional()
    .or(z.literal('')),
  adresa: z.string().max(255).optional().or(z.literal('')),
});

const lozinkaShema = z
  .object({
    novaLozinka:      z
      .string()
      .min(8, 'Minimalno 8 karaktera')
      .regex(/[A-Z]/, 'Potrebno je jedno veliko slovo')
      .regex(/[0-9]/, 'Potreban je jedan broj'),
    potvrdaLozinke:   z.string().min(1, 'Potvrda je obavezna'),
  })
  .refine((d) => d.novaLozinka === d.potvrdaLozinke, {
    message: 'Lozinke se ne podudaraju',
    path:    ['potvrdaLozinke'],
  });

type ProfilFormData  = z.infer<typeof profilShema>;
type LozinkaFormData = z.infer<typeof lozinkaShema>;

// ─── Sekcija: Lični podaci ─────────────────────────────────────────────────────

function LicniPodaciSekcija({
  profil,
  onAzuriranje,
}: {
  profil:       ProfilKorisnika;
  onAzuriranje: () => void;
}) {
  const [uspjelo, setUspjelo] = useState(false);
  const [greska,  setGreska]  = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfilFormData>({
    resolver:      zodResolver(profilShema),
    defaultValues: {
      ime:           profil.ime,
      prezime:       profil.prezime,
      broj_telefona: profil.broj_telefona ?? '',
      adresa:        profil.adresa ?? '',
    },
  });

  async function spremi(podaci: ProfilFormData) {
    setGreska(null);
    setUspjelo(false);
    try {
      const odgovor = await fetch('/api/profil', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(podaci),
      });
      const r = await odgovor.json();
      if (!odgovor.ok) throw new Error(r.error ?? 'Greška pri ažuriranju.');
      setUspjelo(true);
      onAzuriranje();
    } catch (err) {
      setGreska(err instanceof Error ? err.message : 'Greška pri ažuriranju.');
    }
  }

  return (
    <form onSubmit={handleSubmit(spremi)} className="flex flex-col gap-4">
      {greska   && <AlertMessage variant="error"   message={greska} />}
      {uspjelo  && <AlertMessage variant="success" message="Podaci su uspješno ažurirani." />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Ime"
          id="profil-ime"
          error={errors.ime?.message}
          {...register('ime')}
        />
        <Input
          label="Prezime"
          id="profil-prezime"
          error={errors.prezime?.message}
          {...register('prezime')}
        />
      </div>

      <Input
        label="Email adresa"
        id="profil-email"
        type="email"
        value={profil.email ?? ''}
        disabled
      />

      <Input
        label="Broj telefona"
        id="profil-telefon"
        type="tel"
        placeholder="+387 61 000 000"
        error={errors.broj_telefona?.message}
        {...register('broj_telefona')}
      />

      <Input
        label="Adresa"
        id="profil-adresa"
        placeholder="Ulica i broj, grad"
        error={errors.adresa?.message}
        {...register('adresa')}
      />

      <Button
        type="submit"
        size="md"
        className="w-fit"
        isLoading={isSubmitting}
        loadingText="Spremanje..."
        disabled={!isDirty || isSubmitting}
      >
        <Check className="h-4 w-4" />
        Spremi izmjene
      </Button>
    </form>
  );
}

// ─── Sekcija: Promjena lozinke ────────────────────────────────────────────────

function LozinkaSekcija() {
  const [uspjelo, setUspjelo] = useState(false);
  const [greska,  setGreska]  = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LozinkaFormData>({
    resolver: zodResolver(lozinkaShema),
  });

  async function promijeni(podaci: LozinkaFormData) {
    setGreska(null);
    setUspjelo(false);
    try {
      const supabase = kreirajKlijenta();
      const { error } = await supabase.auth.updateUser({
        password: podaci.novaLozinka,
      });
      if (error) throw new Error(error.message);
      setUspjelo(true);
      reset();
    } catch (err) {
      setGreska(err instanceof Error ? err.message : 'Greška pri promjeni lozinke.');
    }
  }

  return (
    <form onSubmit={handleSubmit(promijeni)} className="flex flex-col gap-4">
      {greska  && <AlertMessage variant="error"   message={greska} />}
      {uspjelo && <AlertMessage variant="success" message="Lozinka je uspješno promijenjena." />}

      <Input
        label="Nova lozinka"
        id="nova-lozinka"
        type="password"
        autoComplete="new-password"
        placeholder="Min. 8 znakova, 1 veliko slovo, 1 broj"
        error={errors.novaLozinka?.message}
        {...register('novaLozinka')}
      />

      <Input
        label="Potvrdite novu lozinku"
        id="potvrda-lozinke"
        type="password"
        autoComplete="new-password"
        error={errors.potvrdaLozinke?.message}
        {...register('potvrdaLozinke')}
      />

      <Button
        type="submit"
        size="md"
        className="w-fit"
        isLoading={isSubmitting}
        loadingText="Mijenjanje..."
      >
        <Lock className="h-4 w-4" />
        Promijeni lozinku
      </Button>
    </form>
  );
}

// ─── Sekcija: Bazna lokacija servisera (US-48) ────────────────────────────────

function BaznaLokacijaSekcija({
  profil,
  onAzuriranje,
}: {
  profil:       ProfilKorisnika;
  onAzuriranje: () => void;
}) {
  const [lat, setLat] = useState<number | null>(profil.bazna_latitude  ?? null);
  const [lng, setLng] = useState<number | null>(profil.bazna_longitude ?? null);
  const [uspjelo, setUspjelo] = useState(false);
  const [greska,  setGreska]  = useState<string | null>(null);
  const [slanje,  setSlanje]  = useState(false);

  const promijenjeno =
    lat !== (profil.bazna_latitude ?? null) || lng !== (profil.bazna_longitude ?? null);

  async function spremi() {
    setGreska(null);
    setUspjelo(false);
    setSlanje(true);
    try {
      const odgovor = await fetch('/api/profil', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ bazna_latitude: lat, bazna_longitude: lng }),
      });
      const r = await odgovor.json();
      if (!odgovor.ok) throw new Error(r.error ?? 'Greška pri spremanju.');
      setUspjelo(true);
      onAzuriranje();
    } catch (err) {
      setGreska(err instanceof Error ? err.message : 'Greška pri spremanju lokacije.');
    } finally {
      setSlanje(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {greska  && <AlertMessage variant="error"   message={greska} />}
      {uspjelo && <AlertMessage variant="success" message="Bazna lokacija je spremljena." />}

      <p className="text-sm" style={{ color: 'var(--first-nonary)' }}>
        Pretražite adresu svoje bazne lokacije (ili je označite na mapi / GPS-om). Koristi se
        da vam dispečer dodjeljuje bliže intervencije. Opcionalno — možete je i ukloniti.
      </p>

      <OdabirLokacije
        latitude={lat}
        longitude={lng}
        label="Adresa bazne lokacije"
        onChange={({ latitude, longitude }) => {
          setLat(latitude);
          setLng(longitude);
          setUspjelo(false);
        }}
      />

      <Button
        type="button"
        size="md"
        className="w-fit"
        onClick={spremi}
        isLoading={slanje}
        loadingText="Spremanje..."
        disabled={!promijenjeno || slanje}
      >
        <Check className="h-4 w-4" />
        Spremi lokaciju
      </Button>
    </div>
  );
}

// ─── Sekcija: Uloge i pristup ─────────────────────────────────────────────────

const ULOGA_CONFIG: Record<
  string,
  { oznaka: string; opis: string; href: string; Ikona: React.ComponentType<{ className?: string; style?: React.CSSProperties }> }
> = {
  korisnik: { oznaka: 'Korisnik usluge', opis: 'Prijava kvarova, praćenje intervencija',       href: '/korisnik',  Ikona: User },
  serviser: { oznaka: 'Serviser',        opis: 'Terenski rad i izvršenje intervencija',         href: '/serviser',  Ikona: Shield },
  dispecer: { oznaka: 'Dispečer',        opis: 'Koordinacija zahtjeva i dodjela servisera',     href: '/dispecer',  Ikona: AlertTriangle },
  admin:    { oznaka: 'Administrator',   opis: 'Upravljanje sistemom i korisnicima',             href: '/admin',     Ikona: Shield },
};

function UlogeSekcija({ uloge }: { uloge: string[] }) {
  if (uloge.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      {uloge.map((uloga) => {
        const cfg = ULOGA_CONFIG[uloga];
        if (!cfg) return null;
        const Ikona = cfg.Ikona;
        return (
          <div
            key={uloga}
            className="flex items-center justify-between rounded-xl border px-4 py-3"
            style={{
              borderColor:     'rgb(var(--first-quaternary-rgb) / 0.35)',
              backgroundColor: 'rgb(255 255 255 / 0.4)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: 'rgb(var(--first-secondary-rgb) / 0.1)' }}
              >
                <Ikona className="h-4 w-4" style={{ color: 'var(--first-secondary)' }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--first-octonary)' }}>
                  {cfg.oznaka}
                </p>
                <p className="text-xs" style={{ color: 'var(--first-nonary)' }}>
                  {cfg.opis}
                </p>
              </div>
            </div>
            <Link href={cfg.href}>
              <Button type="button" variant="secondary" size="sm">
                Pređi
              </Button>
            </Link>
          </div>
        );
      })}
      {uloge.length > 1 && (
        <Link href="/odabir-uloge">
          <Button type="button" variant="ghost" size="md" className="w-full">
            <ArrowLeftRight className="h-4 w-4" />
            Promijeni aktivnu ulogu
          </Button>
        </Link>
      )}
    </div>
  );
}

// ─── Kartica sekcije ──────────────────────────────────────────────────────────

function SekcijaKartica({
  naslov,
  opis,
  Ikona,
  children,
}: {
  naslov:   string;
  opis:     string;
  Ikona:    React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-6 shadow-card sm:p-8"
      style={{
        backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.22)',
        border:          '1px solid rgb(var(--first-quaternary-rgb) / 0.35)',
      }}
    >
      <div
        className="mb-6 flex items-center gap-3 border-b pb-5"
        style={{ borderColor: 'rgb(var(--first-quaternary-rgb) / 0.3)' }}
      >
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: 'rgb(var(--first-secondary-rgb) / 0.1)' }}
        >
          <Ikona className="h-5 w-5" style={{ color: 'var(--first-secondary)' }} />
        </div>
        <div>
          <h2 className="font-bold" style={{ color: 'var(--first-octonary)' }}>
            {naslov}
          </h2>
          <p className="text-xs" style={{ color: 'var(--first-nonary)' }}>
            {opis}
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Stranica ─────────────────────────────────────────────────────────────────

export default function ProfilPage() {
  const [profil,   setProfil]   = useState<ProfilKorisnika | null>(null);
  const [ucitava,  setUcitava]  = useState(true);
  const [greska,   setGreska]   = useState<string | null>(null);

  async function ucitajProfil() {
    try {
      const odgovor = await fetch('/api/profil', { cache: 'no-store' });
      const podaci  = await odgovor.json();
      if (!odgovor.ok) throw new Error(podaci.error ?? 'Greška pri učitavanju.');
      setProfil(podaci.profil);
    } catch (err) {
      setGreska(err instanceof Error ? err.message : 'Greška pri učitavanju profila.');
    } finally {
      setUcitava(false);
    }
  }

  useEffect(() => { ucitajProfil(); }, []);

  const uloga: UserRole = (() => {
    if (!profil) return 'korisnik';
    if (profil.uloge.includes('admin'))    return 'admin';
    if (profil.uloge.includes('dispecer')) return 'dispecer';
    if (profil.uloge.includes('serviser')) return 'serviser';
    return 'korisnik';
  })();

  if (ucitava) {
    return (
      <AppShell uloga="korisnik">
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-sm" style={{ color: 'var(--first-nonary)' }}>Učitavanje profila...</p>
        </div>
      </AppShell>
    );
  }

  if (greska || !profil) {
    return (
      <AppShell uloga="korisnik">
        <AlertMessage variant="error" message={greska ?? 'Profil nije dostupan.'} />
      </AppShell>
    );
  }

  return (
    <AppShell uloga={uloga} imeKorisnika={`${profil.ime} ${profil.prezime}`.trim()}>
      <div className="mx-auto max-w-2xl">
        {/* Zaglavlje */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ backgroundColor: 'rgb(var(--first-secondary-rgb) / 0.12)' }}
          >
            <User className="h-7 w-7" style={{ color: 'var(--first-secondary)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--first-octonary)' }}>
              {profil.ime} {profil.prezime}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-sm" style={{ color: 'var(--first-nonary)' }}>
                {profil.email}
              </span>
              {profil.is_verified && <VerificationBadge />}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Lični podaci */}
          <SekcijaKartica
            naslov="Lični podaci"
            opis="Ažurirajte vaše kontakt informacije"
            Ikona={User}
          >
            <LicniPodaciSekcija profil={profil} onAzuriranje={ucitajProfil} />
          </SekcijaKartica>

          {/* Bazna lokacija — samo za servisere (US-48) */}
          {profil.uloge.includes('serviser') && (
            <SekcijaKartica
              naslov="Bazna lokacija"
              opis="Koordinate za geo-preporuku bližih intervencija"
              Ikona={MapPin}
            >
              <BaznaLokacijaSekcija profil={profil} onAzuriranje={ucitajProfil} />
            </SekcijaKartica>
          )}

          {/* Promjena lozinke */}
          <SekcijaKartica
            naslov="Sigurnost"
            opis="Promijenite lozinku za vaš nalog"
            Ikona={Lock}
          >
            <LozinkaSekcija />
          </SekcijaKartica>

          {/* Uloge i pristup */}
          <SekcijaKartica
            naslov="Uloge i pristup"
            opis="Vaši nalozi i preklopi između uloga"
            Ikona={ArrowLeftRight}
          >
            <UlogeSekcija uloge={profil.uloge} />
          </SekcijaKartica>
        </div>
      </div>
    </AppShell>
  );
}
