/**
 * Unit tests for PowerPoint Generation
 */

import { createPPT, type SlideData } from '@/lib/ticha/ppt/createPPT'

describe('createPPT', () => {
  it('should create a PowerPoint presentation', async () => {
    const slides: SlideData[] = [
      {
        slide_title: 'Introduction',
        bullets: ['Point 1', 'Point 2'],
        design: {
          background_color: 'light-blue',
          text_color: 'black',
          layout: 'title-and-bullets',
          icon: 'none',
        },
      },
    ]

    const options = {
      title: 'Test Presentation',
      author: 'Test Author',
      company: 'Test Company',
      slides,
    }

    const buffer = await createPPT(options)

    expect(buffer).toBeInstanceOf(Buffer)
    expect(buffer.length).toBeGreaterThan(0)
  })

  it('should create presentation with default metadata', async () => {
    const slides: SlideData[] = [
      {
        slide_title: 'Title Slide',
        bullets: [],
        design: {
          background_color: 'white',
          text_color: 'black',
          layout: 'title-only',
          icon: 'none',
        },
      },
    ]

    const buffer = await createPPT({ slides })

    expect(buffer).toBeInstanceOf(Buffer)
    expect(buffer.length).toBeGreaterThan(0)
  })

  it('should handle multiple slides', async () => {
    const slides: SlideData[] = [
      {
        slide_title: 'Slide 1',
        bullets: ['Bullet 1'],
        design: {
          background_color: 'light-blue',
          text_color: 'black',
          layout: 'title-and-bullets',
          icon: 'none',
        },
      },
      {
        slide_title: 'Slide 2',
        bullets: ['Bullet 2'],
        design: {
          background_color: 'dark-blue',
          text_color: 'white',
          layout: 'title-and-bullets',
          icon: 'book',
        },
      },
      {
        slide_title: 'Slide 3',
        bullets: [],
        design: {
          background_color: 'white',
          text_color: 'black',
          layout: 'title-only',
          icon: 'none',
        },
      },
    ]

    const buffer = await createPPT({ slides })

    expect(buffer).toBeInstanceOf(Buffer)
    expect(buffer.length).toBeGreaterThan(0)
  })

  it('should handle different layouts', async () => {
    const layouts: Array<SlideData['design']['layout']> = [
      'title-only',
      'title-and-bullets',
      'two-column',
      'image-left',
      'image-right',
    ]

    for (const layout of layouts) {
      const slides: SlideData[] = [
        {
          slide_title: `Test ${layout}`,
          bullets: layout === 'title-only' ? [] : ['Bullet 1', 'Bullet 2'],
          design: {
            background_color: 'light-blue',
            text_color: 'black',
            layout,
            icon: 'none',
          },
        },
      ]

      const buffer = await createPPT({ slides })

      expect(buffer).toBeInstanceOf(Buffer)
      expect(buffer.length).toBeGreaterThan(0)
    }
  })

  it('should handle different color themes', async () => {
    const themes: Array<SlideData['design']['background_color']> = [
      'light-blue',
      'dark-blue',
      'white',
      'gray',
      'green',
    ]

    for (const theme of themes) {
      const slides: SlideData[] = [
        {
          slide_title: `Test ${theme}`,
          bullets: ['Test bullet'],
          design: {
            background_color: theme,
            text_color: theme === 'dark-blue' ? 'white' : 'black',
            layout: 'title-and-bullets',
            icon: 'none',
          },
        },
      ]

      const buffer = await createPPT({ slides })

      expect(buffer).toBeInstanceOf(Buffer)
      expect(buffer.length).toBeGreaterThan(0)
    }
  })

  it('should handle different icons', async () => {
    const icons: Array<SlideData['design']['icon']> = [
      'none',
      'book',
      'idea',
      'warning',
      'check',
    ]

    for (const icon of icons) {
      const slides: SlideData[] = [
        {
          slide_title: `Test ${icon}`,
          bullets: ['Test bullet'],
          design: {
            background_color: 'light-blue',
            text_color: 'black',
            layout: 'title-and-bullets',
            icon,
          },
        },
      ]

      const buffer = await createPPT({ slides })

      expect(buffer).toBeInstanceOf(Buffer)
      expect(buffer.length).toBeGreaterThan(0)
    }
  })

  it('should handle two-column layout with multiple bullets', async () => {
    const slides: SlideData[] = [
      {
        slide_title: 'Two Column Slide',
        bullets: ['Left 1', 'Left 2', 'Right 1', 'Right 2'],
        design: {
          background_color: 'white',
          text_color: 'black',
          layout: 'two-column',
          icon: 'none',
        },
      },
    ]

    const buffer = await createPPT({ slides })

    expect(buffer).toBeInstanceOf(Buffer)
    expect(buffer.length).toBeGreaterThan(0)
  })

  it('should handle empty bullets array', async () => {
    const slides: SlideData[] = [
      {
        slide_title: 'Title Only',
        bullets: [],
        design: {
          background_color: 'light-blue',
          text_color: 'black',
          layout: 'title-only',
          icon: 'none',
        },
      },
    ]

    const buffer = await createPPT({ slides })

    expect(buffer).toBeInstanceOf(Buffer)
    expect(buffer.length).toBeGreaterThan(0)
  })

  it('should handle long slide titles', async () => {
    const slides: SlideData[] = [
      {
        slide_title: 'A'.repeat(100),
        bullets: ['Bullet'],
        design: {
          background_color: 'light-blue',
          text_color: 'black',
          layout: 'title-and-bullets',
          icon: 'none',
        },
      },
    ]

    const buffer = await createPPT({ slides })

    expect(buffer).toBeInstanceOf(Buffer)
    expect(buffer.length).toBeGreaterThan(0)
  })

  it('should handle many bullets', async () => {
    const slides: SlideData[] = [
      {
        slide_title: 'Many Bullets',
        bullets: Array.from({ length: 20 }, (_, i) => `Bullet ${i + 1}`),
        design: {
          background_color: 'light-blue',
          text_color: 'black',
          layout: 'title-and-bullets',
          icon: 'none',
        },
      },
    ]

    const buffer = await createPPT({ slides })

    expect(buffer).toBeInstanceOf(Buffer)
    expect(buffer.length).toBeGreaterThan(0)
  })
})

