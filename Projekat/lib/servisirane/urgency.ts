import type { TriageOdgovori, NivoHitnosti } from '@/domain/types/servisirane';

/** Gornja granica bodovanja iz trijaže (`izracunajUrgency`); koristi se i za premium hitnu bez upitnika. */
export const URGENCY_SCORE_MAKS = 110;

export function efektivniKorisnickiUrgencyScore(zahtjev: {
  is_premium: boolean;
  urgency_score: number;
}): number {
  return zahtjev.is_premium ? URGENCY_SCORE_MAKS : zahtjev.urgency_score;
}

export function izracunajUrgency(triage: TriageOdgovori): number {
  let score = 0;

  // Sigurnost - max 50
  if (triage.opasnost) score += 50;

  // Zastoj / funkcionalnost - max 25
  if (triage.funkcionalnost === 'potpuni_prekid') score += 25;
  else if (triage.funkcionalnost === 'otezana') score += 10;

  // Rizik od sekundarne štete - max 15
  if (triage.steta) score += 15;

  // Ranjivost - max 10
  if (triage.ranjivost) score += 10;

  // Obuhvat - max 10
  if (triage.obuhvat) score += 10;

  return score; // max 110
}

export function kategorizirajHitnost(score: number): NivoHitnosti {
  if (score >= 80) return 'KRITIČNO';
  if (score >= 50) return 'VISOKO';
  if (score >= 20) return 'SREDNJE';
  return 'NISKO';
}

const OZNAKA_HITNOSTI_ZA_KORISNIKA: Record<NivoHitnosti, string> = {
  NISKO: 'Niska',
  SREDNJE: 'Srednja',
  VISOKO: 'Visoka',
  KRITIČNO: 'Hitno',
  HITNO: 'Hitno',
};

/** Korisnički čitljiva hitnost (bez enum vrijednosti i broja bodova). */
export function oznakaHitnostiZaKorisnika(score: number): string {
  const nivo = kategorizirajHitnost(score);
  return OZNAKA_HITNOSTI_ZA_KORISNIKA[nivo] ?? nivo;
}

/** Tri razine za vizualne chipove (Visoka uključuje VISOKO i KRITIČNO). */
export function oznakaKorisnickeHitnostiTriRazine(
  score: number,
): 'Visoka' | 'Srednja' | 'Niska' {
  const nivo = kategorizirajHitnost(score);
  if (nivo === 'NISKO') return 'Niska';
  if (nivo === 'SREDNJE') return 'Srednja';
  return 'Visoka';
}

/**
 * Tekst bedža na korisničkoj listi dok zahtjev čeka dispečera (umjesto „Novi”).
 * Prefiksom „Vaša procjena:” jasno označava da je ovo korisnikova samoprocjena,
 * a ne operativni prioritet dispečera (final_priority).
 */
export function oznakaInboxHitnostiCekaObradu(zahtjev: {
  is_premium: boolean;
  urgency_score: number;
}): string {
  const tri = oznakaKorisnickeHitnostiTriRazine(
    efektivniKorisnickiUrgencyScore(zahtjev),
  );
  return `Vaša procjena: ${tri.toLowerCase()}`;
}

/** Tri inbox grupe na kontrolnoj tabli - iz korisničke procjene (upitnik + premium), ne iz `final_priority`. */
export type DispecerskaInboxGrupaPoKorisniku = 'Hitno' | 'Srednja' | 'Niska';

export function inboxGrupaIzKorisnickeProcjene(zahtjev: {
  is_premium: boolean;
  urgency_score: number;
}): DispecerskaInboxGrupaPoKorisniku {
  const tri = oznakaKorisnickeHitnostiTriRazine(
    efektivniKorisnickiUrgencyScore(zahtjev),
  );
  if (tri === 'Visoka') return 'Hitno';
  if (tri === 'Srednja') return 'Srednja';
  return 'Niska';
}

type ZaDispecerskiInboxZajednicko = {
  id: number;
  created_at: string;
  is_premium: boolean;
  urgency_score: number;
};

function poredajUnutarDispecerskeInboxGrupe<
  T extends ZaDispecerskiInboxZajednicko,
>(redovi: T[], grupa: DispecerskaInboxGrupaPoKorisniku): T[] {
  return [...redovi].sort((a, b) => {
    if (grupa === 'Hitno' && a.is_premium !== b.is_premium) {
      return a.is_premium ? -1 : 1;
    }
    const t =
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (t !== 0) return t;
    return a.id - b.id;
  });
}

/** Redoslijed inboxa: Hitno → Srednja → Niska; unutar Hitno prvo premium, zatim starije prijave prvo. */
export function sastaviDispecerskiInboxRedoslijed<
  T extends ZaDispecerskiInboxZajednicko,
>(
  zahtjevi: T[],
): {
  uredjeni: T[];
  grupisani: Record<DispecerskaInboxGrupaPoKorisniku, T[]>;
} {
  const hitno = zahtjevi.filter(
    (z) => inboxGrupaIzKorisnickeProcjene(z) === 'Hitno',
  );
  const srednja = zahtjevi.filter(
    (z) => inboxGrupaIzKorisnickeProcjene(z) === 'Srednja',
  );
  const niska = zahtjevi.filter(
    (z) => inboxGrupaIzKorisnickeProcjene(z) === 'Niska',
  );
  const hitnoS = poredajUnutarDispecerskeInboxGrupe(hitno, 'Hitno');
  const srednjaS = poredajUnutarDispecerskeInboxGrupe(srednja, 'Srednja');
  const niskaS = poredajUnutarDispecerskeInboxGrupe(niska, 'Niska');
  return {
    uredjeni: [...hitnoS, ...srednjaS, ...niskaS],
    grupisani: { Hitno: hitnoS, Srednja: srednjaS, Niska: niskaS },
  };
}
