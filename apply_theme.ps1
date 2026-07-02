$files = @(
    "lobby.html",
    "game.html",
    "leaderboard.html",
    "result.html",
    "history-chapter.html",
    "artisan-video.html"
)

$basePath = "c:\Users\Admin\Downloads\doan-lang-nghe (1)\doan-lang-nghe"

foreach ($file in $files) {
    $path = Join-Path $basePath $file
    if (Test-Path $path) {
        $content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
        
        # Add CSS if not present
        if ($content -notmatch "css/home-redesign.css") {
            $content = $content -replace '</head>', "  <link rel=""stylesheet"" href=""css/home-redesign.css"" />`n</head>"
        }
        
        # Add class to body
        if ($content -match '<body class="dark-theme">') {
            $content = $content -replace '<body class="dark-theme">', '<body class="dark-theme redesign-active">'
        } elseif ($content -match '<body>') {
            $content = $content -replace '<body>', '<body class="redesign-active">'
        }

        [System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
        Write-Host "Updated $file"
    } else {
        Write-Host "File $file not found!"
    }
}
