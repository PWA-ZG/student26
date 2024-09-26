import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NRPPZWeather',
  description: 'By Karlo J. Kardum',
  generator: "Next.js",
  manifest: "/manifest.webmanifest",
  keywords: ["NRPPZWeather", "Karlo J. Kardum"],
  authors: [
    { name: "Karlo J. Kardum", url: "https://www.linkedin.com/in/kjkardum/" },
  ],
  icons: [
    { rel: "apple-touch-icon", url: "assets/icons/icon-128x128.png" },
    { rel: "icon", url: "assets/icons/icon-128x128.png" },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
