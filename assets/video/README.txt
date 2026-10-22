Video undangan (sudah dikompres: 360x640, H.264, ~0,2-0,4 MB per video, poster .jpg dibuat otomatis).

Ganti video dengan nama yang sama: video-1.mp4 + video-1.jpg (poster), video-2.mp4 + video-2.jpg.
Video baru tidak diunduh sampai tamu menekan play (preload none), jadi halaman tetap ringan.

Kompres video baru:
  ffmpeg -i asli.mp4 -vf "scale=360:-2,fps=24" -c:v libx264 -profile:v main -pix_fmt yuv420p -crf 25 -preset slow -maxrate 900k -bufsize 1800k -c:a aac -b:a 56k -ac 1 -movflags +faststart video-1.mp4
Poster:
  ffmpeg -i video-1.mp4 -ss 1 -frames:v 1 -vf "scale=360:-2" -q:v 3 video-1.jpg
Video horizontal 16:9: ubah w/h di array GALLERY (gallery-booth.js) menjadi 16 dan 9.
