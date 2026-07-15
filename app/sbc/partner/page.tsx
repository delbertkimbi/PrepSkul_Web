"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import SbcHeader from "@/components/sbc/sbc-header"
import SbcFooter from "@/components/sbc/sbc-footer"
import { SbcPageShell } from "@/components/sbc/sbc-page-shell"
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
import {
  SBC_CONTACT,
  SBC_PARTNERSHIP_INTERESTS,
  SBC_PARTNERSHIP_ORG_TYPES,
} from "@/lib/sbc/content"
import { buildPartnershipWhatsAppMessage } from "@/lib/sbc/build-partnership-whatsapp"
import { useSbcPath } from "@/lib/sbc/use-sbc-path"
import { sbcBtnPrimary } from "@/lib/sbc/styles"
import { SbcBackButton } from "@/components/sbc/sbc-back-button"
import { Eyebrow, PaperSheet, Tape } from "@/components/sbc/paper-ui"
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Handshake,
  MessageCircle,
} from "lucide-react"

interface FormData {
  contact_name: string
  organization_name: string
  org_type: string
  org_type_other: string
  partnership_interests: string[]
  interests_other: string
  phone: string
  email: string
  city: string
  country: string
  website: string
  about: string
  proposal: string
  investment_range: string
}

const initialFormData: FormData = {
  contact_name: "",
  organization_name: "",
  org_type: "",
  org_type_other: "",
  partnership_interests: [],
  interests_other: "",
  phone: "",
  email: "",
  city: "",
  country: "Cameroon",
  website: "",
  about: "",
  proposal: "",
  investment_range: "",
}

