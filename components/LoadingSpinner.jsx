export default function LoadingSpinner({ size = 'md', text = 'Yükleniyor...' }) {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`animate-spin rounded-full border-b-2 border-primary ${sizes[size]}`}></div>
      {text && <p className="mt-4 text-gray-600">{text}</p>}
    </div>
  )
}

export function FullPageLoader({ text = 'Yükleniyor...' }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}

export function InlineLoader({ text }) {
  return (
    <div className="flex items-center justify-center py-4">
      <LoadingSpinner size="sm" text={text} />
    </div>
  )
}
