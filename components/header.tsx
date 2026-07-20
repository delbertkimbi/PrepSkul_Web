"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { ArrowRight, Menu, X } from "lucide-react"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLocale } from "@/lib/locale-context"
import { getSiteContent } from "@/lib/site-content"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { locale } = useLocale()
  const copy = getSiteContent(locale)

  const navItems = [
    { label: copy.nav.learn, href: `/${locale}#guidance` },
    { label: copy.nav.programs, href: `/${locale}#programs` },
    { label: copy.nav.skulmate, href: `/${locale}#skulmate` },
    { label: copy.nav.schools, href: `/${locale}/schools` },
  ]

  const closeMenu = () => setMobileMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-[#182544]/10 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-[1440px] items-center px-5 sm:px-8 lg:px-12 xl:px-20">
        <Link href={`/${locale}`} className="flex shrink-0 items-center gap-2.5" onClick={closeMenu}>
          <Image src="/app_logo(blue).png" alt="PrepSkul" width={34} height={34} className="h-7 w-7 object-contain" priority />
          <span className="text-[1.2rem] font-extrabold tracking-[-0.055em] text-[#14213d]">PrepSkul</span>
        </Link>

        <nav className="ml-14 hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-[13px] font-bold text-[#34405a] transition-colors hover:text-[#2859c5]">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-1 lg:flex">
          <LanguageSwitcher currentLocale={locale} />
          <Link href={`/${locale}/tutors`} className="px-4 py-3 text-[13px] font-bold text-[#34405a] transition-colors hover:text-[#2859c5]">
            {copy.nav.tutor}
          </Link>
          <Link href="https://app.prepskul.com" className="ml-2 inline-flex h-10 items-center gap-2 rounded-md bg-[#182544] px-5 text-[13px] font-extrabold text-white transition-colors hover:bg-[#2859c5]">
            {copy.nav.cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <button
          type="button"
          className="ml-auto inline-flex h-10 w-10 items-center justify-center border border-[#14213d]/20 text-[#14213d] lg:hidden"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div id="mobile-navigation" className="border-t border-[#17213a]/10 bg-white px-4 py-5 lg:hidden">
          <nav className="mx-auto flex max-w-[1440px] flex-col" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={closeMenu} className="border-b border-[#17213a]/10 py-4 text-base font-bold text-[#17213a]">
                {item.label}
              </Link>
            ))}
            <Link href={`/${locale}/tutors`} onClick={closeMenu} className="border-b border-[#17213a]/10 py-4 text-base font-bold text-[#17213a]">
              {copy.nav.tutor}
            </Link>
            <div className="mt-5 flex items-center gap-3">
              <LanguageSwitcher currentLocale={locale} />
              <Link href="https://app.prepskul.com" onClick={closeMenu} className="ml-auto inline-flex h-11 items-center gap-2 rounded-md bg-[#17213a] px-5 text-sm font-extrabold text-white">
                {copy.nav.cta}<ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
