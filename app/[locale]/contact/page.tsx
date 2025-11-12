"use client"

import type React from "react"
import { useState } from "react"
import emailjs from '@emailjs/browser'
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Phone, MapPin, Send, CheckCircle, BookOpen, Target, Wrench, GraduationCap } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { getTranslations } from "@/lib/translations"

export default function ContactPage() {
  const { locale } = useLocale()
  const t = getTranslations(locale)
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    role: "",
    program: "",
    academicSubjects: [] as string[],
    examType: "",
    skills: [] as string[],
    comment: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)
  const [whatsappUrl, setWhatsappUrl] = useState("")

  // EmailJS configuration
  const EMAILJS_SERVICE_ID = 'service_etr8h2u'
  const EMAILJS_TEMPLATE_ID = 'template_nksf6s6'
  const EMAILJS_PUBLIC_KEY = 'rD99LwgmwqsVeOqNm'

  const handleAcademicSubjectChange = (value: string) => {
    if (formData.academicSubjects.includes(value)) {
      setFormData({
        ...formData,
        academicSubjects: formData.academicSubjects.filter(subject => subject !== value)
      })
    } else {
      setFormData({
        ...formData,
        academicSubjects: [...formData.academicSubjects, value]
      })
    }
  }

  const handleSkillChange = (value: string) => {
    if (formData.skills.includes(value)) {
      setFormData({
        ...formData,
        skills: formData.skills.filter(skill => skill !== value)
      })
    } else {
      setFormData({
        ...formData,
        skills: [...formData.skills, value]
      })
    }
  }

  const generateWhatsAppMessage = () => {
    const { name, role, program, academicSubjects, examType, skills } = formData
    
    let message = `Hello PrepSkul\nI'm called ${name}, I am reaching out from the PrepSkul site as a ${role}.\nI am interested in `
    
    if (role === 'student') {
      if (program === 'academic') {
        const subjectText = academicSubjects.length > 0 ? academicSubjects.join(', ') : 'various subjects'
        message += `getting a tutor in ${program} for ${subjectText}.`
      } else if (program === 'exam') {
        message += `getting exam preparation for ${examType}.`
      } else if (program === 'skills') {
        const skillText = skills.length > 0 ? skills.join(', ') : 'various skills'
        message += `getting skill development in ${skillText}.`
      }
    } else if (role === 'parent') {
      if (program === 'academic') {
        const subjectText = academicSubjects.length > 0 ? academicSubjects.join(', ') : 'various subjects'
        message += `getting a tutor for my child in ${program} for ${subjectText}.`
      } else if (program === 'exam') {
        message += `getting exam preparation for my child for ${examType}.`
      } else if (program === 'skills') {
        const skillText = skills.length > 0 ? skills.join(', ') : 'various skills'
        message += `getting skill development for my child in ${skillText}.`
      }
    } else if (role === 'tutor') {
      if (program === 'academic') {
        const subjectText = academicSubjects.length > 0 ? academicSubjects.join(', ') : 'various subjects'
        message += `joining PrepSkul as a tutor for ${program} in ${subjectText}.`
      } else if (program === 'exam') {
        message += `joining PrepSkul as a tutor for ${program} in ${examType}.`
      } else if (program === 'skills') {
        const skillText = skills.length > 0 ? skills.join(', ') : 'various skills'
        message += `joining PrepSkul as a tutor for ${program} in ${skillText}.`
      }
    }
    
    return encodeURIComponent(message)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setHasAttemptedSubmit(true)
    setIsSubmitting(true)

    try {
      // Prepare data for email
      let selectedOptions = ""
      if (formData.program === 'academic') {
        selectedOptions = formData.academicSubjects.join(', ')
      } else if (formData.program === 'exam') {
        selectedOptions = formData.examType
      } else if (formData.program === 'skills') {
        selectedOptions = formData.skills.join(', ')
      }

      const templateParams = {
        user_name: formData.name,
        user_phone: formData.phone,
        user_role: formData.role,
        program_interest: formData.program,
        subjects_skills: selectedOptions,
        user_comment: formData.comment || 'No additional comments',
        timestamp: new Date().toLocaleString()
      }

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      )

      // Show success message and prepare WhatsApp URL
      const whatsappMessage = generateWhatsAppMessage()
      setWhatsappUrl(`https://wa.me/237653301997?text=${whatsappMessage}`)
      setIsSuccess(true)

    } catch (error) {
      console.error('Error sending email:', error)
      // Still prepare WhatsApp URL even if email fails
      const whatsappMessage = generateWhatsAppMessage()
      setWhatsappUrl(`https://wa.me/237653301997?text=${whatsappMessage}`)
      setIsSuccess(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleWhatsAppNavigation = () => {
    if (whatsappUrl) {
      // Try to open in the same window first (works better on iOS)
      window.location.href = whatsappUrl
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      role: "",
      program: "",
      academicSubjects: [],
      examType: "",
      skills: [],
      comment: "",
    })
    setIsSuccess(false)
    setHasAttemptedSubmit(false)
    setWhatsappUrl("")
  }

  const isFormValid = () => {
    if (!formData.name || !formData.phone || !formData.role || !formData.program) return false
    
    if (formData.program === 'academic' && formData.academicSubjects.length === 0) return false
    if (formData.program === 'exam' && !formData.examType) return false
    if (formData.program === 'skills' && formData.skills.length === 0) return false
    
    return true
  }

  const renderProgramSpecificFields = () => {
    if (formData.program === 'academic') {
      return (
        <div className="space-y-3">
          <Label className="text-base font-medium text-foreground flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            {t.contact.form.fields.academicSubjects.label} <span className="text-primary">*</span>
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {Object.entries(t.contact.form.fields.academicSubjects.options).map(([key, value]) => (
              <label key={key} className="flex items-center space-x-2 cursor-pointer p-2 rounded border hover:border-primary hover:bg-primary/5 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.academicSubjects.includes(key)}
                  onChange={() => handleAcademicSubjectChange(key)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm">{value}</span>
              </label>
            ))}
          </div>
          {hasAttemptedSubmit && formData.academicSubjects.length === 0 && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <span>⚠️</span> Please select at least one subject
            </p>
          )}
        </div>
      )
    }

    if (formData.program === 'exam') {
      return (
        <div className="space-y-3">
          <Label className="text-base font-medium text-foreground flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            {t.contact.form.fields.examTypes.label} <span className="text-primary">*</span>
          </Label>
          <Select
            value={formData.examType}
            onValueChange={(value) => setFormData({ ...formData, examType: value })}
            required
          >
            <SelectTrigger className="h-12 text-base data-[placeholder]:text-muted-foreground/60">
              <SelectValue placeholder={t.contact.form.fields.examTypes.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(t.contact.form.fields.examTypes.options).map(([key, value]) => (
                <SelectItem key={key} value={key}>{value}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasAttemptedSubmit && !formData.examType && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <span>⚠️</span> Please select an exam type
            </p>
          )}
        </div>
      )
    }

    if (formData.program === 'skills') {
      return (
        <div className="space-y-3">
          <Label className="text-base font-medium text-foreground flex items-center gap-2">
            <Wrench className="h-4 w-4 text-primary" />
            {t.contact.form.fields.skills.label} <span className="text-primary">*</span>
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {Object.entries(t.contact.form.fields.skills.options).map(([key, value]) => (
              <label key={key} className="flex items-center space-x-2 cursor-pointer p-2 rounded border hover:border-primary hover:bg-primary/5 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.skills.includes(key)}
                  onChange={() => handleSkillChange(key)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm">{value}</span>
              </label>
            ))}
          </div>
          {hasAttemptedSubmit && formData.skills.length === 0 && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <span>⚠️</span> Please select at least one skill
            </p>
          )}
        </div>
      )
    }

    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary">
              {t.contact.hero.title}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {t.contact.hero.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-lg border">
              <CardContent className="pt-6 pb-6 px-4">
                {isSuccess ? (
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                    <div>
                      <h2 className="text-xl font-bold text-green-600 mb-2">
                        {t.contact.form.success.message}
                      </h2>
                      <p className="text-muted-foreground text-sm mb-4">
                        Click the button below to continue on WhatsApp:
                      </p>
                </div>
                    <div className="space-y-3">
                      <Button 
                        onClick={handleWhatsAppNavigation}
                        className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold h-12"
                      >
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                          </svg>
                          Continue on WhatsApp
                        </div>
                      </Button>
                      <Button onClick={resetForm} variant="outline" size="sm" className="w-full">
                        Submit Another Form
                      </Button>
                    </div>
                </div>
                ) : (
                  <>
                    <div className="text-center mb-8">
                      <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-foreground">{t.contact.form.title}</h2>
                      <p className="text-base text-muted-foreground/80 leading-relaxed">Fill out the form below and we'll connect you with the right solution</p>
          </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Basic Information */}
                      <div className="space-y-5">
                  <div className="space-y-2.5">
                    <Label htmlFor="name" className="text-base font-medium text-foreground">
                            {t.contact.form.fields.name.label} <span className="text-primary">*</span>
                    </Label>
                    <Input
                      id="name"
                            placeholder={t.contact.form.fields.name.placeholder}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                            className="h-12 text-base placeholder:text-muted-foreground/60 placeholder:font-normal"
                    />
                  </div>

                  <div className="space-y-2.5">
                    <Label htmlFor="phone" className="text-base font-medium text-foreground">
                            {t.contact.form.fields.phone.label} <span className="text-primary">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                            placeholder={t.contact.form.fields.phone.placeholder}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                            className="h-12 text-base placeholder:text-muted-foreground/60 placeholder:font-normal"
                    />
                        </div>
                  </div>

                      {/* Role and Program Selection */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2.5">
                          <Label htmlFor="role" className="text-base font-medium text-foreground">
                            {t.contact.form.fields.role.label} <span className="text-primary">*</span>
                    </Label>
                    <Select
                            value={formData.role}
                            onValueChange={(value) => setFormData({ ...formData, role: value })}
                      required
                    >
                            <SelectTrigger id="role" className="h-12 text-base data-[placeholder]:text-muted-foreground/60">
                              <SelectValue placeholder={t.contact.form.fields.role.placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                              <SelectItem value="student">{t.contact.form.fields.role.options.student}</SelectItem>
                              <SelectItem value="parent">{t.contact.form.fields.role.options.parent}</SelectItem>
                              <SelectItem value="tutor">{t.contact.form.fields.role.options.tutor}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2.5">
                          <Label htmlFor="program" className="text-base font-medium text-foreground">
                            {t.contact.form.fields.program.label} <span className="text-primary">*</span>
                          </Label>
                          <Select
                            value={formData.program}
                            onValueChange={(value) => setFormData({ 
                              ...formData, 
                              program: value,
                              academicSubjects: [],
                              examType: "",
                              skills: []
                            })}
                            required
                          >
                            <SelectTrigger id="program" className="h-12 text-base data-[placeholder]:text-muted-foreground/60">
                              <SelectValue placeholder={t.contact.form.fields.program.placeholder} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="academic">{t.contact.form.fields.program.options.academic}</SelectItem>
                              <SelectItem value="exam">{t.contact.form.fields.program.options.exam}</SelectItem>
                              <SelectItem value="skills">{t.contact.form.fields.program.options.skills}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Dynamic Program-Specific Fields */}
                      {formData.program && (
                        <div className="p-4 bg-muted/30 rounded-lg border">
                          {renderProgramSpecificFields()}
                        </div>
                      )}

                      {/* Comment Field */}
                      <div className="space-y-2.5">
                        <Label htmlFor="comment" className="text-base font-medium text-foreground">
                          {t.contact.form.fields.comment.label} <span className="text-muted-foreground text-sm font-normal">(optional)</span>
                    </Label>
                    <Textarea
                          id="comment"
                          placeholder={t.contact.form.fields.comment.placeholder}
                          rows={4}
                          value={formData.comment}
                          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                          className="resize-none text-base placeholder:text-muted-foreground/60 placeholder:font-normal min-h-[100px]"
                    />
                  </div>

                      {/* Submit Button */}
                      <div className="flex justify-center">
                        <Button 
                          type="submit" 
                          className="w-full sm:w-auto h-10 text-sm font-medium px-8" 
                          disabled={isSubmitting || !isFormValid()}
                        >
                    {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            {t.contact.form.submit.sending}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Send className="h-4 w-4" />
                            {t.contact.form.submit.send}
                          </div>
                    )}
                  </Button>
                      </div>
                </form>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="max-w-2xl mx-auto mt-8">
            <h3 className="text-lg font-bold text-center mb-4">{t.contact.contactInfo.title}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="border hover:border-primary transition-all group">
                <CardContent className="pt-4 pb-4 text-center space-y-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-sm">{t.contact.contactInfo.phone.title}</h3>
                  <p className="text-xs text-muted-foreground">{t.contact.contactInfo.phone.description}</p>
                </CardContent>
              </Card>

              <Card className="border hover:border-primary transition-all group">
                <CardContent className="pt-4 pb-4 text-center space-y-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-sm">{t.contact.contactInfo.location.title}</h3>
                  <p className="text-xs text-muted-foreground">{t.contact.contactInfo.location.description}</p>
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