"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
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
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance">
              Become a <span className="text-primary">PrepSkul</span> Tutor
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
              {t.tutors.hero.subtitle}
            </p>
            <div className="pt-4">
              <Button size="lg" asChild className="text-lg font-semibold px-8 h-12">
                <Link href={`/${locale}/contact`}>{t.tutors.hero.applyNow}</Link>
            </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Teach with PrepSkul Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t.tutors.whyChooseUs.title}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.tutors.whyChooseUs.subtitle}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-4 border-2 hover:border-primary transition-all hover:shadow-xl group">
                <CardContent className="px-4 space-y-3 text-left">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                  <h3 className="text-lg font-semibold">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
              </CardContent>
            </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What We're Looking For & Application Process */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
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
              <Card className="bg-primary text-primary-foreground border-0 shadow-xl">
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
                    <Button size="lg" variant="secondary" asChild className="w-full text-base font-semibold">
                      <Link href={`/${locale}/contact`}>{t.tutors.application.applyButton}</Link>
                  </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Subjects We Need Tutors For */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t.tutors.subjects.title}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.tutors.subjects.subtitle}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {subjects.map((subject, index) => (
              <Card key={index} className="p-4 border-2 hover:border-primary transition-all hover:shadow-xl group bg-white">
                <CardContent className="px-4 space-y-2">
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors text-left">{subject.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed text-left">{subject.description}</p>
              </CardContent>
            </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold">{t.tutors.cta.title}</h2>
            <p className="text-lg text-primary-foreground/90">
              {t.tutors.cta.subtitle}
            </p>
            <Button size="lg" variant="secondary" asChild className="text-lg font-semibold px-8 h-12">
              <Link href={`/${locale}/contact`}>{t.tutors.cta.button}</Link>
          </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}