import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Register for Summer Build Camp 2026",
  description: "Register learners aged 9 to 18 for Summer Build Camp in Buea or online, 4–8 August 2026.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/register" },
}

export default function Layout({ children }: { children: React.ReactNode }) { return children }
