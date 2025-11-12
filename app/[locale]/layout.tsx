import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { PerformanceOptimizer } from "@/components/performance-optimizer"
import { LocaleProvider } from "@/lib/locale-context"
import { localeMetadata, defaultLocale, type Locale } from "@/lib/i18n"
import "../globals.css"
import { Suspense } from "react"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
})

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: Locale }> 
}): Promise<Metadata> {
  const { locale } = await params
  const metadata = localeMetadata[locale] || localeMetadata[defaultLocale]

  return {
    ...metadata,
    keywords: metadata.keywords ? [...metadata.keywords] : [],
    authors: [{ name: "PrepSkul Team" }],
    creator: "PrepSkul",
    publisher: "PrepSkul",
    icons: {
      icon: [
        { url: '/logo-blue.png?v=2', type: 'image/png', sizes: '32x32' },
        { url: '/logo-blue.png?v=2', type: 'image/png', sizes: '16x16' },
        { url: '/logo-blue.png?v=2', type: 'image/png', sizes: 'any' }
      ],
      shortcut: '/logo-blue.png?v=2',
      apple: '/logo-blue.png?v=2',
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
      ...(metadata.openGraph || {}),
      url: `https://prepskul.com/${locale}`,
      locale: locale === 'fr' ? 'fr_CM' : 'en_CM',
    },
    twitter: {
      ...(metadata.twitter || {}),
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
    <>
      <PerformanceOptimizer />
      <LocaleProvider locale={locale}>
        <Suspense fallback={null}>{children}</Suspense>
      </LocaleProvider>
      <Analytics />
      <SpeedInsights />
    </>
  )
}

