$logFile = "C:\falcon_v2\logs\$(Get-Date -Format yyyy-MM-dd).log"
$message = "Falcon V2 Status Check: $(Get-Date)"
Add-Content -Path $logFile -Value $message