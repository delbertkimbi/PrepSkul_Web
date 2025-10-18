"use client"

import { createContext, useContext, ReactNode } from 'react'
import { type Locale } from './i18n'

interface LocaleContextType {
  locale: Locale
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function LocaleProvider({ 
  children, 
  locale 
}: { 
  children: ReactNode
  locale: Locale 
}) {
  return (
    <LocaleContext.Provider value={{ locale }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}

