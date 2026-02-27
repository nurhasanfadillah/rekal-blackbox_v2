import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rtvprftiezzyyyqglydv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0dnByZnRpZXp6eXl5cWdseWR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMjQ4MDgsImV4cCI6MjA4NzcwMDgwOH0.n6x2WiM3N8Qzi3PZtlf0aHGfqdX30D7NAaAWCOV84nE'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database helper functions
export const db = {
  // Categories
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    if (error) throw error
    return data
  },
  
  async createCategory(name) {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name }])
      .select()
      .single()
    if (error) throw error
    return data
  },
  
  async updateCategory(id, name) {
    const { data, error } = await supabase
      .from('categories')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },
  
  async deleteCategory(id) {
    // Check if any materials are linked to this category
    const { data: linkedMaterials, error: checkError } = await supabase
      .from('materials')
      .select('id')
      .eq('category_id', id)
      .limit(1)
    
    if (checkError) throw checkError
    
    if (linkedMaterials && linkedMaterials.length > 0) {
      throw new Error('Kategori tidak dapat dihapus karena masih memiliki material terkait')
    }
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  
  // Materials
  async getMaterials() {
    const { data, error } = await supabase
      .from('materials')
      .select('*, categories(name)')
      .order('name')
    if (error) throw error
    return data
  },
  
  async getMaterialsByCategory(categoryId) {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('category_id', categoryId)
      .order('name')
    if (error) throw error
    return data
  },
  
  async createMaterial(material) {
    const { data, error } = await supabase
      .from('materials')
      .insert([material])
      .select()
      .single()
    if (error) throw error
    return data
  },
  
  async updateMaterial(id, material) {
    const { data, error } = await supabase
      .from('materials')
      .update({ ...material, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },
  
  async deleteMaterial(id) {
    // Check if material is used in any bill_of_materials
    const { data: linkedBomItems, error: checkError } = await supabase
      .from('bill_of_materials')
      .select('id')
      .eq('material_id', id)
      .limit(1)
    
    if (checkError) throw checkError
    
    if (linkedBomItems && linkedBomItems.length > 0) {
      throw new Error('Material tidak dapat dihapus karena masih digunakan dalam produk')
    }
    
    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  
  // Products
  async getProducts() {
    // Try with product_photos and bill_of_materials (new schema), fallback to old schema
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_photos(*), bill_of_materials(*, materials(*, categories(name)))')
        .order('created_at', { ascending: false })
      if (error) {
        // If product_photos table doesn't exist, query without it
        if (error.message?.includes('product_photos') || error.code === 'PGRST200') {
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('products')
            .select('*, bill_of_materials(*, materials(*, categories(name)))')
            .order('created_at', { ascending: false })
          if (fallbackError) throw fallbackError
          // Convert old photo_url to new format
          return fallbackData.map(p => ({
            ...p,
            product_photos: p.photo_url ? [{ id: 'legacy', photo_url: p.photo_url, display_order: 0 }] : []
          }))
        }
        throw error
      }
      return data
    } catch (err) {
      // Final fallback
      const { data, error } = await supabase
        .from('products')
        .select('*, bill_of_materials(*, materials(*, categories(name)))')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data.map(p => ({
        ...p,
        product_photos: p.photo_url ? [{ id: 'legacy', photo_url: p.photo_url, display_order: 0 }] : []
      }))
    }
  },

  
  async getProductById(id) {
    // Try with product_photos (new schema), fallback to old schema
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, bill_of_materials(*, materials(*, categories(name))), product_photos(*)')
        .eq('id', id)
        .single()
      if (error) {
        // If product_photos table doesn't exist, query without it
        if (error.message?.includes('product_photos') || error.code === 'PGRST200') {
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('products')
            .select('*, bill_of_materials(*, materials(*, categories(name)))')
            .eq('id', id)
            .single()
          if (fallbackError) throw fallbackError
          // Convert old photo_url to new format
          return {
            ...fallbackData,
            product_photos: fallbackData.photo_url ? [{ id: 'legacy', photo_url: fallbackData.photo_url, display_order: 0 }] : []
          }
        }
        throw error
      }
      return data
    } catch (err) {
      // Final fallback
      const { data, error } = await supabase
        .from('products')
        .select('*, bill_of_materials(*, materials(*, categories(name)))')
        .eq('id', id)
        .single()
      if (error) throw error
      return {
        ...data,
        product_photos: data.photo_url ? [{ id: 'legacy', photo_url: data.photo_url, display_order: 0 }] : []
      }
    }
  },


  
  async createProduct(product, bomItems) {
    // Calculate costs
    const totalMaterialCost = bomItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const overheadMultiplier = 1 - (product.overhead_percentage / 100)
    const productionCost = totalMaterialCost / overheadMultiplier
    const marginMultiplier = 1 - (product.target_margin_percentage / 100)
    const sellingPrice = productionCost / marginMultiplier
    const grossProfit = sellingPrice - productionCost
    
    // Insert product
    const { data: newProduct, error: productError } = await supabase
      .from('products')
      .insert([{
        ...product,
        total_material_cost: totalMaterialCost,
        production_cost: productionCost,
        estimated_selling_price: sellingPrice,
        gross_profit_per_unit: grossProfit,
        photo_url: product.photo_url || null
      }])
      .select()
      .single()

    
    if (productError) throw productError
    
    // Insert BoM items
    if (bomItems.length > 0) {
      const bomData = bomItems.map(item => ({
        product_id: newProduct.id,
        material_id: item.material_id,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity
      }))
      
      const { error: bomError } = await supabase
        .from('bill_of_materials')
        .insert(bomData)
      
      if (bomError) throw bomError
    }
    
    return newProduct
  },
  
  async updateProduct(id, product, bomItems) {
    // Calculate costs
    const totalMaterialCost = bomItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const overheadMultiplier = 1 - (product.overhead_percentage / 100)
    const productionCost = totalMaterialCost / overheadMultiplier
    const marginMultiplier = 1 - (product.target_margin_percentage / 100)
    const sellingPrice = productionCost / marginMultiplier
    const grossProfit = sellingPrice - productionCost
    
    // Update product
    const { data: updatedProduct, error: productError } = await supabase
      .from('products')
      .update({
        ...product,
        total_material_cost: totalMaterialCost,
        production_cost: productionCost,
        estimated_selling_price: sellingPrice,
        gross_profit_per_unit: grossProfit,
        photo_url: product.photo_url || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (productError) throw productError

    
    // Delete existing BoM items
    await supabase.from('bill_of_materials').delete().eq('product_id', id)
    
    // Insert new BoM items
    if (bomItems.length > 0) {
      const bomData = bomItems.map(item => ({
        product_id: id,
        material_id: item.material_id,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity
      }))
      
      const { error: bomError } = await supabase
        .from('bill_of_materials')
        .insert(bomData)
      
      if (bomError) throw bomError
    }
    
    return updatedProduct
  },
  
  async deleteProduct(id) {
    // First, delete all associated photos from storage
    await this.deleteProductPhotosFromStorage(id)
    
    // Then delete the product (cascade will delete photo records)
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  // Helper to extract storage path from photo URL
  getStoragePathFromUrl(photoUrl) {
    try {
      const url = new URL(photoUrl)
      const pathMatch = url.pathname.match(/\/product-images\/(.+)$/)
      return pathMatch ? pathMatch[1] : null
    } catch (err) {
      console.error('Failed to parse photo URL:', err)
      return null
    }
  },

  // Delete all photos for a product from storage
  async deleteProductPhotosFromStorage(productId) {
    try {
      // Get all photos for this product
      const { data: photos, error: fetchError } = await supabase
        .from('product_photos')
        .select('photo_url')
        .eq('product_id', productId)
      
      if (fetchError) {
        console.error('Failed to fetch product photos:', fetchError)
        return
      }

      if (!photos || photos.length === 0) return

      // Extract storage paths and delete files
      const pathsToDelete = []
      for (const photo of photos) {
        const path = this.getStoragePathFromUrl(photo.photo_url)
        if (path) {
          pathsToDelete.push(path)
        }
      }

      if (pathsToDelete.length > 0) {
        const { error: deleteError } = await supabase.storage
          .from('product-images')
          .remove(pathsToDelete)
        
        if (deleteError) {
          console.error('Failed to delete some images from storage:', deleteError)
        }
      }
    } catch (err) {
      console.error('Error deleting product photos from storage:', err)
    }
  },

  
  // File upload
  async uploadImage(file, path) {
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(path, file)
    if (error) throw error
    return data
  },
  
  getImageUrl(path) {
    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(path)
    return data.publicUrl
  },
  
  async deleteImage(path) {
    const { error } = await supabase.storage
      .from('product-images')
      .remove([path])
    if (error) throw error
  },
  
  async updateProductPhoto(id, photoUrl) {
    const { data, error } = await supabase
      .from('products')
      .update({ photo_url: photoUrl, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // Product Photos (Multiple)
  async getProductPhotos(productId) {
    const { data, error } = await supabase
      .from('product_photos')
      .select('*')
      .eq('product_id', productId)
      .order('display_order', { ascending: true })
    if (error) throw error
    return data
  },

  async addProductPhoto(productId, photoUrl, fileInfo = {}) {
    // Get current max display order
    const { data: existingPhotos } = await supabase
      .from('product_photos')
      .select('display_order')
      .eq('product_id', productId)
      .order('display_order', { ascending: false })
      .limit(1)

    const nextOrder = existingPhotos?.[0]?.display_order + 1 || 0

    const { data, error } = await supabase
      .from('product_photos')
      .insert([{
        product_id: productId,
        photo_url: photoUrl,
        display_order: nextOrder,
        file_name: fileInfo.name || null,
        file_size: fileInfo.size || null,
        mime_type: fileInfo.type || null
      }])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async deleteProductPhoto(photoId) {
    const { error } = await supabase
      .from('product_photos')
      .delete()
      .eq('id', photoId)
    if (error) throw error
  },

  async reorderProductPhotos(productId, photoOrders) {
    // photoOrders should be an array of { id, display_order }
    const updates = photoOrders.map(({ id, display_order }) =>
      supabase
        .from('product_photos')
        .update({ display_order, updated_at: new Date().toISOString() })
        .eq('id', id)
    )

    const results = await Promise.all(updates)
    const errors = results.filter(r => r.error)
    if (errors.length > 0) {
      throw new Error('Failed to reorder photos: ' + errors[0].error.message)
    }
  },

  async updateProductPhotos(productId, photos, removedPhotoUrls = []) {
    // Delete removed photos from storage first
    if (removedPhotoUrls.length > 0) {
      const pathsToDelete = []
      for (const photoUrl of removedPhotoUrls) {
        const path = this.getStoragePathFromUrl(photoUrl)
        if (path) {
          pathsToDelete.push(path)
        }
      }
      
      if (pathsToDelete.length > 0) {
        try {
          await supabase.storage
            .from('product-images')
            .remove(pathsToDelete)
        } catch (err) {
          console.error('Failed to delete removed images from storage:', err)
        }
      }
    }

    // Delete existing photos not in the new list
    const { error: deleteError } = await supabase
      .from('product_photos')
      .delete()
      .eq('product_id', productId)
    
    if (deleteError) throw deleteError

    // Insert new photos
    if (photos.length > 0) {
      const { error: insertError } = await supabase
        .from('product_photos')
        .insert(photos.map((photo, index) => ({
          product_id: productId,
          photo_url: photo.photo_url,
          display_order: index,
          file_name: photo.file_name || null,
          file_size: photo.file_size || null,
          mime_type: photo.mime_type || null
        })))
      
      if (insertError) throw insertError
    }
  }

}
