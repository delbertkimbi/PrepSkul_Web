import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Geist } from "next/font/google"

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

export const metadata: Metadata = {
  title: "Tichar AI - Turn Docs into Presentations | AI-Powered Presentation Tool",
  description: "Transform your handwritten notes, PDFs, or text documents into structured, beautiful PowerPoint presentations instantly with Tichar AI's advanced AI technology.",
  keywords: ["AI presentation", "document to presentation", "PPT generator", "AI PowerPoint", "presentation tool"],
}

export default function TichaLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className={geist.className} style={{ fontFamily: geist.style.fontFamily }}>
      {children}
    </div>
  )
}

