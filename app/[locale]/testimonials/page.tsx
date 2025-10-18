import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { TestimonialsSection } from "@/components/testimonials-section"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Star, TrendingUp, Award, Heart } from "lucide-react"

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance">
              Success <span className="text-accent">Stories</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground text-pretty">
              Hear from students, parents, and tutors who have experienced the transformative power of personalized
              learning with PrepSkul.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="pt-6 text-center space-y-2">
                <TrendingUp className="h-8 w-8 mx-auto" />
                <div className="text-4xl font-bold">95%</div>
                <div className="text-sm text-primary-foreground/90">Improved Grades</div>
              </CardContent>
            </Card>

            <Card className="bg-accent text-accent-foreground">
              <CardContent className="pt-6 text-center space-y-2">
                <Award className="h-8 w-8 mx-auto" />
                <div className="text-4xl font-bold">500+</div>
                <div className="text-sm text-accent-foreground/90">Students Helped</div>
              </CardContent>
            </Card>

            <Card className="bg-primary text-primary-foreground">
              <CardContent className="pt-6 text-center space-y-2">
                <Heart className="h-8 w-8 mx-auto" />
                <div className="text-4xl font-bold">4.9</div>
                <div className="text-sm text-primary-foreground/90">Average Rating</div>
              </CardContent>
            </Card>

            <Card className="bg-accent text-accent-foreground">
              <CardContent className="pt-6 text-center space-y-2">
                <Star className="h-8 w-8 mx-auto" />
                <div className="text-4xl font-bold">98%</div>
                <div className="text-sm text-accent-foreground/90">Satisfaction Rate</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Impact Stories */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Impact Stories</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real transformations that show the power of guidance and mentorship
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            <Card className="border-2">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">From Struggling to Thriving</h3>
                    <p className="text-muted-foreground">
                      "I was failing mathematics and felt like giving up. My PrepSkul tutor didn't just teach me
                      formulas - they taught me how to think, how to approach problems, and most importantly, they
                      believed in me. Within three months, I went from a D to an A. But more than the grade, I gained
                      confidence in myself."
                    </p>
                    <div className="text-sm font-semibold text-primary">- David Nkeng, Form 4 Student</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="h-8 w-8 text-accent" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">A Parent's Perspective</h3>
                    <p className="text-muted-foreground">
                      "As a single mother working two jobs, I couldn't always help my children with homework. PrepSkul
                      became more than just tutoring - it became a support system for our family. My kids now look
                      forward to their sessions, and I've seen them grow not just academically but as confident young
                      people."
                    </p>
                    <div className="text-sm font-semibold text-accent">- Beatrice Fon, Parent of Two</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Discovering New Passions</h3>
                    <p className="text-muted-foreground">
                      "I joined PrepSkul for help with science, but my tutor introduced me to coding. Now I'm building
                      apps and considering a career in technology. PrepSkul didn't just help me pass exams - they helped
                      me discover what I'm passionate about and who I want to become."
                    </p>
                    <div className="text-sm font-semibold text-primary">- Sandra Ayuk, Upper Sixth Student</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-accent text-accent-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">Ready to Write Your Success Story?</h2>
          <p className="text-lg text-accent-foreground/90 mb-8 max-w-2xl mx-auto text-pretty">
            Join hundreds of learners who are achieving their goals with PrepSkul
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/contact">Start Your Journey</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
