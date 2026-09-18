"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { 
  DollarSign, 
  Users, 
  Calendar, 
  BookOpen, 
  TrendingUp, 
  Heart,
  GraduationCap,
  MessageCircle,
  Clock,
  Award,
  CheckCircle2,
  Target
} from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { getTranslations } from "@/lib/translations"

export default function TutorsPage() {
  const { locale } = useLocale()
  const t = getTranslations(locale)

  const benefits = [
    {
      icon: DollarSign,
      title: t.tutors.benefits.competitivePay.title,
      description: t.tutors.benefits.competitivePay.description
    },
    {
      icon: Users,
      title: t.tutors.benefits.steadyStudents.title,
      description: t.tutors.benefits.steadyStudents.description
    },
    {
      icon: Calendar,
      title: t.tutors.benefits.flexibleSchedule.title,
      description: t.tutors.benefits.flexibleSchedule.description
    },
    {
      icon: BookOpen,
      title: t.tutors.benefits.trainingSupport.title,
      description: t.tutors.benefits.trainingSupport.description
    },
    {
      icon: TrendingUp,
      title: t.tutors.benefits.careerGrowth.title,
      description: t.tutors.benefits.careerGrowth.description
    },
    {
      icon: Heart,
      title: t.tutors.benefits.makeImpact.title,
      description: t.tutors.benefits.makeImpact.description
    }
  ]

  const requirements = [
    {
      icon: GraduationCap,
      title: t.tutors.requirements.qualifiedEducators.title,
      description: t.tutors.requirements.qualifiedEducators.description
    },
    {
      icon: Heart,
      title: t.tutors.requirements.passionForTeaching.title,
      description: t.tutors.requirements.passionForTeaching.description
    },
    {
      icon: MessageCircle,
      title: t.tutors.requirements.strongCommunication.title,
      description: t.tutors.requirements.strongCommunication.description
    },
    {
      icon: Clock,
      title: t.tutors.requirements.reliability.title,
      description: t.tutors.requirements.reliability.description
    }
  ]

  const applicationSteps = [
    t.tutors.application.step1,
    t.tutors.application.step2,
    t.tutors.application.step3,
    t.tutors.application.step4,
    t.tutors.application.step5
  ]

  const subjects = [
    {
      title: t.tutors.subjects.mathematics.title,
      description: t.tutors.subjects.mathematics.description
    },
    {
      title: t.tutors.subjects.sciences.title,
      description: t.tutors.subjects.sciences.description
    },
    {
      title: t.tutors.subjects.languages.title,
      description: t.tutors.subjects.languages.description
    },
    {
      title: t.tutors.subjects.coding.title,
      description: t.tutors.subjects.coding.description
    },
    {
      title: t.tutors.subjects.arts.title,
      description: t.tutors.subjects.arts.description
    },
    {
      title: t.tutors.subjects.business.title,
      description: t.tutors.subjects.business.description
    },
    {
      title: t.tutors.subjects.testPrep.title,
      description: t.tutors.subjects.testPrep.description
    },
    {
      title: t.tutors.subjects.lifeSkills.title,
      description: t.tutors.subjects.lifeSkills.description
    }
  ]

  return (
    <div className="min-h-screen bg-white text-[#17213a]">
      <Header />

      {/* Hero Section */}
      <section className="border-b border-[#17213a]/10 bg-[#f7f9fd] py-20 lg:py-28">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-20">
          <div className="max-w-4xl space-y-6">
            <h1 className="max-w-3xl text-5xl font-extrabold leading-[.98] tracking-[-.06em] sm:text-6xl lg:text-7xl">
              Become a <span className="text-[#3156a6]">PrepSkul</span> Tutor
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
              {t.tutors.hero.subtitle}
            </p>
	            <div className="pt-4"><Link href={`/${locale}/contact`} className="glass-primary">{t.tutors.hero.applyNow}</Link></div>
	          </div>
	        </div>
	      </section>

      {/* Why Teach with PrepSkul Section */}
      <section className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 xl:px-20">
          <div className="mb-12 max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t.tutors.whyChooseUs.title}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.tutors.whyChooseUs.subtitle}
            </p>
          </div>

          <div className="grid border-l border-t border-[#17213a]/12 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, index) => (
              <Card key={index} className="rounded-none border-0 border-b border-r border-[#17213a]/12 bg-white p-4 shadow-none transition-colors hover:bg-[#f4f7ff]">
                <CardContent className="px-4 py-4 space-y-3 text-left">
                  <div className="w-12 h-12 bg-[#eaf0ff] rounded-full flex items-center justify-center">
                    <benefit.icon className="h-6 w-6 text-[#3156a6]" />
                </div>
                  <h3 className="text-lg font-semibold">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
              </CardContent>
	            </Card>
	            ))}
	            </div>
	      </section>

      {/* What We're Looking For & Application Process */}
      <section className="border-y border-[#17213a]/10 bg-[#f7f9fd] py-20">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:px-12 xl:px-20">
            {/* What We're Looking For */}
              <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-3 text-gray-800">{t.tutors.requirements.title}</h2>
                <p className="text-gray-600 leading-relaxed">
                  {t.tutors.requirements.subtitle}
                </p>
                    </div>
              
              <div className="space-y-5">
                {requirements.map((req, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <req.icon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-base text-gray-800">{req.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{req.description}</p>
                    </div>
                    </div>
                ))}
              </div>
              </div>

            {/* Application Process */}
            <div className="space-y-8">
              <Card className="rounded-[22px] bg-[#17213a] text-white border-0 shadow-none">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-6">{t.tutors.application.title}</h2>
                  <div className="space-y-2">
                    {applicationSteps.map((step, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <span className="text-base font-semibold flex-shrink-0 mt-0.5">{index + 1}.</span>
                        <p className="text-primary-foreground/90 text-sm leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-6">
                    <Link href={`/${locale}/contact`} className="inline-flex w-full items-center justify-center rounded-md bg-[#4d79d8] px-6 py-3.5 text-sm font-extrabold text-white hover:bg-white hover:text-[#17213a]">{t.tutors.application.applyButton}</Link>
                  </div>
                </CardContent>
	              </Card>
	            </div>
	          </div>
	      </section>

      {/* Subjects We Need Tutors For */}
      <section className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 xl:px-20">
          <div className="mb-12 max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t.tutors.subjects.title}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.tutors.subjects.subtitle}
            </p>
          </div>

          <div className="grid border-l border-t border-[#17213a]/12 sm:grid-cols-2 lg:grid-cols-4">
            {subjects.map((subject, index) => (
              <Card key={index} className="rounded-none border-0 border-b border-r border-[#17213a]/12 p-4 shadow-none transition-colors hover:bg-[#f4f7ff]">
                <CardContent className="px-4 py-4 space-y-2">
                  <h3 className="font-semibold text-lg text-left">{subject.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed text-left">{subject.description}</p>
              </CardContent>
            </Card>
            ))}
	          </div>
	      </section>

      {/* Call to Action */}
      <section className="py-20 bg-[#17213a] text-white">
        <div className="mx-auto max-w-[1440px] px-5 text-center sm:px-8 lg:px-12 xl:px-20">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold">{t.tutors.cta.title}</h2>
            <p className="text-lg text-primary-foreground/90">
              {t.tutors.cta.subtitle}
            </p>
            <Link href={`/${locale}/contact`} className="inline-flex rounded-md bg-[#4d79d8] px-7 py-3.5 text-sm font-extrabold text-white transition-colors hover:bg-white hover:text-[#17213a]">{t.tutors.cta.button}</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
