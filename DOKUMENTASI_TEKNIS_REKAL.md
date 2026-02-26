# Dokumentasi Teknis Aplikasi ReKal

## 1. Identitas dan Deskripsi Aplikasi

### 1.1 Identitas Aplikasi

| Atribut | Nilai |
|---------|-------|
| **Nama Aplikasi** | ReKal (Rekalkulasi HPP) |
| **Versi** | 1.0.0 |
| **Pengembang** | PT. Redone Berkah Mandiri |
| **Platform** | Web Application (Responsive) |
| **Lisensi** | Proprietary |

### 1.2 Deskripsi Aplikasi

ReKal adalah aplikasi manajemen Harga Pokok Produksi (HPP) yang dirancang khusus untuk industri tas dan fashion. Aplikasi ini menyediakan solusi end-to-end untuk:

- **Manajemen Material**: Mengelola katalog bahan baku dengan kategorisasi
- **Perhitungan HPP**: Menghitung biaya produksi secara otomatis berdasarkan komposisi material
- **Estimasi Harga Jual**: Menentukan harga jual optimal berdasarkan target margin
- **Analisis Profitabilitas**: Menghitung laba kotor per unit produk

## 2. Struktur Data

### 2.1 Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   categories    │       │    materials    │       │    products     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ PK id (UUID)    │◄──────┤ FK category_id  │       │ PK id (UUID)    │
│    name (TEXT)  │       │ PK id (UUID)    │       │    name (TEXT)  │
│    created_at   │       │    name (TEXT)  │       │    description  │
│    updated_at   │       │    standard_price      │    image_url    │
└─────────────────┘       │    unit (ENUM)  │       │    overhead_pct │
                          │    created_at   │       │    margin_pct   │
                          │    updated_at   │       │    total_material_cost
                          └─────────────────┘       │    production_cost
                                    │               │    selling_price
                                    │               │    gross_profit
                                    │               │    created_at
                                    │               │    updated_at
                                    │               └─────────────────┘
                                    │                         │
                                    │                         │
                                    │               ┌─────────────────┐
                                    │               │ bill_of_materials│
                                    └──────────────►├─────────────────┤
                                                    │ PK id (UUID)    │
                                                    │ FK product_id   │
                                                    │ FK material_id  │
                                                    │    price        │
                                                    │    quantity     │
                                                    │    subtotal     │
                                                    │    created_at   │
                                                    └─────────────────┘
```

### 2.2 Skema Database

#### Tabel: `categories`
Menyimpan kategori/kelompok material

| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|------------|-----------|
| `id` | UUID | PRIMARY KEY | Identitas unik kategori |
| `name` | TEXT | NOT NULL, UNIQUE | Nama kategori |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Waktu pembuatan |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Waktu pembaruan |

#### Tabel: `materials`
Menyimpan data bahan baku

| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|------------|-----------|
| `id` | UUID | PRIMARY KEY | Identitas unik material |
| `name` | TEXT | NOT NULL | Nama material |
| `category_id` | UUID | FOREIGN KEY → categories.id | Referensi kategori |
| `standard_price` | DECIMAL(10,2) | NOT NULL | Harga standar material |
| `unit` | TEXT | NOT NULL, CHECK ('Pcs', 'Cm') | Satuan ukuran |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Waktu pembuatan |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Waktu pembaruan |

#### Tabel: `products`
Menyimpan data produk jadi

| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|------------|-----------|
| `id` | UUID | PRIMARY KEY | Identitas unik produk |
| `name` | TEXT | NOT NULL, UNIQUE | Nama produk |
| `description` | TEXT | NULLABLE | Deskripsi produk |
| `image_url` | TEXT | NULLABLE | URL gambar produk |
| `overhead_percentage` | DECIMAL(5,2) | NOT NULL DEFAULT 0 | Persentase overhead |
| `target_margin_percentage` | DECIMAL(5,2) | NOT NULL DEFAULT 0 | Target margin profit |
| `total_material_cost` | DECIMAL(12,2) | DEFAULT 0 | Total biaya material |
| `production_cost` | DECIMAL(12,2) | DEFAULT 0 | HPP (Harga Pokok Produksi) |
| `estimated_selling_price` | DECIMAL(12,2) | DEFAULT 0 | Estimasi harga jual |
| `gross_profit_per_unit` | DECIMAL(12,2) | DEFAULT 0 | Laba kotor per unit |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Waktu pembuatan |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Waktu pembaruan |

#### Tabel: `bill_of_materials`
Menyimpan komposisi material untuk setiap produk (BoM)

| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|------------|-----------|
| `id` | UUID | PRIMARY KEY | Identitas unik BoM |
| `product_id` | UUID | FOREIGN KEY → products.id ON DELETE CASCADE | Referensi produk |
| `material_id` | UUID | FOREIGN KEY → materials.id ON DELETE RESTRICT | Referensi material |
| `price` | DECIMAL(10,2) | NOT NULL | Harga material saat pembuatan |
| `quantity` | DECIMAL(10,2) | NOT NULL | Kuantitas material |
| `subtotal` | DECIMAL(12,2) | NOT NULL | Subtotal (price × quantity) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Waktu pembuatan |

### 2.3 Indeks Database

```sql
-- Indeks untuk performa query
CREATE INDEX idx_materials_category_id ON materials(category_id);
CREATE INDEX idx_bom_product_id ON bill_of_materials(product_id);
CREATE INDEX idx_bom_material_id ON bill_of_materials(material_id);
```

### 2.4 Relasi Antar Tabel

| Relasi | Tipe | Deskripsi |
|--------|------|-----------|
| `categories` → `materials` | One-to-Many | Satu kategori memiliki banyak material |
| `materials` → `bill_of_materials` | One-to-Many | Satu material bisa digunakan di banyak BoM |
| `products` → `bill_of_materials` | One-to-Many | Satu produk memiliki banyak item BoM |
| `materials` ↔ `products` | Many-to-Many | Relasi many-to-many melalui tabel BoM |

---

## 3. Alur Logika, Logika Data, dan Validasi Data

### 3.1 Alur Logika Aplikasi

#### 3.1.1 Alur Manajemen Kategori

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  User       │───►│  Input      │───►│  Validasi   │───►│  Simpan ke  │
│  Membuat    │    │  Nama       │    │  Unik       │    │  Database   │
│  Kategori   │    │  Kategori   │    │  & Required │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                                │
                                    ┌─────────────┐              │
                                    │  Tampilkan  │◄─────────────┘
                                    │  di Dropdown│
                                    │  Material   │
                                    └─────────────┘

┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  User       │───►│  Cek        │───►│  Validasi   │───►│  Hapus dari │
│  Menghapus  │    │  Material   │    │  Count = 0  │    │  Database   │
│  Kategori   │    │  Count      │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                              │
                                              ▼
                                       ┌─────────────┐
                                       │  Error:     │
                                       │  "Kosongkan │
                                       │  material    │
                                       │  terlebih   │
                                       │  dahulu"    │
                                       └─────────────┘
```

