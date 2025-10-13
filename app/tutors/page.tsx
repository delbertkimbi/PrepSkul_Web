import { CardContent } from "@/components/ui/card"
import { Card } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DollarSign, Users, BookOpen, TrendingUp, Calendar, Award, Heart, Sparkles } from "lucide-react"

export default function TutorsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-accent/10 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance">
              Become a <span className="text-accent">PrepSkul</span> Tutor
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground text-pretty">
              Share your knowledge, inspire learners, and build a rewarding career. Join our community of passionate
              educators making a real difference across Cameroon and Africa.
            </p>
            <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/contact">Apply Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Teach with PrepSkul */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Teach with PrepSkul?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join a platform that values your expertise and supports your growth
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-xl">Competitive Pay</h3>
                <p className="text-sm text-muted-foreground">
                  Earn competitive rates for your expertise. Set your own rates and get paid on time, every time.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-accent transition-colors">
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-xl">Steady Students</h3>
                <p className="text-sm text-muted-foreground">
                  We match you with committed learners who are serious about their education and personal growth.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-xl">Flexible Schedule</h3>
                <p className="text-sm text-muted-foreground">
                  Choose when and how much you want to teach. Perfect for full-time or part-time work.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-accent transition-colors">
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-xl">Training Support</h3>
                <p className="text-sm text-muted-foreground">
                  Access professional development resources and training to enhance your teaching skills.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-xl">Career Growth</h3>
                <p className="text-sm text-muted-foreground">
                  Build your reputation, expand your network, and grow your tutoring career with PrepSkul.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-accent transition-colors">
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <Heart className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-xl">Make an Impact</h3>
                <p className="text-sm text-muted-foreground">
                  Transform lives through education and mentorship. See the real difference you make every day.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h2 className="text-3xl sm:text-4xl font-bold">What We're Looking For</h2>
                <p className="text-muted-foreground">
                  We seek passionate educators who are committed to student success and personal growth.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Award className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">Qualified Educators</div>
                      <div className="text-sm text-muted-foreground">Degree or certification in your subject area</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Heart className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">Passion for Teaching</div>
                      <div className="text-sm text-muted-foreground">Genuine desire to help students succeed</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Users className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">Strong Communication</div>
                      <div className="text-sm text-muted-foreground">Ability to explain concepts clearly</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Sparkles className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">Reliability</div>
                      <div className="text-sm text-muted-foreground">Commitment to scheduled sessions</div>
                    </div>
                  </li>
                </ul>
              </div>

              <Card className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                <CardContent className="pt-6 space-y-6">
                  <h3 className="text-2xl font-bold">Application Process</h3>
                  <ol className="space-y-4 text-primary-foreground/90">
                    <li className="flex gap-3">
                      <span className="font-bold">1.</span>
                      <span>Submit your application with credentials</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold">2.</span>
                      <span>Complete a brief interview</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold">3.</span>
                      <span>Pass a background check</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold">4.</span>
                      <span>Complete onboarding training</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold">5.</span>
                      <span>Start teaching and making an impact!</span>
                    </li>
                  </ol>
                  <Button size="lg" variant="secondary" asChild className="w-full">
                    <Link href="/contact">Apply to Teach</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Subjects We Need */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Subjects We Need Tutors For</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're always looking for qualified tutors in these high-demand areas
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">Mathematics</h4>
                <p className="text-sm text-muted-foreground">All levels, from basic to advanced</p>
              </CardContent>
            </Card>
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">Sciences</h4>
                <p className="text-sm text-muted-foreground">Physics, Chemistry, Biology</p>
              </CardContent>
            </Card>
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">Languages</h4>
                <p className="text-sm text-muted-foreground">English, French, and more</p>
              </CardContent>
            </Card>
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">Coding</h4>
                <p className="text-sm text-muted-foreground">Programming and web development</p>
              </CardContent>
            </Card>
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">Arts</h4>
                <p className="text-sm text-muted-foreground">Music, drawing, and creative skills</p>
              </CardContent>
            </Card>
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">Business</h4>
                <p className="text-sm text-muted-foreground">Economics, accounting, finance</p>
              </CardContent>
            </Card>
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">Test Prep</h4>
                <p className="text-sm text-muted-foreground">GCE, BEPC, and university entrance</p>
              </CardContent>
            </Card>
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">Life Skills</h4>
                <p className="text-sm text-muted-foreground">Leadership, communication, more</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-accent text-accent-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">Ready to Make a Difference?</h2>
          <p className="text-lg text-accent-foreground/90 mb-8 max-w-2xl mx-auto text-pretty">
            Join PrepSkul today and start inspiring the next generation of learners
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/contact">Apply to Become a Tutor</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
