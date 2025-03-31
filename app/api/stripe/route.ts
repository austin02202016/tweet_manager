// import { NextResponse } from 'next/server'
// import Stripe from 'stripe'
// import { createClient } from '@supabase/supabase-js'

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
// })

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// )

// export async function POST(request: Request) {
//   try {
//     const body = await request.json()
//     const { type, data } = body

//     switch (type) {
//       case 'customer.subscription.created':
//       case 'customer.subscription.updated':
//         await handleSubscriptionChange(data.object)
//         break

//       case 'invoice.paid':
//       case 'invoice.payment_failed':
//         await handleInvoiceChange(data.object)
//         break

//       case 'payment_method.attached':
//         await handlePaymentMethodAttached(data.object)
//         break

//       case 'payment_method.detached':
//         await handlePaymentMethodDetached(data.object)
//         break
//     }

//     return NextResponse.json({ received: true })
//   } catch (error) {
//     console.error('Error processing Stripe webhook:', error)
//     return NextResponse.json(
//       { error: 'Webhook handler failed' },
//       { status: 400 }
//     )
//   }
// }

// async function handleSubscriptionChange(subscription: Stripe.Subscription) {
//   const { data: customer } = await supabase
//     .from('stripe_customers')
//     .select('*')
//     .eq('stripe_customer_id', subscription.customer)
//     .single()

//   if (customer) {
//     await supabase
//       .from('stripe_customers')
//       .update({
//         subscription_id: subscription.id,
//         subscription_status: subscription.status,
//         subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString()
//       })
//       .eq('id', customer.id)
//   }
// }

// async function handleInvoiceChange(invoice: Stripe.Invoice) {
//   const { data: customer } = await supabase
//     .from('stripe_customers')
//     .select('*')
//     .eq('stripe_customer_id', invoice.customer)
//     .single()

//   if (customer) {
//     const invoiceData = {
//       customer_id: customer.id,
//       stripe_invoice_id: invoice.id,
//       amount: invoice.amount_paid,
//       status: invoice.status,
//       created: new Date(invoice.created * 1000).toISOString(),
//       period_start: new Date(invoice.period_start * 1000).toISOString(),
//       period_end: new Date(invoice.period_end * 1000).toISOString(),
//       pdf_url: invoice.invoice_pdf,
//       items: invoice.lines.data.map((line: Stripe.InvoiceLineItem) => ({
//         name: line.description,
//         amount: line.amount
//       }))
//     }

//     await supabase
//       .from('stripe_invoices')
//       .upsert(invoiceData, {
//         onConflict: 'stripe_invoice_id'
//       })
//   }
// }

// async function handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod) {
//   const { data: customer } = await supabase
//     .from('stripe_customers')
//     .select('*')
//     .eq('stripe_customer_id', paymentMethod.customer)
//     .single()

//   if (customer) {
//     const paymentMethodData = {
//       customer_id: customer.id,
//       payment_method_id: paymentMethod.id,
//       type: paymentMethod.type,
//       card_brand: paymentMethod.card?.brand,
//       card_last4: paymentMethod.card?.last4,
//       card_exp_month: paymentMethod.card?.exp_month,
//       card_exp_year: paymentMethod.card?.exp_year,
//       billing_name: paymentMethod.billing_details.name,
//       is_default: false
//     }

//     await supabase
//       .from('stripe_payment_methods')
//       .upsert(paymentMethodData, {
//         onConflict: 'payment_method_id'
//       })
//   }
// }

// async function handlePaymentMethodDetached(paymentMethod: Stripe.PaymentMethod) {
//   await supabase
//     .from('stripe_payment_methods')
//     .delete()
//     .eq('payment_method_id', paymentMethod.id)
// } 