'use client'

import { useState } from 'react'

export default function CategoryTabs({ categories, onCategoryChange }) {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || null)

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId)
    onCategoryChange(categoryId)
  }

  if (!categories || categories.length === 0) {
    return null
  }

  return (
    <div className="bg-white shadow-sm sticky top-[88px] z-10 border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`
                flex-shrink-0 px-4 py-2 rounded-full font-medium text-sm transition-colors
                ${
                  selectedCategory === category.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
