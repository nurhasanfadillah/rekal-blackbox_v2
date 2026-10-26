---
phase: 12-pdf-export
topic: Library untuk ekspor data produk (HPP) ke PDF
depth: standard
confidence: HIGH
created: 2026-10-24
---

# Discovery: PDF Export Library untuk ReKal

**Recommendation:** Gunakan `@react-pdf/renderer` untuk ekspor HPP produk ke PDF.

**Confidence:** HIGH — data dari npm (weekly downloads aktual), changelog resmi, dan dokumentasi official. Dua alternatif juga diverifikasi.

## Objective

Hal yang perlu diputuskan sebelum planning:
- Library mana yang paling tepat untuk ekspor data produk (HPP) ke PDF?
- Apakah output PDF harus punya teks yang bisa di-select/copy?
- Bagaimana cara menangani dark theme Framer di PDF (dark canvas #090909 tidak cocok untuk print)?

## Scope

**Include:**
- Library PDF generation berbasis React (client-side)
- Maintainability & ukuran komunitas (weekly downloads)
- Kompatibilitas dengan React 18/19 dan Vite/PWA setup ReKal
- Kualitas output (teks selectable vs image snapshot)

**Exclude:**
- Server-side PDF generation (Puppeteer, headless Chrome) — tidak sesuai untuk PWA offline-first
- PDF viewer (react-pdf) — bukan use case kita
- Library berbayar / proprietary

## Findings

### Option A: `@react-pdf/renderer`

**Source:** https://react-pdf.org | https://npmjs.com/package/@react-pdf/renderer

**Summary:** React renderer khusus untuk generate PDF, menggunakan PDFKit dan Yoga (flexbox engine) di bawahnya. Dokumen dibuat sebagai React component tree dengan komponen khusus (`<Document>`, `<Page>`, `<Text>`, `<View>`, dll).

**Pros:**
- Sangat populer: **3.77 juta weekly downloads** (vs 80k react-to-pdf)
- Aktif dikembangkan: v4.9.0 (Aug 2026), update reguler setiap bulan
- **React 19 support** sejak v4.1.0 (Nov 2024)
- **Teks selectable/copyable** di PDF output — penting untuk dokumen bisnis HPP
- Flexbox layout (Yoga) — familiar bagi React developer
- Custom fonts, gambar, SVG support
- Browser + server rendering
- MIT license

**Cons:**
- Perlu buat **template PDF terpisah** — tidak bisa reuse komponen UI Framer langsung
- Kurva belajar: sintaks komponennya berbeda dari HTML/Tailwind
- Bundle size lebih besar (PDFKit dependency)
- Styling dengan `StyleSheet.create()` bukan Tailwind

**For our use case:** Sangat cocok. HPP adalah dokumen bisnis yang perlu dibagikan — teks harus bisa di-select/copy (angka HPP, harga bahan). Template PDF terpisah justru keuntungan karena kita bisa buat layout **putih/bersih** yang print-friendly, berbeda dari dark Framer canvas UI.

---

### Option B: `react-to-pdf`

**Source:** https://github.com/ivmarcos/react-to-pdf | https://npmjs.com/package/react-to-pdf

**Summary:** Hook-based wrapper di atas `jsPDF` + `html2canvas`. Capture DOM element sebagai screenshot/canvas, lalu embed ke PDF. API: `usePDF` hook atau `generatePDF()` function.

**Pros:**
- Setup sangat cepat: 2-3 baris kode, satu `usePDF` hook
- CSS & Tailwind styles terikut (WYSIWYG dari UI)
- Tidak perlu buat template baru
- Cocok untuk prototyping cepat

**Cons:**
- **Teks TIDAK selectable** — PDF adalah gambar (rasterized), bukan vektor
- Dark theme Framer akan ikut masuk ke PDF — hitam canvas & teks putih tidak bisa diprint dengan baik
- Weekly downloads: **80k** (jauh lebih rendah dari @react-pdf/renderer)
- File PDF lebih besar (image-based)
- 70 open issues di GitHub, maintenance lebih lambat
- Hanya client-side, no SSR

**For our use case:** Kurang cocok. Dark theme ReKal akan menghasilkan PDF tidak layak print. Teks tidak bisa di-select adalah dealbreaker untuk dokumen HPP bisnis.

---

### Option C: `jsPDF` (direct)

**Source:** https://github.com/parallax/jsPDF

**Summary:** Low-level PDF generation library. Drawing text/shapes dengan koordinat manual (imperative API, tanpa CSS support).

**Pros:**
- 583k weekly downloads, mature & stable
- Teks selectable di output
- Full control atas layout
- Lightweight jika tidak pakai html2canvas

**Cons:**
- **Tidak ada CSS support** — semua positioning manual dengan koordinat
- Sangat verbose untuk layout kompleks seperti HPP breakdown table
- Bukan React-native — tidak ada component API
- Lebih cocok untuk simple receipts, bukan multi-section reports

**For our use case:** Terlalu low-level. HPP report punya banyak sections (info produk, table bahan, breakdown biaya, summary HPP) — membangun ini dengan koordinat manual akan sangat time-consuming dan brittle.

---

## Comparison

| Kriteria | `@react-pdf/renderer` | `react-to-pdf` | `jsPDF` |
|----------|----------------------|---------------|---------|
| Weekly downloads | 3.77M ✅ | 80K ⚠️ | 583K ✅ |
| Teks selectable | ✅ Ya | ❌ Tidak | ✅ Ya |
| React component API | ✅ Ya | ✅ Ya (hook) | ❌ Tidak |
| CSS / Tailwind support | ❌ StyleSheet custom | ✅ Ya | ❌ Tidak |
| Dark theme aman | ✅ (template sendiri) | ❌ Ikut dark UI | ✅ (manual) |
| React 19 compat | ✅ v4.1.0+ | ✅ | ✅ |
| Maintenance aktif | ✅ v4.9.0 Aug 2026 | ⚠️ v3.2.2 Mar 2026 | ✅ |
| Setup complexity | Medium | Low | High |
| Bundle size | Medium | Medium | Small |
| Custom font | ✅ | ❌ | ✅ |

## Recommendation

**Gunakan: `@react-pdf/renderer` v4.x**

**Rationale:**

ReKal mengekspor **dokumen bisnis HPP** — bukan sekadar screenshot UI. Dokumen ini akan dibagikan ke klien, supplier, atau tim internal. Dalam konteks itu:

1. **Teks harus bisa di-select/copy** — angka HPP, harga satuan, margin perlu bisa dicopy-paste. `react-to-pdf` gagal di sini karena image-based.

2. **Template terpisah adalah keuntungan** — Dark Framer canvas (#090909) bagus untuk UI, tapi **tidak untuk dokumen print**. Dengan `@react-pdf/renderer`, kita buat template PDF bersih (putih, Inter font, hitam/abu), terpisah dari UI. Ini justru menghasilkan PDF yang jauh lebih profesional.

3. **Popularitas & maintenance** — 3.77M weekly downloads vs 80k adalah perbedaan signifikan. Library lebih banyak digunakan = lebih banyak orang fix bugs, lebih banyak StackOverflow answers, lebih AI-friendly.

4. **React 19 ready** — ReKal bisa upgrade React kapan saja tanpa khawatir breaking.

**Caveats:**
- Perlu waktu ~2-3 jam untuk buat template PDF components pertama kali (learning curve)
- `StyleSheet.create()` berbeda dari Tailwind — tapi sintaksnya mirip CSS, tidak sulit
- Tidak bisa reuse komponen chart existing (BarChart dari recharts tidak bisa masuk PDF) — untuk chart di PDF perlu custom atau skip chart

## Open Questions

Semua terjawab sebelum planning:

- **Scope ekspor:** ✅ Daftar semua produk (tabel), bukan single product detail
- **Kolom PDF:** ✅ Nama Produk, HPP, Harga Jual — tidak perlu foto
- **Download method:** ✅ Direct download via `<PDFDownloadLink>` — satu klik, file langsung tersimpan. Preview tidak diperlukan untuk tabel sederhana.

None — discovery menjawab semua pertanyaan kritis.

## Quality Report

**Sources consulted:**
- npmjs.com/package/@react-pdf/renderer — weekly downloads 3.77M, v4.9.0 (2026-08-27)
- react-pdf.org/docs/v4/compatibility — konfirmasi React 16/17/18/19 support
- react-pdf.org/changelog — changelog aktif Aug 2026
- npmjs.com/package/react-to-pdf — weekly downloads 80k, v3.2.2 (2026-03-18)
- github.com/ivmarcos/react-to-pdf — 349 stars, 70 open issues
- spacejelly.dev/posts/generate-a-pdf-from-html-in-javascript (2024-08-15) — comparison
- npm-compare.com/html2pdf.js,jspdf,react-pdf,react-to-pdf — feature matrix

**Verification:**
- `@react-pdf/renderer` React 19 support: Verified via official docs (react-pdf.org/docs/v4/compatibility)
- Weekly downloads: Verified langsung dari npmjs.com
- Version aktif: Changelog menunjukkan update reguler 2025-2026
- `react-to-pdf` image-based (non-selectable): Verified via README (ditegaskan sendiri oleh maintainer: "Not vectorized")

**Assumptions (not verified):**
- Bundle size impact pada Vite PWA build belum diukur (estimasi +300-500KB untuk @react-pdf/renderer)

---
*Discovery completed: 2026-10-24*
*Confidence: HIGH*
*Ready for: /paul:plan 12-pdf-export*
