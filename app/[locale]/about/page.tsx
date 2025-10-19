"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { TrendingUp, Heart, Shield, Users, Globe } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { getTranslations } from "@/lib/translations"

export default function AboutPage() {
  const { locale } = useLocale()
  const t = getTranslations(locale)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance">
              {t.about.hero.title} <span className="text-accent">{t.about.hero.titleAccent}</span> {t.about.hero.titlePrimary}{" "}
              <span className="text-primary">{t.about.hero.titlePrimaryEnd}</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground text-pretty">
              {t.about.hero.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl sm:text-4xl font-bold">{t.about.story.title}</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>{t.about.story.paragraph1}</p>
                  <p>{t.about.story.paragraph2}</p>
                  <p>{t.about.story.paragraph3}</p>
                </div>
              </div>

              <div className="relative">
                <div className="relative aspect-[6/5.4] rounded-2xl overflow-hidden">
                  <Image
                    src="/images/prepskul-student-presenting.png"
                    alt="PrepSkul student confidently presenting"
                    fill
                    className="object-cover liquid-fill-bottom"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold">{t.about.mission.title}</h2>
            <p className="text-xl text-primary-foreground/90 text-balance">
              {t.about.mission.description}
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t.about.values.title}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.about.values.subtitle}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-xl">{t.about.values.growth.title}</h3>
                <p className="text-sm text-muted-foreground">{t.about.values.growth.description}</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-accent transition-colors">
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <Heart className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-xl">{t.about.values.trust.title}</h3>
                <p className="text-sm text-muted-foreground">{t.about.values.trust.description}</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-xl">{t.about.values.accountability.title}</h3>
                <p className="text-sm text-muted-foreground">{t.about.values.accountability.description}</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-accent transition-colors">
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <Globe className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-xl">{t.about.values.accessibility.title}</h3>
                <p className="text-sm text-muted-foreground">{t.about.values.accessibility.description}</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-xl">{t.about.values.community.title}</h3>
                <p className="text-sm text-muted-foreground">{t.about.values.community.description}</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-accent transition-colors bg-accent text-accent-foreground">
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 bg-accent-foreground/10 rounded-full flex items-center justify-center">
                  <Heart className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="font-semibold text-xl">{t.about.values.excellence.title}</h3>
                <p className="text-sm text-accent-foreground/90">{t.about.values.excellence.description}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">{t.about.cta.title}</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            {t.about.cta.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href={`/${locale}/contact`}>{t.about.cta.startLearning}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href={`/${locale}/tutors`}>{t.about.cta.becomeTutor}</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
