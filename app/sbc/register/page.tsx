"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import SbcHeader from "@/components/sbc/sbc-header"
import SbcFooter from "@/components/sbc/sbc-footer"
import { SbcPageShell } from "@/components/sbc/sbc-page-shell"
import { PricingBadge } from "@/components/sbc/pricing-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SBC_CONTACT, SBC_PRICING, SBC_SCHEDULE } from "@/lib/sbc/content"
import { useSbcPath } from "@/lib/sbc/use-sbc-path"
import { CheckCircle2, MessageCircle, ArrowLeft, AlertCircle } from "lucide-react"

interface FormData {
  student_name: string
  student_age: string
  parent_name: string
  phone: string
  email: string
  city: string
  has_device: string
  idea: string
}

export default function SbcRegisterPage() {
  const sbcPath = useSbcPath()
  const [formData, setFormData] = useState<FormData>({
    student_name: "",
    student_age: "",
    parent_name: "",
    phone: "",
    email: "",
    city: "",
    has_device: "",
    idea: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  const validate = () => {
    const next: Partial<Record<keyof FormData, string>> = {}
    if (!formData.student_name.trim()) next.student_name = "Student name is required"
    if (!formData.student_age) next.student_age = "Age is required"
    if (!formData.parent_name.trim()) next.parent_name = "Parent/guardian name is required"
    if (!formData.phone.trim()) next.phone = "Phone number is required"
    if (!formData.city.trim()) next.city = "City is required"
    if (!formData.has_device) next.has_device = "Please select an option"
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const buildWhatsAppMessage = () => {
    const deviceLabel =
      formData.has_device === "yes"
        ? "Yes, has laptop/phone"
        : formData.has_device === "no"
          ? "No device, will use center laptops"
          : formData.has_device

    return [
      "Hello PrepSkul! I'd like to register for Summer Build Camp (SBC).",
      "",
      `*Student:* ${formData.student_name} (Age: ${formData.student_age})`,
      `*Parent/Guardian:* ${formData.parent_name}`,
      `*Phone:* ${formData.phone}`,
      formData.email ? `*Email:* ${formData.email}` : "",
      `*City:* ${formData.city}`,
      `*Has device:* ${deviceLabel}`,
      formData.idea ? `*Idea/Interest:* ${formData.idea}` : "",
      "",
      `I understand the registration fee is ${SBC_PRICING.registrationFee.toLocaleString()} ${SBC_PRICING.currency} and the program fee is ${SBC_PRICING.programFee.toLocaleString()} ${SBC_PRICING.currency} (installments).`,
    ]
      .filter(Boolean)
      .join("\n")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitted(true)
    const message = encodeURIComponent(buildWhatsAppMessage())
    window.open(`${SBC_CONTACT.whatsapp}?text=${message}`, "_blank")
  }

  if (submitted) {
    return (
      <SbcPageShell>
        <SbcHeader />
        <div className="flex-1 flex items-center justify-center px-4 py-16 sm:py-20 min-w-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full text-center space-y-5 sm:space-y-6"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1B2C4F]">You&apos;re almost in!</h1>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              We&apos;ve opened WhatsApp with your registration details. Send the message to complete your registration with our team.
            </p>
            <p className="text-sm text-slate-400">
              Didn&apos;t see WhatsApp open?{" "}
              <a
                href={`${SBC_CONTACT.whatsapp}?text=${encodeURIComponent(buildWhatsAppMessage())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FF8A00] hover:underline"
              >
                Click here to send manually
              </a>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button asChild variant="outline" className="border-slate-300 text-[#1B2C4F] hover:bg-slate-50 bg-white">
                <Link href={sbcPath()}>Back to Home</Link>
              </Button>
              <Button asChild className="bg-[#FF8A00] hover:bg-[#e67a00] text-white">
                <a href={SBC_CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Chat on WhatsApp
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
        <SbcFooter />
      </SbcPageShell>
    )
  }

  return (
    <SbcPageShell>
      <SbcHeader />

      <div className="flex-1 py-8 sm:py-12 lg:py-16 min-w-0">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Link
            href={sbcPath()}
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#FF8A00] transition-colors mb-6 sm:mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to SBC Home
          </Link>

          <div className="grid lg:grid-cols-5 gap-8 lg:gap-10">
            {/* Mobile pricing summary first */}
            <div className="lg:col-span-2 lg:order-2 space-y-4 sm:space-y-6">
              <div className="lg:sticky lg:top-24 space-y-4 sm:space-y-6">
                <PricingBadge />

                <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 space-y-3 sm:space-y-4 shadow-sm">
                  <h3 className="font-bold text-lg text-[#1B2C4F]">Program Details</h3>
                  <ul className="space-y-2.5 text-sm text-slate-600">
                    <li><span className="text-[#1B2C4F] font-medium">Dates:</span> {SBC_SCHEDULE.dateRange}</li>
                    <li><span className="text-[#1B2C4F] font-medium">Schedule:</span> {SBC_SCHEDULE.days}</li>
                    <li><span className="text-[#1B2C4F] font-medium">Location:</span> {SBC_SCHEDULE.location}</li>
                    <li><span className="text-[#1B2C4F] font-medium">Ages:</span> {SBC_SCHEDULE.ages}</li>
                  </ul>
                </div>

                <div className="rounded-2xl bg-[#FF8A00]/8 border border-[#FF8A00]/25 p-4 sm:p-5">
                  <p className="text-sm text-[#FF8A00] font-semibold mb-1">Registration Deadline</p>
                  <p className="text-xl sm:text-2xl font-black text-[#1B2C4F]">{SBC_PRICING.registrationDeadline}</p>
                  <p className="text-xs text-slate-500 mt-2">Spots are limited. Register early to secure your place.</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3 lg:order-1 min-w-0">
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 text-[#1B2C4F]">Register for SBC</h1>
                <p className="text-slate-500 mb-6 sm:mb-8 text-sm sm:text-base">
                  Fill in the details below. You&apos;ll be directed to WhatsApp to confirm your spot with our team.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 min-w-0">
                      <Label htmlFor="student_name" className="text-slate-700">Student&apos;s Full Name *</Label>
                      <Input
                        id="student_name"
                        value={formData.student_name}
                        onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                        className="bg-white border-slate-200"
                        placeholder="e.g. Amina Ngu"
                      />
                      {errors.student_name && (
                        <p className="text-red-500 text-xs flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 shrink-0" /> {errors.student_name}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2 min-w-0">
                      <Label htmlFor="student_age" className="text-slate-700">Student&apos;s Age *</Label>
                      <Select value={formData.student_age} onValueChange={(v) => setFormData({ ...formData, student_age: v })}>
                        <SelectTrigger className="bg-white border-slate-200 w-full">
                          <SelectValue placeholder="Select age" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => i + 7).map((age) => (
                            <SelectItem key={age} value={String(age)}>{age} years old</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.student_age && (
                        <p className="text-red-500 text-xs flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 shrink-0" /> {errors.student_age}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 min-w-0">
                      <Label htmlFor="parent_name" className="text-slate-700">Parent/Guardian Name *</Label>
                      <Input
                        id="parent_name"
                        value={formData.parent_name}
                        onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                        className="bg-white border-slate-200"
                      />
                      {errors.parent_name && (
                        <p className="text-red-500 text-xs flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 shrink-0" /> {errors.parent_name}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2 min-w-0">
                      <Label htmlFor="phone" className="text-slate-700">WhatsApp / Phone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="bg-white border-slate-200"
                        placeholder="e.g. 653301997"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-xs flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 shrink-0" /> {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 min-w-0">
                      <Label htmlFor="email" className="text-slate-700">Email (optional)</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-white border-slate-200"
                      />
                    </div>
                    <div className="space-y-2 min-w-0">
                      <Label htmlFor="city" className="text-slate-700">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="bg-white border-slate-200"
                        placeholder="e.g. Buea"
                      />
                      {errors.city && (
                        <p className="text-red-500 text-xs flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 shrink-0" /> {errors.city}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 min-w-0">
                    <Label className="text-slate-700">Does the student have a laptop or phone? *</Label>
                    <Select value={formData.has_device} onValueChange={(v) => setFormData({ ...formData, has_device: v })}>
                      <SelectTrigger className="bg-white border-slate-200 w-full">
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes, has laptop and/or phone</SelectItem>
                        <SelectItem value="no">No, will use center laptops</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.has_device && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 shrink-0" /> {errors.has_device}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 min-w-0">
                    <Label htmlFor="idea" className="text-slate-700">Any idea or area of interest? (optional)</Label>
                    <Textarea
                      id="idea"
                      value={formData.idea}
                      onChange={(e) => setFormData({ ...formData, idea: e.target.value })}
                      className="bg-white border-slate-200 min-h-[96px] resize-y"
                      placeholder="e.g. An app to help students find study groups, a fashion brand, a game..."
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full text-sm sm:text-base font-bold h-12 sm:h-14 px-4 bg-[#FF8A00] hover:bg-[#e67a00] text-white shadow-md shadow-orange-500/15 whitespace-normal leading-snug"
                  >
                    <MessageCircle className="mr-2 h-5 w-5 shrink-0" />
                    Complete Registration via WhatsApp
                  </Button>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <SbcFooter />
    </SbcPageShell>
  )
}
