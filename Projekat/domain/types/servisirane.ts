// ─── Statusi zahtjeva - životni ciklus ───────────────────────────────────────

export type StatusZahtjeva =
  | 'pending_review' // Novi - sinonim za na_cekanju; oba znače isti početni status
  | 'na_cekanju'    // Novi - korisnik može uređivati; kanonski naziv za oba
  | 'in_review'     // Dispečerski čarobnjak aktivan (faze: prioritet → termin → serviser → potvrda)
  | 'potvrdeno'     // Čeka dodjelu/re-dodjelu servisera (serviser_dodijeljen_id može biti null)
  | 'dodijeljeno'   // Serviser dodijeljen - čeka prihvatanje
  | 'u_radu'        // Serviser prihvatio - na putu ka lokaciji
  | 'u_izvrsenju'   // Serviser na terenu - rad u toku
  | 'zavrseno'      // Operativno završeno - čeka formalno zatvaranje dispečera
  | 'zatvoreno'     // Formalno zatvoreno - read-only, audit finaliziran
  | 'otkazano'      // Korisnik otkazao (cancel_reason + cancelled_at)
  | 'odbijeno';     // Dispečer odbio (rejection_reason obavezan)

export type NivoHitnosti    = 'NISKO' | 'SREDNJE' | 'VISOKO' | 'KRITIČNO' | 'HITNO';
export type StatusAplikacije = 'na_cekanju' | 'odobreno' | 'odbijeno';
export type TipUsluge        = 'serviser' | 'dispecer';
export type StepenObrazovanja = 'SSS' | 'VŠS' | 'VSS' | 'Certifikovani majstor';

export type VremenslotTip =
  | 'jutro'       // 08:00 - 12:00  🟠 Narandžasta
  | 'dan'         // 12:00 - 16:00  🟡 Žuta
  | 'vece'        // 16:00 - 20:00  🔵 Plava
  | 'cijeli_dan'  // Po dogovoru    🟢 Zelena
  | 'custom';     // Prilagođeno    🟣 Ljubičasta

// ─── Triage ───────────────────────────────────────────────────────────────────

export interface TriageOdgovori {
  opasnost:       boolean;
  funkcionalnost: 'potpuni_prekid' | 'otezana' | 'manja_smetnja';
  steta:          boolean;
  ranjivost:      boolean;
  obuhvat:        boolean;
}

// ─── Termin slot - V5.0 range-based scheduling ───────────────────────────────

export interface TerminSlot {
  date: string;  // 'YYYY-MM-DD'
  from: string;  // 'HH:mm'
  to:   string;  // 'HH:mm'
}

// ─── Preferred schedule (JSONB) ──────────────────────────────────────────────

export interface PreferredSchedule {
  termini: TerminSlot[];
  /** Korisnik nema preferenciju - dispečer dogovara termin. */
  no_preferred_time?: boolean;
  /** Oznaka brzog izbora (npr. Jutro, Cijeli dan) ili prilagođeno. */
  preferred_time_label?: string | null;
}

// ─── Servisni zahtjev ─────────────────────────────────────────────────────────

export interface ServisniZahtjev {
  id:                   number;
  /** Redni broj zahtjeva tog korisnika (1 = najstariji); računa se na API-ju, nije kolona u DB. */
  korisnicki_broj_zahtjeva?: number | null;
  /** Jedinstven red u trenutnom odgovoru dispečerske liste (1…n); nije u DB. */
  dispecerski_redni_u_pregledu?: number | null;
  user_id:              string;
  category:             string;
  category_main:        string | null;
  category_sub:         string | null;
  address:              string;
  /** Sačuvano uz zahtjev ako je korisnik koristio GPS ili mapu (opcionalno). */
  latitude:             number | null;
  longitude:            number | null;
  description:          string;
  contact_phone:        string;
  photo_url:            string | null;
  /** Dodatne slike uz zahtjev (opcionalno; API/DB mogu još ne vraćati). */
  attachment_image_urls?: string[] | null;
  /** Alternativna polja ako backend koristi drugačije nazive (npr. JSON kolona). */
  images?: string[] | null;
  photos?: string[] | null;
  attachment_urls?: string[] | null;
  is_premium:           boolean;
  premium_terms_accepted: boolean;
  premium_requested_at: string | null;
  premium_priority_override_reason: string | null;
  status:               StatusZahtjeva;
  urgency_score:        number;
  system_score:         number;
  final_priority:       string | null;
  rejection_reason:     string | null;
  triage_json:          TriageOdgovori | null;
  preferred_schedule:   PreferredSchedule | null;
  cancel_reason:        string | null;
  /** Postavljeno pri otkazivanju od strane korisnika. */
  cancelled_at:         string | null;
  /** `true` kad je serviser potvrdio dogovoreni termin - u pregledu zahtjeva prelazi iz „Novi“ u „U obradi“. */
  is_verified_assigned: boolean;
  /**
   * Dogovoreni termin u čarobnjaku (dispečer); NULL dok termin nije potvrđen u koraku „Termin i serviser“.
   * Isti oblik kao `preferred_schedule` gdje je primjereno.
   */
  dispecer_agreed_schedule?: PreferredSchedule | null;
  /** Serviser dodijeljen u planiranju. */
  serviser_dodijeljen_id?:  string | null;
  /** Planirani termin početka (ISO timestamp). */
  termin_planirani_pocetak?: string | null;
  /** Planirani termin kraja (ISO timestamp). */
  termin_planirani_kraj?:    string | null;
  /** Procijenjeno trajanje u minutama. */
  procijenjeno_trajanje?:    number | null;
  /** Napomene dispečera za servisera. */
  dispecer_napomene?:        string | null;
  /** Razlog odbijanja od strane servisera. */
  serviser_odbio_razlog?:    string | null;
  /** Timestamp kada je serviser evidentirao rad. */
  rad_evidentiran_at?:       string | null;
  /** Timestamp formalnog zatvaranja (status = zatvoreno). */
  closed_at?:                string | null;
  /** ID dispečera koji je formalno zatvorio intervenciju. */
  closed_by?:                string | null;
  /** Napomena dispečera pri formalnom zatvaranju. */
  closure_note?:             string | null;
  /** US-47: broj operativnih ponovnih dodjela / nije riješeno. */
  broj_ponovnih_ciklusa?:    number;
  /** US-45: zadnja SLA eskalacija. */
  sla_eskalacija_at?:        string | null;
  created_at:           string;
  updated_at:           string;
}

