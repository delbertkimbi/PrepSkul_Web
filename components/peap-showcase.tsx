"use client"
import { getStartedUrl } from "@/lib/get-started-url"
import Image from "next/image"
import Link from "next/link"
import { Users, Globe, Calendar, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface PEAPShowcaseProps {
  locale: string
}

export function PEAPShowcase({ locale }: PEAPShowcaseProps) {
  const stats = [
    {
      icon: Users,
      value: "500+",
      label: "Learners Empowered",
    },
    {
      icon: Globe,
      value: "Nationwide",
      label: "Across Cameroon",
    },
    {
      icon: Calendar,
      value: "2 Weeks",
      label: "Intensive Program",
    },
    {
      icon: Gift,
      value: "100% Free",
      label: "No Cost to Students",
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-white to-primary/10 border-y">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-14">
          {/* Logo Placeholder */}
          <div className="flex justify-center mb-6">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden shadow-lg border bg-white">
              <Image
                src="/peaplogo.jpg"
                alt="PrepSkul Exam Accelerator Program Logo"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            National Impact Initiative
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            PrepSkul Exam Accelerator Program (PEAP)
          </h2>

          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            A free two-week nationwide revision program designed to help O-Level
            and A-Level candidates master difficult concepts, build confidence,
            and prepare strategically for the 2025/2026 GCE examinations.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-14">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card
                key={index}
                className="border-2 hover:border-primary transition-all hover:shadow-lg"
              >
                <CardContent className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 leading-tight break-words">
                    {stat.value}
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Description + Images */}
        <div className="grid lg:grid-cols-2 gap-10 items-center max-w-6xl mx-auto mb-14">
          {/* Text */}
          <div className="space-y-5">
            <h3 className="text-2xl sm:text-3xl font-bold">
              Turning Exam Anxiety into Academic Confidence
            </h3>

            <p className="text-muted-foreground leading-relaxed">
              PEAP was launched in March 2026 as a strategic initiative to
              support examination candidates across Cameroon. The program
              simplified complex topics, provided structured revision guidance,
              and expanded PrepSkul’s national visibility.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              Beyond exam preparation, PEAP demonstrated the real impact of
              technology-enabled education and helped thousands discover
              PrepSkul’s mission of connecting learners with trusted tutors.
            </p>

          </div>

          {/* Photos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div className="relative h-[340px] rounded-3xl overflow-hidden ">
              <Image
                src="/program2.jpg"
                alt="Students participating in PEAP session"
                fill
                className="object-contain  group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="relative bg-white rounded-3xl overflow-hidden  mt-10">
              <Image
                src="/program1.jpg"
                alt="Learners engaged during PEAP program"
                fill
                className=" group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
          
        </div>
      </div>
    </section>
  )
}