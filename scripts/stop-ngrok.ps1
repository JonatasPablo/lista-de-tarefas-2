$ErrorActionPreference = "Stop"

$NgrokUrl = "rumbling-stopper-rumbling.ngrok-free.dev"
$LocalPort = "3001"

Get-CimInstance Win32_Process |
    Where-Object {
        $_.Name -like "ngrok*" -and
        (
            $_.CommandLine -like "*$NgrokUrl*" -or
            $_.CommandLine -like "*http*$LocalPort*"
        )
    } |
    ForEach-Object {
        Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
    }
