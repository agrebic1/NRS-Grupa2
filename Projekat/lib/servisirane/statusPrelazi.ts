// ─── Backend validacija statusnih prelaza ─────────────────────────────────────
//
// Centralizovana definicija dozvoljenih tranzicija (referentni model toka).
//
// NAPOMENA o statusu `zatvoreno`:
//   Formalno zatvaranje se NE bilježi promjenom statusa - status ostaje `zavrseno`,
//   a zatvaranje se evidentira kolonama `closed_at`/`closed_by`/`closure_note`.
//   Zato NE postoji prelaz `zavrseno → zatvoreno`. `zatvoreno` se u praksi ne
//   upisuje u kolonu `status`; u terminalnim skupovima ispod ostaje samo
//   defanzivno (ako bi se ikad pojavio, tranzicije su zaključane).

export type ValidacijaPrelaza = { ok: true } | { ok: false; greska: string };

// Serviser: dozvoljeni prijelazi naprijed + povratak na 'potvrdeno'
// 'vrati_na_dodjelu' i 'nije_rijeseno' → potvrdeno (serviser_dodijeljen_id se nullira u API-ju)
// 'odbij' → potvrdeno (samo iz dodijeljeno)
const SERVISER_PRELAZI: Record<string, string[]> = {
  dodijeljeno: ['u_radu', 'potvrdeno'],
  u_radu: ['u_izvrsenju', 'potvrdeno'],
  u_izvrsenju: ['zavrseno', 'potvrdeno'],
};

// Dispečer: prijelazi naprijed + operativni rollback uz razlog.
// `zavrseno` nema izlaznih prelaza - formalno zatvaranje ide preko `closed_at`, ne statusa.
const DISPECER_PRELAZI: Record<string, string[]> = {
  u_izvrsenju: ['zavrseno', 'potvrdeno'],
  dodijeljeno: ['potvrdeno'],
  u_radu: ['potvrdeno'],
};

// Potpuno zaključani statusi - nijedna uloga ne može mijenjati status
const TERMINALNI_ZAKLJUCANI = new Set(['zatvoreno', 'otkazano', 'odbijeno']);

// Operativno završeni - serviser ne može mijenjati; dispečer može → zatvoreno
const TERMINALNI_SERVISER = new Set([
  'zavrseno',
  'zatvoreno',
  'otkazano',
  'odbijeno',
]);

export function validirajServiserPrelaz(
  iz: string,
  u: string,
): ValidacijaPrelaza {
  if (TERMINALNI_SERVISER.has(iz)) {
    return {
      ok: false,
      greska: `Intervencija je u terminalnom statusu "${iz}" (završena ili zatvorena) i ne može se mijenjati.`,
    };
  }
  if (SERVISER_PRELAZI[iz]?.includes(u)) return { ok: true };
  const dozvoljeni = SERVISER_PRELAZI[iz] ?? [];
  const lista = dozvoljeni.length > 0 ? dozvoljeni.join(', ') : 'nema';
  return {
    ok: false,
    greska: `Prelaz iz "${iz}" u "${u}" nije dozvoljen. Serviser može samo: ${lista}.`,
  };
}

export function validirajDispecerasPrelaz(
  iz: string,
  u: string,
): ValidacijaPrelaza {
  if (TERMINALNI_ZAKLJUCANI.has(iz)) {
    return {
      ok: false,
      greska: `Intervencija je u terminalnom zaključanom statusu "${iz}" i ne može se mijenjati.`,
    };
  }
  if (DISPECER_PRELAZI[iz]?.includes(u)) return { ok: true };
  const dozvoljeni = DISPECER_PRELAZI[iz] ?? [];
  const lista = dozvoljeni.length > 0 ? dozvoljeni.join(', ') : 'nema';
  return {
    ok: false,
    greska: `Prelaz iz "${iz}" u "${u}" nije dozvoljen dispečeru. Dozvoljeno: ${lista}.`,
  };
}

/** Vraća true za statuse koji su potpuno zaključani za sve uloge. */
export function jeTerminalniStatus(status: string): boolean {
  return TERMINALNI_ZAKLJUCANI.has(status);
}

/** Vraća true za `zavrseno` i `zatvoreno` - serviser ne može mijenjati. */
export function jeZavrsenoIliZatvoreno(status: string): boolean {
  return status === 'zavrseno' || status === 'zatvoreno';
}
