---
phase: 12-number-input-fix
created: 2026-09-12
status: ready-for-planning
---

# Phase Context: 12 — Number Input Fix

## Goals

- **Cegah scroll wheel mengubah nilai input number** — user sering ke-scroll tidak sengaja saat mengisi form, nilai berubah tanpa disadari (bug UX utama)
- **Hilangkan spinner arrows** (▲▼) di semua `<input type="number">` — konsisten dengan Framer aesthetic (pure black canvas, no native browser chrome)
- Zero regression: perilaku keyboard/typing input tetap normal, validasi form tidak berubah

## Constraints

- **Zero refactor form** — tidak mengubah struktur JSX form yang sudah ada, tidak mengubah props/handlers
- **Zero dependency baru** — solusi native CSS + JS, tanpa library eksternal
- **Universal cakupan** — solusi otomatis berlaku ke SEMUA input number di seluruh aplikasi, tidak per-file
- **Framer aesthetic preserved** — spinner hilang total (bukan diganti tombol custom)
- **Mobile tetap fungsional** — keyboard numeric masih muncul untuk `type="number"` di mobile

## Approach

- **Strategi:** Global CSS + global wheel handler — minimal invasive, zero form refactor
- **File baru:**
  - `src/hooks/useDisableNumberInputWheel.js` — custom hook yang mount global wheel listener, blur `activeElement` jika bertype "number" saat wheel event
- **File yang diubah:**
  - `src/index.css` — tambah rule untuk hide spinner arrows:
    - WebKit (Chrome/Safari/Edge): `input[type="number"]::-webkit-inner-spin-button, input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }`
    - Firefox: `input[type="number"] { -moz-appearance: textfield; appearance: textfield; }`
  - `src/App.jsx` — panggil `useDisableNumberInputWheel()` sekali di top level

## Expected Behavior

- **Wheel scroll di input number ter-focus** → input di-blur, nilai TIDAK berubah, page scroll TIDAK terganggu
- **Arrow keys (↑↓) di keyboard** → tetap increment/decrement (bukan sumber masalah, hanya wheel)
- **Typing nilai** → normal, tanpa gangguan
- **Focus/blur programmatic** → tidak terpengaruh

## Out of Scope

- Refactor form input jadi komponen custom (`<NumberInput>`) — future phase kalau butuh DRY
- Format ribuan otomatis (`1.000.000`) — future phase
- Ganti `type="number"` → `type="text"` dengan `inputMode="decimal"` — over-engineering untuk skop ini
- Perubahan validasi form atau logic bisnis
- Perubahan visual form lainnya

## Affected Files (perkiraan — verifikasi saat /paul:plan)

**Form files yang punya `<input type="number">` (kena efek tapi TIDAK diedit):**
- `src/pages/ProductForm.jsx` (dan sub-komponennya)
- `src/pages/MaterialForm.jsx` / `MaterialsPage.jsx`
- `src/pages/CategoryForm.jsx` / `CategoriesPage.jsx`
- `src/pages/PriceSimulation.jsx`
- Form/input number lain yang teridentifikasi saat planning

**File yang benar-benar diubah:**
- `src/index.css`
- `src/App.jsx`
- `src/hooks/useDisableNumberInputWheel.js` (baru)

## Reference

- **Milestone:** v0.5.1 — Post-Framer Polish (patch milestone melengkapi loose end v0.5)
- **Root cause insight:** User awalnya minta "hilangkan spinner", tapi diskusi mengungkap real target adalah "scroll tidak ubah nilai" — spinner arrows dihilangkan sebagai bonus konsistensi
- **Design context:** `awesome-design-md/design-md/framer/DESIGN.md` (Framer black canvas — no native browser chrome)
