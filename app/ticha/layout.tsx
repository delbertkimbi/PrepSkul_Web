import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "TichaAI - Turn Docs into Presentations | AI-Powered Presentation Tool",
  description: "Transform your handwritten notes, PDFs, or text documents into structured, beautiful PowerPoint presentations instantly with TichaAI's advanced AI technology.",
  keywords: ["AI presentation", "document to presentation", "PPT generator", "AI PowerPoint", "presentation tool"],
}

export default function TichaLayout({
  children,
}: {
  children: ReactNode
}) {
  return <>{children}</>
}

