# EXECUTION PROMPT — REKAL UI/UX REDESIGN & VISUAL SYSTEM OPTIMIZATION

## 1. Peran

Bertindak sebagai Senior UI/UX Designer, Senior Frontend Engineer, Design Systems Specialist, dan Accessibility Engineer.

Lakukan audit menyeluruh dan **implementasikan redesign UI/UX langsung pada kode repository**. Jangan berhenti pada rekomendasi, laporan audit, mockup, atau rencana. Terapkan perubahan, jalankan pengujian yang tersedia, perbaiki masalah yang ditemukan, dan laporkan hasil implementasi secara jujur.

## 2. Konteks proyek

- Repository: `nurhasanfadillah/rekal-blackbox_v2`
- Stack yang teridentifikasi: React 18, Vite, React Router, Tailwind CSS, Supabase, Lucide React.
- Area aplikasi: Dashboard, Produk, Detail Produk, Form Produk, Bill of Materials (BoM), Material, Kategori, dan Simulasi Harga.

Verifikasi struktur, branch, stack, komponen bersama, serta konfigurasi aktual sebelum mengubah kode. Jangan menganggap semua kondisi masih sama dengan konteks awal.

## 3. Tujuan desain

Bangun identitas visual **Modern Corporate — Bright, Bold, Geometric, and Professional**.

Karakter yang dituju:
- Tegas, rapi, profesional, dan berorientasi pada produktivitas.
- Cerah dengan kontras warna yang jelas.
- Geometris dan tidak terlalu membulat.
- Hierarki visual kuat dan konsisten.
- Data bisnis mudah dipindai dan dibandingkan.
- Mobile-first, dengan desktop yang memanfaatkan ruang untuk tabel dan pekerjaan kompleks.

Hindari UI generik yang dipenuhi kartu dekoratif, gradient berlebihan, shadow berat, tombol berbentuk pil, radius besar, dan dekorasi yang tidak membantu tugas pengguna.

## 4. Tahap pertama — audit UI/UX

Sebelum mengubah kode, periksa seluruh halaman, komponen bersama, stylesheet, layout, navigasi, serta keadaan UI. Kelompokkan temuan menjadi kritis, tinggi, sedang, dan rendah. Setelah audit awal, lanjutkan implementasi tanpa menunggu persetujuan tambahan, kecuali ada risiko yang benar-benar membutuhkan keputusan pemilik proyek.

### A. Tipografi
- Verifikasi bahwa font Inter benar-benar dimuat, bukan hanya dideklarasikan.
- Audit font, ukuran, bobot, line-height, letter-spacing, dan kontras.
- Audit hierarki judul halaman, subjudul, heading bagian, judul kartu, isi, label, metadata, angka, tabel, tombol, dan pesan validasi.
- Temukan inkonsistensi antara CSS bersama dan kelas Tailwind.
- Hindari variasi ukuran atau bobot yang tidak diperlukan.

### B. Layout, grid, dan alignment
- Audit garis kiri/kanan container, alignment header, judul, deskripsi, pencarian, tombol, kartu, dan konten.
- Periksa horizontal/vertical alignment, proporsi kolom, lebar container, gutter, padding, margin, tinggi komponen, dan jarak antarbagian.
- Temukan elemen yang tidak sejajar, terlalu rapat/renggang, atau menggunakan ruang secara tidak efektif.
- Konsistenkan alignment nilai finansial, mata uang, satuan, label, ikon, dan badge.
- Periksa wrapping teks, overflow, elemen bertumpuk, serta perubahan layout saat konten panjang.
- Pastikan komponen sejenis memiliki posisi, ukuran, dan padding konsisten di semua halaman.

### C. Bentuk dan estetika
- Audit radius tombol, input, kartu, panel, modal, tabel, badge, dan navigasi.
- Audit border, shadow, divider, ikon, ilustrasi, dan dekorasi.
- Hilangkan efek visual yang tidak memiliki fungsi.
- Pertahankan kemudahan penggunaan dan keterbacaan.

