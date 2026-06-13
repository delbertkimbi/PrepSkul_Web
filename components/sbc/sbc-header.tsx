"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { SBC_LOGO } from "@/lib/sbc/content"
import { useSbcPath } from "@/lib/sbc/use-sbc-path"

export default function SbcHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const sbcPath = useSbcPath()

  const navLinks = [
    { href: sbcPath("#about"), label: "About" },
    { href: sbcPath("/program"), label: "Program" },
    { href: sbcPath("/partner"), label: "Partner" },
    { href: sbcPath("#pricing"), label: "Pricing" },
    { href: sbcPath("/faq"), label: "FAQ" },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 min-w-0">
        <div className="flex items-center justify-between gap-3 py-3">
          <Link href={sbcPath()} className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Image
              src={SBC_LOGO}
              alt="Summer Build Camp"
              width={48}
              height={48}
              className="h-10 w-auto sm:h-11 object-contain shrink-0"
              priority
            />
            <span className="hidden sm:block text-xs sm:text-sm font-bold tracking-wide text-[#1B2C4F] truncate">
              Summer Build Camp
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-5 lg:gap-6 shrink-0">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-[#FF8A00] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Button
              asChild
              size="sm"
              className="bg-[#FF8A00] hover:bg-[#e67a00] text-white font-semibold shadow-md shadow-orange-500/15"
            >
              <Link href={sbcPath("/register")}>Register Now</Link>
            </Button>
          </nav>

          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-[#1B2C4F] hover:bg-slate-100 shrink-0"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-slate-100 pb-4 pt-2">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-2 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Button
                asChild
                size="sm"
                className="mt-2 w-full bg-[#FF8A00] hover:bg-[#e67a00] text-white font-semibold"
              >
                <Link href={sbcPath("/register")} onClick={() => setMenuOpen(false)}>
                  Register Now
                </Link>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
