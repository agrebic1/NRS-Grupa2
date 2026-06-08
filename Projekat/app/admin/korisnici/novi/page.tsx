'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

type UlogaOpcija = 'serviser' | 'dispecer' | 'administrator';

type FormState = {
  first_name: string;
  last_name: string;
  email: string;
  role: UlogaOpcija | '';
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const inicijalnoStanje: FormState = {
  first_name: '',
  last_name: '',
  email: '',
  role: '',
};

type ApiResponseBody = {
  error?: string;
  user?: { email?: string };
  privremena_lozinka?: string | null;
};

function mapirajPoljaGreske(message: string): FormErrors {
  const greske: FormErrors = {};
  if (message.includes('Ime')) greske.first_name = message;
  if (message.includes('Prezime')) greske.last_name = message;
  if (message.includes('email')) greske.email = message;
  if (message.includes('ulogu')) greske.role = message;
  return greske;
}

async function procitajApiBody(response: Response): Promise<ApiResponseBody> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return {};
  }

  try {
    return (await response.json()) as ApiResponseBody;
  } catch {
    return {};
  }
}

export default function NoviInterniKorisnikPage() {
  const [forma, setForma] = useState<FormState>(inicijalnoStanje);
  const [greske, setGreske] = useState<FormErrors>({});
  const [serverGreska, setServerGreska] = useState<string | null>(null);
  const [uspjeh, setUspjeh] = useState<string | null>(null);
  const [privremenaLozinka, setPrivremenaLozinka] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setServerGreska(null);
    setUspjeh(null);
    setPrivremenaLozinka(null);
    setGreske({});

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(forma),
      });

      const body = await procitajApiBody(response);

      if (!response.ok) {
        const poruka =
          body.error ??
          (response.status === 401 || response.status === 403
            ? 'Sesija je istekla ili nemate dozvolu. Prijavite se ponovo.'
            : 'Kreiranje internog naloga nije uspjelo.');
        setServerGreska(poruka);
        setGreske(mapirajPoljaGreske(poruka));
        return;
      }

      setUspjeh(
        `Interni korisnik ${body.user?.email ?? forma.email} je uspjesno kreiran.`,
      );
      setPrivremenaLozinka(body.privremena_lozinka ?? null);
      setForma(inicijalnoStanje);
    } catch {
      setServerGreska(
        'Kreiranje internog naloga nije uspjelo. Pokusajte ponovo.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell uloga="admin" imeKorisnika="Administrator">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: 'var(--first-octonary)' }}
            >
              Kreiranje internog naloga
            </h1>
            <p
              className="mt-1 text-sm"
              style={{ color: 'var(--first-nonary)' }}
            >
              Administrator kreira nalog i dodjeljuje internu ulogu.
            </p>
          </div>
          <Link href="/admin">
            <Button variant="secondary">Nazad</Button>
          </Link>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-5 rounded-2xl border p-6 shadow-card"
          style={{
            backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.22)',
            borderColor: 'rgb(var(--first-quaternary-rgb) / 0.35)',
          }}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Ime"
              value={forma.first_name}
              onChange={(e) =>
                setForma((p) => ({ ...p, first_name: e.target.value }))
              }
              error={greske.first_name}
              required
            />
            <Input
              label="Prezime"
              value={forma.last_name}
              onChange={(e) =>
                setForma((p) => ({ ...p, last_name: e.target.value }))
              }
              error={greske.last_name}
              required
            />
          </div>

          <Input
            label="Email adresa"
            type="email"
            value={forma.email}
            onChange={(e) => setForma((p) => ({ ...p, email: e.target.value }))}
            error={greske.email}
            required
          />

          <Select
            label="Uloga"
            placeholder="Odaberite ulogu"
            options={[
              { value: 'serviser', label: 'Serviser' },
              { value: 'dispecer', label: 'Dispecer' },
              { value: 'administrator', label: 'Administrator' },
            ]}
            value={forma.role}
            onChange={(e) =>
              setForma((p) => ({ ...p, role: e.target.value as UlogaOpcija }))
            }
            error={greske.role}
            required
          />

          {serverGreska && (
            <div
              className="rounded-xl border px-4 py-3 text-sm"
              style={{
                borderColor: 'rgb(var(--first-senary-rgb) / 0.25)',
                backgroundColor: 'rgb(var(--first-senary-rgb) / 0.08)',
                color: 'var(--first-senary)',
              }}
            >
              {serverGreska}
            </div>
          )}

          {uspjeh && (
            <div
              className="rounded-xl border px-4 py-3 text-sm"
              style={{
                borderColor: 'rgb(var(--first-secondary-rgb) / 0.25)',
                backgroundColor: 'rgb(var(--first-secondary-rgb) / 0.1)',
                color: 'var(--first-secondary)',
              }}
            >
              <p>{uspjeh}</p>
              {privremenaLozinka && (
                <p className="mt-1">
                  Privremena lozinka: <strong>{privremenaLozinka}</strong>
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <Link href="/admin">
              <Button type="button" variant="secondary" disabled={loading}>
                Otkazi
              </Button>
            </Link>
            <Button
              type="submit"
              isLoading={loading}
              loadingText="Kreiranje..."
            >
              Kreiraj nalog
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
