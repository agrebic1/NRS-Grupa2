'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, X, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { AlertMessage } from '@/components/ui/AlertMessage';
import {
  InlineNotice,
  KorisnikZahtjevDetaljPanel,
  KorisnikZahtjevDonjaNapomena,
} from '@/components/korisnik/KorisnikZahtjevDetaljPregled';
import { korisnikDonjiStatusObjasnjenje } from '@/lib/servisirane/korisnickiDetaljTekstovi';
import type { ServisniZahtjev } from '@/domain/types/servisirane';
import { brojZahtjevaZaPrikaz } from '@/lib/servisirane/korisnickiBrojZahtjeva';
import { labelKategorije } from '@/lib/servisirane/kategorije';
import { formatPrijavljenoDatumVrijeme } from '@/lib/servisirane/zahtjevPrikaz';
import { korisnikSmijeMijenjatiIliOtkazatiZahtjev } from '@/lib/servisirane/statusZahtjeva';
import { inboxGrupaIzKorisnickeProcjene } from '@/lib/servisirane/urgency';
import {
  DISPECER_PALETA_HITNOST,
  DISPECER_PALETA_PREMIUM,
} from '@/lib/servisirane/dispecerPaleta';

const RAZLOZI_OTKAZIVANJA = [
  { value: 'Kvar otklonjen samostalno',     label: 'Kvar otklonjen samostalno' },
  { value: 'Greška pri prijavi',            label: 'Greška pri prijavi' },
  { value: 'Promijenio/la sam mišljenje',   label: 'Promijenio/la sam mišljenje' },
  { value: 'Angažovao/la drugog servisera', label: 'Angažovao/la drugog servisera' },
  { value: 'Ostalo',                        label: 'Ostalo' },
];

// ─── Inline panel za izmjenu ──────────────────────────────────────────────────

