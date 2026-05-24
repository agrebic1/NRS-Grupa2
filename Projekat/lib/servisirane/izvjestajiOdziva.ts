// Tipovi za izvještaj odziva servisera - US-42

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
