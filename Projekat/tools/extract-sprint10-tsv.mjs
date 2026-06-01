import fs from 'fs';
import path from 'path';

const transcript = path.resolve(
  'C:/Users/ajlac/.cursor/projects/c-Users-ajlac-Desktop-NRS-Grupa2/agent-transcripts/13335665-e8bb-4217-b4a5-6a3bafef3b3b/13335665-e8bb-4217-b4a5-6a3bafef3b3b.jsonl',
);
const outDir = path.resolve('docs/testing/SB-10-107');
fs.mkdirSync(outDir, { recursive: true });

const lines = fs.readFileSync(transcript, 'utf8').split('\n');
for (const line of lines) {
  if (!line.includes('T1-01') || !line.includes('Naziv testa')) continue;
  const j = JSON.parse(line);
  const text = j.message?.content?.[0]?.text ?? '';
  const marker = 'svi tetovi sada prolaze "';
  const start = text.indexOf('ID\tNaziv testa');
  if (start < 0) continue;
  let tsv = text.slice(start);
  // Obriši eventualni završni navodnik iz user_query
  if (tsv.endsWith('"')) tsv = tsv.slice(0, -1);
  fs.writeFileSync(path.join(outDir, '_source.tsv'), tsv, 'utf8');
  const rows = tsv.split(/\r?\n/).filter((r) => /^T[1-4]-\d+/.test(r));
  console.log('test rows', rows.length);
  break;
}
