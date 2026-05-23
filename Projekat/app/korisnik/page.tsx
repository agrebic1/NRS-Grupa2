export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import {
  KorisnikPregledDashboard,
  type KorisnikDashboardZahtjev,
} from '@/components/korisnik/KorisnikPregledDashboard';
import { createClient } from '@/lib/supabase/server';
import { formatirajDatumPrikaz } from '@/lib/format/datumi';
import { dodijeliKorisnickeBrojeveZahtjeva } from '@/lib/servisirane/korisnickiBrojZahtjeva';
import { korisnickiDashboardStatus } from '@/lib/servisirane/statusZahtjeva';
import { prviZakazaniTerminSlot } from '@/lib/servisirane/zahtjevPrikaz';
import type { PreferredSchedule } from '@/domain/types/servisirane';

/** Red sa liste zahtjeva (polja koja UI zaista koristi). */
type KorisnikZahtjev = {
  id: number;
  category: string;
  description: string | null;
  address: string | null;
  created_at: string;
  status: string;
  urgency_score: number;
  is_premium: boolean;
  final_priority: string | null;
  preferred_schedule: PreferredSchedule | null;
  dispecer_agreed_schedule: PreferredSchedule | null;
  broj_ponovnih_ciklusa: number | null;
};

function izvuciPunoImeIzProfila(profil: unknown): string {
  if (!profil || typeof profil !== 'object') return '';

  const zapis = profil as Record<string, unknown>;
  const ime = typeof zapis.ime === 'string' ? zapis.ime.trim() : '';
  const prezime = typeof zapis.prezime === 'string' ? zapis.prezime.trim() : '';

  return [ime, prezime].filter(Boolean).join(' ').trim();
}

function izvuciNaslov(opisKvara: string | null) {
  const tekst = (opisKvara ?? '').trim();
  if (!tekst) return 'Zahtjev bez naslova';
  return tekst.split('\n')[0].trim();
}

export default async function KorisnikPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: profilRaw, error: profilGreska } = await supabase
    .from('osoba')
    .select('ime, prezime')
    .eq('id_osobe', user.id)
    .maybeSingle();

  const { data: zahtjeviRaw, error: zahtjeviGreska } = await supabase
    .from('service_requests')
    .select(
      'id, category, description, address, created_at, status, urgency_score, is_premium, final_priority, preferred_schedule, dispecer_agreed_schedule',
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .returns<KorisnikZahtjev[]>();

  const zahtjeviPodaci = zahtjeviRaw ?? [];

  if (zahtjeviGreska) {
    console.error('Neuspjelo učitavanje korisničkih zahtjeva:', zahtjeviGreska.message);
  }
  if (profilGreska) {
    console.error('Neuspjelo učitavanje korisničkog profila:', profilGreska.message);
  }

  const imeKorisnika =
    izvuciPunoImeIzProfila(profilRaw) ||
    user.user_metadata?.ime ||
    user.email ||
    'Korisnik';

  const saBrojevima = dodijeliKorisnickeBrojeveZahtjeva(zahtjeviPodaci);
  const zahtjevi: KorisnikDashboardZahtjev[] = saBrojevima.map((zahtjev) => {
    const slot = prviZakazaniTerminSlot(
      zahtjev.dispecer_agreed_schedule,
      zahtjev.preferred_schedule,
    );
    const createdDay = zahtjev.created_at.split('T')[0] ?? '';
    const dolazakDatumIso = slot?.date ?? createdDay;
    const od = (slot?.from ?? '').trim();
    const doStr = (slot?.to ?? '').trim();
    const dolazakVrijemeOpis =
      od && doStr ? `${od}–${doStr}` : null;

    return {
      id: String(zahtjev.id),
      korisnickiBroj: zahtjev.korisnicki_broj_zahtjeva,
      naslov: (zahtjev.category ?? '').trim() || izvuciNaslov(zahtjev.description),
      status: korisnickiDashboardStatus(
        zahtjev.status,
        zahtjev.final_priority,
      ),
      datum: formatirajDatumPrikaz(zahtjev.created_at, '-'),
      lokacija: zahtjev.address ?? 'Lokacija nije unesena',
      dolazakDatumIso,
      dolazakVrijemeOpis,
      is_premium: Boolean(zahtjev.is_premium),
      urgency_score: Number(zahtjev.urgency_score ?? 0),
      broj_ponovnih_ciklusa: Number(zahtjev.broj_ponovnih_ciklusa ?? 0),
    };
  });

  return (
    <AppShell uloga="korisnik" imeKorisnika={imeKorisnika}>
      <KorisnikPregledDashboard imeKorisnika={imeKorisnika} zahtjevi={zahtjevi} />
    </AppShell>
  );
}
