import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { formatRupiah, formatPercentage } from '../utils/formatters'
import { 
  ArrowLeft, 
  Edit2, 
  Trash2, 
  Package, 
  TrendingUp, 
  DollarSign,
  Calculator,
  Layers,
  Copy,
  Camera
} from 'lucide-react'



const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProduct, deleteProduct } = useData()
  
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadProduct()
  }, [id])

  const loadProduct = async () => {
    try {
      const data = await getProduct(id)
      setProduct(data)
    } catch (err) {
      console.error('Failed to load product:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return
    
    setDeleting(true)
    try {
      await deleteProduct(id)
      navigate('/products')
    } catch (err) {
      console.error('Failed to delete product:', err)
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <Package className="empty-state-icon" />
          <p className="empty-state-title">Produk tidak ditemukan</p>
          <button onClick={() => navigate('/products')} className="btn-primary mt-4">
            Kembali ke Daftar Produk
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => navigate('/products')}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            {product.photo_url ? (
              <img 
                src={product.photo_url} 
                alt={product.name}
                className="w-16 h-16 rounded-2xl object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/30 to-accent-violet/30 flex items-center justify-center">
                <Camera className="w-8 h-8 text-primary-400" />
              </div>
            )}
            <div>
              <h1 className="page-title mb-0">{product.name}</h1>
              {product.description && (
                <p className="text-sm text-slate-500">{product.description}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <a 
            href={`/products/copy/${id}`}
            className="p-2 text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
            title="Salin Produk"
          >
            <Copy className="w-5 h-5" />
          </a>
          <a 
            href={`/products/${id}/edit`}
            className="p-2 text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
            title="Edit Produk"
          >
            <Edit2 className="w-5 h-5" />
          </a>
          <button 
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 text-accent-rose hover:bg-accent-rose/10 rounded-lg transition-colors disabled:opacity-50"
            title="Hapus Produk"
          >
            {deleting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent-rose"></div>
            ) : (
              <Trash2 className="w-5 h-5" />
            )}
          </button>
        </div>

      </div>

      {/* Cost Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-4 h-4 text-primary-400" />
            <span className="stat-label">HPP</span>
          </div>
          <p className="stat-value text-primary-400">{formatRupiah(product.production_cost)}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-accent-emerald" />
            <span className="stat-label">Harga Jual</span>
          </div>
          <p className="stat-value text-accent-emerald">{formatRupiah(product.estimated_selling_price)}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-accent-cyan" />
            <span className="stat-label">Laba per Unit</span>
          </div>
          <p className="stat-value text-accent-cyan">{formatRupiah(product.gross_profit_per_unit)}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-accent-violet" />
            <span className="stat-label">Margin</span>
          </div>
          <p className="stat-value text-accent-violet">
            {product.estimated_selling_price > 0 
              ? ((product.gross_profit_per_unit / product.estimated_selling_price) * 100).toFixed(1) 
              : 0}%
          </p>
        </div>
      </div>

      {/* Calculation Parameters */}
      <div className="glass-panel p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-primary-400" />
          Parameter Perhitungan
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Total Biaya Material</span>
            <span className="font-medium text-white">{formatRupiah(product.total_material_cost)}</span>
          </div>
          <div className="h-px bg-slate-800" />
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Overhead</span>
            <span className="font-medium text-white">{formatPercentage(product.overhead_percentage)}</span>
          </div>
          <div className="h-px bg-slate-800" />
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Target Margin</span>
            <span className="font-medium text-white">{formatPercentage(product.target_margin_percentage)}</span>
          </div>
        </div>
      </div>

      {/* Bill of Materials */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <Package className="w-4 h-4 text-primary-400" />
          Komposisi Material (BoM)
        </h3>

        {product.bill_of_materials?.length === 0 ? (
          <div className="empty-state py-8">
            <Package className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-slate-500">Tidak ada material</p>
          </div>
        ) : (
          <div className="space-y-3">
            {product.bill_of_materials?.map((item, index) => (
              <div key={item.id} className="glass-card p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center text-primary-400 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{item.materials?.name}</h4>
                      <p className="text-xs text-slate-500">
                        {item.materials?.categories?.name} • {formatRupiah(item.price)}/{item.materials?.unit}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">{formatRupiah(item.subtotal)}</p>
                    <p className="text-xs text-slate-500">
                      {item.quantity} {item.materials?.unit}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Total */}
      <div className="glass-panel p-4 mt-4">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-white">Total Material</span>
          <span className="font-bold text-xl text-primary-400">{formatRupiah(product.total_material_cost)}</span>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
