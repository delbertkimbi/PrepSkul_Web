"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useLocale } from "@/lib/locale-context"
import { getTranslations } from "@/lib/translations"
import { aliveCopy } from "@/lib/marketing/alive-copy"
import { PaperSheet } from "@/components/marketing/paper"

export function FAQSection() {
  const { locale } = useLocale()
  const t = getTranslations(locale)
  const faqs = aliveCopy(locale).faq.map((item) => ({ question: item.q, answer: item.a }))

  return (
    <section className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <h2 className="ps-h2">{t.faq.title}</h2>
        <p className="ps-lead mt-3">{aliveCopy(locale).faqLead}</p>
        <PaperSheet className="mt-10 p-4 sm:p-6">
          <Accordion type="single" collapsible>
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-[#1B2C4F]/12 px-2">
                <AccordionTrigger className="py-5 text-left text-[15px] font-black hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-relaxed text-[#5C6B84]">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </PaperSheet>
      </div>
    </section>
  )
}
