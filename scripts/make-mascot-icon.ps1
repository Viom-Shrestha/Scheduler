# Renders The Deck's header mascot (components/Mascot.tsx's HeaderMascot,
# a fanned deck of cards with a bird face) into scripts/mascot.ico, drawn
# directly with GDI+ from the same coordinates/colors as the React
# component. Re-run this if the mascot's design ever changes.

Add-Type -AssemblyName System.Drawing

function New-RoundedRectPath {
    param([double]$x, [double]$y, [double]$w, [double]$h, [double]$r)
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = $r * 2
    $path.AddArc($x, $y, $d, $d, 180, 90)
    $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
    $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
    $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
    $path.CloseFigure()
    return $path
}

function Draw-CardOnGraphics {
    param($g, [double]$x, [double]$y, [double]$w, [double]$h, [double]$r, [double]$angle, $color)
    $cx = $x + $w / 2
    $cy = $y + $h / 2
    $state = $g.Save()
    $g.TranslateTransform($cx, $cy)
    $g.RotateTransform($angle)
    $g.TranslateTransform(- $w / 2, - $h / 2)
    $path = New-RoundedRectPath 0 0 $w $h $r
    $brush = New-Object System.Drawing.SolidBrush($color)
    $g.FillPath($brush, $path)
    $brush.Dispose(); $path.Dispose()
    $g.Restore($state)
}

function Draw-Mascot {
    param([int]$canvasSize)

    $bmp = New-Object System.Drawing.Bitmap($canvasSize, $canvasSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    # backdrop: rounded square in the app's own background lavender
    $bg = [System.Drawing.Color]::FromArgb(255, 0xF0, 0xEF, 0xFA)
    $backdropPath = New-RoundedRectPath 0 0 $canvasSize $canvasSize ($canvasSize * 0.2)
    $bgBrush = New-Object System.Drawing.SolidBrush($bg)
    $g.FillPath($bgBrush, $backdropPath)
    $bgBrush.Dispose(); $backdropPath.Dispose()

    # mascot is authored on a 116x104 box (see components/Mascot.tsx) -
    # scale + center it inside the backdrop
    $scale = ($canvasSize * 0.76) / 116.0
    $offX = ($canvasSize - 116 * $scale) / 2.0
    $offY = ($canvasSize - 104 * $scale) / 2.0 + ($canvasSize * 0.03)

    $yellow = [System.Drawing.Color]::FromArgb(255, 0xFF, 0xD2, 0x3F)
    $pink = [System.Drawing.Color]::FromArgb(255, 0xFF, 0x7E, 0xB6)
    $ink = [System.Drawing.Color]::FromArgb(255, 0x24, 0x1F, 0x45)
    $cheek = [System.Drawing.Color]::FromArgb(255, 0xFF, 0xC2, 0xDA)
    $blue = [System.Drawing.Color]::FromArgb(255, 0x2F, 0xA9, 0xF5)

    # 1. decorative dot
    $dotBrush = New-Object System.Drawing.SolidBrush($yellow)
    $g.FillEllipse($dotBrush, $offX + 6 * $scale, $offY + 10 * $scale, 18 * $scale, 18 * $scale)
    $dotBrush.Dispose()

    # 2 & 3. the two back cards of the fan
    Draw-CardOnGraphics $g ($offX + 0 * $scale) ($offY + 30 * $scale) (58 * $scale) (70 * $scale) (18 * $scale) -13 $yellow
    Draw-CardOnGraphics $g ($offX + 16 * $scale) ($offY + 30 * $scale) (58 * $scale) (70 * $scale) (18 * $scale) -5 $pink

    # 4. the front (face) card, and its face, drawn in its own rotated frame
    $faceW = 60 * $scale; $faceH = 72 * $scale
    $faceX = $offX + 34 * $scale; $faceY = $offY + 32 * $scale
    $cx = $faceX + $faceW / 2; $cy = $faceY + $faceH / 2
    $state = $g.Save()
    $g.TranslateTransform($cx, $cy)
    $g.RotateTransform(7)
    $g.TranslateTransform(- $faceW / 2, - $faceH / 2)

    $facePath = New-RoundedRectPath 0 0 $faceW $faceH (18 * $scale)
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.FillPath($whiteBrush, $facePath)
    $whiteBrush.Dispose(); $facePath.Dispose()

    $inkBrush = New-Object System.Drawing.SolidBrush($ink)
    $eyeW = 7 * $scale; $eyeH = 10 * $scale; $eyeGap = 14 * $scale
    $eyeStartX = ($faceW - ($eyeW * 2 + $eyeGap)) / 2
    $eyeY = 24 * $scale
    $g.FillEllipse($inkBrush, $eyeStartX, $eyeY, $eyeW, $eyeH)
    $g.FillEllipse($inkBrush, $eyeStartX + $eyeW + $eyeGap, $eyeY, $eyeW, $eyeH)

    $beakW = 20 * $scale; $beakH = 10 * $scale
    $beakX = ($faceW - $beakW) / 2
    $beakY = $eyeY + $eyeH + 5 * $scale
    $penWidth = [Math]::Max(1.2, 2.5 * $scale)
    $pen = New-Object System.Drawing.Pen($ink, $penWidth)
    $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $g.DrawArc($pen, $beakX, ($beakY - $beakH * 0.5), $beakW, $beakH * 1.6, 25, 130)
    $pen.Dispose()

    $cheekBrush = New-Object System.Drawing.SolidBrush($cheek)
    $cheekW = 11 * $scale; $cheekH = 6 * $scale; $cheekGap = 21 * $scale
    $cheekStartX = ($faceW - ($cheekW * 2 + $cheekGap)) / 2
    $cheekY = $beakY + $beakH + 3 * $scale
    $g.FillEllipse($cheekBrush, $cheekStartX, $cheekY, $cheekW, $cheekH)
    $g.FillEllipse($cheekBrush, $cheekStartX + $cheekW + $cheekGap, $cheekY, $cheekW, $cheekH)
    $cheekBrush.Dispose(); $inkBrush.Dispose()

    $g.Restore($state)

    # 5. sparkle badge (same 8-point star as lib/colors.ts GLYPH.star)
    $sx = $offX + 100 * $scale; $sy = $offY + 0 * $scale; $ss = 14 * $scale
    $starBrush = New-Object System.Drawing.SolidBrush($blue)
    $pts = @(
        [System.Drawing.PointF]::new($sx + 0.50 * $ss, $sy + 0.00 * $ss),
        [System.Drawing.PointF]::new($sx + 0.61 * $ss, $sy + 0.39 * $ss),
        [System.Drawing.PointF]::new($sx + 1.00 * $ss, $sy + 0.50 * $ss),
        [System.Drawing.PointF]::new($sx + 0.61 * $ss, $sy + 0.61 * $ss),
        [System.Drawing.PointF]::new($sx + 0.50 * $ss, $sy + 1.00 * $ss),
        [System.Drawing.PointF]::new($sx + 0.39 * $ss, $sy + 0.61 * $ss),
        [System.Drawing.PointF]::new($sx + 0.00 * $ss, $sy + 0.50 * $ss),
        [System.Drawing.PointF]::new($sx + 0.39 * $ss, $sy + 0.39 * $ss)
    )
    $g.FillPolygon($starBrush, $pts)
    $starBrush.Dispose()

    $g.Dispose()
    return $bmp
}

function New-IcoFile {
    param([string]$outputPath, [int[]]$sizes)

    $images = @()
    foreach ($size in $sizes) {
        $bmp = Draw-Mascot -canvasSize $size
        $ms = New-Object System.IO.MemoryStream
        $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
        $images += , @{ Size = $size; Bytes = $ms.ToArray() }
        $bmp.Dispose(); $ms.Dispose()
    }

    $fs = New-Object System.IO.FileStream($outputPath, [System.IO.FileMode]::Create)
    $bw = New-Object System.IO.BinaryWriter($fs)

    $bw.Write([UInt16]0)
    $bw.Write([UInt16]1)
    $bw.Write([UInt16]$images.Count)

    $offset = 6 + (16 * $images.Count)
    foreach ($img in $images) {
        $sizeByte = if ($img.Size -ge 256) { 0 } else { $img.Size }
        $bw.Write([Byte]$sizeByte)
        $bw.Write([Byte]$sizeByte)
        $bw.Write([Byte]0)
        $bw.Write([Byte]0)
        $bw.Write([UInt16]1)
        $bw.Write([UInt16]32)
        $bw.Write([UInt32]$img.Bytes.Length)
        $bw.Write([UInt32]$offset)
        $offset += $img.Bytes.Length
    }
    foreach ($img in $images) {
        $bw.Write($img.Bytes)
    }

    $bw.Flush(); $bw.Close(); $fs.Close()
}

$outPath = Join-Path $PSScriptRoot "mascot.ico"
New-IcoFile -outputPath $outPath -sizes @(16, 32, 48, 256)
Write-Host "Mascot icon written to $outPath"
