export interface Organization {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  first_name: string
  name: string
  email: string
  created_at: string
  updated_at: string
}

export interface StripeCustomer {
  id: string
  user_id: string
  stripe_customer_id: string
  email: string
  created_at: string
  updated_at: string
}

export interface StripeInvoice {
  id: string
  customer_id: string
  stripe_invoice_id: string
  number: string
  amount: number
  status: 'open' | 'paid' | 'void' | 'uncollectible'
  created: string
  due_date: string
  period_start: string
  period_end: string
  pdf_url: string
  items: {
    id: string
    amount: number
    description: string
  }[]
}

export interface StripePaymentMethod {
  id: string
  customer_id: string
  stripe_payment_method_id: string
  type: string
  last4: string
  exp_month: number
  exp_year: number
  brand: string
  created_at: string
  updated_at: string
} 