function PanelZaIzmjenu({
  zahtjev,
  onUspjeh,
  onOdustanak,
}: {
  zahtjev:     ServisniZahtjev;
  onUspjeh:    () => void;
  onOdustanak: () => void;
}) {
  const [description,   setDescription]   = useState(zahtjev.description);
  const [address,       setAddress]       = useState(zahtjev.address);
  const [contactPhone,  setContactPhone]  = useState(zahtjev.contact_phone);
  const [jeSlanje,      setJeSlanje]      = useState(false);
  const [greska,        setGreska]        = useState<string | null>(null);

  async function spremi() {
    if (description.trim().length < 10) { setGreska('Opis mora imati najmanje 10 karaktera.'); return; }
    if (address.trim().length < 5)      { setGreska('Adresa mora imati najmanje 5 karaktera.'); return; }

    setJeSlanje(true);
    setGreska(null);
    try {
      const odgovor = await fetch(`/api/service-requests/${zahtjev.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ description, address, contact_phone: contactPhone }),
      });
      const podaci = await odgovor.json();
      if (!odgovor.ok) throw new Error(podaci.error ?? 'Greška pri izmjeni.');
      onUspjeh();
    } catch (err) {
      setGreska(err instanceof Error ? err.message : 'Greška pri izmjeni.');
    } finally {
      setJeSlanje(false);
    }
  }

  return (
    <div
      className="flex flex-col gap-5 rounded-xl border p-5"
      style={{ borderColor: 'rgb(var(--first-quaternary-rgb) / 0.4)' }}
    >
      <h3
        className="text-[10px] font-semibold uppercase tracking-[0.12em]"
        style={{ color: 'rgb(var(--first-nonary-rgb) / 0.72)' }}
      >
        Izmjena zahtjeva
      </h3>
      {greska && <AlertMessage variant="error" message={greska} />}
      <Textarea
        label="Opis kvara"
        id="edit-opis"
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        showCharacterCount
        maxCharacters={2000}
        currentLength={description.length}
      />
      <Input
        label="Adresa"
        id="edit-adresa"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <Input
        label="Kontakt telefon"
        id="edit-telefon"
        type="tel"
        value={contactPhone}
        onChange={(e) => setContactPhone(e.target.value)}
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3">
        <Button
          type="button"
          variant="ghost"
          size="md"
          className="w-full sm:w-auto"
          onClick={onOdustanak}
          disabled={jeSlanje}
        >
          Odustani
        </Button>
        <Button
          type="button"
          variant="primary"
          size="md"
          className="w-full sm:w-auto"
          onClick={spremi}
          isLoading={jeSlanje}
          loadingText="Spremanje..."
        >
          Spremi izmjene
        </Button>
      </div>
    </div>
  );
}

// ─── Inline panel za otkazivanje ──────────────────────────────────────────────

function PanelZaOtkazivanje({
  zahtjevId,
  onUspjeh,
  onOdustanak,
}: {
  zahtjevId:   number;
  onUspjeh:    () => void;
  onOdustanak: () => void;
}) {
  const [razlog,    setRazlog]    = useState('');
  const [jeSlanje,  setJeSlanje]  = useState(false);
  const [greska,    setGreska]    = useState<string | null>(null);

  async function potvrdiOtkazivanje() {
    if (!razlog) { setGreska('Odaberite razlog otkazivanja.'); return; }

    setJeSlanje(true);
    setGreska(null);
    try {
      const odgovor = await fetch(`/api/service-requests/${zahtjevId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'cancel', cancel_reason: razlog }),
      });
      const podaci = await odgovor.json();
      if (!odgovor.ok) throw new Error(podaci.error ?? 'Greška pri otkazivanju.');
      onUspjeh();
    } catch (err) {
      setGreska(err instanceof Error ? err.message : 'Greška pri otkazivanju.');
    } finally {
      setJeSlanje(false);
    }
  }

  return (
    <div
      className="flex flex-col gap-5 rounded-xl border p-5"
      style={{ borderColor: 'rgba(220,38,38,0.3)' }}
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" style={{ color: 'var(--first-senary)' }} />
        <h3
          className="text-[10px] font-semibold uppercase tracking-[0.12em]"
          style={{ color: 'var(--first-senary)' }}
        >
          Otkazivanje zahtjeva
        </h3>
      </div>
      {greska && <AlertMessage variant="error" message={greska} />}
      <Select
        label="Razlog otkazivanja"
        id="cancel-razlog"
        options={RAZLOZI_OTKAZIVANJA}
        placeholder="- Odaberite razlog -"
        value={razlog}
        onChange={(e) => setRazlog(e.target.value)}
        error={!razlog && greska ? 'Razlog je obavezan' : undefined}
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3">
        <Button
          type="button"
          variant="ghost"
          size="md"
          className="w-full sm:w-auto"
          onClick={onOdustanak}
          disabled={jeSlanje}
        >
          Odustani
        </Button>
        <Button
          type="button"
          variant="danger"
          size="md"
          className="w-full sm:w-auto"
          onClick={potvrdiOtkazivanje}
          isLoading={jeSlanje}
          loadingText="Otkazivanje..."
        >
          Potvrdi otkazivanje
        </Button>
      </div>
    </div>
  );
}

// ─── Otkazi dugme za footer (border-only crveni outline bez !important) ───────

function OtkaziFooterDugme({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 px-5 py-2 text-sm font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-300/50 focus:ring-offset-2 hover:bg-red-50 sm:w-auto"
      style={{
        borderColor: 'rgba(220,38,38,0.4)',
        color: '#B91C1C',
        backgroundColor: 'transparent',
      }}
    >
      <X className="h-4 w-4" />
      Otkaži zahtjev
    </button>
  );
}

// ─── Stranica ─────────────────────────────────────────────────────────────────

