# Creates a "The Deck" shortcut on the Desktop that launches the app
# silently in the background and opens it in an app-style Edge window.
# Re-run this any time the project folder moves.

$desktop = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktop "The Deck.lnk"
$projectDir = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$vbsPath = Join-Path $projectDir "scripts\start-deck.vbs"
$iconPath = Join-Path $projectDir "scripts\mascot.ico"

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($shortcutPath)
$Shortcut.TargetPath = Join-Path $env:WINDIR "System32\wscript.exe"
$Shortcut.Arguments = "`"$vbsPath`""
$Shortcut.WorkingDirectory = $projectDir
$Shortcut.IconLocation = $iconPath
$Shortcut.Description = "Launch The Deck"
$Shortcut.Save()

Write-Host "Shortcut created at $shortcutPath"
