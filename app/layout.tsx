import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tweetpik Image Generator',
  description: 'Generate beautiful social media images from tweets using Tweetpik API',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
