"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PaperButton, PaperSheet } from "@/components/marketing/paper"
import { useLocale } from "@/lib/locale-context"
import { Mail, Phone, MapPin } from "lucide-react"

export default function ContactPage() {
  const { locale } = useLocale()
  const loc = locale.startsWith("fr") ? "fr" : "en"
  const fr = loc === "fr"

  return (
    <div className="ps-site min-h-screen">
      <Header />
      <section className="ps-wrap py-16 lg:py-20">
        <h1 className="ps-h1 max-w-3xl">{fr ? "Écrire à PrepSkul." : "Talk to PrepSkul."}</h1>
        <p className="ps-lead mt-4 max-w-2xl">
          {fr
            ? "Pour une leçon, commence avec Mate ou parcours les tuteurs. Pour l’école, un partenariat, ou enseigner ici, écris-nous."
            : "For a lesson, start with Mate or browse tutors. For a school, a partnership, or teaching here, write to us."}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href={`/${loc}/onboard`}>
            <PaperButton>{fr ? "Commencer" : "Get started"}</PaperButton>
          </Link>
          <Link
            href={`/${loc}/find`}
            className="inline-flex items-center justify-center rounded-2xl border-2 border-[#1B2C4F] bg-[#fffdf7] px-6 py-3.5 font-black text-[#1B2C4F] shadow-[0_5px_0_rgba(27,44,79,.18)]"
          >
            {fr ? "Voir les tuteurs" : "Browse tutors"}
          </Link>
        </div>
      </section>

      <section className="ps-wrap grid gap-5 pb-20 md:grid-cols-3">
        <PaperSheet className="p-6" rotate={-1}>
          <Phone className="h-6 w-6 text-[#0EA5E9]" />
          <p className="mt-4 text-sm font-black uppercase">WhatsApp</p>
          <a href="https://wa.me/237674089066" className="mt-2 block text-sm font-bold text-[#1B2C4F]">
            +237 6 74 08 90 66
          </a>
        </PaperSheet>
        <PaperSheet className="p-6" tone="blue" rotate={1}>
          <Mail className="h-6 w-6 text-[#0EA5E9]" />
          <p className="mt-4 text-sm font-black uppercase">Email</p>
          <a href="mailto:info@prepskul.com" className="mt-2 block text-sm font-bold text-[#1B2C4F]">
            info@prepskul.com
          </a>
        </PaperSheet>
        <PaperSheet className="p-6" tone="yellow" rotate={-1}>
          <MapPin className="h-6 w-6 text-[#0EA5E9]" />
          <p className="mt-4 text-sm font-black uppercase">{fr ? "Bureau" : "Office"}</p>
          <p className="mt-2 text-sm font-bold text-[#1B2C4F]">Buea, Cameroon</p>
        </PaperSheet>
      </section>
      <Footer />
    </div>
  )
}
