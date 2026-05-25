// ─── Helper za kreiranje in-app notifikacija ──────────────────────────────────
//
// Sve insert operacije u tabelu `notifikacije` idu kroz ove funkcije.
// Koristiti admin/service-role klijent da se zaobiđu RLS politike pri insertu.

type AnyDB = any;

export interface NotifikacijaParams {
  korisnik_id:          string;
  tip:                  string;
  naslov:               string;
  poruka:               string;
  zahtjev_id?:          number | null;
  uloga_korisnika?:     string | null;
  povezani_entitet_tip?: string | null;
  povezani_entitet_id?:  string | null;
}

function toRow(p: NotifikacijaParams) {
  return {
    korisnik_id:          p.korisnik_id,
    tip:                  p.tip,
    naslov:               p.naslov,
    poruka:               p.poruka,
    zahtjev_id:           p.zahtjev_id           ?? null,
    uloga_korisnika:      p.uloga_korisnika       ?? null,
    povezani_entitet_tip: p.povezani_entitet_tip  ?? null,
    povezani_entitet_id:  p.povezani_entitet_id   ?? null,
  };
}

export async function kreirajNotifikaciju(
  db:     AnyDB,
  params: NotifikacijaParams
): Promise<void> {
  await db.from('notifikacije').insert(toRow(params));
}

export async function kreirajViseNotifikacija(
  db:     AnyDB,
  params: NotifikacijaParams[]
): Promise<void> {
  if (!params.length) return;
  await db.from('notifikacije').insert(params.map(toRow));
}

// ─── Serviser notifikacije ────────────────────────────────────────────────────

export function notifDodjelaIntervencije(
  db:          AnyDB,
  serviser_id: string,
  zahtjev_id:  number
) {
  return kreirajNotifikaciju(db, {
    korisnik_id:     serviser_id,
    uloga_korisnika: 'Serviser',
    tip:             'dodjela_intervencije',
    naslov:          'Nova intervencija dodijeljena',
    poruka:          `Intervencija #${zahtjev_id} je dodijeljena vama. Provjerite detalje i prihvatite zadatak.`,
    zahtjev_id,
  });
}

export function notifZatvaranjeIntervencije(
  db:          AnyDB,
  serviser_id: string,
  zahtjev_id:  number
) {
  return kreirajNotifikaciju(db, {
    korisnik_id:     serviser_id,
    uloga_korisnika: 'Serviser',
    tip:             'zatvaranje_intervencije',
    naslov:          'Intervencija formalno zatvorena',
    poruka:          `Dispečer je formalno zatvorio intervenciju #${zahtjev_id}. Slučaj je arhiviran.`,
    zahtjev_id,
  });
}

export function notifTimDodjela(
  db:          AnyDB,
  serviser_id: string,
  zahtjev_id:  number,
  tip_uloge:   string
) {
  return kreirajNotifikaciju(db, {
    korisnik_id:     serviser_id,
    uloga_korisnika: 'Serviser',
    tip:             'tim_dodjela',
    naslov:          'Dodani ste u tim intervencije',
    poruka:          `Dodani ste kao ${tip_uloge} serviser na intervenciji #${zahtjev_id}.`,
    zahtjev_id,
  });
}

export function notifUklanjanjeServisera(
  db:          AnyDB,
  serviser_id: string,
  zahtjev_id:  number
) {
  return kreirajNotifikaciju(db, {
    korisnik_id:     serviser_id,
    uloga_korisnika: 'Serviser',
    tip:             'uklanjanje_servisera',
    naslov:          'Uklonjeni ste sa intervencije',
    poruka:          `Dispečer vas je uklonio sa intervencije #${zahtjev_id}.`,
    zahtjev_id,
  });
}

export function notifPromjenaTermina(
  db:          AnyDB,
  serviser_id: string,
  zahtjev_id:  number,
  novi_termin: string
) {
  return kreirajNotifikaciju(db, {
    korisnik_id:     serviser_id,
    uloga_korisnika: 'Serviser',
    tip:             'promjena_termina',
    naslov:          'Promijenjen termin intervencije',
    poruka:          `Termin intervencije #${zahtjev_id} je promijenjen na ${novi_termin}.`,
    zahtjev_id,
  });
}

