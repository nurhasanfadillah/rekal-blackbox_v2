# Setup Panduan ReKal App

## Prasyarat

1. Node.js 18+ terinstal
2. Akun Supabase (https://supabase.com)
3. NPM atau Yarn

## Langkah Setup

### 1. Install Dependencies

```bash
cd rekal-app
npm install
```

### 2. Setup Supabase Database

1. Buka dashboard Supabase Anda: https://app.supabase.com
2. Pilih project Anda (atau buat project baru)
3. Buka menu **SQL Editor**
4. Copy dan paste isi file `supabase-schema.sql` ke editor SQL
5. Klik **Run** untuk membuat tabel

### 3. Konfigurasi Environment Variables (Opsional)

Jika Anda ingin menggunakan Supabase project yang berbeda, update file `src/supabase.js`:

```javascript
const supabaseUrl = 'https://your-project.supabase.co'
const supabaseKey = 'your-anon-key'
```

### 4. Jalankan Aplikasi

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## Struktur Database

Aplikasi ini menggunakan 4 tabel utama:

1. **categories** - Menyimpan kategori material
2. **materials** - Menyimpan data material/bahan baku
3. **products** - Menyimpan data produk dan perhitungan HPP
4. **bill_of_materials** - Menyimpan komposisi material untuk setiap produk (BoM)

## Fitur Aplikasi

- ✅ Manajemen Kategori Material
- ✅ Manajemen Material/Bahan Baku
- ✅ Manajemen Produk dengan perhitungan HPP otomatis
- ✅ Perhitungan Biaya Overhead
- ✅ Perhitungan Target Margin dan Harga Jual
- ✅ Bill of Materials (BoM) untuk setiap produk
- ✅ Autentikasi dengan Supabase Auth
- ✅ Responsive design untuk mobile
- ✅ PWA (Progressive Web App) support

## Troubleshooting

### Error 404 saat fetch data

Pastikan Anda sudah menjalankan schema SQL di Supabase SQL Editor. Error ini terjadi ketika tabel belum dibuat.

### Error autentikasi

Pastikan Supabase Auth sudah diaktifkan di project Anda. Demo mode aktif secara default (DEMO_MODE = true di App.jsx).

### Port sudah digunakan

Vite akan otomatis mencari port yang tersedia. Jika port 3000 digunakan, aplikasi akan berjalan di port 3001, 3002, dst.

## Deployment

### Netlify

1. Push kode ke GitHub
2. Hubungkan repository ke Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Deploy!

## Catatan Penting

- Aplikasi menggunakan DEMO_MODE = true secara default untuk memudahkan testing
- Untuk production, ubah DEMO_MODE menjadi false di App.jsx
- Pastikan Row Level Security (RLS) di Supabase sudah dikonfigurasi dengan benar untuk production
