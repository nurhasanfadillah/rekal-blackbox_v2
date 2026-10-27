import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { useConfirmation } from '../contexts/ConfirmationContext'
import { useToast } from '../components/Toast'
import { formatRupiah, formatPercentage } from '../utils/formatters'
import { validatePercentage } from '../utils/validators'
import { calculateAllCostsExtended } from '../utils/calculations'
import ProductPhotoGallery from '../components/ProductPhotoGallery'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { ProductDetailPdfDocument } from '../components/product-detail-pdf-template'
import { format } from 'date-fns'
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
  Factory,
  Images,
  BarChart2,
  Download,
  Save,
  X
} from 'lucide-react'

const CHART_COLORS = [
  '#2563EB', '#16A34A', '#7C3AED', '#D97706', '#DC2626',
  '#0891B2', '#65A30D', '#9333EA', '#EA580C', '#0F766E'
]

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProduct, deleteProduct, updateProduct } = useData()
  const { confirm } = useConfirmation()
  const { success, error: showError } = useToast()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [editingParameters, setEditingParameters] = useState(false)
  const [savingParameters, setSavingParameters] = useState(false)
  const [parameterDraft, setParameterDraft] = useState({})

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
    const isConfirmed = await confirm({
      title: 'Hapus Produk',
      message: 'Yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.',
      confirmLabel: 'Hapus',
      cancelLabel: 'Batal',
      variant: 'danger'
    })
    if (!isConfirmed) return

    setDeleting(true)
    try {
      await deleteProduct(id)
      navigate('/products')
    } catch (err) {
      console.error('Failed to delete product:', err)
      setDeleting(false)
    }
  }

  const startParameterEdit = () => {
    setParameterDraft({
      overhead_percentage: String(product.overhead_percentage ?? 0),
      target_margin_percentage: String(product.target_margin_percentage ?? 0),
      margin_jual_percentage: String(product.margin_jual_percentage ?? 20),
      admin_marketplace_percentage: String(product.admin_marketplace_percentage ?? 5),
    })
    setEditingParameters(true)
  }

  const handleParameterSave = async () => {
    const parameterLabels = {
      overhead_percentage: 'Overhead',
      target_margin_percentage: 'Margin Pabrik',
      margin_jual_percentage: 'Margin Jual',
      admin_marketplace_percentage: 'Admin Marketplace',
    }
    const invalidParameter = Object.entries(parameterLabels).find(([key, label]) =>
      validatePercentage(parameterDraft[key], label)
    )
    if (invalidParameter) {
      showError(validatePercentage(parameterDraft[invalidParameter[0]], invalidParameter[1]))
      return
    }

    setSavingParameters(true)
    try {
      const productData = {
        name: product.name,
        description: product.description || '',
        photo_url: product.photo_url || null,
        overhead_percentage: Number(parameterDraft.overhead_percentage),
        target_margin_percentage: Number(parameterDraft.target_margin_percentage),
        margin_jual_percentage: Number(parameterDraft.margin_jual_percentage),
        admin_marketplace_percentage: Number(parameterDraft.admin_marketplace_percentage),
      }
      const bomItems = (product.bill_of_materials || []).map(item => ({
        material_id: item.material_id,
        price: item.price,
        quantity: item.quantity,
      }))
      const updatedProduct = await updateProduct(id, productData, bomItems)
      setProduct(current => ({ ...current, ...updatedProduct }))
      setEditingParameters(false)
      success('Parameter dan harga produk berhasil diperbarui')
    } catch (err) {
      console.error('Failed to update product parameters:', err)
      showError(err.message || 'Gagal memperbarui parameter produk')
    } finally {
      setSavingParameters(false)
    }
  }

  const bomWithPct = useMemo(() => {
    if (!product) return []
    const total = product.total_material_cost || 0
    if (total === 0) return []
    return (product.bill_of_materials || [])
      .map((item, i) => {
        const subtotal = item.subtotal ?? (item.price * item.quantity)
        return { ...item, subtotal, pct: (subtotal / total) * 100, color: CHART_COLORS[i % CHART_COLORS.length] }
      })
      .sort((a, b) => b.subtotal - a.subtotal)
  }, [product])

  const parameterPreview = useMemo(() => {
    if (!product) return null
    const percentage = key => editingParameters
      ? Number(parameterDraft[key]) || 0
      : Number(product[key] ?? (key === 'margin_jual_percentage' ? 20 : key === 'admin_marketplace_percentage' ? 5 : 0))
    return calculateAllCostsExtended(
      (product.bill_of_materials || []).map(item => ({ price: item.price, quantity: item.quantity })),
      percentage('overhead_percentage'),
      percentage('target_margin_percentage'),
      percentage('margin_jual_percentage'),
      percentage('admin_marketplace_percentage'),
    )
  }, [product, editingParameters, parameterDraft])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue"></div>
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
  const marginJualPct = product.margin_jual_percentage ?? 20
  const adminPct = product.admin_marketplace_percentage ?? 5
  const exportDate = format(new Date(), 'dd MMMM yyyy')
  const exportFilename = `rekal-detail-${product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate('/products')}
          className="p-2 text-ink-muted hover:text-ink hover:bg-surface-1 rounded transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="page-title mb-0">Detail Produk</h1>
        </div>
        <div className="flex gap-1">
          <PDFDownloadLink
            document={<ProductDetailPdfDocument product={product} exportDate={exportDate} />}
            fileName={exportFilename}
            className="flex-shrink-0"
          >
            {({ loading: pdfLoading }) => (
              <button
                type="button"
                disabled={pdfLoading}
                aria-label={pdfLoading ? 'Menyiapkan PDF' : 'Ekspor detail produk ke PDF'}
                title="Ekspor PDF"
                className="btn-secondary flex items-center gap-2 px-3 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">{pdfLoading ? 'Menyiapkan…' : 'Ekspor PDF'}</span>
              </button>
            )}
          </PDFDownloadLink>
          <a
            href={`/products/copy/${id}`}
            className="p-2.5 text-ink-muted hover:text-accent-blue hover:bg-accent-blue/10 rounded transition-colors"
            title="Salin Produk"
          >
            <Copy className="w-5 h-5" />
          </a>
          <a
            href={`/products/${id}/edit`}
            className="p-2.5 text-ink-muted hover:text-accent-blue hover:bg-accent-blue/10 rounded transition-colors"
            title="Edit Produk"
          >
            <Edit2 className="w-5 h-5" />
          </a>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2.5 text-ink-muted hover:text-danger hover:bg-danger/10 rounded transition-colors disabled:opacity-50"
            title="Hapus Produk"
          >
            {deleting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-danger"></div>
            ) : (
              <Trash2 className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Two-column wrapper — flex aktif di lg+, single column di mobile */}
      <div className="product-detail-layout">

        {/* Kolom Kiri — gallery + nama produk (sticky di desktop) */}
        <div className="product-detail-primary">
          {/* Photo Gallery — diperbesar */}
          <div className="mb-5 rounded-lg overflow-hidden">
            <ProductPhotoGallery
              photos={photos}
              productName={product.name}
              maxHeight="380px"
            />
          </div>

          {/* Product Name & Description */}
          <div className="bg-surface-1 rounded-lg p-4 mb-5 border border-hairline">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded bg-accent-blue/10 flex items-center justify-center flex-shrink-0">
                {hasPhotos ? <Images className="w-5 h-5 text-accent-blue" /> : <Package className="w-5 h-5 text-accent-blue" />}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-ink leading-tight mb-1">{product.name}</h2>
                {product.description ? (
                  <p className="text-ink-muted text-sm leading-relaxed">{product.description}</p>
                ) : (
                  <p className="text-ink-muted text-sm italic">Tidak ada deskripsi</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan — harga, BoM, chart, parameter */}
        <div className="product-detail-secondary">
          {/* Primary price — Harga Pabrik */}
          <div className="product-price-hero rounded-lg p-5 mb-3 border border-success/30">
            <div className="flex items-center justify-center gap-2 mb-2 text-center">
              <Factory className="w-4 h-4 text-success" />
              <span className="text-xs font-semibold text-success uppercase tracking-widest">Harga Pabrik</span>
            </div>
            <p className="text-4xl sm:text-5xl font-bold text-success mb-3 tabular-nums text-center">
              {formatRupiah(product.harga_pabrik)}
            </p>
            <div className="flex items-center justify-center gap-2 text-sm">
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-success/10 text-success border border-success/30"
              >
                Margin pabrik {product.target_margin_percentage}%
              </span>
            </div>
          </div>

          {/* Supporting prices — shown in calculation order */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
            <div className="min-w-0 bg-surface-1 rounded-lg p-2 sm:p-4 border border-hairline hover:border-ink-muted transition-colors">
              <div className="flex items-center justify-center gap-1 mb-1.5 sm:gap-1.5 sm:mb-2 min-h-[24px] text-center">
                <Calculator className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 text-ink-muted" />
                <span className="text-[10px] sm:text-xs font-medium text-ink-muted uppercase tracking-tight sm:tracking-wide leading-tight">HPP Final</span>
              </div>
              <p className="text-[clamp(0.625rem,3vw,1.125rem)] sm:text-lg font-bold text-accent-blue tabular-nums whitespace-nowrap truncate text-center">{formatRupiah(product.production_cost)}</p>
              <p className="hidden sm:block text-xs text-ink-muted mt-1 text-center">Biaya produksi</p>
            </div>

            <div className="min-w-0 bg-surface-1 rounded-lg p-2 sm:p-4 border border-hairline hover:border-success/30 transition-colors">
              <div className="flex items-center justify-center gap-1 mb-1.5 sm:gap-1.5 sm:mb-2 min-h-[24px] text-center">
                <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 text-success" />
                <span className="text-[10px] sm:text-xs font-medium text-ink-muted uppercase tracking-tight sm:tracking-wide leading-tight">Harga Jual</span>
              </div>
              <p className="text-[clamp(0.625rem,3vw,1.125rem)] sm:text-lg font-bold tabular-nums text-success whitespace-nowrap truncate text-center">{formatRupiah(product.estimated_selling_price)}</p>
              <p className="hidden sm:block text-xs text-ink-muted mt-1 text-center">Margin jual {marginJualPct}%</p>
            </div>

            <div className="min-w-0 bg-surface-1 rounded-lg p-2 sm:p-4 border border-hairline hover:border-accent-blue/30 transition-colors">
              <div className="flex items-center justify-center gap-1 mb-1.5 sm:gap-1.5 sm:mb-2 min-h-[24px] text-center">
                <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 text-accent-blue" />
                <span className="text-[10px] sm:text-xs font-medium text-ink-muted uppercase tracking-tight sm:tracking-wide leading-tight line-clamp-2">Marketplace</span>
              </div>
              <p className="text-[clamp(0.625rem,3vw,1.125rem)] sm:text-lg font-bold tabular-nums text-accent-blue whitespace-nowrap truncate text-center">{formatRupiah(product.harga_marketplace)}</p>
              <p className="hidden sm:block text-xs text-ink-muted mt-1 text-center">Termasuk admin {adminPct}%</p>
            </div>
          </div>

          {/* Calculation Parameters — with edit shortcut */}
          <div className="bg-surface-1 rounded-lg p-5 mb-5 border border-hairline">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
                <Calculator className="w-4 h-4 text-accent-blue" />
                Parameter Perhitungan
              </h3>
              {editingParameters ? (
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setEditingParameters(false)} disabled={savingParameters} className="btn-secondary flex items-center gap-1 px-2.5 py-1.5 text-xs">
                    <X className="w-3.5 h-3.5" /> Batal
                  </button>
                  <button type="button" onClick={handleParameterSave} disabled={savingParameters} className="btn-primary flex items-center gap-1 px-2.5 py-1.5 text-xs disabled:opacity-50">
                    <Save className="w-3.5 h-3.5" /> {savingParameters ? 'Menyimpan…' : 'Simpan'}
                  </button>
                </div>
              ) : (
                <button type="button" onClick={startParameterEdit} className="flex items-center gap-1 text-xs text-accent-blue hover:text-accent-blue/80 transition-colors">
                  <Edit2 className="w-3 h-3" /> Quick edit
                </button>
              )}
            </div>

            <div className="space-y-2">
              {[
                { label: 'Overhead', key: 'overhead_percentage', value: product.overhead_percentage, amount: parameterPreview?.overheadAmount },
                { label: 'Margin Pabrik', key: 'target_margin_percentage', value: product.target_margin_percentage, amount: parameterPreview?.hargaPabrik - parameterPreview?.hppFinal },
                { label: 'Margin Jual', key: 'margin_jual_percentage', value: marginJualPct, amount: parameterPreview?.hargaJual - parameterPreview?.hargaPabrik },
                { label: 'Admin Marketplace', key: 'admin_marketplace_percentage', value: adminPct, amount: parameterPreview?.hargaMarketplace - parameterPreview?.hargaJual },
              ].map(({ label, key, value, amount }) => (
                <div key={label} className="flex items-center justify-between gap-3 py-2.5 px-3 rounded bg-surface-2/60 hover:bg-surface-2 transition-colors">
                  <div>
                    <span className="text-sm text-ink block">{label}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {editingParameters ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="99.99"
                          step="0.01"
                          inputMode="decimal"
                          aria-label={`${label} dalam persen`}
                          value={parameterDraft[key] ?? ''}
                          onChange={event => setParameterDraft(current => ({ ...current, [key]: event.target.value }))}
                          className="input-field w-20 py-2 text-right tabular-nums"
                          disabled={savingParameters}
                        />
                        <span className="text-sm text-ink-muted">%</span>
                      </div>
                    ) : null}
                    <span className="text-xs text-ink-muted tabular-nums">
                      {formatRupiah(amount)} ({formatPercentage(editingParameters ? Number(parameterDraft[key]) || 0 : value)})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Breakdown Chart */}
          {bomWithPct.length > 0 && (
            <div className="bg-surface-1 rounded-lg p-5 mb-5 border border-hairline">
              <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-accent-blue" />
                Breakdown Biaya Material
              </h3>

              {/* Stacked bar */}
              <div className="flex rounded-full overflow-hidden h-3 mb-4 gap-0.5">
                {bomWithPct.map((item) => (
                  <div
                    key={item.id}
                    style={{ width: `${item.pct}%`, background: item.color, minWidth: item.pct > 1 ? undefined : '2px' }}
                    title={`${item.materials?.name} — ${item.pct.toFixed(1)}%`}
                  />
                ))}
              </div>

              {/* Legend rows */}
              <div className="space-y-2.5">
                {bomWithPct.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                    <span className="text-sm text-ink flex-1 truncate">{item.materials?.name}</span>
                    <span className="text-xs text-ink-muted tabular-nums w-8 text-right">{item.pct.toFixed(0)}%</span>
                    <span className="text-sm font-medium text-ink tabular-nums">{formatRupiah(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-hairline-soft flex justify-between items-center">
                <span className="text-xs text-ink-muted">Total Biaya Material</span>
                <span className="text-sm font-bold text-ink tabular-nums">{formatRupiah(product.total_material_cost)}</span>
              </div>
            </div>
          )}

          {/* Bill of Materials */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-accent-blue" />
              Komposisi Material (BoM)
            </h3>

            {product.bill_of_materials?.length === 0 ? (
              <div className="bg-surface-1 rounded-lg p-8 text-center border border-hairline/30">
                <Package className="w-10 h-10 text-ink-muted mx-auto mb-3" />
                <p className="text-ink-muted text-sm">Tidak ada material</p>
                <a href={`/products/${id}/edit`} className="text-accent-blue text-sm mt-2 inline-block hover:underline">
                  + Tambah material
                </a>
              </div>
            ) : (
              <div className="space-y-2">
                {(product.bill_of_materials || []).map((item, index) => {
                  const subtotal = item.subtotal ?? (item.price * item.quantity)
                  const color = CHART_COLORS[index % CHART_COLORS.length]
                  return (
                    <div
                      key={item.id}
                      className="bg-surface-1 rounded-lg p-4 border border-hairline/50 hover:border-ink-muted transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                            style={{ background: color + '22', color }}
                          >
                            {index + 1}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-ink text-sm leading-tight">{item.materials?.name}</h4>
                            <p className="text-ink-muted mt-0.5" style={{ fontSize: '12px' }}>
                              {item.materials?.categories?.name}
                            </p>
                            <p className="text-ink-muted mt-0.5" style={{ fontSize: '12px' }}>
                              {formatRupiah(item.price)} / {item.materials?.unit}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-3">
                          <p className="font-bold text-ink text-sm tabular-nums">{formatRupiah(subtotal)}</p>
                          <p className="text-ink-muted mt-0.5 tabular-nums" style={{ fontSize: '12px' }}>
                            {item.quantity} {item.materials?.unit}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default ProductDetail
