"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

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
    <span className={`relative inline-flex flex-wrap justify-center items-center gap-x-2 gap-y-1 ${className}`}>
      <span className="whitespace-nowrap">{baseText}</span>
      
      <span className="relative inline-flex items-center justify-center">
        {/* Organic Highlight Background */}
        <motion.span
          className="absolute inset-0 bg-yellow-300/60 -z-10"
          initial={false}
          animate={{
            borderRadius: [
              "20% 80% 20% 80% / 50% 20% 80% 50%",
              "80% 20% 80% 20% / 20% 80% 20% 80%",
              "20% 80% 20% 80% / 50% 20% 80% 50%"
            ],
            scale: [0.95, 1.02, 0.95],
            rotate: [-1, 1, -1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            // Ensure it's hidden when text is empty to prevent artifacts
            opacity: currentText ? 1 : 0,
            // Make it slightly larger than the text
            left: "-0.2em",
            right: "-0.2em",
            top: "0.1em",
            bottom: "0.05em",
          }}
        />

        <span className="relative z-10 font-extrabold px-0.5">
          {currentText}
        </span>
        
        <span 
          className="inline-block ml-0.5 w-[2px] h-[1em] bg-black align-middle"
          style={{ opacity: showCursor ? 1 : 0 }} 
        />
      </span>

      <span className="whitespace-nowrap">{suffixText}</span>
    </span>
  )
}
