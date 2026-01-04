"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"

// Main PrepSkul website base URL
const MAIN_SITE_URL = "https://prepskul.com"

export function AmbassadorHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <a href={MAIN_SITE_URL} className="flex items-center gap-1">
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
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a 
              href={`${MAIN_SITE_URL}/en`} 
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Home
            </a>
            <a
              href={`${MAIN_SITE_URL}/en/about`}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              About
            </a>
            <a
              href={`${MAIN_SITE_URL}/en/programs`}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Programs
            </a>
            <a
              href={`${MAIN_SITE_URL}/en/contact`}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Contact
            </a>
            <Link
              href="/ambassadors"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Ambassadors
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <a href={`${MAIN_SITE_URL}/en/contact`}>Get Started</a>
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
              <a 
                href={`${MAIN_SITE_URL}/en`} 
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                Home
              </a>
              <a
                href={`${MAIN_SITE_URL}/en/about`}
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                About
              </a>
              <a
                href={`${MAIN_SITE_URL}/en/programs`}
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                Programs
              </a>
              <a
                href={`${MAIN_SITE_URL}/en/contact`}
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                Contact
              </a>
              <Link
                href="/ambassadors"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Ambassadors
              </Link>
              <div className="flex items-center gap-2 pt-2">
                <Button asChild className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                  <a href={`${MAIN_SITE_URL}/en/contact`}>Get Started</a>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

