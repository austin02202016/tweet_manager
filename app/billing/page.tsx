// "use client"

// import { useState } from "react"
// import { motion } from "framer-motion"
// import {
//   CreditCard,
//   Receipt,
//   Calendar,
//   ChevronRight,
//   Download,
//   Plus,
//   CheckCircle,
//   AlertCircle,
//   Clock,
//   DollarSign,
//   FileText,
//   Shield,
// } from "lucide-react"
// import { Sidebar } from '@/components/sidebar'
// import useOrganization from '@/hooks/useOrganization'
// import { useUser } from '@/hooks/useUser'
// import { useStripe } from '@/hooks/useStripe'
// import { Button } from '@/components/ui/button'
// import { Card } from '@/components/ui/card'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Badge } from '@/components/ui/badge'
// import { Icons } from '@/components/icons'
// import { formatCurrency } from '@/lib/utils'

// // Sample data for invoices
// const invoices = [
//   {
//     id: "INV-2025-001",
//     amount: 49.99,
//     status: "paid",
//     date: "Apr 1, 2025",
//     period: "Apr 1 - Apr 30, 2025",
//     items: [
//       { name: "Basic Plan", amount: 39.99 },
//       { name: "Additional Users (2)", amount: 10.0 },
//     ],
//   },
//   {
//     id: "INV-2025-002",
//     amount: 49.99,
//     status: "paid",
//     date: "Mar 1, 2025",
//     period: "Mar 1 - Mar 31, 2025",
//     items: [
//       { name: "Basic Plan", amount: 39.99 },
//       { name: "Additional Users (2)", amount: 10.0 },
//     ],
//   },
//   {
//     id: "INV-2025-003",
//     amount: 49.99,
//     status: "pending",
//     date: "May 1, 2025",
//     period: "May 1 - May 31, 2025",
//     items: [
//       { name: "Basic Plan", amount: 39.99 },
//       { name: "Additional Users (2)", amount: 10.0 },
//     ],
//   },
// ]

// // Sample payment method
// const paymentMethod = {
//   type: "visa",
//   last4: "4242",
//   expMonth: 12,
//   expYear: 2026,
//   name: "John Doe",
// }

// export default function BillingPage() {
//   const { organization } = useOrganization()
//   const { user } = useUser()
//   const { 
//     customer, 
//     invoices, 
//     paymentMethods, 
//     loading, 
//     error,
//     addPaymentMethod,
//     removePaymentMethod,
//     payInvoice
//   } = useStripe()

//   const [showAddCard, setShowAddCard] = useState(false)
//   const [showInvoices, setShowInvoices] = useState(false)

//   const handleAddCard = async (e: React.FormEvent) => {
//     e.preventDefault()
//     // Implementation will be added when we integrate with Stripe Elements
//     setShowAddCard(false)
//   }

//   const handleRemoveCard = async (paymentMethodId: string) => {
//     await removePaymentMethod(paymentMethodId)
//   }

//   const handlePayInvoice = async (invoiceId: string) => {
//     await payInvoice(invoiceId)
//   }

//   if (loading) {
//     return (
//       <div className="flex h-screen">
//         <Sidebar 
//           organization={organization} 
//           selectedClientId={undefined}
//           onClientSelect={() => {}}
//         />
//         <div className="flex-1 p-8">
//           <div className="flex items-center justify-center h-full">
//             <Icons.spinner className="h-8 w-8 animate-spin" />
//           </div>
//         </div>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className="flex h-screen">
//         <Sidebar 
//           organization={organization} 
//           selectedClientId={undefined}
//           onClientSelect={() => {}}
//         />
//         <div className="flex-1 p-8">
//           <div className="flex items-center justify-center h-full">
//             <div className="text-red-500">{error}</div>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="flex h-screen">
//       <Sidebar 
//         organization={organization} 
//         selectedClientId={undefined}
//         onClientSelect={() => {}}
//       />
//       <div className="flex-1 overflow-auto">
//         <div className="p-8">
//           <div className="mb-8">
//             <h1 className="text-2xl font-bold">Welcome back, {user?.first_name}</h1>
//             <p className="text-muted-foreground">Manage your billing and payment methods</p>
//           </div>

