$log = "FalconV2-AuditLog.txt"
Get-Process | Out-File -Append $log
Write-Output "[$(Get-Date)] Auditoria registrada com sucesso." | Out-File -Append $log