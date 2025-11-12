import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Home, Search, BookOpen } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: '404 - Page Not Found | PrepSkul',
  description: 'The page you are looking for could not be found. Return to PrepSkul homepage or browse our tutors.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/en" className="flex items-center gap-1">
              <Image
                src="/app_logo(blue).png"
                alt="PrepSkul Logo"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
                priority
              />
              <div className="text-2xl font-bold text-primary">PrepSkul</div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* 404 Illustration */}
          <div className="relative">
            <div className="text-9xl sm:text-[12rem] font-bold text-primary/10 select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-primary/5 rounded-full p-8">
                <Search className="w-24 h-24 text-primary/30" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
              Page Not Found
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/en" className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Go to Homepage
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">
              <Link href="/en/tutors" className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Find Tutors
              </Link>
            </Button>
          </div>

          {/* Quick Links */}
          <div className="pt-8 border-t border-border/40">
            <p className="text-sm text-muted-foreground mb-4">Popular Pages:</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link
                href="/en"
                className="text-primary hover:text-primary/80 hover:underline transition-colors"
              >
                Home
              </Link>
              <Link
                href="/en/about"
                className="text-primary hover:text-primary/80 hover:underline transition-colors"
              >
                About Us
              </Link>
              <Link
                href="/en/programs"
                className="text-primary hover:text-primary/80 hover:underline transition-colors"
              >
                Programs
              </Link>
              <Link
                href="/en/tutors"
                className="text-primary hover:text-primary/80 hover:underline transition-colors"
              >
                Find Tutors
              </Link>
              <Link
                href="/en/contact"
                className="text-primary hover:text-primary/80 hover:underline transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-primary-foreground/80">
            <p>&copy; {new Date().getFullYear()} PrepSkul. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

