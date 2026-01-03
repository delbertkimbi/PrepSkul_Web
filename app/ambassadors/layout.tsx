"use client"

import { LocaleProvider } from "@/lib/locale-context"
import type { Locale } from "@/lib/i18n"
import { useEffect } from "react"

export default function AmbassadorsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Default to 'en' for the ambassadors page
  const locale: Locale = 'en'
  
  // Update document metadata and favicon for ambassadors subdomain
  useEffect(() => {
    document.title = "Become a PrepSkul Ambassador | Join Our Community"
    
    // Update favicon - use the ambassador group photo
    let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
    if (!favicon) {
      favicon = document.createElement('link')
      favicon.rel = 'icon'
      document.head.appendChild(favicon)
    }
    // Note: You'll need to save the ambassador group photo as /public/ambassador-favicon.png
    favicon.href = '/ambassador-favicon.png'
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]')
    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.setAttribute('name', 'description')
      document.head.appendChild(metaDescription)
    }
    metaDescription.setAttribute('content', 'Join the PrepSkul Ambassador program and help expand access to learning opportunities. Represent PrepSkul in schools, communities, and online. Apply now!')
    
    // Update Open Graph tags
    let ogTitle = document.querySelector('meta[property="og:title"]')
    if (!ogTitle) {
      ogTitle = document.createElement('meta')
      ogTitle.setAttribute('property', 'og:title')
      document.head.appendChild(ogTitle)
    }
    ogTitle.setAttribute('content', 'Become a PrepSkul Ambassador')
    
    let ogDescription = document.querySelector('meta[property="og:description"]')
    if (!ogDescription) {
      ogDescription = document.createElement('meta')
      ogDescription.setAttribute('property', 'og:description')
      document.head.appendChild(ogDescription)
    }
    ogDescription.setAttribute('content', 'Join the PrepSkul Ambassador program and help expand access to learning opportunities. Represent PrepSkul in schools, communities, and online.')
  }, [])
  
  return (
    <LocaleProvider locale={locale}>
      {children}
    </LocaleProvider>
  )
}

