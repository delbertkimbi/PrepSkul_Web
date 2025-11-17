import type React from "react"
import type { Metadata } from "next"
import { Poppins, Lato } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { PerformanceOptimizer } from "@/components/performance-optimizer"
import { LocaleProvider } from "@/lib/locale-context"
import { localeMetadata, type Locale } from "@/lib/i18n"
import "../globals.css"
import { Suspense } from "react"

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

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: Locale }> 
}): Promise<Metadata> {
  const { locale } = await params
  const metadata = localeMetadata[locale]

  return {
    ...metadata,
    keywords: metadata?.keywords ? [...metadata.keywords] : [],
    authors: [{ name: "PrepSkul Team" }],
    creator: "PrepSkul",
    publisher: "PrepSkul",
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
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL("https://prepskul.com"),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'en': '/en',
        'fr': '/fr',
      }
    },
    openGraph: {
      ...(metadata?.openGraph || {}),
      type: "website",
      url: `https://prepskul.com/${locale}`,
      locale: locale === 'fr' ? 'fr_CM' : 'en_CM',
      siteName: "PrepSkul",
      title: metadata?.title || "PrepSkul - Expert Tutoring in Cameroon",
      description: metadata?.description || "Find the best online and home tutors in Cameroon. Expert tutoring for GCE, BEPC, Baccalauréat, Math, English, Science.",
      images: [
        {
          url: "https://prepskul.com/logo.jpg",
          width: 1200,
          height: 630,
          alt: "PrepSkul - Expert Tutoring in Cameroon",
        },
      ],
    },
    twitter: {
      ...(metadata?.twitter || {}),
      card: "summary_large_image",
      site: "@prepskul",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: "your-google-verification-code",
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params

  return (
    <html lang={locale}>
      <body className={`${poppins.variable} ${lato.variable} font-sans antialiased`}>
        <PerformanceOptimizer />
        <LocaleProvider locale={locale}>
          <Suspense fallback={null}>{children}</Suspense>
        </LocaleProvider>
        <Analytics />
      </body>
    </html>
  )
}
