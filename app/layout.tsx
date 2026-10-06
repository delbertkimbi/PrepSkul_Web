import type React from "react"
import type { Metadata } from "next"
import { Fredoka, Poppins } from "next/font/google"
import "./globals.css"

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://prepskul.com"),
  title: {
    default: "PrepSkul | Learn with Mate and trusted tutors",
    template: "%s | PrepSkul",
  },
  description:
    "Learn at your pace with SkulMate, PrepSkul's patient AI tutor, and trusted tutors for online and in-person lessons across Cameroon.",
  keywords: ["online tutoring Cameroon", "AI tutor", "math tutor", "French tutor", "PrepSkul", "SkulMate"],
  alternates: { canonical: "https://prepskul.com" },
  openGraph: {
    type: "website",
    siteName: "PrepSkul",
    title: "PrepSkul | Learn with Mate and trusted tutors",
    description: "Clear explanations, guided practice, and trusted tutors when you want one-to-one help.",
    url: "https://prepskul.com",
    images: [{ url: "/logo.jpg", width: 512, height: 512, alt: "PrepSkul" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PrepSkul | Learn with Mate and trusted tutors",
    description: "Clear explanations, guided practice, and trusted tutors when you want one-to-one help.",
    images: ["/logo.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
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
      <body className={`${fredoka.variable} ${poppins.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
