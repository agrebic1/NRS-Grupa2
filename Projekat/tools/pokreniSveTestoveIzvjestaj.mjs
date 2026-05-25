import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const rootDir = process.cwd();
const docsTestingDir = path.join(rootDir, 'docs', 'testing');
const reportsRootDir = path.join(docsTestingDir, 'Izvjestaji');

function pad(value) {
  return String(value).padStart(2, '0');
}

function timestampForFolder(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
}

function runCommand(command, args) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    encoding: 'utf8',
    shell: true,
    env: process.env,
  });

  return {
    exitCode: result.status ?? 1,
    output: `${result.stdout ?? ''}${result.stderr ?? ''}`,
  };
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function parseJestCountForMarker(output, marker) {
  let lastTestsCount = null;

  for (const line of output.split(/\r?\n/)) {
    const testsMatch = line.match(/Tests:\s+(\d+)\s+passed,\s+(\d+)\s+total/);
    if (testsMatch) {
      lastTestsCount = {
        passed: Number(testsMatch[1]),
        total:  Number(testsMatch[2]),
      };
    }

    if (line.includes('Ran all test suites matching') && line.includes(marker)) {
      return lastTestsCount;
    }
  }

  return null;
}

function parseLastJestCount(output) {
  const matches = [...output.matchAll(/Tests:\s+(\d+)\s+passed,\s+(\d+)\s+total/g)];
  const last = matches.at(-1);
  if (!last) return null;

  return {
    passed: Number(last[1]),
    total:  Number(last[2]),
  };
}

function parsePlaywrightCount(output) {
  const counts = { passed: 0, failed: 0, skipped: 0 };
  for (const match of output.matchAll(/^\s*(\d+)\s+(passed|failed|skipped)\b/gm)) {
    counts[match[2]] += Number(match[1]);
  }

  const total = counts.passed + counts.failed + counts.skipped;
  return total > 0 ? { ...counts, total } : null;
}

function formatCount(count) {
  if (!count) return 'nije dostupno';
  if ('failed' in count || 'skipped' in count) {
    const details = [];
    if (count.failed) details.push(`${count.failed} failed`);
    if (count.skipped) details.push(`${count.skipped} skipped`);
    const suffix = details.length > 0 ? ` (${details.join(', ')})` : '';
    return `${count.passed}/${count.total} passed${suffix}`;
  }
  return `${count.passed}/${count.total} passed`;
}

const startedAt = new Date();
const runId = timestampForFolder(startedAt);
const runDir = path.join(reportsRootDir, runId);
ensureDir(runDir);

const steps = [
  { id: 'unit_integration', label: 'Unit + Integration', command: 'npm', args: ['run', 'test'] },
  { id: 'coverage', label: 'Coverage', command: 'npm', args: ['run', 'test:coverage'] },
  { id: 'e2e', label: 'E2E', command: 'npm', args: ['run', 'test:e2e'] },
];

const sprintBreakdown = [
  'Sprint 5: auth/RBAC osnova, registracija, prijava, odjava, sesija, role redirect i kontrola pristupa.',
  'Sprint 6: korisnicki zahtjevi, admin kreiranje korisnika, onboarding partnera i premium tokovi.',
  'Sprint 7: dispecerski dashboard, liste, detalj intervencije, carobnjak, operativni prioritet, statusi i RBAC API provjere.',
  'Sprint 8: serviserski modul — dodjela, prihvatanje/odbijanje zadatka, statusni prelazi, evidencija rada, napomene, zatvaranje intervencije i RBAC provjere.',
  'Sprint 9: preraspodjela (US-28/29/40), obavezno trajanje, audit trail, SLA, izvjestaj odziva, upload slika i regresija API testova.',
];

const sprint7AddedTests = {
  automatic: 42,
  manual:    26,
  note:      'Automatski zbir je porastao sa 69 u Sprintu 6 na 111 u Sprintu 7.',
};

const sprint8AddedTests = {
  automatic: 63,
  manual:    20,
  note:      'Automatski zbir je porastao sa 111 u Sprintu 7 na 174 u Sprintu 8 (3 unit + 3 integration + 2 E2E fajla).',
};

const sprint9AddedTests = {
  automatic: 61,
  manual:    80,
  manualId:  'SB-09-36',
  note:      'Jest zbir 286 (225→286). E2E 23/23. Manuelno 80 TC (TC-S9-01–80) iz QA-Sprint9NRS.xlsx.',
};

const results = [];
let overallSuccess = true;

for (const step of steps) {
  const res = runCommand(step.command, step.args);
  results.push({ ...step, ...res });
  fs.writeFileSync(path.join(runDir, `${step.id}.log`), res.output, 'utf8');

  if (res.exitCode !== 0) {
    overallSuccess = false;
    break;
  }
}

const coverageSummaryPath = path.join(rootDir, 'coverage', 'coverage-summary.json');
let coverage = null;

if (fs.existsSync(coverageSummaryPath)) {
  const raw = fs.readFileSync(coverageSummaryPath, 'utf8');
  coverage = JSON.parse(raw)?.total ?? null;
  fs.copyFileSync(coverageSummaryPath, path.join(runDir, 'coverage-summary.json'));
}

