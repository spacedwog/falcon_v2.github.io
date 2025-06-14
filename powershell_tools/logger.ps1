$logDir = "C:\falcon_v2\logs"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

$logFile = Join-Path $logDir "$(Get-Date -Format yyyy-MM-dd).log"
$message = "Falcon V2 Status Check: $(Get-Date -Format 'u')"
Add-Content -Path $logFile -Value $message