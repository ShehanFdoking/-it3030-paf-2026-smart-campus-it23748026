param(
    [int]$Port = 8081
)

$envFilePath = Join-Path $PSScriptRoot ".env"
if (Test-Path $envFilePath) {
    Get-Content $envFilePath | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
            $parts = $line.Split("=", 2)
            $name = $parts[0].Trim()
            $value = $parts[1].Trim().Trim('"')
            if (-not [string]::IsNullOrWhiteSpace($name)) {
                [Environment]::SetEnvironmentVariable($name, $value, "Process")
            }
        }
    }
}

if ([string]::IsNullOrWhiteSpace($env:GOOGLE_CLIENT_ID)) {
    Write-Error "GOOGLE_CLIENT_ID is required in backend/.env"
    exit 1
}

Set-Location $PSScriptRoot
mvn spring-boot:run "-Dspring-boot.run.arguments=--server.port=$Port"
