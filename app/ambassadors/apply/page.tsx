"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ArrowRight, CheckCircle2, Upload, X, Mail, MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"

const STORAGE_KEY = "ambassador_application_progress"

interface FormData {
  full_name: string
  age_range: string
  email: string
  whatsapp_number: string
  gender: string
  city: string
  region: string
  status: string
  status_other: string
  student_class_level: string // New field for student class/level
  motivation: string
  alignment_goals: string[]
  explanation: string
  social_platforms: { platform: string; username: string; followers: number }[]
  social_media_influence_rating: number | null
  promotion_methods: string[]
  promotion_methods_other: string
  creative_idea: string
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
    email: "",
    whatsapp_number: "",
    gender: "",
    city: "",
    region: "",
    status: "",
    status_other: "",
    student_class_level: "",
    motivation: "",
    alignment_goals: [],
    explanation: "",
    social_platforms: [],
    social_media_influence_rating: null,
    promotion_methods: [],
    promotion_methods_other: "",
    creative_idea: "",
    profile_image: null,
  })

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setFormData({
          full_name: parsed.full_name || "",
          age_range: parsed.age_range || "",
          email: parsed.email || "",
          whatsapp_number: parsed.whatsapp_number || "",
          gender: parsed.gender || "",
          city: parsed.city || "",
          region: parsed.region || "",
          status: parsed.status || "",
          status_other: parsed.status_other || "",
          status_other: parsed.status_other || "",
          student_class_level: parsed.student_class_level || "",
          motivation: parsed.motivation || "",
          alignment_goals: parsed.alignment_goals || [],
          explanation: parsed.explanation || "",
          social_platforms: parsed.social_platforms || [],
          social_media_influence_rating: parsed.social_media_influence_rating ?? null,
          promotion_methods: parsed.promotion_methods || [],
          promotion_methods_other: parsed.promotion_methods_other || "",
          creative_idea: parsed.creative_idea || "",
          profile_image: null,
        })
      } catch (e) {
        console.error("Failed to load saved progress:", e)
      }
    }
  }, [])

  // Save to localStorage whenever formData changes
  useEffect(() => {
    const dataToSave = { ...formData }
    if (dataToSave.profile_image) {
      // File will be handled separately on submit
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
  }, [formData])

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Helper function to check if student class step should be shown
  const shouldShowStudentStep = () => {
    return formData.status === "student"
  }

  // Helper function to get the actual step number for display (accounting for conditional steps)
  const getDisplayStep = (step: number): number => {
    // If we're past step 7 and status is not student, we skip step 8 (student class)
    if (step > 7 && !shouldShowStudentStep()) {
      return step // Step 8 becomes motivation, so no adjustment needed
    }
    return step
  }

  // Helper function to get total steps
  const getTotalSteps = (): number => {
    return shouldShowStudentStep() ? 18 : 17 // 17 base steps + 1 conditional student step
  }

  // Updated canProceed with conditional student step
  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0: // Full Name
        return !!formData.full_name.trim()
      case 1: // Age
        return !!formData.age_range
      case 2: // Email
        return !!formData.email?.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      case 3: // WhatsApp
        return !!formData.whatsapp_number?.trim()
      case 4: // Gender
        return !!formData.gender
      case 5: // City
        return !!formData.city.trim()
      case 6: // Region
        return !!formData.region
      case 7: // Current Status
        return !!formData.status && (formData.status !== "other" || !!formData.status_other.trim())
      case 8: // Student Class/Level (conditional - only if status is "student")
        if (shouldShowStudentStep()) {
          return !!formData.student_class_level?.trim()
        }
        // If not a student, this step should be motivation
        return !!formData.motivation.trim()
      case 9: // Motivation (or Mission Alignment if student step was shown)
        if (shouldShowStudentStep()) {
          return !!formData.motivation.trim()
        }
        // If not a student, step 9 is Mission Alignment
        return formData.alignment_goals.length > 0
      case 10: // Mission Alignment (or Explain PrepSkul if student step was shown)
        if (shouldShowStudentStep()) {
          return formData.alignment_goals.length > 0
        }
        return true // Optional
      case 11: // Explain PrepSkul (or Social Media Presence if student step was shown)
        return true // Optional
      case 12: // Social Media Presence (or Social Links if student step was shown)
        return true // Optional
      case 13: // Social Links (or Social Media Influence Rating if student step was shown)
        return true // Optional
      case 14: // Social Media Influence Rating (or Promotion Methods if student step was shown)
        if (shouldShowStudentStep()) {
          return formData.social_media_influence_rating !== null && formData.social_media_influence_rating >= 0
        }
        return formData.promotion_methods.length > 0
      case 15: // Promotion Methods (or Creative Idea if student step was shown)
        if (shouldShowStudentStep()) {
          return formData.promotion_methods.length > 0
        }
        return !!formData.creative_idea?.trim()
      case 16: // Creative Idea (or Profile Image if student step was shown)
        if (shouldShowStudentStep()) {
          return !!formData.creative_idea?.trim()
        }
        return !!formData.profile_image
      case 17: // Profile Image (only if student step was shown)
        return !!formData.profile_image
      default:
        return true
    }
  }

  const handleNext = () => {
    const totalSteps = getTotalSteps()
    if (canProceed() && currentStep < totalSteps - 1) {
      let nextStep = currentStep + 1
      
      // Skip Social Links step (12/13) if no platforms selected
      if (currentStep === 11 && formData.social_platforms.length === 0) {
        // Non-student: skip step 12, go to step 13
        nextStep = 13
      } else if (currentStep === 12 && !shouldShowStudentStep() && formData.social_platforms.length === 0) {
        // Non-student on social links step with no platforms
        nextStep = 13
      } else if (currentStep === 12 && shouldShowStudentStep() && formData.social_platforms.length === 0) {
        // Student: skip step 13, go to step 14
        nextStep = 14
      } else if (currentStep === 13 && shouldShowStudentStep() && formData.social_platforms.length === 0) {
        // Student on social links step with no platforms
        nextStep = 14
      }
      
      setCurrentStep(nextStep)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      let prevStep = currentStep - 1
      
      // If we're on step 13 (Social Media Influence Rating) and no platforms were selected, go back to step 11
      if (currentStep === 13 && formData.social_platforms.length === 0) {
        prevStep = 11 // Go back to Social Media Presence
      }
      // If we're on step 14 (Social Media Influence Rating for students) and no platforms were selected, go back to step 12
      else if (currentStep === 14 && shouldShowStudentStep() && formData.social_platforms.length === 0) {
        prevStep = 12 // Go back to Social Media Presence
      }
      // If we're on step 8 (motivation for non-students), go back to step 7 (status)
      else if (currentStep === 8 && !shouldShowStudentStep()) {
        prevStep = 7
      }
      // If we're on step 9 (motivation for students), go back to step 8 (student class)
      else if (currentStep === 9 && shouldShowStudentStep()) {
        prevStep = 8
      }
      
      setCurrentStep(prevStep)
    }
  }

  const handleSubmit = async () => {
    if (!canProceed()) return

    setIsSubmitting(true)

    try {
      const submitFormData = new FormData()
      
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
        const errorData = await response.json()
        const errorMessage = errorData.error || errorData.details || "Failed to submit application"
        throw new Error(errorMessage)
      }

      const result = await response.json()
      
      // Clear localStorage on success
      localStorage.removeItem(STORAGE_KEY)
      setIsSuccess(true)
    } catch (error) {
      // Show user-friendly error message
      const errorMessage = error instanceof Error 
        ? error.message 
        : "We encountered an issue submitting your application. Please check your internet connection and try again. If the problem persists, contact support."
      
      // Create a more visible error notification
      const errorDiv = document.createElement('div')
      errorDiv.className = 'fixed top-4 right-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-lg z-50 max-w-md'
      errorDiv.innerHTML = `
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium">${errorMessage}</p>
          </div>
          <button onclick="this.parentElement.parentElement.remove()" class="ml-auto text-red-500 hover:text-red-700">
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      `
      document.body.appendChild(errorDiv)
      
      // Auto-remove after 8 seconds
      setTimeout(() => {
        if (errorDiv.parentElement) {
          errorDiv.remove()
        }
      }, 8000)
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

  const [imageError, setImageError] = useState<string | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setImageError(null)
    
    if (file) {
      // Validate file type
      if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
        setImageError("Please upload a JPG or PNG image file")
        return
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setImageError("Image size must be less than 5MB. Please compress your image and try again.")
        return
      }
      
      updateFormData("profile_image", file)
      const url = URL.createObjectURL(file)
      setImagePreviewUrl(url)
    }
  }

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

  // Confetti effect on success
  useEffect(() => {
    if (isSuccess) {
      // Simple confetti effect using CSS animations
      const confettiCount = 50
      const confettiContainer = document.createElement('div')
      confettiContainer.className = 'fixed inset-0 pointer-events-none z-50'
      confettiContainer.id = 'confetti-container'
      
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
      
      for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div')
        confetti.style.position = 'absolute'
        confetti.style.left = `${Math.random() * 100}%`
        confetti.style.top = '-10px'
        confetti.style.width = `${Math.random() * 10 + 5}px`
        confetti.style.height = `${Math.random() * 10 + 5}px`
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0'
        confetti.style.opacity = '0.8'
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`
        
        const animation = confetti.animate(
          [
            { transform: `translateY(0) rotate(0deg)`, opacity: 1 },
            { transform: `translateY(${window.innerHeight + 100}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
          ],
          {
            duration: Math.random() * 2000 + 2000,
            easing: 'cubic-bezier(0.5, 0, 0.5, 1)',
          }
        )
        
        confettiContainer.appendChild(confetti)
        animation.onfinish = () => confetti.remove()
      }
      
      document.body.appendChild(confettiContainer)
      
      // Clean up after 5 seconds
      setTimeout(() => {
        if (confettiContainer.parentElement) {
          confettiContainer.remove()
        }
      }, 5000)
    }
  }, [isSuccess])

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-white to-blue-50">
        <Header />
        <div className="flex-1 flex items-center justify-center py-20 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="max-w-lg w-full text-center space-y-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg"
            >
              <CheckCircle2 className="w-14 h-14 text-white" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <h1 className="text-4xl font-bold text-gray-900">Congratulations! 🎉</h1>
              <div className="space-y-3 text-lg text-gray-700 leading-relaxed">
                <p className="font-semibold text-gray-900">
                  Your application has been successfully submitted!
                </p>
                <p>
                  Our team will review your application and get back to you via email within 2-3 business days.
                </p>
                <p className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg text-left">
                  <span className="font-semibold text-blue-900">Next Steps:</span>
                  <br />
                  <span className="text-blue-800">
                    If you're qualified, you'll be invited for a short 5-minute interview to join the PrepSkul Ambassador program.
                  </span>
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                onClick={() => router.push("/")}
                size="lg"
                className="mt-6 px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Return to Home
              </Button>
            </motion.div>
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
        <div className="w-full max-w-3xl">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
              <span>Step {currentStep + 1} of {getTotalSteps()}</span>
              <span>{Math.round(((currentStep + 1) / getTotalSteps()) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
              <motion.div
                className="bg-primary h-3 rounded-full shadow-sm"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / getTotalSteps()) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Question Card - Modernized */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
          >
            <div className="bg-primary px-8 py-6">
              <h3 className="text-white text-sm font-semibold uppercase tracking-wide">
                Ambassador Application
              </h3>
            </div>
            
            <div className="p-8 min-h-[450px]">
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
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">What's your full name?</h2>
                        <p className="text-sm text-gray-600">Please enter your complete name as it appears on official documents</p>
                      </div>
                      <Input
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.full_name}
                        onChange={(e) => updateFormData("full_name", e.target.value)}
                        className="w-full h-12 text-lg border-2 border-gray-200 focus:border-primary rounded-lg"
                        autoFocus
                      />
                    </div>
                  )}

                  {/* Step 1: Age */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">What's your age range?</h2>
                        <p className="text-sm text-gray-600">This helps us understand our ambassador community</p>
                      </div>
                      <Select value={formData.age_range} onValueChange={(value) => updateFormData("age_range", value)}>
                        <SelectTrigger className="w-full h-12 text-lg border-2 border-gray-200 focus:border-primary">
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
                    </div>
                  )}

                  {/* Step 2: Email (moved earlier) */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                          <Mail className="w-6 h-6 text-primary" />
                          What's your email address?
                        </h2>
                        <p className="text-sm text-gray-600">We'll use this to contact you about your application and updates</p>
                      </div>
                      <Input
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={(e) => updateFormData("email", e.target.value)}
                        className="w-full h-12 text-lg border-2 border-gray-200 focus:border-primary rounded-lg"
                        autoFocus
                      />
                    </div>
                  )}

                  {/* Step 3: WhatsApp (moved earlier) */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                          <MessageCircle className="w-6 h-6 text-primary" />
                          What's your WhatsApp number?
                        </h2>
                        <p className="text-sm text-gray-600">We'll use this to contact you via WhatsApp for quick updates</p>
                      </div>
                      <Input
                        type="tel"
                        placeholder="+237 6XX XXX XXX"
                        value={formData.whatsapp_number}
                        onChange={(e) => updateFormData("whatsapp_number", e.target.value)}
                        className="w-full h-12 text-lg border-2 border-gray-200 focus:border-primary rounded-lg"
                        autoFocus
                      />
                    </div>
                  )}

                  {/* Step 4: Gender */}
                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">What's your gender?</h2>
                        <p className="text-sm text-gray-600">This information helps us ensure diversity in our ambassador program</p>
                      </div>
                      <div className="space-y-3">
                        {["male", "female", "prefer_not_to_say"].map((option) => (
                          <label
                            key={option}
                            className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                              formData.gender === option
                                ? "border-primary bg-primary/10"
                                : "border-gray-200 hover:border-primary/50 hover:bg-primary/5"
                            }`}
                          >
                            <input
                              type="radio"
                              name="gender"
                              value={option}
                              checked={formData.gender === option}
                              onChange={(e) => updateFormData("gender", e.target.value)}
                              className="w-5 h-5 text-primary"
                            />
                            <span className="capitalize text-gray-700 font-medium">{option.replace("_", " ")}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 5: City */}
                  {currentStep === 5 && (
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">What city or town are you in?</h2>
                        <p className="text-sm text-gray-600">Help us understand where our ambassadors are located</p>
                      </div>
                      <Input
                        type="text"
                        placeholder="Enter your city or town"
                        value={formData.city}
                        onChange={(e) => updateFormData("city", e.target.value)}
                        className="w-full h-12 text-lg border-2 border-gray-200 focus:border-primary rounded-lg"
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
                        "Helping students find personal Educators",
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
                  )}

                  {/* Step 6: Region */}
                  {currentStep === 6 && (
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Which region of Cameroon are you in?</h2>
                        <p className="text-sm text-gray-600">Select your region from the list below</p>
                      </div>
                      <Select value={formData.region} onValueChange={(value) => updateFormData("region", value)}>
                        <SelectTrigger className="w-full h-12 text-lg border-2 border-gray-200 focus:border-primary">
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
                    </div>
                  )}

                  {/* Step 7: Current Status */}
                  {currentStep === 7 && (
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">What's your current status?</h2>
                        <p className="text-sm text-gray-600">Tell us about your current professional or academic status</p>
                      </div>
                      <Select value={formData.status} onValueChange={(value) => updateFormData("status", value)}>
                        <SelectTrigger className="w-full h-12 text-lg border-2 border-gray-200 focus:border-primary">
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
                          className="w-full h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-lg mt-4"
                          autoFocus
                        />
                      )}
                    </div>
                  )}

                  {/* Step 8: Student Class/Level (conditional - only if status is "student") */}
                  {currentStep === 8 && shouldShowStudentStep() && (
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">What's your current class or level?</h2>
                        <p className="text-sm text-gray-600">Please specify your current class, grade, or academic level (e.g., Form 5, Level 300, 2nd Year, etc.)</p>
                      </div>
                      <Input
                        type="text"
                        placeholder="e.g., Form 5, Level 300, 2nd Year, etc."
                        value={formData.student_class_level}
                        onChange={(e) => updateFormData("student_class_level", e.target.value)}
                        className="w-full h-12 text-lg border-2 border-gray-200 focus:border-primary rounded-lg"
                        autoFocus
                      />
                    </div>
                  )}

                  {/* Step 8/9: Motivation (Step 8 if not student, Step 9 if student) */}
                  {((currentStep === 8 && !shouldShowStudentStep()) || (currentStep === 9 && shouldShowStudentStep())) && (
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">What motivates you to become a PrepSkul Ambassador?</h2>
                        <p className="text-sm text-gray-600">Share what drives your passion for education and community</p>
                      </div>
                      <Textarea
                        placeholder="Share your motivation..."
                        value={formData.motivation}
                        onChange={(e) => updateFormData("motivation", e.target.value)}
                        className="w-full min-h-[200px] text-lg border-2 border-gray-200 focus:border-primary rounded-lg"
                        autoFocus
                      />
                    </div>
                  )}

                  {/* Step 9/10: Mission Alignment (Step 9 if not student, Step 10 if student) */}
                  {((currentStep === 9 && !shouldShowStudentStep()) || (currentStep === 10 && shouldShowStudentStep())) && (
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Which PrepSkul missions align with you?</h2>
                        <p className="text-sm text-gray-600">Select all that apply</p>
                      </div>
                      <div className="space-y-3">
                        {[
                          "Helping students find tutors",
                          "Creating learning opportunities",
                          "Building trust in education",
                          "Leadership & personal growth",
                        ].map((goal) => (
                          <label
                            key={goal}
                            className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                              formData.alignment_goals.includes(goal)
                                ? "border-primary bg-primary/10"
                                : "border-gray-200 hover:border-primary/50 hover:bg-primary/5"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={formData.alignment_goals.includes(goal)}
                              onChange={() => toggleCheckbox("alignment_goals", goal)}
                              className="w-5 h-5 text-primary rounded"
                            />
                            <span className="text-gray-700 font-medium">{goal}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 10/11: Explain PrepSkul (Step 10 if not student, Step 11 if student) */}
                  {((currentStep === 10 && !shouldShowStudentStep()) || (currentStep === 11 && shouldShowStudentStep())) && (
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">How would you explain PrepSkul to a friend?</h2>
                        <p className="text-sm text-gray-600">Share how you would describe PrepSkul in your own words</p>
                      </div>
                      <Textarea
                        placeholder="Share your explanation..."
                        value={formData.explanation}
                        onChange={(e) => updateFormData("explanation", e.target.value)}
                        className="w-full min-h-[200px] text-lg border-2 border-gray-200 focus:border-primary rounded-lg"
                        autoFocus
                      />
                    </div>
                  )}

                  {/* Step 11/12: Social Media Presence (Step 11 if not student, Step 12 if student) */}
                  {((currentStep === 11 && !shouldShowStudentStep()) || (currentStep === 12 && shouldShowStudentStep())) && (
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Which social media platforms do you use?</h2>
                        <p className="text-sm text-gray-600">Select all that apply</p>
                      </div>
                      <div className="space-y-3">
                        {SOCIAL_PLATFORMS.map((platform) => (
                          <label
                            key={platform}
                            className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                              formData.social_platforms.some((p) => p.platform === platform)
                                ? "border-primary bg-primary/10"
                                : "border-gray-200 hover:border-primary/50 hover:bg-primary/5"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={formData.social_platforms.some((p) => p.platform === platform)}
                              onChange={() => toggleSocialPlatform(platform)}
                              className="w-5 h-5 text-primary rounded"
                            />
                            <span className="text-gray-700 font-medium">{platform}</span>
                          </label>
                        ))}
                        <label
                          className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            formData.social_platforms.length === 0
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.social_platforms.length === 0}
                            onChange={() => {
                              if (formData.social_platforms.length > 0) {
                                updateFormData("social_platforms", [])
                              }
                            }}
                            className="w-5 h-5 text-blue-600 rounded"
                          />
                          <span className="text-gray-700 font-medium">None</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Step 12/13: Social Links (Step 12 if not student, Step 13 if student) - Only show if platforms selected */}
                  {((currentStep === 12 && !shouldShowStudentStep()) || (currentStep === 13 && shouldShowStudentStep())) && formData.social_platforms.length > 0 && (
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us about your social media presence</h2>
                        <p className="text-sm text-gray-600">Provide details for the platforms you selected</p>
                      </div>
                      <div className="space-y-4">
                        {formData.social_platforms.map((platform) => (
                          <div key={platform.platform} className="p-5 border-2 border-primary/20 rounded-xl bg-primary/5 space-y-3">
                            <h3 className="font-semibold text-gray-900">{platform.platform}</h3>
                            <Input
                              type="text"
                              placeholder="Username or profile link"
                              value={platform.username}
                              onChange={(e) => updateSocialPlatform(platform.platform, "username", e.target.value)}
                              className="w-full h-11 border-2 border-gray-200 focus:border-primary rounded-lg"
                            />
                            <Input
                              type="number"
                              placeholder="Approximate followers"
                              value={platform.followers || ""}
                              onChange={(e) => updateSocialPlatform(platform.platform, "followers", parseInt(e.target.value) || 0)}
                              className="w-full h-11 border-2 border-gray-200 focus:border-primary rounded-lg"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 13/14: Social Media Influence Rating (Step 13 if not student, Step 14 if student) */}
                  {((currentStep === 13 && !shouldShowStudentStep()) || (currentStep === 14 && shouldShowStudentStep())) && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Rate the influence and reach of your social media accounts</h2>
                        <p className="text-sm text-gray-600">On a scale of 0 to 100, how impactful do you think your social media presence can be?</p>
                      </div>
                      
                      {/* Slider Design */}
                      <div className="flex flex-col items-center justify-center space-y-8 py-8">
                        {/* Central Circle with Value */}
                        <div className="relative">
                          <div className="w-36 h-36 rounded-full bg-primary/10 border-4 border-primary flex items-center justify-center shadow-xl">
                            <span className="text-5xl font-bold text-primary">{formData.social_media_influence_rating ?? 50}</span>
                          </div>
                        </div>
                        
                        {/* Slider with Horizontal Labels */}
                        <div className="relative w-full max-w-2xl px-8">
                          {/* Horizontal Slider Track */}
                          <div className="relative h-4 bg-gray-200 rounded-full mb-8">
                            {/* Filled portion */}
                            <div 
                              className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-200"
                              style={{ width: `${formData.social_media_influence_rating ?? 50}%` }}
                            ></div>
                            
                            {/* Selector Dot on Slider */}
                            <div
                              className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-primary rounded-full border-4 border-white shadow-xl z-20 cursor-pointer"
                              style={{
                                left: `${formData.social_media_influence_rating ?? 50}%`,
                              }}
                            ></div>
                          </div>
                          
                          {/* Hidden input for interaction */}
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="10"
                            value={formData.social_media_influence_rating ?? 50}
                            onChange={(e) => updateFormData("social_media_influence_rating", parseInt(e.target.value))}
                            className="absolute top-0 left-0 w-full h-4 opacity-0 cursor-pointer z-30"
                          />
                          
                          {/* Horizontal Labels Below Slider */}
                          <div className="relative w-full flex justify-between px-2 mt-4">
                            {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((value) => {
                              const isActive = formData.social_media_influence_rating === value
                              
                              return (
                                <div
                                  key={value}
                                  className="flex flex-col items-center"
                                >
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold transition-all mb-1 ${
                                    isActive 
                                      ? 'bg-primary text-white border-2 border-primary shadow-lg scale-125' 
                                      : 'bg-white text-gray-600 border-2 border-gray-300 shadow-md'
                                  }`}>
                                    {value}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 14/15: Promotion Methods (Step 14 if not student, Step 15 if student) */}
                  {((currentStep === 14 && !shouldShowStudentStep()) || (currentStep === 15 && shouldShowStudentStep())) && (
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">How would you love to promote PrepSkul?</h2>
                        <p className="text-sm text-gray-600">Select all that apply</p>
                      </div>
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
                            className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                              formData.promotion_methods.includes(method)
                                ? "border-primary bg-primary/10"
                                : "border-gray-200 hover:border-primary/50 hover:bg-primary/5"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={formData.promotion_methods.includes(method)}
                              onChange={() => toggleCheckbox("promotion_methods", method)}
                              className="w-5 h-5 text-primary rounded"
                            />
                            <span className="text-gray-700 font-medium">{method}</span>
                          </label>
                        ))}
                      </div>
                      {formData.promotion_methods.includes("Other") && (
                        <Input
                          type="text"
                          placeholder="Please specify other promotion methods"
                          value={formData.promotion_methods_other}
                          onChange={(e) => updateFormData("promotion_methods_other", e.target.value)}
                          className="w-full h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-lg mt-4"
                          autoFocus
                        />
                      )}
                    </div>
                  )}

                  {/* Step 15/16: Creative Idea (Step 15 if not student, Step 16 if student) */}
                  {((currentStep === 15 && !shouldShowStudentStep()) || (currentStep === 16 && shouldShowStudentStep())) && (
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Share one creative idea to promote PrepSkul</h2>
                        <p className="text-sm text-gray-600">We'd love to hear your innovative ideas</p>
                      </div>
                      <Textarea
                        placeholder="Your creative idea..."
                        value={formData.creative_idea}
                        onChange={(e) => updateFormData("creative_idea", e.target.value)}
                        className="w-full min-h-[200px] text-lg border-2 border-gray-200 focus:border-primary rounded-lg"
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
                    <p className="text-sm text-gray-600 mb-4">JPG or PNG, max 5MB</p>
                    <div className="space-y-4">
                      {imagePreviewUrl ? (
                        <div className="relative w-full">
                          <div className="relative w-full h-64 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                            <img
                              src={imagePreviewUrl}
                              alt="Profile preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => {
                                updateFormData("profile_image", null)
                                if (imagePreviewUrl) {
                                  URL.revokeObjectURL(imagePreviewUrl)
                                  setImagePreviewUrl(null)
                                }
                                setImageError(null)
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                              aria-label="Remove image"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                          <button
                            onClick={() => {
                              // Trigger file input click
                              const input = document.createElement('input')
                              input.type = 'file'
                              input.accept = 'image/jpeg,image/jpg,image/png'
                              input.onchange = (e) => {
                                const target = e.target as HTMLInputElement
                                if (target.files?.[0]) {
                                  handleImageUpload({ target } as React.ChangeEvent<HTMLInputElement>)
                                }
                              }
                              input.click()
                            }}
                            className="mt-3 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                          >
                            Replace image
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-primary/50 transition-all group">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-12 h-12 text-gray-400 mb-4 group-hover:text-primary transition-colors" />
                            <p className="mb-2 text-sm text-gray-600 group-hover:text-gray-900">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">JPG or PNG (MAX. 5MB)</p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/jpeg,image/jpg,image/png"
                            onChange={handleImageUpload}
                          />
                        </label>
                      )}
                      {imageError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-700">{imageError}</p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex items-center gap-2 h-12 px-6 border-2 border-gray-300 hover:border-primary hover:bg-primary/5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            {currentStep < 16 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-2 h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className="flex items-center gap-2 h-12 px-8 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl"
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
