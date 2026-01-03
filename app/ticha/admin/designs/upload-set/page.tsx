/**
 * Admin Design Set Upload Page
 * Upload multiple slides to create a design set for presentations
 * ADMIN ONLY - This is for training the AI model with design examples
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X, Loader2, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TichaHeader } from '@/components/ticha/header'
import { tichaSupabase } from '@/lib/ticha-supabase'

export default function DesignSetUploadPage() {
  const router = useRouter()
  
  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await tichaSupabase.auth.getUser()
    if (!user) {
      router.push('/ticha/signin')
      return
    }
    
    // Check if user is admin
    try {
      const response = await fetch('/api/ticha/admin/check')
      const data = await response.json()
      if (!data.isAdmin) {
        alert('Access denied. Admin privileges required.')
        router.push('/ticha/dashboard')
      }
    } catch (error) {
      console.error('Failed to check admin status:', error)
      router.push('/ticha/signin')
    }
  }
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [designSetName, setDesignSetName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [progress, setProgress] = useState(0)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    const imageFiles = selectedFiles.filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length === 0) {
      setMessage('Please select image files only')
      setStatus('error')
      return
    }

    setFiles(prev => [...prev, ...imageFiles])
    
    // Create previews
    imageFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviews(prev => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      setMessage('Please select at least one slide image')
      setStatus('error')
      return
    }

    if (!designSetName.trim()) {
      setMessage('Please enter a name for your design set')
      setStatus('error')
      return
    }

    setUploading(true)
    setStatus('idle')
    setMessage('')
    setProgress(0)

    try {
      // Get current user
      const { data: { user } } = await tichaSupabase.auth.getUser()
      if (!user) {
        throw new Error('Please sign in to upload designs')
      }

      // Upload each file and extract design
      const designSetId = `design-set-${Date.now()}`
      const uploadedDesigns: any[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setProgress(Math.round(((i + 1) / files.length) * 100))
        setMessage(`Processing slide ${i + 1} of ${files.length}...`)

        // Upload to storage
        const timestamp = Date.now()
        const fileName = `user-designs/${user.id}/${designSetId}/${timestamp}-${i}-${file.name}`
        
        const { data: uploadData, error: uploadError } = await tichaSupabase.storage
          .from('design-inspiration')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) throw uploadError

        // Get public URL
        const { data: { publicUrl } } = tichaSupabase.storage
          .from('design-inspiration')
          .getPublicUrl(fileName)

        // Extract design from image
        const extractResponse = await fetch('/api/ticha/designs/extract-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl: publicUrl,
            userId: user.id,
            designSetId: designSetId,
            designSetName: designSetName,
            slideIndex: i,
          }),
        })

        if (!extractResponse.ok) {
          const errorData = await extractResponse.json()
          throw new Error(`Failed to extract design from ${file.name}: ${errorData.error || 'Unknown error'}`)
        }

        const extractData = await extractResponse.json()
        uploadedDesigns.push(extractData)
      }

      setStatus('success')
      setMessage(`Successfully created design set "${designSetName}" with ${files.length} slide design${files.length > 1 ? 's' : ''}!`)
      setFiles([])
      setPreviews([])
      setDesignSetName('')
      setProgress(0)

      // Redirect to admin designs page after 2 seconds
      setTimeout(() => {
        router.push('/ticha/admin/designs')
      }, 2000)
    } catch (error: any) {
      console.error('Upload error:', error)
      setStatus('error')
      setMessage(error.message || 'Failed to upload designs. Please try again.')
      setProgress(0)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <TichaHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Create Your Design Set</CardTitle>
            <p className="text-gray-600 mt-2">
              Upload multiple slide images to create a complete design theme. Our AI will learn from all slides and apply their styles when generating your presentations.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Design Set Name */}
            <div>
              <Label htmlFor="design-set-name">Design Set Name *</Label>
              <Input
                id="design-set-name"
                value={designSetName}
                onChange={(e) => setDesignSetName(e.target.value)}
                placeholder="e.g., My Business Template, Academic Style, etc."
                className="mt-2"
                disabled={uploading}
              />
              <p className="text-sm text-gray-500 mt-1">
                Give your design set a memorable name so you can use it later
              </p>
            </div>

            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
              <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-700 font-medium">
                  Click to upload slide images
                </span>
                <span className="text-gray-500 block mt-2 text-sm">
                  PNG, JPG, or JPEG (Upload multiple slides for a complete design set)
                </span>
              </label>
              <input
                id="file-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
            </div>

            {/* Preview Grid */}
            {previews.length > 0 && (
              <div>
                <Label className="mb-2 block">Uploaded Slides ({previews.length})</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className="absolute top-1 left-1 z-10 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {index + 1}
                      </div>
                      <img
                        src={preview}
                        alt={`Slide ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 group-hover:border-blue-500 transition-colors"
                      />
                      <button
                        onClick={() => removeFile(index)}
                        disabled={uploading}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <p className="text-xs text-gray-500 mt-1 truncate">{files[index].name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {uploading && progress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Processing...</span>
                  <span className="text-gray-600">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Status Message */}
            {status !== 'idle' && (
              <div className={`p-4 rounded-lg flex items-center gap-3 ${
                status === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {status === 'success' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <p>{message}</p>
              </div>
            )}

            {/* Upload Button */}
            <div className="flex gap-4">
              <Button
                onClick={handleUpload}
                disabled={files.length === 0 || uploading || !designSetName.trim()}
                className="flex-1"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing {files.length} slides...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Create Design Set ({files.length} slides)
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/ticha/admin/designs')}
                disabled={uploading}
              >
                Cancel
              </Button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Upload 3-10 slide images that share a design theme</li>
                <li>Our AI will analyze colors, fonts, layouts, and styles from each slide</li>
                <li>When you generate presentations, the AI will use these design patterns</li>
                <li>Different slides in your presentation will use different designs from your set</li>
                <li>You can create multiple design sets for different presentation styles</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
