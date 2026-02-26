// Indonesian Formatters

/**
 * Format number to Indonesian Rupiah currency
 * @param {number} value - Number to format
 * @param {boolean} withSymbol - Include Rp symbol
 * @returns {string} Formatted currency string
 */
export const formatRupiah = (value, withSymbol = true) => {
  if (value === null || value === undefined || isNaN(value)) {
    return withSymbol ? 'Rp 0' : '0'
  }
  
  const num = Math.round(value)
  const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  
  return withSymbol ? `Rp ${formatted}` : formatted
}


/**
 * Format number with Indonesian thousand separator
 * @param {number} value - Number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0'
  }
  
  const num = Math.round(value)
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}


/**
 * Format number with decimal places (Indonesian format)
 * @param {number} value - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted decimal string
 */
export const formatDecimal = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0'
  }
  
  const num = parseFloat(value)
  const fixed = num.toFixed(decimals)
  const parts = fixed.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  
  return parts.join(',')

}

/**
 * Format percentage value
 * @param {number} value - Percentage value
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%'
  }
  
  return `${value}%`
}

/**
 * Format date to Indonesian format
 * @param {string|Date} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '-'
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'
  
  const defaultOptions = {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  }
  
  return new Intl.DateTimeFormat('id-ID', defaultOptions).format(d)
}

/**
 * Format date with time (Indonesian format)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (date) => {
  return formatDate(date, {
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Format relative time (e.g., "2 jam yang lalu")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return '-'
  
  const d = new Date(date)
  const now = new Date()
  const diffMs = now - d
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  
  if (diffSec < 60) {
    return 'Baru saja'
  } else if (diffMin < 60) {
    return `${diffMin} menit yang lalu`
  } else if (diffHour < 24) {
    return `${diffHour} jam yang lalu`
  } else if (diffDay < 7) {
    return `${diffDay} hari yang lalu`
  } else {
    return formatDate(date)
  }
}

/**
 * Parse currency string to number
 * @param {string} value - Currency string (e.g., "Rp 10.000" or "10000")
 * @returns {number} Parsed number
 */
export const parseCurrency = (value) => {
  if (!value) return 0
  const cleaned = value.toString().replace(/[^\d]/g, '')
  return parseInt(cleaned, 10) || 0
}


/**
 * Parse percentage string to number
 * @param {string} value - Percentage string (e.g., "20%" or "20")
 * @returns {number} Parsed number
 */
export const parsePercentage = (value) => {
  if (!value) return 0
  const cleaned = value.toString().replace(/[^\d.]/g, '')
  return parseFloat(cleaned) || 0
}
