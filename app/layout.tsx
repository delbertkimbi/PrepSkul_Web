import type React from "react"
import type { Metadata } from "next"
import { Poppins, Lato } from "next/font/google"
import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
})

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-lato",
  display: "swap",
})

export const metadata: Metadata = {
  title: "PrepSkul: Find Trusted Home and Online Tutors in Cameroon",
  description: "Get connected with verified home and online tutors who don't just teach, but mentor and inspire — offering personalized support for academics, skill development, and exam preparation in Cameroon and beyond.",
  icons: {
    icon: [
      { url: '/logo.jpg', sizes: '32x32', type: 'image/jpeg' },
      { url: '/logo.jpg', sizes: '192x192', type: 'image/jpeg' },
      { url: '/logo.jpg', sizes: '512x512', type: 'image/jpeg' },
    ],
    apple: [
      { url: '/logo.jpg', sizes: '180x180', type: 'image/jpeg' },
    ],
    shortcut: '/logo.jpg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} ${lato.variable}`}>
        {children}
      </body>
    </html>
  )
}
