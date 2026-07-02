# Restore HTML files from ZIP backup
$src = "c:\Users\Admin\Downloads\temp_extract\doan-lang-nghe"
$dst = "c:\Users\Admin\Downloads\doan-lang-nghe (1)\doan-lang-nghe"

# Files that exist in the backup ZIP
$backupFiles = @(
    "artisan-video.html",
    "game.html",
    "history-chapter.html",
    "leaderboard.html",
    "lobby.html",
    "result.html"
)

foreach ($f in $backupFiles) {
    $srcPath = Join-Path $src $f
    $dstPath = Join-Path $dst $f
    if (Test-Path $srcPath) {
        Copy-Item -Path $srcPath -Destination $dstPath -Force
        Write-Host "Restored $f from backup"
    } else {
        Write-Host "WARNING: $f not found in backup!"
    }
}

Write-Host "`nDone restoring files from backup."
