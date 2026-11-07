export const calculateSubtotal = (price, quantity) => {
  return price * quantity
}

export const calculateTotalMaterialCost = (bomItems) => {
  return bomItems.reduce((sum, item) => {
    const price = item.price || item.standard_price || 0
    const quantity = item.quantity || 0
    return sum + (price * quantity)
  }, 0)
}

// HPP Final = total material + overhead (overhead adalah % dari total material)
export const calculateHppFinal = (totalMaterialCost, overheadPercentage) => {
  return totalMaterialCost * (1 + overheadPercentage / 100)
}

// Harga Pabrik = HPP Final + margin% dari harga pabrik
export const calculateHargaPabrik = (hppFinal, marginPabrikPercentage) => {
  if (marginPabrikPercentage >= 100) return hppFinal
  return hppFinal / (1 - marginPabrikPercentage / 100)
}

// Harga Jual = Harga Pabrik + margin% dari harga jual
export const calculateHargaJual = (hargaPabrik, marginJualPercentage) => {
  if (marginJualPercentage >= 100) return hargaPabrik
  return hargaPabrik / (1 - marginJualPercentage / 100)
}

// Harga Marketplace = Harga Jual + admin% dari harga marketplace
export const calculateHargaMarketplace = (hargaJual, adminPercentage) => {
  if (adminPercentage >= 100) return hargaJual
  return hargaJual / (1 - adminPercentage / 100)
}

// Full 5-step calculation (digunakan di halaman simulasi)
// cmtCost: biaya CMT flat per unit, dijumlahkan ke total material sebelum overhead
export const calculateAllCostsExtended = (bomItems, overheadPct, marginPabrikPct, marginJualPct, adminPct, cmtCost = 0) => {
  const totalMaterialCost = calculateTotalMaterialCost(bomItems)
  const cmt = cmtCost || 0
  const hppProdukJadi = totalMaterialCost + cmt
  const overheadAmount = hppProdukJadi * (overheadPct / 100)
  const hppFinal = hppProdukJadi + overheadAmount
  const hargaPabrik = calculateHargaPabrik(hppFinal, marginPabrikPct)
  const hargaJual = calculateHargaJual(hargaPabrik, marginJualPct)
  const hargaMarketplace = calculateHargaMarketplace(hargaJual, adminPct)

  return {
    totalMaterialCost: Math.round(totalMaterialCost),
    cmtCost: Math.round(cmt),
    hppProdukJadi: Math.round(hppProdukJadi),
    overheadAmount: Math.round(overheadAmount),
    hppFinal: Math.round(hppFinal),
    hargaPabrik: Math.round(hargaPabrik),
    hargaJual: Math.round(hargaJual),
    hargaMarketplace: Math.round(hargaMarketplace),
  }
}

// Simplified calculation (digunakan di ProductForm — 2 parameter)
export const calculateAllCosts = (bomItems, overheadPercentage, targetMarginPercentage) => {
  const totalMaterialCost = calculateTotalMaterialCost(bomItems)
  const hppFinal = calculateHppFinal(totalMaterialCost, overheadPercentage)
  const sellingPrice = targetMarginPercentage >= 100 ? hppFinal : hppFinal / (1 - targetMarginPercentage / 100)
  const grossProfit = sellingPrice - hppFinal

  return {
    totalMaterialCost: Math.round(totalMaterialCost),
    productionCost: Math.round(hppFinal),
    sellingPrice: Math.round(sellingPrice),
    grossProfit: Math.round(grossProfit)
  }
}

export const calculateMaterialUsage = (usageItems, materialWidth) => {
  if (!materialWidth || materialWidth <= 0) return 0

  const totalArea = usageItems.reduce((sum, item) => {
    const L = parseFloat(item.L) || 0
    const W = parseFloat(item.W) || 0
    const x = parseFloat(item.x) || 0
    return sum + (L * W * x)
  }, 0)

  return totalArea / materialWidth
}
