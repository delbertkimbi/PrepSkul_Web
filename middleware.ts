import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['en', 'fr']
const defaultLocale = 'en'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const hostname = request.headers.get('host') || ''
  
  // Detect if request is from admin subdomain
  const isAdminSubdomain = hostname.startsWith('admin.')
  
  // If accessing admin subdomain but not on /admin path, redirect to /admin
  if (isAdminSubdomain && !pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }
  
  // If accessing /admin from main domain, allow it (or you can block it)
  // To block: if (!isAdminSubdomain && pathname.startsWith('/admin')) { return NextResponse.redirect('/') }
  
  // Skip locale handling for admin routes
  if (pathname.startsWith('/admin')) {
    return NextResponse.next()
  }
  
  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    // Get locale from Accept-Language header
    const acceptLanguage = request.headers.get('accept-language')
    let detectedLocale = defaultLocale

    if (acceptLanguage) {
      const preferredLocale = acceptLanguage
        .split(',')
        .map(lang => lang.split(';')[0].trim())
        .find(lang => locales.includes(lang.split('-')[0]))

      if (preferredLocale) {
        detectedLocale = preferredLocale.split('-')[0]
      }
    }

    // Redirect to the pathname with the detected locale
    return NextResponse.redirect(
      new URL(`/${detectedLocale}${pathname}`, request.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  // Matcher ignoring `/_next/`, `/api/`, `/admin`, and static assets
  matcher: ['/((?!api|admin|_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|png|gif|svg|ico|webp|pdf|css|js)$).*)']
}
