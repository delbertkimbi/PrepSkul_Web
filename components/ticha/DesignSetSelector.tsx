/**
 * Design Set Selector Component
 * Allows users to select their uploaded design sets
 */

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Image as ImageIcon, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DesignSet {
  id: string
  name: string
  count: number
  designs: Array<{
    id: string
    imageUrl: string
    extractedDesign: any
  }>
}

interface DesignSetSelectorProps {
  selectedSetId?: string
  onSelect: (setId: string | null) => void
  className?: string
}

export function DesignSetSelector({ selectedSetId, onSelect, className }: DesignSetSelectorProps) {
  const router = useRouter()
  const [sets, setSets] = useState<DesignSet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDesignSets()
  }, [])

  const loadDesignSets = async () => {
    try {
      const response = await fetch('/api/ticha/designs/user-sets')
      if (response.ok) {
        const data = await response.json()
        setSets(data.sets || [])
      }
    } catch (error) {
      console.error('Failed to load design sets:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (sets.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          No design sets yet. Upload slide images to create your own design themes!
        </p>
        <Button
          variant="outline"
          onClick={() => router.push('/ticha/design-upload')}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Design Set
        </Button>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Your Design Sets</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/ticha/design-upload')}
        >
          <Plus className="h-4 w-4 mr-1" />
          New Set
        </Button>
      </div>
      
      <div className="space-y-2">
        <button
          onClick={() => onSelect(null)}
          className={`w-full p-3 rounded-lg text-left transition-all border-2 ${
            selectedSetId === null || !selectedSetId
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="font-medium text-sm">Use Default Designs</div>
          <div className="text-xs text-gray-500 mt-1">AI will match designs based on your prompt</div>
        </button>

        {sets.map((set) => (
          <button
            key={set.id}
            onClick={() => onSelect(set.id)}
            className={`w-full p-3 rounded-lg text-left transition-all border-2 ${
              selectedSetId === set.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-sm">{set.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {set.count} slide design{set.count !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="flex gap-1 ml-2">
                {set.designs.slice(0, 3).map((design, idx) => (
                  <div
                    key={design.id}
                    className="w-8 h-8 rounded border border-gray-200 overflow-hidden bg-gray-100"
                    style={{
                      backgroundImage: design.imageUrl ? `url(${design.imageUrl})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                ))}
                {set.designs.length > 3 && (
                  <div className="w-8 h-8 rounded border border-gray-200 bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                    +{set.designs.length - 3}
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

