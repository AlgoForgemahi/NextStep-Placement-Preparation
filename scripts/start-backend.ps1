param([string]$Maven = 'mvn')
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$configFile = Join-Path $projectRoot '.env'
if (-not (Test-Path -LiteralPath $configFile)) { throw 'Copy .env.example to .env and configure PostgreSQL first.' }
Get-Content -LiteralPath $configFile | ForEach-Object {
  if ($_ -match '^\s*([A-Z_]+)=(.*)$') { [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process') }
}
Push-Location (Join-Path $projectRoot 'backend')
try { & $Maven spring-boot:run; if ($LASTEXITCODE -ne 0) { throw 'Backend startup failed. See the error above.' } }
finally { Pop-Location }
