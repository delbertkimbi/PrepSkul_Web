"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function AmbassadorHeader() {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="PrepSkul logo" width={32} height={32} />
            <span className="text-base font-semibold text-slate-900">PrepSkul</span>
          </Link>
        </div>
        <nav className="flex items-center gap-3">
          <Link href="https://prepskul.com" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Home
          </Link>
          <Link href="https://prepskul.com/about" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            About
          </Link>
          <Link href="https://prepskul.com/tutors" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Find a Tutor
          </Link>
          <Button asChild size="sm" className="ml-2">
            <Link href="https://prepskul.com">Back to Main Site</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
