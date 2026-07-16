"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Languages, Menu, X } from "lucide-react"
import { useSbcPath } from "@/lib/sbc/use-sbc-path"
import { useSbcLanguage } from "@/lib/sbc/i18n"
import { PaperButton } from "@/components/sbc/paper-ui"

export default function SbcHeader() {
  const [open, setOpen] = useState(false)
  const path = useSbcPath()
  const { locale, setLocale, t } = useSbcLanguage()
  const links = [
    { label: "About", href: path("/about") },
    { label: "Roadmap", href: path("/program") },
    { label: "Packages", href: path("/pricing") },
    { label: "What you’ll build", href: path("#build") },
    { label: "FAQ", href: path("/faq") },
  ]

  const languageToggle = (mobile = false) => (
    <div className={`flex items-center gap-1 rounded-xl border border-[#132d63]/15 bg-white p-1 ${mobile ? "mt-3 justify-center" : ""}`} aria-label={t("Language")}>
      <Languages className="ml-1 h-4 w-4 text-[#168c91]" aria-hidden />
      {(["en", "fr"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          aria-pressed={locale === code}
          className={`rounded-lg px-2 py-1 text-xs font-black transition ${locale === code ? "bg-[#132d63] text-white" : "text-[#132d63] hover:bg-[#dfeeff]"}`}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  )

  return (
    <header className="sticky top-0 z-50 border-b border-[#132d63]/10 bg-[#faf8f3]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 sm:px-6">
        <Link href={path()} aria-label={t("Summer Build Camp home")} className="relative flex h-14 w-32 items-center overflow-hidden sm:w-36">
          <Image src="/sbclogo.png" alt="Summer Build Camp" width={554} height={451} priority className="h-24 w-32 scale-[1.45] object-contain sm:w-36" />
        </Link>
        <nav className="hidden items-center gap-5 md:flex">
          {links.map((link) => <Link key={link.label} href={link.href} className="text-sm font-bold text-[#132d63] transition hover:-rotate-1 hover:text-[#2864d7]">{t(link.label)}</Link>)}
          {languageToggle()}
          <Link href={path("/register")}><PaperButton className="px-5 py-2.5 text-sm shadow-[0_5px_0_#12295f]">{t("Register now")}</PaperButton></Link>
        </nav>
        <button onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="sbc-menu" aria-label={t("Toggle navigation")} className="rounded-xl border border-[#132d63]/15 bg-white p-2 md:hidden">{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <nav id="sbc-menu" className="border-t border-[#132d63]/10 px-4 pb-5 pt-3 md:hidden">
          {links.map((link) => <Link onClick={() => setOpen(false)} key={link.label} href={link.href} className="block rounded-xl px-3 py-3 font-bold">{t(link.label)}</Link>)}
          {languageToggle(true)}
          <Link onClick={() => setOpen(false)} href={path("/register")} className="mt-3 block rounded-xl bg-[#1e3a8a] px-4 py-3 text-center font-black text-white">{t("Register now")}</Link>
        </nav>
      )}
    </header>
  )
}
