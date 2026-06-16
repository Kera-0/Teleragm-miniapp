param(
    [string]$BotToken = $env:BOT_TOKEN,
    [string]$MiniAppUrl = $env:MINI_APP_URL,
    [string]$ButtonText = $env:TELEGRAM_MENU_BUTTON_TEXT,
    [string]$EnvFile = ".env",
    [long]$ChatId = 0
)

$ErrorActionPreference = "Stop"

function Get-EnvFileValue {
    param(
        [string]$Path,
        [string]$Name
    )

    if (-not (Test-Path -LiteralPath $Path)) {
        return $null
    }

    $line = Get-Content -LiteralPath $Path |
        Where-Object { $_ -match "^\s*$Name\s*=" } |
        Select-Object -First 1

    if (-not $line) {
        return $null
    }

    return ($line -replace "^\s*$Name\s*=\s*", "").Trim().Trim('"').Trim("'")
}

if (-not $BotToken) {
    $BotToken = Get-EnvFileValue -Path $EnvFile -Name "BOT_TOKEN"
}

if (-not $MiniAppUrl) {
    $MiniAppUrl = Get-EnvFileValue -Path $EnvFile -Name "MINI_APP_URL"
}

if (-not $ButtonText) {
    $ButtonText = Get-EnvFileValue -Path $EnvFile -Name "TELEGRAM_MENU_BUTTON_TEXT"
}

if (-not $ButtonText) {
    $ButtonText = "Open shop"
}

if (-not $BotToken -or $BotToken -eq "your_telegram_bot_token_here" -or $BotToken -eq "your_telegram_bot_token") {
    throw "BOT_TOKEN is missing or still contains a placeholder. Put the real token in .env or pass -BotToken."
}

if (-not $MiniAppUrl) {
    throw "MINI_APP_URL is missing. Pass -MiniAppUrl https://your-domain.com or set MINI_APP_URL in .env."
}

if ($MiniAppUrl -notmatch "^https://") {
    throw "Mini App URL must start with https:// for Telegram production use. Current value: $MiniAppUrl"
}

if ($MiniAppUrl -match "localhost|127\.0\.0\.1|0\.0\.0\.0") {
    throw "Telegram cannot open a local URL. Deploy the frontend to a public HTTPS domain first."
}

if ($ButtonText.Length -lt 1 -or $ButtonText.Length -gt 64) {
    throw "Button text must be between 1 and 64 characters."
}

$apiBase = "https://api.telegram.org/bot$BotToken"

$botInfo = Invoke-RestMethod -Uri "$apiBase/getMe" -Method Get
if (-not $botInfo.ok) {
    throw "Telegram getMe failed."
}

$menuButton = @{
    type = "web_app"
    text = $ButtonText
    web_app = @{
        url = $MiniAppUrl
    }
}

$payload = @{
    menu_button = $menuButton
}

if ($ChatId -ne 0) {
    $payload.chat_id = $ChatId
}

$body = $payload | ConvertTo-Json -Depth 8
$result = Invoke-RestMethod -Uri "$apiBase/setChatMenuButton" -Method Post -ContentType "application/json" -Body $body

if (-not $result.ok -or -not $result.result) {
    throw "Telegram setChatMenuButton failed."
}

$scope = if ($ChatId -ne 0) { "chat $ChatId" } else { "all private chats with the bot" }
Write-Host "Published Mini App menu button for @$($botInfo.result.username) ($scope)."
Write-Host "Button: $ButtonText"
Write-Host "URL: $MiniAppUrl"
