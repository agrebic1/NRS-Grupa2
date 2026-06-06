'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ClipboardList, ChevronRight,
  RefreshCw, XCircle, Bell,
  AlertTriangle, CheckCircle2, UserCheck, Zap, Inbox, Clock, Ban, BarChart3,
} from 'lucide-react';
import { getSlaStatus } from '@/lib/servisirane/slaPravila';
import { getDugoChekanje } from '@/lib/servisirane/dugoChekanje';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { AlertMessage } from '@/components/ui/AlertMessage';
import { DispecerKontrolnaTablaSažetak } from '@/components/dispecer/DispecerKontrolnaTablaSažetak';
import {
  DispecerskaZahtjevKartica,
  type ZahtjevZaDispecerskuKarticu,
} from '@/components/dispecer/DispecerskaZahtjevKartica';
import { kreirajKlijenta } from '@/lib/supabase/klijent';
import { zahtjevCekaObraduUInboxuDispecera } from '@/lib/servisirane/statusZahtjeva';
import {
  zahtjevJeNoviUPregleduDispecera,
  zahtjevJeUObradiUPregleduDispecera,
} from '@/lib/servisirane/dispecerskeFaze';
import {
  DISPECER_INBOX_GRUPA_HITNO_NASLOV,
  DISPECER_INBOX_GRUPA_HITNO_TITLE,
  DISPECER_INBOX_GRUPA_SREDNJE_NASLOV,
  DISPECER_INBOX_GRUPA_SREDNJE_TITLE,
  DISPECER_INBOX_GRUPA_NISKO_NASLOV,
  DISPECER_INBOX_GRUPA_NISKO_TITLE,
} from '@/lib/servisirane/dispecerPojmovi';
import {
  DISPECER_PALETA_HITNOST,
  DISPECER_PALETA_PREMIUM,
  DISPECER_PALETA_STATUS,
} from '@/lib/servisirane/dispecerPaleta';
import { inboxGrupaIzKorisnickeProcjene, sastaviDispecerskiInboxRedoslijed } from '@/lib/servisirane/urgency';

const JE_PENDING = zahtjevCekaObraduUInboxuDispecera;

const NASLOV_INBOX_GRUPE: Record<'Hitno' | 'Srednja' | 'Niska', string> = {
  Hitno: DISPECER_INBOX_GRUPA_HITNO_NASLOV,
  Srednja: DISPECER_INBOX_GRUPA_SREDNJE_NASLOV,
  Niska: DISPECER_INBOX_GRUPA_NISKO_NASLOV,
};

const TITLE_INBOX_GRUPE: Record<'Hitno' | 'Srednja' | 'Niska', string> = {
  Hitno: DISPECER_INBOX_GRUPA_HITNO_TITLE,
  Srednja: DISPECER_INBOX_GRUPA_SREDNJE_TITLE,
  Niska: DISPECER_INBOX_GRUPA_NISKO_TITLE,
};

interface ToastPoruka {
  id:      number;
  naslov:  string;
  tekst:   string;
  boja:    string;
}

function DispecerPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const zIzUrl = searchParams.get('z');
  const [zahtjevi, setZahtjevi] = useState<ZahtjevZaDispecerskuKarticu[]>([]);
  const [ucitava,  setUcitava]  = useState(true);
  const [greska,   setGreska]   = useState<string | null>(null);
  const [toast,    setToast]    = useState<ToastPoruka | null>(null);
  const [odabraniZahtjevId, setOdabraniZahtjevId] = useState<number | null>(null);
  const [splitPanelAktivan, setSplitPanelAktivan] = useState(false);
  const [imeKorisnika, setImeKorisnika] = useState('Dispečer');
  const toastTimerRef           = useRef<ReturnType<typeof setTimeout>>();

  const noviInboxPodaci = useMemo(() => {
    const pending = zahtjevi.filter(
      (z) => JE_PENDING(z.status) && zahtjevJeNoviUPregleduDispecera(z),
    );
    return sastaviDispecerskiInboxRedoslijed(pending);
  }, [zahtjevi]);

  const uObradiInboxPodaci = useMemo(() => {
    const pending = zahtjevi.filter(
      (z) => JE_PENDING(z.status) && zahtjevJeUObradiUPregleduDispecera(z),
    );
    return sastaviDispecerskiInboxRedoslijed(pending);
  }, [zahtjevi]);

  const zahtjeviCekajuObradu = useMemo(
    () => [...noviInboxPodaci.uredjeni, ...uObradiInboxPodaci.uredjeni],
    [noviInboxPodaci.uredjeni, uObradiInboxPodaci.uredjeni],
  );

  const zahtjevPoId = new Map(zahtjeviCekajuObradu.map((z) => [z.id, z] as const));

  /**
   * Lijeva lista: ?z= ili stanje ako je u inboxu; inače prvo po hitnosti u **Novi**, pa u **U obradi**.
   */
  const prikazaniZahtjevId = useMemo(() => {
    if (zahtjeviCekajuObradu.length === 0) return null;
    const map = new Map(zahtjeviCekajuObradu.map((z) => [z.id, z] as const));
    const parsed = zIzUrl != null && zIzUrl !== '' ? parseInt(zIzUrl, 10) : NaN;
    if (!Number.isNaN(parsed) && map.has(parsed)) return parsed;
    if (odabraniZahtjevId != null && map.has(odabraniZahtjevId)) return odabraniZahtjevId;

    const prviPoHitnosti = (red: ZahtjevZaDispecerskuKarticu[]) => {
      for (const g of ['Hitno', 'Srednja', 'Niska'] as const) {
        const prvi = red.find((z) => inboxGrupaIzKorisnickeProcjene(z) === g);
        if (prvi) return prvi.id;
      }
      return red[0]?.id ?? null;
    };

    if (noviInboxPodaci.uredjeni.length > 0) {
      return prviPoHitnosti(noviInboxPodaci.uredjeni);
    }
    return prviPoHitnosti(uObradiInboxPodaci.uredjeni);
  }, [
    zahtjeviCekajuObradu,
    noviInboxPodaci.uredjeni,
    uObradiInboxPodaci.uredjeni,
    zIzUrl,
    odabraniZahtjevId,
  ]);

  const odabraniZahtjev =
    prikazaniZahtjevId != null ? (zahtjevPoId.get(prikazaniZahtjevId) ?? null) : null;

  function prikaziToast(tekst: string, boja: string = DISPECER_PALETA_STATUS.neutral.kpi, naslov = 'Obavijest') {
    clearTimeout(toastTimerRef.current);
    setToast({ id: Date.now(), naslov, tekst, boja });
    toastTimerRef.current = setTimeout(() => setToast(null), 6000);
  }

  useEffect(() => {
    const supabase = kreirajKlijenta();
    const kanal = supabase
      .channel('dispecer-zahtjevi-realtime')
      .on(
        'postgres_changes',
        {
          event:  'UPDATE',
          schema: 'public',
          table:  'service_requests',
          filter: 'status=eq.otkazano',
        },
        (payload) => {
          const z = payload.new as { id: number; category?: string; status: string };
          const naziv = z.category ?? 'Nepoznat zahtjev';
          prikaziToast(
            `Zahtjev "${naziv}" je upravo otkazan od strane korisnika.`,
            DISPECER_PALETA_STATUS.neutral.kpi,
            'Zahtjev je otkazan',
          );
          setZahtjevi((prev) => prev.filter((x) => x.id !== z.id));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(kanal); };
  }, []);

  useEffect(() => {
    const supabase = kreirajKlijenta();
    let premiumKanal: ReturnType<typeof supabase.channel> | null = null;
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted || !data.user) return;
      premiumKanal = supabase
        .channel(`dispecer-premium-alert-${data.user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'dispatcher_alerts',
            filter: `recipient_user_id=eq.${data.user.id}`,
          },
          (payload) => {
            const a = payload.new as { message?: string };
            prikaziToast(
              a.message ?? 'Novi premium zahtjev čeka prioritetnu obradu u sistemu.',
              DISPECER_PALETA_PREMIUM.toast,
              'Premium zahtjev',
            );
          }
        )
        .subscribe();
    });
    return () => {
      mounted = false;
      if (premiumKanal) supabase.removeChannel(premiumKanal);
    };
  }, []);

  const ucitajZahtjeve = useCallback(async (tiho = false) => {
    if (!tiho) {
      setUcitava(true);
      setGreska(null);
    }
    try {
      const r = await fetch('/api/dispecer/zahtjevi', { cache: 'no-store' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Greška pri učitavanju podataka.');
      setZahtjevi(d.zahtjevi ?? []);
    } catch (err) {
      if (!tiho) {
        setGreska(err instanceof Error ? err.message : 'Došlo je do greške.');
      }
    } finally {
      if (!tiho) {
        setUcitava(false);
      }
    }
  }, []);

  useEffect(() => {
    void ucitajZahtjeve(false);
  }, [ucitajZahtjeve]);

  useEffect(() => {
    const t = setInterval(() => {
      void ucitajZahtjeve(true);
    }, 25_000);
    return () => clearInterval(t);
  }, [ucitajZahtjeve]);

  useEffect(() => {
    if (prikazaniZahtjevId === odabraniZahtjevId) return;
    setOdabraniZahtjevId(prikazaniZahtjevId);
  }, [prikazaniZahtjevId, odabraniZahtjevId]);

  /** Samo ukloni ?z kad inbox postane prazan - bez stalnog replace() koji uzrokuje trešnju. */
  useEffect(() => {
    if (!splitPanelAktivan || ucitava) return;
    if (zahtjeviCekajuObradu.length === 0 && zIzUrl) {
      router.replace('/dispecer', { scroll: false });
    }
  }, [splitPanelAktivan, ucitava, zahtjeviCekajuObradu.length, zIzUrl, router]);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const primijeni = () => setSplitPanelAktivan(media.matches);
    primijeni();
    media.addEventListener('change', primijeni);
    return () => media.removeEventListener('change', primijeni);
  }, []);

  useEffect(() => {
    const supabase = kreirajKlijenta();
    let mounted = true;

    const ucitajImeKorisnika = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!mounted || !user) return;

      const { data: profil } = await supabase
        .from('osoba')
        .select('ime, prezime')
        .eq('id_osobe', user.id)
        .maybeSingle();

      const imeIzProfila = [profil?.ime, profil?.prezime].filter(Boolean).join(' ').trim();
      const imeIzMeta = [user.user_metadata?.ime, user.user_metadata?.prezime]
        .filter(Boolean)
        .join(' ')
        .trim();

      setImeKorisnika(imeIzProfila || imeIzMeta || user.email || 'Dispečer');
    };

    void ucitajImeKorisnika();

    return () => {
      mounted = false;
    };
  }, []);

  const uInboxu       = zahtjevi.filter((z) => JE_PENDING(z.status));
  const noviPregledBr = uInboxu.filter((z) => zahtjevJeNoviUPregleduDispecera(z)).length;
  const uObradiPregledBr = uInboxu.filter((z) => zahtjevJeUObradiUPregleduDispecera(z)).length;
  // Odbijeni zahtjevi imaju status='potvrdeno' + serviser_odbio_razlog — broji ih odvojeno od potvrđenih
  const odbijeniServiserBr = zahtjevi.filter((z) => z.status === 'potvrdeno' && !!z.serviser_odbio_razlog).length;
  const potvrdenoBr        = zahtjevi.filter((z) => z.status === 'potvrdeno' && !z.serviser_odbio_razlog).length;
  const dodijeljeniiBr     = zahtjevi.filter((z) => ['dodijeljeno', 'u_radu', 'u_izvrsenju'].includes(z.status)).length;
  const hitniB        = zahtjevi.filter((z) => (z.urgency_score ?? 0) >= 75 || z.is_premium).length;
  const zavrsenoDanaBr = zahtjevi.filter((z) => {
    if (z.status !== 'zavrseno') return false;
    const d = new Date(z.updated_at ?? z.created_at);
    const n = new Date();
    return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
  }).length;
  const slaPrekoracenoBr  = zahtjevi.filter((z) => getSlaStatus(z.created_at, z.final_priority, z.status) === 'prekoraceno').length;
  const dugoChekajuBr    = zahtjevi.filter((z) => getDugoChekanje(z.status, z.created_at) !== null).length;

  return (
    <>
    <AppShell uloga="dispecer" imeKorisnika={imeKorisnika}>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--first-octonary)' }}>
            Kontrolna ploča
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/dispecer/analitika">
            <Button type="button" variant="secondary" size="md">
              <BarChart3 className="h-4 w-4" />
              Analitika
            </Button>
          </Link>
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => void ucitajZahtjeve(false)}
            isLoading={ucitava}
            loadingText="Osvježavanje..."
          >
            <RefreshCw className="h-4 w-4" />
            Osvježi
          </Button>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-9">
        {[
          { oznaka: 'Novi zahtjevi',   v: noviPregledBr,      boja: DISPECER_PALETA_STATUS.inbox.kpi,                                        Ikona: Inbox,         href: '/dispecer/zahtjevi?filter=novi'      },
          { oznaka: 'U obradi',        v: uObradiPregledBr,   boja: DISPECER_PALETA_STATUS.uObradi.kpi,                                      Ikona: ClipboardList, href: '/dispecer/zahtjevi?filter=u_obradi' },
          { oznaka: 'Odbijeni',        v: odbijeniServiserBr, boja: odbijeniServiserBr > 0 ? '#DC2626' : DISPECER_PALETA_STATUS.neutral.kpi,  Ikona: Ban,           href: '/dispecer/zahtjevi?filter=odbijeni' },
          { oznaka: 'Potvrđeni',       v: potvrdenoBr,        boja: DISPECER_PALETA_STATUS.terminPotvrden.kpi,                               Ikona: CheckCircle2,  href: '/dispecer/zahtjevi?filter=potvrdeni'},
          { oznaka: 'Na terenu',       v: dodijeljeniiBr,     boja: DISPECER_PALETA_STATUS.uToku.kpi,                                        Ikona: UserCheck,     href: '/dispecer/zahtjevi?filter=na_terenu'},
          { oznaka: 'Hitni',           v: hitniB,             boja: '#DC2626',                                                               Ikona: Zap,           href: '/dispecer/zahtjevi?filter=svi'      },
          { oznaka: 'Završeni danas',  v: zavrsenoDanaBr,     boja: DISPECER_PALETA_STATUS.zavrseno.kpi,                                     Ikona: CheckCircle2,  href: '/dispecer/zahtjevi?filter=zavrseni' },
          { oznaka: 'Prekoračen SLA',  v: slaPrekoracenoBr,   boja: slaPrekoracenoBr > 0 ? '#DC2626' : DISPECER_PALETA_STATUS.zavrseno.kpi,  Ikona: Clock,         href: '/dispecer/intervencije?filter=sla'  },
          { oznaka: 'Dugo čekaju',     v: dugoChekajuBr,      boja: dugoChekajuBr > 0 ? '#B45309' : DISPECER_PALETA_STATUS.neutral.kpi,     Ikona: AlertTriangle, href: '/dispecer/zahtjevi?filter=svi'      },
        ].map(({ oznaka, v, boja, Ikona, href }) => (
          <Link
            key={oznaka}
            href={href}
            className="flex items-center gap-3 rounded-2xl p-4 shadow-card transition-all hover:shadow-md hover:opacity-90"
            style={{
              backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.22)',
              border: '1px solid rgb(var(--first-quaternary-rgb) / 0.35)',
            }}
          >
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `color-mix(in srgb, ${boja} 12%, transparent)` }}
            >
              <Ikona className="h-4 w-4" style={{ color: boja }} />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-extrabold leading-none tabular-nums" style={{ color: boja }}>{v}</p>
              <p className="mt-0.5 text-[11px] font-medium leading-tight" style={{ color: 'var(--first-nonary)' }}>{oznaka}</p>
            </div>
          </Link>
        ))}
      </div>

      {greska && <div className="mb-6"><AlertMessage variant="error" message={greska} /></div>}

      <div className="min-w-0 overflow-x-clip rounded-2xl shadow-card"
        style={{ backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.22)', border: '1px solid rgb(var(--first-quaternary-rgb) / 0.35)' }}>
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgb(var(--first-quaternary-rgb) / 0.3)' }}>
          <h2 className="font-semibold" style={{ color: 'var(--first-octonary)' }}>
            Inbox ({zahtjeviCekajuObradu.length})
          </h2>
          <Link href="/dispecer/zahtjevi"
            className="flex items-center gap-1 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: 'var(--first-secondary)' }}>
            Pregled zahtjeva <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {ucitava && (
          <div className="px-5 py-8 text-center">
            <p className="text-sm" style={{ color: 'var(--first-nonary)' }}>Učitavanje zahtjeva...</p>
          </div>
        )}
        {!ucitava && zahtjevi.length === 0 && (
          <div className="px-5 py-10 text-center">
            <p className="text-sm font-medium" style={{ color: 'var(--first-octonary)' }}>
              Nema aktivnih zahtjeva
            </p>
            <p className="mt-1 text-sm" style={{ color: 'var(--first-nonary)' }}>
              Kada korisnik pošalje zahtjev, pojaviće se ovdje.
            </p>
            <Link
              href="/dispecer/zahtjevi"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: 'var(--first-secondary)' }}
            >
              Pregled svih zahtjeva <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
        {!ucitava && zahtjevi.length > 0 && zahtjeviCekajuObradu.length === 0 && (
          <div className="px-5 py-10 text-center">
            <p className="text-sm font-medium" style={{ color: 'var(--first-octonary)' }}>
              Inbox je prazan
            </p>
            <p className="mt-1 text-sm" style={{ color: 'var(--first-nonary)' }}>
              Nema zahtjeva koji čekaju prioritet ili wizard.
            </p>
            <Link
              href="/dispecer/zahtjevi"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: 'var(--first-secondary)' }}
            >
              Pogledaj aktivne zahtjeve <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
        {!ucitava && zahtjeviCekajuObradu.length > 0 && (
          <div className="min-w-0 p-4 sm:p-5">
            {splitPanelAktivan ? (
              <div
                className="grid min-h-0 min-w-0 grid-cols-[minmax(20rem,24rem)_minmax(0,1fr)] items-stretch gap-4
                  h-[min(56rem,calc(100vh-13rem))] max-h-[calc(100vh-13rem)]"
              >
                <section className="min-h-0 min-w-0 overflow-y-auto overflow-x-hidden pr-1">
                  <div className="flex min-w-0 flex-col gap-6 pb-1">
                    <div className="min-w-0">
                      <p
                        className="mb-3 text-sm font-bold tracking-tight"
                        style={{ color: DISPECER_PALETA_STATUS.inbox.kpi }}
                      >
                        Novi ({noviInboxPodaci.uredjeni.length})
                      </p>
                      {noviInboxPodaci.uredjeni.length === 0 ? (
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--first-nonary)' }}>
                          Nema novih - svi imaju potvrđen operativni prioritet.
                        </p>
                      ) : (
                        <div className="flex min-w-0 flex-col gap-4">
                          {(['Hitno', 'Srednja', 'Niska'] as const).map((grupa) => {
                            const stavke = noviInboxPodaci.grupisani[grupa];
                            if (stavke.length === 0) return null;
                            return (
                              <div key={`novi-${grupa}`} className="min-w-0">
                                <p
                                  className="mb-2 text-xs font-semibold uppercase tracking-wide"
                                  title={TITLE_INBOX_GRUPE[grupa]}
                                  style={{ color: DISPECER_PALETA_HITNOST[grupa].grupaNaslov }}
                                >
                                  {NASLOV_INBOX_GRUPE[grupa]} ({stavke.length})
                                </p>
                                <ul className="flex min-w-0 flex-col gap-2.5">
                                  {stavke.map((z) => (
                                    <li key={z.id} className="min-w-0">
                                      <DispecerskaZahtjevKartica
                                        zahtjev={z}
                                        expanded={false}
                                        selected={prikazaniZahtjevId === z.id}
                                        onExpandToggle={() => {
                                          setOdabraniZahtjevId(z.id);
                                          router.replace(`/dispecer?z=${z.id}`, { scroll: false });
                                        }}
                                      />
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div
                      className="min-w-0 border-t pt-5"
                      style={{ borderColor: 'rgb(var(--first-quaternary-rgb) / 0.28)' }}
                    >
                      <p
                        className="mb-3 text-sm font-bold tracking-tight"
                        style={{ color: DISPECER_PALETA_STATUS.uObradi.kpi }}
                      >
                        U obradi ({uObradiInboxPodaci.uredjeni.length})
                      </p>
                      {uObradiInboxPodaci.uredjeni.length === 0 ? (
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--first-nonary)' }}>
                          Nema zahtjeva u wizardu - svi još čekaju prioritet (Novi).
                        </p>
                      ) : (
                        <div className="flex min-w-0 flex-col gap-4">
                          {(['Hitno', 'Srednja', 'Niska'] as const).map((grupa) => {
                            const stavke = uObradiInboxPodaci.grupisani[grupa];
                            if (stavke.length === 0) return null;
                            return (
                              <div key={`uobradi-${grupa}`} className="min-w-0">
                                <p
                                  className="mb-2 text-xs font-semibold uppercase tracking-wide"
                                  title={TITLE_INBOX_GRUPE[grupa]}
                                  style={{ color: DISPECER_PALETA_HITNOST[grupa].grupaNaslov }}
                                >
                                  {NASLOV_INBOX_GRUPE[grupa]} ({stavke.length})
                                </p>
                                <ul className="flex min-w-0 flex-col gap-2.5">
                                  {stavke.map((z) => (
                                    <li key={z.id} className="min-w-0">
                                      <DispecerskaZahtjevKartica
                                        zahtjev={z}
                                        expanded={false}
                                        selected={prikazaniZahtjevId === z.id}
                                        onExpandToggle={() => {
                                          setOdabraniZahtjevId(z.id);
                                          router.replace(`/dispecer?z=${z.id}`, { scroll: false });
                                        }}
                                      />
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <section className="min-h-0 min-w-0 overflow-y-auto">
                  {odabraniZahtjev ? (
                    <DispecerKontrolnaTablaSažetak zahtjev={odabraniZahtjev} />
                  ) : (
                    <div
                      className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl px-6 py-12 text-center"
                      style={{
                        backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.22)',
                        border: '1px solid rgb(var(--first-quaternary-rgb) / 0.35)',
                      }}
                    >
                      <ClipboardList
                        className="h-12 w-12"
                        style={{ color: 'rgb(var(--first-nonary-rgb) / 0.45)' }}
                        aria-hidden
                      />
                      <p className="mt-4 max-w-sm text-sm font-medium leading-snug" style={{ color: 'var(--first-octonary)' }}>
                        Odaberite zahtjev za pregled detalja
                      </p>
                    </div>
                  )}
                </section>
              </div>
            ) : (
              <div className="flex min-w-0 flex-col gap-6">
                <div className="min-w-0">
                  <p
                    className="mb-2 text-sm font-bold"
                    style={{ color: DISPECER_PALETA_STATUS.inbox.kpi }}
                  >
                    Novi ({noviInboxPodaci.uredjeni.length})
                  </p>
                  {noviInboxPodaci.uredjeni.length === 0 ? (
                    <p className="text-xs" style={{ color: 'var(--first-nonary)' }}>
                      Nema novih zahtjeva bez prioriteta.
                    </p>
                  ) : (
                    <ul className="flex min-w-0 flex-col gap-3">
                      {noviInboxPodaci.uredjeni.map((z) => (
                        <li key={z.id} className="min-w-0">
                          <DispecerskaZahtjevKartica
                            zahtjev={z}
                            expanded={false}
                            onExpandToggle={() => router.push(`/dispecer/zahtjevi/${z.id}`)}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div
                  className="min-w-0 border-t pt-5"
                  style={{ borderColor: 'rgb(var(--first-quaternary-rgb) / 0.28)' }}
                >
                  <p
                    className="mb-2 text-sm font-bold"
                    style={{ color: DISPECER_PALETA_STATUS.uObradi.kpi }}
                  >
                    U obradi ({uObradiInboxPodaci.uredjeni.length})
                  </p>
                  {uObradiInboxPodaci.uredjeni.length === 0 ? (
                    <p className="text-xs" style={{ color: 'var(--first-nonary)' }}>
                      Nema zahtjeva u wizardu.
                    </p>
                  ) : (
                    <ul className="flex min-w-0 flex-col gap-3">
                      {uObradiInboxPodaci.uredjeni.map((z) => (
                        <li key={z.id} className="min-w-0">
                          <DispecerskaZahtjevKartica
                            zahtjev={z}
                            expanded={false}
                            onExpandToggle={() => router.push(`/dispecer/zahtjevi/${z.id}`)}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>

      {toast && (
        <div
          className="fixed bottom-5 right-5 z-50 flex max-w-sm items-start gap-3
            rounded-2xl p-4 shadow-2xl transition-all duration-300"
          style={{
            backgroundColor: '#ffffff',
            border:          `1px solid ${toast.boja}40`,
            boxShadow:       `0 8px 32px ${toast.boja}20`,
          }}
        >
          <div
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${toast.boja}15` }}
          >
            <Bell className="h-4 w-4" style={{ color: toast.boja }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: toast.boja }}>
              {toast.naslov}
            </p>
            <p className="mt-0.5 text-sm leading-snug" style={{ color: 'var(--first-octonary)' }}>
              {toast.tekst}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Zatvori obavijest"
            className="flex-shrink-0 rounded-lg transition-opacity hover:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-celestial-teal/40"
            style={{ color: 'var(--first-nonary)' }}
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  );
}

export default function DispecerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center p-8">
          <p className="text-sm" style={{ color: 'var(--first-nonary)' }}>
            Učitavanje...
          </p>
        </div>
      }
    >
      <DispecerPageContent />
    </Suspense>
  );
}
