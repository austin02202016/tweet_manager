// import { useState, useEffect } from 'react'
// import { supabase } from '@/lib/supabase'

// interface StripeCustomer {
//   id: string
//   user_id: string
//   stripe_customer_id: string
//   email: string
//   created_at: string
//   updated_at: string
// }

// interface StripeInvoice {
//   id: string
//   customer_id: string
//   stripe_invoice_id: string
//   number: string
//   amount: number
//   status: 'open' | 'paid' | 'void' | 'uncollectible'
//   created: string
//   due_date: string
//   period_start: string
//   period_end: string
//   pdf_url: string | null
//   items: Array<{
//     name: string
//     amount: number
//   }>
//   created_at: string
//   updated_at: string
// }

// interface StripePaymentMethod {
//   id: string
//   customer_id: string
//   stripe_payment_method_id: string
//   type: string
//   last4: string
//   exp_month: number
//   exp_year: number
//   brand: string
//   created_at: string
//   updated_at: string
// }

// export function useStripe() {
//   const [customer, setCustomer] = useState<StripeCustomer | null>(null)
//   const [invoices, setInvoices] = useState<StripeInvoice[]>([])
//   const [paymentMethods, setPaymentMethods] = useState<StripePaymentMethod[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   useEffect(() => {
//     async function fetchStripeData() {
//       try {
//         // Fetch customer data for the specific customer ID
//         const { data: customerData, error: customerError } = await supabase
//           .from('stripe_customers')
//           .select('*')
//           .eq('stripe_customer_id', 'cus_RnCaOeW0UyJVq0')
//           .single()

//         if (customerError) throw customerError
//         setCustomer(customerData)

//         // Fetch invoices for this customer
//         const { data: invoiceData, error: invoiceError } = await supabase
//           .from('stripe_invoices')
//           .select('*')
//           .eq('customer_id', customerData.id)
//           .order('created', { ascending: false })

//         if (invoiceError) throw invoiceError
//         setInvoices(invoiceData)

//         // Fetch payment methods for this customer
//         const { data: paymentMethodData, error: paymentMethodError } = await supabase
//           .from('stripe_payment_methods')
//           .select('*')
//           .eq('customer_id', customerData.id)

//         if (paymentMethodError) throw paymentMethodError
//         setPaymentMethods(paymentMethodData)
//       } catch (err) {
//         setError(err instanceof Error ? err.message : 'An error occurred')
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchStripeData()
//   }, [])

//   const addPaymentMethod = async (paymentMethodId: string) => {
//     try {
//       const { data, error } = await supabase
//         .from('stripe_payment_methods')
//         .insert([
//           {
//             customer_id: customer?.id,
//             stripe_payment_method_id: paymentMethodId,
//             type: 'card',
//             // Other fields will be populated by the webhook
//           }
//         ])
//         .select()
//         .single()

//       if (error) throw error
//       setPaymentMethods([...paymentMethods, data])
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to add payment method')
//       throw err
//     }
//   }

//   const removePaymentMethod = async (paymentMethodId: string) => {
//     try {
//       const { error } = await supabase
//         .from('stripe_payment_methods')
//         .delete()
//         .eq('id', paymentMethodId)

//       if (error) throw error
//       setPaymentMethods(paymentMethods.filter(method => method.id !== paymentMethodId))
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to remove payment method')
//       throw err
//     }
//   }

//   const payInvoice = async (invoiceId: string) => {
//     try {
//       const { error } = await supabase
//         .from('stripe_invoices')
//         .update({ status: 'paid' })
//         .eq('id', invoiceId)

//       if (error) throw error
//       setInvoices(invoices.map(invoice => 
//         invoice.id === invoiceId 
//           ? { ...invoice, status: 'paid' }
//           : invoice
//       ))
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to pay invoice')
//       throw err
//     }
//   }

//   return {
//     customer,
//     invoices,
//     paymentMethods,
//     loading,
//     error,
//     addPaymentMethod,
//     removePaymentMethod,
//     payInvoice
//   }
// } 