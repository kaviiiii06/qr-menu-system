import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import MenuHeader from '@/components/MenuHeader'
import ProductList from '@/components/ProductList'
import MenuClient from '@/components/MenuClient'
import Footer from '@/components/Footer'

export default async function MenuPage({ params }) {
  const { slug, tableId } = await params

  // Restoran bilgilerini çek
  const { data: restaurant, error: restaurantError } = await supabase
    .from('restaurants')
    .select('*')
    .eq('slug', slug)
    .single()

  if (restaurantError || !restaurant) {
    notFound()
  }

  // Masa bilgilerini doğrula
  const { data: table, error: tableError } = await supabase
    .from('tables')
    .select('*')
    .eq('id', tableId)
    .eq('restaurant_id', restaurant.id)
    .single()

  if (tableError || !table) {
    notFound()
  }

  // Kategorileri çek
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .order('sort_order', { ascending: true })

  // Ürünleri çek
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .in(
      'category_id',
      categories?.map((c) => c.id) || []
    )
    .order('name', { ascending: true })

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <MenuHeader restaurant={restaurant} tableNumber={table.table_number} />

      {/* Ürün Listesi */}
      {categories && categories.length > 0 ? (
        <ProductList products={products || []} categories={categories} />
      ) : (
        <div className="max-w-4xl mx-auto p-4">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">Henüz menü eklenmemiş.</p>
          </div>
        </div>
      )}

      {/* Floating Action Button & Toast */}
      <MenuClient restaurantId={restaurant.id} tableId={table.id} />

      {/* Footer */}
      <Footer />
    </div>
  )
}
