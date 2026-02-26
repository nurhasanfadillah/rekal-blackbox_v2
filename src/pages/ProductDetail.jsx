import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { formatRupiah, formatPercentage } from '../utils/formatters'
import ProductPhotoGallery from '../components/ProductPhotoGallery'
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
  Camera,
  Images,
  FileText
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

  const photos = product.product_photos || []
  const hasPhotos = photos.length > 0

  return (
    <div className="page-container">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => navigate('/products')}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="page-title mb-0">Detail Produk</h1>
        </div>

        <div className="flex gap-2">
          <a 
            href={`/products/copy/${id}`}
            className="p-2.5 text-primary-400 hover:bg-primary-500/10 rounded-xl transition-colors"
            title="Salin Produk"
          >
            <Copy className="w-5 h-5" />
          </a>
          <a 
            href={`/products/${id}/edit`}
            className="p-2.5 text-primary-400 hover:bg-primary-500/10 rounded-xl transition-colors"
            title="Edit Produk"
          >
            <Edit2 className="w-5 h-5" />
          </a>
          <button 
            onClick={handleDelete}
            disabled={deleting}
            className="p-2.5 text-accent-rose hover:bg-accent-rose/10 rounded-xl transition-colors disabled:opacity-50"
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

      {/* Photo Gallery */}
      <div className="mb-6">
        <ProductPhotoGallery 
          photos={photos}
          productName={product.name}
          maxHeight="320px"
        />
      </div>

      {/* Product Info Card */}
      <div className="glass-panel p-5 mb-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-violet/20 flex items-center justify-center flex-shrink-0">
            {hasPhotos ? (
              <Images className="w-6 h-6 text-primary-400" />
            ) : (
              <Package className="w-6 h-6 text-primary-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white mb-1 leading-tight">{product.name}</h2>
            {product.description ? (
              <p className="text-slate-400 text-sm leading-relaxed">{product.description}</p>
            ) : (
              <p className="text-slate-600 text-sm italic">Tidak ada deskripsi</p>
            )}
          </div>
        </div>
      </div>

      {/* Cost Summary Cards - Elegant Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-primary-500/20 rounded-lg">
              <Calculator className="w-4 h-4 text-primary-400" />
            </div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">HPP</span>
          </div>
          <p className="text-lg font-bold text-white">{formatRupiah(product.production_cost)}</p>
          <p className="text-xs text-slate-500 mt-1">Biaya produksi per unit</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-accent-emerald/20 rounded-lg">
              <DollarSign className="w-4 h-4 text-accent-emerald" />
            </div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Harga Jual</span>
          </div>
          <p className="text-lg font-bold text-accent-emerald">{formatRupiah(product.estimated_selling_price)}</p>
          <p className="text-xs text-slate-500 mt-1">Estimasi harga pasar</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-accent-cyan/20 rounded-lg">
              <TrendingUp className="w-4 h-4 text-accent-cyan" />
            </div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Laba</span>
          </div>
          <p className="text-lg font-bold text-accent-cyan">{formatRupiah(product.gross_profit_per_unit)}</p>
          <p className="text-xs text-slate-500 mt-1">Keuntungan per unit</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-accent-violet/20 rounded-lg">
              <Layers className="w-4 h-4 text-accent-violet" />
            </div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Margin</span>
          </div>
          <p className="text-lg font-bold text-accent-violet">
            {product.estimated_selling_price > 0 
              ? ((product.gross_profit_per_unit / product.estimated_selling_price) * 100).toFixed(1) 
              : 0}%
          </p>
          <p className="text-xs text-slate-500 mt-1">Persentase keuntungan</p>
        </div>
      </div>

      {/* Calculation Parameters */}
      <div className="glass-panel p-5 mb-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <div className="p-1.5 bg-primary-500/20 rounded-lg">
            <FileText className="w-4 h-4 text-primary-400" />
          </div>
          Parameter Perhitungan
        </h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                <Package className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <span className="text-sm text-slate-400 block">Total Biaya Material</span>
              </div>
            </div>
            <span className="font-semibold text-white">{formatRupiah(product.total_material_cost)}</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                <Calculator className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <span className="text-sm text-slate-400 block">Overhead</span>
              </div>
            </div>
            <span className="font-semibold text-white">{formatPercentage(product.overhead_percentage)}</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <span className="text-sm text-slate-400 block">Target Margin</span>
              </div>
            </div>
            <span className="font-semibold text-white">{formatPercentage(product.target_margin_percentage)}</span>
          </div>
        </div>
      </div>


      {/* Bill of Materials */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <div className="p-1.5 bg-primary-500/20 rounded-lg">
            <Package className="w-4 h-4 text-primary-400" />
          </div>
          Komposisi Material (BoM)
        </h3>

        {product.bill_of_materials?.length === 0 ? (
          <div className="bg-slate-800/30 rounded-2xl p-8 text-center border border-slate-700/30">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-500">Tidak ada material</p>
            <a 
              href={`/products/${id}/edit`}
              className="text-primary-400 text-sm mt-2 inline-block hover:underline"
            >
              + Tambah material
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {product.bill_of_materials?.map((item, index) => (
              <div key={item.id} className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/30 hover:border-slate-600/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-violet/20 flex items-center justify-center text-primary-400 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{item.materials?.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.materials?.categories?.name} • {formatRupiah(item.price)}/{item.materials?.unit}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">{formatRupiah(item.subtotal)}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.quantity} {item.materials?.unit}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Total Material Cost */}
      <div className="bg-gradient-to-r from-primary-900/30 to-accent-violet/20 rounded-2xl p-5 border border-primary-500/20">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <span className="text-sm text-slate-400 block">Total Biaya Material</span>
            </div>
          </div>
          <span className="font-bold text-xl text-primary-400">{formatRupiah(product.total_material_cost)}</span>
        </div>
      </div>

    </div>
  )
}

export default ProductDetail