export function notifNovaNapomenaServiser(
  db:          AnyDB,
  serviser_id: string,
  zahtjev_id:  number
) {
  return kreirajNotifikaciju(db, {
    korisnik_id:     serviser_id,
    uloga_korisnika: 'Serviser',
    tip:             'nova_napomena',
    naslov:          'Nova napomena dispečera',
    poruka:          `Dispečer je dodao novu napomenu na intervenciju #${zahtjev_id}.`,
    zahtjev_id,
  });
}

// ─── Dispečer notifikacije ────────────────────────────────────────────────────

export function notifPrihvatanjeZadatka(
  db:            AnyDB,
  dispecer_id:   string,
  zahtjev_id:    number,
  ime_servisera: string
) {
  return kreirajNotifikaciju(db, {
    korisnik_id:     dispecer_id,
    uloga_korisnika: 'Dispečer',
    tip:             'prihvatanje_zadatka',
    naslov:          'Serviser prihvatio zadatak',
    poruka:          `${ime_servisera} je prihvatio intervenciju #${zahtjev_id} i na je putu.`,
    zahtjev_id,
  });
}

export function notifOdbijanjeZadatka(
  db:            AnyDB,
  dispecer_id:   string,
  zahtjev_id:    number,
  ime_servisera: string,
  razlog:        string
) {
  return kreirajNotifikaciju(db, {
    korisnik_id:     dispecer_id,
    uloga_korisnika: 'Dispečer',
    tip:             'odbijanje_zadatka',
    naslov:          'Serviser odbio zadatak',
    poruka:          `${ime_servisera} je odbio intervenciju #${zahtjev_id}. Razlog: ${razlog}`,
    zahtjev_id,
  });
}

export function notifEvidencijaRada(
  db:            AnyDB,
  dispecer_id:   string,
  zahtjev_id:    number,
  ime_servisera: string
) {
  return kreirajNotifikaciju(db, {
    korisnik_id:     dispecer_id,
    uloga_korisnika: 'Dispečer',
    tip:             'evidencija_rada',
    naslov:          'Evidentiran rad na intervenciji',
    poruka:          `${ime_servisera} je evidentirao rad na intervenciji #${zahtjev_id}.`,
    zahtjev_id,
  });
}

export function notifNoviZahtjev(
  db:           AnyDB,
  dispecer_id:  string,
  zahtjev_id:   number,
  kategorija:   string
) {
  return kreirajNotifikaciju(db, {
    korisnik_id:     dispecer_id,
    uloga_korisnika: 'Dispečer',
    tip:             'novi_zahtjev',
    naslov:          'Novi servisni zahtjev',
    poruka:          `Pristigao je novi zahtjev za "${kategorija}" (#${zahtjev_id}). Pregledajte i obradite.`,
    zahtjev_id,
  });
}

export function notifNovaNapomenaDispecer(
  db:            AnyDB,
  dispecer_id:   string,
  zahtjev_id:    number,
  ime_servisera: string
) {
  return kreirajNotifikaciju(db, {
    korisnik_id:     dispecer_id,
    uloga_korisnika: 'Dispečer',
    tip:             'nova_napomena',
    naslov:          'Nova napomena servisera',
    poruka:          `${ime_servisera} je dodao napomenu na intervenciju #${zahtjev_id}.`,
    zahtjev_id,
  });
}

export function notifServiserNaTerenu(
  db:            AnyDB,
  dispecer_id:   string,
  zahtjev_id:    number,
  ime_servisera: string
) {
  return kreirajNotifikaciju(db, {
    korisnik_id:     dispecer_id,
    uloga_korisnika: 'Dispečer',
    tip:             'promjena_statusa',
    naslov:          'Serviser stigao na lokaciju',
    poruka:          `${ime_servisera} je stigao na lokaciju - intervencija #${zahtjev_id} u toku.`,
    zahtjev_id,
  });
}

// ─── Korisnik usluge notifikacije ─────────────────────────────────────────────

export function notifKorisnikusZahtjevPrimljen(
  db:          AnyDB,
  korisnik_id: string,
  zahtjev_id:  number
) {
  return kreirajNotifikaciju(db, {
    korisnik_id,
    uloga_korisnika: 'Korisnik usluge',
    tip:             'promjena_statusa',
    naslov:          'Zahtjev evidentiran',
    poruka:          `Vaš servisni zahtjev #${zahtjev_id} je evidentiran i čeka obradu dispečera.`,
    zahtjev_id,
  });
}

