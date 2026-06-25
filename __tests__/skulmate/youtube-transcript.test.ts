import {
  parseYoutubeVideoId,
  YoutubeTranscriptError,
  extractYoutubeMetadataFromHtml,
  buildYoutubeMetadataStudyText,
} from '@/lib/skulmate/youtube-transcript'

describe('youtube-transcript', () => {
  describe('parseYoutubeVideoId', () => {
    it('parses watch URLs', () => {
      expect(
        parseYoutubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      ).toBe('dQw4w9WgXcQ')
    })

    it('parses youtu.be URLs', () => {
      expect(parseYoutubeVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe(
        'dQw4w9WgXcQ'
      )
    })

    it('parses shorts URLs', () => {
      expect(
        parseYoutubeVideoId('https://www.youtube.com/shorts/dQw4w9WgXcQ')
      ).toBe('dQw4w9WgXcQ')
    })

    it('returns null for invalid URLs', () => {
      expect(parseYoutubeVideoId('not-a-url')).toBeNull()
      expect(parseYoutubeVideoId('')).toBeNull()
    })
  })

  describe('YoutubeTranscriptError', () => {
    it('carries errorCode', () => {
      const err = new YoutubeTranscriptError('no captions', 'YOUTUBE_NO_CAPTIONS')
      expect(err.errorCode).toBe('YOUTUBE_NO_CAPTIONS')
      expect(err.message).toContain('no captions')
    })
  })

  describe('extractYoutubeMetadataFromHtml', () => {
    it('parses title and description from watch page HTML', () => {
      const html = `
        "title":"Photosynthesis Explained - YouTube",
        "shortDescription":"Plants convert sunlight into energy through photosynthesis. Chlorophyll absorbs light and powers glucose production in leaves."
      `
      const meta = extractYoutubeMetadataFromHtml(html)
      expect(meta.title).toContain('Photosynthesis')
      expect(meta.description.length).toBeGreaterThan(40)
      expect(buildYoutubeMetadataStudyText(meta).length).toBeGreaterThan(50)
    })
  })
})
