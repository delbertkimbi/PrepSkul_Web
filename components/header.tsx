"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { useLocale } from "@/lib/locale-context"
import { getTranslations } from "@/lib/translations"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { locale } = useLocale()
  const t = getTranslations(locale)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-1">
            <Image
              src="/app_logo(blue).png"
              alt="PrepSkul"
              width={33}
              height={33}
              className="h-8 w-8 object-contain"
              priority
            />
            <span className="text-2xl font-black" style={{ fontFamily: 'var(--font-lato), Lato, sans-serif' }}>
              PrepSkul
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href={`/${locale}`} className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              {t.nav.home}
            </Link>
            <Link
              href={`/${locale}/about`}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              {t.nav.about}
            </Link>
            <Link
              href={`/${locale}/programs`}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              {t.nav.programs}
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              {t.nav.contact}
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher currentLocale={locale} />
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href={`/${locale}/contact`}>{t.nav.getStarted}</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/40">
            <nav className="flex flex-col gap-4">
              <Link href={`/${locale}`} className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                {t.nav.home}
              </Link>
              <Link
                href={`/${locale}/about`}
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                {t.nav.about}
              </Link>
              <Link
                href={`/${locale}/programs`}
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                {t.nav.programs}
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                {t.nav.contact}
              </Link>
              <div className="flex items-center gap-2 pt-2">
                <LanguageSwitcher currentLocale={locale} />
                <Button asChild className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href={`/${locale}/contact`}>{t.nav.getStarted}</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
