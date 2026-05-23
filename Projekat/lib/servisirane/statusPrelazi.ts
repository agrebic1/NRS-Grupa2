// ─── Backend validacija statusnih prelaza ─────────────────────────────────────
//
// Jedino mjesto u sistemu koje definira dozvoljene tranzicije.
// API rute koriste ove funkcije; frontend je samo vizualna pomoć.
//
// NAPOMENA o terminološkim nivoima:
//   Terminalni (servisni) = zavrseno, zatvoreno, otkazano, odbijeno
//   Read-only (potpuno zaključano) = SAMO zatvoreno
//   zavrseno je operativno završeno ali dispečer može formalno zatvoriti.

export type ValidacijaPrelaza =
  | { ok: true }
  | { ok: false; greska: string };

// Serviser: dozvoljeni prijelazi naprijed + povratak na 'potvrdeno'
// 'vrati_na_dodjelu' i 'nije_rijeseno' → potvrdeno (serviser_dodijeljen_id se nullira u API-ju)
// 'odbij' → potvrdeno (samo iz dodijeljeno)
const SERVISER_PRELAZI: Record<string, string[]> = {
  dodijeljeno: ['u_radu', 'potvrdeno'],
  u_radu:      ['u_izvrsenju', 'potvrdeno'],
  u_izvrsenju: ['zavrseno', 'potvrdeno'],
};

// Dispečer: prijelazi naprijed + operativni rollback uz razlog
const DISPECER_PRELAZI: Record<string, string[]> = {
  u_izvrsenju: ['zavrseno', 'potvrdeno'],
  zavrseno:    ['zatvoreno'],
  dodijeljeno: ['potvrdeno'],
  u_radu:      ['potvrdeno'],
};

// Potpuno zaključani statusi — nijedna uloga ne može mijenjati status
const TERMINALNI_ZAKLJUCANI = new Set(['zatvoreno', 'otkazano', 'odbijeno']);

// Operativno završeni — serviser ne može mijenjati; dispečer može → zatvoreno
const TERMINALNI_SERVISER = new Set(['zavrseno', 'zatvoreno', 'otkazano', 'odbijeno']);

export function validirajServiserPrelaz(iz: string, u: string): ValidacijaPrelaza {
  if (TERMINALNI_SERVISER.has(iz)) {
    return { ok: false, greska: `Intervencija je u terminalnom statusu "${iz}" (završena ili zatvorena) i ne može se mijenjati.` };
  }
  if (SERVISER_PRELAZI[iz]?.includes(u)) return { ok: true };
  const dozvoljeni = SERVISER_PRELAZI[iz] ?? [];
  const lista = dozvoljeni.length > 0 ? dozvoljeni.join(', ') : 'nema';
  return {
    ok: false,
    greska: `Prelaz iz "${iz}" u "${u}" nije dozvoljen. Serviser može samo: ${lista}.`,
  };
}

export function validirajDispecerasPrelaz(iz: string, u: string): ValidacijaPrelaza {
  if (TERMINALNI_ZAKLJUCANI.has(iz)) {
    return { ok: false, greska: `Intervencija je u terminalnom zaključanom statusu "${iz}" i ne može se mijenjati.` };
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

/** Vraća true samo za `zatvoreno` — jedini istinski read-only status. */
export function jeReadOnly(status: string): boolean {
  return status === 'zatvoreno';
}

/** Vraća true za `zavrseno` i `zatvoreno` — serviser ne može mijenjati. */
export function jeZavrsenoIliZatvoreno(status: string): boolean {
  return status === 'zavrseno' || status === 'zatvoreno';
}
