import { createContext, useContext, useState, useCallback } from 'react'
import ConfirmationDialog from '../components/ConfirmationDialog'

const ConfirmationContext = createContext()

export const useConfirmation = () => {
  const context = useContext(ConfirmationContext)
  if (!context) {
    throw new Error('useConfirmation must be used within a ConfirmationProvider')
  }
  return context
}

export const ConfirmationProvider = ({ children }) => {
  const [confirmation, setConfirmation] = useState(null)

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      setConfirmation({
        ...options,
        onConfirm: () => {
          setConfirmation(null)
          resolve(true)
        },
        onCancel: () => {
          setConfirmation(null)
          resolve(false)
        }
      })
    })
  }, [])

  return (
    <ConfirmationContext.Provider value={{ confirm }}>
      {children}
      {confirmation && (
        <ConfirmationDialog
          isOpen={!!confirmation}
          title={confirmation.title}
          message={confirmation.message}
          confirmLabel={confirmation.confirmLabel}
          cancelLabel={confirmation.cancelLabel}
          variant={confirmation.variant}
          onConfirm={confirmation.onConfirm}
          onCancel={confirmation.onCancel}
        />
      )}
    </ConfirmationContext.Provider>
  )
}
