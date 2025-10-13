"use client"

import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function WhatsAppButton() {
  const handleWhatsAppClick = () => {
    window.open(
      "https://wa.me/237674089066?text=Hello%20PrepSkul%2C%20I%20am%20interested%20in%20joining%20PrepSkul%20as%20a%20%5Btutor%2Fstudent%2Fparent%5D.%20How%20may%20I%20proceed%3F",
      "_blank",
    )
  }

  return (
    <Button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg bg-[#25D366] hover:bg-[#20BA5A] text-white z-50 hover:scale-110 transition-transform"
      size="icon"
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </Button>
  )
}
