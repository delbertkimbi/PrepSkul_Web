"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Globe, Check } from "lucide-react"
import { locales, localeNames, localeFlags, type Locale } from "@/lib/i18n"

interface LanguageSwitcherProps {
  currentLocale: Locale
}

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const switchLanguage = (locale: Locale) => {
    // Remove current locale from pathname and add new locale
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '') || '/'
    const newPath = `/${locale}${pathWithoutLocale}`
    router.push(newPath)
    setIsOpen(false)
  }

  // Get abbreviated locale code (EN, FR)
  const getLocaleCode = (locale: Locale) => {
    return locale.toUpperCase()
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground relative min-w-[3rem]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Globe className="h-4 w-4 flex-shrink-0" />
          <div className="relative w-full flex items-center justify-center">
            {/* Default: Show abbreviated code (EN/FR) */}
            <span className={`transition-all duration-200 ${isHovered ? 'opacity-0 scale-95 absolute' : 'opacity-100 scale-100 relative'}`}>
              {getLocaleCode(currentLocale)}
            </span>
            {/* On hover: Show flag and full name (desktop only) */}
            <span className={`hidden sm:flex items-center gap-1.5 transition-all duration-200 ${isHovered ? 'opacity-100 scale-100 relative' : 'opacity-0 scale-95 absolute'}`}>
              <span className="text-base">{localeFlags[currentLocale]}</span>
              <span>{localeNames[currentLocale]}</span>
            </span>
            {/* Mobile: Always show abbreviated */}
            <span className="sm:hidden">
              {getLocaleCode(currentLocale)}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => switchLanguage(locale)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{localeFlags[locale]}</span>
              <span className="font-medium">{localeNames[locale]}</span>
            </div>
            {currentLocale === locale && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
