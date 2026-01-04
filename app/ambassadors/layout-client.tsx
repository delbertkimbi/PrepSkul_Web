"use client"

import { LocaleProvider } from "@/lib/locale-context"
import type { Locale } from "@/lib/i18n"

export default function AmbassadorsLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  // Default to 'en' for the ambassadors page
  const locale: Locale = 'en'
  
  return (
    <LocaleProvider locale={locale}>
      {children}
    </LocaleProvider>
  )
}

