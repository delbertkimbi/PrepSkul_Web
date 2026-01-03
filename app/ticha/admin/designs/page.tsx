'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { tichaSupabase } from '@/lib/ticha-supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload, Search, Trash2, RefreshCw, Image as ImageIcon, Star, TrendingUp, Zap } from 'lucide-react'
import Link from 'next/link'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Design {
  id: string
  image_url: string
  keywords: string[]
  category: string
  quality_score: number
  usage_count: number
  extracted_design_spec: any
  created_at: string
}

export default function DesignsPage() {
  const router = useRouter()
  const [designs, setDesigns] = useState<Design[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState('quality_score')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [activeDesignSetId, setActiveDesignSetId] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
    loadDesigns()
    loadActiveDesignSet()
  }, [category, search, sortBy, page])

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

  const loadDesigns = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sortBy,
        sortOrder: 'desc',
      })
      if (category !== 'all') params.append('category', category)
      if (search) params.append('search', search)

      const response = await fetch(`/api/ticha/admin/designs?${params}`)
      const data = await response.json()

      if (data.success) {
        setDesigns(data.designs)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Failed to load designs:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadActiveDesignSet = async () => {
    try {
      const response = await fetch('/api/ticha/designs/user-sets')
      if (!response.ok) return
      const data = await response.json()
      if (data && Array.isArray(data.sets) && data.sets.length > 0) {
        setActiveDesignSetId(data.sets[0].id)
      }
    } catch (error) {
      console.warn('Failed to load active design set info', error)
    }
  }

  const handleReExtract = async (designId: string, imageUrl: string, keywords: string[]) => {
    if (!confirm('Re-extract design specifications from this image? This may take 30-60 seconds.')) return

    try {
      const response = await fetch('/api/ticha/admin/designs/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ designId, imageUrl, keywords }),
      })

      const data = await response.json()

      if (data.success) {
        alert('Design extraction completed! Check the terminal for extracted colors and fonts.')
        loadDesigns() // Reload to show updated extraction status
      } else {
        alert(`Extraction failed: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to re-extract design:', error)
      alert('Failed to re-extract design. Check console for details.')
    }
  }

  const handleDelete = async (designId: string) => {
    if (!confirm('Are you sure you want to delete this design?')) return

    try {
      const response = await fetch(`/api/ticha/admin/designs?id=${designId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        loadDesigns()
      }
    } catch (error) {
      console.error('Failed to delete design:', error)
      alert('Failed to delete design')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Design Inspo Training</h1>
            <p className="text-gray-600 mt-2">Manage and upload design inspiration images</p>
            {activeDesignSetId && (
              <p className="text-xs text-gray-500 mt-1">
                Active training set in use for generation: <span className="font-semibold">{activeDesignSetId}</span>
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Link href="/ticha/admin/designs/upload">
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Upload Single Design
              </Button>
            </Link>
            <Link href="/ticha/admin/designs/upload-set">
              <Button>
                <ImageIcon className="mr-2 h-4 w-4" />
                Upload Design Set
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search keywords..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="pl-10"
                />
              </div>
              <Select value={category} onValueChange={(value) => {
                setCategory(value)
                setPage(1)
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="minimalist">Minimalist</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value) => {
                setSortBy(value)
                setPage(1)
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quality_score">Quality Score</SelectItem>
                  <SelectItem value="usage_count">Usage Count</SelectItem>
                  <SelectItem value="created_at">Date Added</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={loadDesigns}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Designs Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading designs...</p>
          </div>
        ) : designs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No designs found</h3>
              <p className="text-gray-600 mb-4">Upload your first design inspiration to start training</p>
              <Link href="/ticha/admin/designs/upload">
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Design
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {designs.map((design) => (
                <Card key={design.id} className="overflow-hidden">
                  <div className="relative aspect-video bg-gray-100">
                    {design.image_url ? (
                      <img
                        src={design.image_url}
                        alt="Design"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-2">
                      {design.quality_score && (
                        <Badge variant="secondary" className="bg-white/90">
                          <Star className="h-3 w-3 mr-1" />
                          {design.quality_score.toFixed(0)}
                        </Badge>
                      )}
                      {!design.extracted_design_spec && (
                        <Badge variant="destructive" className="bg-red-500/90 text-white">
                          No Specs
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline">{design.category || 'Uncategorized'}</Badge>
                      {design.usage_count > 0 && (
                        <div className="flex items-center text-sm text-gray-600">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {design.usage_count}
                        </div>
                      )}
                    </div>
                    {design.keywords && design.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {design.keywords.slice(0, 3).map((keyword, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                        {design.keywords.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{design.keywords.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2 mt-4">
                      {!design.extracted_design_spec && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleReExtract(design.id, design.image_url, design.keywords || [])}
                          className="flex-1"
                        >
                          <Zap className="h-4 w-4 mr-1" />
                          Extract Specs
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(design.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

