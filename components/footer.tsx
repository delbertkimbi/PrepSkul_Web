"use client"

import Link from "next/link"
import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react"
import { TikTokIcon } from "./tiktok-icon"
import { useLocale } from "@/lib/locale-context"
import { getTranslations } from "@/lib/translations"
import { PaperButton, PaperSheet, TornDivider } from "@/components/marketing/paper"
import { getStartedUrl } from "@/lib/get-started-url"

export function Footer() {
  const { locale } = useLocale()
  const t = getTranslations(locale)
  const fr = locale.startsWith("fr")

  return (
    <footer className="ps-footer">
      <TornDivider />
      <div className="ps-wrap grid gap-6 pb-10 pt-8 md:grid-cols-4">
        <div className="space-y-4">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/app_logo(blue).png" alt="" width={32} height={32} className="h-8 w-8 object-contain" />
            <span className="ps-wordmark text-xl text-[#1B2C4F]">PrepSkul</span>
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-[#5C6B84]">{t.footer.description}</p>
          <a href={getStartedUrl()}>
            <PaperButton className="px-5 py-2.5 text-sm shadow-[0_5px_0_#0f1a2e]">{fr ? "Commencer" : "Get started"}</PaperButton>
          </a>
        </div>

        <PaperSheet className="p-5" tone="cream">
          <p className="text-sm font-black uppercase text-[#1B2C4F]">{t.footer.quickLinks}</p>
          <ul className="mt-4 space-y-2.5 text-sm font-bold text-[#5C6B84]">
            <li><Link href={`/${locale}/mate`} className="hover:text-[#0EA5E9]">SkulMate</Link></li>
            <li><Link href={`/${locale}/find`} className="hover:text-[#0EA5E9]">{t.nav.tutors}</Link></li>
            <li><Link href={`/${locale}/programs`} className="hover:text-[#0EA5E9]">{t.nav.programs}</Link></li>
            <li><Link href={`/${locale}/about`} className="hover:text-[#0EA5E9]">{t.nav.about}</Link></li>
            <li><Link href={`/${locale}/contact`} className="hover:text-[#0EA5E9]">{t.nav.contact}</Link></li>
          </ul>
        </PaperSheet>

        <PaperSheet className="p-5" tone="blue">
          <p className="text-sm font-black uppercase text-[#1B2C4F]">{t.footer.contactUs}</p>
          <ul className="mt-4 space-y-2.5 text-sm text-[#5C6B84]">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" />+237 6 74 08 90 66</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" />info@prepskul.com</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4" />Buea, Cameroon</li>
          </ul>
          <div className="mt-5 flex gap-3">
            <a href="https://web.facebook.com/profile.php?id=61581614327200" target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook className="h-5 w-5 text-[#1B2C4F]/70 hover:text-[#0EA5E9]" /></a>
            <a href="https://www.instagram.com/prep.skul/?utm_source=ig_web_button_share_sheet" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram className="h-5 w-5 text-[#1B2C4F]/70 hover:text-[#0EA5E9]" /></a>
            <a href="https://www.tiktok.com/@prepskul?_t=ZM-90NYHgY4n60&_r=1" target="_blank" rel="noreferrer" aria-label="TikTok"><TikTokIcon className="h-5 w-5 text-[#1B2C4F]/70 hover:text-[#0EA5E9]" /></a>
            <a href="https://www.linkedin.com/company/109176407/admin/dashboard/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin className="h-5 w-5 text-[#1B2C4F]/70 hover:text-[#0EA5E9]" /></a>
          </div>
        </PaperSheet>

        <PaperSheet className="p-5" tone="yellow">
          <p className="text-sm font-black uppercase text-[#1B2C4F]">{t.footer.downloadApp}</p>
          <div className="mt-4 space-y-2">
            <a href="https://play.google.com/store/apps/details?id=com.prepskul.prepskul&pcampaignid=web_share" target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/google-play-badge.png" alt="Get it on Google Play" width={140} height={42} className="w-[140px]" />
            </a>
            <a href="https://play.google.com/store/apps/details?id=com.prepskul.prepskul&pcampaignid=web_share" target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/app-store-badge.png" alt="Download on the App Store" width={140} height={42} className="w-[140px]" />
            </a>
          </div>
        </PaperSheet>
      </div>
      <div className="border-t border-[#1B2C4F]/10">
        <div className="ps-wrap flex flex-col gap-3 py-6 text-xs font-bold text-[#5C6B84] md:flex-row md:items-center md:justify-between">
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
