import { useEffect } from 'react'
import { useData } from '../contexts/DataContext'
import { formatRupiah, formatNumber } from '../utils/formatters'
import {
  TrendingUp,
  Package,
  Layers,
  ShoppingBag,
  ArrowUpRight,
  AlertCircle,
  Database,
  Camera,
  Sparkles,
  Trophy
} from 'lucide-react'

const Dashboard = () => {
  const {
    categories,
    materials,
    products,
    loading,
    error,
    connectionStatus,
    refreshAll
  } = useData()

  useEffect(() => {
    refreshAll()
  }, [refreshAll])

  const totalProducts = products.length
  const totalMaterials = materials.length
  const totalCategories = categories.length

  const totalHPP = products.reduce((sum, p) => sum + (p.production_cost || 0), 0)
  const totalJual = products.reduce((sum, p) => sum + (p.estimated_selling_price || 0), 0)
  const totalLaba = totalJual - totalHPP

  const avgProductionCost = totalProducts > 0 ? totalHPP / totalProducts : 0
  const avgSellingPrice = totalProducts > 0 ? totalJual / totalProducts : 0
  const avgProfit = totalProducts > 0
    ? products.reduce((sum, p) => sum + (p.gross_profit_per_unit || 0), 0) / totalProducts
    : 0
  const avgMargin = avgSellingPrice > 0 ? ((avgProfit / avgSellingPrice) * 100) : 0

  const hppBarPct = avgSellingPrice > 0 ? Math.min((avgProductionCost / avgSellingPrice) * 100, 100) : 0

  const topProduct = products.length > 0
    ? products.reduce((best, p) => (p.gross_profit_per_unit || 0) > (best.gross_profit_per_unit || 0) ? p : best, products[0])
    : null

  const recentProducts = [...products]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 5)

  return (
    <div className="page-container pb-8">

      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded bg-accent-blue flex items-center justify-center overflow-hidden flex-shrink-0">
            <img
              src="https://lh3.googleusercontent.com/d/17d-UmkhNv1FxnkAZVuTt805LubWTPU9f"
              alt="ReKal Logo"
              className="w-7 h-7 object-contain"
            />
          </div>
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Ringkasan bisnis Anda</p>
          </div>
        </div>
      </div>

      {/* Connection Error */}
      {connectionStatus === 'error' && error && (
        <div className="glass-panel p-4 mb-4 border-danger/40 bg-danger/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-danger font-semibold mb-1">Koneksi Database Bermasalah</p>
              <p className="text-xs text-ink-muted">{error}</p>
              <div className="mt-2 flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-ink-muted" />
                <span className="text-xs text-ink-muted">Pastikan tabel Supabase sudah dibuat</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Two-column desktop layout */}
      <div className="lg:flex lg:gap-6 lg:items-start">

        {/* LEFT COLUMN */}
        <div className="lg:w-[38%] lg:sticky lg:top-4">

          {/* KPI Grid — 2x2 */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="stat-card">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className="w-4 h-4 text-accent-blue" />
                <span className="stat-label">Produk</span>
              </div>
              <p className="stat-value">{loading.products ? '—' : formatNumber(totalProducts)}</p>
            </div>

            <div className="stat-card">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-success" />
                <span className="stat-label">Material</span>
              </div>
              <p className="stat-value">{loading.materials ? '—' : formatNumber(totalMaterials)}</p>
            </div>

            <div className="stat-card">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-4 h-4 text-ink-muted" />
                <span className="stat-label">Kategori</span>
              </div>
              <p className="stat-value">{loading.categories ? '—' : formatNumber(totalCategories)}</p>
            </div>

            {/* Card Rata-rata Laba */}
            <div className="stat-card" style={{ background: '#EFF6FF', borderColor: '#BFDBFE' }}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-accent-blue" />
                <span className="stat-label" style={{ color: '#155EEF' }}>Rata-rata Laba</span>
              </div>
              <p className="stat-value text-sm" style={{ color: '#155EEF' }}>
                {loading.products ? '—' : formatRupiah(avgProfit)}
              </p>
              {!loading.products && avgMargin > 0 && (
                <p className="text-[11px] mt-1" style={{ color: '#155EEF' }}>+{avgMargin.toFixed(1)}% margin</p>
              )}
            </div>
          </div>

          {/* Total Nilai Bisnis */}
          {!loading.products && totalProducts > 0 && (
            <div className="glass-panel p-4 mb-4">
              <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">Total Nilai Bisnis</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[10px] text-ink-muted mb-1">Total HPP</p>
                  <p className="text-sm font-bold text-ink tabular-nums">{formatRupiah(totalHPP)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-ink-muted mb-1">Total Jual</p>
                  <p className="text-sm font-bold text-success tabular-nums">{formatRupiah(totalJual)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-ink-muted mb-1">Potensi Laba</p>
                  <p className="text-sm font-bold text-success tabular-nums">{formatRupiah(totalLaba)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Insight Bisnis */}
          {!loading.products && totalProducts > 0 && (
            <div className="glass-panel p-4 mb-4">
              <h3 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-blue" />
                Insight Bisnis
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <TrendingUp className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-ink">
                    Margin rata-rata produk Anda <span className="font-semibold text-success">{avgMargin.toFixed(1)}%</span>
                  </p>
                </div>
                {topProduct && (
                  <div className="flex items-start gap-2.5">
                    <Trophy className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-ink">
                      Laba tertinggi: <span className="font-semibold text-ink">{topProduct.name}</span>
                      {' '}— <span className="text-success tabular-nums">{formatRupiah(topProduct.gross_profit_per_unit)}</span>
                    </p>
                  </div>
                )}
                <div className="flex items-start gap-2.5">
                  <ShoppingBag className="w-4 h-4 text-ink-muted flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-ink">
                    Potensi laba seluruh produk: <span className="font-semibold text-success tabular-nums">{formatRupiah(totalLaba)}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:flex-1 lg:min-w-0">

          {/* Cost Summary + Progress Bar */}
          <div className="glass-panel p-4 mb-4">
            <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-ink-muted" />
              Rata-rata Biaya & Harga
            </h3>

            <div className="space-y-4">
              {/* HPP */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-ink-muted">HPP Rata-rata</span>
                  <span className="text-sm font-semibold text-ink tabular-nums">{formatRupiah(avgProductionCost)}</span>
                </div>
                <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-ink-muted rounded-full transition-all duration-700"
                    style={{ width: `${hppBarPct}%` }}
                  />
                </div>
              </div>

              {/* Harga Jual */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-ink-muted">Harga Jual Rata-rata</span>
                  <span className="text-sm font-semibold text-success tabular-nums">{formatRupiah(avgSellingPrice)}</span>
                </div>
                <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                  <div className="h-full bg-success rounded-full w-full" />
                </div>
              </div>

              <div className="h-px bg-hairline" />

              <div className="flex justify-between items-center">
                <span className="text-sm text-ink-muted">Margin Rata-rata</span>
                <span className="font-bold text-success text-base tabular-nums">
                  {avgSellingPrice > 0 ? avgMargin.toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Produk Terbaru */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-ink">Produk Terbaru</h3>
              <a href="/products" className="text-xs text-accent-blue flex items-center gap-1 hover:underline">
                Lihat Semua <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>

            {loading.products ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-accent-blue"></div>
              </div>
            ) : recentProducts.length === 0 ? (
              <div className="empty-state">
                <ShoppingBag className="empty-state-icon" />
                <p className="empty-state-title">Belum ada produk</p>
                <p className="empty-state-desc">Tambahkan produk pertama untuk melihat ringkasan HPP</p>
              </div>
            ) : (
              <div className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
                {recentProducts.map(product => (
                  <a
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="list-row flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {(() => {
                        const photoUrl = product.product_photos?.[0]?.photo_url ?? product.photo_url
                        return photoUrl ? (
                          <img
                            src={photoUrl}
                            alt={product.name}
                            className="w-9 h-9 rounded object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded bg-surface-2 flex items-center justify-center flex-shrink-0">
                            <Camera className="w-4 h-4 text-ink-muted" />
                          </div>
                        )
                      })()}
                      <p className="font-medium text-ink text-sm truncate">{product.name}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-success tabular-nums">{formatRupiah(product.estimated_selling_price)}</p>
                      <p className="text-[11px] text-ink-muted tabular-nums">+{formatRupiah(product.gross_profit_per_unit)}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default Dashboard
