// ─── Backend validacija statusnih prelaza ─────────────────────────────────────
//
// Jedino mjesto u sistemu koje definira šta je dozvoljen prijelaz.
// API rute koriste ove funkcije; frontend je samo pomocno upozorenje.

export type ValidacijaPrelaza =
  | { ok: true }
  | { ok: false; greska: string };

// Serviser smije samo ove prijelaze (naprijed, nikad rollback)
// 'vrati_na_dodjelu' i 'nije_rijeseno' su posebni slučajevi koji idu na 'potvrdeno'
const SERVISER_PRELAZI: Record<string, string[]> = {
  dodijeljeno: ['u_radu', 'potvrdeno'],   // potvrdeno = vrati_na_dodjelu
  u_radu:      ['u_izvrsenju', 'potvrdeno'], // potvrdeno = vrati_na_dodjelu
  u_izvrsenju: ['zavrseno', 'potvrdeno'], // potvrdeno = nije_rijeseno
};

// Dispečer smije prijelaze naprijed + rollback uz razlog
const DISPECER_PRELAZI: Record<string, string[]> = {
  u_izvrsenju: ['zavrseno', 'potvrdeno'],
  zavrseno:    ['zatvoreno'],
  dodijeljeno: ['potvrdeno'],
  u_radu:      ['potvrdeno'],
};

// Terminalni statusi — izmjene više nisu dozvoljene
const TERMINALNI = new Set(['zatvoreno', 'otkazano', 'odbijeno']);

export function validirajServiserPrelaz(iz: string, u: string): ValidacijaPrelaza {
  if (TERMINALNI.has(iz)) {
    return { ok: false, greska: `Intervencija je u terminalnom statusu "${iz}" i ne može se mijenjati.` };
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
  if (TERMINALNI.has(iz) && u !== 'potvrdeno') {
    return { ok: false, greska: `Intervencija je u terminalnom statusu "${iz}".` };
  }
  if (DISPECER_PRELAZI[iz]?.includes(u)) return { ok: true };
  const dozvoljeni = DISPECER_PRELAZI[iz] ?? [];
  const lista = dozvoljeni.length > 0 ? dozvoljeni.join(', ') : 'nema';
  return {
    ok: false,
    greska: `Prelaz iz "${iz}" u "${u}" nije dozvoljen dispečeru. Dozvoljeno: ${lista}.`,
  };
}

export function jeTerminalniStatus(status: string): boolean {
  return TERMINALNI.has(status);
}

export function jeReadOnly(status: string): boolean {
  return status === 'zatvoreno';
}