export function notifKorisnikusZahtjevUObradi(
  db:          AnyDB,
  korisnik_id: string,
  zahtjev_id:  number
) {
  return kreirajNotifikaciju(db, {
    korisnik_id,
    uloga_korisnika: 'Korisnik usluge',
    tip:             'promjena_statusa',
    naslov:          'Zahtjev u obradi',
    poruka:          `Vaš zahtjev #${zahtjev_id} je pregledan i potvrđen od strane dispečera. Uskoro će biti dodijeljen serviser.`,
    zahtjev_id,
  });
}

export function notifKorisnikusServiserDodijeljen(
  db:             AnyDB,
  korisnik_id:    string,
  zahtjev_id:     number,
  ime_servisera:  string,
  datum_termina?: string
) {
  const terminTekst = datum_termina ? ` Termin: ${datum_termina}.` : '';
  return kreirajNotifikaciju(db, {
    korisnik_id,
    uloga_korisnika: 'Korisnik usluge',
    tip:             'promjena_statusa',
    naslov:          'Serviser dodijeljen',
    poruka:          `${ime_servisera} je dodijeljen vašem zahtjevu #${zahtjev_id}.${terminTekst}`,
    zahtjev_id,
  });
}

export function notifKorisnikusServiserNaPutu(
  db:            AnyDB,
  korisnik_id:   string,
  zahtjev_id:    number,
  ime_servisera: string
) {
  return kreirajNotifikaciju(db, {
    korisnik_id,
    uloga_korisnika: 'Korisnik usluge',
    tip:             'promjena_statusa',
    naslov:          'Serviser na putu',
    poruka:          `${ime_servisera} je prihvatio vaš zahtjev #${zahtjev_id} i kreće prema vama.`,
    zahtjev_id,
  });
}

export function notifKorisnikusServiserNaTerenu(
  db:            AnyDB,
  korisnik_id:   string,
  zahtjev_id:    number,
  ime_servisera: string
) {
  return kreirajNotifikaciju(db, {
    korisnik_id,
    uloga_korisnika: 'Korisnik usluge',
    tip:             'promjena_statusa',
    naslov:          'Serviser na lokaciji',
    poruka:          `${ime_servisera} je stigao na vašu lokaciju - intervencija #${zahtjev_id} je u toku.`,
    zahtjev_id,
  });
}

export function notifKorisnikusIntervencijaZavrsena(
  db:          AnyDB,
  korisnik_id: string,
  zahtjev_id:  number
) {
  return kreirajNotifikaciju(db, {
    korisnik_id,
    uloga_korisnika: 'Korisnik usluge',
    tip:             'zavrsetak_intervencije',
    naslov:          'Intervencija završena',
    poruka:          `Rad na vašem zahtjevu #${zahtjev_id} je završen. Dispečer će uskoro formalno zatvoriti slučaj.`,
    zahtjev_id,
  });
}

export function notifKorisnikusIntervencijaZatvorena(
  db:          AnyDB,
  korisnik_id: string,
  zahtjev_id:  number
) {
  return kreirajNotifikaciju(db, {
    korisnik_id,
    uloga_korisnika: 'Korisnik usluge',
    tip:             'zatvaranje_intervencije',
    naslov:          'Intervencija zatvorena',
    poruka:          `Vaš servisni zahtjev #${zahtjev_id} je formalno zatvoren i arhiviran. Hvala što koristite naše usluge.`,
    zahtjev_id,
  });
}

// ─── Admin notifikacije ───────────────────────────────────────────────────────

export function notifAdminPromjenaUloge(
  db:         AnyDB,
  admin_id:   string,
  ciljni_id:  string,
  nova_uloga: string
) {
  return kreirajNotifikaciju(db, {
    korisnik_id:          admin_id,
    uloga_korisnika:      'Administrator',
    tip:                  'promjena_uloge',
    naslov:               'Uloga korisnika promijenjena',
    poruka:               `Korisnikova uloga je promijenjena na "${nova_uloga}".`,
    povezani_entitet_tip: 'user',
    povezani_entitet_id:  ciljni_id,
  });
}

