// Tipovi za izvještaj odziva servisera - US-42

/** Jedna završena intervencija u detalju servisera. */
export interface IntervencijaOdzivaRed {
  zahtjev_id:       number;
  zavrseno_at:      string;        // ISO datum završetka (updated_at)
  final_priority:   string | null;
  odziv_minuta:     number | null; // dodjela → prihvat
  trajanje_minuta:  number | null; // evidencija rada
  sla_ok:           boolean | null; // null = nema podataka o prioritetu
}

export interface ServiserOdzivaRed {
  serviser_id:           string;
  ime:                   string;
  prezime:               string;
  broj_intervencija:     number;
  /** Prosječno vrijeme (min) od dodjele do prihvatanja (u_radu). null ako nema podataka. */
  avg_odziv_minuta:      number | null;
  /** Prosječno ukupno trajanje evidenciranog rada (min) po intervenciji. null ako nema evidencija. */
  avg_trajanje_minuta:   number | null;
  /** Postotak intervencija završenih unutar SLA roka. null ako nema podataka. */
  sla_compliance_posto:  number | null;
  /** Detalji po intervenciji — za expand redak u tabeli. */
  intervencije:          IntervencijaOdzivaRed[];
}

export interface IzvjestajOdzivaOdgovor {
  period: {
    od: string;
    do: string;
  };
  serviseri:   ServiserOdzivaRed[];
  ukupno: {
    broj_intervencija:   number;
    avg_odziv_minuta:    number | null;
    avg_trajanje_minuta: number | null;
    sla_compliance_posto: number | null;
  };
}
