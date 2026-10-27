import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useData } from '../contexts/DataContext'
import { calculateAllCostsExtended } from '../utils/calculations'
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
  Layers,
  X,
  Search,
  RotateCcw
} from 'lucide-react'

// ── Searchable Product Combobox ──────────────────────────────────────────────
const ProductCombobox = ({ products, value, onChange, loading }) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [dropdownStyle, setDropdownStyle] = useState({})
  const triggerRef = useRef(null)
  const dropdownRef = useRef(null)
  const searchInputRef = useRef(null)

  const selected = products.find(p => p.id === value) || null

  const filtered = useMemo(() => {
    if (!query.trim()) return products
    const q = query.toLowerCase()
    return products.filter(p => p.name.toLowerCase().includes(q))
  }, [query, products])

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setDropdownStyle({
      position: 'fixed',
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    })
  }, [])

  useEffect(() => {
    if (open) {
      updatePosition()
      // focus tanpa scroll — hindari browser scroll ke posisi DOM portal
      requestAnimationFrame(() => {
        searchInputRef.current?.focus({ preventScroll: true })
      })
    }
  }, [open, updatePosition])

  useEffect(() => {
    const handler = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    window.addEventListener('scroll', () => open && updatePosition(), true)
    return () => {
      document.removeEventListener('mousedown', handler)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, updatePosition])

  const handleSelect = (product) => {
    onChange(product.id)
    setQuery('')
    setOpen(false)
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange('')
    setQuery('')
    setOpen(false)
  }

  return (
    <div>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => { setOpen(o => !o); setQuery('') }}
        className="w-full flex items-center justify-between gap-2 h-11 px-3 bg-surface-1 border border-hairline hover:border-ink-muted focus:border-accent-blue rounded text-sm transition-colors"
      >
        <span className={selected ? 'text-ink font-medium truncate' : 'text-ink-muted'}>
          {selected ? selected.name : loading ? 'Memuat produk...' : 'Cari & pilih produk...'}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0">
          {selected && (
            <span role="button" onClick={handleClear} className="p-0.5 text-ink-muted hover:text-ink">
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-ink-muted transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown — rendered via portal to escape stacking context */}
      {open && createPortal(
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className="bg-surface-1 border border-hairline rounded shadow-2xl overflow-hidden"
        >
          <div className="p-2 border-b border-hairline-soft">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Ketik nama produk..."
                className="w-full h-9 bg-surface-2 border border-hairline rounded-lg pl-8 pr-3 text-sm text-ink placeholder-ink-muted outline-none focus:border-accent-blue"
              />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-center text-ink-muted text-sm py-6">Produk tidak ditemukan</p>
            ) : (
              filtered.map(product => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleSelect(product)}
                  className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${
                    product.id === value
                      ? 'bg-accent-blue/20 text-accent-blue'
                      : 'text-ink hover:bg-surface-2'
                  }`}
                >
                  <p className="font-medium truncate">{product.name}</p>
                  {product.production_cost > 0 && (
                    <p className="text-xs text-ink-muted mt-0.5">HPP {formatRupiah(product.production_cost)}</p>
                  )}
                </button>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
const PriceSimulation = () => {
  const { products, materials, loading, fetchProducts, fetchMaterials } = useData()

  const [selectedProductId, setSelectedProductId] = useState('')
  const [overheadPercentage, setOverheadPercentage] = useState('10')
  const [marginPabrikPercentage, setMarginPabrikPercentage] = useState('25')
  const [marginJualPercentage, setMarginJualPercentage] = useState('35')
  const [adminMarketplacePercentage, setAdminMarketplacePercentage] = useState('14')
  const [bomItems, setBomItems] = useState([])
  const [showMaterialSelector, setShowMaterialSelector] = useState(false)
  const [selectedBomIndex, setSelectedBomIndex] = useState(null)
  const [materialSearch, setMaterialSearch] = useState('')
  const [bomCollapsed, setBomCollapsed] = useState(true)

  useEffect(() => {
    fetchProducts()
    fetchMaterials()
  }, [fetchProducts, fetchMaterials])

  const selectedProduct = useMemo(
    () => products.find(p => p.id === selectedProductId) || null,
    [selectedProductId, products]
  )

  useEffect(() => {
    if (selectedProduct) {
      const productBom = selectedProduct.bill_of_materials || []
      setBomItems(productBom.map(item => ({
        material_id: item.material_id,
        material: item.materials,
        price: item.price,
        quantity: item.quantity
      })))
      setOverheadPercentage(selectedProduct.overhead_percentage?.toString() || '10')
      setMarginPabrikPercentage(selectedProduct.target_margin_percentage?.toString() || '25')
      setMarginJualPercentage('35')
      setAdminMarketplacePercentage('14')
    } else {
      setBomItems([])
    }
  }, [selectedProduct])

  const calculations = useMemo(() => calculateAllCostsExtended(
    bomItems,
    parseFloat(overheadPercentage) || 0,
    parseFloat(marginPabrikPercentage) || 0,
    parseFloat(marginJualPercentage) || 0,
    parseFloat(adminMarketplacePercentage) || 0
  ), [bomItems, overheadPercentage, marginPabrikPercentage, marginJualPercentage, adminMarketplacePercentage])

  const filteredMaterials = useMemo(() => {
    if (!materialSearch.trim()) return materials
    const q = materialSearch.toLowerCase()
    return materials.filter(m => m.name.toLowerCase().includes(q))
  }, [materialSearch, materials])

  const handleAddBomItem = () =>
    setBomItems([...bomItems, { material_id: '', material: null, price: 0, quantity: 1 }])

  const handleRemoveBomItem = (index) =>
    setBomItems(bomItems.filter((_, i) => i !== index))

  const handleBomChange = (index, field, value) => {
    const newItems = [...bomItems]
    newItems[index] = {
      ...newItems[index],
      [field]: (field === 'quantity' || field === 'price') ? parseFloat(value) || 0 : value
    }
    setBomItems(newItems)
  }

  const openMaterialSelector = (index) => {
    setSelectedBomIndex(index)
    setMaterialSearch('')
    setShowMaterialSelector(true)
  }

  const handleSelectMaterial = (material) => {
    if (selectedBomIndex !== null) {
      const newItems = [...bomItems]
      newItems[selectedBomIndex] = {
        material_id: material.id,
        material,
        price: material.standard_price,
        quantity: newItems[selectedBomIndex]?.quantity || 1
      }
      setBomItems(newItems)
    }
    setShowMaterialSelector(false)
    setSelectedBomIndex(null)
    setMaterialSearch('')
  }

  const handleReset = () => {
    setSelectedProductId('')
    setBomItems([])
    setOverheadPercentage('10')
    setMarginPabrikPercentage('25')
    setMarginJualPercentage('35')
    setAdminMarketplacePercentage('14')
  }

  const hasData = bomItems.length > 0

  return (
    <div className="page-container pb-32 lg:pb-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <Calculator className="w-6 h-6 text-accent-blue" />
          Simulasi Harga
        </h1>
        <p className="page-subtitle">Hitung dan simulasikan harga jual produk</p>
      </div>

      <div className="simulation-layout">
      {/* Kolom kiri — inputs */}
      <div className="simulation-primary space-y-4">
      {/* Product Selection — Searchable Combobox */}
      <div className="glass-panel p-4 mb-4 xl:mb-0">
        <h3 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
          <Package className="w-4 h-4 text-accent-blue" />
          Pilih Produk
        </h3>
        <ProductCombobox
          products={products}
          value={selectedProductId}
          onChange={setSelectedProductId}
          loading={loading.products}
        />
        <p className="text-xs text-ink-muted mt-2">Opsional — kosongkan untuk simulasi manual</p>
      </div>

      {/* Parameters */}
      <div className="glass-panel p-4 mb-4 xl:mb-0">
        <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent-blue" />
          Parameter Perhitungan
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Overhead (%)', value: overheadPercentage, set: setOverheadPercentage, hint: '% dari total material' },
            { label: 'Margin Pabrik (%)', value: marginPabrikPercentage, set: setMarginPabrikPercentage, hint: '% dari harga pabrik' },
            { label: 'Margin Jual (%)', value: marginJualPercentage, set: setMarginJualPercentage, hint: '% dari harga jual' },
            { label: 'Admin Marketplace (%)', value: adminMarketplacePercentage, set: setAdminMarketplacePercentage, hint: '% dari harga marketplace' },
          ].map(({ label, value, set, hint }) => (
            <div key={label}>
              <label className="input-label">{label}</label>
              <input
                type="number"
                value={value}
                onChange={e => set(e.target.value)}
                className="input-field"
                min="0"
                max="99"
              />
              <p className="text-xs text-ink-muted mt-1">{hint}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bill of Materials — with editable price */}
      <div className="glass-panel p-4 mb-4 xl:mb-0">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => setBomCollapsed(!bomCollapsed)}
            className="flex items-center gap-2 text-sm font-semibold text-ink hover:text-ink transition-colors"
          >
            <Layers className="w-4 h-4 text-accent-blue" />
            Komposisi Material (BoM)
            {bomItems.length > 0 && (
              <span className="text-xs font-normal text-ink-muted">({bomItems.length})</span>
            )}
            <ChevronDown className={`w-4 h-4 text-ink-muted transition-transform duration-200 ${bomCollapsed ? '-rotate-90' : ''}`} />
          </button>
          {!bomCollapsed && (
            <button
              type="button"
              onClick={handleAddBomItem}
              className="p-2 text-accent-blue hover:bg-accent-blue/10 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>

        {!bomCollapsed && bomItems.length === 0 && (
          <div className="empty-state py-6">
            <Layers className="w-10 h-10 text-ink-muted mb-2" />
            <p className="text-ink-muted text-sm">Belum ada material</p>
            <button type="button" onClick={handleAddBomItem} className="text-accent-blue text-sm mt-2 hover:underline">
              + Tambah material
            </button>
          </div>
        )}

        {!bomCollapsed && bomItems.length > 0 && (
          <div className="space-y-3">
            {bomItems.map((item, index) => (
              <div key={index} className="glass-card p-3">
                {/* Material selector + remove */}
                <div className="flex items-center gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => openMaterialSelector(index)}
                    className={`flex-1 flex items-center justify-between h-10 px-3 rounded border text-sm transition-all ${
                      item.material
                        ? 'bg-surface-1 border-hairline text-ink'
                        : 'bg-surface-1/50 border-hairline-soft text-ink-muted'
                    }`}
                  >
                    <span className="truncate font-medium">
                      {item.material ? item.material.name : 'Pilih material...'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-ink-muted flex-shrink-0 ml-1" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveBomItem(index)}
                    className="p-2 text-accent-rose hover:bg-accent-rose/10 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Quantity, Price (editable), Subtotal */}
                {item.material && (
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-hairline-soft">
                    <div>
                      <label className="text-[10px] text-ink-muted block mb-1">
                        Jumlah ({item.material.unit})
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={e => handleBomChange(index, 'quantity', e.target.value)}
                        className="input-field text-sm py-1.5 px-2"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-ink-muted block mb-1">
                        Harga/unit (Rp)
                      </label>
                      <input
                        type="number"
                        value={item.price}
                        onChange={e => handleBomChange(index, 'price', e.target.value)}
                        className="input-field text-sm py-1.5 px-2"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-ink-muted block mb-1">Subtotal</label>
                      <div className="h-[34px] flex items-center px-2 bg-surface-1/50 rounded-lg text-sm font-semibold text-accent-blue">
                        {formatRupiah((item.price || 0) * (item.quantity || 0))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      </div>{/* end kolom kiri */}

      {/* Kolom kanan — results */}
      <div className="simulation-secondary space-y-4 mt-4 xl:mt-0">
      {/* Calculation Results */}
      <div className="glass-panel p-4 mb-3 xl:mb-0">
        <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-accent-blue" />
          Hasil Perhitungan
        </h3>

        <div className="space-y-3">
          <ResultRow
            icon={<Package className="w-4 h-4" />}
            label="Total Material"
            value={formatRupiah(calculations.totalMaterialCost)}
            valueClass="text-ink"
          />
          <Divider />
          <SubRow label={`+ Overhead (${overheadPercentage}%)`} value={formatRupiah(calculations.overheadAmount)} />
          <ResultRow
            icon={<Factory className="w-4 h-4" />}
            label="HPP Final"
            value={formatRupiah(calculations.hppFinal)}
            valueClass="text-accent-blue font-bold text-xl tabular-nums"
          />
          <Divider />
          <SubRow label={`+ Margin Pabrik (${marginPabrikPercentage}%)`} value={formatRupiah(calculations.hargaPabrik - calculations.hppFinal)} />
          <ResultRow
            icon={<Factory className="w-4 h-4" />}
            label="Harga Pabrik"
            value={formatRupiah(calculations.hargaPabrik)}
            valueClass="text-accent-blue font-semibold text-lg tabular-nums"
          />
          <Divider />
          <SubRow label={`+ Margin Jual (${marginJualPercentage}%)`} value={formatRupiah(calculations.hargaJual - calculations.hargaPabrik)} />
          <ResultRow
            icon={<TrendingUp className="w-4 h-4" />}
            label="Harga Jual"
            value={formatRupiah(calculations.hargaJual)}
            valueClass="text-success font-bold text-2xl tabular-nums"
          />
          <Divider />
          <SubRow label={`+ Admin Marketplace (${adminMarketplacePercentage}%)`} value={formatRupiah(calculations.hargaMarketplace - calculations.hargaJual)} />
          <ResultRow
            icon={<DollarSign className="w-4 h-4" />}
            label="Harga Marketplace"
            value={formatRupiah(calculations.hargaMarketplace)}
            valueClass="text-ink font-bold text-lg"
          />
        </div>
      </div>

      {/* Reset — small secondary link */}
      <button
        type="button"
        onClick={handleReset}
        className="flex items-center gap-1.5 mx-auto text-xs text-ink-muted hover:text-ink transition-colors py-2"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Reset Simulasi
      </button>
      </div>{/* end kolom kanan */}
      </div>{/* end lg:flex wrapper */}

      {/* ── Sticky Result Bar ── */}
      {hasData && (
        <div className="fixed bottom-16 left-0 right-0 z-10 px-4 pb-2 pointer-events-none lg:hidden">
          <div className="bg-surface-1 backdrop-blur-md border border-hairline rounded-lg px-4 py-3 shadow-2xl pointer-events-auto">
            <div className="grid grid-cols-3 divide-x divide-hairline text-center">
              <div className="pr-3">
                <p className="text-[10px] text-ink-muted mb-0.5">HPP</p>
                <p className="text-sm font-bold text-accent-blue">{formatRupiah(calculations.hppFinal)}</p>
              </div>
              <div className="px-3">
                <p className="text-[10px] text-ink-muted mb-0.5">Harga Jual</p>
                <p className="text-sm font-bold text-success">{formatRupiah(calculations.hargaJual)}</p>
              </div>
              <div className="pl-3">
                <p className="text-[10px] text-ink-muted mb-0.5">Marketplace</p>
                <p className="text-sm font-bold text-ink">{formatRupiah(calculations.hargaMarketplace)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Material Selector Modal ── */}
      {showMaterialSelector && (
        <div className="modal-overlay" onClick={() => setShowMaterialSelector(false)}>
          <div
            className="modal-content max-h-[80vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-ink">Pilih Material</h2>
              <button onClick={() => setShowMaterialSelector(false)} className="p-2 text-ink-muted hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
              <input
                autoFocus
                type="text"
                value={materialSearch}
                onChange={e => setMaterialSearch(e.target.value)}
                placeholder="Cari material..."
                className="w-full h-10 bg-surface-1 border border-hairline rounded pl-9 pr-3 text-sm text-ink placeholder-ink-muted outline-none focus:border-accent-blue"
              />
            </div>

            <div className="overflow-y-auto flex-1 -mx-6 px-6">
              {loading.materials ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue" />
                </div>
              ) : filteredMaterials.length === 0 ? (
                <div className="empty-state py-8">
                  <Package className="w-10 h-10 text-ink-muted mb-2" />
                  <p className="text-ink-muted text-sm">Tidak ada material</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredMaterials.map(material => (
                    <button
                      key={material.id}
                      type="button"
                      onClick={() => handleSelectMaterial(material)}
                      className="w-full text-left p-3 rounded-xl bg-surface-1 hover:bg-surface-2 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-ink text-sm">{material.name}</p>
                          <p className="text-xs text-ink-muted mt-0.5">
                            {formatRupiah(material.standard_price)} / {material.unit}
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

// ── Small helpers ────────────────────────────────────────────────────────────
const ResultRow = ({ icon, label, value, valueClass }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-ink-muted flex items-center gap-2">{icon}{label}</span>
    <span className={valueClass}>{value}</span>
  </div>
)

const SubRow = ({ label, value }) => (
  <div className="flex justify-between items-center pl-3 text-xs text-ink-muted">
    <span>{label}</span>
    <span>{value}</span>
  </div>
)

const Divider = () => <div className="h-px bg-hairline-soft" />

export default PriceSimulation
