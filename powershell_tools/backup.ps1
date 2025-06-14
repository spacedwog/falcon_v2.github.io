$source = "C:\falcon_v2\data"
$dest = "D:\backups\falcon_v2"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "$dest\backup_$timestamp"
Copy-Item -Path $source -Destination $backupDir -Recurse