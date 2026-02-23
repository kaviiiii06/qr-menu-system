import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react'

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Onayla',
  cancelText = 'İptal',
  type = 'warning', // 'warning', 'danger', 'info', 'success'
  isLoading = false,
}) {
  if (!isOpen) return null

  const icons = {
    warning: { Icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    danger: { Icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
    info: { Icon: Info, color: 'text-blue-600', bg: 'bg-blue-100' },
    success: { Icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  }

  const { Icon, color, bg } = icons[type]

  const buttonColors = {
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    danger: 'bg-red-600 hover:bg-red-700',
    info: 'bg-blue-600 hover:bg-blue-700',
    success: 'bg-green-600 hover:bg-green-700',
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-start gap-4 mb-4">
          <div className={`${bg} rounded-full p-3`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600">{message}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-3 text-white rounded-xl font-semibold ${buttonColors[type]} disabled:opacity-50`}
          >
            {isLoading ? 'İşleniyor...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
