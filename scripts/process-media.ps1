# Borepix media pipeline: grade the MRI hero video pink and extract scroll-scrub frames.
# Run from the borepix-web folder:  powershell -ExecutionPolicy Bypass -File scripts/process-media.ps1 -Source "C:\path\to\MRI scene.mp4"
#
# Why hue=h=140 and not the h=60 in the original brief:
#   the source glow measures hue 193 (cyan). FFmpeg's hue filter rotates chroma, so
#   h=60 lands the glow at hue 239 (pure blue) and h=140 lands it at hue 330-331,
#   which is the brand pink (#FF007F and #EC4899 are both hue 330).
# The geq pass after it pulls color out of muted mid-tones only, so the machinery
# stays white and silver while the bright glow and the dark ambient haze stay pink.
param(
  [string]$Source = "public/hero_scan.mp4"
)
$ErrorActionPreference = 'Stop'

if ($Source -ne "public/hero_scan.mp4") { Copy-Item $Source "public/hero_scan.mp4" -Force }

$sat  = "hypot(cb(X,Y)-128,cr(X,Y)-128)/(lum(X,Y)+20)"
$keep = "clip(($sat-0.18)/0.14,0.15,1)"
$grade = "hue=h=140,eq=saturation=1.3,format=yuv444p,geq=lum='lum(X,Y)':cb='128+(cb(X,Y)-128)*$keep':cr='128+(cr(X,Y)-128)*$keep',format=yuv420p"

# 1. Pink grade. yuv420p + faststart so every browser can play it; short GOP for smooth seeking.
ffmpeg -v error -y -i public/hero_scan.mp4 -vf $grade -c:v libx264 -preset slow -crf 18 -g 12 -movflags +faststart -c:a copy public/hero_scan_pink.mp4

# 2. Scroll-scrub frames (desktop set, as specified in the brief).
New-Item -ItemType Directory -Force public/frames, public/frames-sm | Out-Null
Remove-Item public/frames/*.jpg, public/frames-sm/*.jpg -ErrorAction SilentlyContinue
ffmpeg -v error -y -i public/hero_scan_pink.mp4 -vf "fps=24,scale=1920:-1" -q:v 3 "public/frames/frame_%04d.jpg"

# 3. Lighter set for phones and small tablets (same frame count, so indices line up).
ffmpeg -v error -y -i public/hero_scan_pink.mp4 -vf "fps=24,scale=960:-1" -q:v 4 "public/frames-sm/frame_%04d.jpg"

# 4. Hero stills: the poster (first frame, painted before frames load) and the reduced-motion still
#    (the scanner-front frame), as WebP at two widths plus JPEG fallbacks.
New-Item -ItemType Directory -Force public/hero | Out-Null
Copy-Item public/frames/frame_0001.jpg public/hero/poster-1920.jpg -Force
ffmpeg -v error -y -i public/frames/frame_0001.jpg -c:v libwebp -quality 78 public/hero/poster-1920.webp
ffmpeg -v error -y -i public/frames/frame_0001.jpg -vf "scale=960:-2" -c:v libwebp -quality 78 public/hero/poster-960.webp
Copy-Item public/frames/frame_0300.jpg public/hero/static-1920.jpg -Force
ffmpeg -v error -y -i public/frames/frame_0300.jpg -c:v libwebp -quality 80 public/hero/static-1920.webp
ffmpeg -v error -y -i public/frames/frame_0300.jpg -vf "scale=960:-2" -c:v libwebp -quality 80 public/hero/static-960.webp

# 5. Social share image (1200x630): scanner-front frame with the logo.
ffmpeg -v error -y -i public/frames/frame_0300.jpg -i public/logo.png -filter_complex "[0:v]scale=1200:-2,crop=1200:630:0:(ih-630)/2,format=rgba[bg];[bg]drawbox=x=0:y=0:w=1200:h=630:color=0x07050A@0.25:t=fill[bg2];[1:v]scale=150:-2[lg];[bg2][lg]overlay=40:40:format=auto,format=yuv420p" -q:v 3 public/og.jpg

$count = (Get-ChildItem public/frames -Filter *.jpg).Count
Write-Output "frames: $count"