### D. Warna dan kontras
- Audit background, surface, border, teks utama/sekunder, warna brand, status, dan feedback.
- Standarkan warna melalui design tokens.
- Periksa hover, focus, disabled, error, dan success state.
- Jangan menggunakan warna sebagai satu-satunya penanda status.

### E. UX dan responsive layout
- Audit navigasi, pencarian, filter, formulir, tabel, modal, toast, empty state, loading state, dan error state.
- Periksa kemudahan penggunaan satu tangan pada ponsel.
- Jangan jadikan hover atau drag sebagai satu-satunya cara berinteraksi.
- Pastikan keyboard mobile tidak menutupi input, tombol utama, atau hasil perhitungan.

## 5. Implementasikan design system terpusat

Bangun sistem desain bersama agar perubahan konsisten dan mudah dipelihara.

### A. Palet warna awal

Gunakan nilai berikut sebagai baseline dan validasi kontrasnya:

- Primary blue: `#155EEF`
- Deep blue: `#0B3B8C`
- Accent amber: `#FFB020`
- Main background: `#F4F7FB`
- Surface: `#FFFFFF`
- Primary text: `#172B4D`
- Secondary text: `#52627A`
- Border: `#D8E0EA`
- Success: `#16803D`
- Warning: `#B54708`
- Danger: `#D92D20`

Gunakan warna utama pada tindakan utama, navigasi aktif, focus state, dan elemen brand. Gunakan amber secara terbatas untuk aksen yang memang perlu perhatian. Jangan mewarnai setiap kartu dengan warna berbeda.

### B. Sistem tipografi

Gunakan Inter sebagai font utama jika pemuatan dan lisensinya sesuai. Jika belum dimuat, periksa metode yang sudah digunakan sebelum menambahkan dependensi.

Skala awal:
- Page title: 26–30 px, weight 700.
- Section heading: 18–20 px, weight 600–700.
- Card heading: 15–16 px, weight 600.
- KPI/nilai finansial utama: 24–32 px, weight 700.
- Body text: 14–16 px, weight 400–500.
- Form label: 13–14 px, weight 600.
- Metadata: 12–13 px, weight 400–500.

Sesuaikan dengan konteks, kepadatan data, dan ukuran layar. Gunakan angka tabular untuk nilai finansial jika sesuai.

### C. Radius dan komponen
- Tombol: 4–6 px.
- Input: 4–6 px.
- Card/panel: 4–8 px.
- Modal/dropdown: 6–8 px.
- Badge: ringkas dan tidak terlalu membulat.

Hindari tombol pill sebagai gaya default. Gunakan border yang jelas, shadow minimal, dan state interaksi konsisten.

### D. Spacing dan grid

Gunakan spacing scale berbasis 4 px: 4, 8, 12, 16, 24, 32, 40, dan 48 px. Tetapkan standar untuk page container, header, section spacing, card padding, form spacing, grid gutter, table row height, icon-to-text spacing, dan button dimensions. Buat token atau utility bersama jika sesuai dengan arsitektur proyek. Hindari nilai arbitrer yang berulang pada setiap halaman.

## 6. Redesign layout per halaman

### A. Dashboard
- Jadikan judul dan deskripsi ringkas.
- Susun KPI berdasarkan kepentingan operasional.
- Samakan alignment, padding, dan hierarki angka pada kartu dalam satu grid.
- Gunakan kolom desktop dengan proporsi yang masuk akal.
- Tempatkan produk terbaru dan informasi pendukung setelah ringkasan utama.
- Jangan menyebut agregasi katalog sebagai laba transaksi aktual jika data transaksi tidak tersedia.
- Pertahankan definisi metrik bisnis yang benar.

### B. Produk
- Selaraskan judul, deskripsi, dan tindakan utama dalam header.
- Letakkan pencarian/filter dekat dengan daftar.
- Pada mobile, gunakan kartu dengan hierarki nama produk, harga, HPP, laba per unit, dan tindakan yang jelas.
- Pada desktop, gunakan tabel apabila memudahkan perbandingan.
- Sejajarkan nilai finansial dan konsistenkan lebar kolom.
- Pertahankan pencarian, ekspor PDF, tambah, edit, salin, detail, dan hapus.

