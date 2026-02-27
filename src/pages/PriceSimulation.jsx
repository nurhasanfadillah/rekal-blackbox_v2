import { useState, useEffect, useMemo } from 'react'
import { useData } from '../contexts/DataContext'
import { calculateAllCosts } from '../utils/calculations'
import { formatRupiah } from '../utils/formatters'
import { 
  Calculator, 
  Package, 
  Plus, 
  Trash2, 
  ChevronDown,
  TrendingUp,
  DollarSign,
  Factory,
  Layers
} from 'lucide-react'

const PriceSimulation = () => {
  const { products, materials, loading, fetchProducts, fetchMaterials } = useData()

  // Form state
  const [selectedProductId, setSelectedProductId] = useState('')
  const [overheadPercentage, setOverheadPercentage] = useState('20')
  const [targetMarginPercentage, setTargetMarginPercentage] = useState('30')
  
  // BoM items state (temporary)
  const [bomItems, setBomItems] = useState([])

  // Material selector state
  const [showMaterialSelector, setShowMaterialSelector] = useState(false)
  const [selectedBomIndex, setSelectedBomIndex] = useState(null)
  const [currentMaterialCategory, setCurrentMaterialCategory] = useState('')


  // Load data on mount
  useEffect(() => {
    fetchProducts()
    fetchMaterials()
  }, [fetchProducts, fetchMaterials])

  // Get selected product details
  const selectedProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId) || null
  }, [selectedProductId, products])

  // When product changes, load its BoM
  useEffect(() => {
    if (selectedProduct) {
      // Load product's BoM if available
      const productBom = selectedProduct.bill_of_materials || []
      const formattedBom = productBom.map(item => ({
        material_id: item.material_id,
        material: item.materials,
        price: item.price,
        quantity: item.quantity
      }))
      setBomItems(formattedBom)
      
      // Load product's calculation parameters
      setOverheadPercentage(selectedProduct.overhead_percentage?.toString() || '20')
      setTargetMarginPercentage(selectedProduct.target_margin_percentage?.toString() || '30')
    } else {
      setBomItems([])
    }
  }, [selectedProduct])

  // Calculate costs in real-time
  const calculations = useMemo(() => {
    const overhead = parseFloat(overheadPercentage) || 0
    const margin = parseFloat(targetMarginPercentage) || 0
    return calculateAllCosts(bomItems, overhead, margin)
  }, [bomItems, overheadPercentage, targetMarginPercentage])

  // Group materials by category for the selector
  const materialsByCategory = useMemo(() => {
    const grouped = {}
    materials.forEach(material => {
      const categoryId = material.category_id || 'uncategorized'
      const categoryName = material.categories?.name || 'Tanpa Kategori'
      
      if (!grouped[categoryId]) {
        grouped[categoryId] = {
          id: categoryId,
          name: categoryName,
          materials: []
        }
      }
      grouped[categoryId].materials.push(material)
    })
    return grouped
  }, [materials])

  // Get categories list for dropdown
  const categoriesList = useMemo(() => {
    return Object.values(materialsByCategory)
  }, [materialsByCategory])

  // Filtered materials based on current material's category
  const filteredMaterials = useMemo(() => {
    if (!currentMaterialCategory) return materials
    return materials.filter(m => {
      const materialCategoryId = m.category_id || 'uncategorized'
      return materialCategoryId === currentMaterialCategory
    })
  }, [currentMaterialCategory, materials])


  const handleAddBomItem = () => {
    setBomItems([...bomItems, { material_id: '', material: null, price: 0, quantity: 1 }])
  }

  const handleRemoveBomItem = (index) => {
    setBomItems(bomItems.filter((_, i) => i !== index))
  }

  const handleSelectMaterial = (material) => {
    if (selectedBomIndex !== null) {
      const newBomItems = [...bomItems]
      const currentQuantity = newBomItems[selectedBomIndex]?.quantity || 1
      newBomItems[selectedBomIndex] = {
        material_id: material.id,
        material: material,
        price: material.standard_price,
        quantity: currentQuantity
      }
      setBomItems(newBomItems)
    }
    setShowMaterialSelector(false)
    setSelectedBomIndex(null)
    setCurrentMaterialCategory('')
  }



  const handleBomChange = (index, field, value) => {
    const newBomItems = [...bomItems]
    newBomItems[index] = {
      ...newBomItems[index],
      [field]: field === 'quantity' || field === 'price' ? parseFloat(value) || 0 : value
    }
    setBomItems(newBomItems)
  }

  const calculateSubtotal = (price, quantity) => {
    return (price || 0) * (quantity || 0)
  }


  const openMaterialSelector = (index) => {
    setSelectedBomIndex(index)
    // Get the category of the current material at this index
    const currentItem = bomItems[index]
    const categoryId = currentItem?.material?.category_id || 'uncategorized'
    setCurrentMaterialCategory(categoryId)
    setShowMaterialSelector(true)
  }


  const handleReset = () => {
    setSelectedProductId('')
    setBomItems([])
    setOverheadPercentage('20')
    setTargetMarginPercentage('30')
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <Calculator className="w-6 h-6 text-primary-400" />
          Simulasi Harga
        </h1>
        <p className="page-subtitle">Hitung dan simulasikan harga jual produk</p>
      </div>

      {/* Product Selection */}
      <div className="glass-panel p-4 mb-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <Package className="w-4 h-4 text-primary-400" />
          Pilih Produk
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="input-label">Produk</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="input-field"
            >
              <option value="">-- Pilih produk --</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          {loading.products && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
              Memuat produk...
            </div>
          )}
        </div>
      </div>

      {/* Calculation Parameters */}
      <div className="glass-panel p-4 mb-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary-400" />
          Parameter Perhitungan
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="input-label">Overhead (%)</label>
            <input
              type="number"
              value={overheadPercentage}
              onChange={(e) => setOverheadPercentage(e.target.value)}
              className="input-field"
              placeholder="20"
              min="0"
              max="99"
            />
          </div>

          <div>
            <label className="input-label">Target Margin (%)</label>
            <input
              type="number"
              value={targetMarginPercentage}
              onChange={(e) => setTargetMarginPercentage(e.target.value)}
              className="input-field"
              placeholder="30"
              min="0"
              max="99"
            />
          </div>
        </div>
      </div>

      {/* Bill of Materials */}
      <div className="glass-panel p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary-400" />
            Komposisi Material (BoM)
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
            <Layers className="w-12 h-12 text-slate-600 mb-3" />
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
                <div className="flex items-center gap-3 mb-3">
                  {/* Material Name Only */}
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() => openMaterialSelector(index)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                        item.material 
                          ? 'bg-slate-800 border-slate-700 text-white' 
                          : 'bg-slate-800/50 border-slate-700/50 text-slate-500'
                      }`}
                    >
                      <span className="font-medium truncate">
                        {item.material ? item.material.name : 'Pilih material...'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveBomItem(index)}
                    className="p-2 text-accent-rose hover:bg-accent-rose/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Quantity, Price, and Subtotal */}
                {item.material && (
                  <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-700/50">
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">Jumlah</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleBomChange(index, 'quantity', e.target.value)}
                          className="input-field text-sm py-2"
                          min="0"
                          step="0.01"
                        />
                        <span className="text-xs text-slate-500 whitespace-nowrap">{item.material.unit}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">Harga</label>
                      <div className="p-2 bg-slate-800/50 rounded-lg text-sm text-slate-300">
                        {formatRupiah(item.price)}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">Subtotal</label>
                      <div className="p-2 bg-slate-800/50 rounded-lg text-sm font-medium text-primary-400">
                        {formatRupiah(calculateSubtotal(item.price, item.quantity))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}


      </div>

      {/* Calculation Results */}
      <div className="glass-panel p-4 bg-gradient-to-br from-primary-900/30 to-accent-violet/20 mb-4">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary-400" />
          Hasil Perhitungan
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Total Material
            </span>
            <span className="font-medium text-white">{formatRupiah(calculations.totalMaterialCost)}</span>
          </div>
          <div className="h-px bg-slate-700/50" />
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400 flex items-center gap-2">
              <Factory className="w-4 h-4" />
              HPP (dengan overhead)
            </span>
            <span className="font-medium text-primary-400">{formatRupiah(calculations.productionCost)}</span>
          </div>
          <div className="h-px bg-slate-700/50" />
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Estimasi Harga Jual
            </span>
            <span className="font-medium text-accent-emerald text-lg">{formatRupiah(calculations.sellingPrice)}</span>
          </div>
          <div className="h-px bg-slate-700/50" />
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Laba Kotor
            </span>
            <span className="font-medium text-accent-cyan">{formatRupiah(calculations.grossProfit)}</span>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <button
        type="button"
        onClick={handleReset}
        className="w-full py-3 border border-slate-600 rounded-xl text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
      >
        Reset Simulasi
      </button>

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
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 -mx-6 px-6">

              {loading.materials ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
              ) : filteredMaterials.length === 0 ? (
                <div className="empty-state py-8">
                  <Package className="w-12 h-12 text-slate-600 mb-3" />
                  <p className="text-slate-500">Tidak ada material</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredMaterials.map(material => (
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
                            {formatRupiah(material.standard_price)}/{material.unit}
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

export default PriceSimulation
