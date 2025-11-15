"use client"

import { useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { getModule, getLevelById, type AcademyLevelId, type AcademyModule } from "@/lib/academy-data"
import { SectionContent } from "@/components/academy/SectionContent"
import ModuleSidebar from "@/components/academy/ModuleSidebar"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export default function SectionPage() {
  const params = useParams<{ level: AcademyLevelId; moduleId: string; sectionId: string }>()
  const router = useRouter()
  
  // Extract module number and create normalized ID (e.g., "module-1" -> "1" -> "n1")
  const rawModuleNumber = params.moduleId.match(/\d+/)?.[0] ?? '1'
  const normalizedModuleId = `${params.level[0]}${rawModuleNumber}`
  const displayModuleNumber = parseInt(rawModuleNumber)
  
  console.log('Debug Info:', {
    params,
    rawModuleNumber,
    normalizedModuleId,
    displayModuleNumber
  });

  const level = getLevelById(params.level);
  if (level) {
    console.log('Available modules:', level.modules.map(m => ({ id: m.id, title: m.title })));
  }
  
  const res = getModule(params.level, normalizedModuleId)
  if (!res) {
    console.error(`Module not found. Level: ${params.level}, ModuleId: ${normalizedModuleId}`)
    return <div className="text-sm text-red-600">Module not found.</div>
  }
  const { module } = res

  const sections = module.sections ?? []
  // Normalize section ID by replacing all dots with hyphens
  const normalizedSectionId = params.sectionId?.replace(/\./g, '-')
  const section = sections.find(s => s.id.replace(/\./g, '-') === normalizedSectionId)
  const sectionIndex = useMemo(() => sections.findIndex(s => s.id.replace(/\./g, '-') === normalizedSectionId), [sections, normalizedSectionId])
  
  if (!section) {
    console.error(`Section not found. Looking for: ${normalizedSectionId}`)
    console.error('Available sections:', sections.map(s => s.id))
  }

  if (!section) return <div className="text-sm text-red-600">Section not found.</div>

  const prev = sectionIndex > 0 ? sections[sectionIndex - 1] : undefined
  const next = sectionIndex < sections.length - 1 ? sections[sectionIndex + 1] : undefined

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">{module.title}</h1>
        <p className="text-lg text-muted-foreground">{section.title}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="col-span-1">
          <ModuleSidebar levelId={params.level} moduleId={module.id} sections={sections} />
        </div>
        <div className="col-span-1 md:col-span-3">
          <SectionContent 
            section={section} 
            moduleNumber={displayModuleNumber}
            levelId={params.level}
            moduleId={module.id}
          />

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-between mt-8"
          >
            <Button 
              variant="outline" 
              disabled={!prev} 
              onClick={() => prev && router.push(`/academy/${params.level}/${params.moduleId}/sections/${prev.id}`)}
            >
              Previous
            </Button>
            {next ? (
              <Button 
                onClick={() => router.push(`/academy/${params.level}/${params.moduleId}/sections/${next.id}`)}
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={() => router.push(`/academy/${params.level}/${params.moduleId}`)}
              >
                Go to Quiz
              </Button>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}


