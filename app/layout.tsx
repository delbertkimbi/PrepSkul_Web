import type React from "react"
import type { Metadata } from "next"
import { Manrope } from "next/font/google"
import "./globals.css"

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
})

export const metadata: Metadata = {
  title: "PrepSkul | From Teaching to Understanding",
  description:
    "PrepSkul bridges classroom teaching and individual understanding through trusted tutors, practical learning programs, and SkulMate.",
  icons: {
    icon: [
      { url: "/logo.jpg", sizes: "32x32", type: "image/jpeg" },
      { url: "/logo.jpg", sizes: "192x192", type: "image/jpeg" },
      { url: "/logo.jpg", sizes: "512x512", type: "image/jpeg" },
    ],
    apple: [{ url: "/logo.jpg", sizes: "180x180", type: "image/jpeg" }],
    shortcut: "/logo.jpg",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${manrope.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
