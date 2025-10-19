"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react"
import { TikTokIcon } from "./tiktok-icon"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useLocale } from "@/lib/locale-context"
import { getTranslations } from "@/lib/translations"

export function Footer() {
  const [showComingSoon, setShowComingSoon] = useState(false)
  const { locale } = useLocale()
  const t = getTranslations(locale)

  const LAUNCH_DATE = new Date("2025-11-12T00:00:00")

  const calculateTimeLeft = () => {
    const now = new Date().getTime()
    const difference = LAUNCH_DATE.getTime() - now

    // Stop at zero when countdown reaches launch date
    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      }
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    }
  }

  const [countdown, setCountdown] = useState(calculateTimeLeft())

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleAppClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowComingSoon(true)
  }

  return (
    <>
      <footer className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            {/* Brand */}
            <div className="space-y-3">
              <h3 className="text-2xl font-bold">PrepSkul</h3>
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
                <button
                  onClick={handleAppClick}
                  className="block w-full hover:opacity-80 transition-opacity"
                  aria-label="Download on Google Play - Coming Soon"
                >
                  <Image
                    src="/google-play-badge.png"
                    alt="Get it on Google Play"
                    width={135}
                    height={40}
                    className="w-full max-w-[135px]"
                  />
                </button>
                <button
                  onClick={handleAppClick}
                  className="block w-full hover:opacity-80 transition-opacity"
                  aria-label="Download on App Store - Coming Soon"
                >
                  <Image
                    src="/app-store-badge.png"
                    alt="Download on the App Store"
                    width={135}
                    height={40}
                    className="w-full max-w-[135px]"
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-primary-foreground/20 text-center text-primary-foreground/80 text-sm">
            <p>&copy; {new Date().getFullYear()} PrepSkul. {t.footer.allRightsReserved}</p>
          </div>
        </div>
      </footer>

      <Dialog open={showComingSoon} onOpenChange={setShowComingSoon}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">{t.footer.comingSoon}</DialogTitle>
            <DialogDescription className="text-center pt-4">
              {t.footer.comingSoonDescription}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{countdown.days}</div>
                <div className="text-xs text-muted-foreground">{t.footer.days}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{countdown.hours}</div>
                <div className="text-xs text-muted-foreground">{t.footer.hours}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{countdown.minutes}</div>
                <div className="text-xs text-muted-foreground">{t.footer.minutes}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{countdown.seconds}</div>
                <div className="text-xs text-muted-foreground">{t.footer.seconds}</div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground pt-2 text-center">
              {t.footer.getReady}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
