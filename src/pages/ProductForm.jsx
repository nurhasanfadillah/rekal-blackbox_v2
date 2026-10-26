import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { useToast } from '../components/Toast'
import { db } from '../supabase'

import { validateProductForm, hasErrors } from '../utils/validators'
import { calculateAllCostsExtended, calculateMaterialUsage } from '../utils/calculations'
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
  Images,
  Copy,
  Check
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
    target_margin_percentage: '10',
    margin_jual_percentage: '20',
    admin_marketplace_percentage: '5'
  })

  const [productPhotos, setProductPhotos] = useState([])
  const [removedPhotoUrls, setRemovedPhotoUrls] = useState([]) // Track deleted photos for storage cleanup
  const [bomItems, setBomItems] = useState([])

  // Material usage calculation state
  const [materialWidth, setMaterialWidth] = useState('')
  const [usageItems, setUsageItems] = useState([{ L: '', W: '', x: '' }])
  const [materialUsageResult, setMaterialUsageResult] = useState(0)
  const [copied, setCopied] = useState(false)

  const [formErrors, setFormErrors] = useState({})


  const [submitting, setSubmitting] = useState(false)
  const [loadingProduct, setLoadingProduct] = useState(isEditMode || isCopyMode)
  const [originalProductName, setOriginalProductName] = useState(null)


  // Calculated values

  const [calculations, setCalculations] = useState({
    totalMaterialCost: 0,
    overheadAmount: 0,
    hppFinal: 0,
    hargaPabrik: 0,
    hargaJual: 0,
    hargaMarketplace: 0
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
    const overhead = parseFloat(formData.overhead_percentage) || 0
    const marginPabrik = parseFloat(formData.target_margin_percentage) || 0
    const marginJual = parseFloat(formData.margin_jual_percentage) || 0
    const admin = parseFloat(formData.admin_marketplace_percentage) || 0
    const newCalculations = calculateAllCostsExtended(bomItems, overhead, marginPabrik, marginJual, admin)
    setCalculations(newCalculations)
  }, [bomItems, formData.overhead_percentage, formData.target_margin_percentage, formData.margin_jual_percentage, formData.admin_marketplace_percentage])

  // Calculate material usage in real-time
  useEffect(() => {
    const width = parseFloat(materialWidth) || 0
    const result = calculateMaterialUsage(usageItems, width)
    setMaterialUsageResult(result)
  }, [materialWidth, usageItems])


  const loadProduct = async () => {
    try {
      const product = await getProduct(id)
      setFormData({
        name: isCopyMode ? '' : product.name,
        description: product.description || '',
        overhead_percentage: product.overhead_percentage.toString(),
        target_margin_percentage: product.target_margin_percentage.toString(),
        margin_jual_percentage: (product.margin_jual_percentage ?? 20).toString(),
        admin_marketplace_percentage: (product.admin_marketplace_percentage ?? 5).toString()
      })
      
      // Load product photos
      const photos = product.product_photos || []
      setProductPhotos(photos.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)))
      setRemovedPhotoUrls([]) // Reset removed photos tracking



      
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

  // Material usage handlers
  const handleAddUsageItem = () => {
    setUsageItems([...usageItems, { L: '', W: '', x: '' }])
  }

  const handleRemoveUsageItem = (index) => {
    setUsageItems(usageItems.filter((_, i) => i !== index))
  }

  const handleUsageChange = (index, field, value) => {
    const newItems = [...usageItems]
    newItems[index] = { ...newItems[index], [field]: value }
    setUsageItems(newItems)
  }

  const handleCopyResult = async () => {
    const resultText = materialUsageResult.toFixed(1)
    console.log('Attempting to copy:', resultText)
    
    // Try modern Clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(resultText)
        console.log('Clipboard API success')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        return
      } catch (err) {
        console.log('Clipboard API failed:', err.message)
      }
    } else {
      console.log('Clipboard API not available or not secure context')
    }
    
    // Fallback 1: use document.execCommand('copy')
    let textArea = null
    try {
      textArea = document.createElement('textarea')
      textArea.value = resultText
      textArea.setAttribute('readonly', '')
      textArea.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;pointer-events:none;'
      document.body.appendChild(textArea)
      
      // Use setSelectionRange for better compatibility
      textArea.focus()
      textArea.setSelectionRange(0, textArea.value.length)
      
      const successful = document.execCommand('copy')
      console.log('execCommand result:', successful)
      
      if (successful) {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        return
      }
    } catch (err) {
      console.log('execCommand failed:', err.message)
    } finally {
      if (textArea && textArea.parentNode) {
        textArea.parentNode.removeChild(textArea)
      }
    }
    
    // Fallback 2: Show the result in a prompt for manual copy
    console.log('All copy methods failed, showing prompt')
    showError('Gagal menyalin hasil perhitungan')
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
        target_margin_percentage: parseFloat(formData.target_margin_percentage),
        margin_jual_percentage: parseFloat(formData.margin_jual_percentage),
        admin_marketplace_percentage: parseFloat(formData.admin_marketplace_percentage)
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
      await db.updateProductPhotos(productId, photosToSave, removedPhotoUrls)

      
      navigate('/products')

    } catch (err) {
      showError(err.message || 'Gagal menyimpan produk')
      setSubmitting(false)
    }
  }

  if (loadingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue"></div>
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => navigate('/products')}
          className="p-2 text-ink-muted hover:text-ink hover:bg-surface-1 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="page-title mb-0">
          {isEditMode ? 'Edit Produk' : isCopyMode ? 'Salin Produk' : 'Tambah Produk'}
        </h1>

      </div>

      <form onSubmit={handleSubmit}>
        <div className="lg:flex lg:gap-6 lg:items-start">
        {/* Kolom kiri — form inputs */}
        <div className="lg:w-5/12 lg:sticky lg:top-4 space-y-6">
        {/* Basic Info */}
        <div className="glass-panel p-4">
          <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-accent-blue" />
            Informasi Dasar
          </h3>
          
          {/* Product Photos Upload */}
          <div className="mb-4">
            <label className="input-label flex items-center gap-2">
              <Images className="w-4 h-4 text-accent-blue" />
              Foto Produk
            </label>
          <MultiPhotoUpload
            productId={isEditMode ? id : null}
            existingPhotos={productPhotos}
            onPhotosChange={(newPhotos) => {
              // Track removed photos for storage cleanup
              const removed = productPhotos.filter(
                oldPhoto => !newPhotos.find(newPhoto => newPhoto.id === oldPhoto.id)
              ).map(p => p.photo_url)
              
              if (removed.length > 0) {
                setRemovedPhotoUrls(prev => [...prev, ...removed])
              }
              
              setProductPhotos(newPhotos)
            }}
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
          <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-accent-blue" />
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
              <p className="text-xs text-ink-muted mt-1">% dari total material</p>
              {formErrors.overhead_percentage && (
                <p className="text-accent-rose text-xs mt-1">{formErrors.overhead_percentage}</p>
              )}
            </div>

            <div>
              <label className="input-label">Margin Pabrik (%)</label>
              <input
                type="number"
                value={formData.target_margin_percentage}
                onChange={(e) => setFormData({ ...formData, target_margin_percentage: e.target.value })}
                className={`input-field ${formErrors.target_margin_percentage ? 'border-accent-rose' : ''}`}
                placeholder="10"
                min="0"
                max="99"
              />
              <p className="text-xs text-ink-muted mt-1">% dari harga pabrik</p>
              {formErrors.target_margin_percentage && (
                <p className="text-accent-rose text-xs mt-1">{formErrors.target_margin_percentage}</p>
              )}
            </div>

            <div>
              <label className="input-label">Margin Jual (%)</label>
              <input
                type="number"
                value={formData.margin_jual_percentage}
                onChange={(e) => setFormData({ ...formData, margin_jual_percentage: e.target.value })}
                className={`input-field ${formErrors.margin_jual_percentage ? 'border-accent-rose' : ''}`}
                placeholder="20"
                min="0"
                max="99"
              />
              <p className="text-xs text-ink-muted mt-1">% dari harga jual</p>
              {formErrors.margin_jual_percentage && (
                <p className="text-accent-rose text-xs mt-1">{formErrors.margin_jual_percentage}</p>
              )}
            </div>

            <div>
              <label className="input-label">Admin Marketplace (%)</label>
              <input
                type="number"
                value={formData.admin_marketplace_percentage}
                onChange={(e) => setFormData({ ...formData, admin_marketplace_percentage: e.target.value })}
                className={`input-field ${formErrors.admin_marketplace_percentage ? 'border-accent-rose' : ''}`}
                placeholder="5"
                min="0"
                max="99"
              />
              <p className="text-xs text-ink-muted mt-1">% dari harga marketplace</p>
              {formErrors.admin_marketplace_percentage && (
                <p className="text-accent-rose text-xs mt-1">{formErrors.admin_marketplace_percentage}</p>
              )}
            </div>
          </div>
        </div>
        </div>{/* end kolom kiri */}

        {/* Kolom kanan — calculator, BoM, preview */}
        <div className="lg:w-7/12 space-y-6 mt-6 lg:mt-0">
        {/* Material Usage Calculation */}
        <div className="glass-panel p-4">
          <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-accent-blue" />
            Perhitungan Penggunaan Material
          </h3>

          {/* Material Width Input */}
          <div className="mb-4">
            <label className="input-label">Lebar Material</label>
            <input
              type="number"
              value={materialWidth}
              onChange={(e) => setMaterialWidth(e.target.value)}
              className="input-field"
              placeholder="Contoh: 140"
              min="0"
            />
          </div>

          {/* Usage Items */}
          <div className="space-y-3 mb-4">
            {usageItems.map((item, index) => (
              <div key={index} className="glass-card p-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-ink-muted mb-1 block">P (Panjang)</label>
                      <input
                        type="number"
                        value={item.L}
                        onChange={(e) => handleUsageChange(index, 'L', e.target.value)}
                        className="input-field py-2"
                        placeholder="L"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-ink-muted mb-1 block">L (Lebar)</label>
                      <input
                        type="number"
                        value={item.W}
                        onChange={(e) => handleUsageChange(index, 'W', e.target.value)}
                        className="input-field py-2"
                        placeholder="W"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-ink-muted mb-1 block">x (Qty)</label>
                      <input
                        type="number"
                        value={item.x}
                        onChange={(e) => handleUsageChange(index, 'x', e.target.value)}
                        className="input-field py-2"
                        placeholder="x"
                        min="0"
                      />
                    </div>
                  </div>
                  {usageItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveUsageItem(index)}
                      className="p-2 text-accent-rose hover:bg-accent-rose/10 rounded-lg transition-colors mt-5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Usage Item Button */}
          <button
            type="button"
            onClick={handleAddUsageItem}
            className="w-full py-2 border border-dashed border-hairline rounded text-ink-muted hover:text-accent-blue hover:border-accent-blue/50 transition-colors flex items-center justify-center gap-2 mb-4"
          >
            <Plus className="w-4 h-4" />
            Tambah Item
          </button>

          {/* Calculation Result */}
          <div className="bg-surface-1/50 rounded p-4 border border-hairline-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-ink-muted mb-1">Hasil Perhitungan</p>
                <p className="text-lg font-semibold text-accent-blue">
                  {materialUsageResult > 0 ? materialUsageResult.toFixed(1) : '0.0'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyResult}
                className="p-2 text-ink-muted hover:text-accent-blue hover:bg-accent-blue/10 rounded-lg transition-colors"
                title="Salin hasil"
              >
                {copied ? <Check className="w-5 h-5 text-success" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            {materialWidth > 0 && (
              <p className="text-xs text-ink-muted mt-2">
                Total: {usageItems.reduce((sum, item) => sum + ((parseFloat(item.L) || 0) * (parseFloat(item.W) || 0) * (parseFloat(item.x) || 0)), 0)} / {materialWidth} = {materialUsageResult > 0 ? materialUsageResult.toFixed(1) : '0.0'}
              </p>
            )}
          </div>
        </div>

        {/* Bill of Materials */}
        <div className="glass-panel p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
              <Package className="w-4 h-4 text-accent-blue" />
              Komposisi Material
            </h3>

            <button
              type="button"
              onClick={handleAddBomItem}
              className="p-2 text-accent-blue hover:bg-accent-blue/10 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {bomItems.length === 0 ? (
            <div className="empty-state py-6">
              <Package className="w-12 h-12 text-ink-muted mb-3" />
              <p className="text-ink-muted text-sm">Belum ada material</p>
              <button
                type="button"
                onClick={handleAddBomItem}
                className="text-accent-blue text-sm mt-2 hover:underline"
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
                        className={`w-full flex items-center justify-between p-3 rounded border transition-all ${
                          item.material 
                            ? 'bg-surface-1 border-hairline text-ink'
                            : 'bg-surface-1/50 border-hairline-soft text-ink-muted'
                        }`}
                      >
                        <span className="font-medium">
                          {item.material ? item.material.name : 'Pilih material...'}
                        </span>
                        <ChevronDown className="w-4 h-4 text-ink-muted" />
                      </button>

                      {item.material && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-ink-muted mb-1 block">Harga</label>
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => handleBomChange(index, 'price', e.target.value)}
                              className="input-field py-2"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-ink-muted mb-1 block">
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
                          <span className="text-ink-muted">Subtotal:</span>
                          <span className="font-semibold text-accent-blue">
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
        <div className="glass-panel p-4">
          <h3 className="text-sm font-semibold text-ink mb-4">Preview Perhitungan</h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-ink-muted">Total Material</span>
              <span className="font-medium text-ink">{formatRupiah(calculations.totalMaterialCost)}</span>
            </div>
            <div className="h-px bg-hairline-soft" />
            <div className="flex justify-between items-center pl-3 text-xs text-ink-muted">
              <span>+ Overhead ({formData.overhead_percentage}%)</span>
              <span>{formatRupiah(calculations.overheadAmount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-ink-muted">HPP Final</span>
              <span className="font-medium text-accent-blue">{formatRupiah(calculations.hppFinal)}</span>
            </div>
            <div className="h-px bg-hairline-soft" />
            <div className="flex justify-between items-center pl-3 text-xs text-ink-muted">
              <span>+ Margin Pabrik ({formData.target_margin_percentage}%)</span>
              <span>{formatRupiah(calculations.hargaPabrik - calculations.hppFinal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-ink-muted">Harga Pabrik</span>
              <span className="font-medium text-accent-blue">{formatRupiah(calculations.hargaPabrik)}</span>
            </div>
            <div className="h-px bg-hairline-soft" />
            <div className="flex justify-between items-center pl-3 text-xs text-ink-muted">
              <span>+ Margin Jual ({formData.margin_jual_percentage}%)</span>
              <span>{formatRupiah(calculations.hargaJual - calculations.hargaPabrik)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-ink-muted">Harga Jual</span>
              <span className="font-medium text-success">{formatRupiah(calculations.hargaJual)}</span>
            </div>
            <div className="h-px bg-hairline-soft" />
            <div className="flex justify-between items-center pl-3 text-xs text-ink-muted">
              <span>+ Admin Marketplace ({formData.admin_marketplace_percentage}%)</span>
              <span>{formatRupiah(calculations.hargaMarketplace - calculations.hargaJual)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-ink-muted">Harga Marketplace</span>
              <span className="font-bold text-ink">{formatRupiah(calculations.hargaMarketplace)}</span>
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
        </div>{/* end kolom kanan */}
        </div>{/* end lg:flex wrapper */}
      </form>

      {/* Material Selector Modal */}
      {showMaterialSelector && (
        <div className="modal-overlay" onClick={() => setShowMaterialSelector(false)}>
          <div className="modal-content max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-ink">Pilih Material</h2>
              <button 
                onClick={() => setShowMaterialSelector(false)}
                className="p-2 text-ink-muted hover:text-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 -mx-6 px-6">
              {loading.materials ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue"></div>
                </div>
              ) : materials.length === 0 ? (
                <div className="empty-state py-8">
                  <Package className="w-12 h-12 text-ink-muted mb-3" />
                  <p className="text-ink-muted">Belum ada material</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {materials.map(material => (
                    <button
                      key={material.id}
                      type="button"
                      onClick={() => handleSelectMaterial(material)}
                      className="w-full text-left p-3 rounded bg-surface-1 hover:bg-surface-2 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-ink">{material.name}</p>

                          <p className="text-xs text-ink-muted">
                            {material.categories?.name} • {formatRupiah(material.standard_price)}/{material.unit}
                          </p>
                        </div>
                        <Package className="w-4 h-4 text-ink-muted" />
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