#### 3.1.2 Alur Manajemen Material

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  User       │───►│  Input      │───►│  Validasi   │───►│  Simpan ke  │
│  Membuat    │    │  Data       │    │  Field      │    │  Database   │
│  Material   │    │  Material   │    │  Required   │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                                              │
       │                                              ▼
       │                                       ┌─────────────┐
       │                                       │  Tersedia   │
       │                                       │  di BoM     │
       │                                       │  Editor     │
       │                                       └─────────────┘
       ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  User       │───►│  Cek        │───►│  Validasi   │───►│  Hapus dari │
│  Menghapus  │    │  BoM Usage  │    │  Not Used   │    │  Database   │
│  Material   │    │  Count      │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                              │
                                              ▼
                                       ┌─────────────┐
                                       │  Error:     │
                                       │  "Material  │
                                       │  masih      │
                                       │  digunakan" │
                                       └─────────────┘
```

#### 3.1.3 Alur Pembuatan Produk

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  User       │───►│  Input      │───►│  Validasi   │───►│  Simpan     │
│  Membuat    │    │  Info Dasar │    │  Nama Unik  │    │  Produk     │
│  Produk     │    │  (Nama,     │    │  % Valid    │    │  ke DB      │
│             │    │  Overhead,  │    │             │    │             │
│             │    │  Margin)    │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └──────┬──────┘
                                                                 │
┌─────────────┐    ┌─────────────┐    ┌─────────────┐           │
│  User       │───►│  Pilih      │───►│  Input      │           │
│  Menambah   │    │  Material   │    │  Qty &      │           │
│  Material   │    │  dari       │    │  Harga      │           │
│  ke BoM     │    │  Katalog    │    │  (Override) │           │
└─────────────┘    └─────────────┘    └─────────────┘           │
       │                                                        │
       │         ┌─────────────┐    ┌─────────────┐            │
       └────────►│  Kalkulasi  │───►│  Simpan BoM │─────────────┘
                  │  Otomatis   │    │  Items      │
                  └─────────────┘    └─────────────┘
                         │
                         ▼
                  ┌─────────────┐
                  │  Hitung:    │
                  │  • Total    │
                  │    Material │
                  │  • HPP      │
                  │  • Harga    │
                  │    Jual     │
                  │  • Laba     │
                  └─────────────┘
```

### 3.2 Logika Kalkulasi

#### 3.2.1 Formula Perhitungan

// 1. Subtotal per Material
subtotal = price × quantity

// 2. Total Biaya Material (BoM)
totalMaterialCost = Σ(subtotal of all materials)

// 3. Harga Pokok Produksi (HPP)
productionCost = totalMaterialCost / (1 - overheadPercentage / 100)

// 4. Estimasi Harga Jual
estimatedSellingPrice = productionCost / (1 - targetMarginPercentage / 100)

// 5. Laba Kotor per Unit
grossProfitPerUnit = estimatedSellingPrice - productionCost

#### 3.2.2 Contoh Perhitungan

| Parameter | Nilai |
|-----------|-------|
| Material A | Rp 10.000 × 2 Pcs = Rp 20.000 |
| Material B | Rp 5.000 × 1 Pcs = Rp 5.000 |
| **Total Material** | **Rp 25.000** |
| Overhead | 20% |
| Target Margin | 30% |

**Perhitungan:**

HPP = Rp 25.000 / (1 - 0.20) = Rp 25.000 / 0.80 = Rp 31.250

Harga Jual = Rp 31.250 / (1 - 0.30) = Rp 31.250 / 0.70 = Rp 44.643

Laba Kotor = Rp 44.643 - Rp 31.250 = Rp 13.393

### 3.3 Validasi Data

#### 3.3.1 Validasi Kategori

| Field | Validasi | Pesan Error |
|-------|----------|-------------|
| `name` | Required | "Category name is required" |
| `name` | Unique | "Category name already exists" |
| Delete | No materials linked | "Gagal menghapus: Kosongkan material dalam kategori ini terlebih dahulu." |

**Implementasi Backend:**

#### 3.3.2 Validasi Material

| Field | Validasi | Pesan Error |
|-------|----------|-------------|
| `name` | Required | "Material name is required" |
| `category_id` | Required | "Category is required" |
| `standard_price` | ≥ 0 | "Valid standard price is required" |
| `unit` | Enum: 'Pcs', 'Cm' | "Unit must be Pcs or Cm" |
| Delete | Not used in BoM | "Gagal menghapus: Material masih digunakan dalam komposisi produk." |

#### 3.3.3 Validasi Produk

| Field | Validasi | Pesan Error |
|-------|----------|-------------|
| `name` | Required | "Product name is required" |
| `name` | Unique | "Product name already exists" |
| `overhead_percentage` | 0 ≤ x < 100 | "Overhead percentage must be between 0 and 100" |
| `target_margin_percentage` | 0 ≤ x < 100 | "Target margin percentage must be between 0 and 100" |
| `bill_of_materials` | Min 1 item | "At least one material is required in BoM" |

### 3.4 Alur Data (Data Flow)

#### 3.4.1 Create Product Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │     │    Backend      │     │    Database     │
│                 │     │                 │     │                 │
│ 1. User submits │────►│ 2. Validate     │     │                 │
│    product form │     │    input data   │     │                 │
│                 │     │                 │     │                 │
│                 │     │ 3. Calculate    │     │                 │
│                 │     │    costs:       │     │                 │
│                 │     │    - Total      │     │                 │
│                 │     │      Material   │     │                 │
│                 │     │    - HPP        │     │                 │
│                 │     │    - Sell Price │     │                 │
│                 │     │    - Profit     │     │                 │
│                 │     │                 │     │                 │
│                 │     │ 4. Insert       │────►│ 5. Store        │
│                 │     │    product      │     │    product      │
│                 │     │                 │     │                 │
│                 │     │ 6. Insert BoM   │────►│ 7. Store BoM    │
│                 │     │    items        │     │    items        │
│                 │     │                 │     │                 │
│                 │     │ 8. Fetch with   │◄────│ 9. Return       │
│                 │     │    relations    │     │    joined data  │
│                 │     │                 │     │                 │
│ 10. Display     │◄────│ 11. Return      │     │                 │
│     result      │     │     JSON        │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 3.5 Penanganan Error

| Skenario | HTTP Status | Error Message | Penanganan Frontend |
|----------|-------------|---------------|---------------------|
| Duplicate product name | 400 | "Product name already exists" | Tampilkan toast error, highlight field |
| Material in use | 400 | "Material masih digunakan..." | Tampilkan toast error, disable delete button |
| Category has materials | 400 | "Kosongkan material..." | Tampilkan toast error, disable delete button |
| Invalid percentage | 400 | "Must be between 0 and 100" | Validasi real-time di form |
| Database error | 500 | "Something went wrong!" | Tampilkan toast error, log ke console |
| Network error | - | "Gagal memuat data" | Fallback ke local storage (offline mode) |


## 5. Catatan Pengembangan

### 5.1 Prinsip Desain
- **Mobile-First**: UI dioptimalkan untuk mobile dengan responsive design
- **Real-time Calculation**: Kalkulasi HPP real-time saat edit BoM
- **Data Integrity**: Validasi ketat untuk menjaga integritas data


**Dokumentasi ini dibuat untuk ReKal v1.0.0**
**PT. Redone Berkah Mandiri**


Gunakan kredensial supabase berikut:
API URL: https://rtvprftiezzyyyqglydv.supabase.co
API Keys: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0dnByZnRpZXp6eXl5cWdseWR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMjQ4MDgsImV4cCI6MjA4NzcwMDgwOH0.n6x2WiM3N8Qzi3PZtlf0aHGfqdX30D7NAaAWCOV84nE