// Form Validators

/**
 * Validate required field
 * @param {*} value - Field value
 * @returns {string|null} Error message or null if valid
 */
export const validateRequired = (value) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return 'Field ini wajib diisi'
  }
  return null
}

/**
 * Validate unique name
 * @param {string} name - Name to validate
 * @param {Array} existingItems - Array of existing items with name property
 * @param {string} currentId - Current item ID (for edit mode)
 * @returns {string|null} Error message or null if valid
 */
export const validateUniqueName = (name, existingItems, currentId = null) => {
  const normalizedName = name.trim().toLowerCase()
  const duplicate = existingItems.find(item => 
    item.name.trim().toLowerCase() === normalizedName && 
    item.id !== currentId
  )
  
  if (duplicate) {
    return 'Nama sudah digunakan, silakan gunakan nama lain'
  }
  return null
}

/**
 * Validate percentage field
 * @param {number|string} value - Percentage value
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} Error message or null if valid
 */
export const validatePercentage = (value, fieldName = 'Persentase') => {
  const num = parseFloat(value)
  
  if (isNaN(num)) {
    return `${fieldName} harus berupa angka`
  }
  
  if (num < 0 || num >= 100) {
    return `${fieldName} harus antara 0 dan 100`
  }
  
  return null
}

/**
 * Validate positive number
 * @param {number|string} value - Number value
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} Error message or null if valid
 */
export const validatePositiveNumber = (value, fieldName = 'Nilai') => {
  const num = parseFloat(value)
  
  if (isNaN(num)) {
    return `${fieldName} harus berupa angka`
  }
  
  if (num < 0) {
    return `${fieldName} tidak boleh negatif`
  }
  
  return null
}

/**
 * Validate price field
 * @param {number|string} value - Price value
 * @returns {string|null} Error message or null if valid
 */
export const validatePrice = (value) => {
  const num = parseFloat(value)
  
  if (isNaN(num)) {
    return 'Harga harus berupa angka'
  }
  
  if (num < 0) {
    return 'Harga tidak boleh negatif'
  }
  
  return null
}

/**
 * Validate quantity field
 * @param {number|string} value - Quantity value
 * @returns {string|null} Error message or null if valid
 */
export const validateQuantity = (value) => {
  const num = parseFloat(value)
  
  if (isNaN(num)) {
    return 'Kuantitas harus berupa angka'
  }
  
  if (num <= 0) {
    return 'Kuantitas harus lebih dari 0'
  }
  
  return null
}

/**
 * Validate BoM items
 * @param {Array} bomItems - Array of BoM items
 * @returns {string|null} Error message or null if valid
 */
export const validateBomItems = (bomItems) => {
  if (!bomItems || bomItems.length === 0) {
    return 'Produk harus memiliki minimal 1 material'
  }
  
  for (const item of bomItems) {
    if (!item.material_id) {
      return 'Pilih material untuk semua item'
    }
    
    const quantityError = validateQuantity(item.quantity)
    if (quantityError) {
      return `Kuantitas tidak valid: ${quantityError}`
    }
    
    const priceError = validatePrice(item.price)
    if (priceError) {
      return `Harga tidak valid: ${priceError}`
    }
  }
  
  return null
}

/**
 * Validate category form
 * @param {Object} formData - Form data
 * @param {Array} existingCategories - Existing categories
 * @param {string} currentId - Current category ID (for edit)
 * @returns {Object} Object with field errors
 */
export const validateCategoryForm = (formData, existingCategories, currentId = null) => {
  const errors = {}
  
  const requiredError = validateRequired(formData.name)
  if (requiredError) {
    errors.name = requiredError
  } else {
    const uniqueError = validateUniqueName(formData.name, existingCategories, currentId)
    if (uniqueError) {
      errors.name = uniqueError
    }
  }
  
  return errors
}

/**
 * Validate material form
 * @param {Object} formData - Form data
 * @param {Array} existingMaterials - Existing materials
 * @param {string} currentId - Current material ID (for edit)
 * @returns {Object} Object with field errors
 */
export const validateMaterialForm = (formData, existingMaterials, currentId = null) => {
  const errors = {}
  
  const nameError = validateRequired(formData.name)
  if (nameError) {
    errors.name = nameError
  } else {
    const uniqueError = validateUniqueName(formData.name, existingMaterials, currentId)
    if (uniqueError) {
      errors.name = uniqueError
    }
  }
  
  if (!formData.category_id) {
    errors.category_id = 'Pilih kategori'
  }
  
  const priceError = validatePrice(formData.standard_price)
  if (priceError) {
    errors.standard_price = priceError
  }
  
  if (!formData.unit) {
    errors.unit = 'Pilih satuan'
  }
  
  return errors
}

/**
 * Validate product form
 * @param {Object} formData - Form data
 * @param {Array} bomItems - BoM items
 * @param {Array} existingProducts - Existing products
 * @param {string} currentId - Current product ID (for edit)
 * @param {string} originalName - Original product name (for copy mode validation)
 * @returns {Object} Object with field errors
 */
export const validateProductForm = (formData, bomItems, existingProducts, currentId = null, originalName = null) => {
  const errors = {}
  
  const nameError = validateRequired(formData.name)
  if (nameError) {
    errors.name = nameError
  } else {
    // Check if name is same as original in copy mode
    if (originalName && formData.name.trim().toLowerCase() === originalName.trim().toLowerCase()) {
      errors.name = 'Nama produk harus berbeda dari produk asli saat menyalin'
    } else {
      const uniqueError = validateUniqueName(formData.name, existingProducts, currentId)
      if (uniqueError) {
        errors.name = uniqueError
      }
    }
  }

  
  const overheadError = validatePercentage(formData.overhead_percentage, 'Overhead')
  if (overheadError) {
    errors.overhead_percentage = overheadError
  }
  
  const marginError = validatePercentage(formData.target_margin_percentage, 'Target margin')
  if (marginError) {
    errors.target_margin_percentage = marginError
  }
  
  const bomError = validateBomItems(bomItems)
  if (bomError) {
    errors.bom = bomError
  }
  
  return errors
}

/**
 * Check if form has errors
 * @param {Object} errors - Errors object
 * @returns {boolean} True if has errors
 */
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0
}
