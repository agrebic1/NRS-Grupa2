import {
  korisnickiDashboardStatus,
  korisnikSmijeMijenjatiIliOtkazatiZahtjev,
  zahtjevCekaObraduUInboxuDispecera,
  zahtjevJeNoviPrijeCarobnjakaDispecera,
  jeZahtjevAktivan,
  dispecerSmijeMijenjatiOperativniPrioritet,
} from '@/lib/servisirane/statusZahtjeva';

describe('korisnickiDashboardStatus', () => {
  // ── Terminalni statusi ────────────────────────────────────────────────────────
  it('zatvoreno → zatvoreno (bez obzira na finalPriority)', () => {
    expect(korisnickiDashboardStatus('zatvoreno')).toBe('zatvoreno');
    expect(korisnickiDashboardStatus('zatvoreno', 'VISOKO')).toBe('zatvoreno');
  });

  it('zavrseno → zavrseno', () => {
    expect(korisnickiDashboardStatus('zavrseno')).toBe('zavrseno');
  });

  it('otkazano → otkazano', () => {
    expect(korisnickiDashboardStatus('otkazano')).toBe('otkazano');
  });

  it('odbijeno → odbijeno', () => {
    expect(korisnickiDashboardStatus('odbijeno')).toBe('odbijeno');
  });

  // ── Aktivna izvršenja ─────────────────────────────────────────────────────────
  it('u_radu → u_toku', () => {
    expect(korisnickiDashboardStatus('u_radu')).toBe('u_toku');
  });

  it('u_izvrsenju → u_toku', () => {
    expect(korisnickiDashboardStatus('u_izvrsenju')).toBe('u_toku');
  });

  // ── Potvrđeno / dodijeljeno ───────────────────────────────────────────────────
  it('potvrdeno → potvrdeno', () => {
    expect(korisnickiDashboardStatus('potvrdeno')).toBe('potvrdeno');
  });

  it('dodijeljeno → potvrdeno', () => {
    expect(korisnickiDashboardStatus('dodijeljeno')).toBe('potvrdeno');
  });

  // ── Dispečerska obrada ────────────────────────────────────────────────────────
  it('in_review → u_obradi', () => {
    expect(korisnickiDashboardStatus('in_review')).toBe('u_obradi');
  });

  it('pending_review s finalPriority → u_obradi', () => {
    expect(korisnickiDashboardStatus('pending_review', 'VISOKO')).toBe('u_obradi');
  });

  it('na_cekanju s finalPriority → u_obradi', () => {
    expect(korisnickiDashboardStatus('na_cekanju', 'SREDNJE')).toBe('u_obradi');
  });

  // ── Novi zahtjevi ─────────────────────────────────────────────────────────────
  it('pending_review bez finalPriority → novi', () => {
    expect(korisnickiDashboardStatus('pending_review')).toBe('novi');
    expect(korisnickiDashboardStatus('pending_review', null)).toBe('novi');
    expect(korisnickiDashboardStatus('pending_review', '')).toBe('novi');
  });

  it('na_cekanju bez finalPriority → novi', () => {
    expect(korisnickiDashboardStatus('na_cekanju')).toBe('novi');
    expect(korisnickiDashboardStatus('na_cekanju', '')).toBe('novi');
  });

  it('null status → novi', () => {
    expect(korisnickiDashboardStatus(null)).toBe('novi');
    expect(korisnickiDashboardStatus(undefined)).toBe('novi');
  });

  it('nepoznati status → novi (fallback)', () => {
    expect(korisnickiDashboardStatus('neki_nepostojeci_status')).toBe('novi');
  });
});

