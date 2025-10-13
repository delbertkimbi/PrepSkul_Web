"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Apple, Play, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function AppDownloadSection() {
  const [showModal, setShowModal] = useState(false)
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + 30)

    const interval = setInterval(() => {
      const now = new Date().getTime()
      const distance = targetDate.getTime() - now

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold">Download the PrepSkul App</h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Get instant access to tutors, track your progress, and learn on the go. Available soon on iOS and Android.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              size="lg"
              variant="outline"
              className="gap-2 text-base font-semibold h-12 px-6 bg-white hover:bg-gray-50"
              onClick={() => setShowModal(true)}
            >
              <Apple className="w-5 h-5" />
              App Store
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 text-base font-semibold h-12 px-6 bg-white hover:bg-gray-50"
              onClick={() => setShowModal(true)}
            >
              <Play className="w-5 h-5" />
              Google Play
            </Button>
          </div>

          <div className="pt-6">
            <p className="text-sm text-muted-foreground mb-3">Launching in:</p>
            <div className="flex gap-4 justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{timeLeft.days}</div>
                <div className="text-xs text-muted-foreground">Days</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{timeLeft.hours}</div>
                <div className="text-xs text-muted-foreground">Hours</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{timeLeft.minutes}</div>
                <div className="text-xs text-muted-foreground">Minutes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{timeLeft.seconds}</div>
                <div className="text-xs text-muted-foreground">Seconds</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-8 max-w-md w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="text-center space-y-4">
                <div className="text-5xl">📱</div>
                <h3 className="text-2xl font-bold">Coming Soon!</h3>
                <p className="text-muted-foreground">
                  The PrepSkul mobile app is launching in {timeLeft.days} days. We'll notify you as soon as it's
                  available for download.
                </p>
                <Button onClick={() => setShowModal(false)} className="w-full">
                  Got it!
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
