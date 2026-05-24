'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useForm, type FieldPath } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, ChevronRight, ChevronLeft, Check, Mail } from 'lucide-react';
import { registracijskaShema, type RegistracijskiPodaci } from '@/lib/validations/authValidation';
import {
  odrediRedirectNakonPrijave,
  posaljiPonovoVerifikacijskiEmail,
  PotrebnaPotvrdaEmailaError,
  registrujKorisnika,
} from '@/services/auth/authService';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AlertMessage } from '@/components/ui/AlertMessage';
import { PasswordStrengthIndicator } from '@/components/ui/PasswordStrengthIndicator';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';

// Konfiguracija koraka 

const UKUPNO_KORAKA = 2;

const OZNAKE_KORAKA = ['Lični podaci', 'Sigurnost'] as const;

const POLJA_PO_KORAKU: Record<number, FieldPath<RegistracijskiPodaci>[]> = {
  1: ['ime', 'prezime', 'email', 'telefon'],
  2: ['lozinka', 'potvrdaLozinke'],
};

/** Pauza prije ponovnog slanja emaila s linkom (ograničenje na klijentu). */
const SEKUNDE_DO_PONOVNOG_SLANJA = 60;

// Komponenta za progres bar 

function TrakaNapretka({ trenutniKorak }: { trenutniKorak: number }) {
  return (
    <div className="mb-7">
      <div className="mb-3 flex items-center">
        {OZNAKE_KORAKA.map((oznaka, i) => {
          const brojKoraka  = i + 1;
          const jeZavrsen   = brojKoraka < trenutniKorak;
          const jeTrenutni  = brojKoraka === trenutniKorak;

          return (
            <div key={oznaka} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300"
                  style={{
                    backgroundColor: jeZavrsen
                      ? 'var(--first-primary)'
                      : jeTrenutni
                      ? 'var(--first-septenary)'
                      : 'rgb(var(--first-quinary-rgb) / 0.5)',
                    color: jeZavrsen ? 'var(--first-white)' : jeTrenutni ? 'var(--first-octonary)' : 'var(--first-nonary)',
                  }}
                >
                  {jeZavrsen ? <Check className="h-3.5 w-3.5" /> : brojKoraka}
                </div>
                <span className="text-xs font-medium" style={{ color: jeTrenutni ? 'var(--first-octonary)' : 'var(--first-nonary)' }}>
                  {oznaka}
                </span>
              </div>
              {i < OZNAKE_KORAKA.length - 1 && (
                <div
                  className="mx-2 mb-4 h-px flex-1 transition-all duration-500"
                  style={{ backgroundColor: trenutniKorak > i + 1 ? 'var(--first-primary)' : 'var(--first-quaternary)', opacity: 0.5 }}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="h-1 overflow-hidden rounded-full" style={{ backgroundColor: 'rgb(var(--first-quaternary-rgb) / 0.35)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${((trenutniKorak - 1) / (UKUPNO_KORAKA - 1)) * 100}%`, backgroundColor: 'var(--first-septenary)' }}
        />
      </div>
    </div>
  );
}

// Glavna komponenta 

export function RegisterForm() {
  const router = useRouter();

  const [trenutniKorak,      setTrenutniKorak]      = useState(1);
  const [jeLozinkaVidljiva,  setJeLozinkaVidljiva]  = useState(false);
  const [jePotvrdaVidljiva,  setJePotvrdaVidljiva]  = useState(false);
  const [greskaRegistracije, setGreskaRegistracije] = useState<string | null>(null);
  const [jeKreiranjeNaloga,  setJeKreiranjeNaloga]  = useState(false);
  const [emailCekaPotvrdu, setEmailCekaPotvrdu] = useState<string | null>(null);
  const [preostaleSekundePonovo, setPreostaleSekundePonovo] = useState(0);
  const [porukaNakonPonovnogSlanja, setPorukaNakonPonovnogSlanja] = useState<string | null>(null);
  const [greskaPonovnogSlanja, setGreskaPonovnogSlanja] = useState<string | null>(null);
  const [jeSlanjePonovo, setJeSlanjePonovo] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegistracijskiPodaci>({
    resolver: zodResolver(registracijskaShema),
    mode: 'onChange',
  });

  const posmatranLozinka = watch('lozinka', '');

  useEffect(() => {
    if (emailCekaPotvrdu === null || preostaleSekundePonovo <= 0) return;
    const id = window.setTimeout(() => {
      setPreostaleSekundePonovo((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearTimeout(id);
  }, [emailCekaPotvrdu, preostaleSekundePonovo]);

  async function idiNaSljedeciKorak() {
    const jeKorakValidan = await trigger(POLJA_PO_KORAKU[trenutniKorak]);
    if (jeKorakValidan) setTrenutniKorak((k) => Math.min(k + 1, UKUPNO_KORAKA));
  }

  function idiNaPrethodniKorak() {
    setTrenutniKorak((k) => Math.max(k - 1, 1));
  }

  async function posaljiRegistraciju(podaci: RegistracijskiPodaci) {
    setGreskaRegistracije(null);
    setJeKreiranjeNaloga(true);
    try {
      const rezultat = await registrujKorisnika(podaci);
      const putanja = await odrediRedirectNakonPrijave(rezultat.user.id);
      router.replace(putanja);
    } catch (greska) {
      if (greska instanceof PotrebnaPotvrdaEmailaError) {
        setEmailCekaPotvrdu(greska.email);
        setPreostaleSekundePonovo(SEKUNDE_DO_PONOVNOG_SLANJA);
        setPorukaNakonPonovnogSlanja(null);
        setGreskaPonovnogSlanja(null);
        setGreskaRegistracije(null);
      } else {
        setGreskaRegistracije(
          greska instanceof Error ? greska.message : 'Kreiranje naloga nije uspjelo. Pokušajte ponovo.'
        );
      }
      setJeKreiranjeNaloga(false);
    }
    // Nema finally - loader ostaje vidljiv dok traje redirect
  }

  async function ponovoPosaljiVerifikaciju() {
    if (!emailCekaPotvrdu || preostaleSekundePonovo > 0 || jeSlanjePonovo) return;
    setGreskaPonovnogSlanja(null);
    setPorukaNakonPonovnogSlanja(null);
    setJeSlanjePonovo(true);
    try {
      await posaljiPonovoVerifikacijskiEmail(emailCekaPotvrdu);
      setPorukaNakonPonovnogSlanja('Poslali smo novi link za potvrdu naloga.');
      setPreostaleSekundePonovo(SEKUNDE_DO_PONOVNOG_SLANJA);
    } catch {
      setGreskaPonovnogSlanja('Nije moguće poslati novi link. Pokušajte ponovo.');
    } finally {
      setJeSlanjePonovo(false);
    }
  }

  function zatvoriEkranPotvrde() {
    setEmailCekaPotvrdu(null);
    setPreostaleSekundePonovo(0);
    setPorukaNakonPonovnogSlanja(null);
    setGreskaPonovnogSlanja(null);
    setTrenutniKorak(1);
    reset();
  }

  if (emailCekaPotvrdu) {
    return (
      <>
        <div
          className="flex flex-col gap-4 rounded-2xl border p-6 shadow-sm animate-fade-up"
          style={{
            borderColor: 'var(--first-quaternary)',
            backgroundColor: 'rgb(var(--first-secondary-rgb) / 0.06)',
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: 'rgb(var(--first-septenary-rgb) / 0.2)', color: 'var(--first-octonary)' }}
            >
              <Mail className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              <h2 className="text-base font-semibold" style={{ color: 'var(--first-primary)' }}>
                Provjerite email
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--first-octonary)' }}>
                Poslali smo link za potvrdu naloga na adresu{' '}
                <strong className="break-all font-semibold" style={{ color: 'var(--first-primary)' }}>
                  {emailCekaPotvrdu}
                </strong>
                . Otvorite inbox i kliknite na link kako biste potvrdili nalog.
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--first-nonary)' }}>
                Ako email ne vidite odmah, provjerite spam folder ili mapu &quot;Neželjena pošta&quot;.
              </p>
              {preostaleSekundePonovo > 0 ? (
                <p className="text-sm tabular-nums" style={{ color: 'var(--first-nonary)' }}>
                  Novi link možete zatražiti za{' '}
                  <span className="font-semibold" style={{ color: 'var(--first-octonary)' }}>
                    {preostaleSekundePonovo}
                  </span>{' '}
                  s.
                </p>
              ) : (
                <p className="text-sm" style={{ color: 'var(--first-nonary)' }}>
                  Sada možete zatražiti novi link.
                </p>
              )}
            </div>
          </div>

          {porukaNakonPonovnogSlanja && (
            <AlertMessage variant="success" message={porukaNakonPonovnogSlanja} />
          )}
          {greskaPonovnogSlanja && (
            <AlertMessage variant="error" message={greskaPonovnogSlanja} />
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Button
              type="button"
              size="md"
              disabled={preostaleSekundePonovo > 0 || jeSlanjePonovo}
              isLoading={jeSlanjePonovo}
              loadingText="Šaljemo…"
              onClick={ponovoPosaljiVerifikaciju}
            >
              Pošalji novi link
            </Button>
            <Link
              href="/auth/login"
              className="text-center text-sm font-medium underline-offset-2 hover:underline sm:text-left"
              style={{ color: 'var(--first-secondary)' }}
            >
              Već ste potvrdili nalog? Prijavite se
            </Link>
            <Button type="button" variant="ghost" size="md" onClick={zatvoriEkranPotvrde}>
              Počni ispočetka
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <LoadingOverlay isVisible={jeKreiranjeNaloga} message="Kreiranje naloga..." />

      <TrakaNapretka trenutniKorak={trenutniKorak} />

      {greskaRegistracije && (
        <div className="mb-5">
          <AlertMessage variant="error" message={greskaRegistracije} />
        </div>
      )}

      <form onSubmit={handleSubmit(posaljiRegistraciju)} noValidate>
        {/* Korak 1: Lični podaci */}
        {trenutniKorak === 1 && (
          <div className="flex flex-col gap-4 animate-fade-up">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="Ime"
                type="text"
                placeholder="Npr. Amina"
                autoComplete="given-name"
                error={errors.ime?.message}
                {...register('ime')}
              />
              <Input
                label="Prezime"
                type="text"
                placeholder="Npr. Hodžić"
                autoComplete="family-name"
                error={errors.prezime?.message}
                {...register('prezime')}
              />
            </div>
            <Input
              label="Email adresa"
              type="email"
              placeholder="vas@email.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Broj telefona"
              type="tel"
              placeholder="+387 61 000 000"
              autoComplete="tel"
              error={errors.telefon?.message}
              {...register('telefon')}
            />
          </div>
        )}

        {/* Korak 2: Sigurnost */}
        {trenutniKorak === 2 && (
          <div className="flex flex-col gap-5 animate-fade-up">
            <div className="flex flex-col gap-1.5">
              <Input
                label="Lozinka"
                type={jeLozinkaVidljiva ? 'text' : 'password'}
                autoComplete="new-password"
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setJeLozinkaVidljiva((v) => !v)}
                    className="transition-opacity hover:opacity-70"
                    style={{ color: 'var(--first-nonary)' }}
                    aria-label={jeLozinkaVidljiva ? 'Sakrij lozinku' : 'Prikaži lozinku'}
                  >
                    {jeLozinkaVidljiva ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                error={errors.lozinka?.message}
                {...register('lozinka')}
              />
              <PasswordStrengthIndicator lozinka={posmatranLozinka} />
            </div>
            <Input
              label="Potvrda lozinke"
              type={jePotvrdaVidljiva ? 'text' : 'password'}
              autoComplete="new-password"
              endAdornment={
                <button
                  type="button"
                  onClick={() => setJePotvrdaVidljiva((v) => !v)}
                  className="transition-opacity hover:opacity-70"
                  style={{ color: 'var(--first-nonary)' }}
                  aria-label={jePotvrdaVidljiva ? 'Sakrij lozinku' : 'Prikaži lozinku'}
                >
                  {jePotvrdaVidljiva ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              error={errors.potvrdaLozinke?.message}
              {...register('potvrdaLozinke')}
            />
          </div>
        )}

        {/* Navigacija između koraka */}
        <div className="mt-8 flex items-center justify-between">
          {trenutniKorak > 1 ? (
            <Button type="button" variant="ghost" size="md" onClick={idiNaPrethodniKorak}>
              <ChevronLeft className="h-4 w-4" />
              Nazad
            </Button>
          ) : (
            <span />
          )}
          {trenutniKorak < UKUPNO_KORAKA ? (
            <Button type="button" size="md" onClick={idiNaSljedeciKorak}>
              Nastavi
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              isLoading={isSubmitting}
              loadingText="Kreiranje naloga..."
              size="md"
            >
              Kreiraj nalog
            </Button>
          )}
        </div>
      </form>
    </>
  );
}
