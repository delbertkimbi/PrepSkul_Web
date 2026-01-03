"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ArrowRight, CheckCircle2, Upload, X } from "lucide-react"
import { useRouter } from "next/navigation"

const STORAGE_KEY = "ambassador_application_progress"

interface FormData {
  full_name: string
  age_range: string
  gender: string
  city: string
  region: string
  status: string
  status_other: string
  motivation: string
  alignment_goals: string[]
  explanation: string
  social_platforms: { platform: string; username: string; followers: number }[]
  reach_range: string
  promotion_methods: string[]
  promotion_methods_other: string
  creative_idea: string
  email: string
  whatsapp_number: string
  profile_image: File | null
}

const CAMEROON_REGIONS = [
  "Adamawa",
  "Centre",
  "East",
  "Far North",
  "Littoral",
  "North",
  "North West",
  "South",
  "South West",
  "West",
]

const SOCIAL_PLATFORMS = [
  "LinkedIn",
  "Instagram",
  "TikTok",
  "Facebook",
  "Twitter (X)",
]

export default function AmbassadorApplyPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    age_range: "",
    gender: "",
    city: "",
    region: "",
    status: "",
    status_other: "",
    motivation: "",
    alignment_goals: [],
    explanation: "",
    social_platforms: [],
    reach_range: "",
    promotion_methods: [],
    promotion_methods_other: "",
    creative_idea: "",
    email: "",
    whatsapp_number: "",
    profile_image: null,
  })

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Merge with default values to ensure all fields exist
        setFormData({
          full_name: parsed.full_name || "",
          age_range: parsed.age_range || "",
          gender: parsed.gender || "",
          city: parsed.city || "",
          region: parsed.region || "",
          status: parsed.status || "",
          status_other: parsed.status_other || "",
          motivation: parsed.motivation || "",
          alignment_goals: parsed.alignment_goals || [],
          explanation: parsed.explanation || "",
          social_platforms: parsed.social_platforms || [],
          reach_range: parsed.reach_range || "",
          promotion_methods: parsed.promotion_methods || [],
          promotion_methods_other: parsed.promotion_methods_other || "",
          creative_idea: parsed.creative_idea || "",
          email: parsed.email || "",
          whatsapp_number: parsed.whatsapp_number || "",
          profile_image: null, // Don't restore File objects from localStorage
        })
      } catch (e) {
        console.error("Failed to load saved progress:", e)
      }
    }
  }, [])

  // Save to localStorage whenever formData changes
  useEffect(() => {
    const dataToSave = { ...formData }
    // Don't save File object, just metadata
    if (dataToSave.profile_image) {
      // File will be handled separately on submit
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
  }, [formData])

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0:
        return !!formData.full_name.trim()
      case 1:
        return !!formData.age_range
      case 2:
        return !!formData.gender
      case 3:
        return !!formData.city.trim()
      case 4:
        return !!formData.region
      case 5:
        return !!formData.status && (formData.status !== "other" || !!formData.status_other.trim())
      case 6:
        return !!formData.motivation.trim()
      case 7:
        return formData.alignment_goals.length > 0
      case 8:
        return true // Optional
      case 9:
        return true // Optional, but we'll check if any selected
      case 10:
        return true // Optional - can proceed even if no platforms selected
      case 11:
        return !!formData.reach_range
      case 12:
        return formData.promotion_methods.length > 0
      case 13:
        return true // Optional
      case 14:
        return !!formData.email?.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      case 15:
        return !!formData.whatsapp_number?.trim()
      case 16:
        return !!formData.profile_image
      default:
        return true
    }
  }

  const handleNext = () => {
    if (canProceed() && currentStep < 16) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    if (!canProceed()) return

    setIsSubmitting(true)

    try {
      const submitFormData = new FormData()
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "profile_image" && value instanceof File) {
          submitFormData.append(key, value)
        } else if (key === "alignment_goals" || key === "promotion_methods") {
          submitFormData.append(key, JSON.stringify(value))
        } else if (key === "social_platforms") {
          submitFormData.append(key, JSON.stringify(value))
        } else if (value !== null && value !== undefined) {
          submitFormData.append(key, String(value))
        }
      })

      const response = await fetch("/api/ambassadors/apply", {
        method: "POST",
        body: submitFormData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to submit application")
      }

      // Clear localStorage on success
      localStorage.removeItem(STORAGE_KEY)
      setIsSuccess(true)
    } catch (error) {
      console.error("Submission error:", error)
      alert(error instanceof Error ? error.message : "Failed to submit application. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleCheckbox = (field: "alignment_goals" | "promotion_methods", value: string) => {
    setFormData((prev) => {
      const current = prev[field] as string[]
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
      return { ...prev, [field]: updated }
    })
  }

  const toggleSocialPlatform = (platform: string) => {
    setFormData((prev) => {
      const current = prev.social_platforms
      const exists = current.find((p) => p.platform === platform)
      if (exists) {
        return {
          ...prev,
          social_platforms: current.filter((p) => p.platform !== platform),
        }
      } else {
        return {
          ...prev,
          social_platforms: [...current, { platform, username: "", followers: 0 }],
        }
      }
    })
  }

  const updateSocialPlatform = (platform: string, field: "username" | "followers", value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      social_platforms: prev.social_platforms.map((p) =>
        p.platform === platform ? { ...p, [field]: value } : p
      ),
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image must be less than 2MB")
        return
      }
      if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
        alert("Image must be JPG or PNG")
        return
      }
      updateFormData("profile_image", file)
      // Create preview URL
      const url = URL.createObjectURL(file)
      setImagePreviewUrl(url)
    }
  }

  // Clean up object URL on unmount or when image changes
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl)
      }
    }
  }, [imagePreviewUrl])

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  }

  const [direction, setDirection] = useState(0)

  const goToStep = (step: number) => {
    setDirection(step > currentStep ? 1 : -1)
    setCurrentStep(step)
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center py-20 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full text-center space-y-6"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Application Submitted!</h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Your application has been successfully submitted. The PrepSkul team will review it and contact you via email.
            </p>
            <Button
              onClick={() => router.push("/ambassadors")}
              className="mt-6"
            >
              Return to Ambassadors Page
            </Button>
          </motion.div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-2xl">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStep + 1} of 17</span>
              <span>{Math.round(((currentStep + 1) / 17) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-primary h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / 17) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 min-h-[400px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="space-y-6"
              >
                {/* Step 0: Full Name */}
                {currentStep === 0 && (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900">What's your full name?</h2>
                    <Input
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.full_name}
                      onChange={(e) => updateFormData("full_name", e.target.value)}
                      className="w-full"
                      autoFocus
                    />
                  </>
                )}

                {/* Step 1: Age */}
                {currentStep === 1 && (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900">What's your age range?</h2>
                    <Select value={formData.age_range} onValueChange={(value) => updateFormData("age_range", value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select your age range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under_18">Under 18</SelectItem>
                        <SelectItem value="18_20">18-20</SelectItem>
                        <SelectItem value="21_25">21-25</SelectItem>
                        <SelectItem value="26_30">26-30</SelectItem>
                        <SelectItem value="30_plus">30+</SelectItem>
                      </SelectContent>
                    </Select>
                  </>
                )}

                {/* Step 2: Gender */}
                {currentStep === 2 && (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900">What's your gender?</h2>
                    <div className="space-y-3">
                      {["male", "female", "prefer_not_to_say"].map((option) => (
                        <label
                          key={option}
                          className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <input
                            type="radio"
                            name="gender"
                            value={option}
                            checked={formData.gender === option}
                            onChange={(e) => updateFormData("gender", e.target.value)}
                            className="w-4 h-4 text-primary"
                          />
                          <span className="capitalize">{option.replace("_", " ")}</span>
                        </label>
                      ))}
                    </div>
                  </>
                )}

                {/* Step 3: City */}
                {currentStep === 3 && (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900">What city or town are you in?</h2>
                    <Input
                      type="text"
                      placeholder="Enter your city or town"
                      value={formData.city}
                      onChange={(e) => updateFormData("city", e.target.value)}
                      className="w-full"
                      autoFocus
                    />
                  </>
                )}

                {/* Step 4: Region */}
                {currentStep === 4 && (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900">Which region of Cameroon are you in?</h2>
                    <Select value={formData.region} onValueChange={(value) => updateFormData("region", value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select your region" />
                      </SelectTrigger>
                      <SelectContent>
                        {CAMEROON_REGIONS.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}

                {/* Step 5: Current Status */}
                {currentStep === 5 && (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900">What's your current status?</h2>
                    <Select value={formData.status} onValueChange={(value) => updateFormData("status", value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select your status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="graduate">Graduate</SelectItem>
                        <SelectItem value="tutor_teacher">Tutor / Teacher</SelectItem>
                        <SelectItem value="working_professional">Working Professional</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.status === "other" && (
                      <Input
                        type="text"
                        placeholder="Please specify"
                        value={formData.status_other}
                        onChange={(e) => updateFormData("status_other", e.target.value)}
                        className="w-full mt-4"
                        autoFocus
                      />
                    )}
                  </>
                )}

                {/* Step 6: Motivation */}
                {currentStep === 6 && (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900">What motivates you to become a PrepSkul Ambassador?</h2>
                    <Textarea
                      placeholder="Share your motivation..."
                      value={formData.motivation}
                      onChange={(e) => updateFormData("motivation", e.target.value)}
                      className="w-full min-h-[200px]"
                      autoFocus
                    />
                  </>
                )}

                {/* Step 7: Mission Alignment */}
                {currentStep === 7 && (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900">Which PrepSkul missions align with you?</h2>
                    <p className="text-sm text-gray-600">Select all that apply</p>
                    <div className="space-y-3">
                      {[
                        "Helping students find tutors",
                        "Creating learning opportunities",
                        "Building trust in education",
                        "Leadership & personal growth",
                      ].map((goal) => (
                        <label
                          key={goal}
                          className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={formData.alignment_goals.includes(goal)}
                            onChange={() => toggleCheckbox("alignment_goals", goal)}
                            className="w-4 h-4 text-primary"
                          />
                          <span>{goal}</span>
                        </label>
                      ))}
                    </div>
                  </>
                )}

                {/* Step 8: Explain PrepSkul */}
                {currentStep === 8 && (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900">How would you explain PrepSkul to a friend?</h2>
                    <Textarea
                      placeholder="Share your explanation..."
                      value={formData.explanation}
                      onChange={(e) => updateFormData("explanation", e.target.value)}
                      className="w-full min-h-[200px]"
                      autoFocus
                    />
                  </>
                )}

                {/* Step 9: Social Media Presence */}
                {currentStep === 9 && (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900">Which social media platforms do you use?</h2>
                    <p className="text-sm text-gray-600">Select all that apply</p>
                    <div className="space-y-3">
                      {SOCIAL_PLATFORMS.map((platform) => (
                        <label
                          key={platform}
                          className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={formData.social_platforms.some((p) => p.platform === platform)}
                            onChange={() => toggleSocialPlatform(platform)}
                            className="w-4 h-4 text-primary"
                          />
                          <span>{platform}</span>
                        </label>
                      ))}
                      <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.social_platforms.length === 0}
                          onChange={() => {
                            if (formData.social_platforms.length > 0) {
                              updateFormData("social_platforms", [])
                            }
                          }}
                          className="w-4 h-4 text-primary"
                        />
                        <span>None</span>
                      </label>
                    </div>
                  </>
                )}

                {/* Step 10: Social Links */}
                {currentStep === 10 && (
                  <>
                    {formData.social_platforms.length > 0 ? (
                      <>
                        <h2 className="text-2xl font-bold text-gray-900">Tell us about your social media presence</h2>
                        <div className="space-y-4">
                          {formData.social_platforms.map((platform) => (
                            <div key={platform.platform} className="p-4 border rounded-lg space-y-3">
                              <h3 className="font-semibold">{platform.platform}</h3>
                              <Input
                                type="text"
                                placeholder="Username or profile link"
                                value={platform.username}
                                onChange={(e) => updateSocialPlatform(platform.platform, "username", e.target.value)}
                                className="w-full"
                              />
                              <Input
                                type="number"
                                placeholder="Approximate followers"
                                value={platform.followers || ""}
                                onChange={(e) => updateSocialPlatform(platform.platform, "followers", parseInt(e.target.value) || 0)}
                                className="w-full"
                              />
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-600">No social media platforms selected. You can proceed to the next step.</p>
                      </div>
                    )}
                  </>
                )}

                {/* Step 11: Weekly Reach */}
                {currentStep === 11 && (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900">How many people do you reach weekly?</h2>
                    <div className="space-y-3">
                      {[
                        { value: "less_than_20", label: "Less than 20" },
                        { value: "20_50", label: "20-50" },
                        { value: "50_100", label: "50-100" },
                        { value: "100_plus", label: "100+" },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <input
                            type="radio"
                            name="reach_range"
                            value={option.value}
                            checked={formData.reach_range === option.value}
                            onChange={(e) => updateFormData("reach_range", e.target.value)}
                            className="w-4 h-4 text-primary"
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </>
                )}

                {/* Step 12: Promotion Methods */}
                {currentStep === 12 && (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900">How would you love to promote PrepSkul?</h2>
                    <p className="text-sm text-gray-600">Select all that apply</p>
                    <div className="space-y-3">
                      {[
                        "One-on-one conversations",
                        "WhatsApp status",
                        "School / community talks",
                        "Online posts",
                        "Other",
                      ].map((method) => (
                        <label
                          key={method}
                          className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={formData.promotion_methods.includes(method)}
                            onChange={() => toggleCheckbox("promotion_methods", method)}
                            className="w-4 h-4 text-primary"
                          />
                          <span>{method}</span>
                        </label>
                      ))}
                    </div>
                    {formData.promotion_methods.includes("Other") && (
                      <Input
                        type="text"
                        placeholder="Please specify other promotion methods"
                        value={formData.promotion_methods_other}
                        onChange={(e) => updateFormData("promotion_methods_other", e.target.value)}
                        className="w-full mt-4"
                        autoFocus
                      />
                    )}
                  </>
                )}

                {/* Step 13: Creative Idea */}
                {currentStep === 13 && (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900">Share one creative idea to promote PrepSkul</h2>
                    <Textarea
                      placeholder="Your creative idea..."
                      value={formData.creative_idea}
                      onChange={(e) => updateFormData("creative_idea", e.target.value)}
                      className="w-full min-h-[200px]"
                      autoFocus
                    />
                  </>
                )}

                {/* Step 14: Email */}
                {currentStep === 14 && (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900">What's your email address?</h2>
                    <p className="text-sm text-gray-600 mb-4">We'll use this to contact you about your application</p>
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                      className="w-full"
                      autoFocus
                    />
                  </>
                )}

                {/* Step 15: WhatsApp Number */}
                {currentStep === 15 && (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900">What's your WhatsApp number?</h2>
                    <p className="text-sm text-gray-600 mb-4">We'll use this to contact you via WhatsApp</p>
                    <Input
                      type="tel"
                      placeholder="+237 6XX XXX XXX"
                      value={formData.whatsapp_number}
                      onChange={(e) => updateFormData("whatsapp_number", e.target.value)}
                      className="w-full"
                      autoFocus
                    />
                  </>
                )}

                {/* Step 16: Profile Image */}
                {currentStep === 16 && (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900">Upload your profile image</h2>
                    <p className="text-sm text-gray-600 mb-4">JPG or PNG, max 2MB</p>
                    <div className="space-y-4">
                      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-10 h-10 text-gray-400 mb-3" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">JPG or PNG (MAX. 2MB)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/jpeg,image/jpg,image/png"
                          onChange={handleImageUpload}
                        />
                      </label>
                      {imagePreviewUrl && (
                        <div className="relative inline-block">
                          <img
                            src={imagePreviewUrl}
                            alt="Profile preview"
                            className="w-32 h-32 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => {
                              updateFormData("profile_image", null)
                              if (imagePreviewUrl) {
                                URL.revokeObjectURL(imagePreviewUrl)
                                setImagePreviewUrl(null)
                              }
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            {currentStep < 16 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

