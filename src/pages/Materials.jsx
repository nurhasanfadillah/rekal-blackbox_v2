import { useState, useEffect } from 'react'
import { useData } from '../contexts/DataContext'
import { useToast } from '../components/Toast'
import { useConfirmation } from '../contexts/ConfirmationContext'
import { validateMaterialForm, hasErrors } from '../utils/validators'
import { formatRupiah } from '../utils/formatters'
import { supabase } from '../supabase'

import { 
  Package, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Layers,
  ShoppingBag,
  Link
} from 'lucide-react'




const Materials = () => {
  const { 
    materials, 
    categories, 
    products,
    loading, 
    errors,
    fetchMaterials, 
    fetchCategories,
    createMaterial, 
    updateMaterial, 
    deleteMaterial 
  } = useData()

  const { success, error: showError } = useToast()
  const { confirm } = useConfirmation()

  
  const [searchQuery, setSearchQuery] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    standard_price: '',
    unit: 'Pcs'
  })
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [materialUsageCounts, setMaterialUsageCounts] = useState({})

  useEffect(() => {
    fetchMaterials()
    fetchCategories()
  }, [fetchMaterials, fetchCategories])

  // Fetch material usage counts when materials change
  useEffect(() => {
    const fetchUsageCounts = async () => {
      const counts = {}
      for (const material of materials) {
        const count = await getMaterialUsageCount(material.id)
        counts[material.id] = count
      }
      setMaterialUsageCounts(counts)
    }
    
    if (materials.length > 0) {
      fetchUsageCounts()
    }
  }, [materials])


  const filteredMaterials = materials.filter(mat => 
    mat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mat.categories?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getMaterialUsageCount = async (materialId) => {
    try {
      const { data, error } = await supabase
        .from('bill_of_materials')
        .select('id')
        .eq('material_id', materialId)
      
      if (error) throw error
      return data ? data.length : 0
    } catch (err) {
      console.error('Failed to get material usage count:', err)
      return 0
    }
  }



  const openModal = (material = null) => {
    setEditingMaterial(material)
    setFormData({
      name: material?.name || '',
      category_id: material?.category_id || '',
      standard_price: material?.standard_price?.toString() || '',
      unit: material?.unit || 'Pcs'
    })
    setFormErrors({})
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingMaterial(null)
    setFormData({
      name: '',
      category_id: '',
      standard_price: '',
      unit: 'Pcs'
    })
    setFormErrors({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const dataToValidate = {
      ...formData,
      standard_price: parseFloat(formData.standard_price) || 0
    }
    
    const errors = validateMaterialForm(dataToValidate, materials, editingMaterial?.id)
    setFormErrors(errors)
    
    if (hasErrors(errors)) return
    
    setSubmitting(true)
    try {
      const materialData = {
        name: formData.name.trim(),
        category_id: formData.category_id,
        standard_price: parseFloat(formData.standard_price),
        unit: formData.unit
      }
      
      if (editingMaterial) {
        await updateMaterial(editingMaterial.id, materialData)
        success('Material berhasil diperbarui')
      } else {
        await createMaterial(materialData)
        success('Material berhasil ditambahkan')
      }
      closeModal()
    } catch (err) {
      showError(err.message || 'Gagal menyimpan material')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    const usageCount = await getMaterialUsageCount(id)
    if (usageCount > 0) {
      showError(`Gagal menghapus: Material masih digunakan dalam ${usageCount} produk.`)
      return
    }

    const isConfirmed = await confirm({
      title: 'Hapus Material',
      message: 'Yakin ingin menghapus material ini? Tindakan ini tidak dapat dibatalkan.',
      confirmLabel: 'Hapus',
      cancelLabel: 'Batal',
      variant: 'danger'
    })
    
    if (!isConfirmed) return

    setDeletingId(id)
    try {
      await deleteMaterial(id)
      success('Material berhasil dihapus')
    } catch (err) {
      showError(err.message || 'Gagal menghapus material')
    } finally {
      setDeletingId(null)
    }
  }



  const unitOptions = [
    { value: 'Pcs', label: 'Pcs (Pieces)' },
    { value: 'Cm', label: 'Cm (Centimeter)' }
  ]

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Material</h1>
        <p className="page-subtitle">Katalog bahan baku produksi</p>
      </div>

      {/* Search & Add */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari material..."
            className="input-field pl-10"
          />
        </div>
        <button onClick={() => openModal()} className="btn-primary px-4">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Error State */}
      {errors?.materials && (
        <div className="bg-accent-rose/10 border border-accent-rose/30 rounded-xl p-4 mb-4">
          <p className="text-accent-rose text-sm">{errors.materials}</p>

          <button 
            onClick={() => { fetchMaterials(); fetchCategories(); }}
            className="mt-2 text-xs text-accent-rose underline hover:no-underline"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Materials List */}
      {loading.materials ? (

        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="empty-state">
          <Package className="empty-state-icon" />
          <p className="empty-state-title">Belum ada material</p>
          <p className="empty-state-desc">Tambahkan material untuk digunakan dalam produk</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMaterials.map(material => {
            const category = categories.find(c => c.id === material.category_id)
            const usageCount = materialUsageCounts[material.id] || 0
            const isInUse = usageCount > 0
            
            return (
              <div key={material.id} className="list-item">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent-emerald/20 flex items-center justify-center">
                      <Package className="w-5 h-5 text-accent-emerald" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{material.name}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {category && (
                          <span className="badge-secondary">
                            <Layers className="w-3 h-3 mr-1" />
                            {category.name}
                          </span>
                        )}
                        <span className="badge-primary">{material.unit}</span>
                        {isInUse && (
                          <span className="badge-primary bg-accent-amber/20 text-accent-amber border-accent-amber/30">
                            <Link className="w-3 h-3 mr-1" />
                            {usageCount} produk
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-white">{formatRupiah(material.standard_price)}</p>
                    <div className="flex gap-2 mt-2 justify-end">
                      <button
                        onClick={() => openModal(material)}
                        className="p-2 text-slate-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(material.id)}
                        disabled={deletingId === material.id || isInUse}
                        title={isInUse ? `Material digunakan dalam ${usageCount} produk` : 'Hapus material'}
                        className="p-2 text-slate-400 hover:text-accent-rose hover:bg-accent-rose/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingId === material.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-rose"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">
                {editingMaterial ? 'Edit Material' : 'Tambah Material'}
              </h2>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="input-label">Nama Material</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`input-field ${formErrors.name ? 'border-accent-rose' : ''}`}
                  placeholder="Contoh: Kain Canvas, Resleting #5..."
                  autoFocus
                />
                {formErrors.name && (
                  <p className="text-accent-rose text-xs mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="input-label">Kategori</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className={`input-field ${formErrors.category_id ? 'border-accent-rose' : ''}`}
                >
                  <option value="">Pilih kategori...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {formErrors.category_id && (
                  <p className="text-accent-rose text-xs mt-1">{formErrors.category_id}</p>
                )}
              </div>

              <div>
                <label className="input-label">Harga Standar</label>
                <input
                  type="number"
                  value={formData.standard_price}
                  onChange={(e) => setFormData({ ...formData, standard_price: e.target.value })}
                  className={`input-field ${formErrors.standard_price ? 'border-accent-rose' : ''}`}
                  placeholder="0"
                  min="0"
                />
                {formErrors.standard_price && (
                  <p className="text-accent-rose text-xs mt-1">{formErrors.standard_price}</p>
                )}
              </div>

              <div>
                <label className="input-label">Satuan</label>
                <div className="grid grid-cols-2 gap-3">
                  {unitOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, unit: option.value })}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                        formData.unit === option.value
                          ? 'border-primary-500 bg-primary-500/20 text-primary-400'
                          : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {formErrors.unit && (
                  <p className="text-accent-rose text-xs mt-1">{formErrors.unit}</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
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
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    editingMaterial ? 'Simpan' : 'Tambah'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Materials
