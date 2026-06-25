"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import SbcHeader from "@/components/sbc/sbc-header"
import SbcFooter from "@/components/sbc/sbc-footer"
import { SbcPageShell } from "@/components/sbc/sbc-page-shell"
import { PricingBadge } from "@/components/sbc/pricing-badge"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { SBC_FAQ, SBC_CONTACT } from "@/lib/sbc/content"
import { useSbcPath } from "@/lib/sbc/use-sbc-path"
import { SbcBackButton } from "@/components/sbc/sbc-back-button"
import { sbcBtnPrimary } from "@/lib/sbc/styles"
import { ArrowRight, MessageCircle } from "lucide-react"

export default function SbcFaqPage() {
  const sbcPath = useSbcPath()

  return (
    <SbcPageShell>
      <SbcHeader />

      <div className="flex-1 py-8 sm:py-12 lg:py-16 min-w-0 relative">
        <SbcBackButton className="absolute top-6 left-4 sm:left-6 lg:left-8 z-10" />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-10 sm:pt-2">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-3 text-[#1B2C4F]">Frequently Asked Questions</h1>
            <p className="text-slate-500 text-sm sm:text-base">
              Everything parents and students need to know about Summer Build Camp.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Accordion type="single" collapsible className="space-y-2 sm:space-y-3">
              {SBC_FAQ.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="rounded-xl bg-white border border-slate-200 px-4 sm:px-5 shadow-sm data-[state=open]:border-[#4A6FBF]/40"
                >
                  <AccordionTrigger className="text-left font-semibold text-[#1B2C4F] hover:text-[#4A6FBF] hover:no-underline py-4 sm:py-5 text-sm sm:text-base pr-2">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 leading-relaxed pb-4 sm:pb-5 text-sm sm:text-base">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>

          <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-black text-[#1B2C4F]">Still have questions?</h2>
              <p className="text-slate-500 text-sm sm:text-base">
                Reach out to our team on WhatsApp or visit the program page for full details.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild className={`${sbcBtnPrimary} w-full sm:w-auto`}>
                  <a href={SBC_CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Chat on WhatsApp
                  </a>
                </Button>
                <Button asChild variant="outline" className="border-slate-300 text-[#1B2C4F] hover:bg-slate-50 bg-white w-full sm:w-auto">
                  <Link href={sbcPath("/program")}>
                    View Program <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <PricingBadge />
            </div>
          </div>
        </div>
      </div>

      <SbcFooter />
    </SbcPageShell>
  )
}
