"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Typewriter } from "@/components/typewriter"
import { TestimonialsSection } from "@/components/testimonials-section"
import { FAQSection } from "@/components/faq-section"
import { PhoneMockup } from "@/components/phone-mockup"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { OrganizationSchema, LocalBusinessSchema, FAQSchema } from "@/components/seo-schema"
import Link from "next/link"
import Image from "next/image"
import { CheckCircle2, BookOpen, TrendingUp } from "lucide-react"
import { AnimatedCounter } from "@/components/animated-counter"
import { getTranslations } from "@/lib/translations"
import { useLocale } from "@/lib/locale-context"
import { type Locale } from "@/lib/i18n"

export default function HomePage() {
  const { locale } = useLocale()
  const t = getTranslations(locale)
  const faqData = [...t.faq.items]

  return (
    <div className="min-h-screen flex flex-col">
      <OrganizationSchema />
      <LocalBusinessSchema />
      <FAQSchema faqs={faqData} />
      <Header />

      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white hero-section-full">
        <div
          className="decorative-circle hidden lg:block"
          style={{ width: "200px", height: "200px", top: "10%", left: "5%" }}
        ></div>
        <div
          className="decorative-circle hidden lg:block"
          style={{ width: "150px", height: "150px", bottom: "15%", left: "10%" }}
        ></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center h-full max-w-7xl mx-auto">
            {/* Left side - Content */}
            <div className="space-y-7 z-10 lg:pr-8 text-left lg:text-left">
              <div className="space-y-5">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
                  {t.home.hero.title}{" "}
                  <span className="text-primary block mt-2">
                    <Typewriter words={[...t.home.hero.titleWords]} />
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
                  {t.home.hero.subtitle}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" asChild className="w-full sm:w-auto text-base font-semibold h-12 px-8">
                  <Link href={`/${locale}/contact`}>{t.home.hero.getStarted}</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="w-full sm:w-auto text-base font-semibold h-12 px-8 bg-transparent"
                >
                  <Link href={`/${locale}/programs`}>{t.home.hero.viewSubjects}</Link>
                </Button>
              </div>
            </div>

            <div className="relative lg:min-h-[600px] flex items-center justify-center">
              <div
                className="hero-circular-shape-large hidden lg:block"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              ></div>

              <div className="relative z-10 flex justify-center">
                <PhoneMockup locale={locale} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-y">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-2">
              <div className="text-4xl sm:text-5xl font-bold text-primary">
                <AnimatedCounter end={100} suffix="+" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">{t.home.stats.learnersGuided}</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl sm:text-5xl font-bold text-primary">
                <AnimatedCounter end={50} suffix="+" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">{t.home.stats.expertTutors}</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl sm:text-5xl font-bold text-primary">
                <AnimatedCounter end={15} suffix="+" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">{t.home.stats.subjectsCovered}</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl sm:text-5xl font-bold text-primary">
                <AnimatedCounter end={7} suffix="+" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">{t.home.stats.citiesCovered}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">{t.home.learningOptions.title}</h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              {t.home.learningOptions.subtitle}
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="p-0 border-2 hover:border-primary transition-all hover:shadow-xl overflow-hidden group">
              <div className="relative h-56 w-full overflow-hidden">
                <Image
                  src="/african-student-learning-online-via-video-call-wit.jpg"
                  alt="Student learning online via video call with tutor"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-5 space-y-2">
                <h3 className="font-bold text-xl">{t.home.learningOptions.online.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t.home.learningOptions.online.description}
                </p>
              </CardContent>
            </Card>

            <Card className="p-0 border-2 hover:border-primary transition-all hover:shadow-xl overflow-hidden group">
              <div className="relative h-56 w-full overflow-hidden">
                <Image
                  src="/african-tutor-teaching-student-at-home-with-books-.jpg"
                  alt="Tutor teaching student at home with personalized attention"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-5 space-y-2">
                <h3 className="font-bold text-xl">{t.home.learningOptions.home.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t.home.learningOptions.home.description}
                </p>
              </CardContent>
            </Card>

            <Card className="p-0 border-2 hover:border-primary transition-all hover:shadow-xl overflow-hidden group">
              <div className="relative h-56 w-full overflow-hidden">
                <Image
                  src="/group-class-prepskul.png"
                  alt="Group of students learning together collaboratively"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-5 space-y-2">
                <h3 className="font-bold text-xl">{t.home.learningOptions.group.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t.home.learningOptions.group.description}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">{t.home.programs.title}</h2>
            <p className="text-base text-muted-foreground max-w-3xl mx-auto">
              {t.home.programs.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            <Card className="p-0 overflow-hidden border-2 hover:border-primary transition-all hover:shadow-xl group">
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src="/african-student-studying-mathematics-and-science-w.jpg"
                  alt="Student studying mathematics and science with tutor guidance"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BookOpen className="w-6 h-6 flex-shrink-0 mt-0.5 text-primary" />
                  </div>
                  <h3 className="font-bold text-2xl">{t.home.programs.academic.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t.home.programs.academic.description}
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                    <span className="text-sm">
                      <strong>{t.home.programs.academic.subjects.math.split(':')[0]}:</strong> {t.home.programs.academic.subjects.math.split(':')[1]}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                    <span className="text-sm">
                      <strong>{t.home.programs.academic.subjects.languages.split(':')[0]}:</strong> {t.home.programs.academic.subjects.languages.split(':')[1]}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                    <span className="text-sm">
                      <strong>{t.home.programs.academic.subjects.exams.split(':')[0]}:</strong> {t.home.programs.academic.subjects.exams.split(':')[1]}
                    </span>
                  </li>
                </ul>
                <Button size="lg" asChild className="w-full text-base font-semibold">
                  <Link href={`/${locale}/programs`}>{t.home.hero.viewSubjects}</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="p-0 overflow-hidden border-2 hover:border-primary transition-all hover:shadow-xl group">
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src="/african-young-person-learning-coding-on-laptop-wit.jpg"
                  alt="Young person learning coding and technology skills"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-2xl">{t.home.programs.skills.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t.home.programs.skills.description}
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                    <span className="text-sm">
                      <strong>{t.home.programs.skills.subjects.tech.split(':')[0]}:</strong> {t.home.programs.skills.subjects.tech.split(':')[1]}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                    <span className="text-sm">
                      <strong>{t.home.programs.skills.subjects.arts.split(':')[0]}:</strong> {t.home.programs.skills.subjects.arts.split(':')[1]}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                    <span className="text-sm">
                      <strong>{t.home.programs.skills.subjects.life.split(':')[0]}:</strong> {t.home.programs.skills.subjects.life.split(':')[1]}
                    </span>
                  </li>
                </ul>
                <Button size="lg" variant="outline" asChild className="w-full text-base font-semibold bg-transparent">
                  <Link href={`/${locale}/programs`}>{t.home.hero.viewSubjects}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <TestimonialsSection />

      <FAQSection />

      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t.home.cta.title}</h2>
          <p className="text-base mb-8 max-w-3xl mx-auto opacity-95 leading-relaxed">
            {t.home.cta.subtitle}
          </p>
          <Button size="lg" variant="secondary" asChild className="text-base font-semibold px-8 h-11">
            <Link href={`/${locale}/contact`}>{t.home.cta.button}</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
