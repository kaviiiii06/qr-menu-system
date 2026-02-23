import { Search, X } from 'lucide-react'

export default function SearchBar({ 
  value, 
  onChange, 
  placeholder = 'Ara...', 
  onClear 
}) {
  return (
    <div className="relative">
      <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
      />
      {value && (
        <button
          onClick={() => {
            onChange('')
            onClear?.()
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}

export function FilterButton({ 
  label, 
  isActive, 
  onClick, 
  count 
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
        isActive
          ? 'bg-primary text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {label}
      {count !== undefined && ` (${count})`}
    </button>
  )
}

export function FilterGroup({ children }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {children}
    </div>
  )
}
