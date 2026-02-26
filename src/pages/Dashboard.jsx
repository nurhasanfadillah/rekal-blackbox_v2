import { useEffect } from 'react'
import { useData } from '../contexts/DataContext'
import { formatRupiah, formatNumber } from '../utils/formatters'
import { 
  TrendingUp, 
  Package, 
  Layers, 
  ShoppingBag,
  ArrowUpRight,
  Calculator,
  AlertCircle,
  Database
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

  // Calculate statistics
  const totalProducts = products.length
  const totalMaterials = materials.length
  const totalCategories = categories.length
  
  const avgProductionCost = products.length > 0
    ? products.reduce((sum, p) => sum + (p.production_cost || 0), 0) / products.length
    : 0

  const avgSellingPrice = products.length > 0
    ? products.reduce((sum, p) => sum + (p.estimated_selling_price || 0), 0) / products.length
    : 0

  const avgProfit = products.length > 0
    ? products.reduce((sum, p) => sum + (p.gross_profit_per_unit || 0), 0) / products.length
    : 0

  const recentProducts = products.slice(0, 5)

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-violet flex items-center justify-center shadow-glow">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Ringkasan data HPP</p>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      {connectionStatus === 'error' && error && (
        <div className="glass-panel p-4 mb-4 border-accent-rose/30 bg-accent-rose/10">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-accent-rose flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-accent-rose font-medium mb-1">Koneksi Database Bermasalah</p>
              <p className="text-xs text-slate-400">{error}</p>
              <div className="mt-3 flex items-center gap-2">
                <Database className="w-4 h-4 text-slate-500" />
                <span className="text-xs text-slate-500">Pastikan tabel Supabase sudah dibuat</span>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="w-4 h-4 text-primary-400" />
            <span className="stat-label">Produk</span>
          </div>
          <p className="stat-value">{loading.products ? '...' : formatNumber(totalProducts)}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-accent-emerald" />
            <span className="stat-label">Material</span>
          </div>
          <p className="stat-value">{loading.materials ? '...' : formatNumber(totalMaterials)}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-accent-violet" />
            <span className="stat-label">Kategori</span>
          </div>
          <p className="stat-value">{loading.categories ? '...' : formatNumber(totalCategories)}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-accent-rose" />
            <span className="stat-label">Rata-rata Laba</span>
          </div>
          <p className="stat-value text-sm">{formatRupiah(avgProfit)}</p>
        </div>
      </div>

      {/* Cost Summary */}
      <div className="glass-panel p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary-400" />
          Rata-rata Biaya & Harga
        </h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">HPP Rata-rata</span>
            <span className="font-semibold text-white">{formatRupiah(avgProductionCost)}</span>
          </div>
          <div className="h-px bg-slate-800" />
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Harga Jual Rata-rata</span>
            <span className="font-semibold text-accent-emerald">{formatRupiah(avgSellingPrice)}</span>

          </div>
          <div className="h-px bg-slate-800" />
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Margin Rata-rata</span>
            <span className="font-semibold text-accent-cyan">
              {avgSellingPrice > 0 ? ((avgProfit / avgSellingPrice) * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Recent Products */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-300">Produk Terbaru</h3>
          <a href="/products" className="text-xs text-primary-400 flex items-center gap-1">
            Lihat Semua <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>

        {loading.products ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : recentProducts.length === 0 ? (
          <div className="empty-state">
            <ShoppingBag className="empty-state-icon" />
            <p className="empty-state-title">Belum ada produk</p>
            <p className="empty-state-desc">Tambahkan produk pertama Anda untuk melihat ringkasan HPP</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentProducts.map(product => (
              <a
                key={product.id}
                href={`/products/${product.id}`}
                className="list-item block"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-white mb-1">{product.name}</h4>

                    <p className="text-xs text-slate-500">
                      HPP: {formatRupiah(product.production_cost)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-accent-emerald text-sm">
                      {formatRupiah(product.estimated_selling_price)}
                    </p>
                    <p className="text-xs text-slate-500">
                      Laba: {formatRupiah(product.gross_profit_per_unit)}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