//           <div className="grid gap-6">
//             {/* Payment Methods Section */}
//             <Card className="p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-lg font-semibold">Payment Methods</h2>
//                 <Button onClick={() => setShowAddCard(true)}>
//                   Add Payment Method
//                 </Button>
//               </div>

//               {showAddCard && (
//                 <form onSubmit={handleAddCard} className="mb-6">
//                   <div className="grid gap-4">
//                     <div className="grid gap-2">
//                       <Label htmlFor="cardNumber">Card Number</Label>
//                       <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
//                     </div>
//                     <div className="grid grid-cols-2 gap-4">
//                       <div className="grid gap-2">
//                         <Label htmlFor="expiry">Expiry Date</Label>
//                         <Input id="expiry" placeholder="MM/YY" />
//                       </div>
//                       <div className="grid gap-2">
//                         <Label htmlFor="cvc">CVC</Label>
//                         <Input id="cvc" placeholder="123" />
//                       </div>
//                     </div>
//                     <Button type="submit">Add Card</Button>
//                   </div>
//                 </form>
//               )}

//               <div className="space-y-4">
//                 {paymentMethods.map((method) => (
//                   <div
//                     key={method.id}
//                     className="flex items-center justify-between p-4 border rounded-lg"
//                   >
//                     <div className="flex items-center space-x-4">
//                       <Icons.creditCard className="h-6 w-6" />
//                       <div>
//                         <p className="font-medium">•••• {method.last4}</p>
//                         <p className="text-sm text-muted-foreground">
//                           Expires {method.exp_month}/{method.exp_year}
//                         </p>
//                       </div>
//                     </div>
//                     <Button
//                       variant="ghost"
//                       onClick={() => handleRemoveCard(method.id)}
//                     >
//                       Remove
//                     </Button>
//                   </div>
//                 ))}
//               </div>
//             </Card>

//             {/* Current Invoices Section */}
//             <Card className="p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-lg font-semibold">Current Invoices</h2>
//                 <Button variant="outline" onClick={() => setShowInvoices(!showInvoices)}>
//                   {showInvoices ? 'Hide' : 'Show'} All
//                 </Button>
//               </div>

//               <div className="space-y-4">
//                 {invoices
//                   .filter((invoice) => invoice.status === 'open')
//                   .map((invoice) => (
//                     <div
//                       key={invoice.id}
//                       className="flex items-center justify-between p-4 border rounded-lg"
//                     >
//                       <div>
//                         <p className="font-medium">
//                           Invoice #{invoice.number}
//                         </p>
//                         <p className="text-sm text-muted-foreground">
//                           Due {new Date(invoice.due_date).toLocaleDateString()}
//                         </p>
//                       </div>
//                       <div className="flex items-center space-x-4">
//                         <p className="font-medium">
//                           {formatCurrency(invoice.amount)}
//                         </p>
//                         <Button onClick={() => handlePayInvoice(invoice.id)}>
//                           Pay Now
//                         </Button>
//                       </div>
//                     </div>
//                   ))}
//               </div>

//               {showInvoices && (
//                 <div className="mt-6">
//                   <h3 className="text-lg font-semibold mb-4">All Invoices</h3>
//                   <div className="space-y-4">
//                     {invoices.map((invoice) => (
//                       <div
//                         key={invoice.id}
//                         className="flex items-center justify-between p-4 border rounded-lg"
//                       >
//                         <div>
//                           <p className="font-medium">
//                             Invoice #{invoice.number}
//                           </p>
//                           <p className="text-sm text-muted-foreground">
//                             {new Date(invoice.created).toLocaleDateString()}
//                           </p>
//                         </div>
//                         <div className="flex items-center space-x-4">
//                           <p className="font-medium">
//                             {formatCurrency(invoice.amount)}
//                           </p>
//                           <Badge
//                             variant={
//                               invoice.status === 'paid'
//                                 ? 'success'
//                                 : invoice.status === 'open'
//                                 ? 'warning'
//                                 : 'destructive'
//                             }
//                           >
//                             {invoice.status}
//                           </Badge>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// } 