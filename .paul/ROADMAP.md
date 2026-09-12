# ROADMAP.md — ReKal Blackbox v2

> Updated: 2026-09-12

## Project Overview

**ReKal** — Aplikasi manajemen Harga Pokok Produksi (HPP) untuk industri tas dan fashion.
PWA mobile-first berbasis React + Supabase, dengan desktop mode yang sedang dikembangkan.

---

## Completed Milestones

### v0.1 — Foundation & Code Quality ✅
*Completed: 2026-06-05*

| Phase | Name | Status |
|-------|------|--------|
| 01 | code-quality | ✅ Complete |

**Outcome:** Layer utils dan supabase bersih, tidak ada duplikasi kalkulasi HPP.

### v0.2 — Web Adaptation ✅
*Completed: 2026-06-06*

| Phase | Name | Status |
|-------|------|--------|
| 02 | web-adaptation | ✅ Complete |

**Outcome:** Desktop sidebar layout aktif di ≥ 1024px via Layout Wrapper Swap. Mobile path tidak diubah.

### v0.3 — Desktop UI Redesign ✅
*Completed: 2026-06-06*

| Phase | Name | Description | Status |
|-------|------|-------------|--------|
| 03 | desktop-foundation | Lepas batasan max-w-lg di desktop | ✅ Complete |
| 04 | desktop-list-views | Redesign Dashboard, Categories, Materials, Products | ✅ Complete |
| 05 | desktop-detail-views | Redesign ProductDetail, ProductForm, PriceSimulation | ✅ Complete |

**Outcome:** Semua halaman memanfaatkan lebar penuh di desktop via lg: prefix classes.

### v0.4 — Dashboard UI Enhancement ✅
*Completed: 2026-06-06*

| Phase | Name | Description | Status |
|-------|------|-------------|--------|
| 06 | dashboard-ui-redesign | Generate ulang Dashboard desktop dengan stitch | ✅ Complete |

**Outcome:** Dashboard desktop two-column layout (left 38% sticky overview, right flex-1 scrollable). Stitch design digunakan sebagai referensi. Mobile single-column tidak berubah.

### v0.5 — Framer UI Redesign ✅
*Completed: 2026-09-12*

Total visual overhaul menggunakan Framer design system sebagai referensi. Hapus glass-panel slate theme sepenuhnya, ganti dengan Framer's pure black canvas system — Inter Variable dengan tight tracking, white pill CTAs, gradient spotlight cards, dan monochrome surface hierarchy.

**Design reference:** `awesome-design-md/design-md/framer/DESIGN.md`

| Phase | Name | Description | Status |
|-------|------|-------------|--------|
| 07 | design-system | CSS tokens, Inter font, color vars, base utilities, komponen primitif | ✅ Complete |
| 08 | shell-navigation | Sidebar desktop + mobile nav — Framer black canvas | ✅ Complete |
| 09 | list-views | Dashboard, Products, Materials, Categories — design baru | ✅ Complete |
| 10 | detail-views | ProductDetail, ProductForm, PriceSimulation — detail + form | ✅ Complete |
| 11 | color-scheme-fix | Fix missing tokens + migrate slate→Framer + formalisasi semantic colors | ✅ Complete |

**Outcome:** Total visual overhaul selesai — seluruh UI (canvas #090909, Inter Variable, white pill CTAs, gradient spotlight cards). 14 files dimigrasikan bersih dari slate/emerald/amber. Stitch-driven per fase. Mobile fungsional. Data/logic tidak berubah.

---

## Phase Details

### Phase 07: design-system
**Goal:** Bangun fondasi Framer design system di codebase ReKal — token CSS, typography, color palette, dan komponen primitif yang akan digunakan semua fase berikutnya.

**Scope:**
- Ganti semua CSS custom properties di `index.css` dengan Framer tokens (canvas, surface-1, surface-2, ink, ink-muted, accent-blue, gradient colors)
- Setup Inter Variable font dengan OpenType character variants (cv01, cv05, cv09, cv11, ss03, ss07)
- Rewrite komponen primitif: `.btn-primary` → white pill, `.btn-secondary` → charcoal pill, `.glass-panel` → surface-1 card, `.input-field` → Framer input style
- Tailwind config update: warna sesuai Framer tokens
- Stitch digunakan untuk generate component reference

**Constraint:** Tidak mengubah JSX/logic halaman — hanya token dan CSS layer

---

### Phase 08: shell-navigation
**Goal:** Redesign sidebar desktop dan mobile navigation menggunakan Framer aesthetic.

**Scope:**
- Sidebar desktop: pure black canvas (#090909), white monochrome nav items, pill active state
- Mobile bottom nav: charcoal surface, pill active indicator
- Header/page title area: tight negative letter-spacing display style

**Constraint:** Navigation fungsionalitas tidak berubah — hanya visual

---

### Phase 09: list-views
**Goal:** Apply Framer design system ke semua halaman list/overview.

**Pages:**
- **Dashboard** — Black canvas, gradient spotlight card untuk KPI highlight, two-column desktop
- **Products** — Charcoal card grid, white pill add button
- **Materials** — Table dengan surface-1 rows, hairline dividers
- **Categories** — Compact surface-1 cards

**Constraint:** Stitch generate reference per halaman. Data/logic tidak berubah.

---

### Phase 10: detail-views
**Goal:** Apply Framer design system ke halaman detail dan form.

**Pages:**
- **ProductDetail** — Surface-1 panels, gradient spotlight untuk profit highlight
- **ProductForm** — Framer input style, charcoal form sections
- **PriceSimulation** — Black canvas dengan white display numbers, accent-blue highlights

**Constraint:** Stitch generate reference per halaman. Form behavior tidak berubah.

---

## Guiding Constraints

- **Framer design system:** canvas #090909, surface-1 #141414, surface-2 #1c1c1c, ink #ffffff, ink-muted #999999, accent-blue #0099ff
- **Typography:** Inter Variable + tight negative letter-spacing. Display: -1px to -5px. Body: -0.15px
- **CTAs:** White pill primary, charcoal pill secondary — TIDAK ada ghost button atau colored fill button
- **Gradients:** Spotlight cards saja (violet, magenta, orange, coral) — TIDAK sebagai section background
- **Mobile-first preserved:** Semua halaman tetap fungsional di mobile
- **Stitch-driven:** Setiap fase visual wajib generate Stitch reference sebelum implementasi
- **Data/logic immutable:** Hanya visual layer yang berubah
