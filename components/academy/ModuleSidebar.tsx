"use client"

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getModuleWatchedSections, getModuleCompletionPercentFromWatched, getSectionProgress, getModuleQuizStatus } from "@/lib/academy-storage";
import type { AcademySection } from "@/lib/academy-data";
import { CircleProgress } from "@/components/ui/circle-progress";

interface ModuleSidebarProps {
  levelId: string;
  moduleId: string;
  sections: AcademySection[];
}

export default function ModuleSidebar({ levelId, moduleId, sections }: ModuleSidebarProps) {
  const [open, setOpen] = useState(false);
  const totalVideos = useMemo(() => sections.filter(s => s.youtubeUrl).length, [sections]);
  const [watched, setWatched] = useState<string[]>([]);
  const [percent, setPercent] = useState(0);
  const [sectionProgressMap, setSectionProgressMap] = useState<Record<string, number>>({});
  const [quizStatus, setQuizStatus] = useState(false);

  const loadProgress = async () => {
    const watchedSections = await getModuleWatchedSections(levelId as any, moduleId);
    const completionPercent = await getModuleCompletionPercentFromWatched(levelId as any, moduleId, totalVideos);
    const quizPassed = await getModuleQuizStatus(levelId as any, moduleId);
    
    setWatched(watchedSections);
    setPercent(completionPercent);
    setQuizStatus(quizPassed);

    // Load section progress
    const progressMap: Record<string, number> = {};
    for (const section of sections) {
      progressMap[section.id] = await getSectionProgress(levelId as any, moduleId, section.id);
    }
    setSectionProgressMap(progressMap);
  };

  useEffect(() => {
    loadProgress();
    const handler = () => loadProgress();
    window.addEventListener('prepskul:progress-updated', handler as EventListener);
    return () => window.removeEventListener('prepskul:progress-updated', handler as EventListener);
  }, [levelId, moduleId, sections, totalVideos]);

  return (
    <aside className="w-full md:w-64 lg:w-72">
      {/* Mobile hamburger */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setOpen(v => !v)}
          className="p-2 rounded-full border border-primary/20 bg-white text-primary shadow-sm"
          aria-expanded={open}
          aria-label="Toggle navigation menu"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        {open && (
          <div className="fixed top-16 right-4 w-64 bg-white border border-primary/10 rounded-md shadow-lg">
            {/* Return to Modules button */}
            <Link href={`/academy/${levelId}`} className="block px-4 py-3 text-sm font-medium text-primary hover:bg-primary/5 border-b">
              ← Return to Modules
            </Link>
            {sections.map(s => {
              const sectionProgress = sectionProgressMap[s.id] || 0;
              return (
                <Link key={s.id} href={`/academy/${levelId}/${moduleId}/sections/${s.id}`} className="block px-3 py-2 hover:bg-primary/5 border-b last:border-b-0">
                  <div className="flex items-center gap-2">
                    <CircleProgress progress={sectionProgress} size={20} />
                    <div className="text-sm">{s.title}</div>
                    <div className="ml-auto text-xs text-muted-foreground">
                      {sectionProgress === 100 ? 'Completed' : `${sectionProgress}%`}
                    </div>
                  </div>
                </Link>
              )
            })}
            {/* Quiz Link */}
            <Link href={`/academy/${levelId}/${moduleId}`} className="block px-3 py-2 hover:bg-primary/5 border-b last:border-b-0">
              <div className="flex items-center gap-2">
                <CircleProgress progress={quizStatus ? 100 : 0} size={20} />
                <div className="text-sm">Module Quiz</div>
                <div className="ml-auto text-xs text-muted-foreground">
                  {quizStatus ? 'Passed' : 'Not completed'}
                </div>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:block sticky top-6">
        <div className="bg-white border border-primary/10 rounded-md p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">Sections</h4>
            <div className="text-sm font-medium text-muted-foreground">{percent}%</div>
          </div>
          <nav className="space-y-2">
            {/* Return to Modules link */}
            <Link href={`/academy/${levelId}`} className="flex items-center gap-2 px-2 py-2 rounded text-primary hover:bg-primary/5 border-b mb-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" /></svg>
              <span className="text-sm font-medium">Return to Modules</span>
            </Link>
            {sections.map(s => {
              const sectionProgress = sectionProgressMap[s.id] || 0;
              return (
                <Link key={s.id} href={`/academy/${levelId}/${moduleId}/sections/${s.id}`} className="flex items-center gap-3 px-2 py-2 rounded hover:bg-primary/5">
                  <CircleProgress progress={sectionProgress} size={20} />
                  <div className="text-sm">{s.title}</div>
                  <div className="ml-auto text-xs text-muted-foreground">
                    {sectionProgress === 100 ? 'Completed' : `${sectionProgress}%`}
                  </div>
                </Link>
              )
            })}
            {/* Quiz Link */}
            <Link href={`/academy/${levelId}/${moduleId}`} className="flex items-center gap-3 px-2 py-2 rounded hover:bg-primary/5">
              <CircleProgress progress={quizStatus ? 100 : 0} size={20} />
              <div className="text-sm">Module Quiz</div>
              <div className="ml-auto text-xs text-muted-foreground">
                {quizStatus ? 'Passed' : 'Not completed'}
              </div>
            </Link>
          </nav>
        </div>
      </div>
    </aside>
  )
}
