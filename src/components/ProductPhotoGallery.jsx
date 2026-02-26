import { useState, useRef } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  X, 
  ZoomIn,
  Image as ImageIcon,
  Trash2,
  GripVertical
} from 'lucide-react'

const ProductPhotoGallery = ({ 
  photos = [], 
  productName = 'Product',
  editable = false,
  onDelete,
  onReorder,
  maxHeight = '400px'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [draggingIndex, setDraggingIndex] = useState(null)
  const touchStartX = useRef(null)

  // Sort photos by display_order
  const sortedPhotos = [...photos].sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
  
  const currentPhoto = sortedPhotos[currentIndex]
  const hasPhotos = sortedPhotos.length > 0

  const handlePrev = () => {
    setCurrentIndex(prev => prev === 0 ? sortedPhotos.length - 1 : prev - 1)
  }

  const handleNext = () => {
    setCurrentIndex(prev => prev === sortedPhotos.length - 1 ? 0 : prev + 1)
  }

  const handleThumbnailClick = (index) => {
    setCurrentIndex(index)
  }

  const handleDownload = async (photo, index) => {
    try {
      const response = await fetch(photo.photo_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = photo.file_name || `${productName.replace(/\s+/g, '_')}_photo_${index + 1}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download failed:', err)
      // Fallback: open in new tab
      window.open(photo.photo_url, '_blank')
    }
  }

  // Touch handlers for swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchStartX.current - touchEndX
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext()
      } else {
        handlePrev()
      }
    }
    
    touchStartX.current = null
  }

  // Drag and drop for reordering
  const handleDragStart = (index) => {
    if (!editable) return
    setDraggingIndex(index)
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    if (draggingIndex === null || draggingIndex === index) return
    
    // Reorder photos
    const newPhotos = [...sortedPhotos]
    const draggedPhoto = newPhotos[draggingIndex]
    newPhotos.splice(draggingIndex, 1)
    newPhotos.splice(index, 0, draggedPhoto)
    
    // Update display orders
    const updatedPhotos = newPhotos.map((photo, i) => ({
      ...photo,
      display_order: i
    }))
    
    onReorder?.(updatedPhotos)
    setDraggingIndex(index)
  }

  const handleDragEnd = () => {
    setDraggingIndex(null)
  }

  if (!hasPhotos) {
    return (
      <div 
        className="w-full bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center"
        style={{ height: maxHeight }}
      >
        <ImageIcon className="w-16 h-16 text-slate-600 mb-4" />
        <p className="text-slate-500 text-sm">Belum ada foto produk</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Main Image Viewer */}
      <div 
        className="relative w-full bg-slate-900 rounded-2xl overflow-hidden group"
        style={{ height: maxHeight }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Main Image */}
        <img
          src={currentPhoto?.photo_url}
          alt={`${productName} - Photo ${currentIndex + 1}`}
          className="w-full h-full object-contain cursor-zoom-in transition-transform duration-300"
          onClick={() => setLightboxOpen(true)}
        />

        {/* Navigation Arrows */}
        {sortedPhotos.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Top Actions */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => handleDownload(currentPhoto, currentIndex)}
            className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
            title="Download foto"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => setLightboxOpen(true)}
            className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
            title="Lihat fullscreen"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* Photo Counter */}
        {sortedPhotos.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 rounded-full text-white text-sm">
            {currentIndex + 1} / {sortedPhotos.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {sortedPhotos.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
          {sortedPhotos.map((photo, index) => (
            <div
              key={photo.id}
              draggable={editable}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`relative flex-shrink-0 group ${editable ? 'cursor-move' : 'cursor-pointer'}`}
            >
              {editable && (
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <GripVertical className="w-4 h-4 text-slate-400" />
                </div>
              )}
              <button
                onClick={() => handleThumbnailClick(index)}
                className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                  index === currentIndex 
                    ? 'border-primary-500 ring-2 ring-primary-500/30' 
                    : 'border-slate-700 hover:border-slate-500'
                }`}
              >
                <img
                  src={photo.photo_url}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
              {editable && onDelete && (
                <button
                  onClick={() => onDelete(photo.id)}
                  className="absolute -top-1 -right-1 p-1 bg-accent-rose rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3 text-white" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {sortedPhotos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handlePrev() }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleNext() }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <img
            src={currentPhoto?.photo_url}
            alt={`${productName} - Photo ${currentIndex + 1}`}
            className="max-w-full max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
            <span className="text-white text-sm">
              {currentIndex + 1} / {sortedPhotos.length}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); handleDownload(currentPhoto, currentIndex) }}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductPhotoGallery
