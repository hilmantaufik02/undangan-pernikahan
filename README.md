# Undangan Digital Hilman & Resti — Cozy 2.5D

Undangan interaktif berbasis HTML, CSS, dan JavaScript dengan ilustrasi taman pastel yang diperbarui, enam lokasi interaktif, karakter chibi, kamera mengikuti pemain, joystick/keyboard, musik, galeri placeholder, RSVP/ucapan, hadiah, dan photobox.

## Menjalankan di komputer

1. Ekstrak ZIP.
2. Buka terminal pada folder `undangan-hilman-resti`.
3. Jalankan `python -m http.server 8000`.
4. Buka `http://localhost:8000` di Chrome.

Folder `assets` dan file `index.html` harus tetap bersama dalam struktur proyek. Untuk izin kamera, gunakan localhost atau HTTPS.

## Musik: MP3 lokal (disarankan) dan YouTube fallback

### Opsi A — MP3 lokal (paling konsisten)

1. Buat folder `musik` sejajar dengan `index.html` (folder petunjuk `musik` sudah termasuk di ZIP).
2. Masukkan file lagu yang kamu miliki atau berizin untuk digunakan dengan nama persis `lagu-cinta.mp3`, sehingga lokasinya menjadi `musik/lagu-cinta.mp3`.
3. Jalankan/unggah ulang website. Tombol **Mulai jelajahi taman** mencoba memutar MP3 dalam gesture klik pengguna; tombol **Musik** di HUD berfungsi sebagai play/pause.
4. Usahakan ukuran file di bawah 2 MB dan gunakan MP3 bitrate yang sesuai kebutuhan web agar cepat dimuat.

**Penting:** tag `<audio>` tidak dapat memutar URL YouTube secara langsung. Jangan masukkan URL YouTube ke `src`. Gunakan file audio yang kamu miliki atau punya izin untuk dipakai.

### Opsi B — YouTube fallback

Jika file MP3 tidak ditemukan atau gagal diputar, aplikasi menampilkan pemutar YouTube untuk video `https://youtu.be/4U13TPI5G2o`. Karena YouTube dapat membatasi autoplay atau melarang embed pada video tertentu, pengunjung mungkin perlu menekan tombol ▶ pada pemutar yang ditampilkan. Bila embed diblokir, tombol Musik dapat membuka video di YouTube.

## Gerak karakter mengikuti jalan

Koridor jalan dibuat ulang mengikuti peta terbaru (kanvas 900 × 594). Titik jalan menghubungkan gazebo, rumah pasangan, galeri, kotak ucapan, photobox, toko hadiah, serta jalur bawah. Pengujian grid internal memastikan titik awal dan keenam tujuan berada pada satu jaringan jalur yang terhubung.

- Rumput tidak bisa diinjak; petunjuk ini terlihat di HUD saat permainan berjalan.
- Joystick/keyboard memeriksa seluruh segmen gerak dan mencoba bergeser pada sumbu yang masih berada di jalan ketika menabrak tepi jalur.
- Navigasi otomatis memakai pencarian jalur. Pemotongan tikungan hanya diizinkan bila seluruh garis tetap berada di koridor jalan.
- Bila karakter benar-benar tertahan, game menampilkan pengingat untuk mengikuti jalur batu.

Jika gambar peta diganti, sesuaikan kurva `roadShape(...)` dan titik lokasi `POIS` pada `index.html` mengikuti koordinat peta baru.

## Penyimpanan komentar

### Mode lokal

Tanpa konfigurasi database, komentar menggunakan `localStorage` dan hanya terlihat pada browser/perangkat yang sama. Ini tidak cukup untuk buku tamu undangan publik.

### Mode online untuk semua tamu (Supabase)

1. Buat proyek di [Supabase](https://supabase.com/).
2. Jalankan seluruh SQL dari file `supabase_setup.sql` melalui **SQL Editor**.
3. Isi `SUPABASE_URL` dan `SUPABASE_PUBLISHABLE_KEY` pada `index.html` memakai Project URL dan Publishable Key milik proyekmu.
4. Deploy ulang ke GitHub Pages atau Vercel.
5. Uji kirim ucapan dari dua browser/perangkat yang berbeda.

Publishable/anon key hanya boleh berada di frontend bila aturan RLS disiapkan dengan benar. Jangan pernah menaruh `service_role` key atau secret key di HTML/GitHub. Guestbook publik memungkinkan pengunjung membaca nama dan ucapan tamu; tambahkan CAPTCHA/rate-limit jika dibagikan luas.

## Data yang perlu disesuaikan

Nama, tanggal/waktu, alamat, Instagram, orang tua, serta rekening berada pada objek `C` di JavaScript. Waktu acara saat ini diset ke **09.00 WIB** mengikuti kode terakhir yang dikirimkan. Galeri foto masih placeholder. Photobox membutuhkan izin kamera.

## Upload ke GitHub/Vercel

Upload `index.html`, folder `assets`, folder `musik` (beserta file MP3 jika digunakan), dan file SQL/README. Hosting statis tidak otomatis menyediakan database; Supabase adalah layanan terpisah untuk menyimpan komentar bersama.