export default function ZahtjevDetaljPage() {
  const params = useParams();
  const router = useRouter();
  const id     = params.id as string;

  const [zahtjev,          setZahtjev]          = useState<ServisniZahtjev | null>(null);
  const [ucitava,          setUcitava]          = useState(true);
  const [greska,           setGreska]           = useState<string | null>(null);
  const [aktivniPanel,     setAktivniPanel]     = useState<'izmjena' | 'otkazivanje' | null>(null);
  const [jeAkcijaDone,     setJeAkcijaDone]     = useState(false);
  const [porukaProširena,  setPorukaProširena]  = useState(false);

  const ucitajZahtjev = useCallback(async () => {
    setUcitava(true);
    setGreska(null);
    try {
      const odgovor = await fetch(`/api/service-requests/${id}`, { cache: 'no-store' });
      const podaci  = await odgovor.json();
      if (!odgovor.ok) throw new Error(podaci.error ?? 'Zahtjev nije pronađen.');
      setZahtjev(podaci.zahtjev);
    } catch (err) {
      setGreska(err instanceof Error ? err.message : 'Greška pri učitavanju.');
    } finally {
      setUcitava(false);
    }
  }, [id]);

  useEffect(() => { ucitajZahtjev(); }, [ucitajZahtjev]);

  useEffect(() => {
    setPorukaProširena(false);
  }, [id]);

  function onUspjehAkcije() {
    setJeAkcijaDone(true);
    setAktivniPanel(null);
    ucitajZahtjev();
  }

  if (ucitava) {
    return (
      <AppShell uloga="korisnik">
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-sm" style={{ color: 'var(--first-nonary)' }}>Učitavanje...</p>
        </div>
      </AppShell>
    );
  }

  if (greska || !zahtjev) {
    return (
      <AppShell uloga="korisnik">
        <div className="flex flex-col gap-4">
          <AlertMessage variant="error" message={greska ?? 'Zahtjev nije pronađen.'} />
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

  const mozeBitMijenjan = korisnikSmijeMijenjatiIliOtkazatiZahtjev(
    zahtjev.status,
    zahtjev.final_priority,
  );
  const uAktivnojDispecerskojObradi =
    zahtjev.status === 'in_review' ||
    (((zahtjev.status === 'na_cekanju' || zahtjev.status === 'pending_review') &&
      Boolean((zahtjev.final_priority ?? '').trim())));

  const kategorija = labelKategorije(zahtjev);
  const naslovZahtjeva = kategorija.podkategorija || kategorija.glavna;

  const opisSirovo = (zahtjev.description ?? '').trim();
  const porukaTrebaSkracivanje = opisSirovo.length > 180;

  const donjiObjasnjenje = korisnikDonjiStatusObjasnjenje(
    uAktivnojDispecerskojObradi,
    mozeBitMijenjan,
  );

  const ribBoja = zahtjev.is_premium
    ? DISPECER_PALETA_PREMIUM.akcent
    : DISPECER_PALETA_HITNOST[inboxGrupaIzKorisnickeProcjene(zahtjev)].border;

  const imaRazlogOdbijanja =
    zahtjev.status === 'odbijeno' && Boolean(zahtjev.rejection_reason?.trim());
  const imaRazlogOtkazivanja = Boolean(zahtjev.cancel_reason);
  const imaIzmjenuOdKreiranja =
    Boolean(zahtjev.updated_at) && zahtjev.updated_at !== zahtjev.created_at;
  const imaOtkazaniDatum = zahtjev.status === 'otkazano' && Boolean(zahtjev.cancelled_at);
  const prikaziDonjuNapomenu =
    !mozeBitMijenjan &&
    zahtjev.status !== 'otkazano' &&
    zahtjev.status !== 'odbijeno' &&
    zahtjev.status !== 'zavrseno' &&
    Boolean(donjiObjasnjenje);

  const imaBilokojuNapomenu =
    imaRazlogOdbijanja ||
    imaRazlogOtkazivanja ||
    imaIzmjenuOdKreiranja ||
    imaOtkazaniDatum ||
    prikaziDonjuNapomenu;

  return (
    <AppShell uloga="korisnik">
      <div className="mx-auto max-w-5xl">
        {/* Breadcrumb (isti pattern kao dispečerski detalj) */}
        <nav
          className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm"
          aria-label="Navigacija"
        >
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center rounded-lg p-1 transition-opacity hover:opacity-70 focus:outline-none"
            style={{ color: 'var(--first-secondary)' }}
            aria-label="Nazad"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <Link
            href="/korisnik"
            className="font-medium transition-opacity hover:opacity-70"
            style={{ color: 'var(--first-secondary)' }}
          >
            Pregled
          </Link>
          <span style={{ color: 'var(--first-nonary)' }}>/</span>
          <Link
            href="/korisnik/zahtjevi"
            className="font-medium transition-opacity hover:opacity-70"
            style={{ color: 'var(--first-secondary)' }}
          >
            Moji zahtjevi
          </Link>
          <span style={{ color: 'var(--first-nonary)' }}>/</span>
          <span className="font-medium" style={{ color: 'var(--first-octonary)' }}>
            #{brojZahtjevaZaPrikaz(zahtjev)} {naslovZahtjeva}
          </span>
        </nav>

        {/* Bijela kartica + lijevi rib (premium / hitnost) - isti vizuelni jezik kao liste */}
        <article
          className="flex min-w-0 flex-col overflow-hidden rounded-2xl shadow-sm"
          style={{
            backgroundColor: 'rgb(255 255 255 / 0.72)',
            borderStyle: 'solid',
            borderColor: 'rgb(var(--first-quaternary-rgb) / 0.35)',
            borderWidth: 1,
            borderLeftWidth: 4,
            borderLeftColor: ribBoja,
          }}
        >
          <div className="px-5 py-6 sm:px-7 sm:py-7">
            {jeAkcijaDone ? (
              <div className="mb-5">
                <AlertMessage variant="success" message="Izmjena je uspješno sačuvana." />
              </div>
            ) : null}

            <KorisnikZahtjevDetaljPanel
              zahtjev={zahtjev}
              mozeBitMijenjan={mozeBitMijenjan}
              uAktivnojDispecerskojObradi={uAktivnojDispecerskojObradi}
              porukaProširena={porukaProširena}
              porukaTrebaSkracivanje={porukaTrebaSkracivanje}
              onTogglePoruku={() => setPorukaProširena((v) => !v)}
            />

            {/* Inline notices (border-only kalup, jedinstven stil) */}
            {imaBilokojuNapomenu ? (
              <div className="mt-5 space-y-3">
                {imaRazlogOdbijanja ? (
                  <InlineNotice ton="danger">
                    <p className="font-semibold">Razlog odbijanja</p>
                    <p className="mt-1 leading-relaxed">{zahtjev.rejection_reason!.trim()}</p>
                    <Link
                      href="/korisnik/zahtjevi/novi"
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors"
                      style={{ backgroundColor: 'rgba(220,38,38,0.12)', color: '#B91C1C', border: '1px solid rgba(220,38,38,0.25)' }}
                    >
                      Pošalji novi zahtjev
                    </Link>
                  </InlineNotice>
                ) : null}

                {imaRazlogOtkazivanja ? (
                  <InlineNotice>
                    <span className="font-semibold">Razlog otkazivanja: </span>
                    {zahtjev.cancel_reason}
                  </InlineNotice>
                ) : null}

                {imaIzmjenuOdKreiranja || imaOtkazaniDatum ? (
                  <InlineNotice>
                    {imaIzmjenuOdKreiranja ? (
                      <p>
                        <span className="font-semibold">Zadnja izmjena: </span>
                        {formatPrijavljenoDatumVrijeme(zahtjev.updated_at!)}
                      </p>
                    ) : null}
                    {imaOtkazaniDatum ? (
                      <p className={imaIzmjenuOdKreiranja ? 'mt-1' : ''}>
                        <span className="font-semibold">Otkazano: </span>
                        {formatPrijavljenoDatumVrijeme(zahtjev.cancelled_at!)}
                      </p>
                    ) : null}
                  </InlineNotice>
                ) : null}

                {prikaziDonjuNapomenu && donjiObjasnjenje ? (
                  <KorisnikZahtjevDonjaNapomena>{donjiObjasnjenje}</KorisnikZahtjevDonjaNapomena>
                ) : null}
              </div>
            ) : null}

            {/* Inline paneli za izmjenu / otkazivanje */}
            {aktivniPanel === 'izmjena' ? (
              <div className="mt-6">
                <PanelZaIzmjenu
                  zahtjev={zahtjev}
                  onUspjeh={onUspjehAkcije}
                  onOdustanak={() => setAktivniPanel(null)}
                />
              </div>
            ) : null}

            {aktivniPanel === 'otkazivanje' ? (
              <div className="mt-6">
                <PanelZaOtkazivanje
                  zahtjevId={zahtjev.id}
                  onUspjeh={() => {
                    onUspjehAkcije();
                    router.push('/korisnik/zahtjevi');
                  }}
                  onOdustanak={() => setAktivniPanel(null)}
                />
              </div>
            ) : null}
          </div>

          {/* Footer akcije (border-top, isti pattern kao dispečerski step footer) */}
          {mozeBitMijenjan && aktivniPanel === null ? (
            <div
              className="flex flex-col gap-2 border-t px-5 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3 sm:px-7"
              style={{ borderColor: 'rgb(var(--first-quaternary-rgb) / 0.22)' }}
            >
              <OtkaziFooterDugme onClick={() => setAktivniPanel('otkazivanje')} />
              <Button
                type="button"
                variant="primary"
                size="md"
                className="w-full sm:w-auto"
                onClick={() => setAktivniPanel('izmjena')}
              >
                <Pencil className="h-4 w-4" />
                Izmijeni zahtjev
              </Button>
            </div>
          ) : null}
        </article>

      </div>
    </AppShell>
  );
}
