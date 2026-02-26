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
    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', id)
    if (error) throw error
  },
  
  // Products
  async getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },
  
  async getProductById(id) {
    const { data, error } = await supabase
      .from('products')
      .select('*, bill_of_materials(*, materials(*, categories(name)))')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
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
        gross_profit_per_unit: grossProfit
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
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    if (error) throw error
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
  }
}
