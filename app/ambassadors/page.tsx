"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { InfoCard } from "@/components/ambassadors/InfoCard"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Users,
  Share2,
  UserCheck,
  Award,
  Gift,
  TrendingUp,
  BookOpen,
  GraduationCap,
  Users2,
  Heart,
  School
} from "lucide-react"

export default function AmbassadorsPage() {
  const ambassadorDuties = [
    {
      icon: Users,
      title: "Represent PrepSkul",
      description: "Act as a trusted voice of PrepSkul within your school, community, or network."
    },
    {
      icon: Share2,
      title: "Share PrepSkul Opportunities",
      description: "Help spread awareness about tutoring opportunities, programs, and updates."
    },
    {
      icon: UserCheck,
      title: "Support Onboarding",
      description: "Assist students, parents, and tutors in understanding and joining the platform."
    }
  ]

  const benefits = [
    {
      icon: Award,
      title: "Recognition & Awards",
      description: "Stand a chance to win Ambassador of the Month and Annual Ambassador Awards."
    },
    {
      icon: Gift,
      title: "Exclusive PrepSkul Packages",
      description: "Receive PrepSkul-branded incentives and special ambassador perks."
    },
    {
      icon: TrendingUp,
      title: "Spotlight & Visibility",
      description: "Be featured on PrepSkul's social media platforms and community channels."
    },
    {
      icon: BookOpen,
      title: "Skill Growth",
      description: "Get free access to skill sessions and learning events organized by the PrepSkul team."
    },
    {
      icon: School,
      title: "Scholarship Opportunities",
      description: "PrepSkul shares exclusive scholarship opportunities with ambassadors. Access information about available scholarships, eligibility criteria, and step-by-step application guidance through our dedicated ambassador portal."
    }
  ]

  const whoShouldApply = [
    { icon: GraduationCap, label: "Students" },
    { icon: Users2, label: "Tutors" },
    { icon: Heart, label: "Community leaders" },
    { icon: Users, label: "Anyone passionate about learning and opportunity" }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 lg:py-28 overflow-hidden bg-gradient-to-br from-gray-50 to-white">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Become a <span className="text-primary">PrepSkul Ambassador</span>
              </h1>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            >
              Join a growing community of passionate individuals helping PrepSkul expand access to learning opportunities.
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed"
            >
              PrepSkul Ambassadors represent our mission in schools, communities, and online — helping students, parents, and tutors discover meaningful opportunities.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="pt-4"
            >
              <Button size="lg" asChild className="text-lg font-semibold px-8 h-12 shadow-lg hover:shadow-xl transition-all">
                <Link href="/ambassadors/apply">Apply as an Ambassador</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What PrepSkul Ambassadors Do Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              What You'll Do as a PrepSkul Ambassador
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple, human, and practical ways to make a real impact
            </p>
          </motion.div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {ambassadorDuties.map((duty, index) => (
              <InfoCard
                key={index}
                icon={duty.icon}
                title={duty.title}
                description={duty.description}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why Become a PrepSkul Ambassador Section */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              What PrepSkul Has for You
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Growth, recognition, and long-term value for our ambassadors
            </p>
          </motion.div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
            {benefits.map((benefit, index) => (
              <InfoCard
                key={index}
                icon={benefit.icon}
                title={benefit.title}
                description={benefit.description}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Who Should Apply Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center space-y-8"
          >
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Who This Is For
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                We're looking for curious, driven individuals who believe in education and community.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
              {whoShouldApply.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-col items-center gap-3 p-6 bg-gray-50 rounded-xl border-2 border-transparent hover:border-primary/30 transition-all group"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 text-center group-hover:text-primary transition-colors">
                    {item.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section id="apply" className="py-20 sm:py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Help PrepSkul reach further — and grow with us along the way.
            </h2>
            <p className="text-lg sm:text-xl text-primary-foreground/90 leading-relaxed">
              Join our ambassador community and be part of something meaningful.
            </p>
            <div className="pt-4">
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="text-lg font-semibold px-8 h-12 bg-white text-primary hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all"
              >
                <Link href="/ambassadors/apply">Apply as an Ambassador</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