const unitIntegrationResult = results.find((result) => result.id === 'unit_integration');
const coverageResult = results.find((result) => result.id === 'coverage');
const e2eResult = results.find((result) => result.id === 'e2e');

const testCounts = {
  unit:       parseJestCountForMarker(unitIntegrationResult?.output ?? '', 'unit'),
  integration: parseJestCountForMarker(unitIntegrationResult?.output ?? '', 'integration'),
  coverage:  parseLastJestCount(coverageResult?.output ?? ''),
  e2e:       parsePlaywrightCount(e2eResult?.output ?? ''),
};

const finishedAt = new Date();

const summaryLines = [
  '# Izvjestaj automatskog testiranja',
  '',
  `- Pokrenuto: ${startedAt.toISOString()}`,
  `- Zavrseno: ${finishedAt.toISOString()}`,
  `- Run ID: ${runId}`,
  `- Status: ${overallSuccess ? 'PASS' : 'FAIL'}`,
  '',
  '## Izvrsene provjere',
  '',
];

for (const result of results) {
  summaryLines.push(
    `- ${result.label}: ${result.exitCode === 0 ? 'PASS' : 'FAIL'} (exit code ${result.exitCode})`
  );
}

summaryLines.push(
  '',
  '## Podjela po sprintovima',
  '',
  ...sprintBreakdown.map((line) => `- ${line}`),
  '',
  '## Dodano u Sprintu 7',
  '',
  `- Automatski testovi: +${sprint7AddedTests.automatic} (${sprint7AddedTests.note})`,
  `- Manuelni test scenariji: +${sprint7AddedTests.manual} za SB-07-35`,
  '',
  '## Dodano u Sprintu 8',
  '',
  `- Automatski testovi: +${sprint8AddedTests.automatic} (${sprint8AddedTests.note})`,
  `- Manuelni test scenariji: +${sprint8AddedTests.manual} za SB-08-01`,
  '',
  '## Dodano u Sprintu 9',
  '',
  `- Automatski testovi: +${sprint9AddedTests.automatic} (${sprint9AddedTests.note})`,
  `- Manuelni test scenariji: +${sprint9AddedTests.manual} za \`${sprint9AddedTests.manualId}\` (TC/EXEC u \`docs/testing/${sprint9AddedTests.manualId}/\`)`,
  '',
  '## Broj pokrenutih testova',
  '',
  `- Unit testovi: ${formatCount(testCounts.unit)}`,
  `- Integration testovi: ${formatCount(testCounts.integration)}`,
  `- Coverage run: ${formatCount(testCounts.coverage)}`,
  `- E2E testovi: ${formatCount(testCounts.e2e)}`
);

summaryLines.push('', '## Pokrivenost');

if (coverage) {
  summaryLines.push(
    '',
    `- Statements: ${coverage.statements?.pct ?? 0}%`,
    `- Branches: ${coverage.branches?.pct ?? 0}%`,
    `- Functions: ${coverage.functions?.pct ?? 0}%`,
    `- Lines: ${coverage.lines?.pct ?? 0}%`
  );
} else {
  summaryLines.push('', '- Coverage summary nije dostupan.');
}

summaryLines.push(
  '',
  '## Artefakti',
  '',
  '- `unit_integration.log`',
  '- `coverage.log`',
  '- `e2e.log`',
  '- `coverage-summary.json` (ako postoji)',
  '',
  'Napomena: ovaj folder sadrzi sve sto je testirano u ovom pokretanju.'
);

fs.writeFileSync(path.join(runDir, 'IZVJESTAJ.md'), `${summaryLines.join('\n')}\n`, 'utf8');

const latestPointerPath = path.join(reportsRootDir, 'ZADNJI_RUN.txt');
fs.writeFileSync(
  latestPointerPath,
  [
    `Zadnji run: ${runId}`,
    `Lokacija: docs/testing/Izvjestaji/${runId}`,
    `Status: ${overallSuccess ? 'PASS' : 'FAIL'}`,
    'Sprint 5: auth/RBAC osnova',
    'Sprint 6: korisnicki/admin/premium tokovi',
    'Sprint 7: dispecerski operativni tok',
    `Dodano u Sprintu 7: +${sprint7AddedTests.automatic} automatska testa; +${sprint7AddedTests.manual} manuelnih scenarija`,
    'Sprint 8: serviserski modul i zatvaranje intervencije',
    `Dodano u Sprintu 8: +${sprint8AddedTests.automatic} automatska testa; +${sprint8AddedTests.manual} manuelnih scenarija`,
    'Sprint 9: preraspodjela, SLA, izvjestaj odziva, upload slika',
    `Dodano u Sprintu 9: +${sprint9AddedTests.automatic} automatska testa; +${sprint9AddedTests.manual} manuelnih scenarija (${sprint9AddedTests.manualId})`,
    `Unit testovi: ${formatCount(testCounts.unit)}`,
    `Integration testovi: ${formatCount(testCounts.integration)}`,
    `Coverage run: ${formatCount(testCounts.coverage)}`,
    `E2E testovi: ${formatCount(testCounts.e2e)}`,
    '',
  ].join('\n'),
  'utf8'
);

console.log(`Izvjestaj generisan u: ${path.join('docs', 'testing', 'Izvjestaji', runId)}`);

if (!overallSuccess) {
  process.exit(1);
}