// ─── Sprint 8: Evidencija rada ───────────────────────────────────────────────

export interface MaterijalStavka {
  naziv:    string;
  kolicina: number;
  jedinica: string;
}

export interface WorkEvidence {
  id:               number;
  zahtjev_id:       number;
  serviser_id:      string;
  opis_rada:        string;
  trajanje_minuta:  number | null;
  materijal:        string | null;
  stavke_materijala?: MaterijalStavka[];
  napomene:         string | null;
  created_at:       string;
}

// ─── Sprint 8: Aktivnosti / historija intervencije ───────────────────────────

export type TipAktivnosti =
  | 'status_promjena'
  | 'napomena'
  | 'dodjela'
  | 'evidencija'
  | 'odbijanje'
  | 'sistem'
  | 'slika'
  | 'tim_dodjela'
  | 'tim_uklanjanje'
  | 'zatvaranje'
  | 'konflikt_override'
  | 'nije_rijeseno'
  | 'promjena_izvrsioca'
  | 'vracanje_na_dodjelu'
  | 'sla_eskalacija';

export interface InterventionActivity {
  id:         number;
  zahtjev_id: number;
  autor_id:   string;
  tip:        TipAktivnosti;
  sadrzaj:    string;
  metadata:   Record<string, unknown> | null;
  old_value:  string | null;
  new_value:  string | null;
  actor_role: string | null;
  razlog:     string | null;
  created_at: string;
  autor?: {
    ime:     string;
    prezime: string;
    uloga:   string;
  };
}

// ─── Sprint 8: Serviser profil za dodjelu ────────────────────────────────────

export interface ServiserZaDodjelu {
  id:                string;
  ime:               string;
  prezime:           string;
  is_verified:       boolean;
  aktivnih_zadataka: number;
  specialnosti:      string[];
}

// ─── Partner aplikacija ───────────────────────────────────────────────────────

export interface PartnerAplikacija {
  id:              number;
  first_name:      string;
  last_name:       string;
  email:           string;
  phone:           string;
  service_type:    TipUsluge;
  education_level: StepenObrazovanja | null;
  experience:      string;
  document_url:    string | null;
  specialnosti:    string[];
  status:          StatusAplikacije;
  created_at:      string;
}

// ─── Profil korisnika ─────────────────────────────────────────────────────────

export interface ProfilKorisnika {
  id:           string;
  ime:          string;
  prezime:      string;
  email:        string | null;
  broj_telefona: string | null;
  adresa:       string | null;
  uloge:        string[];
  is_verified:  boolean;
  is_premium:   boolean;
  premium_status?: 'inactive' | 'pending_payment' | 'active' | 'expired' | 'cancelled';
  premium_started_at?: string | null;
  premium_expires_at?: string | null;
  premium_plan?: string | null;
  premium_cancelled_at?: string | null;
  premium_cancel_reason?: string | null;
}

// ─── Sprint 9: Tim intervencije ───────────────────────────────────────────────

export interface ClanTima {
  id:            number;
  zahtjev_id:    number;
  serviser_id:   string;
  uloga:         'pomocni';
  dodijelio_id:  string;
  dodijeljeno_at: string;
  serviser?: {
    ime:          string;
    prezime:      string;
    broj_telefona: string | null;
  };
}

// ─── Sprint 9: In-app notifikacije ───────────────────────────────────────────

export type TipNotifikacije =
  // Serviser
  | 'dodjela_intervencije'
  | 'tim_dodjela'
  | 'uklanjanje_servisera'
  | 'promjena_termina'
  | 'nova_napomena'
  // Dispečer
  | 'prihvatanje_zadatka'
  | 'odbijanje_zadatka'
  | 'evidencija_rada'
  | 'novi_zahtjev'
  // Korisnik usluge
  | 'promjena_statusa'
  | 'zavrsetak_intervencije'
  | 'zatvaranje_intervencije'
  // Admin
  | 'promjena_uloge'
  | 'promjena_statusa_naloga'
  | 'sistemska_obavijest'
  | 'sla_eskalacija';

export interface Notifikacija {
  id:                    number;
  korisnik_id:           string;
  tip:                   TipNotifikacije;
  naslov:                string;
  poruka:                string;
  procitano:             boolean;
  zahtjev_id:            number | null;
  uloga_korisnika:       string | null;
  povezani_entitet_tip:  string | null;
  povezani_entitet_id:   string | null;
  created_at:            string;
}

// ─── Sprint 9: Slike intervencije ─────────────────────────────────────────────

export interface SlikaIntervencije {
  id:            number;
  zahtjev_id:    number;
  evidencija_id: number | null;
  uploaded_by:   string;
  image_url:     string;
  naziv:         string | null;
  opis:          string | null;
  created_at:    string;
}

// ─── Sprint 9: Konflikt termina ───────────────────────────────────────────────

export interface KonfliktTermina {
  serviser_id:    string;
  serviser_ime:   string;
  zahtjev_id:     number;
  pocetak:        string;
  kraj:           string;
}
