"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react"
import { TikTokIcon } from "./tiktok-icon"
import { useLocale } from "@/lib/locale-context"
import { getTranslations } from "@/lib/translations"

export function Footer() {
  const { locale } = useLocale()
  const t = getTranslations(locale)

  return (
    <>
      <footer className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            {/* Brand */}
            <div className="space-y-3">
              <div className="flex items-center ">
                <Image
                  src="/app_logo(white).png"
                  alt="PrepSkul"
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
                <span className="text-xl font-bold text-primary-foreground" style={{ fontFamily: 'var(--font-lato), Lato, sans-serif' }}>
                  PrepSkul
                </span>
              </div>
              <p className="text-primary-foreground/80 leading-relaxed text-sm">
                {t.footer.description}
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-3">
              <h4 className="font-bold text-lg">{t.footer.quickLinks}</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href={`/${locale}`}
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {t.nav.home}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${locale}/about`}
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {t.nav.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${locale}/programs`}
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {t.nav.programs}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${locale}/contact`}
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {t.nav.contact}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${locale}/tutors`}
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {t.tutors.hero.title}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/ambassadors"
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
                  >
                    Ambassadors
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Us */}
            <div className="space-y-3">
              <h4 className="font-bold text-lg">{t.footer.contactUs}</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-primary-foreground/80 text-sm">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span>+237 6 74 08 90 66</span>
                </li>
                <li className="flex items-center gap-2 text-primary-foreground/80 text-sm">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span>info@prepskul.com</span>
                </li>
                <li className="flex items-center gap-2 text-primary-foreground/80 text-sm">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>Buea, Cameroon</span>
                </li>
              </ul>
              <div className="flex gap-3 pt-2">
                <a
                  href="https://web.facebook.com/profile.php?id=61581614327200"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="https://www.instagram.com/prep.skul/?utm_source=ig_web_button_share_sheet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://www.tiktok.com/@prepskul?_t=ZM-90NYHgY4n60&_r=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  aria-label="TikTok"
                >
                  <TikTokIcon className="h-5 w-5" />
                </a>
                <a
                  href="https://www.linkedin.com/company/109176407/admin/dashboard/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Download App */}
            <div className="space-y-2">
              <h4 className="font-bold text-lg">{t.footer.downloadApp}</h4>
              <div className="space-y-1">
                <a
                  href="https://play.google.com/store/apps/details?id=com.prepskul.prepskul&pcampaignid=web_share"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    // Try to open app if installed, fallback to Play Store
                    const intentUrl = 'intent://details?id=com.prepskul.prepskul#Intent;scheme=market;action=android.intent.action.VIEW;end';
                    const userAgent = navigator.userAgent.toLowerCase();
                    const isAndroid = /android/.test(userAgent);
                    
                    if (isAndroid) {
                      // Try to open app first
                      const appLink = 'prepskul://';
                      const iframe = document.createElement('iframe');
                      iframe.style.display = 'none';
                      iframe.src = appLink;
                      document.body.appendChild(iframe);
                      
                      setTimeout(() => {
                        document.body.removeChild(iframe);
                        // If app didn't open, continue with Play Store link (default behavior)
                      }, 500);
                    }
                  }}
                  className="block w-full hover:opacity-80 transition-opacity"
                  aria-label="Download on Google Play"
                >
                  <Image
                    src="/google-play-badge.png"
                    alt="Get it on Google Play"
                    width={135}
                    height={40}
                    className="w-full max-w-[135px]"
                  />
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.prepskul.prepskul&pcampaignid=web_share"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    // Try to open app if installed, fallback to Play Store
                    const userAgent = navigator.userAgent.toLowerCase();
                    const isAndroid = /android/.test(userAgent);
                    
                    if (isAndroid) {
                      // Try to open app first
                      const appLink = 'prepskul://';
                      const iframe = document.createElement('iframe');
                      iframe.style.display = 'none';
                      iframe.src = appLink;
                      document.body.appendChild(iframe);
                      
                      setTimeout(() => {
                        document.body.removeChild(iframe);
                      }, 500);
                    }
                  }}
                  className="block w-full hover:opacity-80 transition-opacity"
                  aria-label="Download on App Store"
                >
                  <Image
                    src="/app-store-badge.png"
                    alt="Download on the App Store"
                    width={135}
                    height={40}
                    className="w-full max-w-[135px]"
                  />
                </a>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-primary-foreground/20 flex flex-col md:flex-row justify-between items-center gap-4 text-primary-foreground/80 text-sm">
            <p>&copy; {new Date().getFullYear()} PrepSkul. {t.footer.allRightsReserved}</p>
            <div className="flex gap-6">
              <Link href={`/${locale}/privacy-policy`} className="hover:text-primary-foreground hover:underline transition-colors">
                {t.footer.privacyPolicy}
              </Link>
              <Link href={`/${locale}/terms`} className="hover:text-primary-foreground hover:underline transition-colors">
                {t.footer.termsOfService}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
