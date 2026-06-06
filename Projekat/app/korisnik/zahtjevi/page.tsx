'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle, FileText, RefreshCw } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { ZahtjevKartica } from '@/components/servisirane/ZahtjevKartica';
import { OtkaziModal } from '@/components/servisirane/OtkaziModal';
import { ServiceRequestWizard } from '@/components/forms/ServiceRequestWizard';
import { AlertMessage } from '@/components/ui/AlertMessage';
import type { ServisniZahtjev } from '@/domain/types/servisirane';
import { jeZahtjevAktivan } from '@/lib/servisirane/statusZahtjeva';

// ─── Prazno stanje ────────────────────────────────────────────────────────────

function PraznoDashboard({ onZahtjevPoslan }: { onZahtjevPoslan: () => void }) {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="w-full text-center">
        <div
          className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ backgroundColor: 'rgb(var(--first-secondary-rgb) / 0.12)' }}
        >
          <FileText className="h-8 w-8" style={{ color: 'var(--first-secondary)' }} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--first-octonary)' }}>
          Dobrodošli!
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--first-nonary)' }}>
          Nemate još nijednog zahtjeva. Kreirajte novu prijavu ispod i naš tim će se pobrinuti.
        </p>
      </div>
      <div
        className="w-full max-w-2xl rounded-2xl p-7 shadow-card sm:p-8"
        style={{
          backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.22)',
          border:          '1px solid rgb(var(--first-quaternary-rgb) / 0.4)',
          backdropFilter:  'blur(12px)',
        }}
      >
        <div className="mb-6">
          <h2 className="text-xl font-bold" style={{ color: 'var(--first-octonary)' }}>
            Kreiraj zahtjev
          </h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--first-nonary)' }}>
            Popunite 6 koraka i vaš zahtjev će biti evidentiran.
          </p>
        </div>
        <ServiceRequestWizard
          onSubmitted={onZahtjevPoslan}
          odustaniHref="/korisnik"
        />
      </div>
    </div>
  );
}

// ─── Lista zahtjeva ───────────────────────────────────────────────────────────

interface ListaDashboardProps {
  zahtjevi: ServisniZahtjev[];
  onUredi:  (z: ServisniZahtjev) => void;
  onOtkazi: (z: ServisniZahtjev) => void;
}

function ListaDashboard({ zahtjevi, onUredi, onOtkazi }: ListaDashboardProps) {
  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--first-octonary)' }}>
            Moji zahtjevi
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--first-nonary)' }}>
            Zahtjevi koji čekaju obradu mogu se izmijeniti ili otkazati.
          </p>
        </div>
        <Link href="/korisnik/zahtjevi/novi">
          <Button size="md" className="w-full sm:w-auto">
            <PlusCircle className="h-4 w-4" />
            Novi zahtjev
          </Button>
        </Link>
      </div>

      <div
        className="rounded-2xl shadow-card"
        style={{
          backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.22)',
          border:          '1px solid rgb(var(--first-quaternary-rgb) / 0.35)',
        }}
      >
        <div
          className="px-5 py-4"
          style={{ borderBottom: '1px solid rgb(var(--first-quaternary-rgb) / 0.3)' }}
        >
          <h2 className="font-semibold" style={{ color: 'var(--first-octonary)' }}>
            Aktivni zahtjevi ({zahtjevi.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5">
          {zahtjevi.map((z) => (
            <ZahtjevKartica
              key={z.id}
              zahtjev={z}
              onUredi={onUredi}
              onOtkazi={onOtkazi}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Stranica ─────────────────────────────────────────────────────────────────

export default function KorisnikZahtjeviPage() {
  const router = useRouter();

  const [zahtjevi, setZahtjevi] = useState<ServisniZahtjev[]>([]);
  const [ucitava,  setUcitava]  = useState(true);
  const [greska,   setGreska]   = useState<string | null>(null);

  // Stanje za modal otkazivanja
  const [otkaziTarget, setOtkaziTarget] = useState<ServisniZahtjev | null>(null);

  async function ucitajZahtjeve() {
    setUcitava(true);
    setGreska(null);
    try {
      const r = await fetch('/api/service-requests', { cache: 'no-store' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Greška pri učitavanju.');
      const aktivni = (d.zahtjevi ?? []).filter((z: ServisniZahtjev) => jeZahtjevAktivan(z.status));
      setZahtjevi(aktivni);
    } catch (err) {
      setGreska(err instanceof Error ? err.message : 'Greška pri učitavanju zahtjeva.');
    } finally {
      setUcitava(false);
    }
  }

  useEffect(() => { ucitajZahtjeve(); }, []);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        void ucitajZahtjeve();
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  function handleUredi(z: ServisniZahtjev) {
    router.push(`/korisnik/zahtjevi/${z.id}/uredi`);
  }

  function handleOtkazi(z: ServisniZahtjev) {
    setOtkaziTarget(z);
  }

  function handleOtkaziUspjeh() {
    const otkazaniId = otkaziTarget?.id;
    setOtkaziTarget(null);
    if (otkazaniId != null) {
      setZahtjevi((prev) => prev.filter((z) => z.id !== otkazaniId));
    }
  }

  // ─── Loading ─────────────────────────────────────────────────────────────

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

  if (greska) {
    return (
      <AppShell uloga="korisnik">
        <div className="flex flex-col gap-4">
          <AlertMessage variant="error" message={greska} />
          <Button variant="secondary" size="md" onClick={ucitajZahtjeve} className="w-fit">
            <RefreshCw className="h-4 w-4" />
            Pokušaj ponovo
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell uloga="korisnik">
      {zahtjevi.length === 0 ? (
        <PraznoDashboard onZahtjevPoslan={ucitajZahtjeve} />
      ) : (
        <ListaDashboard
          zahtjevi={zahtjevi}
          onUredi={handleUredi}
          onOtkazi={handleOtkazi}
        />
      )}

      {/* Modal za potvrdu otkazivanja */}
      {otkaziTarget && (
        <OtkaziModal
          zahtjevId={otkaziTarget.id}
          korisnickiBrojZahtjeva={
            otkaziTarget.korisnicki_broj_zahtjeva ?? undefined
          }
          kategorija={otkaziTarget.category}
          onZatvori={() => setOtkaziTarget(null)}
          onUspjeh={handleOtkaziUspjeh}
        />
      )}
    </AppShell>
  );
}
