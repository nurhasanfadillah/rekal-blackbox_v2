import { useState, useEffect } from 'react'
import { useData } from '../contexts/DataContext'
import { useToast } from '../components/Toast'
import { useConfirmation } from '../contexts/ConfirmationContext'
import { formatRupiah } from '../utils/formatters'
import {
  ShoppingBag,
  Plus,
  Search,
  Trash2,
  Copy,
  Camera,
  Images,
  TrendingUp
} from 'lucide-react'

const Products = () => {
  const { products, loading, errors, fetchProducts, deleteProduct } = useData()
  const { success, error: showError } = useToast()
  const { confirm } = useConfirmation()
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const filteredProducts = products.filter(prod =>
    prod.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = async (id) => {
    const isConfirmed = await confirm({
      title: 'Hapus Produk',
      message: 'Yakin ingin menghapus produk ini? Semua data BoM juga akan dihapus.',
      confirmLabel: 'Hapus',
      cancelLabel: 'Batal',
      variant: 'danger'
    })

    if (!isConfirmed) return

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

  const calcMargin = (hpp, jual) => {
    if (!hpp || !jual || hpp <= 0) return null
    return Math.round(((jual - hpp) / hpp) * 100)
  }

  return (
    <div className="page-container pb-24">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="page-title">Produk</h1>
            <p className="page-subtitle">Kelola produk dan hitung HPP</p>
          </div>
          <a href="/products/new" className="btn-primary flex items-center gap-2 hidden lg:inline-flex">
            <Plus className="w-4 h-4" />
            Tambah Produk
          </a>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari produk..."
            className="input-field pl-9"
          />
        </div>
      </div>

      {/* Error State */}
      {errors?.products && (
        <div className="bg-danger/8 border border-danger/30 rounded p-3 mb-4">
          <p className="text-danger text-sm">{errors.products}</p>
          <button
            onClick={fetchProducts}
            className="mt-2 text-xs text-danger underline hover:no-underline"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Products List */}
      {loading.products ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-accent-blue"></div>
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
        <>
          {/* Mobile card list */}
          <div className="lg:hidden">
            <div className="flex flex-col gap-2">
              {filteredProducts.map(product => {
                const photos = product.product_photos || []
                const hasPhotos = photos.length > 0
                const firstPhoto = hasPhotos
                  ? photos.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))[0]
                  : null
                const margin = calcMargin(product.production_cost, product.estimated_selling_price)

                return (
                  <div
                    key={product.id}
                    className="bg-surface-1 border border-hairline rounded transition-colors duration-150 overflow-hidden flex group"
                  >
                    {/* Foto Produk */}
                    <a
                      href={`/products/${product.id}`}
                      className="block relative flex-shrink-0 w-20 h-20 self-center ml-3 rounded overflow-hidden bg-surface-2"
                    >
                      {firstPhoto ? (
                        <>
                          <img
                            src={firstPhoto.photo_url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {photos.length > 1 && (
                            <div className="absolute top-1 right-1 px-1 py-0.5 bg-black/60 rounded flex items-center gap-0.5 text-white text-[10px]">
                              <Images className="w-2.5 h-2.5" />
                              <span>{photos.length}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-surface-2">
                          <Camera className="w-5 h-5 text-ink-muted" />
                        </div>
                      )}
                    </a>

                    {/* Info Produk */}
                    <div className="flex-1 px-3 py-3 flex flex-col justify-between min-w-0">
                      <div>
                        <a href={`/products/${product.id}`} className="block mb-1.5">
                          <h3 className="font-semibold text-ink text-sm leading-tight line-clamp-1">
                            {product.name}
                          </h3>
                          {product.description && (
                            <p className="text-[11px] text-ink-muted mt-0.5 line-clamp-1">{product.description}</p>
                          )}
                        </a>

                        <div className="flex items-end gap-3">
                          <div>
                            <p className="text-[10px] text-ink-muted leading-none mb-0.5">HPP</p>
                            <p className="text-sm text-ink-muted font-medium tabular-nums">{formatRupiah(product.production_cost)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-ink-muted leading-none mb-0.5">Jual</p>
                            <p className="text-sm text-ink font-bold tabular-nums">{formatRupiah(product.estimated_selling_price)}</p>
                          </div>
                          {margin !== null && (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-success/10 rounded">
                              <TrendingUp className="w-3 h-3 text-success" />
                              <span className="text-[11px] font-semibold text-success">
                                {margin > 0 ? '+' : ''}{margin}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Aksi */}
                    <div className="flex flex-col items-center justify-center gap-2 pr-3 pl-1">
                      <a
                        href={`/products/copy/${product.id}`}
                        title="Salin produk"
                        className="w-8 h-8 flex items-center justify-center rounded bg-surface-2 hover:bg-hairline text-ink-muted hover:text-ink transition-all"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId === product.id}
                        title="Hapus produk"
                        className="w-8 h-8 flex items-center justify-center rounded bg-surface-2 hover:bg-danger/10 text-ink-muted hover:text-danger transition-all disabled:opacity-40"
                      >
                        {deletingId === product.id ? (
                          <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-danger"></div>
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-hairline">
                  <th className="text-left text-xs font-semibold text-ink-muted uppercase tracking-wider pb-3 w-12">Foto</th>
                  <th className="text-left text-xs font-semibold text-ink-muted uppercase tracking-wider pb-3">Nama Produk</th>
                  <th className="text-right text-xs font-semibold text-ink-muted uppercase tracking-wider pb-3">HPP</th>
                  <th className="text-right text-xs font-semibold text-ink-muted uppercase tracking-wider pb-3">Harga Jual</th>
                  <th className="text-right text-xs font-semibold text-ink-muted uppercase tracking-wider pb-3">Margin</th>
                  <th className="text-right text-xs font-semibold text-ink-muted uppercase tracking-wider pb-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => {
                  const photos = product.product_photos || []
                  const firstPhoto = photos.length > 0
                    ? photos.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))[0]
                    : null
                  const margin = calcMargin(product.production_cost, product.estimated_selling_price)

                  return (
                    <tr key={product.id} className="border-b border-hairline hover:bg-surface-2/60 transition-colors group">
                      <td className="py-3 pr-3">
                        <a href={`/products/${product.id}`}>
                          {firstPhoto ? (
                            <img src={firstPhoto.photo_url} alt={product.name} className="w-9 h-9 rounded object-cover" />
                          ) : (
                            <div className="w-9 h-9 rounded bg-surface-2 flex items-center justify-center">
                              <Camera className="w-4 h-4 text-ink-muted" />
                            </div>
                          )}
                        </a>
                      </td>
                      <td className="py-3 pr-4">
                        <a href={`/products/${product.id}`} className="block">
                          <p className="font-medium text-ink text-sm">{product.name}</p>
                          {product.description && (
                            <p className="text-xs text-ink-muted mt-0.5 line-clamp-1">{product.description}</p>
                          )}
                        </a>
                      </td>
                      <td className="py-3 pr-4 text-right text-sm text-ink-muted tabular-nums">{formatRupiah(product.production_cost)}</td>
                      <td className="py-3 pr-4 text-right text-sm font-bold text-ink tabular-nums">{formatRupiah(product.estimated_selling_price)}</td>
                      <td className="py-3 pr-4 text-right">
                        {margin !== null && (
                          <span className={`text-sm font-semibold tabular-nums ${margin >= 0 ? 'text-success' : 'text-danger'}`}>
                            {margin > 0 ? '+' : ''}{margin}%
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`/products/copy/${product.id}`}
                            title="Salin produk"
                            className="w-8 h-8 flex items-center justify-center rounded bg-surface-2 hover:bg-hairline text-ink-muted hover:text-ink transition-all"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={deletingId === product.id}
                            title="Hapus produk"
                            className="w-8 h-8 flex items-center justify-center rounded bg-surface-2 hover:bg-danger/10 text-ink-muted hover:text-danger transition-all disabled:opacity-40"
                          >
                            {deletingId === product.id ? (
                              <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-danger"></div>
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* FAB Tambah Produk (mobile) */}
      <a
        href="/products/new"
        className="fixed bottom-24 right-5 w-13 h-13 bg-accent-blue hover:bg-deep-blue active:scale-95 rounded flex items-center justify-center transition-all duration-200 z-20 lg:hidden shadow-md"
        title="Tambah Produk"
        style={{ width: 52, height: 52 }}
      >
        <Plus className="w-6 h-6 text-white" />
      </a>
    </div>
  )
}

export default Products
