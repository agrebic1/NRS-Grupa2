import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const coverageSummaryPath = path.join(
  rootDir,
  'coverage',
  'coverage-summary.json',
);
const outputPath = path.join(
  rootDir,
  'docs',
  'testing',
  'KRAJNJE_TESTIRANJE_IZVJESTAJ.md',
);

if (!fs.existsSync(coverageSummaryPath)) {
  console.error(
    'Nedostaje coverage-summary.json. Prvo pokreni: npm run test:coverage',
  );
  process.exit(1);
}

const summary = JSON.parse(fs.readFileSync(coverageSummaryPath, 'utf8'));
const total = summary.total;

const metrics = [
  { key: 'statements', pct: total.statements?.pct ?? 0 },
  { key: 'lines', pct: total.lines?.pct ?? 0 },
  { key: 'functions', pct: total.functions?.pct ?? 0 },
  { key: 'branches', pct: total.branches?.pct ?? 0 },
];

const pass99 = metrics
  .filter((m) => m.key !== 'branches')
  .every((m) => m.pct >= 99);
const generatedAt = new Date().toISOString();

const report = `# Krajnje testiranje - izvjestaj

Generisano: ${generatedAt}

## Rezultat

- Statements: ${metrics[0].pct}%
- Lines: ${metrics[1].pct}%
- Functions: ${metrics[2].pct}%
- Branches: ${metrics[3].pct}%

## 99% kriterij

- Pravilo: Statements, Lines i Functions moraju biti >= 99%
- Status: ${pass99 ? 'PROLAZI' : 'NE PROLAZI'}

## Komanda

\`\`\`bash
npm run test:krajnje
\`\`\`

Ova komanda pokrece testove sa coverage i automatski osvjezava ovaj fajl.
`;

fs.writeFileSync(outputPath, report, 'utf8');
console.log(`Generisan izvjestaj: ${outputPath}`);
