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
        
        # Remove CSS
        $content = $content -replace '(?s)  <link rel="stylesheet" href="css/home-redesign.css" />\n?', ''
        $content = $content -replace '(?s)  <link rel="stylesheet" href="css/home-redesign.css" />\r\n?', ''
        
        # Remove class from body
        $content = $content -replace '<body class="dark-theme redesign-active">', '<body class="dark-theme">'
        $content = $content -replace '<body class="redesign-active">', '<body>'

        [System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
        Write-Host "Reverted $file"
    } else {
        Write-Host "File $file not found!"
    }
}
