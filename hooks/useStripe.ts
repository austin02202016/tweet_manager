import { useState, useEffect } from 'react'
import { StripeCustomer, StripeInvoice, StripePaymentMethod } from '@/types'

export function useStripe() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [customerData, setCustomerData] = useState<StripeCustomer | null>(null)
  const [invoices, setInvoices] = useState<StripeInvoice[]>([])
  const [paymentMethods, setPaymentMethods] = useState<StripePaymentMethod[]>([])

  useEffect(() => {
    fetchCustomerData()
  }, [])

  const fetchCustomerData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch customer data
      const customerResponse = await fetch('/api/stripe/customer')
      if (!customerResponse.ok) {
        throw new Error('Failed to fetch customer data')
      }
      const customerData = await customerResponse.json()
      setCustomerData(customerData)

      // Fetch invoices
      const invoicesResponse = await fetch('/api/stripe/invoices')
      if (!invoicesResponse.ok) {
        throw new Error('Failed to fetch invoices')
      }
      const invoicesData = await invoicesResponse.json()
      setInvoices(invoicesData)

      // Fetch payment methods
      const paymentMethodsResponse = await fetch('/api/stripe/payment-methods')
      if (!paymentMethodsResponse.ok) {
        throw new Error('Failed to fetch payment methods')
      }
      const paymentMethodsData = await paymentMethodsResponse.json()
      setPaymentMethods(paymentMethodsData)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    customerData,
    invoices,
    paymentMethods,
    refreshData: fetchCustomerData
  }
} 