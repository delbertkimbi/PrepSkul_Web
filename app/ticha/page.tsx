"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { TichaHeader } from "@/components/ticha/header"
import { TichaFooter } from "@/components/ticha/footer"
import { InputField } from "@/components/ticha/input-field"
import { TichaTypewriter } from "@/components/ticha/typewriter"
import { Card, CardContent } from "@/components/ui/card"
import { Zap, Shield, Send } from "lucide-react"

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

  const handleSend = (text: string, file?: File) => {
    console.log("Sending:", { text, file: file?.name })
    // TODO: Implement submission logic
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)", fontFamily: "'Inter', 'Poppins', sans-serif" }}>
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
                style={{ fontFamily: "'Inter', 'Poppins', sans-serif", letterSpacing: "-0.03em", fontWeight: 800 }}
              >
                <TichaTypewriter />
              </motion.h1>
              <motion.p
                variants={fadeInUp}
                className="text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed text-gray-700"
                style={{ fontFamily: "'Inter', 'Poppins', sans-serif", fontWeight: 400 }}
              >
                Upload your handwritten notes, PDFs, or text documents. Our AI instantly converts them into structured,
                beautiful PowerPoint presentations.
              </motion.p>
            </motion.div>

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
                            <span className="text-xl sm:text-2xl font-bold" style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}>1</span>
                          </div>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: "'Inter', 'Poppins', sans-serif", fontWeight: 700 }}>
                          Upload
                        </h3>
                        <p className="text-sm text-gray-600" style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}>
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
                            <span className="text-xl sm:text-2xl font-bold" style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}>2</span>
                          </div>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: "'Inter', 'Poppins', sans-serif", fontWeight: 700 }}>
                          AI Processing
                        </h3>
                        <p className="text-sm text-gray-600" style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}>
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
                            <span className="text-xl sm:text-2xl font-bold" style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}>3</span>
                          </div>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: "'Inter', 'Poppins', sans-serif", fontWeight: 700 }}>
                          Present
                        </h3>
                        <p className="text-sm text-gray-600" style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}>
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
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900" style={{ fontFamily: "'Inter', 'Poppins', sans-serif", fontWeight: 800, letterSpacing: "-0.02em" }}>
                    About TichaAI
                  </h2>
                  <p className="text-base sm:text-lg leading-relaxed max-w-2xl mx-auto text-gray-700" style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}>
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
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: "'Inter', 'Poppins', sans-serif", fontWeight: 700 }}>
                          Lightning Fast
                        </h3>
                        <p className="text-sm leading-relaxed text-gray-600" style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}>
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
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: "'Inter', 'Poppins', sans-serif", fontWeight: 700 }}>
                          Secure & Private
                        </h3>
                        <p className="text-sm leading-relaxed text-gray-600" style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}>
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
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: "'Inter', 'Poppins', sans-serif", fontWeight: 700 }}>
                          Export Ready
                        </h3>
                        <p className="text-sm leading-relaxed text-gray-600" style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}>
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
