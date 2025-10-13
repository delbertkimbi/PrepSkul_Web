"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "How does PrepSkul work?",
    answer:
      "PrepSkul connects you with qualified tutors for personalized learning. Simply tell us what you need, we'll match you with the right tutor, you schedule your sessions, and start learning. It's that simple!",
  },
  {
    question: "What subjects do you offer?",
    answer:
      "We offer tutoring in all major academic subjects including Mathematics, Sciences, English, Languages, and more. We also provide skill development in areas like Coding, Art, Music, and Life Skills. If you need help with something specific, just ask!",
  },
  {
    question: "How much does tutoring cost?",
    answer:
      "Our pricing varies based on the subject, tutor experience, and session type (online, home, or group). We offer competitive rates and flexible payment options. Contact us for a personalized quote based on your needs.",
  },
  {
    question: "Are your tutors qualified?",
    answer:
      "All PrepSkul tutors are carefully vetted and background-checked. They have relevant qualifications, teaching experience, and a genuine passion for helping students succeed. We only work with the best.",
  },
  {
    question: "Can I choose my own tutor?",
    answer:
      "Yes! We'll match you with tutors based on your needs, and you can review their profiles before making a decision. If you're not satisfied with your match, we'll find you another tutor at no extra cost.",
  },
  {
    question: "Do you offer online or in-person tutoring?",
    answer:
      "We offer both! You can choose online sessions via video call, in-person home tutoring, or group sessions. Pick the option that works best for your schedule and learning style.",
  },
  {
    question: "How do I get started?",
    answer:
      "Getting started is easy! Click the 'Get Started' button, tell us about your learning needs, and we'll match you with a qualified tutor. You can also contact us via WhatsApp for immediate assistance.",
  },
  {
    question: "What if I need to reschedule a session?",
    answer:
      "We understand that schedules change. You can reschedule sessions with at least 24 hours notice at no charge. Just contact your tutor or our support team to arrange a new time.",
  },
  {
    question: "Do you offer group sessions?",
    answer:
      "Yes! Group sessions are a great way to learn with peers at a more affordable rate. We keep groups small (typically 3-5 students) to ensure everyone gets attention and support.",
  },
  {
    question: "How do I track my progress?",
    answer:
      "Your tutor will provide regular feedback and progress updates. We also encourage open communication between tutors, students, and parents to ensure everyone is on the same page about learning goals and achievements.",
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
