import { useState } from 'react'
import { Banknote, CreditCard } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default function PaymentModal({ order, tables, onConfirm, onCancel }) {
  const [paymentMethod, setPaymentMethod] = useState('CASH')

  const tableNumber = tables.find(t => t.id === order.table_id)?.table_number

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Ödeme Yöntemi Seçin</h3>
        
        <div className="mb-4">
          <p className="text-gray-600 mb-2">Masa {tableNumber}</p>
          <p className="text-2xl font-bold text-primary">
            {formatPrice(order.total_amount)}
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <button
            onClick={() => setPaymentMethod('CASH')}
            className={`w-full p-4 rounded-xl border-2 transition-all ${
              paymentMethod === 'CASH'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                paymentMethod === 'CASH' ? 'bg-green-500 text-white' : 'bg-gray-100'
              }`}>
                <Banknote className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Nakit</p>
                <p className="text-sm text-gray-600">Nakit ödeme</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setPaymentMethod('CARD')}
            className={`w-full p-4 rounded-xl border-2 transition-all ${
              paymentMethod === 'CARD'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                paymentMethod === 'CARD' ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}>
                <CreditCard className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Kredi Kartı</p>
                <p className="text-sm text-gray-600">Kart ile ödeme</p>
              </div>
            </div>
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50"
          >
            İptal
          </button>
          <button
            onClick={() => onConfirm(paymentMethod)}
            className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90"
          >
            Onayla
          </button>
        </div>
      </div>
    </div>
  )
}
