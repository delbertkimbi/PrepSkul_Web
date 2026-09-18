"use client"

import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { useLocale } from "@/lib/locale-context"
import { getTranslations } from "@/lib/translations"
import { locales, type Locale } from "@/lib/i18n"
import { usePathname, useRouter } from "next/navigation"
import { PaperButton } from "@/components/marketing/paper"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { locale } = useLocale()
  const t = getTranslations(locale)
  const router = useRouter()
  const pathname = usePathname()

  const links = [
    { href: `/${locale}/mate`, label: "SkulMate" },
    { href: `/${locale}/find`, label: t.nav.tutors },
    { href: `/${locale}/programs`, label: t.nav.programs },
    { href: `/${locale}/about`, label: t.nav.about },
    { href: `/${locale}#faq`, label: "FAQ" },
  ]

  function switchLocale(next: Locale) {
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, "") || "/"
    router.push(`/${next}${pathWithoutLocale}`)
  }

  const languageToggle = (mobile = false) => (
    <div
      className={`flex items-center gap-1 rounded-xl border border-[#1B2C4F]/15 bg-white p-1 ${mobile ? "mt-3 justify-center" : ""}`}
      aria-label="Language"
    >
      {locales.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => switchLocale(code)}
          aria-pressed={locale === code}
          className={`rounded-lg px-2 py-1 text-xs font-black transition ${
            locale === code ? "bg-[#1B2C4F] text-white" : "text-[#1B2C4F] hover:bg-[#dfeeff]"
          }`}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  )

  return (
    <header className="ps-header">
      <div className="ps-wrap flex h-[4.25rem] items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/app_logo(blue).png"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
            suppressHydrationWarning
          />
          <span className="ps-wordmark text-[1.45rem] text-[#1B2C4F]">PrepSkul</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-bold text-[#1B2C4F]/75 transition hover:-rotate-1 hover:text-[#0EA5E9]"
            >
              {item.label}
            </Link>
          ))}
          {languageToggle()}
          <Link href={`/${locale}/onboard`}>
            <PaperButton className="px-5 py-2.5 text-sm shadow-[0_5px_0_#0f1a2e]">{t.nav.getStarted}</PaperButton>
          </Link>
        </nav>

        <button className="rounded-xl border border-[#1B2C4F]/15 bg-white p-2 md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileMenuOpen ? (
        <nav className="border-t border-[#1B2C4F]/10 md:hidden">
          <div className="ps-wrap flex flex-col gap-1 py-4">
            {links.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-xl px-3 py-3 font-bold" onClick={() => setMobileMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
            {languageToggle(true)}
            <Link href={`/${locale}/onboard`} className="mt-3" onClick={() => setMobileMenuOpen(false)}>
              <PaperButton className="w-full">{t.nav.getStarted}</PaperButton>
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  )
}
