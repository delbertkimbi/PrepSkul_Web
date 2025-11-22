"use client"

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { markSectionVideoWatched, updateSectionProgress } from "@/lib/academy-storage";

interface SectionContentProps {
  section: any;
  moduleNumber?: number;
  levelId?: string;
  moduleId?: string; // e.g., 'n1'
}

const cardVariants = {
  offscreen: { y: 40, opacity: 0, scale: 0.98 },
  onscreen: { y: 0, opacity: 1, scale: 1, transition: { type: "spring" as const, duration: 0.7, bounce: 0.16 } },
};

function toYoutubeEmbed(url?: string | null) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  const id = match ? match[1] : null;
  if (!id) return null;
  // Use YouTube nocookie embed to reduce third-party tracking calls where possible
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&enablejsapi=1`;
}

export function SectionContent({ section, levelId, moduleId }: SectionContentProps) {
  const embedUrl = toYoutubeEmbed(section?.youtubeUrl || section?.videoUrl || section?.video || null);
  const iframeId = `yt-${moduleId ?? 'mod'}-${section?.id}`;
  const playerRef = useRef<any | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [hasTrackedScroll, setHasTrackedScroll] = useState(false);

  // Track scroll progress for sections without videos
  useEffect(() => {
    if (!levelId || !moduleId || !section?.id || embedUrl || hasTrackedScroll) return;

    const handleScroll = () => {
      if (!contentRef.current) return;
      
      const element = contentRef.current;
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how much of the content is visible
      const visibleTop = Math.max(0, -rect.top);
      const visibleBottom = Math.min(rect.height, windowHeight - rect.top);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);
      const progress = Math.min(100, Math.round((visibleHeight / rect.height) * 100));
      
      // Update progress when user scrolls through content
      if (progress > 0) {
        updateSectionProgress(levelId as any, moduleId, section.id, progress);
      }
      
      // Mark as complete when user has scrolled through most of the content
      if (progress >= 80 && !hasTrackedScroll) {
        setHasTrackedScroll(true);
        updateSectionProgress(levelId as any, moduleId, section.id, 100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [levelId, moduleId, section?.id, embedUrl, hasTrackedScroll]);

  useEffect(() => {
    if (!embedUrl) return;
    // Ensure YT API is loaded
    const win = window as any;
    let mounted = true;

    function whenReady(cb: () => void) {
      if (win.YT && win.YT.Player) return cb();
      const existing = document.getElementById('yt-iframe-api');
      if (existing) {
        const check = setInterval(() => {
          if (win.YT && win.YT.Player) {
            clearInterval(check);
            cb();
          }
        }, 200);
        return;
      }
      const tag = document.createElement('script');
      tag.id = 'yt-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
      const check = setInterval(() => {
        if (win.YT && win.YT.Player) {
          clearInterval(check);
          cb();
        }
      }, 200);
    }

    whenReady(() => {
      if (!mounted) return;
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        playerRef.current = new (win as any).YT.Player(iframeId, {
          events: {
            onStateChange: async (e: any) => {
              // 0 = ended
              if (e.data === 0) {
                try {
                    if (levelId && moduleId && section?.id) {
                      await markSectionVideoWatched(levelId as any, moduleId as any, section.id);
                      try {
                        window.dispatchEvent(new CustomEvent('prepskul:progress-updated', { detail: { levelId, moduleId, sectionId: section.id } }));
                      } catch (e) {}
                    }
                } catch (err) {
                  // ignore
                }
              }
            },
          },
        });
      } catch (err) {
        // ignore
      }
    });

    return () => {
      mounted = false;
      try {
        if (playerRef.current && playerRef.current.destroy) playerRef.current.destroy();
      } catch (e) {}
    };
  }, [embedUrl, iframeId, levelId, moduleId, section]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="max-w-4xl mx-auto py-6 px-4">
        <motion.div 
          ref={contentRef}
          variants={cardVariants} 
          initial="offscreen" 
          whileInView="onscreen" 
          viewport={{ once: true, amount: 0.2 }} 
          className="mb-6"
        >
        <h2 className="text-2xl font-bold text-primary mb-3">{section?.title}</h2>
        {/* Use default foreground color inside prose to avoid very-light muted text blending into background */}
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: section?.html ?? "" }} />
      </motion.div>

      {embedUrl && (
        <motion.div variants={cardVariants} initial="offscreen" whileInView="onscreen" viewport={{ once: true }} className="mt-8">
          <div className="rounded-xl overflow-hidden p-1 transform-gpu" style={{ boxShadow: '0 8px 30px rgba(2,6,23,0.12)', border: '3px solid rgba(10,28,70,0.9)', background: 'linear-gradient(180deg, rgba(11,59,255,0.04), rgba(0,0,0,0))' }}>
            <div className="relative pb-[56.25%] h-0 bg-black/5 rounded-lg overflow-hidden">
              <iframe id={iframeId} src={embedUrl} className="absolute top-0 left-0 w-full h-full border-0" title={section?.caption ?? section?.title ?? 'Video'} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
            {section?.caption && <div className="mt-3 px-4 py-2 bg-white/60 backdrop-blur-sm border-t border-[#0b2b5f]/10 text-sm text-muted-foreground">{section.caption}</div>}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

