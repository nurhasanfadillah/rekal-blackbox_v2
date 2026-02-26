import { createContext, useContext, useState, useCallback } from 'react'
import { db } from '../supabase'

const DataContext = createContext()



export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

export const DataProvider = ({ children }) => {
  const [categories, setCategories] = useState([])
  const [materials, setMaterials] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState({
    categories: false,
    materials: false,
    products: false
  })
  const [errors, setErrors] = useState({
    categories: null,
    materials: null,
    products: null
  })

  const [connectionStatus, setConnectionStatus] = useState('checking') // 'checking', 'connected', 'error'


  // Categories
  const fetchCategories = useCallback(async () => {
    setLoading(prev => ({ ...prev, categories: true }))
    setErrors(prev => ({ ...prev, categories: null }))
    try {
      const data = await db.getCategories()
      setCategories(data || [])
      setConnectionStatus('connected')
    } catch (err) {
      const errorMsg = err.message || 'Gagal memuat kategori'
      setErrors(prev => ({ ...prev, categories: errorMsg }))
      setConnectionStatus('error')
      console.error('Error fetching categories:', err)
      
      // Check if it's a 404 error (table doesn't exist)
      if (err.code === '404' || err.message?.includes('not found') || err.message?.includes('404')) {
        setErrors(prev => ({ ...prev, categories: 'Database belum dikonfigurasi. Silakan jalankan schema SQL di Supabase.' }))
      }
    } finally {
      setLoading(prev => ({ ...prev, categories: false }))
    }
  }, [])





  const createCategory = async (name) => {
    try {
      const newCategory = await db.createCategory(name)
      setCategories(prev => [...prev, newCategory])
      return newCategory
    } catch (err) {
      throw err
    }
  }

  const updateCategory = async (id, name) => {
    try {
      const updated = await db.updateCategory(id, name)
      setCategories(prev => prev.map(c => c.id === id ? updated : c))
      return updated
    } catch (err) {
      throw err
    }
  }

  const deleteCategory = async (id) => {
    try {
      await db.deleteCategory(id)
      setCategories(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      throw err
    }
  }

  // Materials
  const fetchMaterials = useCallback(async () => {
    setLoading(prev => ({ ...prev, materials: true }))
    setErrors(prev => ({ ...prev, materials: null }))
    try {
      const data = await db.getMaterials()
      setMaterials(data || [])
      setConnectionStatus('connected')
    } catch (err) {
      const errorMsg = err.message || 'Gagal memuat material'
      setErrors(prev => ({ ...prev, materials: errorMsg }))
      setConnectionStatus('error')
      console.error('Error fetching materials:', err)
      
      // Check if it's a 404 error (table doesn't exist)
      if (err.code === '404' || err.message?.includes('not found') || err.message?.includes('404')) {
        setErrors(prev => ({ ...prev, materials: 'Database belum dikonfigurasi. Silakan jalankan schema SQL di Supabase.' }))
      }
    } finally {
      setLoading(prev => ({ ...prev, materials: false }))
    }
  }, [])





  const createMaterial = async (material) => {
    try {
      const newMaterial = await db.createMaterial(material)
      setMaterials(prev => [...prev, newMaterial])
      return newMaterial
    } catch (err) {
      throw err
    }
  }

  const updateMaterial = async (id, material) => {
    try {
      const updated = await db.updateMaterial(id, material)
      setMaterials(prev => prev.map(m => m.id === id ? updated : m))
      return updated
    } catch (err) {
      throw err
    }
  }

  const deleteMaterial = async (id) => {
    try {
      await db.deleteMaterial(id)
      setMaterials(prev => prev.filter(m => m.id !== id))
    } catch (err) {
      throw err
    }
  }

  // Products
  const fetchProducts = useCallback(async () => {
    setLoading(prev => ({ ...prev, products: true }))
    setErrors(prev => ({ ...prev, products: null }))
    try {
      const data = await db.getProducts()
      setProducts(data || [])
      setConnectionStatus('connected')
    } catch (err) {
      const errorMsg = err.message || 'Gagal memuat produk'
      setErrors(prev => ({ ...prev, products: errorMsg }))
      setConnectionStatus('error')
      console.error('Error fetching products:', err)
      
      // Check if it's a 404 error (table doesn't exist)
      if (err.code === '404' || err.message?.includes('not found') || err.message?.includes('404')) {
        setErrors(prev => ({ ...prev, products: 'Database belum dikonfigurasi. Silakan jalankan schema SQL di Supabase.' }))
      }
    } finally {
      setLoading(prev => ({ ...prev, products: false }))
    }
  }, [])





  const getProduct = async (id) => {
    try {
      return await db.getProductById(id)
    } catch (err) {
      throw err
    }
  }

  const createProduct = async (product, bomItems) => {
    try {
      const newProduct = await db.createProduct(product, bomItems)
      setProducts(prev => [newProduct, ...prev])
      return newProduct
    } catch (err) {
      throw err
    }
  }

  const updateProduct = async (id, product, bomItems) => {
    try {
      const updated = await db.updateProduct(id, product, bomItems)
      setProducts(prev => prev.map(p => p.id === id ? updated : p))
      return updated
    } catch (err) {
      throw err
    }
  }

  const deleteProduct = async (id) => {
    try {
      await db.deleteProduct(id)
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      throw err
    }
  }

  const updateProductPhoto = async (id, photoUrl) => {
    try {
      const updated = await db.updateProductPhoto(id, photoUrl)
      setProducts(prev => prev.map(p => p.id === id ? { ...p, photo_url: photoUrl } : p))
      return updated
    } catch (err) {
      throw err
    }
  }

  const refreshAll = useCallback(async () => {

    await Promise.all([
      fetchCategories(),
      fetchMaterials(),
      fetchProducts()
    ])
  }, [fetchCategories, fetchMaterials, fetchProducts])

  const value = {
    // Data
    categories,
    materials,
    products,
    loading,
    errors,
    error: errors.categories || errors.materials || errors.products, // backward compatibility
    connectionStatus,

    
    // Actions

    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    
    fetchMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    
    fetchProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductPhoto,
    
    refreshAll

  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}
