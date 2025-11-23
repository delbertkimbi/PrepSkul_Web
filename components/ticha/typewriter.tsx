"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface TypewriterProps {
  className?: string
}

const words = ["Notes", "Ideas", "Docs"]
const baseText = "Turn your"
const suffixText = "into presentations"

export function TichaTypewriter({ className = "" }: TypewriterProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentText, setCurrentText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined' || !words.length) return

    const word = words[currentWordIndex]
    let timeout: NodeJS.Timeout

    // Typing logic
    if (isPaused) {
      // If paused (either fully typed or fully deleted)
      if (!isDeleting && currentText === word) {
        // Pause at END of word before deleting
        timeout = setTimeout(() => {
          setIsPaused(false)
          setIsDeleting(true)
        }, 2000)
      } else if (isDeleting && currentText === "") {
        // IMMEDIATELY switch to next word and start typing
        setIsPaused(false)
        setIsDeleting(false)
        setCurrentWordIndex((prev) => (prev + 1) % words.length)
      }
    } else {
      // Typing or Deleting action
      const speed = isDeleting ? 50 : 100
      
      timeout = setTimeout(() => {
        if (!isDeleting) {
          // Typing
          const nextText = word.slice(0, currentText.length + 1)
          setCurrentText(nextText)
          
          if (nextText === word) {
            setIsPaused(true)
          }
        } else {
          // Deleting
          const nextText = word.slice(0, currentText.length - 1)
          setCurrentText(nextText)
          
          if (nextText === "") {
            setIsPaused(true)
          }
        }
      }, speed)
    }

    return () => clearTimeout(timeout)
  }, [currentText, isDeleting, isPaused, currentWordIndex])

  // Blink cursor independent of typing
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <span className={`relative inline-flex flex-wrap justify-center items-center gap-2 ${className}`}>
      <span>{baseText}</span>
      
      <span className="relative inline-flex items-center justify-center min-w-[4ch] h-[1.2em]">
        {/* Animated Blob Background */}
        <AnimatePresence mode="wait">
          {currentText.length > 0 && (
            <motion.span
              className="absolute inset-0 -z-10 bg-yellow-300/40 rounded-[30%_70%_70%_30%/30%_30%_70%_70%] blur-sm"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ 
                opacity: 1, 
                scale: 1.2,
                borderRadius: ["30% 70% 70% 30% / 30% 30% 70% 70%", "60% 40% 30% 70% / 60% 30% 70% 40%", "30% 70% 70% 30% / 30% 30% 70% 70%"]
              }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ 
                duration: 2, 
                ease: "easeInOut", 
                repeat: Infinity,
                opacity: { duration: 0.2 },
                scale: { duration: 0.2 }
              }}
              style={{
                width: "120%",
                height: "140%",
                left: "-10%",
                top: "-20%"
              }}
            />
          )}
        </AnimatePresence>

        <span className="relative z-10 text-black font-extrabold">
          {currentText}
        </span>
        
        <span 
          className="inline-block ml-0.5 w-[3px] h-[1em] bg-black align-middle"
          style={{ opacity: showCursor ? 1 : 0 }} 
        />
      </span>

      <span>{suffixText}</span>
    </span>
  )
}
