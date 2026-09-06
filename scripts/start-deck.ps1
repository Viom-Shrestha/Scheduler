# Starts The Deck's production server if it isn't already running, opens
# it in an isolated Edge "app" window, and - once that window is closed -
# stops the server. Launched hidden via start-deck.vbs (the actual Desktop
# shortcut target), so nothing appears in the taskbar.
#
# The Edge window gets its own --user-data-dir instead of your normal
# profile. Two reasons: it keeps this app-mode window from interfering
# with your regular browsing, and - the important part - it guarantees the
# msedge.exe process we launch is the real, whole browser instance for
# that window rather than a stub that just forwards to an already-running
# Edge and exits immediately. That's what makes "wait for it to close"
# below actually correspond to you closing the window.

$deckPort = 4278
$projectDir = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$edgeProfileDir = Join-Path $env:LOCALAPPDATA "TheDeckEdgeProfile"
$outLog = Join-Path $PSScriptRoot "server.log"
$errLog = Join-Path $PSScriptRoot "server.err.log"

function Test-DeckPort {
    try {
        $client = New-Object System.Net.Sockets.TcpClient
        $client.Connect("127.0.0.1", $deckPort)
        $client.Close()
        return $true
    } catch {
        return $false
    }
}

Set-Location $projectDir

$weStartedServer = $false
$serverProcess = $null

if (-not (Test-DeckPort)) {
    $weStartedServer = $true

    if (-not (Test-Path (Join-Path $projectDir ".next\BUILD_ID"))) {
        & npm run build | Out-Null
    }

    $serverProcess = Start-Process -FilePath "cmd.exe" `
        -ArgumentList "/c", "npm run start -- -p $deckPort" `
        -WorkingDirectory $projectDir `
        -WindowStyle Hidden `
        -RedirectStandardOutput $outLog `
        -RedirectStandardError $errLog `
        -PassThru

    while (-not (Test-DeckPort)) {
        Start-Sleep -Milliseconds 500
    }
}

$edgeArgs = @(
    "--app=http://localhost:$deckPort",
    "--user-data-dir=$edgeProfileDir",
    "--window-size=1400,900",
    "--no-first-run",
    "--no-default-browser-check"
)

if ($weStartedServer) {
    # Block here for as long as the app window is open.
    Start-Process -FilePath "msedge" -ArgumentList $edgeArgs -Wait
    if ($serverProcess -and -not $serverProcess.HasExited) {
        & taskkill /PID $serverProcess.Id /T /F | Out-Null
    }
} else {
    # The server was already running (e.g. another Deck window is open) -
    # just open another window onto it; don't tear down a server that
    # window might still need.
    Start-Process -FilePath "msedge" -ArgumentList $edgeArgs
}
