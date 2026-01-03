"use client"

import { LocaleProvider } from "@/lib/locale-context"
import type { Locale } from "@/lib/i18n"

export default function NewYearLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Default to 'en' for the newyear page
  const locale: Locale = 'en'
  
  return (
    <LocaleProvider locale={locale}>
      {children}
    </LocaleProvider>
  )
}

