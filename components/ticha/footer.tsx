"use client"

import Link from "next/link"
import { Zap, Phone, Mail } from "lucide-react"

export function TichaFooter() {
  return (
    <footer
      className="border-none"
      style={{
        background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
        boxShadow: "0 -1px 3px rgba(0, 0, 0, 0.04)",
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 mb-8 sm:mb-10">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div
                className="p-1.5 rounded-lg"
                style={{
                  background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
                  boxShadow: "inset 1px 1px 2px rgba(209, 209, 209, 0.4), inset -1px -1px 2px rgba(255, 255, 255, 0.8)",
                }}
              >
                <Zap className="h-5 w-5 text-gray-900" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: "'Inter', 'Poppins', sans-serif", letterSpacing: "-0.02em" }}>
                TichaAI
              </span>
            </div>
            <p className="leading-relaxed text-xs sm:text-sm text-gray-700" style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}>
              Transform your notes into stunning presentations with the power of AI.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-base sm:text-lg text-gray-900" style={{ fontFamily: "'Inter', 'Poppins', sans-serif", fontWeight: 700 }}>
              QUICK LINKS
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/ticha" className="transition-colors text-xs sm:text-sm text-gray-600 hover:text-gray-900" style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}>
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/ticha#about"
                  className="transition-colors text-xs sm:text-sm text-gray-600 hover:text-gray-900"
                  style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/ticha/dashboard"
                  className="transition-colors text-xs sm:text-sm text-gray-600 hover:text-gray-900"
                  style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div className="space-y-3">
            <h4 className="font-bold text-base sm:text-lg text-gray-900" style={{ fontFamily: "'Inter', 'Poppins', sans-serif", fontWeight: 700 }}>
              CONTACT US
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-600" style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}>
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+237 674 208 573</span>
              </li>
              <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-600" style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}>
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>info@prepskul.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="pt-6 text-center text-xs sm:text-sm text-gray-600"
          style={{
            borderTop: "1px solid rgba(0, 0, 0, 0.1)",
            fontFamily: "'Inter', 'Poppins', sans-serif",
          }}
        >
          <p>&copy; {new Date().getFullYear()} TichaAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
