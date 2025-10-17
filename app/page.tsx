import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Typewriter } from "@/components/typewriter"
import { TestimonialsSection } from "@/components/testimonials-section"
import { FAQSection } from "@/components/faq-section"
import { PhoneMockup } from "@/components/phone-mockup"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { CheckCircle2, BookOpen, TrendingUp } from "lucide-react"
import { AnimatedCounter } from "@/components/animated-counter"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white hero-section-full">
        <div
          className="decorative-circle hidden lg:block"
          style={{ width: "200px", height: "200px", top: "10%", left: "5%" }}
        ></div>
        <div
          className="decorative-circle hidden lg:block"
          style={{ width: "150px", height: "150px", bottom: "15%", left: "10%" }}
        ></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center h-full max-w-7xl mx-auto">
            {/* Left side - Content */}
            <div className="space-y-7 z-10 lg:pr-8 text-left lg:text-left">
              <div className="space-y-5">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
                  Find Your Perfect{" "}
                  <span className="text-primary block mt-2">
                    <Typewriter words={["Tutor", "Mentor", "Guide"]} />
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
                  Connect with experienced, qualified tutors across Cameroon for personalized learning. Whether online
                  or at home, one-on-one or in groups, we help you achieve academic excellence.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" asChild className="w-full sm:w-auto text-base font-semibold h-12 px-8">
                  <Link href="/contact">Get Started</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="w-full sm:w-auto text-base font-semibold h-12 px-8 bg-transparent"
                >
                  <Link href="/programs">View Subjects</Link>
                </Button>
              </div>
            </div>

            <div className="relative lg:min-h-[600px] flex items-center justify-center">
              <div
                className="hero-circular-shape-large hidden lg:block"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              ></div>

              <div className="relative z-10 flex justify-center">
                <PhoneMockup />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-y">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-2">
              <div className="text-4xl sm:text-5xl font-bold text-primary">
                <AnimatedCounter end={100} suffix="+" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">Learners Guided</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl sm:text-5xl font-bold text-primary">
                <AnimatedCounter end={50} suffix="+" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">Expert Tutors</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl sm:text-5xl font-bold text-primary">
                <AnimatedCounter end={15} suffix="+" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">Subjects Covered</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl sm:text-5xl font-bold text-primary">
                <AnimatedCounter end={7} suffix="+" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">Cities covered</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Flexible Learning Options</h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Choose the learning style that works best for you. All options include personalized attention and progress
              tracking.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="p-0 border-2 hover:border-primary transition-all hover:shadow-xl overflow-hidden group">
              <div className="relative h-56 w-full overflow-hidden">
                <Image
                  src="/african-student-learning-online-via-video-call-wit.jpg"
                  alt="Student learning online via video call with tutor"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-5 space-y-2">
                <h3 className="font-bold text-xl">Online Sessions</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Connect with tutors from anywhere in Cameroon via video call. Perfect for busy schedules with flexible
                  timing and no travel required.
                </p>
              </CardContent>
            </Card>

            <Card className="p-0 border-2 hover:border-primary transition-all hover:shadow-xl overflow-hidden group">
              <div className="relative h-56 w-full overflow-hidden">
                <Image
                  src="/african-tutor-teaching-student-at-home-with-books-.jpg"
                  alt="Tutor teaching student at home with personalized attention"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-5 space-y-2">
                <h3 className="font-bold text-xl">Home Tutoring</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Get personalized, one-on-one attention in the comfort of your home. Our tutors come to you with
                  tailored lesson plans and materials.
                </p>
              </CardContent>
            </Card>

            <Card className="p-0 border-2 hover:border-primary transition-all hover:shadow-xl overflow-hidden group">
              <div className="relative h-56 w-full overflow-hidden">
                <Image
                  src="/group-class-prepskul.png"
                  alt="Group of students learning together collaboratively"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-5 space-y-2">
                <h3 className="font-bold text-xl">Group Classes</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Learn together with peers in small groups. Collaborative learning at affordable rates with interactive
                  sessions and peer support.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Comprehensive Learning Programs</h2>
            <p className="text-base text-muted-foreground max-w-3xl mx-auto">
              From core academic subjects to practical life skills, we offer tutoring across all areas to help you
              succeed.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            <Card className="p-0 overflow-hidden border-2 hover:border-primary transition-all hover:shadow-xl group">
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src="/african-student-studying-mathematics-and-science-w.jpg"
                  alt="Student studying mathematics and science with tutor guidance"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BookOpen className="w-6 h-6 flex-shrink-0 mt-0.5 text-primary" />
                  </div>
                  <h3 className="font-bold text-2xl">Academic Excellence</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Master core subjects with expert guidance tailored to the Cameroonian curriculum and international
                  standards.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                    <span className="text-sm">
                      <strong>Mathematics & Sciences:</strong> Algebra, Calculus, Physics, Chemistry, Biology
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                    <span className="text-sm">
                      <strong>Languages & Humanities:</strong> English, French, Literature, History, Geography
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                    <span className="text-sm">
                      <strong>Exam Preparation:</strong> GCE O/A Levels, BEPC, Baccalauréat, Concours, SAT, TOEFL
                    </span>
                  </li>
                </ul>
                <Button size="lg" asChild className="w-full text-base font-semibold">
                  <Link href="/programs">Explore Academic Programs</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="p-0 overflow-hidden border-2 hover:border-primary transition-all hover:shadow-xl group">
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src="/african-young-person-learning-coding-on-laptop-wit.jpg"
                  alt="Young person learning coding and technology skills"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-2xl">Skill Development</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Build practical skills for the modern world with hands-on learning and real-world applications.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                    <span className="text-sm">
                      <strong>Technology & Coding:</strong> Web Development, Python, Mobile Apps, Digital Literacy
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                    <span className="text-sm">
                      <strong>Creative Arts:</strong> Music, Drawing, Graphic Design, Photography
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                    <span className="text-sm">
                      <strong>Life Skills:</strong> Public Speaking, Leadership, Financial Literacy, Critical Thinking
                    </span>
                  </li>
                </ul>
                <Button size="lg" variant="outline" asChild className="w-full text-base font-semibold bg-transparent">
                  <Link href="/programs">Discover Skill Programs</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <TestimonialsSection />

      <FAQSection />

      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Excel in Your Studies?</h2>
          <p className="text-base mb-8 max-w-3xl mx-auto opacity-95 leading-relaxed">
            Join hundreds of students across Cameroon who are achieving their academic dreams with personalized tutoring
            from PrepSkul. Start your journey to success today.
          </p>
          <Button size="lg" variant="secondary" asChild className="text-base font-semibold px-8 h-11">
            <Link href="/contact">Start Learning</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
