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
  const router = useRouter()
  const pathname = usePathname()

  const switchLanguage = (locale: Locale) => {
    // Remove current locale from pathname and add new locale
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '') || '/'
    const newPath = `/${locale}${pathWithoutLocale}`
    router.push(newPath)
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {localeFlags[currentLocale]} {localeNames[currentLocale]}
          </span>
          <span className="sm:hidden">
            {localeFlags[currentLocale]}
          </span>
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
