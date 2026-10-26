import { AlertTriangle, Trash2, X, CheckCircle, Info } from 'lucide-react'

const ConfirmationDialog = ({
  isOpen,
  title = 'Konfirmasi',
  message = 'Apakah Anda yakin?',
  confirmLabel = 'Ya',
  cancelLabel = 'Batal',
  variant = 'danger',
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null

  const icons = {
    danger: Trash2,
    warning: AlertTriangle,
    info: Info,
    success: CheckCircle
  }

  const colors = {
    danger: {
      icon: 'bg-danger/10 text-danger',
      button: 'bg-danger hover:bg-danger/90 text-white',
    },
    warning: {
      icon: 'bg-warning/10 text-warning',
      button: 'bg-warning hover:bg-warning/90 text-white',
    },
    info: {
      icon: 'bg-accent-blue/10 text-accent-blue',
      button: 'bg-accent-blue hover:bg-accent-blue/90 text-white',
    }
  }

  const Icon = icons[variant] || icons.danger
  const colorScheme = colors[variant] || colors.danger

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[rgba(23,43,77,0.45)] backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md bg-surface-1 rounded-lg border border-hairline shadow-xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-hairline">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded ${colorScheme.icon} flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold text-ink">{title}</h2>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 text-ink-muted hover:text-ink hover:bg-surface-2 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4">
          <p className="text-sm text-ink-muted leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-5 pb-5">
          <button
            onClick={onCancel}
            className="btn-secondary flex-1"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2 px-4 rounded font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${colorScheme.button}`}
            style={{ borderRadius: '5px' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationDialog
