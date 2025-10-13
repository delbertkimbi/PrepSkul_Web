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
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center space-y-5"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance">
              Our <span className="text-primary">Programs</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground text-pretty">
              From academic excellence to skill mastery, we offer comprehensive programs designed to help every learner
              reach their full potential.
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
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Academic Tutoring</h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Master your subjects with personalized guidance from expert tutors
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
                    <h3 className="font-semibold text-lg">Mathematics</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Algebra, Geometry, Calculus, Statistics. All levels from primary to university.
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
                    <h3 className="font-semibold text-lg">Sciences</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Physics, Chemistry, Biology. Hands-on learning with practical applications.
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
                    <h3 className="font-semibold text-lg">English</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Reading, writing, grammar, literature. Build strong communication skills.
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
                    <h3 className="font-semibold text-lg">Languages</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    French, Spanish, and more. Conversational and academic language learning.
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
              <Link href="/contact">Get Academic Support</Link>
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
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Skill Development</h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Learn practical skills that prepare you for the future
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
                    <h3 className="font-semibold text-lg">Coding & Tech</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Programming, web development, and digital literacy for the modern world.
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
                    <h3 className="font-semibold text-lg">Art & Design</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Explore creativity through drawing, painting, graphic design, and more.
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
                    <h3 className="font-semibold text-lg">Music</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Learn instruments, music theory, and develop your musical talents.
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
                    <h3 className="font-semibold text-lg">Life Skills</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Build leadership, communication, and personal development skills.
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
              <Link href="/contact">Start Skill Development</Link>
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
                <h2 className="text-3xl sm:text-4xl font-bold">Exam Preparation</h2>
                <p className="text-sm text-muted-foreground">
                  Get ready for your most important exams with focused preparation and proven strategies.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Award className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-base">GCE O/A Level</div>
                      <div className="text-sm text-muted-foreground">Comprehensive exam preparation</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Award className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-base">BEPC & Baccalauréat</div>
                      <div className="text-sm text-muted-foreground">Targeted practice and review</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Award className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-base">University Entrance</div>
                      <div className="text-sm text-muted-foreground">Prepare for competitive admissions</div>
                    </div>
                  </li>
                </ul>
                <Button size="lg" asChild className="text-sm font-semibold">
                  <Link href="/contact">Prepare for Your Exam</Link>
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
                    <h3 className="text-2xl font-bold">Success Rate</h3>
                    <div className="text-6xl font-bold">95%</div>
                    <p className="text-sm text-primary-foreground/90 leading-relaxed">
                      of our students pass their exams with improved grades after working with PrepSkul tutors
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
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">What's Included</h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Every program comes with comprehensive support
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
              <h3 className="font-semibold text-base">Qualified Tutors</h3>
              <p className="text-sm text-muted-foreground">Expert educators in their fields</p>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-base">Personalized Plans</h3>
              <p className="text-sm text-muted-foreground">Tailored to your learning needs</p>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-base">Progress Tracking</h3>
              <p className="text-sm text-muted-foreground">Regular feedback and updates</p>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-base">Flexible Learning</h3>
              <p className="text-sm text-muted-foreground">Online, home, or group options</p>
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
            <h2 className="text-3xl sm:text-4xl font-bold text-balance">Ready to Start Your Program?</h2>
            <p className="text-base text-primary-foreground/90 max-w-2xl mx-auto text-pretty">
              Choose the program that fits your goals and start learning today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild className="text-sm font-semibold">
                <Link href="/contact">Get Started</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-sm font-semibold bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                <Link href="/how-it-works">Learn How It Works</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
