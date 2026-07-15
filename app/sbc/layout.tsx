import type { Metadata } from "next"
import { Fredoka } from "next/font/google"
import "./sbc.css"

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Summer Build Camp | AI + Entrepreneurship for Young Innovators",
  description:
    "Join Summer Build Camp, a one-week AI and innovation experience for ages 9 to 18 in Buea and online, 4–8 August 2026.",
  keywords: [
    "Summer Build Camp",
    "SBC Cameroon",
    "youth coding Cameroon",
    "AI for kids Africa",
    "entrepreneurship camp Buea",
    "PrepSkul SBC",
    "DelTech Hub",
    "young innovators Africa",
  ],
  openGraph: {
    type: "website",
    url: "https://sbc.prepskul.com",
    siteName: "Summer Build Camp",
    title: "Summer Build Camp | Create. Build. Pitch. Launch.",
    description:
      "One week of AI, innovation and entrepreneurship for young learners aged 9 to 18. Buea and online, 4–8 August 2026.",
    images: [
      {
        url: "https://sbc.prepskul.com/sbc-og.png",
        width: 1200,
        height: 630,
        alt: "Summer Build Camp by PrepSkul and DelTech Hub",
      },
    ],
    locale: "en_CM",
  },
  twitter: {
    card: "summary_large_image",
    title: "Summer Build Camp | PrepSkul × DelTech Hub",
    description: "AI + Innovation for young problem-solvers. Ages 9 to 18. Buea and online.",
    images: ["https://sbc.prepskul.com/sbc-og.png"],
  },
  metadataBase: new URL("https://sbc.prepskul.com"),
  alternates: {
    canonical: "https://sbc.prepskul.com",
  },
}

export default function SbcLayout({ children }: { children: React.ReactNode }) {
  return <div className={fredoka.variable}>{children}</div>
}
