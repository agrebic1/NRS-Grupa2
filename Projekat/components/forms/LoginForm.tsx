'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Info } from 'lucide-react';
import Link from 'next/link';
import {
  prijavnaShema,
  type PrijavniPodaci,
} from '@/lib/validations/authValidation';
import {
  prijaviSeEmailom,
  odrediRedirectNakonPrijave,
} from '@/services/auth/authService';
import { PORUKA_NEISPRAVNA_PRIJAVA } from '@/lib/auth/greskaPrijave';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AlertMessage } from '@/components/ui/AlertMessage';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';

export function LoginForm() {
  const router = useRouter();

  const [jeLozinkaVidljiva, setJeLozinkaVidljiva] = useState(false);
  const [greska, setGreska] = useState<string | null>(null);
  const [poruka, setPoruka] = useState<string | null>(null);
  const [jePrijavljivanje, setJePrijavljivanje] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<PrijavniPodaci>({
    resolver: zodResolver(prijavnaShema),
    mode: 'onChange',
  });

  async function prijaviSe(podaci: PrijavniPodaci) {
    setGreska(null);
    setPoruka(null);
    setJePrijavljivanje(true);
    try {
      const rezultat = await prijaviSeEmailom(podaci);
      const putanjaZaRedirect = await odrediRedirectNakonPrijave(
        rezultat.user.id,
      );
      setJePrijavljivanje(false);
      setPoruka('Uspješno ste prijavljeni.');
      await new Promise((resolve) => setTimeout(resolve, 900));
      router.push(putanjaZaRedirect);
    } catch (error) {
      if (error instanceof Error) {
        setGreska(error.message);
        return;
      }
      setGreska(PORUKA_NEISPRAVNA_PRIJAVA);
    } finally {
      setJePrijavljivanje(false);
    }
  }

  const dugmeZaLozinku = (
    <button
      type="button"
      onClick={() => setJeLozinkaVidljiva((v) => !v)}
      className="transition-opacity duration-200 hover:opacity-70"
      style={{ color: 'var(--first-nonary)' }}
      aria-label={jeLozinkaVidljiva ? 'Sakrij lozinku' : 'Prikaži lozinku'}
    >
      {jeLozinkaVidljiva ? (
        <EyeOff className="h-4 w-4" />
      ) : (
        <Eye className="h-4 w-4" />
      )}
    </button>
  );

  return (
    <>
      <LoadingOverlay
        isVisible={jePrijavljivanje}
        message="Prijavljivanje u sistem..."
      />

      <form
        onSubmit={handleSubmit(prijaviSe)}
        noValidate
        className="flex flex-col gap-5"
      >
        {greska && <AlertMessage variant="error" message={greska} />}
        {poruka && <AlertMessage variant="success" message={poruka} />}

        <Input
          label="Email adresa"
          type="email"
          placeholder="vas@email.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Lozinka"
          type={jeLozinkaVidljiva ? 'text' : 'password'}
          autoComplete="current-password"
          endAdornment={dugmeZaLozinku}
          error={errors.lozinka?.message}
          {...register('lozinka')}
        />

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 cursor-pointer rounded"
              style={{ accentColor: 'var(--first-primary)' }}
            />
            <span
              className="select-none text-sm"
              style={{ color: 'var(--first-nonary)' }}
            >
              Zapamti me
            </span>
          </label>
          <Link
            href="/auth/zaboravljena-lozinka"
            className="text-sm font-medium transition-opacity duration-200 hover:opacity-70"
            style={{ color: 'var(--first-secondary)' }}
          >
            Zaboravili ste lozinku?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          isLoading={isSubmitting}
          loadingText="Prijavljivanje..."
          className="w-full"
          size="lg"
        >
          Prijavi se
        </Button>

        <div
          className="flex items-start gap-2 rounded-xl px-4 py-3 text-xs"
          style={{
            backgroundColor: 'rgb(var(--first-secondary-rgb) / 0.08)',
            border: '1px solid rgb(var(--first-secondary-rgb) / 0.2)',
            color: 'var(--first-nonary)',
          }}
        >
          <Info
            className="mt-0.5 h-3.5 w-3.5 flex-shrink-0"
            style={{ color: 'var(--first-secondary)' }}
          />
          <span>
            Ako ste serviser ili uposlenik sistema, koristite nalog koji vam je
            dodijelio administrator.
          </span>
        </div>
      </form>
    </>
  );
}
