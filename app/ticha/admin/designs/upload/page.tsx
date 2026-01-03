'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { tichaSupabase } from '@/lib/ticha-supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Upload, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function UploadDesignPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [keywords, setKeywords] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'extracting' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      alert('Please select an image file')
      return
    }

    setLoading(true)
    setStatus('uploading')
    setMessage('Uploading image...')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('keywords', keywords)
      if (category) formData.append('category', category)
      if (description) formData.append('description', description)

      const response = await fetch('/api/ticha/admin/designs/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      if (data.success) {
        setStatus('success')
        setMessage('Design uploaded and extracted successfully!')
        
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/ticha/admin/designs')
        }, 2000)
      }
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()}>
            ← Back to Design Inspo Training
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload Design Inspiration for Training</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div>
                <Label>Design Image</Label>
                {!preview ? (
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-700">
                        Click to upload
                      </span>
                      {' '}or drag and drop
                    </Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      PNG, JPG, WEBP up to 10MB
                    </p>
                  </div>
                ) : (
                  <div className="mt-2 relative">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Keywords */}
              <div>
                <Label htmlFor="keywords">
                  Keywords <span className="text-gray-500">(comma-separated)</span>
                </Label>
                <Input
                  id="keywords"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e.g., modern, corporate, blue, professional"
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Add keywords that describe this design style. These will be used to match designs to user prompts.
                </p>
              </div>

              {/* Category */}
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corporate">Corporate</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="minimalist">Minimalist</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Description (Optional) */}
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add any additional notes about this design..."
                  className="mt-2"
                  rows={3}
                />
              </div>

              {/* Status Message */}
              {message && (
                <div
                  className={`p-4 rounded-lg flex items-center gap-2 ${
                    status === 'success'
                      ? 'bg-green-50 text-green-800'
                      : status === 'error'
                      ? 'bg-red-50 text-red-800'
                      : 'bg-blue-50 text-blue-800'
                  }`}
                >
                  {status === 'success' && <CheckCircle className="h-5 w-5" />}
                  {status === 'error' && <AlertCircle className="h-5 w-5" />}
                  {status === 'uploading' && <Loader2 className="h-5 w-5 animate-spin" />}
                  <span>{message}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={!file || loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {status === 'uploading' ? 'Uploading...' : 'Processing...'}
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload & Extract Design
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">How it works:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>Upload a high-quality slide design image</li>
              <li>Add relevant keywords that describe the design style</li>
              <li>AI will automatically extract design patterns (colors, fonts, layouts)</li>
              <li>The design will be matched to user prompts based on keywords</li>
              <li>Users will get presentations with designs similar to your uploaded examples</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