### C. Formulir produk
Susun kelompok informasi dalam urutan:
1. Informasi dasar produk.
2. Parameter produksi dan perhitungan.
3. Bill of Materials.
4. Ringkasan HPP dan estimasi harga.
5. Foto produk.
6. Tindakan simpan dan batal.

Gunakan label di atas input sebagai pola default. Samakan lebar field sejenis. Jangan membuat input penting terlalu sempit. Pada mobile, gunakan satu kolom kecuali field berpasangan memang aman ditampilkan berdampingan. Ringkasan HPP harus mudah ditemukan tanpa menutupi formulir. Pastikan tabel BoM tetap terbaca di layar sempit.

### D. Detail produk
- Utamakan identitas produk dan informasi finansial utama.
- Kelompokkan HPP, harga jual, laba per unit, dan margin dengan jelas.
- Tampilkan rincian material dan komponen biaya setelah ringkasan.
- Tempatkan foto dan tindakan edit sesuai konteks.
- Jangan mengubah rumus atau definisi finansial.

### E. Material
- Konsistenkan posisi pencarian, tambah material, dan navigasi kategori.
- Tampilkan nama, kategori, satuan, dan harga standar dengan alignment tepat.
- Gunakan kartu mobile dan tabel desktop jika sesuai.
- Samakan modal/form tambah dan edit dengan sistem input baru.
- Pertahankan validasi, pencegahan penghapusan material yang masih digunakan, dan feedback operasi.

### F. Kategori
- Gunakan layout sederhana sesuai kebutuhan data.
- Tampilkan nama kategori dan jumlah material bila relevan.
- Konsistenkan pencarian, tambah, edit, hapus, dan dialog konfirmasi.
- Pertahankan hubungan navigasi dengan halaman Material.

### G. Simulasi harga
- Susun alur: pilih produk → atur parameter → lihat hasil utama → tinjau rincian.
- Pada mobile, tempatkan hasil penting dekat dengan input yang memengaruhinya.
- Pada desktop, pertimbangkan dua kolom untuk input dan hasil dengan proporsi seimbang.
- Gunakan hierarki dan alignment yang jelas untuk harga, HPP, laba, dan margin.
- Pastikan sticky summary tidak menutupi kontrol, navigasi, atau keyboard.
- Pertahankan semua rumus, validasi, dan perilaku simulasi.

## 7. Mobile-first dan responsive

Uji minimal pada lebar viewport 320–360 px, 375–430 px, 768 px, 1024 px, dan 1440 px atau lebih.

Ketentuan:
- Hindari horizontal overflow yang tidak diperlukan.
- Target sentuh sekitar 44–48 px untuk tindakan utama.
- Pastikan header, tombol, dan teks panjang membungkus dengan wajar.
- Gunakan tabel responsif atau kartu sesuai konteks, bukan sekadar mengecilkan tabel desktop.
- Perhatikan safe area, keyboard, sticky footer, dan navigasi bawah.
- Jangan mengandalkan hover sebagai satu-satunya akses fungsi.
- Pastikan modal, dropdown, dan dialog dapat digunakan pada layar kecil.
- Pada desktop, manfaatkan ruang untuk tabel dan perbandingan tanpa membuat garis baca terlalu lebar.

## 8. Batasan teknis dan bisnis

- Periksa komponen bersama sebelum membuat komponen baru.
- Utamakan refactor stylesheet dan komponen reusable.
- Hindari duplikasi class, token, dan styling inline yang bisa distandarkan.
- Pertahankan stack yang ada; jangan menambah library UI besar tanpa kebutuhan terverifikasi.
- Jangan mengubah skema database, autentikasi, otorisasi, RLS, integrasi backend, atau aturan keamanan sebagai bagian dari redesign.
- Jangan mengubah rumus HPP, harga jual, laba, margin, BoM, atau validasi bisnis.
- Jangan menghapus fitur yang sudah ada.
- Jangan mengganti data aktual dengan data dummy.
- Jangan mengaktifkan demo mode atau melemahkan autentikasi demi kemudahan pengembangan.
- Jangan memasukkan secret ke source code.
- Jangan melakukan reset database atau operasi destruktif.

