'use client'

import { useState, useEffect } from 'react'
import ProductCard from './ProductCard'

export default function ProductList({ products, categories }) {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || null)
  const [filteredProducts, setFilteredProducts] = useState(products)

  useEffect(() => {
    if (selectedCategory) {
      const filtered = products.filter(
        (product) => product.category_id === selectedCategory
      )
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(products)
    }
  }, [selectedCategory, products])

  return (
    <div className="max-w-4xl mx-auto">
      {/* Kategori Tabs */}
      <div className="bg-white shadow-sm sticky top-[88px] z-10 border-b border-gray-200">
        <div className="px-4">
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
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

      {/* Ürün Listesi */}
      <div className="p-4 space-y-3">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Bu kategoride ürün bulunmuyor.</p>
          </div>
        )}
      </div>
    </div>
  )
}
