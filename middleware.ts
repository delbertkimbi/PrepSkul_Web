import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['en', 'fr']
const defaultLocale = 'en'

export function middleware(request: NextRequest) {
  // Check if there is any supported locale in the pathname
  const pathname = request.nextUrl.pathname
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
  // Matcher ignoring `/_next/`, `/api/`, and static assets
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|png|gif|svg|ico|webp|pdf|css|js)$).*)']
}
