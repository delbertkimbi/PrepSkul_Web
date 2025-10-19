"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  BookOpen,
  Calculator,
  Beaker,
  Globe,
  Code,
  Palette,
  Music,
  TrendingUp,
  Award,
  Target,
  Users,
  Sparkles,
  Lightbulb,
} from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { getTranslations } from "@/lib/translations"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
}

export default function ProgramsPage() {
  const { locale } = useLocale()
  const t = getTranslations(locale)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center space-y-5"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance">
              {t.programs.hero.title}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground text-pretty">
              {t.programs.hero.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      <section id="academic" className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">{t.programs.academic.title}</h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              {t.programs.academic.subtitle}
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
          >
            <motion.div variants={itemVariants}>
              <Card className="p-0 border-2 hover:border-primary transition-all hover:shadow-xl h-full group overflow-hidden">
                <div className="relative h-40 w-full overflow-hidden bg-gray-100">
                  <Image
                    src="/mathematics-illustration.png"
                    alt="Mathematics formulas and equations"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">{t.programs.academic.subjects.mathematics.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t.programs.academic.subjects.mathematics.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="p-0 border-2 hover:border-primary transition-all hover:shadow-xl h-full group overflow-hidden">
                <div className="relative h-40 w-full overflow-hidden bg-gray-100">
                  <Image
                    src="/science-illustration.png"
                    alt="Science lab equipment and chemistry"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Beaker className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">{t.programs.academic.subjects.sciences.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t.programs.academic.subjects.sciences.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="p-0 border-2 hover:border-primary transition-all hover:shadow-xl h-full group overflow-hidden">
                <div className="relative h-40 w-full overflow-hidden bg-gray-100">
                  <Image
                    src="/english-illustration.png"
                    alt="English language learning with books"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">{t.programs.academic.subjects.english.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t.programs.academic.subjects.english.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="p-0 border-2 hover:border-primary transition-all hover:shadow-xl h-full group overflow-hidden">
                <div className="relative h-40 w-full overflow-hidden bg-gray-100">
                  <Image
                    src="/languages-illustration.png"
                    alt="Multiple languages signpost"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">{t.programs.academic.subjects.languages.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t.programs.academic.subjects.languages.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mt-8"
          >
            <Button size="lg" asChild className="text-sm font-semibold">
              <Link href={`/${locale}/contact`}>{t.programs.academic.button}</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <section id="skills" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">{t.programs.skills.title}</h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              {t.programs.skills.subtitle}
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
          >
            <motion.div variants={itemVariants}>
              <Card className="p-0 border-2 hover:border-primary transition-all hover:shadow-xl h-full group overflow-hidden">
                <div className="relative h-40 w-full overflow-hidden">
                  <Image
                    src="/african-young-person-learning-coding-on-laptop-wit.jpg"
                    alt="Coding and technology skills"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">{t.programs.skills.subjects.coding.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t.programs.skills.subjects.coding.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="p-0 border-2 hover:border-primary transition-all hover:shadow-xl h-full group overflow-hidden">
                <div className="relative h-40 w-full overflow-hidden">
                  <Image
                    src="/african-student-creating-digital-art-design.jpg"
                    alt="Art and design skills"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">{t.programs.skills.subjects.art.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t.programs.skills.subjects.art.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="p-0 border-2 hover:border-primary transition-all hover:shadow-xl h-full group overflow-hidden">
                <div className="relative h-40 w-full overflow-hidden">
                  <Image
                    src="/african-student-learning-music-instrument.jpg"
                    alt="Music skills"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Music className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">{t.programs.skills.subjects.music.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t.programs.skills.subjects.music.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="p-0 border-2 hover:border-primary transition-all hover:shadow-xl h-full group overflow-hidden">
                <div className="relative h-40 w-full overflow-hidden">
                  <Image
                    src="/african-students-public-speaking-leadership.jpg"
                    alt="Life skills"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">{t.programs.skills.subjects.lifeSkills.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t.programs.skills.subjects.lifeSkills.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mt-8"
          >
            <Button size="lg" asChild className="text-sm font-semibold">
              <Link href={`/${locale}/contact`}>{t.programs.skills.button}</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid md:grid-cols-2 gap-10 items-center"
            >
              <div className="space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold">{t.programs.examPrep.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {t.programs.examPrep.subtitle}
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Award className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-base">{t.programs.examPrep.exams.gce.title}</div>
                      <div className="text-sm text-muted-foreground">{t.programs.examPrep.exams.gce.description}</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Award className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-base">{t.programs.examPrep.exams.bepc.title}</div>
                      <div className="text-sm text-muted-foreground">{t.programs.examPrep.exams.bepc.description}</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Award className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-base">{t.programs.examPrep.exams.university.title}</div>
                      <div className="text-sm text-muted-foreground">{t.programs.examPrep.exams.university.description}</div>
                    </div>
                  </li>
                </ul>
                <Button size="lg" asChild className="text-sm font-semibold">
                  <Link href={`/${locale}/contact`}>{t.programs.examPrep.button}</Link>
                </Button>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0 shadow-2xl">
                  <CardContent className="pt-8 pb-8 space-y-6 text-center">
                    <Sparkles className="h-12 w-12 text-primary-foreground mx-auto" />
                    <h3 className="text-2xl font-bold">{t.programs.examPrep.successRate.title}</h3>
                    <div className="text-6xl font-bold">{t.programs.examPrep.successRate.percentage}</div>
                    <p className="text-sm text-primary-foreground/90 leading-relaxed">
                      {t.programs.examPrep.successRate.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">{t.programs.included.title}</h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              {t.programs.included.subtitle}
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto"
          >
            <motion.div variants={itemVariants} className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-base">{t.programs.included.features.tutors.title}</h3>
              <p className="text-sm text-muted-foreground">{t.programs.included.features.tutors.description}</p>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-base">{t.programs.included.features.plans.title}</h3>
              <p className="text-sm text-muted-foreground">{t.programs.included.features.plans.description}</p>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-base">{t.programs.included.features.tracking.title}</h3>
              <p className="text-sm text-muted-foreground">{t.programs.included.features.tracking.description}</p>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-base">{t.programs.included.features.flexible.title}</h3>
              <p className="text-sm text-muted-foreground">{t.programs.included.features.flexible.description}</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-balance">{t.programs.cta.title}</h2>
            <p className="text-base text-primary-foreground/90 max-w-2xl mx-auto text-pretty">
              {t.programs.cta.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild className="text-sm font-semibold">
                <Link href={`/${locale}/contact`}>{t.programs.cta.getStarted}</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-sm font-semibold bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                <Link href={`/${locale}/how-it-works`}>{t.programs.cta.learnMore}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
