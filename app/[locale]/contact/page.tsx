"use client"

import type React from "react"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageCircle, Phone, MapPin, Send } from "lucide-react"
import { useState } from "react"
import { useLocale } from "@/lib/locale-context"
import { getTranslations } from "@/lib/translations"

export default function ContactPage() {
  const { locale } = useLocale()
  const t = getTranslations(locale)
  
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
        alert(t.contact.form.success.email)
      } else {
        alert(t.contact.form.success.whatsapp)
      }

      setFormData({ name: "", email: "", phone: "", subject: "", message: "" })
    } catch (error) {
      console.error("[v0] Error submitting form:", error)
      alert(t.contact.form.success.error)
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
            <h1 className="text-4xl sm:text-5xl font-bold">{t.contact.hero.title}</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t.contact.hero.subtitle}
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
                <h3 className="font-bold text-base">{t.contact.methods.whatsapp.title}</h3>
                <p className="text-sm text-muted-foreground">{t.contact.methods.whatsapp.description}</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-all hover:shadow-lg">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-base">{t.contact.methods.phone.title}</h3>
                <p className="text-sm text-muted-foreground">{t.contact.methods.phone.description}</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-all hover:shadow-lg">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-base">{t.contact.methods.location.title}</h3>
                <p className="text-sm text-muted-foreground">{t.contact.methods.location.description}</p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-6 text-center">{t.contact.form.title}</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold">
                      {t.contact.form.fields.name.label} *
                    </Label>
                    <Input
                      id="name"
                      placeholder={t.contact.form.fields.name.placeholder}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold">
                      {t.contact.form.fields.email.label} *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t.contact.form.fields.email.placeholder}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold">
                      {t.contact.form.fields.phone.label}
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder={t.contact.form.fields.phone.placeholder}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-semibold">
                      {t.contact.form.fields.subject.label} *
                    </Label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) => setFormData({ ...formData, subject: value })}
                      required
                    >
                      <SelectTrigger id="subject" className="h-11">
                        <SelectValue placeholder={t.contact.form.fields.subject.placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="academic">{t.contact.form.fields.subject.options.academic}</SelectItem>
                        <SelectItem value="skills">{t.contact.form.fields.subject.options.skills}</SelectItem>
                        <SelectItem value="exam">{t.contact.form.fields.subject.options.exam}</SelectItem>
                        <SelectItem value="other">{t.contact.form.fields.subject.options.other}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-semibold">
                      {t.contact.form.fields.message.label} *
                    </Label>
                    <Textarea
                      id="message"
                      placeholder={t.contact.form.fields.message.placeholder}
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isSubmitting}>
                    {isSubmitting ? (
                      t.contact.form.submit.sending
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        {t.contact.form.submit.send}
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
    </div>
  )
}
