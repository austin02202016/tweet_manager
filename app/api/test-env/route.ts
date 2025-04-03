import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasStripeKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    hasStripeApiKey: !!process.env.STRIPE_API_KEY,
    stripeKeyLength: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.length,
    stripeApiKeyLength: process.env.STRIPE_API_KEY?.length,
  })
} 