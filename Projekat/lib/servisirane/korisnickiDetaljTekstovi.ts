import type { ServisniZahtjev } from '@/domain/types/servisirane';
import {
  nazivDispecerskeFazePregleda,
  uzmiDispecerskuFazuZaPregled,
  zahtjevJeNoviUPregleduDispecera,
  type DispecerskaFazaPregleda,
} from '@/lib/servisirane/dispecerskeFaze';
import { zahtjevCekaObraduUInboxuDispecera } from '@/lib/servisirane/statusZahtjeva';
import { oznakaInboxHitnostiCekaObradu } from '@/lib/servisirane/urgency';

/** Čitljiviji naziv završne pod-faze za korisnika (izbjegava dvosmislenost sa statusom „potvrđeno"). */
export function nazivFazeZaKorisnika(faza: DispecerskaFazaPregleda): string {
  if (faza === 'konačna_potvrda') return 'Završna potvrda';
  return nazivDispecerskeFazePregleda(faza);
}

/** Čitljiv glavni status + pod-faza, usklađeno s `KorisnikPregledTokaBadzevi`. */
export function korisnikStatusDetaljTekst(zahtjev: ServisniZahtjev): string {
  const s = zahtjev.status;
  if (s === 'zavrseno') return 'Završeno';
  if (s === 'otkazano') return 'Otkazano';
  if (s === 'odbijeno') return 'Odbijeno';

  if (!zahtjevCekaObraduUInboxuDispecera(s)) {
    const map: Record<string, string> = {
      potvrdeno: 'Potvrđeno',
      dodijeljeno: 'Dodijeljeno serviseru',
      u_radu: 'Na terenu',
      u_izvrsenju: 'Na terenu',
      assigned: 'Dodijeljeno serviseru',
      in_progress: 'Na terenu',
      scheduled: 'Potvrđeno',
      completed: 'Završeno',
    };
    return map[s] ?? s;
  }

  const jeNovi = zahtjevJeNoviUPregleduDispecera(zahtjev);
  const faza = uzmiDispecerskuFazuZaPregled(zahtjev);
  const glavni = jeNovi ? oznakaInboxHitnostiCekaObradu(zahtjev) : 'Dispečer obrađuje';
  const prikaziPodfazu = !jeNovi && faza !== 'ceka_operativni_prioritet';
  if (!prikaziPodfazu) return glavni;
  return `${glavni} · ${nazivFazeZaKorisnika(faza)}`;
}

export type KorisnikHeroTekst = { naslov: string; podnaslov: string };

/** Tekst „šta se trenutno dešava" za zaglavlje detalja zahtjeva korisnika. */
export function korisnikHeroTekst(
  zahtjev: ServisniZahtjev,
  mozeBitMijenjan: boolean,
  uAktivnojDispecerskojObradi: boolean,
): KorisnikHeroTekst {
  const s = zahtjev.status;
  if (s === 'zavrseno') {
    return {
      naslov: 'Zahtjev je završen',
      podnaslov: 'Hvala vam što ste koristili našu uslugu.',
    };
  }
  if (s === 'otkazano') {
    return {
      naslov: 'Zahtjev je otkazan',
      podnaslov: 'Ovaj zahtjev više nije aktivan.',
    };
  }
  if (s === 'odbijeno') {
    return {
      naslov: 'Zahtjev nije prihvaćen',
      podnaslov: 'Detalje potražite u odjeljku ispod.',
    };
  }
  if (mozeBitMijenjan) {
    return {
      naslov: 'Zahtjev je zaprimljen',
      podnaslov:
        'Još možete izmijeniti ili otkazati zahtjev dok dispečer ne započne obradu.',
    };
  }
  if (uAktivnojDispecerskojObradi) {
    return {
      naslov: 'Zahtjev je u obradi',
      podnaslov:
        'Dispečer trenutno provjerava zahtjev i dogovara termin. Izmjena i otkazivanje nisu mogući dok traje obrada.',
    };
  }
  if (s === 'u_radu' || s === 'u_izvrsenju') {
    return {
      naslov: 'Servis je na terenu',
      podnaslov:
        'Serviser izvršava rad na lokaciji. Izmjena prijave više nije moguća.',
    };
  }
  if (s === 'dodijeljeno') {
    return {
      naslov: 'Serviser dodijeljen',
      podnaslov:
        'Serviser je dodijeljen vašem zahtjevu. Pratite dolazak na adresu.',
    };
  }
  if (s === 'potvrdeno') {
    return {
      naslov: 'Termin je potvrđen',
      podnaslov:
        'Zahtjev je poslije obrade dispečera i pripremljen za intervenciju.',
    };
  }
  return {
    naslov: 'Zahtjev je u procesu',
    podnaslov:
      'Zahtjev je u kasnijoj fazi servisa - izmjena prijave više nije dostupna.',
  };
}

/** Donja napomena samo kad nije već pokriveno hero blokom (npr. kasnija faza servisa). */
export function korisnikDonjiStatusObjasnjenje(
  uAktivnojDispecerskojObradi: boolean,
  mozeBitMijenjan: boolean,
): string | null {
  if (mozeBitMijenjan) return null;
  if (uAktivnojDispecerskojObradi) return null;
  return 'Zahtjev je u kasnijoj fazi servisa. Izmjena prijave više nije dostupna; za hitna pitanja koristite kontakt ispod.';
}
