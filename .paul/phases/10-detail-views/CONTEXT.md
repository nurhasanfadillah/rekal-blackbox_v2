# Phase Context

**Phase:** 10 — detail-views
**Generated:** 2026-09-13
**Status:** Ready for planning (replan required — PLAN 10-01 sudah ada dan perlu extend)

## Discussion Trigger

User request: "saya ingin pada setiap input number tidak ada spinner arrow dan tidak ada behavior scroll spinner"

Concern ini muncul setelah PLAN 10-01 dibuat. Diputuskan untuk **extend PLAN 10-01** (Opsi A) karena:
- 2 dari 3 file scope Phase 10 (ProductForm, PriceSimulation) menggunakan `input[type=number]`
- Fix bersifat class-level/global (bukan JSX/logic change) → konsisten dengan spirit PLAN 10-01
- Materials.jsx (di luar scope) ikut dapat manfaat karena fix global

## Goals

- **Goal 1 — Hilangkan native spinner arrow:** Tombol ▲▼ di sisi kanan `<input type="number">` harus tidak muncul di semua browser (Webkit + Firefox). Input menjadi pure numeric field tanpa control visual.
- **Goal 2 — Disable scroll wheel behavior:** Scroll mouse di atas focused input number tidak boleh mengubah value. Behavior ini sering menyebabkan bug UX saat user scroll page dengan cursor di atas input (nilai berubah tanpa sengaja).

## Approach

**Spinner arrow removal (Goal 1):**
- Global CSS rule di `src/index.css`
- Selector: `input[type="number"]`
- Rules:
  - `-webkit-inner-spin-button, -webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }` (Chrome/Safari/Edge)
  - `-moz-appearance: textfield;` (Firefox)
- Tempatkan di layer `@layer base` (Tailwind) supaya urutan cascade correct

**Scroll wheel disable (Goal 2):**
- JavaScript approach — CSS tidak bisa mengubah behavior ini
- Rekomendasi: **global event handler** di `src/App.jsx` (atau file entry lain)
  - `useEffect` mount → attach `wheel` listener ke `document`
  - Jika `document.activeElement.type === 'number'` → `e.target.blur()` (defocus akan cancel scroll behavior)
  - Cleanup listener saat unmount
- Alternatif: `onWheel` prop di setiap input — ditolak karena repetitif dan tidak scale

## Constraints

- **Do not touch JSX** — hanya CSS di `index.css` + 1 useEffect di App.jsx
- **Zero regression** — semua input number tetap fungsional (typing, arrow keys, click-to-edit)
- **Cross-browser** — verify di Chrome/Edge (Webkit) dan Firefox minimum
- **PLAN 10-01 boundaries tetap berlaku** — extend hanya menambah 1 task baru, tidak modify existing tasks
- **Konsisten dengan class-name-only pattern** — fix ini class/CSS level, boleh masuk

## Open Questions

- **Scroll disable strategy final:** Global handler di App.jsx (rekomendasi) VS custom hook? Planner decide. Kandidat: global handler.
- **File entry untuk global handler:** `src/App.jsx`, `src/main.jsx`, atau file baru `src/hooks/use-number-input-behavior.js`? Planner decide berdasarkan project convention.
- **Verification:** Perlu manual test 3 browser (Chrome, Firefox, Edge/Safari) atau cukup Chrome saja untuk MVP? User preference: cukup Chrome + Firefox.

## Additional Context

**Existing input[type=number] usage:**
- `src/pages/Materials.jsx` — dialog form (harga bahan, jumlah)
- `src/pages/ProductForm.jsx` — harga, stok, dimensi, BoM quantity
- `src/pages/PriceSimulation.jsx` — input harga jual, BoM quantity

**Existing styling status:**
- `grep input\[type=number\]` di `src/index.css` → **0 matches**
- Belum ada rule apapun untuk input number → true greenfield fix, tidak ada legacy CSS yang perlu di-override

**Impact scope:**
- Global — semua `input[type=number]` di app sekarang dan di masa depan otomatis benefit
- Tidak ada breaking change karena fix menghapus behavior, bukan menambah

---

*This file is temporary. It informs planning but is not required.*
*Created by /paul:discuss, consumed by /paul:plan.*
