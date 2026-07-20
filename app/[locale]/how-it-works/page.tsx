import Link from "next/link"
import { ArrowRight, BookOpenCheck, ClipboardCheck, LineChart, SearchCheck } from "lucide-react"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"

const steps = [
  {
    number: "01",
    title: "Understand the learner",
    body: "Start with the learner's goals, current level and the concepts that need more attention.",
    icon: SearchCheck,
  },
  {
    number: "02",
    title: "Guide the next step",
    body: "Connect the learner with the right support, whether that is a tutor, a focused program or a school partnership.",
    icon: ClipboardCheck,
  },
  {
    number: "03",
    title: "Practice with purpose",
    body: "Turn classroom teaching into clearer understanding through focused explanations and meaningful practice.",
    icon: BookOpenCheck,
  },
  {
    number: "04",
    title: "Track progress",
    body: "Review what is improving and adjust the next step so learning keeps moving forward.",
    icon: LineChart,
  },
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white text-[#17213a]">
      <Header />
      <main>
        <section className="border-b border-[#17213a]/10 bg-[#f7f9fd]">
          <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28 xl:px-20">
            <div className="max-w-4xl">
              <h1 className="max-w-3xl text-5xl font-extrabold leading-[.98] tracking-[-.06em] sm:text-6xl lg:text-7xl">
                From classroom teaching to real understanding.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-[#5f6b85] sm:text-xl">
                PrepSkul brings together trusted tutors, personalized learning tools and practical programs to help every learner understand difficult concepts, build confidence and keep progressing.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 xl:px-20">
          <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h2 className="max-w-xl text-4xl font-extrabold tracking-[-.05em] sm:text-5xl">A clear learning loop.</h2>
              <p className="mt-4 max-w-xl text-lg leading-8 text-[#69758c]">The support is personal, but the process stays simple and visible.</p>
            </div>
            <Link href="/contact" className="glass-primary inline-flex w-fit items-center gap-3 rounded-md px-6 py-3.5 text-sm font-extrabold">Find learning support <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid border-l border-t border-[#17213a]/12 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => {
              const Icon = step.icon
              return (
                <article key={step.number} className="group min-h-[275px] border-b border-r border-[#17213a]/12 bg-white p-7 transition-colors duration-300 hover:bg-[#f4f7ff] sm:p-8">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-[#3156a6]">{step.number}</span>
                    <Icon className="h-6 w-6 text-[#3156a6] transition-transform duration-300 group-hover:-translate-y-1" />
                  </div>
                  <h3 className="mt-14 text-2xl font-extrabold tracking-[-.04em]">{step.title}</h3>
                  <p className="mt-4 text-[15px] leading-7 text-[#69758c]">{step.body}</p>
                </article>
              )
            })}
          </div>
        </section>

        <section className="border-y border-[#17213a]/10 bg-[#17213a] text-white">
          <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:px-12 lg:py-20 xl:px-20">
            <div>
              <h2 className="max-w-xl text-4xl font-extrabold tracking-[-.05em] sm:text-5xl">Start with the support that fits now.</h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-white/70">Choose one-to-one academic support, a practical program, or a conversation about support for a school.</p>
            </div>
            <div className="flex flex-wrap content-center gap-3 lg:justify-end">
              <Link href="/contact" className="inline-flex items-center gap-3 rounded-md bg-[#4d79d8] px-6 py-3.5 text-sm font-extrabold transition-colors hover:bg-white hover:text-[#17213a]">Find learning support <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/programs" className="inline-flex items-center gap-3 rounded-md border border-white/30 px-6 py-3.5 text-sm font-extrabold transition-colors hover:bg-white/10">Explore programs <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
