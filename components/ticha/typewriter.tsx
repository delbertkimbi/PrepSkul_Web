"use client"

import { useEffect, useState } from "react"

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
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined' || !words.length) return

    const word = words[currentWordIndex]
    
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (currentText.length < word.length) {
            setCurrentText(word.slice(0, currentText.length + 1))
          } else {
            setTimeout(() => setIsDeleting(true), 2000) // Pause before deleting
          }
        } else {
          if (currentText.length > 0) {
            setCurrentText(word.slice(0, currentText.length - 1))
          } else {
            setIsDeleting(false)
            setCurrentWordIndex((prev) => (prev + 1) % words.length)
          }
        }
      },
      isDeleting ? 50 : 100, // Typing speed
    )

    return () => clearTimeout(timeout)
  }, [currentText, isDeleting, currentWordIndex])

  // Blink cursor
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <span className={className}>
      {baseText}{" "}
      <span style={{ color: "#000", fontWeight: 800 }}>
        {currentText}
        {showCursor && <span className="inline-block ml-0.5">|</span>}
      </span>{" "}
      {suffixText}
    </span>
  )
}

