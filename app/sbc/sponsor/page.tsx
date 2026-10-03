"use client"

import { ArrowRight, Bot, CheckCircle2, HeartHandshake, Lightbulb, Rocket, Users } from "lucide-react"
import SbcHeader from "@/components/sbc/sbc-header"
import SbcFooter from "@/components/sbc/sbc-footer"
import { Doodle, Eyebrow, PaperButton, PaperSheet, Tape } from "@/components/sbc/paper-ui"
import { SbcPageShell } from "@/components/sbc/sbc-page-shell"
import { SBC_CONTACT } from "@/lib/sbc/content"
import { useSbcLanguage } from "@/lib/sbc/i18n"

const levels = [
  { name: "Explorer Sponsor", learners: "Sponsor 1 learner", price: "8,000 XAF", icon: Lightbulb, tone: "mint" as const },
  { name: "Creator Sponsor", learners: "Sponsor 3 learners", price: "22,000 XAF", icon: Rocket, tone: "lilac" as const },
  { name: "Innovator Sponsor", learners: "Sponsor 10 learners", price: "65,000 XAF", icon: Bot, tone: "yellow" as const },
  { name: "Visionary Sponsor", learners: "Sponsor an entire team", price: "120,000+ XAF", icon: Users, tone: "blue" as const },
]

const includes = ["Full Summer Build Camp experience", "AI & Innovation training", "Mentorship", "Team project materials", "Demo Day participation", "Certificate of completion"]

export default function SponsorPage() {
  const { t, locale } = useSbcLanguage()
  const message = (level: string) => locale === "fr"
    ? `Bonjour PrepSkul ! Je souhaite devenir ${level} pour le Summer Build Camp 2026. Pouvez-vous me communiquer les prochaines étapes ?`
    : `Hello PrepSkul! I would like to become a ${level} for Summer Build Camp 2026. Please share the next steps.`

  return <SbcPageShell><SbcHeader/><main>
    <section className="relative overflow-hidden px-4 pb-16 pt-12 sm:px-6 lg:pb-24 lg:pt-20">
      <Doodle className="left-[7%] top-16 -rotate-12 text-4xl text-[#f2b91f]">✦</Doodle><Doodle className="right-[8%] top-28 rotate-12 text-5xl text-[#6a47bd]">✧</Doodle>
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1fr_.85fr]">
        <div className="relative z-10 text-center lg:text-left"><Eyebrow>{t("One summer. Endless possibilities.")}</Eyebrow><h1 className="sbc-display mt-5 text-5xl font-black uppercase leading-[.88] text-[#132d63] sm:text-7xl"><span>{t("Sponsor a")}</span><br/><span className="text-[#2864d7]">{t("young")}</span><br/><span className="text-[#168c91]">{t("innovator.")}</span></h1><p className="mx-auto mt-6 max-w-xl text-lg font-bold leading-8 text-[#132d63] lg:mx-0">{t("Give a young person the opportunity to learn, build and lead.")}</p><p className="mx-auto mt-4 max-w-xl leading-7 text-slate-600 lg:mx-0">{t("Your sponsorship gives a learner a full place at Summer Build Camp—where ideas become projects and confidence grows through doing.")}</p><a href={`${SBC_CONTACT.whatsapp}?text=${encodeURIComponent(message("Visionary Sponsor"))}`} target="_blank" rel="noreferrer" className="mt-8 inline-block"><PaperButton>{t("Sponsor now")} <ArrowRight className="ml-2 h-5 w-5"/></PaperButton></a></div>
        <PaperSheet tone="lilac" className="relative mx-auto w-full max-w-md p-7 sm:p-9" rotate={2}><Tape className="-top-3 right-12 rotate-6" color="cream"/><HeartHandshake className="h-12 w-12 text-[#2864d7]"/><p className="sbc-display mt-5 text-3xl font-black uppercase leading-tight text-[#132d63]">{t("You sponsor.")}<br/><span className="text-[#f2b91f]">{t("They transform.")}</span></p><div className="mt-6 border-t-2 border-dashed border-[#132d63]/20 pt-5"><p className="text-sm font-bold leading-6 text-slate-600">{t("A simple contribution can become a learner’s first prototype, first pitch and first belief that they can shape the future.")}</p></div></PaperSheet>
      </div>
    </section>
    <section className="bg-[#fffdf7] px-4 py-16 sm:px-6 lg:py-24"><div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[.8fr_1.2fr]"><PaperSheet className="p-7 sm:p-8" rotate={-1}><Eyebrow>{t("Your sponsorship provides")}</Eyebrow><ul className="mt-7 space-y-4">{includes.map((item) => <li key={item} className="flex items-center gap-3 text-sm font-bold text-[#132d63]"><CheckCircle2 className="h-5 w-5 shrink-0 text-[#168c91]"/>{t(item)}</li>)}</ul></PaperSheet><div><div className="max-w-xl"><h2 className="sbc-display text-4xl font-black uppercase leading-none text-[#132d63] sm:text-5xl">{t("Choose your impact.")}</h2><p className="mt-4 leading-7 text-slate-600">{t("Choose a level below. We’ll continue the conversation on WhatsApp—no long form, no email required.")}</p></div><div className="mt-8 grid gap-4 sm:grid-cols-2">{levels.map(({ name, learners, price, icon: Icon, tone }, index) => <PaperSheet key={name} tone={tone} className="flex min-h-64 flex-col p-5 sm:p-6" rotate={index % 2 ? 1 : -1}><Icon className="h-8 w-8 text-[#132d63]"/><h3 className="sbc-display mt-5 text-xl font-black uppercase text-[#132d63]">{t(name)}</h3><p className="mt-2 text-sm font-bold text-[#168c91]">{t(learners)}</p><p className="mt-4 text-2xl font-black text-[#132d63]">{price}</p><a href={`${SBC_CONTACT.whatsapp}?text=${encodeURIComponent(message(name))}`} target="_blank" rel="noreferrer" className="mt-auto pt-5 text-sm font-black text-[#2864d7] underline decoration-[#f5c843] decoration-4 underline-offset-4">{t("Sponsor this level")} →</a></PaperSheet>)}</div></div></div></section>
    <section className="px-4 py-16 sm:px-6 lg:py-20"><PaperSheet tone="yellow" className="mx-auto max-w-5xl p-8 text-center sm:p-12" rotate={-1}><Tape className="-top-3 left-1/2 -translate-x-1/2" color="cream"/><h2 className="sbc-display text-3xl font-black uppercase leading-tight text-[#132d63] sm:text-5xl">{t("Be the reason a young innovator discovers their potential.")}</h2><a href={`${SBC_CONTACT.whatsapp}?text=${encodeURIComponent(message("Visionary Sponsor"))}`} target="_blank" rel="noreferrer" className="mt-7 inline-block"><PaperButton>{t("Sponsor now")} <ArrowRight className="ml-2 h-5 w-5"/></PaperButton></a></PaperSheet></section>
  </main><SbcFooter/></SbcPageShell>
}
