"use client"

import Link from "next/link"
import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react"
import { TikTokIcon } from "./tiktok-icon"
import { useLocale } from "@/lib/locale-context"
import { getSiteContent } from "@/lib/site-content"

export function Footer() {
  const { locale } = useLocale()
  const t = getTranslations(locale)

  return (
    <footer className="ps-footer ps-navy">
      <div aria-hidden className="ps-footer-tear" />
      <div className="ps-wrap grid gap-10 pb-10 pt-12 md:grid-cols-4">
        <div className="space-y-4">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/app_logo(white).png" alt="" width={32} height={32} fetchPriority="high" className="h-8 w-8 object-contain" />
            <span className="ps-wordmark text-xl text-white">PrepSkul</span>
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-white/65">{t.footer.description}</p>
        </div>

        <div>
          <p className="text-sm font-black text-white">{t.footer.quickLinks}</p>
          <ul className="mt-4 space-y-2.5 text-sm text-white/75">
            <li><Link href={`/${locale}/mate`} className="hover:text-white">SkulMate</Link></li>
            <li><Link href={`/${locale}/find`} className="hover:text-white">{t.nav.tutors}</Link></li>
            <li><Link href={`/${locale}/programs`} className="hover:text-white">{t.nav.programs}</Link></li>
            <li><Link href={`/${locale}/about`} className="hover:text-white">{t.nav.about}</Link></li>
            <li><Link href={`/${locale}/contact`} className="hover:text-white">{t.nav.contact}</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-black text-white">{t.footer.contactUs}</p>
          <ul className="mt-4 space-y-2.5 text-sm text-white/75">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" />+237 6 74 08 90 66</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" />info@prepskul.com</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4" />Buea, Cameroon</li>
          </ul>
          <div className="mt-5 flex gap-3">
            <a href="https://web.facebook.com/profile.php?id=61581614327200" target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook className="h-5 w-5 text-white/70 hover:text-white" /></a>
            <a href="https://www.instagram.com/prep.skul/?utm_source=ig_web_button_share_sheet" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram className="h-5 w-5 text-white/70 hover:text-white" /></a>
            <a href="https://www.tiktok.com/@prepskul?_t=ZM-90NYHgY4n60&_r=1" target="_blank" rel="noreferrer" aria-label="TikTok"><TikTokIcon className="h-5 w-5 text-white/70 hover:text-white" /></a>
            <a href="https://www.linkedin.com/company/prepskul" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin className="h-5 w-5 text-white/70 hover:text-white" /></a>
          </div>
        </div>

        <div>
          <p className="text-sm font-black text-white">{t.footer.downloadApp}</p>
          <div className="mt-4 space-y-2">
            <a href="https://play.google.com/store/apps/details?id=com.prepskul.prepskul&pcampaignid=web_share" target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/google-play-badge.png" alt="Get it on Google Play" width={140} height={42} className="w-[140px]" />
            </a>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/app-store-badge.png" alt="Coming soon to the App Store" width={140} height={42} className="w-[140px] opacity-65" />
            </div>
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
      <div className="border-t border-white/10">
        <div className="ps-wrap flex flex-col gap-3 py-6 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} PrepSkul. {t.footer.allRightsReserved}</p>
          <div className="flex flex-wrap gap-4">
            <Link href={`/${locale}/privacy-policy`}>{t.footer.privacyPolicy}</Link>
            <Link href={`/${locale}/terms`}>{t.footer.termsOfService}</Link>
            <Link href={`/${locale}/safeguarding`}>{t.footer.safeguardingPolicy}</Link>
            <Link href={`/${locale}/code-of-conduct`}>{t.footer.codeOfConduct}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
