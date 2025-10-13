import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"
import Image from "next/image"

const testimonials = [
  {
    name: "Amina Njoya",
    role: "Student, Form 5",
    image: "/young-african-female-student-smiling.jpg",
    content:
      "PrepSkul changed my life! My math tutor helped me go from failing to getting an A. More than that, they believed in me when I didn't believe in myself.",
    rating: 5,
  },
  {
    name: "Marie Fotso",
    role: "Parent",
    image: "/african-mother-professional.jpg",
    content:
      "As a parent, I'm so grateful for PrepSkul. My daughter's confidence has grown tremendously, and her grades have improved across all subjects. The tutors truly care.",
    rating: 5,
  },
  {
    name: "Emmanuel Tabi",
    role: "Student, Upper Sixth",
    image: "/young-african-male-student-confident.jpg",
    content:
      "The exam preparation was incredible. My tutor gave me strategies that worked, and I passed my A-levels with flying colors. Now I'm heading to university!",
    rating: 5,
  },
  {
    name: "Grace Mbah",
    role: "Coding Student",
    image: "/young-african-female-tech-student.jpg",
    content:
      "I never thought I could learn to code, but my PrepSkul tutor made it fun and easy to understand. Now I'm building my own websites!",
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">What Our Learners Say</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real stories from students and parents who have experienced the PrepSkul difference
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6 space-y-4">
                <Quote className="h-8 w-8 text-accent/30" />
                <p className="text-muted-foreground italic">{testimonial.content}</p>
                <div className="flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Image
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
