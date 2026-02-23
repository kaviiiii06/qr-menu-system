import { AlertCircle, RefreshCw } from 'lucide-react'

export default function ErrorMessage({ 
  title = 'Bir hata oluştu', 
  message, 
  onRetry 
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="bg-red-50 rounded-full p-4 mb-4">
        <AlertCircle className="w-12 h-12 text-red-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {message && <p className="text-gray-600 text-center mb-4">{message}</p>}
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          <RefreshCw className="w-4 h-4" />
          Tekrar Dene
        </button>
      )}
    </div>
  )
}

export function InlineError({ message, onRetry }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-red-800">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-sm text-red-600 hover:text-red-800 font-medium mt-2"
            >
              Tekrar dene
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function EmptyState({ 
  icon: Icon = AlertCircle,
  title = 'Veri bulunamadı', 
  message,
  action 
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <div className="bg-gray-100 rounded-full p-4 mb-4">
        <Icon className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {message && <p className="text-gray-600 text-center mb-4">{message}</p>}
      {action && action}
    </div>
  )
}
