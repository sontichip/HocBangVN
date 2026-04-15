param(
    [switch]$FixTrackedEnv
)

$ErrorActionPreference = 'Stop'

Write-Host '== Safe Push Check ==' -ForegroundColor Cyan

# 1) Block if .env files are tracked
$trackedEnv = git ls-files ".env" "*.env" "php-backend/.env" "server/.env"
if ($trackedEnv) {
    Write-Host 'Tracked env files detected:' -ForegroundColor Red
    $trackedEnv | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }

    if ($FixTrackedEnv) {
        Write-Host 'Removing tracked env files from git index...' -ForegroundColor Yellow
        git rm --cached -r .env *.env php-backend/.env server/.env 2>$null
    } else {
        throw 'Stop push: remove env files from git tracking first. Re-run with -FixTrackedEnv if needed.'
    }
}

# 2) Lightweight secret pattern scan on tracked files
$patterns = @(
    'AIza[0-9A-Za-z\-_]{20,}',
    'sk-[A-Za-z0-9\-_]{20,}',
    'xox[baprs]-[A-Za-z0-9-]{10,}'
)

$hasLeak = $false
foreach ($pattern in $patterns) {
    $result = git grep -n -I -E $pattern -- . ':!*.png' ':!*.jpg' ':!*.jpeg' ':!*.webp' ':!*.gif' ':!*.mp3' ':!*.wav'
    if ($result) {
        $hasLeak = $true
        Write-Host "Potential secret pattern found ($pattern):" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
    }
}

if ($hasLeak) {
    throw 'Stop push: potential secret(s) found. Rotate and remove before push.'
}

# 3) Show concise status reminder
Write-Host ''
Write-Host 'Git status summary:' -ForegroundColor Cyan
git status --short

Write-Host ''
Write-Host 'Safe checks passed. You can push now.' -ForegroundColor Green
