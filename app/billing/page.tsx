'use client'

import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

import { useStripe } from '@/hooks/useStripe'
import { useUser } from '@/hooks/useUser'
import { InvoiceList } from '@/components/billing/invoice-list'
import { PaymentMethodList } from '@/components/billing/payment-method-list'

export default function BillingPage() {
  const { user } = useUser()
  const { 
    customerData,
    paymentMethods,
    invoices,
    loading,
    error
  } = useStripe()

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">Please sign in to access billing.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Billing</h1>
      
      {customerData && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Name:</span> {customerData.name || 'Not provided'}</p>
            <p><span className="font-medium">Email:</span> {customerData.email}</p>
            <p><span className="font-medium">Customer ID:</span> {customerData.stripe_customer_id}</p>
          </div>
        </div>
      )}

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Payment Methods</h2>
        <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-gray-500" />}>
          <PaymentMethodList
            paymentMethods={paymentMethods}
            onRemove={() => {}}
          />
        </Suspense>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Invoices</h2>
        <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-gray-500" />}>
          <InvoiceList
            invoices={invoices}
            onPay={() => {}}
          />
        </Suspense>
      </section>
    </div>
  )
} 