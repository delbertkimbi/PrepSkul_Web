"use client"

import { useState, useRef } from "react"
import type { DragEvent, ChangeEvent, MouseEvent } from "react"
import { Upload, File, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onFileSelect?: (file: File) => void
  acceptedTypes?: string[]
  maxSize?: number // in MB
}

export function FileUpload({ onFileSelect, acceptedTypes = ["pdf", "txt", "docx", "jpg", "png"], maxSize = 50 }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }

  const processFile = (file: File) => {
    // Check file type
    const fileExtension = file.name.split(".").pop()?.toLowerCase()
    if (fileExtension && !acceptedTypes.includes(fileExtension)) {
      alert(`File type not supported. Please upload: ${acceptedTypes.join(", ").toUpperCase()}`)
      return
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSize) {
      alert(`File size exceeds ${maxSize}MB limit`)
      return
    }

    setSelectedFile(file)
    onFileSelect?.(file)
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const acceptedTypesString = acceptedTypes.map((type) => `.${type}`).join(",")

  return (
    <div className="w-full">
      <div
        className={cn(
          "relative w-full rounded-2xl p-8 sm:p-10 lg:p-12 text-center transition-all cursor-pointer border-2 border-dashed",
          isDragging && "scale-[1.01]"
        )}
        style={{
          background: isDragging
            ? "linear-gradient(135deg, #d1d1d1 0%, #e8e8e8 100%)"
            : "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
          boxShadow: isDragging
            ? "inset 6px 6px 12px #b5b5b5, inset -6px -6px 12px #ffffff"
            : "8px 8px 16px #bebebe, -8px -8px 16px #ffffff",
          borderColor: isDragging ? "#999" : "#ccc",
        }}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypesString}
          onChange={handleFileInput}
          className="hidden"
        />

        {!selectedFile ? (
          <>
            <div className="flex justify-center mb-4">
              <div
                className="p-3 rounded-xl"
                style={{
                  background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
                  boxShadow: "inset 4px 4px 8px #d1d1d1, inset -4px -4px 8px #ffffff",
                }}
              >
                <Upload className="h-7 w-7 sm:h-8 sm:w-8 text-gray-900" />
              </div>
            </div>
            <p className="text-base sm:text-lg font-semibold mb-2 text-gray-900" style={{  }}>
              Drop your file here
            </p>
            <p className="text-sm mb-1 text-gray-600" style={{  }}>
              or click to browse
            </p>
            <p className="text-xs mt-4 text-gray-500" style={{  }}>
              Supports {acceptedTypes.map((t) => t.toUpperCase()).join(", ")}
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div
              className="flex items-center gap-3 p-4 rounded-xl border-none"
              style={{
                background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
                boxShadow: "inset 4px 4px 8px #d1d1d1, inset -4px -4px 8px #ffffff",
              }}
            >
              <File className="h-6 w-6 text-gray-900" />
              <div className="flex-1 text-left min-w-0">
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
                className="h-8 w-8 rounded-lg border-none"
                style={{
                  background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
                  boxShadow: "4px 4px 8px #d1d1d1, -4px -4px 8px #ffffff",
                  color: "#2d3748",
                }}
                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation()
                  handleRemoveFile()
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-600" style={{  }}>
              Click to upload a different file
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
