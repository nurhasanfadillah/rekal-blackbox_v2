import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { useToast } from '../components/Toast'
import { db } from '../supabase'

import { validateProductForm, hasErrors } from '../utils/validators'
import { calculateAllCosts } from '../utils/calculations'
import { formatRupiah } from '../utils/formatters'
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  X, 
  Package,
  Calculator,
  ChevronDown,
  Loader2,
  Images
} from 'lucide-react'
import MultiPhotoUpload from '../components/MultiPhotoUpload'



const ProductForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isEditMode = !!id && !location.pathname.includes('/copy/')
  const isCopyMode = location.pathname.includes('/copy/')

  
  const { 
    materials, 
    products,
    loading, 
    fetchMaterials, 
    fetchProducts,
    createProduct, 
    updateProduct,
    getProduct
  } = useData()
  const { success, error: showError } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    overhead_percentage: '20',
    target_margin_percentage: '30'
  })

  const [productPhotos, setProductPhotos] = useState([])
  const [bomItems, setBomItems] = useState([])

  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [loadingProduct, setLoadingProduct] = useState(isEditMode || isCopyMode)
  const [originalProductName, setOriginalProductName] = useState(null)


  // Calculated values

  const [calculations, setCalculations] = useState({
    totalMaterialCost: 0,
    productionCost: 0,
    sellingPrice: 0,
    grossProfit: 0
  })

  // Material selector state
  const [showMaterialSelector, setShowMaterialSelector] = useState(false)
  const [selectedMaterialIndex, setSelectedMaterialIndex] = useState(null)

  useEffect(() => {
    fetchMaterials()
    if (isEditMode || isCopyMode) {
      loadProduct()
    } else {
      fetchProducts()
    }
  }, [fetchMaterials, fetchProducts, isEditMode, isCopyMode])


  useEffect(() => {
    // Recalculate whenever BoM or percentages change
    const overhead = parseFloat(formData.overhead_percentage) || 0
    const margin = parseFloat(formData.target_margin_percentage) || 0
    const newCalculations = calculateAllCosts(bomItems, overhead, margin)
    setCalculations(newCalculations)
  }, [bomItems, formData.overhead_percentage, formData.target_margin_percentage])

  const loadProduct = async () => {
    try {
      const product = await getProduct(id)
      setFormData({
        name: isCopyMode ? '' : product.name,
        description: product.description || '',
        overhead_percentage: product.overhead_percentage.toString(),
        target_margin_percentage: product.target_margin_percentage.toString()
      })
      
      // Load product photos
      const photos = product.product_photos || []
      setProductPhotos(photos.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)))


      
      // Store original name for copy mode validation
      if (isCopyMode) {
        setOriginalProductName(product.name)
      }
      
      // Convert BoM items to form format
      const bomData = product.bill_of_materials?.map(item => ({
        material_id: item.material_id,
        material: item.materials,
        price: item.price,
        quantity: item.quantity
      })) || []
      
      setBomItems(bomData)
    } catch (err) {
      showError('Gagal memuat data produk')
      navigate('/products')
    } finally {
      setLoadingProduct(false)
    }
  }



  const handleAddBomItem = () => {
    setBomItems([...bomItems, { material_id: '', material: null, price: 0, quantity: 1 }])
  }

  const handleRemoveBomItem = (index) => {
    setBomItems(bomItems.filter((_, i) => i !== index))
  }

  const handleSelectMaterial = (material) => {
    if (selectedMaterialIndex !== null) {
      const newBomItems = [...bomItems]
      newBomItems[selectedMaterialIndex] = {
        material_id: material.id,
        material: material,
        price: material.standard_price,
        quantity: 1
      }
      setBomItems(newBomItems)
    }
    setShowMaterialSelector(false)
    setSelectedMaterialIndex(null)
  }

  const handleBomChange = (index, field, value) => {
    const newBomItems = [...bomItems]
    newBomItems[index] = {
      ...newBomItems[index],
      [field]: field === 'quantity' || field === 'price' ? parseFloat(value) || 0 : value
    }
    setBomItems(newBomItems)
  }

  const openMaterialSelector = (index) => {
    setSelectedMaterialIndex(index)
    setShowMaterialSelector(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const dataToValidate = {
      ...formData,
      overhead_percentage: parseFloat(formData.overhead_percentage) || 0,
      target_margin_percentage: parseFloat(formData.target_margin_percentage) || 0
    }
    
    const errors = validateProductForm(dataToValidate, bomItems, products, isEditMode ? id : null, isCopyMode ? originalProductName : null)
    setFormErrors(errors)


    
    if (hasErrors(errors)) {
      if (errors.bom) {
        showError(errors.bom)
      }
      return
    }
    
    setSubmitting(true)
    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        overhead_percentage: parseFloat(formData.overhead_percentage),
        target_margin_percentage: parseFloat(formData.target_margin_percentage)
      }

      
      const bomData = bomItems.map(item => ({
        material_id: item.material_id,
        price: item.price,
        quantity: item.quantity
      }))
      
      let savedProduct
      if (isEditMode) {
        savedProduct = await updateProduct(id, productData, bomData)
        success('Produk berhasil diperbarui')
      } else {
        savedProduct = await createProduct(productData, bomData)
        success(isCopyMode ? 'Produk berhasil disalin' : 'Produk berhasil ditambahkan')
      }
      
      // Save product photos
      const productId = isEditMode ? id : savedProduct.id
      const photosToSave = productPhotos.map((photo, index) => ({
        photo_url: photo.photo_url,
        display_order: index,
        file_name: photo.file_name || null,
        file_size: photo.file_size || null,
        mime_type: photo.mime_type || null
      }))
      await db.updateProductPhotos(productId, photosToSave)


      
      navigate('/products')
    } catch (err) {
      showError(err.message || 'Gagal menyimpan produk')
      setSubmitting(false)
    }
  }

  if (loadingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
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
        <h1 className="page-title mb-0">
          {isEditMode ? 'Edit Produk' : isCopyMode ? 'Salin Produk' : 'Tambah Produk'}
        </h1>

      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="glass-panel p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-primary-400" />
            Informasi Dasar
          </h3>
          
          {/* Product Photos Upload */}
          <div className="mb-4">
            <label className="input-label flex items-center gap-2">
              <Images className="w-4 h-4 text-primary-400" />
              Foto Produk
            </label>
            <MultiPhotoUpload
              productId={isEditMode ? id : null}
              existingPhotos={productPhotos}
              onPhotosChange={setProductPhotos}
              maxPhotos={10}
            />
          </div>

          
          <div className="space-y-4">
            <div>
              <label className="input-label">Nama Produk</label>

              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`input-field ${formErrors.name ? 'border-accent-rose' : ''}`}
                placeholder="Contoh: Tas Selempang Canvas"
              />
              {formErrors.name && (
                <p className="text-accent-rose text-xs mt-1">{formErrors.name}</p>
              )}

            </div>

            <div>
              <label className="input-label">Deskripsi (Opsional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field min-h-[80px] resize-none"
                placeholder="Deskripsi produk..."
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Calculation Parameters */}
        <div className="glass-panel p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-primary-400" />
            Parameter Perhitungan
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Overhead (%)</label>
              <input
                type="number"
                value={formData.overhead_percentage}
                onChange={(e) => setFormData({ ...formData, overhead_percentage: e.target.value })}
                className={`input-field ${formErrors.overhead_percentage ? 'border-accent-rose' : ''}`}
                placeholder="20"
                min="0"
                max="99"
              />
              {formErrors.overhead_percentage && (
                <p className="text-accent-rose text-xs mt-1">{formErrors.overhead_percentage}</p>
              )}

            </div>

            <div>
              <label className="input-label">Target Margin (%)</label>
              <input
                type="number"
                value={formData.target_margin_percentage}
                onChange={(e) => setFormData({ ...formData, target_margin_percentage: e.target.value })}
                className={`input-field ${formErrors.target_margin_percentage ? 'border-accent-rose' : ''}`}
                placeholder="30"
                min="0"
                max="99"
              />
              {formErrors.target_margin_percentage && (
                <p className="text-accent-rose text-xs mt-1">{formErrors.target_margin_percentage}</p>
              )}

            </div>
          </div>
        </div>

        {/* Bill of Materials */}
        <div className="glass-panel p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Package className="w-4 h-4 text-primary-400" />
              Komposisi Material
            </h3>
            <button
              type="button"
              onClick={handleAddBomItem}
              className="p-2 text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {bomItems.length === 0 ? (
            <div className="empty-state py-6">
              <Package className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-slate-500 text-sm">Belum ada material</p>
              <button
                type="button"
                onClick={handleAddBomItem}
                className="text-primary-400 text-sm mt-2 hover:underline"
              >
                + Tambah material
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {bomItems.map((item, index) => (
                <div key={index} className="glass-card p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-3">
                      {/* Material Selector */}
                      <button
                        type="button"
                        onClick={() => openMaterialSelector(index)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                          item.material 
                            ? 'bg-slate-800 border-slate-700 text-white' 
                            : 'bg-slate-800/50 border-slate-700/50 text-slate-500'
                        }`}
                      >
                        <span className="font-medium">
                          {item.material ? item.material.name : 'Pilih material...'}
                        </span>
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      </button>

                      {item.material && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-slate-500 mb-1 block">Harga</label>
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => handleBomChange(index, 'price', e.target.value)}
                              className="input-field py-2"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-500 mb-1 block">
                              Qty ({item.material.unit})
                            </label>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleBomChange(index, 'quantity', e.target.value)}
                              className="input-field py-2"
                              min="0.01"
                              step="0.01"
                            />
                          </div>
                        </div>
                      )}

                      {item.material && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500">Subtotal:</span>
                          <span className="font-semibold text-primary-400">
                            {formatRupiah(item.price * item.quantity)}
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveBomItem(index)}
                      className="p-2 text-accent-rose hover:bg-accent-rose/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calculation Preview */}
        <div className="glass-panel p-4 bg-gradient-to-br from-primary-900/30 to-accent-violet/20">
          <h3 className="text-sm font-semibold text-white mb-4">Preview Perhitungan</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Total Material</span>
              <span className="font-medium text-white">{formatRupiah(calculations.totalMaterialCost)}</span>
            </div>
            <div className="h-px bg-slate-700/50" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">HPP (dengan overhead)</span>
              <span className="font-medium text-primary-400">{formatRupiah(calculations.productionCost)}</span>
            </div>
            <div className="h-px bg-slate-700/50" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Estimasi Harga Jual</span>
              <span className="font-medium text-accent-emerald">{formatRupiah(calculations.sellingPrice)}</span>

            </div>
            <div className="h-px bg-slate-700/50" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Laba Kotor</span>
              <span className="font-medium text-accent-cyan">{formatRupiah(calculations.grossProfit)}</span>

            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="btn-secondary flex-1"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              isEditMode ? 'Simpan' : isCopyMode ? 'Salin' : 'Tambah'
            )}
          </button>

        </div>
      </form>

      {/* Material Selector Modal */}
      {showMaterialSelector && (
        <div className="modal-overlay" onClick={() => setShowMaterialSelector(false)}>
          <div className="modal-content max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Pilih Material</h2>
              <button 
                onClick={() => setShowMaterialSelector(false)}
                className="p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 -mx-6 px-6">
              {loading.materials ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
              ) : materials.length === 0 ? (
                <div className="empty-state py-8">
                  <Package className="w-12 h-12 text-slate-600 mb-3" />
                  <p className="text-slate-500">Belum ada material</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {materials.map(material => (
                    <button
                      key={material.id}
                      type="button"
                      onClick={() => handleSelectMaterial(material)}
                      className="w-full text-left p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">{material.name}</p>

                          <p className="text-xs text-slate-500">
                            {material.categories?.name} • {formatRupiah(material.standard_price)}/{material.unit}
                          </p>
                        </div>
                        <Package className="w-4 h-4 text-slate-600" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductForm
