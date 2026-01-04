"use client"

import { AmbassadorHeader } from "@/components/ambassador-header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { InfoCard } from "@/components/ambassadors/InfoCard"
import Link from "next/link"
import Image from "next/image"
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
      description: "Be the Voice of PrepSkul in your school, community, and online network."
    },
    {
      icon: Share2,
      title: "Spread the Word",
      description: "Talk about PrepSkul, our opportunities and spread updates"
    },
    {
      icon: UserCheck,
      title: "Help Others Join",
      description: "Guide students, parents, and tutors through joining PrepSkul and help them understand how the platform works"
    }
  ]

  const benefits = [
    {
      icon: Award,
      title: "Get Recognized",
      description: "Compete for PrepSkul Ambassador of the Month and Annual PrepSkul Ambassador Awards!"
    },
    
    {
      icon: TrendingUp,
      title: "Get Featured",
      description: "See yourself on PrepSkul's social media and community channels. Your impact deserves the spotlight!"
    },
    {
      icon: BookOpen,
      title: "Level Up Your Skills",
      description: "Access free skill sessions and learning events. Grow personally and professionally with PrepSkul!"
    },
    {
      icon: School,
      title: "Unlock Scholarships",
      description: "Get exclusive access to scholarship opportunities with detailed info, eligibility criteria, and application guidance!"
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
      <AmbassadorHeader />

      {/* Hero Section - Compact with White Background */}
      <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden bg-white">
        {/* Subtle animated background elements */}
        <div className="absolute inset-0 opacity-[0.02]">
          <motion.div
            className="absolute top-20 left-10 w-64 h-64 bg-primary rounded-full blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-80 h-80 bg-primary rounded-full blur-3xl"
            animate={{
              x: [0, -40, 0],
              y: [0, -50, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-20 items-center max-w-7xl mx-auto">
            {/* Text Content - Centered on mobile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6 text-center lg:text-left"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
                Ready to Make an Impact?
                <span className="block text-primary mt-2">Join the PrepSkul Ambassador Team</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-700 leading-relaxed font-medium max-w-2xl mx-auto lg:mx-0">
                Join a vibrant community of passionate changemakers transforming education and expanding access to learning opportunities across Cameroon.
              </p>
              
              <div className="pt-2 flex justify-center lg:justify-start">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button size="lg" asChild className="text-base font-semibold px-8 h-12 shadow-md hover:shadow-lg transition-all bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link href="/ambassadors/apply">Apply Now</Link>
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* Ambassador Image - Larger on Desktop, Steady (No Animation) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative flex items-center justify-center lg:order-last"
            >
              <div className="relative">
                <Image
                  src="/ambs.png"
                  alt="PrepSkul Ambassadors"
                  width={1200}
                  height={1200}
                  className="w-full h-auto max-w-sm sm:max-w-md md:max-w-lg lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl mx-auto"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Your Ambassador Journey Section */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 max-w-3xl mx-auto"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            What It Means To Be A PrepSkul Ambassador
            </h2>
           
            <p className="text-base text-gray-700 leading-relaxed max-w-2xl mx-auto">
              As a PrepSkul Ambassador, you'll be the bridge connecting students, parents, and tutors to life-changing educational opportunities.
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

      {/* Why You'll Love Being an Ambassador Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 max-w-3xl mx-auto"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Benefits of Being a PrepSkul Ambassador
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Amazing perks, incredible opportunities, and a community that celebrates you
            </p>
          </motion.div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto justify-items-center">
            {benefits.map((benefit, index) => (
              <div key={index} className="w-full max-w-sm">
                <InfoCard
                  icon={benefit.icon}
                  title={benefit.title}
                  description={benefit.description}
                  index={index}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ideal Candidates Section */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center space-y-8"
          >
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                Who We Are Looking For
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
                We're looking for driven, curious individuals who believe education can transform lives. If that sounds like you, we'd love to have you on board.
              </p>
            </div>
         
          </motion.div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section id="apply" className="py-20 sm:py-24 bg-secondary text-secondary-foreground relative overflow-hidden">
        {/* Subtle animated background elements */}
        <div className="absolute inset-0 opacity-5">
          <motion.div
            className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"
            animate={{
              scale: [1, 1.4, 1],
              x: [0, -40, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
              Ready to Change Lives?
            </h2>
            <p className="text-lg sm:text-xl text-secondary-foreground/90 leading-relaxed">
              Join our ambassador community and be part of something truly meaningful. Your journey starts now.
            </p>
            <div className="pt-4">
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="text-base font-semibold px-8 h-12 bg-white text-primary hover:bg-primary-foreground/10 shadow-xl hover:shadow-2xl transition-all"
              >
                <Link href="/ambassadors/apply">Apply Now and Start Making Impact</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
