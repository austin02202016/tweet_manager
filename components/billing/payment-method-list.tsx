'use client'

import { CreditCard, Trash2 } from 'lucide-react'
import type { StripePaymentMethod } from '@/types'

interface PaymentMethodListProps {
  paymentMethods: StripePaymentMethod[]
  onRemove: (id: string) => Promise<boolean>
}

export function PaymentMethodList({ paymentMethods, onRemove }: PaymentMethodListProps) {
  if (paymentMethods.length === 0) {
    return (
      <div className="text-gray-500 text-sm">
        No payment methods added yet.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {paymentMethods.map((method) => (
        <div
          key={method.id}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <div className="flex items-center space-x-4">
            <CreditCard className="h-6 w-6 text-gray-500" />
            <div>
              <p className="font-medium">
                {method.brand.charAt(0).toUpperCase() + method.brand.slice(1)} •••• {method.last4}
              </p>
              <p className="text-sm text-gray-500">
                Expires {method.exp_month.toString().padStart(2, '0')}/{method.exp_year}
              </p>
              {method.isDefault && (
                <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                  Default
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => onRemove(method.id)}
            className="p-2 text-gray-500 hover:text-red-500 transition-colors"
            title="Remove payment method"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      ))}
    </div>
  )
} 