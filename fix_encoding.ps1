$files = @("vr360.html", "result.html", "lobby.html", "leaderboard.html", "history-chapter.html", "game.html", "artisans.html", "artisan-video.html")
foreach ($f in $files) {
    $url = "https://doan-lang-nghe-3ywztkfhj-fptanimals-projects.vercel.app/" + $f
    $content = Invoke-RestMethod -Uri $url
    $content = $content -replace '<script src="js/data.js"></script>', '<script type="module" src="js/firebase-auth.js"></script><script src="js/data.js"></script>'
    $path = "c:\Users\Admin\Downloads\doan-lang-nghe (1)\doan-lang-nghe\" + $f
    [System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
    Write-Host "Fixed $f"
}
