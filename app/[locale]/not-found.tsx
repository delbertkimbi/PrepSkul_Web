"use client"

import { usePathname } from "next/navigation"
import { PaperNotFound } from "@/components/marketing/paper-not-found"

export default function LocaleNotFound() {
  const pathname = usePathname() || "/en"
  const locale = pathname.split("/").filter(Boolean)[0] === "fr" ? "fr" : "en"
  return <PaperNotFound locale={locale} />
}
