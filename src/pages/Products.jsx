import { useState, useEffect } from 'react'
import { useData } from '../contexts/DataContext'
import { useToast } from '../components/Toast'
import { formatRupiah } from '../utils/formatters'
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  Trash2, 
  ArrowRight,
  Calculator
} from 'lucide-react'

const Products = () => {
  const { products, loading, errors, fetchProducts, deleteProduct } = useData()

  const { success, error: showError } = useToast()

  
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const filteredProducts = products.filter(prod => 
    prod.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus produk ini? Semua data BoM juga akan dihapus.')) return

    setDeletingId(id)
    try {
      await deleteProduct(id)
      success('Produk berhasil dihapus')
    } catch (err) {
      showError(err.message || 'Gagal menghapus produk')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Produk</h1>
        <p className="page-subtitle">Kelola produk dan hitung HPP</p>
      </div>

      {/* Search & Add */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari produk..."
            className="input-field pl-10"
          />
        </div>
        <a href="/products/new" className="btn-primary px-4 flex items-center gap-2">
          <Plus className="w-5 h-5" />
        </a>
      </div>

      {/* Error State */}
      {errors?.products && (
        <div className="bg-accent-rose/10 border border-accent-rose/30 rounded-xl p-4 mb-4">
          <p className="text-accent-rose text-sm">{errors.products}</p>

          <button 
            onClick={fetchProducts}
            className="mt-2 text-xs text-accent-rose underline hover:no-underline"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Products List */}
      {loading.products ? (

        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state">
          <ShoppingBag className="empty-state-icon" />
          <p className="empty-state-title">Belum ada produk</p>
          <p className="empty-state-desc">Tambahkan produk untuk menghitung HPP dan estimasi harga jual</p>
          <a href="/products/new" className="btn-primary mt-4 inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Tambah Produk
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map(product => (
            <div key={product.id} className="list-item">
              <a href={`/products/${product.id}`} className="block">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/30 to-accent-violet/30 flex items-center justify-center">
                      <Calculator className="w-6 h-6 text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{product.name}</h3>
                      {product.description && (
                        <p className="text-xs text-slate-500 line-clamp-1">{product.description}</p>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-600" />
                </div>

                {/* Cost Summary */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-800/50 rounded-lg p-2">
                    <p className="text-xs text-slate-500 mb-1">HPP</p>
                    <p className="text-sm font-semibold text-white">{formatRupiah(product.production_cost)}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-2">
                    <p className="text-xs text-slate-500 mb-1">Harga Jual</p>
                    <p className="text-sm font-semibold text-accent-emerald">{formatRupiah(product.estimated_selling_price)}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-2">
                    <p className="text-xs text-slate-500 mb-1">Laba</p>
                    <p className="text-sm font-semibold text-accent-cyan">{formatRupiah(product.gross_profit_per_unit)}</p>
                  </div>
                </div>
              </a>

              <div className="flex justify-end mt-3 pt-3 border-t border-slate-700/50">
                <button
                  onClick={() => handleDelete(product.id)}
                  disabled={deletingId === product.id}
                  className="flex items-center gap-2 px-3 py-2 text-accent-rose hover:bg-accent-rose/10 rounded-lg transition-colors text-sm disabled:opacity-50"
                >
                  {deletingId === product.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-rose"></div>
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Products
