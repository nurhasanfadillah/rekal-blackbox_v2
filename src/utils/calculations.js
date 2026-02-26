// HPP Calculation Functions

/**
 * Calculate subtotal for a material item
 * @param {number} price - Material price
 * @param {number} quantity - Material quantity
 * @returns {number} Subtotal
 */
export const calculateSubtotal = (price, quantity) => {
  return price * quantity
}

/**
 * Calculate total material cost from BoM items
 * @param {Array} bomItems - Array of BoM items with price and quantity
 * @returns {number} Total material cost
 */
export const calculateTotalMaterialCost = (bomItems) => {
  return bomItems.reduce((sum, item) => {
    const price = item.price || item.standard_price || 0
    const quantity = item.quantity || 0
    return sum + (price * quantity)
  }, 0)
}

/**
 * Calculate production cost (HPP)
 * Formula: productionCost = totalMaterialCost / (1 - overheadPercentage / 100)
 * @param {number} totalMaterialCost - Total material cost
 * @param {number} overheadPercentage - Overhead percentage (0-100)
 * @returns {number} Production cost
 */
export const calculateProductionCost = (totalMaterialCost, overheadPercentage) => {
  if (overheadPercentage >= 100) return totalMaterialCost
  const multiplier = 1 - (overheadPercentage / 100)
  return totalMaterialCost / multiplier
}

/**
 * Calculate estimated selling price
 * Formula: sellingPrice = productionCost / (1 - targetMarginPercentage / 100)
 * @param {number} productionCost - Production cost
 * @param {number} targetMarginPercentage - Target margin percentage (0-100)
 * @returns {number} Estimated selling price
 */
export const calculateSellingPrice = (productionCost, targetMarginPercentage) => {
  if (targetMarginPercentage >= 100) return productionCost
  const multiplier = 1 - (targetMarginPercentage / 100)
  return productionCost / multiplier
}

/**
 * Calculate gross profit per unit
 * Formula: grossProfit = sellingPrice - productionCost
 * @param {number} sellingPrice - Selling price
 * @param {number} productionCost - Production cost
 * @returns {number} Gross profit per unit
 */
export const calculateGrossProfit = (sellingPrice, productionCost) => {
  return sellingPrice - productionCost
}

/**
 * Calculate all costs at once
 * @param {Array} bomItems - Array of BoM items
 * @param {number} overheadPercentage - Overhead percentage
 * @param {number} targetMarginPercentage - Target margin percentage
 * @returns {Object} Object containing all calculated values
 */
export const calculateAllCosts = (bomItems, overheadPercentage, targetMarginPercentage) => {
  const totalMaterialCost = calculateTotalMaterialCost(bomItems)
  const productionCost = calculateProductionCost(totalMaterialCost, overheadPercentage)
  const sellingPrice = calculateSellingPrice(productionCost, targetMarginPercentage)
  const grossProfit = calculateGrossProfit(sellingPrice, productionCost)
  
  return {
    totalMaterialCost: Math.round(totalMaterialCost),
    productionCost: Math.round(productionCost),
    sellingPrice: Math.round(sellingPrice),
    grossProfit: Math.round(grossProfit)
  }
}

/**
 * Validate percentage value
 * @param {number} value - Percentage value
 * @returns {boolean} True if valid (0-100)
 */
export const isValidPercentage = (value) => {
  const num = parseFloat(value)
  return !isNaN(num) && num >= 0 && num < 100
}

/**
 * Validate positive number
 * @param {number} value - Number value
 * @returns {boolean} True if valid positive number
 */
export const isValidPositiveNumber = (value) => {
  const num = parseFloat(value)
  return !isNaN(num) && num >= 0
}
