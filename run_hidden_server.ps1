# Start Sentinel AI local server silently in the background
# This keeps the server running permanently without keeping a command prompt open

$scriptPath = Join-Path (Get-Location) "server.ps1"

# Start the server.ps1 script inside a hidden PowerShell window
Start-Process powershell -ArgumentList "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$scriptPath`""

Write-Host "Sentinel AI local HTTP server has been launched in a hidden background process."
Write-Host "You can access the app at: http://localhost:8000/"
Write-Host "To stop the server later, open task manager and end the 'PowerShell' process, or run: Stop-Process -Name powershell"
