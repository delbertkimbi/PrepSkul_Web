"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "What is PrepSkul?",
    answer:
      "PrepSkul is a learning platform that connects learners across Cameroon and beyong with trusted home and online tutors. Whether it is school subjects or practical skills, we help every learner grow through personal guidance, flexible learning, and caring mentorship, all in one place.We are currently active across Cameroon and soon expanding across Africa.",
  },
  {
    question: "How does PrepSkul work?",
    answer:
      "We match each learner with a tutor or trainer who best fits their goals, schedule, and location. You can choose to learn online or have one-on-one or group sessions at home. Our team ensures that every learning experience is tailored, simple, and effective.",
  },
  {
    question: " ⁠What do you charge?",
    answer:
      "Our sessions range between 2,500 XAF and 5,000 XAF, depending on the subject, skill, and duration. Fees are transparent and discussed before lessons begin, and payments are done upfront to confirm your sessions.",
  },
  {
    question: "⁠Are your tutors qualified?",
    answer:
      "Yes. Every tutor and trainer at PrepSkul goes through a careful selection process and regular training through the PrepSkul Academy. This ensures high teaching standards, professionalism, and a genuine passion for helping learners grow.",
  },
  {
    question: "⁠What subjects or skills can I learn?",
    answer:
      "From core school subjects like Mathematics, English, and Sciences to practical skills like Computer Literacy, Coding, and Creative Arts, PrepSkul gives every learner the chance to grow academically and beyond the classroom.",
  },
  {
    question: "⁠What curriculum do you use?",
    answer:
      "We follow the official national and international curricula recognized by Cameroon’s Ministry of Education. This ensures that every learner stays on track with their school or exam requirements.",
  },
  {
    question: "Can I become a tutor on PrepSkul?",
    answer:
      "Yes. If you love teaching or sharing your skills, you can apply to join our growing network of tutors. We provide the training, support, and visibility you need to reach more learners and grow as an educator.",
  },
  {
    question: "What if I need to reschedule a session?",
    answer:
      "We understand that schedules change. You can reschedule sessions with at least 24 hours notice at no charge. Just contact your tutor or our support team to arrange a new time.",
  },
]

export function FAQSection() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Got questions? We've got answers. Find everything you need to know about PrepSkul.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left hover:no-underline py-4">
                  <span className="font-semibold">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