export function notifAdminPromjenaStatusaNaloga(
  db:         AnyDB,
  admin_id:   string,
  ciljni_id:  string,
  novi_status: string
) {
  return kreirajNotifikaciju(db, {
    korisnik_id:          admin_id,
    uloga_korisnika:      'Administrator',
    tip:                  'promjena_statusa_naloga',
    naslov:               'Status naloga promijenjen',
    poruka:               `Korisnički nalog je ${novi_status}.`,
    povezani_entitet_tip: 'user',
    povezani_entitet_id:  ciljni_id,
  });
}

// ─── Sprint 9: Nove notifikacije ─────────────────────────────────────────────

export function notifPromjenaIzvrsioca(
  db:              AnyDB,
  noviServiser_id: string,
  zahtjev_id:      number,
  imeStarogServs:  string
) {
  return kreirajNotifikaciju(db, {
    korisnik_id:     noviServiser_id,
    uloga_korisnika: 'Serviser',
    tip:             'dodjela_intervencije',
    naslov:          'Dodijeljeni ste na intervenciju',
    poruka:          `Preuzimate intervenciju #${zahtjev_id} od servisera ${imeStarogServs}.`,
    zahtjev_id,
  });
}

export function notifReDodjela(
  db:              AnyDB,
  serviser_id:     string,
  zahtjev_id:      number,
  razlogOdbijanja: string
) {
  return kreirajNotifikaciju(db, {
    korisnik_id:     serviser_id,
    uloga_korisnika: 'Serviser',
    tip:             'dodjela_intervencije',
    naslov:          'Ponovo dodijeljena intervencija',
    poruka:          `Intervencija #${zahtjev_id} vam je ponovo dodijeljena. Napomena: prethodni serviser je odbio — razlog: ${razlogOdbijanja}`,
    zahtjev_id,
  });
}

export function notifVratanjaNaPonovnuDodjelu(
  db:            AnyDB,
  dispecer_id:   string,
  zahtjev_id:    number,
  imeServisera:  string,
  razlog:        string
) {
  return kreirajNotifikaciju(db, {
    korisnik_id:     dispecer_id,
    uloga_korisnika: 'Dispečer',
    tip:             'odbijanje_zadatka',
    naslov:          'Serviser vratio zadatak na ponovnu dodjelu',
    poruka:          `${imeServisera} je vratio intervenciju #${zahtjev_id} na ponovnu dodjelu. Razlog: ${razlog}`,
    zahtjev_id,
  });
}

export function notifNijeRijesen(
  db:            AnyDB,
  dispecer_id:   string,
  zahtjev_id:    number,
  imeServisera:  string,
  razlog:        string
) {
  return kreirajNotifikaciju(db, {
    korisnik_id:     dispecer_id,
    uloga_korisnika: 'Dispečer',
    tip:             'odbijanje_zadatka',
    naslov:          'Intervencija označena kao nije riješena',
    poruka:          `${imeServisera} je označio intervenciju #${zahtjev_id} kao nije riješenu. Razlog: ${razlog}`,
    zahtjev_id,
  });
}

// ─── Bulk helper: notify all dispatchers ─────────────────────────────────────

export async function notifSviDispeceruNoviZahtjev(
  db:         AnyDB,
  zahtjev_id: number,
  kategorija: string
): Promise<void> {
  const { data: dispeceri } = await db
    .from('uposlenici')
    .select('id_uposlenika, uloga:uloga(naziv)')
    .filter('uloga.naziv', 'eq', 'Dispečer');
  const ids: string[] = (dispeceri ?? [])
    .filter((u: any) => {
      const naziv = Array.isArray(u.uloga) ? u.uloga[0]?.naziv : u.uloga?.naziv;
      return naziv === 'Dispečer';
    })
    .map((u: any) => u.id_uposlenika as string);

  if (!ids.length) return;
  await kreirajViseNotifikacija(db, ids.map((id) => ({
    korisnik_id:     id,
    uloga_korisnika: 'Dispečer',
    tip:             'novi_zahtjev',
    naslov:          'Novi servisni zahtjev',
    poruka:          `Pristigao je novi zahtjev za "${kategorija}" (#${zahtjev_id}). Pregledajte i obradite.`,
    zahtjev_id,
  })));
}
