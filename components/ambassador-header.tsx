"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function AmbassadorHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.svg" alt="PrepSkul logo" width={32} height={32} />
              <span className="text-base font-semibold text-slate-900">PrepSkul</span>
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-3">
            <Link
              href="https://prepskul.com"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Home
            </Link>
            <Link
              href="https://prepskul.com/about"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              About
            </Link>
            <Link
              href="https://prepskul.com/tutors"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Find a Tutor
            </Link>
            <Link
              href="/ambassadors/referral-track"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Referral Track
            </Link>
            <Link
              href="/ambassadors/dashboard"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              My Dashboard
            </Link>
            <Button asChild size="sm" className="ml-2">
              <Link href="https://prepskul.com">Back to Main Site</Link>
            </Button>
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-200 pb-3">
            <nav className="flex flex-col gap-1 pt-2">
              <Link
                href="https://prepskul.com"
                className="px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="https://prepskul.com/about"
                className="px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
                onClick={() => setMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="https://prepskul.com/tutors"
                className="px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
                onClick={() => setMenuOpen(false)}
              >
                Find a Tutor
              </Link>
              <Link
                href="/ambassadors/referral-track"
                className="px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
                onClick={() => setMenuOpen(false)}
              >
                Referral Track
              </Link>
              <Link
                href="/ambassadors/dashboard"
                className="px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
                onClick={() => setMenuOpen(false)}
              >
                My Dashboard
              </Link>
              <Button
                asChild
                size="sm"
                className="mt-2 w-full justify-center"
              >
                <Link href="https://prepskul.com" onClick={() => setMenuOpen(false)}>
                  Back to Main Site
                </Link>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