describe('korisnikSmijeMijenjatiIliOtkazatiZahtjev', () => {
  it('na_cekanju bez finalPriority → smije', () => {
    expect(korisnikSmijeMijenjatiIliOtkazatiZahtjev('na_cekanju')).toBe(true);
    expect(korisnikSmijeMijenjatiIliOtkazatiZahtjev('na_cekanju', null)).toBe(true);
    expect(korisnikSmijeMijenjatiIliOtkazatiZahtjev('na_cekanju', '')).toBe(true);
  });

  it('pending_review bez finalPriority → smije', () => {
    expect(korisnikSmijeMijenjatiIliOtkazatiZahtjev('pending_review')).toBe(true);
  });

  it('na_cekanju s finalPriority → ne smije (dispečer je počeo)', () => {
    expect(korisnikSmijeMijenjatiIliOtkazatiZahtjev('na_cekanju', 'VISOKO')).toBe(false);
    expect(korisnikSmijeMijenjatiIliOtkazatiZahtjev('na_cekanju', 'NISKO')).toBe(false);
  });

  it('in_review → ne smije (dispečer je u čarobnjaku)', () => {
    expect(korisnikSmijeMijenjatiIliOtkazatiZahtjev('in_review')).toBe(false);
  });

  it('potvrdeno → ne smije', () => {
    expect(korisnikSmijeMijenjatiIliOtkazatiZahtjev('potvrdeno')).toBe(false);
  });

  it('zavrseno → ne smije', () => {
    expect(korisnikSmijeMijenjatiIliOtkazatiZahtjev('zavrseno')).toBe(false);
  });

  it('zatvoreno → ne smije', () => {
    expect(korisnikSmijeMijenjatiIliOtkazatiZahtjev('zatvoreno')).toBe(false);
  });

  it('otkazano → ne smije', () => {
    expect(korisnikSmijeMijenjatiIliOtkazatiZahtjev('otkazano')).toBe(false);
  });
});

describe('zahtjevCekaObraduUInboxuDispecera', () => {
  it('pending_review → čeka', () => expect(zahtjevCekaObraduUInboxuDispecera('pending_review')).toBe(true));
  it('na_cekanju → čeka', () => expect(zahtjevCekaObraduUInboxuDispecera('na_cekanju')).toBe(true));
  it('in_review → čeka (dispečer u wizard-u)', () => expect(zahtjevCekaObraduUInboxuDispecera('in_review')).toBe(true));
  it('potvrdeno → čeka (ponovna dodjela / dodjela serviseru)', () =>
    expect(zahtjevCekaObraduUInboxuDispecera('potvrdeno')).toBe(true));
  it('zavrseno → ne čeka', () => expect(zahtjevCekaObraduUInboxuDispecera('zavrseno')).toBe(false));
});

describe('zahtjevJeNoviPrijeCarobnjakaDispecera', () => {
  it('pending_review → novi (wizard nije počeo)', () => expect(zahtjevJeNoviPrijeCarobnjakaDispecera('pending_review')).toBe(true));
  it('na_cekanju → novi', () => expect(zahtjevJeNoviPrijeCarobnjakaDispecera('na_cekanju')).toBe(true));
  it('in_review → nije novi (wizard je aktivan)', () => expect(zahtjevJeNoviPrijeCarobnjakaDispecera('in_review')).toBe(false));
  it('potvrdeno → nije novi', () => expect(zahtjevJeNoviPrijeCarobnjakaDispecera('potvrdeno')).toBe(false));
});

describe('jeZahtjevAktivan', () => {
  it('aktivni statusi vraćaju true', () => {
    ['pending_review', 'na_cekanju', 'in_review', 'potvrdeno', 'dodijeljeno', 'u_radu', 'u_izvrsenju'].forEach(
      (s) => expect(jeZahtjevAktivan(s)).toBe(true)
    );
  });

  it('terminalni statusi vraćaju false', () => {
    ['zavrseno', 'zatvoreno', 'otkazano', 'odbijeno'].forEach(
      (s) => expect(jeZahtjevAktivan(s)).toBe(false)
    );
  });
});

describe('dispecerSmijeMijenjatiOperativniPrioritet', () => {
  it('smije mijenjati u aktivnim statusima', () => {
    ['pending_review', 'na_cekanju', 'in_review', 'potvrdeno', 'dodijeljeno', 'u_radu', 'u_izvrsenju'].forEach(
      (s) => expect(dispecerSmijeMijenjatiOperativniPrioritet(s)).toBe(true)
    );
  });

  it('ne smije mijenjati u terminalnim statusima', () => {
    ['zavrseno', 'zatvoreno', 'otkazano', 'odbijeno'].forEach(
      (s) => expect(dispecerSmijeMijenjatiOperativniPrioritet(s)).toBe(false)
    );
  });
});
