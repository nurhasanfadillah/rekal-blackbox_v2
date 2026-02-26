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
  Calculator,
  Copy,
  Camera,
  Images
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

      {/* Products Grid */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map(product => {
            const photos = product.product_photos || []
            const hasPhotos = photos.length > 0
            const firstPhoto = hasPhotos ? photos.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))[0] : null
            
            return (
              <div 
                key={product.id} 
                className="group bg-slate-800/50 hover:bg-slate-800 rounded-2xl border border-slate-700/50 hover:border-primary-500/30 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-xl hover:shadow-primary-500/5"
              >
                {/* Product Image */}
                <a href={`/products/${product.id}`} className="block relative aspect-[4/3] overflow-hidden bg-slate-900">
                  {firstPhoto ? (
                    <>
                      <img 
                        src={firstPhoto.photo_url} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Photo Count Badge */}
                      {photos.length > 1 && (
                        <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg flex items-center gap-1.5 text-white text-xs">
                          <Images className="w-3.5 h-3.5" />
                          <span>{photos.length}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-violet/20 flex items-center justify-center mb-3">
                        <Camera className="w-8 h-8 text-primary-400/60" />
                      </div>
                      <span className="text-slate-600 text-sm">Belum ada foto</span>
                    </div>
                  )}
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>

                {/* Product Info */}
                <div className="p-4">
                  <a href={`/products/${product.id}`} className="block mb-3">
                    <h3 className="font-semibold text-white text-lg leading-tight group-hover:text-primary-400 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{product.description}</p>
                    )}
                  </a>

                  {/* COGS */}
                  <div className="flex items-center justify-between py-3 border-t border-slate-700/50 mb-3">
                    <span className="text-sm text-slate-400">HPP</span>
                    <span className="text-base font-semibold text-white">{formatRupiah(product.production_cost)}</span>
                  </div>


                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <a
                      href={`/products/copy/${product.id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-primary-500/20 text-slate-400 hover:text-primary-400 rounded-xl transition-all text-sm font-medium"
                    >
                      <Copy className="w-4 h-4" />
                      Salin
                    </a>
                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={deletingId === product.id}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-accent-rose/20 text-slate-400 hover:text-accent-rose rounded-xl transition-all text-sm font-medium disabled:opacity-50"
                    >
                      {deletingId === product.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-rose"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}

export default Products
