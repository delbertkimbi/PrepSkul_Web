"use client"

import type { ReactNode } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PaperSheet } from "@/components/marketing/paper"

export function PaperDoc({
  title,
  lead,
  updated,
  children,
}: {
  title: string
  lead?: string
  updated?: string
  children: ReactNode
}) {
  return (
    <div className="ps-site min-h-screen">
      <Header />
      <main className="ps-wrap py-16 lg:py-20">
        <h1 className="ps-h1 max-w-3xl">{title}</h1>
        {lead ? <p className="ps-lead mt-4 max-w-2xl">{lead}</p> : null}
        {updated ? <p className="mt-3 text-sm font-bold text-[#5C6B84]">{updated}</p> : null}
        <PaperSheet className="prose-ps mt-10 p-6 sm:p-10" tone="cream">
          {children}
        </PaperSheet>
      </main>
      <Footer />
    </div>
  )
}
