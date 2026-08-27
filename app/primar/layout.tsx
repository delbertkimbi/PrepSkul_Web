import type { Metadata } from "next"
import { Fredoka } from "next/font/google"
import "./primar.css"

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
})

export const metadata: Metadata = {
  title: "SkulMate — find where your child is",
  description:
    "A five-minute picture game that shows where your child is working, with no reading required. Built for learners in Cameroon.",
  robots: { index: false, follow: false },
}

export default function PrimarLayout({ children }: { children: React.ReactNode }) {
  return <div className={fredoka.variable}>{children}</div>
}
