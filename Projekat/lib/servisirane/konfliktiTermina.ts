// ─── Provjera konflikta termina servisera ─────────────────────────────────────
//
// Logika: novi_start < postojeći_kraj AND novi_kraj > postojeći_start
// Provjerava i glavnog servisera i pomoćne servisere iz tim_intervencije.

type AnyDB = any;

interface KonfliktTermina {
  serviser_id: string;
  serviser_ime: string;
  zahtjev_id: number;
  pocetak: string;
  kraj: string;
}

const AKTIVNI_STATUSI_ZA_KONFLIKT = ['dodijeljeno', 'u_radu', 'u_izvrsenju'];

export async function provjeriKonfliktServiseraNaTerminu(
  db: AnyDB,
  serviser_id: string,
  novi_pocetak: string,
  novi_kraj: string,
  izuzmi_zahtjev_id: number,
): Promise<KonfliktTermina | null> {
  // Provjeri kao glavni serviser
  const { data: konflikti } = await db
    .from('service_requests')
    .select('id, termin_planirani_pocetak, termin_planirani_kraj')
    .eq('serviser_dodijeljen_id', serviser_id)
    .neq('id', izuzmi_zahtjev_id)
    .in('status', AKTIVNI_STATUSI_ZA_KONFLIKT)
    .not('termin_planirani_pocetak', 'is', null)
    .not('termin_planirani_kraj', 'is', null)
    .lt('termin_planirani_pocetak', novi_kraj)
    .gt('termin_planirani_kraj', novi_pocetak);

  if (konflikti && konflikti.length > 0) {
    const k = konflikti[0];
    return {
      serviser_id,
      serviser_ime: 'Odabrani serviser',
      zahtjev_id: k.id,
      pocetak: k.termin_planirani_pocetak,
      kraj: k.termin_planirani_kraj,
    };
  }

  // Provjeri kao pomoćni serviser
  const { data: timKonflikti } = await db
    .from('tim_intervencije')
    .select(
      'zahtjev_id, service_requests!inner(termin_planirani_pocetak, termin_planirani_kraj, status)',
    )
    .eq('serviser_id', serviser_id)
    .neq('zahtjev_id', izuzmi_zahtjev_id);

  const timFilter = (timKonflikti ?? []).filter((row: AnyDB) => {
    const sr = row.service_requests;
    if (!sr || !AKTIVNI_STATUSI_ZA_KONFLIKT.includes(sr.status)) return false;
    if (!sr.termin_planirani_pocetak || !sr.termin_planirani_kraj) return false;
    return (
      sr.termin_planirani_pocetak < novi_kraj &&
      sr.termin_planirani_kraj > novi_pocetak
    );
  });

  if (timFilter.length > 0) {
    const k = timFilter[0];
    return {
      serviser_id,
      serviser_ime: 'Odabrani serviser',
      zahtjev_id: k.zahtjev_id,
      pocetak: k.service_requests.termin_planirani_pocetak,
      kraj: k.service_requests.termin_planirani_kraj,
    };
  }

  return null;
}