export default function SbcPartnerPage() {
  const sbcPath = useSbcPath()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  const showInvestmentField =
    formData.org_type === "investor" ||
    formData.org_type === "individual" ||
    formData.partnership_interests.includes("investment") ||
    formData.partnership_interests.includes("sponsorship")

  const toggleInterest = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      partnership_interests: prev.partnership_interests.includes(value)
        ? prev.partnership_interests.filter((v) => v !== value)
        : [...prev.partnership_interests, value],
    }))
    if (errors.partnership_interests) {
      setErrors((prev) => ({ ...prev, partnership_interests: undefined }))
    }
  }

  const validate = () => {
    const next: Partial<Record<keyof FormData, string>> = {}
    if (!formData.contact_name.trim()) next.contact_name = "Contact name is required"
    if (!formData.org_type) next.org_type = "Please select your organization type"
    if (formData.org_type === "other" && !formData.org_type_other.trim()) {
      next.org_type_other = "Please describe your organization type"
    }
    if (formData.org_type !== "individual" && !formData.organization_name.trim()) {
      next.organization_name = "Organization name is required"
    }
    if (formData.partnership_interests.length === 0) {
      next.partnership_interests = "Select at least one partnership interest"
    }
    if (
      formData.partnership_interests.includes("other") &&
      !formData.interests_other.trim()
    ) {
      next.interests_other = "Please describe your partnership interest"
    }
    if (!formData.phone.trim()) next.phone = "Phone number is required"
    if (!formData.city.trim()) next.city = "City is required"
    if (!formData.about.trim()) next.about = "Tell us about your organization or background"
    if (!formData.proposal.trim()) next.proposal = "Describe how you would like to partner"
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const buildWhatsAppMessage = () => buildPartnershipWhatsAppMessage(formData)

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
            <h1 className="text-2xl sm:text-3xl font-black text-[#1B2C4F]">Inquiry sent!</h1>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              We&apos;ve opened WhatsApp with your partnership details. Send the message to reach the PrepSkul team. We&apos;ll review and get back to you soon.
            </p>
            <p className="text-sm text-slate-400">
              Didn&apos;t see WhatsApp open?{" "}
              <a
                href={`${SBC_CONTACT.whatsapp}?text=${encodeURIComponent(buildWhatsAppMessage())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4A6FBF] hover:underline"
              >
                Click here to send manually
              </a>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
              <SbcBackButton />
              <Button asChild className={sbcBtnPrimary}>
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

      <div className="flex-1 py-10 sm:py-14 lg:py-20 min-w-0 relative">
        <SbcBackButton className="absolute top-6 left-4 sm:left-6 lg:left-8 z-10" />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-10 sm:pt-2">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-9 text-center">
              <Eyebrow>Build the future with us</Eyebrow>
              <div>
                <h1 className="sbc-display mt-5 text-5xl sm:text-6xl lg:text-7xl font-black uppercase text-[#132d63] mb-4">
                  Partner with <span className="text-[#2864d7]">SBC</span>
                </h1>
                <p className="mx-auto max-w-2xl text-slate-500 text-sm sm:text-base leading-relaxed">
                  Investors, startups, NGOs, brands, and schools are welcome to partner with PrepSkul and DelTech Hub on Summer Build Camp. Tell us who you are and how you&apos;d like to get involved.
                </p>
              </div>
            </div>

            <PaperSheet tone="yellow" className="p-4 sm:p-5 mb-8 text-sm text-slate-600" rotate={-1}>
              <Tape className="-top-3 right-12 rotate-6" color="cream" />
              <p className="flex items-start gap-2">
                <Building2 className="h-4 w-4 text-[#4A6FBF] mt-0.5 shrink-0" />
                Your inquiry will be sent to the PrepSkul team via WhatsApp (+237 {SBC_CONTACT.phoneDisplay}) for review.
              </p>
            </PaperSheet>

            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              <fieldset className="space-y-4 rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm">
                <legend className="text-base font-bold text-[#1B2C4F] px-1">Contact details</legend>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 min-w-0">
                    <Label htmlFor="contact_name">Your full name *</Label>
                    <Input
                      id="contact_name"
                      value={formData.contact_name}
                      onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                      className="bg-white border-slate-200"
                      placeholder="e.g. Jean Mbarga"
                    />
                    {errors.contact_name && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 shrink-0" /> {errors.contact_name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2 min-w-0">
                    <Label htmlFor="phone">WhatsApp / Phone *</Label>
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
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-white border-slate-200"
                    />
                  </div>
                  <div className="space-y-2 min-w-0">
                    <Label htmlFor="website">Website or LinkedIn</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="bg-white border-slate-200"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 min-w-0">
                    <Label htmlFor="city">City *</Label>
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
                  <div className="space-y-2 min-w-0">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="bg-white border-slate-200"
                    />
                  </div>
                </div>
              </fieldset>

              <fieldset className="space-y-4 rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm">
                <legend className="text-base font-bold text-[#1B2C4F] px-1">Organization</legend>

                <div className="space-y-2 min-w-0">
                  <Label>What best describes you? *</Label>
                  <Select
                    value={formData.org_type}
                    onValueChange={(v) => setFormData({ ...formData, org_type: v })}
                  >
                    <SelectTrigger className="bg-white border-slate-200 w-full">
                      <SelectValue placeholder="Select organization type" />
                    </SelectTrigger>
                    <SelectContent>
                      {SBC_PARTNERSHIP_ORG_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.org_type && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 shrink-0" /> {errors.org_type}
                    </p>
                  )}
                </div>

                {formData.org_type === "other" && (
                  <div className="space-y-2 min-w-0">
                    <Label htmlFor="org_type_other">Describe your organization type *</Label>
                    <Input
                      id="org_type_other"
                      value={formData.org_type_other}
                      onChange={(e) => setFormData({ ...formData, org_type_other: e.target.value })}
                      className="bg-white border-slate-200"
                    />
                    {errors.org_type_other && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 shrink-0" /> {errors.org_type_other}
                      </p>
                    )}
                  </div>
                )}

                {formData.org_type && formData.org_type !== "individual" && (
                  <div className="space-y-2 min-w-0">
                    <Label htmlFor="organization_name">Organization name *</Label>
                    <Input
                      id="organization_name"
                      value={formData.organization_name}
                      onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                      className="bg-white border-slate-200"
                      placeholder="e.g. Bright Future NGO"
                    />
                    {errors.organization_name && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 shrink-0" /> {errors.organization_name}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2 min-w-0">
                  <Label htmlFor="about">About your organization or background *</Label>
                  <Textarea
                    id="about"
                    value={formData.about}
                    onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                    className="bg-white border-slate-200 min-h-[96px] resize-y"
                    placeholder="What does your organization do? What is your mission or area of focus?"
                  />
                  {errors.about && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 shrink-0" /> {errors.about}
                    </p>
                  )}
                </div>
              </fieldset>

              <fieldset className="space-y-4 rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm">
                <legend className="text-base font-bold text-[#1B2C4F] px-1">Partnership interests</legend>
                <p className="text-sm text-slate-500 -mt-2">Select all that apply *</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {SBC_PARTNERSHIP_INTERESTS.map((interest) => (
                    <label
                      key={interest.value}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        formData.partnership_interests.includes(interest.value)
                          ? "border-[#4A6FBF]/50 bg-[#eef3ff]"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.partnership_interests.includes(interest.value)}
                        onChange={() => toggleInterest(interest.value)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#4A6FBF] focus:ring-[#4A6FBF] shrink-0"
                      />
                      <span className="text-sm text-[#1B2C4F] leading-snug">{interest.label}</span>
                    </label>
                  ))}
                </div>
                {errors.partnership_interests && (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" /> {errors.partnership_interests}
                  </p>
                )}

                {formData.partnership_interests.includes("other") && (
                  <div className="space-y-2 min-w-0">
                    <Label htmlFor="interests_other">Describe your partnership interest *</Label>
                    <Input
                      id="interests_other"
                      value={formData.interests_other}
                      onChange={(e) => setFormData({ ...formData, interests_other: e.target.value })}
                      className="bg-white border-slate-200"
                    />
                    {errors.interests_other && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 shrink-0" /> {errors.interests_other}
                      </p>
                    )}
                  </div>
                )}

                {showInvestmentField && (
                  <div className="space-y-2 min-w-0">
                    <Label htmlFor="investment_range">Estimated investment or support</Label>
                    <Input
                      id="investment_range"
                      value={formData.investment_range}
                      onChange={(e) => setFormData({ ...formData, investment_range: e.target.value })}
                      className="bg-white border-slate-200"
                      placeholder="e.g. 500,000 FCFA, 10 laptops, mentorship for 4 sessions"
                    />
                  </div>
                )}
              </fieldset>

              <fieldset className="space-y-4 rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm">
                <legend className="text-base font-bold text-[#1B2C4F] px-1">Your proposal</legend>
                <div className="space-y-2 min-w-0">
                  <Label htmlFor="proposal">How would you like to partner with SBC? *</Label>
                  <Textarea
                    id="proposal"
                    value={formData.proposal}
                    onChange={(e) => setFormData({ ...formData, proposal: e.target.value })}
                    className="bg-white border-slate-200 min-h-[120px] resize-y"
                    placeholder="Describe your idea: funding scope, resources you can offer, timeline, what you hope to achieve together..."
                  />
                  {errors.proposal && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 shrink-0" /> {errors.proposal}
                    </p>
                  )}
                </div>
              </fieldset>

              <Button
                type="submit"
                size="lg"
                className={`w-full text-sm sm:text-base font-bold h-12 sm:h-14 px-4 ${sbcBtnPrimary} shadow-md shadow-blue-900/15 whitespace-normal leading-snug`}
              >
                <MessageCircle className="mr-2 h-5 w-5 shrink-0" />
                Send Partnership Inquiry via WhatsApp
              </Button>
            </form>
          </motion.div>
        </div>
      </div>

      <SbcFooter />
    </SbcPageShell>
  )
}
