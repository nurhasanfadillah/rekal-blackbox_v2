import { useState, useRef } from 'react'
import { Camera, X, Upload, Loader2 } from 'lucide-react'
import { supabase, db } from '../supabase'
import { useToast } from './Toast'
import { useConfirmation } from '../contexts/ConfirmationContext'


const ProductPhotoUpload = ({ 
  productId, 
  currentPhotoUrl, 
  onPhotoChange, 
  size = 'large',
  editable = true 
}) => {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(currentPhotoUrl)
  const fileInputRef = useRef(null)
  const { success, error: showError } = useToast()
  const { confirm } = useConfirmation()


  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('File harus berupa gambar (JPG, PNG, atau WebP)')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('Ukuran file maksimal 5MB')
      return
    }

    setUploading(true)

    try {
      // Create preview
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${productId || 'temp'}-${Date.now()}.${fileExt}`
      const filePath = `products/${fileName}`

      // Upload to Supabase Storage
      await db.uploadImage(file, filePath)
      
      // Get public URL
      const publicUrl = db.getImageUrl(filePath)

      // Update product photo if product exists
      if (productId) {
        await db.updateProductPhoto(productId, publicUrl)
      }

      // Call callback
      onPhotoChange?.(publicUrl)
      success('Foto produk berhasil diupload')

      // Cleanup preview URL
      URL.revokeObjectURL(objectUrl)
      setPreviewUrl(publicUrl)
    } catch (err) {
      console.error('Upload error:', err)
      showError(err.message || 'Gagal mengupload foto')
      setPreviewUrl(currentPhotoUrl)
    } finally {
      setUploading(false)
    }
  }

  const handleRemovePhoto = async () => {
    if (!currentPhotoUrl || !productId) {
      setPreviewUrl(null)
      onPhotoChange?.(null)
      return
    }

    const isConfirmed = await confirm({
      title: 'Hapus Foto Produk',
      message: 'Yakin ingin menghapus foto produk ini? Tindakan ini tidak dapat dibatalkan.',
      confirmLabel: 'Hapus',
      cancelLabel: 'Batal',
      variant: 'danger'
    })
    
    if (!isConfirmed) return

    try {

      // Extract path from URL
      const url = new URL(currentPhotoUrl)
      const pathMatch = url.pathname.match(/products\/(.+)$/)
      if (pathMatch) {
        await db.deleteImage(`products/${pathMatch[1]}`)
      }

      // Update product
      await db.updateProductPhoto(productId, null)
      
      setPreviewUrl(null)
      onPhotoChange?.(null)
      success('Foto produk berhasil dihapus')
    } catch (err) {
      console.error('Delete error:', err)
      showError('Gagal menghapus foto')
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32',
    xlarge: 'w-48 h-48'
  }

  const iconSizes = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-10 h-10',
    xlarge: 'w-12 h-12'
  }

  return (
    <div className="relative">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      {/* Photo container */}
      <div 
        className={`${sizeClasses[size]} rounded-2xl overflow-hidden bg-slate-800 border-2 border-dashed border-slate-600 flex items-center justify-center relative group`}
      >
        {previewUrl ? (
          <>
            {/* Photo preview */}
            <img 
              src={previewUrl} 
              alt="Product" 
              className="w-full h-full object-cover"
            />
            
            {/* Overlay for editable mode */}
            {editable && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                  title="Ganti foto"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="p-2 bg-accent-rose/80 hover:bg-accent-rose rounded-lg text-white transition-colors"
                  title="Hapus foto"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        ) : (
          /* Placeholder / Upload button */
          editable ? (
            <button
              type="button"
              onClick={triggerFileInput}
              disabled={uploading}
              className="w-full h-full flex flex-col items-center justify-center text-slate-500 hover:text-slate-400 transition-colors"
            >
              {uploading ? (
                <Loader2 className={`${iconSizes[size]} animate-spin text-primary-400`} />
              ) : (
                <>
                  <Upload className={`${iconSizes[size]} mb-1`} />
                  <span className="text-xs">Upload</span>
                </>
              )}
            </button>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600">
              <Camera className={iconSizes[size]} />
            </div>
          )
        )}
      </div>

      {/* Uploading indicator overlay */}
      {uploading && previewUrl && (
        <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
        </div>
      )}
    </div>
  )
}

export default ProductPhotoUpload
