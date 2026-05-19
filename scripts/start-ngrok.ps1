$ErrorActionPreference = "Stop"

$NgrokUrl = "rumbling-stopper-rumbling.ngrok-free.dev"
$LocalPort = "3001"
$LogDirectory = Join-Path $PSScriptRoot "..\logs"
$OutLog = Join-Path $LogDirectory "ngrok-out.log"
$ErrLog = Join-Path $LogDirectory "ngrok-err.log"

New-Item -ItemType Directory -Force -Path $LogDirectory | Out-Null

$existingNgrok = Get-CimInstance Win32_Process |
    Where-Object {
        $_.Name -like "ngrok*" -and
        (
            $_.CommandLine -like "*$NgrokUrl*" -or
            $_.CommandLine -like "*http*$LocalPort*"
        )
    } |
    Select-Object -First 1

if ($existingNgrok) {
    "ngrok ja esta rodando. PID: $($existingNgrok.ProcessId)" |
        Out-File -FilePath $OutLog -Append -Encoding utf8
    exit 0
}

Start-Process `
    -FilePath "ngrok.exe" `
    -ArgumentList @("http", "--url=$NgrokUrl", $LocalPort) `
    -WindowStyle Hidden `
    -RedirectStandardOutput $OutLog `
    -RedirectStandardError $ErrLog
