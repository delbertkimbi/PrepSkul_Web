"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { OpportunityCard } from "@/components/newyear/OpportunityCard"
import { SectionHeader } from "@/components/newyear/SectionHeader"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { useEffect, useState } from "react"
import {
  Sparkles,
  GraduationCap,
  Calendar,
  DollarSign,
  Heart,
  ArrowRight,
  Palette,
  Languages,
  Music,
  Code,
  BookOpen
} from "lucide-react"

export default function NewYearOpportunitiesPage() {
  const { scrollYProgress } = useScroll()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  // Parallax effects
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const opportunities = [
    {
      title: "Online Maths & Chemistry Tutor",
      description: "Looking for a tutor confident in teaching Maths and Chemistry online to a post-high school student.",
      location: "Online" as const,
      locationDetails: "Open to tutors from any location"
    },
    {
      title: "Online Arts Tutor (Form 5)",
      description: "Support a Form 5 student in History, Economics, Geography, and Biology.",
      location: "Online" as const,
      locationDetails: "Fully online"
    },
    {
      title: "Primary & Junior Secondary Tutor (Douala or Yaoundé)",
      description: "Support learners from Class 3 to Form 3 with Maths, English, and other subjects.",
      location: "Location-based" as const,
      locationDetails: "Douala or Yaoundé"
    },
    {
      title: "English Tutor (Limbe)",
      description: "Support a Form 2 learner with basic English, reading, and comprehension across subjects.",
      location: "Location-based" as const,
      locationDetails: "Limbe"
    }
  ]

  const benefits = [
    {
      icon: GraduationCap,
      title: "Teach subjects you are confident in",
      description: "Focus on what you know best and make a real impact"
    },
    {
      icon: Calendar,
      title: "Flexible schedules",
      description: "Work around your availability and commitments"
    },
    {
      icon: DollarSign,
      title: "Fair tutoring deals",
      description: "Competitive rates that value your expertise"
    },
    {
      icon: Heart,
      title: "Make real impact on learners",
      description: "Help students achieve their academic goals"
    }
  ]

  const howItWorksSteps = [
    "Apply as a tutor",
    "Get matched with students",
    "Start tutoring and earning"
  ]

  // Reduced to first 5 skill domains
  const skillDomains = [
    { icon: Palette, label: "Fashion design & tailoring" },
    { icon: Languages, label: "Traditional & local languages" },
    { icon: BookOpen, label: "Arts & crafts" },
    { icon: Music, label: "Music & instruments" },
    { icon: Code, label: "Coding & digital skills" }
  ]

  // Floating sparkles animation
  const FloatingSparkle = ({ delay = 0, duration = 3 }: { delay?: number; duration?: number }) => (
    <motion.div
      className="absolute"
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
        y: [0, -100],
        x: [0, Math.random() * 100 - 50]
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeOut"
      }}
    >
      <Sparkles className="h-4 w-4 text-yellow-300 drop-shadow-[0_0_8px_rgba(255,255,0,0.8)]" />
    </motion.div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
      {/* Animated background stars */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-300 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Glowing orbs that follow mouse */}
      <motion.div
        className="fixed w-96 h-96 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 rounded-full blur-3xl pointer-events-none z-0"
        animate={{
          x: mousePosition.x - 192,
          y: mousePosition.y - 192,
        }}
        transition={{ type: "spring", stiffness: 50, damping: 30 }}
      />

      <Header />

      {/* Hero Section with New Year 2026 Celebration */}
      <section className="relative py-16 sm:py-20 lg:py-28 overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/30 via-purple-600/20 to-pink-500/20"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
        
        {/* Floating light orbs */}
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.7, 0.3],
            x: [0, -40, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />

        {/* Floating sparkles */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <FloatingSparkle key={i} delay={i * 0.3} duration={3 + Math.random() * 2} />
          ))}
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="flex items-center justify-center gap-3 mb-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-8 w-8 text-yellow-300 drop-shadow-[0_0_12px_rgba(255,255,0,1)]" />
              </motion.div>
              <motion.span
                className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-primary to-pink-400 uppercase tracking-wider"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
                style={{ backgroundSize: "200% 200%" }}
              >
                New Year 2026 Opportunities
              </motion.span>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-8 w-8 text-yellow-300 drop-shadow-[0_0_12px_rgba(255,255,0,1)]" />
              </motion.div>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, type: "spring", stiffness: 100 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight"
              style={{ fontFamily: 'var(--font-sans), system-ui, sans-serif' }}
            >
              <motion.span
                className="block text-white drop-shadow-[0_0_20px_rgba(255,138,0,0.5)]"
                animate={{
                  textShadow: [
                    "0 0 20px rgba(255, 138, 0, 0.5)",
                    "0 0 40px rgba(255, 138, 0, 0.8)",
                    "0 0 20px rgba(255, 138, 0, 0.5)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Start the New Year
              </motion.span>
              <motion.span
                className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-primary to-pink-400"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
                style={{ backgroundSize: "200% 200%" }}
              >
                With Real Opportunities
              </motion.span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-xl sm:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed font-medium"
            >
              PrepSkul is opening new tutoring deals for skilled and passionate tutors ready to teach, earn, and grow.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center pt-6"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="lg" asChild className="text-lg font-bold px-10 h-14 bg-gradient-to-r from-primary via-orange-500 to-primary bg-[length:200%_200%] hover:bg-[length:100%_100%] text-white shadow-[0_0_30px_rgba(255,138,0,0.6)] hover:shadow-[0_0_40px_rgba(255,138,0,0.8)] transition-all border-2 border-yellow-300/50">
                  <Link href="https://prepskul.com/tutors">Apply as a Tutor</Link>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="text-lg font-bold px-10 h-14 bg-transparent border-3 border-white/30 hover:border-white/60 text-white backdrop-blur-sm hover:bg-white/10 transition-all shadow-lg"
                >
                  <a href="#opportunities">View Opportunities</a>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Available Opportunities Section */}
      <section id="opportunities" className="py-16 sm:py-20 relative bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,138,0,0.1),transparent_70%)]"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeader
            title="Tutoring Opportunities Available Now"
            subtitle="Explore current openings and find the perfect match for your expertise"
          />
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {opportunities.map((opp, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, rotateX: -15 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1, type: "spring" }}
                whileHover={{ scale: 1.03, y: -5 }}
                style={{ perspective: 1000 }}
              >
                <OpportunityCard
                  title={opp.title}
                  description={opp.description}
                  location={opp.location}
                  locationDetails={opp.locationDetails}
                  index={index}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Tutor with PrepSkul Section */}
      <section className="py-16 sm:py-20 relative bg-gradient-to-b from-slate-900/50 to-slate-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeader
            title="Why Tutor with PrepSkul"
            subtitle="Join a platform that values your expertise and supports your growth"
          />
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1, type: "spring" }}
                whileHover={{ scale: 1.05, y: -10, rotateY: 5 }}
                style={{ perspective: 1000 }}
              >
                <Card className="h-full border-2 border-primary/30 hover:border-primary/70 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm transition-all hover:shadow-[0_0_30px_rgba(255,138,0,0.4)] text-center group">
                  <CardContent className="p-6 space-y-4">
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-br from-primary/30 to-purple-500/30 rounded-full flex items-center justify-center mx-auto border-2 border-primary/50"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <benefit.icon className="h-8 w-8 text-primary drop-shadow-[0_0_10px_rgba(255,138,0,0.8)]" />
                    </motion.div>
                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{benefit.title}</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-20 relative bg-gradient-to-b from-slate-800/50 to-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeader
            title="How It Works"
            subtitle="Simple steps to start your tutoring journey"
          />
          
          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              {howItWorksSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: index * 0.2, type: "spring" }}
                  whileHover={{ x: 10, scale: 1.02 }}
                  className="flex items-center gap-4 p-6 bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-xl border-2 border-primary/30 hover:border-primary/70 transition-all group shadow-lg hover:shadow-[0_0_30px_rgba(255,138,0,0.3)]"
                >
                  <motion.div
                    className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-primary to-orange-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-[0_0_20px_rgba(255,138,0,0.6)]"
                    whileHover={{ rotate: 360, scale: 1.2 }}
                    transition={{ duration: 0.6 }}
                  >
                    {index + 1}
                  </motion.div>
                  <p className="text-lg font-semibold text-white flex-1 group-hover:text-primary transition-colors">{step}</p>
                  {index < howItWorksSteps.length - 1 && (
                    <motion.div
                      animate={{ x: [0, 10, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="h-6 w-6 text-primary drop-shadow-[0_0_10px_rgba(255,138,0,0.8)] flex-shrink-0" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* More Opportunities Beyond Academics Section */}
      <section className="py-16 sm:py-20 relative bg-gradient-to-b from-slate-900/50 to-slate-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeader
            title="And That's Just the Beginning…"
            subtitle="Beyond the opportunities listed above, PrepSkul regularly connects learners with tutors across many other skills and domains."
          />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto mb-8"
          >
            <p className="text-lg text-gray-200 text-center leading-relaxed mb-6">
              If you can teach or mentor in any of the areas below (and more), we encourage you to register today.
            </p>
          </motion.div>

          {/* Skill Domains Grid - Only first 5 */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 max-w-6xl mx-auto mb-10">
            {skillDomains.map((skill, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1, type: "spring" }}
                whileHover={{ scale: 1.1, rotate: 5, y: -10 }}
                className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl border-2 border-primary/30 hover:border-primary/70 transition-all group shadow-lg hover:shadow-[0_0_30px_rgba(255,138,0,0.4)]"
              >
                <motion.div
                  className="w-14 h-14 bg-gradient-to-br from-primary/30 to-purple-500/30 rounded-xl flex items-center justify-center border-2 border-primary/50 mb-2"
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.6 }}
                >
                  <skill.icon className="h-7 w-7 text-primary drop-shadow-[0_0_10px_rgba(255,138,0,0.8)]" />
                </motion.div>
                <span className="text-sm font-medium text-white text-center group-hover:text-primary transition-colors">
                  {skill.label}
                </span>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button size="lg" asChild className="text-lg font-bold px-10 h-14 bg-gradient-to-r from-primary via-orange-500 to-primary bg-[length:200%_200%] hover:bg-[length:100%_100%] text-white shadow-[0_0_30px_rgba(255,138,0,0.6)] hover:shadow-[0_0_40px_rgba(255,138,0,0.8)] transition-all border-2 border-yellow-300/50 mb-3">
                <Link href="https://prepskul.com/tutors">Register as a Tutor</Link>
              </Button>
            </motion.div>
            <p className="text-sm text-gray-400 mt-3">
              New opportunities are added regularly across different skill areas.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 sm:py-24 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary via-purple-600 to-pink-600"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]"></div>
        
        {/* Floating stars */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-yellow-300 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.5, 1],
                rotate: 360,
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: "spring" }}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <motion.h2
              className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-white drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]"
              animate={{
                textShadow: [
                  "0 0 20px rgba(255, 255, 255, 0.5)",
                  "0 0 40px rgba(255, 255, 255, 0.8)",
                  "0 0 20px rgba(255, 255, 255, 0.5)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Make 2026 the year where your skills create impact and income.
            </motion.h2>
            <motion.p
              className="text-xl sm:text-2xl text-white/90 leading-relaxed font-medium"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              Join PrepSkul today and start making a difference in students' lives while building your tutoring career.
            </motion.p>
            <motion.div
              className="pt-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="text-lg font-bold px-10 h-14 bg-white text-primary hover:bg-gray-100 shadow-[0_0_40px_rgba(255,255,255,0.5)] hover:shadow-[0_0_60px_rgba(255,255,255,0.7)] transition-all border-2 border-yellow-300"
              >
                <Link href="https://prepskul.com/tutors">Become a PrepSkul Tutor</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
