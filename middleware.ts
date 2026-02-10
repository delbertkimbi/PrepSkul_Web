import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['en', 'fr']
const defaultLocale = 'en'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const hostname = request.headers.get('host') || ''
  
  // Detect if request is from admin subdomain
  const isAdminSubdomain = hostname.startsWith('admin.')
  // Detect if request is from academy subdomain
  const isAcademySubdomain = hostname.startsWith('academy.') || hostname.startsWith('academy.localhost')
  // Detect if request is from tichar subdomain
  const isTicharSubdomain = hostname.startsWith('tichar.') || hostname.startsWith('tichar.localhost')
  // Detect if request is from ambassadors subdomain
  const isAmbassadorsSubdomain = hostname.startsWith('ambassadors.') || hostname.startsWith('ambassadors.localhost')
  
  // PRIORITY 1: Handle admin subdomain requests
  if (isAdminSubdomain) {
    // If already on /admin path, let it through
    if (pathname.startsWith('/admin')) {
      return NextResponse.next()
    }
    // If on any other path (including /en, /fr), redirect to admin login
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
  
  // PRIORITY 1b: Handle academy subdomain requests
  if (isAcademySubdomain) {
    // If already on /academy path, let it through
    if (pathname.startsWith('/academy')) {
      return NextResponse.next()
    }
    // Rewrite all other paths to academy subtree
    return NextResponse.rewrite(new URL(`/academy${pathname}`, request.url))
  }
  
  // PRIORITY 1c: Handle tichar/ticha subdomain requests
  if (isTicharSubdomain) {
    // If already on /tichar or /ticha path, let it through
    if (pathname.startsWith('/tichar') || pathname.startsWith('/ticha')) {
      return NextResponse.next()
    }
    // Rewrite root and other paths to /ticha
    if (pathname === '/' || pathname === '') {
      return NextResponse.rewrite(new URL('/ticha', request.url))
    }
    // Rewrite all other paths to /ticha subtree
    return NextResponse.rewrite(new URL(`/ticha${pathname}`, request.url))
  }
  
  // PRIORITY 1d: Handle ambassadors subdomain requests
  if (isAmbassadorsSubdomain) {
    // If already on /ambassadors path, let it through
    if (pathname.startsWith('/ambassadors')) {
      return NextResponse.next()
    }
    // Rewrite root and other paths to /ambassadors
    if (pathname === '/' || pathname === '') {
      return NextResponse.rewrite(new URL('/ambassadors', request.url))
    }
    // Rewrite all other paths to /ambassadors subtree
    return NextResponse.rewrite(new URL(`/ambassadors${pathname}`, request.url))
  }
  
  // PRIORITY 2: Handle /admin routes on main domain (non-admin subdomain)
  if (pathname.startsWith('/admin')) {
    return NextResponse.next()
  }
  
  // PRIORITY 2b: Handle /tichar and /ticha routes (skip locale redirection)
  // Also handle locale-prefixed ticha routes (e.g., /fr/ticha/...)
  if (pathname.startsWith('/tichar') || pathname.startsWith('/ticha')) {
    return NextResponse.next()
  }
  
  // Check if path has locale prefix but is actually a ticha route
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/ticha`) || pathname.startsWith(`/${locale}/tichar`)) {
      // Remove locale prefix and redirect to clean path
      const cleanPath = pathname.replace(`/${locale}`, '')
      return NextResponse.redirect(new URL(cleanPath, request.url))
    }
  }
  
  // PRIORITY 2c: Handle /newyear route (skip locale redirection)
  if (pathname.startsWith('/newyear')) {
    return NextResponse.next()
  }
  
  // PRIORITY 2d: Handle /ambassadors route (skip locale redirection)
  if (pathname.startsWith('/ambassadors')) {
    return NextResponse.next()
  }
  
  // PRIORITY 2e: Handle /tutor/[id] (share links and OG metadata - no locale)
  // Served by app/tutor/[id]/page.tsx for rich previews and redirects
  if (pathname.startsWith('/tutor/')) {
    return NextResponse.next()
  }
  
  // PRIORITY 3: Handle locale redirection for main site only
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  if (pathnameIsMissingLocale) {
    const acceptLanguage = request.headers.get('accept-language')
    let detectedLocale = defaultLocale

    if (acceptLanguage) {
      const preferredLocale = acceptLanguage
        .split(',')
        .map((lang: string) => {
          const cleanLang = lang.split(';')[0].trim();
          const langCode = cleanLang.split('-')[0];
          return langCode;
        })
        .find((langCode: string) => locales.includes(langCode))

      if (preferredLocale) {
        detectedLocale = preferredLocale
      }
    }

    return NextResponse.redirect(
      new URL(`/${detectedLocale}${pathname}`, request.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  // Matcher ignoring `/_next/`, `/api/`, and static assets
  // Note: We handle /admin separately in the middleware logic above
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|png|gif|svg|ico|webp|pdf|css|js)$).*)']
}
