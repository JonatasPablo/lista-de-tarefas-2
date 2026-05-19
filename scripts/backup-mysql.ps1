param(
    [string]$EnvPath = "backend\.env",
    [string]$BackupDirectory = "backups\mysql"
)

$ErrorActionPreference = "Stop"

function Read-DotEnv {
    param([string]$Path)

    if (!(Test-Path -LiteralPath $Path)) {
        throw "Arquivo .env nao encontrado: $Path"
    }

    $values = @{}

    Get-Content -LiteralPath $Path | ForEach-Object {
        $line = $_.Trim()

        if (!$line -or $line.StartsWith("#") -or !$line.Contains("=")) {
            return
        }

        $name, $value = $line.Split("=", 2)
        $values[$name.Trim()] = $value.Trim().Trim('"').Trim("'")
    }

    return $values
}

$envValues = Read-DotEnv -Path $EnvPath
$required = @("DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME")

foreach ($key in $required) {
    if (!$envValues[$key]) {
        throw "Variavel obrigatoria ausente no .env: $key"
    }
}

New-Item -ItemType Directory -Force -Path $BackupDirectory | Out-Null

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupFile = Join-Path $BackupDirectory "$($envValues.DB_NAME)-$timestamp.sql"
$defaultsFile = New-TemporaryFile

try {
    @"
[client]
host=$($envValues.DB_HOST)
port=$($envValues.DB_PORT)
user=$($envValues.DB_USER)
password=$($envValues.DB_PASSWORD)
default-character-set=utf8mb4
"@ | Set-Content -LiteralPath $defaultsFile -Encoding ASCII

    $arguments = @(
        "--defaults-extra-file=$defaultsFile",
        "--single-transaction",
        "--routines",
        "--triggers",
        "--events",
        "--hex-blob",
        $envValues.DB_NAME
    )

    $process = Start-Process -FilePath "mysqldump" `
        -ArgumentList $arguments `
        -NoNewWindow `
        -Wait `
        -PassThru `
        -RedirectStandardOutput $backupFile

    if ($process.ExitCode -ne 0) {
        throw "mysqldump falhou com codigo $($process.ExitCode)"
    }

    Write-Host "Backup criado: $backupFile"
} finally {
    Remove-Item -LiteralPath $defaultsFile -Force -ErrorAction SilentlyContinue
}
