/**
 * Skraćeni prikaz adresa na karticama: prvi segment(i) ostaju vidljivi,
 * tipično „ulica, naselje/grad“, a općina, kanton, entitet, država idu u proširenje / tooltip.
 */

const MAX_JEDAN_SEGMENT_BEZ_ZAREZA = 72;
/** Na kartici prikaži prva dva segmenta odvojena zarezom; ostatak = administrativni nivo. */
const SEGMENTA_NA_KRATKOM_PRIKAZU = 2;

export type RazlozenaAdresa = {
  cjelovita: string;
  /** Ono što kartica/lista prikazuje odmah */
  skraceniPrikaz: string;
  /** Nakon drugog zareza - općina, kanton, FBiH, BiH … */
  administrativniNastavak: string | null;
  /** Treba li tooltip ili <details> (duga jedna linija ili 3+ segmenta) */
  imaSkriveno: boolean;
};

export function razloziAdresu(
  cjelovita: string | null | undefined,
): RazlozenaAdresa {
  const puna = (cjelovita ?? '').trim();
  if (!puna) {
    return {
      cjelovita: '',
      skraceniPrikaz: '-',
      administrativniNastavak: null,
      imaSkriveno: false,
    };
  }

  const dijelovi = puna
    .split(',')
    .map((d) => d.trim())
    .filter(Boolean);

  if (dijelovi.length === 0) {
    return {
      cjelovita: puna,
      skraceniPrikaz: '-',
      administrativniNastavak: null,
      imaSkriveno: false,
    };
  }

  if (dijelovi.length === 1) {
    const [jedan] = dijelovi;
    if (jedan.length <= MAX_JEDAN_SEGMENT_BEZ_ZAREZA) {
      return {
        cjelovita: puna,
        skraceniPrikaz: jedan,
        administrativniNastavak: null,
        imaSkriveno: false,
      };
    }
    return {
      cjelovita: puna,
      skraceniPrikaz: `${jedan.slice(0, MAX_JEDAN_SEGMENT_BEZ_ZAREZA).trimEnd()}…`,
      administrativniNastavak: null,
      imaSkriveno: true,
    };
  }

  if (dijelovi.length <= SEGMENTA_NA_KRATKOM_PRIKAZU) {
    return {
      cjelovita: puna,
      skraceniPrikaz: dijelovi.join(', '),
      administrativniNastavak: null,
      imaSkriveno: false,
    };
  }

  const skraceniPrikaz = dijelovi
    .slice(0, SEGMENTA_NA_KRATKOM_PRIKAZU)
    .join(', ');
  const administrativniNastavak = dijelovi
    .slice(SEGMENTA_NA_KRATKOM_PRIKAZU)
    .join(', ');
  return {
    cjelovita: puna,
    skraceniPrikaz,
    administrativniNastavak,
    imaSkriveno: true,
  };
}
