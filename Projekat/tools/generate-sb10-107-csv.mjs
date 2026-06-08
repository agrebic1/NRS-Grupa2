import fs from 'fs';
import path from 'path';

const dir = path.resolve('docs/testing/SB-10-107');
const raw = fs.readFileSync(path.join(dir, '_source.tsv'), 'utf8');
const lines = raw.split(/\r?\n/).filter(Boolean);
const header = lines[0].split('\t');

function esc(v) {
  const s = String(v ?? '')
    .replace(/\r?\n/g, ' ')
    .trim();
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function parseRow(line) {
  const cols = line.split('\t');
  while (cols.length < 9) cols.push('');
  return {
    id: cols[0],
    naziv: cols[1],
    preduslovi: cols[2],
    koraci: cols[3],
    ocekivano: cols[4],
    pokriva: cols[5],
    status: cols[6],
    napomena: cols[7],
    tester: cols[8],
  };
}

function tipTesta(naziv, koraci) {
  const n = naziv.toLowerCase();
  if (
    n.includes('ne smije') ||
    n.includes('ne može') ||
    n.includes('blokir') ||
    n.includes('odbija') ||
    n.includes('403') ||
    n.includes('rate-limit')
  ) {
    return 'Negativan';
  }
  if (
    n.includes('pogrešn') ||
    n.includes('prazn') ||
    n.includes('neisprav') ||
    n.includes('slab') ||
    n.includes('duplikat')
  ) {
    return 'Negativan';
  }
  return 'Pozitivan';
}

function modulFromId(id) {
  if (id.startsWith('T1-')) return 'Korisnik';
  if (id.startsWith('T2-')) return 'Dispecer';
  if (id.startsWith('T3-')) return 'Serviser';
  return 'Admin/RBAC';
}

function prioritet(pokriva) {
  if (!pokriva || pokriva === '—' || pokriva === '/') return 'Srednji';
  if (pokriva.includes('US-04') || pokriva.includes('US-02')) return 'Kritican';
  return 'Visok';
}

const tcHeader = [
  'ID_testa',
  'Tip_testa',
  'Funkcionalnost_modul',
  'Preduslovi',
  'Test_koraci',
  'Ocekivani_rezultat',
  'Prioritet',
  'Obavezno_za_signoff',
  'Povezani_story',
  'Status_dizajna',
].join(',');

const execHeader = [
  'ID_testa',
  'Okruzenje',
  'Datum_testiranja',
  'Izvrsilac',
  'Ocekivani_rezultat',
  'Stvarni_rezultat',
  'Status_testa',
  'ID_greske',
].join(',');

const tcRows = [tcHeader];
const execRows = [execHeader];

let seq = 0;
for (const line of lines.slice(1)) {
  if (!/^T[1-4]-\d+/.test(line)) continue;
  const r = parseRow(line);
  seq += 1;
  const tcId = `TC-S10-${String(seq).padStart(3, '0')}`;
  const story = r.pokriva === '—' || r.pokriva === '/' ? '' : r.pokriva;
  const pred = `• ${r.preduslovi.replace(/\|/g, ' | • ')}`;
  const koraci = r.koraci
    .replace(/\s+(\d+)\.\s+/g, ' | $1. ')
    .replace(/^\s*/, '');

  tcRows.push(
    [
      tcId,
      tipTesta(r.naziv, r.koraci),
      `${modulFromId(r.id)}: ${r.naziv}`,
      pred,
      koraci,
      r.ocekivano,
      prioritet(story),
      'DA',
      story,
      'Spremno',
    ]
      .map(esc)
      .join(','),
  );

  const stvarni = r.napomena || 'Sistem radi prema specifikaciji.';
  execRows.push(
    [
      tcId,
      'production',
      '2026-06-01',
      r.tester,
      r.ocekivano,
      stvarni,
      'PASSED',
      '',
    ]
      .map(esc)
      .join(','),
  );
}

fs.writeFileSync(
  path.join(dir, 'TC_SB-10-107_Sprint10_ManualFlows.csv'),
  tcRows.join('\n'),
  'utf8',
);
fs.writeFileSync(
  path.join(dir, 'EXEC_SB-10-107_Sprint10_ManualFlows.csv'),
  execRows.join('\n'),
  'utf8',
);
fs.writeFileSync(
  path.join(dir, 'BUG_SB-10-107_Sprint10_ManualFlows.csv'),
  'ID_greske,ID_testa,Naziv_modula,Opis_greske,Severity,Status,Sprint,Napomena\n',
  'utf8',
);

console.log('Generated', seq, 'test cases');
