import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Search, UserCheck, Calendar, Video, CheckCircle, DollarSign, Clock, Sparkles } from "lucide-react"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance">
              How <span className="text-accent">PrepSkul</span> Works
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground text-pretty">
              Getting started with PrepSkul is simple. Follow these easy steps to connect with a qualified tutor and
              begin your learning journey.
            </p>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Step 1 */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4 order-2 md:order-1">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl">
                  1
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold">Tell Us What You Need</h3>
                <p className="text-muted-foreground">
                  Share your learning goals, subjects you need help with, and your preferred learning style. Whether
                  it's academic tutoring or skill development, we'll match you with the right tutor.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">Academic Support</span>
                  <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">Skill Training</span>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">Exam Prep</span>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-2">
                  <CardContent className="pt-6 flex items-center justify-center h-64">
                    <Search className="h-24 w-24 text-primary" />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Step 2 */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="order-1">
                <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border-2">
                  <CardContent className="pt-6 flex items-center justify-center h-64">
                    <UserCheck className="h-24 w-24 text-accent" />
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-4 order-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent text-accent-foreground font-bold text-xl">
                  2
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold">Get Matched with a Tutor</h3>
                <p className="text-muted-foreground">
                  We'll connect you with a qualified, vetted tutor who specializes in your subject area. All our tutors
                  are experienced educators passionate about helping students succeed.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <span className="text-sm text-muted-foreground">All tutors are verified and background-checked</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4 order-2 md:order-1">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl">
                  3
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold">Schedule Your Sessions</h3>
                <p className="text-muted-foreground">
                  Choose a schedule that works for you. Whether you prefer morning, afternoon, or evening sessions,
                  we'll accommodate your availability. Sessions can be rescheduled if needed.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Flexible scheduling to fit your routine</span>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-2">
                  <CardContent className="pt-6 flex items-center justify-center h-64">
                    <Calendar className="h-24 w-24 text-primary" />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Step 4 */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="order-1">
                <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border-2">
                  <CardContent className="pt-6 flex items-center justify-center h-64">
                    <Sparkles className="h-24 w-24 text-accent" />
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-4 order-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent text-accent-foreground font-bold text-xl">
                  4
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold">Start Learning & Growing</h3>
                <p className="text-muted-foreground">
                  Begin your personalized learning journey. Track your progress, receive feedback, and watch yourself
                  grow academically and personally with dedicated guidance.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <span className="text-sm text-muted-foreground">Regular progress updates and feedback</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Options */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Choose Your Learning Style</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We offer flexible learning options to match your preferences and schedule
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Video className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-xl">Online Learning</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with tutors from anywhere via video sessions. Perfect for busy schedules and remote learning.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Learn from home</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Access to wider tutor pool</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Recorded sessions available</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-accent transition-colors bg-accent text-accent-foreground">
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 bg-accent-foreground/10 rounded-full flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="font-semibold text-xl">Home Tutoring</h3>
                <p className="text-sm text-accent-foreground/90">
                  Personalized one-on-one sessions at your location. Get focused attention in a comfortable environment.
                </p>
                <ul className="space-y-2 text-sm text-accent-foreground/90">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-accent-foreground mt-0.5 flex-shrink-0" />
                    <span>Face-to-face interaction</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-accent-foreground mt-0.5 flex-shrink-0" />
                    <span>Personalized attention</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-accent-foreground mt-0.5 flex-shrink-0" />
                    <span>Comfortable learning space</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-xl">Group Sessions</h3>
                <p className="text-sm text-muted-foreground">
                  Learn together with peers in small groups. Collaborative learning at an affordable price.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Peer learning benefits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>More affordable option</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Build study community</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Affordability Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl sm:text-4xl font-bold">Affordable & Flexible</h2>
                <p className="text-muted-foreground">
                  Quality education shouldn't break the bank. We offer competitive pricing with flexible payment options
                  to make learning accessible to everyone.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <DollarSign className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">Pay As You Go</div>
                      <div className="text-sm text-muted-foreground">No long-term commitments required</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">Flexible Scheduling</div>
                      <div className="text-sm text-muted-foreground">Book sessions that fit your calendar</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">Money-Back Guarantee</div>
                      <div className="text-sm text-muted-foreground">Not satisfied? Get a full refund</div>
                    </div>
                  </li>
                </ul>
              </div>

              <Card className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                <CardContent className="pt-6 space-y-6">
                  <h3 className="text-2xl font-bold">Ready to Get Started?</h3>
                  <p className="text-primary-foreground/90">
                    Join hundreds of learners who are already achieving their goals with PrepSkul
                  </p>
                  <Button size="lg" variant="secondary" asChild className="w-full">
                    <Link href="/contact">Start Learning Today</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
