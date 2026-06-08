'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Clock,
  FileText,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { AlertMessage } from '@/components/ui/AlertMessage';
import {
  izracunajGreskuPreferiranogVremena,
  porukaValidacijePreferiranogTermina,
} from '@/components/forms/ServiceRequestWizard';
import { KorakTermin } from '@/components/wizard/KorakTermin';
import type { ServisniZahtjev, TerminSlot } from '@/domain/types/servisirane';
import { brojZahtjevaZaPrikaz } from '@/lib/servisirane/korisnickiBrojZahtjeva';
import { korisnikSmijeMijenjatiIliOtkazatiZahtjev } from '@/lib/servisirane/statusZahtjeva';
import { jeValidanKontaktTelefon } from '@/lib/validations/servisirane';

// ─── Forma za izmjenu ─────────────────────────────────────────────────────────

interface EditState {
  address: string;
  description: string;
  contactPhone: string;
  termini: TerminSlot[];
  noPreferredTime: boolean;
  timeValidationError: string | null;
}

function validiraj(s: EditState): string | null {
  if (s.address.trim().length < 5)
    return 'Adresa mora imati najmanje 5 karaktera.';
  if (s.address.trim().length > 500)
    return 'Adresa ne smije biti duža od 500 karaktera.';
  if (s.description.trim().length < 10)
    return 'Opis mora imati najmanje 10 karaktera.';
  if (s.description.trim().length > 2000)
    return 'Opis ne smije biti duži od 2000 karaktera.';
  if (s.contactPhone.trim() && !jeValidanKontaktTelefon(s.contactPhone))
    return 'Unesite ispravan kontakt telefon.';
  const pt = porukaValidacijePreferiranogTermina(s);
  if (pt) return pt;
  return null;
}

// ─── Stranica ─────────────────────────────────────────────────────────────────

