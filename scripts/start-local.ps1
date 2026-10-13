# Starts the configured local database and the packaged Java backend.
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$runtimeFile = Join-Path $projectRoot '.local/runtime.json'
if (-not (Test-Path $runtimeFile)) { throw 'Local runtime configuration missing. Use README.md to install PostgreSQL, Java 21 and Maven, then scripts/start-backend.ps1.' }
$runtime = Get-Content $runtimeFile -Raw | ConvertFrom-Json
Get-Content (Join-Path $projectRoot '.env') | ForEach-Object {
  if ($_ -match '^([A-Z_]+)=(.*)$') { [Environment]::SetEnvironmentVariable($matches[1],$matches[2],'Process') }
}
if ($env:DATABASE_URL -ne $runtime.databaseUrl) { throw 'Database configuration changed. Start your configured PostgreSQL service, then use start-backend.ps1.' }
# Create fresh files as the account launching this script. Reusing redirected
# logs can fail when an earlier PostgreSQL/Java process still holds them open.
$runId = (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + [Guid]::NewGuid().ToString('N').Substring(0,8)
$logDirectory = Join-Path $projectRoot ('.local/run-' + $runId)
New-Item -ItemType Directory -Path $logDirectory -ErrorAction Stop | Out-Null
$pgctl = Join-Path $runtime.postgresBin 'pg_ctl.exe'
$databaseListening = $false
$probe = New-Object System.Net.Sockets.TcpClient
try {
  $connection = $probe.ConnectAsync('127.0.0.1', 55432)
  $databaseListening = $connection.Wait(2000) -and $probe.Connected
} catch { $databaseListening = $false } finally { $probe.Dispose() }
if (-not $databaseListening) {
  $pgLog = Join-Path $logDirectory 'postgres.log'
  & $pgctl start -D $runtime.postgresData -l $pgLog -o '-h 127.0.0.1 -p 55432' -w
  if ($LASTEXITCODE -ne 0) { throw "PostgreSQL startup failed. See $pgLog" }
}
$backendPort = if ($env:PORT) { $env:PORT } else { '8081' }
$health = "http://127.0.0.1:$backendPort/api/health"
try { $response = Invoke-WebRequest $health -UseBasicParsing -TimeoutSec 2; $running = $response.StatusCode -eq 200 } catch { $running = $false }
if (-not $running) {
  $jar = Join-Path $projectRoot 'backend/target/nextstep-1.0.0.jar'
  if (-not (Test-Path $jar)) { throw 'Build the backend with Java 21 and Maven before starting it.' }
  $backendLog = Join-Path $logDirectory 'backend.log'
  $backendErrorLog = Join-Path $logDirectory 'backend-error.log'
  $backendProcess = Start-Process -FilePath $runtime.java -ArgumentList @('-jar', ('"' + $jar + '"')) -WorkingDirectory $projectRoot -WindowStyle Hidden -RedirectStandardOutput $backendLog -RedirectStandardError $backendErrorLog -PassThru
  for ($attempt = 0; $attempt -lt 45; $attempt++) {
    Start-Sleep -Seconds 1
    if ($backendProcess.HasExited) { throw "Backend exited during startup. See $backendLog and $backendErrorLog" }
    try { $response = Invoke-WebRequest $health -UseBasicParsing -TimeoutSec 1; if ($response.StatusCode -eq 200) { $running = $true; break } } catch {}
  }
  if (-not $running) { throw "Backend did not become ready. See $backendLog and $backendErrorLog" }
}
Write-Host 'Database and backend are ready. Frontend startup can continue at http://127.0.0.1:4174.'
Write-Host "Startup logs: $logDirectory"
Write-Host 'This starts the packaged backend. Rebuild the JAR after changing Java source.'
