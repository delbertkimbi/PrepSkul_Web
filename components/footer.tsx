"use client"

import Image from "next/image"
import Link from "next/link"
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react"
import { TikTokIcon } from "@/components/tiktok-icon"
import { useLocale } from "@/lib/locale-context"
import { getSiteContent } from "@/lib/site-content"

export function Footer() {
  const { locale } = useLocale()
  const copy = getSiteContent(locale)

  const columns = [
    {
      title: copy.footer.learn,
      links: [
        { label: copy.footer.tutoring, href: `/${locale}#guidance` },
        { label: copy.footer.home, href: `/${locale}#guidance` },
        { label: copy.footer.online, href: `/${locale}#guidance` },
        { label: "SkulMate", href: `/${locale}#skulmate` },
      ],
    },
    {
      title: copy.footer.programs,
      links: [
        { label: "Summer Build Camp", href: "/sbc" },
        { label: "PEAP", href: `/${locale}/programs/peap` },
        { label: copy.footer.schoolPrograms, href: `/${locale}/schools` },
        { label: copy.nav.tutor, href: `/${locale}/tutors` },
      ],
    },
    {
      title: copy.footer.company,
      links: [
        { label: copy.nav.about, href: `/${locale}/about` },
        { label: copy.nav.impact, href: `/${locale}#impact` },
        { label: copy.footer.contact, href: `/${locale}/contact` },
        { label: "Ambassadors", href: "/ambassadors" },
      ],
    },
    {
      title: copy.footer.trust,
      links: [
        { label: locale === "fr" ? "Protection des apprenants" : "Safeguarding", href: `/${locale}/safeguarding` },
        { label: locale === "fr" ? "Code de conduite" : "Code of conduct", href: `/${locale}/code-of-conduct` },
        { label: locale === "fr" ? "Confidentialité" : "Privacy", href: `/${locale}/privacy-policy` },
        { label: locale === "fr" ? "Conditions" : "Terms", href: `/${locale}/terms` },
      ],
    },
  ]

  return (
    <footer className="border-t border-white/10 bg-[#0c0f16] text-white">
      <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-20 xl:px-20">
        <div className="grid gap-14 border-b border-white/15 pb-16 lg:grid-cols-[1.1fr_1.9fr]">
          <div>
            <Link href={`/${locale}`} className="inline-flex items-center gap-3">
              <Image src="/app_logo(white).png" alt="PrepSkul" width={40} height={40} className="h-10 w-10 object-contain" />
              <span className="text-2xl font-extrabold tracking-[-0.045em]">PrepSkul</span>
            </Link>
            <p className="font-editorial mt-7 max-w-md text-3xl font-semibold leading-tight tracking-[-0.025em] text-[#f0f3fa]">
              {locale === "fr" ? "Relier l’enseignement en classe à la compréhension individuelle." : "Bridging classroom teaching and individual understanding."}
            </p>
            <div className="mt-8 space-y-3 text-sm text-[#9ba6ba]">
              <a href="tel:+237674089066" className="flex items-center gap-3 hover:text-white"><Phone className="h-4 w-4 text-[#8db5ff]" />+237 6 74 08 90 66</a>
              <a href="mailto:info@prepskul.com" className="flex items-center gap-3 hover:text-white"><Mail className="h-4 w-4 text-[#8db5ff]" />info@prepskul.com</a>
              <span className="flex items-center gap-3"><MapPin className="h-4 w-4 text-[#8db5ff]" />Cameroon</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#71809b]">{column.title}</h3>
                <ul className="mt-5 space-y-3.5">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.label}`}>
                      <Link href={link.href} className="text-sm font-semibold text-[#b4bdce] transition-colors hover:text-white">{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-8 py-9 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {[
              { label: "Facebook", href: "https://web.facebook.com/profile.php?id=61581614327200", icon: Facebook },
              { label: "Instagram", href: "https://www.instagram.com/prep.skul/", icon: Instagram },
              { label: "TikTok", href: "https://www.tiktok.com/@prepskul", icon: TikTokIcon },
              { label: "LinkedIn", href: "https://www.linkedin.com/company/109176407/", icon: Linkedin },
            ].map(({ label, href, icon: Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="flex h-10 w-10 items-center justify-center border border-white/15 text-[#aeb8ca] transition-colors hover:border-[#8db5ff] hover:text-white">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
          <a href="https://play.google.com/store/apps/details?id=com.prepskul.prepskul" target="_blank" rel="noopener noreferrer" className="w-fit border border-white/15 p-2 transition-opacity hover:opacity-80">
            <Image src="/google-play-badge.png" alt="Get PrepSkul on Google Play" width={135} height={40} className="h-auto w-[128px]" />
          </a>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/15 pt-6 text-[11px] font-semibold text-[#667085] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} PrepSkul. {copy.footer.rights}</p>
          <p>{locale === "fr" ? "Au service des apprenants partout au Cameroun." : "Serving learners across Cameroon."}</p>
        </div>
      </div>
    </footer>
  )
}
