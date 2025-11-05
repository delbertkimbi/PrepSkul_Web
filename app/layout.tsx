import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
})

export const metadata: Metadata = {
  title: 'PrepSkul: Find Trusted Home and Online Tutors in Cameroon',
  description: "Get connected with verified home and online tutors who don't just teach, but mentor and inspire — offering personalized support for academics, skill development, and exam preparation in Cameroon and beyond.",
  keywords: ['tutors Cameroon', 'home tutoring', 'online tutoring', 'GCE tutors', 'BEPC tutors', 'private tutors', 'tutoring services Cameroon'],
  authors: [{ name: 'PrepSkul' }],
  openGraph: {
    title: 'PrepSkul: Find Trusted Home and Online Tutors in Cameroon',
    description: "Get connected with verified home and online tutors who don't just teach, but mentor and inspire — offering personalized support for academics, skill development, and exam preparation in Cameroon and beyond.",
    url: 'https://www.prepskul.com',
    siteName: 'PrepSkul',
    images: [
      {
        url: '/logo-blue.png',
        width: 1200,
        height: 630,
        alt: 'PrepSkul Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PrepSkul: Find Trusted Home and Online Tutors in Cameroon',
    description: "Get connected with verified home and online tutors who don't just teach, but mentor and inspire — offering personalized support for academics, skill development, and exam preparation in Cameroon and beyond.",
    images: ['/logo-blue.png'],
  },
  icons: {
    icon: [
      { url: '/logo-blue.png?v=2', type: 'image/png', sizes: '32x32' },
      { url: '/logo-blue.png?v=2', type: 'image/png', sizes: '16x16' },
      { url: '/logo-blue.png?v=2', type: 'image/png', sizes: 'any' }
    ],
    shortcut: '/logo-blue.png?v=2',
    apple: '/logo-blue.png?v=2',
  },
  metadataBase: new URL('https://www.prepskul.com'),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={poppins.variable}>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
