import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VeriCrop FinBridge - 60-Second Forensic AI',
  description: 'Reducing agricultural insurance claim processing from 6 months to 60 seconds using physics-based fraud detection',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
