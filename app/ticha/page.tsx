"use client"

import { useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { TichaHeader } from "@/components/ticha/header"
import { TichaFooter } from "@/components/ticha/footer"
import { InputField } from "@/components/ticha/input-field"
import { TichaTypewriter } from "@/components/ticha/typewriter"
import { Card, CardContent } from "@/components/ui/card"
import { Zap, Shield, Send, Loader2, CheckCircle, AlertCircle, Download } from "lucide-react"
import { tichaSupabase } from "@/lib/ticha-supabase"

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
}

export default function TichaPage() {
  const heroRef = useRef(null)
  const inputRef = useRef(null)
  const stepsRef = useRef(null)
  const aboutRef = useRef(null)
  const featuresRef = useRef(null)

  const heroInView = useInView(heroRef, { once: true, amount: 0.3 })
  const inputInView = useInView(inputRef, { once: true, amount: 0.3 })
  const stepsInView = useInView(stepsRef, { once: true, amount: 0.2 })
  const aboutInView = useInView(aboutRef, { once: true, amount: 0.3 })
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.2 })

  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle")
  const [statusMessage, setStatusMessage] = useState("")
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSend = async (text: string, file?: File) => {
    if (!file && !text.trim()) {
      setError("Please upload a file or enter text")
      return
    }

    setLoading(true)
    setStatus("uploading")
    setError(null)
    setStatusMessage("")
    setDownloadUrl(null)

    try {
      // Get current user (optional)
      const { data: { user } } = await tichaSupabase.auth.getUser()
      const userId = user?.id

      let fileUrl: string | null = null

      // Step 1: Upload file if provided
      if (file) {
        setStatusMessage("Uploading file...")
        const formData = new FormData()
        formData.append("file", file)
        if (text.trim()) {
          formData.append("prompt", text.trim())
        }

        const uploadResponse = await fetch("/api/ticha/upload", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          let uploadError: any
          try {
            uploadError = await uploadResponse.json()
          } catch (e) {
            // If response is not JSON (might be HTML error page)
            const text = await uploadResponse.text()
            throw new Error(`Upload failed (${uploadResponse.status}): ${text.substring(0, 200)}`)
          }
          throw new Error(uploadError.error || uploadError.message || `Upload failed: ${uploadResponse.status}`)
        }

        const uploadData = await uploadResponse.json()
        fileUrl = uploadData.fileUrl
        setStatusMessage(`File uploaded! Processing...`)
      }

      // Step 2: Generate presentation
      setStatus("processing")
      setStatusMessage("Generating presentation...")

      const generateResponse = await fetch("/api/ticha/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileUrl: fileUrl || undefined,
          prompt: text.trim() || undefined,
          userId: userId || undefined,
        }),
      })

      if (!generateResponse.ok) {
        let generateError: any
        try {
          generateError = await generateResponse.json()
        } catch (e) {
          // If response is not JSON (might be HTML error page)
          const text = await generateResponse.text()
          throw new Error(`Generation failed (${generateResponse.status}): ${text.substring(0, 200)}`)
        }
        throw new Error(generateError.error || generateError.message || `Generation failed: ${generateResponse.status}`)
      }

      const generateData = await generateResponse.json()

      if (!generateData.success || !generateData.downloadUrl) {
        throw new Error("Failed to generate presentation")
      }

      // Success!
      setStatus("success")
      setStatusMessage(`Presentation generated! ${generateData.slides || 0} slides created.`)
      setDownloadUrl(generateData.downloadUrl)

    } catch (err: any) {
      console.error("Error:", err)
      setStatus("error")
      setError(err.message || "Something went wrong. Please try again.")
      setStatusMessage("")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",  }}>
      <TichaHeader />

      <main className="flex-1">
        <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-4xl">
            {/* Headline with Typewriter */}
            <motion.div
              ref={heroRef}
              initial="hidden"
              animate={heroInView ? "visible" : "hidden"}
              variants={staggerContainer}
              className="text-center mb-8 sm:mb-12 space-y-4 sm:space-y-6"
            >
              <motion.h1
                variants={fadeInUp}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-gray-900"
                style={{  letterSpacing: "-0.03em", fontWeight: 800 }}
              >
                <TichaTypewriter />
              </motion.h1>
              <motion.p
                variants={fadeInUp}
                className="text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed text-gray-700"
                style={{  fontWeight: 400 }}
              >
                Upload your handwritten notes, PDFs, or text documents. Our AI instantly converts them into structured,
                beautiful PowerPoint presentations.
              </motion.p>
            </motion.div>

            {/* Status Messages */}
            {(loading || status !== "idle" || error) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto mb-6"
              >
                <Card
                  className={`border-none rounded-xl ${
                    status === "success"
                      ? "bg-green-50"
                      : status === "error"
                      ? "bg-red-50"
                      : "bg-blue-50"
                  }`}
                  style={{
                    boxShadow: "3px 3px 8px rgba(190, 190, 190, 0.4), -3px -3px 8px rgba(255, 255, 255, 0.8)",
                  }}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start gap-4">
                      {loading && <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 animate-spin flex-shrink-0 mt-0.5" />}
                      {status === "success" && <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0 mt-0.5" />}
                      {status === "error" && <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 flex-shrink-0 mt-0.5" />}
                      <div className="flex-1 min-w-0">
                        {loading && (
                          <p className="font-medium text-sm sm:text-base text-blue-900" style={{  }}>
                            {statusMessage || "Processing..."}
                          </p>
                        )}
                        {status === "success" && (
                          <>
                            <p className="font-medium text-sm sm:text-base text-green-900 mb-2" style={{  }}>
                              {statusMessage || "Presentation generated successfully!"}
                            </p>
                            {downloadUrl && (
                              <a
                                href={downloadUrl}
                                download
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                                style={{  }}
                              >
                                <Download className="h-4 w-4" />
                                Download Presentation
                              </a>
                            )}
                          </>
                        )}
                        {status === "error" && (
                          <p className="font-medium text-sm sm:text-base text-red-900" style={{  }}>
                            {error || "An error occurred"}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Input Field with Upload and Send */}
            <motion.div
              ref={inputRef}
              initial="hidden"
              animate={inputInView ? "visible" : "hidden"}
              variants={fadeInUp}
              className="max-w-2xl mx-auto mb-12 sm:mb-20"
            >
              <InputField onSend={handleSend} />
            </motion.div>

            {/* Three-Step Process */}
            <motion.section
              ref={stepsRef}
              initial="hidden"
              animate={stepsInView ? "visible" : "hidden"}
              variants={staggerContainer}
              className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8"
              id="steps"
            >
              <div className="container mx-auto max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                  {/* Step 1 */}
                  <motion.div variants={fadeInUp} className="max-w-[90%] sm:max-w-full mx-auto">
                    <Card
                      className="border-none rounded-2xl transition-transform hover:scale-105"
                      style={{
                        background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
                        boxShadow: "3px 3px 8px rgba(190, 190, 190, 0.4), -3px -3px 8px rgba(255, 255, 255, 0.8)",
                      }}
                    >
                      <CardContent className="p-5 sm:p-6 md:p-8 text-center space-y-4">
                        <div className="flex justify-center">
                          <div
                            className="h-14 w-14 sm:h-16 sm:w-16 rounded-full flex items-center justify-center"
                            style={{
                              background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
                              boxShadow: "inset 2px 2px 4px rgba(190, 190, 190, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.8)",
                              color: "#2d3748",
                            }}
                          >
                            <span className="text-xl sm:text-2xl font-bold" style={{  }}>1</span>
                          </div>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900" style={{  fontWeight: 700 }}>
                          Upload
                        </h3>
                        <p className="text-sm text-gray-600" style={{  }}>
                          Drop your notes or documents
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Step 2 */}
                  <motion.div variants={fadeInUp} className="max-w-[90%] sm:max-w-full mx-auto">
                    <Card
                      className="border-none rounded-2xl transition-transform hover:scale-105"
                      style={{
                        background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
                        boxShadow: "3px 3px 8px rgba(190, 190, 190, 0.4), -3px -3px 8px rgba(255, 255, 255, 0.8)",
                      }}
                    >
                      <CardContent className="p-5 sm:p-6 md:p-8 text-center space-y-4">
                        <div className="flex justify-center">
                          <div
                            className="h-14 w-14 sm:h-16 sm:w-16 rounded-full flex items-center justify-center"
                            style={{
                              background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
                              boxShadow: "inset 2px 2px 4px rgba(190, 190, 190, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.8)",
                              color: "#2d3748",
                            }}
                          >
                            <span className="text-xl sm:text-2xl font-bold" style={{  }}>2</span>
                          </div>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900" style={{  fontWeight: 700 }}>
                          AI Processing
                        </h3>
                        <p className="text-sm text-gray-600" style={{  }}>
                          We structure and design slides
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Step 3 */}
                  <motion.div variants={fadeInUp} className="max-w-[90%] sm:max-w-full mx-auto">
                    <Card
                      className="border-none rounded-2xl transition-transform hover:scale-105"
                      style={{
                        background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
                        boxShadow: "3px 3px 8px rgba(190, 190, 190, 0.4), -3px -3px 8px rgba(255, 255, 255, 0.8)",
                      }}
                    >
                      <CardContent className="p-5 sm:p-6 md:p-8 text-center space-y-4">
                        <div className="flex justify-center">
                          <div
                            className="h-14 w-14 sm:h-16 sm:w-16 rounded-full flex items-center justify-center"
                            style={{
                              background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
                              boxShadow: "inset 2px 2px 4px rgba(190, 190, 190, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.8)",
                              color: "#2d3748",
                            }}
                          >
                            <span className="text-xl sm:text-2xl font-bold" style={{  }}>3</span>
                          </div>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900" style={{  fontWeight: 700 }}>
                          Present
                        </h3>
                        <p className="text-sm text-gray-600" style={{  }}>
                          Download or present instantly
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>
            </motion.section>

            {/* About TichaAI - Plain Text */}
            <motion.section
              ref={aboutRef}
              initial="hidden"
              animate={aboutInView ? "visible" : "hidden"}
              variants={fadeInUp}
              className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16"
              id="about"
            >
              <div className="container mx-auto max-w-3xl">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900" style={{  fontWeight: 800, letterSpacing: "-0.02em" }}>
                    About TichaAI
                  </h2>
                  <p className="text-base sm:text-lg leading-relaxed max-w-2xl mx-auto text-gray-700" style={{  }}>
                    TichaAI is your intelligent presentation assistant, designed to transform any content into
                    professional, engaging presentations in seconds.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Feature Highlights */}
            <motion.section
              ref={featuresRef}
              initial="hidden"
              animate={featuresInView ? "visible" : "hidden"}
              variants={staggerContainer}
              className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20"
            >
              <div className="container mx-auto max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                  {/* Lightning Fast */}
                  <motion.div variants={fadeInUp} className="max-w-[90%] sm:max-w-full mx-auto">
                    <Card
                      className="border-none rounded-2xl transition-transform hover:scale-105"
                      style={{
                        background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
                        boxShadow: "3px 3px 8px rgba(190, 190, 190, 0.4), -3px -3px 8px rgba(255, 255, 255, 0.8)",
                      }}
                    >
                      <CardContent className="p-5 sm:p-6 md:p-8 text-center space-y-4">
                        <div className="flex justify-center">
                          <div
                            className="h-14 w-14 sm:h-16 sm:w-16 rounded-full flex items-center justify-center"
                            style={{
                              background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
                              boxShadow: "inset 2px 2px 4px rgba(190, 190, 190, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.8)",
                            }}
                          >
                            <Zap className="h-7 w-7 sm:h-8 sm:w-8 text-gray-900" />
                          </div>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900" style={{  fontWeight: 700 }}>
                          Lightning Fast
                        </h3>
                        <p className="text-sm leading-relaxed text-gray-600" style={{  }}>
                          Generate complete presentations in under a minute with our advanced AI technology.
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Secure & Private */}
                  <motion.div variants={fadeInUp} className="max-w-[90%] sm:max-w-full mx-auto">
                    <Card
                      className="border-none rounded-2xl transition-transform hover:scale-105"
                      style={{
                        background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
                        boxShadow: "3px 3px 8px rgba(190, 190, 190, 0.4), -3px -3px 8px rgba(255, 255, 255, 0.8)",
                      }}
                    >
                      <CardContent className="p-5 sm:p-6 md:p-8 text-center space-y-4">
                        <div className="flex justify-center">
                          <div
                            className="h-14 w-14 sm:h-16 sm:w-16 rounded-full flex items-center justify-center"
                            style={{
                              background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
                              boxShadow: "inset 2px 2px 4px rgba(190, 190, 190, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.8)",
                            }}
                          >
                            <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-gray-900" />
                          </div>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900" style={{  fontWeight: 700 }}>
                          Secure & Private
                        </h3>
                        <p className="text-sm leading-relaxed text-gray-600" style={{  }}>
                          Your documents are processed securely and never shared. Your data stays yours.
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Export Ready */}
                  <motion.div variants={fadeInUp} className="max-w-[90%] sm:max-w-full mx-auto">
                    <Card
                      className="border-none rounded-2xl transition-transform hover:scale-105"
                      style={{
                        background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
                        boxShadow: "3px 3px 8px rgba(190, 190, 190, 0.4), -3px -3px 8px rgba(255, 255, 255, 0.8)",
                      }}
                    >
                      <CardContent className="p-5 sm:p-6 md:p-8 text-center space-y-4">
                        <div className="flex justify-center">
                          <div
                            className="h-14 w-14 sm:h-16 sm:w-16 rounded-full flex items-center justify-center"
                            style={{
                              background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
                              boxShadow: "inset 2px 2px 4px rgba(190, 190, 190, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.8)",
                            }}
                          >
                            <Send className="h-7 w-7 sm:h-8 sm:w-8 text-gray-900" />
                          </div>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900" style={{  fontWeight: 700 }}>
                          Export Ready
                        </h3>
                        <p className="text-sm leading-relaxed text-gray-600" style={{  }}>
                          Download as PowerPoint or present directly from your browser. No software needed.
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>
            </motion.section>
          </div>
        </section>
      </main>

      <TichaFooter />
    </div>
  )
}
