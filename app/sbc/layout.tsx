import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Summer Build Camp | AI + Entrepreneurship for Young Innovators",
  description:
    "Join SBC, a 6-week program by PrepSkul & DelTech Hub. Ages 10 to 17 learn to build products with AI, create brands, and pitch on Demo Day. Buea, Cameroon.",
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
      "6 weeks of AI + entrepreneurship for young innovators aged 10 to 17. Come with ideas, leave with products. Buea, Cameroon.",
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
    description: "AI + Entrepreneurship for young innovators. Ages 10 to 17. Buea, Cameroon.",
    images: ["https://sbc.prepskul.com/sbc-og.png"],
  },
  metadataBase: new URL("https://sbc.prepskul.com"),
  alternates: {
    canonical: "https://sbc.prepskul.com",
  },
}

export default function SbcLayout({ children }: { children: React.ReactNode }) {
  return children
}
