import { marketingMetadata } from "@/lib/marketing/seo-metadata"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return marketingMetadata((await params).locale, "mate")
}

export default function MateLayout({ children }: { children: React.ReactNode }) {
  return children
}
