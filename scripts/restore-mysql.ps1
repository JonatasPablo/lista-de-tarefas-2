param(
    [Parameter(Mandatory = $true)]
    [string]$BackupFile,

    [string]$EnvPath = "backend\.env"
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

if (!(Test-Path -LiteralPath $BackupFile)) {
    throw "Arquivo de backup nao encontrado: $BackupFile"
}

$envValues = Read-DotEnv -Path $EnvPath
$required = @("DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME")

foreach ($key in $required) {
    if (!$envValues[$key]) {
        throw "Variavel obrigatoria ausente no .env: $key"
    }
}

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

    $createDatabaseArguments = @(
        "--defaults-extra-file=$defaultsFile",
        "-e",
        "CREATE DATABASE IF NOT EXISTS ``$($envValues.DB_NAME)`` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    )

    $createProcess = Start-Process -FilePath "mysql" `
        -ArgumentList $createDatabaseArguments `
        -NoNewWindow `
        -Wait `
        -PassThru

    if ($createProcess.ExitCode -ne 0) {
        throw "mysql falhou ao criar database com codigo $($createProcess.ExitCode)"
    }

    $restoreArguments = @(
        "--defaults-extra-file=$defaultsFile",
        $envValues.DB_NAME
    )

    $restoreProcess = Start-Process -FilePath "mysql" `
        -ArgumentList $restoreArguments `
        -NoNewWindow `
        -Wait `
        -PassThru `
        -RedirectStandardInput $BackupFile

    if ($restoreProcess.ExitCode -ne 0) {
        throw "mysql restore falhou com codigo $($restoreProcess.ExitCode)"
    }

    Write-Host "Backup restaurado em $($envValues.DB_NAME): $BackupFile"
} finally {
    Remove-Item -LiteralPath $defaultsFile -Force -ErrorAction SilentlyContinue
}
