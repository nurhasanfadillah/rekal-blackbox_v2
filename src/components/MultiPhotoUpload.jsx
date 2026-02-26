import { useState, useRef } from 'react'
import { Camera, X, Upload, Loader2, Check, GripVertical } from 'lucide-react'
import { supabase, db } from '../supabase'
import { useToast } from './Toast'

const MultiPhotoUpload = ({ 
  productId, 
  existingPhotos = [],
  onPhotosChange,
  maxPhotos = 10,
  maxFileSize = 5 * 1024 * 1024 // 5MB
}) => {
  const [uploading, setUploading] = useState(false)
  const [photos, setPhotos] = useState(existingPhotos)
  const [draggingIndex, setDraggingIndex] = useState(null)
  const fileInputRef = useRef(null)
  const { success, error: showError } = useToast()

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Check max photos limit
    if (photos.length + files.length > maxPhotos) {
      showError(`Maksimal ${maxPhotos} foto. Anda sudah memiliki ${photos.length} foto.`)
      return
    }

    setUploading(true)

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showError(`File "${file.name}" harus berupa gambar`)
        continue
      }

      // Validate file size
      if (file.size > maxFileSize) {
        showError(`File "${file.name}" melebihi 5MB`)
        continue
      }

      try {
        // Create preview
        const objectUrl = URL.createObjectURL(file)

        // Generate unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${productId || 'temp'}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
        const filePath = `products/${fileName}`

        // Upload to Supabase Storage
        await db.uploadImage(file, filePath)
        
        // Get public URL
        const publicUrl = db.getImageUrl(filePath)

        // Add to photos array
        const newPhoto = {
          id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          photo_url: publicUrl,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          display_order: photos.length,
          isNew: true // Mark as new photo
        }

        const updatedPhotos = [...photos, newPhoto]
        setPhotos(updatedPhotos)
        onPhotosChange?.(updatedPhotos)

        // Cleanup preview URL
        URL.revokeObjectURL(objectUrl)

      } catch (err) {
        console.error('Upload error:', err)
        showError(`Gagal mengupload ${file.name}: ${err.message}`)
      }
    }

    setUploading(false)
    success(`${files.length} foto berhasil diupload`)
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemovePhoto = async (photoId, index) => {
    const photo = photos[index]
    
    // If it's a new photo (not saved to DB yet), just remove from state
    if (photo.isNew) {
      try {
        // Try to delete from storage
        const url = new URL(photo.photo_url)
        const pathMatch = url.pathname.match(/products\/(.+)$/)
        if (pathMatch) {
          await db.deleteImage(`products/${pathMatch[1]}`)
        }
      } catch (err) {
        console.error('Failed to delete image from storage:', err)
      }
    }

    const updatedPhotos = photos.filter((_, i) => i !== index)
    // Reorder remaining photos
    const reorderedPhotos = updatedPhotos.map((p, i) => ({
      ...p,
      display_order: i
    }))
    
    setPhotos(reorderedPhotos)
    onPhotosChange?.(reorderedPhotos)
  }

  const handleDragStart = (index) => {
    setDraggingIndex(index)
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    if (draggingIndex === null || draggingIndex === index) return
    
    const newPhotos = [...photos]
    const draggedPhoto = newPhotos[draggingIndex]
    newPhotos.splice(draggingIndex, 1)
    newPhotos.splice(index, 0, draggedPhoto)
    
    // Update display orders
    const reorderedPhotos = newPhotos.map((p, i) => ({
      ...p,
      display_order: i
    }))
    
    setPhotos(reorderedPhotos)
    onPhotosChange?.(reorderedPhotos)
    setDraggingIndex(index)
  }

  const handleDragEnd = () => {
    setDraggingIndex(null)
  }

  const triggerFileInput = () => {
    if (photos.length >= maxPhotos) {
      showError(`Maksimal ${maxPhotos} foto`)
      return
    }
    fileInputRef.current?.click()
  }

  const canAddMore = photos.length < maxPhotos

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
      />

      {/* Photo Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {/* Existing Photos */}
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`relative aspect-square rounded-xl overflow-hidden bg-slate-800 border-2 ${
              draggingIndex === index ? 'border-primary-500 opacity-50' : 'border-slate-700'
            } group cursor-move`}
          >
            <img
              src={photo.photo_url}
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <div className="flex items-center gap-1">
                <GripVertical className="w-4 h-4 text-white/70" />
                <span className="text-white text-xs">Drag</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemovePhoto(photo.id, index)}
                className="p-2 bg-accent-rose/80 hover:bg-accent-rose rounded-lg text-white transition-colors"
                title="Hapus foto"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Order Badge */}
            <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 rounded-full text-white text-xs font-medium">
              {index + 1}
            </div>

            {/* New Photo Badge */}
            {photo.isNew && (
              <div className="absolute top-2 right-2 p-1 bg-accent-emerald rounded-full">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
        ))}

        {/* Add Photo Button */}
        {canAddMore && (
          <button
            type="button"
            onClick={triggerFileInput}
            disabled={uploading}
            className="aspect-square rounded-xl border-2 border-dashed border-slate-600 hover:border-primary-500 hover:bg-primary-500/5 flex flex-col items-center justify-center gap-2 transition-all group"
          >
            {uploading ? (
              <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-slate-500 group-hover:text-primary-400 transition-colors" />
                <span className="text-xs text-slate-500 group-hover:text-primary-400 transition-colors">
                  Tambah Foto
                </span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Info Text */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{photos.length} / {maxPhotos} foto</span>
        <span>Maks 5MB per foto (JPG, PNG, WebP)</span>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="flex items-center gap-2 text-sm text-primary-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Mengupload foto...</span>
        </div>
      )}
    </div>
  )
}

export default MultiPhotoUpload
