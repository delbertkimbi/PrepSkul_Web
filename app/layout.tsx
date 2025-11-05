import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
})

export const metadata: Metadata = {
  title: 'PrepSkul: Find Trusted Home and Online Tutors in Cameroon',
  description: 'Get connected with verified home and online tutors who don’t just teach, but mentor and inspire — offering personalized support for academics, skill development, and exam preparation in Cameroon and beyond.',
  icons: {
    icon: [
      { url: '/logo-blue.png', type: 'image/png' },
      { url: '/logo-blue.png', type: 'image/png', sizes: 'any' }
    ],
    shortcut: '/logo-blue.png',
    apple: '/logo-blue.png',
  },
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
      </body>
    </html>
  )
}
