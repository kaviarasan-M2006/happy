# PowerShell script to package the Birthday Universe project, excluding node_modules and builds

$src = "C:\Users\KAVIARASAN\.gemini\antigravity\scratch\birthday-universe"
$tempDest = "C:\Users\KAVIARASAN\.gemini\antigravity\scratch\birthday-universe-temp"
$zipPath = "C:\Users\KAVIARASAN\.gemini\antigravity\brain\f01a2dd0-7169-4189-ac21-6707f6eccbc0\birthday-universe.zip"

Write-Output "Preparing temporary folder..."
if (Test-Path $tempDest) {
    Remove-Item -Recurse -Force $tempDest
}
New-Item -ItemType Directory -Path $tempDest | Out-Null

Write-Output "Copying source files..."
# Copy all directories and files, excluding node_modules, dist, temp folder
Get-ChildItem -Path $src | Where-Object { $_.Name -ne "node_modules" -and $_.Name -ne "dist" -and $_.Name -ne "birthday-universe-temp" } | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination $tempDest -Recurse -Force
}

Write-Output "Compressing archive to artifact directory..."
if (Test-Path $zipPath) {
    Remove-Item -Force $zipPath
}
Compress-Archive -Path "$tempDest\*" -DestinationPath $zipPath -Force

Write-Output "Cleaning up temporary folder..."
Remove-Item -Recurse -Force $tempDest

Write-Output "SUCCESS: Package generated at $zipPath"
