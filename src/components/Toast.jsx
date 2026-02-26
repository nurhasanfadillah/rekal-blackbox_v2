import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

const ToastContext = createContext()

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type, duration }])
    
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const success = useCallback((message) => addToast(message, 'success'), [addToast])
  const error = useCallback((message) => addToast(message, 'error'), [addToast])
  const info = useCallback((message) => addToast(message, 'info'), [addToast])

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      {children}
      <div className="fixed top-4 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <ToastItem key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

const ToastItem = ({ message, type, onClose }) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info
  }
  
  const colors = {
    success: 'bg-accent-emerald/90 text-white',
    error: 'bg-accent-rose/90 text-white',
    info: 'bg-primary-500/90 text-white'
  }
  
  const Icon = icons[type]

  return (
    <div className={`${colors[type]} backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg flex items-center gap-3 pointer-events-auto animate-slide-up`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="text-sm font-medium flex-1">{message}</p>

      <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

// Default export for App.jsx
const Toast = () => {
  return <ToastProvider />
}

export default Toast
