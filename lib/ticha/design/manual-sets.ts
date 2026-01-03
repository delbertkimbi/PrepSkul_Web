import { ManualDesignSet } from '../types'

export const MANUAL_DESIGN_SETS: Record<string, ManualDesignSet> = {
  'business_v1': {
    id: 'business_v1',
    name: 'Executive Pitch Deck',
    preset: 'business',
    topicKeywords: ['business', 'startup', 'company profile', 'investor', 'pitch', 'strategy', 'growth'],
    description: 'A bold, modern orange & navy corporate deck with strong typography and clean layouts for pitches and business overviews.',
    slides: [
      {
        slideNumber: 1,
        role: 'title',
        design: {
          background_color: '#FF8A00',
          text_color: '#FFFFFF',
          layout: 'title-only',
          icon: 'none',
          fontFamily: 'Montserrat',
          fontSize: 60,
          customColors: {
            primary: '#FF8A00',
            secondary: '#2D3542',
            accent: '#FFFFFF',
          },
        },
        imageQueryHint: 'abstract business success, modern city skyline, orange blue gradient'
      },
      {
        slideNumber: 2,
        role: 'agenda',
        design: {
          background_color: '#2D3542',
          text_color: '#FFFFFF',
          layout: 'title-and-bullets',
          icon: 'none',
          fontFamily: 'Montserrat',
          fontSize: 40,
          customColors: {
            primary: '#FF8A00',
            secondary: '#2D3542',
            accent: '#FFFFFF',
          },
        },
        imageQueryHint: 'minimal timeline, agenda, business meeting'
      },
      {
        slideNumber: 3,
        role: 'content',
        design: {
          background_color: '#FFFFFF',
          text_color: '#000000',
          layout: 'image-left',
          icon: 'none',
          fontFamily: 'Open Sans',
          fontSize: 22,
          customColors: {
            primary: '#FF8A00',
            secondary: '#2D3542',
            accent: '#FFFFFF',
          },
        },
        imageQueryHint: 'team collaboration, business people working together'
      },
      {
        slideNumber: 4,
        role: 'content',
        design: {
          background_color: '#2D3542',
          text_color: '#FFFFFF',
          layout: 'two-column',
          icon: 'none',
          fontFamily: 'Open Sans',
          fontSize: 22,
          customColors: {
            primary: '#FF8A00',
            secondary: '#2D3542',
            accent: '#FFFFFF',
          },
        },
        imageQueryHint: 'data charts, analytics, business metrics'
      },
      {
        slideNumber: 5,
        role: 'content',
        design: {
          background_color: '#FF8A00',
          text_color: '#FFFFFF',
          layout: 'image-left',
          icon: 'idea',
          fontFamily: 'Open Sans',
          fontSize: 22,
          customColors: {
            primary: '#FF8A00',
            secondary: '#2D3542',
            accent: '#FFFFFF',
          },
        },
        imageQueryHint: 'innovation, light bulb, creative business concept'
      },
      {
        slideNumber: 6,
        role: 'content',
        design: {
          background_color: '#FFFFFF',
          text_color: '#000000',
          layout: 'two-column',
          icon: 'none',
          fontFamily: 'Open Sans',
          fontSize: 22,
          customColors: {
            primary: '#FF8A00',
            secondary: '#2D3542',
            accent: '#FFFFFF',
          },
        },
        imageQueryHint: 'market analysis, charts, graphs'
      },
      {
        slideNumber: 7,
        role: 'content',
        design: {
          background_color: '#2D3542',
          text_color: '#FFFFFF',
          layout: 'image-left',
          icon: 'book',
          fontFamily: 'Open Sans',
          fontSize: 22,
          customColors: {
            primary: '#FF8A00',
            secondary: '#2D3542',
            accent: '#FFFFFF',
          },
        },
        imageQueryHint: 'case study, success story, professional team'
      },
      {
        slideNumber: 8,
        role: 'summary',
        design: {
          background_color: '#FF8A00',
          text_color: '#FFFFFF',
          layout: 'title-only',
          icon: 'check',
          fontFamily: 'Montserrat',
          fontSize: 48,
          customColors: {
            primary: '#FF8A00',
            secondary: '#2D3542',
            accent: '#FFFFFF',
          },
        },
        imageQueryHint: 'celebration, handshake, business deal closed'
      },
    ],
  },
  'academic_v1': {
    id: 'academic_v1',
    name: 'Research Presentation',
    preset: 'academic',
    topicKeywords: ['research', 'thesis', 'education', 'study', 'science', 'report', 'analysis'],
    description: 'A clean, academic template with structured layouts, serif typography, and calm blue tones for lectures and research.',
    slides: [
      {
        slideNumber: 1,
        role: 'title',
        design: {
          background_color: '#1a365d',
          text_color: '#FFFFFF',
          layout: 'title-only',
          icon: 'none',
          fontFamily: 'Georgia',
          fontSize: 54,
          customColors: {
            primary: '#1a365d',
            secondary: '#2d4a5c',
            accent: '#f7fafc',
          },
        },
        imageQueryHint: 'academic lecture hall, university campus, abstract science background'
      },
      {
        slideNumber: 2,
        role: 'agenda',
        design: {
          background_color: '#2d4a5c',
          text_color: '#FFFFFF',
          layout: 'title-and-bullets',
          icon: 'none',
          fontFamily: 'Merriweather',
          fontSize: 22,
          customColors: {
            primary: '#1a365d',
            secondary: '#2d4a5c',
            accent: '#f7fafc',
          },
        },
        imageQueryHint: 'table of contents, academic outline'
      },
      {
        slideNumber: 3,
        role: 'section',
        design: {
          background_color: '#f7fafc',
          text_color: '#1a202c',
          layout: 'title-only',
          icon: 'none',
          fontFamily: 'Georgia',
          fontSize: 42,
          customColors: {
            primary: '#1a365d',
            secondary: '#2d4a5c',
            accent: '#f7fafc',
          },
        },
        imageQueryHint: 'abstract academic pattern, subtle geometry'
      },
      {
        slideNumber: 4,
        role: 'content',
        design: {
          background_color: '#f7fafc',
          text_color: '#1a202c',
          layout: 'two-column',
          icon: 'none',
          fontFamily: 'Merriweather',
          fontSize: 18,
          customColors: {
            primary: '#1a365d',
            secondary: '#2d4a5c',
            accent: '#f7fafc',
          },
        },
        imageQueryHint: 'research data, charts, academic diagrams'
      },
      {
        slideNumber: 5,
        role: 'content',
        design: {
          background_color: '#1a365d',
          text_color: '#FFFFFF',
          layout: 'image-left',
          icon: 'idea',
          fontFamily: 'Merriweather',
          fontSize: 18,
          customColors: {
            primary: '#1a365d',
            secondary: '#2d4a5c',
            accent: '#f7fafc',
          },
        },
        imageQueryHint: 'methodology, research process, flow diagram'
      },
      {
        slideNumber: 6,
        role: 'content',
        design: {
          background_color: '#f7fafc',
          text_color: '#1a202c',
          layout: 'two-column',
          icon: 'none',
          fontFamily: 'Merriweather',
          fontSize: 18,
          customColors: {
            primary: '#1a365d',
            secondary: '#2d4a5c',
            accent: '#f7fafc',
          },
        },
        imageQueryHint: 'key findings, tables, statistics'
      },
      {
        slideNumber: 7,
        role: 'content',
        design: {
          background_color: '#2d4a5c',
          text_color: '#FFFFFF',
          layout: 'image-left',
          icon: 'idea',
          fontFamily: 'Merriweather',
          fontSize: 18,
          customColors: {
            primary: '#1a365d',
            secondary: '#2d4a5c',
            accent: '#f7fafc',
          },
        },
        imageQueryHint: 'discussion, implications, academic debate'
      },
      {
        slideNumber: 8,
        role: 'summary',
        design: {
          background_color: '#1a365d',
          text_color: '#FFFFFF',
          layout: 'title-only',
          icon: 'check',
          fontFamily: 'Georgia',
          fontSize: 46,
          customColors: {
            primary: '#1a365d',
            secondary: '#2d4a5c',
            accent: '#f7fafc',
          },
        },
        imageQueryHint: 'conclusion, thank you, q&a'
      }
    ],
  },
  'kids_v1': {
    id: 'kids_v1',
    name: 'Fun Classroom',
    preset: 'kids',
    topicKeywords: ['kids', 'school', 'education', 'learning', 'fun', 'children', 'classroom'],
    description: 'A playful, colorful template with large text, emojis, and dynamic layouts perfect for kids and youth presentations.',
    slides: [
      {
        slideNumber: 1,
        role: 'title',
        design: {
          background_color: '#FF6B9D',
          text_color: '#FFFFFF',
          layout: 'title-only',
          icon: 'none',
          fontFamily: 'Comic Sans MS',
          fontSize: 52,
          customColors: {
            primary: '#FF6B9D',
            secondary: '#4ECDC4',
            accent: '#FFE66D',
          },
        },
        imageQueryHint: 'happy kids, colorful classroom, fun learning'
      },
      {
        slideNumber: 2,
        role: 'agenda',
        design: {
          background_color: '#FFE66D',
          text_color: '#2d3748',
          layout: 'title-and-bullets',
          icon: 'none',
          fontFamily: 'Comic Sans MS',
          fontSize: 32,
          customColors: {
            primary: '#FF6B9D',
            secondary: '#4ECDC4',
            accent: '#FFE66D',
          },
        },
        imageQueryHint: 'colorful icons, lesson plan, kids schedule'
      },
      {
        slideNumber: 3,
        role: 'content',
        design: {
          background_color: '#4ECDC4',
          text_color: '#FFFFFF',
          layout: 'image-left',
          icon: 'idea',
          fontFamily: 'Nunito',
          fontSize: 24,
          customColors: {
            primary: '#FF6B9D',
            secondary: '#4ECDC4',
            accent: '#FFE66D',
          },
        },
        imageQueryHint: 'kids playing, creative activities, colorful toys'
      },
      {
        slideNumber: 4,
        role: 'content',
        design: {
          background_color: '#FF6B9D',
          text_color: '#FFFFFF',
          layout: 'two-column',
          icon: 'idea',
          fontFamily: 'Nunito',
          fontSize: 22,
          customColors: {
            primary: '#FF6B9D',
            secondary: '#4ECDC4',
            accent: '#FFE66D',
          },
        },
        imageQueryHint: 'colorful diagrams, kids learning, school project'
      },
      {
        slideNumber: 5,
        role: 'image',
        design: {
          background_color: '#4ECDC4',
          text_color: '#FFFFFF',
          layout: 'image-left',
          icon: 'none',
          fontFamily: 'Nunito',
          fontSize: 24,
          customColors: {
            primary: '#FF6B9D',
            secondary: '#4ECDC4',
            accent: '#FFE66D',
          },
        },
        imageQueryHint: 'fun classroom photo, children presenting'
      },
      {
        slideNumber: 6,
        role: 'content',
        design: {
          background_color: '#FFE66D',
          text_color: '#2d3748',
          layout: 'two-column',
          icon: 'none',
          fontFamily: 'Nunito',
          fontSize: 22,
          customColors: {
            primary: '#FF6B9D',
            secondary: '#4ECDC4',
            accent: '#FFE66D',
          },
        },
        imageQueryHint: 'student activities, group work, learning games'
      },
      {
        slideNumber: 7,
        role: 'content',
        design: {
          background_color: '#FF6B9D',
          text_color: '#FFFFFF',
          layout: 'image-left',
          icon: 'idea',
          fontFamily: 'Nunito',
          fontSize: 24,
          customColors: {
            primary: '#FF6B9D',
            secondary: '#4ECDC4',
            accent: '#FFE66D',
          },
        },
        imageQueryHint: 'creative project, art, exploration'
      },
      {
        slideNumber: 8,
        role: 'summary',
        design: {
          background_color: '#4ECDC4',
          text_color: '#FFFFFF',
          layout: 'title-only',
          icon: 'star',
          fontFamily: 'Comic Sans MS',
          fontSize: 44,
          customColors: {
            primary: '#FF6B9D',
            secondary: '#4ECDC4',
            accent: '#FFE66D',
          },
        },
        imageQueryHint: 'kids celebrating, confetti, success'
      }
    ],
  },
}

export function getManualDesignSet(id: string): ManualDesignSet | null {
  return MANUAL_DESIGN_SETS[id] || null
}