Jika menemukan bug fungsional, dokumentasikan secara terpisah. Perbaiki hanya jika jelas, aman, dan berada dalam ruang lingkup; jika berisiko, jangan menyamarkannya sebagai perubahan visual.

## 9. Urutan implementasi

1. Audit seluruh halaman dan komponen.
2. Bangun design tokens untuk warna, tipografi, spacing, radius, border, dan focus state.
3. Refactor stylesheet global dan komponen UI bersama.
4. Perbaiki layout utama, header, navigasi, dan container responsif.
5. Implementasikan Dashboard dan Produk.
6. Perbaiki form produk, detail produk, dan BoM.
7. Perbaiki Material, Kategori, dan Simulasi Harga.
8. Audit modal, dropdown, toast, empty state, loading, error, dan validasi.
9. Uji responsive layout, alignment, accessibility, serta regresi fungsional.
10. Jalankan lint dan build, perbaiki masalah, lalu rangkum hasilnya.

Lakukan perubahan bertahap yang mudah ditinjau. Hindari refactor besar yang tidak terkait dengan tujuan desain.

## 10. Validasi dan quality gate

### Visual
- Semua halaman menggunakan warna dan tipografi konsisten.
- Judul, subjudul, label, angka, dan metadata memiliki hierarki jelas.
- Grid, garis tepi container, alignment, dan spacing konsisten.
- Radius tidak berlebihan.
- Kartu, tabel, form, dan tombol memiliki proporsi yang tepat.
- Tidak ada teks terpotong, elemen bertumpuk, atau overflow yang tidak disengaja.

### UX dan aksesibilitas
- Label terhubung dengan input.
- Fokus keyboard terlihat.
- Kontras teks dan kontrol memenuhi WCAG 2.2 AA sejauh relevan.
- Status tidak disampaikan hanya melalui warna.
- Target sentuh memadai.
- Dialog dan formulir tetap dapat digunakan dengan keyboard dan perangkat mobile.

### Fungsional
- CRUD produk, material, dan kategori tetap bekerja.
- Pencarian dan navigasi tetap berfungsi.
- Ekspor PDF dan upload foto tidak rusak.
- Perhitungan HPP, harga, laba, margin, dan BoM tidak berubah.
- Loading, error, validasi, dan konfirmasi tetap berfungsi.
- Autentikasi dan akses data tidak mengalami regresi.

### Teknis
- Jalankan `npm run lint`.
- Jalankan `npm run build`.
- Periksa dan perbaiki error/warning yang relevan.
- Jika tersedia, jalankan test suite dan pengujian browser pada viewport mobile dan desktop.
- Jangan mengklaim pengujian berhasil jika tidak benar-benar dijalankan.

## 11. Laporan akhir

Laporkan:
1. Ringkasan perubahan desain.
2. Halaman dan komponen yang diubah.
3. Perubahan token warna, font, hierarki, spacing, radius, dan grid.
4. Perbaikan layout dan alignment.
5. Hasil lint, build, test, dan browser sesuai yang benar-benar dijalankan.
6. Masalah yang belum terselesaikan beserta alasannya.
7. Risiko/regresi yang masih perlu diverifikasi.
8. File penting yang diubah.
9. Branch, commit, atau pull request jika dibuat.

Jika fitur tidak dapat diuji karena keterbatasan lingkungan, nyatakan secara eksplisit. Jangan mengklaim aplikasi sempurna atau production-ready tanpa bukti.

## Instruksi eksekusi

Mulai dengan memeriksa kondisi repository dan implementasi UI aktual, kemudian lanjutkan langsung ke perubahan kode yang diperlukan.

**Prioritas utama: layout dan alignment presisi, hierarki tipografi yang kuat, warna corporate yang cerah, bentuk geometris yang tegas, serta pengalaman mobile-first yang konsisten.**

Selesaikan implementasi end-to-end, validasi hasilnya, dan laporkan bukti perubahan. Jangan hanya memberikan rencana atau contoh kode tanpa menerapkannya ke repository.
