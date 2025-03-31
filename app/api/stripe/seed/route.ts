// import { NextResponse } from 'next/server'
// import { supabase } from '@/lib/supabase'

// export async function GET() {
//   try {
//     // Insert test customer
//     const { data: customerData, error: customerError } = await supabase
//       .from('stripe_customers')
//       .insert([
//         {
//           stripe_customer_id: 'cus_RnCaOeW0UyJVq0',
//           user_id: '6d89ec83-8b3c-4e3f-b0f4-17d5c3bc6a8d', // Replace with actual user ID
//           email: 'test@example.com',
//         }
//       ])
//       .select()

//     if (customerError) throw customerError

//     // Insert test invoice
//     const { data: invoiceData, error: invoiceError } = await supabase
//       .from('stripe_invoices')
//       .insert([
//         {
//           stripe_invoice_id: 'in_test123',
//           customer_id: customerData[0].id,
//           number: 'INV-2025-001',
//           amount: 4999,
//           status: 'open',
//           created: new Date().toISOString(),
//           due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
//           period_start: new Date().toISOString(),
//           period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
//           pdf_url: 'https://example.com/invoice.pdf',
//           items: [
//             {
//               id: 'ii_test123',
//               amount: 4999,
//               description: 'Monthly Subscription'
//             }
//           ]
//         }
//       ])
//       .select()

//     if (invoiceError) throw invoiceError

//     // Insert test payment method
//     const { data: paymentData, error: paymentError } = await supabase
//       .from('stripe_payment_methods')
//       .insert([
//         {
//           stripe_payment_method_id: 'pm_test123',
//           customer_id: customerData[0].id,
//           type: 'card',
//           last4: '4242',
//           exp_month: 12,
//           exp_year: 2025,
//           brand: 'visa'
//         }
//       ])
//       .select()

//     if (paymentError) throw paymentError

//     return NextResponse.json({
//       customer: customerData[0],
//       invoice: invoiceData[0],
//       paymentMethod: paymentData[0]
//     })
//   } catch (error) {
//     console.error('Error seeding data:', error)
//     return NextResponse.json({ error: 'Failed to seed data' }, { status: 500 })
//   }
// } 