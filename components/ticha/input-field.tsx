"use client"

import { useState, useRef } from "react"
import type { ChangeEvent, MouseEvent, KeyboardEvent } from "react"
import { Upload, ArrowRight, X, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface InputFieldProps {
  onSend?: (text: string, file?: File) => void
}

export function InputField({ onSend }: InputFieldProps) {
  const [text, setText] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setSelectedFile(files[0])
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveFile = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSend = () => {
    if (text.trim() || selectedFile) {
      onSend?.(text.trim(), selectedFile || undefined)
      setText("")
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="w-full space-y-3">
      {selectedFile && (
        <div
          className="flex items-center gap-3 p-3 rounded-xl border-none"
          style={{
            background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
            boxShadow: "inset 2px 2px 4px rgba(209, 209, 209, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.8)",
          }}
        >
          <File className="h-5 w-5 text-gray-900 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate text-gray-900" style={{  }}>
              {selectedFile.name}
            </p>
            <p className="text-xs text-gray-600" style={{  }}>
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg border-none flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
              boxShadow: "2px 2px 4px rgba(209, 209, 209, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.8)",
              color: "#2d3748",
            }}
            onClick={handleRemoveFile}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div
        className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl border-none"
        style={{
          background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
            boxShadow: "3px 3px 8px rgba(190, 190, 190, 0.4), -3px -3px 8px rgba(255, 255, 255, 0.8)",
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.docx,.jpg,.png"
          onChange={handleFileSelect}
          className="hidden"
        />

        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl border-none flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
            boxShadow: "2px 2px 4px rgba(209, 209, 209, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.8)",
            color: "#2d3748",
          }}
          onClick={handleUploadClick}
        >
          <Upload className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>

        <Input
          type="text"
          placeholder="Type your message or upload a file..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 border-none rounded-xl text-sm sm:text-base focus-visible:ring-0 focus-visible:ring-offset-0"
          style={{
            background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
            boxShadow: "inset 2px 2px 4px rgba(209, 209, 209, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.8)",
            color: "#2d3748",
            
          }}
        />

        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl border-none flex-shrink-0 disabled:opacity-50"
          style={{
            background: text.trim() || selectedFile
              ? "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)"
              : "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
            boxShadow: text.trim() || selectedFile
              ? "2px 2px 4px rgba(209, 209, 209, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.8)"
              : "inset 2px 2px 4px rgba(209, 209, 209, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.8)",
            color: text.trim() || selectedFile ? "#2d3748" : "#9ca3af",
          }}
          onClick={handleSend}
          disabled={!text.trim() && !selectedFile}
        >
          <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      </div>
    </div>
  )
}
