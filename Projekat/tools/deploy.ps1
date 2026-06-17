# deploy.ps1 - rucni ekvivalent CD pipeline-a (Windows PowerShell)
# -----------------------------------------------------------------------------
# Ponovljiv deployment kompletnog sistema (frontend + backend + baza) na
# Vercel + Supabase, sa smoke provjerom dostupnosti. Isti koraci kao
# .github/workflows/deploy.yml, za rucno/lokalno pokretanje.
#
# NAPOMENA: fajl je namjerno ASCII-only (bez dijakritika) da bi se ispravno
# izvrsavao i u Windows PowerShell 5.1 (koji .ps1 bez BOM-a cita kao ANSI).
#
# POKRETANJE (iz foldera Projekat/):
#   ./tools/deploy.ps1
#
# PREDUVJETI:
#   - Node.js 20+, Supabase CLI i Vercel CLI instalirani
#   - Postavljene varijable okruzenja (npr. u trenutnoj PowerShell sesiji):
#       $env:SUPABASE_ACCESS_TOKEN = "..."
#       $env:SUPABASE_PROJECT_REF  = "..."
#       $env:SUPABASE_DB_PASSWORD  = "..."
#       $env:VERCEL_TOKEN          = "..."
#       $env:VERCEL_ORG_ID         = "..."
#       $env:VERCEL_PROJECT_ID     = "..."
#       $env:PROD_URL              = "https://nrs-grupa2.vercel.app"
# -----------------------------------------------------------------------------

$ErrorActionPreference = 'Stop'

function Korak($poruka) { Write-Host "`n==> $poruka" -ForegroundColor Cyan }

# Provjera obaveznih varijabli
$obavezne = @(
  'SUPABASE_ACCESS_TOKEN','SUPABASE_PROJECT_REF','SUPABASE_DB_PASSWORD',
  'VERCEL_TOKEN','VERCEL_ORG_ID','VERCEL_PROJECT_ID','PROD_URL'
)
$nedostaju = $obavezne | Where-Object { -not (Test-Path "env:$_") }
if ($nedostaju) {
  Write-Error ("Nedostaju varijable okruzenja: " + ($nedostaju -join ', '))
  exit 1
}

Korak "1/6 Instalacija zavisnosti"
npm ci

Korak "2/6 Quality gate (testovi prije deploya)"
npm test

Korak "3/6 Priprema baze - migracije (Supabase)"
supabase link --project-ref $env:SUPABASE_PROJECT_REF
supabase db push

Korak "4/6 Build aplikacije (frontend + backend, Next.js) na Vercelu"
vercel pull --yes --environment=production --token $env:VERCEL_TOKEN
vercel build --prod --token $env:VERCEL_TOKEN

Korak "5/6 Deploy na produkciju"
vercel deploy --prebuilt --prod --token $env:VERCEL_TOKEN

Korak "6/6 Smoke test (dostupnost aplikacije)"
$odgovor = Invoke-WebRequest -Uri $env:PROD_URL -UseBasicParsing -TimeoutSec 30
if ($odgovor.StatusCode -ge 200 -and $odgovor.StatusCode -lt 400) {
  Write-Host ("Smoke OK - " + $env:PROD_URL + " vraca HTTP " + $odgovor.StatusCode + ". Deployment uspjesan.") -ForegroundColor Green
} else {
  Write-Error ("Smoke FAIL - " + $env:PROD_URL + " vraca HTTP " + $odgovor.StatusCode)
  exit 1
}
