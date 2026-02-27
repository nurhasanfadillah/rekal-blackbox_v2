import { useState, useEffect } from 'react'
import { useData } from '../contexts/DataContext'
import { useToast } from '../components/Toast'
import { useConfirmation } from '../contexts/ConfirmationContext'
import { validateCategoryForm, hasErrors } from '../utils/validators'
import { Layers, Plus, Search, Edit2, Trash2, X, Package, Link } from 'lucide-react'



const Categories = () => {
  const { categories, materials, loading, errors, fetchCategories, createCategory, updateCategory, deleteCategory } = useData()

  const { success, error: showError } = useToast()
  const { confirm } = useConfirmation()

  
  const [searchQuery, setSearchQuery] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({ name: '' })
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getMaterialCount = (categoryId) => {
    return materials.filter(m => m.category_id === categoryId).length
  }

  const openModal = (category = null) => {
    setEditingCategory(category)
    setFormData({ name: category?.name || '' })
    setFormErrors({})
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
    setFormData({ name: '' })
    setFormErrors({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const errors = validateCategoryForm(formData, categories, editingCategory?.id)
    setFormErrors(errors)
    
    if (hasErrors(errors)) return
    
    setSubmitting(true)
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData.name)
        success('Kategori berhasil diperbarui')
      } else {
        await createCategory(formData.name)
        success('Kategori berhasil ditambahkan')
      }
      closeModal()
    } catch (err) {
      showError(err.message || 'Gagal menyimpan kategori')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    const materialCount = getMaterialCount(id)
    if (materialCount > 0) {
      showError(`Gagal menghapus: Kosongkan ${materialCount} material dalam kategori ini terlebih dahulu.`)
      return
    }

    const isConfirmed = await confirm({
      title: 'Hapus Kategori',
      message: 'Yakin ingin menghapus kategori ini? Tindakan ini tidak dapat dibatalkan.',
      confirmLabel: 'Hapus',
      cancelLabel: 'Batal',
      variant: 'danger'
    })
    
    if (!isConfirmed) return

    setDeletingId(id)
    try {
      await deleteCategory(id)
      success('Kategori berhasil dihapus')
    } catch (err) {
      showError(err.message || 'Gagal menghapus kategori')
    } finally {
      setDeletingId(null)
    }
  }


  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Kategori</h1>
        <p className="page-subtitle">Kelompokkan material berdasarkan kategori</p>
      </div>

      {/* Search & Add */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kategori..."
            className="input-field pl-10"
          />
        </div>
        <button onClick={() => openModal()} className="btn-primary px-4">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Error State */}
      {errors?.categories && (
        <div className="bg-accent-rose/10 border border-accent-rose/30 rounded-xl p-4 mb-4">
          <p className="text-accent-rose text-sm">{errors.categories}</p>

          <button 
            onClick={fetchCategories}
            className="mt-2 text-xs text-accent-rose underline hover:no-underline"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Categories List */}
      {loading.categories ? (

        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="empty-state">
          <Layers className="empty-state-icon" />
          <p className="empty-state-title">Belum ada kategori</p>
          <p className="empty-state-desc">Tambahkan kategori untuk mengelompokkan material</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCategories.map(category => {
            const materialCount = getMaterialCount(category.id)
            const hasMaterials = materialCount > 0
            
            return (
              <div key={category.id} className="list-item">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                      <Layers className="w-5 h-5 text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{category.name}</h3>
                      <div className="flex items-center gap-2 text-xs mt-1 flex-wrap">
                        {hasMaterials ? (
                          <span className="badge-primary bg-accent-amber/20 text-accent-amber border-accent-amber/30">
                            <Link className="w-3 h-3 mr-1" />
                            {materialCount} material
                          </span>
                        ) : (
                          <span className="text-slate-500 flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            {materialCount} material
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(category)}
                      className="p-2 text-slate-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      disabled={deletingId === category.id || hasMaterials}
                      title={hasMaterials ? `Kategori memiliki ${materialCount} material. Kosongkan terlebih dahulu.` : 'Hapus kategori'}
                      className="p-2 text-slate-400 hover:text-accent-rose hover:bg-accent-rose/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingId === category.id ? (
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

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">
                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
              </h2>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="input-label">Nama Kategori</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  className={`input-field ${formErrors.name ? 'border-accent-rose' : ''}`}
                  placeholder="Contoh: Kain, Resleting, Busa..."
                  autoFocus
                />
                {formErrors.name && (
                  <p className="text-accent-rose text-xs mt-1">{formErrors.name}</p>
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
                    editingCategory ? 'Simpan' : 'Tambah'
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

export default Categories