export default function UrediZahtjevPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [zahtjev, setZahtjev] = useState<ServisniZahtjev | null>(null);
  const [ucitava, setUcitava] = useState(true);
  const [greska, setGreska] = useState<string | null>(null);
  const [jeUspjelo, setJeUspjelo] = useState(false);
  const [jeSlanje, setJeSlanje] = useState(false);

  const [editState, setEditState] = useState<EditState>({
    address: '',
    description: '',
    contactPhone: '',
    termini: [],
    noPreferredTime: false,
    timeValidationError: null,
  });

  // Učitaj zahtjev i postavi initial values
  useEffect(() => {
    async function ucitaj() {
      try {
        const r = await fetch(`/api/service-requests/${id}`, {
          cache: 'no-store',
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? 'Zahtjev nije pronađen.');
        const z: ServisniZahtjev = d.zahtjev;

        if (
          !korisnikSmijeMijenjatiIliOtkazatiZahtjev(z.status, z.final_priority)
        ) {
          setGreska(
            'Zahtjev se može izmijeniti samo dok dispečer još nije započeo obradu (nema snimljenog operativnog prioriteta).',
          );
          setUcitava(false);
          return;
        }

        setZahtjev(z);
        const ps = z.preferred_schedule;
        const ucitaniTermini = ps?.termini ?? [];
        const noPref =
          ps?.no_preferred_time === true || ucitaniTermini.length === 0;
        setEditState({
          address: z.address,
          description: z.description,
          contactPhone: z.contact_phone,
          termini: noPref ? [] : ucitaniTermini,
          noPreferredTime: noPref,
          timeValidationError: null,
        });
      } catch (err) {
        setGreska(
          err instanceof Error ? err.message : 'Greška pri učitavanju.',
        );
      } finally {
        setUcitava(false);
      }
    }
    ucitaj();
  }, [id]);

  function azurirajPolje(updates: Partial<EditState>) {
    setEditState((prev) => {
      const next = { ...prev, ...updates };
      if ('termini' in updates || 'noPreferredTime' in updates) {
        next.timeValidationError = izracunajGreskuPreferiranogVremena(next);
      }
      return next;
    });
    setGreska(null);
  }

  async function posaljiIzmjene() {
    const err = validiraj(editState);
    if (err) {
      setGreska(err);
      return;
    }

    setJeSlanje(true);
    setGreska(null);

    try {
      const r = await fetch(`/api/service-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: editState.address.trim(),
          description: editState.description.trim(),
          contact_phone: editState.contactPhone.trim() || undefined,
          preferred_schedule: editState.noPreferredTime
            ? { termini: [], no_preferred_time: true }
            : {
                termini: editState.termini.filter(
                  (t) => t?.date && t.from && t.to,
                ),
                no_preferred_time: false,
              },
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Greška pri ažuriranju.');
      setJeUspjelo(true);
    } catch (err) {
      setGreska(
        err instanceof Error ? err.message : 'Greška pri ažuriranju zahtjeva.',
      );
    } finally {
      setJeSlanje(false);
    }
  }

  // ─── Loading state ──────────────────────────────────────────────────────────

  if (ucitava) {
    return (
      <AppShell uloga="korisnik">
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-sm" style={{ color: 'var(--first-nonary)' }}>
            Učitavanje zahtjeva...
          </p>
        </div>
      </AppShell>
    );
  }

  // ─── Greška pri učitavanju ──────────────────────────────────────────────────

  if (greska && !zahtjev) {
    return (
      <AppShell uloga="korisnik">
        <div className="flex flex-col gap-4">
          <AlertMessage variant="error" message={greska} />
          <Link href="/korisnik/zahtjevi">
            <Button variant="secondary" size="md">
              <ArrowLeft className="h-4 w-4" />
              Povratak na listu
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  // ─── Uspješno ažuriran ──────────────────────────────────────────────────────

  if (jeUspjelo) {
    return (
      <AppShell uloga="korisnik">
        <div className="flex flex-col items-center gap-5 py-16 text-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full"
            style={{
              backgroundColor: 'rgb(var(--first-secondary-rgb) / 0.12)',
            }}
          >
            <CheckCircle2
              className="h-8 w-8"
              style={{ color: 'var(--first-secondary)' }}
            />
          </div>
          <h2
            className="text-xl font-bold"
            style={{ color: 'var(--first-octonary)' }}
          >
            Zahtjev je uspješno ažuriran!
          </h2>
          <p
            className="max-w-xs text-sm leading-relaxed"
            style={{ color: 'var(--first-nonary)' }}
          >
            Promjene su sačuvane. Dispečer će pregledati ažurirane podatke.
          </p>
          <Button size="md" onClick={() => router.push('/korisnik/zahtjevi')}>
            <ArrowLeft className="h-4 w-4" />
            Povratak na listu
          </Button>
        </div>
      </AppShell>
    );
  }

  // ─── Forma ──────────────────────────────────────────────────────────────────

  return (
    <AppShell uloga="korisnik">
      {/* Zaglavlje */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/korisnik/zahtjevi"
            className="mb-2 inline-flex items-center gap-1.5 text-sm transition-opacity hover:opacity-70"
            style={{ color: 'var(--first-nonary)' }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Povratak
          </Link>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: 'var(--first-octonary)' }}
          >
            Izmjena zahtjeva
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--first-nonary)' }}>
            {zahtjev && (
              <>
                Zahtjev #{brojZahtjevaZaPrikaz(zahtjev)} · {zahtjev.category}
                <br />
                Možete promijeniti adresu, termin ili opis kvara.
              </>
            )}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl">
        <div
          className="rounded-2xl p-6 shadow-card sm:p-8"
          style={{
            backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.22)',
            border: '1px solid rgb(var(--first-quaternary-rgb) / 0.4)',
          }}
        >
          {greska && (
            <div className="mb-5">
              <AlertMessage variant="error" message={greska} />
            </div>
          )}

          <div className="flex flex-col gap-7">
            {/* Adresa */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <MapPin
                  className="h-4 w-4 flex-shrink-0"
                  style={{ color: 'var(--first-nonary)' }}
                />
                <span
                  className="text-sm font-semibold"
                  style={{ color: 'var(--first-octonary)' }}
                >
                  Adresa kvara
                </span>
              </div>
              <input
                type="text"
                value={editState.address}
                onChange={(e) => azurirajPolje({ address: e.target.value })}
                placeholder="Unesite adresu..."
                className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                style={{
                  borderColor: 'rgb(var(--first-quaternary-rgb) / 0.45)',
                  backgroundColor: 'rgb(255 255 255 / 0.8)',
                  color: 'var(--first-octonary)',
                }}
              />
            </div>

            {/* Termini */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Clock
                  className="h-4 w-4 flex-shrink-0"
                  style={{ color: 'var(--first-nonary)' }}
                />
                <span
                  className="text-sm font-semibold"
                  style={{ color: 'var(--first-octonary)' }}
                >
                  Preferirani termin
                </span>
              </div>
              <KorakTermin
                termini={editState.termini}
                noPreferredTime={editState.noPreferredTime}
                validationError={editState.timeValidationError}
                onUpdate={azurirajPolje}
              />
            </div>

            {/* Opis */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <FileText
                  className="h-4 w-4 flex-shrink-0"
                  style={{ color: 'var(--first-nonary)' }}
                />
                <span
                  className="text-sm font-semibold"
                  style={{ color: 'var(--first-octonary)' }}
                >
                  Opis kvara
                </span>
              </div>
              <textarea
                value={editState.description}
                onChange={(e) => azurirajPolje({ description: e.target.value })}
                rows={5}
                placeholder="Opišite šta se desilo, kada je počelo i šta ste već pokušali..."
                className="w-full resize-none rounded-xl border px-4 py-2.5 text-sm
                  focus:outline-none focus:ring-2"
                style={{
                  borderColor: 'rgb(var(--first-quaternary-rgb) / 0.45)',
                  backgroundColor: 'rgb(255 255 255 / 0.8)',
                  color: 'var(--first-octonary)',
                }}
              />
              <p
                className="text-right text-xs"
                style={{ color: 'var(--first-quinary)' }}
              >
                {editState.description.length}/2000
              </p>
            </div>

            {/* Kontakt telefon */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Phone
                  className="h-4 w-4 flex-shrink-0"
                  style={{ color: 'var(--first-nonary)' }}
                />
                <span
                  className="text-sm font-semibold"
                  style={{ color: 'var(--first-octonary)' }}
                >
                  Kontakt telefon
                </span>
              </div>
              <input
                type="tel"
                value={editState.contactPhone}
                onChange={(e) =>
                  azurirajPolje({ contactPhone: e.target.value })
                }
                placeholder="+387 61 000 000"
                className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                style={{
                  borderColor: 'rgb(var(--first-quaternary-rgb) / 0.45)',
                  backgroundColor: 'rgb(255 255 255 / 0.8)',
                  color: 'var(--first-octonary)',
                }}
              />
            </div>

            {/* Akcije */}
            <div
              className="flex items-center justify-end gap-3 border-t pt-5"
              style={{ borderColor: 'rgb(var(--first-quaternary-rgb) / 0.3)' }}
            >
              <Link href="/korisnik/zahtjevi">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  disabled={jeSlanje}
                >
                  Odustani
                </Button>
              </Link>
              <Button
                type="button"
                size="md"
                onClick={posaljiIzmjene}
                isLoading={jeSlanje}
                loadingText="Ažuriranje..."
              >
                <CheckCircle2 className="h-4 w-4" />
                Sačuvaj izmjene
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
