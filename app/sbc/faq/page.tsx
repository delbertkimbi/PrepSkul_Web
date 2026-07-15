"use client"

import Link from "next/link"
import { ArrowRight, MessageCircle } from "lucide-react"
import SbcHeader from "@/components/sbc/sbc-header"
import SbcFooter from "@/components/sbc/sbc-footer"
import { SbcPageShell } from "@/components/sbc/sbc-page-shell"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Eyebrow, PaperButton, PaperSheet, Tape } from "@/components/sbc/paper-ui"
import { SBC_CONTACT, SBC_FAQ } from "@/lib/sbc/content"
import { useSbcPath } from "@/lib/sbc/use-sbc-path"
import { useSbcLanguage } from "@/lib/sbc/i18n"

export default function FaqPage(){const path=useSbcPath();const {t}=useSbcLanguage();return <SbcPageShell><SbcHeader/><main className="px-4 py-14 sm:px-6 lg:py-24"><div className="mx-auto max-w-4xl"><div className="text-center"><Eyebrow>Parent notes</Eyebrow><h1 className="sbc-display mt-5 text-5xl font-black uppercase sm:text-7xl">{t("Questions?")} <span className="text-[#2864d7]">{t("Answered.")}</span></h1><p className="mx-auto mt-5 max-w-xl leading-7 text-slate-600">The practical details you need before saving a seat.</p></div><PaperSheet className="mt-12 p-4 sm:p-7"><Tape className="-top-3 left-1/2 -translate-x-1/2"/><Accordion type="single" collapsible className="divide-y divide-dashed divide-[#132d63]/20">{SBC_FAQ.map((item,i)=><AccordionItem key={item.question} value={`q-${i}`} className="border-0"><AccordionTrigger className="py-5 text-left text-base font-black text-[#132d63] hover:text-[#2864d7] hover:no-underline sm:text-lg">{item.question}</AccordionTrigger><AccordionContent className="pb-6 text-sm leading-7 text-slate-600 sm:text-base">{item.answer}</AccordionContent></AccordionItem>)}</Accordion></PaperSheet><PaperSheet tone="yellow" className="mt-12 p-7 sm:p-9" rotate={-1}><div className="flex flex-col items-center justify-between gap-6 sm:flex-row"><div><h2 className="sbc-display text-3xl font-black uppercase">Still curious?</h2><p className="mt-2 text-sm text-slate-600">Talk to the SBC team or explore the full five-day roadmap.</p></div><div className="flex flex-col gap-3 sm:flex-row"><a href={SBC_CONTACT.whatsapp} target="_blank" rel="noreferrer"><PaperButton className="w-full py-3 text-sm"><MessageCircle className="mr-2 h-4 w-4"/>{t("WhatsApp us")}</PaperButton></a><Link href={path("/program")} className="inline-flex items-center justify-center rounded-xl border-2 border-[#132d63] px-4 py-3 text-sm font-black">{t("Roadmap")} <ArrowRight className="ml-2 h-4 w-4"/></Link></div></div></PaperSheet></div></main><SbcFooter/></SbcPageShell>}
