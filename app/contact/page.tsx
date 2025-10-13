"use client"

import type React from "react"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageCircle, Phone, MapPin, Send } from "lucide-react"
import { useState } from "react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const emailResponse = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const whatsappMessage = encodeURIComponent(
        `New Contact Form:\n\nName: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone || "N/A"}\nSubject: ${formData.subject}\n\nMessage:\n${formData.message}`,
      )

      window.open(`https://wa.me/237674089066?text=${whatsappMessage}`, "_blank")

      if (emailResponse.ok) {
        alert(
          "Thank you for contacting PrepSkul! We've received your message via email and WhatsApp. We'll get back to you within 24 hours.",
        )
      } else {
        alert("Your message was sent to WhatsApp. We'll get back to you soon!")
      }

      setFormData({ name: "", email: "", phone: "", subject: "", message: "" })
    } catch (error) {
      console.error("[v0] Error submitting form:", error)
      alert("There was an issue sending your message. Please try contacting us via WhatsApp directly.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleWhatsAppClick = () => {
    window.open(
      "https://wa.me/237674089066?text=Hello%20PrepSkul%2C%20I%20am%20interested%20in%20joining%20PrepSkul%20as%20a%20%5Btutor%2Fstudent%2Fparent%5D.%20How%20may%20I%20proceed%3F",
      "_blank",
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <section className="py-16 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold">Get in Touch</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Whether you're a student looking to excel in your studies or a parent seeking the best educational support
              for your child, we're here to help you find the perfect tutor. Reach out today and let's start your
              learning journey together.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <Card
              className="border-2 hover:border-primary transition-all cursor-pointer hover:shadow-lg"
              onClick={handleWhatsAppClick}
            >
              <CardContent className="pt-6 text-center space-y-3">
                <div className="w-12 h-12 bg-[#25D366]/10 rounded-xl flex items-center justify-center mx-auto">
                  <MessageCircle className="h-6 w-6 text-[#25D366]" />
                </div>
                <h3 className="font-bold text-base">WhatsApp</h3>
                <p className="text-sm text-muted-foreground">Chat instantly</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-all hover:shadow-lg">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-base">Phone</h3>
                <p className="text-sm text-muted-foreground">+237 6 74 08 90 66</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-all hover:shadow-lg">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-base">Location</h3>
                <p className="text-sm text-muted-foreground">Buea, Cameroon</p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-6 text-center">Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+237 XXX XXX XXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-semibold">
                      I'm interested in *
                    </Label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) => setFormData({ ...formData, subject: value })}
                      required
                    >
                      <SelectTrigger id="subject" className="h-11">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="academic">Academic Tutoring</SelectItem>
                        <SelectItem value="skills">Skill Development</SelectItem>
                        <SelectItem value="exam">Exam Preparation</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-semibold">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your learning goals..."
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isSubmitting}>
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  )
}
