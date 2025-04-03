import { useState } from 'react'
import { Download } from 'lucide-react'
import type { StripeInvoice } from '@/types'

interface InvoiceListProps {
  invoices: StripeInvoice[]
  onPay: (id: string) => Promise<boolean>
}

export function InvoiceList({ invoices, onPay }: InvoiceListProps) {
  const [showAll, setShowAll] = useState(false)
  const [processing, setProcessing] = useState<string | null>(null)

  const handlePay = async (invoiceId: string) => {
    setProcessing(invoiceId)
    await onPay(invoiceId)
    setProcessing(null)
  }

  const displayInvoices = showAll 
    ? invoices 
    : invoices.filter(invoice => invoice.status === 'open')

  if (invoices.length === 0) {
    return (
      <div className="text-gray-500 text-sm">
        No invoices found.
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          {showAll ? 'Show Open Only' : 'Show All'}
        </button>
      </div>

      <div className="space-y-4">
        {displayInvoices.map((invoice) => (
          <div
            key={invoice.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div>
              <p className="font-medium">
                Invoice #{invoice.number}
              </p>
              <p className="text-sm text-gray-500">
                Amount: ${(invoice.amount / 100).toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">
                Due: {new Date(invoice.due_date).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`
                px-2 py-1 text-xs rounded-full
                ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' : ''}
                ${invoice.status === 'open' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${invoice.status === 'void' ? 'bg-gray-100 text-gray-800' : ''}
                ${invoice.status === 'uncollectible' ? 'bg-red-100 text-red-800' : ''}
              `}>
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </span>
              {invoice.pdf_url && (
                <a
                  href={invoice.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <Download className="h-5 w-5" />
                </a>
              )}
              {invoice.status === 'open' && (
                <button
                  onClick={() => handlePay(invoice.id)}
                  disabled={processing === invoice.id}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing === invoice.id ? 'Processing...' : 'Pay Now'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 