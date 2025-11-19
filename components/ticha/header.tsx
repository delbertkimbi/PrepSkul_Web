"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Zap, User } from "lucide-react"

export function TichaHeader() {
  return (
    <header
      className="sticky top-0 z-50 w-full border-none"
      style={{
        background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/ticha" className="flex items-center gap-2">
            <div
              className="p-1.5 rounded-lg"
              style={{
                background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
                boxShadow: "inset 1px 1px 2px rgba(209, 209, 209, 0.4), inset -1px -1px 2px rgba(255, 255, 255, 0.8)",
              }}
            >
              <Zap className="h-5 w-5 text-gray-900" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-gray-900" style={{ fontFamily: "'Inter', 'Poppins', sans-serif", letterSpacing: "-0.02em" }}>
              TichaAI
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="rounded-lg border-none text-sm sm:text-base"
              style={{
                background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
                boxShadow: "2px 2px 4px rgba(209, 209, 209, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.8)",
                color: "#2d3748",
              }}
              asChild
            >
              <Link href="/ticha/dashboard" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
