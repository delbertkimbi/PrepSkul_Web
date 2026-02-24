import type { Metadata } from "next"
import AmbassadorsLayoutClient from "./layout-client"

export const metadata: Metadata = {
  title: "PrepSkul Ambassadors Program | Join Our Community of Changemakers",
  description: "Join the PrepSkul Ambassador Team and help transform education in Cameroon. Connect students, parents, and tutors to life-changing learning opportunities. Get recognized, access exclusive perks, and unlock scholarship opportunities.",
  keywords: [
    "PrepSkul Ambassadors",
    "education ambassadors Cameroon",
    "student ambassadors",
    "tutoring ambassadors",
    "education community Cameroon",
    "PrepSkul ambassador program"
  ],
  openGraph: {
    type: "website",
    url: "https://ambassadors.prepskul.com",
    siteName: "PrepSkul Ambassadors",
    title: "PrepSkul Ambassadors Program | Join Our Community of Changemakers",
    description: "Join the PrepSkul Ambassador Team and help transform education in Cameroon. Connect students, parents, and tutors to life-changing learning opportunities.",
    images: [
      {
        url: "https://ambassadors.prepskul.com/ambassadors.jpg",
        width: 1200,
        height: 630,
        alt: "PrepSkul Ambassadors - Join Our Community of Changemakers",
      },
    ],
    locale: "en_CM",
  },
  twitter: {
    card: "summary_large_image",
    title: "PrepSkul Ambassadors Program",
    description: "Join the PrepSkul Ambassador Team and help transform education in Cameroon.",
    images: ["https://ambassadors.prepskul.com/ambassadors.jpg"],
  },
  metadataBase: new URL("https://ambassadors.prepskul.com"),
  alternates: {
    canonical: "https://ambassadors.prepskul.com",
  },
}

export default function AmbassadorsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AmbassadorsLayoutClient>{children}</AmbassadorsLayoutClient>
}
