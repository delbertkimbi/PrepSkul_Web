import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { TrendingUp, Heart, Shield, Users, Globe } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance">
              We Believe <span className="text-accent">Guidance</span> Builds{" "}
              <span className="text-primary">Greatness</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground text-pretty">
              PrepSkul is more than a tutoring platform. We're a movement dedicated to unlocking the potential of every
              learner across Cameroon and Africa.
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
                <h2 className="text-3xl sm:text-4xl font-bold">Our Story</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    PrepSkul was born from a simple observation: every learner has unique potential waiting to be
                    discovered. But too often, traditional education systems fail to provide the personalized guidance
                    needed to unlock that potential.
                  </p>
                  <p>
                    We created PrepSkul to bridge this gap. By connecting learners with qualified tutors and mentors who
                    truly care, we're building a community where every student can thrive academically and personally.
                  </p>
                  <p>
                    Our platform goes beyond just academic tutoring. We focus on mentorship, mindset building, and
                    personal growth, helping learners not only perform better in school but also discover who they can
                    become.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="relative aspect-square rounded-2xl overflow-hidden">
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
            <h2 className="text-3xl sm:text-4xl font-bold">Our Mission</h2>
            <p className="text-xl text-primary-foreground/90 text-balance">
              To be part of the world's revolution in learning by helping every learner discover their potential through
              mentorship, guidance, and skill development.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Core Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              These principles guide everything we do at PrepSkul
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-xl">Growth</h3>
                <p className="text-sm text-muted-foreground">
                  We believe in continuous improvement and helping every learner reach new heights through dedicated
                  support and encouragement.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-accent transition-colors">
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <Heart className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-xl">Trust</h3>
                <p className="text-sm text-muted-foreground">
                  We build lasting relationships based on trust, transparency, and genuine care for each learner's
                  success and well-being.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-xl">Accountability</h3>
                <p className="text-sm text-muted-foreground">
                  We hold ourselves and our tutors to the highest standards, ensuring quality education and measurable
                  results.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-accent transition-colors">
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <Globe className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-xl">Accessibility</h3>
                <p className="text-sm text-muted-foreground">
                  Quality education should be available to everyone. We make learning affordable and accessible across
                  Cameroon and Africa.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-xl">Community</h3>
                <p className="text-sm text-muted-foreground">
                  We're building a supportive learning community where students, tutors, and families grow together.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-accent transition-colors bg-accent text-accent-foreground">
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 bg-accent-foreground/10 rounded-full flex items-center justify-center">
                  <Heart className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="font-semibold text-xl">Excellence</h3>
                <p className="text-sm text-accent-foreground/90">
                  We strive for excellence in everything we do, from tutor selection to learning experiences and student
                  outcomes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">Join Our Growing Community</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Whether you're a learner seeking guidance or a tutor ready to make an impact, there's a place for you at
            PrepSkul
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/contact">Start Learning</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/tutors">Become a Tutor</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
